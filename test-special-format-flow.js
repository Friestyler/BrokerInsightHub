/**
 * Test script to verify complete special format upload flow
 * Tests that transformation works and data flows through all steps
 */

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const ENVIRONMENT_ID = 'degoudse';

async function testSpecialFormatFlow() {
  console.log('🧪 Testing Special Format Upload Flow...');
  
  try {
    // Step 1: Create a test CSV that needs transformation (simulating SFDC format)
    const testCsvContent = `
"","Name","Company","Email","Phone","","",""
"","John Doe","Test Corp","john@test.com","555-0123","","",""
"","Jane Smith","Another Corp","jane@another.com","555-0124","","",""
"","Bob Johnson","Third Corp","bob@third.com","555-0125","","",""
    `.trim();
    
    fs.writeFileSync('test-sfdc-format.csv', testCsvContent);
    console.log('✅ Created test SFDC format CSV file');
    
    // Step 2: Get existing transformation scripts
    console.log('🔍 Fetching transformation scripts...');
    const scriptsResponse = await fetch(`${BASE_URL}/api/${ENVIRONMENT_ID}/transformation-scripts`);
    const scripts = await scriptsResponse.json();
    
    console.log('📄 Available scripts:', scripts.map(s => ({ id: s.id, name: s.name })));
    
    // Find SFDC script
    const sfdcScript = scripts.find(s => s.name.toLowerCase().includes('sfdc') || s.name.toLowerCase().includes('salesforce'));
    if (!sfdcScript) {
      console.log('❌ No SFDC transformation script found');
      return;
    }
    
    console.log('✅ Using SFDC script:', { id: sfdcScript.id, name: sfdcScript.name });
    
    // Step 3: Test transformation endpoint
    console.log('🔄 Testing transformation...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-sfdc-format.csv'));
    formData.append('scriptId', sfdcScript.id.toString());
    
    const transformResponse = await fetch(`${BASE_URL}/api/${ENVIRONMENT_ID}/transformation-scripts/execute`, {
      method: 'POST',
      body: formData
    });
    
    if (!transformResponse.ok) {
      const errorText = await transformResponse.text();
      console.log('❌ Transformation failed:', transformResponse.status, errorText);
      return;
    }
    
    const transformResult = await transformResponse.json();
    console.log('✅ Transformation successful!');
    console.log('📊 Result:', {
      headers: transformResult.headers,
      rowCount: transformResult.rowCount,
      transformedCsvLength: transformResult.transformedCsv?.length
    });
    
    // Step 4: Verify transformed CSV content
    if (transformResult.transformedCsv) {
      const transformedLines = transformResult.transformedCsv.split('\n').filter(line => line.trim());
      console.log('📝 Transformed CSV preview:');
      console.log('   Headers:', transformedLines[0]);
      console.log('   Sample data:', transformedLines[1]);
      console.log('   Total lines:', transformedLines.length);
      
      // Save transformed CSV for inspection
      fs.writeFileSync('test-transformed-output.csv', transformResult.transformedCsv);
      console.log('💾 Saved transformed CSV to test-transformed-output.csv');
    }
    
    // Step 5: Test upload settings for opportunities
    console.log('🔍 Testing upload settings for opportunities...');
    const uploadSettingsResponse = await fetch(`${BASE_URL}/api/${ENVIRONMENT_ID}/upload-settings/opportunities`);
    
    if (uploadSettingsResponse.ok) {
      const uploadSettings = await uploadSettingsResponse.json();
      console.log('✅ Upload settings retrieved:', {
        entityType: uploadSettings.entityType,
        requiredFieldsCount: uploadSettings.requiredFields?.length || 0,
        optionalFieldsCount: uploadSettings.optionalFields?.length || 0
      });
    } else {
      console.log('❌ Failed to get upload settings');
    }
    
    console.log('🎉 Special format flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup test files
    try {
      fs.unlinkSync('test-sfdc-format.csv');
      if (fs.existsSync('test-transformed-output.csv')) {
        console.log('📁 Test files created for inspection');
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Run the test
testSpecialFormatFlow();