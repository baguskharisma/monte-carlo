/**
 * JWT Token Manager
 * Handles access & refresh token storage, validation, and lifecycle
 */

import { jwtDecode } from 'jwt-decode';

// ==================== TYPES ====================

export interface TokenPayload {
  sub: string;         // User ID
  phone: string;       // User phone
  role: string;        // User role
  iat: number;         // Issued at
  exp: number;         // Expiration time
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// ==================== CONFIGURATION ====================

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_BUFFER = 60; // 60 seconds buffer before expiry

// ==================== TOKEN STORAGE ====================

/**
 * Storage strategy for tokens
 * Can be switched between localStorage, sessionStorage, or cookies
 */
class TokenStorage {
  private storage: Storage;

  constructor(useSessionStorage = false) {
    if (typeof window === 'undefined') {
      // SSR fallback - use in-memory storage
      this.storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
    } else {
      this.storage = useSessionStorage ? sessionStorage : localStorage;
    }
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.storage.setItem(ACCESS_TOKEN_KEY, token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.storage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set both tokens
   */
  setTokens(tokens: Tokens): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Get both tokens
   */
  getTokens(): Tokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  /**
   * Remove access token
   */
  removeAccessToken(): void {
    this.storage.removeItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    this.storage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

// ==================== TOKEN DECODER ====================

/**
 * Decode JWT token without verification
 * Use only for reading payload, not for validation
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);
  return payload?.exp ?? null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = TOKEN_EXPIRY_BUFFER): boolean {
  const expiry = getTokenExpiry(token);

  if (!expiry) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return now >= expiry - bufferSeconds;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);

  if (!expiry) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiry - now);
}

/**
 * Check if token is valid (not expired and has valid structure)
 */
export function isTokenValid(token: string): boolean {
  if (!token) {
    return false;
  }

  try {
    const payload = decodeToken(token);

    if (!payload) {
      return false;
    }

    // Check required fields
    if (!payload.sub || !payload.role || !payload.exp) {
      return false;
    }

    // Check if expired
    return !isTokenExpired(token);
  } catch (error) {
    return false;
  }
}

// ==================== TOKEN MANAGER CLASS ====================

/**
 * Token Manager - Singleton class for managing JWT tokens
 */
class TokenManagerClass {
  private storage: TokenStorage;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(useSessionStorage = false) {
    this.storage = new TokenStorage(useSessionStorage);
  }

  // ==================== GETTERS ====================

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }

  /**
   * Get both tokens
   */
  getTokens(): Tokens | null {
    return this.storage.getTokens();
  }

  /**
   * Get decoded access token payload
   */
  getAccessTokenPayload(): TokenPayload | null {
    const token = this.getAccessToken();
    return token ? decodeToken(token) : null;
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | null {
    const payload = this.getAccessTokenPayload();
    return payload?.sub ?? null;
  }

  /**
   * Get user role from token
   */
  getUserRole(): string | null {
    const payload = this.getAccessTokenPayload();
    return payload?.role ?? null;
  }

  /**
   * Get user phone from token
   */
  getUserPhone(): string | null {
    const payload = this.getAccessTokenPayload();
    return payload?.phone ?? null;
  }

  // ==================== SETTERS ====================

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.storage.setAccessToken(token);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.storage.setRefreshToken(token);
  }

  /**
   * Set both tokens
   */
  setTokens(tokens: Tokens): void {
    this.storage.setTokens(tokens);
  }

  // ==================== VALIDATION ====================

  /**
   * Check if access token exists
   */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Check if both tokens exist
   */
  hasTokens(): boolean {
    return this.storage.hasTokens();
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    return token ? isTokenExpired(token) : true;
  }

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    return token ? isTokenExpired(token, 0) : true; // No buffer for refresh token
  }

  /**
   * Check if access token is valid
   */
  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    return token ? isTokenValid(token) : false;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasTokens() && this.isAccessTokenValid();
  }

  /**
   * Get time until access token expires (in seconds)
   */
  getAccessTokenTimeUntilExpiry(): number {
    const token = this.getAccessToken();
    return token ? getTimeUntilExpiry(token) : 0;
  }

  // ==================== CLEANUP ====================

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.storage.removeAccessToken();
  }

  /**
   * Clear refresh token
   */
  clearRefreshToken(): void {
    this.storage.removeRefreshToken();
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.storage.clearTokens();
    this.refreshPromise = null;
  }

  // ==================== REFRESH ====================

  /**
   * Set refresh promise (used by axios interceptor)
   */
  setRefreshPromise(promise: Promise<string | null>): void {
    this.refreshPromise = promise;
  }

  /**
   * Get refresh promise (used by axios interceptor)
   */
  getRefreshPromise(): Promise<string | null> | null {
    return this.refreshPromise;
  }

  /**
   * Clear refresh promise
   */
  clearRefreshPromise(): void {
    this.refreshPromise = null;
  }

  // ==================== DEBUG ====================

  /**
   * Get token info for debugging
   */
  getTokenInfo(): {
    hasTokens: boolean;
    accessTokenValid: boolean;
    accessTokenExpired: boolean;
    refreshTokenExpired: boolean;
    timeUntilExpiry: number;
    userId: string | null;
    userRole: string | null;
    userPhone: string | null;
  } {
    return {
      hasTokens: this.hasTokens(),
      accessTokenValid: this.isAccessTokenValid(),
      accessTokenExpired: this.isAccessTokenExpired(),
      refreshTokenExpired: this.isRefreshTokenExpired(),
      timeUntilExpiry: this.getAccessTokenTimeUntilExpiry(),
      userId: this.getUserId(),
      userRole: this.getUserRole(),
      userPhone: this.getUserPhone(),
    };
  }

  /**
   * Print token info to console (development only)
   */
  debugTokenInfo(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔐 Token Manager Debug Info');
      console.table(this.getTokenInfo());
      console.groupEnd();
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Default token manager instance using localStorage
 */
export const tokenManager = new TokenManagerClass(false);

/**
 * Create custom token manager instance
 */
export function createTokenManager(useSessionStorage = false): TokenManagerClass {
  return new TokenManagerClass(useSessionStorage);
}

// ==================== UTILITY EXPORTS ====================

export {
  isTokenExpired,
  isTokenValid,
  getTokenExpiry,
  getTimeUntilExpiry,
};
