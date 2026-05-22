import { z } from "zod";

export const updatePaymentMethodSchema = z
  .object({
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.isActive !== undefined, {
    message: "Status metode pembayaran wajib diisi",
    path: ["isActive"],
  });

export const updatePaymentMethodSettingsSchema = z
  .object({
    qrisImageUrl: z.string().trim().url("URL QRIS tidak valid").or(z.literal("")).nullable().optional(),
  })
  .refine((value) => value.qrisImageUrl !== undefined, {
    message: "Gambar QRIS wajib diisi",
    path: ["qrisImageUrl"],
  });

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
export type UpdatePaymentMethodSettingsInput = z.infer<typeof updatePaymentMethodSettingsSchema>;
