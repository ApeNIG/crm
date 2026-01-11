import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateEnquiryStageSchema, uuidParamSchema } from "@/lib/validations/enquiry";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/enquiries/[id]/stage - Optimized stage update for drag-drop
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Validate UUID format
  const parseResult = uuidParamSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid enquiry ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { stage } = updateEnquiryStageSchema.parse(body);

    const db = await getDb();

    const existing = await db.enquiry.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Skip if stage hasn't changed
    if (existing.stage === stage) {
      return NextResponse.json({ success: true, stage });
    }

    const previousStage = existing.stage;

    // Update stage
    await db.enquiry.update({
      where: { id },
      data: { stage },
    });

    // Create activity for stage change
    await db.enquiryActivity.create({
      data: {
        enquiryId: id,
        type: "STAGE_CHANGED",
        payload: { from: previousStage, to: stage },
      },
    });

    return NextResponse.json({ success: true, stage, previousStage });
  } catch (error) {
    console.error("PATCH /api/enquiries/[id]/stage error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid stage", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}
