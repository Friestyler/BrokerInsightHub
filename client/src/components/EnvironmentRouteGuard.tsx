import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import NotFound from '@/pages/not-found';

interface EnvironmentRouteGuardProps {
  component: React.ComponentType;
  requiredEnvironments?: string[];
  excludedEnvironments?: string[];
}

/**
 * A component that guards routes based on the current environment
 * It can either require specific environments or exclude specific environments
 */
export default function EnvironmentRouteGuard({
  component: Component,
  requiredEnvironments,
  excludedEnvironments,
}: EnvironmentRouteGuardProps) {
  const { environment } = useEnvironment();
  const [, setLocation] = useLocation();

  // Check if the current environment is allowed
  const isEnvironmentAllowed = () => {
    // If requiredEnvironments is provided, check if current environment is in the list
    if (requiredEnvironments && requiredEnvironments.length > 0) {
      return requiredEnvironments.includes(environment.id);
    }
    
    // If excludedEnvironments is provided, check if current environment is NOT in the list
    if (excludedEnvironments && excludedEnvironments.length > 0) {
      return !excludedEnvironments.includes(environment.id);
    }
    
    // Default to allowed if no restrictions
    return true;
  };

  // If the environment is not allowed, redirect to 404
  if (!isEnvironmentAllowed()) {
    return <NotFound />;
  }

  // If environment is allowed, render the component
  return <Component />;
}