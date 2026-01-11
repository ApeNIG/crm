"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { InvoiceForm } from "@/components/invoices";
import { useInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import type { CreateInvoiceInput } from "@/lib/validations/invoice";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: invoice, isLoading, error } = useInvoice(id);
  const updateInvoice = useUpdateInvoice();

  const handleSubmit = async (data: CreateInvoiceInput) => {
    await updateInvoice.mutateAsync({ id, data });
    router.push(`/invoices/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-destructive">
          {error?.message || "Invoice not found"}
        </div>
        <Link href="/invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  // Only DRAFT invoices can be edited
  if (invoice.status !== "DRAFT") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-warning">Only DRAFT invoices can be edited</div>
        <Link href={`/invoices/${id}`}>
          <Button variant="outline">View Invoice</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/invoices/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Invoice
      </Link>
      <PageHeader title="Edit Invoice" />
      <div className="max-w-3xl">
        <InvoiceForm
          invoice={invoice}
          contacts={[invoice.contact]}
          onSubmit={handleSubmit}
          isLoading={updateInvoice.isPending}
        />
      </div>
    </div>
  );
}
