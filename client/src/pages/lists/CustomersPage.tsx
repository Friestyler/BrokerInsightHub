import { useState, useEffect, useMemo, createContext, useContext, useRef } from 'react';
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
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
import { 
  ChevronDown,
  List,
  BarChart3,
  Settings,
  Filter,
  Users, 
  Download, 
  Plus, 
  UserPlus,
  Trash2,
  MoreVertical,
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  DollarSign
} from 'lucide-react';

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

// Fetch customers from database with pagination and search
const useCustomersData = (page: number = 1, limit: number = 100, search: string = '', filters: any = {}) => {
  return useQuery({
    queryKey: ['/api/customers', page, limit, search, filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search && search.length >= 2) params.append('search', search);
        if (filters.industry && filters.industry.length > 0) params.append('industry', filters.industry.join(','));
        if (filters.size && filters.size.length > 0) params.append('size', filters.size.join(','));
        if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));
        
        const result = await apiRequest('GET', `/api/customers?${params.toString()}`);
        return result;
      } catch (error) {
        console.error('Error fetching customers:', error);
        return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
      }
    },
    enabled: !search || search.length >= 2, // Only search if term is >= 2 characters
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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

interface CustomersPageCleanProps {
  smartListFilter?: any;
}

export default function CustomersPageClean({ smartListFilter }: CustomersPageCleanProps = {}) {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enhanced state management for the new functionality
  const [isEditingList, setIsEditingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    industry: [] as string[],
    size: [] as string[],
    status: [] as string[]
  });
  
  // Enhanced filtering and UI state
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [filterText, setFilterText] = useState('');
  
  // Segment View state
  const [activeView, setActiveView] = useState<any>(null);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  
  // Fields state
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [visibleFields, setVisibleFields] = useState({
    name: true,
    industry: true,
    size: true,
    status: true,
    partner: true,
    opportunities: true,
    value: true,
    template: true
  });
  
  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    industry: 'All',
    size: 'All'
  });
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Original state for change detection
  const [originalFilters, setOriginalFilters] = useState<any>(null);
  const [originalVisibleFields, setOriginalVisibleFields] = useState<any>(null);
  
  // Helper functions for enhanced functionality
  const hasChanges = () => {
    if (!originalFilters || !originalVisibleFields) return false;
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(originalFilters);
    const fieldsChanged = JSON.stringify(visibleFields) !== JSON.stringify(originalVisibleFields);
    return filtersChanged || fieldsChanged;
  };
  
  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setHasActiveFilters(value !== 'All' || Object.values(filters).some(v => v !== 'All'));
  };
  
  const clearFilters = () => {
    setFilters({ status: 'All', industry: 'All', size: 'All' });
    setHasActiveFilters(false);
  };
  
  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node) &&
          viewsButtonRef.current && !viewsButtonRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Set original state when view is selected
  useEffect(() => {
    if (activeView && !originalFilters && !originalVisibleFields) {
      setOriginalFilters({ ...filters });
      setOriginalVisibleFields({ ...visibleFields });
    }
  }, [activeView, filters, visibleFields, originalFilters, originalVisibleFields]);
  
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

  // Debounce search term to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeFilters]);

  // Legacy column visibility (keeping for compatibility)
  const [visibleColumns, setVisibleColumns] = useState([
    'customer', 'product', 'partner', 'industry', 'type', 'status', 'value', 'template'
  ]);

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Data fetching with pagination, search, and filters
  const { data: customersResponse, isLoading, error } = useCustomersData(currentPage, itemsPerPage, debouncedSearchTerm, activeFilters);
  
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

  // Since we're doing server-side filtering, use customers directly
  const filteredCustomers = customers;

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

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

  // Calculate statistics
  const stats = {
    totalCustomers: pagination.totalCount || 0,
    totalOpportunities: customersResponse?.totalOpportunities || 0,
    totalValue: calculateCustomerTotalValue(customers as any[], opportunities as any[]),
    weightedValue: calculateCustomerWeightedValue(customers as any[], opportunities as any[])
  };



  return (
    <div className="space-y-1">
      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-4 py-6">
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalCustomers}</div>
            <div className="text-gray-500 font-medium text-[13px]">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalOpportunities}</div>
            <div className="text-sm text-gray-500">Total Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(stats.weightedValue)}</div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Toolbar Section */}
      <div className="mx-4 space-y-2">
        {/* Top Row: Chevron + Lists Dropdown and Top-Right Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Chevron with Lists Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[#5567E5] hover:bg-[#5567E5]/10"
                onClick={() => setShowListsDropdown(!showListsDropdown)}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="ml-1 text-sm font-medium">
                  {activeList ? activeList.name : 'All Customers'}
                </span>
              </Button>
              
              {showListsDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#E6E7F1] rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#282A3F] hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setActiveList(null);
                        setShowListsDropdown(false);
                      }}
                    >
                      <List className="h-4 w-4" />
                      All Customers
                    </div>
                    
                    {customerSavedListsData.map((list: any) => (
                      <div
                        key={list.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#282A3F] hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => {
                          setActiveList(list);
                          setShowListsDropdown(false);
                        }}
                      >
                        <List className="h-4 w-4" />
                        {list.name}
                        <span className="text-xs text-gray-500 ml-auto">({list.item_count || 0})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls - Segment View, Fields, Filter */}
          <div className="flex items-center gap-2">
            {/* Segment View Dropdown */}
            <div className="relative">
              <Button
                ref={viewsButtonRef}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[#282A3F] hover:bg-gray-50 border border-[#E6E7F1]"
                onClick={() => setShowViewsDropdown(!showViewsDropdown)}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {activeView ? activeView.name : 'Segment View'}
                </span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
              
              {showViewsDropdown && (
                <div ref={viewsDropdownRef} className="absolute top-full right-0 mt-1 w-56 bg-white border border-[#E6E7F1] rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {savedViewsData.length > 0 && (
                      <>
                        {savedViewsData.map((view: any) => (
                          <div
                            key={view.id}
                            className="flex items-center justify-between px-3 py-2 text-sm text-[#282A3F] hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => {
                              setActiveView(view);
                              setShowViewsDropdown(false);
                            }}
                          >
                            <span>{view.name}</span>
                            {hasChanges() && (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  Revert changes
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#5567E5]">
                                  Save changes
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        <hr className="my-2 border-[#E6E7F1]" />
                      </>
                    )}
                    <div
                      className="px-3 py-2 text-sm text-[#5567E5] hover:bg-[#5567E5]/10 rounded cursor-pointer"
                      onClick={() => {
                        setShowSaveViewModal(true);
                        setShowViewsDropdown(false);
                      }}
                    >
                      + New view
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fields Dropdown */}
            <DropdownMenu open={showFieldsDropdown} onOpenChange={setShowFieldsDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-[#282A3F] hover:bg-gray-50 border border-[#E6E7F1]"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="text-sm">Fields</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-[#E6E7F1]">
                <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
                  Show Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#E6E7F1]" />
                {Object.entries(visibleFields).map(([field, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={field}
                    checked={visible}
                    onCheckedChange={(checked) => {
                      setVisibleFields(prev => ({ ...prev, [field]: checked }));
                    }}
                    className="text-sm capitalize"
                  >
                    {field === 'opportunities' ? 'Opportunities' : field}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 border border-[#E6E7F1] ${hasActiveFilters ? 'text-[#5567E5] bg-[#5567E5]/10' : 'text-[#282A3F] hover:bg-gray-50'}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-sm">Filter</span>
              {hasActiveFilters && <div className="w-2 h-2 bg-[#5567E5] rounded-full ml-2" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 border-[#E6E7F1] focus:border-[#5567E5] focus:ring-[#5567E5]"
            />
          </div>
        </div>

        {/* Filter Panel (appears when Filter button is clicked) */}
        {showFilter && (
          <div className="bg-gray-50 border border-[#E6E7F1] rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-[#282A3F] mb-2 block">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="h-8 border-[#E6E7F1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-[#282A3F] mb-2 block">Industry</Label>
                <Select value={filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
                  <SelectTrigger className="h-8 border-[#E6E7F1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Industries</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-[#282A3F] mb-2 block">Size</Label>
                <Select value={filters.size} onValueChange={(value) => updateFilter('size', value)}>
                  <SelectTrigger className="h-8 border-[#E6E7F1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sizes</SelectItem>
                    <SelectItem value="Small">Small (1-50)</SelectItem>
                    <SelectItem value="Medium">Medium (51-250)</SelectItem>
                    <SelectItem value="Large">Large (251+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#282A3F] hover:bg-gray-100"
              >
                Clear all filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilter(false)}
                className="text-[#5567E5] hover:bg-[#5567E5]/10"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customers table */}
      <div className="mx-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E7F1] text-left">
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Customer</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Industry</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Size</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Status</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Partner</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Opportunities</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Value</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Template</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: any) => (
                <tr 
                  key={customer.id} 
                  className="border-b border-[#E6E7F1] hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/lists/customers/${customer.id}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <EntityAvatar entity={{ name: customer.name, id: customer.id }} />
                      <div>
                        <div className="font-medium text-[#282A3F] text-sm">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{customer.industry || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{customer.size || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                      {customer.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{customer.partnerNames || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{customer.opportunityCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{formatCurrency(customer.totalValue || 0)}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">No templates</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
