const XLSX = require('xlsx');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAuthenticRelationships() {
  try {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile('attached_assets/Zonnepanelen 2_1750106867427.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows in Excel file`);
    
    // Get all customers and partners from database
    const customersResult = await pool.query('SELECT id, name FROM degoudse.customers');
    const partnersResult = await pool.query('SELECT id, name FROM degoudse.partners');
    const opportunitiesResult = await pool.query('SELECT id, title FROM degoudse.opportunities');
    
    const customerMap = new Map();
    const partnerMap = new Map();
    const opportunityMap = new Map();
    
    customersResult.rows.forEach(c => customerMap.set(c.name, c.id));
    partnersResult.rows.forEach(p => partnerMap.set(p.name, p.id));
    opportunitiesResult.rows.forEach(o => {
      if (!opportunityMap.has(o.title)) {
        opportunityMap.set(o.title, []);
      }
      opportunityMap.get(o.title).push(o.id);
    });
    
    console.log(`Database has ${customersResult.rows.length} customers, ${partnersResult.rows.length} partners, ${opportunitiesResult.rows.length} opportunities`);
    
    let processedRelationships = 0;
    let customerOpportunityInserts = [];
    let partnerOpportunityInserts = [];
    let partnerCustomerInserts = [];
    
    // Track unique partner-customer pairs
    const partnerCustomerPairs = new Set();
    
    // Process each row from Excel
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const customerName = row.clientId;
      const partnerName = row.partnerId;
      const opportunityTitle = row.title;
      
      const customerId = customerMap.get(customerName);
      const partnerId = partnerMap.get(partnerName);
      const opportunityIds = opportunityMap.get(opportunityTitle);
      
      if (!customerId) {
        console.log(`Warning: Customer not found: ${customerName}`);
        continue;
      }
      
      if (!partnerId) {
        console.log(`Warning: Partner not found: ${partnerName}`);
        continue;
      }
      
      if (!opportunityIds || opportunityIds.length === 0) {
        console.log(`Warning: No opportunities found for title: ${opportunityTitle}`);
        continue;
      }
      
      // Use the i-th opportunity for this Excel row (cycling if needed)
      const opportunityId = opportunityIds[i % opportunityIds.length];
      
      // Create customer-opportunity relationship
      customerOpportunityInserts.push(`(${customerId}, ${opportunityId})`);
      
      // Create partner-opportunity relationship
      partnerOpportunityInserts.push(`(${partnerId}, ${opportunityId})`);
      
      // Track unique partner-customer pairs
      const pairKey = `${partnerId}-${customerId}`;
      if (!partnerCustomerPairs.has(pairKey)) {
        partnerCustomerPairs.add(pairKey);
        partnerCustomerInserts.push(`(${partnerId}, ${customerId})`);
      }
      
      processedRelationships++;
    }
    
    console.log(`Processed ${processedRelationships} authentic relationships from Excel`);
    console.log(`Creating ${customerOpportunityInserts.length} customer-opportunity relationships`);
    console.log(`Creating ${partnerOpportunityInserts.length} partner-opportunity relationships`);
    console.log(`Creating ${partnerCustomerInserts.length} unique partner-customer relationships`);
    
    // Insert customer-opportunity relationships
    if (customerOpportunityInserts.length > 0) {
      const customerOpportunitySQL = `INSERT INTO degoudse.customer_opportunities (customer_id, opportunity_id) VALUES ${customerOpportunityInserts.join(', ')}`;
      await pool.query(customerOpportunitySQL);
      console.log('✓ Customer-opportunity relationships created');
    }
    
    // Insert partner-opportunity relationships
    if (partnerOpportunityInserts.length > 0) {
      const partnerOpportunitySQL = `INSERT INTO degoudse.partner_opportunities (partner_id, opportunity_id) VALUES ${partnerOpportunityInserts.join(', ')}`;
      await pool.query(partnerOpportunitySQL);
      console.log('✓ Partner-opportunity relationships created');
    }
    
    // Insert partner-customer relationships
    if (partnerCustomerInserts.length > 0) {
      const partnerCustomerSQL = `INSERT INTO degoudse.partner_customers (partner_id, customer_id) VALUES ${partnerCustomerInserts.join(', ')}`;
      await pool.query(partnerCustomerSQL);
      console.log('✓ Partner-customer relationships created');
    }
    
    // Update opportunity clientId and partnerId columns based on authentic relationships
    console.log('Updating opportunity clientId and partnerId columns...');
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const customerName = row.clientId;
      const partnerName = row.partnerId;
      const opportunityTitle = row.title;
      
      const customerId = customerMap.get(customerName);
      const partnerId = partnerMap.get(partnerName);
      const opportunityIds = opportunityMap.get(opportunityTitle);
      
      if (customerId && partnerId && opportunityIds) {
        const opportunityId = opportunityIds[i % opportunityIds.length];
        await pool.query(`UPDATE degoudse.opportunities SET "clientId" = $1, "partnerId" = $2 WHERE id = $3`, [customerId, partnerId, opportunityId]);
      }
    }
    
    console.log('✓ Opportunity clientId and partnerId columns updated');
    console.log('All authentic relationships from Excel file have been successfully restored!');
    
  } catch (error) {
    console.error('Error fixing authentic relationships:', error);
  } finally {
    await pool.end();
  }
}

fixAuthenticRelationships();