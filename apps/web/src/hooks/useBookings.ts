"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  BookingListResponse,
  BookingWithAll,
  BookingFilters,
  CalendarFilters,
} from "@/types/booking";
import type { BookingStatus } from "@prisma/client";

const API_BASE = "/api";

// ============================================
// API FETCH FUNCTIONS
// ============================================

// Fetch bookings with filters
async function fetchBookings(filters: BookingFilters): Promise<BookingListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.contactId) params.set("contactId", filters.contactId);
  if (filters.serviceTypeId) params.set("serviceTypeId", filters.serviceTypeId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`${API_BASE}/bookings?${params}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

// Fetch single booking
async function fetchBooking(id: string): Promise<BookingWithAll> {
  const res = await fetch(`${API_BASE}/bookings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}

// Fetch calendar bookings
type CalendarBookingsResponse = {
  bookings: BookingListResponse["bookings"];
};

async function fetchCalendarBookings(filters: CalendarFilters): Promise<CalendarBookingsResponse> {
  const params = new URLSearchParams();
  params.set("startDate", filters.startDate);
  params.set("endDate", filters.endDate);

  const res = await fetch(`${API_BASE}/bookings/calendar?${params}`);
  if (!res.ok) throw new Error("Failed to fetch calendar bookings");
  return res.json();
}

// Create booking
async function createBooking(data: Record<string, unknown>): Promise<BookingWithAll> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create booking");
  }
  return res.json();
}

// Update booking
async function updateBooking({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}): Promise<BookingWithAll> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update booking");
  }
  return res.json();
}

// Update booking status (optimized for quick updates)
async function updateBookingStatus({
  id,
  status,
}: {
  id: string;
  status: BookingStatus;
}): Promise<{ success: boolean; status: BookingStatus; previousStatus?: BookingStatus }> {
  const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update status");
  }
  return res.json();
}

// Delete booking
async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete booking");
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Fetch paginated booking list with filters
 */
export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => fetchBookings(filters),
  });
}

/**
 * Fetch single booking with all relations
 */
export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  });
}

/**
 * Fetch bookings for calendar view
 */
export function useCalendarBookings(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["calendarBookings", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => fetchCalendarBookings({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    enabled: !!startDate && !!endDate,
  });
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["calendarBookings"] });
    },
  });
}

/**
 * Update an existing booking
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["calendarBookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", data.id] });
    },
  });
}

/**
 * Update booking status with optimistic updates
 * Similar to useUpdateEnquiryStage for smooth UX
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookingStatus,
    // Optimistic update for smooth UX
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookings"] });

      // Snapshot previous value
      const previousBookings = queryClient.getQueriesData<BookingListResponse>({
        queryKey: ["bookings"],
      });

      // Optimistically update bookings list
      queryClient.setQueriesData<BookingListResponse>(
        { queryKey: ["bookings"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            bookings: old.bookings.map((booking) =>
              booking.id === id ? { ...booking, status } : booking
            ),
          };
        }
      );

      return { previousBookings };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        context.previousBookings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["calendarBookings"] });
    },
  });
}

/**
 * Soft delete a booking
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["calendarBookings"] });
    },
  });
}
