import { useState, useEffect } from 'react';

interface UseEntityLogoResult {
  logoUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// In-memory cache for logos to prevent repeated requests
const logoCache = new Map<string, { url: string | null; timestamp: number }>();
const LOGO_CACHE_TTL = 30000; // 30 seconds for testing, then increase to 5 minutes

export function useEntityLogo(entityType: 'partner' | 'customer', entityId: number): UseEntityLogoResult {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!entityId) {
        setIsLoading(false);
        return;
      }

      const cacheKey = `degoudse-${entityType}-${entityId}`;
      
      // Clear cache for testing - remove this line after logos are working
      logoCache.clear();
      
      const cached = logoCache.get(cacheKey);
      
      // Check cache first
      if (cached && Date.now() - cached.timestamp < LOGO_CACHE_TTL) {
        setLogoUrl(cached.url);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const environment = 'degoudse';
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            controller.abort('Request timeout');
          }
        }, 5000); // Increased timeout to 5 seconds
        
        try {
          const response = await fetch(
            `/api/entity-logos?entityType=${entityType}&entityId=${entityId}&environmentId=${environment}`,
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          
          let logoData = null;
          if (response.ok) {
            logoData = await response.json();
          }
          
          const url = logoData?.logo_data || null;
          setLogoUrl(url);
          
          // Cache the result (even if null)
          logoCache.set(cacheKey, { url, timestamp: Date.now() });
          
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError' || controller.signal.aborted) {
            // Request was aborted (timeout) - cache null result and exit silently
            logoCache.set(cacheKey, { url: null, timestamp: Date.now() });
            setLogoUrl(null);
            return; // Exit early for abort errors
          }
          
          // Re-throw other errors to be handled by outer catch
          throw fetchError;
        }
        
      } catch (err: any) {
        // Handle any errors not caught by inner try-catch
        console.warn('Logo fetch error:', err);
        setLogoUrl(null);
        setError(null); // Don't show errors to user
        logoCache.set(cacheKey, { url: null, timestamp: Date.now() });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [entityType, entityId]);

  return { logoUrl, isLoading, error };
}