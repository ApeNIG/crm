import { z } from "zod";

export const contactSourceEnum = z.enum([
  "INSTAGRAM",
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "OTHER",
]);

export const contactStatusEnum = z.enum([
  "LEAD",
  "CUSTOMER",
  "PAST_CUSTOMER",
  "COLD",
  "DO_NOT_CONTACT",
]);

export const createContactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .max(50, "Phone number is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  source: contactSourceEnum.optional().default("OTHER"),
  status: contactStatusEnum.optional().default("LEAD"),
  marketingOptIn: z.boolean().optional().default(false),
  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateContactSchema = createContactSchema.partial();

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  status: contactStatusEnum.optional(),
  source: contactSourceEnum.optional(),
  tagId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateContactInput = z.output<typeof createContactSchema>;
export type UpdateContactInput = z.output<typeof updateContactSchema>;
export type ContactQuery = z.output<typeof contactQuerySchema>;
