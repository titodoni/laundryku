# PHASES.md — Laundryku Build Phases
**Version:** 1.0 (Final)  
**Updated:** 20 May 2026  
**Total Phases:** Phase 0 bootstrap + 7 build phases  
**Target:** Production-ready v1 on Vercel

---

## AGENT INSTRUCTIONS
- Complete phases **in order**. Do not skip ahead.
- Each phase has a **DONE GATE** — do not proceed until all items pass.
- Mark completed tasks with ✅ as you go.
- **GUNAKAN npm, BUKAN pnpm.** Semua command pnpm sudah diganti npm.
- **JANGAN jalankan `npm run build`** — timeout di tsx check. Owner manual.
- Always run `npx prisma generate` after any schema change.
- Always run `npx tsc --noEmit` before marking a phase done.
- Reference PRD.md for locked decisions. Reference SCHEMA.md for data models.
- "Organization" di dokumen lama = "Store" di versi ini.

---

## Phase 0 — Project Bootstrap
**Goal:** Repo running locally, DB connected, basic routing works.

### Tasks
- [ ] Init Next.js 14 with App Router + TypeScript
  ```bash
  npx create-next-app@latest laundryku --typescript --tailwind --app --src-dir --import-alias "@/*"
  ```
- [ ] Setup Prisma + Neon
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- [ ] Copy Prisma schema from SCHEMA.md into `prisma/schema.prisma`
- [ ] Run `npx prisma db push` + `npx prisma generate`
- [ ] Setup `.env.example`
- [ ] Setup folder structure:
  ```
  src/app/(public)/          # landing, register, [slug]
  src/app/(tenant)/[slug]/   # dashboard, pos, orders
  src/app/api/stores/[slug]/ # API routes
  src/app/api/auth/
  src/app/api/webhooks/
  src/app/api/cron/
  src/app/api/upload/
  src/lib/
    auth.ts, db.ts, midtrans.ts, finance.ts, phone.ts, slug.ts, order-number.ts, db-guard.ts, logger.ts, plan-guard.ts
    validations/
  src/components/ui/, pos/, dashboard/, finance/
  ```
- [ ] Install dependencies:
  ```bash
  npm install prisma @prisma/client better-auth @better-auth/prisma-adapter zod bcryptjs lucide-react recharts sonner qrcode.react midtrans-client resend @vercel/blob date-fns
  npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select
  npm install class-variance-authority clsx tailwind-merge
  npm install -D @types/bcryptjs @types/node tsx
  ```
- [ ] Setup shadcn/ui
- [ ] Setup utility libraries: `phone.ts`, `slug.ts`, `db-guard.ts`, `logger.ts`
- [ ] Verify: `npx tsc --noEmit` = 0 error, `npm run dev` runs

### DONE Gate
- [ ] `npm run dev` starts cleanly
- [ ] `npx prisma studio` shows all tables
- [ ] `npx tsc --noEmit` passes

---

## Phase 1 — Auth + Store Creation
**Goal:** Owner register Google → onboarding (logo + QRIS) → dashboard. Staff PIN login.

### Tasks

#### 1.1 Better Auth Setup
- [ ] Configure Better Auth in `src/lib/auth.ts` (Google OAuth + Prisma adapter)
- [ ] Create `src/app/api/auth/[...all]/route.ts`
- [ ] Test: Google OAuth flow works end-to-end

#### 1.2 Registration + Onboarding
- [ ] Page: `/register` — Google sign-in button
- [ ] Page: `/onboarding` — multi-step wizard (6 step)
- [ ] API: `POST /api/stores` — creates Store + Branch + Subscription + defaults
- [ ] Owner duplicate check: one email = max one store

#### 1.3 Store Public Home
- [ ] Page: `/{slug}` — public, no auth required
- [ ] 404 if slug not found

#### 1.4 Login Page
- [ ] Page: `/{slug}/login` — Owner (Google) | Staff (PIN)

#### 1.5 Staff PIN Login (Custom API)
- [ ] API: `POST /api/stores/[slug]/staff-login` — custom bcrypt compare + manual session
- [ ] Rate limit: 5 attempts / 15 min (PinAttempt table)
- [ ] Better Auth credential plugin NOT used
- [ ] Local auth testing uses separate browser contexts for owner and staff because one Better Auth session cookie is shared per browser profile

