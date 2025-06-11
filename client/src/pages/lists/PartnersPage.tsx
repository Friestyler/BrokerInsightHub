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

// Fetch partners from database
const usePartnersData = () => {
  return useQuery({
    queryKey: ['/api/partners'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'partners'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=partners'),
    staleTime: 2 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
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

const useCreateSavedView = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-views', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
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
function calculatePartnerStats(partners: any[]) {
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
  // Total Value sums all opportunity amounts attached to the displayed partners
  const totalValue = partners.reduce((sum, partner) => {
    const value = parseFloat(partner.opportunity_value) || 0;
    return sum + value;
  }, 0);
  // Weighted Value calculates probability-adjusted sum of opportunity values
  const weightedValue = partners.reduce((sum, partner) => {
    const value = parseFloat(partner.weighted_opportunity_value) || 0;
    return sum + value;
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
    type?: string;
    size?: string;
  };
  members?: number[]; // Array of partner IDs for Custom Lists
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean; // Flag for system-generated default lists that can't be edited/deleted
}

// Define interface for saved views (filter combinations)
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    type?: string;
    size?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Main partner list component
// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

function PartnersTable() {
  // Fetch partners from database
  const { data: partners = [], isLoading, error } = usePartnersData();
  
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
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
  const [isSavingList, setIsSavingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // State for unsaved changes confirmation
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingListAction, setPendingListAction] = useState<{
    type: 'select' | 'clear';
    list?: SavedList;
  } | null>(null);
  
  // Function to handle navigation with unsaved changes in list editing
  const handleNavigationWithUnsavedChanges = (action: { type: 'select' | 'clear', list?: SavedList }) => {
    // Check if we're in list editing mode with unsaved changes
    if (isEditingList && activeList && !activeList.isDefault) {
      // Store the pending action and show confirmation dialog
      setPendingListAction(action);
      setShowUnsavedChangesModal(true);
      return true; // Navigation was interrupted
    }
    return false; // Navigation can proceed
  };
  
  // Fetch saved lists from database
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const createSavedListMutation = useCreateSavedList();
  const updateSavedListMutation = useUpdateSavedList();
  
  // Filter saved lists to only show partner-related lists (client-side filtering)
  const partnerSavedListsData = savedListsData.filter((list: any) => 
    list.entity_type === 'partners'
  );
  
  // Convert database records to local interface format
  const savedLists: SavedList[] = [
    // Default "All Partners" list
    {
      id: 'all-partners',
      name: 'All Partners',
      type: 'filter',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true
    },
    // Add filtered database records (only partner lists)
    ...partnerSavedListsData.map((list: any) => ({
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
  
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Fetch saved views from database
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedViews();
  const createSavedViewMutation = useCreateSavedView();
  
  // Convert database records to local interface format
  const savedViews: SavedView[] = savedViewsData.map((view: any) => ({
    id: view.id.toString(),
    name: view.name,
    description: view.description,
    filters: view.filters || {},
    createdBy: view.created_by,
    createdAt: new Date(view.created_at)
  }));
  
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  
  // Ref for views dropdown to handle outside clicks
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle outside clicks for views dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node) &&
          viewsButtonRef.current && !viewsButtonRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false);
      }
    };

    if (showViewsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewsDropdown]);
  
  const [isCreatingNewList, setIsCreatingNewList] = useState(false); // Default to adding to existing list
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);
  
  // Assign Template functionality
  const [showAssignTemplateModal, setShowAssignTemplateModal] = useState(false);
  const [selectedOKRTemplates, setSelectedOKRTemplates] = useState<number[]>([]);
  
  // Load template assignments for partners
  const { data: templateAssignments = [] } = useQuery({
    queryKey: ['/api/template-assignments/partner'],
    enabled: partners.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  // Load OKR templates from database API
  const { data: okrMetricsFromAPI = [] } = useQuery({
    queryKey: ['/api/okr-metrics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch OKR tags for dynamic color mapping - direct API call bypassing routing
  const { data: okrTags = [] } = useQuery({
    queryKey: ['okr-tags-direct'],
    queryFn: async () => {
      const response = await fetch('/api/degoudse/okr-tags');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to get tag color from database
  const getTagColor = (tagName: string) => {
    const tag = okrTags.find((t: any) => t.name === tagName);
    return tag?.color || '#6B7280';
  };

  // Transform API data to match expected template format
  const okrTemplatesData = okrMetricsFromAPI.map((metric: any) => ({
    id: metric.id,
    title: metric.name,
    description: metric.description || '',
    type: metric.hierarchy || 'metric',
    tag: metric.tags && metric.tags.length > 0 ? metric.tags[0] : 'General',
    targetValue: metric.target_value || '',
    unit: metric.measure_unit === 'percent' ? 'Percent' : 
          metric.measure_unit === 'number' ? 'Number' :
          metric.measure_unit === 'currency' ? 'Currency' : 'Number',
    frequency: metric.frequency || 'monthly',
    startDate: null,
    endDate: null,
    parentId: null, // OKR metrics are flat structure for now
    realizedValue: metric.realized_value || '0'
  }));

  // Mutation for assigning templates - use De Goudse environment
  const assignTemplatesMutation = useMutation({
    mutationFn: async ({ templateIds, partnerIds }: { templateIds: number[], partnerIds: number[] }) => {
      const results = [];
      for (const partnerId of partnerIds) {
        const response = await fetch('/api/degoudse/template-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateIds,
            entityType: 'partner',
            entityId: partnerId,
            assignedBy: 1, // Current user ID (hardcoded for now)
            notes: 'Assigned from Partners page'
          })
        });
        if (!response.ok) throw new Error('Failed to assign templates');
        const result = await response.json();
        results.push(...result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/template-assignments/partner'] });
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/partners'] });
      toast({
        title: "Templates assigned",
        description: `Successfully assigned ${selectedOKRTemplates.length} template(s) to ${selectedPartners.length} partner(s)`,
      });
      setShowAssignTemplateModal(false);
      setSelectedOKRTemplates([]);
      setSelectedPartners([]);
    },
    onError: (error) => {
      toast({
        title: "Error assigning templates",
        description: "Failed to assign templates. Please try again.",
        variant: "destructive"
      });
    }
  });
    
  // Filter partners based on search text, filter selections, and list membership
  const displayedPartners = partners
    .filter((partner: any) => {
      // Handle selection-based lists (with member IDs)
      if (activeList && !activeList.isDefault && activeList.type === 'selection' && Array.isArray(activeList.members)) {
        if (!activeList.members.includes(partner.id)) {
          return false;
        }
      }
      
      // Handle filter-based lists from database
      if (activeList && activeList.type === 'filter' && activeList.filters) {
        // Apply database filters for saved lists
        if (activeList.filters.status && partner.status !== activeList.filters.status) {
          return false;
        }
        if (activeList.filters.industry && partner.industry !== activeList.filters.industry) {
          return false;
        }
        if (activeList.filters.type && partner.type !== activeList.filters.type) {
          return false;
        }
      }
      
      const matchesText = !filterText || 
        partner.name.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.industry.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.type.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesStatus = !selectedStatus || partner.status === selectedStatus;
      const matchesIndustry = !selectedIndustry || partner.industry === selectedIndustry;
      const matchesType = !selectedType || partner.type === selectedType;
      
      return matchesText && matchesStatus && matchesIndustry && matchesType;
    })
    // Apply sorting
    .sort((a: any, b: any) => {
      if (!tableSortConfig.key) {
        return a.name.localeCompare(b.name); // Default sort by name
      }
      
      const aValue = a[tableSortConfig.key] || '';
      const bValue = b[tableSortConfig.key] || '';
      
      if (tableSortConfig.key === 'name' || tableSortConfig.key === 'industry' || tableSortConfig.key === 'type' || tableSortConfig.key === 'status' || tableSortConfig.key === 'size' || tableSortConfig.key === 'region' || tableSortConfig.key === 'template') {
        const result = aValue.localeCompare(bValue);
        return tableSortConfig.direction === 'asc' ? result : -result;
      }
      
      // Handle numeric columns (customers, opportunities)
      if (tableSortConfig.key === 'customers' || tableSortConfig.key === 'opportunities') {
        const aNum = parseInt(aValue) || 0;
        const bNum = parseInt(bValue) || 0;
        const result = aNum - bNum;
        return tableSortConfig.direction === 'asc' ? result : -result;
      }
      
      return 0;
    });
  
  // Check if current filters differ from original list filters to detect unsaved changes
  useEffect(() => {
    if (activeList && originalListFilters) {
      const currentFilters = {
        searchText: filterText || undefined,
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
        type: selectedType || undefined,
        size: originalListFilters.size // Preserve size filter if it exists
      };
      
      // Compare current filters with original list filters
      const hasChanges = 
        currentFilters.searchText !== originalListFilters.searchText ||
        currentFilters.status !== originalListFilters.status ||
        currentFilters.industry !== originalListFilters.industry ||
        currentFilters.type !== originalListFilters.type;
      
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [filterText, selectedStatus, selectedIndustry, selectedType, activeList, originalListFilters]);
  
  // Function to revert changes to the original list filters
  const revertChanges = () => {
    if (activeList && originalListFilters) {
      setFilterText(originalListFilters.searchText || '');
      setSelectedStatus(originalListFilters.status || '');
      setSelectedIndustry(originalListFilters.industry || '');
      setSelectedType(originalListFilters.type || '');
      setHasUnsavedChanges(false);
    }
  };
  
  // Initialize toast
  const { toast } = useToast();

  // Function to save changes to the current list
  const saveChanges = () => {
    if (activeList && !activeList.isDefault) {
      const updatedList = {
        ...activeList,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          industry: selectedIndustry || undefined,
          type: selectedType || undefined,
          size: originalListFilters?.size // Preserve size filter if it exists
        },
        createdAt: new Date() // Update the timestamp
      };
      
      // Update the list in the savedLists array
      const updatedLists = savedLists.map(list => 
        list.id === activeList.id ? updatedList : list
      );
      
      setSavedLists(updatedLists);
      setActiveList(updatedList);
      setOriginalListFilters(updatedList.filters);
      setHasUnsavedChanges(false);
      
      // Show toast notification for successful save
      toast({
        title: "List Saved",
        description: "Your changes have been saved successfully"
      });
    }
  };
  


  // Calculate stats based on the same data shown in the table
  const tableData = isEditingList ? partners : displayedPartners;
  const stats = calculatePartnerStats(Array.isArray(tableData) ? tableData : []);
  
  // Function to toggle partner selection
  const toggleSelectPartner = (id: number) => {
    if (selectedPartners.includes(id)) {
      setSelectedPartners(selectedPartners.filter(partnerId => partnerId !== id));
    } else {
      setSelectedPartners([...selectedPartners, id]);
    }
  };
  
  // Function to toggle select/deselect all partners
  const toggleSelectAll = () => {
    if (selectedPartners.length === displayedPartners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(displayedPartners.map(partner => partner.id));
    }
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

  return (
    <div className="space-y-4">
      {/* Unified toolbar with more emphasis on saved lists */}
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
              {/* Saved Lists dropdown - redesigned to match provided image */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                    <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                  </svg>
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    {activeList ? activeList.name : "All Partners"}
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
                
                {/* Saved Lists dropdown menu - shadcn/ui style with Qollabi colors */}
                {showListsDropdown && (
                  <div className="absolute z-50 mt-1.5 w-80 rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                    {/* No search section as per screenshot */}
                    
                    {/* Lists with edit options */}
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {savedLists.map(list => (
                        <div 
                          key={list.id}
                          className="relative"
                        >
                          <div
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                            onClick={() => {
                              // Don't do anything if clicking on already active list
                              if (activeList?.id === list.id) {
                                setShowListsDropdown(false);
                                return;
                              }
                              
                              // Check if we're in list editing mode before switching lists
                              if (isEditingList) {
                                // Store the pending action and show confirmation dialog
                                setPendingListAction({
                                  type: list.isDefault && list.name === "All Partners" ? 'clear' : 'select',
                                  list: list.isDefault && list.name === "All Partners" ? undefined : list
                                });
                                setShowUnsavedChangesModal(true);
                                setShowListsDropdown(false);
                                return;
                              }
                              
                              // Special handling for "All Partners" default list
                              if (list.isDefault && list.name === "All Partners") {
                                // Clear filters and active list (same behavior as "Return to all partners" button)
                                setActiveList(null);
                                setOriginalListFilters(null);
                                setFilterText('');
                                setSelectedStatus('');
                                setSelectedIndustry('');
                                setSelectedType('');
                                setHasUnsavedChanges(false);
                              } else {
                                // Normal behavior for other lists
                                setActiveList(list);
                                // Store the original filters to enable reverting changes
                                setOriginalListFilters(list.filters);
                                // Apply filter settings
                                setFilterText(list.filters.searchText || '');
                                setSelectedStatus(list.filters.status || '');
                                setSelectedIndustry(list.filters.industry || '');
                                setSelectedType(list.filters.type || '');
                                setHasUnsavedChanges(false);
                              }
                              
                              // Clear any active view when switching lists
                              setActiveView(null);
                              setShowListsDropdown(false);
                            }}
                          >
                            <div className="flex flex-1 items-center">
                              <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>{list.name}</span>
                              {list.is_shared && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-green-500" title="Shared">
                                  <circle cx="18" cy="5" r="3"></circle>
                                  <circle cx="6" cy="12" r="3"></circle>
                                  <circle cx="18" cy="19" r="3"></circle>
                                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                              )}
                            </div>
                            
                            {/* Dropdown menu for non-default lists */}
                            {!list.isDefault && (
                              <div className="ml-auto">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button 
                                      className="rounded-full p-1 hover:bg-slate-100 text-slate-500 focus:outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="12" cy="5" r="1"></circle>
                                        <circle cx="12" cy="19" r="1"></circle>
                                      </svg>
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    className="bg-white p-2 rounded-md shadow-md min-w-[160px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <DropdownMenuItem 
                                      className="py-1.5 font-medium text-[#282A3F]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setListToRename(list);
                                        setNewListName(list.name);
                                        setShowRenameListModal(true);
                                      }}
                                    >
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="py-1.5 font-medium text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setListToDelete(list);
                                        setShowDeleteListModal(true);
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                            
                            {/* Visual indicator for default list */}
                            {list.isDefault && (
                              <div className="ml-auto">
                                <span className="text-xs text-[#282A3F] italic" style={{ fontFamily: 'Poppins, sans-serif' }}>Default</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* No 'Create new list' button as specified by the user */}
                  </div>
                )}
              </div>
              
              {/* List actions when a list is active */}
              {activeList && (
                <div className="flex items-center gap-2">
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`text-indigo-600 ${isEditingList ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      // Show campaign options modal
                      // This would be implemented with a proper modal in the final version
                      alert('This list can be added to a campaign in the Campaigns section');
                    }}
                    disabled={isEditingList}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22 11 13 2 9 22 2z" />
                    </svg>
                    Add to Campaign
                  </Button>
                  

                </div>
              )}
            </div>
            
            {/* Right-side action buttons */}
            <div className="flex items-center gap-2 text-[14px] font-medium text-[#696C8C]">
              
              {/* Edit list button - only visible when a custom list is selected */}
              {activeList && activeList.type === 'selection' && !activeList.isDefault && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`md:flex items-center ${isEditingList ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : ''}`}
                  onClick={() => {
                    if (isEditingList) {
                      setIsEditingList(false);
                    } else {
                      // Initialize edited list members with current list members
                      setEditedListMembers(activeList?.members || []);
                      setIsEditingList(true);
                    }
                  }}
                  disabled={isEditingList && isSavingList}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  {isEditingList ? 'Cancel' : 'Edit list'}
                </Button>
              )}
              
              {/* Save button - only visible in edit mode */}
              {isEditingList && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="md:flex items-center bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    setIsSavingList(true);
                    // Save changes to the list
                    setTimeout(() => {
                      setIsEditingList(false);
                      setIsSavingList(false);
                      
                      // Update the list with the edited members
                      if (activeList) {
                        const updatedLists = savedLists.map(list => 
                          list.id === activeList.id 
                            ? {...list, members: editedListMembers}
                            : list
                        );
                        setSavedLists(updatedLists);
                        setActiveList({...activeList, members: editedListMembers});
                        
                        // Show success toast
                        toast({
                          title: "List updated",
                          description: "Your changes to the list have been saved.",
                        });
                      }
                    }, 500); // Simulate a short delay for saving
                  }}
                  disabled={isSavingList}
                >
                  {isSavingList ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save"}
                </Button>
              )}
              
              <button 
                className={`hidden md:flex items-center px-4 py-2 text-[#696C8C] rounded-md border border-gray-300 hover:bg-[#F5F6FE] ${isEditingList ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isEditingList}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 500 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#696C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
              
{/* New button removed as requested */}
            </div>
          </div>
          
          {/* Top row with search, views dropdown and filter buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search field */}
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder="Search by name, industry..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
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
                  ref={viewsButtonRef}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white ${isEditingList ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    if (!isEditingList) {
                      setShowViewsDropdown(!showViewsDropdown);
                    }
                  }}
                  disabled={isEditingList}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="text-gray-700">{activeView ? activeView.name : "Select a view"}</span>
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
                
                {/* Saved Views dropdown menu */}
                {showViewsDropdown && (
                  <div ref={viewsDropdownRef} className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                    <div className="p-2 border-b">
                      {savedViews.map(view => (
                        <div 
                          key={view.id}
                          className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                          onClick={() => {
                            setActiveView(view);
                            setFilterText(view.filters.searchText || '');
                            setSelectedStatus(view.filters.status || '');
                            setSelectedIndustry(view.filters.industry || '');
                            setSelectedType(view.filters.type || '');
                            setShowViewsDropdown(false);
                          }}
                        >
                          <div className="flex items-center">
                            {view.name}
                          </div>
                          {activeView?.id === view.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                    {activeView && (
                      <div className="p-2">
                        <button 
                          className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                          onClick={() => {
                            setShowViewsDropdown(false);
                            // Clear active view
                            setActiveView(null);
                            // Reset filters if needed
                            setFilterText('');
                            setSelectedStatus('');
                            setSelectedIndustry('');
                            setSelectedType('');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                          Clear view
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Filter buttons next to the views dropdown */}
              <div className="flex items-center gap-2 ml-3">
                <button 
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedStatus ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedStatus(selectedStatus ? '' : 'active')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>{selectedStatus ? `Status: ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}` : 'Status'}</span>
                  {selectedStatus && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedIndustry ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedIndustry(selectedIndustry ? '' : 'Insurance')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>{selectedIndustry ? `Industry: ${selectedIndustry}` : 'Industry'}</span>
                  {selectedIndustry && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedType ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedType(selectedType ? '' : 'Broker')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>{selectedType ? `Type: ${selectedType}` : 'Type'}</span>
                  {selectedType && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Action buttons - only shown when filters have changed from an existing view or no view is selected */}
              {/* Determine if filters have changed from the active view */}
              {(() => {
                // Calculate if filters have been modified from the active view
                const filtersChanged = activeView && 
                  (filterText !== (activeView.filters.searchText || '') || 
                   selectedStatus !== (activeView.filters.status || '') || 
                   selectedIndustry !== (activeView.filters.industry || '') || 
                   selectedType !== (activeView.filters.type || ''));
                   
                // Only render buttons if there are filters applied or filters have changed
                return (filterText || selectedStatus || selectedIndustry || selectedType) && (
                  <div className="flex items-center gap-2">
                    {/* Show Revert and Save buttons only when a view is active AND filters have changed */}
                    {filtersChanged && (
                      <>
                        {/* Revert changes button */}
                        <button 
                          className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                          onClick={() => {
                            // Revert to view's original filters
                            setFilterText(activeView.filters.searchText || '');
                            setSelectedStatus(activeView.filters.status || '');
                            setSelectedIndustry(activeView.filters.industry || '');
                            setSelectedType(activeView.filters.type || '');
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
                          className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                          onClick={() => {
                            // Update the current view
                            const updatedViews = savedViews.map(view => {
                              if (view.id === activeView.id) {
                                return {
                                  ...view,
                                  filters: {
                                    searchText: filterText || undefined,
                                    status: selectedStatus || undefined,
                                    industry: selectedIndustry || undefined,
                                    type: selectedType || undefined
                                  }
                                };
                              }
                              return view;
                            });
                            setSavedViews(updatedViews);
                            setActiveView(updatedViews.find(view => view.id === activeView.id) || null);
                            
                            toast({
                              title: "View Updated",
                              description: "Your changes have been saved to the current view"
                            });
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
                    )}
                  </div>
                );
              })()}
            </div>
            
            {/* Clear filters button - shown when any filters are applied */}
            {(filterText || selectedStatus || selectedIndustry || selectedType) && (
              <div className="mt-2">
                <button 
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setFilterText('');
                    setSelectedStatus('');
                    setSelectedIndustry('');
                    setSelectedType('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear filters
                </button>
              </div>
            )}
            
            {/* List editing actions - shown only for non-default lists with unsaved changes */}
            {hasUnsavedChanges && activeList && !activeList.isDefault && (
              <div className="flex items-center gap-2 mt-2">
                <button 
                  className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                  onClick={revertChanges}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                  <span className="text-[#5F6585]">Revert changes</span>
                </button>
                
                <button 
                  className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                  onClick={saveChanges}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span className="text-[#3E4DC4] font-medium">Save</span>
                </button>
              </div>
            )}
            

          </div>
        </div>
      </div>
      {/* Selection actions bar - visible when items are selected */}
      {selectedPartners.length > 0 && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-indigo-700 font-medium mr-2 text-[14px]">{selectedPartners.length} partners selected</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600"
              onClick={() => setSelectedPartners([])}
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
              Add to List
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-indigo-600"
              onClick={() => {
                alert('Selected partners can be added to a campaign. This will be available in the Campaigns section');
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
                // Reload templates when opening the modal
                const storedTemplates = localStorage.getItem('okrTemplates');
                if (storedTemplates) {
                  try {
                    const templates = JSON.parse(storedTemplates);
                    setOkrTemplatesData(templates);
                  } catch (error) {
                    console.error('Error loading templates:', error);
                  }
                }
                setShowAssignTemplateModal(true);
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
      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalPartners}</div>
          <div className="text-sm text-gray-500">Total Partners</div>
        </div>
        

        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{formatCurrency(stats.totalValue)}</div>
          <div className="text-sm text-gray-500">Total Value Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{formatCurrency(Math.round(stats.weightedValue))}</div>
          <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
        </div>
      </div>
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
              Add selected partners to an existing list or create a new one.
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
                {selectedPartners.length} partners will be added to this list.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (isCreatingNewList) {
                  // Create new list with selected partners
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
                  
                  // Create a new list with only the selected partners
                  const newList: SavedList = {
                    id: `list-${Date.now()}`,
                    name: listName,
                    description: listDescription || undefined,
                    type: 'selection', // This is a selection-based list, not filter-based
                    members: selectedPartners, // Add only the selected partners as members
                    filters: {}, // Empty filters since this is a selection-based list
                    isShared: false,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // Create the new list in database
                  createSavedListMutation.mutate({
                    name: listName,
                    description: listDescription || undefined,
                    type: 'selection',
                    entity_type: 'partners',
                    members: selectedPartners,
                    filters: {},
                    is_shared: false
                  }, {
                    onSuccess: (createdList) => {
                      // Convert to local format and set as active
                      const newList: SavedList = {
                        id: createdList.id.toString(),
                        name: createdList.name,
                        description: createdList.description,
                        type: 'selection',
                        filters: {},
                        members: createdList.members || [],
                        isShared: false,
                        createdBy: 'John Smith',
                        createdAt: new Date(createdList.created_at)
                      };
                      setActiveList(newList);
                      setOriginalListFilters(newList.filters);
                    }
                  });
                  
                  // Clear selections and close modal
                  setSelectedPartners([]);
                  setShowSaveListModal(false);
                  
                  // Show success message
                  toast({
                    title: "List Created",
                    description: `"${listName}" has been created with ${selectedPartners.length} partners.`
                  });
                  
                } else {
                  // Add to existing list
                  if (!selectedExistingList) {
                    toast({
                      title: "List Required",
                      description: "Please select a list to add partners to",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // Find the target list
                  const targetList = savedLists.find(list => list.id === selectedExistingList);
                  if (!targetList) return;
                  
                  // Get existing members to avoid duplicates
                  const existingMembers = targetList.members || [];
                  const newMembers = selectedPartners.filter(id => !existingMembers.includes(id));
                  const alreadyInList = selectedPartners.length - newMembers.length;
                  
                  // Update the list with new members
                  const updatedLists = savedLists.map(list => {
                    if (list.id === selectedExistingList) {
                      return {
                        ...list,
                        members: [...existingMembers, ...newMembers]
                      };
                    }
                    return list;
                  });
                  
                  // Update the list in database
                  const targetListNumericId = parseInt(selectedExistingList);
                  if (!isNaN(targetListNumericId)) {
                    updateSavedListMutation.mutate({
                      id: targetListNumericId,
                      data: {
                        members: [...existingMembers, ...newMembers]
                      }
                    }, {
                      onSuccess: (updatedList) => {
                        const formattedList: SavedList = {
                          id: updatedList.id.toString(),
                          name: updatedList.name,
                          description: updatedList.description,
                          type: updatedList.type as 'filter' | 'selection',
                          filters: updatedList.filters || {},
                          members: updatedList.members || [],
                          isShared: updatedList.is_shared,
                          createdBy: 'John Smith',
                          createdAt: new Date(updatedList.created_at)
                        };
                        setActiveList(formattedList);
                        setOriginalListFilters(formattedList.filters);
                      }
                    });
                  }
                  
                  // Clear selections and close modal
                  setSelectedPartners([]);
                  setShowSaveListModal(false);
                  
                  // Show success message with info about duplicates
                  let description = `${newMembers.length} partners added to "${targetList.name}".`;
                  if (alreadyInList > 0) {
                    description += ` ${alreadyInList} partner${alreadyInList > 1 ? 's' : ''} already in list.`;
                  }
                  
                  toast({
                    title: "Partners Added to List",
                    description
                  });
                }
              }}
              disabled={
                (!isCreatingNewList && !selectedExistingList)
              }
            >
              {isCreatingNewList ? 'Create List' : 'Add to List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Save as new View Modal */}
      <Dialog 
        open={showSaveViewModal} 
        onOpenChange={(open) => {
          if (open) {
            // Always start with empty input for "Save as new view"
            setViewNameInput('');
          }
          setShowSaveViewModal(open);
        }}>
        <DialogContent className="sm:max-w-md bg-[#ffffff] text-[#282A3F] p-[32px]">
          <DialogHeader>
            <DialogTitle>Save as new view</DialogTitle>
            <DialogDescription className="text-sm text-[#282A3F]">
              Save your current filter settings as a new view that you can easily access later. Views store filter combinations but not specific partner selections.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="viewName">View Name<span className="text-red-500">*</span></Label>
              <Input 
                id="viewName" 
                placeholder="Enter a name for this view"
                maxLength={50}
                value={viewNameInput}
                onChange={(e) => setViewNameInput(e.target.value)}
              />
              <p className="text-xs text-gray-500">Maximum 50 characters</p>
            </div>
            
            <div className="bg-[#EBEEFB] p-4 rounded-md border border-[#D4D9F3]">
              <div className="text-sm font-medium mb-2 text-[#282A3F]">Filters saved in this view</div>
              <div className="space-y-2">
                {selectedStatus && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24 text-[#3E4DC4]">Status:</span>
                    <span className="text-[#282A3F]">{selectedStatus}</span>
                  </div>
                )}
                {selectedIndustry && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24 text-[#3E4DC4]">Industry:</span>
                    <span className="text-[#282A3F]">{selectedIndustry}</span>
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24 text-[#3E4DC4]">Type:</span>
                    <span className="text-[#282A3F]">{selectedType}</span>
                  </div>
                )}
                {filterText && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24 text-[#3E4DC4]">Search:</span>
                    <span className="text-[#282A3F]">{filterText}</span>
                  </div>
                )}
                {!selectedStatus && !selectedIndustry && !selectedType && !filterText && (
                  <div className="text-sm text-[#5F6585] italic">No filters currently applied</div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!viewNameInput.trim()}
              onClick={() => {
                // Always create a new view
                const viewName = viewNameInput.trim();
                
                if (!viewName) {
                  toast({
                    title: "Name Required",
                    description: "Please provide a name for this view",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Check for duplicate view names
                const isDuplicate = savedViews.some(view => 
                  view.name.toLowerCase() === viewName.toLowerCase()
                );
                
                if (isDuplicate) {
                  toast({
                    title: "Duplicate Name",
                    description: "A view with this name already exists. Please choose a different name.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Create new view
                const newView: SavedView = {
                  id: `view-${Date.now()}`,
                  name: viewName,
                  description: undefined,
                  filters: {
                    searchText: filterText || undefined,
                    status: selectedStatus || undefined,
                    industry: selectedIndustry || undefined,
                    type: selectedType || undefined
                  },
                  createdBy: 'John Smith',
                  createdAt: new Date()
                };
                
                // Create the new view in database
                createSavedViewMutation.mutate({
                  name: viewName,
                  entity_type: 'partners',
                  filters: {
                    searchText: filterText || undefined,
                    status: selectedStatus || undefined,
                    industry: selectedIndustry || undefined,
                    type: selectedType || undefined
                  },
                  is_shared: false
                }, {
                  onSuccess: (createdView) => {
                    const newView: SavedView = {
                      id: createdView.id.toString(),
                      name: createdView.name,
                      description: createdView.description,
                      filters: createdView.filters || {},
                      createdBy: 'John Smith',
                      createdAt: new Date(createdView.created_at)
                    };
                    setActiveView(newView);
                    
                    // Invalidate the saved views cache to refresh the dropdown
                    queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'partners'] });
                  }
                });
                
                toast({
                  title: "View Saved",
                  description: "Your new view has been saved successfully"
                });
                
                setShowSaveViewModal(false);
              }}
            >
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Template Modal */}
      <Dialog open={showAssignTemplateModal} onOpenChange={setShowAssignTemplateModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign OKR Templates</DialogTitle>
            <DialogDescription>
              Select OKR templates to assign to {selectedPartners.length} selected partner{selectedPartners.length !== 1 ? 's' : ''}. 
              Templates will be converted to active OKRs with tracking capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selected Partners Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="font-medium text-blue-900">
                  {selectedPartners.length} Partner{selectedPartners.length !== 1 ? 's' : ''} Selected
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {partners
                  .filter(p => selectedPartners.includes(p.id))
                  .map(p => p.name)
                  .join(', ')}
              </div>
            </div>

            {/* OKR Templates Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Available OKR Templates</h3>
                <span className="text-sm text-gray-500">
                  {selectedOKRTemplates.length} of {okrTemplatesData.length} selected
                </span>
              </div>
              
              {okrTemplatesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-gray-400">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p className="text-lg font-medium mb-1">No OKR Templates Available</p>
                  <p className="text-sm">Create some OKR templates first in the Templates section to assign them to partners.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {/* Select All Checkbox */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="select-all-templates"
                      checked={selectedOKRTemplates.length === okrTemplatesData.length && okrTemplatesData.length > 0}
                      onChange={() => {
                        if (selectedOKRTemplates.length === okrTemplatesData.length) {
                          setSelectedOKRTemplates([]);
                        } else {
                          setSelectedOKRTemplates(okrTemplatesData.map(t => t.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all-templates" className="ml-3 font-medium text-gray-900">
                      Select All Templates
                    </label>
                  </div>

                  {/* Template Items Grouped by Tag */}
                  {(() => {
                    // Group templates by tag, same as Coming Soon tab
                    const groupedTemplates = okrTemplatesData.reduce((groups: Record<string, any[]>, template: any) => {
                      const tag = template.tag || 'No Tag';
                      if (!groups[tag]) groups[tag] = [];
                      groups[tag].push(template);
                      return groups;
                    }, {});

                    // Sort groups by tag name, with "No Tag" at the end
                    const sortedGroups = Object.entries(groupedTemplates).sort(([a], [b]) => {
                      if (a === 'No Tag') return 1;
                      if (b === 'No Tag') return -1;
                      return a.localeCompare(b);
                    });

                    return sortedGroups.map(([tag, templates]) => (
                      <div key={tag} className="space-y-3">
                        {/* Tag Group Header - Left Aligned like Coming Soon tab */}
                        <div className="pt-4 pb-2 first:pt-0">
                          <span 
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${getTagColor(tag)}20`,
                              color: getTagColor(tag),
                              border: `1px solid ${getTagColor(tag)}40`
                            }}
                          >
                            {tag} ({templates.length})
                          </span>
                        </div>
                        
                        {/* Templates in this group */}
                        <div className="space-y-2">
                          {templates.map((template: any) => (
                            <div key={template.id} className="flex items-start p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <input
                                type="checkbox"
                                id={`template-${template.id}`}
                                checked={selectedOKRTemplates.includes(template.id)}
                                onChange={() => {
                                  if (selectedOKRTemplates.includes(template.id)) {
                                    // Deselecting - remove this item and any dependents
                                    const toRemove = new Set([template.id]);
                                    
                                    // If removing an Objective, also remove its Activities and Subactivities
                                    if (template.type === 'Objective') {
                                      okrTemplatesData.forEach(t => {
                                        if (t.parentId === template.id || 
                                            (t.parentId && okrTemplatesData.find(p => p.id === t.parentId && p.parentId === template.id))) {
                                          toRemove.add(t.id);
                                        }
                                      });
                                    }
                                    // If removing an Activity, also remove its Subactivities
                                    else if (template.type === 'Activity') {
                                      okrTemplatesData.forEach(t => {
                                        if (t.parentId === template.id) {
                                          toRemove.add(t.id);
                                        }
                                      });
                                    }
                                    
                                    setSelectedOKRTemplates(selectedOKRTemplates.filter(id => !toRemove.has(id)));
                                  } else {
                                    // Selecting - add this item and required parents
                                    const toAdd = new Set([template.id]);
                                    
                                    // If selecting an Activity, also select its parent Objective
                                    if (template.type === 'Activity' && template.parentId) {
                                      toAdd.add(template.parentId);
                                    }
                                    // If selecting a Subactivity, select both Activity and Objective
                                    else if (template.type === 'Subactivity' && template.parentId) {
                                      toAdd.add(template.parentId);
                                      const parentActivity = okrTemplatesData.find(t => t.id === template.parentId);
                                      if (parentActivity && parentActivity.parentId) {
                                        toAdd.add(parentActivity.parentId);
                                      }
                                    }
                                    
                                    setSelectedOKRTemplates([...selectedOKRTemplates, ...Array.from(toAdd).filter(id => !selectedOKRTemplates.includes(id))]);
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <label htmlFor={`template-${template.id}`} className="font-medium text-gray-900 cursor-pointer text-sm">
                                    {template.title}
                                  </label>
                                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    {template.type}
                                  </span>
                                </div>
                                {template.description && (
                                  <p className="text-xs text-gray-600 mb-1">{template.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {template.targetValue && template.unit && (
                                    <span>🎯 {template.targetValue}{
                                      template.unit === 'Number' ? '#' :
                                      template.unit === 'Currency' ? '€' :
                                      template.unit === 'Percent' ? '%' :
                                      template.unit === 'Checkbox' ? ' complete' : ''
                                    }{template.frequency ? ` ${template.frequency.toLowerCase()}` : ''}</span>
                                  )}
                                  {template.startDate && template.endDate && (
                                    <span>📅 {new Date(template.startDate).toLocaleDateString()} - {new Date(template.endDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Assignment Options */}
            {selectedOKRTemplates.length > 0 && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900">Assignment Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="set-due-dates" 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="set-due-dates" className="ml-2 text-sm text-gray-700">
                      Set custom due dates for assigned OKRs
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="assign-responsible" 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="assign-responsible" className="ml-2 text-sm text-gray-700">
                      Assign responsible persons during assignment
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="send-notifications" 
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="send-notifications" className="ml-2 text-sm text-gray-700">
                      Send notification emails to partners about new OKRs
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedOKRTemplates.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="font-medium text-green-900">Assignment Summary</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {selectedOKRTemplates.length} template{selectedOKRTemplates.length !== 1 ? 's' : ''} will be assigned to{' '}
                  {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''}, creating{' '}
                  {selectedOKRTemplates.length * selectedPartners.length} active OKR{selectedOKRTemplates.length * selectedPartners.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignTemplateModal(false);
                setSelectedOKRTemplates([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              disabled={selectedOKRTemplates.length === 0}
              onClick={() => {
                if (selectedOKRTemplates.length > 0 && selectedPartners.length > 0) {
                  assignTemplatesMutation.mutate({
                    templateIds: selectedOKRTemplates,
                    partnerIds: selectedPartners
                  });
                } else {
                  toast({
                    title: "Selection required",
                    description: "Please select at least one template and one partner",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign {selectedOKRTemplates.length} Template{selectedOKRTemplates.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mode Indicator */}
      {isEditingList && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg mb-4 p-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <div>
              <h3 className="text-base font-medium text-indigo-900">Editing "{activeList?.name}" List</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Use the checkboxes to select or deselect partners. All selected partners will be included in this list when you save.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Table section without a border */}
      <div className="bg-white overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10 pt-[12px] pb-[12px] group">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${
                      isEditingList 
                        ? 'visible' 
                        : (selectedPartners.length > 0 ? 'visible' : 'invisible group-hover:visible')
                    }`}
                  checked={isEditingList 
                    ? editedListMembers.length === (activeList ? partners.length : displayedPartners.length) && (activeList ? partners.length : displayedPartners.length) > 0
                    : selectedPartners.length === displayedPartners.length && displayedPartners.length > 0
                  }
                  onChange={isEditingList 
                    ? () => {
                        if (editedListMembers.length === (activeList ? partners.length : displayedPartners.length)) {
                          setEditedListMembers([]);
                        } else {
                          setEditedListMembers(partners.map(p => p.id));
                        }
                      }
                    : toggleSelectAll
                  }
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
                Partner
              </SortableTableHead>
              <SortableTableHead 
                sortKey="industry" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Industry
              </SortableTableHead>
              <SortableTableHead 
                sortKey="type" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Type
              </SortableTableHead>
              <SortableTableHead 
                sortKey="size" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Size
              </SortableTableHead>
              <SortableTableHead 
                sortKey="region" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Region
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
                sortKey="opportunities" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Opportunities
              </SortableTableHead>
              <SortableTableHead 
                sortKey="template" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Template
              </SortableTableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {(isEditingList ? partners : displayedPartners).map((partner) => (
              <tr 
                key={partner.id} 
                className={`hover:bg-gray-50 group ${
                  isEditingList 
                    ? editedListMembers.includes(partner.id) ? 'bg-indigo-50' : '' 
                    : selectedPartners.includes(partner.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${
                      isEditingList 
                        ? 'visible' 
                        : selectedPartners.includes(partner.id) ? 'visible' : 'invisible group-hover:visible'
                    }`}
                    checked={
                      isEditingList
                        ? editedListMembers.includes(partner.id)
                        : selectedPartners.includes(partner.id)
                    }
                    onChange={() => {
                      if (isEditingList) {
                        if (editedListMembers.includes(partner.id)) {
                          setEditedListMembers(editedListMembers.filter(id => id !== partner.id));
                        } else {
                          setEditedListMembers([...editedListMembers, partner.id]);
                        }
                      } else {
                        toggleSelectPartner(partner.id);
                      }
                    }}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <div className="flex items-center">
                    <EntityAvatar
                      entityType="partner"
                      entityId={partner.id}
                      fallbackText={partner.initials}
                      className="mr-3"
                      size="md"
                    />
                    <Link href={`/lists/partners/${partner.id}`} className="font-medium text-gray-900 hover:text-indigo-700">{partner.name}</Link>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{partner.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{partner.region}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {partner.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.customers || 0}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.opportunities || 0}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges partnerId={partner.id} templateAssignments={templateAssignments} okrTags={okrTags} />
                </td>
              </tr>
            ))}
            
            {displayedPartners.length === 0 && !isEditingList && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No partners found</h3>
                    {activeList && activeList.id !== 'all-partners' ? (
                      <>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          This list doesn't have any partners yet. Add some partners to get started.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingList(true)}
                        >
                          Edit List
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          There are no partners matching your filter criteria.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setFilterText('');
                            setSelectedStatus('');
                            setSelectedIndustry('');
                            setSelectedType('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Rename List Dialog */}
      <Dialog open={showRenameListModal} onOpenChange={setShowRenameListModal}>
        <DialogContent className="sm:max-w-md" style={{ background: '#ffffff', color: '#282A3F', padding: '32px' }}>
          <DialogHeader>
            <DialogTitle>Rename List</DialogTitle>
            <DialogDescription>
              Enter a new name for your list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="renameListName" className="mb-2 block">List Name</Label>
            <Input
              id="renameListName"
              placeholder="Enter a new name for the list"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full"
              maxLength={50}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameListModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (listToRename && newListName.trim() !== '' && newListName !== listToRename.name) {
                  // Update the list name in the savedLists array
                  const updatedLists = savedLists.map(l => 
                    l.id === listToRename.id ? {...l, name: newListName.trim()} : l
                  );
                  setSavedLists(updatedLists);
                  
                  // If this is the active list, update that too
                  if (activeList && activeList.id === listToRename.id) {
                    setActiveList({...activeList, name: newListName.trim()});
                  }
                  
                  // Show success message
                  toast({
                    title: "List renamed",
                    description: `The list has been renamed to "${newListName.trim()}"`,
                  });
                  
                  // Close the dialog
                  setShowRenameListModal(false);
                }
              }}
              disabled={!newListName || newListName.trim() === ''}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete List Dialog */}
      <Dialog open={showDeleteListModal} onOpenChange={setShowDeleteListModal}>
        <DialogContent className="sm:max-w-md" style={{ background: '#ffffff', color: '#282A3F', padding: '32px' }}>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription className="text-sm text-[#282A3F]">
              Are you sure you want to delete this list? This action cannot be undone.
              Deleting a list does not delete the partner records themselves.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {listToDelete && (
              <p className="font-medium text-lg text-center">{listToDelete.name}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteListModal(false)}>
              Cancel
            </Button>
            <Button 
              className="text-[#FFFFFF] bg-[#D3321D] pl-[14px] pr-[14px] ml-[12px] mr-[12px] hover:bg-destructive/90"
              onClick={() => {
                if (listToDelete) {
                  // Prevent deletion of system lists
                  if (listToDelete.isDefault) {
                    toast({
                      title: "Cannot Delete System List",
                      description: "System lists like 'All Partners' cannot be deleted.",
                      variant: "destructive"
                    });
                    setShowDeleteListModal(false);
                    setShowListsDropdown(false);
                    return;
                  }
                
                  // Remove the list from savedLists
                  const updatedLists = savedLists.filter(l => l.id !== listToDelete.id);
                  setSavedLists(updatedLists);
                  
                  // If this was the active list, go back to "All Partners"
                  if (activeList && activeList.id === listToDelete.id) {
                    // Find the "All Partners" list
                    const allPartnersList = savedLists.find(list => list.id === 'all-partners');
                    if (allPartnersList) {
                      setActiveList(allPartnersList);
                      setOriginalListFilters(allPartnersList.filters);
                    } else {
                      setActiveList(null);
                      setOriginalListFilters(null);
                    }
                    
                    // Reset filters
                    setFilterText('');
                    setSelectedStatus('');
                    setSelectedIndustry('');
                    setSelectedType('');
                    setHasUnsavedChanges(false);
                  }
                  
                  // Show success message
                  toast({
                    title: "List deleted",
                    description: `The list "${listToDelete.name}" has been deleted. Your partner records remain intact.`,
                  });
                  
                  // Close the dialog and dropdown
                  setShowDeleteListModal(false);
                  setShowListsDropdown(false);
                }
              }}
            >Delete list</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={showUnsavedChangesModal} onOpenChange={setShowUnsavedChangesModal}>
        <DialogContent className="sm:max-w-md" style={{ background: '#ffffff', color: '#282A3F', padding: '32px' }}>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription className="text-sm text-[#282A3F]">
              You're currently editing this list and have unsaved changes. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                // Cancel navigation and keep editing
                setShowUnsavedChangesModal(false);
                setPendingListAction(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                // Handle exit from list editing mode if needed
                if (isEditingList) {
                  // Exit editing mode without saving changes
                  setIsEditingList(false);
                  // Reset the edited list members back to original
                  if (activeList && activeList.members) {
                    setEditedListMembers([...activeList.members]);
                  }
                }
                
                // Then proceed with the pending action
                if (pendingListAction?.type === 'select' && pendingListAction.list) {
                  // Switch to the selected list
                  const list = pendingListAction.list;
                  
                  // Set filter text and current selections based on list filters
                  if (list.filters) {
                    setFilterText(list.filters.searchText || '');
                    setSelectedStatus(list.filters.status || '');
                    setSelectedIndustry(list.filters.industry || '');
                    setSelectedType(list.filters.type || '');
                  }
                  
                  // Set the active list and store its original filters
                  setActiveList(list);
                  setOriginalListFilters(list.filters ? { ...list.filters } : {});
                  
                  // Clear active view when switching lists
                  setActiveView(null);
                } else if (pendingListAction?.type === 'clear') {
                  // Clear the current list selection
                  setActiveList(null);
                  setOriginalListFilters(null);
                }
                
                // Close the dialog and clear pending action
                setShowUnsavedChangesModal(false);
                setPendingListAction(null);
                setHasUnsavedChanges(false);
              }}
            >
              Discard Changes
            </Button>
            <Button 
              onClick={() => {
                // Save list member changes 
                if (activeList && !activeList.isDefault) {
                  // Save the member changes
                  const updatedList = {
                    ...activeList,
                    members: editedListMembers
                  };
                  
                  // Update in saved lists
                  setSavedLists(savedLists.map(list => 
                    list.id === activeList.id ? updatedList : list
                  ));
                  
                  // Exit editing mode
                  setIsEditingList(false);
                  
                  // Then proceed with the pending action
                  if (pendingListAction?.type === 'select' && pendingListAction.list) {
                    // Switch to the selected list
                    const list = pendingListAction.list;
                    
                    // Set filter text and current selections based on list filters
                    if (list.filters) {
                      setFilterText(list.filters.searchText || '');
                      setSelectedStatus(list.filters.status || '');
                      setSelectedIndustry(list.filters.industry || '');
                      setSelectedType(list.filters.type || '');
                    }
                    
                    // Set the active list and store its original filters
                    setActiveList(list);
                    setOriginalListFilters(list.filters ? { ...list.filters } : {});
                    
                    // Clear active view when switching lists
                    setActiveView(null);
                  } else if (pendingListAction?.type === 'clear') {
                    // Clear the current list selection
                    setActiveList(null);
                    setOriginalListFilters(null);
                  }
                }
                
                // Show success notification
                toast({
                  title: "Changes Saved",
                  description: "Your changes have been saved successfully"
                });
                
                // Close the dialog and clear pending action
                setShowUnsavedChangesModal(false);
                setPendingListAction(null);
                setHasUnsavedChanges(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnersPage() {
  const [isEditingList, setIsEditingList] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form data for creating new partner with all available fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactEmail: '',
    primaryContact: '',
    partnerType: 'partner',
    region: '',
    status: 'active',
    industry: 'Insurance',
    size: 'medium'
  });

  const handleCreatePartner = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create partner');
      }

      const newPartner = await response.json();
      
      // Invalidate and refetch partners data
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      
      toast({
        title: "Partner Created",
        description: `"${formData.name}" has been created successfully.`
      });

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        location: '',
        contactEmail: '',
        primaryContact: '',
        partnerType: 'partner',
        region: '',
        status: 'active',
        industry: 'Insurance',
        size: 'medium'
      });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create partner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
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
            Create new partner
          </button>
        </div>
        <PartnersTable />

        {/* Create Partner Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Partner</DialogTitle>
              <DialogDescription>
                Add a new partner to your network. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter partner name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input
                    id="primaryContact"
                    value={formData.primaryContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the partner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerType">Partner Type</Label>
                  <Select value={formData.partnerType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnerType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Banking">Banking</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePartner} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Partner'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingContext.Provider>
  );
}