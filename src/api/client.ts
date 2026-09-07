/**
 * Centralized API HTTP client for IIMS
 * Handles JWT injection, Render free-tier cold starts, error normalization, and CORS routing
 */

import { ApiErrorResponse } from '../types';

export const TOKEN_STORAGE_KEY = 'iims_jwt_token';
export const USER_STORAGE_KEY = 'iims_user_profile';
export const ROLE_OVERRIDE_KEY = 'iims_active_role_mode';
export const API_MODE_KEY = 'iims_api_connection_mode'; // 'proxied' | 'direct'

// Direct Render URL
export const DIRECT_BACKEND_BASE_URL = 'https://intelligent-incident-management.onrender.com';

export function getApiBaseUrl(): string {
  const mode = localStorage.getItem(API_MODE_KEY);
  if (mode === 'direct') {
    return `${DIRECT_BACKEND_BASE_URL}/api`;
  }
  // Default to zero-CORS proxy route
  return '/proxy-api';
}

export function getHealthUrl(): string {
  const mode = localStorage.getItem(API_MODE_KEY);
  if (mode === 'direct') {
    return `${DIRECT_BACKEND_BASE_URL}/health`;
  }
  return '/proxy-health';
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse;
  path?: string;

  constructor(status: number, message: string, data?: ApiErrorResponse, path?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.path = path;
  }
}

// Global listener for auth expiration and cold starts
export type ApiEvent = 'unauthorized' | 'cold_start_begin' | 'cold_start_end';
const listeners: Record<ApiEvent, Set<() => void>> = {
  unauthorized: new Set(),
  cold_start_begin: new Set(),
  cold_start_end: new Set(),
};

export function onApiEvent(event: ApiEvent, callback: () => void): () => void {
  listeners[event].add(callback);
  return () => {
    listeners[event].delete(callback);
  };
}

function emitApiEvent(event: ApiEvent) {
  listeners[event].forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error in API event callback', e);
    }
  });
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuth) {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Detect long requests (Render free-tier cold-start)
  const coldStartTimer = setTimeout(() => {
    emitApiEvent('cold_start_begin');
  }, 2500);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: options.signal,
    });

    clearTimeout(coldStartTimer);
    emitApiEvent('cold_start_end');

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        }
      } catch {
        // Text parsing or JSON parse error, keep default
      }

      if (response.status === 401) {
        emitApiEvent('unauthorized');
      }

      throw new ApiError(response.status, errorMessage, errorData, endpoint);
    }

    // Handle 204 or empty response
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return (text ? (text as unknown as T) : ({} as T));
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(coldStartTimer);
    emitApiEvent('cold_start_end');

    if (error instanceof ApiError) {
      throw error;
    }

    // Check for network or CORS abort error
    const err = error as Error;
    if (err.name === 'AbortError') {
      throw new ApiError(0, 'Request aborted');
    }

    throw new ApiError(
      0,
      err.message || 'Unable to communicate with the IIMS server. The backend may be booting up on Render.'
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'GET', undefined, options),
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>(endpoint, 'POST', body, options),
  put: <T>(endpoint: string, body?: any, options?: RequestOptions) => request<T>(endpoint, 'PUT', body, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'DELETE', undefined, options),
};
