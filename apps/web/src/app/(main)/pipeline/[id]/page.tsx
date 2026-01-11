"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnquiryDetail } from "@/components/pipeline/EnquiryDetail";
import { useEnquiry } from "@/hooks/useEnquiries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EnquiryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: enquiry, isLoading, error } = useEnquiry(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading enquiry...</div>
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
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </Link>

      <EnquiryDetail enquiry={enquiry} />
    </div>
  );
}
