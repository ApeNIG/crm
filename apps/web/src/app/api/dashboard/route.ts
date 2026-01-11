import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";
import type {
  DashboardData,
  DashboardActivityItem,
  EnquiryStageBreakdown,
  BookingStatusBreakdown,
  InvoiceStatusBreakdown,
} from "@/types/dashboard";
import type {
  Activity,
  EnquiryActivity,
  BookingActivity,
  InvoiceActivity,
  EnquiryStage,
  BookingStatus,
  InvoiceStatus,
} from "@prisma/client";

// Activity type descriptions for building activity messages
const ACTIVITY_DESCRIPTIONS: Record<string, (payload: Record<string, unknown>) => string> = {
  // Contact activities
  CONTACT_CREATED: () => "Contact created",
  CONTACT_UPDATED: (payload) => {
    const changes = payload.changes as Record<string, { from: unknown; to: unknown }> | undefined;
    if (!changes) return "Contact updated";
    const keys = Object.keys(changes);
    return keys.length === 1 ? `${keys[0]} updated` : `${keys.length} fields updated`;
  },
  NOTE_ADDED: (payload) => (payload.preview as string) || "Note added",
  TAG_ADDED: (payload) => `Tag "${payload.tagName}" added`,
  TAG_REMOVED: (payload) => `Tag "${payload.tagName}" removed`,
  // Enquiry activities
  ENQUIRY_CREATED: () => "Enquiry created",
  ENQUIRY_UPDATED: () => "Enquiry updated",
  STAGE_CHANGED: (payload) => `Stage changed to ${payload.to}`,
  // Booking activities
  BOOKING_CREATED: () => "Booking created",
  BOOKING_UPDATED: () => "Booking updated",
  BOOKING_STATUS_CHANGED: (payload) => `Status changed to ${payload.to}`,
  BOOKING_RESCHEDULED: () => "Booking rescheduled",
  BOOKING_NOTE_ADDED: () => "Booking note added",
  // Invoice activities
  INVOICE_CREATED: (payload) => `Invoice ${payload.invoiceNumber} created`,
  INVOICE_UPDATED: () => "Invoice updated",
  INVOICE_STATUS_CHANGED: (payload) => `Status changed to ${payload.to}`,
  INVOICE_SENT: () => "Invoice sent",
  PAYMENT_RECORDED: (payload) => `Payment of ${payload.amount} recorded`,
  PAYMENT_DELETED: () => "Payment deleted",
  LINE_ITEM_ADDED: (payload) => `Line item "${payload.description}" added`,
  LINE_ITEM_UPDATED: () => "Line item updated",
  LINE_ITEM_DELETED: () => "Line item deleted",
};

function getActivityDescription(type: string, payload: Record<string, unknown>): string {
  const descFn = ACTIVITY_DESCRIPTIONS[type];
  return descFn ? descFn(payload) : "Activity recorded";
}

