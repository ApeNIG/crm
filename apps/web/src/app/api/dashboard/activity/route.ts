import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import type {
  DashboardActivityItem,
  DashboardActivityResponse,
  ActivityEntityType,
} from "@/types/dashboard";
import type {
  Activity,
  EnquiryActivity,
  BookingActivity,
  InvoiceActivity,
} from "@prisma/client";

// Query params validation schema
const activityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  entityType: z.enum(["contact", "enquiry", "booking", "invoice"]).optional(),
});

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

// GET /api/dashboard/activity - Fetch paginated activity feed
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = activityQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      entityType: searchParams.get("entityType") || undefined,
    });

    const { page, limit, entityType } = query;
    const db = await getDb();

    // Calculate pagination offset
    // For mixed activity types, we need to fetch more and merge
    const takePerType = limit * 2; // Fetch more to ensure we have enough after merging

    const allActivities: DashboardActivityItem[] = [];
    let totalCount = 0;

    // Fetch activities based on entityType filter or all types
    const fetchContact = !entityType || entityType === "contact";
    const fetchEnquiry = !entityType || entityType === "enquiry";
    const fetchBooking = !entityType || entityType === "booking";
    const fetchInvoice = !entityType || entityType === "invoice";

    const promises: Promise<void>[] = [];

    if (fetchContact) {
      promises.push(
        (async () => {
          const [activities, count] = await Promise.all([
            db.activity.findMany({
              take: takePerType,
              skip: entityType ? (page - 1) * limit : 0,
              orderBy: { createdAt: "desc" },
              include: { contact: { select: { id: true, firstName: true, lastName: true } } },
            }),
            db.activity.count(),
          ]);

          if (entityType) totalCount = count;
          else totalCount += count;

          for (const activity of activities) {
            const contact = (activity as Activity & { contact: { id: string; firstName: string; lastName: string } }).contact;
            allActivities.push({
              id: activity.id,
              entityType: "contact" as ActivityEntityType,
              entityId: activity.contactId,
              type: activity.type,
              description: `${contact.firstName} ${contact.lastName}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
              href: `/contacts/${activity.contactId}`,
              createdAt: activity.createdAt.toISOString(),
            });
          }
        })()
      );
    }

    if (fetchEnquiry) {
      promises.push(
        (async () => {
          const [activities, count] = await Promise.all([
            db.enquiryActivity.findMany({
              take: takePerType,
              skip: entityType ? (page - 1) * limit : 0,
              orderBy: { createdAt: "desc" },
              include: { enquiry: { select: { id: true, contact: { select: { firstName: true, lastName: true } } } } },
            }),
            db.enquiryActivity.count(),
          ]);

          if (entityType) totalCount = count;
          else totalCount += count;

          for (const activity of activities) {
            const enquiry = (activity as EnquiryActivity & { enquiry: { id: string; contact: { firstName: string; lastName: string } } }).enquiry;
            allActivities.push({
              id: activity.id,
              entityType: "enquiry" as ActivityEntityType,
              entityId: activity.enquiryId,
              type: activity.type,
              description: `${enquiry.contact.firstName} ${enquiry.contact.lastName}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
              href: `/pipeline?enquiry=${activity.enquiryId}`,
              createdAt: activity.createdAt.toISOString(),
            });
          }
        })()
      );
    }

    if (fetchBooking) {
      promises.push(
        (async () => {
          const [activities, count] = await Promise.all([
            db.bookingActivity.findMany({
              take: takePerType,
              skip: entityType ? (page - 1) * limit : 0,
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
            db.bookingActivity.count(),
          ]);

          if (entityType) totalCount = count;
          else totalCount += count;

          for (const activity of activities) {
            const booking = (activity as BookingActivity & {
              booking: {
                id: string;
                contact: { firstName: string; lastName: string };
                serviceType: { name: string };
              }
            }).booking;
            allActivities.push({
              id: activity.id,
              entityType: "booking" as ActivityEntityType,
              entityId: activity.bookingId,
              type: activity.type,
              description: `${booking.contact.firstName} ${booking.contact.lastName} - ${booking.serviceType.name}: ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
              href: `/bookings/${activity.bookingId}`,
              createdAt: activity.createdAt.toISOString(),
            });
          }
        })()
      );
    }

    if (fetchInvoice) {
      promises.push(
        (async () => {
          const [activities, count] = await Promise.all([
            db.invoiceActivity.findMany({
              take: takePerType,
              skip: entityType ? (page - 1) * limit : 0,
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
            db.invoiceActivity.count(),
          ]);

          if (entityType) totalCount = count;
          else totalCount += count;

          for (const activity of activities) {
            const invoice = (activity as InvoiceActivity & {
              invoice: {
                id: string;
                invoiceNumber: string;
                contact: { firstName: string; lastName: string };
              }
            }).invoice;
            allActivities.push({
              id: activity.id,
              entityType: "invoice" as ActivityEntityType,
              entityId: activity.invoiceId,
              type: activity.type,
              description: `${invoice.invoiceNumber} (${invoice.contact.firstName} ${invoice.contact.lastName}): ${getActivityDescription(activity.type, activity.payload as Record<string, unknown>)}`,
              href: `/invoices/${activity.invoiceId}`,
              createdAt: activity.createdAt.toISOString(),
            });
          }
        })()
      );
    }

    await Promise.all(promises);

    // Sort by createdAt desc
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination for mixed types
    let paginatedActivities: DashboardActivityItem[];
    if (entityType) {
      // Already paginated in the query
      paginatedActivities = allActivities.slice(0, limit);
    } else {
      // Apply pagination to merged results
      const skip = (page - 1) * limit;
      paginatedActivities = allActivities.slice(skip, skip + limit);
    }

    const response: DashboardActivityResponse = {
      activities: paginatedActivities,
      total: totalCount,
      page,
      limit,
      hasMore: page * limit < totalCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/dashboard/activity error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 }
    );
  }
}
