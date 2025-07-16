/**
 * COMPREHENSIVE ENVIRONMENT DIAGNOSTICS SYSTEM
 * 
 * Step-by-step testing and debugging for browser caching issues
 */

import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

// STEP 1: TEST ENVIRONMENT MAPPING
export const testEnvironmentMapping = () => {
  console.log('🔍 STEP 1: Testing Environment Mapping');
  
  const environments = ['degoudse', 'nn', 'baloise', 'concordia'];
  const results: any = {};
  
  environments.forEach(env => {
    const mapping = getTestEnvironmentBranding(env);
    results[env] = mapping;
    console.log(`Environment ${env}:`, mapping);
  });
  
  return results;
};

// STEP 2: TEST LOCALSTORAGE CONSISTENCY
export const testLocalStorageConsistency = () => {
  console.log('🔍 STEP 2: Testing localStorage Consistency');
  
  const storedEnv = localStorage.getItem('selectedEnvironment');
  const allStorage = getAllLocalStorageItems();
  
  console.log('Stored Environment:', storedEnv);
  console.log('All localStorage:', allStorage);
  
  return { storedEnv, allStorage };
};

// STEP 3: TEST DOM ELEMENT DETECTION
export const testDOMElements = () => {
  console.log('🔍 STEP 3: Testing DOM Element Detection');
  
  const logoElements = document.querySelectorAll('[data-environment-logo]');
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  const logoResults = Array.from(logoElements).map(el => ({
    src: (el as HTMLImageElement).src,
    alt: (el as HTMLImageElement).alt,
    exists: true
  }));
  
  const nameResults = Array.from(nameElements).map(el => ({
    textContent: el.textContent,
    exists: true
  }));
  
  console.log('Logo Elements:', logoResults);
  console.log('Name Elements:', nameResults);
  
  return { logoResults, nameResults };
};

// STEP 4: TEST ENVIRONMENT MISMATCH DETECTION
export const testEnvironmentMismatch = () => {
  console.log('🔍 STEP 4: Testing Environment Mismatch Detection');
  
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const expectedBranding = getTestEnvironmentBranding(currentEnv);
  
  const logoElements = document.querySelectorAll('[data-environment-logo]') as NodeListOf<HTMLImageElement>;
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  const mismatches = [];
  
  for (const logoEl of logoElements) {
    const currentSrc = logoEl.src;
    const expectedSrc = expectedBranding.logo;
    
    if (currentSrc && !currentSrc.includes(expectedSrc.split('/').pop() || '')) {
      mismatches.push({
        type: 'logo',
        current: currentSrc,
        expected: expectedSrc,
        element: logoEl
      });
    }
  }
  
  for (const nameEl of nameElements) {
    const currentName = nameEl.textContent;
    const expectedName = expectedBranding.name;
    
    if (currentName && currentName !== expectedName) {
      mismatches.push({
        type: 'name',
        current: currentName,
        expected: expectedName,
        element: nameEl
      });
    }
  }
  
  console.log('Environment Mismatches:', mismatches);
  return mismatches;
};

// STEP 5: TEST FORCE UPDATE FUNCTIONALITY
export const testForceUpdate = () => {
  console.log('🔍 STEP 5: Testing Force Update Functionality');
  
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';
  const branding = getTestEnvironmentBranding(currentEnv);
  
  console.log('Forcing update for environment:', currentEnv);
  console.log('Expected branding:', branding);
  
  // Force DOM updates
  const logoElements = document.querySelectorAll('[data-environment-logo]');
  const nameElements = document.querySelectorAll('[data-environment-name]');
  
  const updateResults = {
    logoUpdates: 0,
    nameUpdates: 0
  };
  
  logoElements.forEach(el => {
    const imgEl = el as HTMLImageElement;
    const oldSrc = imgEl.src;
    imgEl.src = branding.logo;
    updateResults.logoUpdates++;
    console.log(`Logo updated: ${oldSrc} -> ${branding.logo}`);
  });
  
  nameElements.forEach(el => {
    const oldText = el.textContent;
    el.textContent = branding.name;
    updateResults.nameUpdates++;
    console.log(`Name updated: ${oldText} -> ${branding.name}`);
  });
  
  console.log('Update results:', updateResults);
  return updateResults;
};

// STEP 6: COMPREHENSIVE DIAGNOSTIC REPORT
export const runComprehensiveDiagnostic = () => {
  console.log('🚨 RUNNING COMPREHENSIVE DIAGNOSTIC REPORT');
  console.log('================================================');
  
  const report = {
    timestamp: new Date().toISOString(),
    step1_environmentMapping: testEnvironmentMapping(),
    step2_localStorageConsistency: testLocalStorageConsistency(),
    step3_domElements: testDOMElements(),
    step4_environmentMismatch: testEnvironmentMismatch(),
    step5_forceUpdate: testForceUpdate(),
    step6_postUpdateVerification: testEnvironmentMismatch()
  };
  
  console.log('DIAGNOSTIC REPORT:', report);
  
  // Check if issue is resolved
  const postUpdateMismatches = report.step6_postUpdateVerification;
  const isResolved = postUpdateMismatches.length === 0;
  
  console.log('🎯 ISSUE RESOLVED:', isResolved);
  
  if (!isResolved) {
    console.log('🚨 REMAINING ISSUES:', postUpdateMismatches);
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('1. Check browser cache settings');
    console.log('2. Verify localStorage persistence');
    console.log('3. Check for multiple instances of components');
    console.log('4. Verify DOM element selection');
  }
  
  return report;
};

// HELPER FUNCTIONS
const getTestEnvironmentBranding = (envId: string) => {
  const mappings = {
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
  
  return mappings[envId as keyof typeof mappings] || mappings['degoudse'];
};

const getAllLocalStorageItems = () => {
  const items: any = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      items[key] = localStorage.getItem(key);
    }
  }
  return items;
};

// EXPOSE TESTING FUNCTIONS TO GLOBAL SCOPE
declare global {
  interface Window {
    environmentDiagnostics: {
      testEnvironmentMapping: typeof testEnvironmentMapping;
      testLocalStorageConsistency: typeof testLocalStorageConsistency;
      testDOMElements: typeof testDOMElements;
      testEnvironmentMismatch: typeof testEnvironmentMismatch;
      testForceUpdate: typeof testForceUpdate;
      runComprehensiveDiagnostic: typeof runComprehensiveDiagnostic;
    };
  }
}

if (typeof window !== 'undefined') {
  window.environmentDiagnostics = {
    testEnvironmentMapping,
    testLocalStorageConsistency,
    testDOMElements,
    testEnvironmentMismatch,
    testForceUpdate,
    runComprehensiveDiagnostic
  };
}