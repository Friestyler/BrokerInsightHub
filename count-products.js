import fs from 'fs';

// Read the JSON file properly
const data = JSON.parse(fs.readFileSync('okr-sheet-Sheet1.json', 'utf8'));

// Filter out empty arrays and header
const actualProducts = data.filter((row, index) => {
  // Skip header row and empty rows
  if (index === 0 || !row || row.length < 2) return false;
  if (!row[0] || !row[1]) return false;
  if (row[0] === 'Product Name') return false;
  return true;
});

console.log('Total actual products:', actualProducts.length);
console.log('\nFirst 10 products:');
actualProducts.slice(0, 10).forEach((row, i) => {
  console.log(`${i + 1}: ${row[0]} | ${row[1]}`);
});

console.log('\nLast 10 products:');
actualProducts.slice(-10).forEach((row, i) => {
  console.log(`${actualProducts.length - 9 + i}: ${row[0]} | ${row[1]}`);
});

console.log(`\nProducts 40-50:`);
actualProducts.slice(39, 50).forEach((row, i) => {
  console.log(`${40 + i}: ${row[0]} | ${row[1]}`);
});