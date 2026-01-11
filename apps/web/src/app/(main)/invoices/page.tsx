"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { InvoiceList, InvoiceFilters } from "@/components/invoices";
import { useInvoices } from "@/hooks/useInvoices";
import type { InvoiceFilters as Filters } from "@/types/invoice";

export default function InvoicesPage() {
  const [filters, setFilters] = useState<Filters>({});
  const { data, isLoading, error } = useInvoices(filters);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoices"
          subtitle="Loading..."
          actions={
            <Link href="/invoices/new">
              <Button>
                <Plus className="w-4 h-4" />
                New Invoice
              </Button>
            </Link>
          }
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Loading invoices...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoices" />
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading invoices</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${data?.total ?? 0} invoice${data?.total !== 1 ? "s" : ""}`}
        actions={
          <Link href="/invoices/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <InvoiceFilters filters={filters} onChange={setFilters} />

      {/* Invoice List */}
      <InvoiceList invoices={data?.invoices || []} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-foreground-muted">
            Page {data.page} of {data.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: (data.page || 1) - 1 }))}
              disabled={(data.page || 1) <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: (data.page || 1) + 1 }))}
              disabled={(data.page || 1) >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
