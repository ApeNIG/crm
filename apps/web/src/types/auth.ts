import type { User, Session, UserRole } from "@prisma/client";

// ============================================
// USER TYPES
// ============================================

/**
 * Safe user type that excludes sensitive fields like passwordHash
 * This should be used in all client-facing responses
 */
export type SafeUser = Omit<User, "passwordHash">;

/**
 * Session with the user relation (safe version)
 */
export interface SessionWithUser extends Session {
  user: SafeUser;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AuthResponse {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

// LoginResponse is the same as AuthResponse
export type LoginResponse = AuthResponse;

export interface LogoutResponse {
  success: boolean;
}

export interface MeResponse {
  user: SafeUser | null;
}

// RegisterResponse is the same as AuthResponse
export type RegisterResponse = AuthResponse;

export interface ChangePasswordResponse {
  success: boolean;
  error?: string;
}

// ============================================
// JWT PAYLOAD TYPE
// ============================================

export interface JWTPayload {
  sessionId: string;
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ============================================
// AUTH CONTEXT TYPE (for client-side state)
// ============================================

export interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
