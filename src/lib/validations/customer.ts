import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Nama pelanggan wajib diisi").max(120, "Nama pelanggan terlalu panjang"),
  phone: z.string().trim().min(8, "Nomor HP wajib diisi").max(24, "Nomor HP tidak valid"),
  notes: z.string().trim().max(500, "Catatan terlalu panjang").optional(),
});
