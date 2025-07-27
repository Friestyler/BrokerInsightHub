// Comprehensive frontend debugging script
// Run this in browser console to diagnose React rendering issues

console.log('=== FRONTEND DEBUGGING SCRIPT ===');

// Test 1: Direct API calls
async function testAPICalls() {
  console.log('\n1. TESTING API CALLS DIRECTLY');
  
  try {
    const campaignsResponse = await fetch('/api/degoudse/campaigns');
    const campaigns = await campaignsResponse.json();
    console.log(`✅ Campaigns API: ${campaigns.length} items`);
    console.log('Sample campaign:', campaigns[0]);
    
    const oppsResponse = await fetch('/api/degoudse/opportunities');
    const opportunities = await oppsResponse.json();
    console.log(`✅ Opportunities API: ${opportunities.length} items`);
    console.log('Sample opportunity:', opportunities[0]);
    
    return { campaigns, opportunities };
  } catch (error) {
    console.error('❌ API Error:', error);
    return null;
  }
}

// Test 2: Check React Query cache
function checkReactQueryCache() {
  console.log('\n2. CHECKING REACT QUERY CACHE');
  
  // Access React Query DevTools cache
  if (window.__REACT_QUERY_CLIENT__) {
    const queryClient = window.__REACT_QUERY_CLIENT__;
    const cache = queryClient.getQueryCache();
    
    console.log('Query Cache Queries:', cache.getAll().length);
    
    // Check specific queries
    const campaignQueries = cache.getAll().filter(q => 
      q.queryKey.some(key => typeof key === 'string' && key.includes('campaigns'))
    );
    const oppQueries = cache.getAll().filter(q => 
      q.queryKey.some(key => typeof key === 'string' && key.includes('opportunities'))
    );
    
    console.log(`Campaign queries: ${campaignQueries.length}`);
    campaignQueries.forEach(q => {
      console.log('  Campaign query:', q.queryKey, 'State:', q.state.status, 'Data:', q.state.data?.length);
    });
    
    console.log(`Opportunity queries: ${oppQueries.length}`);
    oppQueries.forEach(q => {
      console.log('  Opportunity query:', q.queryKey, 'State:', q.state.status, 'Data:', q.state.data?.length);
    });
  } else {
    console.log('❌ React Query client not found');
  }
}

// Test 3: Check Environment Context
function checkEnvironmentContext() {
  console.log('\n3. CHECKING ENVIRONMENT CONTEXT');
  
  // Check localStorage
  const storedEnv = localStorage.getItem('selectedEnvironment');
  console.log('Stored environment:', storedEnv);
  
  // Check if environment context is accessible
  const envElements = document.querySelectorAll('[data-environment]');
  console.log('Environment elements found:', envElements.length);
  
  // Check current page
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
}

// Test 4: Check for React errors
function checkReactErrors() {
  console.log('\n4. CHECKING FOR REACT ERRORS');
  
  // Check console errors
  const errors = console.error.toString();
  console.log('Console error method:', typeof console.error);
  
  // Check for React error boundaries
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log('Error elements found:', errorElements.length);
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spin"]');
  console.log('Loading elements found:', loadingElements.length);
}

// Test 5: Simulate data
function testDataStructures() {
  console.log('\n5. TESTING DATA STRUCTURES');
  
  // Test campaign data structure expected by components
  const mockCampaign = {
    id: 1,
    name: "Test Campaign",
    emails_sent: 100,
    emails_opened: 50,
    total_clicks: 25,
    open_rate: "50.00",
    recipients: [{}, {}],
    target_entity_type: "opportunities",
    status: "active"
  };
  
  console.log('Mock campaign structure:', mockCampaign);
  
  // Test opportunity data structure
  const mockOpportunity = {
    id: 1,
    title: "Test Opportunity",
    clientName: "Test Client",
    stage: "qualified",
    status: "open",
    estimated_value: 50000
  };
  
  console.log('Mock opportunity structure:', mockOpportunity);
}

// Run all tests
async function runAllTests() {
  console.clear();
  console.log('🔍 STARTING COMPREHENSIVE FRONTEND DEBUG');
  
  const apiData = await testAPICalls();
  checkReactQueryCache();
  checkEnvironmentContext();
  checkReactErrors();
  testDataStructures();
  
  console.log('\n=== DEBUG COMPLETE ===');
  console.log('Next steps:');
  console.log('1. Check if API data matches component expectations');
  console.log('2. Verify React Query keys are correct');  
  console.log('3. Ensure environment context is properly set');
  console.log('4. Look for infinite re-render loops');
  
  return apiData;
}

// Auto-run
runAllTests();