import xlsx from 'xlsx';
import fs from 'fs';

try {
  // Read the product categories Excel file
  const workbook = xlsx.readFile('./attached_assets/OKR Plan  (1)_1753888398927.xlsx');
  
  console.log('Product Categories Excel file structure:');
  console.log('Available sheets:', workbook.SheetNames);
  
  // Process each sheet to find categories data
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== Sheet ${index + 1}: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Headers:', data[0]);
    console.log('Total rows:', data.length);
    
    // Show first few data rows
    console.log('First few data rows:');
    for (let i = 1; i <= Math.min(10, data.length - 1); i++) {
      if (data[i] && data[i].length > 0) {
        console.log(`Row ${i}:`, data[i]);
      }
    }
    
    // Save sheet data for analysis
    fs.writeFileSync(`./categories-sheet-${index + 1}-${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.json`, 
                    JSON.stringify(data, null, 2));
  });
  
  console.log('\nProduct categories sheet data files saved for analysis');
  
} catch (error) {
  console.error('Error processing product categories Excel file:', error.message);
}