"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/layout";
import {
  MetricsGrid,
  EnquiryStageChart,
  BookingStatusSummary,
  InvoiceStatusSummary,
  ActivityFeed,
  QuickActions,
  DashboardSkeleton,
} from "@/components/dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your business activity"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <div className="rounded-lg border border-destructive/20 bg-destructive-muted p-6 text-center">
          <p className="text-destructive">
            Failed to load dashboard: {error?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your business activity"
        actions={<QuickActions />}
      />

      {/* Metrics Grid */}
      <MetricsGrid metrics={data.metrics} />

      {/* Three-column Breakdowns */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EnquiryStageChart breakdown={data.enquiryBreakdown} />
        <BookingStatusSummary breakdown={data.bookingBreakdown} />
        <InvoiceStatusSummary breakdown={data.invoiceBreakdown} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed initialActivities={data.recentActivity} />
    </div>
  );
}
