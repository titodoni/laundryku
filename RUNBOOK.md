# RUNBOOK.md — Laundryku Manual Build Guide
**Version:** 2.0 (Final)  
**Updated:** 20 May 2026  
**For:** Solo founder running commands manually, terminal by terminal.

> Jalankan semua command dari **root folder project** kecuali ada instruksi lain.
> **GUNAKAN npm, BUKAN pnpm.** Semua command pnpm di doc lama sudah diganti npm.
> **JANGAN jalankan `npm run build`** — bakal timeout di tsx check. Owner jalankan build manual.
> Centang `[ ]` setelah tiap langkah selesai.
> Jangan lanjut ke phase berikutnya sebelum **DONE GATE** lolos semua.

---

## Persiapan Awal (Sebelum Phase 0)

```bash
node --version       # harus >= 18
npm --version        # harus >= 9
git --version
```

Akun yang harus siap:
- [ ] **GitHub** — repo baru `laundryku` (private)
- [ ] **Neon** — buat project di neon.tech, catat connection string
- [ ] **Google Cloud Console** — buat OAuth 2.0 credentials
- [ ] **Vercel** — hubungkan ke GitHub
- [ ] **Midtrans** — akun sandbox aktif
- [ ] **Resend** — akun di resend.com
- [ ] **Vercel Blob** — aktifkan di Vercel dashboard

---

## Phase 0 — Project Bootstrap

**Tujuan:** Repo jalan di lokal, database terkoneksi, routing dasar bekerja.

### STEP 0.1 — Buat Project Next.js

```bash
npx create-next-app@latest laundryku \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint

cd laundryku
```

- [ ] Selesai

### STEP 0.2 — Init Git + Push ke GitHub

```bash
git init
git add .
git commit -m "init: next.js 14 app router"
git remote add origin https://github.com/USERNAME/laundryku.git
git branch -M main
git push -u origin main
```

- [ ] Selesai

### STEP 0.3 — Install Semua Dependencies

```bash
# Core
npm install prisma @prisma/client
npm install better-auth
npm install zod
npm install bcryptjs
npm install lucide-react
npm install recharts
npm install sonner
npm install qrcode.react
npm install midtrans-client
npm install resend
npm install @vercel/blob
npm install date-fns

# Radix UI
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select

# Utilities
npm install class-variance-authority clsx tailwind-merge

# Dev only
npm install -D @types/bcryptjs @types/node tsx
```

- [ ] Selesai

### STEP 0.4 — Setup shadcn/ui

```bash
npx shadcn-ui@latest init
```

Jawab prompt: Style = **Default**, Base color = **Neutral**, CSS variables = **Yes**

```bash
npx shadcn-ui@latest add button input dialog sheet tabs badge skeleton table avatar separator select
```

- [ ] Selesai

### STEP 0.5 — Setup Prisma

```bash
npx prisma init
```

Sekarang **copy seluruh Prisma schema** dari `SCHEMA.md` ke `prisma/schema.prisma`.

- [ ] Schema dicopy lengkap

### STEP 0.6 — Setup Environment Variables

```bash
touch .env.local
```

Isi `.env.local`:

```
# Neon
DATABASE_URL="postgresql://USER:PASS@HOST/laundryku?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@HOST/laundryku?sslmode=require"

# Google OAuth
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# Better Auth
BETTER_AUTH_SECRET="isi-dengan-random-string-di-bawah"

# Midtrans Sandbox
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxx"

# Resend
RESEND_API_KEY="re_xxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate `BETTER_AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Buat `.env.example` (key tanpa value):
```bash
cp .env.local .env.example
# Edit .env.example, hapus semua nilai
echo ".env.local" >> .gitignore
```

- [ ] `.env.local` terisi semua
- [ ] `.env.example` ada tanpa nilai
- [ ] `.env.local` masuk `.gitignore`

### STEP 0.7 — Buat Folder Structure

```bash
mkdir -p src/app/\(public\)
mkdir -p src/app/\(tenant\)/\[slug\]/dashboard/finance/expenses
mkdir -p src/app/\(tenant\)/\[slug\]/dashboard/finance/income
mkdir -p src/app/\(tenant\)/\[slug\]/orders/\[orderNumber\]/receipt
mkdir -p src/app/\(tenant\)/\[slug\]/orders/\[orderNumber\]/label
mkdir -p src/app/api/stores/\[slug\]/finance
mkdir -p src/app/api/auth
mkdir -p src/app/api/webhooks
mkdir -p src/app/api/cron
mkdir -p src/app/api/upload
mkdir -p src/lib/validations
mkdir -p src/lib
mkdir -p src/components/ui
mkdir -p src/components/pos
mkdir -p src/components/dashboard
mkdir -p src/components/finance
mkdir -p src/hooks
mkdir -p src/types
```

- [ ] Selesai

### STEP 0.8 — Push Schema ke Neon

```bash
npx prisma db push
npx prisma generate
```

Cek dengan Prisma Studio:
```bash
npx prisma studio
# Buka http://localhost:5555
```

- [ ] `db push` berhasil
- [ ] Prisma Studio menampilkan semua tabel

### STEP 0.9 — Google OAuth Redirect URI

Di Google Cloud Console → APIs & Services → Credentials → Edit OAuth Client:

Tambah Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

- [ ] Selesai

### STEP 0.10 — Vercel Blob Setup

