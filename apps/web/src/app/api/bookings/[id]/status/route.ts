import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateBookingStatusSchema, uuidParamSchema } from "@/lib/validations/booking";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/bookings/[id]/status - Optimized status update
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = updateBookingStatusSchema.parse(body);

    const db = await getDb();

    const existing = await db.booking.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Skip if status hasn't changed
    if (existing.status === status) {
      return NextResponse.json({ success: true, status });
    }

    const previousStatus = existing.status;

    // Update status
    await db.booking.update({
      where: { id },
      data: { status },
    });

    // Create activity for status change
    await db.bookingActivity.create({
      data: {
        bookingId: id,
        type: "BOOKING_STATUS_CHANGED",
        payload: { from: previousStatus, to: status },
      },
    });

    return NextResponse.json({ success: true, status, previousStatus });
  } catch (error) {
    console.error("PATCH /api/bookings/[id]/status error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid status", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
