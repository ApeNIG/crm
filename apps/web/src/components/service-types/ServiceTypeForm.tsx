"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  serviceTypeFormSchema,
  type CreateServiceTypeInput,
  type ServiceTypeFormValues,
} from "@/lib/validations/service-type";
import type { ServiceType } from "@/types/service-type";

interface ServiceTypeFormProps {
  serviceType?: ServiceType;
  onSubmit: (data: CreateServiceTypeInput) => Promise<void>;
  isLoading?: boolean;
}

// Helper to convert Prisma Decimal to string
function priceToString(price: unknown): string {
  if (price === null || price === undefined) {
    return "";
  }
  // Handle Prisma Decimal type
  if (typeof price === "object" && price !== null && "toNumber" in price) {
    return (price as { toNumber: () => number }).toNumber().toString();
  }
  return String(price);
}

export function ServiceTypeForm({
  serviceType,
  onSubmit,
  isLoading,
}: ServiceTypeFormProps) {
  const router = useRouter();
  const isEditing = !!serviceType;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeFormSchema),
    defaultValues: serviceType
      ? {
          name: serviceType.name,
          description: serviceType.description || "",
          durationMinutes: String(serviceType.durationMinutes),
          price: priceToString(serviceType.price),
          isActive: serviceType.isActive,
        }
      : {
          name: "",
          description: "",
          durationMinutes: "60",
          price: "",
          isActive: true,
        },
  });

  const handleFormSubmit = async (formData: ServiceTypeFormValues) => {
    // Transform form string values to API types
    const data: CreateServiceTypeInput = {
      name: formData.name,
      description: formData.description || null,
      durationMinutes: parseInt(formData.durationMinutes, 10),
      price: formData.price ? parseFloat(formData.price) : null,
      isActive: formData.isActive,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Service Type" : "New Service Type"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., 1-Hour Session"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Details about this service type..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="5"
                max="480"
                {...register("durationMinutes")}
                placeholder="60"
              />
              {errors.durationMinutes && (
                <p className="text-sm text-red-500">{errors.durationMinutes.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price")}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active (available for booking)
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
            : "Create Service Type"}
        </Button>
      </div>
    </form>
  );
}
