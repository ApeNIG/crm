import type {
  Invoice,
  Contact,
  Booking,
  ServiceType,
  InvoiceLineItem,
  Payment,
  InvoiceActivity,
  InvoiceStatus,
  InvoiceActivityType,
  PaymentMethod,
} from "@prisma/client";

// Re-export enums for convenience
export type { InvoiceStatus, InvoiceActivityType, PaymentMethod };

// ============================================
// INVOICE WITH RELATIONS
// ============================================

/**
 * Invoice with contact relation
 */
export type InvoiceWithContact = Invoice & {
  contact: Contact;
};

/**
 * Invoice with booking relation (for list views)
 */
export type InvoiceWithBooking = Invoice & {
  booking: (Booking & { serviceType: ServiceType }) | null;
};

/**
 * Invoice with all relations for detail view
 */
export type InvoiceWithAll = Invoice & {
  contact: Contact;
  booking: (Booking & { serviceType: ServiceType }) | null;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  activities: InvoiceActivity[];
};

/**
 * Invoice for list view (includes key relations)
 */
export type InvoiceListItem = Invoice & {
  contact: Contact;
  booking: (Booking & { serviceType: ServiceType }) | null;
  _count: {
    lineItems: number;
    payments: number;
  };
};

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Paginated list response for invoices
 */
export type InvoiceListResponse = {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================
// QUERY FILTER TYPES
// ============================================

/**
 * Query filters for invoice list
 */
export type InvoiceFilters = {
  search?: string;
  status?: InvoiceStatus;
  contactId?: string;
  bookingId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

// ============================================
// UI CONFIGURATION TYPES
// ============================================

/**
 * Status metadata for UI display
 */
export type InvoiceStatusConfig = {
  key: InvoiceStatus;
  label: string;
  color: string;
  bgColor: string;
};

/**
 * Payment method metadata for UI display
 */
export type PaymentMethodConfig = {
  key: PaymentMethod;
  label: string;
  icon?: string;
};

// ============================================
// ACTIVITY PAYLOAD TYPES
// ============================================

/**
 * Payload for INVOICE_CREATED activity
 */
export type InvoiceCreatedPayload = {
  invoiceNumber: string;
  contactName: string;
  total: string;
};

/**
 * Payload for INVOICE_UPDATED activity
 */
export type InvoiceUpdatedPayload = {
  changes: Record<string, { from: unknown; to: unknown }>;
};

/**
 * Payload for INVOICE_STATUS_CHANGED activity
 */
export type InvoiceStatusChangedPayload = {
  from: InvoiceStatus;
  to: InvoiceStatus;
};

/**
 * Payload for INVOICE_SENT activity
 */
export type InvoiceSentPayload = {
  sentAt: string;
};

/**
 * Payload for PAYMENT_RECORDED activity
 */
export type PaymentRecordedPayload = {
  amount: string;
  method: PaymentMethod;
  reference?: string;
};

/**
 * Payload for PAYMENT_DELETED activity
 */
export type PaymentDeletedPayload = {
  amount: string;
  method: PaymentMethod;
};

/**
 * Payload for LINE_ITEM_ADDED activity
 */
export type LineItemAddedPayload = {
  description: string;
  total: string;
};

/**
 * Payload for LINE_ITEM_UPDATED activity
 */
export type LineItemUpdatedPayload = {
  description: string;
  changes: Record<string, { from: unknown; to: unknown }>;
};

/**
 * Payload for LINE_ITEM_DELETED activity
 */
export type LineItemDeletedPayload = {
  description: string;
  total: string;
};

// ============================================
// CALCULATION TYPES
// ============================================

/**
 * Invoice calculation result
 */
export type InvoiceCalculation = {
  subtotal: number;
  taxAmount: number;
  total: number;
  amountDue: number;
};

/**
 * Line item for calculation
 */
export type LineItemCalculation = {
  quantity: number;
  unitPrice: number;
  total: number;
};
