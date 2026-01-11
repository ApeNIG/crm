"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import { useDeleteBooking } from "@/hooks/useBookings";
import type { Booking, Contact, ServiceType } from "@prisma/client";

interface BookingListProps {
  bookings: (Booking & {
    contact: Contact;
    serviceType: ServiceType;
  })[];
}

export function BookingList({ bookings }: BookingListProps) {
  const router = useRouter();
  const deleteBooking = useDeleteBooking();

  const handleDelete = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await deleteBooking.mutateAsync(bookingId);
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const handleRowClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No bookings found</p>
        <Link href="/bookings/new">
          <Button className="mt-4">Create Booking</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => {
              const contactName = `${booking.contact.firstName} ${booking.contact.lastName}`.trim();
              const statusConfig = STATUS_CONFIG[booking.status];
              const isVirtual = booking.location?.toLowerCase() === "virtual";

              return (
                <tr
                  key={booking.id}
                  onClick={() => handleRowClick(booking.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{contactName}</div>
                    <div className="text-sm text-gray-500">{booking.contact.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.serviceType.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.startAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.location ? (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {isVirtual ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        <span className="max-w-[150px] truncate">
                          {booking.location}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/bookings/${booking.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, booking.id)}
                        disabled={deleteBooking.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
