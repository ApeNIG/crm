"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  MessageSquareMore,
  Calendar,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { DashboardActivityItem, ActivityEntityType } from "@/types/dashboard";

interface ActivityFeedItemProps {
  activity: DashboardActivityItem;
  isLast?: boolean;
}

// Entity type to icon and color mapping
const entityConfig: Record<
  ActivityEntityType,
  { icon: LucideIcon; color: string }
> = {
  contact: { icon: User, color: "text-blue-600 bg-blue-100" },
  enquiry: { icon: MessageSquareMore, color: "text-purple-600 bg-purple-100" },
  booking: { icon: Calendar, color: "text-green-600 bg-green-100" },
  invoice: { icon: Receipt, color: "text-amber-600 bg-amber-100" },
};

const ActivityFeedItem = React.forwardRef<HTMLLIElement, ActivityFeedItemProps>(
  ({ activity, isLast = false }, ref) => {
    const config = entityConfig[activity.entityType];
    const Icon = config.icon;

    return (
      <li ref={ref}>
        <div className="relative pb-6">
          {/* Connector line */}
          {!isLast && (
            <span
              className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
              aria-hidden="true"
            />
          )}

          <Link
            href={activity.href}
            className="group relative flex space-x-3 rounded-md p-1 transition-colors hover:bg-gray-50"
          >
            {/* Icon */}
            <div>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-gray-700">
                  {activity.description}
                </p>
              </div>
              <div className="whitespace-nowrap text-right text-xs text-gray-500">
                {formatRelativeTime(activity.createdAt)}
              </div>
            </div>
          </Link>
        </div>
      </li>
    );
  }
);
ActivityFeedItem.displayName = "ActivityFeedItem";

export { ActivityFeedItem };
