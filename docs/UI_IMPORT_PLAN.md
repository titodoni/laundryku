# UI Import Plan

Source template: `laundryku-UI/`  
Target app: current Next.js App Router app at repo root.

## Guardrails

- Use `laundryku-UI` only as a visual/design source.
- Do not import `BrowserRouter`, `Routes`, `Route`, `main.tsx`, or Vite entry files.
- Do not import `src/mocks/data.ts` into production routes.
- Keep Prisma, Better Auth, API routes, middleware, guards, DB helpers, and POS business logic intact.
- Preserve server pages that perform auth or tenant checks, and render visual client components below them.
- Keep shared shadcn components in `src/components/ui/`.
- Keep copied visual-only components in `src/components/imported-ui/`.

## Dependencies

Already present in the Next app:

- `lucide-react`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `@radix-ui/react-dialog`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`
- `sonner`
- `recharts`

Template dependencies not added in this pass:

- `react-router-dom`: must not be imported.
- `@tanstack/react-query`: template app shell only; not needed for server-first Next routes.
- `tailwindcss-animate`: avoided by defining small local keyframes instead of adding plugin dependency.
- Extra Radix primitives: add only if a converted screen actually needs the component.

## Route Mapping

| Source page | Target route | Target type | Conversion notes |
| --- | --- | --- | --- |
| `laundryku-UI/src/pages/Landing.tsx` | `src/app/(public)/page.tsx` | Server | Replace `Link to` with `next/link href`; keep real pricing and Bahasa copy from PRD; no demo tenant hardcode. |
| `laundryku-UI/src/pages/Register.tsx` | `src/app/(public)/register/page.tsx` | Server + client form | Keep real Google OAuth `RegisterForm`; use template card/background only. |
| `laundryku-UI/src/pages/Onboarding.tsx` | `src/app/(public)/onboarding/page.tsx` | Server + client form | Keep auth redirect and existing 6-step `OnboardingForm`; use template step/card styling only. |
| `laundryku-UI/src/pages/TenantPublic.tsx` | `src/app/(public)/[slug]/page.tsx` | Server | Use real store/branch data; replace hardcoded `melati-clean`; tracking form must build `/${slug}/orders/${code}/track`. |
| `laundryku-UI/src/pages/Login.tsx` | `src/app/(public)/[slug]/login/page.tsx` | Server + client form | Keep real owner Google and staff PIN API; use template role-card styling only. |
| `laundryku-UI/src/pages/Track.tsx` | `src/app/(public)/[slug]/orders/[orderCode]/track/page.tsx` | Server | Needs real public tracking query/validation; do not use template mock order fallback. |
| `laundryku-UI/src/pages/dashboard/DashboardHome.tsx` | `src/app/(tenant)/[slug]/dashboard/page.tsx` | Server inside guarded layout | Keep owner guard in dashboard layout/page; pass real store/subscription/order summary data to visual cards. |
| `laundryku-UI/src/pages/dashboard/Services.tsx` | `src/app/(tenant)/[slug]/dashboard/services/page.tsx` | Server + client manager | Keep `ServicesManager` and API calls; style the surrounding page with imported visual tokens. |
| `laundryku-UI/src/pages/dashboard/Staff.tsx` | `src/app/(tenant)/[slug]/dashboard/staff/page.tsx` | Server + client manager | Keep free-tier guard and `StaffManager`; no mock staff data. |
| `laundryku-UI/src/pages/dashboard/Customers.tsx` | `src/app/(tenant)/[slug]/dashboard/customers/page.tsx` | Server/client TBD | New route; should use store-scoped customer API/query when scoped. Do not import mock customers. |
| `laundryku-UI/src/pages/dashboard/SettingsOrg.tsx` | `src/app/(tenant)/[slug]/dashboard/settings/page.tsx` | Server + client manager | Split visual shell from current combined branch/settings manager if needed. |
| `laundryku-UI/src/pages/dashboard/SettingsBranch.tsx` | `src/app/(tenant)/[slug]/dashboard/settings/branch/page.tsx` | Server + client manager | Reuse existing branch/store settings data; old `/dashboard/branch` can redirect. |
| `laundryku-UI/src/pages/dashboard/SettingsPayments.tsx` | `src/app/(tenant)/[slug]/dashboard/settings/payment-methods/page.tsx` | Server + client manager | Reuse existing payment methods manager; old `/dashboard/payment-methods` can redirect. |
| `laundryku-UI/src/pages/dashboard/Finance.tsx` | `src/app/(tenant)/[slug]/dashboard/finance/page.tsx` | Server | Must use `$queryRaw` for financial aggregation per repo rule. |
| `laundryku-UI/src/pages/dashboard/Expenses.tsx` | `src/app/(tenant)/[slug]/dashboard/finance/expenses/page.tsx` | Server/client TBD | Needs real store-scoped expenses before full conversion. |
| `laundryku-UI/src/pages/dashboard/Income.tsx` | `src/app/(tenant)/[slug]/dashboard/finance/income/page.tsx` | Server | Must use payment records as revenue source, not order totals. |
| `laundryku-UI/src/pages/dashboard/Billing.tsx` | `src/app/(tenant)/[slug]/dashboard/billing/page.tsx` | Server/client TBD | Use real subscription/invoice rows and Midtrans flow only when billing is in scope. |
| `laundryku-UI/src/pages/pos/POS.tsx` | `src/app/(tenant)/[slug]/pos/page.tsx` | Server + client POS | Keep `requireStaffRouteAccess()`, `getPosBootstrap()`, and `PosApp`; only restyle the client shell. |
| `laundryku-UI/src/pages/pos/Orders.tsx` | `src/app/(tenant)/[slug]/pos/orders/page.tsx` | Server + client board | Keep staff guard and live order APIs; only restyle filters/cards. |
| `laundryku-UI/src/pages/pos/Receipt.tsx` | `src/app/(tenant)/[slug]/pos/receipt/[orderNumber]/page.tsx` | Server | Target route can wrap/redirect to existing resource route; current real receipt is `/{slug}/orders/{orderNumber}/receipt`. |
| `laundryku-UI/src/pages/pos/Label.tsx` | `src/app/(tenant)/[slug]/pos/receipt/[orderNumber]/label/page.tsx` | Server | Target route can wrap/redirect to existing resource route; current real label is `/{slug}/orders/{orderNumber}/label`. |

## Files That Must Not Be Touched

- `prisma/schema.prisma` unless a scoped schema change is explicitly requested.
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/lib/db-guard.ts`
- `src/lib/pos.ts`
- `src/app/api/**`
- `src/middleware.ts`
- Vite files under `laundryku-UI/`, except for read-only inspection.

## Imported Component Strategy

Copy/adapt only visual primitives that have no router or mock-data dependency:

- `ImportedStatCard`
- `ImportedPlanBadge`
- `ImportedStatusBadge`
- `ImportedTrackingTimeline`
- `ImportedEmptyState`

Template components that require conversion before production use:

- `AppShell`, `DashboardSidebar`, `MobileBottomNav`, `OrderCard`, `ReceiptPreview`, POS form components.
- Any component importing `react-router-dom` or `@/mocks/*`.
