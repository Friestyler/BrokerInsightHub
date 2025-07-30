import fs from 'fs';

console.log('Enhancing Portfolio Analytics with Deutsche Telekom products...');

// Create opportunities that connect customers to products for cross-sell analysis
const opportunities = [
  // Adidas (id: 443) - Technology modernization opportunities
  { customerId: 443, productId: 2008, title: 'Open Telekom Cloud Migration', value: 850000, probability: 75, category: 'Cloud & Hosting' },
  { customerId: 443, productId: 2002, title: 'SD-WAN Infrastructure Upgrade', value: 420000, probability: 60, category: 'Connectivity & Network' },
  { customerId: 443, productId: 2013, title: 'MagentaSecurity Endpoint Protection', value: 180000, probability: 85, category: 'Security' },
  
  // Lufthansa (id: 444) - Aviation industry solutions
  { customerId: 444, productId: 2021, title: 'Smart Cities Platform for Airports', value: 1200000, probability: 70, category: 'IoT & M2M' },
  { customerId: 444, productId: 2035, title: 'Edge Computing for Real-time Operations', value: 950000, probability: 65, category: 'Cloud & Hosting' },
  { customerId: 444, productId: 2025, title: 'Big Data Analytics for Customer Insights', value: 650000, probability: 80, category: 'Analytics & AI' },
  
  // Siemens AG (id: 459) - Industrial automation
  { customerId: 459, productId: 2019, title: 'Industry 4.0 Suite Implementation', value: 1500000, probability: 90, category: 'IoT & M2M' },
  { customerId: 459, productId: 2038, title: 'AI Factory Development Platform', value: 800000, probability: 75, category: 'Analytics & AI' },
  { customerId: 459, productId: 2026, title: 'Infrastructure Management Services', value: 450000, probability: 85, category: 'Managed Services' },
  
  // BMW Group (id: 458) - Automotive solutions
  { customerId: 458, productId: 2020, title: 'Smart Mobility Solutions', value: 2100000, probability: 85, category: 'Industry Solutions' },
  { customerId: 458, productId: 2033, title: '5G Enterprise Private Network', value: 1100000, probability: 70, category: 'Connectivity & Network' },
  { customerId: 458, productId: 2037, title: 'Quantum Communication Security', value: 600000, probability: 60, category: 'Security' },
  
  // Deutsche Bank (id: 448) - Financial services
  { customerId: 448, productId: 2028, title: 'Payment Gateway Integration', value: 750000, probability: 80, category: 'Payment & FinTech' },
  { customerId: 448, productId: 2034, title: 'Cybersecurity Operations Center', value: 900000, probability: 85, category: 'Security' },
  { customerId: 448, productId: 2010, title: 'Private Cloud Infrastructure', value: 1300000, probability: 75, category: 'Cloud & Hosting' },
  
  // SAP (id: 446) - Enterprise software
  { customerId: 446, productId: 2023, title: 'API Management Platform', value: 550000, probability: 90, category: 'Digital & Application' },
  { customerId: 446, productId: 2024, title: 'Real-time Data Streaming', value: 680000, probability: 85, category: 'Analytics & AI' },
  { customerId: 446, productId: 2032, title: 'Digital Workspace Solutions', value: 420000, probability: 70, category: 'Digital Workplace' },
  
  // BASF (id: 453) - Chemical industry
  { customerId: 453, productId: 2027, title: 'Energy Solutions Implementation', value: 1400000, probability: 80, category: 'Industry Solutions' },
  { customerId: 453, productId: 2039, title: 'Smart Building Solutions', value: 650000, probability: 75, category: 'IoT & M2M' },
  { customerId: 453, productId: 2017, title: 'IoT Platform for Manufacturing', value: 800000, probability: 85, category: 'IoT & M2M' }
];

// Generate SQL for opportunity insertion
let sql = '-- Insert Deutsche Telekom product opportunities\n';
opportunities.forEach((opp, index) => {
  const opportunityId = 1600 + index; // Start from high ID
  sql += `INSERT INTO degoudse.opportunities (id, title, description, "estimatedValue", probability, "clientId", "createdAt", "updatedAt") VALUES (${opportunityId}, '${opp.title}', 'Strategic ${opp.category} opportunity for Deutsche Telekom/T-Systems products', ${opp.value}, ${opp.probability}, ${opp.customerId}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
});

fs.writeFileSync('dt-opportunities-import.sql', sql);

// Create white space analysis data
const whiteSpaceMatrix = {
  categories: [
    'Connectivity & Network',
    'Cloud & Hosting', 
    'Security',
    'Unified Communications',
    'IoT & M2M',
    'Digital & Application',
    'Analytics & AI',
    'Managed Services',
    'Industry Solutions',
    'Digital Workplace',
    'Payment & FinTech'
  ],
  customerSegments: [
    'Large Enterprise (€10B+ revenue)',
    'Enterprise (€1B-10B revenue)', 
    'Mid-Market (€100M-1B revenue)',
    'SMB (€10M-100M revenue)'
  ],
  crossSellPotential: {
    'Large Enterprise': {
      'Connectivity & Network': { potential: 85, customers: 5, avgValue: 950000 },
      'Cloud & Hosting': { potential: 90, customers: 6, avgValue: 1200000 },
      'Security': { potential: 95, customers: 7, avgValue: 850000 },
      'IoT & M2M': { potential: 80, customers: 4, avgValue: 1100000 },
      'Analytics & AI': { potential: 85, customers: 5, avgValue: 750000 }
    },
    'Enterprise': {
      'Connectivity & Network': { potential: 75, customers: 8, avgValue: 650000 },
      'Cloud & Hosting': { potential: 80, customers: 9, avgValue: 800000 },
      'Security': { potential: 85, customers: 10, avgValue: 550000 },
      'Digital & Application': { potential: 70, customers: 6, avgValue: 480000 }
    }
  }
};

fs.writeFileSync('dt-whitespace-analysis.json', JSON.stringify(whiteSpaceMatrix, null, 2));

console.log(`Generated ${opportunities.length} strategic opportunities`);
console.log('Created white space analysis matrix for Deutsche Telekom products');
console.log('Portfolio analytics enhancement completed!');