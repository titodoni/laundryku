# Laundryku UI Kit Import Stages

Source template: `Laundryku UI Kit/`

Purpose: use the Lovable/Vite UI Kit as a visual and interaction reference, then import it into the real Next.js 14 App Router app in controlled phase slices. Do not copy the template wholesale.

## Source Read Summary

- Framework: Vite + React 18 + TypeScript, `react-router-dom`, TanStack Query, shadcn/ui, Tailwind.
- Target project per `PRD.md`: Next.js 14 App Router, npm, Prisma, Neon, Better Auth, Midtrans.
- UI Kit routes are defined in `Laundryku UI Kit/src/App.tsx`.
- UI Kit data is static mock data in `Laundryku UI Kit/src/lib/mock-data.ts`.
- UI Kit domain model uses `Organization`; project docs use `Store`.
- UI Kit includes a full shadcn component export under `src/components/ui`.
- UI Kit includes old demo links and mock fallback behavior that must not ship as production behavior.

## Non-Negotiable Import Rules

- Keep `PRD.md`, `PHASES.md`, `SCHEMA.md`, and `BLUEPRINT.md` as source of truth.
- Use npm only. Do not introduce pnpm or bun usage from the template.
- Do not run `npm run build`; use `npx tsc --noEmit`.
- Convert `react-router-dom` routing to Next.js App Router route files.
- Replace every `Link` from `react-router-dom` with `next/link`.
- Replace `useParams`, `useNavigate`, and `useSearchParams` with Next.js equivalents.
- Do not import `mock-data.ts` into production routes. Use typed adapters/serializers from Prisma-backed data.
- Do not ship demo tenant links like `/laundry-melati` as real production entry points unless explicitly approved.
- Keep user-facing copy in Bahasa Indonesia.
- Keep code, comments, schema, and config in English.

## Stage 0: Design System Extraction

Goal: bring over safe UI foundations before app behavior.

Import candidates:
- `Laundryku UI Kit/src/index.css` design tokens.
- `Laundryku UI Kit/tailwind.config.ts` color names and radius tokens.
- `Laundryku UI Kit/src/lib/utils.ts`.
- Minimal shadcn components actually needed by the current phase.

Adaptations:
- Merge CSS tokens into the real app stylesheet, do not overwrite existing app CSS blindly.
- Keep `.tap-target` and `.receipt-paper`.
- Ignore `Laundryku UI Kit/src/App.css`; it is default Vite starter CSS and should not be imported.
- Do not import `next-themes` unless dark mode is explicitly in scope.

Done gate:
- `npx tsc --noEmit` passes.
- Existing pages render with the merged theme.

## Stage 1: Public And Auth Entry UI

Matches `PHASES.md` Phase 1.

Import candidates:
- `src/components/layouts/PublicLayout.tsx`.
- `src/pages/Index.tsx`.
- `src/pages/Register.tsx`.
- `src/pages/Onboarding.tsx`.
- `src/pages/TenantHome.tsx`.
- `src/pages/TenantLogin.tsx`.
- Shared components used by those pages: badges, upload placeholder, empty/error/loading states as needed.

Next.js target routes:
- `/` -> `src/app/(public)/page.tsx`.
- `/register` -> `src/app/(public)/register/page.tsx`.
- `/onboarding` -> `src/app/(public)/onboarding/page.tsx`.
- `/{slug}` -> `src/app/(public)/[slug]/page.tsx`.
- `/{slug}/login` -> `src/app/(tenant)/[slug]/login/page.tsx`.

Adaptations:
- Registration button must call Better Auth Google OAuth, not a fake timeout.
- Onboarding must POST to `POST /api/stores` and upload logo/QRIS via the real upload API.
- Staff login must call `POST /api/stores/[slug]/staff-login`; UI Kit currently has local attempt state only.
- Tenant home must load real `Store`, `Service`, and contact data by slug.
- Unknown slug must return real 404, not fallback to `organizations[0]`.

Done gate:
- Owner registration reaches onboarding.
- Onboarding creates store/branch/subscription/defaults.
- Staff PIN login reaches POS.
- Unknown slug 404 behavior is verified.

## Stage 2: Dashboard Layout, Settings, Services, Staff

Matches `PHASES.md` Phase 2.

Import candidates:
- `src/components/layouts/DashboardLayout.tsx`.
- `src/components/layouts/SidebarNav.tsx`.
- `src/components/layouts/Topbar.tsx`.
- `src/components/layouts/BottomNav.tsx`.
- `src/pages/dashboard/Services.tsx`.
- `src/pages/dashboard/Staff.tsx`.
- `src/pages/dashboard/Settings.tsx`.
- `src/pages/dashboard/SettingsBranch.tsx`.
- `src/pages/dashboard/SettingsPayment.tsx`.

Next.js target routes:
- `/{slug}/dashboard/services`.
- `/{slug}/dashboard/staff`.
- `/{slug}/dashboard/settings`.
- `/{slug}/dashboard/settings/branch`.
- `/{slug}/dashboard/settings/payment-methods`.

Adaptations:
- Remove `ADMIN` role references; PRD allows owner plus staff roles `CASHIER`, `OPERATOR`, `COURIER`.
- Data must come from scoped API/server actions using `storeId`.
- Free-tier second-staff blocking must use `plan-guard`, not frontend-only checks.
- Payment method and QRIS UI must use real upload/storage paths.

