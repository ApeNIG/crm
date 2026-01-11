"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils";
import { STAGE_CONFIG, getStageLabel } from "./stageConfig";
import { EnquiryActivityTimeline } from "./EnquiryActivityTimeline";
import { useDeleteEnquiry } from "@/hooks/useEnquiries";
import type { EnquiryWithAll } from "@/types/enquiry";

interface EnquiryDetailProps {
  enquiry: EnquiryWithAll;
}

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  SERVICE: "Service",
  PRODUCT: "Product",
  PARTNERSHIP: "Partnership",
};

export function EnquiryDetail({ enquiry }: EnquiryDetailProps) {
  const router = useRouter();
  const deleteEnquiry = useDeleteEnquiry();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      await deleteEnquiry.mutateAsync(enquiry.id);
      router.push("/pipeline");
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
    }
  };

  const contactName = `${enquiry.contact.firstName} ${enquiry.contact.lastName}`.trim();
  const stageConfig = STAGE_CONFIG[enquiry.stage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{contactName}</h1>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                stageConfig.bgColor,
                stageConfig.color
              )}
            >
              {getStageLabel(enquiry.stage)}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            {TYPE_LABELS[enquiry.enquiryType]} enquiry
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/pipeline/${enquiry.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteEnquiry.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleteEnquiry.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enquiry.message && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Message</h4>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {enquiry.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {enquiry.estimatedValue !== null && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Estimated Value
                    </h4>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(enquiry.estimatedValue)}
                    </p>
                  </div>
                )}

                {enquiry.preferredDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Preferred Date
                    </h4>
                    <p className="mt-1 text-gray-900">
                      {formatDate(enquiry.preferredDate)}
                      {enquiry.preferredTime && ` (${enquiry.preferredTime})`}
                    </p>
                  </div>
                )}

                {enquiry.nextActionAt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Next Action
                    </h4>
                    <p className="mt-1 text-gray-900">
                      {formatDate(enquiry.nextActionAt)}
                    </p>
                  </div>
                )}

                {enquiry.sourceUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Source
                    </h4>
                    <a
                      href={enquiry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:underline truncate block"
                    >
                      {enquiry.sourceUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Created {formatDate(enquiry.createdAt)} · Updated{" "}
                  {formatDate(enquiry.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <EnquiryActivityTimeline activities={enquiry.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contact info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <Link
                  href={`/contacts/${enquiry.contact.id}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {contactName}
                </Link>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <a
                  href={`mailto:${enquiry.contact.email}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {enquiry.contact.email}
                </a>
              </div>

              {enquiry.contact.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <a
                    href={`tel:${enquiry.contact.phone}`}
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    {enquiry.contact.phone}
                  </a>
                </div>
              )}

              <div className="pt-3">
                <Link href={`/contacts/${enquiry.contact.id}`}>
                  <Button variant="outline" className="w-full">
                    View Contact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
