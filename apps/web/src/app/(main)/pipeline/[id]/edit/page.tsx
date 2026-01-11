"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { EnquiryForm } from "@/components/pipeline/EnquiryForm";
import { useEnquiry, useUpdateEnquiry } from "@/hooks/useEnquiries";
import { useContacts } from "@/hooks/useContacts";
import { DROPDOWN_DEFAULT_LIMIT } from "@/lib/constants";
import type { CreateEnquiryInput } from "@/lib/validations/enquiry";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditEnquiryPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: enquiry, isLoading: enquiryLoading, error } = useEnquiry(id);
  const { data: contactsData, isLoading: contactsLoading } = useContacts({
    limit: DROPDOWN_DEFAULT_LIMIT,
  });
  const updateEnquiry = useUpdateEnquiry();

  const handleSubmit = async (data: CreateEnquiryInput) => {
    try {
      await updateEnquiry.mutateAsync({
        id,
        data: data as Record<string, unknown>,
      });
      router.push(`/pipeline/${id}`);
    } catch (error) {
      console.error("Failed to update enquiry:", error);
    }
  };

  if (enquiryLoading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-destructive">Enquiry not found</div>
        <Link href="/pipeline">
          <Button variant="outline">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/pipeline/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Enquiry
      </Link>
      <PageHeader title="Edit Enquiry" />
      <div className="max-w-2xl">
        <EnquiryForm
          enquiry={enquiry}
          contacts={contactsData?.contacts || []}
          onSubmit={handleSubmit}
          isLoading={updateEnquiry.isPending}
        />
      </div>
    </div>
  );
}
