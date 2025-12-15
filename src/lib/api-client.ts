/**
 * Type-safe API Client
 * Uses generated types from OpenAPI spec
 *
 * To generate types: npm run generate:api
 */

import axiosInstance from './axios';
import type { AxiosRequestConfig } from 'axios';

// ==================== TYPES ====================

/**
 * Generic API request options
 */
export interface ApiRequestOptions extends AxiosRequestConfig {
  signal?: AbortSignal;
}

/**
 * Type-safe API client
 * Provides type-safe methods for API requests
 *
 * @example
 * import { apiClient } from '@/lib/api-client';
 *
 * // GET request with type safety
 * const response = await apiClient.get<ScheduleResponse>('/schedules/{id}', {
 *   params: { id: 'schedule-123' }
 * });
 *
 * // POST request with type safety
 * const response = await apiClient.post<TicketResponse>('/tickets', {
 *   data: { scheduleId: '123', ... }
 * });
 */
export class TypeSafeApiClient {
  /**
   * GET request
   */
  async get<TResponse>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.get<TResponse>(path, options);
    return response.data;
  }

  /**
   * POST request
   */
  async post<TResponse, TData = any>(
    path: string,
    data?: TData,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(path, data, options);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<TResponse, TData = any>(
    path: string,
    data?: TData,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.put<TResponse>(path, data, options);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<TResponse, TData = any>(
    path: string,
    data?: TData,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.patch<TResponse>(path, data, options);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<TResponse>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.delete<TResponse>(path, options);
    return response.data;
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<TResponse>(
    path: string,
    formData: FormData,
    options?: ApiRequestOptions
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(path, formData, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new TypeSafeApiClient();

/**
 * Create custom API client instance
 */
export function createApiClient(): TypeSafeApiClient {
  return new TypeSafeApiClient();
}

// ==================== PATH BUILDER ====================

/**
 * Build API path with parameters
 *
 * @example
 * buildPath('/schedules/{id}', { id: '123' })
 * // Returns: '/schedules/123'
 *
 * buildPath('/schedules/{id}/tickets/{ticketId}', { id: '123', ticketId: '456' })
 * // Returns: '/schedules/123/tickets/456'
 */
export function buildPath(
  path: string,
  params: Record<string, string | number>
): string {
  let result = path;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });

  return result;
}

/**
 * Build query string from object
 *
 * @example
 * buildQuery({ page: 1, limit: 10, status: 'ACTIVE' })
 * // Returns: '?page=1&limit=10&status=ACTIVE'
 */
export function buildQuery(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ==================== TYPE GUARDS ====================

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: any
): response is { data: T[]; meta: any } {
  return (
    response &&
    typeof response === 'object' &&
    Array.isArray(response.data) &&
    'meta' in response
  );
}

/**
 * Check if response is error
 */
export function isErrorResponse(response: any): response is {
  statusCode: number;
  message: string | string[];
  error: string;
} {
  return (
    response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    'message' in response &&
    'error' in response
  );
}

// ==================== EXPORTS ====================

export default apiClient;
