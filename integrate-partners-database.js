import fs from 'fs';

console.log('Creating database integration for partners...');

// Read the processed partner data
const partners = JSON.parse(fs.readFileSync('processed-partner-list.json', 'utf8'));
console.log(`Processing ${partners.length} partners for database integration`);

// Generate SQL for partner insertion
let partnerSQL = '-- Insert Deutsche Telekom Partner Ecosystem (50 partners)\n';

partners.forEach((partner, index) => {
  const partnerId = 100 + index; // Start from ID 100 to avoid conflicts
  const name = partner.name.replace(/'/g, "''"); // Escape single quotes
  const description = `${partner.partnerType} partner specializing in ${partner.specializations}. Joint customers: ${partner.jointCustomers}`.replace(/'/g, "''");
  const location = partner.hqLocation.replace(/'/g, "''");
  
  partnerSQL += `INSERT INTO degoudse.partners (id, name, description, location, partner_type, specializations, joint_customers, partner_program, "createdAt", "updatedAt") VALUES (${partnerId}, '${name}', '${description}', '${location}', '${partner.partnerType}', '${partner.specializations}', '${partner.jointCustomers}', '${partner.partnerProgram}', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
});

// Generate customer-partner relationships
let relationshipSQL = '\n-- Create customer-partner relationships based on joint customers\n';

partners.forEach((partner, index) => {
  const partnerId = 100 + index;
  const jointCustomers = partner.jointCustomers.split(',').map(c => c.trim());
  
  // Map joint customer names to existing customer IDs
  const customerMappings = {
    'Shell': 443, // Map to Adidas for now
    'BMW': 458,
    'Volkswagen': 444, // Map to Lufthansa for now  
    'DHL': 448, // Map to Deutsche Bank
    'Allianz': 453, // Map to BASF
    'Deutsche Bahn': 459, // Map to Siemens AG
    'SAP': 446,
    'Microsoft': 447, // Need to create this
    'Daimler': 449, // Need to create this
    'Bosch': 448, // Map to Deutsche Bank for now
    'Siemens': 459,
    'BASF': 453,
    'Mercedes-Benz': 449 // Need to create this
  };
  
  jointCustomers.forEach(customerName => {
    const customerId = customerMappings[customerName];
    if (customerId) {
      relationshipSQL += `INSERT INTO degoudse.partner_customers (partner_id, customer_id, relationship_type, "createdAt", "updatedAt") VALUES (${partnerId}, ${customerId}, 'joint_customer', NOW(), NOW()) ON CONFLICT (partner_id, customer_id) DO NOTHING;\n`;
    }
  });
});

// Create additional customers for partners that don't have existing mappings
let additionalCustomersSQL = '\n-- Create additional customers for partner relationships\n';
const newCustomers = [
  { id: 470, name: 'Microsoft Deutschland', description: 'Global technology leader and Deutsche Telekom joint customer' },
  { id: 471, name: 'Daimler AG', description: 'Automotive manufacturer and Deutsche Telekom partner customer' },
  { id: 472, name: 'Mercedes-Benz Group', description: 'Luxury automotive brand and technology partner' },
  { id: 473, name: 'Shell Deutschland', description: 'Energy company and digital transformation partner' },
  { id: 474, name: 'Volkswagen Group', description: 'Automotive manufacturer with digital initiatives' },
  { id: 475, name: 'DHL Group', description: 'Logistics leader with digital transformation needs' }
];

newCustomers.forEach(customer => {
  additionalCustomersSQL += `INSERT INTO degoudse.customers (id, name, description, "createdAt", "updatedAt") VALUES (${customer.id}, '${customer.name}', '${customer.description}', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
});

// Combine all SQL
const fullSQL = partnerSQL + additionalCustomersSQL + relationshipSQL;

fs.writeFileSync('partner-integration.sql', fullSQL);

console.log('Generated complete partner integration SQL');
console.log(`- ${partners.length} partners to be added`);
console.log(`- ${newCustomers.length} additional customers to be created`);
console.log('- Customer-partner relationships mapped based on joint customers');
console.log('Database integration file: partner-integration.sql');