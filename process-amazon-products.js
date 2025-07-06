import XLSX from 'xlsx';
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function processAmazonProducts() {
  try {
    console.log('Processing Amazon products from Excel...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('./attached_assets/Input NN-Demo_1751802064647.xlsx');
    const sheetName = 'Amazon';
    
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`Sheet "${sheetName}" not found in Excel file`);
      console.log('Available sheets:', workbook.SheetNames);
      return;
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows in Amazon sheet`);
    console.log('Sample data:', JSON.stringify(data.slice(0, 2), null, 2));
    
    // Get existing categories from database (hierarchical structure)
    const categories = await sql`SELECT * FROM degoudse.categories ORDER BY name`;
    const mainCategories = categories.filter(c => c.parent_id === null);
    const subcategories = categories.filter(c => c.parent_id !== null);
    
    console.log('Available main categories:', mainCategories.map(c => c.name));
    console.log('Available subcategories:', subcategories.map(s => s.name));
    
    // Process each product
    const products = [];
    const customerProducts = [];
    
    for (const row of data) {
      // Map Excel columns to our data structure
      const productName = row['Product Sub Category'] || row['product'] || row['Product Name'] || row['productname'];
      const category = row['Category'] || row['category'] || row['Product Category'] || row['productcategory'];
      const value = row['Value'] || row['value'] || row['Premium'] || row['premium'] || 0;
      const expiryDate = row['EXPDATUM'] || row['Expiry Date'] || row['expiry_date'] || row['End Date'] || row['enddate'] || row['Contract End'] || row['contract_end'];
      
      if (!productName) {
        console.warn('Skipping row with missing product name:', row);
        continue;
      }
      
      console.log(`Processing product: ${productName}, Category: ${category}, Value: ${value}, Expiry: ${expiryDate}`);
      
      // Find matching category
      let matchedCategory = null;
      let matchedSubcategory = null;
      
      // First try to match exact main category name
      matchedCategory = mainCategories.find(c => 
        c.name.toLowerCase() === category?.toLowerCase() ||
        c.name.toLowerCase().includes(category?.toLowerCase()) ||
        category?.toLowerCase().includes(c.name.toLowerCase())
      );
      
      // If no main category match, try subcategory
      if (!matchedCategory && category) {
        matchedSubcategory = subcategories.find(s => 
          s.name.toLowerCase() === category.toLowerCase() ||
          s.name.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (matchedSubcategory) {
          matchedCategory = mainCategories.find(c => c.id === matchedSubcategory.parent_id);
        }
      }
      
      // Also try to match product name with subcategory
      if (!matchedSubcategory && productName) {
        matchedSubcategory = subcategories.find(s => 
          s.name.toLowerCase() === productName.toLowerCase() ||
          s.name.toLowerCase().includes(productName.toLowerCase()) ||
          productName.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (matchedSubcategory && !matchedCategory) {
          matchedCategory = mainCategories.find(c => c.id === matchedSubcategory.parent_id);
        }
      }
      
      // If still no match, use default category
      if (!matchedCategory) {
        console.warn(`No category match found for "${category}", using default category`);
        matchedCategory = mainCategories[0]; // Use first available category
      }
      
      // Convert Excel date number to JavaScript date
      let contractEndDate = null;
      if (expiryDate) {
        if (typeof expiryDate === 'number') {
          // Excel date number (days since 1900-01-01)
          contractEndDate = new Date((expiryDate - 25569) * 86400 * 1000);
        } else {
          contractEndDate = new Date(expiryDate);
        }
      }
      
      // Create product object
      const product = {
        name: productName,
        description: `${productName} - ${category}`,
        category: category,
        category_id: matchedCategory.id,
        premium_value: parseFloat(value) || 0,
        contract_end_date: contractEndDate,
        total_value: parseFloat(value) || 0,
        created_at: new Date()
      };
      
      products.push(product);
      
      // Create customer-product relationship
      customerProducts.push({
        customer_id: 18, // Amazon customer ID
        product_name: productName,
        category_id: matchedCategory.id,
        subcategory_id: matchedSubcategory?.id || null,
        premium_value: parseFloat(value) || 0,
        contract_end_date: contractEndDate,
        created_at: new Date()
      });
    }
    
    console.log(`Processed ${products.length} products`);
    
    // Insert products into database
    if (products.length > 0) {
      console.log('Inserting products into database...');
      
      for (const product of products) {
        try {
          // Check if product already exists
          const existingProduct = await sql`
            SELECT id FROM degoudse.products 
            WHERE name = ${product.name} AND category = ${product.category}
          `;
          
          let productId;
          if (existingProduct.length === 0) {
            // Insert new product
            const result = await sql`
              INSERT INTO degoudse.products (
                name, description, category, category_id, 
                premium_value, contract_end_date, total_value, created_at
              ) VALUES (
                ${product.name}, ${product.description}, ${product.category}, 
                ${product.category_id}, ${product.premium_value}, 
                ${product.contract_end_date}, ${product.total_value}, ${product.created_at}
              ) RETURNING id
            `;
            productId = result[0].id;
            console.log(`Created product: ${product.name} (ID: ${productId})`);
          } else {
            productId = existingProduct[0].id;
            console.log(`Product already exists: ${product.name} (ID: ${productId})`);
          }
          
          // Create customer-product relationship
          const customerProduct = customerProducts.find(cp => cp.product_name === product.name);
          if (customerProduct) {
            // Check if relationship already exists
            const existingRelation = await sql`
              SELECT id FROM degoudse.customer_products 
              WHERE customer_id = ${customerProduct.customer_id} 
              AND product_id = ${productId}
            `;
            
            if (existingRelation.length === 0) {
              await sql`
                INSERT INTO degoudse.customer_products (
                  customer_id, product_id, premium_value, contract_end_date, created_at
                ) VALUES (
                  ${customerProduct.customer_id}, ${productId}, 
                  ${customerProduct.premium_value}, ${customerProduct.contract_end_date}, 
                  ${customerProduct.created_at}
                )
              `;
              console.log(`Created customer-product relationship for: ${product.name}`);
            } else {
              console.log(`Customer-product relationship already exists for: ${product.name}`);
            }
          }
          
        } catch (error) {
          console.error(`Error processing product ${product.name}:`, error);
        }
      }
    }
    
    console.log('Amazon products processing completed!');
    
    // Verify results
    const amazonProducts = await sql`
      SELECT cp.*, p.name as product_name, c.name as category_name, s.name as subcategory_name
      FROM degoudse.customer_products cp
      JOIN degoudse.products p ON cp.product_id = p.id
      LEFT JOIN degoudse.categories c ON p.category_id = c.id
      LEFT JOIN degoudse.subcategories s ON p.subcategory_id = s.id
      WHERE cp.customer_id = 18
    `;
    
    console.log(`\nVerification: Amazon now has ${amazonProducts.length} products:`);
    amazonProducts.forEach(p => {
      console.log(`- ${p.product_name} (${p.category_name}${p.subcategory_name ? ' > ' + p.subcategory_name : ''}) - €${p.premium_value} - Expires: ${p.contract_end_date ? p.contract_end_date.toISOString().split('T')[0] : 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error processing Amazon products:', error);
  }
}

// Run the process
processAmazonProducts();