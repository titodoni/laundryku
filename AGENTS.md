# AGENTS.md — Laundryku

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
- **Route groups:** `(public)` for landing/register/onboarding, `(tenant)/[slug]` for dashboard/POS.
- **Tenant isolation:** Every DB query on tenant-scoped tables MUST include `storeId`. Use `storeScope()` from `src/lib/db-guard.ts`.
- **Subscription is SSOT:** Plan type and status live on `Subscription` model, NOT on `Store`. Never add `planType` to Store.
- **Soft delete:** Use `deletedAt` DateTime?. Never hard-delete Orders, Customers, Payments, or Expenses.

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
