import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FieldsSelector } from '@/components/shared/FieldsSelector';

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { 
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
  DollarSign,
  ChevronDown,
  List,
  BarChart3,
  Settings,
  Filter,
  LayoutGrid,
  X,
  Bookmark,
  MessageSquare,
  Target
} from 'lucide-react';


// Fetch partners from database
const usePartnersData = () => {
  return useQuery({
    queryKey: ['/api/partners'],
    staleTime: 0, // Force fresh data to show updated relationship counts
  });
};

// Hooks for saved lists and segment views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'partners'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=partners'),
    staleTime: 0, // Always fetch fresh data for lists to see immediate updates
    gcTime: 0, // No cache to ensure immediate updates
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'partners'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=partners'),
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
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'partners'] });
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
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/saved-lists/${id}`);
    },
    onSuccess: () => {
      // Clear cache for immediate updates
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'partners'] });
    }
  });
};

const useCreateSavedView = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-views', data);
    },
    onSuccess: () => {
      // Invalidate both the general and specific cache keys to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'partners'] });
    }
  });
};

const useUpdateSavedView = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return apiRequest('PUT', `/api/saved-views/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'partners'] });
    }
  });
};

// Format currency in European format
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate partner statistics
function calculatePartnerStats(partners: any[], opportunities: any[] = []) {
  // Total Partners now shows count of partners currently displayed in the active list/view
  const totalPartners = partners.length;
  // Total Customers counts all customer records linked to the displayed partners
  const totalCustomers = partners.reduce((sum, partner) => {
    const customerCount = parseInt(partner.customers) || 0;
    return sum + customerCount;
  }, 0);
  // Total Opportunities counts all opportunity records attached to the displayed partners
  const totalOpportunities = partners.reduce((sum, partner) => {
    const opportunityCount = parseInt(partner.opportunities) || 0;
    return sum + opportunityCount;
  }, 0);
  
  // Get partner IDs from displayed partners
  const partnerIds = partners.map(p => p.id);
  
  // Filter opportunities that belong to displayed partners
  const relevantOpportunities = opportunities.filter(opp => 
    opp.partnerId && partnerIds.includes(opp.partnerId)
  );
  
  // Total Value sums unique opportunity amounts (no double counting)
  const totalValue = relevantOpportunities.reduce((sum, opp) => {
    const value = parseFloat(opp.estimated_value) || 0;
    return sum + value;
  }, 0);
  
  // Weighted Value calculates probability-adjusted sum of opportunity values
  const weightedValue = relevantOpportunities.reduce((sum, opp) => {
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
  const activePartners = partners.filter(p => p.status === 'active').length;
  
  return {
    totalPartners,
    totalCustomers,
    totalOpportunities,
    totalValue,
    weightedValue,
    activePartners
  };
}

// Template badges component for partners  
function TemplateBadges({ partnerId, templateAssignments, okrTags }: { partnerId: number, templateAssignments: any[], okrTags: any[] }) {
  const partnerAssignments = templateAssignments.filter((assignment: any) => assignment.entity_id === partnerId);
  
  if (partnerAssignments.length === 0) {
    return (
      <span className="text-gray-400 text-xs">No templates</span>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {partnerAssignments.slice(0, 2).map((assignment: any) => {
        // Get the first tag name and find its color from the tags list
        let tagColor = '#6b7280'; // default gray
        if (assignment.tags && assignment.tags.length > 0) {
          const firstTagName = assignment.tags[0];
          const tagData = okrTags.find((tag: any) => tag.name === firstTagName);
          if (tagData && tagData.color) {
            tagColor = tagData.color;
          }
        }
        
        // Create initials from template name
        const initials = assignment.template_name ? 
          assignment.template_name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase() : 
          'T';
        
        return (
          <div 
            key={assignment.id} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: `${tagColor}20`,
              color: tagColor,
              border: `1px solid ${tagColor}40`
            }}
            title={assignment.template_name}
          >
            {initials}
          </div>
        );
      })}
      {partnerAssignments.length > 2 && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          +{partnerAssignments.length - 2}
        </div>
      )}
    </div>
  );
}

