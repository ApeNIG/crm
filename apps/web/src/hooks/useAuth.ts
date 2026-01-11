"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type {
  SafeUser,
  MeResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
  ChangePasswordResponse,
} from "@/types/auth";

const API_BASE = "/api/auth";

// ============================================
// API FETCH FUNCTIONS
// ============================================

// Fetch current user
async function fetchCurrentUser(): Promise<SafeUser | null> {
  const res = await fetch(`${API_BASE}/me`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  const data: MeResponse = await res.json();
  return data.user;
}

// Login
async function login(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data: LoginResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

// Logout
async function logout(): Promise<LogoutResponse> {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
}

// Register
async function register(data: {
  email: string;
  password: string;
  name: string;
  role?: "ADMIN" | "USER";
}): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData: RegisterResponse = await res.json();

  if (!res.ok || !responseData.success) {
    throw new Error(responseData.error || "Registration failed");
  }

  return responseData;
}

// Change password
async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ChangePasswordResponse> {
  const res = await fetch(`${API_BASE}/change-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData: ChangePasswordResponse = await res.json();

  if (!res.ok || !responseData.success) {
    throw new Error(responseData.error || "Failed to change password");
  }

  return responseData;
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Fetch current authenticated user
 * Uses 5-minute stale time for better performance
 */
export function useUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth failures
  });
}

/**
 * Login mutation
 * Redirects to "/" or redirect param on success
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(["auth", "user"], data.user);

      // Get redirect URL from query params or default to "/"
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/";

      // Navigate to redirect URL
      router.push(redirectTo);
      router.refresh();
    },
    onError: () => {
      // Clear any stale user data on login error
      queryClient.setQueryData(["auth", "user"], null);
    },
  });
}

/**
 * Logout mutation
 * Redirects to /login on success
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries (including user data)
      queryClient.clear();

      // Navigate to login
      router.push("/login");
      router.refresh();
    },
    onError: () => {
      // Even on error, try to clear and redirect
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}

/**
 * Register user mutation (admin only)
 * Invalidates users list on success
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Change password mutation
 * Updates user cache on success
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      // Invalidate user to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}

/**
 * Check if user is admin
 */
export function useIsAdmin() {
  const { data: user, isLoading } = useUser();
  return {
    isAdmin: user?.role === "ADMIN",
    isLoading,
    user,
  };
}
