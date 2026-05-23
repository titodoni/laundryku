# AGENTS.md — LaundryKU

SaaS POS for Indonesian laundry businesses. Next.js 14 App Router + Prisma + Neon PostgreSQL + Better Auth + Midtrans Snap.

## Critical: DO NOT run `npm run build`

It will timeout on TypeScript checks. Use `npx tsc --noEmit` instead. The owner runs `npm run build` manually via Vercel.

## Package manager

npm only. Never use pnpm or bun.

## Key commands

```bash
npm run dev                  # dev server (port 3000)
npx tsc --noEmit             # typecheck — use this instead of build
npx prisma generate          # after any schema.prisma change
npx prisma db push           # push schema to Neon (dev only)
npx prisma migrate dev       # create migration
npx prisma migrate deploy    # apply to production
npx prisma studio            # DB GUI at localhost:5555
```

## Architecture

- **Two codebases in one repo:** Main Next.js app at root. UI Kit reference in `Laundryku UI Kit/` (Vite+React, not the real app).
- **Route groups:** `(public)` for landing/register/onboarding/legal, `(tenant)/[slug]` for dashboard/POS.
- **Tenant isolation:** Every DB query on tenant-scoped tables MUST include `storeId`. Use `storeScope()` from `src/lib/db-guard.ts`.
- **Subscription is SSOT:** Plan type and status live on `Subscription` model, NOT on `Store`. Never add `planType` to Store.
- **Soft delete:** Use `deletedAt` DateTime?. Never hard-delete Orders, Customers, Payments, or Expenses.

## Landing page structure (`src/app/(public)/page.tsx`)

The landing page has 8 sections (no duplicate nav header):

| # | Section | Details |
|---|---------|---------|
| 1 | **Hero** | Headline: "Satu Aplikasi, Semua Urusan Laundry Tertata". Mock dashboard with static numbers (Rp 2.340.000, 24 orders, 142 kg, MLT-260521-007, Pak Agus 7.5kg). CTAs → `/register`. |
| 2 | **Social Proof** | Badge "Dipercaya ratusan laundry kiloan". 3 trust cards: Tanpa Instalasi, Setup 5 Menit, Support Lokal. |
| 3 | **Pain Points** | 3 problem cards: catatan hilang, hitung omset ribet, pelanggan nanya status. |
| 4 | **How It Works** | 4 steps: ① Daftar → ② Setup → ③ Transaksi → ④ Laporan. CTA → `/register`. |
| 5 | **Features** (`#fitur`) | 6 feature cards (Kasir, Struk, Pelanggan, Keuangan, Multi Role, Tracking). 3-col grid. |
| 6 | **Pricing** (`#harga`) | Free (Rp0/bulan), Pro (Rp65.000/bulan). All routes → `/register`. LOCKED — do not change prices, tiers, or button targets. |
| 7 | **FAQ** (`#faq`) | 5 questions in `<details>` accordion. Topics: HP compat, thermal print, data security, multi-branch, Pro payment. |
| 8 | **Closing CTA** | Gradient banner. Headline: "Siap Mengubah Cara Mengelola Laundry?" CTAs → `/register`. |

## Legal pages

| Route | File | Content |
|-------|------|---------|
| `/syarat-layanan` | `src/app/(public)/syarat-layanan/page.tsx` | 10 articles: Definitions, User Obligations, Limitations, Payment & Subscription (Rp65.000/mo), Termination, Liability, Indonesian Law, Contact. |
| `/kebijakan-privasi` | `src/app/(public)/kebijakan-privasi/page.tsx` | 9 articles: Data Collected, Usage, Storage & Security, Third-party Sharing, User Rights (access/correct/delete), Cookies, 30-day Retention, Contact. |
| `/keamanan-data` | `src/app/(public)/keamanan-data/page.tsx` | 10 articles: TLS 1.3 + AES-256, Cloud Infrastructure, Access Control (MFA, least privilege), Backup & Recovery, Physical Security, Indonesian Regulation Compliance, 72-hour Incident Response, Contact. |

All legal pages: back-to-home link, metadata for SEO, formal Indonesian legal structure. Entity name: **LaundryKU**.

