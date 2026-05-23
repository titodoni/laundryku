# PRD — Laundryku SaaS POS
**Version:** 1.0 (Final)  
**Updated:** 20 May 2026  
**Status:** Locked for v1 build  
**Stack:** Next.js 14 (App Router) · Prisma · Neon PostgreSQL · Vercel · Better Auth · Midtrans Snap · TypeScript

---

## AGENT INSTRUCTIONS
- Read this file top to bottom before writing any code.
- "LOCKED" = do not change without explicit owner approval.
- "AI OWNS" = you decide, but document your choice inline — ask owner first.
- "RESEARCH FIRST" = fetch latest docs via Context7 AND web search before implementing.
- All user-facing strings must be in **Bahasa Indonesia**.
- All code, schema, config, and comments must be in **English**.
- Never implement a grey-area item without asking the owner first.
- **DO NOT run `npm run build`** — it causes timeout on tsx checks. Run `npx tsc --noEmit` instead. Owner runs build manually.

---

## 1. Product Summary

Laundryku is a browser-based SaaS POS for Indonesian laundry kiloan businesses.

**Core value:** One login, no app install, full POS + order tracking + customer management + business analytics + finance & accounting + subscription billing.

**Domain:** `laundryku.app` (tentative — confirm before go-live)  
**Hosting:** Vercel (LOCKED)  
**Database:** Neon PostgreSQL (LOCKED)  
**Package manager:** npm (LOCKED — do NOT use pnpm)

---

## 2. Users & Roles

| Role | Description | Auth Method |
|------|-------------|-------------|
| `owner` | Runs the business. Full access including billing. | Google OAuth |
| `cashier` | Create orders, accept payments. | 6-digit PIN |
| `operator` | Update production status only. | 6-digit PIN |
| `courier` | Update pickup/delivery status. | 6-digit PIN |
| `customer` | Anonymous. Read-only order tracking. | Order code + phone number |

**Rules:**
- Staff (cashier, operator, courier) are created by owner in dashboard.
- Staff PIN is 6 digits, unique per staff member, bcrypt-hashed in DB.
- Staff PIN has rate limiting: max 5 attempts, then 15-minute lockout (persistent via `PinAttempt` table).
- Owner can reset any staff PIN from dashboard.
- Customer is NOT a user row. Stored as `Customer` record only.
- Owner = admin. There is no separate "admin" role.

---

## 3. Tenant / Store Routing Model (LOCKED)

```
laundryku.app/                            → landing page
laundryku.app/register                    → owner registration
laundryku.app/{slug}                      → store public home
laundryku.app/{slug}/login                → role picker login
laundryku.app/{slug}/dashboard            → owner dashboard
laundryku.app/{slug}/dashboard/finance    → finance & accounting module
laundryku.app/{slug}/pos                  → staff POS
laundryku.app/{slug}/orders/{code}/track  → customer order tracking
```

**Tenant model:**
- 1 Store = 1 laundry brand = 1 slug.
- Slug is auto-generated from brand name, globally unique.
- One email = max one store (duplicate blocked).
- Free tier: 1 branch max.
- Pro tier: unlimited branches.

---

## 4. Feature Scope — v1

### IN SCOPE (build now)
- [ ] Owner registration via Google OAuth
- [ ] Store + branch creation wizard (onboarding) with logo upload + QRIS image upload
- [ ] Store public home page
- [ ] Owner dashboard (analytics, staff mgmt, services, settings)
- [ ] Finance & accounting module (expense tracking, P&L, receivables)
- [ ] Staff POS flow (full order lifecycle + packaging label print)
- [ ] Customer order tracking with WhatsApp chat button
- [ ] Subscription billing via Midtrans Snap (manual renewal)
- [ ] Free tier enforcement (limits below)
- [ ] Email notification for subscription renewal reminder
- [ ] UU PDP minimal compliance: account deletion in settings (soft-delete)

### OUT OF SCOPE (v2+)
- WhatsApp OTP login
- WhatsApp order notifications (automated)
- Multi-branch management UI
- Advanced analytics (custom date range, export CSV/Excel)
- Offline/PWA mode
- Courier tracking map
- Loyalty/member program

