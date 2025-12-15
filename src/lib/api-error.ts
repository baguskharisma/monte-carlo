/**
 * API Error Classes & Utilities
 * Comprehensive error handling untuk API requests
 */

import { AxiosError } from 'axios';
import { ApiError as ApiErrorType } from './api-types';

// ==================== ERROR CODES ====================

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',

  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server Errors (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // Custom Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
}

// ==================== CUSTOM ERROR CLASSES ====================

/**
 * Base API Error Class
 */
export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly originalError?: Error;
  public readonly timestamp: Date;
  public readonly requestUrl?: string;
  public readonly requestMethod?: string;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert error to JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      requestUrl: this.requestUrl,
      requestMethod: this.requestMethod,
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message;
  }
}

/**
 * Network Error
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred', originalError?: Error) {
    super(message, ErrorCode.NETWORK_ERROR, 0, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends ApiError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    errors: Record<string, string[]> = {},
    originalError?: Error
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, 422, originalError);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Get all validation errors as array
   */
  getErrors(): string[] {
    return Object.values(this.errors).flat();
  }

  /**
   * Get errors for specific field
   */
  getFieldErrors(field: string): string[] {
    return this.errors[field] || [];
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access', originalError?: Error) {
    super(message, ErrorCode.UNAUTHORIZED, 401, originalError);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden', originalError?: Error) {
    super(message, ErrorCode.FORBIDDEN, 403, originalError);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', originalError?: Error) {
    super(message, ErrorCode.NOT_FOUND, 404, originalError);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', originalError?: Error) {
    super(message, ErrorCode.CONFLICT, 409, originalError);
    this.name = 'ConflictError';
  }
}

/**
 * Server Error
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Server error occurred', statusCode: number = 500, originalError?: Error) {
    super(message, ErrorCode.SERVER_ERROR, statusCode, originalError);
    this.name = 'ServerError';
  }
}

// ==================== ERROR MESSAGES ====================

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  [ErrorCode.TIMEOUT]: 'Permintaan timeout. Silakan coba lagi.',
  [ErrorCode.CANCELLED]: 'Permintaan dibatalkan.',
  [ErrorCode.BAD_REQUEST]: 'Permintaan tidak valid.',
  [ErrorCode.UNAUTHORIZED]: 'Anda harus login terlebih dahulu.',
  [ErrorCode.FORBIDDEN]: 'Anda tidak memiliki akses ke resource ini.',
  [ErrorCode.NOT_FOUND]: 'Resource tidak ditemukan.',
  [ErrorCode.CONFLICT]: 'Terjadi konflik data.',
  [ErrorCode.VALIDATION_ERROR]: 'Data yang Anda masukkan tidak valid.',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  [ErrorCode.SERVER_ERROR]: 'Terjadi kesalahan pada server.',
  [ErrorCode.BAD_GATEWAY]: 'Server gateway error.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Layanan sedang tidak tersedia.',
  [ErrorCode.GATEWAY_TIMEOUT]: 'Gateway timeout.',
  [ErrorCode.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak diketahui.',
  [ErrorCode.PARSE_ERROR]: 'Gagal memproses response dari server.',
};

// ==================== ERROR PARSER ====================

/**
 * Parse Axios error to custom error class
 */
export function parseApiError(error: unknown): ApiError {
  // Already a custom API error
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiErrorType>;

    // Network error (no response)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return new ApiError(
          'Request timeout',
          ErrorCode.TIMEOUT,
          0,
          axiosError
        );
      }

      if (axiosError.code === 'ERR_CANCELED') {
        return new ApiError(
          'Request cancelled',
          ErrorCode.CANCELLED,
          0,
          axiosError
        );
      }

      return new NetworkError(
        axiosError.message || 'Network error',
        axiosError
      );
    }

    // HTTP error with response
    const status = axiosError.response.status;
    const data = axiosError.response.data;
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || axiosError.message;

    // Map status codes to error classes
    switch (status) {
      case 400:
        return new ApiError(message, ErrorCode.BAD_REQUEST, 400, axiosError);

      case 401:
        return new UnauthorizedError(message, axiosError);

      case 403:
        return new ForbiddenError(message, axiosError);

      case 404:
        return new NotFoundError(message, axiosError);

      case 409:
        return new ConflictError(message, axiosError);

      case 422:
        return new ValidationError(
          message,
          (data as any)?.errors || {},
          axiosError
        );

      case 429:
        return new ApiError(
          message,
          ErrorCode.TOO_MANY_REQUESTS,
          429,
          axiosError
        );

      case 500:
        return new ServerError(message, 500, axiosError);

      case 502:
        return new ApiError(message, ErrorCode.BAD_GATEWAY, 502, axiosError);

      case 503:
        return new ApiError(
          message,
          ErrorCode.SERVICE_UNAVAILABLE,
          503,
          axiosError
        );

      case 504:
        return new ApiError(
          message,
          ErrorCode.GATEWAY_TIMEOUT,
          504,
          axiosError
        );

      default:
        if (status >= 500) {
          return new ServerError(message, status, axiosError);
        }
        return new ApiError(message, ErrorCode.UNKNOWN_ERROR, status, axiosError);
    }
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      500,
      error
    );
  }

  // Unknown error
  return new ApiError(
    'An unknown error occurred',
    ErrorCode.UNKNOWN_ERROR,
    500
  );
}

