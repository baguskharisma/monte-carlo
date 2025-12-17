/**
 * Authentication Type Definitions
 * Based on backend API OpenAPI specification
 */

import { z } from 'zod';
import type { User } from './user.types';

/**
 * Login Request
 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * Login Response from Backend
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  phone: string;
}

/**
 * Forgot Password Response
 */
export interface ForgotPasswordResponse {
  message: string;
  expiresIn: number; // OTP expiry in seconds (300 = 5 minutes)
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  phone: string;
  code: string; // 6-digit OTP code
  newPassword: string;
}

/**
 * Reset Password Response
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Auth State for Zustand Store
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth Actions for Zustand Store
 */
export interface AuthActions {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

/**
 * Combined Auth Store Type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Zod Schemas for Form Validation
 */

// Phone validation pattern for Indonesian phone numbers
// Accepts: 08xxxxxxxxxx, +6281xxxxxxxx, 6281xxxxxxxx
export const phoneSchema = z.string()
  .regex(
    /^(\+62|62|0)[0-9]{9,12}$/,
    'Invalid phone number format. Use format: 08xxxxxxxxxx'
  );

// Login form validation schema
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password form validation schema
export const resetPasswordSchema = z.object({
  code: z.string()
    .length(6, 'OTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only numbers'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
