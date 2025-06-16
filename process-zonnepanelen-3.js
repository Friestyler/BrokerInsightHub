const XLSX = require('xlsx');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function processZonnepanelenFile() {
  try {
    console.log('Processing Zonnepanelen 3 Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/Zonnepanelen 3_1750114821101.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in Excel file`);
    
    if (data.length === 0) {
      console.log('No data found in Excel file');
      return;
    }
    
    // Display the column headers to understand the structure
    console.log('Excel columns:', Object.keys(data[0]));
    console.log('First few rows:', data.slice(0, 3));
    
    // Get existing customers and partners for matching
    const existingCustomers = await pool.query('SELECT id, name FROM degoudse.customers');
    const existingPartners = await pool.query('SELECT id, name FROM degoudse.partners');
    
    const customerMap = new Map();
    const partnerMap = new Map();
    
    // Create lookup maps for existing entities
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
    
    for (const row of data) {
      try {
        // Extract and clean data from Excel row
        const opportunityTitle = row['Opportunity Title'] || row['Title'] || row['Name'] || 'Solar Panel Opportunity';
        const customerName = row['Customer'] || row['Client'] || row['Customer Name'] || row['Klant'];
        const partnerName = row['Partner'] || row['Broker'] || row['Partner Name'] || row['Makelaar'];
        const value = parseFloat(row['Value'] || row['Amount'] || row['Waarde'] || 0);
        const status = row['Status'] || row['Stage'] || 'prospect';
        const description = row['Description'] || row['Details'] || row['Omschrijving'] || '';
        const location = row['Location'] || row['Locatie'] || row['Address'] || '';
        const productType = row['Product'] || row['Type'] || 'Solar Panels';
        
        // Skip rows without essential data
        if (!customerName && !partnerName) {
          console.log(`Skipping row ${processedCount + 1}: No customer or partner name`);
          processedCount++;
          continue;
        }
        
        let customerId = null;
        let partnerId = null;
        
        // Handle customer matching/creation
        if (customerName && customerName.trim()) {
          const customerKey = customerName.toLowerCase().trim();
          customerId = customerMap.get(customerKey);
          
          if (!customerId) {
            // Create new customer
            const customerResult = await pool.query(`
              INSERT INTO degoudse.customers (name, description, status, location, industry)
              VALUES ($1, $2, 'active', $3, 'Energy')
              RETURNING id
            `, [customerName.trim(), `Solar panel customer`, location || '']);
            
            customerId = customerResult.rows[0].id;
            customerMap.set(customerKey, customerId);
            newCustomers++;
            console.log(`Created new customer: ${customerName} (ID: ${customerId})`);
          }
        }
        
        // Handle partner matching/creation
        if (partnerName && partnerName.trim()) {
          const partnerKey = partnerName.toLowerCase().trim();
          partnerId = partnerMap.get(partnerKey);
          
          if (!partnerId) {
            // Create new partner
            const partnerResult = await pool.query(`
              INSERT INTO degoudse.partners (name, description, status, partner_type)
              VALUES ($1, $2, 'active', 'broker')
              RETURNING id
            `, [partnerName.trim(), `Solar panel broker`]);
            
            partnerId = partnerResult.rows[0].id;
            partnerMap.set(partnerKey, partnerId);
            newPartners++;
            console.log(`Created new partner: ${partnerName} (ID: ${partnerId})`);
          }
        }
        
        // Create the opportunity
        const opportunityResult = await pool.query(`
          INSERT INTO degoudse.opportunities (
            title, description, status, estimated_value, client_id, partner_id,
            product_category, location, priority, stage, probability,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'medium', $9, 
                   CASE WHEN $3 = 'won' THEN 100 
                        WHEN $3 = 'lost' THEN 0 
                        WHEN $3 = 'prospect' THEN 25
                        WHEN $3 = 'qualified' THEN 50
                        WHEN $3 = 'proposal' THEN 75
                        ELSE 30 END,
                   NOW(), NOW())
          RETURNING id
        `, [
          opportunityTitle,
          description || `Solar panel opportunity for ${customerName || 'customer'}`,
          status,
          value || 0,
          customerId,
          partnerId,
          productType,
          location || '',
          status
        ]);
        
        const opportunityId = opportunityResult.rows[0].id;
        newOpportunities++;
        
        console.log(`Created opportunity: ${opportunityTitle} (ID: ${opportunityId}) - Customer: ${customerName || 'N/A'} - Partner: ${partnerName || 'N/A'}`);
        
        processedCount++;
        
      } catch (rowError) {
        console.error(`Error processing row ${processedCount + 1}:`, rowError.message);
        processedCount++;
        continue;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Processed rows: ${processedCount}`);
    console.log(`New customers created: ${newCustomers}`);
    console.log(`New partners created: ${newPartners}`);
    console.log(`New opportunities created: ${newOpportunities}`);
    
    // Update relationship counts
    console.log('Updating relationship counts...');
    
    // Update partner relationship counts
    await pool.query(`
      UPDATE degoudse.partners 
      SET linked_opportunity_ids = (
        SELECT ARRAY_AGG(id::text) 
        FROM degoudse.opportunities 
        WHERE partner_id = degoudse.partners.id
      )
      WHERE id IN (
        SELECT DISTINCT partner_id 
        FROM degoudse.opportunities 
        WHERE partner_id IS NOT NULL
      )
    `);
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import
processZonnepanelenFile().catch(console.error);