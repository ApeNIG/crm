import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateLineItemSchema, uuidParamSchema } from "@/lib/validations/invoice";
import { calculateLineItemTotal, calculateInvoiceTotals, decimalToNumber } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

// PUT /api/invoices/[id]/line-items/[itemId] - Update a line item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, itemId } = await params;

  // Validate UUID format
  const idResult = uuidParamSchema.safeParse(id);
  const itemIdResult = uuidParamSchema.safeParse(itemId);
  if (!idResult.success || !itemIdResult.success) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateLineItemSchema.parse(body);

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

    // Only allow editing line items on DRAFT invoices
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only edit line items on DRAFT invoices" },
        { status: 400 }
      );
    }

    const existingItem = invoice.lineItems.find((item) => item.id === itemId);
    if (!existingItem) {
      return NextResponse.json({ error: "Line item not found" }, { status: 404 });
    }

    // Track changes
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (data.description !== undefined && data.description !== existingItem.description) {
      changes.description = { from: existingItem.description, to: data.description };
    }
    if (data.quantity !== undefined && data.quantity !== decimalToNumber(existingItem.quantity)) {
      changes.quantity = { from: decimalToNumber(existingItem.quantity), to: data.quantity };
    }
    if (data.unitPrice !== undefined && data.unitPrice !== decimalToNumber(existingItem.unitPrice)) {
      changes.unitPrice = { from: decimalToNumber(existingItem.unitPrice), to: data.unitPrice };
    }

    // Calculate new total
    const quantity = data.quantity ?? decimalToNumber(existingItem.quantity);
    const unitPrice = data.unitPrice ?? decimalToNumber(existingItem.unitPrice);
    const lineItemTotal = calculateLineItemTotal(quantity, unitPrice);

    // Update line item
    const lineItem = await db.invoiceLineItem.update({
      where: { id: itemId },
      data: {
        description: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        total: lineItemTotal,
        sortOrder: data.sortOrder,
      },
    });

    // Recalculate invoice totals
    const updatedLineItems = invoice.lineItems.map((item) =>
      item.id === itemId
        ? { quantity, unitPrice }
        : {
            quantity: decimalToNumber(item.quantity),
            unitPrice: decimalToNumber(item.unitPrice),
          }
    );

    const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
      updatedLineItems,
      decimalToNumber(invoice.taxRate),
      decimalToNumber(invoice.amountPaid)
    );

    await db.invoice.update({
      where: { id },
      data: { subtotal, taxAmount, total, amountDue },
    });

    // Create activity if there were changes
    if (Object.keys(changes).length > 0) {
      await db.invoiceActivity.create({
        data: {
          invoiceId: id,
          type: "LINE_ITEM_UPDATED",
          payload: {
            description: existingItem.description,
            changes: JSON.parse(JSON.stringify(changes)),
          },
        },
      });
    }

    return NextResponse.json(lineItem);
  } catch (error) {
    console.error("PUT /api/invoices/[id]/line-items/[itemId] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid line item data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update line item" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id]/line-items/[itemId] - Delete a line item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id, itemId } = await params;

  // Validate UUID format
  const idResult = uuidParamSchema.safeParse(id);
  const itemIdResult = uuidParamSchema.safeParse(itemId);
  if (!idResult.success || !itemIdResult.success) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
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

    // Only allow deleting line items from DRAFT invoices
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete line items from DRAFT invoices" },
        { status: 400 }
      );
    }

    const existingItem = invoice.lineItems.find((item) => item.id === itemId);
    if (!existingItem) {
      return NextResponse.json({ error: "Line item not found" }, { status: 404 });
    }

    // Delete line item
    await db.invoiceLineItem.delete({
      where: { id: itemId },
    });

    // Recalculate invoice totals
    const remainingLineItems = invoice.lineItems
      .filter((item) => item.id !== itemId)
      .map((item) => ({
        quantity: decimalToNumber(item.quantity),
        unitPrice: decimalToNumber(item.unitPrice),
      }));

    const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
      remainingLineItems,
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
        type: "LINE_ITEM_DELETED",
        payload: {
          description: existingItem.description,
          total: decimalToNumber(existingItem.total).toString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invoices/[id]/line-items/[itemId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete line item" },
      { status: 500 }
    );
  }
}
