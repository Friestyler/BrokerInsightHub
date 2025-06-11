// Script to generate and insert logos for partners and customers
import fs from 'fs';

// Function to create SVG logo and convert to base64
function createSVGLogo(companyName, primaryColor, secondaryColor, logoType = 'text') {
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  let svgContent = '';
  
  if (logoType === 'shield') {
    // Insurance/security themed logo
    svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M50 10 L20 25 L20 55 Q20 75 50 90 Q80 75 80 55 L80 25 Z" fill="url(#grad1)" stroke="#fff" stroke-width="2"/>
        <text x="50" y="60" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>`;
  } else if (logoType === 'circle') {
    // Modern circular logo
    svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#grad2)" stroke="#fff" stroke-width="3"/>
        <text x="50" y="60" font-family="Arial, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>`;
  } else if (logoType === 'house') {
    // Real estate/property themed logo
    svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M50 15 L25 35 L25 80 L75 80 L75 35 Z" fill="url(#grad3)" stroke="#fff" stroke-width="2"/>
        <rect x="40" y="50" width="20" height="30" fill="white" opacity="0.3"/>
        <text x="50" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>`;
  } else if (logoType === 'gear') {
    // Technical/manufacturing logo
    svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M50,20 L60,30 L70,25 L75,35 L85,40 L80,50 L85,60 L75,65 L70,75 L60,70 L50,80 L40,70 L30,75 L25,65 L15,60 L20,50 L15,40 L25,35 L30,25 L40,30 Z" fill="url(#grad4)" stroke="#fff" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="white" opacity="0.9"/>
        <text x="50" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="${primaryColor}">${initials}</text>
      </svg>`;
  } else {
    // Default rectangular logo
    svgContent = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="15" y="25" width="70" height="50" rx="8" fill="url(#grad5)" stroke="#fff" stroke-width="2"/>
        <text x="50" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>`;
  }

  // Convert SVG to base64
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Define company logos to create
const partnerLogos = [
  { id: 1, name: "ABC Insurance Brokers", type: "shield", colors: ["#2563eb", "#1d4ed8"] },
  { id: 2, name: "Quick Insurance Solutions", type: "circle", colors: ["#dc2626", "#b91c1c"] },
  { id: 3, name: "Premium Risk Management", type: "shield", colors: ["#059669", "#047857"] },
  { id: 4, name: "Regional Insurance Partners", type: "circle", colors: ["#7c3aed", "#6d28d9"] }
  // Skipping ID 5 to have 4 out of 5 (90%)
];

const customerLogos = [
  { id: 1, name: "RGO Makelaars B.V.", type: "house", colors: ["#ea580c", "#c2410c"] },
  { id: 2, name: "Tex-Mex Streetfood", type: "circle", colors: ["#ca8a04", "#a16207"] },
  { id: 3, name: "Vishandel sperling", type: "circle", colors: ["#0891b2", "#0e7490"] },
  { id: 4, name: "TOPHOLD International B.V.", type: "rect", colors: ["#4338ca", "#3730a3"] },
  { id: 5, name: "Cronofy B.V.", type: "gear", colors: ["#c2410c", "#9a3412"] },
  { id: 7, name: "Thema Timmerwerken", type: "gear", colors: ["#059669", "#047857"] },
  { id: 8, name: "Tibben Tapijt en", type: "rect", colors: ["#7c2d12", "#651a0b"] }
  // Skipping ID 9 to have 7 out of 8 (87.5%, close to 90%)
];

// Generate SQL insert statements
const logoInserts = [];

partnerLogos.forEach(partner => {
  const logoData = createSVGLogo(partner.name, partner.colors[0], partner.colors[1], partner.type);
  logoInserts.push(`
INSERT INTO entity_logos (entity_type, entity_id, environment_id, logo_data, mime_type, original_filename, file_size, uploaded_by) 
VALUES ('partner', ${partner.id}, 'degoudse', '${logoData}', 'image/svg+xml', '${partner.name.toLowerCase().replace(/\s+/g, '_')}_logo.svg', ${logoData.length}, 1)
ON CONFLICT (entity_type, entity_id, environment_id) DO UPDATE SET
  logo_data = EXCLUDED.logo_data,
  mime_type = EXCLUDED.mime_type,
  original_filename = EXCLUDED.original_filename,
  file_size = EXCLUDED.file_size,
  updated_at = NOW();`);
});

customerLogos.forEach(customer => {
  const logoData = createSVGLogo(customer.name, customer.colors[0], customer.colors[1], customer.type);
  logoInserts.push(`
INSERT INTO entity_logos (entity_type, entity_id, environment_id, logo_data, mime_type, original_filename, file_size, uploaded_by) 
VALUES ('customer', ${customer.id}, 'degoudse', '${logoData}', 'image/svg+xml', '${customer.name.toLowerCase().replace(/\s+/g, '_')}_logo.svg', ${logoData.length}, 1)
ON CONFLICT (entity_type, entity_id, environment_id) DO UPDATE SET
  logo_data = EXCLUDED.logo_data,
  mime_type = EXCLUDED.mime_type,
  original_filename = EXCLUDED.original_filename,
  file_size = EXCLUDED.file_size,
  updated_at = NOW();`);
});

// Write SQL to file
const sqlContent = logoInserts.join('\n');
fs.writeFileSync('insert_logos.sql', sqlContent);

console.log('Generated logos for:');
console.log(`- ${partnerLogos.length} partners (80% of 5)`);
console.log(`- ${customerLogos.length} customers (87.5% of 8)`);
console.log('SQL file created: insert_logos.sql');