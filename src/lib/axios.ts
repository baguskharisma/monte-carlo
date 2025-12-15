import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenManager } from './token-manager';
import { parseApiError, isRetryableError as isApiRetryable } from './api-error';

// ==================== CONFIGURATION ====================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ==================== TYPES ====================

interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// ==================== STATE MANAGEMENT ====================

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

// ==================== HELPER FUNCTIONS ====================

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Check if refresh token is expired
    if (tokenManager.isRefreshTokenExpired()) {
      throw new Error('Refresh token expired');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens using token manager
    tokenManager.setAccessToken(accessToken);
    if (newRefreshToken) {
      tokenManager.setRefreshToken(newRefreshToken);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Token refreshed successfully');
      tokenManager.debugTokenInfo();
    }

    return accessToken;
  } catch (error) {
    // Clear tokens and redirect to login
    tokenManager.clearTokens();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return null;
  }
};

/**
 * Delay execution for retry mechanism
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is retryable (uses api-error utility)
 */
const isRetryableError = (error: AxiosError): boolean => {
  const apiError = parseApiError(error);
  return isApiRetryable(apiError);
};

/**
 * Log request for development
 */
const logRequest = (config: InternalAxiosRequestConfig) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    if (config.data) {
      console.log('Data:', config.data);
    }
    if (config.params) {
      console.log('Params:', config.params);
    }
    console.groupEnd();
  }
};

/**
 * Log response for development
 */
const logResponse = (response: AxiosResponse) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
  }
};

/**
 * Log error for development
 */
const logError = (error: AxiosError) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    if (error.response?.data) {
      console.log('Error Data:', error.response.data);
    }
    console.groupEnd();
  }
};

// ==================== AXIOS INSTANCE ====================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from token manager
    const token = tokenManager.getAccessToken();

    // Add Authorization header if token exists and is valid
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    logRequest(config);

    return config;
  },
  (error: AxiosError) => {
    logError(error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    logResponse(response);

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Log error in development
    logError(error);

    // ==================== HANDLE 401 UNAUTHORIZED ====================
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if error is due to invalid/expired token
      const errorMessage = (error.response.data as any)?.message || '';

      if (
        errorMessage.includes('Invalid token') ||
        errorMessage.includes('Token has been revoked') ||
        errorMessage.includes('Unauthorized')
      ) {
        // Token is invalid, clear and redirect
        tokenManager.clearTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      // Mark request as retry to prevent infinite loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Update authorization header with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Process all queued requests
          processQueue(null, newToken);

          // Retry original request with new token
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'), null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ==================== HANDLE RETRY FOR NETWORK ERRORS ====================
    if (originalRequest && isRetryableError(error)) {
      const retryCount = originalRequest._retryCount || 0;

      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;

        // Log retry attempt
        if (process.env.NODE_ENV === 'development') {
          const apiError = parseApiError(error);
          console.log(
            `🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES}):`,
            originalRequest.url,
            `- Error: ${apiError.code}`
          );
        }

        // Wait before retrying (exponential backoff)
        await delay(RETRY_DELAY * Math.pow(2, retryCount));

        return axiosInstance(originalRequest);
      }
    }

    // ==================== HANDLE OTHER ERRORS ====================
    // Parse error using custom error handler
    const apiError = parseApiError(error);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`❌ API Error: ${apiError.code}`);
      console.error('Message:', apiError.getUserMessage());
      console.error('Status:', apiError.statusCode);
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method?.toUpperCase());
      console.groupEnd();
    }

    // Reject with parsed API error
    return Promise.reject(apiError);
  }
);

// ==================== EXPORT ====================

export default axiosInstance;

// Export helper for manual token refresh
export const manualRefreshToken = refreshAccessToken;

// Export helper to clear tokens and logout
export const clearAuth = () => {
  tokenManager.clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Export token manager for direct access
export { tokenManager };
