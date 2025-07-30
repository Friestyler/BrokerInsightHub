import fs from 'fs';

try {
  // Read the processed data
  const rawData = JSON.parse(fs.readFileSync('./bosch-raw-data.json', 'utf8'));
  
  // Skip header row and process data
  const opportunities = rawData.slice(1).filter(row => row.length >= 5 && row[0] === 'Bosch');
  
  console.log(`Processing ${opportunities.length} Bosch opportunities...`);
  
  // Extract unique categories and subcategories
  const categories = new Set();
  const subcategories = new Map(); // category -> subcategories set
  
  const processedOpportunities = opportunities.map((row, index) => {
    const [customer, category, subcategory, contractExpiry, value] = row;
    
    categories.add(category);
    if (!subcategories.has(category)) {
      subcategories.set(category, new Set());
    }
    subcategories.get(category).add(subcategory);
    
    // Convert Excel date number to actual date
    const excelDate = contractExpiry;
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    const formattedDate = jsDate.toISOString().split('T')[0];
    
    return {
      title: `${subcategory} - ${category}`,
      description: `Closed opportunity from Bosch data. Category: ${category}, Subcategory: ${subcategory}, Contract expires: ${formattedDate}`,
      category,
      subcategory,
      contractExpiry: formattedDate,
      value: parseFloat(value) * 1000000, // Convert from €M to €
      status: 'closed_won'
    };
  });
  
  console.log('\nUnique Categories:');
  Array.from(categories).forEach(cat => console.log(`- ${cat}`));
  
  console.log('\nSubcategories by Category:');
  subcategories.forEach((subs, cat) => {
    console.log(`\n${cat}:`);
    Array.from(subs).forEach(sub => console.log(`  - ${sub}`));
  });
  
  // Calculate totals
  const totalValue = processedOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  console.log(`\nTotal opportunities: ${processedOpportunities.length}`);
  console.log(`Total value: €${(totalValue / 1000000).toFixed(1)}M`);
  
  // Generate SQL for categories (using existing product_categories table)
  let sql = `-- Bosch Customer and Opportunities Import SQL\n`;
  sql += `-- Generated from Excel file with ${processedOpportunities.length} closed opportunities\n\n`;
  
  // Insert Bosch categories
  sql += `-- Insert Bosch business categories into product_categories table\n`;
  Array.from(categories).forEach(category => {
    sql += `INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES \n`;
    sql += `('${category.replace(/'/g, "''")}', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());\n`;
  });
  
  sql += `\n-- Insert Bosch customer\n`;
  sql += `INSERT INTO degoudse.customers (name, description, "createdAt", "updatedAt") VALUES \n`;
  sql += `('Bosch', 'German multinational engineering and technology company with ${processedOpportunities.length} closed opportunities totaling €${(totalValue / 1000000).toFixed(1)}M', NOW(), NOW());\n`;
  
  // Split opportunities into batches of 50 for manageable SQL inserts
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < processedOpportunities.length; i += batchSize) {
    batches.push(processedOpportunities.slice(i, i + batchSize));
  }
  
  sql += `\n-- Insert Bosch closed opportunities (${batches.length} batches of up to ${batchSize} each)\n`;
  
  batches.forEach((batch, batchIndex) => {
    sql += `\n-- Batch ${batchIndex + 1} of ${batches.length}\n`;
    sql += `INSERT INTO degoudse.opportunities (title, description, "clientId", "productId", "estimatedValue", probability, status, stage, "expectedCloseDate", "createdAt", "updatedAt") VALUES \n`;
    
    const values = batch.map(opp => {
      const title = opp.title.replace(/'/g, "''");
      const description = opp.description.replace(/'/g, "''");
      return `('${title}', '${description}', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, ${opp.value}, 100, '${opp.status}', 'closed', '${opp.contractExpiry}', NOW(), NOW())`;
    });
    
    sql += values.join(',\n') + ';\n';
  });
  
  // Save the SQL file
  fs.writeFileSync('./bosch-import.sql', sql);
  console.log('\nSQL import file saved as bosch-import.sql');
  
  // Save processed data for reference
  fs.writeFileSync('./bosch-processed-data.json', JSON.stringify({
    categories: Array.from(categories),
    subcategories: Object.fromEntries(
      Array.from(subcategories.entries()).map(([cat, subs]) => [cat, Array.from(subs)])
    ),
    opportunities: processedOpportunities.slice(0, 10), // Sample for reference
    totals: {
      opportunityCount: processedOpportunities.length,
      totalValue: totalValue,
      totalValueM: (totalValue / 1000000).toFixed(1)
    }
  }, null, 2));
  
} catch (error) {
  console.error('Error processing Bosch data:', error.message);
}