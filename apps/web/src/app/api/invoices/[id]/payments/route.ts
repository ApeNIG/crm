import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createPaymentSchema, uuidParamSchema } from "@/lib/validations/invoice";
import { decimalToNumber } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/invoices/[id]/payments - Record a payment
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    const db = await getDb();

    const invoice = await db.invoice.findUnique({
      where: { id, deletedAt: null },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow payments on SENT, PARTIALLY_PAID, or OVERDUE invoices
    const allowedStatuses: InvoiceStatus[] = ["SENT", "PARTIALLY_PAID", "OVERDUE"];
    if (!allowedStatuses.includes(invoice.status)) {
      return NextResponse.json(
        { error: "Can only record payments on SENT, PARTIALLY_PAID, or OVERDUE invoices" },
        { status: 400 }
      );
    }

    // Calculate new amounts
    const currentAmountPaid = decimalToNumber(invoice.amountPaid);
    const total = decimalToNumber(invoice.total);
    const newAmountPaid = Math.round((currentAmountPaid + data.amount) * 100) / 100;
    const newAmountDue = Math.round((total - newAmountPaid) * 100) / 100;

    // Determine new status
    let newStatus: InvoiceStatus = invoice.status;
    if (newAmountDue <= 0) {
      newStatus = "PAID";
    } else if (newAmountPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        invoiceId: id,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        paidAt: data.paidAt,
      },
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

    // Create activities
    const activities = [
      {
        invoiceId: id,
        type: "PAYMENT_RECORDED" as const,
        payload: {
          amount: data.amount.toString(),
          method: data.method,
          reference: data.reference,
        },
      },
    ];

    if (newStatus !== previousStatus) {
      activities.push({
        invoiceId: id,
        type: "INVOICE_STATUS_CHANGED" as const,
        payload: { from: previousStatus, to: newStatus },
      });
    }

    await db.invoiceActivity.createMany({ data: activities });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices/[id]/payments error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid payment data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
