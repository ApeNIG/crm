"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  DashboardData,
  DashboardActivityResponse,
  ActivityFilters,
} from "@/types/dashboard";

const API_BASE = "/api";

// ============================================
// API FETCH FUNCTIONS
// ============================================

// Fetch dashboard data
async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

// Fetch activity feed with pagination
async function fetchActivity(filters: ActivityFilters): Promise<DashboardActivityResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.entityType) params.set("entityType", filters.entityType);

  const res = await fetch(`${API_BASE}/dashboard/activity?${params}`);
  if (!res.ok) throw new Error("Failed to fetch activity feed");
  return res.json();
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Fetch dashboard data with auto-refresh
 * - staleTime: 30 seconds
 * - refetchInterval: 60 seconds
 */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 60 seconds
  });
}

/**
 * Fetch paginated activity feed
 */
export function useDashboardActivity(filters: Omit<ActivityFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["dashboard-activity", filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchActivity({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 30 * 1000, // 30 seconds
  });
}
