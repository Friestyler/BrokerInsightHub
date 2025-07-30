import fs from 'fs';

try {
  // Read the categories sheet data
  const sheetData = JSON.parse(fs.readFileSync('./categories-sheet-1-Sheet1.json', 'utf8'));
  
  console.log('Processing product categories data...');
  
  // Skip header row and process categories data
  const categoriesData = sheetData.slice(1).filter(row => row.length >= 2);
  
  console.log(`Found ${categoriesData.length} category entries to process`);
  
  // Group by main categories and process subcategories
  const categories = new Map();
  let currentCategory = null;
  
  categoriesData.forEach((row, index) => {
    const [category, subCategory, provider] = row;
    
    // If there's a new main category, update current category
    if (category && category.trim()) {
      currentCategory = category.trim();
      if (!categories.has(currentCategory)) {
        categories.set(currentCategory, {
          subcategories: [],
          providers: new Set()
        });
      }
    }
    
    // Add subcategory to current category
    if (currentCategory && subCategory && subCategory.trim()) {
      const providerList = provider ? provider.split(',').map(p => p.trim()) : [];
      categories.get(currentCategory).subcategories.push({
        name: subCategory.trim(),
        providers: providerList
      });
      
      // Add providers to category set
      providerList.forEach(p => categories.get(currentCategory).providers.add(p));
    }
  });
  
  console.log('\nMain Categories found:');
  categories.forEach((data, category) => {
    console.log(`\n${category}:`);
    console.log(`  - ${data.subcategories.length} subcategories`);
    console.log(`  - Providers: ${Array.from(data.providers).join(', ')}`);
    
    // Show first few subcategories
    data.subcategories.slice(0, 3).forEach(sub => {
      console.log(`    * ${sub.name}`);
    });
    if (data.subcategories.length > 3) {
      console.log(`    ... and ${data.subcategories.length - 3} more`);
    }
  });
  
  // Generate color scheme for categories
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald  
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#eab308'  // yellow
  ];
  
  // Generate SQL for inserting categories and subcategories
  let sql = `-- Product Categories Integration SQL\n`;
  sql += `-- Generated from Excel file with ${categoriesData.length} entries across ${categories.size} main categories\n\n`;
  
  sql += `-- First, clear existing categories to prevent duplicates\n`;
  sql += `DELETE FROM degoudse.product_categories WHERE description LIKE '%Deutsche Telekom%' OR description LIKE '%T-Systems%';\n\n`;
  
  // Insert main categories
  sql += `-- Insert main product categories\n`;
  const categoryArray = Array.from(categories.entries());
  categoryArray.forEach(([categoryName, data], index) => {
    const color = colors[index % colors.length];
    const providerText = Array.from(data.providers).join(', ');
    const description = `${categoryName} category with ${data.subcategories.length} subcategories. Primary providers: ${providerText}`;
    
    sql += `INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES \n`;
    sql += `('${categoryName.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', '${color}', NOW(), NOW());\n`;
  });
  
  sql += `\n-- Insert subcategories with parent relationships\n`;
  categoryArray.forEach(([categoryName, data]) => {
    data.subcategories.forEach(sub => {
      const description = `Subcategory under ${categoryName}. Providers: ${sub.providers.join(', ')}`;
      sql += `INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES \n`;
      sql += `('${sub.name.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', `;
      sql += `(SELECT color FROM degoudse.product_categories WHERE name = '${categoryName.replace(/'/g, "''")}' LIMIT 1), `;
      sql += `(SELECT id FROM degoudse.product_categories WHERE name = '${categoryName.replace(/'/g, "''")}' LIMIT 1), NOW(), NOW());\n`;
    });
  });
  
  // Save the SQL file
  fs.writeFileSync('./product-categories-import.sql', sql);
  console.log('\nProduct categories SQL import file saved as product-categories-import.sql');
  
  // Save structured data for reference
  const structuredData = {
    totalCategories: categories.size,
    totalSubcategories: Array.from(categories.values()).reduce((sum, cat) => sum + cat.subcategories.length, 0),
    categories: Object.fromEntries(
      Array.from(categories.entries()).map(([name, data]) => [
        name, 
        {
          subcategories: data.subcategories.map(sub => sub.name),
          providers: Array.from(data.providers),
          count: data.subcategories.length
        }
      ])
    )
  };
  
  fs.writeFileSync('./product-categories-structure.json', JSON.stringify(structuredData, null, 2));
  
  console.log(`\nSummary: ${categories.size} main categories with ${structuredData.totalSubcategories} subcategories ready for import`);
  console.log('Main categories:', Array.from(categories.keys()).join(', '));
  
} catch (error) {
  console.error('Error integrating product categories:', error.message);
}