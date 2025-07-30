import fs from 'fs';

try {
  // Read the OKR sheet data
  const sheetData = JSON.parse(fs.readFileSync('./okr-sheet-1-Sheet1.json', 'utf8'));
  
  console.log('Processing OKR Plan data...');
  
  // Skip header row and process OKR data
  const okrData = sheetData.slice(1).filter(row => row.length >= 6 && row[1]); // Must have Key Result
  
  console.log(`Found ${okrData.length} OKR entries to process`);
  
  // Group by objectives and process key results
  const objectives = new Map();
  let currentObjective = null;
  
  okrData.forEach((row, index) => {
    const [objective, keyResult, target, unit, owner, dueDate] = row;
    
    // If there's a new objective, update current objective
    if (objective && objective.trim()) {
      currentObjective = objective.trim();
      if (!objectives.has(currentObjective)) {
        objectives.set(currentObjective, []);
      }
    }
    
    // Add key result to current objective
    if (currentObjective && keyResult && keyResult.trim()) {
      const excelDate = dueDate;
      let jsDate = null;
      let formattedDate = null;
      
      if (excelDate && typeof excelDate === 'number') {
        jsDate = new Date((excelDate - 25569) * 86400 * 1000);
        formattedDate = jsDate.toISOString().split('T')[0];
      }
      
      objectives.get(currentObjective).push({
        keyResult: keyResult.trim(),
        target: target || 0,
        unit: unit || 'units',
        owner: owner || 'Unassigned',
        dueDate: formattedDate,
        objective: currentObjective
      });
    }
  });
  
  console.log('\nObjectives found:');
  objectives.forEach((keyResults, objective) => {
    console.log(`\n${objective}:`);
    console.log(`  - ${keyResults.length} key results`);
    keyResults.slice(0, 2).forEach(kr => {
      console.log(`    * ${kr.keyResult} (Target: ${kr.target} ${kr.unit})`);
    });
  });
  
  // Generate SQL for inserting OKR metrics
  let sql = `-- OKR Plan Integration SQL\n`;
  sql += `-- Generated from Excel file with ${okrData.length} key results across ${objectives.size} objectives\n\n`;
  
  // Convert to flat array for SQL insertion
  const allKeyResults = [];
  objectives.forEach((keyResults, objective) => {
    keyResults.forEach(kr => {
      allKeyResults.push({
        name: kr.keyResult,
        description: `${objective} - ${kr.keyResult}`,
        target_value: parseFloat(kr.target) || 0,
        measure_unit: kr.unit === '€' ? 'currency' : 
                      kr.unit === '%' ? 'percentage' : 
                      kr.unit === '#' ? 'count' : 'units',
        currency_type: kr.unit === '€' ? 'EUR' : null,
        responsible_contact_id: null,
        timeframe: 'quarterly',
        frequency: 'monthly',
        due_date: kr.dueDate,
        is_muted: false,
        is_archived: false,
        is_shared: true,
        hierarchy: 'strategic',
        tags: `{okr_plan,${objective.toLowerCase().replace(/[^a-z0-9]/g,'_')}}`,
        created_by: 1
      });
    });
  });
  
  // Split into batches for manageable SQL inserts
  const batchSize = 20;
  const batches = [];
  for (let i = 0; i < allKeyResults.length; i += batchSize) {
    batches.push(allKeyResults.slice(i, i + batchSize));
  }
  
  sql += `-- Insert OKR Plan metrics (${batches.length} batches of up to ${batchSize} each)\n`;
  
  batches.forEach((batch, batchIndex) => {
    sql += `\n-- Batch ${batchIndex + 1} of ${batches.length}\n`;
    sql += `INSERT INTO degoudse.okr_metrics (name, description, target_value, measure_unit, currency_type, timeframe, frequency, due_date, is_muted, is_archived, is_shared, hierarchy, tags, created_at, updated_at, created_by) VALUES \n`;
    
    const values = batch.map(okr => {
      const name = okr.name.replace(/'/g, "''");
      const description = okr.description.replace(/'/g, "''");
      const dueDate = okr.due_date ? `'${okr.due_date}'` : 'NULL';
      const currencyType = okr.currency_type ? `'${okr.currency_type}'` : 'NULL';
      
      return `('${name}', '${description}', ${okr.target_value}, '${okr.measure_unit}', ${currencyType}, '${okr.timeframe}', '${okr.frequency}', ${dueDate}, ${okr.is_muted}, ${okr.is_archived}, ${okr.is_shared}, '${okr.hierarchy}', '${okr.tags}', NOW(), NOW(), ${okr.created_by})`;
    });
    
    sql += values.join(',\n') + ';\n';
  });
  
  // Save the SQL file
  fs.writeFileSync('./okr-plan-import.sql', sql);
  console.log('\nOKR Plan SQL import file saved as okr-plan-import.sql');
  
  // Save summary data
  fs.writeFileSync('./okr-plan-summary.json', JSON.stringify({
    totalObjectives: objectives.size,
    totalKeyResults: allKeyResults.length,
    objectives: Array.from(objectives.keys()),
    sampleKeyResults: allKeyResults.slice(0, 5),
    units: [...new Set(allKeyResults.map(kr => kr.measure_unit))]
  }, null, 2));
  
  console.log(`\nSummary: ${objectives.size} objectives with ${allKeyResults.length} key results ready for import`);
  
} catch (error) {
  console.error('Error integrating OKR Plan:', error.message);
}