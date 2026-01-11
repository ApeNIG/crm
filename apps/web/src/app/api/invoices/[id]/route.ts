import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateInvoiceSchema, uuidParamSchema } from "@/lib/validations/invoice";
import { calculateInvoiceTotals, decimalToNumber } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/invoices/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const invoice = await db.invoice.findUnique({
      where: { id, deletedAt: null },
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

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice (DRAFT only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateInvoiceSchema.parse(body);

    const db = await getDb();

    const existing = await db.invoice.findUnique({
      where: { id, deletedAt: null },
      include: {
        lineItems: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow editing DRAFT invoices
    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT invoices can be edited" },
        { status: 400 }
      );
    }

    // Track changes for activity log
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const existingValue = existing[key as keyof typeof existing];
        // Compare dates properly
        if (value instanceof Date && existingValue instanceof Date) {
          if (value.getTime() !== existingValue.getTime()) {
            changes[key] = { from: existingValue.toISOString(), to: value.toISOString() };
          }
        } else if (value !== existingValue) {
          changes[key] = { from: existingValue, to: value };
        }
      }
    }

    // Recalculate if tax rate changed
    let updateData: Record<string, unknown> = { ...data };
    if (data.taxRate !== undefined && data.taxRate !== decimalToNumber(existing.taxRate)) {
      const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
        existing.lineItems.map((item) => ({
          quantity: decimalToNumber(item.quantity),
          unitPrice: decimalToNumber(item.unitPrice),
        })),
        data.taxRate,
        decimalToNumber(existing.amountPaid)
      );
      updateData = { ...updateData, subtotal, taxAmount, total, amountDue };
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
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

    // Create activity if there were changes
    if (Object.keys(changes).length > 0) {
      await db.invoiceActivity.create({
        data: {
          invoiceId: id,
          type: "INVOICE_UPDATED",
          payload: { changes: JSON.parse(JSON.stringify(changes)) },
        },
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("PUT /api/invoices/[id] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid invoice data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const invoice = await db.invoice.findUnique({
      where: { id, deletedAt: null },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await db.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