Di Vercel dashboard → Storage → Create Blob Store.
Salin `BLOB_READ_WRITE_TOKEN` ke `.env.local`.

- [ ] Blob store dibuat, token disalin

### STEP 0.11 — Cek TypeScript (JANGAN build)

```bash
npx tsc --noEmit   # harus 0 error
npm run dev         # buka http://localhost:3000
```

- [ ] TypeScript 0 error
- [ ] Dev server jalan

```bash
git add . && git commit -m "phase-0: bootstrap complete" && git push
```

### ✅ DONE GATE Phase 0
- [ ] `npm run dev` jalan tanpa error
- [ ] Prisma Studio menampilkan semua tabel
- [ ] `npx tsc --noEmit` = 0 error
- [ ] Semua env vars terisi

---

## Phase 1 — Auth + Store Creation

**Tujuan:** Owner register Google → onboarding (logo + QRIS upload) → dashboard. Staff login PIN.

### STEP 1.1 — Prisma Client Singleton (Node-18-Safe)

Buat `src/lib/db.ts`:
```typescript
import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

Catatan operasional:
- **Wajib** `import "server-only"` — mencegah import dari client component.
- Gunakan **standard PrismaClient**. Jangan pasang `@prisma/adapter-neon` atau `@neondatabase/serverless` — package itu butuh Node >=19 dan menyebabkan runtime crash.
- Jangan panggil `neonConfig.webSocketConstructor` — WebSocket global tidak tersedia di Node 18.
- App runtime harus tetap memakai `DATABASE_URL` pooled dari Neon (hostname mengandung `-pooler`). `DIRECT_URL` unpooled dipakai untuk migration dan Prisma CLI saja.
- Di `.env`, pastikan `DATABASE_URL` pakai pooled connection:
  ```
  DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.r1.neon.tech/db?sslmode=require&connection_limit=1&pool_timeout=20"
  DIRECT_URL="postgresql://user:pass@ep-xxx.r1.neon.tech/db?sslmode=require"
  ```
  `connection_limit=1` mencegah pool exhaustion. `pool_timeout=20` timeout jika koneksi penuh.
- Logging query Prisma jangan dipaksa aktif setiap saat. Aktifkan hanya saat debugging lewat `PRISMA_LOG_QUERIES=true`.

- [ ] Selesai

### STEP 1.2 — Setup Better Auth

```bash
npm install @better-auth/prisma-adapter
```

Buat `src/lib/auth.ts` dengan:
- Google OAuth provider
- Prisma adapter
- Session: httpOnly cookie, persistent

Buat `src/app/api/auth/[...all]/route.ts`.

Referensi: https://better-auth.com/docs/adapters/prisma

Test:
```bash
# Buka http://localhost:3000/api/auth/signin
# Harus muncul response JSON
```

- [ ] Auth route merespons
- [ ] Google OAuth popup muncul saat diklik

### STEP 1.3 — File Upload API (Logo + QRIS)

Buat `src/app/api/upload/route.ts` (POST):
```typescript
import { put, del } from "@vercel/blob"

// Terima: FormData dengan field "file" + optional "oldUrl"
// Validasi: type image/*, max 2MB
// Upload ke Vercel Blob (put dulu)
// Jika oldUrl ada: del(oldUrl) setelah upload sukses (cegah blob orphan + data loss)
// Return: { url }
```

Test:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/test-image.jpg"
```

- [ ] Upload API bekerja, return URL

### STEP 1.4 — Halaman Register

Buat `src/app/(public)/register/page.tsx`:
- Tombol "Masuk dengan Google"
- Redirect logic: user dengan store → `/{slug}/dashboard`, user baru → `/onboarding`

- [ ] `/register` bisa dibuka
- [ ] Google login bekerja → redirect ke `/onboarding`

### STEP 1.5 — Onboarding Wizard (6 Step)

Buat `src/app/(public)/onboarding/page.tsx`:

**Step 1 — Profil Laundry:**
- Input nama laundry → auto-generate slug → preview URL
- Logo upload (opsional): drag & drop
- Panggil `/api/upload`, simpan URL di state

**Step 2 — Cabang Pertama:**
- Nama cabang, alamat, nomor telepon

**Step 3 — Layanan & Harga:**
- Tambah minimal 1 layanan (nama, kategori, harga)
- Express = multiplier (e.g., 1.5x)

**Step 4 — Metode Pembayaran:**
- Toggle: Tunai | Transfer | QRIS
- Jika QRIS aktif: upload gambar QRIS via `/api/upload`

**Step 5 — Tambah Staf (opsional):**
- Nama, nomor HP, role, PIN 6 digit
- Tombol "Lewati"

**Step 6 — Konfirmasi:**
- Summary semua data
- Tombol "Buat Laundry Saya"

Buat API `POST /api/stores`:
```typescript
// Validasi: slug unik, owner belum punya store
// Buat dalam 1 $transaction:
//   - Store (logoUrl, qrisImageUrl, whatsappPhone)
//   - Branch (code dari singkatan nama)
//   - Subscription (TRIALING, trialEndsAt = now + 7 hari)
//   - PaymentMethod (3 default, isActive sesuai pilihan)
//   - Services (jika ada dari step 3)
//   - StaffMember + User + Account (jika ada)
// Return: { slug }
```

- [ ] Wizard 6 step berjalan
- [ ] Logo upload bekerja
- [ ] QRIS upload bekerja
- [ ] Submit → semua data terbuat di DB
- [ ] Redirect ke `/{slug}/dashboard`

