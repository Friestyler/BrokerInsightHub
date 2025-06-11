import { useState, useEffect } from 'react';

interface UseEntityLogoResult {
  logoUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useEntityLogo(entityType: 'partner' | 'customer', entityId: number): UseEntityLogoResult {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!entityId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get current environment ID from URL path
        const currentPath = window.location.pathname;
        // Match pattern like /degoudse/lists/partners or /degoudse/something
        const pathEnvMatch = currentPath.match(/^\/([^\/]+)(?:\/|$)/);
        let urlEnvironmentId = pathEnvMatch ? pathEnvMatch[1] : null;
        
        // Skip common non-environment paths
        if (urlEnvironmentId === 'lists' || urlEnvironmentId === 'api') {
          urlEnvironmentId = null;
        }
        
        // Use URL-based environment ID first, then fallback
        const environment = urlEnvironmentId || 'degoudse';
        
        const response = await fetch(`/api/entity-logos?entityType=${entityType}&entityId=${entityId}&environmentId=${environment}`);
        
        if (response.ok) {
          const logoData = await response.json();
          if (logoData?.logoData) {
            setLogoUrl(logoData.logoData);
          } else {
            setLogoUrl(null);
          }
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error('Error fetching entity logo:', err);
        setError('Failed to load logo');
        setLogoUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [entityType, entityId]);

  return { logoUrl, isLoading, error };
}