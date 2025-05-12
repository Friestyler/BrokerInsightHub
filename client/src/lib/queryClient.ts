import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const environmentId = window.__APP_ENV__ || 'myqollabi';
  
  // Add environment prefix to non-prefixed API routes that need it
  if (endpoint.startsWith('/api/') && !endpoint.includes('/api/env-') && !endpoint.includes('/api/entity-') && !endpoint.includes('/api/relationship-')) {
    endpoint = `/api/env-${environmentId}${endpoint.substring(4)}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }

  return response.json();
}