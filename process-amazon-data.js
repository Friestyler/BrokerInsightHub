import XLSX from 'xlsx';
import fs from 'fs';

try {
  // Read the Excel file
  const workbook = XLSX.readFile('./attached_assets/Input NN-Demo_1751802064647.xlsx');
  
  // Check all sheet names
  console.log('Available sheets:', workbook.SheetNames);
  
  // Look for Amazon sheet (might be named differently)
  const amazonSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('amazon') || 
    name.toLowerCase().includes('amzn') ||
    name === 'Amazon'
  );
  
  if (amazonSheetName) {
    console.log(`Found Amazon sheet: ${amazonSheetName}`);
    
    // Get the Amazon sheet
    const amazonSheet = workbook.Sheets[amazonSheetName];
    
    // Convert to JSON
    const amazonData = XLSX.utils.sheet_to_json(amazonSheet, { header: 1 });
    
    console.log('Amazon sheet data:');
    console.log('Headers:', amazonData[0]);
    console.log('First few rows:');
    amazonData.slice(0, 10).forEach((row, index) => {
      console.log(`Row ${index}:`, row);
    });
    
    // Also save as JSON for easier processing
    fs.writeFileSync('./amazon-data.json', JSON.stringify(amazonData, null, 2));
    console.log('Amazon data saved to amazon-data.json');
    
  } else {
    console.log('No Amazon sheet found. Available sheets:', workbook.SheetNames);
    
    // Show first sheet as fallback
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const firstSheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    console.log('First sheet data preview:');
    console.log('Headers:', firstSheetData[0]);
    firstSheetData.slice(0, 5).forEach((row, index) => {
      console.log(`Row ${index}:`, row);
    });
  }
  
} catch (error) {
  console.error('Error processing Excel file:', error);
}