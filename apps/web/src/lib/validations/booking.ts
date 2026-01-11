import { z } from "zod";

// UUID validation helper for path parameters
export const uuidParamSchema = z.string().uuid("Invalid ID format");

// ============================================
// BOOKING ENUMS
// ============================================

export const bookingStatusEnum = z.enum([
  "REQUESTED",
  "PENDING_DEPOSIT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
]);

export const bookingActivityTypeEnum = z.enum([
  "BOOKING_CREATED",
  "BOOKING_UPDATED",
  "BOOKING_STATUS_CHANGED",
  "BOOKING_RESCHEDULED",
  "BOOKING_NOTE_ADDED",
]);

// ============================================
// BOOKING VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a new booking
 */
export const createBookingSchema = z.object({
  contactId: z.string().uuid("Invalid contact ID"),
  serviceTypeId: z.string().uuid("Invalid service type ID"),
  enquiryId: z
    .string()
    .uuid("Invalid enquiry ID")
    .optional()
    .nullable()
    .transform((v) => v || null),
  startAt: z
    .string()
    .datetime("Invalid start date/time")
    .transform((v) => new Date(v)),
  endAt: z
    .string()
    .datetime("Invalid end date/time")
    .transform((v) => new Date(v)),
  status: bookingStatusEnum.optional().default("REQUESTED"),
  location: z
    .string()
    .max(500, "Location is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  virtualLink: z
    .string()
    .url("Invalid URL format")
    .max(500, "Virtual link is too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .nullable()
    .transform((v) => v || null),
  depositPaid: z.boolean().optional().default(false),
});

/**
 * Schema for updating an existing booking
 * contactId cannot be changed after creation
 */
export const updateBookingSchema = createBookingSchema.partial().omit({
  contactId: true,
});

/**
 * Schema for updating booking status only
 * Optimized for quick status changes
 */
export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
});

/**
 * Schema for querying bookings (list view)
 */
export const bookingQuerySchema = z.object({
  search: z.string().optional(),
  status: bookingStatusEnum.optional(),
  contactId: z.string().uuid().optional(),
  serviceTypeId: z.string().uuid().optional(),
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
 * Schema for calendar view queries
 * Both startDate and endDate are required
 */
export const calendarQuerySchema = z.object({
  startDate: z
    .string()
    .datetime("Invalid start date")
    .transform((v) => new Date(v)),
  endDate: z
    .string()
    .datetime("Invalid end date")
    .transform((v) => new Date(v)),
});

/**
 * Form schema for react-hook-form
 * All fields are strings to work with HTML form inputs
 */
export const bookingFormSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  enquiryId: z.string(),
  startAt: z.string().min(1, "Start date/time is required"),
  endAt: z.string().min(1, "End date/time is required"),
  status: bookingStatusEnum,
  location: z.string().max(500, "Location is too long"),
  virtualLink: z.string().max(500, "Virtual link is too long"),
  notes: z.string().max(5000, "Notes are too long"),
  depositPaid: z.boolean(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CreateBookingInput = z.output<typeof createBookingSchema>;
export type UpdateBookingInput = z.output<typeof updateBookingSchema>;
export type UpdateBookingStatusInput = z.output<typeof updateBookingStatusSchema>;
export type BookingQuery = z.output<typeof bookingQuerySchema>;
export type CalendarQuery = z.output<typeof calendarQuerySchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
