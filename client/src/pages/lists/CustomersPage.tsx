import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  X, 
  Bookmark, 
  BarChart3, 
  ChevronDown, 
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  Target,
  Users,
  Columns3
} from 'lucide-react';
import EntityAvatar from '@/components/EntityAvatar';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: number;
  name: string;
  industry?: string;
  size?: string;
  status?: string;
  partnerNames?: string;
  opportunityCount?: number;
  totalValue?: number;
}

interface CustomerFilters {
  status: string;
  industry: string;
  size: string;
}

interface SavedList {
  id: number;
  name: string;
  description: string;
  members?: Customer[];
}

export default function CustomersPage() {
  const { toast } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CustomerFilters>({
    status: 'All',
    industry: 'All',
    size: 'All'
  });
  
  // UI state
  const [showFilter, setShowFilter] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [activeView, setActiveView] = useState<any | null>(null);
  const [newViewName, setNewViewName] = useState('');
  
  // Bulk action modals state
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showAddToCampaignModal, setShowAddToCampaignModal] = useState(false);
  const [showAssignTemplateModal, setShowAssignTemplateModal] = useState(false);
  
  // Visible fields state
  const [visibleFields, setVisibleFields] = useState({
    name: true,
    industry: true,
    size: true,
    opportunityCount: true,
    totalValue: true,
    status: true
  });

  // Track original fields for change detection
  const [originalFields] = useState({
    name: true,
    industry: true,
    size: true,
    opportunityCount: true,
    totalValue: true,
    status: true
  });
  
  // Filter state management
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Form data
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    ownerId: null,
    assignedPartnerId: null
  });

  // Mock data
  const customerSavedListsData: SavedList[] = [
    { id: 1, name: 'High-Value Prospects', description: 'Premium customers with high potential', members: [] },
    { id: 2, name: 'Retirement Prospects', description: 'Customers interested in retirement planning', members: [] },
    { id: 3, name: 'Young Professionals', description: 'Early career professionals', members: [] }
  ];

  // API calls
  const { data: customersResponse, isLoading, error } = useQuery({
    queryKey: ['/api/customers', { search: searchTerm, page: currentPage, filters }],
    enabled: true
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: true
  });

  const { data: customerSavedViewsData = [] } = useQuery({
    queryKey: ['/api/saved-views', { entity_type: 'customers' }],
    enabled: true
  });

  const customers = customersResponse?.data || [];
  const pagination = customersResponse?.pagination || { totalCount: 0, totalPages: 1 };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateCustomerTotalValue = (customers: Customer[], opportunities: any[]) => {
    if (!customers || !opportunities) return 0;
    return customers.reduce((total, customer) => {
      const customerOpps = opportunities.filter(opp => opp.clientId === customer.id);
      const customerValue = customerOpps.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
      return total + customerValue;
    }, 0);
  };

  const calculateCustomerWeightedValue = (customers: Customer[], opportunities: any[]) => {
    if (!customers || !opportunities) return 0;
    return customers.reduce((total, customer) => {
      const customerOpps = opportunities.filter(opp => opp.clientId === customer.id);
      const weightedValue = customerOpps.reduce((sum, opp) => {
        const probability = (opp.probability || 0) / 100;
        return sum + ((opp.estimatedValue || 0) * probability);
      }, 0);
      return total + weightedValue;
    }, 0);
  };

  // Filter functions
  const updateFilter = (key: keyof CustomerFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Check if any filters are active (not 'All')
    const hasActive = Object.values(newFilters).some(val => val !== 'All');
    setHasActiveFilters(hasActive);
  };

  const clearFilters = () => {
    setFilters({ status: 'All', industry: 'All', size: 'All' });
  };

  const hasChanges = () => {
    // Check if filters have changed
    const hasFilterChanges = filters.status !== 'All' || filters.industry !== 'All' || filters.size !== 'All';
    
    // Check if fields have changed
    const hasFieldChanges = Object.keys(visibleFields).some(
      (key) => visibleFields[key as keyof typeof visibleFields] !== originalFields[key as keyof typeof originalFields]
    );
    
    return hasFilterChanges || hasFieldChanges || activeList !== null || activeView !== null;
  };

  const clearAllChanges = () => {
    setActiveList(null);
    setActiveView(null);
    setFilters({ status: 'All', industry: 'All', size: 'All' });
    setVisibleFields({ ...originalFields });
    setHasActiveFilters(false);
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map((customer: any) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Event handlers
  const handleSaveView = () => {
    if (newViewName.trim()) {
      toast({
        title: "View Saved",
        description: `"${newViewName}" has been saved as a segment view.`
      });
      setNewViewName('');
      setShowSaveViewModal(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
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

      toast({
        title: "Success",
        description: "Customer created successfully."
      });

      setCustomerFormData({
        name: '',
        description: '',
        industry: '',
        size: '',
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
        <div className="text-center text-red-500">Error loading customers</div>
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
      <div className="bg-white mx-4 rounded-lg shadow-sm border border-[#E6E7F1]">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Saved Lists */}
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
              onClick={() => setShowListsDropdown(!showListsDropdown)}
            >
              {showListsDropdown ? (
                <ChevronDown width="16" height="16" className="transition-transform" />
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-transform"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              <span>Saved Lists ({customerSavedListsData.length})</span>
            </button>

            {/* Cards/List View Toggle */}
            {showListsDropdown && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'cards' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid width="16" height="16" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <List width="16" height="16" />
                </button>
              </div>
            )}
          </div>
          
          {/* Right side - Controls with Clear/Save above */}
          <div className="flex flex-col items-end gap-2">
            {/* Clear and Save buttons stacked on top */}
            {(activeList || hasChanges()) && (
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAllChanges}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X width="14" height="14" />
                  Clear
                </button>
                
                <button
                  onClick={() => setShowSaveViewModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Bookmark width="14" height="14" />
                  Save as segment view
                </button>
              </div>
            )}
            
            {/* Main controls row */}
            <div className="flex items-center gap-3">
            {/* Segment View Button */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 px-3 h-8 border border-[#E6E7F1] rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                onClick={() => setShowViewsDropdown(!showViewsDropdown)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="text-gray-700">Segment view</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showViewsDropdown && (
                <div className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                  <div className="p-2 border-b">
                    {customerSavedViewsData?.map((view: any) => (
                      <div 
                        key={view.id}
                        className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id.toString() ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                        onClick={() => {
                          setActiveView(view);
                          setActiveList(null); // Clear active list when selecting a view
                          setShowViewsDropdown(false);
                          // Apply view filters if available
                          if (view.filters) {
                            try {
                              const viewFilters = JSON.parse(view.filters);
                              setFilters(viewFilters);
                            } catch (e) {
                              console.error('Error parsing view filters:', e);
                            }
                          }
                          // Apply view fields if available
                          if (view.visible_fields) {
                            try {
                              const viewFields = JSON.parse(view.visible_fields);
                              setVisibleFields(viewFields);
                            } catch (e) {
                              console.error('Error parsing view fields:', e);
                            }
                          }
                        }}
                      >
                        <span>{view.name}</span>
                        {activeView?.id === view.id.toString() && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ))}
                    {(!customerSavedViewsData || customerSavedViewsData.length === 0) && (
                      <div className="p-2 text-sm text-gray-500 italic">No saved views</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fields Button */}
            <div className="relative">
              <button
                onClick={() => setShowFieldsDropdown(!showFieldsDropdown)}
                className={`flex items-center gap-2 px-3 h-8 text-sm border rounded-md transition-colors ${
                  Object.values(visibleFields).some(v => !v) 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Columns3 className="h-4 w-4" />
                <span>Fields</span>
                <span className="text-xs">({Object.values(visibleFields).filter(Boolean).length}/{Object.keys(visibleFields).length})</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showFieldsDropdown ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showFieldsDropdown && (
                <div className="absolute z-50 mt-1 w-48 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                  <div className="p-2">
                    <div className="space-y-2">
                      {Object.entries(visibleFields).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setVisibleFields(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="rounded border-gray-300"
                          />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-3 h-8 text-sm border rounded-md transition-colors ${
                  hasActiveFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span>Filter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showFilter ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showFilter && (
                <div className="absolute z-50 mt-1 right-0 w-[600px] rounded-md border border-[#E6E7F1] bg-white shadow-md">
                  <div className="p-4 space-y-4">
                    {/* Where Status equals All */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">Where</span>
                      <select 
                        value="status"
                        onChange={() => {}}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="status">Status</option>
                        <option value="industry">Industry</option>
                        <option value="size">Size</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    {/* And Industry equals All */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">And</span>
                      <select 
                        value="industry"
                        onChange={() => {}}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="industry">Industry</option>
                        <option value="status">Status</option>
                        <option value="size">Size</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.industry}
                        onChange={(e) => updateFilter('industry', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Finance">Finance</option>
                        <option value="Technology">Technology</option>
                      </select>
                    </div>

                    {/* And Size equals All */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">And</span>
                      <select 
                        value="size"
                        onChange={() => {}}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="size">Size</option>
                        <option value="status">Status</option>
                        <option value="industry">Industry</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.size || 'All'}
                        onChange={(e) => updateFilter('size', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
        
        {/* Search Bar Row */}
        <div className="px-4 pb-2">
          <div className="relative w-60">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Lists Cards Display */}
        {showListsDropdown && (
          <div className="px-4 pb-4">
            <div className={`grid ${
              viewMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            } gap-3`}>
              {customerSavedListsData.map((list: SavedList) => {
                const isSelected = activeList?.id === list.id;
                return (
                  <div
                    key={list.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-[#5567E5] bg-[#F8F9FF] shadow-sm' 
                        : 'border-[#E6E7F1] bg-white hover:border-[#D6D7E4] hover:shadow-sm'
                    }`}
                    onClick={() => setActiveList(list)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-500">{list.members?.length || 0} customers</p>
                          {isSelected && (
                            <div className="text-xs text-gray-400 mt-1">Updated 1 hours ago</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {list.name === 'High-Value Prospects' ? '€892,340' : 
                         list.name === 'Retirement Prospects' ? '€1,456,890' :
                         '€625,430'}
                      </p>
                      {isSelected && (
                        <div className="text-xs text-green-600 font-medium">+8%</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic bulk actions bar - appears below saved lists when items are selected */}
      {selectedCustomers.length > 0 && (
        <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-blue-900">
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedCustomers([])}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddToListModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add to list
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddToCampaignModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Add to campaign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignTemplateModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Target className="w-4 h-4 mr-1" />
              Assign template
            </Button>
          </div>
        </div>
      )}

      {/* Customers table */}
      <div className="mx-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E7F1] text-left">
                <th className="w-12 py-3 px-4 font-medium text-[#282A3F] text-sm">
                  <div className={`transition-opacity ${
                    selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === customers.length && customers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </th>
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
                  className="border-b border-[#E6E7F1] hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td 
                    className="py-3 px-4 cursor-pointer"
                    onClick={() => window.location.href = `/lists/customers/${customer.id}`}
                  >
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

      {/* Save View Modal */}
      {showSaveViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Save as Segment View</h3>
            <input
              type="text"
              placeholder="Enter view name..."
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveViewModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveView}>
                Save View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add to List Modal */}
      <Dialog open={showAddToListModal} onOpenChange={setShowAddToListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to list</DialogTitle>
            <DialogDescription>
              Add selected customers to an existing list or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing-list"
                  name="list-option"
                  value="existing"
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="existing-list" className="text-sm font-medium">
                  Add to existing list
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-list"
                  name="list-option"
                  value="new"
                  defaultChecked
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="new-list" className="text-sm font-medium">
                  Create new list
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  placeholder="Enter a name for this list"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 50 characters</p>
              </div>
              
              <div>
                <Label htmlFor="list-description">Description (Optional)</Label>
                <Textarea
                  id="list-description"
                  placeholder="Add a short description for this list"
                  className="mt-1 resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 200 characters</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} will be added to this list.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToListModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Customers added to list successfully" });
              setShowAddToListModal(false);
              setSelectedCustomers([]);
            }}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Campaign Modal */}
      <Dialog open={showAddToCampaignModal} onOpenChange={setShowAddToCampaignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Campaign</DialogTitle>
            <DialogDescription>
              Add selected customers to an existing campaign or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing-campaign"
                  name="campaign-option"
                  value="existing"
                  defaultChecked
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="existing-campaign" className="text-sm font-medium">
                  Add to existing campaign
                </label>
              </div>
              <div className="space-y-2 ml-6">
                <Button variant="outline" className="w-full justify-start text-left">
                  Summer Insurance Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  Cyber Security Awareness
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  Customer Retention Drive
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-campaign"
                  name="campaign-option"
                  value="new"
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="new-campaign" className="text-sm font-medium">
                  Create new campaign
                </label>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} will be added to this campaign.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToCampaignModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Customers added to campaign successfully" });
              setShowAddToCampaignModal(false);
              setSelectedCustomers([]);
            }}>
              Add to Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Template Modal */}
      <Dialog open={showAssignTemplateModal} onOpenChange={setShowAssignTemplateModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign OKR Templates</DialogTitle>
            <DialogDescription>
              Select OKR templates to assign to {selectedCustomers.length} selected customer{selectedCustomers.length !== 1 ? 's' : ''}. Templates will be converted to active OKRs with tracking capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''} Selected
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Amazon CS Motors, Baloise Verzekeringen, GMB Metaal, and {selectedCustomers.length - 3} more...
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Available OKR Templates</h4>
                <span className="text-sm text-gray-500">0 of 14 selected</span>
              </div>
              
              <div className="border rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="select-all" />
                  <Label htmlFor="select-all" className="font-medium">
                    Select All Templates
                  </Label>
                </div>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <div>
                  <Badge variant="secondary" className="mb-2">Customer Growth (1)</Badge>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox id="customer-acquisition" />
                      <div className="flex-1">
                        <Label htmlFor="customer-acquisition" className="font-medium">Customer Acquisition Rate</Label>
                        <Badge variant="outline" className="ml-2 text-xs">activity</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">Monthly new customer acquisition target</p>
                    <p className="text-xs text-gray-500 ml-6">🎯 150 none</p>
                  </div>
                </div>
                
                <div>
                  <Badge variant="secondary" className="mb-2 bg-purple-100 text-purple-800">Customer Retention (1)</Badge>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox id="retention-rate" />
                      <div className="flex-1">
                        <Label htmlFor="retention-rate" className="font-medium">Customer Lifetime Value</Label>
                        <Badge variant="outline" className="ml-2 text-xs">activity</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">Average customer lifetime value growth</p>
                    <p className="text-xs text-gray-500 ml-6">💰 €2,500 none</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Templates assigned successfully" });
              setShowAssignTemplateModal(false);
              setSelectedCustomers([]);
            }}>
              Assign 0 Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}