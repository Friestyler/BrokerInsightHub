import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  List
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
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [newViewName, setNewViewName] = useState('');
  
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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: 'All', industry: 'All', size: 'All' });
  };

  const hasChanges = () => {
    return filters.status !== 'All' || filters.industry !== 'All' || filters.size !== 'All' || activeList !== null;
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

      {/* Filter Controls */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Clear and Save Buttons */}
          {(activeList || hasChanges()) && (
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setActiveList(null);
                  clearFilters();
                }}
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

          {/* Right Side Controls */}
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
            </div>

            {/* Fields Button */}
            <div className="relative">
              <button
                onClick={() => setShowFieldsDropdown(!showFieldsDropdown)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                  Object.values(visibleFields).some(v => !v) 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                <span>Fields</span>
                <span className="text-xs">({Object.values(visibleFields).filter(Boolean).length}/{Object.keys(visibleFields).length})</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showFieldsDropdown ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
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
            </div>
          </div>
        </div>
      </div>

      {/* Saved Lists Section */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
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
        </div>

        {/* Lists Cards Display */}
        {showListsDropdown && (
          <div className={`grid ${
            viewMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          } gap-3 mb-4`}>
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
    </div>
  );
}