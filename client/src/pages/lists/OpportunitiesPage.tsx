import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/ShareModal";

import { SortableTableHead } from "@/components/ui/sortable-table-head";

// Fetch opportunities from database
const useOpportunitiesData = () => {
  return useQuery({
    queryKey: ['/api/opportunities'],
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'opportunities'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=opportunities'),
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('POST', '/api/saved-lists', newList);
    },
    onSuccess: () => {
      // Invalidate all saved lists queries to refresh the dropdown
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
      // Force refetch of saved lists data
      queryClient.refetchQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
    }
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'opportunities'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=opportunities'),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to fetch existing shared links for a list
const useExistingSharedLinks = (listId: number | null) => {
  return useQuery({
    queryKey: ['/api/shared-lists/by-list', listId],
    queryFn: () => apiRequest('GET', `/api/shared-lists/by-list/${listId}`),
    enabled: !!listId,
    staleTime: 1 * 60 * 1000,
  });
};

const useCreateSavedView = () => {
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

const useCreateSharedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shareData: any) => {
      return apiRequest('POST', '/api/shared-lists', shareData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-lists'] });
    }
  });
};

const useDeleteSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listId: number) => {
      return apiRequest('DELETE', `/api/saved-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
      queryClient.refetchQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
    }
  });
};

// Hook to fetch customers for opportunity creation
const useCustomers = () => {
  return useQuery({
    queryKey: ['/api/customers'],
    queryFn: () => apiRequest('GET', '/api/customers'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

// Hook to fetch products for opportunity creation
const useProducts = () => {
  return useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiRequest('GET', '/api/products'),
    staleTime: 5 * 60 * 1000,
  });
};

// Type definitions for opportunities
interface Opportunity {
  id: number;
  title: string;
  description?: string;
  status: string;
  stage: string;
  type?: string;
  estimatedValue?: number;
  value?: number;
  probability?: number;
  location?: string;
  partnerName?: string;
  customerName?: string;
  clientName?: string;
  lastActivityDate?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt?: string;
  expectedCloseDate?: string;
  deliveryDate?: string;
  customerId?: number;
  partnerId?: number;
  linkedProductIds?: number[];
  linkedContactIds?: number[];
  createdBy?: string;
}

// Calculate opportunity statistics
function calculateOpportunityStats(opportunities: any[]) {
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opportunity) => sum + (opportunity.estimatedValue || 0), 0);
  const weightedValue = opportunities.reduce((sum, opportunity) => sum + ((opportunity.estimatedValue || 0) * (opportunity.probability || 0) / 100), 0);
  const closedWon = opportunities.filter(o => o.status === 'Closed Won').length;
  
  return {
    totalOpportunities,
    totalValue: formatCurrency(totalValue),
    weightedValue: formatCurrency(weightedValue),
    closedWon
  };
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

// Template badges component for opportunities
function TemplateBadges({ opportunityId }: { opportunityId: number }) {
  // Fetch template assignments for this opportunity
  const { data: templateAssignments = [] } = useQuery({
    queryKey: [`/api/degoudse/template-assignments/opportunity/${opportunityId}`],
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
  });

  const assignments = Array.isArray(templateAssignments) ? templateAssignments : [];

  if (assignments.length === 0) {
    return (
      <div className="text-xs text-gray-400">
        No templates
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {assignments.slice(0, 2).map((assignment: any) => {
        // Get the first tag from the assignment to determine color
        const firstTag = assignment.tags && assignment.tags.length > 0 ? assignment.tags[0] : 'general';
        const tagColors: Record<string, { bg: string; text: string }> = {
          'acquisition': { bg: 'bg-pink-100', text: 'text-pink-800' },
          'solar': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
          'partnership': { bg: 'bg-blue-100', text: 'text-blue-800' },
          'claims': { bg: 'bg-orange-100', text: 'text-orange-800' },
          'products': { bg: 'bg-green-100', text: 'text-green-800' },
          'general': { bg: 'bg-gray-100', text: 'text-gray-800' }
        };
        const colors = tagColors[firstTag] || tagColors['general'];

        return (
          <div 
            key={assignment.id} 
            className={`${colors.bg} ${colors.text} px-2 py-1 rounded text-xs font-medium flex items-center justify-center min-w-[32px] h-[24px]`}
            title={assignment.template_name}
          >
            {assignment.template_name?.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2) || 'T'}
          </div>
        );
      })}
      {assignments.length > 2 && (
        <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
          +{assignments.length - 2}
        </div>
      )}
    </div>
  );
}

// Define interfaces for saved lists and views
interface SavedList {
  id: string;
  name: string;
  description?: string;
  type: 'filter' | 'selection';
  members?: number[]; // For selection-based lists
  filters: {
    searchText?: string;
    status?: string;
    type?: string;
    customerId?: string;
    partnerId?: string;
  };
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
}

interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    type?: string;
    customerId?: string;
    partnerId?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Opportunity Details Modal Component
function OpportunityDetailsModal({ opportunityId, onClose }: { opportunityId: number, onClose: () => void }) {
  const { environment } = useEnvironment();
  
  const { data: opportunity, isLoading } = useQuery<Opportunity>({
    queryKey: [`/api/${environment.id}/opportunities/${opportunityId}`],
    enabled: !!opportunityId
  });

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading opportunity details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!opportunity) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Opportunity not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{opportunity.title}</DialogTitle>
          <DialogDescription>
            Opportunity Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">{opportunity.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Stage</label>
              <p className="mt-1">{opportunity.stage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estimated Value</label>
              <p className="mt-1">{formatCurrency(opportunity.estimatedValue || 0)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Probability</label>
              <p className="mt-1">{opportunity.probability}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <p className="mt-1">{opportunity.clientName || opportunity.customerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Partner</label>
              <p className="mt-1">{opportunity.partnerName || 'Not assigned'}</p>
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-gray-600">{opportunity.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
            </div>
            {opportunity.expectedCloseDate && (
              <div>
                <label className="text-sm font-medium text-gray-700">Expected Close</label>
                <p className="mt-1">{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main opportunity list component
function OpportunitiesTable() {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const { data: opportunities = [], isLoading, error } = useOpportunitiesData() as { data: Opportunity[], isLoading: boolean, error: any };
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const createSavedListMutation = useCreateSavedList();
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedViews();
  const createSavedViewMutation = useCreateSavedView();
  const createSharedListMutation = useCreateSharedList();
  const deleteSavedListMutation = useDeleteSavedList();
  const queryClient = useQueryClient();
  
  // Fetch customers and products for opportunity creation
  const { data: customersResponse } = useCustomers();
  const { data: products = [] } = useProducts();
  
  // Extract customers array from paginated response
  const customers = customersResponse?.data || [];

  // Filter saved lists to only show opportunity-related lists (client-side filtering)
  const opportunitySavedListsData = savedListsData.filter((list: any) => 
    list.entity_type === 'opportunities'
  );

  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Initialize sorting state early to maintain hook order
  const [tableSortConfig, setTableSortConfig] = useState({ key: 'title', direction: 'asc' as 'asc' | 'desc' });
  
  // Database data is already fetched via the hook at the top of the component
  
  // Enhanced state management
  const [isCreatingNewList, setIsCreatingNewList] = useState(true);
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // Assign Template functionality
  const [showAssignTemplateModal, setShowAssignTemplateModal] = useState(false);
  const [selectedOKRTemplates, setSelectedOKRTemplates] = useState<number[]>([]);
  
  // Load template assignments for opportunities
  const { data: templateAssignments = [] } = useQuery({
    queryKey: ['/api/template-assignments/opportunity'],
    enabled: opportunities.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Load OKR templates from database API
  const { data: okrMetricsFromAPI = [] } = useQuery({
    queryKey: ['/api/okr-metrics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch OKR tags for dynamic color mapping
  const { data: okrTags = [] } = useQuery({
    queryKey: ['okr-tags-direct'],
    queryFn: async () => {
      const response = await fetch('/api/degoudse/okr-tags');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for assigning templates
  const assignTemplatesMutation = useMutation({
    mutationFn: async ({ templateIds, opportunityIds }: { templateIds: number[], opportunityIds: number[] }) => {
      const results = [];
      for (const opportunityId of opportunityIds) {
        const response = await fetch('/api/degoudse/template-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateIds,
            entityType: 'opportunity',
            entityId: opportunityId,
            assignedBy: 1, // Current user ID (hardcoded for now)
            notes: 'Assigned from Opportunities page'
          })
        });
        if (!response.ok) throw new Error('Failed to assign templates');
        const result = await response.json();
        results.push(...result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/template-assignments/opportunity'] });
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/opportunities'] });
      toast({
        title: "Templates assigned",
        description: `Successfully assigned ${selectedOKRTemplates.length} template(s) to ${selectedOpportunities.length} opportunity(ies)`,
      });
      setShowAssignTemplateModal(false);
      setSelectedOKRTemplates([]);
      setSelectedOpportunities([]);
    },
    onError: (error) => {
      toast({
        title: "Error assigning templates",
        description: `Failed to assign templates: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Views state - using database data
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  
  // State for saved lists - using database data
  const [activeList, setActiveList] = useState<any>(null);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [shareListData, setShareListData] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  const [newListName, setNewListName] = useState('');
  

  const [pendingListAction, setPendingListAction] = useState<any>(null);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [currentSharedLink, setCurrentSharedLink] = useState<string>('');
  const [existingSharedLinks, setExistingSharedLinks] = useState<any[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  
  // Create opportunity state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerId: '',
    productId: '',
    value: '',
    probability: 50,
    status: 'Qualifying',
    type: 'New Business',
    closeDate: ''
  });
  
  // Fetch existing shared links when activeList changes
  const { data: sharedLinksData } = useExistingSharedLinks(activeList?.id || null);
  
  const handleCreateOpportunity = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.customerId || !formData.productId) {
      toast({
        title: "Validation Error",
        description: "Customer and product selection are required.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const newOpportunity = await apiRequest('POST', '/api/opportunities', {
        title: formData.title,
        description: formData.description,
        clientId: parseInt(formData.customerId),
        productId: parseInt(formData.productId),
        value: formData.value ? parseFloat(formData.value) : 0,
        probability: formData.probability,
        status: formData.status,
        type: formData.type,
        closeDate: formData.closeDate || null
      });
      
      console.log('Create opportunity response:', newOpportunity);
      
      // Invalidate and refetch opportunities data
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      
      toast({
        title: "Opportunity Created",
        description: `"${formData.title}" has been created successfully.`
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        customerId: '',
        productId: '',
        value: '',
        probability: 50,
        status: 'Qualifying',
        type: 'New Business',
        closeDate: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create opportunity error:', error);
      toast({
        title: "Error",
        description: `Failed to create opportunity: ${error?.message || 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Update existing shared links when data changes
  useEffect(() => {
    if (sharedLinksData) {
      setExistingSharedLinks(sharedLinksData);
      // If there are existing links, show the most recent one
      if (sharedLinksData.length > 0) {
        const baseUrl = window.location.origin;
        const mostRecentLink = `${baseUrl}/share/list/${sharedLinksData[0].share_token}`;
        setCurrentSharedLink(mostRecentLink);
      }
    } else {
      setExistingSharedLinks([]);
      setCurrentSharedLink('');
    }
  }, [sharedLinksData]);
  
  // Reset sharing state when share modal opens
  useEffect(() => {
    if (showShareListModal && activeList?.id) {
      // The existing links will be automatically loaded by the query
    } else if (showShareListModal && selectedOpportunities.length > 0) {
      // For bulk sharing, reset the link as it's a new share
      setCurrentSharedLink('');
    }
  }, [showShareListModal, activeList?.id, selectedOpportunities.length]);
  
  // Handle list deletion
  const handleDeleteList = async (listId: number) => {
    try {
      await deleteSavedListMutation.mutateAsync(listId);
      
      // If this was the active list, clear it
      if (activeList && activeList.id === listId) {
        setActiveList(null);
        setFilterText('');
        setSelectedStatus('');
        setSelectedType('');
      }
      
      toast({
        title: "List deleted",
        description: "The list has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the list. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load opportunities</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Enhanced filtering logic for both filter and selection-based lists
  const filteredOpportunities = (() => {
    let opportunitiesData = opportunities;
    
    // If we have an active list that's selection-based, use its members
    if (activeList && activeList.type === 'selection' && activeList.members) {
      opportunitiesData = opportunities.filter((opp: any) => activeList.members!.includes(opp.id));
    }
    
    // Apply current filters (from UI or active list/view)
    return opportunitiesData.filter((opportunity: any) => {
      // Text search - using actual API response fields
      const title = opportunity.title || '';
      const customerName = opportunity.clientName || opportunity.customerName || '';
      const partnerName = opportunity.partnerName || '';
      
      const matchesText = !filterText || 
        title.toLowerCase().includes(filterText.toLowerCase()) ||
        customerName.toLowerCase().includes(filterText.toLowerCase()) ||
        partnerName.toLowerCase().includes(filterText.toLowerCase());
        
      // Status filter (from UI or active list/view)
      const activeStatus = selectedStatus || activeList?.filters.status || activeView?.filters.status;
      const matchesStatus = !activeStatus || opportunity.status === activeStatus;
      
      // Type filter (from UI or active list/view)
      const activeType = selectedType || activeList?.filters.type || activeView?.filters.type;
      const matchesType = !activeType || opportunity.type === activeType;
      
      // Customer/Partner filters from active list
      const customerId = opportunity.customerId || opportunity.clientId;
      const partnerId = opportunity.partnerId || opportunity.partner?.id;
      
      const matchesCustomerId = !activeList?.filters.customerId || 
        String(customerId) === activeList.filters.customerId;
      const matchesPartnerId = !activeList?.filters.partnerId || 
        String(partnerId) === activeList.filters.partnerId;
      
      return matchesText && matchesStatus && matchesType && matchesCustomerId && matchesPartnerId;
    });
  })();

  // Apply sorting manually using the state
  const handleSort = (key: string) => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort the filtered opportunities
  const displayedOpportunities = [...filteredOpportunities].sort((a: any, b: any) => {
    const aValue = a[tableSortConfig.key] || '';
    const bValue = b[tableSortConfig.key] || '';
    
    if (tableSortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Calculate stats based on filtered opportunities
  const stats = calculateOpportunityStats(displayedOpportunities);
  
  // Function to toggle opportunity selection
  const toggleSelectOpportunity = (id: number) => {
    if (selectedOpportunities.includes(id)) {
      setSelectedOpportunities(selectedOpportunities.filter(oppId => oppId !== id));
    } else {
      setSelectedOpportunities([...selectedOpportunities, id]);
    }
  };
  
  // Function to toggle select/deselect all opportunities
  const toggleSelectAll = () => {
    if (selectedOpportunities.length === displayedOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(displayedOpportunities.map((opp: any) => opp.id));
    }
  };
  
  // Status badge color mapping
  // Function to handle bulk status change
  const handleBulkStatusChange = (newStatus: string) => {
    if (!newStatus) return;
    
    // In a real application, this would make an API call to update the opportunities
    // For now, we'll update our mock data
    opportunities.forEach((opportunity, index) => {
      if (selectedOpportunities.includes(opportunity.id)) {
        opportunities[index].status = newStatus;
      }
    });
    
    // Force a re-render by setting state
    setFilterText(filterText + " ");
    setTimeout(() => setFilterText(filterText.trim()), 10);
    
    // Reset the bulk status value
    setBulkStatusValue('');
    
    // Show toast notification with Qollabi styling
    toast({
      title: "Status updated",
      description: `${selectedOpportunities.length} ${selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} updated to "${newStatus}"`,
      className: "bg-indigo-50 border-indigo-200 text-indigo-800",
    });
  };

  // Available opportunity statuses
  const opportunityStatuses = [
    'Discovery',
    'Qualification',
    'Proposal',
    'Negotiation',
    'In Progress',
    'Closed Won',
    'Closed Lost'
  ];
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Closed Won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Qualification':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Proposal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Negotiation':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Discovery':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Enhanced unified toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top row with saved lists and views */}
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
                    {activeList ? activeList.name : "All Opportunities"}
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
                      {/* Default "All Opportunities" option */}
                      <div className="relative">
                        <div
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${!activeList ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
                          onClick={() => {
                            setActiveList(null);
                            setShowListsDropdown(false);
                          }}
                        >
                          <span>All Opportunities</span>
                          <span className="text-gray-500">({opportunities.length})</span>
                        </div>
                      </div>
                      
                      {/* Database saved lists (filtered for opportunities only) */}
                      {opportunitySavedListsData.map((list: any) => (
                        <div 
                          key={list.id}
                          className="relative"
                        >
                          <div className="group relative flex items-center">
                            <div
                              className={`flex flex-1 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
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
                                    type: list.isDefault && list.name === "All Opportunities" ? 'clear' : 'select',
                                    list: list.isDefault && list.name === "All Opportunities" ? undefined : list
                                  });
                                  setShowUnsavedChangesModal(true);
                                  setShowListsDropdown(false);
                                  return;
                                }
                                
                                // Special handling for "All Opportunities" default list
                                if (list.isDefault && list.name === "All Opportunities") {
                                  // Clear filters and active list (same behavior as "Return to all opportunities" button)
                                  setActiveList(null);
                                  setOriginalListFilters(null);
                                  setFilterText('');
                                  setSelectedStatus('');
                                  setSelectedType('');
                                  setHasUnsavedChanges(false);
                                } else {
                                  // Normal behavior for other lists
                                  console.log('Setting activeList to:', list);
                                  setActiveList(list);
                                  // Store the original filters to enable reverting changes
                                  setOriginalListFilters(list.filters);
                                  // Apply filter settings
                                  setFilterText(list.filters.searchText || '');
                                  setSelectedStatus(list.filters.status || '');
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
                                {/* Show share icon if list is shared */}
                                {list.is_shared && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-green-500">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                  </svg>
                                )}
                              </div>
                              
                              {/* Visual indicator for default list */}
                              {list.isDefault && (
                                <div className="ml-auto">
                                  <span className="text-xs text-[#282A3F] italic" style={{ fontFamily: 'Poppins, sans-serif' }}>Default</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Three dots menu for non-default lists */}
                            {!list.isDefault && (
                              <div className="relative ml-1">
                                <button
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(activeDropdownId === list.id ? null : list.id);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                  </svg>
                                </button>
                                
                                {/* Dropdown menu */}
                                {activeDropdownId === list.id && (
                                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-md z-50">
                                    <div className="p-1">
                                      <button
                                        className="flex w-full items-center px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 text-left"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Navigate to broker view
                                          window.open(`/broker-view/list/${list.id}`, '_blank');
                                          setActiveDropdownId(null);
                                          setShowListsDropdown(false);
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                          <polyline points="10 17 15 12 10 7"></polyline>
                                          <line x1="15" y1="12" x2="3" y2="12"></line>
                                        </svg>
                                        Open list as partner
                                      </button>
                                      <button
                                        className="flex w-full items-center px-2 py-1.5 text-sm rounded-sm hover:bg-red-50 text-red-600 text-left"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Show confirmation dialog
                                          if (confirm(`Are you sure you want to delete the list "${list.name}"? This action cannot be undone.`)) {
                                            handleDeleteList(list.id);
                                          }
                                          setActiveDropdownId(null);
                                          setShowListsDropdown(false);
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          <line x1="10" y1="11" x2="10" y2="17"></line>
                                          <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        Delete list
                                      </button>
                                    </div>
                                  </div>
                                )}
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
              
              {/* List actions - Share/Add to Campaign when a non-default list is active */}
              {activeList && !activeList.isDefault && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-600"
                    onClick={() => {
                      console.log('Share button clicked, activeList:', activeList);
                      setShowShareListModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-indigo-600"
                    onClick={() => {
                      // Show campaign options modal
                      // This would be implemented with a proper modal in the final version
                      alert('This list can be added to a campaign in the Campaigns section');
                    }}
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
            <div className="flex items-center gap-2">
              {/* Show Share button only for active lists */}
              {activeList && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-600"
                  onClick={() => setShowShareListModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </Button>
              )}
              
              {/* Save button - only shown when filters are applied */}
              {(filterText || selectedStatus || selectedType) && (
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
                  {activeList ? 'Update' : 'Save'}
                </Button>
              )}
              
              <Button variant="outline" size="sm" className="hidden md:flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </Button>
              
              <Button 
                size="sm" 
                className="flex items-center bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowCreateModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New
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
                  placeholder="Search opportunities..."
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
              
              {/* Views dropdown - next to search field */}
              <div className="relative">
                <button 
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium ${activeView ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                  onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeView ? 'text-indigo-600' : 'text-gray-500'}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span className="max-w-[120px] truncate">{activeView ? activeView.name : 'Views'}</span>
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
                  <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                    <div className="p-2 border-b">
                      <div className="text-xs font-medium mb-2 text-gray-500">SAVED VIEWS</div>
                      {savedViewsData.map((view: any) => (
                        <div 
                          key={view.id}
                          className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                          onClick={() => {
                            setActiveView(view);
                            const filters = typeof view.filters === 'string' ? JSON.parse(view.filters) : view.filters;
                            setFilterText(filters.searchText || '');
                            setSelectedStatus(filters.status || '');
                            setSelectedType(filters.type || '');
                            setShowViewsDropdown(false);
                          }}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-500">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
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
                            setActiveView(null);
                            setFilterText('');
                            setSelectedStatus('');
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
                  <span>{selectedStatus ? `Status: ${selectedStatus}` : 'Status'}</span>
                  {selectedStatus && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedType ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedType(selectedType ? '' : 'Renewal')}
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
            </div>
            
            {/* Save View and Clear filters buttons - only shown when filters are applied */}
            {(filterText || selectedStatus || selectedType) && (
              <div className="flex items-center gap-2">
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
                <button 
                  onClick={() => {
                    setFilterText('');
                    setSelectedStatus('');
                    setSelectedType('');
                    if (activeList) setActiveList(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bulk actions bar - always visible */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
        {selectedOpportunities.length > 0 ? (
          <>
            <div className="flex items-center">
              <span className="text-indigo-700 font-medium mr-2">{selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600"
                onClick={() => setSelectedOpportunities([])}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                Clear selection
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* New Bulk Status Change dropdown */}
              <div className="flex items-center gap-1">
                <Select
                  value={bulkStatusValue}
                  onValueChange={(value) => {
                    setBulkStatusValue(value);
                    handleBulkStatusChange(value);
                  }}
                >
                  <SelectTrigger className="h-9 border-indigo-200 bg-white text-sm w-[180px]">
                    <SelectValue placeholder="Change Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeVariant(status)}`}></span>
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
                Create List
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => {
                  // TODO: Implement campaign creation
                  alert('Selected opportunities can be added to a campaign. This will be available in the Campaigns section');
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
                className="text-indigo-600"
                onClick={() => {
                  // Load OKR templates when opening the modal
                  try {
                    console.log('Available OKR templates:', okrMetricsFromAPI);
                    if (okrMetricsFromAPI.length === 0) {
                      toast({
                        title: "No templates available",
                        description: "Please create OKR templates first in the Templates section",
                        variant: "destructive"
                      });
                      return;
                    }
                  } catch (error) {
                    console.error('Error loading templates:', error);
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
          </>
        ) : (
          /* Empty state when no opportunities are selected */
          <div className="flex items-center justify-center w-full min-h-[32px]">
            <div className="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M9 12l2 2 4-4"></path>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              <span className="text-sm">Select at least one opportunity from the list to perform bulk actions</span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{stats.closedWon}</div>
          <div className="text-sm text-gray-500">Closed Won</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{stats.totalValue}</div>
          <div className="text-sm text-gray-500">Total Value Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{stats.weightedValue}</div>
          <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
        </div>
      </div>
      
      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeList ? 'Update Saved List' : 'Save Current List'}</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a list that you can easily access later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="listName">List Name</Label>
              <Input 
                id="listName" 
                placeholder="Enter a name for this list"
                defaultValue={activeList?.name || ''}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="listDescription">Description (Optional)</Label>
              <Textarea 
                id="listDescription" 
                placeholder="Add a short description to help others understand this list"
                rows={3}
                defaultValue={activeList?.description || ''}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="shareList" defaultChecked={activeList?.isShared || false} />
              <Label htmlFor="shareList" className="text-sm font-normal">
                Share this list with collaborators
              </Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-xs text-gray-500">
              {activeList ? 'Last updated on ' + new Date(activeList.createdAt).toLocaleDateString() : 'Applied filters will be saved with this list'}
            </div>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  // Handle save/update list
                  if (!activeList) {
                    // Create new list
                    const listName = (document.getElementById('listName') as HTMLInputElement).value;
                    const listDescription = (document.getElementById('listDescription') as HTMLTextAreaElement).value;
                    const isShared = (document.getElementById('shareList') as HTMLInputElement).checked;
                    
                    const newList: SavedList = {
                      id: String(Date.now()),
                      name: listName,
                      description: listDescription || undefined,
                      type: selectedOpportunities.length > 0 ? 'selection' : 'filter',
                      members: selectedOpportunities.length > 0 ? selectedOpportunities : undefined,
                      filters: {
                        searchText: filterText || undefined,
                        status: selectedStatus || undefined,
                        type: selectedType || undefined
                      },
                      isShared,
                      createdBy: 'John Smith',
                      createdAt: new Date()
                    };
                    
                    // Create list using database mutation
                    createSavedListMutation.mutate({
                      name: listName,
                      description: listDescription || null,
                      type: 'manual',
                      entity_type: 'opportunities',
                      members: selectedOpportunities,
                      filters: {
                        searchText: filterText,
                        status: selectedStatus,
                        type: selectedType
                      },
                      is_shared: isShared
                    });
                    setActiveList(newList);
                  } else {
                    // Update existing list - for now just close modal
                    // Database update functionality would go here
                  }
                  
                  setShowSaveListModal(false);
                }}
              >
                {activeList ? 'Update List' : 'Save List'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Google-Style Share Modal */}
      <ShareModal
        isOpen={showShareListModal}
        onClose={() => {
          setShowShareListModal(false);
          setShareListData(null);
        }}
        itemName={shareListData?.name || activeList?.name || 'Selected Items'}
        listId={shareListData?.id || activeList?.id || 0}
        envId={environment.id}
        currentSharedLink={currentSharedLink}
        existingSharedLinks={existingSharedLinks}
        onCopyLink={() => {
          if (currentSharedLink) {
            navigator.clipboard.writeText(currentSharedLink);
            toast({
              title: "Link copied",
              description: "The shareable link has been copied to your clipboard.",
            });
          }
        }}
        onCreateShare={async () => {
          try {
            // If there's already a shared link for this list, just show it
            if (existingSharedLinks.length > 0 && activeList?.id) {
              const baseUrl = window.location.origin;
              const existingUrl = `${baseUrl}/share/list/${existingSharedLinks[0].share_token}`;
              setCurrentSharedLink(existingUrl);
              
              toast({
                title: "Shareable link ready",
                description: "This list is already shared. Anyone with the link can view it.",
              });
              return;
            }

            // Determine what's being shared
            const isListShare = selectedOpportunities.length === 0;
            const isBulkOpportunityShare = selectedOpportunities.length > 0;

            let shareData;
            
            if (isListShare && activeList) {
              // Sharing the entire saved list
              shareData = {
                list_name: activeList.name,
                list_description: activeList.description || null,
                entity_type: 'opportunities',
                data: opportunities,
                message: '',
                list_id: activeList.id
              };
            } else if (isBulkOpportunityShare) {
              // Sharing selected opportunities
              const selectedOpportunitiesData = selectedOpportunities
                .map(id => opportunities.find(o => o.id === id))
                .filter(Boolean);
              
              shareData = {
                list_name: `${selectedOpportunities.length} Selected Opportunities`,
                list_description: `Shared opportunities: ${selectedOpportunitiesData.filter(o => o).map(o => o.title).slice(0, 3).join(', ')}${selectedOpportunities.length > 3 ? '...' : ''}`,
                entity_type: 'opportunities',
                data: selectedOpportunitiesData,
                message: ''
              };
            } else {
              toast({
                title: "Nothing to share",
                description: "Please select opportunities or save a list first.",
                variant: "destructive"
              });
              return;
            }

            // Create the shared list
            const result = await createSharedListMutation.mutateAsync(shareData);
            
            // Generate the shareable URL
            const baseUrl = window.location.origin;
            const shareableUrl = `${baseUrl}/share/list/${result.share_token}`;
            
            setCurrentSharedLink(shareableUrl);

            toast({
              title: "Shareable link created",
              description: "Your list has been made public. Anyone with the link can view it.",
            });

            // Clear selection after sharing
            if (isBulkOpportunityShare) {
              setSelectedOpportunities([]);
            }

            // Invalidate the shared links cache to refresh the list
            if (activeList?.id) {
              queryClient.invalidateQueries({
                queryKey: ['/api/shared-lists/by-list', activeList.id]
              });
            }
          } catch (error) {
            toast({
              title: "Error creating shared link",
              description: "Please try again.",
              variant: "destructive"
            });
          }
        }}
        isCreating={createSharedListMutation.isPending}
        onRefreshList={() => {
          // Refresh the saved lists to update is_shared flags
          queryClient.invalidateQueries({
            queryKey: [`/api/${environment.id}/saved-lists`]
          });
        }}
      />
      
      {/* Table section without a border */}
      <div className="bg-white overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10 bg-white group">
                <input
                  type="checkbox"
                  className={`absolute h-4 w-4 rounded border-gray-300 ${
                    selectedOpportunities.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                  }`}
                  checked={selectedOpportunities.length === displayedOpportunities.length && displayedOpportunities.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <SortableTableHead 
                sortKey="title" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[250px]"
              >
                Title
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
                sortKey="type" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Type
              </SortableTableHead>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[120px] bg-white">
                <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                  Template
                </div>
              </th>
              <SortableTableHead 
                sortKey="clientName" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[140px]"
              >
                Customer
              </SortableTableHead>
              <SortableTableHead 
                sortKey="partnerName" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[140px]"
              >
                Partner
              </SortableTableHead>
              <SortableTableHead 
                sortKey="estimatedValue" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Value
              </SortableTableHead>
              <SortableTableHead 
                sortKey="probability" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[100px]"
              >
                Probability
              </SortableTableHead>
              <SortableTableHead 
                sortKey="expectedCloseDate" 
                currentSortKey={tableSortConfig.key} 
                currentDirection={tableSortConfig.direction} 
                onSort={handleSort} 
                className="w-[120px]"
              >
                Close Date
              </SortableTableHead>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedOpportunities.map((opportunity: any) => (
              <tr 
                key={opportunity.id}
                className={`hover:bg-gray-50 cursor-pointer group ${
                  selectedOpportunities.includes(opportunity.id) ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => {
                  // Don't trigger when clicking on checkbox
                  if (!(e.target as any).type || (e.target as any).type !== 'checkbox') {
                    window.location.href = `/opportunities/${opportunity.id}`;
                  }
                }}
              >
                <td className="relative px-3 py-4 w-10">
                  <input
                    type="checkbox"
                    className={`absolute h-4 w-4 rounded border-gray-300 ${
                      selectedOpportunities.includes(opportunity.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
                    checked={selectedOpportunities.includes(opportunity.id)}
                    onChange={() => toggleSelectOpportunity(opportunity.id)}
                  />
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[250px]">
                  <div className="max-w-[230px]">
                    <div className="font-medium text-gray-900 truncate">
                      {opportunity.title}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {opportunity.description}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm w-[120px]">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  {opportunity.type || 'General'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  <TemplateBadges opportunityId={opportunity.id} />
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[140px] truncate">
                  {opportunity.clientName || opportunity.customerName}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[140px] truncate">
                  {opportunity.partnerName}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  {formatCurrency(opportunity.estimatedValue || 0)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  {opportunity.probability}%
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  {opportunity.closeDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayedOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No opportunities found matching your criteria.
            </div>
            <button 
              onClick={() => {
                setFilterText('');
                setSelectedStatus('');
                setSelectedType('');
              }}
              className="text-indigo-600 hover:text-indigo-500 mt-2 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Create Opportunity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Add a new opportunity to your pipeline. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter opportunity title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the opportunity"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Product *</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Qualifying">Qualifying</SelectItem>
                    <SelectItem value="Needs Analysis">Needs Analysis</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                    <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Business">New Business</SelectItem>
                    <SelectItem value="Renewal">Renewal</SelectItem>
                    <SelectItem value="Upsell">Upsell</SelectItem>
                    <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeDate">Expected Close Date</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, closeDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOpportunity} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Opportunity'}
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
              Select OKR templates to assign to {selectedOpportunities.length} selected opportunity{selectedOpportunities.length !== 1 ? 'ies' : 'y'}. 
              Templates will be converted to active OKRs with tracking capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selected Opportunities Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span className="font-medium text-blue-900">
                  {selectedOpportunities.length} Opportunity{selectedOpportunities.length !== 1 ? 'ies' : 'y'} Selected
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {selectedOpportunities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedOpportunities.slice(0, 3).map((oppId) => {
                      const opp = opportunities.find((o: any) => o.id === oppId);
                      return opp ? (
                        <span key={oppId} className="bg-blue-200 px-2 py-1 rounded text-xs">
                          {opp.title}
                        </span>
                      ) : null;
                    })}
                    {selectedOpportunities.length > 3 && (
                      <span className="text-blue-600 text-xs">
                        +{selectedOpportunities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Available Templates with Tag Grouping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Available OKR Templates</h3>
                <span className="text-sm text-gray-500">
                  {selectedOKRTemplates.length} of {Array.isArray(okrMetricsFromAPI) ? okrMetricsFromAPI.length : 0} selected
                </span>
              </div>
              
              {!Array.isArray(okrMetricsFromAPI) || okrMetricsFromAPI.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-400">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="7" />
                  </svg>
                  <p>No OKR templates available</p>
                  <p className="text-sm">Create templates in the Templates section first</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Select All Templates */}
                  <div 
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const allTemplateIds = okrMetricsFromAPI.map((t: any) => t.id);
                      if (selectedOKRTemplates.length === allTemplateIds.length) {
                        setSelectedOKRTemplates([]);
                      } else {
                        setSelectedOKRTemplates(allTemplateIds);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOKRTemplates.length === okrMetricsFromAPI.length}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3"
                    />
                    <span className="font-medium text-gray-900">Select All Templates</span>
                  </div>

                  {/* Group templates by tags */}
                  {(() => {
                    const templatesByTag = okrMetricsFromAPI.reduce((acc: any, template: any) => {
                      const firstTag = template.tags && template.tags.length > 0 ? template.tags[0] : 'general';
                      if (!acc[firstTag]) {
                        acc[firstTag] = [];
                      }
                      acc[firstTag].push(template);
                      return acc;
                    }, {});

                    return Object.entries(templatesByTag).map(([tag, templates]: [string, any]) => {
                      const tagColors: Record<string, { bg: string; text: string }> = {
                        'acquisition': { bg: 'bg-pink-100', text: 'text-pink-800' },
                        'claims': { bg: 'bg-orange-100', text: 'text-orange-800' },
                        'solar': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        'partnership': { bg: 'bg-blue-100', text: 'text-blue-800' },
                        'products': { bg: 'bg-green-100', text: 'text-green-800' },
                        'general': { bg: 'bg-gray-100', text: 'text-gray-800' }
                      };
                      const colors = tagColors[tag] || tagColors['general'];

                      return (
                        <div key={tag} className="space-y-2">
                          {/* Tag header */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                            {tag} ({templates.length})
                          </div>
                          
                          {/* Templates in this tag */}
                          <div className="space-y-2 ml-4">
                            {templates.map((template: any) => {
                              const isSelected = selectedOKRTemplates.includes(template.id);
                              
                              return (
                                <div
                                  key={template.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedOKRTemplates(prev => prev.filter(id => id !== template.id));
                                    } else {
                                      setSelectedOKRTemplates(prev => [...prev, template.id]);
                                    }
                                  }}
                                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3 mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded">{template.hierarchy || 'operational'}</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                          <circle cx="12" cy="12" r="3"></circle>
                                          <path d="M12 1v6m0 6v6"></path>
                                        </svg>
                                        {template.target_value}
                                        {template.measure_unit && `# ${template.frequency || 'monthly'}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
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
                      Send notifications to assigned users
                    </label>
                  </div>
                </div>
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
                if (selectedOKRTemplates.length > 0 && selectedOpportunities.length > 0) {
                  assignTemplatesMutation.mutate({
                    templateIds: selectedOKRTemplates,
                    opportunityIds: selectedOpportunities
                  });
                } else {
                  toast({
                    title: "Selection required",
                    description: "Please select at least one template and one opportunity",
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

    </div>
  );
}

export default OpportunitiesTable;
