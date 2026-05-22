import { z } from "zod";

export const updateBranchSchema = z.object({
  name: z.string().trim().min(2, "Nama cabang wajib diisi").max(100, "Nama cabang terlalu panjang"),
  address: z.string().trim().max(300, "Alamat terlalu panjang").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Nomor HP terlalu panjang").optional().or(z.literal("")),
  code: z
    .string()
    .trim()
    .min(2, "Kode cabang wajib diisi")
    .max(8, "Kode cabang terlalu panjang")
    .regex(/^[A-Za-z0-9]+$/, "Kode cabang hanya boleh huruf dan angka"),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
