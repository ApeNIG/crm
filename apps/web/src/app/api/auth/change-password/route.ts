import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations/auth";
import {
  getCurrentUser,
  verifyPassword,
  hashPassword,
  deleteAllUserSessions,
  getSessionCookie,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import type { ChangePasswordResponse } from "@/types/auth";

// PATCH /api/auth/change-password - Change current user's password
export async function PATCH(request: NextRequest): Promise<NextResponse<ChangePasswordResponse>> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    // Get full user with password hash
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(data.newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Get current session token before deleting all sessions
    const currentToken = await getSessionCookie();

    // Invalidate all sessions for security
    await deleteAllUserSessions(user.id);

    // Create a new session for the current user
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Only create new session if there was an existing one
    if (currentToken) {
      const { token } = await createSession(user.id, userAgent, ipAddress);
      await setSessionCookie(token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/auth/change-password error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid password data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
