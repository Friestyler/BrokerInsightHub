import fs from 'fs';

// Create professional SVG logos for all 17 partners
function createPartnerLogos() {
  const partners = [
    { id: 1, name: 'ABC Insurance Brokers', type: 'Broker', color: '#1e40af', secondaryColor: '#3b82f6' },
    { id: 6, name: 'Aon (v.h.Meeus)', type: 'Broker', color: '#dc2626', secondaryColor: '#ef4444' },
    { id: 7, name: 'Cooperatieve Rabobank U.A.', type: 'Bank', color: '#0066cc', secondaryColor: '#3399ff' },
    { id: 8, name: 'HDB Risicobeheer BV', type: 'Consultant', color: '#059669', secondaryColor: '#10b981' },
    { id: 5, name: 'Independent Insurance Advisors', type: 'Advisor', color: '#7c3aed', secondaryColor: '#8b5cf6' },
    { id: 9, name: 'Klap B.V.', type: 'Broker', color: '#ea580c', secondaryColor: '#fb923c' },
    { id: 10, name: 'Leenders & Gielen Assurantien', type: 'Broker', color: '#0891b2', secondaryColor: '#06b6d4' },
    { id: 11, name: 'Meijers Assurantien', type: 'Broker', color: '#be123c', secondaryColor: '#e11d48' },
    { id: 12, name: 'Mevas BV', type: 'Broker', color: '#7c2d12', secondaryColor: '#a16207' },
    { id: 3, name: 'Premium Risk Management', type: 'Consultant', color: '#374151', secondaryColor: '#6b7280' },
    { id: 2, name: 'Quick Insurance Solutions', type: 'Agency', color: '#16a34a', secondaryColor: '#22c55e' },
    { id: 4, name: 'Regional Insurance Partners', type: 'Group', color: '#9333ea', secondaryColor: '#a855f7' },
    { id: 13, name: 'Schouten Zekerheid Mak in Ass BV', type: 'Broker', color: '#0d9488', secondaryColor: '#14b8a6' },
    { id: 14, name: 'TOPHOLD International B.V.', type: 'Group', color: '#1f2937', secondaryColor: '#4b5563' },
    { id: 15, name: 'Van den Berk Assurantien B.V.', type: 'Broker', color: '#b91c1c', secondaryColor: '#dc2626' },
    { id: 16, name: 'Wonen & Welzijn Assurantien BV', type: 'Broker', color: '#0369a1', secondaryColor: '#0284c7' },
    { id: 17, name: 'Zicht B.V.', type: 'Broker', color: '#9333ea', secondaryColor: '#a855f7' }
  ];

  const logos = [];

  for (const partner of partners) {
    const svg = createSVGLogo(partner.name, partner.color, partner.secondaryColor, partner.type);
    const filename = `partner_${partner.id}_logo.svg`;
    
    fs.writeFileSync(filename, svg);
    console.log(`Created logo for ${partner.name}: ${filename}`);
    
    logos.push({
      id: partner.id,
      name: partner.name,
      filename: filename,
      svg: svg
    });
  }

  // Generate SQL to insert logos
  let sql = '-- Insert partner logos\n';
  for (const logo of logos) {
    sql += `INSERT INTO degoudse.entity_logos (entity_type, entity_id, logo_data, created_at, updated_at) 
VALUES ('partner', ${logo.id}, '${logo.svg.replace(/'/g, "''")}', NOW(), NOW())
ON CONFLICT (entity_type, entity_id) 
DO UPDATE SET logo_data = EXCLUDED.logo_data, updated_at = NOW();\n\n`;
  }
  
  fs.writeFileSync('partner-logos.sql', sql);
  console.log('Generated SQL file for partner logos');
  
  return logos.length;
}

function createSVGLogo(companyName, primaryColor, secondaryColor, businessType) {
  const initials = getInitials(companyName);
  const iconType = getIconForBusinessType(businessType);
  
  return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient-${companyName.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="60" cy="60" r="55" fill="url(#gradient-${companyName.replace(/[^a-zA-Z0-9]/g, '')})" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Business type icon -->
  ${iconType}
  
  <!-- Company initials -->
  <text x="60" y="75" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    ${initials}
  </text>
  
  <!-- Subtle border highlight -->
  <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
</svg>`;
}

function getInitials(name) {
  // Extract meaningful initials from company name
  const words = name.split(/[\s\.\(\)&-]+/).filter(word => 
    word.length > 1 && 
    !['BV', 'B.V.', 'UA', 'U.A.', 'van', 'der', 'de', 'en', 'in', 'v.h.'].includes(word)
  );
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getIconForBusinessType(type) {
  switch (type) {
    case 'Bank':
      return `<path d="M35 35 L85 35 L85 45 L75 45 L75 75 L70 75 L70 45 L65 45 L65 75 L60 75 L60 45 L55 45 L55 75 L50 75 L50 45 L45 45 L45 75 L40 75 L40 45 L35 45 Z M30 30 L90 30 L85 25 L35 25 Z" fill="rgba(255,255,255,0.4)"/>`;
    
    case 'Consultant':
      return `<circle cx="45" cy="40" r="8" fill="rgba(255,255,255,0.4)"/>
              <path d="M30 75 Q30 60 45 60 Q60 60 60 75 L30 75 Z" fill="rgba(255,255,255,0.4)"/>
              <rect x="65" y="35" width="20" height="3" fill="rgba(255,255,255,0.4)"/>
              <rect x="65" y="42" width="20" height="3" fill="rgba(255,255,255,0.4)"/>
              <rect x="65" y="49" width="15" height="3" fill="rgba(255,255,255,0.4)"/>`;
    
    case 'Group':
      return `<rect x="35" y="35" width="15" height="15" fill="rgba(255,255,255,0.4)"/>
              <rect x="55" y="35" width="15" height="15" fill="rgba(255,255,255,0.4)"/>
              <rect x="75" y="35" width="10" height="15" fill="rgba(255,255,255,0.4)"/>
              <rect x="35" y="55" width="15" height="10" fill="rgba(255,255,255,0.4)"/>
              <rect x="55" y="55" width="15" height="10" fill="rgba(255,255,255,0.4)"/>`;
    
    case 'Agency':
      return `<path d="M40 30 L50 40 L80 40 L80 70 L40 70 Z" fill="rgba(255,255,255,0.4)"/>
              <circle cx="70" cy="50" r="8" fill="${primaryColor}"/>
              <rect x="45" y="45" width="15" height="2" fill="white"/>
              <rect x="45" y="50" width="12" height="2" fill="white"/>
              <rect x="45" y="55" width="18" height="2" fill="white"/>`;
    
    case 'Advisor':
      return `<path d="M60 25 L70 40 L50 40 Z" fill="rgba(255,255,255,0.4)"/>
              <circle cx="60" cy="50" r="12" fill="rgba(255,255,255,0.2)"/>
              <path d="M45 65 Q60 55 75 65" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none"/>`;
    
    default: // Broker
      return `<rect x="40" y="30" width="40" height="25" fill="rgba(255,255,255,0.4)"/>
              <rect x="45" y="35" width="8" height="8" fill="white"/>
              <rect x="57" y="35" width="8" height="8" fill="white"/>
              <rect x="69" y="35" width="8" height="8" fill="white"/>
              <rect x="45" y="47" width="8" height="8" fill="white"/>
              <rect x="57" y="47" width="8" height="8" fill="white"/>
              <path d="M40 60 L80 60 L85 70 L35 70 Z" fill="rgba(255,255,255,0.3)"/>`;
  }
}

const logoCount = createPartnerLogos();
console.log(`Generated ${logoCount} partner logos`);