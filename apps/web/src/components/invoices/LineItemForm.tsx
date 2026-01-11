"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  lineItemFormSchema,
  type LineItemFormValues,
  type CreateLineItemInput,
} from "@/lib/validations/invoice";
import { useAddLineItem, useUpdateLineItem } from "@/hooks/useInvoices";
import { decimalToNumber } from "@/lib/utils";
import type { InvoiceLineItem } from "@prisma/client";

interface LineItemFormProps {
  invoiceId: string;
  lineItem?: InvoiceLineItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LineItemForm({
  invoiceId,
  lineItem,
  onSuccess,
  onCancel,
}: LineItemFormProps) {
  const addLineItem = useAddLineItem();
  const updateLineItem = useUpdateLineItem();
  const isEditing = !!lineItem;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LineItemFormValues>({
    resolver: zodResolver(lineItemFormSchema),
    defaultValues: lineItem
      ? {
          description: lineItem.description,
          quantity: String(decimalToNumber(lineItem.quantity)),
          unitPrice: String(decimalToNumber(lineItem.unitPrice)),
        }
      : {
          description: "",
          quantity: "1",
          unitPrice: "",
        },
  });

  const onSubmit = async (formData: LineItemFormValues) => {
    const data: CreateLineItemInput = {
      description: formData.description,
      quantity: parseFloat(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      sortOrder: 0,
    };

    try {
      if (isEditing) {
        await updateLineItem.mutateAsync({
          invoiceId,
          itemId: lineItem.id,
          data,
        });
      } else {
        await addLineItem.mutateAsync({ invoiceId, data });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save line item:", error);
    }
  };

  const isLoading = addLineItem.isPending || updateLineItem.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Service or item description"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            {...register("unitPrice")}
            placeholder="0.00"
          />
          {errors.unitPrice && (
            <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Item"
            : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
