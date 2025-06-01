import React, { createContext, useContext, useState, useEffect } from 'react';
import acmeLogo from "../assets/acme-logo.svg";
import qollabiLogo from "../assets/qollabi-placeholder.svg";

export interface Environment {
  id: string;
  name: string;
  logo?: string;
  apiBaseUrl: string; // Base URL for API calls for this environment
  databaseId: string; // Identifier for the database to use
}

// Helper function to get logo for environment
const getEnvironmentLogo = (envId: string): string | undefined => {
  if (envId === 'myqollabi' || envId === 'degoudse') return qollabiLogo;
  return undefined;
};

// Only De Goudse environment
const FALLBACK_ENVIRONMENTS: Environment[] = [
  { 
    id: "degoudse", 
    name: "De Goudse", 
    logo: qollabiLogo,
    apiBaseUrl: "/api/degoudse",
    databaseId: "degoudse_db"
  }
];

// Create context
interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (envId: string) => void;
  environments: Environment[];
  refreshEnvironments: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Provider component
export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<Environment[]>(FALLBACK_ENVIRONMENTS);
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    const savedEnvId = localStorage.getItem('selectedEnvironment');
    return FALLBACK_ENVIRONMENTS.find(env => env.id === savedEnvId) || FALLBACK_ENVIRONMENTS[0];
  });

  // Load environments from API
  const loadEnvironments = async () => {
    try {
      const response = await fetch('/api/admin/environments');
      if (response.ok) {
        const loadedEnvironments = await response.json();
        const enrichedEnvironments = loadedEnvironments.map((env: any) => ({
          ...env,
          logo: getEnvironmentLogo(env.id)
        }));
        setEnvironments(enrichedEnvironments);
        
        // Update current environment if it's not in the new list
        const savedEnvId = localStorage.getItem('selectedEnvironment');
        if (savedEnvId) {
          const currentEnv = enrichedEnvironments.find((e: Environment) => e.id === savedEnvId);
          if (currentEnv) {
            setEnvironmentState(currentEnv);
          }
        }
      }
    } catch (error) {
      console.log('Failed to load environments, using fallback list');
    }
  };

  // Load environments on mount
  useEffect(() => {
    loadEnvironments();
  }, []);
  
  const setEnvironment = (envId: string) => {
    const newEnv = environments.find(e => e.id === envId) || environments[0];
    setEnvironmentState(newEnv);
    localStorage.setItem('selectedEnvironment', newEnv.id);
    
    // Set the global environment variable immediately
    window.__APP_ENV__ = newEnv.id;
    
    // Reload the application to apply the new environment
    window.location.reload();
  };

  const refreshEnvironments = () => {
    loadEnvironments();
  };
  
  // Make the environment available globally for non-React code
  useEffect(() => {
    window.__APP_ENV__ = environment.id;
  }, [environment]);
  
  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment, environments, refreshEnvironments }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

// Hook to use the environment context
export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

// Declare global variable for environment
declare global {
  interface Window {
    __APP_ENV__?: string;
  }
}