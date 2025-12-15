'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '@/lib/api-types';

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Custom hook untuk toast notifications
 * Bisa digunakan untuk menampilkan API errors
 *
 * @example
 * const { showToast, showError, toasts } = useToast();
 *
 * try {
 *   await createTicket(data);
 *   showToast('Ticket created!', 'success');
 * } catch (error) {
 *   showError(error);
 * }
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (error: unknown, customMessage?: string) => {
      let message = customMessage || 'An error occurred';

      if (error instanceof AxiosError && error.response) {
        const apiError = error.response.data as ApiError;
        if (Array.isArray(apiError.message)) {
          message = apiError.message.join(', ');
        } else {
          message = apiError.message || message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      return showToast(message, 'error');
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    showWarning,
    removeToast,
    clearAll,
  };
}
