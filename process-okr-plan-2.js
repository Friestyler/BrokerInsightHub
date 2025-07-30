import fs from 'fs';
import XLSX from 'xlsx';

console.log('Processing OKR Plan (2) Excel file...');

// Read the Excel file
const workbook = XLSX.readFile('attached_assets/OKR Plan  (2)_1753889293299.xlsx');
console.log('Available sheets:', workbook.SheetNames);

// Process each sheet
workbook.SheetNames.forEach(sheetName => {
    console.log(`\n=== Processing Sheet: ${sheetName} ===`);
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Rows found: ${jsonData.length}`);
    
    // Show first few rows to understand structure
    console.log('Sample data:');
    jsonData.slice(0, 10).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
    });
    
    // Save sheet data to JSON file for analysis
    const fileName = `okr-sheet-${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));
    console.log(`Saved sheet data to ${fileName}`);
});

console.log('\nOKR Plan (2) processing completed!');