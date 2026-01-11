"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { EnquiryWithContact, EnquiryType } from "@/types/enquiry";

interface EnquiryCardProps {
  enquiry: EnquiryWithContact;
}

const TYPE_COLORS: Record<EnquiryType, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  SERVICE: "bg-blue-100 text-blue-700",
  PRODUCT: "bg-green-100 text-green-700",
  PARTNERSHIP: "bg-purple-100 text-purple-700",
};

export function EnquiryCard({ enquiry }: EnquiryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: enquiry.id,
    data: {
      type: "enquiry",
      enquiry,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contactName = `${enquiry.contact.firstName} ${enquiry.contact.lastName}`.trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing",
        "hover:border-gray-300 hover:shadow-md transition-all",
        isDragging && "opacity-50 shadow-lg ring-2 ring-blue-400"
      )}
    >
      <Link href={`/pipeline/${enquiry.id}`} className="block">
        {/* Contact name */}
        <div className="font-medium text-gray-900 truncate">{contactName}</div>

        {/* Type badge */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              TYPE_COLORS[enquiry.enquiryType]
            )}
          >
            {enquiry.enquiryType.charAt(0) + enquiry.enquiryType.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Message preview */}
        {enquiry.message && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{enquiry.message}</p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          {/* Estimated value */}
          {enquiry.estimatedValue !== null && (
            <span className="font-medium text-green-600">
              {formatCurrency(enquiry.estimatedValue)}
            </span>
          )}

          {/* Next action or updated time */}
          <span className="ml-auto">
            {enquiry.nextActionAt ? (
              <>Next: {formatRelativeTime(enquiry.nextActionAt)}</>
            ) : (
              formatRelativeTime(enquiry.updatedAt)
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}
