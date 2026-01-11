"use client";

import { Sparkles, Pencil, ArrowRightLeft, MessageSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { getStageLabel } from "./stageConfig";
import type { EnquiryActivity, EnquiryActivityType, EnquiryStage } from "@prisma/client";

interface EnquiryActivityTimelineProps {
  activities: EnquiryActivity[];
}

const ACTIVITY_ICONS: Record<EnquiryActivityType, LucideIcon> = {
  ENQUIRY_CREATED: Sparkles,
  ENQUIRY_UPDATED: Pencil,
  STAGE_CHANGED: ArrowRightLeft,
  NOTE_ADDED: MessageSquare,
};

const ACTIVITY_COLORS: Record<EnquiryActivityType, string> = {
  ENQUIRY_CREATED: "bg-green-100 text-green-700",
  ENQUIRY_UPDATED: "bg-blue-100 text-blue-700",
  STAGE_CHANGED: "bg-purple-100 text-purple-700",
  NOTE_ADDED: "bg-gray-100 text-gray-700",
};

function formatActivityMessage(activity: EnquiryActivity): string {
  const payload = activity.payload as Record<string, unknown> | null;

  switch (activity.type) {
    case "ENQUIRY_CREATED":
      return `Enquiry created${
        payload?.enquiryType ? ` (${String(payload.enquiryType).toLowerCase()})` : ""
      }`;
    case "STAGE_CHANGED":
      if (payload?.from && payload?.to) {
        return `Stage changed from ${getStageLabel(payload.from as EnquiryStage)} to ${getStageLabel(payload.to as EnquiryStage)}`;
      }
      return "Stage changed";
    case "ENQUIRY_UPDATED":
      if (payload?.changes) {
        const changes = payload.changes as Record<string, { from: unknown; to: unknown }>;
        const fieldNames = Object.keys(changes);
        if (fieldNames.length === 1) {
          return `Updated ${fieldNames[0]}`;
        }
        return `Updated ${fieldNames.length} fields`;
      }
      return "Enquiry updated";
    case "NOTE_ADDED":
      return "Note added";
    default:
      return "Activity recorded";
  }
}

export function EnquiryActivityTimeline({ activities }: EnquiryActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                ACTIVITY_COLORS[activity.type]
              )}
            >
              {(() => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return <Icon className="w-4 h-4" />;
              })()}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-gray-900">
              {formatActivityMessage(activity)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatRelativeTime(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
