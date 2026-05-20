import { z } from "zod";

/**
 * Zod validation schemas for expense and finance API endpoints.
 */

export const expenseCategorySchema = z.enum([
  "ELECTRICITY",
  "WATER",
  "FRAGRANCE",
  "PACKAGING",
  "SALARY",
  "OPERATIONAL",
]);

export const createExpenseSchema = z.object({
  category: expenseCategorySchema,
  amount: z
    .number()
    .int("Amount must be a whole number (IDR)")
    .min(1, "Amount must be greater than 0"),
  expenseDate: z.coerce.date(),
  description: z.string().max(500).optional(),
  branchId: z.string().nullable().optional(),
});

export const updateExpenseSchema = z.object({
  category: expenseCategorySchema.optional(),
  amount: z
    .number()
    .int("Amount must be a whole number (IDR)")
    .min(1, "Amount must be greater than 0")
    .optional(),
  expenseDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
  branchId: z.string().nullable().optional(),
});

export const financeSummarySchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  branchId: z.string().optional(),
});

export const exportFinanceSchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  branchId: z.string().optional(),
});
