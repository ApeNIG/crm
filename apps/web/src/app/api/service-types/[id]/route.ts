import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateServiceTypeSchema } from "@/lib/validations/service-type";
import { uuidParamSchema } from "@/lib/validations/enquiry";
import { getMockServiceType } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/service-types/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid service type ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const serviceType = await db.serviceType.findUnique({
      where: { id },
    });

    if (!serviceType) {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }

    return NextResponse.json(serviceType);
  } catch (error) {
    console.error("GET /api/service-types/[id] error:", error);

    const mockServiceType = getMockServiceType(id);
    if (mockServiceType) {
      return NextResponse.json(mockServiceType);
    }

    return NextResponse.json(
      { error: "Failed to fetch service type" },
      { status: 500 }
    );
  }
}

// PUT /api/service-types/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid service type ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateServiceTypeSchema.parse(body);

    const db = await getDb();

    const existing = await db.serviceType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }

    const serviceType = await db.serviceType.update({
      where: { id },
      data,
    });

    return NextResponse.json(serviceType);
  } catch (error) {
    console.error("PUT /api/service-types/[id] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid service type data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update service type" },
      { status: 500 }
    );
  }
}

// DELETE /api/service-types/[id] - Deactivate service type (set isActive=false)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid service type ID format" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const serviceType = await db.serviceType.findUnique({
      where: { id },
    });

    if (!serviceType) {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }

    // Deactivate instead of delete to preserve referential integrity
    await db.serviceType.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/service-types/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete service type" },
      { status: 500 }
    );
  }
}
