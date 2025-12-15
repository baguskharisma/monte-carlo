/**
 * Auth Cookies Helper
 *
 * Syncs authentication tokens between localStorage and cookies
 * This enables the middleware to access tokens on the server side
 */

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Set authentication tokens in cookies
 * Called after successful login to sync tokens to cookies
 */
export function setAuthCookies(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;

  // Set access token cookie
  // HttpOnly is not set here since we're setting from client-side
  // For production, consider setting these from an API route for HttpOnly cookies
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

  // Set refresh token cookie
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

/**
 * Clear authentication cookies
 * Called on logout to remove tokens from cookies
 */
export function clearAuthCookies(): void {
  if (typeof window === 'undefined') return;

  // Remove access token cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;

  // Remove refresh token cookie
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}

/**
 * Get access token from cookie
 */
export function getAccessTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === ACCESS_TOKEN_COOKIE) {
      return value;
    }
  }
  return null;
}

/**
 * Get refresh token from cookie
 */
export function getRefreshTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === REFRESH_TOKEN_COOKIE) {
      return value;
    }
  }
  return null;
}

/**
 * Check if auth cookies exist
 */
export function hasAuthCookies(): boolean {
  return !!getAccessTokenFromCookie();
}