// Define interface for saved lists
interface SavedList {
  id: string;
  name: string;
  description?: string;
  type?: 'filter' | 'selection'; // 'filter' for Saved Filters, 'selection' for Custom Lists
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    size?: string;
  };
  members?: number[]; // Array of partner IDs for Custom Lists
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean; // Flag for system-generated default lists that can't be edited/deleted
}

// Define interface for saved segment views (filter combinations)
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    size?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

// Main partner list component
function PartnersPage() {
  // Import navigate function for routing
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Fetch partners from database
  const { data: partners = [], isLoading, error } = usePartnersData();
  const { data: savedListsData = [] } = useSavedLists();
  const { data: savedViewsData = [] } = useSavedViews();
  
  // Enhanced state management for the new functionality
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [filterText, setFilterText] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  
  // Bulk action modals state
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showAddToCampaignModal, setShowAddToCampaignModal] = useState(false);
  const [showAssignTemplateModal, setShowAssignTemplateModal] = useState(false);
  
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
    customerCount: true,
    opportunityCount: true,
    totalValue: true,
    status: true
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
  
  // Calculate display partners with filters applied
  let displayedPartners = partners;
  
  // Apply active list filter
  if (activeList) {
    const listMemberIds = activeList.members?.map((m: any) => m.id) || [];
    displayedPartners = displayedPartners.filter((partner: any) => listMemberIds.includes(partner.id));
  }
  
  // Apply text search filter
  if (filterText) {
    displayedPartners = displayedPartners.filter((partner: any) =>
      partner.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      partner.industry?.toLowerCase().includes(filterText.toLowerCase())
    );
  }
  
  // Apply advanced filters
  displayedPartners = displayedPartners.filter((partner: any) => {
    if (filters.status !== 'All' && partner.status !== filters.status) return false;
    if (filters.industry !== 'All' && partner.industry !== filters.industry) return false;
    if (filters.size !== 'All' && partner.size !== filters.size) return false;
    return true;
  });

  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading partners...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalPartners: displayedPartners.length,
    totalOpportunities: displayedPartners.reduce((sum, partner) => sum + (partner.opportunityCount || 0), 0),
    totalCustomers: displayedPartners.reduce((sum, partner) => sum + (partner.customerCount || 0), 0),
    totalValue: displayedPartners.reduce((sum, partner) => sum + (partner.totalValue || 0), 0),
    weightedValue: displayedPartners.reduce((sum, partner) => sum + (partner.totalValue || 0), 0)
  };

  // Helper functions
  const hasChanges = () => {
    if (activeView && (originalFilters || originalVisibleFields)) {
      const filtersChanged = originalFilters && JSON.stringify(filters) !== JSON.stringify(originalFilters);
      const fieldsChanged = originalVisibleFields && JSON.stringify(visibleFields) !== JSON.stringify(originalVisibleFields);
      return filtersChanged || fieldsChanged;
    }
    
    if (!activeView) {
      const hasFilterChanges = filters.status !== 'All' || filters.industry !== 'All' || filters.size !== 'All';
      const allFieldsVisible = Object.values(visibleFields).every(Boolean);
      const hasFieldChanges = !allFieldsVisible;
      return hasFilterChanges || hasFieldChanges;
    }
    
    return false;
  };

  const clearFilters = () => {
    setFilters({ status: 'All', industry: 'All', size: 'All' });
    setHasActiveFilters(false);
  };

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setHasActiveFilters(value !== 'All' || Object.values(newFilters).some(v => v !== 'All'));
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPartners(displayedPartners.map((partner: any) => partner.id));
    } else {
      setSelectedPartners([]);
    }
  };

  const handleSelectPartner = (partnerId: number) => {
    setSelectedPartners(prev => 
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  return (
    <div className="space-y-1">
      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mx-4 py-6">
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalPartners}</div>
            <div className="text-gray-500 font-medium text-[13px]">Total Partners</div>
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
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-500">Total Value Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(Math.round(stats.weightedValue))}</div>
            <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
          </CardContent>
        </Card>
      </div>



      {/* Enhanced Toolbar Section */}
      <div className="bg-white mx-4 rounded-lg shadow-sm border border-[#E6E7F1]">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - empty */}
          <div></div>
          
          {/* Right side - Controls with Clear/Save above */}
          <div className="flex flex-col items-end gap-2">
            {/* Clear and Save buttons stacked on top */}
            {(activeList || hasChanges()) && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveList(null);
                    setFilters({ status: 'All', industry: 'All', size: 'All' });
                    setVisibleFields({
                      name: true,
                      industry: true,
                      customerCount: true,
                      opportunityCount: true,
                      totalValue: true,
                      status: true
                    });
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
            
            {/* Main controls row */}
            <div className="flex items-center gap-3">
              {/* Segment View Button */}
          <div className="relative">
            <button 
              ref={viewsButtonRef}
              className="flex items-center space-x-2 px-3 h-8 border border-[#E6E7F1] rounded-md text-sm font-medium bg-white hover:bg-gray-50"
              onClick={() => setShowViewsDropdown(!showViewsDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="text-gray-700">{activeView ? activeView.name : "Segment view"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showViewsDropdown && (
              <div ref={viewsDropdownRef} className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                <div className="p-2 border-b">
                  {savedViewsData?.map((view: any) => (
                    <div 
                      key={view.id}
                      className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id.toString() ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                      onClick={() => {
                        setActiveView(view);
                        setShowViewsDropdown(false);
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
                  {(!savedViewsData || savedViewsData.length === 0) && (
                    <div className="p-2 text-sm text-gray-500 italic">No saved views</div>
                  )}
                </div>
                {activeView && (
                  <div className="p-2">
                    <button 
                      className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        setShowViewsDropdown(false);
                        setActiveView(null);
                        setFilters({ status: 'All', industry: 'All', size: 'All' });
                        setHasActiveFilters(false);
                        setOriginalFilters(null);
                        setOriginalVisibleFields(null);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                      Clear segment view
                    </button>
                  </div>
                )}
              </div>
            )}
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



            {showFilter && (
              <div className="absolute z-50 mt-1 right-0 w-[600px] rounded-md border border-[#E6E7F1] bg-white shadow-md">
                <div className="p-4 space-y-4">
                  {/* Where Status equals All */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">Where</span>
                    <select 
                      value="status"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                    >
                      <option value="status">Status</option>
                      <option value="industry">Industry</option>
                      <option value="size">Size</option>
                      <option value="region">Region</option>
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

                  {/* And Type equals All */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">And</span>
                    <select 
                      value="type"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                    >
                      <option value="type">Type</option>
                      <option value="industry">Industry</option>
                      <option value="size">Size</option>
                      <option value="region">Region</option>
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
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                    >
                      <option value="size">Size</option>
                      <option value="status">Status</option>
                      <option value="industry">Industry</option>
                      <option value="region">Region</option>
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

                  {/* And Stage equals All */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">And</span>
                    <select 
                      value="stage"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                    >
                      <option value="stage">Stage</option>
                      <option value="status">Status</option>
                      <option value="industry">Industry</option>
                      <option value="size">Size</option>
                    </select>
                    <span className="text-sm text-gray-500">equals</span>
                    <select
                      value="All"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                    >
                      <option value="All">All</option>
                      <option value="Prospecting">Prospecting</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                    </select>
                  </div>


                </div>
              </div>
            )}
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
                <span>Saved Lists ({savedListsData.length})</span>
              </button>

              {/* Cards/List View Toggle - show when lists are expanded */}
              {showListsDropdown && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'cards' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    title="Cards view"
                  >
                    <LayoutGrid width="16" height="16" className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    title="List view"
                  >
                    <List width="16" height="16" className="text-gray-600" />
                  </button>
                </div>
              )}
              
              {/* Show selected list when collapsed */}
              {!showListsDropdown && activeList && (
                <div className="bg-green-100 px-3 py-1 rounded-full flex items-center space-x-2">
                  <Filter width="14" height="14" className="text-green-600" />
                  <span className="text-sm text-green-700">{activeList.name}</span>
                  <button 
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveList(null);
                    }}
                  >
                    <X width="12" height="12" className="text-green-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-60 mb-2">
            <input
              type="text"
              placeholder="Search partners..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          {/* Collapsible Lists Content */}
          {showListsDropdown && (
            <div className={viewMode === 'cards' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
              {/* All Partners option */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  !activeList ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveList(null)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium text-gray-900">All Partners</h3>
                      <p className="text-sm text-gray-500">{partners.length} partners</p>
                      {!activeList && (
                        <div className="text-xs text-gray-400 mt-1">Live data</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  {!activeList && (
                    <div className="text-xs text-red-600 font-medium">-2%</div>
                  )}
                </div>
              </div>

              {/* Saved Lists */}
              {savedListsData.map((list: any, index: number) => {
                const isSelected = activeList?.id === list.id;
                const isShared = list.is_shared;
                
                return (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      isSelected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveList(list)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-500">{list.members?.length || 0} partners</p>
                          {isSelected && (
                            <div className="text-xs text-gray-400 mt-1">Updated 1 hours ago</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {list.name === 'Cyberverzekering Opportunities' ? '€736,525' : 
                         list.name === 'Einde Termijn' ? '€2,908,979' :
                         list.name === 'Zonnepanelen Opportunities' ? '€3,857,298' : '€0'}
                      </p>
                      {isSelected && (
                        <div className={`text-xs font-medium ${
                          list.name === 'Cyberverzekering Opportunities' ? 'text-green-600' : 
                          list.name === 'Einde Termijn' ? 'text-red-600' :
                          list.name === 'Zonnepanelen Opportunities' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {list.name === 'Cyberverzekering Opportunities' ? '+4%' : 
                           list.name === 'Einde Termijn' ? '-3%' :
                           list.name === 'Zonnepanelen Opportunities' ? '+8%' : '0%'}
                        </div>
                      )}
                      <button
                        className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle share functionality
                        }}
                      >
                        Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic bulk actions bar - appears below saved lists when items are selected */}
      {selectedPartners.length > 0 && (
        <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-blue-900">
              {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedPartners([])}
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

      {/* Partners table - enhanced with field visibility */}
      <div className="mx-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E7F1] text-left">
                <th className="w-12 py-3 px-4 font-medium text-[#282A3F] text-sm">
                  <div className={`transition-opacity ${
                    selectedPartners.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedPartners.length === displayedPartners.length && displayedPartners.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </th>
                {visibleFields.name && <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Partner</th>}
                {visibleFields.industry && <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Industry</th>}
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Size</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Region</th>
                {visibleFields.status && <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Status</th>}
                {visibleFields.customerCount && <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Customers</th>}
                {visibleFields.opportunityCount && <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Opportunities</th>}
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Contacts</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Template</th>
              </tr>
            </thead>
            <tbody>
              {displayedPartners.map((partner) => (
                <tr 
                  key={partner.id} 
                  className="border-b border-[#E6E7F1] hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedPartners.includes(partner.id)}
                      onChange={() => handleSelectPartner(partner.id)}
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {visibleFields.name && (
                    <td 
                      className="py-3 px-4 cursor-pointer"
                      onClick={() => navigate(`/lists/partners/${partner.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={partner.logo} alt={partner.name} />
                          <AvatarFallback className="text-xs">
                            {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[#282A3F] text-sm">{partner.name}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleFields.industry && <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.industry || 'Insurance'}</td>}
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.size || 'Medium'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.region || 'Europe'}</td>
                  {visibleFields.status && (
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                        {partner.status || 'Active'}
                      </Badge>
                    </td>
                  )}
                  {visibleFields.customerCount && <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.customerCount || 0}</td>}
                  {visibleFields.opportunityCount && <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.opportunityCount || 0}</td>}
                  <td className="py-3 px-4 text-sm text-[#696C8C]">172</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">No templates</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Segment View</DialogTitle>
            <DialogDescription>
              Save your current filters and field selections as a reusable view.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                placeholder="Enter view name..."
                value={viewNameInput}
                onChange={(e) => setViewNameInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveViewModal(false);
                setViewNameInput('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle save view logic
                console.log('Saving view:', viewNameInput, { filters, visibleFields });
                setShowSaveViewModal(false);
                setViewNameInput('');
              }}
              disabled={!viewNameInput.trim()}
            >
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PartnersPage;
