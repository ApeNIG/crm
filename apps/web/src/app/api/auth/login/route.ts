import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import type { LoginResponse } from "@/types/auth";

// POST /api/auth/login - Authenticate user and create session
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find user by email (case-insensitive)
    const user = await db.user.findFirst({
      where: {
        email: {
          equals: data.email,
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    // Generic error message to prevent email enumeration
    const invalidCredentialsResponse: LoginResponse = {
      success: false,
      error: "Invalid email or password",
    };

    if (!user) {
      return NextResponse.json(invalidCredentialsResponse, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is disabled" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(invalidCredentialsResponse, { status: 401 });
    }

    // Get user agent and IP from request
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Create session
    const { session, token } = await createSession(user.id, userAgent, ipAddress);

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
