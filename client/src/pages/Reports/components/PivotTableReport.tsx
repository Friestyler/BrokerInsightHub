import { useState } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

// Sample data for the pivot table
const sampleOpportunityData = [
  // Partner/Customer data
  { partner: 'Jeroen Hypotheek Advies', customer: 'Van Dijk Familie', product: 'Mortgage', value: 250000, year: 2025, quarter: 'Q2', stage: 'Proposal', probability: 60, region: 'North' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'Jansen Gezin', product: 'Verduurzamingslening', value: 35000, year: 2025, quarter: 'Q2', stage: 'Discovery', probability: 40, region: 'West' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'De Groot BV', product: 'Cross-sell', value: 42000, year: 2025, quarter: 'Q3', stage: 'Negotiation', probability: 75, region: 'South' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'Visser Familie', product: 'Life Insurance', value: 28000, year: 2025, quarter: 'Q2', stage: 'Closed Won', probability: 100, region: 'East' },
  
  // Other data
  { partner: 'ABC Insurance Brokers', customer: 'Acme Corporation', product: 'Property Insurance', value: 125000, year: 2025, quarter: 'Q2', stage: 'In Progress', probability: 50, region: 'Central' },
  { partner: 'ABC Insurance Brokers', customer: 'Acme Corporation', product: 'Cyber Security', value: 75000, year: 2025, quarter: 'Q3', stage: 'Qualification', probability: 30, region: 'Central' },
  { partner: 'ABC Insurance Brokers', customer: 'Umbrella Corporation', product: 'Workers Compensation', value: 80000, year: 2025, quarter: 'Q2', stage: 'Closed Lost', probability: 0, region: 'North' },
  { partner: 'Insurance Experts', customer: 'Tech Solutions Inc', product: 'Liability Insurance', value: 95000, year: 2025, quarter: 'Q1', stage: 'Closed Won', probability: 100, region: 'West' },
  { partner: 'Insurance Experts', customer: 'Green Energy Co', product: 'Risk Management', value: 110000, year: 2025, quarter: 'Q3', stage: 'Proposal', probability: 65, region: 'South' },
  { partner: 'Global Assurance', customer: 'Retail Chain Ltd', product: 'Business Interruption', value: 150000, year: 2025, quarter: 'Q4', stage: 'Discovery', probability: 25, region: 'East' },
  { partner: 'Global Assurance', customer: 'Manufacturing Inc', product: 'Equipment Coverage', value: 200000, year: 2025, quarter: 'Q3', stage: 'Negotiation', probability: 80, region: 'Central' },
  { partner: 'Regional Brokers', customer: 'Local Business', product: 'General Liability', value: 45000, year: 2025, quarter: 'Q2', stage: 'Qualification', probability: 35, region: 'North' },
  { partner: 'Regional Brokers', customer: 'Small Enterprise', product: 'Professional Liability', value: 65000, year: 2025, quarter: 'Q3', stage: 'In Progress', probability: 55, region: 'South' },
  { partner: 'Elite Insurance', customer: 'Luxury Hotels', product: 'Commercial Property', value: 250000, year: 2025, quarter: 'Q1', stage: 'Closed Won', probability: 100, region: 'West' },
  { partner: 'Elite Insurance', customer: 'Executive Transport', product: 'Fleet Insurance', value: 180000, year: 2025, quarter: 'Q4', stage: 'Proposal', probability: 70, region: 'East' },
];

export default function PivotTableReport() {
  // State to hold pivot table configuration
  const [pivotState, setPivotState] = useState({
    data: sampleOpportunityData,
    rows: ['partner'],
    cols: ['quarter'],
    vals: ['value'],
    aggregatorName: 'Sum',
    rendererName: 'Table Heatmap',
    valueFilter: {},
  });

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">
          <ul className="list-disc list-inside">
            <li>Drag attributes to rows or columns</li>
            <li>Select different aggregation methods (Sum, Average, Count)</li>
            <li>Change visualization types with the renderers dropdown</li>
          </ul>
        </div>
      </div>
      
      <div className="overflow-auto">
        <PivotTableUI
          onChange={(s: any) => setPivotState(s)}
          {...pivotState}
          renderers={Object.assign({}, 
            PivotTableUI.defaultProps.renderers
          )}
          tableClassName="border border-gray-200"
          unusedOrientationCutoff={Infinity}
        />
      </div>
    </div>
  );
}