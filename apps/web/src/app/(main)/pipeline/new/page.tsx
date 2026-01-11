"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { EnquiryForm } from "@/components/pipeline/EnquiryForm";
import { useCreateEnquiry } from "@/hooks/useEnquiries";
import { useContacts } from "@/hooks/useContacts";
import { DROPDOWN_DEFAULT_LIMIT } from "@/lib/constants";
import type { CreateEnquiryInput } from "@/lib/validations/enquiry";

export default function NewEnquiryPage() {
  const router = useRouter();
  const createEnquiry = useCreateEnquiry();
  const { data: contactsData, isLoading: contactsLoading } = useContacts({
    limit: DROPDOWN_DEFAULT_LIMIT,
  });

  const handleSubmit = async (data: CreateEnquiryInput) => {
    try {
      const enquiry = await createEnquiry.mutateAsync(data as Record<string, unknown>);
      router.push(`/pipeline/${enquiry.id}`);
    } catch (error) {
      console.error("Failed to create enquiry:", error);
    }
  };

  if (contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Enquiry"
        subtitle="Create a new enquiry for a contact"
      />
      <div className="max-w-2xl">
        <EnquiryForm
          contacts={contactsData?.contacts || []}
          onSubmit={handleSubmit}
          isLoading={createEnquiry.isPending}
        />
      </div>
    </div>
  );
}