### STEP 1.6 — Store Public Home

Buat `src/app/(public)/[slug]/page.tsx`:
- Logo store, nama, alamat, telepon
- 3 tombol: Login Pemilik, Login Staf, Lacak Cucian
- `notFound()` jika slug tidak ada di DB

- [ ] `/{slug}` tampil dengan data store
- [ ] Unknown slug → 404

### STEP 1.7 — Login Page + Staff PIN API (Custom)

Buat `src/app/(public)/[slug]/login/page.tsx`:
- Tab: **Pemilik** (Google) | **Staf** (Phone + PIN)

Buat `src/app/api/stores/[slug]/staff-login/route.ts` (POST):
```typescript
// Custom staff PIN login (bypasses Better Auth credential plugin)
// Input: { phone, pin }  // slug from path param
// 1. checkRateLimit(phone, branchId) — PinAttempt table
// 2. Find StaffMember by phone + storeId
// 3. bcrypt.compare(pin, StaffMember.pinHash)
// 4. Create session via auth.api.createSession()
// 5. clearAttempts(phone, branchId) on success
// Return: session cookie + redirect
```

Generate bcrypt hash untuk test:
```bash
node -e "const b = require('bcryptjs'); b.hash('123456', 10).then(console.log)"
```

Buat 1 staff test di Prisma Studio.

- [ ] Staff login dengan PIN → session terbuat → redirect ke `/pos`
- [ ] PIN salah 6x → locked 15 menit (persistent, bukan in-memory)

### STEP 1.8 — Utility Libraries

Buat file-file berikut di `src/lib/`:

**`phone.ts`** — normalizePhone() + formatPhoneDisplay()
```typescript
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("0")) return "62" + digits.slice(1)
  if (digits.startsWith("62")) return digits
  if (digits.startsWith("8")) return "62" + digits
  return "62" + digits
}
```

**`slug.ts`** — generateSlug() + findUniqueSlug()
```typescript
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
```
Handle P2002 unique constraint error → retry with counter.

**`db-guard.ts`** — storeScope() helper
```typescript
export function storeScope(storeId: string) {
  return { storeId }
}
```

- [ ] Semua utility library selesai

### STEP 1.9 — Auth Middleware

Buat `src/middleware.ts`:
- `/{slug}/dashboard/*` → owner only
- `/{slug}/pos*` → staff only
- Redirect ke `/{slug}/login` jika tidak ada session
- Inject header: x-slug, x-store-id, x-user-id, x-user-role

- [ ] Dashboard tanpa login → redirect
- [ ] POS tanpa login → redirect

### ✅ DONE GATE Phase 1
- [ ] Register → onboarding (logo + QRIS) → dashboard end-to-end
- [ ] Staff login PIN bekerja (custom API)
- [ ] Unknown slug → 404
- [ ] `npx tsc --noEmit` = 0 error

```bash
git add . && git commit -m "phase-1: auth + store + uploads" && git push
```

---

## Phase 2 — Services, Staff & Settings

**Tujuan:** Owner konfigurasi layanan, staf, metode pembayaran, dan profil store.

### STEP 2.1 — Dashboard Shell Layout

Buat `src/app/(tenant)/[slug]/dashboard/layout.tsx`:
- Sidebar: Beranda, Pesanan, Pelanggan, Staf, Layanan, Keuangan, Pengaturan, Langganan
- Trial banner jika TRIALING
- Auth guard
- Mobile: bottom navigation

- [ ] Sidebar tampil dengan item "Keuangan"
- [ ] Trial banner muncul

### STEP 2.2 — Services CRUD

Buat `src/app/(tenant)/[slug]/dashboard/services/page.tsx`:
- List layanan dengan kategori badge, harga, toggle aktif, multiplier (Express)
- Modal form tambah/edit

API:
```
GET  /api/stores/[slug]/services
POST /api/stores/[slug]/services
PATCH /api/stores/[slug]/services/[id]
DELETE /api/stores/[slug]/services/[id] → isActive = false
```

- [ ] CRUD layanan bekerja (termasuk multiplier untuk Express)

### STEP 2.3 — Staff Management

Buat `src/app/(tenant)/[slug]/dashboard/staff/page.tsx`:
- List staf dengan role badge
- Form tambah: nama, HP, role (cashier/operator/courier), PIN
- Reset PIN (owner only)
- Toggle aktif/nonaktif
- Free tier guard: jika staffCount >= 1 AND FREE → blokir + CTA upgrade

API:
```
GET  /api/stores/[slug]/staff
POST /api/stores/[slug]/staff → cek free tier limit
PATCH /api/stores/[slug]/staff/[id]
POST /api/stores/[slug]/staff/[id]/reset-pin
```

Catatan implementasi saat ini:
- Owner-only, resolve store dari slug server-side, tidak pernah percaya `storeId` dari client.
- PIN staf selalu di-hash dengan `bcryptjs`; `pinHash` tidak pernah dikirim ke frontend.
- Trial (`TRIALING`) tetap full access; limit staf gratis berlaku untuk plan Free non-Pro setelah trial.
- Guard limit staf ada di frontend dan backend, termasuk saat mengaktifkan kembali staf nonaktif.
- Tombol `Aktifkan` harus nonaktif di UI saat limit staf gratis sudah tercapai, dengan pesan: `Batas staf gratis tercapai. Upgrade ke Pro untuk mengaktifkan staf tambahan.`
- Label plan/status dan copy dashboard untuk owner harus tampil penuh dalam Bahasa Indonesia, bukan enum mentah.
- Path create/update staf sudah dipendekkan agar tidak timeout di interactive transaction Neon.

