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

// ENVIRONMENT MONITORING - DISABLED (CAUSED CONFLICTS WITH STABLE SWITCHING)
// This monitoring system was detecting environment switches as "drift" and forcing them back
// Replaced with stable switching system that doesn't require aggressive monitoring
export const startEnvironmentMonitoring = (targetEnv: string = 'nn') => {
  console.log(`🚫 ENVIRONMENT MONITORING DISABLED - USING STABLE SWITCHING`);
  
  // Return dummy stop function to maintain API compatibility
  return () => {
    console.log('⏹️ ENVIRONMENT MONITORING STOPPED (WAS DISABLED)');
  };
};

// COMPLETE ENVIRONMENT OVERRIDE - DISABLED (CAUSED CONFLICTS)
// This override system was too aggressive and prevented proper environment switching
// Replaced with stable switching system that allows legitimate environment changes
export const completeEnvironmentOverride = (targetEnv: string = 'nn') => {
  console.log(`🚫 COMPLETE ENVIRONMENT OVERRIDE DISABLED - USING STABLE SWITCHING`);
  
  // Return dummy cleanup function to maintain API compatibility
  return () => {
    console.log('⏹️ ENVIRONMENT OVERRIDE STOPPED (WAS DISABLED)');
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