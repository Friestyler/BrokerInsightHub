import { useState } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Mockup data for partners
export const mockPartners = [
  {
    id: 1,
    name: "ABC Insurance Brokers",
    description: "Leading insurance brokerage serving enterprise clients",
    industry: "Insurance",
    type: "Broker",
    logo: "ABC",
    status: "active",
    tier: "platinum",
    location: "London, UK",
    website: "https://www.abcbrokers.com",
    metrics: {
      customers: 145,
      opportunities: 12,
      revenue: 2500000
    }
  },
  {
    id: 2,
    name: "XYZ Financial Services",
    description: "Full-service financial institution",
    industry: "Financial Services",
    type: "Bank",
    logo: "XYZ",
    status: "active",
    tier: "gold",
    location: "New York, USA",
    website: "https://www.xyzfinancial.com",
    metrics: {
      customers: 98,
      opportunities: 8,
      revenue: 1800000
    }
  }
];

// Main component
export default function PartnersPage() {
  const { environment } = useEnvironment();
  const [activeView, setActiveView] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
        <Button variant="outline">Filters</Button>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Partner List</h2>
          
          {/* This is where the action buttons appear when filters are changed */}
          {activeView && hasUnsavedChanges && (
            /* Now we'll compare the actual current filter values with the view's filter values
               to ensure we only show these buttons when there have been real changes */
            (() => {
              // Check if the filters have actually changed compared to the active view
              const hasActualFilterChanges = 
                filterText !== (activeView.filters?.searchText || '') ||
                selectedStatus !== (activeView.filters?.status || '') ||
                selectedIndustry !== (activeView.filters?.industry || '') ||
                selectedType !== (activeView.filters?.type || '');
              
              // Only render the buttons if there are actual filter changes
              return hasActualFilterChanges ? (
                <div className="flex items-center gap-2">
                  <Button>Revert Changes</Button>
                  <Button>Save as New View</Button>
                  <Button>Save</Button>
                </div>
              ) : null;
            })()
          )}
        </div>
        
        <ul className="space-y-2">
          {mockPartners.map(partner => (
            <li key={partner.id} className="p-3 border rounded hover:bg-gray-50">
              <Link href={`/lists/partners/${partner.id}`} className="text-blue-600 hover:underline">
                {partner.name}
              </Link>
              <p className="text-sm text-gray-600">{partner.industry} - {partner.type}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}