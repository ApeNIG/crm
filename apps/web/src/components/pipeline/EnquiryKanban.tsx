"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { EnquiryColumn } from "./EnquiryColumn";
import { EnquiryCard } from "./EnquiryCard";
import { STAGE_ORDER } from "./stageConfig";
import { useUpdateEnquiryStage } from "@/hooks/useEnquiries";
import { cn } from "@/lib/utils";
import type { EnquiryWithContact, EnquiryStage, EnquiriesByStage } from "@/types/enquiry";

interface EnquiryKanbanProps {
  enquiries: EnquiryWithContact[];
}

export function EnquiryKanban({ enquiries }: EnquiryKanbanProps) {
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryWithContact | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const updateStage = useUpdateEnquiryStage();

  // Clear error after 3 seconds
  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => setUpdateError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  // Cleanup drag state on unmount
  useEffect(() => {
    return () => {
      setActiveEnquiry(null);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group enquiries by stage
  const enquiriesByStage = useMemo(() => {
    const grouped: EnquiriesByStage = {
      NEW: [],
      AUTO_RESPONDED: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL_SENT: [],
      BOOKED_PAID: [],
      LOST: [],
    };

    enquiries.forEach((enquiry) => {
      if (grouped[enquiry.stage]) {
        grouped[enquiry.stage].push(enquiry);
      }
    });

    return grouped;
  }, [enquiries]);

  function handleDragStart(event: DragStartEvent) {
    const enquiry = enquiries.find((e) => e.id === event.active.id);
    if (enquiry) {
      setActiveEnquiry(enquiry);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEnquiry(null);

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    let targetStage: EnquiryStage | null = null;

    // Check if dropped on a column
    if (STAGE_ORDER.includes(overId as EnquiryStage)) {
      targetStage = overId as EnquiryStage;
    } else {
      // Dropped on another card - find which column it's in
      const overEnquiry = enquiries.find((e) => e.id === overId);
      if (overEnquiry) {
        targetStage = overEnquiry.stage;
      }
    }

    if (!targetStage) return;

    // Find the active enquiry
    const activeEnquiry = enquiries.find((e) => e.id === activeId);
    if (!activeEnquiry) return;

    // Skip if same stage
    if (activeEnquiry.stage === targetStage) return;

    // Update stage with error handling
    updateStage.mutate(
      {
        id: activeId,
        stage: targetStage,
      },
      {
        onError: (error) => {
          setUpdateError(error instanceof Error ? error.message : "Failed to update stage");
        },
      }
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Error notification */}
      {updateError && (
        <div className="mb-4 p-3 bg-destructive-muted border border-destructive/20 rounded-lg text-destructive text-sm">
          {updateError}
        </div>
      )}

      {/* Kanban board container - full width horizontal scroll */}
      <div
        className={cn(
          "kanban-container",
          "-mx-[var(--space-page-padding)]", // Extend to edges
          "px-[var(--space-page-padding)]", // But maintain padding for first/last column
          "overflow-x-auto",
          "pb-4" // Space for scrollbar
        )}
      >
        <div className="flex gap-3 min-w-max">
          {STAGE_ORDER.map((stage) => (
            <EnquiryColumn
              key={stage}
              stage={stage}
              enquiries={enquiriesByStage[stage]}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeEnquiry && <EnquiryCard enquiry={activeEnquiry} />}
      </DragOverlay>
    </DndContext>
  );
}
