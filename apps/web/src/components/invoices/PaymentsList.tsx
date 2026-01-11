"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, decimalToNumber } from "@/lib/utils";
import { getPaymentMethodLabel } from "./statusConfig";
import { useDeletePayment } from "@/hooks/useInvoices";
import type { Payment } from "@prisma/client";

interface PaymentsListProps {
  payments: Payment[];
  invoiceId: string;
  isEditable?: boolean;
}

export function PaymentsList({
  payments,
  invoiceId,
  isEditable = false,
}: PaymentsListProps) {
  const deletePayment = useDeletePayment();

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      await deletePayment.mutateAsync({ invoiceId, paymentId });
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payments recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {formatCurrency(decimalToNumber(payment.amount))}
              </span>
              <span className="text-sm text-gray-500">
                via {getPaymentMethodLabel(payment.method)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {formatDateTime(payment.paidAt)}
            </p>
            {payment.reference && (
              <p className="text-sm text-gray-500">
                Ref: {payment.reference}
              </p>
            )}
            {payment.notes && (
              <p className="text-sm text-gray-600">{payment.notes}</p>
            )}
          </div>

          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(payment.id)}
              disabled={deletePayment.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
