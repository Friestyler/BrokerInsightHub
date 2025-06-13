/**
 * Debug script to test duplicate detection for opportunities
 */

async function debugDuplicateDetection() {
  console.log('🔍 Debugging Duplicate Detection for Opportunities');
  console.log('=' .repeat(60));

  try {
    // Get existing opportunities
    const existingResponse = await fetch('http://localhost:5000/api/degoudse/opportunities');
    const existing = await existingResponse.json();
    console.log(`\n📊 Found ${existing.length} existing opportunities`);
    
    // Get upload settings to see mandatory fields
    const settingsResponse = await fetch('http://localhost:5000/api/degoudse/upload-settings/opportunities');
    const settings = await settingsResponse.json();
    const allMandatoryFields = settings.filter(s => s.is_mandatory).map(s => s.attribute_name);
    const mandatoryFields = allMandatoryFields.filter(field => field !== 'id'); // Exclude ID from duplicate detection
    console.log('\n📋 All mandatory fields:', allMandatoryFields);
    console.log('📋 Mandatory fields for duplicate detection (excluding ID):', mandatoryFields);
    
    if (existing.length > 0) {
      console.log('\n🔍 Sample existing opportunity:');
      const sample = existing[0];
      mandatoryFields.forEach(field => {
        console.log(`  ${field}: ${sample[field]} (${typeof sample[field]})`);
      });
      
      // Test duplicate detection logic
      console.log('\n🧪 Testing duplicate detection logic:');
      
      // Create a test record with same mandatory values
      const testRecord = {};
      mandatoryFields.forEach(field => {
        testRecord[field] = sample[field];
      });
      
      console.log('\n📝 Test record (same mandatory values):');
      mandatoryFields.forEach(field => {
        console.log(`  ${field}: ${testRecord[field]} (${typeof testRecord[field]})`);
      });
      
      // Test the comparison logic
      console.log('\n🔄 Testing comparison logic:');
      const isDuplicate = mandatoryFields.every(field => {
        const existingValue = sample[field];
        const testValue = testRecord[field];
        const match = existingValue && 
                     existingValue.toString().toLowerCase() === testValue.toString().toLowerCase();
        console.log(`  ${field}: "${existingValue}" vs "${testValue}" = ${match}`);
        return match;
      });
      
      console.log(`\n✅ Duplicate detection result: ${isDuplicate}`);
      
      // Test with different values
      console.log('\n🔄 Testing with modified values:');
      const testRecord2 = {};
      mandatoryFields.forEach(field => {
        if (typeof sample[field] === 'string') {
          testRecord2[field] = sample[field] + '_modified';
        } else if (typeof sample[field] === 'number') {
          testRecord2[field] = sample[field] + 1;
        } else {
          testRecord2[field] = sample[field];
        }
      });
      
      const isDuplicate2 = mandatoryFields.every(field => {
        const existingValue = sample[field];
        const testValue = testRecord2[field];
        const match = existingValue && 
                     existingValue.toString().toLowerCase() === testValue.toString().toLowerCase();
        console.log(`  ${field}: "${existingValue}" vs "${testValue}" = ${match}`);
        return match;
      });
      
      console.log(`\n✅ Modified values duplicate result: ${isDuplicate2}`);
    }
    
    console.log('\n🎯 Recommendations:');
    console.log('1. Check if mandatory fields are properly mapped in the upload');
    console.log('2. Verify that the data types match between uploaded and existing records');
    console.log('3. Ensure case-insensitive comparison is working correctly');
    console.log('4. Check if empty/null values are handled properly');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugDuplicateDetection();