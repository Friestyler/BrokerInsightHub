import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Sample data for partners - updated to match the detail page data
const mockPartners = [
  {
    id: 1,
    name: "XYZ Insurance Group",
    initials: "XY",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 3,
    opportunities: 3,
    location: "New York, NY",
    contactEmail: "contact@xyz-insurance.com",
    primaryContact: "John Doe"
  },
  {
    id: 2,
    name: "ABC Insurance Brokers",
    initials: "AB",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 5,
    opportunities: 4,
    location: "New York, NY",
    contactEmail: "contact@abc-insurance.com",
    primaryContact: "Sarah Johnson"
  },
  {
    id: 3,
    name: "Global Insurance Partners",
    initials: "GI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 15,
    opportunities: 12,
    location: "London, UK",
    contactEmail: "partnerships@grp.com",
    primaryContact: "Emma Wilson"
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    initials: "PI",
    industry: "Insurance",
    type: "Agency",
    status: "inactive",
    size: "medium",
    customers: 6,
    opportunities: 3,
    location: "Boston, MA",
    contactEmail: "support@premierinsurance.co",
    primaryContact: "John Davis"
  },
  {
    id: 5,
    name: "Secure Financial Services",
    initials: "SF",
    industry: "Finance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 22,
    opportunities: 15,
    location: "Chicago, IL",
    contactEmail: "info@securefinancial.org",
    primaryContact: "Michael Brown"
  }
];

// Icons for convenience
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"></path>
  </svg>
);

