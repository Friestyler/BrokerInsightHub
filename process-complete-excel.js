import XLSX from 'xlsx';
import fs from 'fs';

// Read and process the Excel file to generate SQL
function processExcelToSQL() {
  try {
    const workbook = XLSX.readFile('attached_assets/Zonnepanelen 2_1750106867427.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const rows = data.slice(1).filter(row => row.length > 0 && row[0]);
    
    console.log(`Processing ${rows.length} rows from Excel file...`);
    
    // Collect unique entities
    const uniqueCustomers = new Set();
    const uniquePartners = new Set();
    const uniqueAccountManagers = new Set();
    const opportunities = [];
    
    rows.forEach((row, index) => {
      const [title, clientName, partnerName, startDate, accountManagerName, insuranceDescription] = row;
      
      if (clientName) uniqueCustomers.add(clientName);
      if (partnerName) uniquePartners.add(partnerName);
      if (accountManagerName) uniqueAccountManagers.add(accountManagerName);
      
      // Convert Excel date number to SQL date
      let sqlDate = null;
      if (startDate && typeof startDate === 'number') {
        const jsDate = new Date((startDate - 25569) * 86400 * 1000);
        sqlDate = jsDate.toISOString().split('T')[0];
      }
      
      opportunities.push({
        title: title || 'Zonnepanelen',
        clientName,
        partnerName,
        startDate: sqlDate,
        accountManagerName,
        insuranceDescription
      });
    });
    
    // Generate SQL file
    let sql = `-- Import data from Excel file\n-- Processing ${rows.length} opportunities\n\n`;
    
    // Create account manager users
    sql += `-- Create account manager users\n`;
    for (const manager of uniqueAccountManagers) {
      const username = manager.toLowerCase().replace(/\s+/g, '.');
      const email = `${username}@degoudse.nl`;
      sql += `INSERT INTO degoudse.users (username, name, email, created_at, updated_at) VALUES ('${username}', '${manager.replace(/'/g, "''")}', '${email}', NOW(), NOW()) ON CONFLICT (username) DO NOTHING;\n`;
    }
    
    // Create customers
    sql += `\n-- Create customer entities\n`;
    for (const customer of uniqueCustomers) {
      sql += `INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('${customer.replace(/'/g, "''")}', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;\n`;
    }
    
    // Create partners
    sql += `\n-- Create partner entities\n`;
    for (const partner of uniquePartners) {
      sql += `INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('${partner.replace(/'/g, "''")}', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;\n`;
    }
    
    // Create opportunities
    sql += `\n-- Create opportunities with relationships\n`;
    opportunities.forEach((opp, index) => {
      const accountManagerUsername = opp.accountManagerName ? opp.accountManagerName.toLowerCase().replace(/\s+/g, '.') : null;
      
      sql += `INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  '${opp.title.replace(/'/g, "''")}',
  c.id,
  p.id,
  ${accountManagerUsername ? `u.id` : 'NULL'},
  ${opp.insuranceDescription ? `'${opp.insuranceDescription.replace(/'/g, "''")}'` : 'NULL'},
  ${opp.startDate ? `'${opp.startDate}'` : 'NULL'},
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
${accountManagerUsername ? 'CROSS JOIN degoudse.users u' : ''}
WHERE c.name = '${opp.clientName.replace(/'/g, "''")}'
  AND p.name = '${opp.partnerName.replace(/'/g, "''")}'
  ${accountManagerUsername ? `AND u.username = '${accountManagerUsername}'` : ''};\n\n`;
    });
    
    // Write SQL file
    fs.writeFileSync('import-opportunities.sql', sql);
    
    console.log(`Generated SQL script with:`);
    console.log(`- ${uniqueAccountManagers.size} account managers`);
    console.log(`- ${uniqueCustomers.size} customers`);  
    console.log(`- ${uniquePartners.size} partners`);
    console.log(`- ${opportunities.length} opportunities`);
    console.log(`\nSQL script saved as import-opportunities.sql`);
    
    return {
      accountManagers: Array.from(uniqueAccountManagers),
      customers: Array.from(uniqueCustomers),
      partners: Array.from(uniquePartners),
      opportunityCount: opportunities.length
    };
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return null;
  }
}

const result = processExcelToSQL();
if (result) {
  console.log('\nEntity Summary:');
  console.log('Account Managers:', result.accountManagers);
  console.log('Customers:', result.customers.slice(0, 10), result.customers.length > 10 ? `... and ${result.customers.length - 10} more` : '');
  console.log('Partners:', result.partners);
}