"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { InvoiceStatusBreakdown } from "@/types/dashboard";
import type { InvoiceStatus } from "@prisma/client";

interface InvoiceStatusSummaryProps {
  breakdown: InvoiceStatusBreakdown[];
}

// Status configuration matching invoices/statusConfig pattern
const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: "Draft", color: "text-gray-700", bgColor: "bg-gray-50" },
  SENT: { label: "Sent", color: "text-blue-700", bgColor: "bg-blue-50" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "text-amber-700", bgColor: "bg-amber-50" },
  PAID: { label: "Paid", color: "text-green-700", bgColor: "bg-green-50" },
  OVERDUE: { label: "Overdue", color: "text-red-700", bgColor: "bg-red-50" },
  CANCELLED: { label: "Cancelled", color: "text-gray-400", bgColor: "bg-gray-50" },
};

// Status order for display (action required first)
const statusOrder: InvoiceStatus[] = [
  "OVERDUE",
  "SENT",
  "PARTIALLY_PAID",
  "DRAFT",
  "PAID",
  "CANCELLED",
];

export function InvoiceStatusSummary({ breakdown }: InvoiceStatusSummaryProps) {
  // Create a map for quick lookup
  const dataMap = new Map(
    breakdown.map((b) => [b.status, { count: b.count, amount: b.totalAmount }])
  );

  // Calculate outstanding (SENT + OVERDUE + PARTIALLY_PAID)
  const outstandingStatuses: InvoiceStatus[] = ["SENT", "OVERDUE", "PARTIALLY_PAID"];
  const outstandingAmount = breakdown
    .filter((b) => outstandingStatuses.includes(b.status))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Invoice Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Outstanding total */}
        <Link
          href="/invoices?status=SENT"
          className="mb-4 block rounded-lg bg-amber-50 p-4 text-center transition-colors hover:bg-amber-100"
        >
          <p className="text-2xl font-bold text-amber-700">
            {formatCurrency(outstandingAmount)}
          </p>
          <p className="text-sm text-amber-600">Outstanding</p>
        </Link>

        {/* Status breakdown */}
        <div className="space-y-2">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const data = dataMap.get(status);
            if (!data || data.count === 0) return null;

            return (
              <Link
                key={status}
                href={`/invoices?status=${status}`}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  config.bgColor,
                  "hover:opacity-80"
                )}
              >
                <span className={cn("font-medium", config.color)}>
                  {config.label}
                </span>
                <div className="flex gap-4">
                  <span className={cn("tabular-nums", config.color)}>
                    {data.count}
                  </span>
                  <span className={cn("tabular-nums font-medium", config.color)}>
                    {formatCurrency(data.amount)}
                  </span>
                </div>
              </Link>
            );
          })}

          {breakdown.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No invoices yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
