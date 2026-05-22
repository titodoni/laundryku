import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const TABLES = [
  '"ActivityLog"',
  '"MidtransWebhookLog"',
  '"Invoice"',
  '"Subscription"',
  '"Expense"',
  '"Payment"',
  '"OrderItem"',
  '"OrderCounter"',
  "\"Order\"",
  '"ServicePrice"',
  '"Service"',
  '"PaymentMethod"',
  '"Customer"',
  '"StaffMember"',
  '"Branch"',
  '"Store"',
  '"Session"',
  '"Account"',
  '"PinAttempt"',
  '"Verification"',
  "\"User\"",
] as const;

const COUNT_QUERY = `
  SELECT
    (SELECT COUNT(*) FROM "User")::int AS users,
    (SELECT COUNT(*) FROM "Store")::int AS stores,
    (SELECT COUNT(*) FROM "Branch")::int AS branches,
    (SELECT COUNT(*) FROM "StaffMember")::int AS staff_members,
    (SELECT COUNT(*) FROM "Service")::int AS services,
    (SELECT COUNT(*) FROM "Order")::int AS orders,
    (SELECT COUNT(*) FROM "Session")::int AS sessions
`;

function loadEnvFile(filename: string) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getDatabaseSummary() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tidak ditemukan. Pastikan .env.local tersedia.");
  }

  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, ""),
    username: parsed.username,
  };
}

async function getCounts() {
  const [row] = await prisma.$queryRawUnsafe<
    Array<{
      users: number;
      stores: number;
      branches: number;
      staff_members: number;
      services: number;
      orders: number;
      sessions: number;
    }>
  >(COUNT_QUERY);

  return row;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const confirmed = args.has("--yes");

  const target = getDatabaseSummary();
  const counts = await getCounts();

  console.log("Target database:");
  console.log(`- host: ${target.host}`);
  console.log(`- database: ${target.database}`);
  console.log(`- user: ${target.username}`);
  console.log("Current counts:");
  console.log(`- users: ${counts.users}`);
  console.log(`- stores: ${counts.stores}`);
  console.log(`- branches: ${counts.branches}`);
  console.log(`- staff_members: ${counts.staff_members}`);
  console.log(`- services: ${counts.services}`);
  console.log(`- orders: ${counts.orders}`);
  console.log(`- sessions: ${counts.sessions}`);

  if (dryRun) {
    console.log("Dry run only. No data deleted.");
    return;
  }

  if (!confirmed) {
    console.log("Aborted. Re-run with --yes to delete all registered users and onboarding data.");
    process.exitCode = 1;
    return;
  }

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE;`,
  );

  const after = await getCounts();
  console.log("Reset complete.");
  console.log(`- users: ${after.users}`);
  console.log(`- stores: ${after.stores}`);
  console.log(`- branches: ${after.branches}`);
  console.log(`- staff_members: ${after.staff_members}`);
  console.log(`- services: ${after.services}`);
  console.log(`- orders: ${after.orders}`);
  console.log(`- sessions: ${after.sessions}`);
  console.log("Catatan: file upload di Vercel Blob tidak ikut dihapus.");
}

main()
  .catch((error) => {
    console.error("Reset failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
