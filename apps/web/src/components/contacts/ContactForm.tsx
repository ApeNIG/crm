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
  createContactSchema,
  type CreateContactInput,
} from "@/lib/validations/contact";
import type { Contact, Tag } from "@prisma/client";

// Form values type (what the form works with internally)
type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: "INSTAGRAM" | "WEBSITE" | "REFERRAL" | "WALK_IN" | "OTHER";
  status: "LEAD" | "CUSTOMER" | "PAST_CUSTOMER" | "COLD" | "DO_NOT_CONTACT";
  marketingOptIn: boolean;
  notes: string;
  tagIds: string[];
};

interface ContactFormProps {
  contact?: Contact & { tags: { tag: Tag }[] };
  tags: Tag[];
  onSubmit: (data: CreateContactInput) => Promise<void>;
  isLoading?: boolean;
}

const sourceOptions = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "PAST_CUSTOMER", label: "Past Customer" },
  { value: "COLD", label: "Cold" },
  { value: "DO_NOT_CONTACT", label: "Do Not Contact" },
];

export function ContactForm({
  contact,
  tags,
  onSubmit,
  isLoading,
}: ContactFormProps) {
  const router = useRouter();
  const isEditing = !!contact;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: contact
      ? {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone || "",
          source: contact.source,
          status: contact.status,
          marketingOptIn: contact.marketingOptIn,
          notes: contact.notes || "",
          tagIds: contact.tags.map((t: { tag: Tag }) => t.tag.id),
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          source: "OTHER",
          status: "LEAD",
          marketingOptIn: false,
          notes: "",
          tagIds: [],
        },
  });

  const handleFormSubmit = async (formData: ContactFormValues) => {
    // Parse through zod to get the final type with transformations
    const data = createContactSchema.parse(formData);
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Contact" : "New Contact"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+44 7700 900000"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Source and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select id="source" {...register("source")}>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={tag.id}
                    {...register("tagIds")}
                    className="rounded border-gray-300"
                  />
                  <span
                    className="text-sm px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tag.color, color: "#fff" }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-gray-500">No tags available</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any notes about this contact..."
              rows={4}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Marketing Opt-in */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="marketingOptIn"
              {...register("marketingOptIn")}
              className="mt-1 rounded border-gray-300"
            />
            <div>
              <Label htmlFor="marketingOptIn" className="cursor-pointer">
                Marketing Consent
              </Label>
              <p className="text-sm text-gray-500">
                Contact agrees to receive marketing communications
              </p>
            </div>
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
            : "Create Contact"}
        </Button>
      </div>
    </form>
  );
}