---

## 5. Free vs Pro Tier (LOCKED)

| Feature | Free (after trial) | Pro (Rp65.000/month) |
|---------|-------------------|----------------------|
| Trial period | 7 days full access | — |
| Orders per day | **10 orders max** | Unlimited |
| Staff accounts | **1 staff** (+ owner) | Unlimited |
| Branches | 1 | Unlimited |
| Analytics dashboard | **Today only** (1 day) | Full history |
| Finance module | **Today only** (1 day) | Full + export |
| Export / reports | ❌ | ✅ |
| WhatsApp automation (v2) | ❌ | ✅ |

**Enforcement behavior:**
- Orders: soft block at limit — show inline error "Batas order harian tercapai. Upgrade ke Pro."
- Staff: hide "Tambah Staf" button, show upgrade tooltip.
- Analytics & Finance: show today's data, blur history with upgrade CTA.

---

## 6. Onboarding Flow

```
/register
  → Google OAuth
  → Create Store (name, slug, phone, address, logo upload)
  → Auto-create Branch #1
  → Setup wizard:
      Step 1: Store profile (name, slug, phone, address, logo)
      Step 2: First branch
      Step 3: Services & prices
      Step 4: Payment methods (QRIS static image upload)
      Step 5: Add first staff (optional, skippable)
      Step 6: Confirm
  → Redirect to /{slug}/dashboard
```

**Slug generation rule:**
```
"Melati Clean" → "melati-clean"
If taken: "melati-clean-2", "melati-clean-3", etc.
```

**File uploads:**
- Logo: image file, max 2MB, stored in Vercel Blob
- QRIS image: image file, max 2MB, displayed on receipt and tracking page

---

## 7. POS Flow (Staff)

```
/{slug}/pos

1. Search customer (phone or name) or select "Pelanggan Umum"
2. Select service(s): kiloan / satuan / express / add-on
3. Input weight or quantity + optional notes
4. Select payment type:
   - Lunas (full paid now)
   - DP (partial now, remaining on pickup)
   - Belum Bayar (pay on pickup)
5. Confirm → create Order + OrderItems + Payment record
6. Print/show:
   a. Receipt (thermal or screen)
   b. Packaging label (order number, customer name, services summary, date)
7. Staff updates status as order progresses:
   received → process → ready → picked_up / delivered → closed
```

**Implementation note (accepted v1 detail):**
- Internal API routes for POS use `/api/stores/[slug]/...`.
- Current Phase 3 implementation allows any **active staff in the same branch** to create orders, update progress, settle DP, and cancel orders. Role labels remain for staffing, but Phase 3 permissions are branch-scoped.

**Order number format:** `{BRANCH_CODE}-{YYMMDD}-{SEQ}` e.g. `MLT-260519-001`
**Generation:** Atomic counter via `OrderCounter` table (not Serializable transaction).

---

## 8. Order Status Pipeline

```
received → process → ready → picked_up / delivered → closed
```

Each status change:
- Logged to `ActivityLog`
- Timestamp recorded on Order
- Visible to customer on tracking page

---

## 9. Customer Tracking

Route: `/{slug}/orders/{orderCode}/track?phone=62xxxx`

- No login required.
- Validates: orderCode exists AND phone matches customer phone.
- Walk-in orders (customerId: null): no phone validation, order code only.
- Rate limited: 30 requests/min/IP.
- Shows: current status, estimated ready time (based on `Store.defaultSlaHours`), items summary.
- Links are permanent (no expiry).
- QR code displayed on receipt linking to this page.
- **WhatsApp chat button**: opens `https://wa.me/{orgPhone}` with pre-filled message "Halo, saya mau tanya pesanan {orderCode}"

---

## 10. Authentication (LOCKED: Better Auth)

**Library:** Better Auth (LOCKED)  
**RESEARCH FIRST:** Fetch Better Auth latest docs via Context7 + web search before implementing.

