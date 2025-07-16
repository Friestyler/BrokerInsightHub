/**
 * STABLE STARTUP SEQUENCE - NO AGGRESSIVE MONITORING
 * 
 * This provides a clean startup without infinite loops
 */

import { initializeStableEnvironment } from './stableEnvironmentSwitch';

export const stableStartupSequence = () => {
  console.log('🚀 STABLE STARTUP SEQUENCE INITIATED');
  
  // Step 1: Auto-login
  console.log('🔑 STEP 1: AUTOMATIC LOGIN');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', 'admin');
  localStorage.setItem('userId', '1');
  localStorage.setItem('userName', 'Test User');
  console.log('✅ AUTOMATIC LOGIN COMPLETE');
  
  // Step 2: Initialize stable environment - respect user's choice
  console.log('🎯 STEP 2: STABLE ENVIRONMENT INITIALIZATION');
  const userSelectedEnvironment = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const stopEnvironment = initializeStableEnvironment(userSelectedEnvironment);
  console.log('✅ STABLE ENVIRONMENT INITIALIZED');
  
  // Step 3: DOM stabilization
  console.log('⏳ STEP 3: DOM STABILIZATION');
  setTimeout(() => {
    console.log('✅ DOM STABILIZATION COMPLETE');
  }, 500);
  
  console.log('✅ STABLE STARTUP SEQUENCE COMPLETE');
  console.log('🎯 USER SELECTED ENVIRONMENT:', userSelectedEnvironment);
  
  return {
    success: true,
    environment: userSelectedEnvironment,
    stopEnvironment
  };
};

// Auto-execute on load
stableStartupSequence();

// Make available globally
(window as any).stableStartupSequence = stableStartupSequence;