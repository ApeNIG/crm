"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { STATUS_ORDER, STATUS_CONFIG } from "./statusConfig";
import type { InvoiceFilters as Filters } from "@/types/invoice";

interface InvoiceFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function InvoiceFilters({ filters, onChange }: InvoiceFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      status: value ? (value as Filters["status"]) : undefined,
      page: 1,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search invoices..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      <div className="sm:w-48">
        <Select
          value={filters.status || ""}
          onChange={handleStatusChange}
          className="w-full"
        >
          <option value="">All Statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
