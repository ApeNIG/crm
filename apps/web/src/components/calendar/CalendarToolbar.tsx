"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { Plus } from "lucide-react";

interface CalendarToolbarProps {
  /** Optional subtitle or current date display */
  subtitle?: string;
}

export function CalendarToolbar({ subtitle }: CalendarToolbarProps) {
  return (
    <PageHeader
      title="Calendar"
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/bookings">
            <Button variant="outline">View List</Button>
          </Link>
          <Link href="/bookings/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </Link>
        </div>
      }
    />
  );
}