### DONE Gate
- [ ] Owner can register with Google → create store → dashboard
- [ ] Staff can login with PIN → POS
- [ ] Staff PIN lockout after 5 attempts
- [ ] `/{slug}` 404 for unknown slugs
- [ ] `npx tsc --noEmit` passes

### Local Auth Testing Note
- Owner and staff login share the same Better Auth browser session cookie in local development.
- Do not test owner and staff in two tabs of the same browser profile.
- Use normal browser for owner, incognito or a separate browser/profile for staff.
- Clear localhost cookies first when debugging redirect loops or `no active staff access`.

---

## Phase 2 — Services, Staff & Settings
**Goal:** Owner configures services, staff, payment methods.

### Tasks
- [x] Dashboard layout with sidebar (including "Keuangan")
- [x] Services CRUD (including Express multiplier)
- [x] Staff management (CASHIER/OPERATOR/COURIER — no ADMIN role)
- [x] Free tier: block 2nd staff, termasuk reaktivasi staf nonaktif di UI
- [x] Payment methods + QRIS re-upload
- [x] Branch settings (including WhatsApp number)
- [x] Store settings (logo re-upload, SLA hours)

### DONE Gate
- [x] Services CRUD with Express multiplier
- [x] Staff management with PIN
- [x] Free tier blocks 2nd staff, termasuk reaktivasi staf nonaktif di UI
- [x] SLA hours configurable
- [x] QRIS + Logo re-upload via `api/upload`
- [x] WhatsApp number and SLA tersimpan
- [x] `npx tsc --noEmit` passes

### Implemented Routes (Phase 2)

| Route | Description |
|-------|-------------|
| `/{slug}/dashboard` | Analytics dashboard |
| `/{slug}/dashboard/services` | Service CRUD with Express multiplier |
| `/{slug}/dashboard/staff` | Staff management + PIN + free tier guard |
| `/{slug}/dashboard/payment-methods` | Payment method toggles + QRIS upload |
| `/{slug}/dashboard/branch` | Branch settings (name, code, address, phone, WhatsApp) |
| `/{slug}/dashboard/settings` | Store settings (name, logo re-upload, SLA hours) |

### APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `api/stores/[slug]/services` | List / create service |
| PATCH/DELETE | `api/stores/[slug]/services/[id]` | Update / soft-delete service |
| GET/POST | `api/stores/[slug]/staff` | List / create staff |
| PATCH | `api/stores/[slug]/staff/[id]` | Update staff |
| POST | `api/stores/[slug]/staff/[id]/reset-pin` | Admin PIN reset |
| GET/PATCH | `api/stores/[slug]/payment-methods/[id]` | Toggle method |
| PATCH | `api/stores/[slug]` | Update store profile (name, logo, SLA, WhatsApp) |
| GET/PATCH | `api/stores/[slug]/branches/[id]` | Update branch |
| POST | `api/upload` | Image upload (purpose, slug, owner guard) |

### Upload Security Rule (LOCKED)
- Upload requires `purpose` field (`qris`, `store-logo`, `onboarding-logo`, `onboarding-qris`).
- `qris` and `store-logo` require authenticated session + `slug` param + owner/admin ownership validation.
- Blob cleanup: only delete blobs belonging to the same store (detected via URL pattern matching `stores/{storeId}/`).
- Onboarding uploads (`onboarding-logo`, `onboarding-qris`) require no store yet; they are moved to `onboarding/{userId}/` paths.
- Max file size: 2 MB. Image types only.
- See `src/lib/upload.ts` for purpose list and path builders.

### DB Connection Rule (LOCKED)
- `src/lib/db.ts` uses standard `PrismaClient` singleton — no Neon adapter, no WebSocket.
- Protected by `import "server-only"` — cannot be imported from client components.
- Node-18-safe: no dependency on global `WebSocket` or `@neondatabase/serverless`.
- Environment variables:
  ```
  DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.r1.neon.tech/db?sslmode=require&connection_limit=1&pool_timeout=20"
  DIRECT_URL="postgresql://user:pass@ep-xxx.r1.neon.tech/db?sslmode=require"
  ```
  `DATABASE_URL` uses **pooled** host (with `-pooler`). `DIRECT_URL` uses **direct** host (for migrations).

