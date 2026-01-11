import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createInvoiceSchema,
  invoiceQuerySchema,
} from "@/lib/validations/invoice";
import {
  formatInvoiceNumber,
  calculateLineItemTotal,
  calculateInvoiceTotals,
} from "@/lib/utils";

// GET /api/invoices - List invoices with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = invoiceQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      contactId: searchParams.get("contactId") || undefined,
      bookingId: searchParams.get("bookingId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 100,
    });

    const { search, status, contactId, bookingId, dateFrom, dateTo, page, limit } = query;

    const db = await getDb();
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { contact: { firstName: { contains: search, mode: "insensitive" } } },
        { contact: { lastName: { contains: search, mode: "insensitive" } } },
        { contact: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (bookingId) where.bookingId = bookingId;

    // Date range filters (by issue date)
    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) (where.issueDate as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.issueDate as Record<string, unknown>).lte = dateTo;
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          contact: true,
          booking: {
            include: {
              serviceType: true,
            },
          },
          _count: {
            select: {
              lineItems: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    const db = await getDb();

    // Verify contact exists
    const contact = await db.contact.findUnique({
      where: { id: data.contactId, deletedAt: null },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify booking exists if provided
    if (data.bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: data.bookingId, deletedAt: null },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const counter = await db.invoiceCounter.upsert({
      where: { year },
      update: { lastNumber: { increment: 1 } },
      create: { year, lastNumber: 1 },
    });

    const invoiceNumber = formatInvoiceNumber(year, counter.lastNumber);

    // Prepare line items with calculated totals
    const lineItemsData = data.lineItems.map((item, index) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: calculateLineItemTotal(item.quantity, item.unitPrice),
      sortOrder: item.sortOrder ?? index,
    }));

    // Calculate invoice totals
    const { subtotal, taxAmount, total, amountDue } = calculateInvoiceTotals(
      lineItemsData.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      data.taxRate,
      0
    );

    // Create invoice with line items
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        contactId: data.contactId,
        bookingId: data.bookingId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        taxRate: data.taxRate,
        subtotal,
        taxAmount,
        total,
        amountPaid: 0,
        amountDue,
        notes: data.notes,
        terms: data.terms,
        lineItems: {
          create: lineItemsData,
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
          contactName: `${contact.firstName} ${contact.lastName}`,
          total: total.toString(),
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid invoice data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
