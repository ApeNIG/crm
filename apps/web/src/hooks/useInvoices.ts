"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  InvoiceListResponse,
  InvoiceWithAll,
  InvoiceFilters,
} from "@/types/invoice";
import type { InvoiceStatus, InvoiceLineItem, Payment } from "@prisma/client";

const API_BASE = "/api";

// ============================================
// API FETCH FUNCTIONS
// ============================================

// Fetch invoices with filters
async function fetchInvoices(filters: InvoiceFilters): Promise<InvoiceListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.contactId) params.set("contactId", filters.contactId);
  if (filters.bookingId) params.set("bookingId", filters.bookingId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`${API_BASE}/invoices?${params}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

// Fetch single invoice
async function fetchInvoice(id: string): Promise<InvoiceWithAll> {
  const res = await fetch(`${API_BASE}/invoices/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}

// Create invoice
async function createInvoice(data: Record<string, unknown>): Promise<InvoiceWithAll> {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create invoice");
  }
  return res.json();
}

// Update invoice
async function updateInvoice({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}): Promise<InvoiceWithAll> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update invoice");
  }
  return res.json();
}

// Update invoice status
async function updateInvoiceStatus({
  id,
  status,
}: {
  id: string;
  status: InvoiceStatus;
}): Promise<{ success: boolean; status: InvoiceStatus; previousStatus?: InvoiceStatus }> {
  const res = await fetch(`${API_BASE}/invoices/${id}/status`, {
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

// Send invoice
async function sendInvoice(id: string): Promise<InvoiceWithAll> {
  const res = await fetch(`${API_BASE}/invoices/${id}/send`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to send invoice");
  }
  return res.json();
}

// Delete invoice
async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete invoice");
}

// Create invoice from booking
async function createInvoiceFromBooking({
  bookingId,
  dueDate,
  taxRate,
}: {
  bookingId: string;
  dueDate?: string;
  taxRate?: number;
}): Promise<InvoiceWithAll> {
  const res = await fetch(`${API_BASE}/invoices/from-booking/${bookingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dueDate, taxRate }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create invoice from booking");
  }
  return res.json();
}

// ============================================
// LINE ITEM API FUNCTIONS
// ============================================

// Add line item
async function addLineItem({
  invoiceId,
  data,
}: {
  invoiceId: string;
  data: Record<string, unknown>;
}): Promise<InvoiceLineItem> {
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to add line item");
  }
  return res.json();
}

// Update line item
async function updateLineItem({
  invoiceId,
  itemId,
  data,
}: {
  invoiceId: string;
  itemId: string;
  data: Record<string, unknown>;
}): Promise<InvoiceLineItem> {
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/line-items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update line item");
  }
  return res.json();
}

// Delete line item
async function deleteLineItem({
  invoiceId,
  itemId,
}: {
  invoiceId: string;
  itemId: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/line-items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete line item");
  }
}

// ============================================
// PAYMENT API FUNCTIONS
// ============================================

// Record payment
async function recordPayment({
  invoiceId,
  data,
}: {
  invoiceId: string;
  data: Record<string, unknown>;
}): Promise<Payment> {
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to record payment");
  }
  return res.json();
}

// Delete payment
async function deletePayment({
  invoiceId,
  paymentId,
}: {
  invoiceId: string;
  paymentId: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/payments/${paymentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete payment");
  }
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Fetch paginated invoice list with filters
 */
export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => fetchInvoices(filters),
  });
}

/**
 * Fetch single invoice with all relations
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  });
}

/**
 * Create a new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Update an existing invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", data.id] });
    },
  });
}

/**
 * Update invoice status
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoiceStatus,
    // Optimistic update for smooth UX
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["invoices"] });

      // Snapshot previous value
      const previousInvoices = queryClient.getQueriesData<InvoiceListResponse>({
        queryKey: ["invoices"],
      });

      // Optimistically update invoices list
      queryClient.setQueriesData<InvoiceListResponse>(
        { queryKey: ["invoices"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            invoices: old.invoices.map((invoice) =>
              invoice.id === id ? { ...invoice, status } : invoice
            ),
          };
        }
      );

      return { previousInvoices };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousInvoices) {
        context.previousInvoices.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Send an invoice (mark as SENT)
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", data.id] });
    },
  });
}

/**
 * Soft delete an invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Create an invoice from a booking
 */
export function useCreateInvoiceFromBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceFromBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

/**
 * Add a line item to an invoice
 */
export function useAddLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLineItem,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Update a line item
 */
export function useUpdateLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLineItem,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Delete a line item
 */
export function useDeleteLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLineItem,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Record a payment
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordPayment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Delete a payment
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
