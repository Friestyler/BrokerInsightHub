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

  // Lists and views
  const { data: savedLists = [] } = useSavedLists();
  const { data: savedViews = [] } = useSavedViews();
  
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
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
      {/* Toolbar Section */}
      <div className="flex items-center justify-between px-4 py-2">
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

        {/* Right-side action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            Export
          </Button>
          <Button size="sm" className="h-8">
            Create new product
          </Button>
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
    </div>
  );
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isEditingList, setIsEditingList] = useState(false);

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="flex-1 space-y-6 py-6">
        <div className="flex items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>

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