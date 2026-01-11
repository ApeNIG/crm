import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createEnquirySchema,
  enquiryQuerySchema,
} from "@/lib/validations/enquiry";
import { getMockEnquiries } from "@/lib/mock-data";

// GET /api/enquiries - List enquiries with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = enquiryQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      stage: searchParams.get("stage") || undefined,
      contactId: searchParams.get("contactId") || undefined,
      enquiryType: searchParams.get("enquiryType") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 100,
    });

    const { search, stage, contactId, enquiryType, page, limit } = query;

    try {
      const db = await getDb();
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { message: { contains: search, mode: "insensitive" } },
          { contact: { firstName: { contains: search, mode: "insensitive" } } },
          { contact: { lastName: { contains: search, mode: "insensitive" } } },
          { contact: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (stage) where.stage = stage;
      if (contactId) where.contactId = contactId;
      if (enquiryType) where.enquiryType = enquiryType;

      const [enquiries, total] = await Promise.all([
        db.enquiry.findMany({
          where,
          include: { contact: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
        }),
        db.enquiry.count({ where }),
      ]);

      return NextResponse.json({
        enquiries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      const result = getMockEnquiries({ search, stage, contactId, enquiryType, page, limit });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

// POST /api/enquiries - Create a new enquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createEnquirySchema.parse(body);

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

    const enquiry = await db.enquiry.create({
      data,
      include: { contact: true },
    });

    // Create activity
    await db.enquiryActivity.create({
      data: {
        enquiryId: enquiry.id,
        type: "ENQUIRY_CREATED",
        payload: {
          enquiryType: enquiry.enquiryType,
          contactName: `${contact.firstName} ${contact.lastName}`,
        },
      },
    });

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error("POST /api/enquiries error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid enquiry data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create enquiry" },
      { status: 500 }
    );
  }
}
