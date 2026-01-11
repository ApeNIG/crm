"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { cn, formatDate, formatCurrency, decimalToNumber } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import type { InvoiceListItem } from "@/types/invoice";

interface InvoiceCardProps {
  invoice: InvoiceListItem;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const contactName = `${invoice.contact.firstName} ${invoice.contact.lastName}`.trim();
  const statusConfig = STATUS_CONFIG[invoice.status];
  const total = decimalToNumber(invoice.total);
  const amountDue = decimalToNumber(invoice.amountDue);

  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-gray-500">{contactName}</p>
            </div>
          </div>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {getStatusLabel(invoice.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Issue Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(invoice.issueDate)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Amount Due</p>
            <p className={cn(
              "font-medium",
              amountDue > 0 ? "text-amber-600" : "text-green-600"
            )}>
              {formatCurrency(amountDue)}
            </p>
          </div>
        </div>

        {invoice.booking && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              From booking: {invoice.booking.serviceType.name}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
