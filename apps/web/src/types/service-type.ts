import type { ServiceType } from "@prisma/client";

// Re-export Prisma type for convenience
export type { ServiceType };

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Paginated list response for service types
 */
export type ServiceTypeListResponse = {
  serviceTypes: ServiceType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================
// QUERY FILTER TYPES
// ============================================

/**
 * Query filters for service type list
 */
export type ServiceTypeFilters = {
  isActive?: boolean;
  page?: number;
  limit?: number;
};
