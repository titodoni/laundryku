# BLUEPRINT.md — Laundryku System Architecture
**Version:** 2.0 (Final)  
**Updated:** 20 May 2026  
**Status:** All grey areas closed. Ready for build.

---

## 1. SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────────────────┐
│                         INTERNET                                  │
└────────┬──────────────────┬───────────────┬──────────────────────┘
         │                  │               │
   [Browser]           [Midtrans]       [Google]
   Owner/Staff/          Webhook          OAuth
   Customer               POST             Token
         │                  │               │
         ▼                  ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               Next.js 14 App Router                         │ │
│  │  Middleware (edge, no DB calls) ──→ Auth check + slug inject │ │
│  │  RSC Pages / Route Handlers / Client Components              │ │
│  │  Better Auth / Prisma ORM / Zod / finance.ts                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  Vercel Blob (logo, QRIS) / Vercel Cron / Vercel Analytics      │
└───────────────────────────┬──────────────────────────────────────┘
                            │ pgBouncer pooler
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      NEON POSTGRESQL                              │
│   main (production)       dev (local + PR previews)              │
└──────────────────────────────────────────────────────────────────┘

External: Midtrans Snap / Resend Email / Google OAuth / Sentry / Better Stack
```

---

## 2. INFRASTRUCTURE

| Component | Choice | Notes |
|-----------|--------|-------|
| Hosting | Vercel Hobby → Pro at 100+ tenants | 10s → 60s timeout |
| Runtime | Node.js serverless | One function per route handler |
| Region | iad1 (US East) or sin1 (Singapore) | AI OWNS: choose based on latency test |
| Database | Neon PostgreSQL | Pooled URL (DATABASE_URL) for queries. Direct URL (DIRECT_URL) for migrations only. |
| File storage | Vercel Blob | Logo + QRIS. Max 2MB each. Public CDN. Delete old blob before uploading new. |
| Email | Resend | Free: 3k/mo. Reminder dedup via reminder7DaySentAt + reminder1DaySentAt. |
| Error tracking | Sentry (free tier) | 5k errors/mo. Add in Phase 6. |
| Uptime | Better Stack (free tier) | Monitor `/api/health` every 3 min. Add in Phase 6. |

### Vercel Config — `vercel.json`
```json
{
  "crons": [
    { "path": "/api/cron/check-subscriptions", "schedule": "0 18 * * *" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

`0 18 * * *` = 18:00 UTC = 01:00 WIB (UTC+7).

---

## 3. APPLICATION LAYER

### 3.1 Rendering Strategy

| Route | Strategy | Reason |
|-------|----------|--------|
| `/` | SSG (static) | No dynamic data |
| `/{slug}` | SSR | Store data per slug |
| `/{slug}/login` | SSR | Store name display |
| `/{slug}/dashboard/*` | SSR + Client Islands | Auth-gated |
| `/{slug}/pos` | Client Component | High interactivity |
| `/{slug}/orders/*/track` | SSR | Public, cacheable |
| `/api/*` | Serverless | Backend logic |

### 3.2 Healthcheck

**File:** `src/app/api/health/route.ts`
```typescript
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: "connected", ts: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: false, db: "error" }, { status: 503 })
  }
}
```

### 3.3 Middleware

**File:** `src/middleware.ts` — runs on Vercel Edge, NO DB calls.

```
PUBLIC_ROUTES = ["/", "/register", "/onboarding", "/api/auth", "/api/health", "/api/webhooks"]
Tracking route: /{slug}/orders/{orderCode}/track — public
All other /{slug}/* routes: session check → redirect to /{slug}/login if no session
Inject headers: x-laundryku-internal-slug, x-laundryku-internal-user-id, x-laundryku-internal-user-role
NOTE: API handlers must NEVER trust these headers for auth decisions. Always re-validate session via Better Auth in the route handler.
```

### 3.4 API Route Map

```
/api/
  health/                         GET  → DB ping
  auth/
    [...all]/                     ALL  → Better Auth handler
  stores/[slug]/
    staff-login/                  POST → Custom PIN auth (bcrypt + manual session, tenant-scoped)
  upload/                         POST → Vercel Blob (logo/QRIS)
  stores/
    [slug]/                       GET, PATCH
    [slug]/services/              GET, POST
    [slug]/services/[id]/         PATCH, DELETE
    [slug]/staff/                 GET, POST
    [slug]/staff/[id]/            PATCH (includes PIN reset)
    [slug]/customers/             GET, POST
    [slug]/customers/[id]/        GET
    [slug]/orders/                POST (create, atomic counter)
    [slug]/orders/[id]/status/    PATCH
    [slug]/orders/[id]/settle/    POST → DP settlement
    [slug]/orders/[id]/cancel/    POST → cancellation + refund
    [slug]/orders/[code]/track/   GET → public tracking (rate limited)
    [slug]/branches/[id]/         PATCH
    [slug]/payment-methods/       GET
    [slug]/payment-methods/[id]/  PATCH
    [slug]/analytics/             GET
    [slug]/finance/summary/       GET
    [slug]/finance/expenses/      GET, POST
    [slug]/finance/expenses/[id]/ PATCH, DELETE
    [slug]/finance/income/        GET
    [slug]/finance/export/        GET → CSV (Pro only)
    [slug]/billing/create-payment/ POST → Midtrans Snap token
  webhooks/
    midtrans/                     POST → webhook receiver (signature validated)
  cron/
    check-subscriptions/          GET → daily job (CRON_SECRET protected)
  admin/                          GET → platform metrics (ADMIN_SECRET protected)
```

---

## 4. DATA LAYER

### 4.1 Tenant Isolation

**ABSOLUTE RULE:** Every query on a tenant-scoped table MUST include `storeId`.

```typescript
// src/lib/db-guard.ts
export function storeScope(storeId: string) {
  return { storeId }
}

// Usage:
db.order.findMany({ where: { ...storeScope(storeId), status: "READY" } })
```

### 4.2 Shared Finance Utility

**File:** `src/lib/finance.ts` — single source of truth for both analytics and finance.

```typescript
// Revenue = cash basis (SUM of PAID payments) — use $queryRaw for performance
export async function getRevenue(storeId: string, start: Date, end: Date, branchId?: string)

// Expenses — use $queryRaw aggregation
export async function getExpenses(storeId: string, start: Date, end: Date, branchId?: string)

// Net profit = revenue - expenses
export async function getNetProfit(storeId: string, start: Date, end: Date, branchId?: string)

// Receivables = UNPAID + PARTIAL remainingAmount (informational only, not P&L)
export async function getReceivables(storeId: string)

// Date range enforcement: Free = today, Pro = as requested
export function getDateRange(subscription, start?, end?)
```

**Performance rule:** All aggregation queries MUST use Prisma `$queryRaw` to keep computation in PostgreSQL. Do NOT `findMany` + `.reduce()` in JS for financial summaries.

### 4.3 Phone Normalization

**File:** `src/lib/phone.ts`
```typescript
export function normalizePhone(raw: string): string
  // "08..." → "628...", "8..." → "628...", "62..." → "62..."
export function formatPhoneDisplay(phone: string): string
  // "6281234567890" → "0812-3456-7890"
```

Apply in: customer search, customer create, staff login, order tracking.

### 4.4 Order Number Generation — Atomic Counter

**File:** `src/lib/order-number.ts` — replaces Serializable transaction approach.

```typescript
export async function generateOrderNumber(
  db: PrismaClient, branchId: string, branchCode: string
): Promise<string> {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const dateStr = `${yy}${mm}${dd}`

  // Atomic upsert + increment — no Serializable needed
  const counter = await db.orderCounter.upsert({
    where: { branchId_date: { branchId, date: dateStr } },
    create: { branchId, date: dateStr, seq: 1 },
    update: { seq: { increment: 1 } },
  })

  return `${branchCode}-${dateStr}-${String(counter.seq).padStart(3, "0")}`
}
```

### 4.5 Soft Delete Query Pattern

```typescript
// Order, Customer, Expense:
where: { storeId, deletedAt: null }

// Payment:
where: { storeId }

// Service, StaffMember:
where: { storeId, isActive: true }

// ActivityLog, MidtransWebhookLog:
// Never deleted — no filter needed
```

### 4.6 Order Cancellation (Finance-Accurate)

**Decision:** When an order is cancelled:
- Set `Order.status = CANCELLED`
- Set `Order.paymentStatus = REFUNDED` (if was PAID or PARTIAL)
- Set `Order.cancelledAt`, `Order.cancelReason`, `Order.deletedAt`
- Create negative `Payment` record (refund) if money was collected

```typescript
await db.$transaction([
  db.order.update({
    where: { id },
    data: {
      status: "CANCELLED",
      paymentStatus: order.paidAmount > 0 ? "REFUNDED" : "UNPAID",
      cancelledAt: new Date(),
      cancelReason: body.reason,
      deletedAt: new Date(),
    }
  }),
  ...(order.paidAmount > 0 ? [
    db.payment.create({
      data: {
        orderId: id,
        amount: -order.paidAmount,
        paymentMethodId: originalPayment.paymentMethodId,
        status: "REFUNDED",
        notes: "Refund akibat pembatalan pesanan",
      }
    })
  ] : []),
  db.activityLog.create({ data: { action: "order.cancelled", ... } }),
])
```

### 4.7 Order Lifecycle (Phase 3.5)

**Decision:** Operational progress is simplified and separated from payment.

```
RECEIVED -> PROCESS -> READY -> PICKED_UP / DELIVERED -> CLOSED
```

- `paymentStatus` remains separate: `UNPAID | PARTIAL | PAID | REFUNDED`
- `CLOSED` is administrative finalization only, after handoff is complete
- `CANCELLED` remains a separate terminal flow through the cancel endpoint
- Legacy statuses `WASHING | DRYING | IRONING | PACKING` are migrated to `PROCESS`

**Valid transitions**

```typescript
RECEIVED -> PROCESS | CANCELLED
PROCESS -> READY | CANCELLED
READY -> PICKED_UP | DELIVERED
PICKED_UP -> CLOSED
DELIVERED -> CLOSED
CLOSED -> terminal
CANCELLED -> terminal
```

Each status change must:
- update `Order.status`
- preserve `paymentStatus` as its own concern
- log `order.status_changed` to `ActivityLog`
- keep handoff history visible on public tracking via real logs first, fallback timestamps second

---

## 5. AUTHENTICATION & AUTHORIZATION

### 5.1 Owner Login

Google OAuth via Better Auth. No separate admin role.

### 5.2 Staff PIN Login — Custom API

Better Auth's credential plugin is designed for email+password. For phone+PIN, use a **custom endpoint**:

```
POST /api/stores/[slug]/staff-login
  Input: { phone, pin }  // slug from path param
  Flow:
    1. Find store by slug, verify exists
    2. checkRateLimit(phone, branchId) — PinAttempt table
    3. Find StaffMember by phone + storeId
    4. bcrypt.compare(pin, staffMember.pinHash)
    5. On success: create Better Auth session manually via auth.api.createSession()
    6. clearAttempts(phone, branchId)
    7. Return session cookie
```

Rate limiting via `PinAttempt` model (persistent, DB-based).

### 5.3 Authorization Matrix

| Resource | Owner | Cashier | Operator | Courier |
|----------|-------|---------|----------|---------|
| Dashboard analytics | ✅ | ❌ | ❌ | ❌ |
| Finance module | ✅ | ❌ | ❌ | ❌ |
| Manage services | ✅ | ❌ | ❌ | ❌ |
| Manage staff | ✅ | ❌ | ❌ | ❌ |
| Billing/upgrade | ✅ | ❌ | ❌ | ❌ |
| Create orders | ✅ | ✅ | ❌ | ❌ |
| Accept payment | ✅ | ✅ | ❌ | ❌ |
| Settle DP | ✅ | ✅ | ❌ | ❌ |
| Update order status | ✅ | ✅ | ✅ | ❌ |
| Update delivery status | ✅ | ❌ | ❌ | ✅ |
| Cancel order | ✅ | ✅ | ❌ | ❌ |
| Export data | ✅ | ❌ | ❌ | ❌ |

### 5.4 Security Controls

| Control | Implementation |
|---------|---------------|
| SQL injection | Prisma ORM (parameterized) |
| CSRF | SameSite=Lax cookie + Better Auth |
| Tenant isolation | storeId scope on every query |
| Rate limiting (PIN) | DB-based PinAttempt table |
| Rate limiting (tracking) | 30 req/min/IP via middleware |
| Webhook forgery | SHA512 signature validation |
| Cron abuse | CRON_SECRET header validation |
| File upload abuse | Type + size check server-side |
| Blob orphan | Delete old blob before new upload |
| XSS | Next.js automatic escaping |
| Secrets | Env vars only, never in source |

---

## 6. INTEGRATION ARCHITECTURE

### 6.1 Midtrans Snap — Create Payment

```typescript
// POST /api/stores/[slug]/billing/create-payment
// 1. Find subscription by store slug
// 2. Create Invoice (PENDING)
// 3. Call snap.createTransaction({ order_id: invoice.midtransOrderId, gross_amount: 65000 })
// 4. Save snapToken to Invoice
// 5. Return { snapToken }
```

### 6.2 Midtrans Webhook Handler — FIXED

```typescript
// POST /api/webhooks/midtrans
export async function POST(request: Request) {
  const body = await request.json()

  // STEP 1: Log immediately
  const log = await db.midtransWebhookLog.create({
    data: { rawPayload: body, orderId: body.order_id, status: body.transaction_status }
  })

  // STEP 2: Validate signature
  const expected = crypto.createHash("sha512")
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest("hex")
  if (body.signature_key !== expected) {
    await db.midtransWebhookLog.update({ where: { id: log.id }, data: { error: "invalid_signature" } })
    return Response.json({ error: "invalid" }, { status: 401 })
  }

  // STEP 3: Find invoice → subscription → store
  const invoice = await db.invoice.findUnique({
    where: { midtransOrderId: body.order_id },
    include: { subscription: { include: { store: { include: { owner: true } } } } }
  })
  if (!invoice || invoice.status === "PAID") {
    await db.midtransWebhookLog.update({ where: { id: log.id }, data: { processed: true } })
    return Response.json({ received: true })
  }

  const { subscription } = invoice
  const { store } = subscription
  const { owner } = store

  // STEP 4: Process settlement
  if (body.transaction_status === "settlement" && body.fraud_status === "accept") {
    await db.$transaction([
      db.invoice.update({ where: { id: invoice.id }, data: { status: "PAID", paidAt: new Date(), midtransInvoiceId: body.transaction_id } }),
      db.subscription.update({ where: { id: invoice.subscriptionId }, data: { status: "ACTIVE", planType: "PRO", nextChargeAt: addDays(new Date(), 30), reminder7DaySentAt: null, reminder1DaySentAt: null } }),
      db.activityLog.create({ data: { storeId: store.id, actorType: "system", action: "subscription.upgraded", details: { invoiceId: invoice.id } } }),
      db.midtransWebhookLog.update({ where: { id: log.id }, data: { processed: true } }),
    ])

    // Send email outside transaction (fire-and-forget, non-blocking)
    sendPaymentConfirmationEmail(owner.email, owner.name, store.slug).catch(console.error)
  }

  // STEP 5: Handle expire/cancel
  if (["expire", "cancel"].includes(body.transaction_status)) {
    await db.invoice.update({ where: { id: invoice.id }, data: { status: body.transaction_status === "expire" ? "EXPIRED" : "FAILED" } })
    await db.midtransWebhookLog.update({ where: { id: log.id }, data: { processed: true } })
  }

  return Response.json({ received: true })
}
```

### 6.3 Vercel Blob — With Orphan Cleanup

```typescript
// POST /api/upload
// 1. Validate file type (image/*) + size (max 2MB)
// 2. put() new file with access: "public"
// 3. If oldUrl provided: del(oldUrl) after successful upload (prevents orphans + data loss on upload failure)
// 4. Return { url }
```

### 6.4 Resend Email — With Dedup

```typescript
// Cron checks subscriptions daily:
// 1. Expire trials: status TRIALING + trialEndsAt < now → status = LIMITED
// 2. Mark past_due: nextChargeAt < now - 3 days → status = PAST_DUE
// 3. Send 7-day reminder (if reminder7DaySentAt is null → send + set)
// 4. Send 1-day reminder (if reminder1DaySentAt is null → send + set)
// Reminder fields reset to null after successful renewal
```

### 6.5 Rate Limiting — Tracking API

Implement via Upstash Redis (free tier: 10k req/day) or Vercel KV:
```typescript
// npm install @upstash/redis @upstash/ratelimit
// 30 requests per IP per minute on tracking endpoint.
// Persistent, cross-instance safe for Vercel serverless.
```

---

## 7. SUBSCRIPTION & PLAN ENFORCEMENT

### 7.1 State Machine

```
TRIALING ──(7 days)──→ LIMITED (no payment)
    │
    ├──(upgrade)──→ ACTIVE ──(30 days)──→ PAST_DUE ──(3 days)──→ LIMITED
    │                                              │
    └──(cancel)──→ CANCELLED                      └──(pay)──→ ACTIVE
```

### 7.2 Plan Guard Utility

**File:** `src/lib/plan-guard.ts`
```typescript
// canCreateOrder(storeId, branchId) → { allowed: boolean, reason?: string }
//   → Load subscription
//   → REAL-TIME CHECK: If TRIALING and trialEndsAt < now() → treat as LIMITED
//   → Check subscription status != LIMITED
//   → If FREE: daily order count < 10
//   → If TRIALING: no daily limit

// canAddStaff(storeId) → { allowed: boolean, reason?: string }
//   → Load subscription
//   → REAL-TIME CHECK: If TRIALING and trialEndsAt < now() → treat as LIMITED
//   → If FREE: staff count < 1
//   → If PRO/ACTIVE: unlimited

// isPro(storeId) → boolean
//   → subscription.planType === "PRO" && subscription.status === "ACTIVE"

// getDateRange(storeId, start?, end?) → { start, end }
//   → If Pro: use params or default this month
//   → If Free/Trialing/Limited: today only
```

### 7.3 Cron: Daily Subscription Check

```typescript
// GET /api/cron/check-subscriptions (CRON_SECRET protected)
// 1. TRIALING + trialEndsAt < now → LIMITED
// 2. ACTIVE + nextChargeAt < now - 3 days → PAST_DUE
// 3. PAST_DUE + nextChargeAt < now - 6 days → LIMITED
// 4. Send 7-day reminder (deduped)
// 5. Send 1-day reminder (deduped)
```

---

## 8. REQUEST LIFECYCLES

### 8.1 POS Order Creation

```
1. Staff taps "Buat Pesanan"
2. POST /api/stores/{slug}/orders
3. Middleware: session check → inject x-laundryku-internal-slug (NEVER trust for auth)
4. Route handler:
   a. Zod validate body (paidAmount rules, quantity as Int grams)
   b. Verify staff branchId
   c. Load subscription → check canCreateOrder() with real-time expiry
   d. Validate serviceIds belong to store
   e. Recalculate totals server-side
   f. generateOrderNumber() → atomic OrderCounter upsert with P2002 retry
   g. $transaction: Order + OrderItems + Payment (if paid) + ActivityLog
   h. Set estimatedReadyAt = now + store.defaultSlaHours
   i. Return { orderNumber, orderId }
5. Client: navigate to /{slug}/orders/{orderNumber}/receipt (resource-centric URL)
```

### 8.2 DP Settlement

```typescript
// POST /api/stores/[slug]/orders/[id]/settle
// Input: { amount, paymentMethodId }
// 1. Zod validate: amount > 0
// 2. Validate order.paymentStatus === "PARTIAL"
// 3. Validate amount >= remainingAmount
// 4. $transaction:
//    - Payment.create({ amount: remaining, status: "PAID", paymentMethodId })
//    - Order.update({ paymentStatus: "PAID", paidAmount: paidAmount + remaining, remainingAmount: 0, settledAt: new Date() })
//    - ActivityLog.create({ action: "payment.settled" })
```

### 8.3 Order Progress Update

```typescript
// PATCH /api/stores/[slug]/orders/[id]/status
// Input: { newStatus, notes? }
// 1. Zod validate against simplified lifecycle enum
// 2. Reject direct CANCELLED here; use cancel endpoint
// 3. Normalize legacy DB statuses before transition checks
// 4. Validate transition:
//    RECEIVED -> PROCESS
//    PROCESS -> READY
//    READY -> PICKED_UP | DELIVERED
//    PICKED_UP | DELIVERED -> CLOSED
// 5. Set completedAt when handoff happens (PICKED_UP or DELIVERED)
// 6. $transaction:
//    - Order.update({ status, completedAt })
//    - ActivityLog.create({ action: "order.status_changed", details: { previousStatus, nextStatus, notes } })
```

### 8.4 Customer Tracking

```typescript
// GET /api/stores/[slug]/orders/[orderCode]/track?phone=62xxxx
// Rate limited: 30 req/min/IP
// 1. Find order by orderNumber
// 2. If order.customerId === null: allow (walk-in, no phone check)
// 3. If order has customer: validate phone match (normalize comparison)
// 4. Build "Riwayat Pesanan" timeline from ActivityLog first
// 5. If old logs are incomplete, derive PROCESS/READY/HANDOFF/CLOSED from timestamps + current status
// 6. Return sanitized order data (no internal IDs)
```

---

## 9. COST MODEL & SCALING

| Service | 0-50 tenants | 50-200 | 200-500 |
|---------|-------------|--------|---------|
| Vercel | $0 (Hobby) | $20 (Pro) | $20 (Pro) |
| Neon | $0 (Free) | $19 (Launch) | $69 (Scale) |
| Blob | $0 | ~$2 | ~$5 |
| Resend | $0 | $0 | $20 |
| Sentry | $0 | $0 | $26 |
| Better Stack | $0 | $0 | $0 |
| Domain | ~$1 | ~$1 | ~$1 |
| **Total** | **~$1** | **~$42** | **~$121** |

**Breakeven: 1 paying tenant.** (Rp65k = ~$4, cost ~$1)

### When to Migrate Off Vercel
- Bill > $200/month → Railway or Fly.io
- Need WebSockets (real-time POS) → Railway + Socket.io
- Need job queues → Trigger.dev or Inngest

---

## 10. KNOWN LIMITATIONS (Intentional)

| # | Limitation | Impact | Mitigation |
|---|-----------|--------|------------|
| L1 | No slug change | Cannot rename store slug | Document in settings UI |
| L2 | Manual billing | Owner pays monthly manually | Strong reminder emails |
| L3 | No offline/PWA | POS requires internet | Target 4G areas |
| L4 | No auto WA | Staff must share tracking link | QR code on receipt |
| L5 | Single branch (free) | Cannot expand without Pro | Clear upgrade prompt |
| L6 | No customer accounts | No customer login | Code+phone tracking sufficient |
| L7 | QRIS static only | No dynamic QRIS | Owner uses bank's QRIS image |
| L8 | CSV export only | No Excel/PDF | CSV opens in Excel/Sheets |
| L9 | No double-entry | Cash basis only | Sufficient for small business |

---

## 11. AGENT BUILD NOTES

- **DO NOT run `npm run build`** — the TypeScript check (`tsc`) in the build script causes timeout on large projects. Owner runs build manually before deploy.
- Use `npx tsc --noEmit` for type checking during development.
- **Use npm, not pnpm.** All commands: `npm install`, `npm run dev`, `npx prisma`.
- When the user says "organization" in older docs, it means "store" in this version.
