"use client";

import {
  UserPlus,
  Edit,
  Tag,
  MessageSquare,
  type LucideIcon
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Activity, ActivityType } from "@prisma/client";

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityConfig: Record<
  ActivityType,
  { icon: LucideIcon; label: string; color: string }
> = {
  CONTACT_CREATED: {
    icon: UserPlus,
    label: "Contact created",
    color: "text-green-600 bg-green-100",
  },
  CONTACT_UPDATED: {
    icon: Edit,
    label: "Contact updated",
    color: "text-blue-600 bg-blue-100",
  },
  NOTE_ADDED: {
    icon: MessageSquare,
    label: "Note added",
    color: "text-purple-600 bg-purple-100",
  },
  TAG_ADDED: {
    icon: Tag,
    label: "Tag added",
    color: "text-orange-600 bg-orange-100",
  },
  TAG_REMOVED: {
    icon: Tag,
    label: "Tag removed",
    color: "text-gray-600 bg-gray-100",
  },
};

function getActivityDescription(activity: Activity): string {
  const payload = activity.payload as Record<string, unknown>;

  switch (activity.type) {
    case "CONTACT_CREATED":
      return `Created via ${payload.source || "unknown"}`;
    case "CONTACT_UPDATED": {
      const changes = payload.changes as Record<
        string,
        { from: unknown; to: unknown }
      >;
      if (!changes) return "Details updated";
      const keys = Object.keys(changes);
      if (keys.length === 1) {
        const key = keys[0];
        return `${key} changed from "${changes[key].from}" to "${changes[key].to}"`;
      }
      return `${keys.length} fields updated`;
    }
    case "NOTE_ADDED":
      return (payload.preview as string) || "Note added";
    case "TAG_ADDED":
      return `Tag "${payload.tagName}" added`;
    case "TAG_REMOVED":
      return `Tag "${payload.tagName}" removed`;
    default:
      return "Activity recorded";
  }
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const isLast = idx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">{config.label}</p>
                      <p className="text-sm text-gray-500">
                        {getActivityDescription(activity)}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {formatRelativeTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
