'use client';

import { useState, useCallback } from 'react';
import {
  ApiError,
  parseApiError,
  handleApiError,
  ErrorHandlerOptions,
  formatErrorMessage,
  ValidationError,
  NetworkError,
  UnauthorizedError,
} from '@/lib/api-error';

/**
 * Custom hook untuk handle API errors
 *
 * @example
 * const { error, handleError, clearError, getErrorMessage } = useErrorHandler();
 *
 * try {
 *   await createTicket(data);
 * } catch (err) {
 *   handleError(err, {
 *     onValidation: (error) => {
 *       setFieldErrors(error.errors);
 *     }
 *   });
 * }
 */
export function useErrorHandler() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((err: unknown, options?: ErrorHandlerOptions) => {
    const apiError = handleApiError(err, {
      ...options,
      onError: (error) => {
        setError(error);
        options?.onError?.(error);
      },
    });

    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = useCallback(() => {
    return error ? formatErrorMessage(error) : null;
  }, [error]);

  const isError = useCallback((type?: typeof ApiError) => {
    if (!error) return false;
    if (!type) return true;
    return error instanceof type;
  }, [error]);

  return {
    error,
    handleError,
    clearError,
    getErrorMessage,
    isError,
    hasError: !!error,
  };
}

/**
 * Custom hook untuk handle validation errors
 */
export function useValidationErrors() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const setFieldError = useCallback((field: string, messages: string[]) => {
    setErrors((prev) => ({
      ...prev,
      [field]: messages,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback(
    (field: string): string[] => {
      return errors[field] || [];
    },
    [errors]
  );

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return !!errors[field] && errors[field].length > 0;
    },
    [errors]
  );

  const setValidationError = useCallback((error: ValidationError) => {
    setErrors(error.errors);
  }, []);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError,
    setValidationError,
    hasErrors: Object.keys(errors).length > 0,
  };
}

/**
 * Custom hook untuk handle network errors
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [hasNetworkError, setHasNetworkError] = useState(false);

  const handleNetworkError = useCallback((error: unknown) => {
    const apiError = parseApiError(error);

    if (apiError instanceof NetworkError) {
      setHasNetworkError(true);
      setIsOnline(false);
      return true;
    }

    return false;
  }, []);

  const clearNetworkError = useCallback(() => {
    setHasNetworkError(false);
    setIsOnline(navigator.onLine);
  }, []);

  return {
    isOnline,
    hasNetworkError,
    handleNetworkError,
    clearNetworkError,
  };
}

/**
 * Custom hook untuk handle unauthorized errors
 */
export function useAuthErrors() {
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const handleAuthError = useCallback((error: unknown) => {
    const apiError = parseApiError(error);

    if (apiError instanceof UnauthorizedError) {
      setIsUnauthorized(true);
      return true;
    }

    return false;
  }, []);

  const clearAuthError = useCallback(() => {
    setIsUnauthorized(false);
  }, []);

  return {
    isUnauthorized,
    handleAuthError,
    clearAuthError,
  };
}

/**
 * Combined error handler hook
 */
export function useApiErrorHandler() {
  const errorHandler = useErrorHandler();
  const validationErrors = useValidationErrors();
  const networkStatus = useNetworkStatus();
  const authErrors = useAuthErrors();

  const handleError = useCallback(
    (err: unknown, options?: ErrorHandlerOptions) => {
      const apiError = errorHandler.handleError(err, {
        ...options,
        onValidation: (error) => {
          validationErrors.setValidationError(error);
          options?.onValidation?.(error);
        },
        onNetworkError: (error) => {
          networkStatus.handleNetworkError(error);
          options?.onNetworkError?.(error);
        },
        onUnauthorized: (error) => {
          authErrors.handleAuthError(error);
          options?.onUnauthorized?.(error);
        },
      });

      return apiError;
    },
    [errorHandler, validationErrors, networkStatus, authErrors]
  );

  const clearAll = useCallback(() => {
    errorHandler.clearError();
    validationErrors.clearErrors();
    networkStatus.clearNetworkError();
    authErrors.clearAuthError();
  }, [errorHandler, validationErrors, networkStatus, authErrors]);

  return {
    // General error
    error: errorHandler.error,
    hasError: errorHandler.hasError,
    getErrorMessage: errorHandler.getErrorMessage,

    // Validation errors
    validationErrors: validationErrors.errors,
    hasValidationErrors: validationErrors.hasErrors,
    getFieldError: validationErrors.getFieldError,
    hasFieldError: validationErrors.hasFieldError,

    // Network status
    isOnline: networkStatus.isOnline,
    hasNetworkError: networkStatus.hasNetworkError,

    // Auth errors
    isUnauthorized: authErrors.isUnauthorized,

    // Actions
    handleError,
    clearError: errorHandler.clearError,
    clearFieldError: validationErrors.clearFieldError,
    clearAll,
  };
}
