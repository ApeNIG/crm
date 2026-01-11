"use client";

import Link from "next/link";
import { MapPin, Video, Calendar } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import type { Booking, Contact, ServiceType } from "@prisma/client";

interface BookingCardProps {
  booking: Booking & {
    contact: Contact;
    serviceType: ServiceType;
  };
}

export function BookingCard({ booking }: BookingCardProps) {
  const contactName = `${booking.contact.firstName} ${booking.contact.lastName}`.trim();
  const statusConfig = STATUS_CONFIG[booking.status];
  const isVirtual = booking.location?.toLowerCase() === "virtual";

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className={cn(
        "block bg-white rounded-lg border border-gray-200 p-4 shadow-sm",
        "hover:border-gray-300 hover:shadow-md transition-all"
      )}
    >
      {/* Contact name and status */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-gray-900 truncate">{contactName}</div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
            statusConfig.bgColor,
            statusConfig.color
          )}
        >
          {getStatusLabel(booking.status)}
        </span>
      </div>

      {/* Service type */}
      <div className="mt-1 text-sm text-gray-600">
        {booking.serviceType.name}
      </div>

      {/* Date/time */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>{formatDateTime(booking.startAt)}</span>
      </div>

      {/* Location */}
      {booking.location && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          {isVirtual ? (
            <Video className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="truncate">{booking.location}</span>
        </div>
      )}
    </Link>
  );
}
