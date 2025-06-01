// Debug script to test frontend data expectations vs API reality
const BASE_URL = 'http://localhost:5000';

async function debugFrontendDataMismatch() {
  console.log('=== FRONTEND-API DATA STRUCTURE DEBUG ===\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/degoudse/opportunities`);
    const opportunities = await response.json();
    
    if (opportunities.length === 0) {
      console.log('ERROR: No opportunities returned');
      return;
    }
    
    const sample = opportunities[0];
    console.log('API provides these fields:');
    Object.keys(sample).forEach(key => {
      console.log(`  ${key}: ${typeof sample[key]} = ${sample[key]}`);
    });
    
    console.log('\n=== FRONTEND EXPECTATIONS vs API REALITY ===');
    
    // Test fields the frontend expects
    const frontendExpectations = [
      'value', // Frontend expects this but API provides 'estimatedValue'
      'customerName', // Frontend expects this but API provides 'clientName'
      'partnerName', // Frontend expects this but API provides 'partnerNames'
    ];
    
    frontendExpectations.forEach(field => {
      console.log(`Frontend expects '${field}': ${sample[field] !== undefined ? 'FOUND' : 'MISSING'}`);
    });
    
    console.log('\n=== MAPPING SUGGESTIONS ===');
    console.log('To fix frontend issues:');
    console.log('1. Map estimatedValue -> value');
    console.log('2. Map clientName -> customerName');
    console.log('3. Map partnerNames -> partnerName');
    
    // Test calculateOpportunityStats function
    console.log('\n=== STATS CALCULATION TEST ===');
    const totalOpportunities = opportunities.length;
    
    // Current broken approach (what frontend tries to do)
    let brokenValue = 0;
    let workingValue = 0;
    
    opportunities.forEach(opp => {
      brokenValue += (opp.value || 0); // This will be 0 because 'value' doesn't exist
      workingValue += (opp.estimatedValue || 0); // This will work
    });
    
    console.log(`Total opportunities: ${totalOpportunities}`);
    console.log(`Broken calculation (using 'value'): $${brokenValue}`);
    console.log(`Working calculation (using 'estimatedValue'): $${workingValue}`);
    
  } catch (error) {
    console.error('ERROR:', error);
  }
}

debugFrontendDataMismatch();