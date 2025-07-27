// CRITICAL TEST - Direct React Query key inspection
const environments = ['degoudse', 'Qollabi-Test'];

console.log('=== REACT QUERY KEY INSPECTION ===');

for (const env of environments) {
  console.log(`\n--- Environment: ${env} ---`);
  
  // Test the exact query keys being used
  const campaignsKey = `/api/${env}/campaigns`;
  const opportunitiesKey = `/api/${env}/opportunities`;
  
  console.log('Campaigns query key:', campaignsKey);
  console.log('Opportunities query key:', opportunitiesKey);
  
  // Test direct API access
  try {
    const response1 = await fetch(campaignsKey);
    const data1 = await response1.json();
    console.log(`✅ ${campaignsKey} returns ${data1.length} items`);
    
    const response2 = await fetch(opportunitiesKey); 
    const data2 = await response2.json();
    console.log(`✅ ${opportunitiesKey} returns ${data2.length} items`);
  } catch (error) {
    console.error(`❌ Error for ${env}:`, error.message);
  }
}

// Test environment context extraction
console.log('\n--- Environment Context Test ---');
const mockEnvironment1 = { id: 'degoudse' };
const mockEnvironment2 = { id: 'Qollabi-Test' };
const mockEnvironment3 = null;
const mockEnvironment4 = undefined;

console.log('Test 1:', mockEnvironment1?.id || 'degoudse');
console.log('Test 2:', mockEnvironment2?.id || 'degoudse'); 
console.log('Test 3:', mockEnvironment3?.id || 'degoudse');
console.log('Test 4:', mockEnvironment4?.id || 'degoudse');

console.log('\n=== END TEST ===');