// ==================== ERROR UTILITIES ====================

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  // Network errors are retryable
  if (error.code === ErrorCode.NETWORK_ERROR) {
    return true;
  }

  // Timeout errors are retryable
  if (error.code === ErrorCode.TIMEOUT) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error.statusCode >= 500) {
    return true;
  }

  // Request timeout (408) is retryable
  if (error.statusCode === 408) {
    return true;
  }

  return false;
}

/**
 * Check if error requires authentication
 */
export function requiresAuth(error: ApiError): boolean {
  return error.code === ErrorCode.UNAUTHORIZED;
}

/**
 * Check if error is client error (4xx)
 */
export function isClientError(error: ApiError): boolean {
  return error.statusCode >= 400 && error.statusCode < 500;
}

/**
 * Check if error is server error (5xx)
 */
export function isServerError(error: ApiError): boolean {
  return error.statusCode >= 500;
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: ApiError): boolean {
  return error.code === ErrorCode.NETWORK_ERROR || error.statusCode === 0;
}

/**
 * Get retry delay based on attempt number (exponential backoff)
 */
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Log error to console (development only)
 */
export function logError(error: ApiError): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ API Error: ${error.code}`);
    console.error('Message:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Timestamp:', error.timestamp.toISOString());
    if (error.requestUrl) {
      console.error('URL:', error.requestUrl);
    }
    if (error.requestMethod) {
      console.error('Method:', error.requestMethod);
    }
    if (error instanceof ValidationError) {
      console.error('Validation Errors:', error.errors);
    }
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();
  }
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: ApiError): string {
  // Use custom user message if available
  const userMessage = error.getUserMessage();

  // For validation errors, list all errors
  if (error instanceof ValidationError) {
    const errors = error.getErrors();
    if (errors.length > 0) {
      return `${userMessage}\n${errors.join('\n')}`;
    }
  }

  return userMessage;
}

// ==================== ERROR HANDLER ====================

/**
 * Handle API error with optional callbacks
 */
export interface ErrorHandlerOptions {
  onNetworkError?: (error: NetworkError) => void;
  onUnauthorized?: (error: UnauthorizedError) => void;
  onForbidden?: (error: ForbiddenError) => void;
  onNotFound?: (error: NotFoundError) => void;
  onValidation?: (error: ValidationError) => void;
  onServerError?: (error: ServerError) => void;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
  logError?: boolean;
}

/**
 * Handle API error with custom callbacks
 */
export function handleApiError(error: unknown, options: ErrorHandlerOptions = {}): ApiError {
  const apiError = parseApiError(error);

  // Log error
  if (options.logError !== false) {
    logError(apiError);
  }

  // Call specific error handlers
  if (apiError instanceof NetworkError && options.onNetworkError) {
    options.onNetworkError(apiError);
  } else if (apiError instanceof UnauthorizedError && options.onUnauthorized) {
    options.onUnauthorized(apiError);
  } else if (apiError instanceof ForbiddenError && options.onForbidden) {
    options.onForbidden(apiError);
  } else if (apiError instanceof NotFoundError && options.onNotFound) {
    options.onNotFound(apiError);
  } else if (apiError instanceof ValidationError && options.onValidation) {
    options.onValidation(apiError);
  } else if (apiError instanceof ServerError && options.onServerError) {
    options.onServerError(apiError);
  }

  // Call generic error handler
  if (options.onError) {
    options.onError(apiError);
  }

  return apiError;
}

// ==================== EXPORTS ====================

export {
  ApiError as default,
  parseApiError as parseError,
  handleApiError as handleError,
};
