# Phase 1 — Handover

**Completed:** 20 May 2026  
**Status:** ✅ DONE (UI refinement notes pending)

## What's Built

### Auth (`src/lib/auth.ts`)
- Better Auth with Google OAuth (30-day sessions)
- Staff PIN login via custom API (`POST /api/stores/[slug]/staff-login`)
- Rate-limited PIN: 5 attempts → 15-min lockout
- Staff sessions: 7-day expiry (shared POS devices)
- Prisma/Neon runtime hardening on auth path: `DATABASE_URL` stays pooled for app queries, `DIRECT_URL` stays unpooled for CLI, and `src/lib/db.ts` adds fallback `pool_timeout=30` plus `connect_timeout=30` for Neon `-pooler` URLs to reduce `P2024` during auth cold starts or short bursts

### Pages
| Route | File | Status |
|-------|------|--------|
| `/` | `src/app/(public)/page.tsx` | Landing page ✅ |
| `/register` | `src/app/(public)/register/page.tsx` + `register-form.tsx` | Google OAuth ✅ |
| `/onboarding` | `src/app/(public)/onboarding/page.tsx` + `onboarding-form.tsx` | 6-step wizard ✅ |
| `/{slug}` | `src/app/(public)/[slug]/page.tsx` | Public store page ✅ |
| `/{slug}/login` | `src/app/(public)/[slug]/login/page.tsx` + `login-form.tsx` | Owner/Staff login ✅ |
| `/{slug}/dashboard` | `src/app/(tenant)/[slug]/dashboard/page.tsx` | Owner dashboard ✅ |
| `/{slug}/pos` | `src/app/(tenant)/[slug]/pos/page.tsx` | Staff POS shell ✅ |

### API Routes
| Endpoint | File | Description |
|----------|------|-------------|
| `POST /api/auth/[...all]` | `src/app/api/auth/[...all]/route.ts` | Better Auth handler |
| `POST /api/stores` | `src/app/api/stores/route.ts` | Create store (atomically: Store + Branch + Subscription + Services + PaymentMethods + Staff) |
| `POST /api/stores/[slug]/staff-login` | `src/app/api/stores/[slug]/staff-login/route.ts` | Staff PIN login with rate limit |
| `POST /api/upload` | `src/app/api/upload/route.ts` | Logo/QRIS image upload (Vercel Blob) |

### Key Libraries
- `src/lib/auth.ts` — Better Auth config + `createStaffSession()`
- `src/lib/auth-client.ts` — Better Auth client
- `src/lib/validations/store.ts` — Zod schemas for store creation
- `src/lib/db.ts` — Prisma client singleton + Neon pooled runtime timeout fallback
- `src/lib/db-guard.ts` — Tenant-scoped query helper
- `src/lib/rate-limit.ts` — Rate limiter (used by staff-login)
- `src/lib/phone.ts` — Phone normalization
- `src/lib/slug.ts` — Slug generation

## UI Refinement Notes (TODO)

The following need polish — functional but not production-ready:

1. **Styling consistency** — Check all pages against the UI Kit reference (`Laundryku UI Kit/`):
   - Color palette, spacing, font sizes should match
   - Missing `.tap-target` and `.receipt-paper` CSS classes in some components
2. **Onboarding wizard** — Mobile responsiveness needs review
3. **Landing page** — Hero section CTA alignment, feature card hover states
4. **Dashboard** — Empty state skeleton when no store exists yet
5. **POS page** — Only shell exists; full implementation in Phase 3
6. **Error/success toasts** — Missing sonner toast integration in some forms
7. **Loading states** — Some buttons lack loading spinners during async ops

## DONE Gate Checklist
- [x] Owner register via Google → onboarding → dashboard
- [x] Staff PIN login → POS
- [x] Staff PIN lockout after 5 failed attempts
- [x] `/{slug}` 404 for unknown slugs
- [x] `npx tsc --noEmit` passes (0 errors)

## Env Vars Required
```
DATABASE_URL, DIRECT_URL — Neon
BETTER_AUTH_SECRET, BETTER_AUTH_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
BLOB_READ_WRITE_TOKEN — Vercel Blob (⚠️ set to Public access, see upload route)
```

## Next Phase
→ **Phase 2** — Services CRUD, Staff Management, Settings
