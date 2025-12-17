/**
 * API Client Configuration
 * Axios instance with request/response interceptors for JWT authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Storage keys
const TOKEN_KEY = 'monte-carlo-token';
const REFRESH_TOKEN_KEY = 'monte-carlo-refresh-token';

/**
 * Create Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(TOKEN_KEY);

    // Attach token to Authorization header if exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios (401, 403, network errors)
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data portion of the response
    return response.data;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('monte-carlo-auth');

      // Redirect to login page (only in browser environment)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Error Handler Utility
 * Extracts user-friendly error messages from API errors
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Check for response error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Check for error message
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Network error
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    // Default axios error
    return error.message || 'An unexpected error occurred';
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Token Management Utilities
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export default apiClient;
