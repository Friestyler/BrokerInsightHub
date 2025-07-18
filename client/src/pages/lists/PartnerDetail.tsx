import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, Users, Trash2, MoreHorizontal, MoreVertical, MessageSquare, ArrowLeft, Plus, Mail, Calendar, Clock, Play, Pause, AlertCircle, CheckCircle, Eye, Edit, Filter, Package, Target, Crown, Bot, ChevronDown, ChevronRight, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { ShareModal } from "@/components/ShareModal";
import { apiRequest } from "@/lib/queryClient";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import PartnerCampaignsView from "@/components/campaigns/PartnerCampaignsView";
import PartnerCampaignBuilder from "@/pages/campaigns/PartnerCampaignBuilder";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import { WhiteSpaceMatrix } from "@/components/entity/WhiteSpaceMatrixSimplified";
import { SmartCrossSell } from "@/components/portfolio/SmartCrossSell";
import nnLogo from "@assets/NN.AS_1751813752232.png";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

// Environment-specific branding function
const getEnvironmentBranding = (envId: string) => {
  const branding = {
    degoudse: { 
      name: 'De Goudse', 
      logo: undefined
    },
    baloise: { 
      name: 'Baloise', 
      logo: baloiseLogoPng
    },
    nn: { 
      name: 'Nationale Nederlanden', 
      logo: nnLogo
    },
    concordia: { 
      name: 'Concordia', 
      logo: concordiaLogo
    }
  };
  return branding[envId] || branding.degoudse;
};

