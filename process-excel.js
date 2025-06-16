import XLSX from 'xlsx';
import { Pool } from '@neondatabase/serverless';

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function processExcelFile() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('attached_assets/Zonnepanelen 2_1750106867427.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Excel data structure:');
    console.log('Headers:', data[0]);
    console.log('First few rows:');
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`Row ${i}:`, data[i]);
    }
    
    // Skip header row and process data
    const rows = data.slice(1).filter(row => row.length > 0 && row[0]); // Filter out empty rows
    
    console.log(`\nProcessing ${rows.length} data rows...`);
    
    // Track created entities to avoid duplicates
    const createdCustomers = new Map();
    const createdPartners = new Map();
    const createdUsers = new Map(); // For account managers
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const [title, clientName, partnerName, startDate, accountManagerName, insuranceDescription] = row;
      
      console.log(`\nProcessing row ${i + 1}:`);
      console.log(`Title: ${title}`);
      console.log(`Client: ${clientName}`);
      console.log(`Partner: ${partnerName}`);
      console.log(`Start Date: ${startDate}`);
      console.log(`Account Manager: ${accountManagerName}`);
      console.log(`Insurance Description: ${insuranceDescription}`);
      
      // Create or get customer
      let customerId = null;
      if (clientName && !createdCustomers.has(clientName)) {
        const customerResult = await pool.query(`
          INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at)
          VALUES ($1, 'Business', 'Insurance', 'Medium', 'Customer created from Excel import', NOW(), NOW())
          RETURNING id
        `, [clientName]);
        customerId = customerResult.rows[0].id;
        createdCustomers.set(clientName, customerId);
        console.log(`Created customer: ${clientName} (ID: ${customerId})`);
      } else if (clientName) {
        customerId = createdCustomers.get(clientName);
        console.log(`Using existing customer: ${clientName} (ID: ${customerId})`);
      }
      
      // Create or get partner
      let partnerId = null;
      if (partnerName && !createdPartners.has(partnerName)) {
        const partnerResult = await pool.query(`
          INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at)
          VALUES ($1, 'Partner', 'Insurance', 'Medium', 'Partner created from Excel import', NOW(), NOW())
          RETURNING id
        `, [partnerName]);
        partnerId = partnerResult.rows[0].id;
        createdPartners.set(partnerName, partnerId);
        console.log(`Created partner: ${partnerName} (ID: ${partnerId})`);
      } else if (partnerName) {
        partnerId = createdPartners.get(partnerName);
        console.log(`Using existing partner: ${partnerName} (ID: ${partnerId})`);
      }
      
      // Create or get account manager user
      let accountManagerId = null;
      if (accountManagerName && !createdUsers.has(accountManagerName)) {
        const userResult = await pool.query(`
          INSERT INTO degoudse.users (username, name, email, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING id
        `, [
          accountManagerName.toLowerCase().replace(/\s+/g, '.'),
          accountManagerName,
          `${accountManagerName.toLowerCase().replace(/\s+/g, '.')}@degoudse.nl`
        ]);
        accountManagerId = userResult.rows[0].id;
        createdUsers.set(accountManagerName, accountManagerId);
        console.log(`Created account manager: ${accountManagerName} (ID: ${accountManagerId})`);
      } else if (accountManagerName) {
        accountManagerId = createdUsers.get(accountManagerName);
        console.log(`Using existing account manager: ${accountManagerName} (ID: ${accountManagerId})`);
      }
      
      // Parse start date
      let parsedStartDate = null;
      if (startDate) {
        // Handle Excel date formats
        if (typeof startDate === 'number') {
          // Excel date serial number
          const excelEpoch = new Date(1899, 11, 30);
          parsedStartDate = new Date(excelEpoch.getTime() + startDate * 24 * 60 * 60 * 1000);
        } else if (typeof startDate === 'string') {
          parsedStartDate = new Date(startDate);
        }
        
        if (parsedStartDate && !isNaN(parsedStartDate.getTime())) {
          console.log(`Parsed start date: ${parsedStartDate.toISOString()}`);
        } else {
          parsedStartDate = null;
          console.log(`Could not parse start date: ${startDate}`);
        }
      }
      
      // Create opportunity
      const opportunityResult = await pool.query(`
        INSERT INTO degoudse.opportunities (
          title, client_id, partner_id, account_manager_id, insurance_description, 
          start_date, status, stage, type, probability, estimated_value, 
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Active', 'Prospecting', 'New Business', 75, 50000, NOW(), NOW())
        RETURNING id
      `, [
        title,
        customerId,
        partnerId,
        accountManagerId,
        insuranceDescription,
        parsedStartDate
      ]);
      
      const opportunityId = opportunityResult.rows[0].id;
      console.log(`Created opportunity: ${title} (ID: ${opportunityId})`);
      
      // Create relationships if we have customer and partner
      if (customerId && partnerId) {
        // Create customer-opportunity relationship
        await pool.query(`
          INSERT INTO degoudse.opportunity_customers (opportunity_id, customer_id)
          VALUES ($1, $2)
          ON CONFLICT (opportunity_id, customer_id) DO NOTHING
        `, [opportunityId, customerId]);
        
        // Create partner-opportunity relationship  
        await pool.query(`
          INSERT INTO degoudse.opportunity_partners (opportunity_id, partner_id)
          VALUES ($1, $2)
          ON CONFLICT (opportunity_id, partner_id) DO NOTHING
        `, [opportunityId, partnerId]);
        
        console.log(`Created relationships for opportunity ${opportunityId}`);
      }
    }
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Customers created: ${createdCustomers.size}`);
    console.log(`Partners created: ${createdPartners.size}`);
    console.log(`Account managers created: ${createdUsers.size}`);
    console.log(`Opportunities created: ${rows.length}`);
    
    console.log('\nCreated customers:', Array.from(createdCustomers.keys()));
    console.log('Created partners:', Array.from(createdPartners.keys()));
    console.log('Created account managers:', Array.from(createdUsers.keys()));
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
  } finally {
    await pool.end();
  }
}

processExcelFile();