import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, Users, Trash2, MoreHorizontal, MessageSquare, ArrowLeft, Plus, Mail, Calendar, Clock, Play, Pause, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { ShareModal } from "@/components/ShareModal";
import { apiRequest } from "@/lib/queryClient";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import PartnerCampaignsView from "@/components/campaigns/PartnerCampaignsView";

export default function PartnerDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location, setLocation] = useLocation();
  
  // Detect if we're in broker view
  const isBrokerView = location.startsWith('/broker-view');
  
  // Check URL parameters for tab selection
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "opportunities");
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedMetricForComment, setSelectedMetricForComment] = useState<any>(null);
  const [visibleToPartner, setVisibleToPartner] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");

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
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showInsuranceDescDropdown, setShowInsuranceDescDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  
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
  const [isEditingList, setIsEditingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  const [isSavingList, setIsSavingList] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const insuranceDescDropdownRef = useRef<HTMLDivElement>(null);
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

  // Fetch related products for this partner
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/products`],
    enabled: !!id,
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
  const [activeView, setActiveView] = useState<any>(null);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [originalViewFilters, setOriginalViewFilters] = useState<any>(null);
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

  // Mutation for updating list members (edit list functionality)
  const editListMutation = useMutation({
    mutationFn: async ({ listId, members }: { listId: number, members: number[] }) => {
      try {
        // Include the existing list data to preserve other fields
        const updateData = {
          name: activeList?.name,
          description: activeList?.description,
          members,
          filters: activeList?.filters || {},
          is_shared: activeList?.is_shared || false
        };
        console.log('Sending edit list request:', { listId, updateData });
        
        // Make the API request with environment header
        const envUrl = `/api/saved-lists/${listId}`;
        const currentEnv = window.__APP_ENV__ || localStorage.getItem('selectedEnvironment') || 'myqollabi';
        const finalUrl = currentEnv !== 'myqollabi' ? envUrl.replace('/api/', `/api/${currentEnv}/`) : envUrl;
        
        const response = await fetch(finalUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': currentEnv,
            'x-environment-id': currentEnv
          },
          body: JSON.stringify(updateData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Edit list response:', result);
        return result;
      } catch (error) {
        console.error('Edit list request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Edit list response:', data);
      // Invalidate both environment-specific and generic queries
      const currentEnv = window.__APP_ENV__ || localStorage.getItem('selectedEnvironment') || 'myqollabi';
      
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] });
      
      // Environment-specific invalidations
      if (currentEnv !== 'myqollabi') {
        queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/saved-lists`] });
        queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/saved-lists`, 'opportunities', 'partner', id] });
      }
      
      toast({
        title: "List updated",
        description: "Your changes to the list have been saved.",
      });
      
      // Only update activeList if we're editing the currently active list
      if (editingListId === activeList?.id) {
        setActiveList(data);
      }
      
      // Reset editing state completely
      setIsEditingList(false);
      setEditingListId(null);
      setEditedListMembers([]);
      setIsSavingList(false);
      setRenderKey(prev => prev + 1);
      console.log('=== MUTATION SUCCESS COMPLETE ===');
    },
    onError: (error) => {
      console.error('Edit list mutation error:', error);
      toast({
        title: "Error updating list",
        description: `Failed to update the list: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      setIsSavingList(false);
    }
  });

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
  
  // Initialize edit mode when a list is selected
  useEffect(() => {
    if (activeFilterList && isEditingList) {
      setEditedListMembers(activeFilterList.members || []);
    }
  }, [activeFilterList, isEditingList]);

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
    if (activeFilterList && !isEditingList) {
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
    if (isEditingList) {
      // In edit mode, update the edited list members
      setEditedListMembers(prev => 
        prev.includes(opportunityId) 
          ? prev.filter(id => id !== opportunityId)
          : [...prev, opportunityId]
      );
    } else {
      // Normal selection mode
      setSelectedOpportunities(prev => 
        prev.includes(opportunityId) 
          ? prev.filter(id => id !== opportunityId)
          : [...prev, opportunityId]
      );
    }
  };

  // Helper function to check if an opportunity is selected
  const isOpportunitySelected = (opportunityId: number) => {
    if (isEditingList) {
      return editedListMembers.includes(opportunityId);
    }
    return selectedOpportunities.includes(opportunityId);
  };

  const toggleSelectAll = () => {
    if (isEditingList) {
      // In edit mode, toggle all opportunities in/out of the list
      if (editedListMembers.length === filteredOpportunities.length && filteredOpportunities.length > 0) {
        setEditedListMembers([]);
      } else {
        setEditedListMembers(filteredOpportunities.map(opp => opp.id));
      }
    } else {
      // Normal selection mode
      if (selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0) {
        setSelectedOpportunities([]);
      } else {
        setSelectedOpportunities(filteredOpportunities.map(opp => opp.id));
      }
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
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="p-2 group hover:bg-[#F5F6FE]">
                  <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
                </Button>
              </Link>
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
                    <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">{partner.owner_name || 'Not assigned'}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          


          {/* Activity Hub */}
          <PartnerActivityHub partnerId={parseInt(id!)} partnerName={partner?.name || 'Partner'} />

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="flex space-x-2 mb-3">
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
                onClick={() => setActiveTab("product-dashboard")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "product-dashboard" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Product dashboard
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
            </nav>
          </div>
        </div>
      </div>
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
          <div className="space-y-4">
            {/* Enhanced unified toolbar - same as OpportunitiesPage */}
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
                    {/* Saved Lists dropdown - functional implementation */}
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                        onClick={() => setShowListsDropdown(!showListsDropdown)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                          <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                        </svg>
                        <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                          {activeList ? activeList.name : 'All opportunities'}
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
                      
                      {/* Dropdown menu */}
                      {showListsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="p-2">
                            {/* Default "All opportunities" option */}
                            <button
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                !activeList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                              }`}
                              onClick={() => {
                                setActiveList(null);
                                setShowListsDropdown(false);
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <span>All opportunities</span>
                              </div>
                            </button>
                            
                            {/* Partner-relevant saved lists */}
                            {partnerRelevantLists.length > 0 && (
                              <div className="border-t border-gray-100 my-2 pt-2">
                                {partnerRelevantLists.map((list: any) => (
                                  <div
                                    key={list.id}
                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                      activeList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                    }`}
                                  >
                                    <button
                                      className="flex-1 text-left"
                                      onClick={() => {
                                        setActiveList(list);
                                        setShowListsDropdown(false);
                                      }}
                                    >
                                      <div className="flex flex-col space-y-1">
                                        <span>{list.name}</span>
                                        {/* Show share icon and environment name if list is shared */}
                                        {list.is_shared && (
                                          <div className="flex items-center space-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                              <circle cx="18" cy="5" r="3"></circle>
                                              <circle cx="6" cy="12" r="3"></circle>
                                              <circle cx="18" cy="19" r="3"></circle>
                                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                            </svg>
                                            <span className="text-xs text-gray-500">Shared by Baloise</span>
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                    
                                    {/* Three dots menu for broker view */}
                                    <div className="relative">
                                      <button
                                        className="p-1 hover:bg-gray-200 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownId(activeDropdownId === list.id ? null : list.id);
                                        }}
                                      >
                                        <MoreHorizontal className="w-3 h-3" />
                                      </button>
                                      
                                      {/* Dropdown menu */}
                                      {activeDropdownId === list.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-md z-50">
                                          <div className="p-1">
                                            <button
                                              className="flex w-full items-center px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 text-left"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Opening broker view for list:', list.id);
                                                // Redirect to the connected partner's detail page (Baloise = partner ID 1) with the list opened
                                                const connectedPartnerId = 1; // Baloise is the connected partner
                                                window.open(`/broker-view/partner/${connectedPartnerId}?tab=opportunities&list=${list.id}`, '_blank');
                                                setActiveDropdownId(null);
                                              }}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                                <polyline points="10 17 15 12 10 7"></polyline>
                                                <line x1="15" y1="12" x2="3" y2="12"></line>
                                              </svg>
                                              Open list as partner
                                            </button>
                                            
                                            {/* Delete list option */}
                                            <button
                                              className="flex w-full items-center px-2 py-1.5 text-sm rounded-sm hover:bg-red-50 text-red-600 text-left"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setListToDelete(list);
                                                setShowDeleteListModal(true);
                                                setActiveDropdownId(null);
                                              }}
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete list
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right-side action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Show Share and Add to Campaign only for user-created lists */}
                    {activeList && (
                      <>
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
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600"
                          onClick={() => {
                            alert('This list can be added to a campaign in the Campaigns section');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M22 2 11 13" />
                            <path d="M22 2 15 22 11 13 2 9 22 2z" />
                          </svg>
                          Add to Campaign
                        </Button>
                      </>
                    )}

                    {/* Edit list button - only shown for non-default lists */}
                    {activeList && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`text-indigo-600 ${isEditingList ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (isEditingList) {
                              // Cancel edit mode
                              setIsEditingList(false);
                              setEditingListId(null);
                              setEditedListMembers([]);
                            } else {
                              // Enter edit mode - use fresh list data
                              const freshList = activeFilterList || activeList;
                              console.log('Entering edit mode with fresh list:', freshList);
                              setIsEditingList(true);
                              setEditingListId(freshList?.id || null);
                              setEditedListMembers(freshList?.members || []);
                            }
                          }}
                          disabled={isSavingList}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          {isEditingList ? 'Cancel' : 'Edit list'}
                        </Button>
                        
                        {/* Save button - only visible in edit mode */}
                        {isEditingList && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                              if (editingListId) {
                                setIsSavingList(true);
                                editListMutation.mutate({
                                  listId: editingListId,
                                  members: editedListMembers
                                });
                              }
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
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                  <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save changes
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}

                    {/* Export and New buttons are now hidden from Partner Details page */}
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
                    
                    {/* Filter buttons next to the views dropdown */}
                    <div className="flex items-center gap-2 ml-3">
                      {/* Stage Filter Dropdown */}
                      <div className="relative" ref={statusDropdownRef}>
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedStatus 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedStatus ? `Stage: ${selectedStatus}` : 'Stage'}</span>
                          {selectedStatus && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStatus("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showStatusDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedStatus && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedStatus("");
                                    setShowStatusDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {uniqueStatuses.map((status) => (
                                <button
                                  key={status}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedStatus === status 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedStatus(status);
                                    setShowStatusDropdown(false);
                                  }}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Customer Filter Dropdown */}
                      <div className="relative" ref={customerDropdownRef}>
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedCustomer 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedCustomer ? `Customer: ${selectedCustomer}` : 'Customer'}</span>
                          {selectedCustomer && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showCustomerDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedCustomer && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedCustomer("");
                                    setShowCustomerDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {uniqueCustomers.map((customer) => (
                                <button
                                  key={customer}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedCustomer === customer 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setShowCustomerDropdown(false);
                                  }}
                                >
                                  {customer}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      

                      {/* Insurance Description Filter Dropdown */}
                      <div className="relative" ref={insuranceDescDropdownRef}>
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedInsuranceDescription 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowInsuranceDescDropdown(!showInsuranceDescDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedInsuranceDescription ? `Insurance: ${selectedInsuranceDescription.substring(0, 20)}...` : 'Insurance Description'}</span>
                          {selectedInsuranceDescription && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInsuranceDescription("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showInsuranceDescDropdown && (
                          <div className="absolute z-50 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedInsuranceDescription && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedInsuranceDescription("");
                                    setShowInsuranceDescDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {uniqueInsuranceDescriptions.map((description: string) => (
                                <button
                                  key={description}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedInsuranceDescription === description 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedInsuranceDescription(description);
                                    setShowInsuranceDescDropdown(false);
                                  }}
                                >
                                  {description}
                                </button>
                              ))}
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
            </div>

            {/* Bulk actions bar - only visible when opportunities are selected or editing list */}
            {(selectedOpportunities.length > 0 || (isEditingList && editedListMembers.length > 0)) && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center">
                  {isEditingList ? (
                    <span className="text-indigo-700 font-medium mr-2">
                      {editedListMembers.length} {editedListMembers.length === 1 ? 'opportunity' : 'opportunities'} in list
                    </span>
                  ) : (
                    <span className="text-indigo-700 font-medium mr-2">
                      {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => {
                      if (isEditingList) {
                        setEditedListMembers([]);
                      } else {
                        setSelectedOpportunities([]);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    {isEditingList ? 'Clear list' : 'Clear selection'}
                  </Button>
                </div>
                
                {/* Show regular actions only when not in edit mode */}
                {!isEditingList && (
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
                      Add to list
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Statistics overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="text-xl font-semibold text-[#282A3F]">{filteredOpportunities.length}</div>
                <div className="text-sm text-gray-500">Total Opportunities</div>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="text-xl font-semibold text-[#282A3F]">
                  €{filteredOpportunities.reduce((sum: number, opp: any) => sum + (Number(opp.estimated_value) || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Value Opportunities</div>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="text-xl font-semibold text-[#282A3F]">
                  €{Math.round(filteredOpportunities.reduce((sum: number, opp: any) => {
                    const value = Number(opp.estimated_value) || 0;
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
                  }, 0)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
              </div>
            </div>

            {/* Opportunities Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 group">
                      <div className={`transition-opacity ${
                        (isEditingList ? editedListMembers.length > 0 : selectedOpportunities.length > 0) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Checkbox 
                          checked={
                            isEditingList 
                              ? editedListMembers.length === filteredOpportunities.length && filteredOpportunities.length > 0
                              : selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </div>
                    </TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Related contacts</TableHead>

                    <TableHead>Start Date</TableHead>
                    <TableHead>Insurance Description</TableHead>
                    <TableHead className="w-[180px]">Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Close Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity: any) => (
                    <TableRow key={opportunity.id} className="group hover:bg-gray-50">
                      <TableCell>
                        <div className={`transition-opacity ${
                          isOpportunitySelected(opportunity.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <Checkbox 
                            checked={isOpportunitySelected(opportunity.id)}
                            onCheckedChange={() => toggleSelectOpportunity(opportunity.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/lists/opportunities/${opportunity.id}`}
                          onClick={() => {
                            // Store the current partner detail page as the referrer for smart back navigation
                            sessionStorage.setItem('opportunityReferrer', window.location.pathname);
                          }}
                        >
                          <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                            {opportunity.title}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">
                          {opportunity.clientName || 'Unknown Customer'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">
                          {opportunity.contactCount || 0}
                        </span>
                      </TableCell>

                      <TableCell>
                        {opportunity.start_date ? new Date(opportunity.start_date).toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">
                          {opportunity.insurance_description || 'No description'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          {editingStageId === opportunity.id ? (
                            <div 
                              ref={(el) => setStageDropdownRef(el)}
                              className="relative"
                            >
                              <div className="absolute top-0 left-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg min-w-[150px]">
                                {OPPORTUNITY_STAGES.map((stage) => (
                                  <button
                                    key={stage}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                                      stage === opportunity.stage ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                                    onClick={() => {
                                      if (stage !== opportunity.stage) {
                                        updateOpportunityStage.mutate({
                                          opportunityId: opportunity.id,
                                          stage: stage
                                        });
                                      } else {
                                        setEditingStageId(null);
                                      }
                                    }}
                                  >
                                    {stage}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <button
                              className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                              onClick={() => setEditingStageId(opportunity.id)}
                            >
                              {opportunity.stage}
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        €{opportunity.estimated_value ? Number(opportunity.estimated_value).toLocaleString() : '0'}
                      </TableCell>
                      <TableCell>
                        {opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'Not set'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-4">
            {/* Enhanced unified toolbar for customers */}
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
                    {/* Saved Lists dropdown */}
                    <div className="relative">
                      <button 
                        className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                        onClick={() => setShowCustomerListsDropdown(!showCustomerListsDropdown)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                          <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                        </svg>
                        <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                          {activeCustomerList ? activeCustomerList.name : 'All customers'}
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
                          className={`transition-transform ${showCustomerListsDropdown ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {/* Dropdown menu */}
                      {showCustomerListsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="p-2">
                            {/* Default "All customers" option */}
                            <button
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                !activeCustomerList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                              }`}
                              onClick={() => {
                                setActiveCustomerList(null);
                                setShowCustomerListsDropdown(false);
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <span>All customers ({(relatedCustomers as any[] || []).length})</span>
                              </div>
                            </button>
                            
                            {/* Customer saved lists */}
                            {(customerSavedLists as any[] || []).length > 0 && (
                              <div className="border-t border-gray-100 my-2 pt-2">
                                {(customerSavedLists as any[] || []).map((list: any) => (
                                  <div
                                    key={list.id}
                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                      activeCustomerList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                    }`}
                                  >
                                    <button
                                      className="flex-1 text-left"
                                      onClick={() => {
                                        setActiveCustomerList(list);
                                        setShowCustomerListsDropdown(false);
                                      }}
                                    >
                                      <div className="flex flex-col space-y-1">
                                        <span>{list.name}</span>
                                        {/* Show share icon if list is shared */}
                                        {list.is_shared && (
                                          <div className="flex items-center space-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                              <circle cx="18" cy="5" r="3"></circle>
                                              <circle cx="6" cy="12" r="3"></circle>
                                              <circle cx="18" cy="19" r="3"></circle>
                                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                            </svg>
                                            <span className="text-xs text-gray-500">Shared list</span>
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right-side action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Show Share button only for active lists */}
                    {activeCustomerList && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600"
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
                      onClick={() => {/* Handle new customer creation */}}
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
                        placeholder="Search customers..."
                        value={customerSearchText}
                        onChange={(e) => setCustomerSearchText(e.target.value)}
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
                        className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => setShowCustomerViewsDropdown(!showCustomerViewsDropdown)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-gray-700">{activeCustomerView ? activeCustomerView.name : "Select a view"}</span>
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
                          className={`transition-transform ${showCustomerViewsDropdown ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {/* Saved Views dropdown menu */}
                      {showCustomerViewsDropdown && (
                        <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                          <div className="p-2 border-b">
                            {(customerSavedViews as any[] || []).map((view: any) => (
                              <div 
                                key={view.id}
                                className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeCustomerView?.id === view.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                                onClick={() => {
                                  setActiveCustomerView(view);
                                  setCustomerSearchText(view.filters?.searchText || '');
                                  setSelectedCustomerStatus(view.filters?.status || '');
                                  setSelectedIndustry(view.filters?.industry || '');
                                  setShowCustomerViewsDropdown(false);
                                }}
                              >
                                <div className="flex items-center">
                                  {view.name}
                                </div>
                                {activeCustomerView?.id === view.id && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                          {activeCustomerView && (
                            <div className="p-2 border-t">
                              <button 
                                className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                                onClick={() => {
                                  setShowCustomerViewsDropdown(false);
                                  setActiveCustomerView(null);
                                  setCustomerSearchText('');
                                  setSelectedCustomerStatus('');
                                  setSelectedIndustry('');
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
                      {/* Status Filter Dropdown */}
                      <div className="relative">
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedCustomerStatus 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowCustomerStatusDropdown(!showCustomerStatusDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedCustomerStatus ? `Status: ${selectedCustomerStatus}` : 'Status'}</span>
                          {selectedCustomerStatus && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerStatus("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showCustomerStatusDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedCustomerStatus && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedCustomerStatus("");
                                    setShowCustomerStatusDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {uniqueCustomerStatuses.map((status) => (
                                <button
                                  key={status}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedCustomerStatus === status 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedCustomerStatus(status);
                                    setShowCustomerStatusDropdown(false);
                                  }}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Industry Filter Dropdown */}
                      <div className="relative">
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedIndustry 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedIndustry ? `Industry: ${selectedIndustry}` : 'Industry'}</span>
                          {selectedIndustry && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIndustry("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showIndustryDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedIndustry && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedIndustry("");
                                    setShowIndustryDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {uniqueIndustries.map((industry) => (
                                <button
                                  key={industry}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedIndustry === industry 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedIndustry(industry);
                                    setShowIndustryDropdown(false);
                                  }}
                                >
                                  {industry}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk actions bar for customers - only visible when customers are selected */}
            {selectedCustomers.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-indigo-700 font-medium mr-2">
                    {selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => setSelectedCustomers([])}
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
                    onClick={() => {
                      // Handle add to customer list functionality
                      console.log('Add selected customers to list:', selectedCustomers);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Add to list
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-indigo-600"
                    onClick={() => {
                      // Handle export selected customers functionality
                      console.log('Export selected customers:', selectedCustomers);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export selected
                  </Button>
                </div>
              </div>
            )}

            {/* Statistics Overview - matching Customers page design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                // Get filtered customers based on current filters
                const filteredCustomers = (relatedCustomers as any[] || []).filter((customer: any) => {
                  const matchesSearch = !customerSearchText || 
                    customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                    customer.contact_name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                    customer.contact_email?.toLowerCase().includes(customerSearchText.toLowerCase());
                  
                  const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                  const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                  
                  return matchesSearch && matchesStatus && matchesIndustry;
                });

                // Calculate statistics
                const totalOpportunities = filteredCustomers.reduce((total, customer) => {
                  const customerOpportunities = (relatedOpportunities as any[] || []).filter((o: any) => o.clientName === customer.name);
                  return total + customerOpportunities.length;
                }, 0);

                const totalValue = filteredCustomers.reduce((total, customer) => {
                  const customerOpportunities = (relatedOpportunities as any[] || []).filter((o: any) => o.clientName === customer.name);
                  return total + customerOpportunities.reduce((oppTotal: number, opp: any) => {
                    const value = Number(opp.estimated_value) || 0;
                    return oppTotal + value;
                  }, 0);
                }, 0);

                const weightedValue = filteredCustomers.reduce((total, customer) => {
                  const customerOpportunities = (relatedOpportunities as any[] || []).filter((o: any) => o.clientName === customer.name);
                  return total + customerOpportunities.reduce((oppTotal: number, opp: any) => {
                    const value = Number(opp.estimated_value) || 0;
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
                    return oppTotal + (value * probability);
                  }, 0);
                }, 0);

                return (
                  <>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="text-xl font-semibold text-[#282A3F]">{filteredCustomers.length}</div>
                      <div className="text-sm text-gray-500">Total Customers</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="text-xl font-semibold text-[#282A3F]">{totalOpportunities}</div>
                      <div className="text-sm text-gray-500">Total Opportunities</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="text-xl font-semibold text-[#282A3F]">€{totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="text-xl font-semibold text-[#282A3F]">€{Math.round(weightedValue).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Weighted Value</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Customers Table - Enhanced version matching opportunities tab */}
            <div className="bg-white rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 group">
                      <div className={`transition-opacity ${
                        selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Checkbox 
                          checked={
                            (() => {
                              const filteredCustomers = (relatedCustomers as any[] || []).filter((customer: any) => {
                                const matchesSearch = !customerSearchText || 
                                  customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                                  customer.contact_name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                                  customer.contact_email?.toLowerCase().includes(customerSearchText.toLowerCase());
                                const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                                const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                                return matchesSearch && matchesStatus && matchesIndustry;
                              });
                              return selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0;
                            })()
                          }
                          onCheckedChange={(checked) => {
                            const filteredCustomers = (relatedCustomers as any[] || []).filter((customer: any) => {
                              const matchesSearch = !customerSearchText || 
                                customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                                customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
                              const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                              const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                              return matchesSearch && matchesStatus && matchesIndustry;
                            });
                            if (checked) {
                              setSelectedCustomers(filteredCustomers.map((c: any) => c.id));
                            } else {
                              setSelectedCustomers([]);
                            }
                          }}
                        />
                      </div>
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opportunities</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(relatedCustomers as any[] || [])
                    .filter((customer: any) => {
                      const matchesSearch = !customerSearchText || 
                        customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                        customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
                      const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                      const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                      return matchesSearch && matchesStatus && matchesIndustry;
                    })
                    .map((customer: any) => {
                      const customerOpportunities = (relatedOpportunities as any[] || []).filter((o: any) => o.clientName === customer.name);
                      const totalValue = customerOpportunities.reduce((sum: number, opp: any) => sum + (Number(opp.estimated_value) || 0), 0);
                      
                      return (
                        <TableRow key={customer.id} className="group hover:bg-gray-50">
                          <TableCell>
                            <div className={`transition-opacity ${
                              selectedCustomers.includes(customer.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <Checkbox 
                                checked={selectedCustomers.includes(customer.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCustomers([...selectedCustomers, customer.id]);
                                  } else {
                                    setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/lists/customers/${customer.id}`}
                              onClick={() => {
                                sessionStorage.setItem('customerReferrer', window.location.pathname);
                              }}
                            >
                              <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                                {customer.name}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-900">
                              {customer.industry || 'Not specified'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                              customer.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                              customer.status === 'Prospect' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.status || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                // Store navigation context for customer detail back navigation
                                sessionStorage.setItem('customerReferrer', `/lists/partners/${id}#customers`);
                                // Store the target tab in sessionStorage as well
                                sessionStorage.setItem('customerDetailTab', 'opportunities');
                                // Navigate programmatically 
                                setLocation(`/lists/customers/${customer.id}`);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer bg-transparent border-none p-0 font-normal"
                            >
                              {customerOpportunities.length}
                            </button>
                          </TableCell>
                          <TableCell>
                            €{totalValue ? Number(totalValue).toLocaleString() : '0'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <PartnerCampaignsView 
            partnerId={id || ''} 
            partnerName={partner?.name}
          />
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Enhanced unified toolbar - Products version */}
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
                    {/* Saved Lists dropdown */}
                    <div className="relative">
                      <button 
                        className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                        onClick={() => setShowProductListsDropdown(!showProductListsDropdown)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                          <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                        </svg>
                        <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                          {activeProductList ? activeProductList.name : 'All products'}
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
                          className={`transition-transform ${showProductListsDropdown ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {/* Dropdown menu */}
                      {showProductListsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="p-2">
                            {/* Default "All products" option */}
                            <button
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                !activeProductList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                              }`}
                              onClick={() => {
                                setActiveProductList(null);
                                setShowProductListsDropdown(false);
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <span>All products</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Export and New Product buttons are now hidden from Products tab */}
                </div>
                
                {/* Bottom row with search, views, and filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-grow">
                    {/* Search field */}
                    <div className="relative w-60">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchText}
                        onChange={(e) => setProductSearchText(e.target.value)}
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
                        className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => setShowProductViewsDropdown(!showProductViewsDropdown)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-gray-700">{activeProductView ? activeProductView.name : "Select a view"}</span>
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
                          className={`transition-transform ${showProductViewsDropdown ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {/* Saved Views dropdown menu */}
                      {showProductViewsDropdown && (
                        <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                          <div className="p-2 border-b">
                            <div className="p-2 text-sm text-slate-500">No saved views available</div>
                          </div>
                          <div className="p-2 border-t">
                            <button 
                              className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                              onClick={() => {
                                setShowProductViewsDropdown(false);
                                setActiveProductView(null);
                                setProductSearchText('');
                                setSelectedProductCategory('');
                                setSelectedPriceRange('');
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                              </svg>
                              Clear filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Filter buttons */}
                    <div className="flex items-center gap-2 ml-3">
                      {/* Category Filter Dropdown */}
                      <div className="relative">
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedProductCategory 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowProductCategoryDropdown(!showProductCategoryDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                          <span>{selectedProductCategory ? `Category: ${selectedProductCategory}` : 'Category'}</span>
                          {selectedProductCategory && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductCategory("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showProductCategoryDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedProductCategory && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedProductCategory("");
                                    setShowProductCategoryDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {['Property', 'Liability', 'Cyber', 'Auto', 'Workers Comp', 'Marine', 'Executive'].map((category) => (
                                <button
                                  key={category}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedProductCategory === category 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedProductCategory(category);
                                    setShowProductCategoryDropdown(false);
                                  }}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Price Range Filter Dropdown */}
                      <div className="relative">
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedPriceRange 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowPriceRangeDropdown(!showPriceRangeDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          <span>{selectedPriceRange ? `Price: ${selectedPriceRange}` : 'Price Range'}</span>
                          {selectedPriceRange && (
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
                              className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPriceRange("");
                              }}
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          )}
                        </button>
                        
                        {showPriceRangeDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedPriceRange && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedPriceRange("");
                                    setShowPriceRangeDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {['€0 - €50K', '€50K - €100K', '€100K - €150K', '€150K+'].map((range) => (
                                <button
                                  key={range}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedPriceRange === range 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedPriceRange(range);
                                    setShowPriceRangeDropdown(false);
                                  }}
                                >
                                  {range}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk actions bar for products - only visible when products are selected */}
            {selectedProducts.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-indigo-700 font-medium mr-2">
                    {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'} selected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => setSelectedProducts([])}
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
                    onClick={() => {
                      // Handle add to product list functionality
                      console.log('Add selected products to list:', selectedProducts);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Add to list
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-indigo-600"
                    onClick={() => {
                      // Handle export selected products functionality
                      console.log('Export selected products:', selectedProducts);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export selected
                  </Button>
                </div>
              </div>
            )}

            {/* Product Statistics Cards by Category */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                // Get filtered products based on current filters
                const filteredProducts = (relatedProducts as any[] || []).filter((product: any) => {
                  const matchesSearch = !productSearchText || 
                    product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                    product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                    product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                  
                  const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                  
                  const matchesPrice = !selectedPriceRange || (() => {
                    const price = parseFloat(product.price || '0');
                    switch(selectedPriceRange) {
                      case '€0 - €50K': return price >= 0 && price <= 50000;
                      case '€50K - €100K': return price > 50000 && price <= 100000;
                      case '€100K - €150K': return price > 100000 && price <= 150000;
                      case '€150K+': return price > 150000;
                      default: return true;
                    }
                  })();
                  
                  return matchesSearch && matchesCategory && matchesPrice;
                });

                // Group products by category and calculate statistics
                const categoryStats = filteredProducts.reduce((acc: any, product: any) => {
                  const category = product.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = {
                      count: 0,
                      totalValue: 0,
                      products: []
                    };
                  }
                  acc[category].count += 1;
                  acc[category].totalValue += parseFloat(product.price || '0');
                  acc[category].products.push(product);
                  return acc;
                }, {});

                // Get top 4 categories by product count
                const topCategories = Object.entries(categoryStats)
                  .sort(([,a]: any, [,b]: any) => b.count - a.count)
                  .slice(0, 4);

                return topCategories.map(([category, stats]: any) => (
                  <div key={category} className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="text-xl font-semibold text-[#282A3F]">{stats.count}</div>
                    <div className="text-sm text-gray-500">{category}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      €{stats.totalValue.toLocaleString()} total value
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Products Table Content */}
            <div className="space-y-6">
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Products ({
                      relatedProducts.filter((product: any) => {
                        const matchesSearch = !productSearchText || 
                          product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                          product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                        
                        const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                        
                        const matchesPrice = !selectedPriceRange || (() => {
                          const price = parseFloat(product.price || '0');
                          switch(selectedPriceRange) {
                            case '€0 - €50K': return price >= 0 && price <= 50000;
                            case '€50K - €100K': return price > 50000 && price <= 100000;
                            case '€100K - €150K': return price > 100000 && price <= 150000;
                            case '€150K+': return price > 150000;
                            default: return true;
                          }
                        })();
                        
                        return matchesSearch && matchesCategory && matchesPrice;
                      }).length
                    })</h3>
                    <p className="text-sm text-gray-600 mt-1">Products associated with this partner</p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 group">
                            <div className={`transition-opacity ${
                              selectedProducts.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <Checkbox 
                                checked={
                                  selectedProducts.length === relatedProducts.filter((product: any) => {
                                    const matchesSearch = !productSearchText || 
                                      product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                                    
                                    const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                                    
                                    const matchesPrice = !selectedPriceRange || (() => {
                                      const price = parseFloat(product.price || '0');
                                      switch(selectedPriceRange) {
                                        case '€0 - €50K': return price >= 0 && price <= 50000;
                                        case '€50K - €100K': return price > 50000 && price <= 100000;
                                        case '€100K - €150K': return price > 100000 && price <= 150000;
                                        case '€150K+': return price > 150000;
                                        default: return true;
                                      }
                                    })();
                                    
                                    return matchesSearch && matchesCategory && matchesPrice;
                                  }).length && relatedProducts.filter((product: any) => {
                                    const matchesSearch = !productSearchText || 
                                      product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                                    
                                    const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                                    
                                    const matchesPrice = !selectedPriceRange || (() => {
                                      const price = parseFloat(product.price || '0');
                                      switch(selectedPriceRange) {
                                        case '€0 - €50K': return price >= 0 && price <= 50000;
                                        case '€50K - €100K': return price > 50000 && price <= 100000;
                                        case '€100K - €150K': return price > 100000 && price <= 150000;
                                        case '€150K+': return price > 150000;
                                        default: return true;
                                      }
                                    })();
                                    
                                    return matchesSearch && matchesCategory && matchesPrice;
                                  }).length > 0
                                }
                                onCheckedChange={(checked) => {
                                  const filteredProducts = relatedProducts.filter((product: any) => {
                                    const matchesSearch = !productSearchText || 
                                      product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                      product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                                    
                                    const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                                    
                                    const matchesPrice = !selectedPriceRange || (() => {
                                      const price = parseFloat(product.price || '0');
                                      switch(selectedPriceRange) {
                                        case '€0 - €50K': return price >= 0 && price <= 50000;
                                        case '€50K - €100K': return price > 50000 && price <= 100000;
                                        case '€100K - €150K': return price > 100000 && price <= 150000;
                                        case '€150K+': return price > 150000;
                                        default: return true;
                                      }
                                    })();
                                    
                                    return matchesSearch && matchesCategory && matchesPrice;
                                  });
                                  
                                  if (checked) {
                                    setSelectedProducts(filteredProducts.map((product: any) => product.id));
                                  } else {
                                    setSelectedProducts([]);
                                  }
                                }}
                              />
                            </div>
                          </TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedProducts
                          .filter((product: any) => {
                            const matchesSearch = !productSearchText || 
                              product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                              product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                              product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                            
                            const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                            
                            const matchesPrice = !selectedPriceRange || (() => {
                              const price = parseFloat(product.price || '0');
                              switch(selectedPriceRange) {
                                case '€0 - €50K': return price >= 0 && price <= 50000;
                                case '€50K - €100K': return price > 50000 && price <= 100000;
                                case '€100K - €150K': return price > 100000 && price <= 150000;
                                case '€150K+': return price > 150000;
                                default: return true;
                              }
                            })();
                            
                            return matchesSearch && matchesCategory && matchesPrice;
                          })
                          .map((product: any) => (
                            <TableRow key={product.id} className="group hover:bg-gray-50">
                              <TableCell>
                                <div className={`transition-opacity ${
                                  selectedProducts.includes(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                  <Checkbox 
                                    checked={selectedProducts.includes(product.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedProducts([...selectedProducts, product.id]);
                                      } else {
                                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                      }
                                    }}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-semibold text-gray-900">{product.name}</div>
                                  {product.description && (
                                    <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {product.category && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.category}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {product.sku || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {product.price ? `€${parseFloat(product.price).toLocaleString()}` : '-'}
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">No products are currently associated with this partner.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "product-dashboard" && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 9h6v6H9z"/>
                <path d="M9 3v6"/>
                <path d="M15 9v6"/>
                <path d="M9 15h6"/>
                <path d="M3 9h6"/>
                <path d="M15 3v6"/>
                <path d="M21 9h-6"/>
                <path d="M9 21v-6"/>
                <path d="M15 15h6"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Dashboard Coming Soon</h3>
            <p className="text-gray-600 max-w-md mb-4">
              We're building comprehensive product analytics and insights for this partner. 
              This dashboard will show product performance, trends, and opportunities.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Expected launch: Q2 2025
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-4">
            {/* Enhanced unified toolbar - same as Partners tab */}
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
                    {/* Saved Lists dropdown */}
                    <div className="relative">
                      <button 
                        className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                          <path d="M2 3h10v1H2V3zm0 3h10v1H2V6zm0 3h10v1H2V9z" fill="currentColor"/>
                        </svg>
                        <span>All Contacts</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Right side - Views */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col mr-2">
                      <span className="text-base font-semibold text-gray-800 mb-2">Views</span>
                    </div>
                    <div className="relative">
                      <button 
                        className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                          <path d="M7 2a5 5 0 100 10A5 5 0 007 2z" fill="currentColor" fillOpacity="0.2"/>
                          <path d="M7 2a5 5 0 100 10A5 5 0 007 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <span>Default View</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second row with filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[250px]">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Department Filter */}
                  <div className="relative">
                    <button className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700 hover:border-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>Department</span>
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <button className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700 hover:border-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                      </svg>
                      <span>Status</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Primary</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">With Email</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">With Phone</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Contacts (0)</h3>
                <p className="text-sm text-gray-600 mt-1">Contacts associated with this partner</p>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-500">No contacts are currently associated with this partner.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment to OKR Metric</DialogTitle>
            <DialogDescription>
              Add a comment to provide context or updates about this OKR metric's progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMetricForComment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedMetricForComment.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Current: {selectedMetricForComment.realized_value} {selectedMetricForComment.measure_unit}
                  {selectedMetricForComment.target_value && (
                    <span> / Target: {selectedMetricForComment.target_value} {selectedMetricForComment.measure_unit}</span>
                  )}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment here..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible-to-partner"
                checked={visibleToPartner}
                onCheckedChange={(checked) => setVisibleToPartner(!!checked)}
              />
              <label
                htmlFor="visible-to-partner"
                className="text-sm text-gray-700"
              >
                Visible to partner
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to (optional)
              </label>
              <Input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter team member name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCommentSubmit}
                disabled={!comment.trim() || createCommentMutation.isPending}
              >
                {createCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Selected Opportunities</DialogTitle>
            <DialogDescription>
              Choose how to save your {selectedOpportunities.length} selected {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="createNew"
                    name="saveMode"
                    checked={saveListMode === 'new'}
                    onChange={() => setSaveListMode('new')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="createNew" className="text-sm text-gray-700">
                    Create new list
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="addToExisting"
                    name="saveMode"
                    checked={saveListMode === 'existing'}
                    onChange={() => setSaveListMode('existing')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="addToExisting" className="text-sm text-gray-700">
                    Add to existing list
                  </label>
                </div>
              </div>
            </div>

            {/* New List Form */}
            {saveListMode === 'new' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name *
                  </label>
                  <Input 
                    placeholder="Enter a name for this list"
                    id="listName"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Textarea 
                    placeholder="Add a description for this list"
                    rows={3}
                    id="listDescription"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="shareList" />
                  <label htmlFor="shareList" className="text-sm text-gray-700">
                    Share this list with partners
                  </label>
                </div>
              </div>
            )}

            {/* Existing List Selection */}
            {saveListMode === 'existing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select List
                  </label>
                  <select
                    value={selectedExistingList || ''}
                    onChange={(e) => setSelectedExistingList(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose an existing list...</option>
                    {opportunityLists?.filter((list: any) => list.entity_type === 'opportunities').map((list: any) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.members?.length || 0} opportunities)
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedExistingList && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Selected opportunities will be added to this list. Duplicates will be automatically removed.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {saveListMode === 'new' 
                  ? `${selectedOpportunities.length} ${selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} will be saved to a new list`
                  : `${selectedOpportunities.length} ${selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} will be added to the selected list`
                }
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSaveListModal(false);
                setSaveListMode('new');
                setSelectedExistingList(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (saveListMode === 'new') {
                  const listNameInput = document.getElementById('listName') as HTMLInputElement;
                  const listDescriptionInput = document.getElementById('listDescription') as HTMLTextAreaElement;
                  const shareListCheckbox = document.getElementById('shareList') as HTMLInputElement;
                  
                  if (!listNameInput?.value.trim()) {
                    toast({
                      title: "Missing list name",
                      description: "Please enter a name for your list.",
                      variant: "destructive"
                    });
                    return;
                  }

                  const listData = {
                    name: listNameInput.value.trim(),
                    description: listDescriptionInput?.value || '',
                    entity_type: 'opportunities',
                    members: selectedOpportunities,
                    isShared: shareListCheckbox?.checked || false,
                    partner_id: parseInt(id || '0'), // Associate with current partner
                    context: 'partner' // Mark as partner-specific list
                  };

                  createListMutation.mutate(listData, {
                    onSuccess: async (data) => {
                      console.log('List creation successful with data:', data);
                      
                      // Set the newly created list as active immediately for visual feedback
                      if (data && data.id) {
                        const newList = {
                          id: data.id,
                          name: data.name,
                          description: data.description,
                          members: data.members,
                          is_shared: data.is_shared || false
                        };
                        setActiveList(newList);
                        console.log('New list set as active:', newList);
                      }
                      
                      // Force refetch of the partner-specific lists query to update dropdown
                      await queryClient.refetchQueries({ 
                        queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] 
                      });
                      
                      console.log('List data refetched, dropdown should update immediately');
                      
                      toast({
                        title: "List created successfully",
                        description: `"${listData.name}" has been saved with ${selectedOpportunities.length} opportunities and is now available in your dropdown.`,
                      });
                      
                      setShowSaveListModal(false);
                      setSelectedOpportunities([]);
                      setSaveListMode('new');
                      
                      console.log('List creation and UI update complete');
                    },
                    onError: (error) => {
                      console.error('List creation error:', error);
                      toast({
                        title: "Error creating list",
                        description: "Failed to save the list. Please try again.",
                        variant: "destructive"
                      });
                    }
                  });
                } else {
                  // Add to existing list
                  if (!selectedExistingList) {
                    toast({
                      title: "No list selected",
                      description: "Please select an existing list.",
                      variant: "destructive"
                    });
                    return;
                  }

                  updateListMutation.mutate({ 
                    listId: selectedExistingList, 
                    opportunityIds: selectedOpportunities 
                  }, {
                    onSuccess: () => {
                      const selectedList = opportunityLists?.find((list: any) => list.id === selectedExistingList);
                      toast({
                        title: "Opportunities added successfully",
                        description: `${selectedOpportunities.length} opportunities added to "${selectedList?.name}".`,
                      });
                      setShowSaveListModal(false);
                      setSelectedOpportunities([]);
                      setSaveListMode('new');
                      setSelectedExistingList(null);
                    },
                    onError: () => {
                      toast({
                        title: "Error adding to list",
                        description: "Failed to add opportunities to the list. Please try again.",
                        variant: "destructive"
                      });
                    }
                  });
                }
              }}
              disabled={saveListMode === 'existing' && !selectedExistingList}
            >
              {saveListMode === 'new' ? 'Create List' : 'Add to List'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareListModal}
        onClose={() => setShowShareListModal(false)}
        itemName={activeList ? `${activeList.name} (List #${activeList.id})` : 'Opportunities'}
        listId={activeList?.id || 0}
        envId="degoudse"
        currentSharedLink={currentSharedLink || ''}
        existingSharedLinks={existingSharedLinks}
        collaborators={activeList ? (() => {
          // Initialize collaborators for this list if not already done
          initializeCollaboratorsForList(activeList.id);
          return getCollaboratorsForList(activeList.id);
        })() : []}
        onCopyLink={() => {
          if (currentSharedLink) {
            navigator.clipboard.writeText(currentSharedLink);
            toast({
              title: "Link copied",
              description: "The share link has been copied to your clipboard.",
            });
          }
        }}
        onCreateShare={() => {
          // Generate a shareable link for the selected opportunities
          const shareId = Math.random().toString(36).substring(7);
          const newLink = `${window.location.origin}/shared/opportunities/${shareId}`;
          setCurrentSharedLink(newLink);
          setExistingSharedLinks(prev => [...prev, {
            id: shareId,
            url: newLink,
            createdAt: new Date(),
            createdBy: 'Current User'
          }]);
          
          toast({
            title: "Share link created",
            description: "A new share link has been generated for the selected opportunities.",
          });
        }}
        onRemoveCollaborator={async (collaboratorId: string) => {
          if (!activeList) return false;
          
          // In a real app, this would make an API call to remove access from THIS specific list
          // await apiRequest('DELETE', `/api/lists/${activeList.id}/collaborators/${collaboratorId}`);
          
          // Remove collaborator only from this specific list's collaborators
          setListCollaborators(prev => ({
            ...prev,
            [activeList.id]: prev[activeList.id]?.filter(c => c.id !== collaboratorId) || []
          }));
          
          toast({
            title: "Access removed",
            description: `Collaborator removed from "${activeList.name}" only.`,
          });
          
          return true; // Return success
        }}
        onUpdateAccessLevel={async (collaboratorId: string, newAccessLevel: string) => {
          if (!activeList) return false;
          
          // Update collaborator access level for this specific list
          setListCollaborators(prev => ({
            ...prev,
            [activeList.id]: prev[activeList.id]?.map(c => 
              c.id === collaboratorId 
                ? { ...c, accessLevel: newAccessLevel as 'viewer' | 'commenter' | 'editor' }
                : c
            ) || []
          }));
          
          // In a real app, this would make an API call to update access
          // await apiRequest('PATCH', `/api/lists/${activeList.id}/collaborators/${collaboratorId}`, { accessLevel: newAccessLevel });
          
          return true; // Return success
        }}
        onSendEmailInvite={async (email: string, accessLevel: string, message: string) => {
          if (!activeList) return false;
          
          // Initialize collaborators for this list if needed
          initializeCollaboratorsForList(activeList.id);
          
          // Add new collaborator to this specific list
          const newCollaborator = {
            id: `${activeList.id}-${Math.random().toString(36).substring(7)}`,
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email,
            accessLevel: accessLevel as 'viewer' | 'commenter' | 'editor',
            avatar: email.charAt(0).toUpperCase(),
            isOwner: false
          };
          
          setListCollaborators(prev => ({
            ...prev,
            [activeList.id]: [...(prev[activeList.id] || []), newCollaborator]
          }));
          
          // In a real app, this would make an API call to send invitation
          // await apiRequest('POST', `/api/lists/${activeList.id}/collaborators`, { email, accessLevel, message });
          
          return true; // Return success
        }}
      />
      {/* Logo Upload Modal */}
      <LogoUploadModal
        isOpen={showLogoUploadModal}
        onClose={() => setShowLogoUploadModal(false)}
        onUpload={(logoUrl) => {
          // Invalidate the entity logo cache to refresh the EntityAvatar
          queryClient.invalidateQueries({ queryKey: [`/api/entity-logos`] });
          setShowLogoUploadModal(false);
        }}
        entityName={partner?.name || 'Partner'}
        entityType="partner"
        entityId={partner?.id || 0}
      />
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
              Save your current filter settings as a new view that you can easily access later. Views store filter combinations but not specific opportunity selections.
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
                    <span className="font-medium w-32 text-[#3E4DC4]">Stage:</span>
                    <span className="text-[#282A3F]">{selectedStatus}</span>
                  </div>
                )}
                {selectedCustomer && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-32 text-[#3E4DC4]">Customer:</span>
                    <span className="text-[#282A3F]">{selectedCustomer}</span>
                  </div>
                )}

                {selectedInsuranceDescription && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-32 text-[#3E4DC4]">Insurance:</span>
                    <span className="text-[#282A3F]">{selectedInsuranceDescription.length > 30 ? selectedInsuranceDescription.substring(0, 30) + '...' : selectedInsuranceDescription}</span>
                  </div>
                )}
                {!selectedStatus && !selectedCustomer && !selectedInsuranceDescription && (
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
                
                // Create the new view in database
                createSavedViewMutation.mutate({
                  name: viewName,
                  entity_type: 'opportunities',
                  filters: {
                    stage: selectedStatus || undefined,
                    customer: selectedCustomer || undefined,
                    insuranceDescription: selectedInsuranceDescription || undefined,
                  },
                  is_shared: false
                }, {
                  onSuccess: (createdView) => {
                    const newView = {
                      id: createdView.id.toString(),
                      name: createdView.name,
                      description: createdView.description,
                      filters: createdView.filters || {},
                      createdBy: 1,
                      createdAt: new Date(createdView.created_at)
                    };
                    setActiveView(newView);
                    // Cache invalidation is handled automatically by the mutation hook
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
      {/* Partner Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-2xl bg-[#ffffff] text-[#282A3F] pl-[32px] pr-[32px] pt-[32px] pb-[32px]">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
            <DialogDescription>
              Complete information about {partner?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Partner Name</Label>
                <Input
                  value={editedPartner.name || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={editedPartner.description || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Type</Label>
                <Input
                  value={editedPartner.type || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, type: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact Email</Label>
                <Input
                  type="email"
                  value={editedPartner.contactEmail || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, contactEmail: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact Phone</Label>
                <Input
                  value={editedPartner.contactPhone || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, contactPhone: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Website</Label>
                <Input
                  value={editedPartner.website || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, website: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Input
                  value={editedPartner.status || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, status: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Address</Label>
                <Textarea
                  value={editedPartner.address || ''}
                  onChange={(e) => setEditedPartner({...editedPartner, address: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Opportunities</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    if (!selectedOpportunityIds.includes(id)) {
                      setSelectedOpportunityIds([...selectedOpportunityIds, id]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      {selectedOpportunityIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedOpportunityIds.map(id => {
                            const opp = Array.isArray(allOpportunities) ? allOpportunities.find((o: any) => o.id === id) : null;
                            return opp ? (
                              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                                {opp.title}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOpportunityIds(selectedOpportunityIds.filter(oid => oid !== id));
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        "Select opportunities..."
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(allOpportunities) && allOpportunities.filter((opportunity: any) => 
                      !selectedOpportunityIds.includes(opportunity.id)
                    ).map((opportunity: any) => (
                      <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                        {opportunity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Customers</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    if (!selectedCustomerIds.includes(id)) {
                      setSelectedCustomerIds([...selectedCustomerIds, id]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      {selectedCustomerIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomerIds.map(id => {
                            const customer = Array.isArray(allCustomers) ? allCustomers.find((c: any) => c.id === id) : null;
                            return customer ? (
                              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                                {customer.name}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomerIds(selectedCustomerIds.filter(cid => cid !== id));
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        "Select customers..."
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(allCustomers) && allCustomers.filter((customer: any) => 
                      !selectedCustomerIds.includes(customer.id)
                    ).map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 px-4 py-2 text-[#ffffff] bg-[#5567E5] pl-[14px] pr-[14px] ml-[8px] mr-[8px]"
              onClick={() => {
                // Save the edited partner data
                console.log('Saving partner data:', editedPartner);
                // Here you would typically make an API call to update the partner
                // For now, we'll just close the dialog
                setShowDetailsDialog(false);
                toast({
                  title: "Partner updated",
                  description: "Partner information has been saved successfully.",
                });
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation Dialog */}
      <Dialog open={showDeleteListModal} onOpenChange={setShowDeleteListModal}>
        <DialogContent className="sm:max-w-md" style={{ background: '#ffffff', color: '#282A3F', padding: '32px' }}>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription className="text-sm text-[#282A3F]">
              Are you sure you want to delete this list? This action cannot be undone.
              Deleting a list does not delete the opportunity records themselves.
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
              variant="destructive"
              className="text-[#FFFFFF] bg-[#D3321D] pl-[14px] pr-[14px] ml-[12px] mr-[12px] hover:bg-destructive/90"
              onClick={async () => {
                if (listToDelete) {
                  try {
                    // Actually delete the list from the database
                    await deleteSavedListMutation.mutateAsync(parseInt(listToDelete.id));
                    
                    // If this was the active list, go back to "All opportunities"
                    if (activeList && activeList.id === listToDelete.id) {
                      setActiveList(null);
                    }
                    
                    // Additional immediate cache refresh to ensure UI updates
                    await queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
                    await queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] });
                    queryClient.removeQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', id] });
                    
                    // Show success message
                    toast({
                      title: "List deleted",
                      description: `The list "${listToDelete.name}" has been deleted. Your opportunity records remain intact.`,
                    });
                    
                    // Close the dialog and dropdown
                    setShowDeleteListModal(false);
                    setShowListsDropdown(false);
                    
                    // Reset list references to ensure clean state
                    setListToDelete(null);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete the list. Please try again.",
                      variant: "destructive"
                    });
                  }
                }
              }}
              disabled={deleteSavedListMutation.isPending}
            >
              {deleteSavedListMutation.isPending ? 'Deleting...' : 'Delete list'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}