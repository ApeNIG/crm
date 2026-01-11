"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { ServiceTypeList } from "@/components/service-types";
import { useServiceTypes, useDeleteServiceType } from "@/hooks/useServiceTypes";

export default function ServiceTypesPage() {
  const { data, isLoading, error } = useServiceTypes();
  const deleteServiceType = useDeleteServiceType();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to deactivate this service type?")) {
      await deleteServiceType.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Types"
          subtitle="Loading..."
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Loading service types...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Service Types" />
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Failed to load service types</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Types"
        subtitle="Manage the types of services you offer for bookings"
        actions={
          <Link href="/settings/services/new">
            <Button>
              <Plus className="w-4 h-4" />
              Add Service Type
            </Button>
          </Link>
        }
      />

      <ServiceTypeList
        serviceTypes={data?.serviceTypes || []}
        onDelete={handleDelete}
        isDeleting={deleteServiceType.isPending}
      />

      {data && data.total > 0 && (
        <div className="text-sm text-foreground-muted">
          Showing {data.serviceTypes.length} of {data.total} service types
        </div>
      )}
    </div>
  );
}
