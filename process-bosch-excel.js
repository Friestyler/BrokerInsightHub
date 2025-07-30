import xlsx from 'xlsx';
import fs from 'fs';

try {
  // Read the Excel file
  const workbook = xlsx.readFile('./attached_assets/Bosch Customer - Closed opportunities and installed technology_1753882879890.xlsx');
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Excel file structure:');
  console.log('Headers (Row 1):', data[0]);
  console.log('\nFirst few data rows:');
  for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
    console.log(`Row ${i}:`, data[i]);
  }
  
  console.log(`\nTotal rows: ${data.length}`);
  console.log('Column count:', data[0]?.length || 0);
  
  // Save raw data for further processing
  fs.writeFileSync('./bosch-raw-data.json', JSON.stringify(data, null, 2));
  console.log('\nRaw data saved to bosch-raw-data.json');
  
} catch (error) {
  console.error('Error processing Excel file:', error.message);
}