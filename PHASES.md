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

### DONE Gate
- [ ] Owner can register with Google → create store → dashboard
- [ ] Staff can login with PIN → POS
- [ ] Staff PIN lockout after 5 attempts
- [ ] `/{slug}` 404 for unknown slugs
- [ ] `npx tsc --noEmit` passes

---

## Phase 2 — Services, Staff & Settings
**Goal:** Owner configures services, staff, payment methods.

### Tasks
- [x] Dashboard layout with sidebar (including "Keuangan")
- [x] Services CRUD (including Express multiplier)
- [x] Staff management (CASHIER/OPERATOR/COURIER — no ADMIN role)
- [x] Free tier: block 2nd staff, termasuk reaktivasi staf nonaktif di UI
- [ ] Payment methods + QRIS re-upload
- [ ] Branch settings (including WhatsApp number)
- [ ] Store settings (logo re-upload, SLA hours)

### DONE Gate
- [x] Services CRUD with Express multiplier
- [x] Staff management with PIN
- [x] Free tier blocks 2nd staff, termasuk reaktivasi staf nonaktif di UI
- [ ] SLA hours configurable
- [x] `npx tsc --noEmit` passes

---

## Phase 3 — POS Flow
**Goal:** Staff creates orders, accepts payments, prints receipts + labels.

### Tasks
- [ ] POS page shell with auth guard
- [ ] Customer search + "Pelanggan Umum"
- [ ] Service grid (Kiloan/Satuan/Express/Addon tabs)
- [ ] Express price: kiloanBasePrice × multiplier
- [ ] Payment step: Lunas/DP/Belum Bayar
- [ ] Order creation API (atomic OrderCounter, server-side price calc, SLA-based estimatedReadyAt)
- [ ] Receipt page with QR code
- [ ] Packaging label page (print-optimized CSS)
- [ ] Order status updates (valid transitions enforced)
- [ ] DP settlement (`POST /orders/[id]/settle`, set `settledAt`)
- [ ] Order cancellation (`POST /orders/[id]/cancel`, set `cancelledAt` + `cancelReason` + `deletedAt`, negative Payment)

### DONE Gate
- [ ] Full order cycle: create → pay → receipt → label → status
- [ ] Express price = multiplier × base price
- [ ] Order number via atomic counter
- [ ] Free tier blocks 11th order
- [ ] DP settlement + cancellation work
- [ ] `npx tsc --noEmit` passes

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
| 2 | Settings | Services (with multiplier), staff, payment methods |
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
