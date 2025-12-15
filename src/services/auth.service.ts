import axiosInstance from '@/lib/axios';
import { tokenManager } from '@/lib/token-manager';
import { AuthResponse, OtpResponse, OtpVerifyResponse, User } from '@/lib/api-types';

/**
 * Authentication Service
 * Handles user authentication operations
 */

// Login
export const login = async (phone: string, password: string) => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', {
    phone,
    password,
  });

  // Store tokens using token manager
  if (response.data.accessToken && response.data.refreshToken) {
    tokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }

  return response.data;
};

// Register (Customer)
export const register = async (data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  address?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
}) => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', data);

  // Store tokens using token manager
  if (response.data.accessToken && response.data.refreshToken) {
    tokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }

  return response.data;
};

// Send OTP
export const sendOtp = async (phone: string) => {
  const response = await axiosInstance.post<OtpResponse>('/otp/send', { phone });
  return response.data;
};

// Verify OTP
export const verifyOtp = async (phone: string, code: string) => {
  const response = await axiosInstance.post<OtpVerifyResponse>('/otp/verify', {
    phone,
    code,
  });
  return response.data;
};

// Forgot Password (sends OTP)
export const forgotPassword = async (phone: string) => {
  const response = await axiosInstance.post<OtpResponse>('/auth/forgot-password', {
    phone,
  });
  return response.data;
};

// Reset Password
export const resetPassword = async (phone: string, code: string, newPassword: string) => {
  const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', {
    phone,
    code,
    newPassword,
  });
  return response.data;
};

// Refresh Token
export const refreshToken = async (refreshToken: string) => {
  const response = await axiosInstance.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });

  // Update tokens using token manager
  if (response.data.accessToken && response.data.refreshToken) {
    tokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }

  return response.data;
};

// Get Current User
export const getCurrentUser = async () => {
  const response = await axiosInstance.get<User>('/auth/me');
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await axiosInstance.post<{ message: string }>('/auth/logout');

  // Clear tokens using token manager
  tokenManager.clearTokens();

  return response.data;
};
