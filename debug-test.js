// Debug test to verify data rendering
const environments = ['degoudse', 'Qollabi-Test', 'baloise', 'nn', 'concordia'];

console.log('=== SYSTEMATIC DEBUG TEST ===');

for (const env of environments) {
  console.log(`\n--- Testing ${env} ---`);
  
  try {
    // Test campaigns endpoint
    const campaignsResponse = await fetch(`http://localhost:5000/api/${env}/campaigns`);
    const campaigns = await campaignsResponse.json();
    console.log(`✅ ${env} campaigns: ${campaigns.length} items`);
    
    // Test opportunities endpoint  
    const oppsResponse = await fetch(`http://localhost:5000/api/${env}/opportunities`);
    const opportunities = await oppsResponse.json();
    console.log(`✅ ${env} opportunities: ${opportunities.length} items`);
    
  } catch (error) {
    console.log(`❌ ${env} error:`, error.message);
  }
}

console.log('\n=== API VERIFICATION COMPLETE ===');