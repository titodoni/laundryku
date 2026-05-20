import { z } from "zod";

export const defaultServiceSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.enum(["KILOAN", "SATUAN", "EXPRESS", "ADDON"]),
  price: z.coerce.number().int().min(0).max(50_000_000),
  priceMultiplier: z.coerce.number().min(0.1).max(10).optional().nullable(),
});

export const createStoreSchema = z.object({
  store: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/).optional(),
    phone: z.string().min(8).max(20),
    whatsappPhone: z.string().min(8).max(20),
    address: z.string().min(5).max(300),
    logoUrl: z.string().url().optional().or(z.literal("")),
  }),
  branch: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(8).regex(/^[A-Za-z0-9]+$/),
    address: z.string().min(5).max(300),
    phone: z.string().min(8).max(20),
  }),
  services: z.array(defaultServiceSchema).min(1).max(12),
  paymentMethods: z.array(z.enum(["CASH", "TRANSFER", "QRIS"])).min(1),
  qrisImageUrl: z.string().url().optional().or(z.literal("")),
  staff: z
    .object({
      enabled: z.boolean(),
      name: z.string().max(100).optional(),
      phone: z.string().max(20).optional(),
      role: z.enum(["CASHIER", "OPERATOR", "COURIER"]).default("CASHIER"),
      pin: z.string().regex(/^\d{6}$/).optional(),
    })
    .optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
