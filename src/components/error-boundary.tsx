'use client';

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ApiError, parseApiError, logError } from '@/lib/api-error';

// ==================== TYPES ====================

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// ==================== ERROR BOUNDARY ====================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    if (process.env.NODE_ENV === 'development') {
      console.group('❌ React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Call error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error if resetKeys changed
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasChanged) {
        this.resetError();
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// ==================== DEFAULT FALLBACK ====================

interface FallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: FallbackProps) {
  const apiError = parseApiError(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-xl font-semibold text-gray-900 text-center">
          Oops! Terjadi Kesalahan
        </h1>

        <p className="mt-2 text-sm text-gray-600 text-center">
          {apiError.getUserMessage()}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
            <p className="font-semibold">Error Details:</p>
            <p className="mt-1">Code: {apiError.code}</p>
            <p>Status: {apiError.statusCode}</p>
            <p className="mt-2 break-all">{apiError.message}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== API ERROR BOUNDARY ====================

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ApiError, resetError: () => void) => ReactNode;
  onError?: (error: ApiError) => void;
}

export function ApiErrorBoundary({ children, fallback, onError }: ApiErrorBoundaryProps) {
  const handleError = (error: Error) => {
    const apiError = parseApiError(error);
    logError(apiError);

    if (onError) {
      onError(apiError);
    }
  };

  return (
    <ErrorBoundary
      fallback={
        fallback
          ? (error, reset) => fallback(parseApiError(error), reset)
          : undefined
      }
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

// ==================== EXPORTS ====================

export default ErrorBoundary;
