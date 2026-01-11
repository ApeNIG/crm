import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createBookingSchema,
  bookingQuerySchema,
} from "@/lib/validations/booking";
import { getMockBookings } from "@/lib/mock-data";

// GET /api/bookings - List bookings with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = bookingQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      contactId: searchParams.get("contactId") || undefined,
      serviceTypeId: searchParams.get("serviceTypeId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 100,
    });

    const { search, status, contactId, serviceTypeId, dateFrom, dateTo, page, limit } = query;

    try {
      const db = await getDb();
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { notes: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
          { contact: { firstName: { contains: search, mode: "insensitive" } } },
          { contact: { lastName: { contains: search, mode: "insensitive" } } },
          { contact: { email: { contains: search, mode: "insensitive" } } },
          { serviceType: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (status) where.status = status;
      if (contactId) where.contactId = contactId;
      if (serviceTypeId) where.serviceTypeId = serviceTypeId;

      // Date range filters
      if (dateFrom || dateTo) {
        where.startAt = {};
        if (dateFrom) (where.startAt as Record<string, unknown>).gte = dateFrom;
        if (dateTo) (where.startAt as Record<string, unknown>).lte = dateTo;
      }

      const [bookings, total] = await Promise.all([
        db.booking.findMany({
          where,
          include: {
            contact: true,
            serviceType: true,
          },
          orderBy: { startAt: "asc" },
          skip,
          take: limit,
        }),
        db.booking.count({ where }),
      ]);

      return NextResponse.json({
        bookings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      const result = getMockBookings({
        search,
        status,
        contactId,
        serviceTypeId,
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString(),
        page,
        limit
      });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createBookingSchema.parse(body);

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

    // Verify serviceType exists and is active
    const serviceType = await db.serviceType.findUnique({
      where: { id: data.serviceTypeId },
    });

    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    if (!serviceType.isActive) {
      return NextResponse.json(
        { error: "Service type is not active" },
        { status: 400 }
      );
    }

    // Verify enquiry exists if provided
    if (data.enquiryId) {
      const enquiry = await db.enquiry.findUnique({
        where: { id: data.enquiryId, deletedAt: null },
      });

      if (!enquiry) {
        return NextResponse.json(
          { error: "Enquiry not found" },
          { status: 404 }
        );
      }
    }

    // Calculate endAt from startAt + serviceType.durationMinutes if not provided
    let endAt = data.endAt;
    if (!endAt) {
      endAt = new Date(data.startAt.getTime() + serviceType.durationMinutes * 60 * 1000);
    }

    const booking = await db.booking.create({
      data: {
        ...data,
        endAt,
      },
      include: {
        contact: true,
        serviceType: true,
      },
    });

    // Create activity
    await db.bookingActivity.create({
      data: {
        bookingId: booking.id,
        type: "BOOKING_CREATED",
        payload: {
          serviceTypeName: serviceType.name,
          startAt: booking.startAt.toISOString(),
          contactName: `${contact.firstName} ${contact.lastName}`,
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid booking data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
