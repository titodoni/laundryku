import { z } from "zod";

/**
 * Zod validation schemas for staff management API endpoints.
 */

export const staffRoleSchema = z.enum(["CASHIER", "OPERATOR", "COURIER"]);

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Nama staf wajib diisi").max(100, "Nama staf terlalu panjang"),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor HP wajib diisi")
    .max(20, "Nomor HP terlalu panjang"),
  role: staffRoleSchema,
  pin: z
    .string()
    .length(6, "PIN harus 6 digit")
    .regex(/^\d{6}$/, "PIN harus berupa 6 digit angka"),
  branchId: z.string().trim().min(1, "Cabang wajib dipilih"),
});

export const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama staf wajib diisi")
    .max(100, "Nama staf terlalu panjang")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor HP wajib diisi")
    .max(20, "Nomor HP terlalu panjang")
    .optional(),
  role: staffRoleSchema.optional(),
  branchId: z.string().trim().min(1, "Cabang wajib dipilih").optional(),
  isActive: z.boolean().optional(),
});

export const resetStaffPinSchema = z.object({
  pin: z
    .string()
    .length(6, "PIN harus 6 digit")
    .regex(/^\d{6}$/, "PIN harus berupa 6 digit angka"),
});

export const staffLoginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Nomor HP wajib diisi")
    .max(20, "Nomor HP terlalu panjang"),
  pin: z
    .string()
    .length(6, "PIN harus 6 digit")
    .regex(/^\d{6}$/, "PIN harus berupa 6 digit angka"),
});
