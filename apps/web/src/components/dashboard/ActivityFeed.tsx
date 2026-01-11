"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeedItem } from "./ActivityFeedItem";
import { useDashboardActivity } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

interface ActivityFeedProps {
  /** Initial activities from dashboard data (optional) */
  initialActivities?: {
    id: string;
    entityType: "contact" | "enquiry" | "booking" | "invoice";
    entityId: string;
    type: string;
    description: string;
    href: string;
    createdAt: string;
  }[];
}

export function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useDashboardActivity();

  // Use initial activities if provided and no data loaded yet
  const activities =
    data?.pages.flatMap((page) => page.activities) ??
    initialActivities ??
    [];

  if (isLoading && !initialActivities) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load activity feed
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No recent activity
          </div>
        ) : (
          <>
            <div className="flow-root">
              <ul className="-mb-6">
                {activities.map((activity, index) => (
                  <ActivityFeedItem
                    key={activity.id}
                    activity={activity}
                    isLast={index === activities.length - 1}
                  />
                ))}
              </ul>
            </div>

            {hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
