<<<<<<< HEAD
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
=======
/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, { getErrorMessage } from '@/lib/api';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/auth.types';

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Login with phone and password
   * @param phone - User's phone number
   * @param password - User's password
   * @returns LoginResponse with user data and tokens
   */
  async login(phone: string, password: string): Promise<LoginResponse> {
    try {
      const payload: LoginRequest = { phone, password };
      // Axios interceptor returns response.data directly
      const response: unknown = await apiClient.post('/auth/login', payload);
      return response as LoginResponse;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Logout user
   * Clears local storage and optionally calls backend logout endpoint
   */
  async logout(): Promise<void> {
    try {
      // Optional: Call backend logout endpoint if it exists
      // await apiClient.post('/auth/logout');

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('monte-carlo-token');
        localStorage.removeItem('monte-carlo-refresh-token');
        localStorage.removeItem('monte-carlo-auth');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('monte-carlo-token');
        localStorage.removeItem('monte-carlo-refresh-token');
        localStorage.removeItem('monte-carlo-auth');
      }
    }
  }

  /**
   * Request password reset (sends OTP to WhatsApp)
   * @param phone - User's phone number
   * @returns Response with success message and OTP expiry time
   */
  async forgotPassword(phone: string): Promise<ForgotPasswordResponse> {
    try {
      const payload: ForgotPasswordRequest = { phone };
      const response: unknown = await apiClient.post('/auth/forgot-password', payload);
      return response as ForgotPasswordResponse;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Reset password with OTP code
   * @param phone - User's phone number
   * @param code - 6-digit OTP code from WhatsApp
   * @param newPassword - New password
   * @returns Response with success message
   */
  async resetPassword(
    phone: string,
    code: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    try {
      const payload: ResetPasswordRequest = { phone, code, newPassword };
      const response: unknown = await apiClient.post('/auth/reset-password', payload);
      return response as ResetPasswordResponse;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Refresh access token using refresh token
   * (Optional - implement if backend supports token refresh)
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshToken = localStorage.getItem('monte-carlo-refresh-token');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: unknown = await apiClient.post('/auth/refresh', { refreshToken });

      return response as { accessToken: string; refreshToken: string };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
