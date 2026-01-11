"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TagBadge } from "./TagBadge";
import { formatRelativeTime } from "@/lib/utils";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContactWithTags } from "@/types/contact";

interface ContactListProps {
  contacts: ContactWithTags[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    search?: string;
    status?: string;
    source?: string;
  };
  onFilterChange: (filters: Record<string, string>) => void;
  onPageChange: (page: number) => void;
  hideHeader?: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  LEAD: "secondary",
  CUSTOMER: "success",
  PAST_CUSTOMER: "default",
  COLD: "warning",
  DO_NOT_CONTACT: "destructive",
};

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  CUSTOMER: "Customer",
  PAST_CUSTOMER: "Past Customer",
  COLD: "Cold",
  DO_NOT_CONTACT: "Do Not Contact",
};

const sourceLabels: Record<string, string> = {
  INSTAGRAM: "Instagram",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export function ContactList({
  contacts,
  total,
  page,
  totalPages,
  filters,
  onFilterChange,
  onPageChange,
  hideHeader = false,
}: ContactListProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-gray-500">{total} total contacts</p>
          </div>
          <Link href="/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>
        <Select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.source || ""}
          onChange={(e) => onFilterChange({ source: e.target.value })}
        >
          <option value="">All Sources</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Source
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Tags
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </div>
                    {contact.phone && (
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{contact.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[contact.status]}>
                      {statusLabels[contact.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {sourceLabels[contact.source]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.slice(0, 3).map(({ tag }) => (
                        <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                      ))}
                      {contact.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatRelativeTime(contact.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
