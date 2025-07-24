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
import { FieldsSelector } from "@/components/shared/FieldsSelector";
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
  Columns3
} from 'lucide-react';

import { SortableTableHead } from "@/components/ui/sortable-table-head";

// Type definitions (matching PartnersPage pattern)
interface SavedList {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  members?: any[];
}

interface SavedView {
  id: number;
  name: string;
  entity_type: string;
  filters?: any;
  fields?: any;
}

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

const useSavedSegmentViews = () => {
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

const useCreateSavedSegmentView = () => {
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

// Remove duplicate interfaces - using the ones declared above

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
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedSegmentViews();
  const createSavedViewMutation = useCreateSavedSegmentView();
  const createSharedListMutation = useCreateSharedList();
  const deleteSavedListMutation = useDeleteSavedList();
  const queryClient = useQueryClient();
  
  // Fetch customers and products for opportunity creation
  const { data: customersResponse } = useCustomers();
  const { data: products = [] } = useProducts();
  
  // Extract customers array from paginated response
  const customers = customersResponse?.data || [];

  // Saved lists data is now properly fetched by entity type
  
  // Filter saved views to only show opportunity-related views (client-side filtering)
  const opportunitySavedViewsData = savedViewsData.filter((view: any) => 
    view.entity_type === 'opportunities'
  );

  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedProbability, setSelectedProbability] = useState('all');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  
  // Bulk action modals state
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showAddToCampaignModal, setShowAddToCampaignModal] = useState(false);
  const [showAssignTemplateModal, setShowAssignTemplateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState([
    'opportunity', 'customer', 'partner', 'stage', 'value', 'probability', 'template'
  ]);

  // Enhanced toolbar state management (identical to CustomersPage pattern)
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [showSegmentViewsDropdown, setShowSegmentViewsDropdown] = useState(false);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [activeList, setActiveList] = useState<any>(null);
  const [activeView, setActiveView] = useState<any>(null);
  const [newViewName, setNewViewName] = useState('');
  
  // Visible fields state matching opportunities data structure
  const [visibleFields, setVisibleFields] = useState({
    title: true,
    customer: true,
    partner: true,
    stage: true,
    value: true,
    probability: true,
    status: true
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: 'All',
    stage: 'All',
    type: 'All'
  });

  // Calculate if there are active filters
  const hasActiveFilters = filters.status !== 'All' || filters.stage !== 'All' || filters.type !== 'All';

  // Helper functions for toolbar functionality (matching CustomersPage pattern)
  const hasChanges = () => {
    const hasFilterChanges = filters.status !== 'All' || filters.stage !== 'All' || filters.type !== 'All';
    const hasFieldChanges = JSON.stringify(visibleFields) !== JSON.stringify({
      title: true,
      customer: true,
      partner: true,
      stage: true,
      value: true,
      probability: true,
      status: true
    });
    return hasFilterChanges || hasFieldChanges || !!activeView;
  };

  const clearAllChanges = () => {
    setActiveList(null);
    setActiveView(null);
    setFilters({ status: 'All', stage: 'All', type: 'All' });
    setVisibleFields({
      title: true,
      customer: true,
      partner: true,
      stage: true,
      value: true,
      probability: true,
      status: true
    });
    setFilterText('');
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };



  // Database-driven filter options extracted from opportunities data
  const statusOptions = Array.from(new Set(opportunities.map((opp: any) => opp.status || '').filter(Boolean))).sort();
  const stageOptions = Array.from(new Set(opportunities.map((opp: any) => opp.stage || '').filter(Boolean))).sort();
  const typeOptions = Array.from(new Set(opportunities.map((opp: any) => opp.type || '').filter(Boolean))).sort();
  const customerOptions = Array.from(new Set(opportunities.map((opp: any) => opp.clientName || opp.customerName).filter(Boolean))).sort();
  const partnerOptions = Array.from(new Set(opportunities.map((opp: any) => opp.partnerName).filter(Boolean))).sort();
  const probabilityOptions = Array.from(new Set(opportunities.map((opp: any) => opp.probability).filter(val => val !== null && val !== undefined))).sort((a, b) => a - b);
  
  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOpportunities(displayedOpportunities.map((opp: any) => opp.id));
    } else {
      setSelectedOpportunities([]);
    }
  };

  const handleSelectOpportunity = (opportunityId: number) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowSegmentViewsDropdown(false);
        setShowListsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter state management - sync individual filter states with active filters
  const [activeFilters, setActiveFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    customer: [] as string[],
    partner: [] as string[],
    stage: [] as string[],
    probability: [] as string[]
  });

  // Update active filters when individual filter states change
  useEffect(() => {
    setActiveFilters({
      status: selectedStatus !== 'all' ? [selectedStatus] : [],
      type: selectedType !== 'all' ? [selectedType] : [],
      customer: selectedCustomer !== 'all' ? [selectedCustomer] : [],
      partner: selectedPartner !== 'all' ? [selectedPartner] : [],
      stage: selectedStage !== 'all' ? [selectedStage] : [],
      probability: selectedProbability !== 'all' ? [selectedProbability] : []
    });
  }, [selectedStatus, selectedType, selectedCustomer, selectedPartner, selectedStage, selectedProbability]);
  
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
  
  // Assign Template functionality (moved to bulk actions section above)
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

  // Additional UI state
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showAccountMappingModal, setShowAccountMappingModal] = useState(false);
  const [selectedMappingFields, setSelectedMappingFields] = useState<string[]>([]);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [shareListData, setShareListData] = useState<any>(null);
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
        description: `Failed to create opportunity: ${(error as any)?.message || 'Please try again.'}`,
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

  // Enhanced filtering logic - FIXED version matching PartnersPage
  let displayedOpportunities = opportunities;
  
  // Apply active list filter first (before other filters)
  if (activeList) {
    console.log('FILTERING: Current activeList:', activeList);
    console.log('FILTERING: Checking members array:', activeList.members);
    
    // Extract member IDs, handling both individual IDs and objects with id properties
    const memberIds = activeList.members.map((member: any) => {
      // Handle different member formats from the database
      let id;
      if (typeof member === 'object' && member !== null) {
        id = member.id || member.opportunity_id || member.opportunityId || member.member_id;
      } else {
        id = member;
      }
      
      const numericId = parseInt(id);
      console.log('FILTERING: Extracted ID:', numericId, 'from member:', member);
      return numericId;
    }).filter(id => !isNaN(id));
    
    console.log('FILTERING: Final member IDs to filter by:', memberIds);
    
    // Filter opportunities to only show those in the active list
    displayedOpportunities = opportunities.filter(opp => {
      const isIncluded = memberIds.includes(opp.id);
      console.log('FILTERING: Checking opportunity', opp.id, opp.title, '- included:', isIncluded);
      return isIncluded;
    });
    
    console.log('FILTERING: Filtered opportunities result count:', displayedOpportunities.length);
  }

  // Apply text and dropdown filters to the displayed opportunities
  const filteredOpportunities = displayedOpportunities.filter((opportunity: any) => {
    // Text search - using actual API response fields
    const title = opportunity.title || '';
    const searchCustomerName = opportunity.clientName || opportunity.customerName || '';
    const searchPartnerName = opportunity.partnerName || '';
    
    const matchesText = !filterText || 
      title.toLowerCase().includes(filterText.toLowerCase()) ||
      searchCustomerName.toLowerCase().includes(filterText.toLowerCase()) ||
      searchPartnerName.toLowerCase().includes(filterText.toLowerCase());
      
    // Status filter - simplified logic (handle null values)
    const oppStatus = opportunity.status || '';
    const matchesStatus = selectedStatus === 'all' || oppStatus === selectedStatus;
    
    // Type filter - simplified logic (handle null values)
    const oppType = opportunity.type || '';
    const matchesType = selectedType === 'all' || oppType === selectedType;
    
    // Customer filter
    const filterCustomerName = opportunity.clientName || opportunity.customerName || '';
    const matchesCustomer = selectedCustomer === 'all' || filterCustomerName === selectedCustomer;
    
    // Partner filter
    const filterPartnerName = opportunity.partnerName || '';
    const matchesPartner = selectedPartner === 'all' || filterPartnerName === selectedPartner;
    
    // Stage filter
    const stage = opportunity.stage || '';
    const matchesStage = selectedStage === 'all' || stage === selectedStage;
    
    // Probability filter
    const probability = opportunity.probability;
    const matchesProbability = selectedProbability === 'all' || String(probability) === selectedProbability;
    
    // Customer/Partner filters from active list
    const customerId = opportunity.customerId || opportunity.clientId;
    const partnerId = opportunity.partnerId || opportunity.partner?.id;
    
    const matchesCustomerId = !activeList?.filters.customerId || 
      String(customerId) === activeList.filters.customerId;
    const matchesPartnerId = !activeList?.filters.partnerId || 
      String(partnerId) === activeList.filters.partnerId;
    
    return matchesText && matchesStatus && matchesType && matchesCustomer && matchesPartner && matchesStage && matchesProbability && matchesCustomerId && matchesPartnerId;
  });

  // Apply sorting manually using the state
  const handleSort = (key: string) => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort the filtered opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a: any, b: any) => {
    const aValue = a[tableSortConfig.key] || '';
    const bValue = b[tableSortConfig.key] || '';
    
    if (tableSortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Calculate stats based on filtered opportunities
  const stats = calculateOpportunityStats(sortedOpportunities);
  
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
    if (selectedOpportunities.length === sortedOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(sortedOpportunities.map((opp: any) => opp.id));
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
  
  // Use existing stats calculation

  return (
    <div className="space-y-1">
      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-4 py-6">
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalOpportunities}</div>
            <div className="text-gray-500 font-medium text-[13px]">Total Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.closedWon}</div>
            <div className="text-sm text-gray-500">Closed Won</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalValue}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.weightedValue}</div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk actions bar */}


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
                className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                  activeView ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setShowViewsDropdown(!showViewsDropdown)}
              >
                <BarChart3 width="14" height="14" />
                <span>Segment view</span>
                <ChevronDown width="14" height="14" className={`transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showViewsDropdown && (
                <div className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                  <div className="p-2 border-b">
                    {opportunitySavedViewsData?.map((view: any) => (
                      <div 
                        key={view.id}
                        className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${
                          activeView?.id === view.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
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
                        {activeView?.id === view.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
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
                <Columns3 className="h-4 w-4" />
                <span>Fields</span>
                <span className="text-xs">({Object.values(visibleFields).filter(Boolean).length}/{Object.keys(visibleFields).length})</span>
                <ChevronDown width="14" height="14" className={`transition-transform ${showFieldsDropdown ? 'rotate-180' : ''}`} />
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
                <Filter width="14" height="14" />
                <span>Filter</span>
                <ChevronDown width="14" height="14" className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>

              {showFilter && (
                <div className="absolute z-50 mt-1 right-0 w-[600px] rounded-md border border-[#E6E7F1] bg-white shadow-md">
                  <div className="p-4 space-y-4">
                    {/* Where Status equals */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">Where</span>
                      <select 
                        value="status"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="status">Status</option>
                        <option value="stage">Stage</option>
                        <option value="type">Type</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* And Stage equals */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">And</span>
                      <select 
                        value="stage"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="stage">Stage</option>
                        <option value="status">Status</option>
                        <option value="type">Type</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.stage}
                        onChange={(e) => updateFilter('stage', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        {stageOptions.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>

                    {/* And Type equals */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">And</span>
                      <select 
                        value="type"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="type">Type</option>
                        <option value="stage">Stage</option>
                        <option value="status">Status</option>
                      </select>
                      <span className="text-sm text-gray-500">equals</span>
                      <select
                        value={filters.type}
                        onChange={(e) => updateFilter('type', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white flex-1"
                      >
                        <option value="All">All</option>
                        {typeOptions.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
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
              placeholder="Search opportunities..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
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
            <div className={viewMode === 'cards' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
              {/* All Opportunities option */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  !activeList ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveList(null)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium text-gray-900">All Opportunities</h3>
                      <p className="text-sm text-gray-500">{displayedOpportunities.length} opportunities</p>
                      {!activeList && (
                        <div className="text-xs text-gray-400 mt-1">Live data</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">€0</p>
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
                          <p className="text-sm text-gray-500">{list.members?.length || 0} opportunities</p>
                          {isSelected && (
                            <div className="text-xs text-gray-400 mt-1">Updated 1 hours ago</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">€0</p>
                      {isSelected && (
                        <div className="text-xs text-green-600 font-medium">+4%</div>
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
      {selectedOpportunities.length > 0 && (
        <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-blue-900">
              {selectedOpportunities.length} opportunit{selectedOpportunities.length !== 1 ? 'ies' : 'y'} selected
            </span>
            <button
              onClick={() => setSelectedOpportunities([])}
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

      {/* Opportunities table */}
      <div className="mx-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E7F1] text-left">
                <th className="w-12 py-3 px-4 font-medium text-[#282A3F] text-sm">
                  <div className={`transition-opacity ${
                    selectedOpportunities.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Opportunity</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Customer</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Partner</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Stage</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Value</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Probability</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Template</th>
              </tr>
            </thead>
            <tbody>
              {sortedOpportunities.map((opportunity: any) => (
                <tr 
                  key={opportunity.id} 
                  className="border-b border-[#E6E7F1] hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.includes(opportunity.id)}
                      onChange={() => handleSelectOpportunity(opportunity.id)}
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td 
                    className="py-3 px-4 cursor-pointer"
                    onClick={() => window.location.href = `/opportunities/${opportunity.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                          {opportunity.title?.charAt(0)?.toUpperCase() || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[#282A3F] text-sm">{opportunity.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{opportunity.clientName || opportunity.customerName || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{opportunity.partnerName || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={getStatusBadgeVariant(opportunity.stage) + " text-xs"}>
                      {opportunity.stage || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">€{(opportunity.estimated_value || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{opportunity.probability || 0}%</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">No templates</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to List Modal */}
      <Dialog open={showAddToListModal} onOpenChange={setShowAddToListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to list</DialogTitle>
            <DialogDescription>
              Add selected opportunities to an existing list or create a new one.
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
                {selectedOpportunities.length} opportunit{selectedOpportunities.length !== 1 ? 'ies' : 'y'} will be added to this list.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToListModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Opportunities added to list successfully" });
              setShowAddToListModal(false);
              setSelectedOpportunities([]);
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
              Add selected opportunities to an existing campaign or create a new one.
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
                  End of Term Renewal Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  Cyber Security Awareness
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
                {selectedOpportunities.length} opportunit{selectedOpportunities.length !== 1 ? 'ies' : 'y'} will be added to this campaign.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToCampaignModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Opportunities added to campaign successfully" });
              setShowAddToCampaignModal(false);
              setSelectedOpportunities([]);
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
              Select OKR templates to assign to {selectedOpportunities.length} selected opportunit{selectedOpportunities.length !== 1 ? 'ies' : 'y'}. Templates will be converted to active OKRs with tracking capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedOpportunities.length} Opportunit{selectedOpportunities.length !== 1 ? 'ies' : 'y'} Selected
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Zonnepanelen Opportunities, Cyber Security Prospects, End of Term Renewals, and {selectedOpportunities.length - 3} more...
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Available OKR Templates</h4>
                <span className="text-sm text-gray-500">0 of 12 selected</span>
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
                  <Badge variant="secondary" className="mb-2">Sales Performance (1)</Badge>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox id="conversion-rate" />
                      <div className="flex-1">
                        <Label htmlFor="conversion-rate" className="font-medium">Opportunity Conversion Rate</Label>
                        <Badge variant="outline" className="ml-2 text-xs">activity</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">Percentage of opportunities converted to sales</p>
                    <p className="text-xs text-gray-500 ml-6">🎯 25% none</p>
                  </div>
                </div>
                
                <div>
                  <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800">Revenue Growth (1)</Badge>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox id="pipeline-value" />
                      <div className="flex-1">
                        <Label htmlFor="pipeline-value" className="font-medium">Pipeline Value Growth</Label>
                        <Badge variant="outline" className="ml-2 text-xs">activity</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">Monthly growth in total pipeline value</p>
                    <p className="text-xs text-gray-500 ml-6">📈 €125K none</p>
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
              setSelectedOpportunities([]);
            }}>
              Assign 0 Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OpportunitiesPage() {
  return <OpportunitiesTable />;
}
