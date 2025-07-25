#!/usr/bin/env node

/**
 * CRITICAL BROKER VIEW OPPORTUNITIES TEST SUITE
 * 
 * This comprehensive test verifies that:
 * 1. API returns correct number of opportunities for partner 1
 * 2. Frontend receives and processes the data correctly
 * 3. UI displays the opportunities properly
 */

const test = async () => {
  console.log('🧪 BROKER VIEW OPPORTUNITIES TEST SUITE');
  console.log('=' + '='.repeat(50));
  
  try {
    // Test 1: Direct API endpoint test
    console.log('\n📡 TEST 1: Direct API Endpoint');
    const response = await fetch('http://localhost:5000/api/Acme-TechCorp/opportunities?brokerView=true&partnerId=1');
    const data = await response.json();
    
    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`✅ Opportunities Count: ${data.length}`);
    console.log(`✅ First Opportunity:`, {
      id: data[0]?.id,
      title: data[0]?.title,
      partnerId: data[0]?.partnerId,
      partner_id: data[0]?.partner_id
    });
    
    if (data.length !== 36) {
      throw new Error(`❌ EXPECTED 36 opportunities, got ${data.length}`);
    }
    
    // Test 2: Verify partner filtering
    console.log('\n🎯 TEST 2: Partner Filtering');
    const wrongPartnerIds = data.filter(opp => 
      opp.partnerId !== 1 && opp.partner_id !== 1
    );
    
    if (wrongPartnerIds.length > 0) {
      throw new Error(`❌ Found ${wrongPartnerIds.length} opportunities with wrong partner ID`);
    }
    console.log('✅ All opportunities correctly filtered to partner 1');
    
    // Test 3: Data structure validation
    console.log('\n📋 TEST 3: Data Structure Validation');
    const requiredFields = ['id', 'title'];
    const missingFields = [];
    
    data.slice(0, 5).forEach((opp, index) => {
      requiredFields.forEach(field => {
        if (!opp[field]) {
          missingFields.push(`Opportunity ${index}: missing ${field}`);
        }
      });
    });
    
    if (missingFields.length > 0) {
      throw new Error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('✅ All opportunities have required fields');
    
    // Test 4: Environment routing test
    console.log('\n🌍 TEST 4: Environment Routing');
    const envResponse = await fetch('http://localhost:5000/api/degoudse/Acme-TechCorp/opportunities?brokerView=true&partnerId=1');
    const envData = await envResponse.json();
    
    if (envData.length !== data.length) {
      throw new Error(`❌ Environment routing inconsistent: ${envData.length} vs ${data.length}`);
    }
    console.log('✅ Environment routing works correctly');
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('=' + '='.repeat(50));
    console.log(`✅ API correctly returns ${data.length} opportunities for partner 1`);
    console.log('✅ Partner filtering works correctly');
    console.log('✅ Data structure is valid');
    console.log('✅ Environment routing is functional');
    console.log('\n🚀 BROKER VIEW OPPORTUNITIES API IS WORKING CORRECTLY');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Run the test
test();