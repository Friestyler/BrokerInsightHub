import XLSX from 'xlsx';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/degoudse';

async function processDTCustomersFile() {
  try {
    console.log('Reading DT Customers Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('attached_assets/DT Customers _1753879798720.xlsx');
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    console.log(`Processing sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length > 0) {
      console.log('Headers:', data[0]);
      console.log(`Total rows: ${data.length - 1}`);
      
      // Convert to objects with proper headers
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      }).filter(row => {
        // Filter out empty rows and summary rows
        const customerName = row['End Customer'];
        return customerName && customerName !== 'Totals' && typeof customerName === 'string';
      });
      
      console.log(`Processing ${rows.length} valid customers...`);
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 10;
      let processedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1} (${batch.length} customers)...`);
        
        for (const customer of batch) {
          try {
            await processCustomerData(customer);
            processedCount++;
            console.log(`✅ Processed: ${customer['End Customer']}`);
          } catch (error) {
            console.error(`❌ Error processing ${customer['End Customer']}:`, error.message);
            errorCount++;
          }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`\n🎯 Final Results:`);
      console.log(`- Successfully processed: ${processedCount} customers`);
      console.log(`- Errors: ${errorCount} customers`);
      console.log(`- Total DT customers added to database: ${processedCount}`);
    }
    
  } catch (error) {
    console.error('Error processing DT Customers file:', error);
  }
}

async function processCustomerData(customer) {
  const customerName = customer['End Customer'];
  
  // Check if customer already exists
  const existingCustomersResponse = await fetch(`${API_BASE}/customers`);
  const existingCustomers = await existingCustomersResponse.json();
  
  let existingCustomer;
  if (existingCustomers.data) {
    existingCustomer = existingCustomers.data.find(c => c.name === customerName);
  } else {
    existingCustomer = existingCustomers.find(c => c.name === customerName);
  }
  
  let customerId;
  
  if (!existingCustomer) {
    // Create new customer
    const customerPayload = {
      name: customerName,
      description: `DT Technology customer - Partners: ${customer['Partners Involved'] || 0}, Total Value: €${customer['Value (€M)'] || 0}M`,
      initials: customerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase()
    };
    
    const createResponse = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create customer: ${createResponse.status}`);
    }
    
    const newCustomer = await createResponse.json();
    customerId = newCustomer.id;
    console.log(`📝 Created new customer: ${customerName} (ID: ${customerId})`);
  } else {
    customerId = existingCustomer.id;
    console.log(`🔄 Customer exists: ${customerName} (ID: ${customerId})`);
  }
  
  // Process opportunities for each product category with value > 0
  await processOpportunities(customer, customerId);
  
  // Process and create product categories from "Installed Sub-Categories"
  await processSubcategories(customer, customerId);
}

async function processOpportunities(customer, customerId) {
  const customerName = customer['End Customer'];
  
  // Product categories with their values
  const productCategories = [
    'SD-WAN (€M)', 'IoT Connectivity (€M)', 'MPLS & IP-VPN (€M)', 'Roaming (€M)',
    'Private Cloud (€M)', 'Backup & DR (€M)', 'Device Mgmt (€M)', 'Analytics (€M)',
    'API Mgmt (€M)', 'Edge Computing (€M)', 'Smart Building (€M)', 'App Mgmt (€M)',
    'VDI (€M)', 'SWG (€M)', 'SOC (€M)'
  ];
  
  let opportunitiesCreated = 0;
  
  for (const category of productCategories) {
    const value = customer[category];
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      
      const categoryName = category.replace(' (€M)', '');
      const opportunityPayload = {
        title: `${categoryName} - ${customerName}`,
        description: `Technology opportunity imported from DT Customers data. Category: ${categoryName}, Value: €${value}M`,
        clientId: customerId,
        estimatedValue: parseFloat(value) * 1000000, // Convert millions to euros
        probability: 0.6, // Reasonable probability for existing DT customers
        status: 'open'
      };
      
      try {
        const createResponse = await fetch(`${API_BASE}/opportunities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunityPayload)
        });
        
        if (createResponse.ok) {
          opportunitiesCreated++;
          console.log(`  💰 Created ${categoryName} opportunity: €${value}M`);
        }
      } catch (error) {
        console.error(`Error creating opportunity for ${categoryName}:`, error.message);
      }
    }
  }
  
  if (opportunitiesCreated > 0) {
    console.log(`  📈 Total opportunities created: ${opportunitiesCreated}`);
  }
}

async function processSubcategories(customer, customerId) {
  const installedSubCategories = customer['Installed Sub-Categories'];
  
  if (installedSubCategories && typeof installedSubCategories === 'string') {
    const categories = installedSubCategories.split(';').map(cat => cat.trim());
    
    console.log(`  🏷️  Installed sub-categories: ${categories.join(', ')}`);
    
    // Get existing categories
    try {
      const categoriesResponse = await fetch(`${API_BASE}/categories`);
      const existingCategories = await categoriesResponse.json();
      
      for (const categoryName of categories) {
        if (categoryName) {
          // Check if category exists
          const existingCategory = existingCategories.find(cat => cat.name === categoryName);
          
          if (!existingCategory) {
            // Create new category
            try {
              const categoryPayload = {
                name: categoryName,
                description: `Technology category imported from DT Customers data`,
                color: '#2563eb' // Blue color for tech categories
              };
              
              const createResponse = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryPayload)
              });
              
              if (createResponse.ok) {
                console.log(`  📂 Created category: ${categoryName}`);
              }
            } catch (error) {
              console.error(`Error creating category ${categoryName}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing categories:', error.message);
    }
  }
}

// Run the processor
processDTCustomersFile().catch(console.error);