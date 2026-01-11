import { NextResponse } from "next/server";
import {
  getSessionCookie,
  deleteSession,
  clearSessionCookie,
} from "@/lib/auth";
import type { LogoutResponse } from "@/types/auth";

// POST /api/auth/logout - Destroy session and clear cookie
export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    // Get current session token
    const token = await getSessionCookie();

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);

    // Even if there's an error, try to clear the cookie
    try {
      await clearSessionCookie();
    } catch {
      // Ignore cookie clearing errors
    }

    return NextResponse.json({ success: true });
  }
}
