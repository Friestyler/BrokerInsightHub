import XLSX from 'xlsx';
import { Client } from '@neondatabase/serverless';

async function processWillisCustomers() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/Input NN-Demo_1751802064647.xlsx');
    
    // Get the Willis sheet
    const willisSheet = workbook.Sheets['Willis'];
    if (!willisSheet) {
      console.error('Willis sheet not found in workbook');
      return;
    }
    
    // Convert sheet to JSON
    const willisData = XLSX.utils.sheet_to_json(willisSheet, { header: 1 });
    
    console.log('Willis sheet data:', willisData.slice(0, 10)); // First 10 rows for debugging
    
    // Extract customers from column A (index 0), starting from row 2 (index 1)
    const customers = [];
    for (let i = 1; i < willisData.length; i++) {
      const customerName = willisData[i][0];
      if (customerName && typeof customerName === 'string' && customerName.trim() !== '') {
        customers.push(customerName.trim());
      }
    }
    
    console.log(`Found ${customers.length} customers in Willis tab:`);
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer}`);
    });
    
    // Connect to database
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    // Process each customer
    for (const customerName of customers) {
      try {
        // Check if customer already exists
        const existingCustomer = await client.query(
          'SELECT id FROM degoudse.customers WHERE name = $1',
          [customerName]
        );
        
        let customerId;
        
        if (existingCustomer.rows.length > 0) {
          customerId = existingCustomer.rows[0].id;
          console.log(`Customer "${customerName}" already exists with ID: ${customerId}`);
        } else {
          // Create new customer
          const newCustomer = await client.query(
            'INSERT INTO degoudse.customers (name, description, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
            [customerName, `Customer imported from Willis tab`, 'active']
          );
          customerId = newCustomer.rows[0].id;
          console.log(`Created new customer "${customerName}" with ID: ${customerId}`);
        }
        
        // Create relationship with Willis (partner ID 1)
        const willisId = 1;
        
        // Check if relationship already exists
        const existingRelationship = await client.query(
          'SELECT id FROM degoudse.partner_customers WHERE partner_id = $1 AND customer_id = $2',
          [willisId, customerId]
        );
        
        if (existingRelationship.rows.length === 0) {
          // Create new partner-customer relationship
          await client.query(
            'INSERT INTO degoudse.partner_customers (partner_id, customer_id, relationship_type, start_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
            [willisId, customerId, 'broker', '2024-01-01', 'active']
          );
          console.log(`Created relationship between Willis and customer "${customerName}"`);
        } else {
          console.log(`Relationship between Willis and customer "${customerName}" already exists`);
        }
        
      } catch (error) {
        console.error(`Error processing customer "${customerName}":`, error.message);
      }
    }
    
    await client.end();
    console.log('\nWillis customer processing completed!');
    
  } catch (error) {
    console.error('Error processing Willis customers:', error);
  }
}

// Run the script
processWillisCustomers();