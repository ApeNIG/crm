"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { ContactList } from "@/components/contacts/ContactList";
import { useContacts } from "@/hooks/useContacts";
import type { ContactFilters } from "@/types/contact";

export default function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 50,
  });

  const { data, isLoading, error } = useContacts(filters);

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contacts"
          subtitle="Loading..."
          actions={
            <Link href="/contacts/new">
              <Button>
                <Plus className="w-4 h-4" />
                New Contact
              </Button>
            </Link>
          }
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Loading contacts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contacts" />
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading contacts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        subtitle={`${data?.total || 0} contact${data?.total !== 1 ? "s" : ""}`}
        actions={
          <Link href="/contacts/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Contact
            </Button>
          </Link>
        }
      />
      <ContactList
        contacts={data?.contacts || []}
        total={data?.total || 0}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        filters={{
          search: filters.search,
          status: filters.status,
          source: filters.source,
        }}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        hideHeader
      />
    </div>
  );
}
