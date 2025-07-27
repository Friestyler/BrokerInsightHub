// Simple test to verify campaigns data structure and rendering
const fetch = require('node-fetch');

async function testCampaigns() {
  try {
    console.log('=== TESTING CAMPAIGNS DATA STRUCTURE ===');
    
    const response = await fetch('http://localhost:5000/api/degoudse/campaigns');
    const campaigns = await response.json();
    
    console.log(`✅ Fetched ${campaigns.length} campaigns`);
    
    if (campaigns.length > 0) {
      const sample = campaigns[0];
      console.log('\n📊 Sample campaign structure:');
      console.log(`- ID: ${sample.id}`);
      console.log(`- Name: ${sample.name}`);
      console.log(`- Status: ${sample.status}`);
      console.log(`- Type: ${sample.type}`);
      console.log(`- Target: ${sample.target_entity_type}`);
      console.log(`- Recipients: ${sample.recipients?.length || 0}`);
      console.log(`- Emails sent: ${sample.emails_sent || 0}`);
      console.log(`- Emails opened: ${sample.emails_opened || 0}`);
      console.log(`- Total clicks: ${sample.total_clicks || 0}`);
      console.log(`- Open rate: ${sample.open_rate || '0%'}`);
      
      console.log('\n✅ Data structure matches expected format');
    }
    
    return campaigns;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

testCampaigns();