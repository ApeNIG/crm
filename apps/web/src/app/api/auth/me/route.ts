import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { MeResponse } from "@/types/auth";

// GET /api/auth/me - Get current authenticated user
export async function GET(): Promise<NextResponse<MeResponse>> {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null });
  }
}