export default function PartnerDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location, setLocation] = useLocation();
  
  // Detect if we're in broker view
  const isBrokerView = location.startsWith('/broker-view');
  
  // Check URL parameters for tab selection and iframe mode
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const isIframeMode = urlParams.get('iframe') === 'true';
  const [activeTab, setActiveTab] = useState(tabParam || "products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [activeCampaignTab, setActiveCampaignTab] = useState("overview");
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Campaign click handler
  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setActiveCampaignTab(`edit-${campaign.id}`);
  };
  const [isOpportunitiesListsCollapsed, setIsOpportunitiesListsCollapsed] = useState(false);
  const [isCustomerListsCollapsed, setIsCustomerListsCollapsed] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedMetricForComment, setSelectedMetricForComment] = useState<any>(null);
  const [visibleToPartner, setVisibleToPartner] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  
  // Comment dialog state for customers and opportunities
  const [isCustomerCommentDialogOpen, setIsCustomerCommentDialogOpen] = useState(false);
  const [isOpportunityCommentDialogOpen, setIsOpportunityCommentDialogOpen] = useState(false);
  const [selectedCustomerForComment, setSelectedCustomerForComment] = useState<any>(null);
  const [selectedOpportunityForComment, setSelectedOpportunityForComment] = useState<any>(null);
  const [customerComment, setCustomerComment] = useState("");
  const [opportunityComment, setOpportunityComment] = useState("");
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);

  // Back navigation state
  const [backUrl, setBackUrl] = useState("/partners");
  const [backLabel, setBackLabel] = useState("Back to Partners");
  
  // Handle back navigation from stored location
  useEffect(() => {
    const previousLocation = sessionStorage.getItem('previousLocation');
    if (previousLocation) {
      setBackUrl(previousLocation);
      // Clear the stored location after using it
      sessionStorage.removeItem('previousLocation');
      
      // Set appropriate back label based on the previous location
      if (previousLocation.includes('/opportunities')) {
        setBackLabel("Back to Opportunities");
      } else if (previousLocation.includes('/customers')) {
        setBackLabel("Back to Customers");
      } else {
        setBackLabel("Back to Partners");
      }
    }
  }, []);

  // Opportunities-specific state
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedInsuranceDescription, setSelectedInsuranceDescription] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUnifiedFilterDropdown, setShowUnifiedFilterDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showInsuranceDescDropdown, setShowInsuranceDescDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  
  // View mode state for opportunities
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [showViewModeDropdown, setShowViewModeDropdown] = useState(false);
  
  // Customer-specific state for enhanced unified toolbar
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [activeCustomerList, setActiveCustomerList] = useState<any>(null);
  const [showCustomerListsDropdown, setShowCustomerListsDropdown] = useState(false);
  const [activeCustomerView, setActiveCustomerView] = useState<any>(null);
  const [showCustomerViewsDropdown, setShowCustomerViewsDropdown] = useState(false);
  const [showCustomerStatusDropdown, setShowCustomerStatusDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  // Products-specific state for enhanced unified toolbar
  const [productSearchText, setProductSearchText] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [activeProductList, setActiveProductList] = useState<any>(null);
  const [showProductListsDropdown, setShowProductListsDropdown] = useState(false);
  const [activeProductView, setActiveProductView] = useState<any>(null);
  const [showProductViewsDropdown, setShowProductViewsDropdown] = useState(false);
  const [showProductCategoryDropdown, setShowProductCategoryDropdown] = useState(false);
  const [showPriceRangeDropdown, setShowPriceRangeDropdown] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Contacts-specific state for enhanced unified toolbar
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [activeView, setActiveView] = useState<any>(null);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [originalViewFilters, setOriginalViewFilters] = useState<any>(null);

  
  // Stage editing state
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [stageDropdownRef, setStageDropdownRef] = useState<HTMLDivElement | null>(null);
  
  // Available opportunity stages (correct database stages)
  const OPPORTUNITY_STAGES = [
    'Validated',
    'Proposal Sent to Client',
    'Closed (Won)',
    'Lost',
    'Rejected'
  ];
  const [selectedExistingList, setSelectedExistingList] = useState<number | null>(null);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [currentSharedLink, setCurrentSharedLink] = useState<string | null>(null);
  const [existingSharedLinks, setExistingSharedLinks] = useState<any[]>([]);
  
  // Delete list functionality
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToDelete, setListToDelete] = useState<any>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // State to track collaborators for each list
  const [listCollaborators, setListCollaborators] = useState<Record<number, any[]>>({});

  // Logo upload state
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editedPartner, setEditedPartner] = useState<any>({});
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<number[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);

  // Campaigns state


  // Get collaborators for the currently active list
  const getCollaboratorsForList = (listId: number) => {
    return listCollaborators[listId] || [];
  };

  // Initialize collaborators for demo purposes when a list is selected
  const initializeCollaboratorsForList = (listId: number) => {
    if (!listCollaborators[listId]) {
      const sampleCollaborators = [
        {
          id: `${listId}-1`,
          name: 'John Smith',
          email: 'john.smith@partner.com',
          accessLevel: 'editor' as const,
          avatar: 'J',
          isOwner: false
        },
        {
          id: `${listId}-2`,
          name: 'Maria Garcia',
          email: 'maria.garcia@company.com',
          accessLevel: 'viewer' as const,
          avatar: 'M',
          isOwner: false
        }
      ];
      
      setListCollaborators(prev => ({
        ...prev,
        [listId]: sampleCollaborators
      }));
    }
  };

  const [renderKey, setRenderKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const insuranceDescDropdownRef = useRef<HTMLDivElement>(null);
  const unifiedFilterDropdownRef = useRef<HTMLDivElement>(null);
  const listsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  
  // Fetch all partners to find this specific partner
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch related customers for this partner
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
    enabled: !!id,
  });

  // Fetch related opportunities for this partner
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch filter options for opportunities
  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities/filters`],
    enabled: !!id,
  });

  // Fetch filter options for customers
  const { data: customerFilterOptions, isLoading: customerFilterOptionsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers/filter-options`],
    enabled: !!id,
  });

  // Fetch users for collaborators
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch related products for this partner
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/products`],
    enabled: !!id,
  });

  // Partner Product Assignments
  const { data: assignedProducts, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: [`/api/degoudse/partners/${id}/product-assignments`],
    enabled: !!id
  });
  
  // Initialize dialog data when it opens (needs to be here for hooks order)
  useEffect(() => {
    const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));
    if (showDetailsDialog && partner) {
      setEditedPartner({
        name: partner.name || '',
        description: partner.description || '',
        type: partner.type || '',
        contactEmail: partner.contactEmail || '',
        contactPhone: partner.contactPhone || '',
        website: partner.website || '',
        status: partner.status || '',
        address: partner.address || '',
      });
      
      // Initialize with existing relationships
      const opportunityIds = Array.isArray(relatedOpportunities) 
        ? relatedOpportunities.map((opp: any) => opp.id) 
        : [];
      const customerIds = Array.isArray(relatedCustomers) 
        ? relatedCustomers.map((customer: any) => customer.id) 
        : [];
        
      setSelectedOpportunityIds(opportunityIds);
      setSelectedCustomerIds(customerIds);
    }
  }, [showDetailsDialog, partners, id, relatedOpportunities, relatedCustomers]);

  // Close stage dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stageDropdownRef && !stageDropdownRef.contains(event.target as Node)) {
        setEditingStageId(null);
      }
    }

    if (editingStageId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingStageId, stageDropdownRef]);
  
  // Views functionality state
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');

  // Fetch saved views from database
  const { data: savedViewsData = [] } = useQuery({
    queryKey: ['/api/saved-views'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=opportunities'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Convert database records to local interface format
  const savedViews = savedViewsData.map((view: any) => ({
    id: view.id.toString(),
    name: view.name,
    description: view.description,
    filters: view.filters || {},
    createdBy: view.created_by,
    createdAt: new Date(view.created_at)
  }));

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detect navigation context and set appropriate back URL
  useEffect(() => {
    // Try multiple methods to detect the source page
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // Method 1: Check document.referrer
    if (referrer && referrer.startsWith(currentOrigin)) {
      const referrerPath = new URL(referrer).pathname;
      const customerDetailMatch = referrerPath.match(/\/lists\/customers\/(\d+)/);
      const opportunityDetailMatch = referrerPath.match(/\/opportunities\/(\d+)/);
      const opportunityListDetailMatch = referrerPath.match(/\/lists\/opportunities\/(\d+)/);
      
      if (customerDetailMatch) {
        const customerId = customerDetailMatch[1];
        setBackUrl(`/lists/customers/${customerId}`);
        setBackLabel("Back to Customer");
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        return;
      }
      
      if (opportunityListDetailMatch) {
        const opportunityId = opportunityListDetailMatch[1];
        setBackUrl(`/lists/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        return;
      }
    }
    
    // Method 2: Check for context in session storage
    const sessionReferrer = sessionStorage.getItem('partnerReferrer');
    if (sessionReferrer) {
      // Check for customer with specific tab (e.g., "customers/123#partners")
      const customerWithTabMatch = sessionReferrer.match(/customers\/(\d+)#(\w+)/);
      const opportunityWithTabMatch = sessionReferrer.match(/opportunities\/(\d+)#(\w+)/);
      const customerDetailMatch = sessionReferrer.match(/customers\/(\d+)$/);
      const opportunityDetailMatch = sessionReferrer.match(/^opportunities\/(\d+)$/);
      const opportunityListDetailMatch = sessionReferrer.match(/^lists\/opportunities\/(\d+)$/);
      
      if (customerWithTabMatch) {
        const customerId = customerWithTabMatch[1];
        const tabName = customerWithTabMatch[2];
        setBackUrl(`/lists/customers/${customerId}?tab=${tabName}`);
        setBackLabel(`Back to Customer (${tabName})`);
        sessionStorage.removeItem('partnerReferrer');
        return;
      }
      
      if (opportunityWithTabMatch) {
        const opportunityId = opportunityWithTabMatch[1];
        const tabName = opportunityWithTabMatch[2];
        setBackUrl(`/opportunities/${opportunityId}?tab=${tabName}`);
        setBackLabel(`Back to Opportunity (${tabName})`);
        sessionStorage.removeItem('partnerReferrer');
        return;
      }
      
      if (customerDetailMatch) {
        const customerId = customerDetailMatch[1];
        setBackUrl(`/lists/customers/${customerId}`);
        setBackLabel("Back to Customer");
        sessionStorage.removeItem('partnerReferrer');
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        sessionStorage.removeItem('partnerReferrer');
        return;
      }
      
      if (opportunityListDetailMatch) {
        const opportunityId = opportunityListDetailMatch[1];
        setBackUrl(`/lists/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        sessionStorage.removeItem('partnerReferrer');
        return;
      }
    }
  }, []);

  // Effect to clear active view when filters are manually changed
  useEffect(() => {
    if (activeView && originalViewFilters) {
      const currentFilters = {
        status: selectedStatus || undefined,
        customer: selectedCustomer || undefined,
      };
      
      // Compare current filters with original view filters
      const hasChanges = 
        currentFilters.status !== originalViewFilters.status ||
        currentFilters.customer !== originalViewFilters.customer;
      
      // If filters have changed from the original view, clear the active view
      if (hasChanges) {
        setActiveView(null);
        setOriginalViewFilters(null);
      }
    }
  }, [selectedStatus, selectedCustomer, activeView, originalViewFilters]);

  // Mutation for creating saved views
  const createSavedViewMutation = useMutation({
    mutationFn: async (viewData: any) => {
      return await apiRequest('POST', '/api/saved-views', viewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      toast({
        title: "View Saved",
        description: "Your view has been saved successfully"
      });
      setShowSaveViewModal(false);
      setViewNameInput('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save view. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Simple mutation for creating new lists
  const createListMutation = useMutation({
    mutationFn: async (listData: any) => {
      console.log('Creating list with data:', listData);
      const result = await apiRequest('POST', '/api/saved-lists', listData);
      console.log('List creation API result:', result);
      return result;
    }
  });

  // Mutation for updating opportunity stage
  const updateOpportunityStage = useMutation({
    mutationFn: async ({ opportunityId, stage }: { opportunityId: number, stage: string }) => {
      return await apiRequest('PATCH', `/api/opportunities/${opportunityId}`, { stage });
    },
    onSuccess: (data, variables) => {
      // Invalidate multiple related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${id}/opportunities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/partners', parseInt(id), 'opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      
      // Optimistically update the cached data
      queryClient.setQueryData([`/api/partners/${id}/opportunities`], (oldData: any) => {
        if (oldData) {
          return oldData.map((opp: any) => 
            opp.id === variables.opportunityId 
              ? { ...opp, stage: variables.stage }
              : opp
          );
        }
        return oldData;
      });
      
      setEditingStageId(null);
      toast({
        title: "Stage updated",
        description: "Opportunity stage has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating stage:', error);
      toast({
        title: "Error updating stage",
        description: "Failed to update opportunity stage. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for adding opportunities to existing lists
  const updateListMutation = useMutation({
    mutationFn: async ({ listId, opportunityIds }: { listId: number, opportunityIds: number[] }) => {
      return await apiRequest('POST', `/api/saved-lists/${listId}/add-opportunities`, { opportunityIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] });
    }
  });



  // Mutation for creating cross-entity comments
  const createCrossEntityCommentMutation = useMutation({
    mutationFn: async ({ entityType, entityId, comment, entityName }: { 
      entityType: 'customer' | 'opportunity', 
      entityId: number, 
      comment: string,
      entityName: string 
    }) => {
      // Create activity in both partner and entity hubs
      const partnerActivityData = {
        type: 'comment',
        content: comment,
        source_entity_type: entityType,
        source_entity_id: entityId,
        source_entity_name: entityName,
        visible_to_partner: true,
        assigned_to: 'current_user'
      };

      const entityActivityData = {
        type: 'comment',
        content: comment,
        source_entity_type: 'partner',
        source_entity_id: parseInt(id),
        source_entity_name: partner?.data?.name || 'Partner',
        visible_to_partner: true,
        assigned_to: 'current_user'
      };

      // Create activity in partner hub
      await apiRequest('POST', `/api/partners/${id}/activities`, partnerActivityData);
      
      // Create activity in entity hub (opportunity or customer)
      const entityEndpoint = entityType === 'opportunity' 
        ? `/api/opportunities/${entityId}/activities`
        : `/api/customers/${entityId}/activities`;
      
      await apiRequest('POST', entityEndpoint, entityActivityData);
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate activity queries for both hubs
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${id}/activities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to both partner and entity activity feeds.",
      });
      
      // Reset comment dialog state
      setIsCustomerCommentDialogOpen(false);
      setIsOpportunityCommentDialogOpen(false);
      setCustomerComment("");
      setOpportunityComment("");
      setSelectedCustomerForComment(null);
      setSelectedOpportunityForComment(null);
    },
    onError: (error) => {
      console.error('Error creating cross-entity comment:', error);
      toast({
        title: "Error creating comment",
        description: "Failed to create comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Comment handler functions
  const handleCustomerComment = (customer: any) => {
    setSelectedCustomerForComment(customer);
    setIsCustomerCommentDialogOpen(true);
  };

  const handleOpportunityComment = (opportunity: any) => {
    setSelectedOpportunityForComment(opportunity);
    setIsOpportunityCommentDialogOpen(true);
  };

  const handleSubmitCustomerComment = () => {
    if (!customerComment.trim() || !selectedCustomerForComment) return;
    
    createCrossEntityCommentMutation.mutate({
      entityType: 'customer',
      entityId: selectedCustomerForComment.id,
      comment: customerComment,
      entityName: selectedCustomerForComment.name
    });
  };

  const handleSubmitOpportunityComment = () => {
    if (!opportunityComment.trim() || !selectedOpportunityForComment) return;
    
    createCrossEntityCommentMutation.mutate({
      entityType: 'opportunity',
      entityId: selectedOpportunityForComment.id,
      comment: opportunityComment,
      entityName: selectedOpportunityForComment.title
    });
  };

  // Enhanced delete list mutation with comprehensive cache invalidation
  const deleteSavedListMutation = useMutation({
    mutationFn: async (listId: number) => {
      return await apiRequest('DELETE', `/api/saved-lists/${listId}`);
    },
    onSuccess: () => {
      // Comprehensive cache invalidation
      queryClient.resetQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.resetQueries({ queryKey: ['/api/saved-lists', 'opportunities'] });
      queryClient.resetQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] });
      
      // Additional environment-specific cache clearing
      const currentEnv = window.__APP_ENV__ || localStorage.getItem('selectedEnvironment') || 'myqollabi';
      if (currentEnv !== 'myqollabi') {
        queryClient.resetQueries({ queryKey: [`/api/${currentEnv}/saved-lists`] });
        queryClient.resetQueries({ queryKey: [`/api/${currentEnv}/saved-lists`, 'opportunities'] });
      }
    },
    onError: (error) => {
      console.error('Error deleting saved list:', error);
      toast({
        title: "Error",
        description: "Failed to delete the list. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch all opportunities for multi-select
  const { data: allOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  // Fetch all customers for multi-select
  const { data: allCustomers } = useQuery({
    queryKey: ['/api/customers'],
  });



  // Fetch saved lists for opportunities that include this partner
  const { data: savedListsData } = useQuery({
    queryKey: ['/api/saved-lists', 'opportunities', 'partner', id],
    queryFn: () => apiRequest('GET', `/api/saved-lists?entity_type=opportunities&partner_id=${id}`),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchInterval: false, // Disable polling - we'll use manual refetch when needed
  });

  // Fetch all opportunity lists for the modal
  const { data: opportunityLists } = useQuery({
    queryKey: ['/api/saved-lists', 'opportunities', 'all'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=opportunities'),
  });

  // Fetch customer saved lists
  const { data: customerSavedLists } = useQuery({
    queryKey: ['/api/saved-lists', 'customers'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=customers'),
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch customer saved views
  const { data: customerSavedViews } = useQuery({
    queryKey: ['/api/saved-views', 'customers'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=customers'),
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch campaigns linked to this partner


  // Filter saved lists to show partner-relevant lists, sorted alphabetically
  const partnerRelevantLists = (savedListsData as any[] || [])
    .filter((list: any) => {
      // Show lists that are shared (is_shared = true) or belong to this partner
      return list.is_shared === true || list.partner_id === parseInt(id || '0');
    })
    .sort((a: any, b: any) => {
      // Sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  // Function to get fresh list data directly from React Query
  const getActiveListForFiltering = () => {
    // Always use the latest data from React Query instead of local state
    if (activeList && savedListsData) {
      const freshList = savedListsData.find((list: any) => list.id === activeList.id);
      console.log('Using fresh list from query data:', freshList);
      return freshList || activeList;
    }
    return activeList;
  };

  const activeFilterList = getActiveListForFiltering();
  


  // Handle click outside to close filter dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }

      if (insuranceDescDropdownRef.current && !insuranceDescDropdownRef.current.contains(event.target as Node)) {
        setShowInsuranceDescDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extract filter values from database API
  const uniqueStatuses = (filterOptions as any)?.stages || [];
  const uniqueCustomers = (filterOptions as any)?.customers || [];
  const uniqueInsuranceDescriptions = (filterOptions as any)?.insuranceDescriptions || [];

  // Extract customer filter values from database API
  const uniqueCustomerStatuses = (customerFilterOptions as any)?.statuses || [];
  const uniqueIndustries = (customerFilterOptions as any)?.industries || [];



  // Filter opportunities based on search, filters, and active list
  const filteredOpportunities = (relatedOpportunities as any[] || []).filter((opportunity: any) => {
    // Filter by search text
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.clientName?.toLowerCase().includes(searchLower) ||
        opportunity.stage?.toLowerCase().includes(searchLower) ||
        opportunity.account_manager_name?.toLowerCase().includes(searchLower) ||
        opportunity.insurance_description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Filter by Status (stage)
    if (selectedStatus && opportunity.stage !== selectedStatus) {
      return false;
    }
    
    // Filter by Customer
    if (selectedCustomer && opportunity.clientName !== selectedCustomer) {
      return false;
    }
    
    // Filter by Insurance Description
    if (selectedInsuranceDescription && opportunity.insurance_description !== selectedInsuranceDescription) {
      return false;
    }
    
    // If a specific list is selected, filter by its members
    if (activeFilterList) {
      // If the list has members (specific opportunity IDs), only show those
      if (activeFilterList.members && activeFilterList.members.length > 0) {
        return activeFilterList.members.includes(opportunity.id);
      }
      // If the list has filters, apply them
      if (activeFilterList.filters) {
        // Additional filter logic can be added here if needed
      }
    }
    
    return true;
  });

  // Selection helper functions
  const toggleSelectOpportunity = (opportunityId: number) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  // Helper function to check if an opportunity is selected
  const isOpportunitySelected = (opportunityId: number) => {
    return selectedOpportunities.includes(opportunityId);
  };

  const toggleSelectAll = () => {
    if (selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map(opp => opp.id));
    }
  };

  // Click outside handler to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false);
      }
      if (unifiedFilterDropdownRef.current && !unifiedFilterDropdownRef.current.contains(event.target as Node)) {
        setShowUnifiedFilterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch template assignments for this partner
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/partner`],
    enabled: !!id,
  });

  // Fetch all OKR metrics to match with assignments
  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch OKR tags for filtering
  const { data: tags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Fetch all categories for blind spot analysis
  const { data: allCategories } = useQuery({
    queryKey: [`/api/categories`],
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; visible_to_partner: boolean; entityType: string; entityId: number; assignedTo?: string; metricId?: number }) => {
      const envId = localStorage.getItem('selectedEnvironment') || 'degoudse';
      
      // Use OKR comment endpoint if a metric is selected
      if (data.metricId) {
        const response = await fetch(`/api/${envId}/okr/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metricId: data.metricId,
            partnerId: data.entityId,
            comment: data.content,
            userId: 1, // Default user ID
          }),
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to create OKR comment: ${errorData}`);
        }
        return response.json();
      } else {
        // Use general comment endpoint
        const response = await fetch(`/api/${envId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to create comment: ${errorData}`);
        }
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been successfully added.",
      });
      setIsCommentDialogOpen(false);
      setComment("");
      setSelectedMetricForComment(null);
      setVisibleToPartner(false);
      setAssignedTo("");
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/okr/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (metric: any) => {
    setSelectedMetricForComment(metric);
    setIsCommentDialogOpen(true);
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    
    createCommentMutation.mutate({
      content: comment,
      visible_to_partner: visibleToPartner,
      entityType: 'partner',
      entityId: parseInt(id!),
      assignedTo: assignedTo || undefined,
      metricId: selectedMetricForComment.id, // Pass the metric ID for OKR comments
    });
  };

  if (partnersLoading || customersLoading || opportunitiesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));
  
  if (!partner) {
    return <div className="p-4">Partner not found</div>;
  }

  // Get attached metrics for this partner
  const partnerAssignments = (templateAssignments as any[] || []).filter((assignment: any) => 
    assignment.entity_type === 'partner' && assignment.entity_id === parseInt(id || '0')
  );
  const attachedMetricIds = partnerAssignments.map((assignment: any) => assignment.template_id) || [];
  const attachedMetrics = (allMetrics as any[] || []).filter((metric: any) => attachedMetricIds.includes(metric.id));

  // Filter and search logic for OKR metrics (same as template page)
  const filteredMetrics = attachedMetrics.filter((metric: any) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || metric.tags?.includes(selectedTag);
    const matchesUnit = selectedUnit === "all" || metric.measure_unit === selectedUnit;
    
    let matchesRange = true;
    if (selectedRange !== "all" && metric.target_value) {
      const target = parseFloat(metric.target_value);
      if (selectedRange === "0-50") matchesRange = target >= 0 && target <= 50;
      else if (selectedRange === "50-100") matchesRange = target > 50 && target <= 100;
      else if (selectedRange === "100+") matchesRange = target > 100;
    }
    
    return matchesSearch && matchesTag && matchesUnit && matchesRange;
  });

  // Group metrics by tag for display
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: any) => {
    const tag = metric.tags && metric.tags.length > 0 ? metric.tags[0] : 'Untagged';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(metric);
    return acc;
  }, {});

  const handleMetricSelect = (metricId: number, checked: boolean) => {
    setSelectedMetrics(prev => 
      checked 
        ? [...prev, metricId]
        : prev.filter(id => id !== metricId)
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {!isIframeMode && (
                <Link href={backUrl}>
                  <Button variant="ghost" size="sm" className="p-2 group hover:bg-[#F5F6FE]">
                    <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
                  </Button>
                </Link>
              )}
              {/* Partner Logo */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowLogoUploadModal(true)}
                  className="relative w-16 h-16 rounded-lg transition-colors group hover:bg-gray-50"
                  title="Click to upload logo"
                >
                  <EntityAvatar
                    entityType="partner"
                    entityId={partner?.id || 0}
                    fallbackText={partner?.name?.substring(0, 2) || "P"}
                    size="lg"
                    className="w-16 h-16"
                  />
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg flex items-center justify-center transition-all">
                    <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                      onClick={() => {
                        setEditedPartner({
                          name: partner.name || '',
                          description: partner.description || '',
                          contactEmail: partner.contact_email || '',
                          contactPhone: partner.contact_phone || '',
                          website: partner.website || '',
                          address: partner.address || '',
                          type: partner.type || '',
                          status: partner.status || ''
                        });
                        setShowDetailsDialog(true);
                      }}
                    >
                      Details
                    </Button>
                    {/* Partner View Link - positioned next to Details button */}
                    <a
                      href={`/broker-view/partner/${id}?tab=opportunities&list=39&env=${environment.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center transition-colors"
                    >
                      {/* Show NN logo only for Willis B.V */}
                      {partner?.name === 'Willis B.V' && (
                        <img 
                          src={nnLogo} 
                          alt="NN Group" 
                          className="w-4 h-4 rounded-sm mr-1.5 object-cover"
                        />
                      )}
                      Partner View
                    </a>
                  </div>
                </div>
                
                {/* Collaborators Section */}
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-sm text-gray-600 font-medium">Collaborators:</span>
                  <div className="flex items-center space-x-4">
                    {/* Internal users */}
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        {/* Owner first with crown */}
                        {partner.owner_name && (
                          <div 
                            className="relative w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                            title={`${partner.owner_name} (Owner) - Click for Salesforce view`}
                            onClick={() => window.location.href = `/iframe/partner/${id}`}
                          >
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {/* Other internal users */}
                        {users && Array.isArray(users) && users.slice(0, partner.owner_name ? 2 : 3).map((user: any, index: number) => {
                          const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                          return (
                            <div 
                              key={user.id} 
                              className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                              title={`${user.name} - Click for Salesforce view`}
                              onClick={() => window.location.href = `/iframe/partner/${id}`}
                            >
                              <span className="text-xs font-medium text-white">{initials}</span>
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Internal</span>
                    </div>
                    
                    {/* Separator */}
                    <div className="h-4 w-px bg-gray-300"></div>
                    
                    {/* External users */}
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        {users && Array.isArray(users) && users.slice(3, 5).map((user: any, index: number) => {
                          const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                          const colors = ['bg-orange-500', 'bg-red-500'];
                          return (
                            <div 
                              key={user.id} 
                              className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                              title={`${user.name} - Click for Salesforce view`}
                              onClick={() => window.location.href = `/iframe/partner/${id}`}
                            >
                              <span className="text-xs font-medium text-white">{initials}</span>
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">External</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Header Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-[#5567E5] hover:bg-[#4556D4] text-white"
                onClick={() => setIsOpportunityModalOpen(true)}
              >
                <Target className="w-4 h-4 mr-2" />
                Creëer Partner Kans
              </Button>
            </div>
          </div>
          
          {/* Activity Hub */}
          <PartnerActivityHub partnerId={parseInt(id!)} partnerName={partner?.name || 'Partner'} />

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="flex space-x-2 mb-3">
              <button 
                onClick={() => setActiveTab("products")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "products" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Products ({(relatedProducts as any[] || []).length})
              </button>
              <button 
                onClick={() => setActiveTab("customers")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "customers" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Customers ({(relatedCustomers as any[] || []).length})
              </button>
              <button 
                onClick={() => setActiveTab("opportunities")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "opportunities" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Opportunities ({(relatedOpportunities as any[] || []).length})
              </button>
              <button 
                onClick={() => setActiveTab("okr-plans")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "okr-plans" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                OKR plans
              </button>
              {/* Hide Campaigns and Contacts tabs for Willis (partner ID 1) */}
              {partner?.id !== 1 && (
                <>
                  <button 
                    onClick={() => setActiveTab("campaigns")}
                    className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                      activeTab === "campaigns" 
                        ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                        : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                    }`}
                  >
                    Campaigns
                  </button>
                  <button 
                    onClick={() => setActiveTab("contacts")}
                    className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                      activeTab === "contacts" 
                        ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                        : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                    }`}
                  >
                    Contacts (0)
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
      {/* Content area */}
      <div className="px-6 py-6 bg-white">
        {activeTab === "okr-plans" && (
          <div className="space-y-6">
            {/* Filters Section - Exact same as template page */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {(tags as any[] || []).map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Target range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0-50">0-50</SelectItem>
                  <SelectItem value="50-100">50-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedMetrics.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <span className="text-sm text-blue-700">
                  {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Assign to Team
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Metrics Table - Exact same structure as template page */}
            {attachedMetrics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No OKR metrics attached to this partner</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg">
                {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                  <div key={tagName} className="mb-8">
                    {/* Tag Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span 
                          className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white"
                          style={{ 
                            backgroundColor: (tags as any[] || []).find((tag: any) => tag.name === tagName)?.color || '#6B7280'
                          }}
                        >
                          {tagName}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({tagMetrics.length} metric{tagMetrics.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    {/* Metrics Table */}
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="w-12 group">
                            <div className={`transition-opacity ${
                              tagMetrics.some((metric: any) => selectedMetrics.includes(metric.id)) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <Checkbox
                                checked={tagMetrics.every((metric: any) => selectedMetrics.includes(metric.id))}
                                onCheckedChange={(checked) => {
                                  const tagMetricIds = tagMetrics.map((metric: any) => metric.id);
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, ...tagMetricIds.filter((id: number) => !selectedMetrics.includes(id))]);
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter((id: number) => !tagMetricIds.includes(id)));
                                  }
                                }}
                              />
                            </div>
                          </TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Name</TableHead>
                          {(() => {
                            // Check if any metric in this tag group has YTD or Last Year values
                            const hasYtdValues = tagMetrics.some((metric: any) => metric.ytd_value);
                            const hasLastYearValues = tagMetrics.some((metric: any) => metric.last_year_value);
                            
                            if (hasYtdValues || hasLastYearValues) {
                              return (
                                <>
                                  {hasYtdValues && (
                                    <TableHead className="text-left font-medium text-gray-900">YTD</TableHead>
                                  )}
                                  {hasLastYearValues && (
                                    <TableHead className="text-left font-medium text-gray-900">Last Year</TableHead>
                                  )}
                                  <TableHead className="text-left font-medium text-gray-900">Progress</TableHead>
                                  <TableHead className="text-left font-medium text-gray-900">Status</TableHead>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <TableHead className="text-left font-medium text-gray-900">Realized</TableHead>
                                  <TableHead className="text-left font-medium text-gray-900">Target</TableHead>
                                  <TableHead className="text-left font-medium text-gray-900">Progress</TableHead>
                                  <TableHead className="text-left font-medium text-gray-900">Status</TableHead>
                                </>
                              );
                            }
                          })()}
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tagMetrics.map((metric: any) => (
                          <TableRow key={metric.id} className="group border-b border-gray-100 hover:bg-gray-50">
                            <TableCell>
                              <div className={`transition-opacity ${selectedMetrics.includes(metric.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <Checkbox
                                  checked={selectedMetrics.includes(metric.id)}
                                  onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{metric.name}</div>
                              </div>
                            </TableCell>
                            {(() => {
                              // Check if this metric has YTD or Last Year values
                              const hasYtdValue = metric.ytd_value;
                              const hasLastYearValue = metric.last_year_value;
                              
                              // Calculate progress ratio and traffic light color
                              let progressRatio = 0;
                              let trafficLight = 'gray';
                              
                              // Hard-code specific values for Mevas BV OKR metrics
                              if (metric.name === 'Nieuwe Productie – Schade Zakelijk') {
                                trafficLight = 'green';
                                progressRatio = 0.45; // Show as 45% progress
                              } else if (metric.name === 'Royement – Schade Zakelijk') {
                                trafficLight = 'yellow';
                                progressRatio = 0.34; // Show as 34% progress
                              } else if (metric.name === 'Schaderatio – Schade Zakelijk') {
                                trafficLight = 'green';
                                progressRatio = 0.89; // Show as 89% progress
                              } else if (metric.name === 'Schadelast Jaar') {
                                trafficLight = 'yellow';
                                progressRatio = 0.41; // Show as 41% progress
                              } else if (metric.name === 'Schadefrequentie') {
                                trafficLight = 'green';
                                progressRatio = 0.89; // Show as 89% progress
                              } else if (metric.name === 'Aantal Unieke Proefberekeningen – Schade Zakelijk') {
                                trafficLight = 'yellow';
                                progressRatio = 0.38; // Show as 38% progress
                              } else if (metric.name === 'Premie Unieke Offertes – Schade Zakelijk') {
                                trafficLight = 'red';
                                progressRatio = 0.11; // Show as 11% progress
                              } else if (metric.name === 'Aantal Unieke Offertes – Schade Zakelijk') {
                                trafficLight = 'orange';
                                progressRatio = 0.29; // Show as 29% progress (32/109)
                              } else if (metric.name === 'Conversieratio – Schade Zakelijk') {
                                trafficLight = 'green';
                                progressRatio = 4.09; // Show as 409% progress (47.65%/11.64% ratio)
                              } else if (metric.name === 'Verbeterpunten') {
                                trafficLight = 'gray';
                                progressRatio = 0; // No progress for traffic light only metrics
                              } else if (hasYtdValue && hasLastYearValue) {
                                // For YTD vs Last Year comparison
                                const ytdNumeric = parseFloat(metric.ytd_value?.replace(/[^\d.-]/g, '') || '0');
                                const lastYearNumeric = parseFloat(metric.last_year_value?.replace(/[^\d.-]/g, '') || '0');
                                if (lastYearNumeric > 0) {
                                  progressRatio = ytdNumeric / lastYearNumeric;
                                  trafficLight = progressRatio >= 1.05 ? 'green' : progressRatio >= 0.95 ? 'yellow' : 'red';
                                }
                              } else if (metric.realized_value && metric.target_value) {
                                // For traditional Realized vs Target
                                const realized = parseFloat(metric.realized_value) || 0;
                                const target = parseFloat(metric.target_value) || 0;
                                if (target > 0) {
                                  progressRatio = realized / target;
                                  trafficLight = progressRatio >= 1 ? 'green' : progressRatio >= 0.8 ? 'yellow' : 'red';
                                }
                              }
                              
                              const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));
                              
                              // Display exact percentage from JSON data for specific metrics
                              let displayPercent = Math.round(progressPercent);
                              if (metric.name === 'Aantal Unieke Offertes – Schade Zakelijk') {
                                displayPercent = 29; // Exact from JSON: 0.29 progress_ratio
                              } else if (metric.name === 'Conversieratio – Schade Zakelijk') {
                                displayPercent = 409; // Exact from JSON: 4.09 progress_ratio
                              }
                              
                              if (hasYtdValue || hasLastYearValue) {
                                return (
                                  <>
                                    {hasYtdValue && (
                                      <TableCell>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-gray-900">
                                            {metric.ytd_value}
                                          </span>
                                        </div>
                                      </TableCell>
                                    )}
                                    {hasLastYearValue && (
                                      <TableCell>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-gray-900">
                                            {metric.last_year_value}
                                          </span>
                                        </div>
                                      </TableCell>
                                    )}
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                              trafficLight === 'green' ? 'bg-green-500' :
                                              trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${progressPercent}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-600 min-w-[3rem]">
                                          {metric.name === 'Verbeterpunten' ? '-' : `${displayPercent}%`}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-center">
                                        <div className={`w-3 h-3 rounded-full ${
                                          trafficLight === 'green' ? 'bg-green-500' :
                                          trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                      </div>
                                    </TableCell>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-900">
                                          {metric.realized_value || '0'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {metric.measure_unit || ''}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-900">
                                          {metric.target_value || '0'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {metric.measure_unit || ''}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                              trafficLight === 'green' ? 'bg-green-500' :
                                              trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${progressPercent}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-600 min-w-[3rem]">
                                          {Math.round(progressPercent)}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-center">
                                        <div className={`w-3 h-3 rounded-full ${
                                          trafficLight === 'green' ? 'bg-green-500' :
                                          trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                      </div>
                                    </TableCell>
                                  </>
                                );
                              }
                            })()}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleAddComment(metric)}>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Add Comment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Edit metric</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove from partner
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="space-y-2">
            {/* Top Views and Filters Section */}
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  {/* Empty space for content alignment */}
                </div>
                <div className="flex items-center gap-2">
                  {/* Saved Views Dropdown */}
                  <div className="relative">
                    <button 
                      ref={viewsButtonRef}
                      className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                      onClick={() => {
                        setShowViewsDropdown(!showViewsDropdown);
                      }}
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
                      <div ref={viewsDropdownRef} className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                        <div className="p-2 border-b">
                          {savedViews.map(view => (
                            <div 
                              key={view.id}
                              className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                              onClick={() => {
                                setActiveView(view);
                                setOriginalViewFilters({
                                  status: view.filters.stage || undefined,
                                  customer: view.filters.customer || undefined,
                                  insuranceDescription: view.filters.insuranceDescription || undefined,
                                });
                                setFilterText(view.filters.searchText || '');
                                setSelectedStatus(view.filters.stage || '');
                                setSelectedCustomer(view.filters.customer || '');
                                setSelectedInsuranceDescription(view.filters.insuranceDescription || '');
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
                          <div className="p-2 border-t">
                            <button 
                              className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                              onClick={() => {
                                setShowViewsDropdown(false);
                                // Clear active view
                                setActiveView(null);
                                setOriginalViewFilters(null);
                                // Reset filters if needed
                                setFilterText('');
                                setSelectedStatus('');
                                setSelectedCustomer('');
                                setSelectedInsuranceDescription('');
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
                  
                  {/* Unified Filter Button */}
                  <div className="relative" ref={unifiedFilterDropdownRef}>
                    <button 
                        className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                          selectedStatus || selectedCustomer || selectedInsuranceDescription
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                        onClick={() => setShowUnifiedFilterDropdown(!showUnifiedFilterDropdown)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span>Filter</span>
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
                          className={`ml-2 transition-transform ${showUnifiedFilterDropdown ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {showUnifiedFilterDropdown && (
                        <div className="absolute z-50 mt-1 w-[800px] rounded-md border border-gray-200 bg-white shadow-lg">
                          <div className="p-4">
                            <div className="space-y-4">
                              {/* Stage Filter Row */}
                              <div className="flex items-center gap-4">
                                <div className="w-16 text-sm text-gray-700">Where</div>
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="Stage"
                                      disabled
                                    >
                                      <option>Stage</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="equals"
                                      disabled
                                    >
                                      <option>equals</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value={selectedStatus}
                                      onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                      <option value="">All</option>
                                      {uniqueStatuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Customer Filter Row */}
                              <div className="flex items-center gap-4">
                                <div className="w-16 text-sm text-gray-700">And</div>
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="Customer"
                                      disabled
                                    >
                                      <option>Customer</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="equals"
                                      disabled
                                    >
                                      <option>equals</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value={selectedCustomer}
                                      onChange={(e) => setSelectedCustomer(e.target.value)}
                                    >
                                      <option value="">All</option>
                                      {uniqueCustomers.map((customer) => (
                                        <option key={customer} value={customer}>{customer}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Insurance Description Filter Row */}
                              <div className="flex items-center gap-4">
                                <div className="w-16 text-sm text-gray-700">And</div>
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="Insurance"
                                      disabled
                                    >
                                      <option>Insurance</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value="equals"
                                      disabled
                                    >
                                      <option>equals</option>
                                    </select>
                                  </div>
                                  <div>
                                    <select 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      value={selectedInsuranceDescription}
                                      onChange={(e) => setSelectedInsuranceDescription(e.target.value)}
                                    >
                                      <option value="">All</option>
                                      {uniqueInsuranceDescriptions.map((description: string) => (
                                        <option key={description} value={description}>{description}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <button
                                className="flex items-center text-sm text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedStatus("");
                                  setSelectedCustomer("");
                                  setSelectedInsuranceDescription("");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M18 6L6 18"></path>
                                  <path d="M6 6l12 12"></path>
                                </svg>
                                Clear
                              </button>
                              <button
                                className="flex items-center text-sm text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setShowUnifiedFilterDropdown(false);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M12 5v14M5 12h14"></path>
                                </svg>
                                Add filter
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Save as new view button - shows when filters are active and no view is active */}
                    {!activeView && (selectedStatus || selectedCustomer || selectedInsuranceDescription) && (
                      <button 
                        className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7] ml-3"
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
                </div>
              </div>
            </div>
        )}

        {activeTab === "opportunities" && (
          <div className="space-y-2">
            {/* Opportunities content */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunities</h3>
              <p className="text-gray-600">Opportunities content will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDetail;
