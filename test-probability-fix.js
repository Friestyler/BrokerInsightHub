/**
 * Test script to verify probability field handling after the fix
 */

async function testProbabilityFix() {
  try {
    console.log('🔍 Testing Probability Field Fix');
    console.log('====================================');
    
    // Get existing records
    const response = await fetch('http://localhost:5000/api/degoudse/opportunities');
    const opportunities = await response.json();
    
    // Find records with clientId 10001-10010 to see current probability values
    const testRecords = opportunities.filter(opp => 
      opp.clientId >= 10001 && opp.clientId <= 10010
    );
    
    console.log(`\n📊 Found ${testRecords.length} test records:`);
    
    // Group by probability values to see the distribution
    const probabilityGroups = {};
    testRecords.forEach(record => {
      const prob = record.probability;
      if (!probabilityGroups[prob]) {
        probabilityGroups[prob] = [];
      }
      probabilityGroups[prob].push({
        id: record.id,
        clientId: record.clientId,
        title: record.title,
        estimatedValue: record.estimatedValue
      });
    });
    
    console.log('\n📈 Probability value distribution:');
    Object.keys(probabilityGroups).sort().forEach(prob => {
      console.log(`  Probability ${prob}: ${probabilityGroups[prob].length} records`);
      probabilityGroups[prob].slice(0, 2).forEach(record => {
        console.log(`    - ID ${record.id}: ${record.title} (Client: ${record.clientId}, Value: ${record.estimatedValue})`);
      });
    });
    
    // Test case: what the upload data should look like now
    console.log('\n🧪 Expected upload data format:');
    const sampleUploadData = [
      { clientId: '10008', probability: '0.35', estimatedValue: '12000.00', title: 'Business Insurance' },
      { clientId: '10009', probability: '0.95', estimatedValue: '1100.00', title: 'Auto Insurance' },
      { clientId: '10010', probability: '0.60', estimatedValue: '2900.00', title: 'Home Insurance' }
    ];
    
    sampleUploadData.forEach(upload => {
      console.log(`  Upload: Client ${upload.clientId}, Probability ${upload.probability}, Value ${upload.estimatedValue}`);
      
      // Find matching existing records
      const matches = testRecords.filter(existing => 
        existing.clientId.toString() === upload.clientId &&
        existing.estimatedValue.toString() === parseFloat(upload.estimatedValue).toString() &&
        existing.title.toLowerCase().includes(upload.title.toLowerCase().split(' ')[0])
      );
      
      if (matches.length > 0) {
        matches.forEach(match => {
          const probMatch = match.probability.toString() === parseFloat(upload.probability).toString();
          console.log(`    Existing: ID ${match.id}, Probability ${match.probability} - Match: ${probMatch ? '✅' : '❌'}`);
        });
      } else {
        console.log(`    No existing records found for this combination`);
      }
    });
    
    console.log('\n💡 Analysis:');
    console.log('- If probabilities are mostly 0 and 1, existing records have rounded values');
    console.log('- If probabilities are decimals (0.35, 0.95), the fix is already applied');
    console.log('- New uploads should now preserve decimal probability values');
    console.log('- Duplicate detection should work correctly for new records');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProbabilityFix();