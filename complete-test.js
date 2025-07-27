// COMPREHENSIVE RENDERING TEST
console.log('=== COMPLETE RENDERING TEST ===');

// Test 1: Environment contexts
const testEnvironments = async () => {
  console.log('\n1. ENVIRONMENT TESTS');
  
  const environments = ['degoudse', 'Qollabi-Test', 'nn', 'baloise'];
  
  for (const env of environments) {
    try {
      const campaigns = await fetch(`/api/${env}/campaigns`).then(r => r.json());
      const opportunities = await fetch(`/api/${env}/opportunities`).then(r => r.json());
      
      console.log(`✅ ${env}: ${campaigns.length} campaigns, ${opportunities.length} opportunities`);
    } catch (error) {
      console.log(`❌ ${env}: ${error.message}`);
    }
  }
};

// Test 2: React component rendering 
const testReactState = () => {
  console.log('\n2. REACT COMPONENT STATE');
  
  // Check if campaigns page is properly rendered
  const campaignsElements = document.querySelectorAll('[class*="campaign"]');
  console.log(`Campaign elements found: ${campaignsElements.length}`);
  
  // Check opportunities table
  const oppTable = document.querySelector('table');
  const oppRows = document.querySelectorAll('tbody tr');
  console.log(`Opportunities table: ${oppTable ? 'found' : 'not found'}`);
  console.log(`Opportunity rows: ${oppRows.length}`);
  
  // Check for loading states
  const loadingSpinners = document.querySelectorAll('[class*="animate-spin"]');
  console.log(`Loading spinners: ${loadingSpinners.length}`);
  
  // Check error states
  const errorMessages = document.querySelectorAll('[class*="error"]');
  console.log(`Error messages: ${errorMessages.length}`);
};

// Test 3: Data structure validation
const testDataStructures = async () => {
  console.log('\n3. DATA STRUCTURE VALIDATION');
  
  try {
    const campaigns = await fetch('/api/degoudse/campaigns').then(r => r.json());
    const sampleCampaign = campaigns[0];
    
    console.log('Campaign structure check:');
    console.log(`- Has emails_sent: ${sampleCampaign.emails_sent !== undefined}`);
    console.log(`- Has emails_opened: ${sampleCampaign.emails_opened !== undefined}`);
    console.log(`- Has total_clicks: ${sampleCampaign.total_clicks !== undefined}`);
    console.log(`- Has recipients: ${Array.isArray(sampleCampaign.recipients)}`);
    
    const opportunities = await fetch('/api/degoudse/opportunities').then(r => r.json());
    const sampleOpp = opportunities[0];
    
    console.log('\nOpportunity structure check:');
    console.log(`- Has title: ${sampleOpp.title !== undefined}`);
    console.log(`- Has clientName: ${sampleOpp.clientName !== undefined}`);
    console.log(`- Has stage: ${sampleOpp.stage !== undefined}`);
    console.log(`- Has estimated_value: ${sampleOpp.estimated_value !== undefined}`);
    
  } catch (error) {
    console.error('❌ Data structure test failed:', error);
  }
};

// Test 4: Environment context detection
const testEnvironmentContext = () => {
  console.log('\n4. ENVIRONMENT CONTEXT DETECTION');
  
  // Check localStorage
  const storedEnv = localStorage.getItem('selectedEnvironment');
  console.log(`Stored environment: ${storedEnv}`);
  
  // Check current path
  console.log(`Current path: ${window.location.pathname}`);
  
  // Check for environment selector
  const envSelector = document.querySelector('[class*="environment"]');
  console.log(`Environment selector: ${envSelector ? 'found' : 'not found'}`);
};

// Run all tests
const runCompleteTest = async () => {
  console.clear();
  console.log('🔬 STARTING COMPLETE RENDERING TEST');
  
  await testEnvironments();
  testReactState();
  await testDataStructures();
  testEnvironmentContext();
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('✅ If you see campaign cards and opportunity table rows, rendering is working');
  console.log('❌ If you see only loading spinners or 0 results, there are still rendering issues');
};

// Auto-run test
runCompleteTest();