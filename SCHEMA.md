# SCHEMA.md — Laundryku Database Schema
**Version:** 1.0 (Final)  
**Updated:** 20 May 2026  
**ORM:** Prisma  
**DB:** Neon PostgreSQL

---

## AGENT INSTRUCTIONS
- Copy the Prisma schema block below directly into `prisma/schema.prisma`.
- Run `npx prisma generate` + `npx prisma db push` after any change.
- Never remove `storeId` scoping from any model — it is the tenant isolation boundary.
- All `id` fields use `cuid()` unless noted otherwise.
- Soft delete pattern: use `deletedAt DateTime?` — never hard delete Orders, Customers, Payments, or Expenses.
- `createdAt` and `updatedAt` are required on every model.
- **DO NOT run `npm run build`** — it will timeout on tsx checks. Run `npx tsc --noEmit` instead.

---

## Entity Relationship Overview

```
Store (1)
  ├── Branch (many)
  ├── StaffMember (many)
  ├── Customer (many)
  ├── Service (many)
  │     └── ServicePrice (many)
  ├── PaymentMethod (many)
  ├── Order (many)
  │     ├── OrderItem (many)
  │     └── Payment (many)
  ├── Expense (many)
  ├── Subscription (1)
  │     └── Invoice (many)
  ├── OrderCounter (1 per branch per day)
  └── ActivityLog (many)

User (1)
  └── StaffMember (many, one per branch assignment)

MidtransWebhookLog (standalone audit table)
PinAttempt (rate limiting)
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma
// AGENT: Copy this entire block. Do not modify field names without updating PRD.md.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────
// AUTH & USERS — Better Auth manages sessions/accounts
// Better Auth requires these exact model names and fields.
// ─────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  phone         String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  staffMembers  StaffMember[]
  ownedStores   Store[]   @relation("StoreOwner")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id           String    @id @default(cuid())
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ─────────────────────────────────────────
// STORE (TENANT)
// Single source of truth for plan status is Subscription.
// Store itself has no planType or status field.
// ─────────────────────────────────────────

model Store {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  ownerId         String
  phone           String?
  whatsappPhone   String?   // for WA chat button on tracking
  address         String?
  logoUrl         String?   // Vercel Blob URL
  qrisImageUrl    String?   // QRIS static image URL
  defaultSlaHours Int       @default(24)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  owner           User              @relation("StoreOwner", fields: [ownerId], references: [id])
  branches        Branch[]
  staffMembers    StaffMember[]
  customers       Customer[]
  services        Service[]
  paymentMethods  PaymentMethod[]
  orders          Order[]
  payments        Payment[]
  expenses        Expense[]
  subscription    Subscription?
  activityLogs    ActivityLog[]

  @@index([slug])
}

// ─────────────────────────────────────────
// BRANCH
// ─────────────────────────────────────────

model Branch {
  id             String        @id @default(cuid())
  storeId        String
  name           String
  code           String        // short code for order number, e.g. "MLT"
  address        String?
  phone          String?
  isActive       Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  store          Store         @relation(fields: [storeId], references: [id], onDelete: Cascade)
  staffMembers   StaffMember[]
  orders         Order[]
  expenses       Expense[]
  orderCounters  OrderCounter[]

  @@unique([storeId, code])
  @@index([storeId])
}

// ─────────────────────────────────────────
// STAFF MEMBER
// Links a User to a Branch with a role.
// Staff login uses PIN stored in StaffMember.pinHash (bcrypt).
// ─────────────────────────────────────────

enum StaffRole {
  CASHIER
  OPERATOR
  COURIER
}

model StaffMember {
  id             String       @id @default(cuid())
  userId         String
  storeId        String
  branchId       String
  role           StaffRole
  pinHash        String?      // bcrypt hash for staff PIN login
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  store          Store        @relation(fields: [storeId], references: [id], onDelete: Cascade)
  branch         Branch       @relation(fields: [branchId], references: [id], onDelete: Cascade)
  orders         Order[]      @relation("CashierOrders")

  @@unique([userId, branchId])
  @@index([storeId])
  @@index([branchId])
}

// ─────────────────────────────────────────
// CUSTOMER
// Anonymous — no login, no user account.
// ─────────────────────────────────────────

model Customer {
  id             String       @id @default(cuid())
  storeId        String
  name           String
  phone          String       // normalized: 62xxxxxxxxxx
  notes          String?
  tags           String[]     @default([])
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  store          Store        @relation(fields: [storeId], references: [id], onDelete: Cascade)
  orders         Order[]

  @@unique([storeId, phone])
  @@index([storeId])
}

// ─────────────────────────────────────────
// SERVICES & PRICING
// ─────────────────────────────────────────

enum ServiceCategory {
  KILOAN
  SATUAN
  EXPRESS
  ADDON
}

model Service {
  id              String          @id @default(cuid())
  storeId         String
  name            String
  category        ServiceCategory
  baseServiceId   String?         // for EXPRESS: FK to the KILOAN service to multiply
  isActive        Boolean         @default(true)
  sortOrder       Int             @default(0)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  store           Store           @relation(fields: [storeId], references: [id], onDelete: Cascade)
  baseService     Service?        @relation("ExpressBaseService", fields: [baseServiceId], references: [id])
  expressServices Service[]       @relation("ExpressBaseService")
  prices          ServicePrice[]
  orderItems      OrderItem[]

  @@index([storeId])
}

model ServicePrice {
  id              String   @id @default(cuid())
  serviceId       String
  price           Int      // IDR, no decimals — base price
  priceMultiplier Float?   // for EXPRESS category: 1.5 = 1.5x kiloan price
  minQuantity     Float?
  conditions      String?
  isDefault       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  service         Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────

enum PaymentType {
  CASH
  TRANSFER
  QRIS
}

model PaymentMethod {
  id             String        @id @default(cuid())
  storeId        String
  name           String        // e.g. "Tunai", "BCA Transfer", "QRIS"
  type           PaymentType
  isActive       Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  store          Store         @relation(fields: [storeId], references: [id], onDelete: Cascade)
  payments       Payment[]

  @@index([storeId])
}

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────

enum OrderStatus {
  RECEIVED
  WASHING
  DRYING
  IRONING
  PACKING
  READY
  PICKED_UP
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

model Order {
  id                    String        @id @default(cuid())
  storeId               String
  branchId              String
  customerId            String?       // null = walk-in
  cashierId             String?       // StaffMember who created the order
  orderNumber           String        @unique
  status                OrderStatus   @default(RECEIVED)
  paymentStatus         PaymentStatus @default(UNPAID)
  totalAmount           Int           // IDR
  paidAmount            Int           @default(0)
  remainingAmount       Int           @default(0)
  notes                 String?
  estimatedReadyAt      DateTime?     // based on Store.defaultSlaHours
  completedAt           DateTime?
  packagingLabelPrinted Boolean       @default(false)
  cancelledAt           DateTime?     // set when CANCELLED
  cancelReason          String?       // optional reason
  settledAt             DateTime?     // set when PARTIAL → PAID
  deletedAt             DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  store                 Store         @relation(fields: [storeId], references: [id], onDelete: Cascade)
  branch                Branch        @relation(fields: [branchId], references: [id], onDelete: Restrict)
  customer              Customer?     @relation(fields: [customerId], references: [id])
  cashier               StaffMember?  @relation("CashierOrders", fields: [cashierId], references: [id])
  items                 OrderItem[]
  payments              Payment[]

  @@index([storeId])
  @@index([branchId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  @@index([storeId, createdAt])
  @@index([storeId, branchId, status, createdAt])
  @@index([storeId, paymentStatus, createdAt])
  @@index([branchId, status, createdAt])
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  serviceId String
  quantity  Int      // kiloan: grams (3500 = 3.5kg), satuan: count
  unitPrice Int      // price snapshot at time of order (IDR per kg or per item)
  subtotal  Int
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Restrict)
}

// ─────────────────────────────────────────
// ORDER COUNTER — Atomic, race-safe order number generation
// Replaces Serializable transaction approach.
// ─────────────────────────────────────────

model OrderCounter {
  id        String   @id @default(cuid())
  branchId  String
  date      String   // YYMMDD format, e.g. "260519"
  seq       Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@unique([branchId, date])
}

// ─────────────────────────────────────────
// PAYMENTS — Cash basis accounting
// Revenue = SUM of Payment.amount WHERE status = PAID
// Negative amount = refund (order cancellation)
// ─────────────────────────────────────────

model Payment {
  id                    String         @id @default(cuid())
  storeId               String
  orderId               String
  paymentMethodId       String?        // FK to PaymentMethod — derive type from relation
  amount                Int            // IDR (negative for refunds)
  status                PaymentStatus  @default(PAID)
  midtransTransactionId String?
  paidAt                DateTime?
  notes                 String?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  store                 Store          @relation(fields: [storeId], references: [id], onDelete: Cascade)
  order                 Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  paymentMethod         PaymentMethod? @relation(fields: [paymentMethodId], references: [id])

  @@index([storeId])
  @@index([storeId, createdAt])
  @@index([orderId])
  @@index([createdAt])
}

// ─────────────────────────────────────────
// EXPENSES — Finance module
// Cash basis: reduces net profit when recorded.
// ─────────────────────────────────────────

enum ExpenseCategory {
  ELECTRICITY
  WATER
  FRAGRANCE
  PACKAGING
  SALARY
  OPERATIONAL
}

model Expense {
  id             String          @id @default(cuid())
  storeId        String
  branchId       String?         // null = store-level expense
  category       ExpenseCategory
  amount         Int             // IDR
  description    String?
  expenseDate    DateTime        // the date the expense occurred
  recordedById   String?         // User.id
  deletedAt      DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  store          Store           @relation(fields: [storeId], references: [id], onDelete: Cascade)
  branch         Branch?         @relation(fields: [branchId], references: [id])

  @@index([storeId])
  @@index([storeId, expenseDate])
  @@index([branchId])
}

// ─────────────────────────────────────────
// SUBSCRIPTION & BILLING — Single source of truth for plan
// Store's planType and status live HERE, not on Store model.
// ─────────────────────────────────────────

enum PlanType {
  FREE
  PRO
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  LIMITED
  CANCELLED
}

model Subscription {
  id                  String             @id @default(cuid())
  storeId             String             @unique
  planType            PlanType           @default(FREE)
  status              SubscriptionStatus @default(TRIALING)
  startAt             DateTime           @default(now())
  trialEndsAt         DateTime?
  nextChargeAt        DateTime?
  cancelledAt         DateTime?
  reminder7DaySentAt  DateTime?
  reminder1DaySentAt  DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  store               Store              @relation(fields: [storeId], references: [id], onDelete: Cascade)
  invoices            Invoice[]
}

enum InvoiceStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}

model Invoice {
  id                String        @id @default(cuid())
  subscriptionId    String
  amount            Int           // IDR
  currency          String        @default("IDR")
  status            InvoiceStatus @default(PENDING)
  midtransOrderId   String?       @unique
  midtransInvoiceId String?
  snapToken         String?
  paidAt            DateTime?
  dueAt             DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  subscription      Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
}

// ─────────────────────────────────────────
// MIDTRANS WEBHOOK LOG — Standalone audit
// ─────────────────────────────────────────

model MidtransWebhookLog {
  id         String   @id @default(cuid())
  rawPayload Json
  orderId    String?
  status     String?
  processed  Boolean  @default(false)
  error      String?
  receivedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([orderId])
}

// ─────────────────────────────────────────
// PIN ATTEMPT — Persistent rate limiting for staff PIN login
// ─────────────────────────────────────────

model PinAttempt {
  id        String    @id @default(cuid())
  phone     String
  branchId  String
  attempts  Int       @default(0)
  lockedAt  DateTime?
  resetAt   DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([phone, branchId])
  @@index([phone])
}

// ─────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────

model ActivityLog {
  id             String   @id @default(cuid())
  storeId        String
  actorType      String   // "user", "staff", "system"
  actorId        String?
  actorName      String?
  action         String   // e.g. "order.status_changed", "payment.received"
  targetType     String?
  targetId       String?
  details        Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  store          Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@index([storeId])
  @@index([actorId])
  @@index([createdAt])
}
```

