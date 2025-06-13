import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface NavigationHistory {
  goBack: () => void;
  getPreviousRoute: () => string | null;
}

export function useNavigationHistory(defaultBackRoute: string = '/'): NavigationHistory {
  const [location, setLocation] = useLocation();
  const historyRef = useRef<string[]>([]);
  const isNavigatingBackRef = useRef(false);

  useEffect(() => {
    // Don't add to history if we're navigating back
    if (isNavigatingBackRef.current) {
      isNavigatingBackRef.current = false;
      return;
    }

    // Add current location to history if it's not already the last entry
    const lastEntry = historyRef.current[historyRef.current.length - 1];
    if (lastEntry !== location) {
      historyRef.current.push(location);
      
      // Keep only the last 10 entries to prevent memory issues
      if (historyRef.current.length > 10) {
        historyRef.current = historyRef.current.slice(-10);
      }
    }
  }, [location]);

  const goBack = () => {
    const history = historyRef.current;
    
    // If we have at least 2 entries, go to the previous one
    if (history.length >= 2) {
      // Remove current location and get the previous one
      const currentLocation = history.pop();
      const previousLocation = history[history.length - 1];
      
      if (previousLocation && previousLocation !== currentLocation) {
        isNavigatingBackRef.current = true;
        setLocation(previousLocation);
        return;
      }
    }
    
    // Fallback to default route
    setLocation(defaultBackRoute);
  };

  const getPreviousRoute = (): string | null => {
    const history = historyRef.current;
    if (history.length >= 2) {
      return history[history.length - 2];
    }
    return null;
  };

  return { goBack, getPreviousRoute };
}