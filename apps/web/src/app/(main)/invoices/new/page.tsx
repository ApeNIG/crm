"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout";
import { InvoiceForm } from "@/components/invoices";
import { useCreateInvoice } from "@/hooks/useInvoices";
import type { CreateInvoiceInput } from "@/lib/validations/invoice";
import type { Contact, Booking, ServiceType } from "@prisma/client";

async function fetchContacts(): Promise<{ contacts: Contact[] }> {
  const res = await fetch("/api/contacts?limit=1000");
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

async function fetchBookings(): Promise<{
  bookings: (Booking & { contact: Contact; serviceType: ServiceType })[];
}> {
  const res = await fetch("/api/bookings?limit=1000&status=COMPLETED");
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultContactId = searchParams.get("contactId") || undefined;
  const defaultBookingId = searchParams.get("bookingId") || undefined;

  const createInvoice = useCreateInvoice();

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts", "all"],
    queryFn: fetchContacts,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", "completed"],
    queryFn: fetchBookings,
  });

  const handleSubmit = async (data: CreateInvoiceInput) => {
    const invoice = await createInvoice.mutateAsync(data);
    router.push(`/invoices/${invoice.id}`);
  };

  if (contactsLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Invoices
      </Link>
      <PageHeader
        title="New Invoice"
        subtitle="Create a new invoice for a contact"
      />
      <div className="max-w-3xl">
        <InvoiceForm
          contacts={contactsData?.contacts || []}
          bookings={bookingsData?.bookings || []}
          defaultContactId={defaultContactId}
          defaultBookingId={defaultBookingId}
          onSubmit={handleSubmit}
          isLoading={createInvoice.isPending}
        />
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-foreground-muted">Loading...</div></div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
