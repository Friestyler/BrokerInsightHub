import { useState, useEffect } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

interface PivotTableReportProps {
  timeFrame: string;
  region: string;
}

// Sample data for the pivot table
const sampleOpportunityData = [
  // Partner/Customer data
  { partner: 'Jeroen Hypotheek Advies', customer: 'Van Dijk Familie', product: 'Mortgage', value: 250000, year: 2025, quarter: 'Q2', month: 'May', stage: 'Proposal', probability: 60, region: 'North' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'Jansen Gezin', product: 'Verduurzamingslening', value: 35000, year: 2025, quarter: 'Q2', month: 'May', stage: 'Discovery', probability: 40, region: 'West' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'De Groot BV', product: 'Cross-sell', value: 42000, year: 2025, quarter: 'Q3', month: 'July', stage: 'Negotiation', probability: 75, region: 'South' },
  { partner: 'Jeroen Hypotheek Advies', customer: 'Visser Familie', product: 'Life Insurance', value: 28000, year: 2025, quarter: 'Q2', month: 'May', stage: 'Closed Won', probability: 100, region: 'East' },
  
  // Other data
  { partner: 'ABC Insurance Brokers', customer: 'Acme Corporation', product: 'Property Insurance', value: 125000, year: 2025, quarter: 'Q2', month: 'May', stage: 'In Progress', probability: 50, region: 'Central' },
  { partner: 'ABC Insurance Brokers', customer: 'Acme Corporation', product: 'Cyber Security', value: 75000, year: 2025, quarter: 'Q3', month: 'July', stage: 'Qualification', probability: 30, region: 'Central' },
  { partner: 'ABC Insurance Brokers', customer: 'Umbrella Corporation', product: 'Workers Compensation', value: 80000, year: 2025, quarter: 'Q2', month: 'May', stage: 'Closed Lost', probability: 0, region: 'North' },
  { partner: 'Insurance Experts', customer: 'Tech Solutions Inc', product: 'Liability Insurance', value: 95000, year: 2025, quarter: 'Q1', month: 'March', stage: 'Closed Won', probability: 100, region: 'West' },
  { partner: 'Insurance Experts', customer: 'Green Energy Co', product: 'Risk Management', value: 110000, year: 2025, quarter: 'Q3', month: 'August', stage: 'Proposal', probability: 65, region: 'South' },
  { partner: 'Global Assurance', customer: 'Retail Chain Ltd', product: 'Business Interruption', value: 150000, year: 2025, quarter: 'Q4', month: 'October', stage: 'Discovery', probability: 25, region: 'East' },
  { partner: 'Global Assurance', customer: 'Manufacturing Inc', product: 'Equipment Coverage', value: 200000, year: 2025, quarter: 'Q3', month: 'July', stage: 'Negotiation', probability: 80, region: 'Central' },
  { partner: 'Regional Brokers', customer: 'Local Business', product: 'General Liability', value: 45000, year: 2025, quarter: 'Q2', month: 'May', stage: 'Qualification', probability: 35, region: 'North' },
  { partner: 'Regional Brokers', customer: 'Small Enterprise', product: 'Professional Liability', value: 65000, year: 2025, quarter: 'Q3', month: 'August', stage: 'In Progress', probability: 55, region: 'South' },
  { partner: 'Elite Insurance', customer: 'Luxury Hotels', product: 'Commercial Property', value: 250000, year: 2025, quarter: 'Q1', month: 'February', stage: 'Closed Won', probability: 100, region: 'West' },
  { partner: 'Elite Insurance', customer: 'Executive Transport', product: 'Fleet Insurance', value: 180000, year: 2025, quarter: 'Q4', month: 'November', stage: 'Proposal', probability: 70, region: 'East' },
];

