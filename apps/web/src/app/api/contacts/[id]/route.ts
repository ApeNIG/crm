import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateContactSchema } from "@/lib/validations/contact";
import { getMockContact } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/contacts/[id] - Get single contact with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const db = await getDb();

    const contact = await db.contact.findUnique({
      where: { id, deletedAt: null },
      include: {
        tags: {
          include: { tag: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);

    // Fallback to mock data
    const mockContact = getMockContact(id);
    if (mockContact) {
      return NextResponse.json(mockContact);
    }

    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PUT /api/contacts/[id] - Update contact
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateContactSchema.parse(body);

    const db = await getDb();

    // Check contact exists
    const existing = await db.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Check for email conflict if email is being changed
    if (data.email && data.email !== existing.email) {
      const emailConflict = await db.contact.findUnique({
        where: { email: data.email },
      });
      if (emailConflict) {
        return NextResponse.json(
          { error: "A contact with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Build update data
    const { tagIds, marketingOptIn, ...updateData } = data;

    // Track changes for activity
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(updateData)) {
      const existingValue = existing[key as keyof typeof existing];
      if (value !== existingValue) {
        changes[key] = { from: existingValue, to: value };
      }
    }

    // Handle marketing opt-in timestamp
    let marketingOptInAt = existing.marketingOptInAt;
    if (marketingOptIn !== undefined && marketingOptIn !== existing.marketingOptIn) {
      marketingOptInAt = marketingOptIn ? new Date() : null;
      changes.marketingOptIn = { from: existing.marketingOptIn, to: marketingOptIn };
    }

    // Update contact
    const contact = await db.contact.update({
      where: { id },
      data: {
        ...updateData,
        marketingOptIn: marketingOptIn ?? existing.marketingOptIn,
        marketingOptInAt,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // Handle tag updates if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await db.contactTag.deleteMany({ where: { contactId: id } });

      // Add new tags
      if (tagIds.length > 0) {
        await db.contactTag.createMany({
          data: tagIds.map((tagId) => ({ contactId: id, tagId })),
        });
      }
    }

    // Create activity if there were changes
    if (Object.keys(changes).length > 0) {
      await db.activity.create({
        data: {
          contactId: id,
          type: "CONTACT_UPDATED",
          payload: { changes: JSON.parse(JSON.stringify(changes)) },
        },
      });
    }

    // Re-fetch with tags
    const updatedContact = await db.contact.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid contact data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Soft delete contact
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDb();

    const contact = await db.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Soft delete
    await db.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
