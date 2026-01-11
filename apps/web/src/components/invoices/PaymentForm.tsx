"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  paymentFormSchema,
  type PaymentFormValues,
  type CreatePaymentInput,
} from "@/lib/validations/invoice";
import { PAYMENT_METHOD_ORDER, PAYMENT_METHOD_CONFIG } from "./statusConfig";
import { useRecordPayment } from "@/hooks/useInvoices";
import { formatCurrency, decimalToNumber } from "@/lib/utils";

interface PaymentFormProps {
  invoiceId: string;
  amountDue: number | unknown;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({
  invoiceId,
  amountDue,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const recordPayment = useRecordPayment();
  const amountDueNum = decimalToNumber(amountDue);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: String(amountDueNum),
      method: "OTHER",
      reference: "",
      notes: "",
      paidAt: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (formData: PaymentFormValues) => {
    const data: CreatePaymentInput = {
      amount: parseFloat(formData.amount),
      method: formData.method,
      reference: formData.reference || null,
      notes: formData.notes || null,
      paidAt: formData.paidAt ? new Date(formData.paidAt) : new Date(),
    };

    try {
      await recordPayment.mutateAsync({ invoiceId, data });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to record payment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg text-sm">
        <p className="text-blue-700">
          Amount due: <span className="font-medium">{formatCurrency(amountDueNum)}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select id="method" {...register("method")}>
          {PAYMENT_METHOD_ORDER.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_CONFIG[method].label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidAt">Payment Date</Label>
        <Input
          id="paidAt"
          type="datetime-local"
          {...register("paidAt")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference (optional)</Label>
        <Input
          id="reference"
          {...register("reference")}
          placeholder="Transaction ID, cheque number, etc."
        />
        {errors.reference && (
          <p className="text-sm text-red-500">{errors.reference.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes about this payment..."
          rows={2}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={recordPayment.isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={recordPayment.isPending}>
          {recordPayment.isPending ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
