"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ContactListResponse,
  ContactWithAll,
  ContactFilters,
} from "@/types/contact";
import type { Tag } from "@prisma/client";

const API_BASE = "/api";

// Fetch contacts with filters
async function fetchContacts(filters: ContactFilters): Promise<ContactListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.tagId) params.set("tagId", filters.tagId);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`${API_BASE}/contacts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

// Fetch single contact
async function fetchContact(id: string): Promise<ContactWithAll> {
  const res = await fetch(`${API_BASE}/contacts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch contact");
  return res.json();
}

// Fetch tags
async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

// Create contact
async function createContact(data: Record<string, unknown>): Promise<ContactWithAll> {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create contact");
  }
  return res.json();
}

// Update contact
async function updateContact({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}): Promise<ContactWithAll> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update contact");
  }
  return res.json();
}

// Delete contact
async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete contact");
}

// Hooks
export function useContacts(filters: ContactFilters) {
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => fetchContacts(filters),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => fetchContact(id),
    enabled: !!id,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContact,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", data.id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
