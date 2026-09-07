/**
 * JWT utilities for safe client-side decoding and expiration checking
 */

export interface DecodedToken {
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[] | string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT', err);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  // exp is in seconds, Date.now() in ms
  return Date.now() >= decoded.exp * 1000;
}
