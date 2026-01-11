import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function formatCurrency(
  amount: number,
  currency: string = "GBP"
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

// ============================================
// INVOICE CALCULATION UTILITIES
// ============================================

/**
 * Calculate line item total
 */
export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Calculate invoice subtotal from line items
 */
export function calculateSubtotal(
  lineItems: Array<{ quantity: number; unitPrice: number }>
): number {
  return lineItems.reduce((sum, item) => {
    return sum + calculateLineItemTotal(Number(item.quantity), Number(item.unitPrice));
  }, 0);
}

/**
 * Calculate tax amount from subtotal and tax rate
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * (taxRate / 100)) * 100) / 100;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  lineItems: Array<{ quantity: number; unitPrice: number }>,
  taxRate: number,
  amountPaid: number = 0
): {
  subtotal: number;
  taxAmount: number;
  total: number;
  amountDue: number;
} {
  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  const amountDue = Math.round((total - amountPaid) * 100) / 100;

  return { subtotal, taxAmount, total, amountDue };
}

/**
 * Generate invoice number in format INV-YYYY-NNNN
 */
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Parse Decimal from Prisma to number
 */
export function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}
