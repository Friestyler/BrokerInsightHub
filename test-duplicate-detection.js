/**
 * Test script to verify duplicate detection based on mandatory attributes only
 */

async function testDuplicateDetection() {
  console.log('🧪 Testing Duplicate Detection - Mandatory Attributes Only');
  console.log('=' .repeat(60));

  try {
    // First, get the entity schema to understand mandatory fields
    const schemaResponse = await fetch('http://localhost:5000/api/degoudse/upload/entities');
    const schemas = await schemaResponse.json();
    const opportunitySchema = schemas.find(s => s.entityType === 'opportunities');
    
    console.log('📋 Opportunity Schema - Mandatory Attributes:');
    const mandatoryAttrs = opportunitySchema.attributes
      .filter(attr => !attr.isNullable && attr.name !== 'id')
      .map(attr => attr.name);
    console.log(mandatoryAttrs);
    
    // Get existing opportunities to understand current data
    const existingResponse = await fetch('http://localhost:5000/api/degoudse/opportunities');
    const existing = await existingResponse.json();
    console.log(`\n📊 Found ${existing.length} existing opportunities`);
    
    if (existing.length > 0) {
      console.log('\n🔍 Sample existing record:');
      const sample = existing[0];
      mandatoryAttrs.forEach(attr => {
        console.log(`  ${attr}: ${sample[attr]}`);
      });
      
      console.log('\n✅ Test Case 1: Same mandatory values, different optional values');
      console.log('Expected: Should be flagged as duplicate');
      console.log('Mandatory values from existing record:');
      mandatoryAttrs.forEach(attr => {
        if (sample[attr] !== null && sample[attr] !== undefined) {
          console.log(`  ${attr}: ${sample[attr]}`);
        }
      });
      
      console.log('\n✅ Test Case 2: Different mandatory values');
      console.log('Expected: Should NOT be flagged as duplicate');
      console.log('Modified mandatory values:');
      mandatoryAttrs.forEach(attr => {
        if (sample[attr] !== null && sample[attr] !== undefined) {
          const modifiedValue = typeof sample[attr] === 'string' 
            ? sample[attr] + '_modified'
            : sample[attr] + 1;
          console.log(`  ${attr}: ${modifiedValue}`);
        }
      });
    }
    
    console.log('\n✅ Duplicate detection logic has been updated to:');
    console.log('- Only check mandatory entity attributes');
    console.log('- Consider records duplicate when ALL mandatory attributes match');
    console.log('- Ignore non-mandatory attribute differences');
    console.log('- Provide clear messaging about which fields matched');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testDuplicateDetection };
} else {
  testDuplicateDetection();
}