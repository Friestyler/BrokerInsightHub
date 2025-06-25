import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Package2, Plus, Search, Tag, ChevronDown, Filter, X, Edit3, Trash2, Share, Archive, MoreHorizontal, Building2, Briefcase, Users } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import CategoryManagerForProducts from "@/components/CategoryManagerForProducts";

// Fetch products from database
const useProductsData = () => {
  return useQuery({
    queryKey: ['/api/products'],
    staleTime: 0, // Force fresh data to show updated relationship counts
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'products'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=products'),
    staleTime: 0, // Always fetch fresh data for lists to see immediate updates
    gcTime: 0, // No cache to ensure immediate updates
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'products'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=products'),
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedList = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-lists', data);
    },
    onSuccess: () => {
      // Clear cache for immediate updates
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'products'] });
    }
  });
};

const useUpdateSavedList = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest('PUT', `/api/saved-lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
    }
  });
};

const useDeleteSavedList = () => {
  return useMutation({
    mutationFn: async (listId: number) => {
      return apiRequest('DELETE', `/api/saved-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'products'] });
    }
  });
};

const useCreateSavedView = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-views', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'products'] });
    }
  });
};

// Product type interface
type Product = {
  id: number;
  productId?: string;
  productid?: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: number;
  categoryid?: number;
  
  // Provider information
  provider?: string;
  providerId?: number;
  providerType?: string;
  providerName?: string;
  providername?: string;
  providertype?: string;
  
  // Contract information
  contractStartDate?: string;
  contractEndDate?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contractstartdate?: string;
  contractenddate?: string;
  
  // Financial information
  totalValue?: string;
  premiumValue?: string;
  premiumPercentage?: string;
  discount?: string;
  discountPercentage?: string;
  total_value?: string;
  premium_value?: string;
  premium_percentage?: string;
  discount_percentage?: string;
  totalvalue?: string;
  premiumvalue?: string;
  premiumpercentage?: string;
  discountpercentage?: string;
  
  // Legacy fields
  sku: string | null;
  price: number | null;
  vendorId: number | null;
  
  // Linking fields
  customerId?: number;
  opportunityId?: number;
  partnerId?: number;
  
  // Relationship counts
  customerCount?: number;
  partnerCount?: number;
  opportunityCount?: number;
  customercount?: number;
  partnercount?: number;
  opportunitycount?: number;
  
  // Metadata
  isActive?: boolean;
  status?: string;
  notes?: string;
  tags?: string[];
  
  createdAt: string;
  updatedAt: string;
};

// Define interface for saved lists
interface SavedList {
  id: string;
  name: string;
  description?: string;
  type?: 'filter' | 'selection';
  filters: {
    searchText?: string;
    status?: string;
    category?: string;
    provider?: string;
  };
  members?: number[];
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
}

// Define interface for saved views
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    category?: string;
    provider?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

