import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testTransformationFlow() {
  console.log('🧪 Testing complete transformation flow...\n');
  
  // Step 1: Create a test CSV file
  const testCsv = `Old_Name,Old_Value,Old_Status
Test Company 1,100000,Active
Test Company 2,250000,Pending
Test Company 3,75000,Active`;
  
  fs.writeFileSync('./test-input.csv', testCsv);
  console.log('✓ Created test CSV file');
  
  // Step 2: Check if transformation scripts exist
  try {
    const scriptsResponse = await fetch('http://localhost:5000/api/degoudse/transformation-scripts');
    const scripts = await scriptsResponse.json();
    console.log('✓ Available transformation scripts:', scripts.length);
    
    if (scripts.length === 0) {
      console.log('❌ No transformation scripts found. Creating a test script...');
      
      // Create a test transformation script
      const createScriptResponse = await fetch('http://localhost:5000/api/degoudse/transformation-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Transformation',
          description: 'Test script for transformation flow',
          entityType: 'degoudse',
          scriptContent: `
import pandas as pd
import io

def transform_csv(csv_content):
    # Read CSV
    df = pd.read_csv(io.StringIO(csv_content))
    
    # Transform column names
    df = df.rename(columns={
        'Old_Name': 'name',
        'Old_Value': 'value', 
        'Old_Status': 'status'
    })
    
    # Return as CSV
    return df.to_csv(index=False)
`,
          isActive: true
        })
      });
      
      if (createScriptResponse.ok) {
        const newScript = await createScriptResponse.json();
        console.log('✓ Created test transformation script:', newScript.id);
      } else {
        console.log('❌ Failed to create test script:', await createScriptResponse.text());
        return;
      }
    }
    
    // Step 3: Test transformation execution
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('./test-input.csv'));
    formData.append('scriptId', scripts[0]?.id || '1');
    formData.append('entityType', 'degoudse');
    
    console.log('\n🔄 Testing transformation execution...');
    const transformResponse = await fetch('http://localhost:5000/api/degoudse/transformation-scripts/execute', {
      method: 'POST',
      body: formData
    });
    
    if (transformResponse.ok) {
      const result = await transformResponse.json();
      console.log('✅ Transformation successful!');
      console.log('Original headers: Old_Name,Old_Value,Old_Status');
      console.log('Transformed headers:', result.headers);
      console.log('Row count:', result.rowCount);
      console.log('Transformed CSV preview:');
      console.log(result.transformedCsv.split('\n').slice(0, 3).join('\n'));
    } else {
      console.log('❌ Transformation failed:', transformResponse.status);
      console.log('Error:', await transformResponse.text());
    }
    
    // Step 4: Test frontend transformation flow
    console.log('\n🔄 Testing frontend transformation integration...');
    console.log('Open the app and:');
    console.log('1. Select "degoudse" as upload type');
    console.log('2. Upload the test-input.csv file');
    console.log('3. Select a transformation script in step 2');
    console.log('4. Check the attribute mapping step for transformed headers');
    console.log('5. Look for debug logs in browser console');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    if (fs.existsSync('./test-input.csv')) {
      fs.unlinkSync('./test-input.csv');
      console.log('✓ Cleaned up test file');
    }
  }
}

// Run the test
testTransformationFlow().catch(console.error);