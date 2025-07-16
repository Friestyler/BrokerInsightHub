/**
 * NUCLEAR CACHE DESTRUCTION - ULTIMATE SOLUTION
 * 
 * This implements the most aggressive cache clearing possible
 */

export const nuclearCacheDestroy = async () => {
  console.log('💥 NUCLEAR CACHE DESTRUCTION INITIATED');
  
  // Step 1: Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Step 2: Clear all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
  }
  
  // Step 3: Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  
  // Step 4: Clear IndexedDB
  const clearIndexedDB = () => {
    return new Promise((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('qollabi');
      deleteReq.onsuccess = () => resolve(true);
      deleteReq.onerror = () => resolve(false);
    });
  };
  
  await clearIndexedDB();
  
  // Step 5: Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
  
  console.log('💥 NUCLEAR CACHE DESTRUCTION COMPLETE');
  
  // Step 6: Set correct environment and reload
  localStorage.setItem('selectedEnvironment', 'nn');
  localStorage.setItem('cacheCleared', Date.now().toString());
  
  // Add nuclear flag to prevent infinite loops
  const url = new URL(window.location.href);
  url.searchParams.set('nuclear', 'true');
  url.searchParams.set('env', 'nn');
  url.searchParams.set('timestamp', Date.now().toString());
  
  // Force hard reload
  window.location.href = url.toString();
};

// Export for console access
declare global {
  interface Window {
    nuclearCacheDestroy: typeof nuclearCacheDestroy;
  }
}

if (typeof window !== 'undefined') {
  window.nuclearCacheDestroy = nuclearCacheDestroy;
}