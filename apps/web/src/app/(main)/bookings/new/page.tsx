"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { BookingForm } from "@/components/bookings";
import { useCreateBooking } from "@/hooks/useBookings";
import { useContacts } from "@/hooks/useContacts";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useEnquiries } from "@/hooks/useEnquiries";
import { DROPDOWN_DEFAULT_LIMIT } from "@/lib/constants";
import type { CreateBookingInput } from "@/lib/validations/booking";

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get optional pre-selected values from query params
  const defaultContactId = searchParams.get("contactId") || undefined;
  const defaultEnquiryId = searchParams.get("enquiryId") || undefined;
  const defaultDate = searchParams.get("date") || undefined;

  const createBooking = useCreateBooking();
  const { data: contactsData, isLoading: contactsLoading } = useContacts({
    limit: DROPDOWN_DEFAULT_LIMIT,
  });
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes({
    isActive: true,
    limit: DROPDOWN_DEFAULT_LIMIT,
  });
  const { data: enquiriesData, isLoading: enquiriesLoading } = useEnquiries({
    limit: DROPDOWN_DEFAULT_LIMIT,
  });

  const handleSubmit = async (data: CreateBookingInput) => {
    try {
      const booking = await createBooking.mutateAsync(data as Record<string, unknown>);
      router.push(`/bookings/${booking.id}`);
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  if (contactsLoading || serviceTypesLoading || enquiriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bookings
      </Link>
      <PageHeader
        title="New Booking"
        subtitle="Create a new booking for a contact"
      />
      <div className="max-w-2xl">
        <BookingForm
          contacts={contactsData?.contacts || []}
          serviceTypes={serviceTypesData?.serviceTypes || []}
          enquiries={enquiriesData?.enquiries || []}
          defaultContactId={defaultContactId}
          defaultEnquiryId={defaultEnquiryId}
          defaultStartAt={defaultDate}
          onSubmit={handleSubmit}
          isLoading={createBooking.isPending}
        />
      </div>
    </div>
  );
}
