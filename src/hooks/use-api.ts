'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '@/lib/api-types';

/**
 * Custom hook untuk handle API calls dengan loading & error states
 *
 * @example
 * const { execute, loading, error, data } = useApi(getSchedules);
 *
 * const handleLoad = async () => {
 *   const result = await execute({ limit: 20 });
 *   console.log(result);
 * };
 */
export function useApi<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T
) {
  type ReturnType = Awaited<ReturnType<T>>;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<ReturnType | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Extract API error dari Axios error
 */
function extractApiError(error: unknown): ApiError {
  if (error instanceof AxiosError && error.response) {
    return error.response.data as ApiError;
  }

  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : 'Unknown error',
    error: 'Internal Error',
  };
}
