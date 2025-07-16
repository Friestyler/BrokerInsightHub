/**
 * MANUAL ENVIRONMENT OVERRIDE SYSTEM
 * 
 * This system bypasses ALL browser caching by forcing manual environment
 * detection and immediate DOM manipulation when mismatches are detected.
 */

import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

// HARDCODED ENVIRONMENT MAPPINGS - FORCE RECOMPILATION
const ENVIRONMENT_MAPPINGS = {
  'baloise': {
    logo: baloiseLogoPng,
    name: 'Baloise',
    partnerName: 'Baloise'
  },
  'nn': {
    logo: nnLogo,
    name: 'Nationale Nederlanden',
    partnerName: 'Nationale Nederlanden'
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

export const getEnvironmentBrandingOverride = (envId: string) => {
  const selectedEnv = envId || 'degoudse';
  const result = ENVIRONMENT_MAPPINGS[selectedEnv as keyof typeof ENVIRONMENT_MAPPINGS] || ENVIRONMENT_MAPPINGS['degoudse'];
  
  console.log('🚨 ENVIRONMENT OVERRIDE - envId:', envId, 'result:', result);
  return result;
};

export const forceEnvironmentUpdate = () => {
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const branding = getEnvironmentBrandingOverride(currentEnv);
  
  console.log('🚨 FORCING ENVIRONMENT UPDATE:', { currentEnv, branding });
  
  // Force DOM updates
  const logoElements = document.querySelectorAll('[data-environment-logo]');
  logoElements.forEach(el => {
    (el as HTMLImageElement).src = branding.logo;
  });
  
  const nameElements = document.querySelectorAll('[data-environment-name]');
  nameElements.forEach(el => {
    el.textContent = branding.name;
  });
  
  // Force React re-render by dispatching custom event
  window.dispatchEvent(new CustomEvent('forceEnvironmentUpdate', { 
    detail: { environment: currentEnv, branding } 
  }));
};

export const detectEnvironmentMismatch = () => {
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const expectedBranding = getEnvironmentBrandingOverride(currentEnv);
  
  // Check if displayed content matches expected environment
  const logoElements = document.querySelectorAll('[data-environment-logo]') as NodeListOf<HTMLImageElement>;
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  for (const logoEl of logoElements) {
    if (logoEl.src && !logoEl.src.includes(expectedBranding.logo)) {
      console.log('🚨 LOGO MISMATCH DETECTED:', { 
        current: logoEl.src, 
        expected: expectedBranding.logo 
      });
      return true;
    }
  }
  
  for (const nameEl of nameElements) {
    if (nameEl.textContent && nameEl.textContent !== expectedBranding.name) {
      console.log('🚨 NAME MISMATCH DETECTED:', { 
        current: nameEl.textContent, 
        expected: expectedBranding.name 
      });
      return true;
    }
  }
  
  return false;
};