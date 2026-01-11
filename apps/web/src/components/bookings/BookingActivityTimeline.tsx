"use client";

import {
  CalendarPlus,
  Pencil,
  ArrowRightLeft,
  Clock,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn, formatRelativeTime, formatDateTime } from "@/lib/utils";
import { getStatusLabel } from "./statusConfig";
import type { BookingActivity, BookingActivityType, BookingStatus } from "@prisma/client";

interface BookingActivityTimelineProps {
  activities: BookingActivity[];
}

const ACTIVITY_ICONS: Record<BookingActivityType, LucideIcon> = {
  BOOKING_CREATED: CalendarPlus,
  BOOKING_UPDATED: Pencil,
  BOOKING_STATUS_CHANGED: ArrowRightLeft,
  BOOKING_RESCHEDULED: Clock,
  BOOKING_NOTE_ADDED: MessageSquare,
};

const ACTIVITY_COLORS: Record<BookingActivityType, string> = {
  BOOKING_CREATED: "bg-green-100 text-green-700",
  BOOKING_UPDATED: "bg-blue-100 text-blue-700",
  BOOKING_STATUS_CHANGED: "bg-purple-100 text-purple-700",
  BOOKING_RESCHEDULED: "bg-amber-100 text-amber-700",
  BOOKING_NOTE_ADDED: "bg-gray-100 text-gray-700",
};

function formatActivityMessage(activity: BookingActivity): string {
  const payload = activity.payload as Record<string, unknown> | null;

  switch (activity.type) {
    case "BOOKING_CREATED":
      if (payload?.serviceTypeName) {
        return `Booking created for ${String(payload.serviceTypeName)}`;
      }
      return "Booking created";

    case "BOOKING_STATUS_CHANGED":
      if (payload?.from && payload?.to) {
        return `Status changed from ${getStatusLabel(payload.from as BookingStatus)} to ${getStatusLabel(payload.to as BookingStatus)}`;
      }
      return "Status changed";

    case "BOOKING_UPDATED":
      if (payload?.changes) {
        const changes = payload.changes as Record<string, { from: unknown; to: unknown }>;
        const fieldNames = Object.keys(changes);
        if (fieldNames.length === 1) {
          return `Updated ${fieldNames[0]}`;
        }
        return `Updated ${fieldNames.length} fields`;
      }
      return "Booking updated";

    case "BOOKING_RESCHEDULED":
      if (payload?.newStartAt) {
        return `Rescheduled to ${formatDateTime(payload.newStartAt as string)}`;
      }
      return "Booking rescheduled";

    case "BOOKING_NOTE_ADDED":
      if (payload?.preview) {
        const preview = String(payload.preview);
        return preview.length > 50 ? `Note: ${preview.slice(0, 50)}...` : `Note: ${preview}`;
      }
      return "Note added";

    default:
      return "Activity recorded";
  }
}

export function BookingActivityTimeline({ activities }: BookingActivityTimelineProps) {
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