---

## Index Strategy Notes

| Table | Key Indexes | Reason |
|-------|-------------|--------|
| Store | slug | Lookup on every request |
| Order | storeId | Tenant isolation |
| Order | branchId | Branch-scoped queries |
| Order | orderNumber | Customer tracking lookup |
| Order | status | Status filtering |
| Order | createdAt | Time-based queries |
| Order | storeId + createdAt | Daily order count for free tier |
| Order | storeId + branchId + status + createdAt | POS dashboard: orders by branch and status |
| Order | storeId + paymentStatus + createdAt | Receivables and finance queries |
| Order | branchId + status + createdAt | Branch-level POS order list |
| Customer | storeId + phone (unique) | POS search |
| Payment | orderId | Order payment lookup |
| Payment | createdAt | Finance revenue queries |
| Expense | storeId | Tenant isolation |
| Expense | storeId + expenseDate | Finance date-range queries |
| Expense | branchId | Branch-level expense queries |
| ActivityLog | storeId, actorId, createdAt | Dashboard activity feed |
| MidtransWebhookLog | orderId | Webhook dedup |
| OrderCounter | branchId + date (unique) | Atomic order number gen |

---

## Seed Data Structure

```typescript
// prisma/seed.ts
// 1. Create owner User
// 2. Create Store { slug: "demo-laundry", whatsappPhone: "6281234567890" }
// 3. Create Branch { code: "DML", name: "Demo Branch" }
// 4. Create Subscription { status: TRIALING, trialEndsAt: now() + 7 days }
// 5. Create default Services:
//    - Cuci Kiloan (KILOAN, Rp7000/kg, min 2kg)
//    - Express (EXPRESS, multiplier 1.5 — 1.5x kiloan price)
//    - Jaket (SATUAN, Rp25000/item)
//    - Parfum (ADDON, Rp3000)
// 6. Create PaymentMethods: Tunai (CASH), Transfer BCA (TRANSFER), QRIS (QRIS)
// 7. Create 1 StaffMember (CASHIER role, PIN: 123456)
// 8. Create 5 sample Customers
// 9. Create 3 sample Orders in various statuses
// 10. Create 5 sample Expenses across different categories
```

---

## Migration Notes

- Always use `npx prisma migrate dev --name <description>` for local schema changes.
- Use `npx prisma db push` only for rapid prototyping — not for production.
- Production migrations: `npx prisma migrate deploy` in Vercel build step.
- **DO NOT run `npx prisma migrate reset`** on production.
- **DO NOT run `npm run build`** — use `npx tsc --noEmit` for type checking. Build is done manually by owner.