- [x] Tambah staf bekerja
- [x] Free tier memblokir staf ke-2

### STEP 2.4 — Payment Methods

Buat `src/app/(tenant)/[slug]/dashboard/settings/payment-methods/page.tsx`:
- Toggle tiap metode
- Upload/ganti gambar QRIS

API:
```
GET  /api/stores/[slug]/payment-methods
PATCH /api/stores/[slug]/payment-methods/[id]
PATCH /api/stores/[slug] → update qrisImageUrl
```

- [ ] Toggle metode bekerja
- [ ] QRIS image bisa diganti

### STEP 2.5 — Branch Settings

Buat `src/app/(tenant)/[slug]/dashboard/settings/branch/page.tsx`:
- Edit: nama, kode cabang, alamat, telepon, nomor WhatsApp
- Nomor WhatsApp: format 62xxxxxxxxxx

```
PATCH /api/stores/[slug]/branches/[id]
```

- [ ] Form branch tersimpan termasuk WhatsApp number

### STEP 2.6 — Store Settings

Buat `src/app/(tenant)/[slug]/dashboard/settings/page.tsx`:
- Edit nama store
- Logo: tampilkan current + tombol "Ganti Logo"
- **SLA default** (defaultSlaHours) — input number, beri tooltip "Estimasi waktu selesai pesanan (jam)"

```
PATCH /api/stores/[slug]
```

- [ ] Store settings termasuk SLA bisa diubah

### ✅ DONE GATE Phase 2
- [x] Services CRUD bekerja dengan multiplier Express
- [x] Staf tambah + PIN bekerja
- [x] Free tier blokir staf ke-2
- [x] QRIS + Logo re-upload bekerja
- [x] WhatsApp number dan SLA tersimpan
- [x] `npx tsc --noEmit` = 0 error

### Catatan Implementasi Phase 2
- **Upload security:** Setiap upload wajib menyertakan `purpose` (`qris`, `store-logo`, dll). Upload QRIS/logo store butuh session owner + slug yang valid. Hapus blob lama hanya milik store yang sama.
- **DB connection:** Menggunakan standard PrismaClient singleton + `server-only` guard. Tidak pakai Neon adapter. Node-18-safe.
- **Risiko tersisa:** Neon cold start (~500ms), connection_limit mungkin perlu dinaikkan di production tinggi.

```bash
git add . && git commit -m "phase-2: services, staff, settings" && git push
```

---

## Phase 3 — POS Flow

**Tujuan:** Staff buat order → receipt → packaging label.

### STEP 3.1 — POS Shell

Buat `src/app/(tenant)/[slug]/pos/page.tsx`:
- Auth guard (staff session)
- Top bar: nama cabang, nama staf, logout
- Mobile-first, 2-panel desktop

- [ ] `/pos` tampil dan terlindungi

### STEP 3.2 — Customer Search

Buat `src/components/pos/CustomerSearch.tsx`:
- Input search HP/nama
- Dropdown hasil
- "Pelanggan Umum" di atas list
- Tambah customer baru inline

API:
```
GET  /api/stores/[slug]/customers?q=
POST /api/stores/[slug]/customers
```

- [ ] Search dan tambah customer bekerja

### STEP 3.3 — Service Grid & Order Builder

Buat `src/components/pos/ServiceGrid.tsx`:
- Tab: Kiloan | Satuan | Express | Tambahan
- Grid touch-optimized
- Tap → input berat/qty → tambah ke order
- Express: tampilkan harga = kiloanBasePrice × multiplier

Buat `src/components/pos/OrderSummary.tsx`:
- List item, subtotal per item, total
- Hapus item, notes input

- [ ] Grid layanan + order summary bekerja
- [ ] Express price = kiloan × multiplier

### STEP 3.4 — Payment Step

Buat `src/components/pos/PaymentStep.tsx`:
- Radio: Lunas | DP | Belum Bayar
- Method selector
- Kalkulasi kembalian / sisa DP
- Tampilkan QRIS image jika metode QRIS dipilih

- [ ] Payment step bekerja

### STEP 3.5 — Order Creation API

Buat `src/app/api/stores/[slug]/orders/route.ts` (POST):

```typescript
// Validasi:
// 1. Session valid + staff akses branch
// 2. Subscription: canCreateOrder() → daily free tier check
// 3. Semua serviceId milik store ini
// 4. Hitung total server-side (jangan percaya client)
// 5. Express: hitung price = kiloanPrice × multiplier
// 6. generateOrderNumber() → atomic OrderCounter upsert
// 7. Set estimatedReadyAt = order.createdAt + store.defaultSlaHours
// 8. $transaction: Order + OrderItems + Payment (jika paid/DP) + ActivityLog
```

- [ ] Order terbuat dengan format nomor `MLT-260519-001` (atomic counter)
- [ ] Free tier blokir order ke-11
- [ ] Express price = multiplier × base price
- [ ] estimatedReadyAt = createdAt + defaultSlaHours

### STEP 3.6 — Receipt Page