// OKR metrics data
const sampleOkrData = [
  { partner: 'Jeroen Hypotheek Advies', metricName: 'Aantal hypotheekaanvragen', plan: 'Performance (KPIs)', realized: 211, target: 285, unit: '#', progress: 74, month: 'May', quarter: 'Q2', year: 2025, region: 'North' },
  { partner: 'Jeroen Hypotheek Advies', metricName: 'Hypotheek volume', plan: 'Performance (KPIs)', realized: 47500000, target: 60000000, unit: '€', progress: 79, month: 'May', quarter: 'Q2', year: 2025, region: 'North' },
  { partner: 'ABC Insurance Brokers', metricName: '10% turnover increase in product X', plan: 'Excellent Agent Plan', realized: 58311, target: 75000, unit: '€', progress: 78, month: 'May', quarter: 'Q2', year: 2025, region: 'Central' },
  { partner: 'Global Assurance', metricName: 'Become preferred partner for XYZ', plan: 'Excellent Agent Plan', realized: 4, target: 5, unit: 'points', progress: 80, month: 'May', quarter: 'Q2', year: 2025, region: 'East' },
  { partner: 'Insurance Experts', metricName: 'Production efficiency', plan: 'Operational Improvements', realized: 12, target: 15, unit: '%', progress: 80, month: 'May', quarter: 'Q2', year: 2025, region: 'West' },
];

// Campaign data
const sampleCampaignData = [
  { campaign: 'HVL', partner: 'Jeroen Hypotheek Advies', engagementRate: 65, conversionRate: 32, leads: 45, revenue: 420000, month: 'May', quarter: 'Q2', year: 2025, region: 'North' },
  { campaign: 'HVL24', partner: 'ABC Insurance Brokers', engagementRate: 75, conversionRate: 40, leads: 62, revenue: 525000, month: 'May', quarter: 'Q2', year: 2025, region: 'Central' },
  { campaign: 'XSELL+', partner: 'Insurance Experts', engagementRate: 55, conversionRate: 28, leads: 38, revenue: 210000, month: 'May', quarter: 'Q2', year: 2025, region: 'West' },
  { campaign: 'LIFE360', partner: 'Global Assurance', engagementRate: 48, conversionRate: 22, leads: 33, revenue: 180000, month: 'May', quarter: 'Q2', year: 2025, region: 'East' },
];

// Combine all data for the pivot table
const allReportingData = [
  ...sampleOpportunityData.map(item => ({ ...item, dataType: 'opportunity' })),
  ...sampleOkrData.map(item => ({ ...item, dataType: 'okr' })),
  ...sampleCampaignData.map(item => ({ ...item, dataType: 'campaign' }))
];

const PivotTableReport: React.FC<PivotTableReportProps> = ({ timeFrame, region }) => {
  // State to hold filtered data
  const [filteredData, setFilteredData] = useState(allReportingData);
  
  // State to hold pivot table configuration
  const [pivotState, setPivotState] = useState({
    data: allReportingData,
    rows: ['partner'],
    cols: ['quarter'],
    vals: ['value'],
    aggregatorName: 'Sum',
    rendererName: 'Table Heatmap',
    valueFilter: {},
  });

  // Filter data based on timeFrame and region
  useEffect(() => {
    let filtered = [...allReportingData];
    
    // Filter by timeFrame
    if (timeFrame !== 'all') {
      if (timeFrame === '2025') {
        filtered = filtered.filter(item => item.year === 2025);
      } else if (timeFrame === 'q2-2025') {
        filtered = filtered.filter(item => item.year === 2025 && item.quarter === 'Q2');
      } else if (timeFrame === 'may-2025') {
        filtered = filtered.filter(item => item.year === 2025 && item.month === 'May');
      }
    }
    
    // Filter by region
    if (region !== 'all') {
      filtered = filtered.filter(item => 
        item.region && item.region.toLowerCase() === region.toLowerCase()
      );
    }
    
    // Update filtered data
    setFilteredData(filtered);
    
    // Update pivot state with new data
    setPivotState(prevState => ({
      ...prevState,
      data: filtered
    }));
    
  }, [timeFrame, region]);

  // Update pivot state on change
  const handlePivotStateChange = (newState: any) => {
    setPivotState({
      ...newState,
      data: filteredData // Ensure we keep our filtered data
    });
  };

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
          onChange={handlePivotStateChange}
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
};

export default PivotTableReport;