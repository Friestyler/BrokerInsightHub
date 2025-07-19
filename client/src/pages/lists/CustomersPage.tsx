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
  
  // State management
  const [isEditingList, setIsEditingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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

  const formatCurrency = (value: number) => {
    return `€${Math.round(value).toLocaleString()}`;
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

      {/* Customers table - without toolbar functionalities */}
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
                  onClick={() => window.location.href = `/customers/${customer.id}`}
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
