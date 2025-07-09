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
    queryKey: ['/api/degoudse/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/opportunities'),
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
    staleTime: 0,
    gcTime: 0,
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('POST', '/api/saved-lists', newList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
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
  const totalValue = opportunities.reduce((sum, opportunity) => sum + (opportunity.estimated_value || 0), 0);
  const weightedValue = opportunities.reduce((sum, opportunity) => {
    const value = opportunity.estimated_value || 0;
    const probability = opportunity.stage === 'Closed (Won)' ? 1.0 : 
                      opportunity.stage === 'Proposal Sent to Client' ? 0.6 :
                      opportunity.stage === 'Validated' ? 0.3 :
                      opportunity.stage === 'Lost' ? 0 :
                      opportunity.stage === 'Rejected' ? 0 :
                      !opportunity.stage || opportunity.stage === '' ? 0 : 0;
    return sum + (value * probability);
  }, 0);
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
  return new Intl.NumberFormat('nl-NL', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

// Template badges component for opportunities
function TemplateBadges({ opportunityId }: { opportunityId: number }) {
  // Temporarily disabled to prevent fetch errors
  const templateAssignments: any[] = [];
  const error = null;
  
  /* DISABLED - causing fetch errors
  const { data: templateAssignments = [], error } = useQuery({
    queryKey: [`/api/degoudse/template-assignments/opportunity/${opportunityId}`],
    queryFn: () => apiRequest('GET', `/api/degoudse/template-assignments/opportunity/${opportunityId}`),
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  */

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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedProbability, setSelectedProbability] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Dropdown state variables for new filter behavior
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showProbabilityDropdown, setShowProbabilityDropdown] = useState(false);
  
  // Database-driven filter options extracted from opportunities data
  const statusOptions = Array.from(new Set(opportunities.map((opp: any) => opp.status).filter(Boolean))).sort();
  const typeOptions = Array.from(new Set(opportunities.map((opp: any) => opp.type).filter(Boolean))).sort();
  const customerOptions = Array.from(new Set(opportunities.map((opp: any) => opp.clientName || opp.customerName).filter(Boolean))).sort();
  const partnerOptions = Array.from(new Set(opportunities.map((opp: any) => opp.partnerName).filter(Boolean))).sort();
  const stageOptions = Array.from(new Set(opportunities.map((opp: any) => opp.stage).filter(Boolean))).sort();
  const probabilityOptions = Array.from(new Set(opportunities.map((opp: any) => opp.probability).filter(val => val !== null && val !== undefined))).sort((a, b) => a - b);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowStatusDropdown(false);
        setShowTypeDropdown(false);
        setShowCustomerDropdown(false);
        setShowPartnerDropdown(false);
        setShowStageDropdown(false);
        setShowProbabilityDropdown(false);
        setShowViewsDropdown(false);
        setShowListsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    queryKey: ['/api/degoudse/template-assignments/opportunity'],
    queryFn: () => apiRequest('GET', '/api/degoudse/template-assignments/opportunity'),
    enabled: false, // Temporarily disabled to prevent runtime error overlay
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Disable retry to prevent error propagation
  });

  // Load OKR templates from database API
  const { data: okrMetricsFromAPI = [] } = useQuery({
    queryKey: ['/api/degoudse/okr-metrics'],
    queryFn: () => apiRequest('GET', '/api/degoudse/okr-metrics'),
    enabled: false, // Temporarily disabled to prevent runtime error overlay
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Disable retry to prevent error propagation
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // State for saved lists - using database data
  const [activeList, setActiveList] = useState<any>(null);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showAccountMappingModal, setShowAccountMappingModal] = useState(false);
  const [selectedMappingFields, setSelectedMappingFields] = useState<string[]>([]);
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
      const searchCustomerName = opportunity.clientName || opportunity.customerName || '';
      const searchPartnerName = opportunity.partnerName || '';
      
      const matchesText = !filterText || 
        title.toLowerCase().includes(filterText.toLowerCase()) ||
        searchCustomerName.toLowerCase().includes(filterText.toLowerCase()) ||
        searchPartnerName.toLowerCase().includes(filterText.toLowerCase());
        
      // Status filter (from UI or active list/view)
      const activeStatus = selectedStatus || activeList?.filters.status || activeView?.filters.status;
      const matchesStatus = !activeStatus || opportunity.status === activeStatus;
      
      // Type filter (from UI or active list/view)
      const activeType = selectedType || activeList?.filters.type || activeView?.filters.type;
      const matchesType = !activeType || opportunity.type === activeType;
      
      // Customer filter
      const filterCustomerName = opportunity.clientName || opportunity.customerName || '';
      const matchesCustomer = !selectedCustomer || filterCustomerName === selectedCustomer;
      
      // Partner filter
      const filterPartnerName = opportunity.partnerName || '';
      const matchesPartner = !selectedPartner || filterPartnerName === selectedPartner;
      
      // Stage filter
      const stage = opportunity.stage || '';
      const matchesStage = !selectedStage || stage === selectedStage;
      
      // Probability filter
      const probability = opportunity.probability;
      const matchesProbability = !selectedProbability || String(probability) === selectedProbability;
      
      // Customer/Partner filters from active list
      const customerId = opportunity.customerId || opportunity.clientId;
      const partnerId = opportunity.partnerId || opportunity.partner?.id;
      
      const matchesCustomerId = !activeList?.filters.customerId || 
        String(customerId) === activeList.filters.customerId;
      const matchesPartnerId = !activeList?.filters.partnerId || 
        String(partnerId) === activeList.filters.partnerId;
      
      return matchesText && matchesStatus && matchesType && matchesCustomer && matchesPartner && matchesStage && matchesProbability && matchesCustomerId && matchesPartnerId;
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
    <>
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
              <div className="relative filter-dropdown">
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
                  <div className="absolute z-50 mt-1.5 w-80 rounded-md border border-[#E6E7F1] bg-white text-slate-950 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
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
                                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-[#E6E7F1] bg-white shadow-md z-50">
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
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-indigo-600"
                    onClick={() => {
                      setShowAccountMappingModal(true);
                      // Initialize with all fields selected by default
                      setSelectedMappingFields(['title', 'status', 'type', 'customerName', 'partnerName', 'estimatedValue', 'probability', 'closeDate']);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Account Mapping
                  </Button>
                </div>
              )}
            </div>
            
            {/* Right-side action buttons */}
            <div className="flex items-center gap-2">
              
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
              
              {/* Segment Views dropdown - next to search field */}
              <div className="relative filter-dropdown">
                <button 
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium ${activeView ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                  onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeView ? 'text-indigo-600' : 'text-gray-500'}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span className="max-w-[120px] truncate">{activeView ? activeView.name : 'Segment Views'}</span>
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
                
                {/* Saved Segment Views dropdown menu */}
                {showViewsDropdown && (
                  <div className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                    <div className="p-2 border-b">
                      <div className="text-xs font-medium mb-2 text-gray-500">SAVED SEGMENT VIEWS</div>
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
                          Clear segment view
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Simplified Filter Component */}
              <div className="flex items-center gap-2 ml-3 relative">
                <button 
                  className="flex items-center px-3 h-8 border border-[#E6E7F1] rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowFilterModal(!showFilterModal)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span className="font-medium">Filter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {/* Simplified Filter Modal */}
                {showFilterModal && (
                  <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-[#E6E7F1] rounded-lg shadow-lg z-50 p-4">
                    <div className="text-center py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-400">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">Use Segment Views for filtering</p>
                      <p className="text-xs text-gray-500">Create and manage your filter combinations through the Segment View dropdown above.</p>
                    </div>
                  </div>
                )}
              </div>
              </div>
              
              {/* Save views section */}
              <div className="flex items-center gap-2 ml-3">
                {/* Save view button - only shown when filters are applied */}
                {(filterText || selectedStatus || selectedType) && (
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowSaveViewModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save segment view
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default OpportunitiesPageClean;