| Actor | Method | Notes |
|-------|--------|-------|
| Owner | Google OAuth | Primary. Session cookie, httpOnly, same-domain. |
| Staff | 6-digit PIN | **Custom API** (`/api/stores/[slug]/staff-login`), bypasses Better Auth credential plugin. bcrypt-compare StaffMember.pinHash directly + set session via Better Auth API. Rate-limited via PinAttempt table. |
| Customer | None | Anonymous. Order code + phone validation only. |

**Staff login flow (custom):**
```
POST /api/stores/[slug]/staff-login
  Input: { phone, pin }  // slug from path param
  1. Find store by slug, verify exists
  2. checkRateLimit(phone, branchId) — PinAttempt table
  3. Find StaffMember by phone + storeId
  4. bcrypt.compare(pin, StaffMember.pinHash)
  5. Create Better Auth session manually
  6. clearAttempts(phone, branchId) on success
```

**Session behavior:**
- Persistent until logout or cookie clear.
- Staff session scoped to branch.
- Owner session scoped to store.

**Local development testing note:**
- Owner and staff currently share the same Better Auth browser session cookie.
- Testing owner and staff in different tabs of the same browser profile will overwrite the previous session.
- Use normal browser for owner, incognito or a separate browser/profile for staff.
- Clear localhost cookies before debugging auth redirects or unexpected role switches.

---

## 11. Billing — Midtrans Snap (LOCKED)

**Model:** Manual monthly renewal (LOCKED)  
**Gateway:** Midtrans Snap (LOCKED)  
**Price:** Rp65.000/month (LOCKED)

**Flow:**
```
Owner clicks "Upgrade ke Pro"
  → Backend creates Midtrans transaction
  → Redirect to Snap payment page
  → Owner pays
  → Midtrans sends webhook to /api/webhooks/midtrans
  → Backend validates signature (SHA512)
  → Sets subscription.status = "ACTIVE", planType = "PRO"
  → Email confirmation sent to owner
```

**Subscription states:**
```
TRIALING → ACTIVE → PAST_DUE → LIMITED → CANCELLED
```

| State | Meaning |
|-------|---------|
| TRIALING | 7-day trial, full access |
| ACTIVE | Pro paid, active |
| PAST_DUE | Payment overdue < 3 days |
| LIMITED | Payment overdue >= 3 days, no new orders/staff |
| CANCELLED | Manually cancelled by owner or system |

**LIMITED behavior:**
- No new orders, no new staff.
- In-progress orders CAN still be updated to completion.
- Analytics/finance shows today-only.

**Renewal reminder:**
- Email sent 7 days before `nextChargeAt`
- Email sent 1 day before `nextChargeAt`
- If payment not received: status → PAST_DUE after 3 days, → LIMITED after 3 more days.

**RESEARCH FIRST:** Fetch Midtrans Snap + webhook docs via Context7 + web search before implementing.

---

## 12. Analytics (Owner Dashboard)

**Free tier:** Today only (1 day data) — show upgrade CTA for historical data  
**Pro tier:** Full history, all metrics

Metrics to display:
- Today: revenue (cash basis = SUM of PAID payments), order count, active orders, ready-for-pickup
- This week/month: revenue trend (line chart)
- Customers: repeat rate, top 5 customers by order count
- Staff: orders handled per cashier (this month)

**AI OWNS:** Chart library choice and SQL query vs Prisma aggregation strategy.

---

## 12A. Finance & Accounting Module

**Route:** `/{slug}/dashboard/finance`  
**Goal:** Give the owner a clear financial control center.

**Accounting method:** Cash basis (LOCKED). Revenue = SUM of Payment.amount WHERE status = PAID. Receivables are informational only, not included in P&L.

**Free tier:** Today only — blur history + upgrade CTA  
**Pro tier:** Full date range, export, branch filtering

### Dashboard Metrics
- Cash balance today
- Revenue today / this week / this month
- Expenses today / this week / this month
- Net profit (revenue − expenses)
- Outstanding receivables (unpaid orders total — informational)
- Down payments not yet settled (partial payment orders — informational)
- Cash in / cash out summary

### Expense Tracking
Owner logs expenses manually. Each expense has:
- Date
- Category
- Amount (IDR)
- Notes (optional)
- Branch (if multi-branch Pro)

