/**
 * ENVIRONMENT RESET SYSTEM - FORCE CORRECT ENVIRONMENT
 * 
 * This system bypasses all caching and forces the correct environment
 */

import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

// FORCE ENVIRONMENT MAPPING - HARDCODED
const ENVIRONMENT_MAPPING = {
  'nn': {
    logo: nnLogo,
    name: 'Nationale Nederlanden',
    partnerName: 'Nationale Nederlanden'
  },
  'baloise': {
    logo: baloiseLogoPng,
    name: 'Baloise',
    partnerName: 'Baloise'
  },
  'concordia': {
    logo: concordiaLogo,
    name: 'Concordia',
    partnerName: 'Concordia'
  },
  'degoudse': {
    logo: deGoudseLogo,
    name: 'De Goudse',
    partnerName: 'De Goudse'
  }
};

// FORCE ENVIRONMENT RESET
export const forceEnvironmentReset = (targetEnv: string = 'nn') => {
  console.log(`🔄 FORCING ENVIRONMENT RESET TO: ${targetEnv}`);
  
  // Clear all storage multiple times
  for (let i = 0; i < 3; i++) {
    localStorage.clear();
    sessionStorage.clear();
  }
  
  // Set target environment multiple times
  for (let i = 0; i < 3; i++) {
    localStorage.setItem('selectedEnvironment', targetEnv);
    localStorage.setItem('forcedEnvironment', targetEnv);
    localStorage.setItem('resetTimestamp', Date.now().toString());
  }
  
  // Force DOM update immediately
  const branding = ENVIRONMENT_MAPPING[targetEnv as keyof typeof ENVIRONMENT_MAPPING];
  if (branding) {
    // Update all logo elements
    document.querySelectorAll('[data-environment-logo]').forEach(el => {
      (el as HTMLImageElement).src = branding.logo;
      (el as HTMLImageElement).setAttribute('data-forced-env', targetEnv);
    });
    
    // Update all name elements
    document.querySelectorAll('[data-environment-name]').forEach(el => {
      el.textContent = branding.name;
      el.setAttribute('data-forced-env', targetEnv);
    });
  }
  
  // Force React state update
  const event = new CustomEvent('forceEnvironmentUpdate', {
    detail: { environmentId: targetEnv }
  });
  window.dispatchEvent(event);
  
  console.log(`✅ ENVIRONMENT RESET TO ${targetEnv} COMPLETE`);
};

// ENVIRONMENT MONITORING - CONTINUOUS CHECK
export const startEnvironmentMonitoring = (targetEnv: string = 'nn') => {
  console.log(`👁️ STARTING ENVIRONMENT MONITORING FOR: ${targetEnv}`);
  
  const monitorInterval = setInterval(() => {
    const currentStoredEnv = localStorage.getItem('selectedEnvironment');
    const branding = ENVIRONMENT_MAPPING[targetEnv as keyof typeof ENVIRONMENT_MAPPING];
    
    if (currentStoredEnv !== targetEnv || !branding) {
      console.log(`🚨 ENVIRONMENT DRIFT DETECTED - CORRECTING`);
      forceEnvironmentReset(targetEnv);
    }
    
    // Check DOM elements
    const logoElements = document.querySelectorAll('[data-environment-logo]');
    const nameElements = document.querySelectorAll('[data-environment-name]');
    
    logoElements.forEach(el => {
      const img = el as HTMLImageElement;
      if (!img.src.includes(branding.logo.split('/').pop() || '')) {
        img.src = branding.logo;
        console.log(`🔄 CORRECTED LOGO: ${branding.logo}`);
      }
    });
    
    nameElements.forEach(el => {
      if (el.textContent !== branding.name) {
        el.textContent = branding.name;
        console.log(`🔄 CORRECTED NAME: ${branding.name}`);
      }
    });
    
  }, 1000); // Check every second
  
  // Return stop function
  return () => {
    clearInterval(monitorInterval);
    console.log('⏹️ ENVIRONMENT MONITORING STOPPED');
  };
};

// COMPLETE ENVIRONMENT OVERRIDE
export const completeEnvironmentOverride = (targetEnv: string = 'nn') => {
  console.log(`💣 COMPLETE ENVIRONMENT OVERRIDE TO: ${targetEnv}`);
  
  // Force reset
  forceEnvironmentReset(targetEnv);
  
  // Start monitoring
  const stopMonitoring = startEnvironmentMonitoring(targetEnv);
  
  // Override React context
  const overrideContext = () => {
    const environmentContext = document.querySelector('[data-testid="environment-context"]');
    if (environmentContext) {
      environmentContext.setAttribute('data-forced-env', targetEnv);
    }
  };
  
  // Override immediately and periodically
  overrideContext();
  const contextInterval = setInterval(overrideContext, 500);
  
  // Override getEnvironmentBranding function
  const originalGetEnvironmentBranding = (window as any).getEnvironmentBranding;
  (window as any).getEnvironmentBranding = () => {
    return ENVIRONMENT_MAPPING[targetEnv as keyof typeof ENVIRONMENT_MAPPING];
  };
  
  console.log(`💣 COMPLETE ENVIRONMENT OVERRIDE ACTIVE`);
  
  // Return cleanup function
  return () => {
    stopMonitoring();
    clearInterval(contextInterval);
    if (originalGetEnvironmentBranding) {
      (window as any).getEnvironmentBranding = originalGetEnvironmentBranding;
    }
  };
};

// EXPOSE TO GLOBAL SCOPE
declare global {
  interface Window {
    forceEnvironmentReset: typeof forceEnvironmentReset;
    startEnvironmentMonitoring: typeof startEnvironmentMonitoring;
    completeEnvironmentOverride: typeof completeEnvironmentOverride;
  }
}

if (typeof window !== 'undefined') {
  window.forceEnvironmentReset = forceEnvironmentReset;
  window.startEnvironmentMonitoring = startEnvironmentMonitoring;
  window.completeEnvironmentOverride = completeEnvironmentOverride;
}