"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { BookingList, BookingFilters } from "@/components/bookings";
import { useBookings } from "@/hooks/useBookings";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { LIST_DEFAULT_LIMIT, DROPDOWN_DEFAULT_LIMIT } from "@/lib/constants";
import type { BookingFilters as BookingFiltersType } from "@/types/booking";

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFiltersType>({
    limit: LIST_DEFAULT_LIMIT,
    page: 1,
  });

  const { data, isLoading, error } = useBookings(filters);
  const { data: serviceTypesData } = useServiceTypes({
    isActive: true,
    limit: DROPDOWN_DEFAULT_LIMIT,
  });

  const handleFiltersChange = (newFilters: BookingFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ limit: LIST_DEFAULT_LIMIT, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bookings"
          subtitle="Loading..."
          actions={
            <Link href="/bookings/new">
              <Button>
                <Plus className="w-4 h-4" />
                New Booking
              </Button>
            </Link>
          }
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Loading bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bookings" />
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading bookings</div>
        </div>
      </div>
    );
  }

  const { bookings, total, page, totalPages } = data || {
    bookings: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle={`${total} booking${total !== 1 ? "s" : ""}`}
        actions={
          <Link href="/bookings/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <BookingFilters
        filters={filters}
        serviceTypes={serviceTypesData?.serviceTypes || []}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Booking List */}
      <BookingList bookings={bookings} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-foreground-muted">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