**Expense categories (LOCKED):**
| Category | Label (Indonesian) |
|----------|--------------------|
| `electricity` | Listrik |
| `water` | Air |
| `fragrance` | Parfum |
| `packaging` | Plastik |
| `salary` | Gaji |
| `operational` | Operasional Lain |

### Financial Rules
- Revenue = SUM of payments with status PAID (cash basis)
- DP = tracked separately, not revenue until fully settled
- Unpaid orders = outstanding receivables (info only, not in P&L)
- Expenses reduce net profit
- Finance data must be consistent with analytics module
- All financial calculations scoped to `storeId` + optional `branchId`

### Export (Pro only)
- Exportable financial ledger (date range)
- Format: AI OWNS (CSV recommended)
- Columns: date, type (income/expense), category, description, amount, balance

---

## 13. Services & Pricing

Owner configures per store:

| Category | Description |
|----------|-------------|
| `kiloan` | Price per kg, minimum weight applies |
| `satuan` | Price per item (e.g. jacket, shoes) |
| `express` | **Multiplier** on kiloan base price (e.g. 1.5x). `ServicePrice.priceMultiplier` field. |
| `addon` | Extra service (e.g. parfum, softener) |

Express pricing logic:
```
expressPrice = kiloanBasePrice × priceMultiplier
Example: 7000 × 1.5 = 10500 per kg
```

Each service has: name, category, base_price, price_multiplier (express only), min_quantity, is_active.

---

## 14. Payment Methods

Configurable per store:

| Type | Notes |
|------|-------|
| `cash` | Always available |
| `transfer` | Bank transfer, manual confirmation |
| `qris` | QRIS static image (uploaded during onboarding or settings) |

---

## 15. SLA / Estimated Ready Time

- Stored as `Store.defaultSlaHours` (default: 24 hours).
- Order `estimatedReadyAt` = `order.createdAt + defaultSlaHours`.
- Configurable by owner in store settings.
- Displayed on tracking page and receipt.

---

## 16. Non-Functional Requirements

- **Performance:** POS must load and be interactive in < 2s on 4G.
- **Security:** All API routes must validate session + role + store scope.
- **Data isolation:** Every DB query must be scoped to `storeId`. No cross-tenant data leaks.
- **Validation:** Use Zod for all API inputs (LOCKED).
- **Error handling:** All API routes return consistent `{ success, data, error }` shape.
- **Logging:** All order status changes, payment events, and expense entries logged to `ActivityLog`.
- **Rate limiting:** Public tracking API: 30 req/min/IP. Staff PIN: 5 attempts / 15 min lockout.

---

## 17. Environment Setup

```bash
# Local dev
cp .env.example .env.local

npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

**Environments:**
- `development` → Neon dev branch
- `preview` → Neon dev branch (PR previews on Vercel)
- `production` → Neon production branch

---

## 18. Locked Decisions Summary

| Decision | Value |
|----------|-------|
| Hosting | Vercel |
| Database | Neon PostgreSQL |
| ORM | Prisma |
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Auth | Better Auth (staff PIN via custom API) |
| Payment | Midtrans Snap, manual renewal |
| Billing model | Manual monthly, Rp65.000/month |
| Trial | 7 days full access |
| Free limits | 10 orders/day, 1 staff, today-only analytics & finance |
| Validation | Zod |
| UI language | Bahasa Indonesia |
| Code language | English |
| Domain | laundryku.app (tentative) |
| Package manager | npm |
| Expense categories | Listrik, Air, Parfum, Plastik, Gaji, Operasional Lain |
| Accounting | Cash basis |
| Express pricing | Multiplier (Float, e.g. 1.5x) |
| Order counter | OrderCounter table (atomic increment) |
| Store plan | Subscription model is SSOT (no planType/status on Store) |
| Owner multi-store | Blocked (one email = max one store) |
| UU PDP | Minimal delete in v1 (soft delete + account deletion) |
| Build | Owner runs `npm run build` manually. Agent uses `npx tsc --noEmit` |
