import fs from 'fs';

console.log('Analyzing Deutsche Telekom/T-Systems products...');

// Read the processed data
const data = JSON.parse(fs.readFileSync('okr-sheet-Sheet1.json', 'utf8'));

// Skip header row
const products = data.slice(1).filter(row => row.length >= 2 && row[0] && row[1]);

console.log(`Total products found: ${products.length}`);

// Analyze product categories based on names
const categoryMapping = {
  'Connectivity & Network': [],
  'Cloud & Hosting': [],
  'Security': [],
  'Unified Communications': [],
  'IoT & M2M': [],
  'Digital & Application': [],
  'Analytics & AI': [],
  'Managed Services': [],
  'Industry Solutions': [],
  'Digital Workplace': [],
  'Payment & FinTech': []
};

// Categorize products based on keywords in names
products.forEach(([productName, provider]) => {
  const name = productName.toLowerCase();
  
  if (name.includes('mobile') || name.includes('network') || name.includes('ethernet') || 
      name.includes('fiber') || name.includes('wan') || name.includes('vpn') || 
      name.includes('connectivity') || name.includes('roaming')) {
    categoryMapping['Connectivity & Network'].push({ name: productName, provider });
  }
  else if (name.includes('cloud') || name.includes('hosting') || name.includes('backup') || 
           name.includes('storage') || name.includes('datacenter') || name.includes('colocation')) {
    categoryMapping['Cloud & Hosting'].push({ name: productName, provider });
  }
  else if (name.includes('security') || name.includes('secure') || name.includes('firewall') || 
           name.includes('protection') || name.includes('ddos') || name.includes('endpoint') ||
           name.includes('identity') || name.includes('access')) {
    categoryMapping['Security'].push({ name: productName, provider });
  }
  else if (name.includes('communication') || name.includes('voip') || name.includes('sip') || 
           name.includes('pbx') || name.includes('contact center') || name.includes('collaboration') ||
           name.includes('teams') || name.includes('voice')) {
    categoryMapping['Unified Communications'].push({ name: productName, provider });
  }
  else if (name.includes('iot') || name.includes('m2m') || name.includes('device management') || 
           name.includes('industry 4.0') || name.includes('smart') || name.includes('sensor')) {
    categoryMapping['IoT & M2M'].push({ name: productName, provider });
  }
  else if (name.includes('application') || name.includes('development') || name.includes('devops') || 
           name.includes('api') || name.includes('integration') || name.includes('digital experience')) {
    categoryMapping['Digital & Application'].push({ name: productName, provider });
  }
  else if (name.includes('analytics') || name.includes('ai') || name.includes('machine learning') || 
           name.includes('big data') || name.includes('streaming') || name.includes('intelligence')) {
    categoryMapping['Analytics & AI'].push({ name: productName, provider });
  }
  else if (name.includes('managed') || name.includes('infrastructure management') || 
           name.includes('support') || name.includes('helpdesk') || name.includes('monitoring')) {
    categoryMapping['Managed Services'].push({ name: productName, provider });
  }
  else if (name.includes('automotive') || name.includes('rail') || name.includes('energy') || 
           name.includes('healthcare') || name.includes('utilities') || name.includes('smart grid')) {
    categoryMapping['Industry Solutions'].push({ name: productName, provider });
  }
  else if (name.includes('workplace') || name.includes('desktop') || name.includes('vdi') || 
           name.includes('device as a service') || name.includes('mobile device')) {
    categoryMapping['Digital Workplace'].push({ name: productName, provider });
  }
  else if (name.includes('payment') || name.includes('fintech') || name.includes('financial') || 
           name.includes('gateway') || name.includes('authentication') || name.includes('identity verification')) {
    categoryMapping['Payment & FinTech'].push({ name: productName, provider });
  }
});

// Generate summary
console.log('\n=== Product Category Distribution ===');
Object.entries(categoryMapping).forEach(([category, products]) => {
  console.log(`${category}: ${products.length} products`);
});

// Show sample products for each category
console.log('\n=== Sample Products by Category ===');
Object.entries(categoryMapping).forEach(([category, products]) => {
  if (products.length > 0) {
    console.log(`\n${category}:`);
    products.slice(0, 5).forEach(product => {
      console.log(`  - ${product.name} (${product.provider})`);
    });
    if (products.length > 5) {
      console.log(`  ... and ${products.length - 5} more`);
    }
  }
});

// Save categorized products
fs.writeFileSync('dt-products-categorized.json', JSON.stringify(categoryMapping, null, 2));
console.log('\nCategorized products saved to dt-products-categorized.json');

// Generate SQL for product insertion
console.log('\nGenerating SQL for product insertion...');
let sql = '-- Insert Deutsche Telekom/T-Systems products\n';
let productId = 2000; // Start from high ID to avoid conflicts

Object.entries(categoryMapping).forEach(([categoryName, products]) => {
  if (products.length > 0) {
    sql += `\n-- ${categoryName} products\n`;
    products.forEach(product => {
      const safeName = product.name.replace(/'/g, "''");
      const safeProvider = product.provider.replace(/'/g, "''");
      
      sql += `INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (${productId}, '${safeName}', 'Product from ${safeProvider} in ${categoryName} category', '${safeProvider}', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
      productId++;
    });
  }
});

fs.writeFileSync('dt-products-import.sql', sql);
console.log('SQL import script saved to dt-products-import.sql');

console.log('\nAnalysis completed!');