import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateEnquirySchema, uuidParamSchema } from "@/lib/validations/enquiry";
import { getMockEnquiry } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/enquiries/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid enquiry ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const enquiry = await db.enquiry.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error("GET /api/enquiries/[id] error:", error);

    const mockEnquiry = getMockEnquiry(id);
    if (mockEnquiry) {
      return NextResponse.json(mockEnquiry);
    }

    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }
}

// PUT /api/enquiries/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid enquiry ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateEnquirySchema.parse(body);

    const db = await getDb();

    const existing = await db.enquiry.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Track changes for activity
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const existingValue = existing[key as keyof typeof existing];
        if (value !== existingValue) {
          changes[key] = { from: existingValue, to: value };
        }
      }
    }

    // Handle stage change specially
    const stageChanged = data.stage && data.stage !== existing.stage;

    const enquiry = await db.enquiry.update({
      where: { id },
      data,
      include: {
        contact: true,
        activities: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    // Create activity for stage change
    if (stageChanged) {
      await db.enquiryActivity.create({
        data: {
          enquiryId: id,
          type: "STAGE_CHANGED",
          payload: { from: existing.stage, to: data.stage },
        },
      });
    } else if (Object.keys(changes).length > 0) {
      await db.enquiryActivity.create({
        data: {
          enquiryId: id,
          type: "ENQUIRY_UPDATED",
          payload: { changes: JSON.parse(JSON.stringify(changes)) },
        },
      });
    }

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error("PUT /api/enquiries/[id] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid enquiry data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

// DELETE /api/enquiries/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid enquiry ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const enquiry = await db.enquiry.findUnique({
      where: { id, deletedAt: null },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    await db.enquiry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/enquiries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}
