"use client";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { useDeleteLineItem } from "@/hooks/useInvoices";
import type { InvoiceLineItem } from "@prisma/client";

interface LineItemsTableProps {
  lineItems: InvoiceLineItem[];
  invoiceId: string;
  isEditable?: boolean;
  onEdit?: (item: InvoiceLineItem) => void;
}

export function LineItemsTable({
  lineItems,
  invoiceId,
  isEditable = false,
  onEdit,
}: LineItemsTableProps) {
  const deleteLineItem = useDeleteLineItem();

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this line item?")) return;

    try {
      await deleteLineItem.mutateAsync({ invoiceId, itemId });
    } catch (error) {
      console.error("Failed to delete line item:", error);
    }
  };

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No line items yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            {isEditable && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.description}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                {decimalToNumber(item.quantity)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                {formatCurrency(decimalToNumber(item.unitPrice))}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                {formatCurrency(decimalToNumber(item.total))}
              </td>
              {isEditable && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLineItem.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
