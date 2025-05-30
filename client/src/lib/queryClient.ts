import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Declare global type for window.__APP_ENV__
declare global {
  interface Window {
    __APP_ENV__?: string;
  }
}

// Get the current environment ID from window
function getCurrentEnvironmentId(): string {
  const envFromWindow = window.__APP_ENV__;
  const envFromStorage = localStorage.getItem('selectedEnvironment');
  console.log('Environment detection:', { envFromWindow, envFromStorage });
  return envFromWindow || envFromStorage || 'myqollabi';
}

// Function to add environment to API URL
function getEnvironmentUrl(url: string): string {
  const envId = getCurrentEnvironmentId();
  
  console.log('Environment URL transformation:', { envId, originalUrl: url });
  
  // Don't modify URLs that already include environment information
  if (url.includes('/degoudse') || url.includes('/acme') || url.includes('/globex') || url.includes('/oceanic')) {
    console.log('URL already has environment prefix, returning as-is');
    return url;
  }
  
  // If we're in the default environment (myqollabi), use the standard API URLs
  if (envId === 'myqollabi') {
    console.log('MyQollabi environment, using standard API URLs');
    return url;
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
  
  const res = await fetch(envUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add environment header as an alternative way to specify environment
      'X-Environment': getCurrentEnvironmentId()
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the base URL from the query key
    const baseUrl = queryKey[0] as string;
    
    // Apply environment to URL
    const envUrl = getEnvironmentUrl(baseUrl);
    
    const res = await fetch(envUrl, {
      credentials: "include",
      headers: {
        // Add environment header as an alternative way to specify environment
        'X-Environment': getCurrentEnvironmentId()
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
