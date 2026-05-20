import { z } from "zod";

/**
 * Zod validation schemas for service management API endpoints.
 */

export const serviceCategorySchema = z.enum([
  "KILOAN",
  "SATUAN",
  "EXPRESS",
  "ADDON",
]);

export const createServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: serviceCategorySchema,
  baseServiceId: z.string().nullable().optional(), // for EXPRESS: links to KILOAN service
  price: z
    .number()
    .int("Price must be a whole number (IDR)")
    .min(0, "Price cannot be negative"),
  priceMultiplier: z
    .number()
    .min(1, "Multiplier must be at least 1")
    .max(10, "Multiplier cannot exceed 10x")
    .optional(), // for EXPRESS only
  minQuantity: z.number().min(0).optional(),
  conditions: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  category: serviceCategorySchema.optional(),
  baseServiceId: z.string().nullable().optional(),
  price: z
    .number()
    .int("Price must be a whole number (IDR)")
    .min(0, "Price cannot be negative")
    .optional(),
  priceMultiplier: z
    .number()
    .min(1, "Multiplier must be at least 1")
    .max(10, "Multiplier cannot exceed 10x")
    .optional(),
  minQuantity: z.number().min(0).optional(),
  conditions: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