## Footer (`src/app/(public)/layout.tsx`)

Single horizontal row:
- Left: Logo + brand + © 2026
- Right: nav links (Fitur, Harga, FAQ, Syarat, Privasi, Keamanan)
- Legal links (`/syarat-layanan`, `/kebijakan-privasi`, `/keamanan-data`) visible on desktop, two hidden on mobile.

## Brand naming

- Use **LaundryKU** (capital K, capital U) for brand references in UI.
- File names, schemas, and internal code use lowercase `laundryku` convention.

## Financial rules

- Cash basis: revenue = SUM of `Payment.amount` WHERE status = PAID.
- Receivables are informational only, not included in P&L.
- All aggregation queries MUST use Prisma `$queryRaw`. Do NOT `findMany` + `.reduce()` in JS.

## UI Kit import rules

`Laundryku UI Kit/` is a Vite+React reference template. When importing from it:
- Convert `react-router-dom` to Next.js App Router route files.
- Replace `Link`, `useParams`, `useNavigate` with Next.js equivalents.
- Never import `mock-data.ts` into production routes.
- Remove `Organization` naming; use `Store` per SCHEMA.md.
- Keep `.tap-target` and `.receipt-paper` CSS classes.

## Code conventions

- User-facing strings: Bahasa Indonesia.
- Code, comments, schema, config: English.
- Validation: Zod (locked).
- UI: shadcn/ui + Tailwind + Radix primitives.
- `@/*` alias maps to `./src/*`.

## Upload security (LOCKED)

- Every upload MUST include a `purpose` field (`qris`, `store-logo`, `onboarding-logo`, `onboarding-qris`).
- `qris` and `store-logo` require authenticated session + slug + owner ownership check.
- Blob cleanup must only delete blobs belonging to the same store (check URL path contains `stores/{storeId}/`).
- Onboarding uploads use `onboarding/` paths, no store ownership needed.
- See `src/lib/upload.ts` for purpose list, path builders, and validation.

## DB connection (LOCKED)

- `src/lib/db.ts` uses standard `PrismaClient` singleton with `import "server-only"`.
- Do NOT use `@prisma/adapter-neon` or `@neondatabase/serverless` — they require Node >=19.
- Do NOT reference `WebSocket` or `neonConfig` in db.ts.
- Environment format:
  ```
  DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.r1.neon.tech/db?sslmode=require&connection_limit=1&pool_timeout=20"
  DIRECT_URL="postgresql://user:pass@ep-xxx.r1.neon.tech/db?sslmode=require"
  ```
  `DATABASE_URL` = pooled (`-pooler` host). `DIRECT_URL` = direct (for Prisma CLI/migrations).

## Schema changes

After any edit to `prisma/schema.prisma`:
1. `npx prisma generate`
2. `npx prisma db push` (local) or commit + let Vercel build run `prisma migrate deploy` (production)

Never run `npx prisma migrate reset` on production.

## Build & deploy

- Vercel build: `prisma generate && prisma migrate deploy && next build` (defined in `vercel.json`).
- The `npm run build` script exists but will timeout locally — owner triggers deploy via push to main.
- Cron: `0 18 * * *` UTC = 01:00 WIB for subscription checks.

## Key docs

| File | Purpose |
|------|---------|
| `PRD.md` | Product spec, locked decisions, features |
| `BLUEPRINT.md` | System architecture, API routes, integrations |
| `SCHEMA.md` | Full Prisma schema, ER diagram, seed data |
| `RUNBOOK.md` | Step-by-step build guide with commands |
| `PHASES.md` | Build phase order and done gates |
| `UI_KIT_IMPORT_STAGES.md` | How to import UI Kit into Next.js |

## Skills

When working on Laundryku implementation, auditing, route correction, schema alignment, or phase work, use the `laundryku-codex-workflow.md` skill.

Always read:
- PRD.md
- SCHEMA.md
- PHASES.md
- RUNBOOK.md

Before coding, inspect and plan unless the task is very small.

## UI/UX shell
Use directory /Laundryku UI Kit for references UI/UX shell 