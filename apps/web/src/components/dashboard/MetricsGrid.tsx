"use client";

import {
  Users,
  MessageSquareMore,
  CalendarCheck,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/dashboard";

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        icon={Users}
        label="Total Contacts"
        value={metrics.totalContacts.toLocaleString()}
        href="/contacts"
      />
      <MetricCard
        icon={MessageSquareMore}
        label="Active Enquiries"
        value={metrics.activeEnquiries.toLocaleString()}
        href="/pipeline"
      />
      <MetricCard
        icon={CalendarCheck}
        label="Upcoming Bookings"
        value={metrics.upcomingBookings.toLocaleString()}
        href="/calendar"
      />
      <MetricCard
        icon={Receipt}
        label="Outstanding"
        value={formatCurrency(metrics.outstandingAmount)}
        href="/invoices?status=SENT"
      />
      <MetricCard
        icon={TrendingUp}
        label="Revenue This Month"
        value={formatCurrency(metrics.revenueThisMonth)}
      />
    </div>
  );
}
