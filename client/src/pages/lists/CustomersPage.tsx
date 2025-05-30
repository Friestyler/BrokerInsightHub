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

// Fetch customers from database
const useCustomersData = () => {
  return useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const response = await fetch('/api/customers');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const text = await response.text();
      console.log('Response text preview:', text.substring(0, 200));
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON response');
      }
    },
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'customers'],
    queryFn: async () => {
      const response = await fetch('/api/saved-lists?entity_type=customers');
      if (!response.ok) throw new Error('Failed to fetch saved lists');
      return response.json();
    }
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      const response = await fetch('/api/saved-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });
      if (!response.ok) throw new Error('Failed to create list');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
    }
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'customers'],
    queryFn: async () => {
      const response = await fetch('/api/saved-views?entity_type=customers');
      if (!response.ok) throw new Error('Failed to fetch saved views');
      return response.json();
    }
  });
};

const useCreateSavedView = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newView: any) => {
      const response = await fetch('/api/saved-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newView)
      });
      if (!response.ok) throw new Error('Failed to create view');
      return response.json();
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
  
  // Views state
  const [activeView, setActiveView] = useState<any>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  
  // Filter dropdown states
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showIndustryFilter, setShowIndustryFilter] = useState(false);
  
  // Data fetching
  const { data: customers = [], isLoading, error } = useCustomersData();
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const createSavedListMutation = useCreateSavedList();
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedViews();
  const createSavedViewMutation = useCreateSavedView();

  // Filter and search logic
  const filteredCustomers = customers.filter((customer: any) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = activeFilters.industry.length === 0 || activeFilters.industry.includes(customer.industry);
    const matchesSize = activeFilters.size.length === 0 || activeFilters.size.includes(customer.size);
    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(customer.status || 'active');
    
    // Apply list filtering if an active list is selected
    const matchesList = !activeList || (activeList.members && activeList.members.includes(customer.id));
    
    return matchesSearch && matchesIndustry && matchesSize && matchesStatus && matchesList;
  });

  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c: any) => c.id));
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
        {/* Header - exact match to Opportunities */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-black">Customers</h1>
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

        {/* Unified toolbar - exact copy from Opportunities */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row with saved lists and action buttons */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Left side - Saved Lists with actions */}
              <div className="flex items-center gap-3">
                {/* Lists heading */}
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
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
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 flex items-center justify-between ${!activeList ? 'bg-blue-50 text-blue-600' : ''}`}
                          onClick={() => {
                            setActiveList(null);
                            setShowListsDropdown(false);
                          }}
                        >
                          <span>All Customers</span>
                          <span className="text-gray-500">({customers.length})</span>
                        </button>
                        
                        {/* Saved lists from database */}
                        {savedListsData.map((list: any) => (
                          <button
                            key={list.id}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 flex items-center justify-between ${activeList?.id === list.id ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => {
                              setActiveList(list);
                              setShowListsDropdown(false);
                            }}
                          >
                            <span>{list.name}</span>
                            <span className="text-gray-500">({list.members?.length || 0})</span>
                          </button>
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
                <Button variant="outline" size="sm" className="hidden md:flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export
                </Button>
              </div>
            </div>
            
            {/* Bottom row with search, views, and filters */}
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
                
                {/* Saved Views Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-gray-700">
                      {activeView ? activeView.name : 'Select a view'}
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
                      className={`transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {showViewsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1 max-h-64 overflow-y-auto">
                        {savedViewsData.map((view: any) => (
                          <button
                            key={view.id}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                            onClick={() => {
                              setActiveView(view);
                              const filters = view.filters || {};
                              setSearchTerm(filters.search || '');
                              setActiveFilters({
                                industry: filters.industry || [],
                                size: filters.size || [],
                                status: filters.status || []
                              });
                              setShowViewsDropdown(false);
                            }}
                          >
                            <span>{view.name}</span>
                          </button>
                        ))}
                        
                        {savedViewsData.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            No saved views yet. Apply filters and save your first view.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filter buttons next to the views dropdown */}
                <div className="flex items-center gap-2 ml-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <button 
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        activeFilters.status.length > 0 
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <span>Status {activeFilters.status.length > 0 && `(${activeFilters.status.length})`}</span>
                    </button>
                    
                    {showStatusFilter && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {['active', 'inactive', 'pending'].map((status) => (
                            <label key={status} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 mr-2"
                                checked={activeFilters.status.includes(status)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      status: [...prev.status, status]
                                    }));
                                  } else {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      status: prev.status.filter(s => s !== status)
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm capitalize">{status}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Type Filter */}
                  <div className="relative">
                    <button 
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        activeFilters.size.length > 0 
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setShowTypeFilter(!showTypeFilter)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <span>Size {activeFilters.size.length > 0 && `(${activeFilters.size.length})`}</span>
                    </button>
                    
                    {showTypeFilter && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {['small', 'medium', 'large', 'enterprise'].map((size) => (
                            <label key={size} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 mr-2"
                                checked={activeFilters.size.includes(size)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      size: [...prev.size, size]
                                    }));
                                  } else {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      size: prev.size.filter(s => s !== size)
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm capitalize">{size}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Industry Filter */}
                  <div className="relative">
                    <button 
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        activeFilters.industry.length > 0 
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setShowIndustryFilter(!showIndustryFilter)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <span>Industry {activeFilters.industry.length > 0 && `(${activeFilters.industry.length})`}</span>
                    </button>
                    
                    {showIndustryFilter && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {['Technology', 'Insurance', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'].map((industry) => (
                            <label key={industry} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 mr-2"
                                checked={activeFilters.industry.includes(industry)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      industry: [...prev.industry, industry]
                                    }));
                                  } else {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      industry: prev.industry.filter(i => i !== industry)
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm">{industry}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Save View button - appears when filters are applied */}
                {(searchTerm || activeFilters.industry.length > 0 || activeFilters.size.length > 0 || activeFilters.status.length > 0) && (
                  <Button
                    onClick={() => setShowSaveViewModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    size="sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selection actions bar - visible when items are selected */}
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

        {/* Statistics overview - exact match to Opportunities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">{filteredCustomers.length}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">1</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">€10K</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-xl font-semibold">€5K</div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </div>
        </div>



        {/* Customers table - exact match to Opportunities */}
        <div className="overflow-hidden bg-white sm:rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative px-3 py-3.5 w-10 pt-[12px] pb-[12px]">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold w-[250px] text-[#696C8C] pt-[12px] pb-[12px]">
                  <div className="flex items-center text-[#696C8C] text-[13px] font-medium">
                    Customer
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C] pt-[12px] pb-[12px]">
                  <div className="flex items-center text-[13px] font-medium text-[#696C8C]">
                    Partner
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C] pt-[12px] pb-[12px]">
                  <div className="flex items-center text-[13px] font-medium text-[#696C8C]">
                    Industry
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C]">
                  <div className="flex items-center text-[13px] font-medium text-[#696C8C]">
                    Type
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center text-[13px] font-medium text-[#696C8C]">
                    Status
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center text-[13px] font-medium text-[#696C8C]">
                    Value
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M8 9l4-4 4 4"></path>
                      <path d="M16 15l-4 4-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center text-[#696C8C] text-[13px] font-medium">
                    Template
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCustomers.map((customer: any) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 group"
                >
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleCustomerSelect(customer.id)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium w-[250px]">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {customer.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    {customer.partnerNames || 'No Partner'}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">Insurance</td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">Customer</td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">Active</td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">€10,000</td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <div className="flex space-x-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs font-medium">
                          NB
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
                          PR
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

        {/* Save View Modal */}
        <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Current View</DialogTitle>
              <DialogDescription>
                Save your current search and filter settings as a view you can quickly access later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="view-name"
                  value={viewNameInput}
                  onChange={(e) => setViewNameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter view name..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={async () => {
                  if (viewNameInput.trim()) {
                    await createSavedViewMutation.mutateAsync({
                      name: viewNameInput.trim(),
                      entity_type: 'customers',
                      filters: {
                        search: searchTerm,
                        industry: activeFilters.industry,
                        size: activeFilters.size,
                        status: activeFilters.status
                      },
                      is_shared: false
                    });
                    setViewNameInput('');
                    setShowSaveViewModal(false);
                    toast({
                      title: "View Saved",
                      description: `"${viewNameInput.trim()}" has been saved successfully.`,
                    });
                  }
                }}
                disabled={createSavedViewMutation.isPending || !viewNameInput.trim()}
              >
                {createSavedViewMutation.isPending ? 'Saving...' : 'Save View'}
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
      </div>
    </ListEditingContext.Provider>
  );
}