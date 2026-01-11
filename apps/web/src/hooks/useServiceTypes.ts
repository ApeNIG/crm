"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ServiceType,
  ServiceTypeListResponse,
  ServiceTypeFilters,
} from "@/types/service-type";
import type {
  CreateServiceTypeInput,
  UpdateServiceTypeInput,
} from "@/lib/validations/service-type";

const API_BASE = "/api";

// Fetch service types with filters
async function fetchServiceTypes(filters: ServiceTypeFilters): Promise<ServiceTypeListResponse> {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`${API_BASE}/service-types?${params}`);
  if (!res.ok) throw new Error("Failed to fetch service types");
  return res.json();
}

// Fetch single service type
async function fetchServiceType(id: string): Promise<ServiceType> {
  const res = await fetch(`${API_BASE}/service-types/${id}`);
  if (!res.ok) throw new Error("Failed to fetch service type");
  return res.json();
}

// Create service type
async function createServiceType(data: CreateServiceTypeInput): Promise<ServiceType> {
  const res = await fetch(`${API_BASE}/service-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create service type");
  }
  return res.json();
}

// Update service type
async function updateServiceType({
  id,
  data,
}: {
  id: string;
  data: UpdateServiceTypeInput;
}): Promise<ServiceType> {
  const res = await fetch(`${API_BASE}/service-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update service type");
  }
  return res.json();
}

// Delete service type
async function deleteServiceType(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/service-types/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete service type");
}

// Hooks
export function useServiceTypes(filters: ServiceTypeFilters = {}) {
  return useQuery({
    queryKey: ["serviceTypes", filters],
    queryFn: () => fetchServiceTypes(filters),
  });
}

export function useServiceType(id: string) {
  return useQuery({
    queryKey: ["serviceType", id],
    queryFn: () => fetchServiceType(id),
    enabled: !!id,
  });
}

export function useCreateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTypes"] });
    },
  });
}

export function useUpdateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateServiceType,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["serviceTypes"] });
      queryClient.invalidateQueries({ queryKey: ["serviceType", data.id] });
    },
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTypes"] });
    },
  });
}
