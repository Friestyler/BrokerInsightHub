/**
 * Test script to verify percentage conversion and duplicate detection
 */

async function testPercentageConversion() {
  try {
    console.log('🔍 Testing Percentage Conversion and Duplicate Detection');
    console.log('========================================================');
    
    // Test the conversion logic
    const testValues = [
      { input: '0.95', expected: 95, description: 'Decimal probability' },
      { input: '0.35', expected: 35, description: 'Low decimal probability' },
      { input: '1.0', expected: 100, description: 'Max decimal probability' },
      { input: '95', expected: 95, description: 'Already percentage format' },
      { input: '0.6', expected: 60, description: 'Mid-range decimal' }
    ];
    
    console.log('\n📊 Conversion Logic Test:');
    testValues.forEach(test => {
      const numValue = parseFloat(test.input);
      let result;
      if (numValue <= 1) {
        result = Math.round(numValue * 100);
      } else {
        result = Math.round(numValue);
      }
      
      const passed = result === test.expected;
      console.log(`  ${test.description}: ${test.input} → ${result}% ${passed ? '✅' : '❌'}`);
    });
    
    // Check current database state
    const response = await fetch('http://localhost:5000/api/degoudse/opportunities');
    const opportunities = await response.json();
    
    // Find recent test records
    const testRecords = opportunities.filter(opp => 
      opp.clientId >= 10001 && opp.clientId <= 10010
    ).slice(0, 5);
    
    console.log('\n📋 Current Database Values:');
    testRecords.forEach(record => {
      console.log(`  ID ${record.id}: Client ${record.clientId}, Probability ${record.probability}% (${record.title})`);
    });
    
    console.log('\n🎯 Expected Behavior:');
    console.log('- Upload file with 0.95 → Store as 95 → Display as 95%');
    console.log('- Upload file with 0.35 → Store as 35 → Display as 35%');
    console.log('- Duplicate detection compares: 95 vs 95 = match ✅');
    console.log('- UI shows: 95% in opportunities list');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPercentageConversion();