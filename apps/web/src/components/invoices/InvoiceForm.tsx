"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  invoiceFormSchema,
  type CreateInvoiceInput,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { decimalToNumber } from "@/lib/utils";
import type { InvoiceWithAll } from "@/types/invoice";
import type { Contact, Booking, ServiceType } from "@prisma/client";

interface InvoiceFormProps {
  invoice?: InvoiceWithAll;
  contacts: Contact[];
  bookings?: (Booking & { contact: Contact; serviceType: ServiceType })[];
  defaultContactId?: string;
  defaultBookingId?: string;
  onSubmit: (data: CreateInvoiceInput) => Promise<void>;
  isLoading?: boolean;
}

export function InvoiceForm({
  invoice,
  contacts,
  bookings = [],
  defaultContactId,
  defaultBookingId,
  onSubmit,
  isLoading,
}: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = !!invoice;

  // Default due date: 30 days from today
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          contactId: invoice.contactId,
          bookingId: invoice.bookingId || "",
          issueDate: new Date(invoice.issueDate).toISOString().slice(0, 10),
          dueDate: new Date(invoice.dueDate).toISOString().slice(0, 10),
          taxRate: String(decimalToNumber(invoice.taxRate)),
          notes: invoice.notes || "",
          terms: invoice.terms || "",
        }
      : {
          contactId: defaultContactId || "",
          bookingId: defaultBookingId || "",
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: defaultDueDate.toISOString().slice(0, 10),
          taxRate: "0",
          notes: "",
          terms: "",
        },
  });

  const selectedContactId = watch("contactId");

  // Filter bookings by selected contact
  const filteredBookings = selectedContactId
    ? bookings.filter((b) => b.contactId === selectedContactId)
    : bookings;

  const handleFormSubmit = async (formData: InvoiceFormValues) => {
    const data: CreateInvoiceInput = {
      contactId: formData.contactId,
      bookingId: formData.bookingId || null,
      issueDate: new Date(formData.issueDate + "T00:00:00"),
      dueDate: new Date(formData.dueDate + "T00:00:00"),
      taxRate: parseFloat(formData.taxRate) || 0,
      notes: formData.notes || null,
      terms: formData.terms || null,
      lineItems: [], // Line items are added separately
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Invoice" : "New Invoice"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact select */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="contactId">Contact *</Label>
              <Select id="contactId" {...register("contactId")}>
                <option value="">Select a contact...</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} ({contact.email})
                  </option>
                ))}
              </Select>
              {errors.contactId && (
                <p className="text-sm text-red-500">{errors.contactId.message}</p>
              )}
            </div>
          )}

          {/* Booking select (optional) */}
          {!isEditing && filteredBookings.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="bookingId">Related Booking (optional)</Label>
              <Select id="bookingId" {...register("bookingId")}>
                <option value="">None</option>
                {filteredBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.serviceType.name} -{" "}
                    {new Date(booking.startAt).toLocaleDateString("en-GB")}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                {...register("issueDate")}
              />
              {errors.issueDate && (
                <p className="text-sm text-red-500">{errors.issueDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Tax rate */}
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("taxRate")}
              placeholder="0"
            />
            {errors.taxRate && (
              <p className="text-sm text-red-500">{errors.taxRate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notes to appear on the invoice..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Payment terms, conditions, etc..."
              rows={3}
            />
            {errors.terms && (
              <p className="text-sm text-red-500">{errors.terms.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
