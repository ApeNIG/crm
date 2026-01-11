import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import type { SafeUser, SessionWithUser, JWTPayload } from "@/types/auth";

// ============================================
// CONSTANTS
// ============================================

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "session";
const DEFAULT_SESSION_EXPIRY_DAYS = 7;

// ============================================
// ENVIRONMENT HELPERS
// ============================================

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

function getSessionExpiryDays(): number {
  const days = process.env.AUTH_SESSION_EXPIRY_DAYS;
  return days ? parseInt(days, 10) : DEFAULT_SESSION_EXPIRY_DAYS;
}

// ============================================
// PASSWORD UTILITIES
// ============================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}

// ============================================
// JWT TOKEN UTILITIES
// ============================================

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(payload: {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const expiryDays = getSessionExpiryDays();
  const secret = getAuthSecret();

  const token = await new SignJWT({
    sessionId: payload.sessionId,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create a new session in the database
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ session: SessionWithUser; token: string }> {
  const expiryDays = getSessionExpiryDays();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Get user for token creation
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Create session record
  const session = await db.session.create({
    data: {
      userId,
      token: "", // Will update after token creation
      expiresAt,
      userAgent,
      ipAddress,
    },
    include: {
      user: true,
    },
  });

  // Create JWT token
  const token = await createSessionToken({
    sessionId: session.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Update session with token
  await db.session.update({
    where: { id: session.id },
    data: { token },
  });

  // Update user's last login
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  // Return safe user (without passwordHash)
  const safeSession: SessionWithUser = {
    ...session,
    token,
    user: excludePasswordHash(session.user),
  };

  return { session: safeSession, token };
}

/**
 * Get session from database by token
 */
export async function getSession(token: string): Promise<SessionWithUser | null> {
  // First verify JWT
  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  // Get session from database
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    // Delete expired session
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  // Check if user is active
  if (!session.user.isActive || session.user.deletedAt) {
    return null;
  }

  // Return safe user (without passwordHash)
  return {
    ...session,
    user: excludePasswordHash(session.user),
  };
}

/**
 * Delete a session from the database
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({
      where: { token },
    });
  } catch {
    // Session may already be deleted, ignore error
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({
    where: { userId },
  });
}

// ============================================
// COOKIE MANAGEMENT
// ============================================

/**
 * Set the session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const expiryDays = getSessionExpiryDays();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiryDays * 24 * 60 * 60, // Convert days to seconds
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get the session cookie value
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// ============================================
// CURRENT USER HELPERS
// ============================================

/**
 * Get the current authenticated user from the session cookie
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = await getSessionCookie();
  if (!token) {
    return null;
  }

  const session = await getSession(token);
  return session?.user ?? null;
}

/**
 * Get the current session from the cookie
 */
export async function getCurrentSession(): Promise<SessionWithUser | null> {
  const token = await getSessionCookie();
  if (!token) {
    return null;
  }

  return getSession(token);
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Remove passwordHash from user object
 */
function excludePasswordHash(user: {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  lastLoginAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: SafeUser): boolean {
  return user.role === "ADMIN";
}
