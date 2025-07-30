import XLSX from 'xlsx';

async function processDTCustomersFile() {
  try {
    console.log('Reading DT Customers Excel file and generating SQL...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('attached_assets/DT Customers _1753879798720.xlsx');
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length > 0) {
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
      
      console.log(`Found ${rows.length} valid customers. Generating SQL...`);
      
      // Generate customer SQL
      let customerSQL = `-- Insert DT Technology customers\n`;
      let opportunitySQL = `-- Insert opportunities for DT customers\n`;
      let categorySQL = `-- Insert technology categories\n`;
      
      const categories = new Set();
      
      for (let i = 0; i < rows.length; i++) {
        const customer = rows[i];
        const customerName = customer['End Customer'].replace(/'/g, "''"); // Escape quotes
        const partnersInvolved = customer['Partners Involved'] || 0;
        const totalValue = customer['Value (€M)'] || 0;
        const openOpps = customer['Open Opps'] || 0;
        
        // Customer insert
        customerSQL += `INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (\n`;
        customerSQL += `  '${customerName}',\n`;
        customerSQL += `  'DT Technology customer - Partners: ${partnersInvolved}, Total Value: €${totalValue}M, Open Opportunities: ${openOpps}',\n`;
        customerSQL += `  '${customerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase()}',\n`;
        customerSQL += `  NOW(), NOW()\n`;
        customerSQL += `) ON CONFLICT (name) DO NOTHING;\n\n`;
        
        // Process opportunities for each product category
        const productCategories = [
          'SD-WAN (€M)', 'IoT Connectivity (€M)', 'MPLS & IP-VPN (€M)', 'Roaming (€M)',
          'Private Cloud (€M)', 'Backup & DR (€M)', 'Device Mgmt (€M)', 'Analytics (€M)',
          'API Mgmt (€M)', 'Edge Computing (€M)', 'Smart Building (€M)', 'App Mgmt (€M)',
          'VDI (€M)', 'SWG (€M)', 'SOC (€M)'
        ];
        
        for (const category of productCategories) {
          const value = customer[category];
          if (value && !isNaN(value) && parseFloat(value) > 0) {
            const categoryName = category.replace(' (€M)', '').replace(/'/g, "''");
            const oppTitle = `${categoryName} - ${customerName}`.replace(/'/g, "''");
            const oppDesc = `Technology opportunity imported from DT Customers data. Category: ${categoryName}, Value: €${value}M`.replace(/'/g, "''");
            const valueInEuros = parseFloat(value) * 1000000;
            
            opportunitySQL += `INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (\n`;
            opportunitySQL += `  '${oppTitle}',\n`;
            opportunitySQL += `  '${oppDesc}',\n`;
            opportunitySQL += `  (SELECT id FROM degoudse.customers WHERE name = '${customerName}' LIMIT 1),\n`;
            opportunitySQL += `  ${valueInEuros},\n`;
            opportunitySQL += `  0.6,\n`;
            opportunitySQL += `  'open',\n`;
            opportunitySQL += `  NOW(), NOW()\n`;
            opportunitySQL += `);\n\n`;
          }
        }
        
        // Process installed sub-categories
        const installedSubCategories = customer['Installed Sub-Categories'];
        if (installedSubCategories && typeof installedSubCategories === 'string') {
          const cats = installedSubCategories.split(';').map(cat => cat.trim());
          cats.forEach(cat => {
            if (cat) categories.add(cat);
          });
        }
      }
      
      // Generate category SQL
      for (const categoryName of categories) {
        const safeName = categoryName.replace(/'/g, "''");
        categorySQL += `INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (\n`;
        categorySQL += `  '${safeName}',\n`;
        categorySQL += `  'Technology category imported from DT Customers data',\n`;
        categorySQL += `  '#2563eb',\n`;
        categorySQL += `  NOW(), NOW()\n`;
        categorySQL += `) ON CONFLICT (name) DO NOTHING;\n\n`;
      }
      
      // Write SQL to file
      const fullSQL = `-- DT Customers Data Import SQL\n-- Generated from Excel file with ${rows.length} customers\n\n${categorySQL}\n${customerSQL}\n${opportunitySQL}`;
      
      // Write to file
      const fs = await import('fs');
      fs.writeFileSync('dt-customers-import.sql', fullSQL);
      
      console.log('✅ SQL file generated: dt-customers-import.sql');
      console.log(`📊 Summary:`);
      console.log(`- Customers: ${rows.length}`);
      console.log(`- Categories: ${categories.size}`);
      console.log(`- Estimated opportunities: ${rows.reduce((sum, row) => {
        const productCategories = [
          'SD-WAN (€M)', 'IoT Connectivity (€M)', 'MPLS & IP-VPN (€M)', 'Roaming (€M)',
          'Private Cloud (€M)', 'Backup & DR (€M)', 'Device Mgmt (€M)', 'Analytics (€M)',
          'API Mgmt (€M)', 'Edge Computing (€M)', 'Smart Building (€M)', 'App Mgmt (€M)',
          'VDI (€M)', 'SWG (€M)', 'SOC (€M)'
        ];
        return sum + productCategories.filter(cat => row[cat] && parseFloat(row[cat]) > 0).length;
      }, 0)}`);
      
      // Display sample customers
      console.log('\n📝 Sample customers to be imported:');
      rows.slice(0, 5).forEach(customer => {
        console.log(`- ${customer['End Customer']} (€${customer['Value (€M)']}M, ${customer['Open Opps']} opps)`);
      });
      
    }
    
  } catch (error) {
    console.error('Error processing DT Customers file:', error);
  }
}

// Run the processor
processDTCustomersFile().catch(console.error);