"use client";

import {
  FileText,
  Edit,
  Send,
  CreditCard,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { getPaymentMethodLabel } from "./statusConfig";
import type { InvoiceActivity, InvoiceActivityType } from "@prisma/client";

interface InvoiceActivityTimelineProps {
  activities: InvoiceActivity[];
}

type ActivityPayload = {
  invoiceNumber?: string;
  contactName?: string;
  total?: string;
  fromBooking?: boolean;
  from?: string;
  to?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  sentAt?: string;
  amount?: string;
  method?: string;
  reference?: string;
  description?: string;
};

const ACTIVITY_ICONS: Record<InvoiceActivityType, React.ReactNode> = {
  INVOICE_CREATED: <FileText className="w-4 h-4" />,
  INVOICE_UPDATED: <Edit className="w-4 h-4" />,
  INVOICE_STATUS_CHANGED: <RefreshCw className="w-4 h-4" />,
  INVOICE_SENT: <Send className="w-4 h-4" />,
  PAYMENT_RECORDED: <CreditCard className="w-4 h-4" />,
  PAYMENT_DELETED: <Trash2 className="w-4 h-4" />,
  LINE_ITEM_ADDED: <Plus className="w-4 h-4" />,
  LINE_ITEM_UPDATED: <Edit className="w-4 h-4" />,
  LINE_ITEM_DELETED: <Trash2 className="w-4 h-4" />,
};

const ACTIVITY_COLORS: Record<InvoiceActivityType, string> = {
  INVOICE_CREATED: "bg-blue-100 text-blue-600",
  INVOICE_UPDATED: "bg-gray-100 text-gray-600",
  INVOICE_STATUS_CHANGED: "bg-purple-100 text-purple-600",
  INVOICE_SENT: "bg-green-100 text-green-600",
  PAYMENT_RECORDED: "bg-green-100 text-green-600",
  PAYMENT_DELETED: "bg-red-100 text-red-600",
  LINE_ITEM_ADDED: "bg-blue-100 text-blue-600",
  LINE_ITEM_UPDATED: "bg-gray-100 text-gray-600",
  LINE_ITEM_DELETED: "bg-red-100 text-red-600",
};

function getActivityDescription(
  type: InvoiceActivityType,
  payload: ActivityPayload
): string {
  switch (type) {
    case "INVOICE_CREATED":
      if (payload.fromBooking) {
        return `Invoice created from booking for ${payload.contactName}`;
      }
      return `Invoice created for ${payload.contactName}`;

    case "INVOICE_UPDATED":
      if (payload.changes) {
        const changedFields = Object.keys(payload.changes);
        return `Invoice updated: ${changedFields.join(", ")}`;
      }
      return "Invoice updated";

    case "INVOICE_STATUS_CHANGED":
      return `Status changed from ${payload.from} to ${payload.to}`;

    case "INVOICE_SENT":
      return "Invoice marked as sent";

    case "PAYMENT_RECORDED":
      return `Payment of ${formatCurrency(parseFloat(payload.amount || "0"))} recorded via ${getPaymentMethodLabel(payload.method as Parameters<typeof getPaymentMethodLabel>[0])}`;

    case "PAYMENT_DELETED":
      return `Payment of ${formatCurrency(parseFloat(payload.amount || "0"))} deleted`;

    case "LINE_ITEM_ADDED":
      return `Line item added: ${payload.description}`;

    case "LINE_ITEM_UPDATED":
      return `Line item updated: ${payload.description}`;

    case "LINE_ITEM_DELETED":
      return `Line item deleted: ${payload.description}`;

    default:
      return type.replace(/_/g, " ").toLowerCase();
  }
}

export function InvoiceActivityTimeline({
  activities,
}: InvoiceActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;
          const payload = activity.payload as ActivityPayload;
          const iconClasses = ACTIVITY_COLORS[activity.type] || "bg-gray-100 text-gray-600";

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full ${iconClasses}`}
                  >
                    {ACTIVITY_ICONS[activity.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      {getActivityDescription(activity.type, payload)}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
