import type {
  Enquiry,
  Contact,
  EnquiryActivity,
  EnquiryStage,
  EnquiryType,
  EnquiryActivityType,
} from "@prisma/client";

// Re-export enums for convenience
export type { EnquiryStage, EnquiryType, EnquiryActivityType };

// Enquiry with relations
export type EnquiryWithContact = Enquiry & {
  contact: Contact;
};

export type EnquiryWithActivities = Enquiry & {
  activities: EnquiryActivity[];
};

export type EnquiryWithAll = Enquiry & {
  contact: Contact;
  activities: EnquiryActivity[];
};

// API response types
export type EnquiryListResponse = {
  enquiries: EnquiryWithContact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Grouped by stage for Kanban view
export type EnquiriesByStage = {
  [K in EnquiryStage]: EnquiryWithContact[];
};

// Query filters
export type EnquiryFilters = {
  search?: string;
  stage?: EnquiryStage;
  contactId?: string;
  enquiryType?: EnquiryType;
  page?: number;
  limit?: number;
};

// Stage metadata for UI
export type StageConfig = {
  key: EnquiryStage;
  label: string;
  color: string;
  bgColor: string;
  dotColor?: string; // Hex color for dot indicator
};
