"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { BookingForm } from "@/components/bookings";
import { useBooking, useUpdateBooking } from "@/hooks/useBookings";
import { useContacts } from "@/hooks/useContacts";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { DROPDOWN_DEFAULT_LIMIT } from "@/lib/constants";
import type { CreateBookingInput } from "@/lib/validations/booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBookingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: booking, isLoading: bookingLoading, error } = useBooking(id);
  const { data: contactsData, isLoading: contactsLoading } = useContacts({
    limit: DROPDOWN_DEFAULT_LIMIT,
  });
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes({
    isActive: true,
    limit: DROPDOWN_DEFAULT_LIMIT,
  });
  const updateBooking = useUpdateBooking();

  const handleSubmit = async (data: CreateBookingInput) => {
    try {
      await updateBooking.mutateAsync({
        id,
        data: data as Record<string, unknown>,
      });
      router.push(`/bookings/${id}`);
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  if (bookingLoading || contactsLoading || serviceTypesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-destructive">Booking not found</div>
        <Link href="/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/bookings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Booking
      </Link>
      <PageHeader title="Edit Booking" />
      <div className="max-w-2xl">
        <BookingForm
          booking={booking}
          contacts={contactsData?.contacts || []}
          serviceTypes={serviceTypesData?.serviceTypes || []}
          onSubmit={handleSubmit}
          isLoading={updateBooking.isPending}
        />
      </div>
    </div>
  );
}