Done gate:
- Services CRUD works.
- Staff CRUD and PIN reset work.
- Free tier blocks second staff server-side.
- Branch and payment settings persist.

## Stage 3: POS, Receipt, Label

Matches `PHASES.md` Phase 3.

Import candidates:
- `src/components/layouts/POSLayout.tsx`.
- `src/pages/pos/POS.tsx`.
- `src/pages/pos/POSOrders.tsx`.
- `src/pages/pos/Receipt.tsx`.
- `src/pages/pos/Label.tsx`.

Next.js target routes:
- `/{slug}/pos`.
- `/{slug}/pos/orders`.
- `/{slug}/orders/{orderNumber}/receipt`.
- `/{slug}/orders/{orderNumber}/label`.

Adaptations:
- POS must call `POST /api/stores/[slug]/orders`.
- Server must calculate prices and generate order number via `OrderCounter`.
- Express pricing must follow real service multiplier rules.
- Receipt QR must use a real QR component/package and point to tracking route.
- Receipt and label need print CSS, not mock placeholders.
- POS layout must use authenticated branch/staff session data, not `branches[0]` or `staffMembers[0]`.

Done gate:
- Full order cycle: create -> pay -> receipt -> label -> status update.
- DP settlement and cancellation APIs work.
- Free tier blocks 11th order server-side.

## Stage 4: Tracking, Dashboard Home, Customers, Analytics

Matches `PHASES.md` Phase 4.

Import candidates:
- `src/pages/Tracking.tsx`.
- `src/pages/dashboard/DashboardHome.tsx`.
- `src/pages/dashboard/Orders.tsx`.
- `src/pages/dashboard/Customers.tsx`.
- Shared: `StatusBadge`, `PaymentStatusBadge`, `MetricCard`, `ActivityLogCard`, `PlanBanner`, `UpgradeCTA`.

Next.js target routes:
- `/{slug}/orders/{code}/track`.
- `/{slug}/dashboard`.
- `/{slug}/dashboard/orders`.
- `/{slug}/dashboard/customers`.

Adaptations:
- Tracking must validate order code plus phone, except walk-in orders.
- Tracking endpoint must be rate limited at 30 req/min/IP.
- Dashboard analytics must use cash-basis revenue from the shared finance utility.
- Free tier must show today-only data and block/blur history based on server-side plan rules.

Done gate:
- Customer tracking shows timeline and WhatsApp button.
- Walk-in tracking works without phone.
- Analytics match finance revenue rules.

## Stage 5: Finance

Matches `PHASES.md` Phase 4A.

Import candidates:
- `src/pages/dashboard/Finance.tsx`.
- `src/pages/dashboard/Expenses.tsx`.
- `src/pages/dashboard/Income.tsx`.

Next.js target routes:
- `/{slug}/dashboard/finance`.
- `/{slug}/dashboard/finance/expenses`.
- `/{slug}/dashboard/finance/income`.

Adaptations:
- Replace local reductions with `src/lib/finance.ts`.
- Cash basis: revenue is paid payments only.
- Receivables are informational, not revenue.
- CSV export must be Pro-only.
- Expense CRUD must persist and use the six locked categories.

Done gate:
- Revenue equals analytics revenue.
- Adding expense lowers net profit.
- Free tier blocks export and limits date range.

## Stage 6: Billing

Matches `PHASES.md` Phase 5.

Import candidates:
- `src/pages/dashboard/Billing.tsx`.
- Shared: `PlanBadge`, `PlanBanner`, `UpgradeCTA`.

Next.js target route:
- `/{slug}/dashboard/billing`.

Adaptations:
- Upgrade button must call `POST /api/stores/[slug]/billing/create-payment`.
- Midtrans Snap token flow and webhook state transitions must drive subscription state.
- Invoice history must come from database.
- Trial/Past Due/Limited banners must reflect `Subscription`, not `Organization.status`.

Done gate:
- Upgrade opens Midtrans Snap.
- Webhook updates invoice and subscription.
- Plan enforcement updates after payment/trial expiry.

## Stage 7: Hardening And Cleanup

Matches `PHASES.md` Phase 6.

Tasks:
- Remove all `Laundryku UI Kit/src/lib/mock-data.ts` dependencies from imported code.
- Remove all `Organization` naming from product code unless intentionally isolated in adapter docs.
- Remove fake demo paths and mock upload boxes from production routes.
- Add loading, error, and empty states around real APIs.
- Confirm tenant isolation: every tenant query includes `storeId`.
- Verify POS performance target: interactive under 2s on 4G-class connection.
- Verify `npx tsc --noEmit`.

## Dependency Notes

Likely reusable dependencies:
- `lucide-react`
- `sonner`
- `date-fns`
- `recharts`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- selected Radix packages required by imported shadcn components

Do not blindly import:
- `react-router-dom`
- `@tanstack/react-query` unless a client caching strategy is explicitly chosen
- `next-themes`
- `lovable-tagger`
- `vite`, Vite plugins, Vitest config, or Bun lockfile

## Import Priority

1. Tokens and primitives.
2. Public/auth/onboarding UI.
3. Dashboard shell and settings CRUD surfaces.
4. POS write path.
5. Tracking and analytics.
6. Finance.
7. Billing.
8. Cleanup, hardening, deploy polish.
