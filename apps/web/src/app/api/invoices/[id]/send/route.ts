import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { uuidParamSchema } from "@/lib/validations/invoice";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/invoices/[id]/send - Mark invoice as sent
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const existing = await db.invoice.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only DRAFT invoices can be sent
    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT invoices can be sent" },
        { status: 400 }
      );
    }

    const previousStatus = existing.status;
    const sentAt = new Date();

    // Update status to SENT
    const invoice = await db.invoice.update({
      where: { id },
      data: { status: "SENT" },
      include: {
        contact: true,
        booking: {
          include: {
            serviceType: true,
          },
        },
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    // Create activities
    await db.invoiceActivity.createMany({
      data: [
        {
          invoiceId: id,
          type: "INVOICE_STATUS_CHANGED",
          payload: { from: previousStatus, to: "SENT" },
        },
        {
          invoiceId: id,
          type: "INVOICE_SENT",
          payload: { sentAt: sentAt.toISOString() },
        },
      ],
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("POST /api/invoices/[id]/send error:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
