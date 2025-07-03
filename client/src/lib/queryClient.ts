import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Declare global type for window.__APP_ENV__
declare global {
  interface Window {
    __APP_ENV__?: string;
  }
}

// Aggressive caching for instant navigation
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes - data considered fresh

// Get the current environment ID from window
function getCurrentEnvironmentId(): string {
  const envFromWindow = window.__APP_ENV__;
  const envFromStorage = localStorage.getItem('selectedEnvironment');
  console.log('Environment detection:', { envFromWindow, envFromStorage });
  return envFromWindow || envFromStorage || 'degoudse';
}

// Function to add environment to API URL
export function getEnvironmentUrl(url: string): string {
  const envId = getCurrentEnvironmentId();
  
  console.log('Environment URL transformation:', { envId, originalUrl: url });
  
  // Don't modify admin URLs as they are global and manage all environments
  if (url.includes('/api/admin/')) {
    console.log('Admin URL detected, skipping environment transformation');
    return url;
  }
  
  // Don't modify URLs that already include environment information
  if (url.includes('/degoudse')) {
    console.log('URL already has environment prefix, returning as-is');
    return url;
  }
  
  // All environments (degoudse, baloise, nn) should use the degoudse backend data
  if (envId === 'degoudse' || envId === 'baloise' || envId === 'nn') {
    // All environments use degoudse data backend
    if (url.startsWith('/api/') && !url.includes('/degoudse/') && !url.includes('/baloise/') && !url.includes('/nn/')) {
      const newUrl = url.replace('/api/', `/api/degoudse/`);
      console.log('Environment URL transformed:', { from: url, to: newUrl });
      return newUrl;
    }
    // If URL already has environment prefix, redirect to degoudse
    if (url.includes('/baloise/')) {
      const newUrl = url.replace('/api/baloise/', '/api/degoudse/');
      console.log('Environment URL transformed:', { from: url, to: newUrl });
      return newUrl;
    }
    if (url.includes('/nn/')) {
      const newUrl = url.replace('/api/nn/', '/api/degoudse/');
      console.log('Environment URL transformed:', { from: url, to: newUrl });
      return newUrl;
    }
  }
  
  // For other environments, prefix the URL with the environment path
  if (url.startsWith('/api/')) {
    const newUrl = url.replace('/api/', `/api/${envId}/`);
    console.log('Environment URL transformed:', { from: url, to: newUrl });
    return newUrl;
  }
  
  console.log('No transformation needed, returning original URL');
  return url;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  // Apply environment to URL
  const envUrl = getEnvironmentUrl(url);
  console.log('apiRequest - Fetching from URL:', envUrl);
  
  try {
    const res = await fetch(envUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Add environment header as an alternative way to specify environment
        'X-Environment': getCurrentEnvironmentId(),
        // Force fresh data for saved lists
        ...(envUrl.includes('saved-lists') ? { 'Cache-Control': 'no-cache' } : {})
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res.json();
  } catch (error: any) {
    // Handle network errors gracefully
    if (error?.name === 'AbortError' || error?.message === 'Failed to fetch' || error?.message?.includes('signal')) {
      console.warn(`Network error for ${url} - returning empty data instead of throwing`);
      return [] as T; // Return empty array/data instead of throwing
    }

    console.error('apiRequest error details:', {
      error: error,
      errorName: error?.constructor?.name,
      errorMessage: error?.message,
      url: url,
      envUrl: getEnvironmentUrl(url),
      method: method,
      timestamp: new Date().toISOString()
    });

    if (!url.includes('template-assignments')) {
      console.error('Full error object:', error);
    }

    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = queryKey[0] as string;
try {
  // Apply environment to URL
  const envUrl = getEnvironmentUrl(baseUrl);
  console.log('Fetching from URL:', envUrl);

  // Add timeout handling - shorter timeout to prevent hanging
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Timeout: Aborting request to ${envUrl}`);
    abortController.abort();
  }, 10000); // 10 second timeout

  const res = await fetch(envUrl, {
    credentials: "include",
    signal: abortController.signal,
    headers: {
      // Add environment header as an alternative way to specify environment
      'X-Environment': getCurrentEnvironmentId()
    }
  });
  
  clearTimeout(timeoutId);

  if (unauthorizedBehavior === "returnNull" && res.status === 401) {
    return null;
  }

  // Check if response is HTML (indicates a routing error)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    throw new Error(`Endpoint ${envUrl} returned HTML instead of JSON - likely missing backend route`);
  }

  await throwIfResNotOk(res);
  return await res.json();
} catch (error: any) {
  // Handle timeout errors gracefully
  if (error?.name === 'AbortError') {
    console.warn(`Request timeout for ${baseUrl}`);
    return []; // Return empty array instead of throwing
  }
  
  // Only log errors for non-template-assignment endpoints to reduce noise
  if (!baseUrl.includes('template-assignments')) {
    console.error('Fetch error in queryFn:', error);
    console.error('Query key:', queryKey);
  }
  throw error;
}

  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // data is always considered fresh
      gcTime: CACHE_TIME, // 10 minutes - keep in cache
      retry: false, // Disable retries to prevent multiple timeout attempts
      retryDelay: 0,

    },
    mutations: {
      retry: false,
    },
  },
});
