import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateBookingSchema, uuidParamSchema } from "@/lib/validations/booking";
import { getMockBooking } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/bookings/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const booking = await db.booking.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: true,
        serviceType: true,
        enquiry: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);

    const mockBooking = getMockBooking(id);
    if (mockBooking) {
      return NextResponse.json(mockBooking);
    }

    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateBookingSchema.parse(body);

    const db = await getDb();

    const existing = await db.booking.findUnique({
      where: { id, deletedAt: null },
      include: {
        serviceType: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify serviceType if being updated
    if (data.serviceTypeId && data.serviceTypeId !== existing.serviceTypeId) {
      const serviceType = await db.serviceType.findUnique({
        where: { id: data.serviceTypeId },
      });

      if (!serviceType) {
        return NextResponse.json({ error: "Service type not found" }, { status: 404 });
      }

      if (!serviceType.isActive) {
        return NextResponse.json({ error: "Service type is not active" }, { status: 400 });
      }
    }

    // Verify enquiry if being updated
    if (data.enquiryId && data.enquiryId !== existing.enquiryId) {
      const enquiry = await db.enquiry.findUnique({
        where: { id: data.enquiryId, deletedAt: null },
      });

      if (!enquiry) {
        return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
      }
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

    // Determine activity type
    const dateChanged = (data.startAt && data.startAt.getTime() !== existing.startAt.getTime()) ||
                       (data.endAt && data.endAt.getTime() !== existing.endAt.getTime());
    const statusChanged = data.status && data.status !== existing.status;

    const booking = await db.booking.update({
      where: { id },
      data,
      include: {
        contact: true,
        serviceType: true,
        enquiry: true,
        activities: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    // Create appropriate activity
    if (dateChanged) {
      await db.bookingActivity.create({
        data: {
          bookingId: id,
          type: "BOOKING_RESCHEDULED",
          payload: {
            previousStartAt: existing.startAt.toISOString(),
            previousEndAt: existing.endAt.toISOString(),
            newStartAt: booking.startAt.toISOString(),
            newEndAt: booking.endAt.toISOString(),
          },
        },
      });
    } else if (statusChanged) {
      await db.bookingActivity.create({
        data: {
          bookingId: id,
          type: "BOOKING_STATUS_CHANGED",
          payload: { from: existing.status, to: data.status },
        },
      });
    } else if (Object.keys(changes).length > 0) {
      await db.bookingActivity.create({
        data: {
          bookingId: id,
          type: "BOOKING_UPDATED",
          payload: { changes: JSON.parse(JSON.stringify(changes)) },
        },
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid booking data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const booking = await db.booking.findUnique({
      where: { id, deletedAt: null },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await db.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
