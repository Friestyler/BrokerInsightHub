import XLSX from 'xlsx';
import fs from 'fs';

// Process Excel and generate SQL for all 103 opportunities
function generateCompleteSQL() {
  try {
    const workbook = XLSX.readFile('attached_assets/Zonnepanelen 2_1750106867427.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const rows = data.slice(1).filter(row => row.length > 0 && row[0]);
    
    console.log(`Processing all ${rows.length} opportunities from Excel file...`);
    
    let sql = `-- Create all remaining ${rows.length - 5} opportunities from Excel file\n\n`;
    
    // Process all remaining rows (skip the 5 we already created)
    for (let i = 5; i < rows.length; i++) {
      const row = rows[i];
      const [title, clientName, partnerName, startDate, accountManagerName, insuranceDescription] = row;
      
      // Convert Excel date number to SQL date
      let sqlDate = null;
      if (startDate && typeof startDate === 'number') {
        const jsDate = new Date((startDate - 25569) * 86400 * 1000);
        sqlDate = jsDate.toISOString().split('T')[0];
      }
      
      const accountManagerTable = accountManagerName === 'Alex Salden' ? 'Alex Salden' : 'Albrecht Bouwman';
      
      sql += `INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  '${title.replace(/'/g, "''")}',
  (SELECT id FROM degoudse.customers WHERE name = '${clientName.replace(/'/g, "''")}' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = '${partnerName.replace(/'/g, "''")}' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = '${accountManagerTable}'),
  ${insuranceDescription ? `'${insuranceDescription.replace(/'/g, "''")}'` : 'NULL'},
  ${sqlDate ? `'${sqlDate}'` : 'NULL'},
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);\n\n`;
    }
    
    fs.writeFileSync('complete-opportunities.sql', sql);
    console.log(`Generated SQL for ${rows.length - 5} additional opportunities`);
    
    return rows.length;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
}

const total = generateCompleteSQL();
console.log(`Total opportunities to create: ${total - 5} (5 already created)`);