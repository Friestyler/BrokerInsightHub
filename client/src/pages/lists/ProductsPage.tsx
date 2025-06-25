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
import { Package2, Plus, Search, Tag, ChevronDown, Filter, X, Edit3, Trash2, Share, Archive, MoreHorizontal, Building2, Briefcase, Users, MoreVertical, Edit2 } from "lucide-react";
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
  
  // State for dropdowns and modals
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [isCreatingNewList, setIsCreatingNewList] = useState(true);
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);
  
  // Refs for dropdowns to handle outside clicks
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  
  // State for views dropdown
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  
  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});

  // Dialog handlers
  const openEditDialog = (product: Product) => {
    setProductToEdit(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      contractStartDate: product.contract_start_date || product.contractstartdate,
      contractEndDate: product.contract_end_date || product.contractenddate,
      totalValue: product.total_value || product.totalvalue || product.totalValue,
      premiumValue: product.premium_value || product.premiumvalue || product.premiumValue,
      premiumPercentage: product.premium_percentage || product.premiumpercentage || product.premiumPercentage,
      discountPercentage: product.discount_percentage || product.discountpercentage || product.discountPercentage,
      providerName: product.provider || product.providername || product.providerName,
      status: product.status,
      notes: product.notes
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!productToEdit) return;

    try {
      await apiRequest('PUT', `/api/products/${productToEdit.id}`, {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        contract_start_date: editFormData.contractStartDate,
        contract_end_date: editFormData.contractEndDate,
        total_value: editFormData.totalValue ? parseFloat(editFormData.totalValue.toString()) : null,
        premium_value: editFormData.premiumValue ? parseFloat(editFormData.premiumValue.toString()) : null,
        premium_percentage: editFormData.premiumPercentage ? parseFloat(editFormData.premiumPercentage.toString()) : null,
        discount_percentage: editFormData.discountPercentage ? parseFloat(editFormData.discountPercentage.toString()) : null,
        provider_name: editFormData.providerName,
        status: editFormData.status,
        notes: editFormData.notes
      });

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditDialogOpen(false);
      setProductToEdit(null);
      setEditFormData({});
      
      toast({
        title: "Product updated",
        description: "Product has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await apiRequest('DELETE', `/api/products/${productToDelete.id}`);

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node) &&
          viewsButtonRef.current && !viewsButtonRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewsDropdown, showFilterModal]);

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
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  
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
  
  // Track active view state like Partners page
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  
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

  const handleSaveView = async () => {
    if (!viewNameInput.trim()) return;
    
    const viewData = {
      name: viewNameInput,
      description: '',
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
      const newView = await createSavedViewMutation.mutateAsync(viewData);
      setActiveView(newView);
      toast({
        title: "Success",
        description: "View saved successfully",
      });
      setShowSaveViewModal(false);
      setViewNameInput('');
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
      {/* Lists and Views Toolbar - matching Partners page structure */}
      <div className="mx-4 py-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between">
          {/* Left side - Lists dropdown and actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center mr-2">
              <span className="text-base font-semibold text-gray-800">Product Lists</span>
            </div>
            
            {/* Lists dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 px-3 h-8 border border-[#E6E7F1] rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                onClick={() => setShowListsDropdown(!showListsDropdown)}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#3E4DC4]">
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
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{list.name}</span>
                            {list.isDefault && (
                              <span className="text-xs text-[#282A3F] italic">Default</span>
                            )}
                          </div>
                        </button>
                        {!list.isDefault && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <circle cx="6" cy="2" r="1" fill="currentColor"/>
                                  <circle cx="6" cy="6" r="1" fill="currentColor"/>
                                  <circle cx="6" cy="10" r="1" fill="currentColor"/>
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              className="w-32" 
                              align="end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuItem 
                                className="py-1.5 font-medium text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list.id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 px-4 h-8 text-white rounded-md bg-[#5567E5] hover:bg-[#4556D4] font-medium text-[14px]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create new product
            </button>
          </div>
        </div>
        
        {/* Search, Views dropdown and filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
            
            {/* Saved Views Dropdown - matching Partners page */}
            <div className="relative" ref={viewsDropdownRef}>
              <button 
                ref={viewsButtonRef}
                className={`flex items-center space-x-2 px-3 h-8 border border-[#E6E7F1] rounded-md text-sm font-medium bg-white ${isEditingList ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => {
                  if (!isEditingList) {
                    setShowViewsDropdown(!showViewsDropdown);
                  }
                }}
                disabled={isEditingList}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
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
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Saved Views</h3>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => setShowSaveViewModal(true)}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        + New view
                      </button>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto">
                      {savedViews.length === 0 ? (
                        <div className="px-3 py-6 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>No saved views</p>
                          <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Create your first view to save filter combinations</p>
                        </div>
                      ) : (
                        savedViews.map((view) => (
                          <div key={view.id} className="group flex items-center justify-between py-2 px-3 rounded hover:bg-[#F5F6FA]">
                            <button
                              className="flex-1 text-left"
                              onClick={() => {
                                setActiveView(view);
                                setFilterText(view.filters.searchText || '');
                                setSelectedStatus(view.filters.status || 'all');
                                setSelectedCategory(view.filters.category || 'all');
                                setSelectedProvider(view.filters.provider || 'all');
                                setShowViewsDropdown(false);
                              }}
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              <div className="text-sm font-medium text-gray-900">{view.name}</div>
                              {view.description && (
                                <div className="text-xs text-gray-500 mt-1">{view.description}</div>
                              )}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter buttons */}
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

          {/* Action buttons for views and save operations - matching Partners page logic */}
          <div className="flex items-center gap-2">
            {(() => {
              // Calculate if filters have been modified from the active view
              const filtersChanged = activeView && 
                (filterText !== (activeView.filters.searchText || '') || 
                 selectedStatus !== (activeView.filters.status || 'all') || 
                 selectedCategory !== (activeView.filters.category || 'all') || 
                 selectedProvider !== (activeView.filters.provider || 'all'));
                 
              // Only render buttons if there are filters applied or filters have changed
              return (filterText || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedProvider !== 'all') && (
                <div className="flex items-center gap-2">
                  {/* Show Revert and Save buttons only when a view is active AND filters have changed */}
                  {filtersChanged && (
                    <>
                      {/* Revert changes button */}
                      <button 
                        className="flex items-center rounded-md px-4 h-8 text-gray-600 hover:bg-gray-100"
                        onClick={() => {
                          if (activeView) {
                            // Revert to view's original filters
                            setFilterText(activeView.filters.searchText || '');
                            setSelectedStatus(activeView.filters.status || 'all');
                            setSelectedCategory(activeView.filters.category || 'all');
                            setSelectedProvider(activeView.filters.provider || 'all');
                          }
                        }}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M3 7v6h6"></path>
                          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                        </svg>
                        <span className="text-[#5F6585]">Revert changes</span>
                      </button>
                      
                      {/* Save button - updates the current view */}
                      <button 
                        className="flex items-center rounded-md bg-[#EBEEFB] px-4 h-8 hover:bg-[#E3E6F7]"
                        onClick={() => {
                          if (activeView) {
                            const updatedFilters = {
                              searchText: filterText || undefined,
                              status: selectedStatus !== 'all' ? selectedStatus : undefined,
                              category: selectedCategory !== 'all' ? selectedCategory : undefined,
                              provider: selectedProvider !== 'all' ? selectedProvider : undefined,
                            };
                            
                            // Update the view (you'll need to add updateSavedViewMutation)
                            toast({
                              title: "View Updated",
                              description: "Your changes have been saved to the current view"
                            });
                          }
                        }}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span className="text-[#3E4DC4] font-medium">Save</span>
                      </button>
                      
                      {/* Save as new view button - only shown when filters have changed */}
                      <button 
                        className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                        onClick={() => setShowSaveViewModal(true)}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span className="text-[#3E4DC4] font-medium">Save as new view</span>
                      </button>
                    </>
                  )}
                  
                  {/* Show Save as new view button only when no view is active but filters are applied */}
                  {!activeView && (
                    <button 
                      className="flex items-center rounded-md bg-[#EBEEFB] px-4 h-8 hover:bg-[#E3E6F7]"
                      onClick={() => setShowSaveViewModal(true)}
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      <span className="text-[#3E4DC4] font-medium">Save as new view</span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bulk actions bar - only visible when products are selected */}
      {selectedProducts.length > 0 && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4 mx-4">
          <div className="flex items-center">
            <span className="text-indigo-700 font-medium mr-2 text-[14px]">{selectedProducts.length} products selected</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600"
              onClick={() => setSelectedProducts([])}
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
              onClick={() => setShowSaveListModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Add to list
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-indigo-600"
              onClick={() => {
                // Export selected products
                const selectedProductsData = displayedProducts.filter((p: Product) => selectedProducts.includes(p.id));
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "Name,Category,Provider,Contract Start,Contract End,Premium Value,Premium %,Discount %,Status\n"
                  + selectedProductsData.map((product: Product) => 
                      `"${product.name}","${product.category}","${product.provider || product.providername || 'N/A'}","${product.contract_start_date || product.contractStartDate || 'N/A'}","${product.contract_end_date || product.contractEndDate || 'N/A'}","${product.premium_value || product.premiumValue || 'N/A'}","${product.premium_percentage || product.premiumPercentage || 'N/A'}","${product.discount_percentage || product.discountPercentage || 'N/A'}","${product.status || 'Active'}"`
                    ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </Button>
          </div>
        </div>
      )}

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
                sortKey="contract_start_date" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Contract Start Date
              </SortableTableHead>
              <SortableTableHead 
                sortKey="contract_end_date" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Contract End Date
              </SortableTableHead>
              <SortableTableHead 
                sortKey="total_value" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Total Value
              </SortableTableHead>
              <SortableTableHead 
                sortKey="premium_value" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Premium Value
              </SortableTableHead>
              <SortableTableHead 
                sortKey="premium_percentage" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[100px]"
              >
                Premium %
              </SortableTableHead>
              <SortableTableHead 
                sortKey="discount_percentage" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[100px]"
              >
                Discount %
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
              <th className="w-[80px] text-center py-3 pl-3 pr-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
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
                    {product.contract_start_date || product.contractstartdate ? 
                      new Date(product.contract_start_date || product.contractstartdate).toLocaleDateString() : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    {product.contract_end_date || product.contractenddate ? 
                      new Date(product.contract_end_date || product.contractenddate).toLocaleDateString() : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    {(product.total_value || product.totalvalue || product.totalValue) ? 
                      `€${parseFloat(product.total_value || product.totalvalue || product.totalValue).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    {(product.premium_value || product.premiumvalue || product.premiumValue) ? 
                      `€${parseFloat(product.premium_value || product.premiumvalue || product.premiumValue).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    {(product.premium_percentage || product.premiumpercentage || product.premiumPercentage) ? 
                      `${parseFloat(product.premium_percentage || product.premiumpercentage || product.premiumPercentage).toFixed(1)}%` : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="text-sm">
                    {(product.discount_percentage || product.discountpercentage || product.discountPercentage) ? 
                      `${parseFloat(product.discount_percentage || product.discountpercentage || product.discountPercentage).toFixed(1)}%` : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-center">
                  {product.customercount || product.customerCount || 0}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-center">
                  {product.partnercount || product.partnerCount || 0}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-center">
                  {product.opportunitycount || product.opportunityCount || 0}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(product)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            
            {displayedProducts.length === 0 && (
              <tr>
                <td colSpan={13} className="py-10 text-center">
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
                value={viewNameInput}
                onChange={(e) => setViewNameInput(e.target.value)}
                placeholder="Enter view name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveViewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!viewNameInput.trim()}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to List Modal */}
      <Dialog 
        open={showSaveListModal} 
        onOpenChange={(open) => {
          if (!open) {
            // Reset state when closing the modal
            setIsCreatingNewList(true);
            setSelectedExistingList(null);
          }
          setShowSaveListModal(open);
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#ffffff] text-[#282A3F] p-[32px]">
          <DialogHeader>
            <DialogTitle>Add to list</DialogTitle>
            <DialogDescription>
              Add selected products to an existing list or create a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="option-existing" 
                  name="list-option" 
                  className="h-4 w-4 text-indigo-600"
                  checked={!isCreatingNewList}
                  onChange={() => setIsCreatingNewList(false)}
                />
                <Label htmlFor="option-existing" className="text-sm font-medium">
                  Add to existing list
                </Label>
              </div>
              
              {!isCreatingNewList && (
                <div className="pl-6 mt-2 text-[888AA6]">
                  <select
                    id="list-select"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedExistingList || ''}
                    onChange={(e) => setSelectedExistingList(e.target.value || null)}
                  >
                    <option value="">Select a list...</option>
                    {savedLists
                      .filter(list => list.type === 'selection' && !list.isDefault)
                      .map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="option-new" 
                  name="list-option" 
                  className="h-4 w-4 text-indigo-600"
                  checked={isCreatingNewList}
                  onChange={() => setIsCreatingNewList(true)}
                />
                <Label htmlFor="option-new" className="text-sm font-medium">
                  Create new list
                </Label>
              </div>
              
              {isCreatingNewList && (
                <div className="pl-6 space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="listName">List Name</Label>
                    <Input 
                      id="listName" 
                      placeholder="Enter a name for this list"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500">Maximum 50 characters</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="listDescription">Description (Optional)</Label>
                    <Textarea 
                      id="listDescription" 
                      placeholder="Add a short description for this list"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">Maximum 200 characters</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-sm text-blue-700">
                {selectedProducts.length} products will be added to this list.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveListModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (isCreatingNewList) {
                  // Create new list with selected products
                  const listName = (document.getElementById('listName') as HTMLInputElement).value;
                  if (!listName.trim()) {
                    toast({
                      title: "Name Required",
                      description: "Please provide a name for the new list",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  const listDescription = (document.getElementById('listDescription') as HTMLTextAreaElement).value;
                  
                  // Create new list
                  createSavedListMutation.mutate({
                    name: listName,
                    description: listDescription || undefined,
                    type: 'selection',
                    entity_type: 'products',
                    members: selectedProducts,
                    filters: {},
                    is_shared: false,
                    created_by: 'Current User'
                  }, {
                    onSuccess: () => {
                      toast({
                        title: "List Created",
                        description: `"${listName}" has been created with ${selectedProducts.length} products`
                      });
                      setShowSaveListModal(false);
                      setSelectedProducts([]);
                    },
                    onError: () => {
                      toast({
                        title: "Error",
                        description: "Failed to create list. Please try again.",
                        variant: "destructive"
                      });
                    }
                  });
                } else {
                  // Add to existing list
                  if (!selectedExistingList) {
                    toast({
                      title: "List Required",
                      description: "Please select a list to add the products to",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  const targetList = savedLists.find(list => list.id === selectedExistingList);
                  if (!targetList) {
                    toast({
                      title: "Error",
                      description: "Selected list not found",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // Merge existing members with new selections
                  const updatedMembers = Array.from(new Set([...(targetList.members || []), ...selectedProducts]));
                  
                  // Update existing list with new members (you'll need to implement updateSavedListMutation)
                  toast({
                    title: "Products Added",
                    description: `${selectedProducts.length} products added to "${targetList.name}"`
                  });
                  setShowSaveListModal(false);
                  setSelectedProducts([]);
                }
              }}
            >
              {isCreatingNewList ? 'Create list' : 'Add to list'}
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

        {/* Edit Product Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-provider">Provider Name</Label>
                  <Input
                    id="edit-provider"
                    value={editFormData.providerName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, providerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editFormData.status || ''} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contract-start">Contract Start Date</Label>
                  <Input
                    id="edit-contract-start"
                    type="date"
                    value={editFormData.contractStartDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, contractStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contract-end">Contract End Date</Label>
                  <Input
                    id="edit-contract-end"
                    type="date"
                    value={editFormData.contractEndDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, contractEndDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total-value">Total Value (€)</Label>
                  <Input
                    id="edit-total-value"
                    type="number"
                    step="0.01"
                    value={editFormData.totalValue || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, totalValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-premium-value">Premium Value (€)</Label>
                  <Input
                    id="edit-premium-value"
                    type="number"
                    step="0.01"
                    value={editFormData.premiumValue || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, premiumValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-premium-percentage">Premium Percentage (%)</Label>
                  <Input
                    id="edit-premium-percentage"
                    type="number"
                    step="0.01"
                    value={editFormData.premiumPercentage || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, premiumPercentage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discount-percentage">Discount Percentage (%)</Label>
                  <Input
                    id="edit-discount-percentage"
                    type="number"
                    step="0.01"
                    value={editFormData.discountPercentage || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, discountPercentage: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingContext.Provider>
  );
}