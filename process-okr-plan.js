import xlsx from 'xlsx';
import fs from 'fs';

try {
  // Read the OKR Plan Excel file
  const workbook = xlsx.readFile('./attached_assets/OKR Plan _1753887531513.xlsx');
  
  console.log('OKR Plan Excel file structure:');
  console.log('Available sheets:', workbook.SheetNames);
  
  // Process each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== Sheet ${index + 1}: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Headers:', data[0]);
    console.log('Total rows:', data.length);
    
    // Show first few data rows
    console.log('First few data rows:');
    for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
      console.log(`Row ${i}:`, data[i]);
    }
    
    // Save sheet data
    fs.writeFileSync(`./okr-sheet-${index + 1}-${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.json`, 
                    JSON.stringify(data, null, 2));
  });
  
  console.log('\nOKR sheet data files saved for analysis');
  
} catch (error) {
  console.error('Error processing OKR Plan Excel file:', error.message);
}