// GET /api/dashboard - Fetch all dashboard data
export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    // Calculate date ranges
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Parallel queries for metrics and breakdowns
    const [
      totalContacts,
      activeEnquiries,
      upcomingBookings,
      outstandingInvoices,
      revenueThisMonth,
      enquiriesByStage,
      bookingsToday,
      bookingsThisWeek,
      invoicesByStatus,
      contactActivities,
      enquiryActivities,
      bookingActivities,
      invoiceActivities,
    ] = await Promise.all([
      // Total contacts (non-deleted)
      db.contact.count({
        where: { deletedAt: null },
      }),

      // Active enquiries (not BOOKED_PAID or LOST)
      db.enquiry.count({
        where: {
          deletedAt: null,
          stage: { notIn: ["BOOKED_PAID", "LOST"] },
        },
      }),

      // Upcoming bookings (CONFIRMED, next 7 days)
      db.booking.count({
        where: {
          deletedAt: null,
          status: "CONFIRMED",
          startAt: { gte: now, lte: endOfWeek },
        },
      }),

      // Outstanding amount (SENT + OVERDUE invoices)
      db.invoice.aggregate({
        where: {
          deletedAt: null,
          status: { in: ["SENT", "OVERDUE", "PARTIALLY_PAID"] },
        },
        _sum: { amountDue: true },
      }),

      // Revenue this month (sum of payments)
      db.payment.aggregate({
        where: {
          paidAt: { gte: startOfMonth, lt: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Enquiries grouped by stage
      db.enquiry.groupBy({
        by: ["stage"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // Bookings today by status
      db.booking.groupBy({
        by: ["status"],
        where: {
          deletedAt: null,
          startAt: { gte: startOfToday, lt: endOfToday },
        },
        _count: { _all: true },
      }),

      // Bookings this week by status
      db.booking.groupBy({
        by: ["status"],
        where: {
          deletedAt: null,
          startAt: { gte: startOfToday, lt: endOfWeek },
        },
        _count: { _all: true },
      }),

      // Invoices grouped by status with amounts
      db.invoice.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
        _sum: { total: true },
      }),

      // Recent contact activities
      db.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { contact: { select: { id: true, firstName: true, lastName: true } } },
      }),

      // Recent enquiry activities
      db.enquiryActivity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { enquiry: { select: { id: true, contact: { select: { firstName: true, lastName: true } } } } },
      }),

      // Recent booking activities
      db.bookingActivity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              contact: { select: { firstName: true, lastName: true } },
              serviceType: { select: { name: true } },
            }
          }
        },
      }),

      // Recent invoice activities
      db.invoiceActivity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              contact: { select: { firstName: true, lastName: true } },
            }
          }
        },
      }),
    ]);

    // Build metrics
    const metrics = {
      totalContacts,
      activeEnquiries,
      upcomingBookings,
      outstandingAmount: decimalToNumber(outstandingInvoices._sum.amountDue),
      revenueThisMonth: decimalToNumber(revenueThisMonth._sum.amount),
    };

    // Build enquiry breakdown
    const enquiryBreakdown: EnquiryStageBreakdown[] = enquiriesByStage.map((item) => ({
      stage: item.stage as EnquiryStage,
      count: item._count._all,
    }));

    // Build booking breakdown (merge today and week counts)
    const bookingStatusMap = new Map<BookingStatus, { todayCount: number; weekCount: number }>();

    for (const item of bookingsToday) {
      bookingStatusMap.set(item.status, {
        todayCount: item._count._all,
        weekCount: 0,
      });
    }

    for (const item of bookingsThisWeek) {
      const existing = bookingStatusMap.get(item.status);
      if (existing) {
        existing.weekCount = item._count._all;
      } else {
        bookingStatusMap.set(item.status, {
          todayCount: 0,
          weekCount: item._count._all,
        });
      }
    }

    const bookingBreakdown: BookingStatusBreakdown[] = Array.from(bookingStatusMap.entries()).map(
      ([status, counts]) => ({
        status,
        todayCount: counts.todayCount,
        weekCount: counts.weekCount,
      })
    );

    // Build invoice breakdown
    const invoiceBreakdown: InvoiceStatusBreakdown[] = invoicesByStatus.map((item) => ({
      status: item.status as InvoiceStatus,
      count: item._count._all,
      totalAmount: decimalToNumber(item._sum.total),
    }));

    // Build unified activity feed
    const allActivities: DashboardActivityItem[] = [];

    // Map contact activities
    for (const activity of contactActivities) {
      const contact = (activity as Activity & { contact: { id: string; firstName: string; lastName: string } }).contact;
      allActivities.push({
        id: activity.id,
        entityType: "contact",
        entityId: activity.contactId,
        type: activity.type,
        description: `${contact.firstName} ${contact.lastName}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
        href: `/contacts/${activity.contactId}`,
        createdAt: activity.createdAt.toISOString(),
      });
    }

    // Map enquiry activities
    for (const activity of enquiryActivities) {
      const enquiry = (activity as EnquiryActivity & { enquiry: { id: string; contact: { firstName: string; lastName: string } } }).enquiry;
      allActivities.push({
        id: activity.id,
        entityType: "enquiry",
        entityId: activity.enquiryId,
        type: activity.type,
        description: `${enquiry.contact.firstName} ${enquiry.contact.lastName}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
        href: `/pipeline?enquiry=${activity.enquiryId}`,
        createdAt: activity.createdAt.toISOString(),
      });
    }

    // Map booking activities
    for (const activity of bookingActivities) {
      const booking = (activity as BookingActivity & {
        booking: {
          id: string;
          contact: { firstName: string; lastName: string };
          serviceType: { name: string };
        }
      }).booking;
      allActivities.push({
        id: activity.id,
        entityType: "booking",
        entityId: activity.bookingId,
        type: activity.type,
        description: `${booking.contact.firstName} ${booking.contact.lastName} - ${booking.serviceType.name}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
        href: `/bookings/${activity.bookingId}`,
        createdAt: activity.createdAt.toISOString(),
      });
    }

    // Map invoice activities
    for (const activity of invoiceActivities) {
      const invoice = (activity as InvoiceActivity & {
        invoice: {
          id: string;
          invoiceNumber: string;
          contact: { firstName: string; lastName: string };
        }
      }).invoice;
      allActivities.push({
        id: activity.id,
        entityType: "invoice",
        entityId: activity.invoiceId,
        type: activity.type,
        description: `${invoice.invoiceNumber} (${invoice.contact.firstName} ${invoice.contact.lastName}): ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
        href: `/invoices/${activity.invoiceId}`,
        createdAt: activity.createdAt.toISOString(),
      });
    }

    // Sort by createdAt desc and take top 20
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentActivity = allActivities.slice(0, 20);

    const response: DashboardData = {
      metrics,
      enquiryBreakdown,
      bookingBreakdown,
      invoiceBreakdown,
      recentActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
