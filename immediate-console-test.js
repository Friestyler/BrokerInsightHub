// IMMEDIATE BROWSER CONSOLE TEST - Run this NOW
// Copy and paste this entire script into browser console

console.clear();
console.log('🔧 IMMEDIATE DIAGNOSTIC - RUNNING NOW');

// 1. Check React Query cache state
if (window.__REACT_QUERY_CLIENT__) {
  const client = window.__REACT_QUERY_CLIENT__;
  const cache = client.getQueryCache();
  const queries = cache.getAll();
  
  console.log(`Total cached queries: ${queries.length}`);
  
  queries.forEach(q => {
    if (q.queryKey.some(k => k.includes && k.includes('campaigns'))) {
      console.log('CAMPAIGNS QUERY:', {
        key: q.queryKey,
        status: q.state.status,
        dataLength: q.state.data?.length,
        error: q.state.error?.message,
        isLoading: q.state.status === 'pending'
      });
    }
    if (q.queryKey.some(k => k.includes && k.includes('opportunities'))) {
      console.log('OPPORTUNITIES QUERY:', {
        key: q.queryKey,
        status: q.state.status,
        dataLength: q.state.data?.length,
        error: q.state.error?.message,
        isLoading: q.state.status === 'pending'
      });
    }
  });
} else {
  console.log('❌ React Query client not accessible');
}

// 2. Check DOM elements
const campaignCards = document.querySelectorAll('[class*="hover:shadow-md"]');
const oppTable = document.querySelector('table tbody');
const oppRows = oppTable ? oppTable.querySelectorAll('tr') : [];
const loadingSpinners = document.querySelectorAll('[class*="animate-spin"]');

console.log('DOM ELEMENTS:');
console.log(`- Campaign cards: ${campaignCards.length}`);
console.log(`- Opportunities table: ${oppTable ? 'found' : 'missing'}`);
console.log(`- Opportunity rows: ${oppRows.length}`);
console.log(`- Loading spinners: ${loadingSpinners.length}`);

// 3. Check environment state
const storedEnv = localStorage.getItem('selectedEnvironment');
console.log(`- Environment: ${storedEnv}`);

// 4. Test API endpoints directly
Promise.all([
  fetch('/api/degoudse/campaigns').then(r => r.json()).catch(e => ({error: e.message})),
  fetch('/api/degoudse/opportunities').then(r => r.json()).catch(e => ({error: e.message}))
]).then(([campaigns, opportunities]) => {
  console.log('API DIRECT TEST:');
  console.log(`- Campaigns API: ${campaigns.error || campaigns.length + ' items'}`);
  console.log(`- Opportunities API: ${opportunities.error || opportunities.length + ' items'}`);
  
  // Final diagnosis
  console.log('\n📊 DIAGNOSIS:');
  if (loadingSpinners.length > 0) {
    console.log('❌ STILL LOADING - React Query not resolving');
  }
  if (campaignCards.length === 0 && !campaigns.error) {
    console.log('❌ CAMPAIGNS NOT RENDERING - Component issue');
  }
  if (oppRows.length === 0 && !opportunities.error) {
    console.log('❌ OPPORTUNITIES NOT RENDERING - Component issue');
  }
  if (campaigns.error || opportunities.error) {
    console.log('❌ API ERRORS - Backend issue');
  }
  if (campaignCards.length > 0 && oppRows.length > 0) {
    console.log('✅ BOTH PAGES WORKING');
  }
});

console.log('\n⚠️ PASTE THIS SCRIPT IN BROWSER CONSOLE ON BOTH PAGES');