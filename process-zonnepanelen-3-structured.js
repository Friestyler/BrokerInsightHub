import XLSX from 'xlsx';
import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function processStructuredZonnepanelenFile() {
  try {
    console.log('Processing Zonnepanelen 3 Excel file with structured columns...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/Zonnepanelen 3_1750114978542.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - this will use column letters as keys initially
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`Found ${data.length} rows in Excel file`);
    
    if (data.length <= 1) {
      console.log('No data rows found in Excel file');
      return;
    }
    
    // Skip header row and process all data rows
    const dataRows = data.slice(1);
    console.log(`Processing ${dataRows.length} data rows`);
    
    // Sample first few rows to understand structure
    console.log('First few rows structure:');
    dataRows.slice(0, 3).forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`, row);
    });
    
    // Get existing customers and partners for matching
    const existingCustomers = await pool.query('SELECT id, name FROM degoudse.customers');
    const existingPartners = await pool.query('SELECT id, name FROM degoudse.partners');
    
    const customerMap = new Map();
    const partnerMap = new Map();
    
    // Create lookup maps for existing entities (case-insensitive)
    existingCustomers.rows.forEach(customer => {
      customerMap.set(customer.name.toLowerCase().trim(), customer.id);
    });
    
    existingPartners.rows.forEach(partner => {
      partnerMap.set(partner.name.toLowerCase().trim(), partner.id);
    });
    
    console.log(`Found ${customerMap.size} existing customers and ${partnerMap.size} existing partners`);
    
    let processedCount = 0;
    let newCustomers = 0;
    let newPartners = 0;
    let newOpportunities = 0;
    let skippedRows = 0;
    
    for (const row of dataRows) {
      try {
        // Extract data according to specified columns
        // Column A: title, B: clientId, C: partnerId, D: startDate, E: accountManagerName, F: insuranceDescription
        const title = row[0] ? String(row[0]).trim() : '';
        const clientName = row[1] ? String(row[1]).trim() : '';
        const partnerName = row[2] ? String(row[2]).trim() : '';
        const startDate = row[3] ? String(row[3]).trim() : '';
        const accountManagerName = row[4] ? String(row[4]).trim() : '';
        const insuranceDescription = row[5] ? String(row[5]).trim() : '';
        
        // Skip rows without essential data
        if (!title || (!clientName && !partnerName)) {
          console.log(`Skipping row ${processedCount + 1}: Missing title or both client and partner`);
          skippedRows++;
          processedCount++;
          continue;
        }
        
        let customerId = null;
        let partnerId = null;
        
        // Handle customer matching/creation
        if (clientName) {
          const customerKey = clientName.toLowerCase().trim();
          customerId = customerMap.get(customerKey);
          
          if (!customerId) {
            // Create new customer
            const customerResult = await pool.query(`
              INSERT INTO degoudse.customers (name, description)
              VALUES ($1, $2)
              RETURNING id
            `, [clientName, `Insurance client for ${insuranceDescription || 'solar panel coverage'}`]);
            
            customerId = customerResult.rows[0].id;
            customerMap.set(customerKey, customerId);
            newCustomers++;
            console.log(`Created new customer: ${clientName} (ID: ${customerId})`);
          }
        }
        
        // Handle partner matching/creation
        if (partnerName) {
          const partnerKey = partnerName.toLowerCase().trim();
          partnerId = partnerMap.get(partnerKey);
          
          if (!partnerId) {
            // Create new partner
            const partnerResult = await pool.query(`
              INSERT INTO degoudse.partners (name, description, status, partner_type)
              VALUES ($1, $2, 'active', 'broker')
              RETURNING id
            `, [partnerName, `Insurance broker specializing in solar panel coverage`]);
            
            partnerId = partnerResult.rows[0].id;
            partnerMap.set(partnerKey, partnerId);
            newPartners++;
            console.log(`Created new partner: ${partnerName} (ID: ${partnerId})`);
          }
        }
        
        // Parse start date - skip if parsing fails
        let parsedStartDate = null;
        if (startDate && typeof startDate === 'number') {
          try {
            // Excel date serial number to JavaScript Date
            // Excel counts days since 1900-01-01, but has a leap year bug
            const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
            const jsDate = new Date(excelEpoch.getTime() + startDate * 24 * 60 * 60 * 1000);
            if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 2100) {
              parsedStartDate = jsDate.toISOString().split('T')[0];
            }
          } catch (e) {
            // Skip date parsing on error
          }
        }
        
        // Create the opportunity with solar panel product ID and default values
        const opportunityResult = await pool.query(`
          INSERT INTO degoudse.opportunities (
            title, description, status, client_id, partner_id, product_id,
            insurance_description, start_date, stage, probability, estimated_value,
            created_at, updated_at
          ) VALUES ($1, $2, 'prospect', $3, $4, $5, $6, $7, 'prospect', 25, 5000, NOW(), NOW())
          RETURNING id
        `, [
          title,
          `Solar panel insurance opportunity: ${title}`,
          customerId,
          partnerId,
          13, // Solar Panel Insurance product ID
          insuranceDescription || 'Solar Panel Insurance',
          parsedStartDate
        ]);
        
        const opportunityId = opportunityResult.rows[0].id;
        newOpportunities++;
        
        // Create partner-customer relationship if both exist and not already related
        if (customerId && partnerId) {
          try {
            await pool.query(`
              INSERT INTO degoudse.partner_customers (partner_id, customer_id)
              VALUES ($1, $2)
              ON CONFLICT (partner_id, customer_id) DO NOTHING
            `, [partnerId, customerId]);
            
            console.log(`Ensured relationship between partner ${partnerName} and customer ${clientName}`);
          } catch (relationError) {
            console.log(`Relationship may already exist between partner ${partnerName} and customer ${clientName}`);
          }
        }
        
        console.log(`Created opportunity: ${title} (ID: ${opportunityId}) - Customer: ${clientName || 'N/A'} - Partner: ${partnerName || 'N/A'}`);
        
        processedCount++;
        
      } catch (rowError) {
        console.error(`Error processing row ${processedCount + 1}:`, rowError.message);
        skippedRows++;
        processedCount++;
        continue;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total rows processed: ${processedCount}`);
    console.log(`Rows skipped: ${skippedRows}`);
    console.log(`New customers created: ${newCustomers}`);
    console.log(`New partners created: ${newPartners}`);
    console.log(`New opportunities created: ${newOpportunities}`);
    
    // Update relationship counts and linked opportunity IDs
    console.log('Updating relationship counts...');
    
    // Update partner linked opportunity IDs
    await pool.query(`
      UPDATE degoudse.partners 
      SET linked_opportunity_ids = (
        SELECT ARRAY_AGG(id) 
        FROM degoudse.opportunities 
        WHERE partner_id = degoudse.partners.id
      )
      WHERE id IN (
        SELECT DISTINCT partner_id 
        FROM degoudse.opportunities 
        WHERE partner_id IS NOT NULL
      )
    `);
    
    // Update customer linked opportunity IDs if that column exists
    try {
      await pool.query(`
        UPDATE degoudse.customers 
        SET linked_opportunity_ids = (
          SELECT ARRAY_AGG(id::text) 
          FROM degoudse.opportunities 
          WHERE client_id = degoudse.customers.id
        )
        WHERE id IN (
          SELECT DISTINCT client_id 
          FROM degoudse.opportunities 
          WHERE client_id IS NOT NULL
        )
      `);
    } catch (e) {
      console.log('Note: customers table may not have linked_opportunity_ids column');
    }
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import
processStructuredZonnepanelenFile().catch(console.error);