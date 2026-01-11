import type {
  Booking,
  Contact,
  ServiceType,
  Enquiry,
  BookingActivity,
  BookingStatus,
  BookingActivityType,
} from "@prisma/client";

// Re-export enums for convenience
export type { BookingStatus, BookingActivityType };

// ============================================
// BOOKING WITH RELATIONS
// ============================================

/**
 * Booking with contact relation
 */
export type BookingWithContact = Booking & {
  contact: Contact;
};

/**
 * Booking with service type relation
 */
export type BookingWithServiceType = Booking & {
  serviceType: ServiceType;
};

/**
 * Booking with all relations for detail view
 */
export type BookingWithAll = Booking & {
  contact: Contact;
  serviceType: ServiceType;
  enquiry: Enquiry | null;
  activities: BookingActivity[];
};

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Paginated list response for bookings
 */
export type BookingListResponse = {
  bookings: (Booking & {
    contact: Contact;
    serviceType: ServiceType;
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================
// QUERY FILTER TYPES
// ============================================

/**
 * Query filters for booking list
 */
export type BookingFilters = {
  search?: string;
  status?: BookingStatus;
  contactId?: string;
  serviceTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

/**
 * Query filters for calendar view
 */
export type CalendarFilters = {
  startDate: string;
  endDate: string;
};

// ============================================
// UI CONFIGURATION TYPES
// ============================================

/**
 * Status metadata for UI display
 * Similar to StageConfig for enquiries
 */
export type StatusConfig = {
  key: BookingStatus;
  label: string;
  color: string;
  bgColor: string;
};

// ============================================
// ACTIVITY PAYLOAD TYPES
// ============================================

/**
 * Payload for BOOKING_CREATED activity
 */
export type BookingCreatedPayload = {
  serviceTypeName: string;
  startAt: string;
};

/**
 * Payload for BOOKING_UPDATED activity
 */
export type BookingUpdatedPayload = {
  changes: Record<string, { from: unknown; to: unknown }>;
};

/**
 * Payload for BOOKING_STATUS_CHANGED activity
 */
export type BookingStatusChangedPayload = {
  from: BookingStatus;
  to: BookingStatus;
};

/**
 * Payload for BOOKING_RESCHEDULED activity
 */
export type BookingRescheduledPayload = {
  previousStartAt: string;
  previousEndAt: string;
  newStartAt: string;
  newEndAt: string;
};

/**
 * Payload for BOOKING_NOTE_ADDED activity
 */
export type BookingNoteAddedPayload = {
  preview: string;
};