Buat `src/app/(tenant)/[slug]/orders/[orderNumber]/receipt/page.tsx`:
- Logo store, nama, alamat
- Nomor order (font-mono, teal)
- Tabel item, total, pembayaran
- QR code → tracking URL
- 3 tombol: "Cetak Struk" | "Cetak Label" | "Buat Pesanan Baru"

Print CSS di `globals.css`:
```css
@media print {
  .no-print { display: none !important; }
  body { background: white; color: black; }
}
```

- [ ] Struk tampil dengan QR code
- [ ] Cetak Struk → browser print dialog

### STEP 3.7 — Packaging Label

Buat `src/app/(tenant)/[slug]/orders/[orderNumber]/label/page.tsx`:

```
┌─────────────────────────┐
│ MLT-260519-001          │
│ Budi Santoso            │
│ 0812-3456-7890          │
├─────────────────────────┤
│ Kiloan: 3kg             │
│ Express (1.5x)          │
├─────────────────────────┤
│ Masuk : 19 Mei 2026     │
│ Estimasi: 20 Mei 2026   │
└─────────────────────────┘
```

```css
@media print {
  @page { size: 80mm auto; margin: 4mm; }
}
```

Setelah label di-render:
```
POST /api/stores/[slug]/orders/[id]/label-printed
```

- [ ] Label page tampil compact
- [ ] Cetak Label → format label paper
- [ ] `packagingLabelPrinted = true` tersimpan di DB

### STEP 3.8 — Order Status Updates

Buat `src/app/(tenant)/[slug]/pos/orders/page.tsx`:
- List order hari ini, filter status
- Tap → modal update status

API:
```
PATCH /api/stores/[slug]/orders/[id]/status
→ Validasi transisi valid
→ Update status + timestamp
→ Log ActivityLog
```

Valid transitions:
```
RECEIVED → WASHING → DRYING → IRONING → PACKING → READY → PICKED_UP
* → CANCELLED (dari status apapun selain PICKED_UP/DELIVERED)
```

- [ ] Status update bekerja sesuai pipeline
- [ ] Transisi invalid ditolak

### STEP 3.8B — DP Settlement

- [ ] Button "Pelunasan DP" pada PARTIAL order cards
- [ ] Modal: show remaining amount, payment method selector, confirm
- [ ] API: `POST /api/stores/[slug]/orders/[id]/settle`
- [ ] Set `settledAt` ketika PARTIAL → PAID

### STEP 3.8C — Order Cancellation

- [ ] Button "Batalkan Pesanan" di order detail modal
- [ ] Confirmation dialog
- [ ] API: `POST /api/stores/[slug]/orders/[id]/cancel`
- [ ] Set `cancelledAt`, `cancelReason`, `deletedAt`
- [ ] Negative Payment record for refund

### ✅ DONE GATE Phase 3
- [ ] Order cycle lengkap: buat → bayar → receipt → label → status
- [ ] Format nomor order `MLT-260519-001` (atomic counter)
- [ ] Express price = multiplier × base price
- [ ] Free tier blokir order ke-11
- [ ] QR code di struk benar
- [ ] Label print compact
- [ ] DP settlement + cancellation bekerja
- [ ] `packagingLabelPrinted` tersimpan
- [ ] `npx tsc --noEmit` = 0 error

### Phase 3 Verification Order

Jalankan verifikasi Phase 3 dalam urutan ini:

```bash
npx tsc --noEmit
npm run verify:phase3
npm run smoke:phase3:db
```

Kriteria lulus saat ini:
- `npx tsc --noEmit` selesai tanpa error.
- `npm run verify:phase3` mencetak `phase3 logic ok`.
- `npm run smoke:phase3:db` mencetak `phase3 db smoke ok`.

### Phase 3 Known Working Routes

User-facing:
- `/{slug}/pos`
- `/{slug}/pos/orders`
- `/{slug}/orders/[orderNumber]/receipt`
- `/{slug}/orders/[orderNumber]/label`

Internal API:
- `GET /api/stores/[slug]/customers?q=`
- `POST /api/stores/[slug]/customers`
- `GET /api/stores/[slug]/orders?today=1&status=...`
- `POST /api/stores/[slug]/orders`
- `PATCH /api/stores/[slug]/orders/[id]/status`
- `POST /api/stores/[slug]/orders/[id]/settle`
- `POST /api/stores/[slug]/orders/[id]/cancel`
- `POST /api/stores/[slug]/orders/[id]/label-printed`

### Phase 3 Smoke Evidence
- Real order number berhasil dibuat dengan format atomic counter, contoh `S07-260522-001`.
- Total order berhasil dihitung dan dipersist, contoh `Rp 45.500`.
- Smoke Neon dev DB lulus untuk create order, progress update, pelunasan DP, dan refund pembatalan.
- QR code di receipt sudah mengarah ke contract route `/{slug}/orders/{orderCode}/track`; render halaman tracking tetap pekerjaan Phase 4.

### Rollback Advice
- Jangan rewrite logika POS/order yang sudah jalan jika `npx tsc --noEmit`, `npm run verify:phase3`, dan `npm run smoke:phase3:db` masih lulus.
- Jika regression muncul, rollback secara sempit ke route atau helper Phase 3 yang gagal, bukan dengan mengganti ulang seluruh alur POS.

```bash
git add . && git commit -m "phase-3: pos + receipt + label + settlement" && git push
```

---

## Phase 4 — Customer Tracking + Analytics

