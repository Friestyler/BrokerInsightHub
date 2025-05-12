import React, { createContext, useContext, useState, useEffect } from 'react';
import acmeLogo from "../assets/acme-logo.svg";
import qollabiLogo from "../assets/qollabi-placeholder.svg";

export interface Environment {
  id: string;
  name: string;
  displayName?: string; // Display name (defaults to name if not specified)
  logo?: string;
  apiBaseUrl: string; // Base URL for API calls for this environment
  databaseId: string; // Identifier for the database to use
}

// Define available environments
export const ENVIRONMENTS: Environment[] = [
  { 
    id: "myqollabi", 
    name: "My Qollabi", 
    displayName: "My Qollabi Environment",
    logo: qollabiLogo,
    apiBaseUrl: "/api",
    databaseId: "qollabi"
  },
  { 
    id: "acme", 
    name: "ACME CO", 
    displayName: "ACME CO Environment",
    logo: acmeLogo,
    apiBaseUrl: "/api/acme",
    databaseId: "acme"
  },
  { 
    id: "globex", 
    name: "Globex Corp",
    displayName: "Globex Corporation",
    apiBaseUrl: "/api/globex",
    databaseId: "globex"
  },
  { 
    id: "oceanic", 
    name: "Oceanic Airlines",
    displayName: "Oceanic Airlines",
    apiBaseUrl: "/api/oceanic",
    databaseId: "oceanic"
  }
];

// Get environment from localStorage or use default
const getInitialEnvironment = (): Environment => {
  const savedEnvId = localStorage.getItem('selectedEnvironment');
  return ENVIRONMENTS.find(env => env.id === savedEnvId) || ENVIRONMENTS[0];
};

// Create context
interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (envId: string) => void;
  environments: Environment[];
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Provider component
export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environment, setEnvironmentState] = useState<Environment>(getInitialEnvironment);
  
  const setEnvironment = (envId: string) => {
    const newEnv = ENVIRONMENTS.find(e => e.id === envId) || ENVIRONMENTS[0];
    setEnvironmentState(newEnv);
    localStorage.setItem('selectedEnvironment', newEnv.id);
    
    // Reload the application to apply the new environment
    // This is a simple approach - a more sophisticated implementation would
    // use the React Query queryClient to invalidate all queries
    window.location.reload();
  };
  
  // Make the environment available globally for non-React code
  useEffect(() => {
    window.__APP_ENV__ = environment.id;
  }, [environment]);
  
  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment, environments: ENVIRONMENTS }}>
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