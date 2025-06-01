// Debug script to test opportunities API endpoint systematically
const BASE_URL = 'http://localhost:5000';

async function testOpportunitiesEndpoint() {
  console.log('=== OPPORTUNITIES API DEBUG TESTS ===\n');
  
  try {
    // Test 1: Direct API call to opportunities endpoint
    console.log('TEST 1: Direct /api/opportunities call');
    const response1 = await fetch(`${BASE_URL}/api/opportunities`);
    console.log('Status:', response1.status);
    console.log('Headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.redirected) {
      console.log('REDIRECTED TO:', response1.url);
    }
    
    const data1 = await response1.json();
    console.log('Response type:', typeof data1);
    console.log('Is array:', Array.isArray(data1));
    console.log('Length:', data1?.length);
    console.log('First item keys:', data1[0] ? Object.keys(data1[0]) : 'No first item');
    console.log('First item sample:', JSON.stringify(data1[0], null, 2));
    console.log('\n---\n');
    
    // Test 2: Direct API call to De Goudse endpoint
    console.log('TEST 2: Direct /api/degoudse/opportunities call');
    const response2 = await fetch(`${BASE_URL}/api/degoudse/opportunities`);
    console.log('Status:', response2.status);
    const data2 = await response2.json();
    console.log('Response type:', typeof data2);
    console.log('Is array:', Array.isArray(data2));
    console.log('Length:', data2?.length);
    console.log('First item keys:', data2[0] ? Object.keys(data2[0]) : 'No first item');
    console.log('First item sample:', JSON.stringify(data2[0], null, 2));
    console.log('\n---\n');
    
    // Test 3: Compare responses
    console.log('TEST 3: Compare responses');
    console.log('Responses identical:', JSON.stringify(data1) === JSON.stringify(data2));
    
    // Test 4: Check data structure
    console.log('\nTEST 4: Data structure validation');
    if (data2 && data2.length > 0) {
      const sample = data2[0];
      console.log('Has required fields:');
      console.log('- id:', sample.id !== undefined);
      console.log('- title:', sample.title !== undefined);
      console.log('- status:', sample.status !== undefined);
      console.log('- estimatedValue:', sample.estimatedValue !== undefined);
      console.log('- value:', sample.value !== undefined);
      console.log('- probability:', sample.probability !== undefined);
    }
    
  } catch (error) {
    console.error('ERROR in opportunities test:', error);
  }
}

// Run the test
testOpportunitiesEndpoint();