import { z } from "zod";

// ============================================
// AUTH ENUMS
// ============================================

export const userRoleEnum = z.enum(["ADMIN", "USER"]);

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// ============================================
// LOGIN VALIDATION
// ============================================

/**
 * Schema for login requests
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Form schema for login (react-hook-form)
 */
export const loginFormSchema = loginSchema;

// ============================================
// REGISTER VALIDATION
// ============================================

/**
 * Schema for user registration (admin creating users)
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  role: userRoleEnum.optional().default("USER"),
});

/**
 * Form schema for register (react-hook-form)
 */
export const registerFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  role: userRoleEnum.optional().default("USER"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ============================================
// CHANGE PASSWORD VALIDATION
// ============================================

/**
 * Schema for changing password
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/**
 * Form schema for change password (react-hook-form)
 */
export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

// ============================================
// EXPORTED TYPES
// ============================================

export type LoginInput = z.output<typeof loginSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type RegisterInput = z.output<typeof registerSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export type ChangePasswordInput = z.output<typeof changePasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
