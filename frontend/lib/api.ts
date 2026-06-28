/**
 * Auth-aware fetch wrapper.
 * Sends session cookies and throws SESSION_EXPIRED on 401 responses.
 */

/**
 * Fetch wrapper that automatically sends cookies and handles session expiration.
 * Throws on 401 unauthorized so callers can display the authentication overlay.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new Error('SESSION_EXPIRED');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