function ProductsTable() {
  // Fetch products from database
  const { data: products = [], isLoading, error } = useProductsData();
  
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Dropdown state for filters
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Saved lists and views functionality
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedViews();
  const createSavedListMutation = useCreateSavedList();
  const updateSavedListMutation = useUpdateSavedList();
  const deleteSavedListMutation = useDeleteSavedList();
  const createSavedViewMutation = useCreateSavedView();
  const { toast } = useToast();

  // Filter saved lists to only show product-related lists
  const productSavedListsData = savedListsData.filter((list: any) => 
    list.entity_type === 'products'
  );

  // Convert database records to local interface format
  const savedLists: SavedList[] = [
    // Default "All Products" list
    {
      id: 'all-products',
      name: 'All Products',
      type: 'filter',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true
    },
    // Add filtered database records (only product lists)
    ...productSavedListsData.map((list: any) => ({
      id: list.id.toString(),
      name: list.name,
      description: list.description,
      type: list.type as 'filter' | 'selection',
      filters: list.filters || {},
      members: list.members || [],
      isShared: list.is_shared,
      createdBy: list.created_by,
      createdAt: new Date(list.created_at),
      isDefault: list.is_default
    }))
  ];

  const savedViews: SavedView[] = savedViewsData.map((view: any) => ({
    id: view.id.toString(),
    name: view.name,
    description: view.description,
    filters: view.filters || {},
    createdBy: view.created_by,
    createdAt: new Date(view.created_at)
  }));

  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  
  // Form states for creating lists/views
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListType, setNewListType] = useState<'filter' | 'selection'>('filter');
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  
  // Sorting state
  const [tableSortConfig, setTableSortConfig] = useState({
    key: '',
    direction: 'asc' as 'asc' | 'desc'
  });
  
  // Handle table sorting
  const handleSort = (key: string) => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Use the shared context for list editing state
  const { isEditingList, setIsEditingList } = useListEditing();
  
  // Filter products based on search and filters
  const filteredProducts = products.filter((product: Product) => {
    const matchesText = !filterText || 
      product.name.toLowerCase().includes(filterText.toLowerCase()) ||
      product.category.toLowerCase().includes(filterText.toLowerCase()) ||
      (product.provider || product.providername || '').toLowerCase().includes(filterText.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesProvider = selectedProvider === 'all' || 
      (product.provider || product.providername || '') === selectedProvider;
    
    return matchesText && matchesStatus && matchesCategory && matchesProvider;
  });

  // Get displayed products (filtered by active list if applicable)
  const displayedProducts = activeList?.type === 'selection' && activeList.members 
    ? filteredProducts.filter(p => activeList.members!.includes(p.id))
    : filteredProducts;

  // Toggle product selection
  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedProducts.length === displayedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };

  // Handle list selection and changes
  const handleListSelect = (list: SavedList | null) => {
    if (hasUnsavedChanges && originalListFilters) {
      // Reset to original filters if there are unsaved changes
      if (originalListFilters.searchText !== undefined) setFilterText(originalListFilters.searchText);
      if (originalListFilters.status !== undefined) setSelectedStatus(originalListFilters.status);
      if (originalListFilters.category !== undefined) setSelectedCategory(originalListFilters.category);
      if (originalListFilters.provider !== undefined) setSelectedProvider(originalListFilters.provider);
    }
    
    setActiveList(list);
    setHasUnsavedChanges(false);
    setOriginalListFilters(null);
    
    if (list && list.filters) {
      // Store original filters for comparison
      setOriginalListFilters(list.filters);
      
      // Apply the list's filters
      setFilterText(list.filters.searchText || '');
      setSelectedStatus(list.filters.status || 'all');
      setSelectedCategory(list.filters.category || 'all');
      setSelectedProvider(list.filters.provider || 'all');
    } else {
      // Reset all filters for "All Products"
      setFilterText('');
      setSelectedStatus('all');
      setSelectedCategory('all');
      setSelectedProvider('all');
    }
    
    setShowListsDropdown(false);
  };

  const handleSaveList = async () => {
    if (!newListName.trim()) return;
    
    const listData = {
      name: newListName,
      description: newListDescription,
      entity_type: 'products',
      type: newListType,
      filters: {
        searchText: filterText,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        provider: selectedProvider !== 'all' ? selectedProvider : undefined,
      },
      members: newListType === 'selection' ? selectedProducts : undefined,
      is_shared: false,
      created_by: 'Current User'
    };
    
    try {
      await createSavedListMutation.mutateAsync(listData);
      toast({
        title: "Success",
        description: "List saved successfully",
      });
      setShowSaveListModal(false);
      setNewListName('');
      setNewListDescription('');
      setNewListType('filter');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save list",
        variant: "destructive",
      });
    }
  };

  const handleSaveView = async () => {
    if (!newViewName.trim()) return;
    
    const viewData = {
      name: newViewName,
      description: newViewDescription,
      entity_type: 'products',
      filters: {
        searchText: filterText,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        provider: selectedProvider !== 'all' ? selectedProvider : undefined,
      },
      created_by: 'Current User'
    };
    
    try {
      await createSavedViewMutation.mutateAsync(viewData);
      toast({
        title: "Success",
        description: "View saved successfully",
      });
      setShowSaveViewModal(false);
      setNewViewName('');
      setNewViewDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save view",
        variant: "destructive",
      });
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (listId === 'all-products') return; // Can't delete default list
    
    try {
      await deleteSavedListMutation.mutateAsync(parseInt(listId));
      toast({
        title: "Success",
        description: "List deleted successfully",
      });
      if (activeList?.id === listId) {
        setActiveList(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete list",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading products</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Unified toolbar with saved lists */}
      <div className="bg-white p-2 rounded-lg mx-4">
        <div className="flex flex-col gap-4">
          {/* Top row with saved lists and action buttons */}
          <div className="flex flex-wrap items-center justify-between">
            {/* Left side - Saved Lists with actions */}
            <div className="flex items-center gap-3">
              {/* Lists heading */}
              <div className="flex items-center mr-2">
                <span className="text-base font-semibold text-gray-800">Product Lists</span>
              </div>
              {/* Saved Lists dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 px-4 py-2.5 border border-[#E6E7F1] rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                    <path d="M2 3.5H12M2 7H12M2 10.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>{activeList ? activeList.name : 'All Products'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Lists Dropdown */}
                {showListsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-2">
                      {savedLists.map((list) => (
                        <div key={list.id} className="flex items-center justify-between group">
                          <button
                            className={`flex-1 text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                              (activeList?.id === list.id || (!activeList && list.id === 'all-products')) 
                                ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                                : 'text-gray-700'
                            }`}
                            onClick={() => handleListSelect(list)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{list.name}</span>
                              {list.isShared && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-blue-500">
                                  <path d="M8 3V2C8 1.45 7.55 1 7 1H2C1.45 1 1 1.45 1 2V7C1 7.55 1.45 8 2 8H3M5 4H10C10.55 4 11 4.45 11 5V10C11 10.55 10.55 11 10 11H5C4.45 11 4 10.55 4 10V5C4 4.45 4.45 4 5 4Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </button>
                          {!list.isDefault && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Views dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 px-4 py-2.5 border border-[#E6E7F1] rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                    <path d="M1 3C1 2.45 1.45 2 2 2H12C12.55 2 13 2.45 13 3V11C13 11.55 12.55 12 12 12H2C1.45 12 1 11.55 1 11V3Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M1 5H13" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  <span>Views ({savedViews.length})</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Views Dropdown */}
                {showViewsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-2">
                      {savedViews.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No saved views</div>
                      ) : (
                        savedViews.map((view) => (
                          <button
                            key={view.id}
                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] text-gray-700"
                            onClick={() => {
                              // Apply view filters
                              setFilterText(view.filters.searchText || '');
                              setSelectedStatus(view.filters.status || 'all');
                              setSelectedCategory(view.filters.category || 'all');
                              setSelectedProvider(view.filters.provider || 'all');
                              setShowViewsDropdown(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{view.name}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save current filters as list/view */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowSaveListModal(true)}
                >
                  Save as List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowSaveViewModal(true)}
                >
                  Save as View
                </Button>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8">
                Create new product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex items-center justify-between mx-4 py-2">
        <div className="flex items-center gap-4">
          {/* Search field */}
          <div className="relative w-60">
            <input
              type="text"
              placeholder="Search products..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-3 pr-10 h-8 border border-[#E6E7F1] rounded-md text-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="h-8 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {(filterText || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedProvider !== 'all') && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {[filterText, selectedStatus !== 'all' ? 1 : 0, selectedCategory !== 'all' ? 1 : 0, selectedProvider !== 'all' ? 1 : 0].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Filter Dropdown */}
            {showFilterModal && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-[#E6E7F1] rounded-lg shadow-lg z-50 p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Search</Label>
                    <Input
                      placeholder="Search products..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Array.from(new Set(products.map(p => p.category))).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {Array.from(new Set(products.map(p => p.provider || p.providername || '').filter(Boolean))).map(provider => (
                          <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterText('');
                        setSelectedStatus('all');
                        setSelectedCategory('all');
                        setSelectedProvider('all');
                      }}
                    >
                      Clear all
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowFilterModal(false)}
                    >
                      Apply filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white overflow-x-auto rounded-lg mx-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10 pt-[12px] pb-[12px] group">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${
                      selectedProducts.length > 0 ? 'visible' : 'invisible group-hover:visible'
                    }`}
                    checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
              <SortableTableHead 
                sortKey="name" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[250px]"
              >
                Product
              </SortableTableHead>
              <SortableTableHead 
                sortKey="category" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Category
              </SortableTableHead>
              <SortableTableHead 
                sortKey="provider" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Provider
              </SortableTableHead>
              <SortableTableHead 
                sortKey="totalValue" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Total Value
              </SortableTableHead>
              <SortableTableHead 
                sortKey="customers" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Customers
              </SortableTableHead>
              <SortableTableHead 
                sortKey="partners" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Partners
              </SortableTableHead>
              <SortableTableHead 
                sortKey="opportunities" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Opportunities
              </SortableTableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {displayedProducts.map((product) => (
              <tr 
                key={product.id} 
                className={`hover:bg-gray-50 group ${
                  selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${
                      selectedProducts.includes(product.id) ? 'visible' : 'invisible group-hover:visible'
                    }`}
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectProduct(product.id);
                    }}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <div className="flex items-center">
                    <Package2 className="mr-3 h-5 w-5 text-gray-400" />
                    <Link href={`/lists/products/${product.id}`} className="font-medium text-gray-900 hover:text-indigo-700">
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant="outline">
                    {product.category}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    <div className="font-medium">{product.provider || product.providername || "—"}</div>
                    {product.providertype && product.providertype !== (product.provider || product.providername) && (
                      <div className="text-gray-500 capitalize">{product.providertype}</div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm font-medium">
                    {(product.total_value || product.totalvalue || product.totalValue) ? 
                      `€${parseFloat(product.total_value || product.totalvalue || product.totalValue).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {product.customercount || product.customerCount || 0}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                    {product.partnercount || product.partnerCount || 0}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    {product.opportunitycount || product.opportunityCount || 0}
                  </span>
                </td>
              </tr>
            ))}
            
            {displayedProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    <Package2 className="h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      There are no products matching your filter criteria.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setFilterText('');
                        setSelectedStatus('all');
                        setSelectedCategory('all');
                        setSelectedProvider('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as List</DialogTitle>
            <DialogDescription>
              Save your current filters and selection as a reusable list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div>
              <Label htmlFor="list-description">Description (optional)</Label>
              <Textarea
                id="list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="list-type">List Type</Label>
              <Select value={newListType} onValueChange={(value: 'filter' | 'selection') => setNewListType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filter">Filter-based</SelectItem>
                  <SelectItem value="selection">Selection-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveListModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveList} disabled={!newListName.trim()}>
              Save List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as View</DialogTitle>
            <DialogDescription>
              Save your current filters as a reusable view.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name"
              />
            </div>
            <div>
              <Label htmlFor="view-description">Description (optional)</Label>
              <Textarea
                id="view-description"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveViewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!newViewName.trim()}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isEditingList, setIsEditingList] = useState(false);

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="flex-1">
        {/* Tab Navigation */}
        <div className="bg-white">
          <div className="px-6 py-4">
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 ${
                  activeTab === 'products' 
                    ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                    : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                }`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </Button>
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 ${
                  activeTab === 'categories' 
                    ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                    : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                }`}
                onClick={() => setActiveTab('categories')}
              >
                Categories
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'products' && <ProductsTable />}
          {activeTab === 'categories' && (
            <div className="p-6 space-y-4">
              <CategoryManagerForProducts />
            </div>
          )}
        </div>
      </div>
    </ListEditingContext.Provider>
  );
}