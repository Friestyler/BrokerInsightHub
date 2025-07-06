import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Get database connection
const sql = neon(process.env.DATABASE_URL);

// Read the Amazon data
const amazonData = JSON.parse(fs.readFileSync('./amazon-data.json', 'utf8'));

// Function to convert Excel date to JavaScript date
function excelDateToJSDate(excelDate) {
  // Excel dates are days since 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  return jsDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Function to map categories to our database categories
function mapCategoryToDatabase(category, subCategory, categories) {
  const categoryMapping = {
    'Pensioen': 'Pensioen',
    'Inkomen Collectief': 'Inkomen Collectief', 
    'Schade Zakelijk': 'Schade Zakelijk'
  };
  
  const mappedName = categoryMapping[category] || 'Overige / Specialistische Producten';
  const dbCategory = categories.find(c => c.name === mappedName);
  
  return {
    name: mappedName,
    id: dbCategory ? dbCategory.id : categories[0].id
  };
}

async function importAmazonProducts() {
  try {
    console.log('Starting Amazon product import...');
    
    // Get Amazon customer ID
    const customers = await sql`
      SELECT id FROM degoudse.customers WHERE name ILIKE '%amazon%'
    `;
    
    if (customers.length === 0) {
      console.error('Amazon customer not found!');
      return;
    }
    
    const amazonCustomerId = customers[0].id;
    console.log(`Found Amazon customer ID: ${amazonCustomerId}`);
    
    // Get Willis partner ID
    const partners = await sql`
      SELECT id FROM degoudse.partners WHERE name ILIKE '%willis%'
    `;
    
    const willisPartnerId = partners[0].id;
    console.log(`Found Willis partner ID: ${willisPartnerId}`);
    
    // Get available categories
    const categories = await sql`
      SELECT id, name FROM degoudse.categories WHERE level = 1
    `;
    console.log('Available categories:', categories.map(c => `${c.id}: ${c.name}`));
    
    // Process each Amazon product (skip header row)
    let insertCount = 0;
    
    for (let i = 1; i < amazonData.length; i++) {
      const row = amazonData[i];
      const [customer, category, subCategory, value, excelDate] = row;
      
      if (!customer || customer !== 'Amazon') continue;
      
      const endDate = excelDateToJSDate(excelDate);
      const mappedCategory = mapCategoryToDatabase(category, subCategory, categories);
      
      console.log(`\nProcessing: ${subCategory}`);
      console.log(`- Category: ${category} -> ${mappedCategory.name} (ID: ${mappedCategory.id})`);
      console.log(`- Value: €${value}`);
      console.log(`- End Date: ${endDate}`);
      
      // Create or find the product
      let productId;
      
      // Check if product already exists
      const existingProducts = await sql`
        SELECT id FROM degoudse.products 
        WHERE name = ${subCategory}
      `;
      
      if (existingProducts.length > 0) {
        productId = existingProducts[0].id;
        console.log(`- Using existing product ID: ${productId}`);
      } else {
        // Create new product
        const newProduct = await sql`
          INSERT INTO degoudse.products (
            name, 
            description, 
            category,
            category_id,
            total_value,
            premium_value,
            contract_end_date,
            created_at,
            updated_at
          ) VALUES (
            ${subCategory},
            ${`${category} - ${subCategory} for Amazon`},
            ${mappedCategory.name},
            ${mappedCategory.id},
            ${Math.round(parseFloat(value))},
            ${Math.round(parseFloat(value) * 0.1)}, -- Assume 10% premium
            ${endDate},
            NOW(),
            NOW()
          ) RETURNING id
        `;
        productId = newProduct[0].id;
        console.log(`- Created new product ID: ${productId}`);
      }
      
      // Create customer-product assignment
      await sql`
        INSERT INTO degoudse.customer_product_assignments (
          customer_id,
          product_template_id,
          custom_price,
          customer_contract_end_date,
          is_active,
          assigned_at,
          created_at,
          updated_at
        ) VALUES (
          ${amazonCustomerId},
          ${productId},
          ${Math.round(parseFloat(value))},
          ${endDate}::date,
          true,
          NOW(),
          NOW(),
          NOW()
        )
      `;
      
      // Create opportunity for this product
      await sql`
        INSERT INTO degoudse.opportunities (
          title,
          description,
          client_id,
          partner_id,
          product_id,
          estimated_value,
          probability,
          stage,
          status,
          expected_close_date,
          created_at,
          updated_at
        ) VALUES (
          ${`${subCategory} Renewal`},
          ${`${category} - ${subCategory} renewal opportunity for Amazon`},
          ${amazonCustomerId},
          ${willisPartnerId},
          ${productId},
          ${Math.round(parseFloat(value))},
          75,
          'Negotiation',
          'Open',
          ${endDate},
          NOW(),
          NOW()
        )
      `;
      
      insertCount++;
      console.log(`- ✅ Created product assignment and opportunity`);
    }
    
    console.log(`\n🎉 Successfully imported ${insertCount} Amazon products!`);
    console.log('\nWillis now has:');
    
    // Show final Willis state
    const finalOpportunities = await sql`
      SELECT COUNT(*) as count FROM degoudse.opportunities WHERE partner_id = ${willisPartnerId}
    `;
    
    const finalCustomers = await sql`
      SELECT COUNT(*) as count FROM degoudse.partner_customers WHERE partner_id = ${willisPartnerId}
    `;
    
    console.log(`- Customers: ${finalCustomers[0].count}`);
    console.log(`- Opportunities: ${finalOpportunities[0].count}`);
    console.log(`- All connected to Amazon with proper products and end dates`);
    
  } catch (error) {
    console.error('Error importing Amazon products:', error);
  }
}

// Run the import
importAmazonProducts();