import XLSX from 'xlsx';

// Read and process the Excel file
const workbook = XLSX.readFile('./attached_assets/Baloise opportunties _1750673401363.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const headers = data[0];
const opportunities = [];
const customers = new Set();
const partners = new Set();

function generateProbabilityFromTitle(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('einde termijn')) return 75; // High probability for renewals
  if (titleLower.includes('langetermijn sparen')) return 50; // Medium for cross-sell
  if (titleLower.includes('cyberverzekering')) return 60; // Good for cyber upsell
  
  return 50; // Default
}

function getStageFromProbability(probability) {
  if (probability >= 75) return 'Negotiation';
  if (probability >= 60) return 'Proposal Sent';
  if (probability >= 50) return 'Qualified Lead';
  return 'Initial Contact';
}

function getInsuranceType(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('einde termijn')) return 'Life Insurance';
  if (titleLower.includes('langetermijn sparen')) return 'Savings Insurance';
  if (titleLower.includes('cyberverzekering')) return 'Cyber Insurance';
  
  return 'General Insurance';
}

// Process each row
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const record = {};
  headers.forEach((header, index) => {
    if (header && row[index] !== undefined) {
      record[header] = row[index];
    }
  });
  
  if (!record.title) continue;
  
  const probability = generateProbabilityFromTitle(record.title);
  const stage = getStageFromProbability(probability);
  const insuranceType = getInsuranceType(record.title);
  const weightedValue = (record.estimated_value || 0) * probability / 100;
  
  opportunities.push({
    title: record.title.trim(),
    customer_name: record.customer_name ? record.customer_name.trim() : null,
    partner_name: record.partner_name ? record.partner_name.trim() : null,
    account_manager_name: record.account_manager_name ? record.account_manager_name.trim() : null,
    estimated_value: record.estimated_value || 0,
    probability: probability,
    stage: stage,
    insurance_type: insuranceType,
    weighted_value: weightedValue
  });
  
  if (record.customer_name) {
    customers.add(record.customer_name.trim());
  }
  
  if (record.partner_name) {
    partners.add(record.partner_name.trim());
  }
}

// Generate SQL statements
console.log('-- Creating customers');
for (const customer of customers) {
  console.log(`INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('${customer.replace(/'/g, "''")}', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;`);
}

console.log('\n-- Creating partners');
for (const partner of partners) {
  console.log(`INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('${partner.replace(/'/g, "''")}', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;`);
}

console.log('\n-- Creating opportunities with relationships');
for (const opp of opportunities) {
  const customerClause = opp.customer_name ? 
    `(SELECT id FROM baloise.customers WHERE name = '${opp.customer_name.replace(/'/g, "''")}' LIMIT 1)` : 
    'NULL';
  
  const partnerClause = opp.partner_name ? 
    `(SELECT id FROM baloise.partners WHERE name = '${opp.partner_name.replace(/'/g, "''")}' LIMIT 1)` : 
    'NULL';
  
  console.log(`INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  '${opp.title.replace(/'/g, "''")}',
  ${customerClause},
  ${partnerClause},
  '${opp.stage}',
  ${opp.probability},
  ${opp.estimated_value},
  ${opp.weighted_value},
  '${opp.insurance_type}',
  NOW(),
  NOW(),
  'baloise'
);`);
}

console.log(`\n-- Summary: ${opportunities.length} opportunities, ${customers.size} customers, ${partners.size} partners`);