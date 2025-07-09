import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import EntityAvatar from "@/components/EntityAvatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldsSelector } from "@/components/shared/FieldsSelector";

// Calculate total value from ALL opportunities linked to customers (not just displayed page)
function calculateCustomerTotalValue(customers: any[], opportunities: any[] = []): number {
  try {
    if (!Array.isArray(opportunities) || opportunities.length === 0) return 0;
    
    // Filter opportunities that have a clientId (linked to any customer)
    const relevantOpportunities = opportunities.filter(opp => opp && opp.clientId);
    
    // Sum unique opportunity values (no double counting)
    const total = relevantOpportunities.reduce((sum, opp) => {
      if (!opp || typeof opp !== 'object') return sum;
      const value = parseFloat(opp.estimated_value) || 0;
      return sum + value;
    }, 0);
    
    return isNaN(total) ? 0 : total;
  } catch (error) {
    console.error('Error in calculateCustomerTotalValue:', error);
    return 0;
  }
}

// Calculate weighted value from ALL opportunities linked to customers (not just displayed page)
function calculateCustomerWeightedValue(customers: any[], opportunities: any[] = []): number {
  try {
    if (!Array.isArray(opportunities) || opportunities.length === 0) return 0;
    
    // Filter opportunities that have a clientId (linked to any customer)
    const relevantOpportunities = opportunities.filter(opp => opp && opp.clientId);
    
    // Calculate probability-adjusted sum of opportunity values using stage-based probabilities
    const total = relevantOpportunities.reduce((sum, opp) => {
      if (!opp || typeof opp !== 'object') return sum;
      const value = parseFloat(opp.estimated_value) || 0;
      const probability = opp.stage === 'Closed (Won)' ? 1.0 : 
                        opp.stage === 'Negotiation' ? 0.7 :
                        opp.stage === 'Proposal Sent to Client' ? 0.6 :
                        opp.stage === 'Proposal Sent' ? 0.6 :
                        opp.stage === 'proposal' ? 0.6 :
                        opp.stage === 'Qualified Lead' ? 0.4 :
                        opp.stage === 'qualification' ? 0.4 :
                        opp.stage === 'Validated' ? 0.3 :
                        opp.stage === 'discovery' ? 0.2 :
                        opp.stage === 'Lost' ? 0 :
                        opp.stage === 'Rejected' ? 0 :
                        !opp.stage || opp.stage === '' ? 0.1 : 0.1;
      return sum + (value * probability);
    }, 0);
    
    return isNaN(total) ? 0 : total;
  } catch (error) {
    console.error('Error in calculateCustomerWeightedValue:', error);
    return 0;
  }
}

// Fetch customers from database with pagination
const useCustomersData = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: ['/api/customers', page, limit],
    queryFn: async () => {
      const result = await apiRequest('GET', `/api/customers?page=${page}&limit=${limit}`);
      return result;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hooks for saved lists and segment views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'customers'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=customers'),
    staleTime: 0,
    gcTime: 0,
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('POST', '/api/saved-lists', newList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'customers'] });
    }
  });
};

const useSavedSegmentViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'customers'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=customers'),
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedSegmentView = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newView: any) => {
      return apiRequest('POST', '/api/saved-views', newView);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
    }
  });
};