**Tujuan:** Customer lacak order (dengan tombol WA). Owner lihat analytics.

### STEP 4.1 — Customer Tracking Page

Buat `src/app/(public)/[slug]/orders/[orderCode]/track/page.tsx`:
- Timeline status vertikal, pulse animation di status saat ini
- Accordion "Lihat Detail Pesanan"
- Badge status pembayaran
- Banner hijau jika status = READY
- **Tombol WA**: `https://wa.me/{store.whatsappPhone}?text=...`
- Rate limited: 30 req/min/IP

API:
```
GET /api/stores/[slug]/orders/[orderCode]/track?phone=62xxxx
→ Walk-in: no phone validation
→ Has customer: validate phone match
→ Return sanitized data (no internal IDs)
```

- [ ] Tracking tampil dengan timeline
- [ ] Walk-in order bisa dilacak tanpa phone
- [ ] Phone salah → pesan generik
- [ ] READY banner muncul
- [ ] WA button muncul jika store.whatsappPhone ada

### STEP 4.2 — Analytics Dashboard

Buat `src/app/(tenant)/[slug]/dashboard/page.tsx`:
- Free tier: hanya data hari ini
- Pro tier: full history

Metric cards:
- Pendapatan Hari Ini (cash basis = PAID payments)
- Pesanan Aktif
- Siap Diambil
- Pesanan Belum Lunas

API:
```
GET /api/stores/[slug]/analytics
→ Free tier: enforce today only
→ Pro: range sesuai params
```

- [ ] 4 metric cards tampil dengan data benar
- [ ] Free tier: hanya today
- [ ] Pro tier: full range

### STEP 4.3 — Customer List

Buat `src/app/(tenant)/[slug]/dashboard/customers/page.tsx`:
- Tabel: nama, HP, total order, terakhir order
- Search input
- Klik → halaman detail customer

- [ ] List + search customer bekerja

### ✅ DONE GATE Phase 4
- [ ] Customer tracking + WA button bekerja
- [ ] Walk-in tracking tanpa phone
- [ ] Rate limit tracking aktif
- [ ] Analytics today untuk Free, full untuk Pro
- [ ] `npx tsc --noEmit` = 0 error

```bash
git add . && git commit -m "phase-4: tracking + analytics" && git push
```

---

## Phase 4A — Finance & Accounting Module

**Tujuan:** Owner punya kontrol keuangan penuh: cash basis P&L.

### STEP 4A.1 — Finance Helper Library

Buat `src/lib/finance.ts`:
```typescript
// Cash basis: revenue = SUM of Payment.amount WHERE status = PAID
// Receivables = informational only (tidak masuk P&L)
// NOTE: Semua aggregation query HARUS pakai Prisma $queryRaw agar komputasi di PostgreSQL.
// Jangan fetch banyak row lalu reduce di JS — lambat di serverless.
export async function getRevenue(storeId, start, end, branchId?)
export async function getExpenses(storeId, start, end, branchId?)
export async function getNetProfit(storeId, start, end, branchId?)
export async function getReceivables(storeId)
export function getDateRange(subscription, start?, end?)
```

- [ ] `src/lib/finance.ts` dibuat

### STEP 4A.2 — Finance Dashboard Page

Buat `src/app/(tenant)/[slug]/dashboard/finance/page.tsx`:

Top row — 4 metric cards:
```
Saldo Kas Hari Ini | Pendapatan | Pengeluaran | Laba Bersih
```

Receivables section:
```
Total Piutang: Rp XXX.XXX (informational)
DP Belum Lunas: Rp XXX.XXX (informational)
```

Free tier: today only, blur history + upgrade CTA
Pro tier: date range picker + branch filter

API:
```
GET /api/stores/[slug]/finance/summary
```

- [ ] Finance dashboard tampil

### STEP 4A.3 — Expense Tracking

Buat `src/app/(tenant)/[slug]/dashboard/finance/expenses/page.tsx`:
- Tabel: tanggal, kategori badge, nominal, keterangan
- Filter: kategori + tanggal
- Tombol "Catat Pengeluaran" → modal form

API:
```
GET    /api/stores/[slug]/finance/expenses
POST   /api/stores/[slug]/finance/expenses
PATCH  /api/stores/[slug]/finance/expenses/[id]
DELETE /api/stores/[slug]/finance/expenses/[id] → soft delete
```

- [ ] CRUD expense bekerja

### STEP 4A.4 — Income Ledger

Buat `src/app/(tenant)/[slug]/dashboard/finance/income/page.tsx`:
- Tabel read-only: payments dengan data order + customer
- Filter: tanggal + metode

API:
```
GET /api/stores/[slug]/finance/income
```

- [ ] Income ledger tampil

### STEP 4A.5 — CSV Export (Pro Only)

Buat `src/app/api/stores/[slug]/finance/export/route.ts` (GET):
- Free tier → 403
- Pro → return CSV file

- [ ] Export CSV bekerja untuk Pro
- [ ] Free tier → 403

### STEP 4A.6 — Verifikasi Konsistensi

Manual test:
```
Revenue analytics = revenue finance untuk tanggal yang sama (cash basis)
```

- [ ] Revenue analytics = revenue finance

