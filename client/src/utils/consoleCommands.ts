/**
 * CONSOLE COMMANDS FOR MANUAL TESTING
 * 
 * These commands are available in the browser console for manual testing
 */

// COMMAND: Test environment switching
export const testEnvironmentSwitch = (envId: string) => {
  console.log(`🔧 TESTING ENVIRONMENT SWITCH TO: ${envId}`);
  
  // Set localStorage
  localStorage.setItem('selectedEnvironment', envId);
  
  // Force page reload
  window.location.reload();
};

// COMMAND: Clear all caches
export const clearAllCaches = async () => {
  console.log('🧹 CLEARING ALL CACHES');
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  
  console.log('✅ ALL CACHES CLEARED');
};

// COMMAND: Force environment update
export const forceEnvironmentUpdate = (envId: string) => {
  console.log(`🔄 FORCING ENVIRONMENT UPDATE TO: ${envId}`);
  
  // Update localStorage
  localStorage.setItem('selectedEnvironment', envId);
  
  // Get branding
  const branding = getEnvironmentBrandingForTest(envId);
  
  // Force DOM updates
  const logoElements = document.querySelectorAll('[data-environment-logo]');
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  logoElements.forEach(el => {
    (el as HTMLImageElement).src = branding.logo;
    console.log(`Logo updated to: ${branding.logo}`);
  });
  
  nameElements.forEach(el => {
    el.textContent = branding.name;
    console.log(`Name updated to: ${branding.name}`);
  });
  
  console.log('✅ ENVIRONMENT UPDATE COMPLETE');
};

// COMMAND: Test all environments
export const testAllEnvironments = () => {
  console.log('🔍 TESTING ALL ENVIRONMENTS');
  
  const environments = ['degoudse', 'nn', 'baloise', 'concordia'];
  
  environments.forEach(env => {
    console.log(`\n--- Testing ${env} ---`);
    const branding = getEnvironmentBrandingForTest(env);
    console.log('Branding:', branding);
    
    // Test logo path
    const img = new Image();
    img.onload = () => console.log(`✅ ${env} logo loaded successfully`);
    img.onerror = () => console.log(`❌ ${env} logo failed to load`);
    img.src = branding.logo;
  });
};

// COMMAND: Monitor DOM changes
export const monitorDOMChanges = () => {
  console.log('👀 MONITORING DOM CHANGES');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        const target = mutation.target as Element;
        if (target.hasAttribute && target.hasAttribute('data-environment-logo')) {
          console.log('🔄 Logo element changed:', target);
        }
        if (target.hasAttribute && target.hasAttribute('data-environment-name')) {
          console.log('🔄 Name element changed:', target);
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-environment-logo', 'data-environment-name']
  });
  
  console.log('✅ DOM MONITORING ACTIVE');
  
  // Return stop function
  return () => {
    observer.disconnect();
    console.log('⏹️ DOM MONITORING STOPPED');
  };
};

// COMMAND: Check current state
export const checkCurrentState = () => {
  console.log('📊 CHECKING CURRENT STATE');
  
  const storedEnv = localStorage.getItem('selectedEnvironment');
  const logoElements = document.querySelectorAll('[data-environment-logo]');
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  const state = {
    storedEnvironment: storedEnv,
    logoElements: Array.from(logoElements).map(el => ({
      src: (el as HTMLImageElement).src,
      alt: (el as HTMLImageElement).alt
    })),
    nameElements: Array.from(nameElements).map(el => ({
      textContent: el.textContent
    }))
  };
  
  console.log('Current State:', state);
  return state;
};

// Helper function for testing
const getEnvironmentBrandingForTest = (envId: string) => {
  const mappings = {
    'baloise': {
      logo: '/@fs/home/runner/workspace/attached_assets/Baloise_1750499789244.png',
      name: 'Baloise',
      partnerName: 'Baloise'
    },
    'nn': {
      logo: '/@fs/home/runner/workspace/attached_assets/NN_Group_logo_1751474283145.jpeg',
      name: 'Nationale Nederlanden',
      partnerName: 'Nationale Nederlanden'
    },
    'concordia': {
      logo: '/@fs/home/runner/workspace/attached_assets/images-Concordia_1752649338540.png',
      name: 'Concordia',
      partnerName: 'Concordia'
    },
    'degoudse': {
      logo: '/@fs/home/runner/workspace/attached_assets/De_Goudse_logo_1749670246231.png',
      name: 'De Goudse',
      partnerName: 'De Goudse'
    }
  };
  
  return mappings[envId as keyof typeof mappings] || mappings['degoudse'];
};

// EXPOSE ALL COMMANDS TO GLOBAL SCOPE
declare global {
  interface Window {
    testEnvironmentSwitch: typeof testEnvironmentSwitch;
    clearAllCaches: typeof clearAllCaches;
    forceEnvironmentUpdate: typeof forceEnvironmentUpdate;
    testAllEnvironments: typeof testAllEnvironments;
    monitorDOMChanges: typeof monitorDOMChanges;
    checkCurrentState: typeof checkCurrentState;
  }
}

if (typeof window !== 'undefined') {
  window.testEnvironmentSwitch = testEnvironmentSwitch;
  window.clearAllCaches = clearAllCaches;
  window.forceEnvironmentUpdate = forceEnvironmentUpdate;
  window.testAllEnvironments = testAllEnvironments;
  window.monitorDOMChanges = monitorDOMChanges;
  window.checkCurrentState = checkCurrentState;
  
  // Show available commands
  console.log('🎯 AVAILABLE CONSOLE COMMANDS:');
  console.log('- testEnvironmentSwitch("nn") - Switch to specific environment');
  console.log('- clearAllCaches() - Clear all browser caches');
  console.log('- forceEnvironmentUpdate("concordia") - Force update to environment');
  console.log('- testAllEnvironments() - Test all environment assets');
  console.log('- monitorDOMChanges() - Monitor DOM changes');
  console.log('- checkCurrentState() - Check current environment state');
  console.log('- window.environmentDiagnostics.runComprehensiveDiagnostic() - Run full diagnostic');
}