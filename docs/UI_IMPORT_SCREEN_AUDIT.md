# Laundryku UI Import Screen Audit

Visual source of truth: `laundryku-UI`
Functional source of truth: `src/app`, `src/components`, `src/lib`

| Screen | Existing Next route | UI source file | Status | Notes |
|---|---|---|---|---|
| Landing | `src/app/(public)/page.tsx` | `laundryku-UI/src/pages/Landing.tsx` | Implemented | Template layout already converted to Next links and production copy. |
| Register | `src/app/(public)/register/page.tsx` | `laundryku-UI/src/pages/Register.tsx` | Implemented | Template card shell preserved; real Better Auth register form remains functional. |
| Onboarding | `src/app/(public)/onboarding/page.tsx` | `laundryku-UI/src/pages/Onboarding.tsx` | Implemented | Template header, stepper, and card shell wrap the real guarded onboarding form. |
| Tenant public | `src/app/(public)/[slug]/page.tsx` | `laundryku-UI/src/pages/TenantPublic.tsx` | Implemented | Template hero, tracking card, branch cards use real store and branch data. |
| Tenant login | `src/app/(public)/[slug]/login/page.tsx` | `laundryku-UI/src/pages/Login.tsx` | Implemented | Template card shell preserved; owner Google and staff PIN login remain real. |
| Order tracking | `src/app/(public)/[slug]/orders/[orderCode]/track/page.tsx` | `laundryku-UI/src/pages/Track.tsx` | Implemented | Template hero/status/timeline layout uses real order data. |
| Dashboard home | `src/app/(tenant)/[slug]/dashboard/page.tsx` | `laundryku-UI/src/pages/dashboard/DashboardHome.tsx` | Implemented | Template cards and trial banner use real subscription and query data. |
| Services | `src/app/(tenant)/[slug]/dashboard/services/page.tsx` | `laundryku-UI/src/pages/dashboard/Services.tsx` | Implemented | Template shell and real CRUD manager are wired with live service data. |
| Staff | `src/app/(tenant)/[slug]/dashboard/staff/page.tsx` | `laundryku-UI/src/pages/dashboard/Staff.tsx` | Implemented | Template shell and real staff/free-tier manager are wired with live staff data. |
| Customers | `src/app/(tenant)/[slug]/dashboard/customers/page.tsx` | `laundryku-UI/src/pages/dashboard/Customers.tsx` | Implemented | Template search/list structure uses real customer data. |
| Settings org | `src/app/(tenant)/[slug]/dashboard/settings/page.tsx` | `laundryku-UI/src/pages/dashboard/SettingsOrg.tsx` | Implemented | Template settings tabs are Next-native; real store settings manager remains wired. |
| Settings branch | `src/app/(tenant)/[slug]/dashboard/settings/branch/page.tsx` | `laundryku-UI/src/pages/dashboard/SettingsBranch.tsx` | Implemented | Template settings tabs are Next-native; real branch manager remains wired. |
| Settings payments | `src/app/(tenant)/[slug]/dashboard/settings/payment-methods/page.tsx` | `laundryku-UI/src/pages/dashboard/SettingsPayments.tsx` | Implemented | Template settings tabs are Next-native; real payment/QRIS manager remains wired. |
| Finance | `src/app/(tenant)/[slug]/dashboard/finance/page.tsx` | `laundryku-UI/src/pages/dashboard/Finance.tsx` | Implemented | Template finance tabs and summary cards use cash-basis `$queryRaw` totals. |
| Expenses | `src/app/(tenant)/[slug]/dashboard/finance/expenses/page.tsx` | `laundryku-UI/src/pages/dashboard/Expenses.tsx` | Implemented | Template finance tabs and expense list use real store-scoped expense data. |
| Income | `src/app/(tenant)/[slug]/dashboard/finance/income/page.tsx` | `laundryku-UI/src/pages/dashboard/Income.tsx` | Implemented | Template finance tabs and income rows use real paid payments. |
| Billing | `src/app/(tenant)/[slug]/dashboard/billing/page.tsx` | `laundryku-UI/src/pages/dashboard/Billing.tsx` | Implemented | Template subscription card and feature grid use real Subscription data. |
| POS | `src/app/(tenant)/[slug]/pos/page.tsx` | `laundryku-UI/src/pages/pos/POS.tsx` | Implemented | Mobile-first 3-step flow uses service cards, quick qty/weight steppers, and payment cards while keeping real staff guard, bootstrap data, and order API. |
| POS orders | `src/app/(tenant)/[slug]/pos/orders/page.tsx` | `laundryku-UI/src/pages/pos/Orders.tsx` | Implemented | Search/filter/list structure uses the production order API and status actions with the same card-forward template language. |
| Receipt | `src/app/(tenant)/[slug]/pos/receipt/[orderCode]/page.tsx` | `laundryku-UI/src/pages/pos/Receipt.tsx` | Implemented | Redirect route uses `[orderCode]`; resource receipt page has template wrapper and real receipt data. |
| Label | `src/app/(tenant)/[slug]/pos/receipt/[orderCode]/label/page.tsx` | `laundryku-UI/src/pages/pos/Label.tsx` | Implemented | Redirect route uses `[orderCode]`; resource label page has template wrapper and real label data. |
