"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BookingStatusBreakdown } from "@/types/dashboard";
import type { BookingStatus } from "@prisma/client";

interface BookingStatusSummaryProps {
  breakdown: BookingStatusBreakdown[];
}

// Status configuration matching bookings/statusConfig pattern
const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  REQUESTED: { label: "Requested", color: "text-blue-700", bgColor: "bg-blue-50" },
  PENDING_DEPOSIT: { label: "Pending Deposit", color: "text-amber-700", bgColor: "bg-amber-50" },
  CONFIRMED: { label: "Confirmed", color: "text-green-700", bgColor: "bg-green-50" },
  COMPLETED: { label: "Completed", color: "text-gray-700", bgColor: "bg-gray-50" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50" },
  NO_SHOW: { label: "No Show", color: "text-orange-700", bgColor: "bg-orange-50" },
  RESCHEDULED: { label: "Rescheduled", color: "text-purple-700", bgColor: "bg-purple-50" },
};

// Status order for display (most relevant first)
const statusOrder: BookingStatus[] = [
  "CONFIRMED",
  "REQUESTED",
  "PENDING_DEPOSIT",
  "RESCHEDULED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
];

export function BookingStatusSummary({ breakdown }: BookingStatusSummaryProps) {
  // Create a map for quick lookup
  const dataMap = new Map(
    breakdown.map((b) => [b.status, { today: b.todayCount, week: b.weekCount }])
  );

  // Calculate totals
  const totalToday = breakdown.reduce((sum, b) => sum + b.todayCount, 0);
  const totalWeek = breakdown.reduce((sum, b) => sum + b.weekCount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Booking Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary row */}
        <div className="mb-4 flex gap-4">
          <Link
            href="/calendar"
            className="flex-1 rounded-lg bg-gray-50 p-3 text-center transition-colors hover:bg-gray-100"
          >
            <p className="text-2xl font-bold text-gray-900">{totalToday}</p>
            <p className="text-sm text-gray-500">Today</p>
          </Link>
          <Link
            href="/calendar"
            className="flex-1 rounded-lg bg-gray-50 p-3 text-center transition-colors hover:bg-gray-100"
          >
            <p className="text-2xl font-bold text-gray-900">{totalWeek}</p>
            <p className="text-sm text-gray-500">This Week</p>
          </Link>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const data = dataMap.get(status);
            if (!data || (data.today === 0 && data.week === 0)) return null;

            return (
              <div
                key={status}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                  config.bgColor
                )}
              >
                <span className={cn("font-medium", config.color)}>
                  {config.label}
                </span>
                <div className="flex gap-4">
                  <span className={cn("tabular-nums", config.color)}>
                    {data.today} today
                  </span>
                  <span className={cn("tabular-nums", config.color)}>
                    {data.week} week
                  </span>
                </div>
              </div>
            );
          })}

          {breakdown.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No bookings scheduled
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
