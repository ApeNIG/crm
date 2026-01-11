"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarBookings } from "@/hooks/useBookings";
import { STATUS_CONFIG } from "@/components/bookings/statusConfig";
import type { BookingStatus } from "@/types/booking";
import type { Booking, Contact, ServiceType } from "@prisma/client";
import "./calendar.css";

// Dynamic import for FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <div className="calendar-loading-spinner" />
    </div>
  ),
});

// Types
type BookingWithRelations = Booking & {
  contact: Contact;
  serviceType: ServiceType;
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  backgroundColor: string;
  textColor: string;
  classNames: string[];
  extendedProps: {
    booking: BookingWithRelations;
  };
}

// Status to color mapping for calendar events
const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  REQUESTED: { bg: "#dbeafe", text: "#1d4ed8" },
  PENDING_DEPOSIT: { bg: "#fef3c7", text: "#b45309" },
  CONFIRMED: { bg: "#dcfce7", text: "#15803d" },
  COMPLETED: { bg: "#d1fae5", text: "#047857" },
  CANCELLED: { bg: "#f3f4f6", text: "#374151" },
  NO_SHOW: { bg: "#fee2e2", text: "#b91c1c" },
  RESCHEDULED: { bg: "#f3e8ff", text: "#7c3aed" },
};

interface BookingCalendarProps {
  /** Initial view mode */
  initialView?: "timeGridWeek" | "dayGridMonth";
  /** Business hours start (default: "09:00:00") */
  businessHoursStart?: string;
  /** Business hours end (default: "18:00:00") */
  businessHoursEnd?: string;
  /** Calendar height (default: "auto") */
  height?: string | number;
}

export function BookingCalendar({
  initialView = "timeGridWeek",
  businessHoursStart = "09:00:00",
  businessHoursEnd = "18:00:00",
  height = "auto",
}: BookingCalendarProps) {
  const router = useRouter();

  // Track current date range for data fetching
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    // Default to current week view
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  });

  // Fetch bookings for current date range
  const { data, isLoading, error } = useCalendarBookings(
    dateRange.start,
    dateRange.end
  );

  // Transform bookings to FullCalendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.bookings) return [];

    return data.bookings.map((booking: BookingWithRelations) => {
      const contactName = `${booking.contact.firstName} ${booking.contact.lastName}`.trim();
      const statusColors = STATUS_COLORS[booking.status as BookingStatus] || STATUS_COLORS.REQUESTED;
      const statusClass = `status-${booking.status.toLowerCase()}`;

      return {
        id: booking.id,
        title: `${contactName} - ${booking.serviceType.name}`,
        start: new Date(booking.startAt),
        end: new Date(booking.endAt),
        backgroundColor: statusColors.bg,
        textColor: statusColors.text,
        classNames: [statusClass],
        extendedProps: {
          booking,
        },
      };
    });
  }, [data?.bookings]);

  // Handle event click - navigate to booking detail
  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const bookingId = info.event.id;
      router.push(`/bookings/${bookingId}`);
    },
    [router]
  );

  // Handle date click - navigate to create booking with pre-filled date
  const handleDateClick = useCallback(
    (info: DateClickArg) => {
      const dateStr = info.date.toISOString();
      router.push(`/bookings/new?date=${encodeURIComponent(dateStr)}`);
    },
    [router]
  );

  // Handle view/range change - update date range for data fetching
  const handleDatesSet = useCallback((info: DatesSetArg) => {
    setDateRange({
      start: info.start,
      end: info.end,
    });
  }, []);

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4">
      {/* Loading overlay */}
      {isLoading && (
        <div className="calendar-loading">
          <div className="calendar-loading-spinner" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load bookings</p>
            <p className="text-gray-500 text-sm mt-1">Please try again later</p>
          </div>
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,dayGridMonth",
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={handleDatesSet}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        firstDay={1} // Monday
        nowIndicator={true}
        height={height}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: businessHoursStart,
          endTime: businessHoursEnd,
        }}
        weekends={true}
        dayMaxEvents={3} // Show +more link when too many events
        eventDisplay="block"
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        titleFormat={{
          year: "numeric",
          month: "long",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
        }}
        // Accessibility
        navLinks={true}
        selectable={true}
        selectMirror={true}
        // Mobile responsive
        handleWindowResize={true}
      />

      {/* Status legend */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor:
                    STATUS_COLORS[status as BookingStatus]?.bg || "#e5e7eb",
                }}
              />
              <span className="text-xs text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
