import React, { createContext, useContext, useState, useEffect } from 'react';
import acmeLogo from "../assets/acme-logo.svg";
import qollabiLogo from "../assets/qollabi-placeholder.svg";
import baloiseLogoPng from "../assets/baloise-logo.png";
import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

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

// Demo environments - all use same backend data
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
  },
  { 
    id: "nn", 
    name: "Nationale Nederlanden", 
    logo: nnLogo,
    apiBaseUrl: "/api/degoudse", // Same backend data as De Goudse
    databaseId: "degoudse"
  },
  { 
    id: "concordia", 
    name: "Concordia", 
    logo: concordiaLogo,
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
    // Allow all available environments: degoudse, baloise, nn, and concordia
    if (savedEnvId && (savedEnvId === 'degoudse' || savedEnvId === 'baloise' || savedEnvId === 'nn' || savedEnvId === 'concordia')) {
      return FALLBACK_ENVIRONMENTS.find(env => env.id === savedEnvId) || FALLBACK_ENVIRONMENTS[0];
    }
    // Default to nn for testing purposes - should display Nationale Nederlanden
    localStorage.setItem('selectedEnvironment', 'nn');
    return FALLBACK_ENVIRONMENTS.find(env => env.id === 'nn') || FALLBACK_ENVIRONMENTS[0];
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
  
  // Listen for environment changes from stable switching system
  useEffect(() => {
    const handleEnvironmentChange = (event: CustomEvent) => {
      const { environmentId } = event.detail;
      console.log('🎯 ENVIRONMENT CONTEXT - Received stable environment change:', environmentId);
      
      // Update the environment state to match the stable switching system
      const newEnv = environments.find(e => e.id === environmentId);
      if (newEnv) {
        setEnvironmentState(newEnv);
        localStorage.setItem('selectedEnvironment', newEnv.id);
        window.__APP_ENV__ = newEnv.id;
        (window as any).selectedEnvironment = newEnv.id;
        console.log('🎯 ENVIRONMENT CONTEXT - Updated to:', newEnv.id);
      }
    };
    
    // Listen for stable environment changes
    window.addEventListener('stableEnvironmentChanged', handleEnvironmentChange as EventListener);
    
    // Also listen for localStorage changes in case of external updates
    const handleStorageChange = () => {
      const savedEnvId = localStorage.getItem('selectedEnvironment');
      if (savedEnvId) {
        const newEnv = environments.find(e => e.id === savedEnvId);
        if (newEnv && newEnv.id !== environment.id) {
          setEnvironmentState(newEnv);
          console.log('🎯 ENVIRONMENT CONTEXT - Updated from localStorage:', newEnv.id);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('stableEnvironmentChanged', handleEnvironmentChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [environments, environment.id]);
  
  const setEnvironment = (envId: string) => {
    const newEnv = environments.find(e => e.id === envId) || environments[0];
    setEnvironmentState(newEnv);
    localStorage.setItem('selectedEnvironment', newEnv.id);
    
    // Set the global environment variable immediately
    window.__APP_ENV__ = newEnv.id;
    (window as any).selectedEnvironment = newEnv.id;
    
    // Dispatch custom event for components that need to know about environment changes
    const environmentChangeEvent = new CustomEvent('environmentChanged', {
      detail: { environmentId: newEnv.id, environment: newEnv }
    });
    window.dispatchEvent(environmentChangeEvent);
    
    console.log('🚨 ENVIRONMENT CONTEXT - Environment changed to:', newEnv.id);
    console.log('🚨 ENVIRONMENT CONTEXT - Dispatched environmentChanged event');
    
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