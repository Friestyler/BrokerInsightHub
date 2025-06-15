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
  
  // For degoudse environment, always prefix the URL with the environment path
  if (envId === 'degoudse') {
    // For degoudse environment, prefix the URL with the environment path
    if (url.startsWith('/api/')) {
      const newUrl = url.replace('/api/', `/api/${envId}/`);
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
  try {
    // Apply environment to URL
    const envUrl = getEnvironmentUrl(url);
    
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
    // Handle AbortError and other network errors gracefully
    if (error.name === 'AbortError') {
      console.warn('API request aborted:', url);
      throw new Error('Request timeout');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    try {
      // Get the base URL from the query key
      const baseUrl = queryKey[0] as string;
      
      // Apply environment to URL
      const envUrl = getEnvironmentUrl(baseUrl);
      
      const res = await fetch(envUrl, {
        credentials: "include",
        signal, // Add signal for proper cancellation
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': getCurrentEnvironmentId()
        }
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error: any) {
      // Handle AbortError and other network errors gracefully
      if (error.name === 'AbortError') {
        console.warn('Query aborted:', queryKey[0]);
        throw new Error('Request cancelled');
      }
      
      // Log the actual error for debugging
      console.error('Fetch error for', queryKey[0], ':', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME, // 5 minutes - data considered fresh
      gcTime: CACHE_TIME, // 10 minutes - keep in cache
      retry: 1,
      retryDelay: 500,
    },
    mutations: {
      retry: false,
    },
  },
});