### Remaining Risks
- **Neon cold start:** First DB query after idle suspension adds ~500ms latency. Acceptable for v1.
- **Connection pool tuning:** `connection_limit=1` prevents pool exhaustion in dev. Under production concurrency, may need increase based on Vercel function scaling.
- **`npm run build` still times out locally** — owner builds via Vercel deploy.

---

## Phase 3 — POS Flow
**Goal:** Staff creates orders, accepts payments, prints receipts + labels.

### Tasks
- [x] POS page shell with auth guard
- [x] Customer search + "Pelanggan Umum"
- [x] Service grid (Kiloan/Satuan/Express/Addon tabs)
- [x] Express price: kiloanBasePrice × multiplier
- [x] Payment step: Lunas/DP/Belum Bayar
- [x] Order creation API (atomic OrderCounter, server-side price calc, SLA-based estimatedReadyAt)
- [x] Receipt page with QR code
- [x] Packaging label page (print-optimized CSS)
- [x] Order status updates (valid transitions enforced)
- [x] DP settlement (`POST /orders/[id]/settle`, set `settledAt`)
- [x] Order cancellation (`POST /orders/[id]/cancel`, set `cancelledAt` + `cancelReason` + `deletedAt`, negative Payment)

### DONE Gate
- [x] Full order cycle: create → pay → receipt → label → status
- [x] Express price = multiplier × base price
- [x] Order number via atomic counter
- [x] Free tier blocks 11th order
- [x] DP settlement + cancellation work
- [x] `npx tsc --noEmit` passes

### Implemented Routes (Phase 3)

| Route | Description |
|-------|-------------|
| `/{slug}/pos` | Staff POS flow with customer lookup, service tabs, payment step, and order submit |
| `/{slug}/pos/orders` | Daftar pesanan hari ini + progress update + pickup/close flow + DP settlement + cancellation |
| `/{slug}/orders/[orderNumber]/receipt` | Struk order dengan QR code tracking |
| `/{slug}/orders/[orderNumber]/label` | Label packaging print 80mm |

### APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `api/stores/[slug]/customers` | Search / create customer inline dari POS |
| GET/POST | `api/stores/[slug]/orders` | List order hari ini / create order |
| PATCH | `api/stores/[slug]/orders/[id]/status` | Update status valid sesuai pipeline |
| POST | `api/stores/[slug]/orders/[id]/settle` | Pelunasan order DP |
| POST | `api/stores/[slug]/orders/[id]/cancel` | Batalkan pesanan + refund negatif |
| POST | `api/stores/[slug]/orders/[id]/label-printed` | Tandai label sudah dicetak |

### Verification

```bash
npx tsc --noEmit
npm run verify:phase3
npm run smoke:phase3:db
```

### Evidence
- `npm run verify:phase3` lulus untuk pricing express, payment-state mapping, validasi settlement/cancel, valid transition, dan free-tier order ke-11.
- `npm run smoke:phase3:db` lulus pada Neon dev DB.
- Smoke menghasilkan nomor order nyata dengan format atomic counter, contoh `S07-260522-001`.
- Smoke menghitung dan menyimpan total nyata, contoh `Rp 45.500`.
- QR code di struk sudah membentuk target route contract `/{slug}/orders/{orderCode}/track`; halaman tracking-nya tetap masuk Phase 4.

---

## Phase 4 — Customer Tracking + Analytics
**Goal:** Customers track orders. Owner sees analytics.

### Tasks
- [ ] Tracking page: timeline, WA button, rate-limited (30/min/IP)
- [ ] Walk-in: no phone validation
- [ ] Analytics dashboard (4 metric cards, cash basis)
- [ ] Free tier: today only, Pro: full history
- [ ] Customer list + search

### DONE Gate
- [ ] Customer tracking with WA button
- [ ] Walk-in tracking without phone
- [ ] Rate limit on tracking
- [ ] Analytics today for Free, full for Pro
- [ ] `npx tsc --noEmit` passes

