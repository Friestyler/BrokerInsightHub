/**
 * AUTOMATIC LOGIN BYPASS - ELIMINATES TESTING FRICTION
 * 
 * Auto-login system to bypass authentication for testing
 */

export const performAutomaticLogin = async () => {
  console.log('🔑 AUTOMATIC LOGIN INITIATED');
  
  // Check if we're already logged in
  const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
  if (isLoggedIn) {
    console.log('✅ ALREADY LOGGED IN - SKIPPING');
    return true;
  }
  
  // Auto-login for testing
  try {
    // Set authentication state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userId', '1');
    localStorage.setItem('userName', 'Test User');
    localStorage.setItem('userEmail', 'test@qollabi.com');
    
    // Set session data
    sessionStorage.setItem('loginTimestamp', Date.now().toString());
    sessionStorage.setItem('sessionActive', 'true');
    
    console.log('✅ AUTOMATIC LOGIN COMPLETE');
    return true;
  } catch (error) {
    console.error('❌ AUTOMATIC LOGIN FAILED:', error);
    return false;
  }
};

// Auto-execute on import
if (typeof window !== 'undefined') {
  // Check URL for auto-login flag
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auto-login') === 'true' || urlParams.get('testing') === 'true') {
    performAutomaticLogin();
  }
}

// Expose globally for testing
declare global {
  interface Window {
    performAutomaticLogin: typeof performAutomaticLogin;
  }
}

if (typeof window !== 'undefined') {
  window.performAutomaticLogin = performAutomaticLogin;
}