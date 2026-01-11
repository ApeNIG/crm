"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { STATUS_ORDER, STATUS_CONFIG } from "./statusConfig";
import type { BookingFilters as BookingFiltersType } from "@/types/booking";
import type { ServiceType } from "@prisma/client";

interface BookingFiltersProps {
  filters: BookingFiltersType;
  serviceTypes: ServiceType[];
  onFiltersChange: (filters: BookingFiltersType) => void;
  onReset: () => void;
}

export function BookingFilters({
  filters,
  serviceTypes,
  onFiltersChange,
  onReset,
}: BookingFiltersProps) {
  const hasFilters =
    filters.search ||
    filters.status ||
    filters.serviceTypeId ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Contact name or email..."
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as BookingFiltersType["status"]) || undefined,
              })
            }
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </Select>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          <Select
            id="serviceType"
            value={filters.serviceTypeId || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                serviceTypeId: e.target.value || undefined,
              })
            }
          >
            <option value="">All services</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType.id} value={serviceType.id}>
                {serviceType.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom">From Date</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateFrom: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label htmlFor="dateTo">To Date</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateTo: e.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      {/* Reset button */}
      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onReset}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
