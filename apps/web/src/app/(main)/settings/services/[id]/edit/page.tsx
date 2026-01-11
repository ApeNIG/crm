"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { ServiceTypeForm } from "@/components/service-types";
import { useServiceType, useUpdateServiceType } from "@/hooks/useServiceTypes";
import type { CreateServiceTypeInput } from "@/lib/validations/service-type";

export default function EditServiceTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: serviceType, isLoading, error } = useServiceType(id);
  const updateServiceType = useUpdateServiceType();

  const handleSubmit = async (data: CreateServiceTypeInput) => {
    await updateServiceType.mutateAsync({ id, data });
    router.push("/settings/services");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (error || !serviceType) {
    return (
      <div className="space-y-6">
        <Link
          href="/settings/services"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Service Types
        </Link>
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Service type not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/settings/services"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Service Types
      </Link>
      <PageHeader
        title="Edit Service Type"
        subtitle={`Editing ${serviceType.name}`}
      />
      <div className="max-w-2xl">
        <ServiceTypeForm
          serviceType={serviceType}
          onSubmit={handleSubmit}
          isLoading={updateServiceType.isPending}
        />

        {updateServiceType.error && (
          <div className="mt-4 bg-destructive-muted text-destructive p-4 rounded-lg border border-destructive/20">
            {updateServiceType.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