// Simplified approach to partner organization
const PartnersPage = () => {
  const { currentEnvironment } = useEnvironment();
  
  // State for partner selection
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  
  // State for saved filters and lists
  const [savedItems, setSavedItems] = useState<{
    id: string;
    name: string;
    type: 'filter' | 'list';  // Changed from 'search' to 'filter'
    lastUpdated: Date;
    count: number;
    filters?: {
      search?: string;
      status?: string;
      industry?: string;
      type?: string;
    };
    partners?: number[];
  }[]>([
    {
      id: '1',
      name: 'Active Insurance Brokers',
      type: 'filter',  // Changed from 'search' to 'filter'
      lastUpdated: new Date('2025-05-01'),
      count: 3,
      filters: {
        status: 'active',
        industry: 'Insurance',
        type: 'Broker'
      }
    },
    {
      id: '2',
      name: 'Key Agency Partners',
      type: 'list',
      lastUpdated: new Date('2025-05-10'),
      count: 1,
      partners: [4]
    }
  ]);
  
  // State for active saved item
  const [activeSavedItem, setActiveSavedItem] = useState<typeof savedItems[0] | null>(null);
  
  // State for search and filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showSavedItemsDrawer, setShowSavedItemsDrawer] = useState(false);
  
  // Get toast
  const { toast } = useToast();
  
  // Filter partners based on current criteria
  const filteredPartners = mockPartners.filter(partner => {
    // Apply text search
    const matchesSearch = !searchText || 
      partner.name.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.industry.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.type.toLowerCase().includes(searchText.toLowerCase());
    
    // Apply filters
    const matchesStatus = !statusFilter || partner.status === statusFilter;
    const matchesIndustry = !industryFilter || partner.industry === industryFilter;
    const matchesType = !typeFilter || partner.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry && matchesType;
  });
  
  // If we have an active list, only show partners in that list
  const displayedPartners = activeSavedItem?.type === 'list'
    ? filteredPartners.filter(partner => activeSavedItem.partners?.includes(partner.id))
    : filteredPartners;
  
  // Toggle partner selection
  const togglePartnerSelection = (partnerId: number) => {
    if (selectedPartners.includes(partnerId)) {
      setSelectedPartners(selectedPartners.filter(id => id !== partnerId));
    } else {
      setSelectedPartners([...selectedPartners, partnerId]);
    }
  };
  
  // Create a new saved filter
  const createSavedSearch = (name: string) => {
    // Only create if we have filters and there are results
    if ((searchText || statusFilter || industryFilter || typeFilter) && filteredPartners.length > 0) {
      const newSearch = {
        id: Date.now().toString(),
        name,
        type: 'filter' as const,
        lastUpdated: new Date(),
        count: filteredPartners.length,
        filters: {
          search: searchText || undefined,
          status: statusFilter || undefined,
          industry: industryFilter || undefined,
          type: typeFilter || undefined
        }
      };
      
      setSavedItems([...savedItems, newSearch]);
      setActiveSavedItem(newSearch);
      
      toast({
        title: "Saved search created",
        description: `"${name}" will automatically show all matching partners.`,
      });
    }
  };
  
  // Create a new list from selected partners
  const createList = (name: string) => {
    if (selectedPartners.length > 0) {
      const newList = {
        id: Date.now().toString(),
        name,
        type: 'list' as const,
        lastUpdated: new Date(),
        count: selectedPartners.length,
        partners: selectedPartners
      };
      
      setSavedItems([...savedItems, newList]);
      setActiveSavedItem(newList);
      setSelectedPartners([]); // Clear selection after creating list
      
      toast({
        title: "Partner list created",
        description: `"${name}" with ${selectedPartners.length} partners has been created.`,
      });
    }
  };
  
  // Calculate stats
  const stats = {
    totalPartners: mockPartners.length,
    activePartners: mockPartners.filter(p => p.status === 'active').length,
    totalCustomers: mockPartners.reduce((sum, p) => sum + p.customers, 0),
    totalOpportunities: mockPartners.reduce((sum, p) => sum + p.opportunities, 0)
  };
  
  return (
    <div className="space-y-4">
      {/* Main header with organization tools */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Top row with actions */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900 mr-2">Partners</h1>
              
              {/* Dropdown for saved searches and lists */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowSavedItemsDrawer(!showSavedItemsDrawer)}
                >
                  {activeSavedItem ? (
                    <>
                      {activeSavedItem.type === 'filter' ? <FilterIcon /> : <ListIcon />}
                      <span>{activeSavedItem.name}</span>
                      
                      {/* Badge indicating type */}
                      <Badge variant="outline" className={activeSavedItem.type === 'filter' 
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-50" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      }>
                        {activeSavedItem.type === 'filter' ? 'Filter' : 'List'}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <ListIcon />
                      <span>All Partners</span>
                    </>
                  )}
                </Button>
                
                {/* Dropdown menu for saved items */}
                {showSavedItemsDrawer && (
                  <div className="absolute z-10 mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-2 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700">Saved Searches & Lists</h4>
                    </div>
                    
                    {/* Saved items list */}
                    <div className="max-h-80 overflow-y-auto">
                      {savedItems.length > 0 ? (
                        <div className="p-1">
                          {savedItems.map(item => (
                            <div 
                              key={item.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                                activeSavedItem?.id === item.id ? 'bg-gray-50' : ''
                              }`}
                              onClick={() => {
                                setActiveSavedItem(item);
                                
                                // If it's a saved search, apply those filters
                                if (item.type === 'filter' && item.filters) {
                                  setSearchText(item.filters.search || '');
                                  setStatusFilter(item.filters.status || '');
                                  setIndustryFilter(item.filters.industry || '');
                                  setTypeFilter(item.filters.type || '');
                                }
                                
                                setShowSavedItemsDrawer(false);
                              }}
                            >
                              {/* Icon based on type */}
                              <div className={`p-1.5 rounded-full mr-2 ${
                                item.type === 'filter' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {item.type === 'filter' ? <FilterIcon /> : <ListIcon />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.count} partner{item.count !== 1 ? 's' : ''}
                                </p>
                              </div>
                              
                              <Badge variant="outline" className={`ml-2 ${
                                item.type === 'filter' 
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                              }`}>
                                {item.type === 'filter' ? 'Filter' : 'List'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No saved searches or lists yet
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600"
                          onClick={() => {
                            setActiveSavedItem(null);
                            setSearchText('');
                            setStatusFilter('');
                            setIndustryFilter('');
                            setTypeFilter('');
                            setShowSavedItemsDrawer(false);
                          }}
                        >
                          View all partners
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            if (activeSavedItem) {
                              setSavedItems(savedItems.filter(item => item.id !== activeSavedItem.id));
                              setActiveSavedItem(null);
                              setShowSavedItemsDrawer(false);
                              
                              toast({
                                title: "Item deleted",
                                description: `"${activeSavedItem.name}" has been removed.`,
                              });
                            }
                          }}
                          disabled={!activeSavedItem}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Simple search */}
            <div className="relative">
              <Input
                type="search"
                placeholder="Search partners..."
                className="pl-9 w-60"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>
          
          {/* Simple filters row */}
          <div className="flex flex-wrap gap-3 mt-3">
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any industry</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Partner type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="Broker">Broker</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(searchText || statusFilter || industryFilter || typeFilter) && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-10"
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('');
                  setIndustryFilter('');
                  setTypeFilter('');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
                Clear all
              </Button>
            )}
          </div>

          {/* Organization options - explicit choices */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
            <h3 className="font-medium text-gray-900 mb-4">How do you want to organize partners?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Save filters */}
              <div 
                className="border border-blue-200 bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setShowSearchModal(true)}
              >
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <FilterIcon />
                  </div>
                  <h4 className="font-medium text-blue-800">Save a group of filters</h4>
                </div>
                <p className="text-sm text-blue-700">
                  I want to save my filter settings so that my list automatically updates when partners match my criteria.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-3 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    // Check if any filters are active
                    const hasActiveFilters = searchText || 
                      (statusFilter && statusFilter !== 'any') || 
                      (industryFilter && industryFilter !== 'any') || 
                      (typeFilter && typeFilter !== 'any');
                    
                    if (!hasActiveFilters) {
                      toast({
                        title: "No filters applied",
                        description: "You don't have any filters applied yet. You can still save this to get all partners in a filter that will update automatically.",
                        duration: 5000,
                      });
                    }
                    
                    setShowSearchModal(true);
                  }}
                >
                  Save filters
                </Button>
              </div>
              
              {/* Option 2: Save selected partners */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPartners.length > 0 
                    ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100" 
                    : "border-gray-200 bg-gray-100 opacity-60"
                }`}
                onClick={() => {
                  if (selectedPartners.length > 0) {
                    setShowListModal(true);
                  } else {
                    toast({
                      title: "No partners selected",
                      description: "Select partners using the checkboxes in the table first, then create a list.",
                    });
                  }
                }}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-full mr-3 ${
                    selectedPartners.length > 0 ? "bg-emerald-100" : "bg-gray-200"
                  }`}>
                    <ListIcon />
                  </div>
                  <h4 className={`font-medium ${
                    selectedPartners.length > 0 ? "text-emerald-800" : "text-gray-600"
                  }`}>
                    Save the selected partners
                  </h4>
                </div>
                <p className={`text-sm ${
                  selectedPartners.length > 0 ? "text-emerald-700" : "text-gray-500"
                }`}>
                  I want to save just the {selectedPartners.length > 0 ? selectedPartners.length : ""} partners I've selected. 
                  This list won't change unless I change it manually.
                </p>
                <Button 
                  variant="outline" 
                  className={`mt-3 ${
                    selectedPartners.length > 0 
                      ? "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50" 
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  }`}
                  disabled={selectedPartners.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPartners.length > 0) {
                      setShowListModal(true);
                    } else {
                      toast({
                        title: "No partners selected",
                        description: "Select partners using the checkboxes in the table first.",
                      });
                    }
                  }}
                >
                  {selectedPartners.length > 0 
                    ? `Save ${selectedPartners.length} partners` 
                    : "Select partners first"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Display active context */}
          {activeSavedItem && (
            <div className={`p-3 rounded-lg ${
              activeSavedItem.type === 'filter' 
                ? 'bg-blue-50 border border-blue-100' 
                : 'bg-emerald-50 border border-emerald-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-full mr-3 ${
                    activeSavedItem.type === 'filter' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {activeSavedItem.type === 'filter' ? <FilterIcon /> : <ListIcon />}
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-medium ${
                      activeSavedItem.type === 'filter' ? 'text-blue-700' : 'text-emerald-700'
                    }`}>
                      {activeSavedItem.type === 'filter' ? 'Filter: ' : 'List: '}
                      {activeSavedItem.name}
                    </h3>
                    
                    <p className="text-xs text-gray-600 mt-0.5">
                      {displayedPartners.length} partner{displayedPartners.length !== 1 ? 's' : ''} 
                      {activeSavedItem.type === 'filter' 
                        ? ' match your filter criteria' 
                        : ' in this list'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeSavedItem.type === 'filter' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowSearchModal(true)}
                    >
                      Edit Search
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        // Add partners button - for lists only
                        setShowListModal(true);
                      }}
                    >
                      <PlusIcon />
                      <span className="ml-1">Add Partners</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Selection bar - appears when partners are selected */}
      {selectedPartners.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
              <span className="text-xs font-medium">{selectedPartners.length}</span>
            </div>
            <span className="text-sm font-medium text-indigo-800">
              {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              onClick={() => setSelectedPartners([])}
            >
              Clear Selection
            </Button>
            
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowListModal(true)}
            >
              <ListIcon />
              <span className="ml-1.5">Create List</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Partners grid/table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 w-12">
                  <Checkbox 
                    checked={selectedPartners.length > 0 && selectedPartners.length === displayedPartners.length} 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPartners(displayedPartners.map(p => p.id));
                      } else {
                        setSelectedPartners([]);
                      }
                    }}
                    className="ml-1"
                  />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Partner
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Industry
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Size
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Customers
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Opportunities
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedPartners.length > 0 ? (
                displayedPartners.map(partner => (
                  <tr 
                    key={partner.id}
                    className={`hover:bg-gray-50 ${selectedPartners.includes(partner.id) ? 'bg-gray-50' : ''}`}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      <Checkbox 
                        checked={selectedPartners.includes(partner.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (!selectedPartners.includes(partner.id)) {
                              setSelectedPartners([...selectedPartners, partner.id]);
                            }
                          } else {
                            setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                          }
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600">
                          <AvatarFallback>{partner.initials}</AvatarFallback>
                        </Avatar>
                        <Link 
                          href={`/lists/partners/${partner.id}`} 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {partner.name}
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-700">{partner.industry}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-700">{partner.type}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-700 capitalize">{partner.size}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm">
                      <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                        {partner.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-700">{partner.customers}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-700">{partner.opportunities}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-full text-gray-500 mb-3">
                        {activeSavedItem?.type === 'filter' ? <FilterIcon /> : <ListIcon />}
                      </div>
                      
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {activeSavedItem
                          ? activeSavedItem.type === 'filter'
                            ? 'No partners match your filters'
                            : 'This list is empty'
                          : 'No partners match your filters'
                        }
                      </h3>
                      
                      <p className="text-sm text-gray-500 max-w-md mb-4">
                        {activeSavedItem
                          ? activeSavedItem.type === 'filter'
                            ? 'Try adjusting your filter criteria to find partners.'
                            : 'Add partners to this list using the "Add Partners" button.'
                          : 'Try removing some filters to see more partners.'
                        }
                      </p>
                      
                      {activeSavedItem?.type === 'filter' && (
                        <Button
                          variant="outline"
                          onClick={() => setShowSearchModal(true)}
                        >
                          <FilterIcon />
                          <span className="ml-2">Adjust Search</span>
                        </Button>
                      )}
                      
                      {activeSavedItem?.type === 'list' && (
                        <Button
                          className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
                          onClick={() => setShowListModal(true)}
                        >
                          <PlusIcon />
                          <span className="ml-2">Add Partners</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Search & Filter Modal - a simple, intuitive search UI */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Filter Partners</DialogTitle>
            <DialogDescription>
              Search for partners and save your filters for later use
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="find-partners-search">Partner Name, Industry, or Type</Label>
              <Input
                id="find-partners-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Enter keywords to search"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="status-filter" className="mb-1.5 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="industry-filter" className="mb-1.5 block">Industry</Label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger id="industry-filter">
                    <SelectValue placeholder="Any industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any industry</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type-filter" className="mb-1.5 block">Partner Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Preview of search results */}
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Results Preview</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                {filteredPartners.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredPartners.slice(0, 5).map(partner => (
                      <li key={partner.id} className="py-2 flex items-center text-sm">
                        <span className="font-medium">{partner.name}</span>
                        <span className="text-gray-500 ml-auto">{partner.industry} · {partner.type}</span>
                      </li>
                    ))}
                    {filteredPartners.length > 5 && (
                      <li className="py-2 text-center text-sm text-gray-500">
                        + {filteredPartners.length - 5} more partners
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="py-3 text-center text-sm text-gray-500">
                    No partners match these criteria
                  </div>
                )}
              </div>
            </div>
            
            {/* Save search option */}
            <div className="border-t border-gray-200 pt-3 mt-2">
              <div className="flex items-center mb-2">
                <Checkbox 
                  id="save-search-option" 
                  defaultChecked={true} 
                  disabled={filteredPartners.length === 0}
                />
                <Label htmlFor="save-search-option" className="ml-2 text-sm">
                  Save this search for later use
                </Label>
              </div>
              
              {filteredPartners.length > 0 && (
                <div className="pl-6">
                  <Input 
                    id="saved-search-name" 
                    placeholder="Enter a name for this search"
                    defaultValue={
                      `${statusFilter || ''} ${industryFilter || ''} ${typeFilter || ''} Partners`.trim() ||
                      searchText || 
                      'My Saved Search'
                    }
                    className="text-sm"
                  />
                  <p className="text-xs text-blue-600 mt-1.5 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>
                      This search will automatically update as partners change. Any new partners that match these criteria will appear in your results.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearchModal(false)}>
              Cancel
            </Button>
            
            <Button 
              className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
              disabled={filteredPartners.length === 0}
              onClick={() => {
                const saveSearch = (document.getElementById('save-search-option') as HTMLInputElement)?.checked;
                const searchName = (document.getElementById('saved-search-name') as HTMLInputElement)?.value || 'My Saved Search';
                
                if (saveSearch) {
                  createSavedSearch(searchName);
                }
                
                setShowSearchModal(false);
                
                if (!saveSearch) {
                  toast({
                    title: "Filters applied",
                    description: `Showing ${filteredPartners.length} matching partners.`,
                  });
                }
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create List Modal - a simple way to create a manual list */}
      <Dialog open={showListModal} onOpenChange={setShowListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {activeSavedItem?.type === 'list' 
                ? `Add Partners to "${activeSavedItem.name}"` 
                : 'Create Partner List'}
            </DialogTitle>
            <DialogDescription>
              {activeSavedItem?.type === 'list'
                ? 'Select partners to add to your existing list'
                : 'Create a list containing your selected partners'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {(!activeSavedItem || activeSavedItem.type !== 'list') && (
              <div className="grid gap-4 mb-4">
                <div>
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    placeholder="Enter a name for your list"
                    defaultValue={`Selected Partners (${selectedPartners.length})`}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Selected Partners</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                  {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                {selectedPartners.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {mockPartners
                      .filter(partner => selectedPartners.includes(partner.id))
                      .map(partner => (
                        <li key={partner.id} className="py-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{partner.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => setSelectedPartners(selectedPartners.filter(id => id !== partner.id))}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </Button>
                        </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-3 text-center text-sm text-gray-500">
                    No partners selected
                  </div>
                )}
              </div>
            </div>
            
            {/* Explanation box */}
            <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                {activeSavedItem?.type === 'list'
                  ? 'Partners will be added to your existing list. This list will only include partners you specifically select.'
                  : 'Unlike saved searches, this list will only include the specific partners you select. Changes to partners will not automatically update this list.'}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListModal(false)}>
              Cancel
            </Button>
            
            <Button 
              className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
              disabled={selectedPartners.length === 0}
              onClick={() => {
                if (activeSavedItem?.type === 'list') {
                  // Add partners to existing list
                  const updatedList = {
                    ...activeSavedItem,
                    lastUpdated: new Date(),
                    count: [...new Set([...(activeSavedItem.partners || []), ...selectedPartners])].length,
                    partners: [...new Set([...(activeSavedItem.partners || []), ...selectedPartners])]
                  };
                  
                  setSavedItems(savedItems.map(item => 
                    item.id === activeSavedItem.id ? updatedList : item
                  ));
                  
                  setActiveSavedItem(updatedList);
                  setSelectedPartners([]);
                  
                  toast({
                    title: "Partners added",
                    description: `${selectedPartners.length} partners added to "${activeSavedItem.name}".`,
                  });
                } else {
                  // Create new list
                  const listName = (document.getElementById('list-name') as HTMLInputElement)?.value || 
                    `Selected Partners (${selectedPartners.length})`;
                  
                  createList(listName);
                }
                
                setShowListModal(false);
              }}
            >
              {activeSavedItem?.type === 'list' ? 'Add to List' : 'Create List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersPage;