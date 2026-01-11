"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Video, ExternalLink, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate, formatDateTime, formatTime } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import { BookingActivityTimeline } from "./BookingActivityTimeline";
import { useDeleteBooking } from "@/hooks/useBookings";
import type { BookingWithAll } from "@/types/booking";

interface BookingDetailProps {
  booking: BookingWithAll;
}

export function BookingDetail({ booking }: BookingDetailProps) {
  const router = useRouter();
  const deleteBooking = useDeleteBooking();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await deleteBooking.mutateAsync(booking.id);
      router.push("/bookings");
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const contactName = `${booking.contact.firstName} ${booking.contact.lastName}`.trim();
  const statusConfig = STATUS_CONFIG[booking.status];
  const isVirtual = booking.location?.toLowerCase() === "virtual";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{contactName}</h1>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{booking.serviceType.name}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/bookings/${booking.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteBooking.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleteBooking.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </h4>
                  <p className="mt-1 text-gray-900">
                    {formatDate(booking.startAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </h4>
                  <p className="mt-1 text-gray-900">
                    {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                  </p>
                </div>
              </div>

              {/* Location */}
              {booking.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {isVirtual ? (
                      <Video className="w-4 h-4 inline mr-1" />
                    ) : (
                      <MapPin className="w-4 h-4 inline mr-1" />
                    )}
                    Location
                  </h4>
                  <p className="mt-1 text-gray-900">{booking.location}</p>
                  {isVirtual && booking.virtualLink && (
                    <a
                      href={booking.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Service Type Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Service</h4>
                  <p className="mt-1 text-gray-900">{booking.serviceType.name}</p>
                </div>
                {booking.serviceType.durationMinutes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                    <p className="mt-1 text-gray-900">
                      {booking.serviceType.durationMinutes} minutes
                    </p>
                  </div>
                )}
              </div>

              {/* Deposit Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Deposit</h4>
                <p className="mt-1">
                  {booking.depositPaid ? (
                    <span className="text-green-600 font-medium">Paid</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Not Paid</span>
                  )}
                </p>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Created {formatDate(booking.createdAt)} · Updated{" "}
                  {formatDate(booking.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingActivityTimeline activities={booking.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <Link
                  href={`/contacts/${booking.contact.id}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {contactName}
                </Link>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <a
                  href={`mailto:${booking.contact.email}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {booking.contact.email}
                </a>
              </div>

              {booking.contact.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <a
                    href={`tel:${booking.contact.phone}`}
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    {booking.contact.phone}
                  </a>
                </div>
              )}

              <div className="pt-3">
                <Link href={`/contacts/${booking.contact.id}`}>
                  <Button variant="outline" className="w-full">
                    View Contact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Related Enquiry */}
          {booking.enquiry && (
            <Card>
              <CardHeader>
                <CardTitle>Related Enquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">
                  This booking was created from an enquiry.
                </p>
                <Link href={`/pipeline/${booking.enquiry.id}`}>
                  <Button variant="outline" className="w-full">
                    View Enquiry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
