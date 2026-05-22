import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { requireStaffRouteAccess, serializeCustomer } from "@/lib/pos";
import { createCustomerSchema } from "@/lib/validations/customer";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = query ? normalizePhone(query) : "";

  const customers = await db.customer.findMany({
    where: {
      storeId: accessResult.access.storeId,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: normalizedQuery } },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 8,
  });

  return NextResponse.json({
    success: true,
    data: {
      customers: customers.map(serializeCustomer),
    },
  });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const parsed = createCustomerSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data pelanggan belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const phone = normalizePhone(parsed.data.phone);

  const existing = await db.customer.findFirst({
    where: {
      storeId: accessResult.access.storeId,
      phone,
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        error: "Nomor HP pelanggan sudah terdaftar",
      },
      { status: 409 },
    );
  }

  const customer = await db.customer.create({
    data: {
      storeId: accessResult.access.storeId,
      name: parsed.data.name.trim(),
      phone,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      customer: serializeCustomer(customer),
    },
  });
}
