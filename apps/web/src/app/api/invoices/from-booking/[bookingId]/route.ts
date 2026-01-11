import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { uuidParamSchema } from "@/lib/validations/invoice";
import {
  formatInvoiceNumber,
  calculateLineItemTotal,
  calculateInvoiceTotals,
  decimalToNumber,
} from "@/lib/utils";

type RouteParams = { params: Promise<{ bookingId: string }> };

// POST /api/invoices/from-booking/[bookingId] - Generate invoice from booking
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { bookingId } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(bookingId);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
  }

  try {
    // Parse optional body for due date and tax rate
    let dueDate: Date | undefined;
    let taxRate = 0;
    try {
      const body = await request.json();
      if (body.dueDate) {
        dueDate = new Date(body.dueDate);
      }
      if (body.taxRate !== undefined) {
        taxRate = Number(body.taxRate);
      }
    } catch {
      // Body is optional
    }

    const db = await getDb();

    // Get booking with service type and contact
    const booking = await db.booking.findUnique({
      where: { id: bookingId, deletedAt: null },
      include: {
        contact: true,
        serviceType: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if booking already has an invoice
    const existingInvoice = await db.invoice.findFirst({
      where: { bookingId, deletedAt: null },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "An invoice already exists for this booking", invoiceId: existingInvoice.id },
        { status: 400 }
      );
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const counter = await db.invoiceCounter.upsert({
      where: { year },
      update: { lastNumber: { increment: 1 } },
      create: { year, lastNumber: 1 },
    });

    const invoiceNumber = formatInvoiceNumber(year, counter.lastNumber);

    // Calculate due date (default: 30 days from now)
    const issueDate = new Date();
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const finalDueDate = dueDate || defaultDueDate;

    // Create line item from service type
    const servicePrice = booking.serviceType.price
      ? decimalToNumber(booking.serviceType.price)
      : 0;

    const lineItemData = {
      description: `${booking.serviceType.name} - ${new Date(booking.startAt).toLocaleDateString("en-GB")}`,
      quantity: 1,
      unitPrice: servicePrice,
      total: calculateLineItemTotal(1, servicePrice),
      sortOrder: 0,
    };

    // Calculate invoice totals
    const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: servicePrice }],
      taxRate,
      0
    );

    // Create invoice with line item
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        contactId: booking.contactId,
        bookingId: booking.id,
        issueDate,
        dueDate: finalDueDate,
        taxRate,
        subtotal,
        taxAmount,
        total,
        amountPaid: 0,
        amountDue,
        lineItems: {
          create: lineItemData,
        },
      },
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
        payments: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    // Create activity
    await db.invoiceActivity.create({
      data: {
        invoiceId: invoice.id,
        type: "INVOICE_CREATED",
        payload: {
          invoiceNumber,
          contactName: `${booking.contact.firstName} ${booking.contact.lastName}`,
          total: total.toString(),
          fromBooking: true,
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices/from-booking/[bookingId] error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice from booking" },
      { status: 500 }
    );
  }
}
