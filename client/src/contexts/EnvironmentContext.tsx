import React, { createContext, useContext, useState, useEffect } from 'react';
import acmeLogo from "../assets/acme-logo.svg";
import qollabiLogo from "../assets/qollabi-placeholder.svg";
import baloiseLogoPng from "../assets/baloise-logo.png";

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
  if (envId === 'baloise') return baloiseLogoPng;
  return undefined;
};

// Demo environments - both use same backend data
const FALLBACK_ENVIRONMENTS: Environment[] = [
  { 
    id: "degoudse", 
    name: "De Goudse", 
    logo: qollabiLogo,
    apiBaseUrl: "/api/degoudse",
    databaseId: "degoudse_db"
  },
  { 
    id: "baloise", 
    name: "Baloise", 
    logo: baloiseLogoPng,
    apiBaseUrl: "/api/degoudse", // Same backend data as De Goudse
    databaseId: "degoudse"
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
    // Allow both degoudse and baloise environments
    if (savedEnvId && (savedEnvId === 'degoudse' || savedEnvId === 'baloise')) {
      return FALLBACK_ENVIRONMENTS.find(env => env.id === savedEnvId) || FALLBACK_ENVIRONMENTS[0];
    }
    // Default to degoudse if no valid environment is saved
    localStorage.setItem('selectedEnvironment', 'degoudse');
    return FALLBACK_ENVIRONMENTS[0];
  });

  // Load environments - use fallback environments directly for demo
  const loadEnvironments = async () => {
    // For demo purposes, use the fallback environments which include both De Goudse and Baloise
    setEnvironments(FALLBACK_ENVIRONMENTS);
    
    // Update current environment if needed
    const savedEnvId = localStorage.getItem('selectedEnvironment');
    if (savedEnvId) {
      const currentEnv = FALLBACK_ENVIRONMENTS.find((e: Environment) => e.id === savedEnvId);
      if (currentEnv) {
        setEnvironmentState(currentEnv);
      }
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
    
    // No reload needed - this is purely cosmetic for demo purposes
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