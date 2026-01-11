import { z } from "zod";

// UUID validation helper for path parameters
export const uuidParamSchema = z.string().uuid("Invalid ID format");

// ============================================
// INVOICE ENUMS
// ============================================

export const invoiceStatusEnum = z.enum([
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
  "PARTIALLY_PAID",
]);

export const paymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "STRIPE",
  "OTHER",
]);

export const invoiceActivityTypeEnum = z.enum([
  "INVOICE_CREATED",
  "INVOICE_UPDATED",
  "INVOICE_STATUS_CHANGED",
  "INVOICE_SENT",
  "PAYMENT_RECORDED",
  "PAYMENT_DELETED",
  "LINE_ITEM_ADDED",
  "LINE_ITEM_UPDATED",
  "LINE_ITEM_DELETED",
]);

// ============================================
// LINE ITEM VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a line item
 */
export const createLineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  sortOrder: z.number().int().min(0).optional().default(0),
});

/**
 * Schema for updating a line item
 */
export const updateLineItemSchema = createLineItemSchema.partial();

// ============================================
// PAYMENT VALIDATION SCHEMAS
// ============================================

/**
 * Schema for recording a payment
 */
export const createPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: paymentMethodEnum.optional().default("OTHER"),
  reference: z
    .string()
    .max(200, "Reference is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  paidAt: z
    .string()
    .datetime("Invalid date/time")
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
});

// ============================================
// INVOICE VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a new invoice
 */
export const createInvoiceSchema = z.object({
  contactId: z.string().uuid("Invalid contact ID"),
  bookingId: z
    .string()
    .uuid("Invalid booking ID")
    .optional()
    .nullable()
    .transform((v) => v || null),
  issueDate: z
    .string()
    .datetime("Invalid issue date")
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
  dueDate: z
    .string()
    .datetime("Invalid due date")
    .transform((v) => new Date(v)),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  terms: z
    .string()
    .max(2000, "Terms are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  lineItems: z.array(createLineItemSchema).optional().default([]),
});

/**
 * Schema for updating an existing invoice (DRAFT only)
 */
export const updateInvoiceSchema = z.object({
  issueDate: z
    .string()
    .datetime("Invalid issue date")
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  dueDate: z
    .string()
    .datetime("Invalid due date")
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  terms: z
    .string()
    .max(2000, "Terms are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
});

/**
 * Schema for updating invoice status
 */
export const updateInvoiceStatusSchema = z.object({
  status: invoiceStatusEnum,
});

/**
 * Schema for querying invoices (list view)
 */
export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  status: invoiceStatusEnum.optional(),
  contactId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  dateFrom: z
    .string()
    .datetime()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  dateTo: z
    .string()
    .datetime()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(100),
});

/**
 * Form schema for react-hook-form (invoice)
 * All fields are strings to work with HTML form inputs
 */
export const invoiceFormSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  bookingId: z.string(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.string(),
  notes: z.string().max(2000, "Notes are too long"),
  terms: z.string().max(2000, "Terms are too long"),
});

/**
 * Form schema for react-hook-form (line item)
 */
export const lineItemFormSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
});

/**
 * Form schema for react-hook-form (payment)
 */
export const paymentFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  method: paymentMethodEnum,
  reference: z.string().max(200, "Reference is too long"),
  notes: z.string().max(1000, "Notes are too long"),
  paidAt: z.string(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CreateInvoiceInput = z.output<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.output<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.output<typeof updateInvoiceStatusSchema>;
export type InvoiceQuery = z.output<typeof invoiceQuerySchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export type CreateLineItemInput = z.output<typeof createLineItemSchema>;
export type UpdateLineItemInput = z.output<typeof updateLineItemSchema>;
export type LineItemFormValues = z.infer<typeof lineItemFormSchema>;

export type CreatePaymentInput = z.output<typeof createPaymentSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
