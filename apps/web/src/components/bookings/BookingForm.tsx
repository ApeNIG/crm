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
  bookingFormSchema,
  type CreateBookingInput,
  type BookingFormValues,
} from "@/lib/validations/booking";
import { STATUS_ORDER, STATUS_CONFIG } from "./statusConfig";
import type { BookingWithAll } from "@/types/booking";
import type { Contact, ServiceType, Enquiry } from "@prisma/client";

interface BookingFormProps {
  booking?: BookingWithAll;
  contacts: Contact[];
  serviceTypes: ServiceType[];
  enquiries?: (Enquiry & { contact: Contact })[];
  defaultContactId?: string;
  defaultEnquiryId?: string;
  /** Default start date/time (ISO string or Date) for pre-filling from calendar */
  defaultStartAt?: string | Date;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  isLoading?: boolean;
}

export function BookingForm({
  booking,
  contacts,
  serviceTypes,
  enquiries = [],
  defaultContactId,
  defaultEnquiryId,
  defaultStartAt,
  onSubmit,
  isLoading,
}: BookingFormProps) {
  const router = useRouter();
  const isEditing = !!booking;

  // Get contact ID from enquiry if defaultEnquiryId is provided
  const enquiryContact = defaultEnquiryId
    ? enquiries.find((e) => e.id === defaultEnquiryId)?.contactId
    : undefined;

  // Format default start time if provided (from calendar click)
  const formattedDefaultStartAt = defaultStartAt
    ? new Date(defaultStartAt).toISOString().slice(0, 16)
    : "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: booking
      ? {
          contactId: booking.contactId,
          serviceTypeId: booking.serviceTypeId,
          enquiryId: booking.enquiryId || "",
          startAt: new Date(booking.startAt).toISOString().slice(0, 16),
          endAt: new Date(booking.endAt).toISOString().slice(0, 16),
          status: booking.status,
          location: booking.location || "",
          virtualLink: booking.virtualLink || "",
          notes: booking.notes || "",
          depositPaid: booking.depositPaid,
        }
      : {
          contactId: defaultContactId || enquiryContact || "",
          serviceTypeId: "",
          enquiryId: defaultEnquiryId || "",
          startAt: formattedDefaultStartAt,
          endAt: "",
          status: "REQUESTED",
          location: "",
          virtualLink: "",
          notes: "",
          depositPaid: false,
        },
  });

  const watchLocation = watch("location");
  const isVirtual = watchLocation?.toLowerCase() === "virtual";

  const handleFormSubmit = async (formData: BookingFormValues) => {
    // Transform form string values to API types
    const data: CreateBookingInput = {
      contactId: formData.contactId,
      serviceTypeId: formData.serviceTypeId,
      enquiryId: formData.enquiryId || null,
      startAt: new Date(formData.startAt),
      endAt: new Date(formData.endAt),
      status: formData.status,
      location: formData.location || null,
      virtualLink: formData.virtualLink || null,
      notes: formData.notes || null,
      depositPaid: formData.depositPaid,
    };
    await onSubmit(data);
  };

  const handleVirtualClick = () => {
    setValue("location", "Virtual");
  };

  // Calculate end time based on service type duration
  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceTypeId = e.target.value;
    const selectedType = serviceTypes.find((st) => st.id === serviceTypeId);
    const startAt = watch("startAt");

    if (selectedType?.durationMinutes && startAt) {
      const startDate = new Date(startAt);
      const endDate = new Date(startDate.getTime() + selectedType.durationMinutes * 60000);
      setValue("endAt", endDate.toISOString().slice(0, 16));
    }
  };

  // Auto-calculate end time when start time changes
  const handleStartAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startAt = e.target.value;
    const serviceTypeId = watch("serviceTypeId");
    const selectedType = serviceTypes.find((st) => st.id === serviceTypeId);

    if (selectedType?.durationMinutes && startAt) {
      const startDate = new Date(startAt);
      const endDate = new Date(startDate.getTime() + selectedType.durationMinutes * 60000);
      setValue("endAt", endDate.toISOString().slice(0, 16));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Booking" : "New Booking"}</CardTitle>
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

          {/* Service type select */}
          <div className="space-y-2">
            <Label htmlFor="serviceTypeId">Service Type *</Label>
            <Select
              id="serviceTypeId"
              {...register("serviceTypeId")}
              onChange={(e) => {
                register("serviceTypeId").onChange(e);
                handleServiceTypeChange(e);
              }}
            >
              <option value="">Select a service type...</option>
              {serviceTypes.map((serviceType) => (
                <option key={serviceType.id} value={serviceType.id}>
                  {serviceType.name}
                  {serviceType.durationMinutes && ` (${serviceType.durationMinutes} min)`}
                </option>
              ))}
            </Select>
            {errors.serviceTypeId && (
              <p className="text-sm text-red-500">{errors.serviceTypeId.message}</p>
            )}
          </div>

          {/* Enquiry select (optional) */}
          {!isEditing && enquiries.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="enquiryId">Related Enquiry (optional)</Label>
              <Select id="enquiryId" {...register("enquiryId")}>
                <option value="">None</option>
                {enquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id}>
                    {enquiry.contact.firstName} {enquiry.contact.lastName} -{" "}
                    {enquiry.enquiryType}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Date/time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date/Time *</Label>
              <Input
                id="startAt"
                type="datetime-local"
                {...register("startAt")}
                onChange={(e) => {
                  register("startAt").onChange(e);
                  handleStartAtChange(e);
                }}
              />
              {errors.startAt && (
                <p className="text-sm text-red-500">{errors.startAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">End Date/Time *</Label>
              <Input
                id="endAt"
                type="datetime-local"
                {...register("endAt")}
              />
              {errors.endAt && (
                <p className="text-sm text-red-500">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status].label}
                </option>
              ))}
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location or address..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVirtualClick}
              >
                Virtual
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* Virtual link (shown when location is "Virtual") */}
          {isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Virtual Meeting Link</Label>
              <Input
                id="virtualLink"
                type="url"
                {...register("virtualLink")}
                placeholder="https://zoom.us/j/..."
              />
              {errors.virtualLink && (
                <p className="text-sm text-red-500">{errors.virtualLink.message}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about the booking..."
              rows={4}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Deposit paid */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="depositPaid"
              {...register("depositPaid")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="depositPaid" className="font-normal">
              Deposit paid
            </Label>
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
            : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
