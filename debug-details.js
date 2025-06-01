// Debug opportunity details functionality
const BASE_URL = 'http://localhost:5000';

async function testOpportunityDetails() {
  console.log('=== OPPORTUNITY DETAILS DEBUG TEST ===\n');
  
  try {
    // First get the opportunities list
    const response = await fetch(`${BASE_URL}/api/degoudse/opportunities`);
    const opportunities = await response.json();
    
    if (opportunities.length === 0) {
      console.log('ERROR: No opportunities found');
      return;
    }
    
    const firstOpp = opportunities[0];
    console.log('✓ Testing with opportunity ID:', firstOpp.id);
    console.log('✓ Opportunity title:', firstOpp.title);
    
    // Test if there's a details endpoint
    const detailsResponse = await fetch(`${BASE_URL}/api/degoudse/opportunities/${firstOpp.id}`);
    console.log('Details endpoint status:', detailsResponse.status);
    
    if (detailsResponse.ok) {
      const details = await detailsResponse.json();
      console.log('✓ Details response:', JSON.stringify(details, null, 2));
    } else {
      console.log('✗ Details endpoint not working:', detailsResponse.statusText);
      
      // Check if there's a generic opportunities/:id endpoint
      const genericResponse = await fetch(`${BASE_URL}/api/opportunities/${firstOpp.id}`);
      console.log('Generic endpoint status:', genericResponse.status);
      
      if (genericResponse.ok) {
        const genericDetails = await genericResponse.json();
        console.log('✓ Generic details response:', JSON.stringify(genericDetails, null, 2));
      } else {
        console.log('✗ Generic endpoint also not working');
      }
    }
    
  } catch (error) {
    console.error('ERROR:', error);
  }
}

testOpportunityDetails();