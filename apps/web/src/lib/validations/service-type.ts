import { z } from "zod";

// ============================================
// SERVICE TYPE VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a new service type
 */
export const createServiceTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .default(60),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .optional()
    .nullable()
    .transform((v) => v ?? null),
  isActive: z.boolean().default(true),
});

/**
 * Schema for updating an existing service type
 * All fields are optional
 */
export const updateServiceTypeSchema = createServiceTypeSchema.partial();

/**
 * Schema for querying service types
 */
export const serviceTypeQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

/**
 * Form schema for react-hook-form
 * All fields are strings to work with HTML form inputs
 */
export const serviceTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(1000, "Description is too long"),
  durationMinutes: z.string().min(1, "Duration is required"),
  price: z.string(),
  isActive: z.boolean(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CreateServiceTypeInput = z.output<typeof createServiceTypeSchema>;
export type UpdateServiceTypeInput = z.output<typeof updateServiceTypeSchema>;
export type ServiceTypeQuery = z.output<typeof serviceTypeQuerySchema>;
export type ServiceTypeFormValues = z.infer<typeof serviceTypeFormSchema>;
