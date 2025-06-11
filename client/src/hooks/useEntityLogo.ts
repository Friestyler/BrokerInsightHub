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
        
        // Get current environment ID - use the window.currentEnvironment which is set by the app
        const envFromWindow = (window as any).currentEnvironment;
        const environment = envFromWindow || 'degoudse';
        

        
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