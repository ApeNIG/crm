"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Plus, Calendar, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import { LineItemsTable } from "./LineItemsTable";
import { LineItemForm } from "./LineItemForm";
import { PaymentsList } from "./PaymentsList";
import { PaymentForm } from "./PaymentForm";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceActivityTimeline } from "./InvoiceActivityTimeline";
import { useDeleteInvoice, useSendInvoice } from "@/hooks/useInvoices";
import type { InvoiceWithAll } from "@/types/invoice";
import type { InvoiceLineItem } from "@prisma/client";

interface InvoiceDetailProps {
  invoice: InvoiceWithAll;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const deleteInvoice = useDeleteInvoice();
  const sendInvoice = useSendInvoice();

  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<InvoiceLineItem | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await deleteInvoice.mutateAsync(invoice.id);
      router.push("/invoices");
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  const handleSend = async () => {
    if (!confirm("Are you sure you want to send this invoice? It cannot be edited after sending.")) return;

    try {
      await sendInvoice.mutateAsync(invoice.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  const handleEditLineItem = (item: InvoiceLineItem) => {
    setEditingLineItem(item);
    setShowLineItemForm(true);
  };

  const handleLineItemFormSuccess = () => {
    setShowLineItemForm(false);
    setEditingLineItem(null);
    router.refresh();
  };

  const handlePaymentFormSuccess = () => {
    setShowPaymentForm(false);
    router.refresh();
  };

  const contactName = `${invoice.contact.firstName} ${invoice.contact.lastName}`.trim();
  const statusConfig = STATUS_CONFIG[invoice.status];
  const isDraft = invoice.status === "DRAFT";
  const canRecordPayment = ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {getStatusLabel(invoice.status)}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{contactName}</p>
        </div>

        <div className="flex gap-2">
          {isDraft && (
            <>
              <Button
                variant="outline"
                onClick={handleSend}
                disabled={sendInvoice.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendInvoice.isPending ? "Sending..." : "Send Invoice"}
              </Button>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </>
          )}
          {canRecordPayment && (
            <Button
              variant="outline"
              onClick={() => setShowPaymentForm(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteInvoice.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleteInvoice.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Issue Date
                  </h4>
                  <p className="mt-1 text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Due Date
                  </h4>
                  <p className="mt-1 text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              {invoice.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {invoice.terms && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Terms & Conditions
                  </h4>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {invoice.terms}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Created {formatDate(invoice.createdAt)} · Updated{" "}
                  {formatDate(invoice.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {isDraft && !showLineItemForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLineItemForm(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showLineItemForm ? (
                <LineItemForm
                  invoiceId={invoice.id}
                  lineItem={editingLineItem || undefined}
                  onSuccess={handleLineItemFormSuccess}
                  onCancel={() => {
                    setShowLineItemForm(false);
                    setEditingLineItem(null);
                  }}
                />
              ) : (
                <LineItemsTable
                  lineItems={invoice.lineItems}
                  invoiceId={invoice.id}
                  isEditable={isDraft}
                  onEdit={handleEditLineItem}
                />
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payments</CardTitle>
              {canRecordPayment && !showPaymentForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Record Payment
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showPaymentForm ? (
                <PaymentForm
                  invoiceId={invoice.id}
                  amountDue={invoice.amountDue}
                  onSuccess={handlePaymentFormSuccess}
                  onCancel={() => setShowPaymentForm(false)}
                />
              ) : (
                <PaymentsList
                  payments={invoice.payments}
                  invoiceId={invoice.id}
                  isEditable={canRecordPayment}
                />
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceActivityTimeline activities={invoice.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceSummary
                subtotal={invoice.subtotal}
                taxRate={invoice.taxRate}
                taxAmount={invoice.taxAmount}
                total={invoice.total}
                amountPaid={invoice.amountPaid}
                amountDue={invoice.amountDue}
              />
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <Link
                  href={`/contacts/${invoice.contact.id}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {contactName}
                </Link>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <a
                  href={`mailto:${invoice.contact.email}`}
                  className="mt-1 text-blue-600 hover:underline"
                >
                  {invoice.contact.email}
                </a>
              </div>

              {invoice.contact.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <a
                    href={`tel:${invoice.contact.phone}`}
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    {invoice.contact.phone}
                  </a>
                </div>
              )}

              <div className="pt-3">
                <Link href={`/contacts/${invoice.contact.id}`}>
                  <Button variant="outline" className="w-full">
                    View Contact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Related Booking */}
          {invoice.booking && (
            <Card>
              <CardHeader>
                <CardTitle>Related Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  {invoice.booking.serviceType.name}
                </p>
                <p className="text-sm text-gray-900 mb-3">
                  {formatDate(invoice.booking.startAt)}
                </p>
                <Link href={`/bookings/${invoice.booking.id}`}>
                  <Button variant="outline" className="w-full">
                    View Booking
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
