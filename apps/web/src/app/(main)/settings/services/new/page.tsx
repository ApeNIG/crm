"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { ServiceTypeForm } from "@/components/service-types";
import { useCreateServiceType } from "@/hooks/useServiceTypes";
import type { CreateServiceTypeInput } from "@/lib/validations/service-type";

export default function NewServiceTypePage() {
  const router = useRouter();
  const createServiceType = useCreateServiceType();

  const handleSubmit = async (data: CreateServiceTypeInput) => {
    await createServiceType.mutateAsync(data);
    router.push("/settings/services");
  };

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
        title="New Service Type"
        subtitle="Add a new service type for bookings"
      />
      <div className="max-w-2xl">
        <ServiceTypeForm
          onSubmit={handleSubmit}
          isLoading={createServiceType.isPending}
        />

        {createServiceType.error && (
          <div className="mt-4 bg-destructive-muted text-destructive p-4 rounded-lg border border-destructive/20">
            {createServiceType.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
