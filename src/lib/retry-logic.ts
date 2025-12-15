/**
 * Advanced Retry Logic
 * Configurable retry strategies untuk API requests
 */

import { ApiError, isRetryableError, getRetryDelay } from './api-error';

// ==================== TYPES ====================

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: (error: ApiError) => boolean;
  onRetry?: (error: ApiError, attempt: number, delay: number) => void;
}

export interface RetryContext {
  attempt: number;
  maxRetries: number;
  lastError?: ApiError;
  totalDelay: number;
}

export type RetryStrategy = 'exponential' | 'linear' | 'fixed' | 'fibonacci';

// ==================== DEFAULT CONFIGURATIONS ====================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

export const AGGRESSIVE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 500,
  maxDelay: 60000,
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

export const CONSERVATIVE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelay: 2000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

export const NO_RETRY_CONFIG: RetryConfig = {
  maxRetries: 0,
  baseDelay: 0,
  maxDelay: 0,
  backoffMultiplier: 1,
};

// ==================== DELAY STRATEGIES ====================

/**
 * Calculate exponential backoff delay
 * Delay: baseDelay * (multiplier ^ attempt)
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay: number,
  multiplier: number = 2,
  maxDelay: number = 30000
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Calculate linear backoff delay
 * Delay: baseDelay * attempt
 */
export function linearBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number = 30000
): number {
  const delay = baseDelay * attempt;
  return Math.min(delay, maxDelay);
}

/**
 * Fixed delay (no backoff)
 * Delay: baseDelay (constant)
 */
export function fixedDelay(baseDelay: number): number {
  return baseDelay;
}

/**
 * Fibonacci backoff delay
 * Delay: baseDelay * fibonacci(attempt)
 */
export function fibonacciBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number = 30000
): number {
  const fib = (n: number): number => {
    if (n <= 1) return 1;
    return fib(n - 1) + fib(n - 2);
  };

  const delay = baseDelay * fib(attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Get delay based on strategy
 */
export function getDelayByStrategy(
  strategy: RetryStrategy,
  attempt: number,
  config: RetryConfig
): number {
  switch (strategy) {
    case 'exponential':
      return exponentialBackoff(
        attempt,
        config.baseDelay,
        config.backoffMultiplier,
        config.maxDelay
      );

    case 'linear':
      return linearBackoff(attempt, config.baseDelay, config.maxDelay);

    case 'fixed':
      return fixedDelay(config.baseDelay);

    case 'fibonacci':
      return fibonacciBackoff(attempt, config.baseDelay, config.maxDelay);

    default:
      return exponentialBackoff(
        attempt,
        config.baseDelay,
        config.backoffMultiplier,
        config.maxDelay
      );
  }
}

// ==================== RETRY EXECUTOR ====================

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  strategy: RetryStrategy = 'exponential'
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ApiError | undefined;

  for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
    try {
      // Execute function
      const result = await fn();
      return result;
    } catch (error) {
      // Parse error
      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR' as any,
        500,
        error instanceof Error ? error : undefined
      );

      lastError = apiError;

      // Check if we should retry
      const shouldRetry =
        attempt <= retryConfig.maxRetries &&
        (retryConfig.retryableErrors
          ? retryConfig.retryableErrors(apiError)
          : isRetryableError(apiError));

      if (!shouldRetry) {
        throw apiError;
      }

      // Calculate delay
      const delay = getDelayByStrategy(strategy, attempt, retryConfig);

      // Call retry callback
      if (retryConfig.onRetry) {
        retryConfig.onRetry(apiError, attempt, delay);
      }

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `🔄 Retry attempt ${attempt}/${retryConfig.maxRetries} after ${delay}ms`,
          apiError.message
        );
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries failed
  throw lastError!;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== RETRY DECORATOR ====================

/**
 * Retry decorator for async functions
 */
export function retry(config: Partial<RetryConfig> = {}, strategy: RetryStrategy = 'exponential') {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        config,
        strategy
      );
    };

    return descriptor;
  };
}

// ==================== CIRCUIT BREAKER ====================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation
  OPEN = 'OPEN',       // Circuit tripped, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit Breaker pattern implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if we should try half-open
      if (this.nextAttemptTime && new Date() >= this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Success - reset on success in half-open state
      if (this.state === CircuitState.HALF_OPEN) {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record failure
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    // Trip circuit if threshold reached
    if (this.failureCount >= this.config.failureThreshold) {
      this.trip();
    }
  }

  /**
   * Trip circuit (open)
   */
  private trip(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `⚡ Circuit breaker OPEN. Next attempt at ${this.nextAttemptTime.toISOString()}`
      );
    }
  }

  /**
   * Reset circuit
   */
  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Circuit breaker CLOSED (reset)');
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }
}

// ==================== BATCH RETRY ====================

/**
 * Retry multiple operations with individual retry logic
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {},
  strategy: RetryStrategy = 'exponential'
): Promise<Array<T | ApiError>> {
  const results = await Promise.allSettled(
    operations.map((op) => withRetry(op, config, strategy))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return result.reason;
    }
  });
}

// ==================== CONDITIONAL RETRY ====================

/**
 * Retry with custom condition
 */
export async function retryIf<T>(
  fn: () => Promise<T>,
  condition: (error: ApiError, attempt: number) => boolean,
  config: Partial<RetryConfig> = {},
  strategy: RetryStrategy = 'exponential'
): Promise<T> {
  return withRetry(
    fn,
    {
      ...config,
      retryableErrors: (error) => {
        const attempt = 1; // This should be tracked
        return condition(error, attempt);
      },
    },
    strategy
  );
}

// ==================== EXPORTS ====================

export {
  withRetry as default,
  exponentialBackoff,
  linearBackoff,
  fixedDelay,
  fibonacciBackoff,
  CircuitBreaker,
};
