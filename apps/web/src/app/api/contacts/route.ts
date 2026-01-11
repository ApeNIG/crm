import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createContactSchema,
  contactQuerySchema,
} from "@/lib/validations/contact";
import { getMockContacts } from "@/lib/mock-data";

// GET /api/contacts - List contacts with filters and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = contactQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
    });

    const { search, status, source, tagId, page, limit } = query;

    // Try to use database
    try {
      const db = await getDb();
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (source) {
        where.source = source;
      }

      if (tagId) {
        where.tags = {
          some: { tagId },
        };
      }

      const [contacts, total] = await Promise.all([
        db.contact.findMany({
          where,
          include: {
            tags: {
              include: { tag: true },
            },
          },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
        }),
        db.contact.count({ where }),
      ]);

      return NextResponse.json({
        contacts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      // Fallback to mock data
      const result = getMockContacts({ search, status, source, page, limit });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/contacts error:", error);

    // Try mock as last resort
    try {
      const result = getMockContacts({
        search: searchParams.get("search") || undefined,
        status: searchParams.get("status") || undefined,
        source: searchParams.get("source") || undefined,
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 50,
      });
      return NextResponse.json(result);
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createContactSchema.parse(body);

    const db = await getDb();

    // Check for existing contact with same email
    const existing = await db.contact.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A contact with this email already exists" },
        { status: 409 }
      );
    }

    // Create contact with tags
    const { tagIds, marketingOptIn, ...contactData } = data;

    const contact = await db.contact.create({
      data: {
        ...contactData,
        marketingOptIn,
        marketingOptInAt: marketingOptIn ? new Date() : null,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // Create activity
    await db.activity.create({
      data: {
        contactId: contact.id,
        type: "CONTACT_CREATED",
        payload: { source: contact.source },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid contact data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create contact (database not available)" },
      { status: 500 }
    );
  }
}
