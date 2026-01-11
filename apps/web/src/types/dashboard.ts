import type {
  EnquiryStage,
  BookingStatus,
  InvoiceStatus,
} from "@prisma/client";

// ============================================
// DASHBOARD METRICS TYPES
// ============================================

/**
 * Core dashboard metrics
 */
export type DashboardMetrics = {
  totalContacts: number;
  activeEnquiries: number;
  upcomingBookings: number;
  outstandingAmount: number;
  revenueThisMonth: number;
};

// ============================================
// BREAKDOWN TYPES
// ============================================

/**
 * Enquiry counts by stage
 */
export type EnquiryStageBreakdown = {
  stage: EnquiryStage;
  count: number;
};

/**
 * Booking counts by status for today and this week
 */
export type BookingStatusBreakdown = {
  status: BookingStatus;
  todayCount: number;
  weekCount: number;
};

/**
 * Invoice counts and amounts by status
 */
export type InvoiceStatusBreakdown = {
  status: InvoiceStatus;
  count: number;
  totalAmount: number;
};

// ============================================
// ACTIVITY TYPES
// ============================================

/**
 * Entity type for activity items
 */
export type ActivityEntityType = "contact" | "enquiry" | "booking" | "invoice";

/**
 * Unified activity item for dashboard feed
 */
export type DashboardActivityItem = {
  id: string;
  entityType: ActivityEntityType;
  entityId: string;
  type: string;
  description: string;
  href: string;
  createdAt: string;
};

// ============================================
// DASHBOARD DATA RESPONSE
// ============================================

/**
 * Complete dashboard data response from API
 */
export type DashboardData = {
  metrics: DashboardMetrics;
  enquiryBreakdown: EnquiryStageBreakdown[];
  bookingBreakdown: BookingStatusBreakdown[];
  invoiceBreakdown: InvoiceStatusBreakdown[];
  recentActivity: DashboardActivityItem[];
};

// ============================================
// ACTIVITY PAGINATION RESPONSE
// ============================================

/**
 * Paginated activity feed response
 */
export type DashboardActivityResponse = {
  activities: DashboardActivityItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * Activity feed query filters
 */
export type ActivityFilters = {
  page?: number;
  limit?: number;
  entityType?: ActivityEntityType;
};
