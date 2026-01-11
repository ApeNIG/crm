"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { EnquiryCard } from "./EnquiryCard";
import { STAGE_CONFIG } from "./stageConfig";
import type { EnquiryWithContact, EnquiryStage } from "@/types/enquiry";

interface EnquiryColumnProps {
  stage: EnquiryStage;
  enquiries: EnquiryWithContact[];
}

export function EnquiryColumn({ stage, enquiries }: EnquiryColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: "column",
      stage,
    },
  });

  const config = STAGE_CONFIG[stage];
  const enquiryIds = enquiries.map((e) => e.id);

  return (
    <div
      className={cn(
        "flex flex-col",
        "w-[280px] flex-shrink-0", // Fixed width, never shrink
        "bg-surface-inset rounded-lg border border-border-muted",
        "transition-shadow duration-150",
        isOver && "ring-2 ring-primary ring-opacity-50 shadow-md"
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "px-3 py-2.5 rounded-t-lg border-b border-border-muted",
          "flex items-center justify-between"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Stage color indicator */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config.dotColor || config.color }}
          />
          <h3 className="font-medium text-sm text-foreground">
            {config.label}
          </h3>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            "bg-muted text-foreground-muted"
          )}
        >
          {enquiries.length}
        </span>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2",
          "overflow-y-auto",
          "min-h-[200px] max-h-[calc(100vh-280px)]" // Proper height calculation
        )}
      >
        <SortableContext items={enquiryIds} strategy={verticalListSortingStrategy}>
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {enquiries.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center h-20",
              "text-sm text-foreground-subtle",
              "border-2 border-dashed border-border rounded-lg"
            )}
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
