import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Create a context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Import harmonized components
import {
  SavedListsManager,
  SavedViewsManager,
  FilterBar,
  EntityListManager
} from "@/components/shared";

// Fetch opportunities from database
const useOpportunitiesData = () => {
  return useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/opportunities');
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    }
  });
};

function OpportunitiesTable() {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const { data: opportunities = [], isLoading, error } = useOpportunitiesData();
  const [isEditingList, setIsEditingList] = useState(false);
  
  const [filterText, setFilterText] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [activeView, setActiveView] = useState<any>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading opportunities...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading opportunities</div>
      </div>
    );
  }

  // Filter opportunities based on search and active list
  const filteredOpportunities = opportunities.filter((opportunity: any) => {
    const matchesText = opportunity.title.toLowerCase().includes(filterText.toLowerCase()) ||
                       opportunity.description?.toLowerCase().includes(filterText.toLowerCase());
    
    // Apply list filtering if an active list is selected
    const matchesList = !activeList || (activeList.members && activeList.members.includes(opportunity.id));
    
    return matchesText && matchesList;
  });

  // Handle opportunity selection
  const handleOpportunitySelect = (opportunityId: number) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOpportunities.length === filteredOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map((opp: any) => opp.id));
    }
  };

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="space-y-4">
        {/* Enhanced unified toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row with saved lists and views */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Left side - Saved Lists */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
                </div>
                
                <SavedListsManager 
                  entityType="opportunity"
                  selectedItems={selectedOpportunities}
                  onListSelect={(list) => {
                    setActiveList(list);
                  }}
                  currentFilters={{
                    searchText: filterText
                  }}
                />
              </div>

              {/* Right side - Views section */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Views</span>
                </div>
                
                <SavedViewsManager 
                  entityType="opportunity"
                  onViewSelect={(view) => {
                    setActiveView(view);
                  }}
                  currentView={{
                    filterText,
                    selectedOpportunities
                  }}
                />
              </div>
            </div>

            {/* Action bar for selected items */}
            {selectedOpportunities.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <span className="text-sm font-medium text-blue-900">
                  {selectedOpportunities.length} opportunity{selectedOpportunities.length !== 1 ? 'ies' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOpportunities([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Search and filters */}
            <FilterBar 
              searchText={filterText}
              onSearchChange={setFilterText}
              placeholder="Search opportunities..."
              entityType="opportunity"
            />
          </div>
        </div>

        {/* Statistics overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">{filteredOpportunities.length}</div>
            <div className="text-sm text-gray-500">Total Opportunities</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">
              {filteredOpportunities.filter((o: any) => o.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">
              €{filteredOpportunities.reduce((sum: number, o: any) => sum + (o.value || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">
              €{Math.round(filteredOpportunities.reduce((sum: number, o: any) => sum + (o.value || 0), 0) * 0.7).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </div>
        </div>

        {/* Opportunities table */}
        <div className="overflow-hidden bg-white sm:rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative px-3 py-3.5 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Opportunity
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Value
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOpportunities.map((opportunity: any) => (
                <tr key={opportunity.id} className="hover:bg-gray-50">
                  <td className="relative px-3 py-4 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedOpportunities.includes(opportunity.id)}
                      onChange={() => handleOpportunitySelect(opportunity.id)}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                        <div className="text-sm text-gray-500">{opportunity.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    {opportunity.customer || 'N/A'}
                  </td>
                  <td className="px-3 py-4">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    {opportunity.type}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    €{opportunity.value?.toLocaleString() || '0'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <Link href={`/opportunities/${opportunity.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ListEditingContext.Provider>
  );
}

export default function OpportunitiesPage() {
  const { environment } = useEnvironment();
  const [isEditingList, setIsEditingList] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Opportunities</h1>
        <button 
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] pl-[12px] pr-[12px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
          onClick={() => {
            if (!isEditingList) {
              alert("Create new opportunity functionality coming soon!");
            }
          }}
          disabled={isEditingList}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create new opportunity
        </button>
      </div>
      
      <OpportunitiesTable />
    </div>
  );
}