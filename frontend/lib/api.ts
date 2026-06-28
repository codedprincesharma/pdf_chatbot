/**
 * Auth-aware fetch wrapper.
 * Attaches Bearer token, sends cookies, and auto-retries on 401 via token refresh.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Attempt to refresh the access token using the HttpOnly refresh-token cookie.
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    const result = await response.json();
    if (result.success && result.data?.accessToken) {
      accessToken = result.data.accessToken;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

/**
 * Fetch wrapper that auto-attaches the access token and handles 401 refresh.
 * Throws on session expiry so callers can show the auth modal.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If access token is expired (401), attempt to refresh it
    if (response.status === 401 && accessToken) {
      console.log('Access token expired, attempting refresh...');
      const refreshed = await refreshToken();
      if (refreshed) {
        headers.set('Authorization', `Bearer ${accessToken}`);
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        throw new Error('SESSION_EXPIRED');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
