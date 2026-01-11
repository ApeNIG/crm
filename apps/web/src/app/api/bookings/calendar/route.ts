import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calendarQuerySchema } from "@/lib/validations/booking";
import { getMockCalendarBookings } from "@/lib/mock-data";

// GET /api/bookings/calendar - Fetch bookings for calendar view
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    // Both startDate and endDate are required
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const query = calendarQuerySchema.parse({
      startDate: startDateParam,
      endDate: endDateParam,
    });

    const { startDate, endDate } = query;

    try {
      const db = await getDb();

      // Find all bookings that overlap with the date range
      // A booking overlaps if: booking.startAt < endDate AND booking.endAt > startDate
      const bookings = await db.booking.findMany({
        where: {
          deletedAt: null,
          startAt: { lt: endDate },
          endAt: { gt: startDate },
        },
        include: {
          contact: true,
          serviceType: true,
        },
        orderBy: { startAt: "asc" },
      });

      return NextResponse.json({ bookings });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      const result = getMockCalendarBookings(startDate, endDate);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/bookings/calendar error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid date parameters", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch calendar bookings" },
      { status: 500 }
    );
  }
}
