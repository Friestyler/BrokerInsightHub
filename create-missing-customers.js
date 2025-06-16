import XLSX from 'xlsx';
import fs from 'fs';

// Extract all unique customer names from Excel and generate SQL to create missing ones
function createMissingCustomersSQL() {
  try {
    const workbook = XLSX.readFile('attached_assets/Zonnepanelen 2_1750106867427.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const rows = data.slice(1).filter(row => row.length > 0 && row[0]);
    
    const allCustomers = new Set();
    
    rows.forEach(row => {
      const [title, clientName, partnerName] = row;
      if (clientName) allCustomers.add(clientName);
    });
    
    console.log(`Found ${allCustomers.size} unique customers in Excel file`);
    
    let sql = `-- Create all missing customers from Excel file\n\n`;
    
    for (const customer of allCustomers) {
      sql += `INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT '${customer.replace(/'/g, "''")}', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = '${customer.replace(/'/g, "''")}');\n\n`;
    }
    
    fs.writeFileSync('missing-customers.sql', sql);
    console.log('Generated SQL to create all missing customers');
    
    return Array.from(allCustomers);
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

const customers = createMissingCustomersSQL();
console.log('All customers from Excel:', customers.slice(0, 10), customers.length > 10 ? `... and ${customers.length - 10} more` : '');