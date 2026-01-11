import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createLineItemSchema, uuidParamSchema } from "@/lib/validations/invoice";
import { calculateLineItemTotal, calculateInvoiceTotals, decimalToNumber } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/invoices/[id]/line-items - Add a line item
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = createLineItemSchema.parse(body);

    const db = await getDb();

    const invoice = await db.invoice.findUnique({
      where: { id, deletedAt: null },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow adding line items to DRAFT invoices
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only add line items to DRAFT invoices" },
        { status: 400 }
      );
    }

    // Calculate line item total
    const lineItemTotal = calculateLineItemTotal(data.quantity, data.unitPrice);

    // Get max sort order
    const maxSortOrder = invoice.lineItems.reduce(
      (max, item) => Math.max(max, item.sortOrder),
      -1
    );

    // Create line item
    const lineItem = await db.invoiceLineItem.create({
      data: {
        invoiceId: id,
        description: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        total: lineItemTotal,
        sortOrder: data.sortOrder ?? maxSortOrder + 1,
      },
    });

    // Recalculate invoice totals
    const allLineItems = [
      ...invoice.lineItems.map((item) => ({
        quantity: decimalToNumber(item.quantity),
        unitPrice: decimalToNumber(item.unitPrice),
      })),
      { quantity: data.quantity, unitPrice: data.unitPrice },
    ];

    const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
      allLineItems,
      decimalToNumber(invoice.taxRate),
      decimalToNumber(invoice.amountPaid)
    );

    await db.invoice.update({
      where: { id },
      data: { subtotal, taxAmount, total, amountDue },
    });

    // Create activity
    await db.invoiceActivity.create({
      data: {
        invoiceId: id,
        type: "LINE_ITEM_ADDED",
        payload: {
          description: data.description,
          total: lineItemTotal.toString(),
        },
      },
    });

    return NextResponse.json(lineItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices/[id]/line-items error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid line item data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add line item" },
      { status: 500 }
    );
  }
}
