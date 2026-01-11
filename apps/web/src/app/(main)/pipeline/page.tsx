"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/layout";
import { EnquiryKanban } from "@/components/pipeline/EnquiryKanban";
import { useEnquiries } from "@/hooks/useEnquiries";
import { KANBAN_DEFAULT_LIMIT } from "@/lib/constants";
import type { EnquiryFilters } from "@/types/enquiry";

export default function PipelinePage() {
  const [filters, setFilters] = useState<EnquiryFilters>({
    limit: KANBAN_DEFAULT_LIMIT,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useEnquiries(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading pipeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading pipeline</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pipeline"
        subtitle={`${data?.total || 0} enquiries · Drag cards to change stage`}
        actions={
          <Link href="/pipeline/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Enquiry
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
          <Input
            type="text"
            placeholder="Search enquiries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {filters.search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setFilters((prev) => ({ ...prev, search: undefined }));
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Kanban Board */}
      <ErrorBoundary>
        <EnquiryKanban enquiries={data?.enquiries || []} />
      </ErrorBoundary>
    </div>
  );
}
