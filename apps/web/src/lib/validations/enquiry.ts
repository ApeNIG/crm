import { z } from "zod";

// UUID validation helper for path parameters
export const uuidParamSchema = z.string().uuid("Invalid ID format");

export const enquiryStageEnum = z.enum([
  "NEW",
  "AUTO_RESPONDED",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "BOOKED_PAID",
  "LOST",
]);

export const enquiryTypeEnum = z.enum([
  "GENERAL",
  "SERVICE",
  "PRODUCT",
  "PARTNERSHIP",
]);

export const createEnquirySchema = z.object({
  contactId: z.string().uuid("Invalid contact ID"),
  enquiryType: enquiryTypeEnum.optional().default("GENERAL"),
  message: z
    .string()
    .max(5000, "Message is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  preferredDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  preferredTime: z
    .string()
    .max(20, "Time format too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  estimatedValue: z
    .number()
    .min(0, "Value cannot be negative")
    .optional()
    .nullable(),
  stage: enquiryStageEnum.optional().default("NEW"),
  nextActionAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  sourceUrl: z
    .string()
    .url("Invalid URL")
    .max(500, "URL is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
});

export const updateEnquirySchema = createEnquirySchema.partial().omit({
  contactId: true,
});

export const updateEnquiryStageSchema = z.object({
  stage: enquiryStageEnum,
});

export const enquiryQuerySchema = z.object({
  search: z.string().optional(),
  stage: enquiryStageEnum.optional(),
  contactId: z.string().uuid().optional(),
  enquiryType: enquiryTypeEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(100),
});

// Form schema - accepts string inputs from HTML form elements
// All fields are required for type safety with react-hook-form
export const enquiryFormSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  enquiryType: enquiryTypeEnum,
  message: z.string().max(5000, "Message is too long"),
  preferredDate: z.string(),
  preferredTime: z.string().max(20, "Time format too long"),
  estimatedValue: z.string(),
  stage: enquiryStageEnum,
  nextActionAt: z.string(),
  sourceUrl: z.string().max(500, "URL is too long"),
});

export type CreateEnquiryInput = z.output<typeof createEnquirySchema>;
export type UpdateEnquiryInput = z.output<typeof updateEnquirySchema>;
export type UpdateEnquiryStageInput = z.output<typeof updateEnquiryStageSchema>;
export type EnquiryQuery = z.output<typeof enquiryQuerySchema>;
export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
