/**
 * STARTUP SEQUENCE - COMPREHENSIVE ENVIRONMENT INITIALIZATION
 * 
 * This runs immediately on app startup to ensure correct environment
 */

import { completeEnvironmentOverride } from './environmentReset';
import { performAutomaticLogin } from './automaticLogin';

// TARGET ENVIRONMENT FOR TESTING
const TARGET_ENV = 'nn'; // Should show Nationale Nederlanden

export const executeStartupSequence = async () => {
  console.log('🚀 STARTUP SEQUENCE INITIATED');
  
  // Step 1: Clear and force environment
  console.log('🔄 STEP 1: ENVIRONMENT RESET');
  localStorage.clear();
  sessionStorage.clear();
  
  // Force set target environment multiple times
  for (let i = 0; i < 5; i++) {
    localStorage.setItem('selectedEnvironment', TARGET_ENV);
    localStorage.setItem('forcedEnvironment', TARGET_ENV);
  }
  
  // Step 2: Auto-login (bypass authentication for testing)
  console.log('🔑 STEP 2: AUTOMATIC LOGIN');
  await performAutomaticLogin();
  
  // Step 3: Complete environment override
  console.log('💣 STEP 3: ENVIRONMENT OVERRIDE');
  const stopOverride = completeEnvironmentOverride(TARGET_ENV);
  
  // Step 4: Wait for DOM to stabilize
  console.log('⏳ STEP 4: DOM STABILIZATION');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 5: Force React re-render
  console.log('⚛️ STEP 5: REACT RE-RENDER');
  const event = new CustomEvent('forceRerender', {
    detail: { environmentId: TARGET_ENV }
  });
  window.dispatchEvent(event);
  
  // Step 6: Set URL parameters for testing
  console.log('🔗 STEP 6: URL PARAMETERS');
  const url = new URL(window.location.href);
  url.searchParams.set('env', TARGET_ENV);
  url.searchParams.set('startup', 'complete');
  url.searchParams.set('auto-login', 'true');
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
  
  console.log('✅ STARTUP SEQUENCE COMPLETE');
  console.log(`🎯 TARGET ENVIRONMENT: ${TARGET_ENV} (Nationale Nederlanden)`);
  
  return { success: true, environment: TARGET_ENV, stopOverride };
};

// DISABLED - REPLACED BY STABLE STARTUP SEQUENCE
// The old monitoring system was causing conflicts with the new stable system
// All functionality has been moved to stableStartupSequence.ts
console.log('🚫 OLD STARTUP SEQUENCE DISABLED - USING STABLE VERSION');

// IMMEDIATE EXECUTION ON IMPORT - DISABLED
if (false && typeof window !== 'undefined') {
  // Check if we should run startup sequence
  const urlParams = new URLSearchParams(window.location.search);
  const shouldRunStartup = !urlParams.get('startup') || urlParams.get('startup') !== 'complete';
  
  if (shouldRunStartup) {
    console.log('🚀 AUTO-EXECUTING STARTUP SEQUENCE');
    executeStartupSequence().then(result => {
      console.log('🎉 STARTUP SEQUENCE RESULT:', result);
    }).catch(error => {
      console.error('❌ STARTUP SEQUENCE ERROR:', error);
    });
  }
}

// EXPOSE GLOBALLY
declare global {
  interface Window {
    executeStartupSequence: typeof executeStartupSequence;
    TARGET_ENV: string;
  }
}

if (typeof window !== 'undefined') {
  window.executeStartupSequence = executeStartupSequence;
  window.TARGET_ENV = TARGET_ENV;
}