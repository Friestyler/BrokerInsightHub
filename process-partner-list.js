import XLSX from 'xlsx';
import fs from 'fs';

console.log('Processing Partner List Excel file...');

try {
  // Read the Excel file
  const workbook = XLSX.readFile('attached_assets/Partner List DEMO_1753889710009.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`Found ${jsonData.length} rows in Excel file`);
  console.log('Sample data:', jsonData.slice(0, 5));
  
  // Save to JSON file for further processing
  fs.writeFileSync('partner-list-raw-data.json', JSON.stringify(jsonData, null, 2));
  
  // Process the data to extract partner information
  const headers = jsonData[0];
  console.log('Headers:', headers);
  
  const partners = [];
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row && row.length > 1 && row[1]) { // Check for partner name in column 1
      const partner = {
        id: row[0] || i, // Partner ID
        name: row[1] || '', // Partner name
        hqLocation: row[2] || '', // HQ location
        partnerType: row[3] || '', // Partner type
        specializations: row[4] || '', // DT specializations
        jointCustomers: row[5] || '', // Joint customers
        partnerProgram: row[6] || '' // Partner program
      };
      partners.push(partner);
    }
  }
  
  console.log(`Processed ${partners.length} partners`);
  console.log('Sample partners:', partners.slice(0, 3));
  
  // Save processed partner data
  fs.writeFileSync('processed-partner-list.json', JSON.stringify(partners, null, 2));
  
  console.log('Partner processing completed successfully');
  
} catch (error) {
  console.error('Error processing Excel file:', error.message);
}