"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EnquiryListResponse,
  EnquiryWithAll,
  EnquiryWithContact,
  EnquiryFilters,
  EnquiryStage,
} from "@/types/enquiry";

const API_BASE = "/api";

// Fetch enquiries with filters
async function fetchEnquiries(filters: EnquiryFilters): Promise<EnquiryListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.contactId) params.set("contactId", filters.contactId);
  if (filters.enquiryType) params.set("enquiryType", filters.enquiryType);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`${API_BASE}/enquiries?${params}`);
  if (!res.ok) throw new Error("Failed to fetch enquiries");
  return res.json();
}

// Fetch single enquiry
async function fetchEnquiry(id: string): Promise<EnquiryWithAll> {
  const res = await fetch(`${API_BASE}/enquiries/${id}`);
  if (!res.ok) throw new Error("Failed to fetch enquiry");
  return res.json();
}

// Create enquiry
async function createEnquiry(data: Record<string, unknown>): Promise<EnquiryWithContact> {
  const res = await fetch(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create enquiry");
  }
  return res.json();
}

// Update enquiry
async function updateEnquiry({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}): Promise<EnquiryWithAll> {
  const res = await fetch(`${API_BASE}/enquiries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update enquiry");
  }
  return res.json();
}

// Update enquiry stage (optimized for drag-drop)
async function updateEnquiryStage({
  id,
  stage,
}: {
  id: string;
  stage: EnquiryStage;
}): Promise<{ success: boolean; stage: EnquiryStage; previousStage?: EnquiryStage }> {
  const res = await fetch(`${API_BASE}/enquiries/${id}/stage`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update stage");
  }
  return res.json();
}

// Delete enquiry
async function deleteEnquiry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/enquiries/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete enquiry");
}

// Hooks
export function useEnquiries(filters: EnquiryFilters = {}) {
  return useQuery({
    queryKey: ["enquiries", filters],
    queryFn: () => fetchEnquiries(filters),
  });
}

export function useEnquiry(id: string) {
  return useQuery({
    queryKey: ["enquiry", id],
    queryFn: () => fetchEnquiry(id),
    enabled: !!id,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    },
  });
}

export function useUpdateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEnquiry,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["enquiry", data.id] });
    },
  });
}

export function useUpdateEnquiryStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEnquiryStage,
    // Optimistic update for smooth drag-drop
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["enquiries"] });

      // Snapshot previous value
      const previousEnquiries = queryClient.getQueriesData<EnquiryListResponse>({
        queryKey: ["enquiries"],
      });

      // Optimistically update enquiries list
      queryClient.setQueriesData<EnquiryListResponse>(
        { queryKey: ["enquiries"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            enquiries: old.enquiries.map((enquiry) =>
              enquiry.id === id ? { ...enquiry, stage } : enquiry
            ),
          };
        }
      );

      return { previousEnquiries };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousEnquiries) {
        context.previousEnquiries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    },
  });
}