### ✅ DONE GATE Phase 4A
- [ ] Finance dashboard tampil semua metrik
- [ ] Cash basis: revenue = PAID payments only
- [ ] Add expense → laba bersih berkurang
- [ ] CSV export untuk Pro, blocked untuk Free
- [ ] Revenue konsisten dengan analytics
- [ ] `npx tsc --noEmit` = 0 error

```bash
git add . && git commit -m "phase-4a: finance and accounting module" && git push
```

---

## Phase 5 — Billing (Midtrans Snap)

**Tujuan:** Owner upgrade ke Pro. Webhook diproses. Trial + limit dijalankan.

### STEP 5.1 — Setup Midtrans Client

Buat `src/lib/midtrans.ts`:
```typescript
import midtransClient from "midtrans-client"

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})
```

- [ ] Selesai

### STEP 5.2 — Halaman Billing

Buat `src/app/(tenant)/[slug]/dashboard/billing/page.tsx`:
- Status card: TRIALING (amber) / ACTIVE (green) / LIMITED (red)
- Pro features list + Rp65.000/bulan
- Tombol "Upgrade ke Pro" / "Perpanjang"
- Tabel riwayat invoice

- [ ] Halaman billing tampil

### STEP 5.3 — Create Payment API

Buat `src/app/api/stores/[slug]/billing/create-payment/route.ts` (POST):
```typescript
// 1. Buat Invoice di DB (PENDING)
// 2. Panggil Midtrans Snap
// 3. Simpan snapToken
// 4. Return { snapToken }
```

Frontend:
```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />
```

Handler:
```typescript
const res = await fetch(`/api/stores/${slug}/billing/create-payment`, { method: "POST" })
const { snapToken } = await res.json()
window.snap.pay(snapToken, {
  onSuccess: () => router.refresh(),
  onPending: () => router.refresh(),
  onError: (err) => console.error(err),
})
```

- [ ] Klik upgrade → Snap popup muncul
- [ ] Invoice PENDING terbuat

### STEP 5.4 — Midtrans Webhook Handler

Buat `src/app/api/webhooks/midtrans/route.ts` (POST):

```typescript
// LANGKAH 1: Log raw payload
// LANGKAH 2: Validasi SHA512 signature
// LANGKAH 3: Find invoice → subscription → store → owner
// LANGKAH 4: Settlement → update Invoice PAID + Subscription ACTIVE
//             (tidak update Store — Subscription adalah SSOT)
// LANGKAH 5: Email confirmation (fire-and-forget)
// LANGKAH 6: Return 200
```

**PERHATIAN:** Webhook handler harus traverse `invoice → subscription → store → owner`.
Jangan pake variabel yang tidak didefine.

Test dengan ngrok:
```bash
ngrok http 3000
# Set URL webhook di Midtrans sandbox: https://xxxx.ngrok.io/api/webhooks/midtrans
```

- [ ] Webhook signature valid
- [ ] Settlement → Subscription jadi PRO
- [ ] Log tersimpan di MidtransWebhookLog
- [ ] Email terkirim

### STEP 5.5 — Plan Guard

Buat `src/lib/plan-guard.ts`:
```typescript
// canCreateOrder(storeId) → cek subscription status + daily count
// canAddStaff(storeId) → cek staff count + plan
// isPro(storeId) → subscription.planType === "PRO" && status === "ACTIVE"
// getDateRange(storeId) → Free: today only, Pro: full range
```

- [ ] Plan guard menghubungkan semua enforcement points

### STEP 5.6 — Cron: Daily Subscription Check

Buat `src/app/api/cron/check-subscriptions/route.ts` (GET):
```typescript
// 1. TRIALING + trialEndsAt < now → LIMITED
// 2. ACTIVE + nextChargeAt < now - 3 days → PAST_DUE
// 3. PAST_DUE + nextChargeAt < now - 6 days → LIMITED
// 4. Kirim 7-day reminder (deduped via reminder7DaySentAt)
// 5. Kirim 1-day reminder (deduped via reminder1DaySentAt)
```

Buat `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/check-subscriptions", "schedule": "0 18 * * *" }
  ]
}
```

Test:
```bash
curl http://localhost:3000/api/cron/check-subscriptions
```

- [ ] Cron endpoint bekerja
- [ ] Trial expired → LIMITED

### STEP 5.7 — Email Reminder

Buat `src/lib/email.ts`:
```typescript
import { Resend } from "resend"
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRenewalReminder(to, name, daysLeft, slug)
export async function sendPaymentConfirmationEmail(to, name, slug)
```

- [ ] Email reminder terkirim

### ✅ DONE GATE Phase 5
- [ ] Upgrade → Snap popup → bayar sandbox → Subscription jadi PRO
- [ ] Plan guard enforcement bekerja
- [ ] Webhook signature valid + log tersimpan
- [ ] Trial expired → LIMITED
- [ ] `npx tsc --noEmit` = 0 error

```bash
git add . && git commit -m "phase-5: billing + midtrans + enforcement" && git push
```

---

## Phase 6 — Polish, Testing & Deploy

### STEP 6.0 — Healthcheck + Admin

```typescript
// src/app/api/health/route.ts
// GET → DB ping, return { ok: true, db: "connected" }

// src/app/api/admin/route.ts
// GET → protected by ADMIN_SECRET
// Return: total stores, MRR, failed webhooks, last 10 signups
```

- [ ] Healthcheck endpoint siap
- [ ] Admin endpoint siap

### STEP 6.1 — Error Handling + Loading

