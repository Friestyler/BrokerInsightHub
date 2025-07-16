/**
 * NUCLEAR CACHE BREAKING UTILITY
 * 
 * This utility completely bypasses browser module caching by forcing
 * hard reloads when environment inconsistencies are detected.
 */

export const performNuclearCacheBreak = () => {
  console.log('🚨 NUCLEAR CACHE BREAK INITIATED');
  
  // Clear ALL browser storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Force hard refresh by changing the URL completely
  const baseUrl = window.location.origin + window.location.pathname;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // Use window.location.href to force complete page reload
  window.location.href = `${baseUrl}?nuclear=${timestamp}&id=${randomId}`;
};

export const checkEnvironmentConsistency = () => {
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const lastEnv = sessionStorage.getItem('lastEnvironment');
  
  console.log('🚨 Environment consistency check:', { currentEnv, lastEnv });
  
  if (lastEnv && lastEnv !== currentEnv) {
    console.log('🚨 ENVIRONMENT MISMATCH DETECTED - Triggering nuclear cache break');
    performNuclearCacheBreak();
    return false;
  }
  
  sessionStorage.setItem('lastEnvironment', currentEnv);
  return true;
};