import { z } from "zod";

/**
 * Zod validation schemas for staff management API endpoints.
 */

export const staffRoleSchema = z.enum(["CASHIER", "OPERATOR", "COURIER"]);

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits"),
  role: staffRoleSchema,
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d{6}$/, "PIN must contain only digits"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export const updateStaffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  role: staffRoleSchema.optional(),
  isActive: z.boolean().optional(),
  newPin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d{6}$/, "PIN must contain only digits")
    .optional(),
});

export const staffLoginSchema = z.object({
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits"),
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d{6}$/, "PIN must contain only digits"),
});
