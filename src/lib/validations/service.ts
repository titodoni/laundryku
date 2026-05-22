import { z } from "zod";

export const serviceCategorySchema = z.enum(["KILOAN", "SATUAN", "EXPRESS", "ADDON"]);

const baseServiceWriteSchema = z.object({
  name: z.string().trim().min(2, "Nama layanan wajib diisi").max(100),
  category: serviceCategorySchema,
  price: z.coerce.number().int("Harga harus berupa angka bulat").min(0, "Harga tidak boleh negatif"),
  priceMultiplier: z.coerce.number().min(0.1, "Multiplier minimal 0,1").max(10, "Multiplier maksimal 10").nullable().optional(),
  baseServiceId: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createServiceSchema = baseServiceWriteSchema.superRefine((value, ctx) => {
  if (value.category === "EXPRESS") {
    if (!value.baseServiceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["baseServiceId"],
        message: "Layanan express wajib memilih layanan dasar",
      });
    }

    if (value.priceMultiplier == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priceMultiplier"],
        message: "Multiplier express wajib diisi",
      });
    }
  }
});

export const updateServiceSchema = baseServiceWriteSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
