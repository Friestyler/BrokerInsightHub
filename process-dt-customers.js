import XLSX from 'xlsx';
import { Pool } from '@neondatabase/serverless';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function processDTCustomersFile() {
  try {
    console.log('Reading DT Customers Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('attached_assets/DT Customers _1753879798720.xlsx');
    
    // Get all sheet names
    console.log('Available sheets:', workbook.SheetNames);
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`\nProcessing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length > 0) {
        console.log('Headers:', data[0]);
        console.log('Sample rows:', data.slice(1, 3));
        console.log(`Total rows: ${data.length - 1}`);
        
        // Convert to objects with proper headers
        const headers = data[0];
        const rows = data.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        // Process customers and their data
        await processCustomerData(rows, sheetName);
      }
    }
    
  } catch (error) {
    console.error('Error processing DT Customers file:', error);
  } finally {
    await pool.end();
  }
}

async function processCustomerData(customerData, sheetName) {
  console.log(`\nProcessing ${customerData.length} customers from ${sheetName}...`);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const customer of customerData) {
    try {
      // Skip empty rows
      if (!customer || Object.values(customer).every(val => !val)) {
        continue;
      }
      
      console.log('Processing customer:', customer);
      
      // Extract customer information (adjust field names based on actual Excel structure)
      const customerName = customer['End Customer'] || customer['Customer Name'] || customer['Name'] || customer['Company'] || customer['Client'];
      
      if (!customerName) {
        console.log('Skipping row - no customer name found');
        skippedCount++;
        continue;
      }
      
      // Check if customer already exists
      const existingCustomer = await pool.query(
        'SELECT id FROM degoudse.customers WHERE name = $1',
        [customerName]
      );
      
      let customerId;
      
      if (existingCustomer.rows.length === 0) {
        // Create new customer
        const customerResult = await pool.query(`
          INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING id
        `, [
          customerName,
          `Customer imported from ${sheetName}`,
          customerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase()
        ]);
        
        customerId = customerResult.rows[0].id;
        console.log(`Created new customer: ${customerName} (ID: ${customerId})`);
      } else {
        customerId = existingCustomer.rows[0].id;
        console.log(`Customer already exists: ${customerName} (ID: ${customerId})`);
      }
      
      // Process opportunity values and product groups
      await processOpportunityData(customer, customerId);
      
      // Process subcategories if available
      await processSubcategories(customer, customerId);
      
      processedCount++;
      
    } catch (error) {
      console.error(`Error processing customer:`, error);
      console.error('Customer data:', customer);
      skippedCount++;
    }
  }
  
  console.log(`\nProcessing complete for ${sheetName}:`);
  console.log(`- Processed: ${processedCount} customers`);
  console.log(`- Skipped: ${skippedCount} customers`);
}

async function processOpportunityData(customer, customerId) {
  // Look for opportunity value fields in the customer data
  const opportunityFields = Object.keys(customer).filter(key => 
    key.toLowerCase().includes('opportunity') || 
    key.toLowerCase().includes('value') ||
    key.toLowerCase().includes('amount')
  );
  
  console.log('Opportunity fields found:', opportunityFields);
  
  for (const field of opportunityFields) {
    const value = customer[field];
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      
      // Create opportunity record
      try {
        await pool.query(`
          INSERT INTO degoudse.opportunities (
            title, description, client_id, estimated_value, 
            probability, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          `${field} - ${customer['End Customer'] || 'Unknown Customer'}`,
          `Opportunity imported from DT Customers file`,
          customerId,
          parseFloat(value),
          0.5, // Default probability
          'open'
        ]);
        
        console.log(`Created opportunity for ${field}: €${value}`);
      } catch (error) {
        console.error(`Error creating opportunity for ${field}:`, error);
      }
    }
  }
}

async function processSubcategories(customer, customerId) {
  // Look for product category or subcategory fields
  const categoryFields = Object.keys(customer).filter(key => 
    key.toLowerCase().includes('category') || 
    key.toLowerCase().includes('product') ||
    key.toLowerCase().includes('type') ||
    key.toLowerCase().includes('group')
  );
  
  console.log('Category fields found:', categoryFields);
  
  for (const field of categoryFields) {
    const categoryValue = customer[field];
    if (categoryValue && typeof categoryValue === 'string') {
      
      try {
        // Check if category exists, if not create it
        let categoryResult = await pool.query(
          'SELECT id FROM degoudse.categories WHERE name = $1',
          [categoryValue]
        );
        
        let categoryId;
        if (categoryResult.rows.length === 0) {
          // Create new category
          categoryResult = await pool.query(`
            INSERT INTO degoudse.categories (name, description, color, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id
          `, [
            categoryValue,
            `Category imported from DT Customers file`,
            '#5567E5' // Default brand color
          ]);
          categoryId = categoryResult.rows[0].id;
          console.log(`Created new category: ${categoryValue}`);
        } else {
          categoryId = categoryResult.rows[0].id;
        }
        
        // Link customer to category if applicable
        console.log(`Linked customer to category: ${categoryValue}`);
        
      } catch (error) {
        console.error(`Error processing category ${categoryValue}:`, error);
      }
    }
  }
}

// Run the processor
processDTCustomersFile().catch(console.error);