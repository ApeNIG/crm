"use client";

import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InvoiceSummaryProps {
  subtotal: number | unknown;
  taxRate: number | unknown;
  taxAmount: number | unknown;
  total: number | unknown;
  amountPaid: number | unknown;
  amountDue: number | unknown;
  className?: string;
}

export function InvoiceSummary({
  subtotal,
  taxRate,
  taxAmount,
  total,
  amountPaid,
  amountDue,
  className,
}: InvoiceSummaryProps) {
  const subtotalNum = decimalToNumber(subtotal);
  const taxRateNum = decimalToNumber(taxRate);
  const taxAmountNum = decimalToNumber(taxAmount);
  const totalNum = decimalToNumber(total);
  const amountPaidNum = decimalToNumber(amountPaid);
  const amountDueNum = decimalToNumber(amountDue);

  return (
    <div className={cn("bg-gray-50 rounded-lg p-4", className)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subtotalNum)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Tax ({taxRateNum.toFixed(1)}%)
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(taxAmountNum)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(totalNum)}
            </span>
          </div>
        </div>

        {amountPaidNum > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(amountPaidNum)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Amount Due</span>
                <span
                  className={cn(
                    "font-bold",
                    amountDueNum > 0 ? "text-amber-600" : "text-green-600"
                  )}
                >
                  {formatCurrency(amountDueNum)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
