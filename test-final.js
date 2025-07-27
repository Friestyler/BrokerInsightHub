// FINAL COMPREHENSIVE TEST
console.clear();
console.log('🎯 FINAL COMPREHENSIVE TEST - BOTH PAGES');

const testBothPages = async () => {
  console.log('\n=== API ENDPOINTS TEST ===');
  
  try {
    const [campaigns, opportunities] = await Promise.all([
      fetch('/api/degoudse/campaigns').then(r => r.json()),
      fetch('/api/degoudse/opportunities').then(r => r.json())
    ]);
    
    console.log(`✅ Campaigns API: ${campaigns.length} items`);
    console.log(`✅ Opportunities API: ${opportunities.length} items`);
    
    // Check data structure
    if (campaigns.length > 0) {
      const camp = campaigns[0];
      console.log('Campaign sample fields:', {
        id: camp.id,
        name: camp.name,
        emails_sent: camp.emails_sent,
        target_entity_type: camp.target_entity_type
      });
    }
    
    if (opportunities.length > 0) {
      const opp = opportunities[0];
      console.log('Opportunity sample fields:', {
        id: opp.id,
        title: opp.title,
        clientName: opp.clientName,
        stage: opp.stage
      });
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
  }
  
  console.log('\n=== DOM RENDERING TEST ===');
  
  // Check campaigns page rendering
  const campaignCards = document.querySelectorAll('.hover\\:shadow-md');
  const campaignLoadingSpinners = document.querySelectorAll('.animate-spin');
  
  console.log(`Campaign cards rendered: ${campaignCards.length}`);
  console.log(`Campaign loading spinners: ${campaignLoadingSpinners.length}`);
  
  // Check opportunities page rendering  
  const opportunitiesTable = document.querySelector('table tbody');
  const opportunityRows = opportunitiesTable ? opportunitiesTable.querySelectorAll('tr') : [];
  
  console.log(`Opportunities table: ${opportunitiesTable ? 'found' : 'missing'}`);
  console.log(`Opportunity rows: ${opportunityRows.length}`);
  
  console.log('\n=== FINAL DIAGNOSIS ===');
  
  const isOnCampaignsPage = window.location.pathname.includes('campaigns');
  const isOnOpportunitiesPage = window.location.pathname.includes('opportunities');
  
  if (isOnCampaignsPage) {
    if (campaignCards.length > 0 && campaignLoadingSpinners.length === 0) {
      console.log('✅ CAMPAIGNS PAGE: WORKING CORRECTLY');
    } else {
      console.log('❌ CAMPAIGNS PAGE: NOT RENDERING');
    }
  }
  
  if (isOnOpportunitiesPage) {
    if (opportunitiesTable && opportunityRows.length > 0) {
      console.log('✅ OPPORTUNITIES PAGE: WORKING CORRECTLY');
    } else {
      console.log('❌ OPPORTUNITIES PAGE: NOT RENDERING');
    }
  }
  
  console.log('\n🎯 RUN THIS SCRIPT ON BOTH /campaigns AND /opportunities PAGES');
};

testBothPages();