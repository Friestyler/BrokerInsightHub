// FINAL VALIDATION TEST SUITE
console.log('🎯 FINAL VALIDATION - CRITICAL RENDERING FIXES');

const runFinalValidation = async () => {
  console.log('\n=== API ENDPOINTS TEST ===');
  
  // Test all critical endpoints
  const endpoints = [
    '/api/degoudse/campaigns',
    '/api/degoudse/opportunities', 
    '/api/Qollabi-Test/campaigns',
    '/api/Qollabi-Test/opportunities'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log(`✅ ${endpoint}: ${data.length} items`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n=== FRONTEND COMPONENT VALIDATION ===');
  
  // Check current page rendering
  const currentPath = window.location.pathname;
  console.log(`Current page: ${currentPath}`);
  
  if (currentPath.includes('campaigns')) {
    // Validate campaigns page
    const campaignCards = document.querySelectorAll('[class*="hover:shadow-md"]');
    const loadingSpinners = document.querySelectorAll('[class*="animate-spin"]');
    
    console.log(`Campaign cards: ${campaignCards.length}`);
    console.log(`Loading spinners: ${loadingSpinners.length}`);
    console.log(`Expected: 5 campaigns, 0 loading`);
    
    if (campaignCards.length > 0 && loadingSpinners.length === 0) {
      console.log('✅ CAMPAIGNS PAGE RENDERED SUCCESSFULLY');
    } else {
      console.log('❌ CAMPAIGNS PAGE STILL HAS ISSUES');
    }
  }
  
  if (currentPath.includes('opportunities')) {
    // Validate opportunities page
    const oppTable = document.querySelector('table');
    const oppRows = document.querySelectorAll('tbody tr');
    const summaryCards = document.querySelectorAll('[class*="Total Opportunities"]');
    
    console.log(`Opportunities table: ${oppTable ? 'found' : 'missing'}`);
    console.log(`Opportunity rows: ${oppRows.length}`);
    console.log(`Expected: table + 283 rows`);
    
    if (oppTable && oppRows.length > 0) {
      console.log('✅ OPPORTUNITIES PAGE RENDERED SUCCESSFULLY');
    } else {
      console.log('❌ OPPORTUNITIES PAGE STILL HAS ISSUES');
    }
  }
  
  console.log('\n=== ENVIRONMENT CONTEXT VALIDATION ===');
  
  // Check environment consistency
  const storedEnv = localStorage.getItem('selectedEnvironment');
  const currentEnvElement = document.querySelector('[class*="environment"]');
  
  console.log(`Stored environment: ${storedEnv}`);
  console.log(`Environment selector: ${currentEnvElement ? 'present' : 'missing'}`);
  
  console.log('\n=== VALIDATION COMPLETE ===');
  console.log('🎯 KEY FIXES APPLIED:');
  console.log('✓ Fixed currentEnvironment vs environment variable mismatch');
  console.log('✓ Added missing CardDescription import');
  console.log('✓ Updated Campaign interface to match API response');
  console.log('✓ Fixed TypeScript type annotations');
  console.log('✓ Corrected data structure mapping (emails_sent vs engagement_summary)');
  
  return {
    campaignsWorking: currentPath.includes('campaigns') ? (document.querySelectorAll('[class*="hover:shadow-md"]').length > 0) : null,
    opportunitiesWorking: currentPath.includes('opportunities') ? (document.querySelector('table') !== null) : null
  };
};

// Execute validation
runFinalValidation().then(result => {
  console.log('\n📊 FINAL RESULT:', result);
});