---

## Phase 4A — Finance & Accounting Module
**Goal:** Owner has cash-basis P&L control.

### Tasks
- [ ] Finance helper library (`src/lib/finance.ts`)
- [ ] Finance dashboard: revenue, expenses, net profit, receivables
- [ ] **Cash basis:** revenue = PAID payments only. Receivables = informational.
- [ ] Expense CRUD (6 categories)
- [ ] Income ledger (read-only from payments)
- [ ] CSV export (Pro only, 403 for Free)
- [ ] Consistency check: finance revenue = analytics revenue

### DONE Gate
- [ ] Finance dashboard with all metrics
- [ ] Cash basis: revenue = PAID payments only
- [ ] Add expense → net profit decreases
- [ ] CSV export for Pro, blocked for Free
- [ ] Revenue consistent with analytics
- [ ] `npx tsc --noEmit` passes

---

## Phase 5 — Billing (Midtrans Snap)
**Goal:** Owner upgrades to Pro. Webhook + trial enforcement.

### Tasks
- [ ] Billing page: plan status, upgrade button, invoice history
- [ ] Create payment API (Invoice PENDING → Midtrans Snap)
- [ ] Webhook handler: traverse invoice → subscription → store → owner
- [ ] Signature validation (SHA512)
- [ ] Plan guard (canCreateOrder, canAddStaff, getDateRange)
- [ ] Cron: daily subscription check (trial expiry, past_due, reminders)
- [ ] Email reminders (7-day + 1-day deduped)

### DONE Gate
- [ ] Upgrade → Snap → Subscription becomes PRO
- [ ] Webhook processes correctly
- [ ] Trial expiry → LIMITED
- [ ] Plan enforcement works
- [ ] `npx tsc --noEmit` passes

---

## Phase 6 — Polish, Testing & Deploy
**Goal:** Production-ready on Vercel.

### Tasks
- [ ] Healthcheck endpoint (`/api/health`)
- [ ] Admin endpoint (`/api/admin`)
- [ ] Error handling: `{ success, data?, error? }`, loading skeletons, error boundary, 404
- [ ] Security: cross-tenant isolation, rate limiting, no secrets in code
- [ ] Performance: POS TTI < 2s, finance API < 500ms
- [x] Landing page revamp — 8 sections (Hero, Social Proof, Pain Points, How It Works, Features, Pricing, FAQ, Closing CTA)
- [x] Legal pages — `/syarat-layanan`, `/kebijakan-privasi`, `/keamanan-data`
- [x] Footer — single row with legal links
- [x] Register form — legal terms hyperlinks
- [ ] Vercel deploy with all env vars
- [ ] Production smoke tests

### DONE Gate
- [ ] All smoke tests pass on production URL
- [ ] No console errors in production
- [ ] Midtrans webhook works (sandbox)
- [ ] Finance numbers consistent with analytics
- [ ] `laundryku.app/{slug}` loads correctly

---

## Phase Summary

| Phase | Description | Key Output |
|-------|-------------|------------|
| 0 | Bootstrap | Running repo + DB connected |
| 1 | Auth + Store | Owner registers, staff PIN login |
| 2 | Settings | ✅ Services (with multiplier), staff, payment methods, branch, store settings |
| 3 | POS | Full order lifecycle + atomic counter + settlement |
| 4 | Tracking + Analytics | Customer tracking, owner dashboard |
| 4A | Finance | Cash basis P&L, expenses, export |
| 5 | Billing | Midtrans upgrade, trial enforcement |
| 6 | Polish + Deploy | Production live on Vercel |

## Dependency Map

```
Phase 0 (bootstrap)
  └── Phase 1 (auth + store)
        ├── Phase 2 (settings)
        │     └── Phase 3 (POS)
        │           └── Phase 4 (tracking + analytics)
        │                 └── Phase 4A (finance)
        └── Phase 5 (billing)
              └── Phase 6 (deploy)
```

## Deferred to v2

- WhatsApp OTP login
- WhatsApp automated order notifications
- Multi-branch management UI
- Offline/PWA mode
- Courier real-time tracking
- Customer loyalty/member program
- Automated recurring billing (Midtrans Core API)
