import XLSX from 'xlsx';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function processBGBFile() {
  try {
    console.log('Processing BGB 2 Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/BGB 2_1750116791457.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in the Excel file`);
    
    if (data.length === 0) {
      console.log('No data found in the Excel file');
      return;
    }
    
    // Log the first few rows to understand the structure
    console.log('First 3 rows:');
    data.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, Object.keys(row));
      console.log('Sample data:', row);
    });
    
    // Analyze column structure
    const columns = Object.keys(data[0]);
    console.log('Available columns:', columns);
    
    // Process the data based on the structure we found
    await processDataRows(data);
    
  } catch (error) {
    console.error('Error processing BGB file:', error);
  } finally {
    await pool.end();
  }
}

async function processDataRows(data) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let newOpportunities = 0;
    let newCustomers = 0;
    let newPartners = 0;
    let newRelationships = 0;
    
    // Track existing entities to avoid duplicates
    const existingCustomers = new Map();
    const existingPartners = new Map();
    const existingRelationships = new Set();
    
    // Load existing customers
    const customersResult = await client.query(`
      SELECT id, name FROM degoudse.customers
    `);
    customersResult.rows.forEach(row => {
      existingCustomers.set(row.name.toLowerCase().trim(), row.id);
    });
    
    // Load existing partners
    const partnersResult = await client.query(`
      SELECT id, name FROM degoudse.partners
    `);
    partnersResult.rows.forEach(row => {
      existingPartners.set(row.name.toLowerCase().trim(), row.id);
    });
    
    // Load existing relationships
    const relationshipsResult = await client.query(`
      SELECT customer_id, partner_id FROM degoudse.partner_customers
    `);
    relationshipsResult.rows.forEach(row => {
      existingRelationships.add(`${row.customer_id}-${row.partner_id}`);
    });
    
    console.log(`Loaded ${existingCustomers.size} existing customers`);
    console.log(`Loaded ${existingPartners.size} existing partners`);
    console.log(`Loaded ${existingRelationships.size} existing relationships`);
    
    for (const [index, row] of data.entries()) {
      try {
        // Map the row data
        const mappedData = mapRowData(row);
        
        console.log(`Processing row ${index + 1}:`, {
          customer: mappedData.customerName,
          partner: mappedData.partnerName,
          title: mappedData.opportunityTitle
        });
        
        if (!mappedData.customerName || !mappedData.opportunityTitle) {
          console.log(`Skipping row ${index + 1}: Missing required data`);
          continue;
        }
        
        // Process customer
        let customerId = existingCustomers.get(mappedData.customerName.toLowerCase().trim());
        if (!customerId) {
          const customerResult = await client.query(`
            INSERT INTO degoudse.customers (name, description)
            VALUES ($1, $2)
            RETURNING id
          `, [
            mappedData.customerName,
            `${mappedData.industry || 'Construction'} company - ${mappedData.customerName}`
          ]);
          customerId = customerResult.rows[0].id;
          existingCustomers.set(mappedData.customerName.toLowerCase().trim(), customerId);
          newCustomers++;
          console.log(`Created new customer: ${mappedData.customerName}`);
        }
        
        // Process partner
        let partnerId = existingPartners.get(mappedData.partnerName.toLowerCase().trim());
        if (!partnerId) {
          const partnerResult = await client.query(`
            INSERT INTO degoudse.partners (name, partner_type, description, location, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `, [
            mappedData.partnerName,
            'Insurance Broker',
            `Insurance partner: ${mappedData.partnerName}`,
            'Netherlands',
            'active'
          ]);
          partnerId = partnerResult.rows[0].id;
          existingPartners.set(mappedData.partnerName.toLowerCase().trim(), partnerId);
          newPartners++;
          console.log(`Created new partner: ${mappedData.partnerName}`);
        }
        
        // Create customer-partner relationship if it doesn't exist
        const relationshipKey = `${customerId}-${partnerId}`;
        if (!existingRelationships.has(relationshipKey)) {
          await client.query(`
            INSERT INTO degoudse.partner_customers (partner_id, customer_id)
            VALUES ($1, $2)
            ON CONFLICT (partner_id, customer_id) DO NOTHING
          `, [partnerId, customerId]);
          existingRelationships.add(relationshipKey);
          newRelationships++;
        }
        
        // Create opportunity
        const opportunityResult = await client.query(`
          INSERT INTO degoudse.opportunities (
            title, description, estimated_value, stage, probability,
            client_id, partner_id, product_id, insurance_description, start_date, status, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING id
        `, [
          mappedData.opportunityTitle,
          mappedData.description || `${mappedData.opportunityTitle} for ${mappedData.customerName}`,
          mappedData.value || 75000,
          mappedData.stage || 'Active',
          mappedData.probability || 90,
          customerId,
          partnerId,
          1, // Property Insurance product for business building insurance
          mappedData.insuranceType || 'Business Building Insurance',
          mappedData.startDate || new Date(),
          'active'
        ]);
        
        const opportunityId = opportunityResult.rows[0].id;
        newOpportunities++;
        
        // Update partner's linked_opportunity_ids
        await client.query(`
          UPDATE degoudse.partners 
          SET linked_opportunity_ids = array_append(
            COALESCE(linked_opportunity_ids, ARRAY[]::integer[]), 
            $1
          )
          WHERE id = $2 AND NOT ($1 = ANY(COALESCE(linked_opportunity_ids, ARRAY[]::integer[])))
        `, [opportunityId, partnerId]);
        
        if ((index + 1) % 50 === 0) {
          console.log(`Processed ${index + 1} rows...`);
        }
        
      } catch (rowError) {
        console.error(`Error processing row ${index + 1}:`, rowError.message);
        // Break out of the transaction on first error to prevent cascading failures
        break;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n=== Import Summary ===');
    console.log(`New opportunities: ${newOpportunities}`);
    console.log(`New customers: ${newCustomers}`);
    console.log(`New partners: ${newPartners}`);
    console.log(`New relationships: ${newRelationships}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function mapRowData(row) {
  // Map BGB 2 file structure to our database fields
  // Structure: title, clientId, partnerId, startDate, accountManagerName, insuranceDescription
  
  const mapped = {};
  
  // Direct mapping from BGB 2 structure
  mapped.customerName = row.clientId || '';
  mapped.partnerName = row.partnerId || '';
  mapped.opportunityTitle = `${row.title || 'BGB'} - ${row.insuranceDescription || 'Business Insurance'}`;
  mapped.description = `${row.insuranceDescription || 'Business Building Insurance'} for ${row.clientId || 'Client'} managed by ${row.accountManagerName || 'Account Manager'}`;
  
  // Convert Excel date number to JavaScript date
  if (row.startDate && typeof row.startDate === 'number') {
    // Excel dates are days since 1/1/1900, but JavaScript dates are milliseconds since 1/1/1970
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (row.startDate - 1) * 24 * 60 * 60 * 1000);
    mapped.startDate = jsDate;
  }
  
  // Set additional fields
  mapped.accountManager = row.accountManagerName || '';
  mapped.insuranceType = row.insuranceDescription || '';
  mapped.value = 75000; // Default value for business building insurance
  mapped.currency = 'EUR';
  mapped.stage = 'Active'; // BGB policies are typically active
  mapped.probability = 90; // High probability for existing policies
  mapped.industry = 'Construction'; // Based on BGB (Business Building)
  mapped.sizeCategory = 'Medium';
  mapped.country = 'Netherlands';
  
  return mapped;
}

// Run the import
processBGBFile().catch(console.error);