- [ ] Semua API return `{ success, data?, error? }`
- [ ] Loading skeleton di semua halaman utama
- [ ] `src/app/error.tsx` — global error boundary
- [ ] `src/app/not-found.tsx` — custom 404

### STEP 6.2 — Security Checklist

- [ ] Dua browser dengan akun store berbeda → coba akses API store lain → harus 403
- [ ] Finance API: semua query scoped ke `storeId`
- [ ] Tracking: phone mismatch → no data leak
- [ ] Webhook signature check aktif
- [ ] Rate limiting PIN aktif
- [ ] Tracking API rate limit aktif
- [ ] Tidak ada hardcoded secret di kode

### STEP 6.3 — Performance

```bash
# Chrome DevTools → Lighthouse → Performance (Slow 4G)
# Target: POS TTI < 2s
# Target: Finance summary API < 500ms
```

### STEP 6.4 — Deploy ke Vercel

**Setup Vercel:**
```bash
npm install -g vercel
vercel login
vercel
```

**Set env vars di Vercel dashboard** (production values):
```
DATABASE_URL           → Neon PRODUCTION (pooled)
DIRECT_URL             → Neon PRODUCTION (unpooled)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
BETTER_AUTH_SECRET
MIDTRANS_SERVER_KEY    → Production key
MIDTRANS_CLIENT_KEY    → Production key
MIDTRANS_IS_PRODUCTION → true
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY → Production key
BLOB_READ_WRITE_TOKEN
RESEND_API_KEY
NEXT_PUBLIC_APP_URL    → https://laundryku.app
CRON_SECRET
SENTRY_DSN
SENTRY_AUTH_TOKEN
ADMIN_SECRET
```

**Build command** di `package.json`:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**Catatan:** build command hanya jalan di Vercel. Owner trigger manual via push ke main. JANGAN jalankan `npm run build` di lokal.

**Update Google OAuth redirect URI:**
```
https://laundryku.app/api/auth/callback/google
```

**Update Midtrans webhook URL:**
```
https://laundryku.app/api/webhooks/midtrans
```

**Domain setup:**
```
laundryku.app           A       76.76.21.21
www.laundryku.app       CNAME   cname.vercel-dns.com
mail.laundryku.app      TXT     Resend SPF/DKIM
```

**Run migration di production:**
```bash
DATABASE_URL="PRODUCTION_POOLED_URL" npx prisma migrate deploy
```

- [ ] Deploy berhasil
- [ ] Build tidak ada error
- [ ] URL production bisa dibuka

### STEP 6.5 — Smoke Test Production

- [ ] Register → onboarding (logo + QRIS upload) → dashboard
- [ ] Add services + staff
- [ ] Staff login PIN → POS
- [ ] Buat order → receipt (QR) + packaging label
- [ ] Express order: cek price = multiplier × base
- [ ] Scan QR → tracking page → WA button
- [ ] Update order status → ready
- [ ] Analytics: today data untuk Free
- [ ] Finance: tambah pengeluaran → laba bersih berkurang
- [ ] Cash basis: revenue = PAID payments only
- [ ] Receivables: tampil sebagai informasi, tidak di P&L
- [ ] Upgrade Pro (sandbox) → finance + analytics full history unlock
- [ ] Export CSV setelah Pro
- [ ] Free tier: order ke-11 diblokir
- [ ] Free tier: staf ke-2 diblokir
- [ ] Finance revenue = analytics revenue

### ✅ DONE GATE Phase 6
- [ ] Semua smoke test ✓
- [ ] Tidak ada console error di production
- [ ] Midtrans webhook bekerja (sandbox)
- [ ] Finance + analytics konsisten

```bash
git add . && git commit -m "phase-6: polish + deploy" && git push
```

---

## 🎉 v1 Live!

---

## Quick Reference Commands

```bash
# Dev
npm run dev                  # dev server
npx tsc --noEmit             # TypeScript check (JANGAN npm run build)
npx prisma studio            # DB GUI

# Database
npx prisma db push           # push schema (dev only)
npx prisma migrate dev       # buat migration baru
npx prisma migrate deploy    # apply ke production
npx prisma generate          # regenerate client
npx prisma db seed           # jalankan seed

# Deploy
vercel                       # deploy preview
vercel --prod                # deploy production

# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "const b = require('bcryptjs'); b.hash('123456', 10).then(console.log)"
```

## Troubleshooting

| Problem | Solusi |
|---------|--------|
| `prisma db push` gagal | Cek `DATABASE_URL` di `.env.local`, pastikan Neon aktif |
| Google OAuth redirect error | Cek redirect URI di Google Cloud Console |
| Better Auth session tidak persist | Cek `BETTER_AUTH_SECRET` di env |
| Upload logo/QRIS gagal | Cek `BLOB_READ_WRITE_TOKEN`, pastikan Vercel Blob store aktif |
| Midtrans webhook tidak diterima | Pastikan ngrok aktif, cek URL di Midtrans sandbox |
| Finance ≠ analytics angkanya | Cek query scoping `storeId` + date range |
| TypeScript error Prisma | Jalankan `npx prisma generate` ulang |
| Build Vercel gagal | Cek semua env vars di Vercel dashboard, pastikan build command benar |
| WA button tidak muncul | Cek `store.whatsappPhone` sudah diisi |
| **npm run build timeout** | JANGAN jalankan `npm run build` di lokal. Owner jalankan manual via Vercel |
