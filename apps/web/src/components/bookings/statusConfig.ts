import type { BookingStatus, StatusConfig } from "@/types/booking";

export const STATUS_ORDER: BookingStatus[] = [
  "REQUESTED",
  "PENDING_DEPOSIT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
];

export const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  REQUESTED: {
    key: "REQUESTED",
    label: "Requested",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  PENDING_DEPOSIT: {
    key: "PENDING_DEPOSIT",
    label: "Pending Deposit",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  CONFIRMED: {
    key: "CONFIRMED",
    label: "Confirmed",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  COMPLETED: {
    key: "COMPLETED",
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  CANCELLED: {
    key: "CANCELLED",
    label: "Cancelled",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  NO_SHOW: {
    key: "NO_SHOW",
    label: "No Show",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  RESCHEDULED: {
    key: "RESCHEDULED",
    label: "Rescheduled",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
  },
};

export function getStatusLabel(status: BookingStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: BookingStatus): string {
  return STATUS_CONFIG[status]?.color || "text-gray-700";
}

export function getStatusBgColor(status: BookingStatus): string {
  return STATUS_CONFIG[status]?.bgColor || "bg-gray-50";
}
