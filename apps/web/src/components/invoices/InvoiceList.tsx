"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatCurrency, decimalToNumber } from "@/lib/utils";
import { STATUS_CONFIG, getStatusLabel } from "./statusConfig";
import { useDeleteInvoice, useSendInvoice } from "@/hooks/useInvoices";
import type { InvoiceListItem } from "@/types/invoice";

interface InvoiceListProps {
  invoices: InvoiceListItem[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const router = useRouter();
  const deleteInvoice = useDeleteInvoice();
  const sendInvoice = useSendInvoice();

  const handleDelete = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await deleteInvoice.mutateAsync(invoiceId);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  const handleSend = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to send this invoice?")) return;

    try {
      await sendInvoice.mutateAsync(invoiceId);
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  const handleRowClick = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No invoices found</p>
        <Link href="/invoices/new">
          <Button className="mt-4">Create Invoice</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const contactName = `${invoice.contact.firstName} ${invoice.contact.lastName}`.trim();
              const statusConfig = STATUS_CONFIG[invoice.status];
              const total = decimalToNumber(invoice.total);
              const amountDue = decimalToNumber(invoice.amountDue);
              const isDraft = invoice.status === "DRAFT";

              return (
                <tr
                  key={invoice.id}
                  onClick={() => handleRowClick(invoice.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                    {invoice.booking && (
                      <div className="text-sm text-gray-500">
                        {invoice.booking.serviceType.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contactName}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.contact.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.issueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}
                    >
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(total)}
                    </div>
                    {amountDue > 0 && amountDue !== total && (
                      <div className="text-sm text-amber-600">
                        Due: {formatCurrency(amountDue)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isDraft && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSend(e, invoice.id)}
                            disabled={sendInvoice.isPending}
                            title="Send Invoice"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, invoice.id)}
                        disabled={deleteInvoice.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
