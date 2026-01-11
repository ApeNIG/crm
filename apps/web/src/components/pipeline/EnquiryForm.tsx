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
  enquiryFormSchema,
  type CreateEnquiryInput,
  type EnquiryFormValues,
} from "@/lib/validations/enquiry";
import { STAGE_ORDER, STAGE_CONFIG } from "./stageConfig";
import type { EnquiryWithAll } from "@/types/enquiry";
import type { Contact } from "@prisma/client";

interface EnquiryFormProps {
  enquiry?: EnquiryWithAll;
  contacts: Contact[];
  onSubmit: (data: CreateEnquiryInput) => Promise<void>;
  isLoading?: boolean;
}

const typeOptions = [
  { value: "GENERAL", label: "General" },
  { value: "SERVICE", label: "Service" },
  { value: "PRODUCT", label: "Product" },
  { value: "PARTNERSHIP", label: "Partnership" },
];

export function EnquiryForm({
  enquiry,
  contacts,
  onSubmit,
  isLoading,
}: EnquiryFormProps) {
  const router = useRouter();
  const isEditing = !!enquiry;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: enquiry
      ? {
          contactId: enquiry.contactId,
          enquiryType: enquiry.enquiryType,
          message: enquiry.message || "",
          preferredDate: enquiry.preferredDate
            ? new Date(enquiry.preferredDate).toISOString().slice(0, 16)
            : "",
          preferredTime: enquiry.preferredTime || "",
          estimatedValue: enquiry.estimatedValue?.toString() || "",
          stage: enquiry.stage,
          nextActionAt: enquiry.nextActionAt
            ? new Date(enquiry.nextActionAt).toISOString().slice(0, 16)
            : "",
          sourceUrl: enquiry.sourceUrl || "",
        }
      : {
          contactId: "",
          enquiryType: "GENERAL",
          message: "",
          preferredDate: "",
          preferredTime: "",
          estimatedValue: "",
          stage: "NEW",
          nextActionAt: "",
          sourceUrl: "",
        },
  });

  const handleFormSubmit = async (formData: EnquiryFormValues) => {
    // Transform form string values to API types
    const data: CreateEnquiryInput = {
      contactId: formData.contactId,
      enquiryType: formData.enquiryType,
      stage: formData.stage,
      message: formData.message || null,
      preferredTime: formData.preferredTime || null,
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate) : null,
      nextActionAt: formData.nextActionAt ? new Date(formData.nextActionAt) : null,
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      sourceUrl: formData.sourceUrl || null,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Enquiry" : "New Enquiry"}</CardTitle>
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

          {/* Type and Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enquiryType">Enquiry Type</Label>
              <Select id="enquiryType" {...register("enquiryType")}>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select id="stage" {...register("stage")}>
                {STAGE_ORDER.map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_CONFIG[stage].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Details about the enquiry..."
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="datetime-local"
                {...register("preferredDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Input
                id="preferredTime"
                type="text"
                {...register("preferredTime")}
                placeholder="e.g., Morning, 2-4pm"
              />
            </div>
          </div>

          {/* Value and Next Action */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value (£)</Label>
              <Input
                id="estimatedValue"
                type="number"
                step="0.01"
                min="0"
                {...register("estimatedValue")}
                placeholder="0.00"
              />
              {errors.estimatedValue && (
                <p className="text-sm text-red-500">{errors.estimatedValue.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextActionAt">Next Action Date</Label>
              <Input
                id="nextActionAt"
                type="datetime-local"
                {...register("nextActionAt")}
              />
            </div>
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              type="url"
              {...register("sourceUrl")}
              placeholder="https://..."
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-500">{errors.sourceUrl.message}</p>
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
            : "Create Enquiry"}
        </Button>
      </div>
    </form>
  );
}
