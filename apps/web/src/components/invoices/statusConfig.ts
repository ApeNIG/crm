import type { InvoiceStatus, InvoiceStatusConfig, PaymentMethod, PaymentMethodConfig } from "@/types/invoice";

export const STATUS_ORDER: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export const STATUS_CONFIG: Record<InvoiceStatus, InvoiceStatusConfig> = {
  DRAFT: {
    key: "DRAFT",
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  SENT: {
    key: "SENT",
    label: "Sent",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  PARTIALLY_PAID: {
    key: "PARTIALLY_PAID",
    label: "Partially Paid",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  PAID: {
    key: "PAID",
    label: "Paid",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  OVERDUE: {
    key: "OVERDUE",
    label: "Overdue",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  CANCELLED: {
    key: "CANCELLED",
    label: "Cancelled",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
};

export function getStatusLabel(status: InvoiceStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: InvoiceStatus): string {
  return STATUS_CONFIG[status]?.color || "text-gray-700";
}

export function getStatusBgColor(status: InvoiceStatus): string {
  return STATUS_CONFIG[status]?.bgColor || "bg-gray-50";
}

// Payment method configuration
export const PAYMENT_METHOD_ORDER: PaymentMethod[] = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "STRIPE",
  "OTHER",
];

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, PaymentMethodConfig> = {
  CASH: {
    key: "CASH",
    label: "Cash",
  },
  CARD: {
    key: "CARD",
    label: "Card",
  },
  BANK_TRANSFER: {
    key: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  STRIPE: {
    key: "STRIPE",
    label: "Stripe",
  },
  OTHER: {
    key: "OTHER",
    label: "Other",
  },
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_CONFIG[method]?.label || method;
}
