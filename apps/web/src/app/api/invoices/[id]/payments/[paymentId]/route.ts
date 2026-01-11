import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { uuidParamSchema } from "@/lib/validations/invoice";
import { decimalToNumber } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string; paymentId: string }> };

// DELETE /api/invoices/[id]/payments/[paymentId] - Delete a payment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id, paymentId } = await params;

  // Validate UUID format
  const idResult = uuidParamSchema.safeParse(id);
  const paymentIdResult = uuidParamSchema.safeParse(paymentId);
  if (!idResult.success || !paymentIdResult.success) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const invoice = await db.invoice.findUnique({
      where: { id, deletedAt: null },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payment = invoice.payments.find((p) => p.id === paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Calculate new amounts
    const paymentAmount = decimalToNumber(payment.amount);
    const currentAmountPaid = decimalToNumber(invoice.amountPaid);
    const total = decimalToNumber(invoice.total);
    const newAmountPaid = Math.round((currentAmountPaid - paymentAmount) * 100) / 100;
    const newAmountDue = Math.round((total - newAmountPaid) * 100) / 100;

    // Determine new status
    let newStatus: InvoiceStatus = invoice.status;
    if (newAmountPaid <= 0) {
      // Revert to SENT if there are no more payments
      newStatus = "SENT";
    } else if (newAmountDue > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    // Delete payment
    await db.payment.delete({
      where: { id: paymentId },
    });

    // Update invoice
    const previousStatus = invoice.status;
    await db.invoice.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
      },
    });

    // Create payment deleted activity
    await db.invoiceActivity.create({
      data: {
        invoiceId: id,
        type: "PAYMENT_DELETED",
        payload: {
          amount: paymentAmount.toString(),
          method: payment.method,
        },
      },
    });

    // Create status change activity if status changed
    if (newStatus !== previousStatus) {
      await db.invoiceActivity.create({
        data: {
          invoiceId: id,
          type: "INVOICE_STATUS_CHANGED",
          payload: { from: previousStatus, to: newStatus },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invoices/[id]/payments/[paymentId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
