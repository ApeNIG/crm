"use client";

import { Suspense } from "react";
import { BookingCalendar, CalendarToolbar } from "@/components/calendar";

function CalendarLoading() {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-foreground-muted">Loading calendar...</div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <CalendarToolbar subtitle="Manage your bookings visually" />

      <Suspense fallback={<CalendarLoading />}>
        <BookingCalendar
          initialView="timeGridWeek"
          businessHoursStart="09:00:00"
          businessHoursEnd="18:00:00"
          height="auto"
        />
      </Suspense>

      {/* Quick tips */}
      <div className="bg-surface-inset rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Quick Tips</h3>
        <ul className="text-sm text-foreground-muted space-y-1">
          <li>Click on any time slot to create a new booking at that time</li>
          <li>Click on a booking to view its details</li>
          <li>Use the navigation buttons to move between weeks or months</li>
          <li>Colors indicate booking status - see the legend below the calendar</li>
        </ul>
      </div>
    </div>
  );
}
