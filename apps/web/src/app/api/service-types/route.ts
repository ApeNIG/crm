import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createServiceTypeSchema,
  serviceTypeQuerySchema,
} from "@/lib/validations/service-type";
import { getMockServiceTypes } from "@/lib/mock-data";

// GET /api/service-types - List service types with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const query = serviceTypeQuerySchema.parse({
      isActive: searchParams.get("isActive") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
    });

    const { isActive, page, limit } = query;

    try {
      const db = await getDb();
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [serviceTypes, total] = await Promise.all([
        db.serviceType.findMany({
          where,
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        db.serviceType.count({ where }),
      ]);

      return NextResponse.json({
        serviceTypes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      const result = getMockServiceTypes({ isActive, page, limit });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/service-types error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service types" },
      { status: 500 }
    );
  }
}

// POST /api/service-types - Create a new service type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createServiceTypeSchema.parse(body);

    const db = await getDb();

    const serviceType = await db.serviceType.create({
      data,
    });

    return NextResponse.json(serviceType, { status: 201 });
  } catch (error) {
    console.error("POST /api/service-types error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid service type data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create service type" },
      { status: 500 }
    );
  }
}
