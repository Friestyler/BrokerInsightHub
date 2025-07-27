// DEBUG URL TRANSFORMATION LOGIC
console.log('=== URL TRANSFORMATION DEBUG ===');

// Test cases that should work
const testCases = [
  '/api/opportunities',
  '/api/campaigns', 
  '/api/Qollabi-Test/opportunities',
  '/api/saved-lists?entity_type=opportunities',
  '/api/degoudse/opportunities', // Should not transform
  '/api/admin/custom-environments' // Should not transform
];

testCases.forEach(url => {
  console.log(`\nTesting: ${url}`);
  
  // Simulate the transformation logic
  if (url.includes('/degoudse') || url.includes('/api/admin/')) {
    console.log(`  -> No transformation (already has degoudse or admin)`);
    return;
  }
  
  if (url.startsWith('/api/')) {
    const apiSegments = url.split('/').filter(segment => segment !== '');
    console.log(`  -> Segments: [${apiSegments.join(', ')}]`);
    
    if (apiSegments.length > 2 && !['degoudse', 'admin'].includes(apiSegments[1])) {
      const resourcePath = apiSegments.slice(2).join('/');
      const newUrl = `/api/degoudse/${resourcePath}`;
      console.log(`  -> Multi-segment transform: ${newUrl}`);
    } else if (apiSegments.length >= 2 && apiSegments[1] !== 'degoudse' && apiSegments[1] !== 'admin') {
      const resourcePath = apiSegments.slice(1).join('/');
      const newUrl = `/api/degoudse/${resourcePath}`;
      console.log(`  -> Simple transform: ${newUrl}`);
    } else {
      console.log(`  -> No transformation needed`);
    }
  }
});

console.log('\n=== EXPECTED RESULTS ===');
console.log('/api/opportunities -> /api/degoudse/opportunities');
console.log('/api/campaigns -> /api/degoudse/campaigns');
console.log('/api/Qollabi-Test/opportunities -> /api/degoudse/opportunities');
console.log('/api/saved-lists?entity_type=opportunities -> /api/degoudse/saved-lists?entity_type=opportunities');