ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

CREATE TYPE "OrderStatus" AS ENUM (
  'RECEIVED',
  'PROCESS',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CLOSED',
  'CANCELLED'
);

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Order"
ALTER COLUMN "status" TYPE "OrderStatus"
USING (
  CASE
    WHEN "status"::text IN ('WASHING', 'DRYING', 'IRONING', 'PACKING') THEN 'PROCESS'
    ELSE "status"::text
  END
)::"OrderStatus";

ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';

DROP TYPE "OrderStatus_old";
