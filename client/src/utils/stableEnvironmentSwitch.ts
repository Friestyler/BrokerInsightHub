/**
 * STABLE ENVIRONMENT SWITCHING SYSTEM
 * 
 * This system provides clean environment switching without aggressive monitoring
 */

import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

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

// STABLE ENVIRONMENT SWITCH
export const stableEnvironmentSwitch = (targetEnv: string) => {
  console.log(`🔄 STABLE ENVIRONMENT SWITCH TO: ${targetEnv}`);
  
  // Clear storage cleanly
  localStorage.removeItem('selectedEnvironment');
  localStorage.removeItem('forcedEnvironment');
  localStorage.removeItem('resetTimestamp');
  
  // Set new environment
  localStorage.setItem('selectedEnvironment', targetEnv);
  localStorage.setItem('forcedEnvironment', targetEnv);
  localStorage.setItem('resetTimestamp', Date.now().toString());
  
  // Update DOM elements
  const branding = ENVIRONMENT_MAPPING[targetEnv as keyof typeof ENVIRONMENT_MAPPING];
  if (branding) {
    // Update all logo elements
    document.querySelectorAll('[data-environment-logo]').forEach(el => {
      (el as HTMLImageElement).src = branding.logo;
      (el as HTMLImageElement).alt = branding.name;
    });
    
    // Update all name elements
    document.querySelectorAll('[data-environment-name]').forEach(el => {
      el.textContent = branding.name;
    });
    
    // Update partner name elements
    document.querySelectorAll('[data-partner-name]').forEach(el => {
      el.textContent = branding.partnerName;
    });
  }
  
  // Force React re-render
  const event = new CustomEvent('forceEnvironmentUpdate', {
    detail: { environmentId: targetEnv }
  });
  window.dispatchEvent(event);
  
  // Dispatch event for EnvironmentContext to listen to
  const stableEnvironmentEvent = new CustomEvent('stableEnvironmentChanged', {
    detail: { environmentId: targetEnv }
  });
  window.dispatchEvent(stableEnvironmentEvent);
  console.log(`🎯 STABLE ENVIRONMENT SWITCH - Dispatched stableEnvironmentChanged event for: ${targetEnv}`);
  
  console.log(`✅ STABLE ENVIRONMENT SWITCH TO ${targetEnv} COMPLETE`);
  
  return branding;
};

// INITIALIZE STABLE ENVIRONMENT (NO MONITORING)
export const initializeStableEnvironment = (targetEnv: string = 'nn') => {
  console.log(`🎯 INITIALIZING STABLE ENVIRONMENT: ${targetEnv}`);
  
  // Single clean switch
  stableEnvironmentSwitch(targetEnv);
  
  // No monitoring - just a clean switch
  console.log(`✅ STABLE ENVIRONMENT INITIALIZED`);
  
  return () => {
    console.log(`🛑 STABLE ENVIRONMENT STOPPED`);
  };
};

// Make available globally
(window as any).stableEnvironmentSwitch = stableEnvironmentSwitch;
(window as any).initializeStableEnvironment = initializeStableEnvironment;