import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
    staleTime: 0,
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'products'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=products'),
    staleTime: 0,
    gcTime: 0,
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

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  
  // Fetch products from database
  const { data: products = [], isLoading, error } = useProductsData();
  
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
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
  const [listNameInput, setListNameInput] = useState('');
  const [listDescriptionInput, setListDescriptionInput] = useState('');
  
  // Refs for dropdowns to handle outside clicks
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  
  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});

  // List editing state
  const [isEditingList, setIsEditingList] = useState(false);
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  
  // Sorting state
  const [tableSortConfig, setTableSortConfig] = useState({
    key: '',
    direction: 'asc' as 'asc' | 'desc'
  });
  
  const [activeView, setActiveView] = useState<SavedView | null>(null);

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

  const handleSaveToList = async () => {
    try {
      if (isCreatingNewList) {
        await createSavedListMutation.mutateAsync({
          name: listNameInput,
          description: listDescriptionInput,
          entity_type: 'products',
          entity_ids: selectedProducts
        });
        
        toast({
          title: "List created",
          description: `Products added to "${listNameInput}"`
        });
      } else if (selectedExistingList) {
        await updateSavedListMutation.mutateAsync({
          id: selectedExistingList,
          entity_ids: selectedProducts
        });
        
        const listName = savedListsData.find((list: any) => list.id === selectedExistingList)?.name || 'list';
        toast({
          title: "Products added",
          description: `Products added to "${listName}"`
        });
      }
      
      setShowSaveListModal(false);
      setSelectedProducts([]);
      setListNameInput('');
      setListDescriptionInput('');
      setIsCreatingNewList(true);
      setSelectedExistingList(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save products to list. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === displayedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  // Export products
  const handleExport = () => {
    const dataToExport = selectedProducts.length > 0 
      ? displayedProducts.filter(p => selectedProducts.includes(p.id))
      : displayedProducts;
    
    const csvContent = [
      ['Name', 'Category', 'Provider', 'Total Value', 'Premium Value', 'Status'].join(','),
      ...dataToExport.map(product => [
        product.name,
        product.category,
        product.provider || product.providername || '',
        product.total_value || product.totalvalue || '',
        product.premium_value || product.premiumvalue || '',
        product.status || 'Active'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle table sorting
  const handleSort = (key: string) => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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
        searchText: filterText || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        provider: selectedProvider !== 'all' ? selectedProvider : undefined,
      }
    };

    try {
      await createSavedViewMutation.mutateAsync(viewData);
      setShowSaveViewModal(false);
      setViewNameInput('');
      
      toast({
        title: "View saved",
        description: `"${viewData.name}" has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save view. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (activeTab === 'categories') {
    return (
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

        {/* Categories Content */}
        <div className="mx-4">
          <CategoryManagerForProducts />
        </div>
      </div>
    );
  }

  return (
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

      {/* Products Content */}
      <div>
        {/* Toolbar with search and filters */}
        <div className="mx-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search products..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(new Set(products.map((p: Product) => p.category))).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {Array.from(new Set(products.map((p: Product) => p.provider || p.providername || '').filter(Boolean))).map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Table */}
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
                      onChange={handleSelectAll}
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
                  className="w-[150px]"
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
                  sortKey="status" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort} 
                  className="w-[120px]"
                >
                  Status
                </SortableTableHead>
                <th scope="col" className="relative px-3 py-3.5 w-[80px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {displayedProducts.map((product: Product) => (
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
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    {product.provider || product.providername || '-'}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {product.customerCount || product.customercount || 0}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {product.partnerCount || product.partnercount || 0}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {product.opportunityCount || product.opportunitycount || 0}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    {product.total_value || product.totalvalue || '-'}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    {product.premium_value || product.premiumvalue || '-'}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <Badge variant={product.status === 'Active' ? 'outline' : 'secondary'} className="capitalize">
                      {product.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              
              {displayedProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-10 text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>
                      <p className="text-sm text-gray-500 max-w-md mb-4">
                        There are no products matching your filter criteria.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedStatus('all');
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

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="mx-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-blue-700">
                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleClearSelection}>
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSaveListModal(true)}
                  >
                    Add to list
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Input
                id="edit-category"
                value={editFormData.category || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
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

      {/* Add to List Modal */}
      <Dialog 
        open={showSaveListModal} 
        onOpenChange={(open) => {
          if (!open) {
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
                <Select onValueChange={(value) => setSelectedExistingList(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="grid gap-2">
                  <Input
                    placeholder="List name"
                    value={listNameInput}
                    onChange={(e) => setListNameInput(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={listDescriptionInput}
                    onChange={(e) => setListDescriptionInput(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveListModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveToList}
              disabled={isCreatingNewList ? !listNameInput.trim() : !selectedExistingList}
            >
              Add to list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}