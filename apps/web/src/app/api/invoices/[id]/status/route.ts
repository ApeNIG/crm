import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateInvoiceStatusSchema, uuidParamSchema } from "@/lib/validations/invoice";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/invoices/[id]/status - Update invoice status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = updateInvoiceStatusSchema.parse(body);

    const db = await getDb();

    const existing = await db.invoice.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const previousStatus = existing.status;

    // Update status
    await db.invoice.update({
      where: { id },
      data: { status },
    });

    // Create activity
    await db.invoiceActivity.create({
      data: {
        invoiceId: id,
        type: "INVOICE_STATUS_CHANGED",
        payload: { from: previousStatus, to: status },
      },
    });

    return NextResponse.json({
      success: true,
      status,
      previousStatus,
    });
  } catch (error) {
    console.error("PATCH /api/invoices/[id]/status error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid status", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    );
  }
}
