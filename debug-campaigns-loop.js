// CAMPAIGNS INFINITE LOOP DEBUGGING
// PASTE THIS IN BROWSER CONSOLE ON /campaigns PAGE

console.clear();
console.log('🚨 CAMPAIGNS INFINITE LOOP DEBUG');

// Check if we're on campaigns page
if (!window.location.pathname.includes('campaigns')) {
  console.log('❌ NOT ON CAMPAIGNS PAGE - navigate to /campaigns first');
} else {
  console.log('✅ On campaigns page');
}

// 1. Monitor React Query state
let queryCheckInterval = setInterval(() => {
  if (window.__REACT_QUERY_CLIENT__) {
    const client = window.__REACT_QUERY_CLIENT__;
    const cache = client.getQueryCache();
    const queries = cache.getAll();
    
    const campaignQueries = queries.filter(q => 
      q.queryKey.some(k => k.includes && k.includes('campaigns'))
    );
    
    campaignQueries.forEach(q => {
      console.log('🔄 CAMPAIGN QUERY STATUS:', {
        key: q.queryKey,
        status: q.state.status,
        dataLength: q.state.data?.length,
        error: q.state.error?.message,
        fetchStatus: q.state.fetchStatus,
        isLoading: q.state.status === 'pending'
      });
    });
    
    // Stop monitoring after 10 seconds
    setTimeout(() => {
      clearInterval(queryCheckInterval);
      console.log('🛑 Stopped monitoring');
    }, 10000);
  }
}, 1000);

// 2. Check DOM state
setTimeout(() => {
  const campaignCards = document.querySelectorAll('.hover\\:shadow-md');
  const loadingSpinners = document.querySelectorAll('.animate-spin');
  const campaignElements = document.querySelectorAll('[class*="campaign"]');
  
  console.log('📊 DOM STATE:');
  console.log('- Campaign cards:', campaignCards.length);
  console.log('- Loading spinners:', loadingSpinners.length);  
  console.log('- Campaign elements:', campaignElements.length);
  
  if (loadingSpinners.length > 0) {
    console.log('🔄 STILL LOADING - INFINITE LOOP DETECTED');
    console.log('Loading spinner elements:', loadingSpinners);
  }
  
  if (campaignCards.length > 0) {
    console.log('✅ CAMPAIGN CARDS RENDERED');
  } else {
    console.log('❌ NO CAMPAIGN CARDS');
  }
}, 2000);

// 3. Test API directly
fetch('/api/degoudse/campaigns')
  .then(r => r.json())
  .then(data => {
    console.log('🌐 DIRECT API TEST:');
    console.log('- Response length:', data.length);
    console.log('- Sample campaign:', data[0]);
  })
  .catch(e => {
    console.error('❌ API FAILED:', e);
  });

console.log('⏰ Monitoring for 10 seconds...');
console.log('📋 EXPECTED: 0 loading spinners, 5 campaign cards');