export default function CustomersPageClean() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isEditingList, setIsEditingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    industry: [] as string[],
    size: [] as string[],
    status: [] as string[]
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  
  // Create customer modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    ownerId: null as number | null,
    assignedPartnerId: null as number | null
  });
  
  // Dialog states
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  
  // Segment Views state
  const [activeView, setActiveView] = useState<any>(null);
  const [showSaveSegmentViewModal, setShowSaveSegmentViewModal] = useState(false);
  const [segmentViewNameInput, setSegmentViewNameInput] = useState('');
  
  // Account Mapping state
  const [showAccountMappingModal, setShowAccountMappingModal] = useState(false);
  const [selectedMappingFields, setSelectedMappingFields] = useState<string[]>([]);
  const [showSegmentViewsDropdown, setShowSegmentViewsDropdown] = useState(false);
  
  // Filter dropdown states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState([
    'customer', 'product', 'partner', 'industry', 'type', 'status', 'value', 'template'
  ]);

  // Update active filters when new filter states change
  useEffect(() => {
    setActiveFilters({
      industry: selectedIndustry && selectedIndustry !== 'all' ? [selectedIndustry] : [],
      size: selectedSize && selectedSize !== 'all' ? [selectedSize] : [],
      status: selectedStatus && selectedStatus !== 'all' ? [selectedStatus] : []
    });
  }, [selectedStatus, selectedIndustry, selectedSize]);
  
  // Data fetching with pagination
  const { data: customersResponse, isLoading, error } = useCustomersData(currentPage, itemsPerPage);
  
  // Fetch opportunities for accurate value calculations
  const { data: opportunities = [] } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: true
  });
  const customers = useMemo(() => {
    if (!customersResponse?.data || !Array.isArray(customersResponse.data)) return [];
    
    try {
      // Debug: Log the raw data structure safely
      if (customersResponse.data.length > 0) {
        console.log('Raw customer data:', customersResponse.data[0]);
      }
      
      // Ensure data is properly structured and values are numbers
      const processedCustomers = customersResponse.data.map((customer: any) => {
        if (!customer || typeof customer !== 'object') return null;
        
        // Safe property access with proper null checking
        const customerName = customer.name || 'Unknown Customer';
        const opportunityCount = Number(customer.opportunityCount) || 0;
        const totalOpportunityValue = Number(customer.totalOpportunityValue) || 0;
        const partnerCount = Number(customer.partnerCount) || 0;
        const productCount = Number(customer.productCount) || 0;
        
        console.log('Processing customer:', customerName, {
          opportunityCount,
          totalOpportunityValue,
          partnerCount
        });
        
        return {
          ...customer,
          name: customerName,
          opportunityCount,
          totalOpportunityValue,
          partnerCount,
          productCount,
          // Ensure all required properties exist
          id: customer.id || 0,
          description: customer.description || '',
          industry: customer.industry || '',
          size: customer.size || '',
          status: customer.status || 'active'
        };
      }).filter(Boolean);
      
      if (processedCustomers.length > 0) {
        console.log('Processed customers:', processedCustomers[0]);
      }
      return processedCustomers;
    } catch (error) {
      console.error('Error processing customers data:', error);
      return [];
    }
  }, [customersResponse?.data]);
  
  // Safe pagination access with proper defaults
  const pagination = customersResponse?.pagination || { 
    page: 1, 
    totalPages: 1, 
    totalCount: 0, 
    hasNextPage: false, 
    hasPreviousPage: false 
  };
  
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const createSavedListMutation = useCreateSavedList();
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedSegmentViews();
  const createSavedViewMutation = useCreateSavedSegmentView();

  // Filter saved lists to only show customer-related lists (client-side filtering)
  const customerSavedListsData = savedListsData.filter((list: any) => 
    list.entity_type === 'customers'
  );

  // Filter and search logic with comprehensive error handling
  const filteredCustomers = customers.filter((customer: any) => {
    try {
      if (!customer || typeof customer !== 'object') return false;
      
      const customerName = customer.name || '';
      const customerIndustry = customer.industry || '';
      const customerSize = customer.size || '';
      const customerStatus = customer.status || 'active';
      const customerId = customer.id || 0;
      
      const matchesSearch = customerName.toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesIndustry = !activeFilters?.industry?.length || activeFilters.industry.includes(customerIndustry);
      const matchesSize = !activeFilters?.size?.length || activeFilters.size.includes(customerSize);
      const matchesStatus = !activeFilters?.status?.length || activeFilters.status.includes(customerStatus);
      
      // Apply list filtering if an active list is selected
      const matchesList = !activeList || !activeList.members || activeList.members.includes(customerId);
      
      return matchesSearch && matchesIndustry && matchesSize && matchesStatus && matchesList;
    } catch (error) {
      console.error('Error filtering customer:', error, customer);
      return false;
    }
  });

  // Handle customer selection with error handling
  const handleCustomerSelect = (customerId: number) => {
    try {
      if (!customerId || typeof customerId !== 'number') return;
      
      setSelectedCustomers(prev => {
        if (!Array.isArray(prev)) return [customerId];
        return prev.includes(customerId) 
          ? prev.filter(id => id !== customerId)
          : [...prev, customerId];
      });
    } catch (error) {
      console.error('Error selecting customer:', error);
    }
  };

  const handleSelectAll = () => {
    try {
      if (!Array.isArray(filteredCustomers) || !Array.isArray(selectedCustomers)) return;
      
      if (selectedCustomers.length === filteredCustomers.length) {
        setSelectedCustomers([]);
      } else {
        const validIds = filteredCustomers
          .filter((c: any) => c && typeof c === 'object' && c.id)
          .map((c: any) => c.id);
        setSelectedCustomers(validIds);
      }
    } catch (error) {
      console.error('Error selecting all customers:', error);
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerFormData.name.trim() || !customerFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const newCustomer = await response.json();
      
      // Invalidate and refetch customers data
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: "Customer Created",
        description: `"${customerFormData.name}" has been created successfully.`
      });

      // Reset form and close modal
      setCustomerFormData({
        name: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        ownerId: null,
        assignedPartnerId: null
      });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Error loading customers: {error.message}</div>
      </div>
    );
  }

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="p-6 space-y-6">
        {/* Unified toolbar - exact copy from Opportunities */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row with saved lists and action buttons */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Left side - Saved Lists with actions */}
              <div className="flex items-center gap-3">
                {/* Lists heading */}
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Customer Lists</span>
                </div>
                
                {/* Saved Lists dropdown - connected to database */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                    onClick={() => setShowListsDropdown(!showListsDropdown)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                      <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                    </svg>
                    <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      {activeList ? activeList.name : "All Customers"}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`transition-transform ${showListsDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {/* Saved Lists dropdown menu */}
                  {showListsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="p-2">
                        {/* Default "All Customers" option */}
                        <button
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-[#F5F6FA] flex items-center justify-between ${!activeList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : ''}`}
                          onClick={() => {
                            setActiveList(null);
                            setShowListsDropdown(false);
                          }}
                        >
                          <span>All Customers</span>
                          <span className="text-gray-500">({customers.length})</span>
                        </button>
                        
                        {/* Saved lists from database (filtered for customers only) */}
                        {customerSavedListsData.map((list: any) => (
<div key={list.id}>
  <button
    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-[#F5F6FA] flex items-center justify-between ${
      activeList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : ''
    }`}
    onClick={() => {
      setActiveList(list);
      setShowListsDropdown(false);
    }}
  >
    <span>{list.name}</span>
    <span className="text-gray-500">({list.members?.length || 0})</span>
  </button>
  {activeList?.id === list.id && (
    <div className="px-3 py-2 border-t border-gray-100 bg-[#F5F6FA]">
      <button
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        onClick={() => {
          setShowListsDropdown(false);
          setShowAccountMappingModal(true);
          // Initialize with all fields selected by default
          setSelectedMappingFields([
            'name',
            'industry',
            'size',
            'status',
            'contactName',
            'contactEmail',
            'location',
            'revenue'
          ]);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        Account Mapping
      </button>
    </div>
  )}
</div>
                        ))}
                        
                        {savedListsData.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            No saved lists yet. Select customers and create your first list.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right-side action buttons */}
              <div className="flex items-center gap-2">
                <FieldsSelector
                  fields={[
                    { key: 'customer', label: 'Customer', required: true },
                    { key: 'product', label: 'Product', required: false },
                    { key: 'partner', label: 'Partner', required: false },
                    { key: 'industry', label: 'Industry', required: false },
                    { key: 'type', label: 'Type', required: false },
                    { key: 'status', label: 'Status', required: false },
                    { key: 'value', label: 'Value', required: false },
                    { key: 'template', label: 'Template', required: false }
                  ]}
                  visibleFields={visibleColumns}
                  onFieldsChange={setVisibleColumns}
                />
                <button 
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] pl-[12px] pr-[12px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
                  onClick={() => {
                    if (!isEditingList) {
                      setShowCreateModal(true);
                    }
                  }}
                  disabled={isEditingList}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create new customer
                </button>
              </div>
            </div>
            
            {/* Bottom row with search, segment views, and filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-grow">
                {/* Search field */}
                <div className="relative w-60">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Saved Segment Views Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowSegmentViewsDropdown(!showSegmentViewsDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-gray-700">
                      {activeView ? activeView.name : 'Select a segment view'}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`transition-transform ${showSegmentViewsDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {showSegmentViewsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1 max-h-64 overflow-y-auto">
                        {savedViewsData.map((view: any) => (
                          <button
                            key={view.id}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                            onClick={() => {
                              setActiveView(view);
                              const filters = view.filters || {};
                              setSearchTerm(filters.search || '');
                              setSelectedStatus(filters.status || 'all');
                              setSelectedIndustry(filters.industry || 'all');
                              setSelectedSize(filters.size || 'all');
                              setSelectedType(filters.type || 'all');
                              setShowSegmentViewsDropdown(false);
                            }}
                          >
                            <span>{view.name}</span>
                          </button>
                        ))}
                        
                        {savedViewsData.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            No saved segment views yet. Apply filters and save your first segment view.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filter button */}
                <div className="relative">
                  <button 
                    className={`flex items-center px-3 h-8 text-sm font-medium border border-[#E6E7F1] rounded-md ${
                      (selectedStatus && selectedStatus !== 'all' || selectedIndustry && selectedIndustry !== 'all' || selectedSize && selectedSize !== 'all' || selectedType && selectedType !== 'all') 
                        ? 'border-[#5567E5] bg-[#F5F6FA] text-[#5567E5]' 
                        : 'border-[#E6E7F1] text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setShowFilterModal(!showFilterModal)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span className="font-medium">
                      {(selectedStatus && selectedStatus !== 'all' || selectedIndustry && selectedIndustry !== 'all' || selectedSize && selectedSize !== 'all' || selectedType && selectedType !== 'all') 
                        ? `Filter (${[selectedStatus, selectedIndustry, selectedSize, selectedType].filter(val => val && val !== 'all').length})` 
                        : 'Filter'
                      }
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-1 transition-transform ${showFilterModal ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Advanced Filter Modal */}
                  {showFilterModal && (
                    <div className="absolute top-full left-0 mt-1 w-[520px] bg-white border border-[#E6E7F1] rounded-lg shadow-lg z-50 p-4">
                      {/* Filter Rows */}
                      <div className="space-y-3">
                        {/* First Filter Row */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 w-12 text-xs">Where</span>
                          <Select value="status" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>Status</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value="equals" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>equals</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="flex-1 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Second Filter Row */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 w-12 text-xs">And</span>
                          <Select value="industry" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>Industry</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value="equals" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>equals</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="flex-1 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Insurance">Insurance</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="Retail">Retail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Third Filter Row */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 w-12 text-xs">And</span>
                          <Select value="size" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>Size</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value="equals" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>equals</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger className="flex-1 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Fourth Filter Row */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 w-12 text-xs">And</span>
                          <Select value="type" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>Type</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value="equals" disabled>
                            <SelectTrigger className="w-20 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue>equals</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="flex-1 h-8 text-xs border-[#E6E7F1]">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Filter Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <button 
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                            onClick={() => {
                              setSelectedStatus('all');
                              setSelectedIndustry('all');
                              setSelectedSize('all');
                              setSelectedType('all');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Clear
                          </button>
                          <button 
                            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add filter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Save Segment View button - appears when filters are applied */}
                {(searchTerm || (selectedStatus && selectedStatus !== 'all') || (selectedIndustry && selectedIndustry !== 'all') || (selectedSize && selectedSize !== 'all') || (selectedType && selectedType !== 'all')) && (
                  <Button
                    onClick={() => setShowSaveSegmentViewModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    size="sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save Segment View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk actions bar - only visible when customers are selected */}
        {selectedCustomers.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-indigo-700 font-medium mr-2">{selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600"
                onClick={() => setSelectedCustomers([])}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                Clear selection
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => setIsNewListDialogOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Add to List
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => {
                  alert('Update customer status functionality will be implemented');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                Update Status
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => {
                  alert('Selected customers can be added to a campaign. This will be available in the Campaigns section');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9 22 2z" />
                </svg>
                Add to Campaign
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => {
                  alert('Assign template functionality will be implemented in future');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Assign Template
              </Button>
            </div>
          </div>
        )}

        {/* Statistics overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold text-[#282A3F]">{pagination.totalCount}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold text-[#282A3F]">
              {customersResponse?.totalOpportunities || 0}
            </div>
            <div className="text-sm text-gray-500">Total Opportunities</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold text-[#282A3F]">
              €{(() => {
                try {
                  return calculateCustomerTotalValue(customers as any[], opportunities as any[]).toLocaleString();
                } catch (error) {
                  console.error('Error calculating total value:', error);
                  return '0';
                }
              })()}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold text-[#282A3F]">
              €{(() => {
                try {
                  return calculateCustomerWeightedValue(customers as any[], opportunities as any[]).toLocaleString();
                } catch (error) {
                  console.error('Error calculating weighted value:', error);
                  return '0';
                }
              })()}
            </div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </div>
        </div>



        {/* Customers table - exact match to Opportunities */}
        <div className="bg-white rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="relative px-3 py-3.5 w-10 pt-[12px] pb-[12px] group">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className={`h-4 w-4 rounded border-gray-300 ${
                        selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                      }`}
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold w-[250px] text-[#696C8C] pt-[12px] pb-[12px]">
                  <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                    Customer
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                {visibleColumns.includes('product') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Product
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('partner') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C] pt-[12px] pb-[12px]">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Partner
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('industry') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C] pt-[12px] pb-[12px]">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Industry
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('type') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C]">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Type
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('status') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Status
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('value') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                      Value
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M8 9l4-4 4 4"></path>
                        <path d="M16 15l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </th>
                )}
                {visibleColumns.includes('template') && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                      Template
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCustomers.map((customer: any) => (
                <tr 
                  key={customer.id}
                  className="hover:bg-gray-50 group border-b border-gray-200"
                >
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleCustomerSelect(customer.id)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                    <div className="flex items-center">
                      <EntityAvatar
                        entityType="customer"
                        entityId={customer.id}
                        fallbackText={customer.name.substring(0, 2).toUpperCase()}
                        className="mr-3"
                        size="md"
                      />
                      <Link href={`/lists/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-indigo-700">{customer.name}</Link>
                    </div>
                  </td>
                  {visibleColumns.includes('product') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-900">
                      {customer.productCount || 0}
                    </td>
                  )}
                  {visibleColumns.includes('partner') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                      <div className="flex flex-col space-y-1">
                        {customer.partnerNames ? (
                          <div className="flex flex-wrap gap-1">
                            {customer.partnerNames.split(', ').map((partnerName: string, index: number) => {
                              const partnerIds = customer.partnerIds ? customer.partnerIds.split(',') : [];
                              const partnerId = partnerIds[index] || '1';
                              return (
                                <Link 
                                  key={index}
                                  href={`/lists/partners/${partnerId}`}
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  {partnerName}{index < customer.partnerNames.split(', ').length - 1 ? ',' : ''}
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-900">No Partner</span>
                        )}
                        <div className="flex space-x-2 text-xs text-gray-500">
                          <span>Partners: {customer.partnerCount || 0}</span>
                          <span>•</span>
                          <span>Opps: {customer.opportunityCount || 0}</span>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('industry') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">Insurance</td>
                  )}
                  {visibleColumns.includes('type') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">Customer</td>
                  )}
                  {visibleColumns.includes('status') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">Active</td>
                  )}
                  {visibleColumns.includes('value') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                      €{customer.totalOpportunityValue ? Number(customer.totalOpportunityValue).toLocaleString() : '0'}
                    </td>
                  )}
                  {visibleColumns.includes('template') && (
                    <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                      <div className="flex space-x-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          NB
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          PR
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.totalCount)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalCount}</span>{' '}
                  customers
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100 disabled:text-gray-300"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum = currentPage;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === currentPage
                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100 disabled:text-gray-300"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* New List Dialog */}
        <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as List</DialogTitle>
              <DialogDescription>
                Create a new saved list with the selected customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name..."
                />
              </div>
              <div>
                <Label htmlFor="list-description">Description (optional)</Label>
                <Textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Enter list description..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={() => {
                  if (newListName.trim()) {
                    createSavedListMutation.mutate({
                      name: newListName,
                      description: newListDescription || null,
                      type: 'manual',
                      entity_type: 'customers',
                      members: selectedCustomers,
                      filters: {},
                      is_shared: false
                    });
                    setNewListName('');
                    setNewListDescription('');
                    setIsNewListDialogOpen(false);
                    setSelectedCustomers([]);
                    toast({
                      title: "List Created",
                      description: `"${newListName}" has been saved with ${selectedCustomers.length} customers.`,
                    });
                  }
                }}
                disabled={createSavedListMutation.isPending}
              >
                {createSavedListMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Segment View Modal */}
        <Dialog open={showSaveSegmentViewModal} onOpenChange={setShowSaveSegmentViewModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Current Segment View</DialogTitle>
              <DialogDescription>
                Save your current search and filter settings as a segment view you can quickly access later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="segment-view-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="segment-view-name"
                  value={segmentViewNameInput}
                  onChange={(e) => setSegmentViewNameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter segment view name..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={async () => {
                  if (segmentViewNameInput.trim()) {
                    await createSavedViewMutation.mutateAsync({
                      name: segmentViewNameInput.trim(),
                      entity_type: 'customers',
                      filters: {
                        search: searchTerm,
                        industry: selectedIndustry && selectedIndustry !== 'all' ? selectedIndustry : undefined,
                        size: selectedSize && selectedSize !== 'all' ? selectedSize : undefined,
                        status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
                        type: selectedType && selectedType !== 'all' ? selectedType : undefined
                      },
                      is_shared: false
                    });
                    setSegmentViewNameInput('');
                    setShowSaveSegmentViewModal(false);
                    toast({
                      title: "Segment View Saved",
                      description: `"${segmentViewNameInput.trim()}" has been saved successfully.`,
                    });
                  }
                }}
                disabled={createSavedViewMutation.isPending || !segmentViewNameInput.trim()}
              >
                {createSavedViewMutation.isPending ? 'Saving...' : 'Save Segment View'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Customer Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database. Fill in all the relevant information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={customerFormData.name}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={customerFormData.description}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the customer"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      value={customerFormData.contactName}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Primary contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={customerFormData.contactEmail}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@customer.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={customerFormData.contactPhone}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Relationship Information Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Relationship Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Account Owner</Label>
                    <Input
                      id="ownerId"
                      type="number"
                      value={customerFormData.ownerId || ''}
                      onChange={(e) => setCustomerFormData(prev => ({ 
                        ...prev, 
                        ownerId: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      placeholder="User ID of account owner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedPartnerId">Assigned Partner</Label>
                    <Input
                      id="assignedPartnerId"
                      type="number"
                      value={customerFormData.assignedPartnerId || ''}
                      onChange={(e) => setCustomerFormData(prev => ({ 
                        ...prev, 
                        assignedPartnerId: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      placeholder="Partner ID if assigned"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustomer} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Account Mapping Wizard Modal */}
        <Dialog open={showAccountMappingModal} onOpenChange={setShowAccountMappingModal}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Account Mapping for "{activeList?.name}"
              </DialogTitle>
              <DialogDescription>
                Configure how customer data is shared when mapping accounts across environments. Select which fields to include in the mapping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* How it works section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  How Account Mapping Works
                </h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Qollabi will only show the person you're sharing with the <strong>overlapping data points</strong> from the selected fields. 
                  Other data points will remain private. When an overlap is spotted, it will be highlighted in each environment 
                  to help identify mutual opportunities and connections.
                </p>
              </div>

              {/* Field selection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Select Fields to Include in Mapping</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'name', label: 'Customer Name', description: 'Company or organization name' },
                    { key: 'industry', label: 'Industry', description: 'Business sector or industry type' },
                    { key: 'size', label: 'Company Size', description: 'Organization size (employees, revenue tier)' },
                    { key: 'status', label: 'Status', description: 'Current relationship status' },
                    { key: 'contactName', label: 'Contact Person', description: 'Primary contact name' },
                    { key: 'contactEmail', label: 'Contact Email', description: 'Primary contact email address' },
                    { key: 'location', label: 'Location', description: 'Geographic location or address' },
                    { key: 'revenue', label: 'Revenue', description: 'Annual revenue or business value' }
                  ].map((field) => (
                    <div key={field.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={field.key}
                        checked={selectedMappingFields.includes(field.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMappingFields(prev => [...prev, field.key]);
                          } else {
                            setSelectedMappingFields(prev => prev.filter(f => f !== field.key));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={field.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                          {field.label}
                        </label>
                        <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                    <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                    <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                    <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                  </svg>
                  Privacy Protection
                </h4>
                <p className="text-green-800 text-sm">
                  Only the selected fields will be used for comparison. All other data remains completely private 
                  and will not be shared or visible to the other party.
                </p>
              </div>

              {/* Recipient selection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Share With</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    The recipient will receive a secure link to view overlapping data points only
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAccountMappingModal(false);
                  setSelectedMappingFields([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                disabled={selectedMappingFields.length === 0}
                onClick={() => {
                  if (selectedMappingFields.length === 0) {
                    toast({
                      title: "Fields required",
                      description: "Please select at least one field to include in the mapping",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  toast({
                    title: "Account Mapping Created",
                    description: `Mapping configured with ${selectedMappingFields.length} fields. Secure sharing link will be generated.`,
                  });
                  
                  setShowAccountMappingModal(false);
                  setSelectedMappingFields([]);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Account Mapping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingContext.Provider>
  );
}