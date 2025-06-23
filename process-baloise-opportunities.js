import XLSX from 'xlsx';
import fs from 'fs';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function processBaloiseOpportunities() {
  try {
    console.log('Starting Baloise opportunities import process...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/Baloise opportunties _1750673401363.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length < 2) {
      throw new Error('Excel file appears to be empty or has no data rows');
    }
    
    console.log(`Found ${data.length - 1} opportunity records to process`);
    
    // Get headers from first row
    const headers = data[0];
    console.log('Excel headers:', headers);
    
    // Process each data row (skip header)
    const opportunities = [];
    const customers = new Map();
    const partners = new Map();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // Create object from row data
      const record = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          record[header] = row[index];
        }
      });
      
      console.log(`Processing row ${i}:`, record);
      
      // Extract and validate opportunity data
      const opportunity = await processOpportunityRecord(record, customers, partners);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }
    
    console.log(`Processed ${opportunities.length} valid opportunities`);
    console.log(`Found ${customers.size} unique customers`);
    console.log(`Found ${partners.size} unique partners`);
    
    // Start database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert customers first
      console.log('Creating customers...');
      const customerIds = await createCustomers(client, customers);
      
      // Insert partners
      console.log('Creating partners...');
      const partnerIds = await createPartners(client, partners);
      
      // Insert opportunities with relationships
      console.log('Creating opportunities with relationships...');
      await createOpportunities(client, opportunities, customerIds, partnerIds);
      
      await client.query('COMMIT');
      console.log('✓ Successfully imported all data with relationships');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

async function processOpportunityRecord(record, customers, partners) {
  // Extract common field variations
  const getField = (variations) => {
    for (const field of variations) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
        return record[field];
      }
    }
    return null;
  };
  
  // Extract opportunity data
  const title = getField(['Title', 'title', 'Name', 'name', 'Opportunity', 'opportunity']);
  const customer = getField(['Customer', 'customer', 'Client', 'client', 'Company', 'company']);
  const partner = getField(['Partner', 'partner', 'Broker', 'broker', 'Agent', 'agent']);
  const stage = getField(['Stage', 'stage', 'Status', 'status', 'Phase', 'phase']);
  const value = getField(['Value', 'value', 'Amount', 'amount', 'Premium', 'premium']);
  const insuranceType = getField(['Insurance Type', 'insurance_type', 'Type', 'type', 'Product', 'product']);
  const description = getField(['Description', 'description', 'Details', 'details', 'Notes', 'notes']);
  
  if (!title) {
    console.log('Skipping record - no title found:', record);
    return null;
  }
  
  // Generate probability based on stage
  let probability = getField(['Probability', 'probability', 'Chance', 'chance']);
  if (!probability || probability === '') {
    probability = generateProbabilityFromStage(stage);
  }
  
  // Ensure stage matches probability
  const finalStage = adjustStageForProbability(probability, stage);
  
  // Store customer and partner for creation
  if (customer) {
    customers.set(customer, {
      name: customer,
      type: 'customer',
      environment_id: 'baloise'
    });
  }
  
  if (partner) {
    partners.set(partner, {
      name: partner,
      type: 'partner',
      environment_id: 'baloise'
    });
  }
  
  return {
    title: title || 'Untitled Opportunity',
    customer_name: customer,
    partner_name: partner,
    stage: finalStage,
    probability: parseFloat(probability) || 0,
    estimated_value: parseFloat(value) || 0,
    weighted_value: (parseFloat(value) || 0) * (parseFloat(probability) || 0) / 100,
    insurance_type: insuranceType || 'General',
    description: description || '',
    environment_id: 'baloise'
  };
}

function generateProbabilityFromStage(stage) {
  if (!stage) return 25;
  
  const stageLower = stage.toLowerCase();
  
  if (stageLower.includes('qualified') || stageLower.includes('prospect')) return 25;
  if (stageLower.includes('proposal') || stageLower.includes('quote')) return 50;
  if (stageLower.includes('negotiation') || stageLower.includes('review')) return 75;
  if (stageLower.includes('closed') || stageLower.includes('won')) return 100;
  if (stageLower.includes('lost') || stageLower.includes('rejected')) return 0;
  
  return 25; // Default for unknown stages
}

function adjustStageForProbability(probability, originalStage) {
  const prob = parseFloat(probability) || 0;
  
  if (prob >= 90) return 'Closed Won';
  if (prob >= 75) return 'Negotiation';
  if (prob >= 50) return 'Proposal Sent';
  if (prob >= 25) return 'Qualified Lead';
  if (prob > 0) return 'Initial Contact';
  
  return originalStage || 'Initial Contact';
}

async function createCustomers(client, customers) {
  const customerIds = new Map();
  
  for (const [name, customerData] of customers) {
    try {
      // Check if customer already exists
      const existingQuery = `
        SELECT id FROM baloise.customers 
        WHERE name ILIKE $1
      `;
      const existing = await client.query(existingQuery, [name]);
      
      if (existing.rows.length > 0) {
        customerIds.set(name, existing.rows[0].id);
        console.log(`Customer already exists: ${name} (ID: ${existing.rows[0].id})`);
        continue;
      }
      
      // Create new customer
      const insertQuery = `
        INSERT INTO baloise.customers (name, created_at, updated_at, environment_id)
        VALUES ($1, NOW(), NOW(), $2)
        RETURNING id
      `;
      const result = await client.query(insertQuery, [name, customerData.environment_id]);
      
      customerIds.set(name, result.rows[0].id);
      console.log(`Created customer: ${name} (ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`Error creating customer ${name}:`, error);
    }
  }
  
  return customerIds;
}

async function createPartners(client, partners) {
  const partnerIds = new Map();
  
  for (const [name, partnerData] of partners) {
    try {
      // Check if partner already exists
      const existingQuery = `
        SELECT id FROM baloise.partners 
        WHERE name ILIKE $1
      `;
      const existing = await client.query(existingQuery, [name]);
      
      if (existing.rows.length > 0) {
        partnerIds.set(name, existing.rows[0].id);
        console.log(`Partner already exists: ${name} (ID: ${existing.rows[0].id})`);
        continue;
      }
      
      // Create new partner
      const insertQuery = `
        INSERT INTO baloise.partners (name, created_at, updated_at, environment_id)
        VALUES ($1, NOW(), NOW(), $2)
        RETURNING id
      `;
      const result = await client.query(insertQuery, [name, partnerData.environment_id]);
      
      partnerIds.set(name, result.rows[0].id);
      console.log(`Created partner: ${name} (ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`Error creating partner ${name}:`, error);
    }
  }
  
  return partnerIds;
}

async function createOpportunities(client, opportunities, customerIds, partnerIds) {
  for (const opportunity of opportunities) {
    try {
      // Get customer and partner IDs
      const customerId = opportunity.customer_name ? customerIds.get(opportunity.customer_name) : null;
      const partnerId = opportunity.partner_name ? partnerIds.get(opportunity.partner_name) : null;
      
      // Check for duplicate opportunities
      const duplicateQuery = `
        SELECT id FROM baloise.opportunities 
        WHERE title ILIKE $1 
        AND ($2::integer IS NULL OR customer_id = $2)
        AND ($3::integer IS NULL OR partner_id = $3)
      `;
      const duplicate = await client.query(duplicateQuery, [
        opportunity.title, 
        customerId, 
        partnerId
      ]);
      
      if (duplicate.rows.length > 0) {
        console.log(`Opportunity already exists: ${opportunity.title}`);
        continue;
      }
      
      // Insert opportunity
      const insertQuery = `
        INSERT INTO baloise.opportunities (
          title, customer_id, partner_id, stage, probability, 
          estimated_value, weighted_value, insurance_type, description,
          created_at, updated_at, environment_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        opportunity.title,
        customerId,
        partnerId,
        opportunity.stage,
        opportunity.probability,
        opportunity.estimated_value,
        opportunity.weighted_value,
        opportunity.insurance_type,
        opportunity.description,
        opportunity.environment_id
      ]);
      
      console.log(`Created opportunity: ${opportunity.title} (ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`Error creating opportunity ${opportunity.title}:`, error);
    }
  }
}

// Run the import
processBaloiseOpportunities()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });

export { processBaloiseOpportunities };