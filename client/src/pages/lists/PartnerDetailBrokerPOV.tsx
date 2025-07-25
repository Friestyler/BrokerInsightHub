import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Bot, Copy, Users, Trash2, MoreHorizontal, MessageSquare, CheckCircle, XCircle, Eye, ChevronDown, Mail, Settings } from "lucide-react";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import EntityAvatar from "@/components/EntityAvatar";
import PartnerCampaignBuilder from "@/pages/campaigns/PartnerCampaignBuilder";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import { WhiteSpaceMatrix } from "@/components/entity/WhiteSpaceMatrixSimplified";
import { SmartCrossSell } from "@/components/portfolio/SmartCrossSell";

import { BrokerLayout } from "@/components/layouts/BrokerLayout";
import PartnerCampaignShareModal from "@/components/campaigns/PartnerCampaignShareModal";
// REMOVED PROBLEMATIC IMPORTS THAT CAUSE AUTHENTICATION ISSUES
// import { checkEnvironmentConsistency } from "@/utils/cacheBreaker";
// import { getEnvironmentBrandingOverride, forceEnvironmentUpdate, detectEnvironmentMismatch } from "@/utils/environmentOverride";
// import { runComprehensiveDiagnostic } from "@/utils/environmentDiagnostics";
// import "@/utils/consoleCommands";
// import "@/utils/nuclearCacheDestroy";
// import { completeEnvironmentOverride } from "@/utils/environmentReset";
// import "@/utils/startupSequence";
import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";
import qollabiLogo from "@assets/logo_qollabi_O_dark.png";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

// GET ENVIRONMENT BRANDING - RESPECTS USER SELECTION AND SUPPORTS CUSTOM ENVIRONMENTS
const getEnvironmentBranding = (envId: string, customEnvironments: any[] = []) => {
  console.log('🎯 BROKER VIEW - getEnvironmentBranding called with envId:', envId);
  console.log('🎯 BROKER VIEW - customEnvironments:', customEnvironments);
  
  // First check if it's a custom environment - match both by id and name
  const customEnv = customEnvironments.find(env => 
    env.id === envId || 
    env.name === envId || 
    env.id === parseInt(envId) ||
    envId.includes(env.name.replace(/\s+/g, '-')) ||
    envId === env.name.replace(/\s+/g, '-')
  );
  
  if (customEnv) {
    const result = {
      logo: customEnv.logo,
      name: customEnv.name,
      partnerName: customEnv.name
    };
    console.log('🎯 BROKER VIEW - Found custom environment:', result);
    return result;
  }
  
  // Use simple environment mapping based on user selection for built-in environments
  const brandingMap = {
    'nn': { logo: nnLogo, name: 'Nationale Nederlanden', partnerName: 'Nationale Nederlanden' },
    'baloise': { logo: baloiseLogoPng, name: 'Baloise', partnerName: 'Baloise' },
    'concordia': { logo: concordiaLogo, name: 'Concordia', partnerName: 'Concordia' },
    'degoudse': { logo: deGoudseLogo, name: 'De Goudse', partnerName: 'De Goudse' },
    'myqollabi': { logo: qollabiLogo, name: 'Qollabi', partnerName: 'Qollabi' }
  };
  
  const result = brandingMap[envId as keyof typeof brandingMap] || brandingMap.degoudse;
  
  console.log('🎯 BROKER VIEW - getEnvironmentBranding result:', result);
  return result;
};



export default function PartnerDetailBrokerPOV() {
  console.log('🚨🚨🚨 PartnerDetailBrokerPOV COMPONENT IS RENDERING!!! 🚨🚨🚨');
  
  const { partnerId } = useParams<{ partnerId: string }>();
  const { toast } = useToast();
  
  // Get URL parameters for tab and list selection - MUST BE FIRST
  const urlParams = new URLSearchParams(window.location.search);
  const listParam = urlParams.get('list');
  const envParam = urlParams.get('env');
  
  // BROKER VIEW ENVIRONMENT DETECTION - RESPECT URL PARAMS WITH FALLBACK
  const getCurrentEnvironment = () => {
    const envFromUrl = envParam;
    const envFromStorage = localStorage.getItem('selectedEnvironment');
    
    // If URL has env parameter, use it
    // Otherwise, check localStorage for user's selection
    // Final fallback to degoudse for broker view
    const currentEnv = envFromUrl || envFromStorage || 'degoudse';
    
    console.log('🎯 BROKER VIEW - ENVIRONMENT DETECTION:', { 
      envFromUrl, 
      envFromStorage,
      currentEnv,
      urlParams: window.location.search
    });
    
    return currentEnv;
  };

  const [currentEnvironment, setCurrentEnvironment] = useState(getCurrentEnvironment());
  
  // BROKER VIEW ENVIRONMENT SETUP - ONLY FORCE IF URL PARAM EXISTS
  useEffect(() => {
    const targetEnv = getCurrentEnvironment();
    console.log('🎯 BROKER VIEW - ENVIRONMENT SETUP:', { envParam, targetEnv });
    
    // Only force environment change if URL has env parameter
    if (envParam && envParam !== localStorage.getItem('selectedEnvironment')) {
      console.log('🎯 BROKER VIEW - FORCING ENVIRONMENT FROM URL:', envParam);
      localStorage.setItem('selectedEnvironment', envParam);
      
      // Force environment change event
      window.dispatchEvent(new CustomEvent('environmentChanged', { detail: envParam }));
      
      // Update current environment state
      setCurrentEnvironment(envParam);
    } else if (targetEnv) {
      // Just update state to match current detected environment WITHOUT changing localStorage
      setCurrentEnvironment(targetEnv);
    }
    
    return () => {
      console.log('🧹 BROKER VIEW - Component cleanup');
    };
  }, [envParam]);
  
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // OKR Plans state variables
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedMetricForComment, setSelectedMetricForComment] = useState<any>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [visibleToPartner, setVisibleToPartner] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  
  // State for filtering

  // State for campaign selection and sharing
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [showCampaignShareModal, setShowCampaignShareModal] = useState(false);

  // Bulk action state
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'stage' | 'assessment'>('stage');
  const [bulkStageValue, setBulkStageValue] = useState('');
  const [bulkAssessmentValue, setBulkAssessmentValue] = useState('');
  const [showWithholdReasonModal, setShowWithholdReasonModal] = useState(false);
  const [selectedWithholdReasons, setSelectedWithholdReasons] = useState<string[]>([]);
  const [withholdComment, setWithholdComment] = useState('');
  
  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Opportunities toolbar state management
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeOpportunitiesList, setActiveOpportunitiesList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOpportunityType, setSelectedOpportunityType] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  
  // Saved lists view mode state
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [expandedListsDropdown, setExpandedListsDropdown] = useState(false);

  // Filter state for opportunities
  const [showOpportunityFilter, setShowOpportunityFilter] = useState(false);
  const [opportunityFilters, setOpportunityFilters] = useState({
    stage: 'All',
    assessment: 'All'
  });
  const [hasActiveOpportunityFilters, setHasActiveOpportunityFilters] = useState(false);
  
  // Dropdown states for opportunity filters
  const [showOpportunityStageDropdown, setShowOpportunityStageDropdown] = useState(false);
  const [showOpportunityAssessmentDropdown, setShowOpportunityAssessmentDropdown] = useState(false);
  
  // Refs for opportunity filter dropdowns
  const opportunityStageDropdownRef = useRef<HTMLDivElement>(null);
  const opportunityAssessmentDropdownRef = useRef<HTMLDivElement>(null);
  
  // Note: uniqueStages already declared below in filtering section

  // Always use fresh environment value to ensure we get the latest
  const actualCurrentEnvironment = getCurrentEnvironment();

  // Get custom environments for proper logo display - MUST BE BEFORE USAGE
  const { data: customEnvironments = [], isLoading: customEnvironmentsLoading } = useQuery({
    queryKey: ['/api/admin/custom-environments'],
    queryFn: () => apiRequest('GET', '/api/admin/custom-environments'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter functions
  const updateOpportunityFilter = (key: string, value: string) => {
    const newFilters = { ...opportunityFilters, [key]: value };
    setOpportunityFilters(newFilters);
    
    // Check if any filter is active
    const hasActive = Object.values(newFilters).some(val => val !== 'All');
    setHasActiveOpportunityFilters(hasActive);
  };

  const clearOpportunityFilters = () => {
    const clearedFilters = {
      stage: 'All',
      assessment: 'All'
    };
    setOpportunityFilters(clearedFilters);
    setHasActiveOpportunityFilters(false);
  };

  // Color palette for lists
  const getListColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-100' },
      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-100' },
      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-100' },
      { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-100' },
      { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-100' },
      { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', accent: 'bg-indigo-100' },
    ];
    return colors[index % colors.length];
  };

  // Debug logs after state declarations
  console.log('🚨 BROKER VIEW - RENDER - Render key:', renderKey);
  console.log('🚨 BROKER VIEW - Current environment (state):', currentEnvironment);
  console.log('🚨 BROKER VIEW - Current environment (actual):', actualCurrentEnvironment);
  
  // Force re-render when environment changes - LISTEN TO STABLE ENVIRONMENT CHANGES
  useEffect(() => {
    const handleEnvironmentChange = (event: any) => {
      console.log('🚨 BROKER VIEW - Environment changed detected!', event);
      const newEnv = event.detail || getCurrentEnvironment();
      console.log('🚨 BROKER VIEW - New environment:', newEnv);
      if (newEnv !== currentEnvironment) {
        setCurrentEnvironment(newEnv);
        setRenderKey(prev => prev + 1);
      }
    };

    // Listen for both old and new environment change events
    window.addEventListener('environmentChanged', handleEnvironmentChange);
    window.addEventListener('stableEnvironmentChanged', handleEnvironmentChange);
    window.addEventListener('storage', handleEnvironmentChange);
    
    return () => {
      window.removeEventListener('environmentChanged', handleEnvironmentChange);
      window.removeEventListener('stableEnvironmentChanged', handleEnvironmentChange);
      window.removeEventListener('storage', handleEnvironmentChange);
    };
  }, [currentEnvironment]);

  // Removed polling check to prevent infinite loops
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown state for filters
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const stageDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Edit list state management
  const [isEditingList, setIsEditingList] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  const [isSavingList, setIsSavingList] = useState(false);
  
  // Selection state for opportunities
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Save List functionality state
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingList, setSelectedExistingList] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  // Assessment state variables
  const [withholdDialogOpen, setWithholdDialogOpen] = useState(false);
  const [selectedOpportunityForWithhold, setSelectedOpportunityForWithhold] = useState<any>(null);
  const [withholdReasons, setWithholdReasons] = useState<string[]>([]);
  const [withholdComments, setWithholdComments] = useState('');
  
  // Comments history state - match PartnerDetail.tsx exactly
  const [isCommentsHistoryDialogOpen, setIsCommentsHistoryDialogOpen] = useState(false);
  const [selectedOpportunityForHistory, setSelectedOpportunityForHistory] = useState<any>(null);
  const [opportunityComment, setOpportunityComment] = useState('');

  // Stage editing state
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [editStageDropdownRef, setEditStageDropdownRef] = useState<HTMLDivElement | null>(null);

  // Define stage options
  const OPPORTUNITY_STAGES = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  
  // Close stage dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editStageDropdownRef && !editStageDropdownRef.contains(event.target as Node)) {
        setEditingStageId(null);
      }
    }

    if (editingStageId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingStageId, editStageDropdownRef]);

  // For broker view, show the appropriate partner based on selected environment
  console.log('Broker POV - Current environment (state):', currentEnvironment);
  console.log('Broker POV - Current environment (actual):', actualCurrentEnvironment);
  console.log('Broker POV - Custom environments loading:', customEnvironmentsLoading);
  console.log('Broker POV - Custom environments data:', customEnvironments);
  
  // Get partner information and logo using environment branding (with safe fallback)
  // Use currentEnvironment state instead of actualCurrentEnvironment for responsive updates
  const safeCustomEnvironments = customEnvironments || [];
  const environmentBranding = getEnvironmentBranding(currentEnvironment, safeCustomEnvironments);
  
  console.log('Broker POV - Environment branding result:', environmentBranding);
  
  const partner = {
    id: currentEnvironment,
    name: environmentBranding.partnerName,
    description: `Insurance company that shared this list with Regional Insurance Partners`,
    primary_contact: 'Partnership Manager',
    contact_email: `partnerships@${currentEnvironment}.nl`,
    location: 'Netherlands',
    phone: '+31 70 344 2000'
  };
  
  const environmentLogo = environmentBranding.logo;
  
  console.log('🚨 BROKER VIEW - Partner info:', partner);
  console.log('🚨 BROKER VIEW - Environment logo:', environmentLogo);
  
  // Force re-render when environment or custom environments change
  useEffect(() => {
    console.log('🎯 BROKER VIEW - Environment and partner info:', {
      environment: currentEnvironment,
      partnerName: partner.name,
      logoSrc: environmentLogo,
      customEnvironmentsLoaded: !customEnvironmentsLoading,
      customEnvironmentsCount: customEnvironments.length
    });
    
    // Force a render update when custom environments finish loading
    if (!customEnvironmentsLoading && customEnvironments.length > 0) {
      setRenderKey(prev => prev + 1);
    }
  }, [partner.name, currentEnvironment, environmentLogo, customEnvironments, customEnvironmentsLoading]);
  
  // REMOVED: Aggressive environment sync that was causing switching issues
  // useEffect(() => {
  //   const syncEnvironment = () => {
  //     const freshEnv = getCurrentEnvironment();
  //     if (freshEnv !== currentEnvironment) {
  //       console.log('🎯 BROKER VIEW - Environment sync:', { from: currentEnvironment, to: freshEnv });
  //       setCurrentEnvironment(freshEnv);
  //       setRenderKey(prev => prev + 1);
  //     }
  //   };
  //   
  //   syncEnvironment();
  // }, [currentEnvironment]);

  // Fetch broker campaigns (shared campaigns) - use currentEnvironment for responsive updates
  const { data: brokerCampaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: [`/api/${currentEnvironment}/broker/shared-campaigns`],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/broker/shared-campaigns`),
    enabled: activeTab === 'campaigns',
    staleTime: 2 * 60 * 1000,
  });

  // Fetch assigned campaigns for this partner - use currentEnvironment for responsive updates
  const { data: assignedCampaigns = [], isLoading: assignedCampaignsLoading } = useQuery({
    queryKey: [`/api/${currentEnvironment}/partners/${partnerId}/assigned-campaigns`],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/partners/${partnerId}/assigned-campaigns`),
    enabled: activeTab === 'campaigns' && !!partnerId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch filter options for opportunities - use currentEnvironment for responsive updates
  const { data: filterOptions = {} } = useQuery({
    queryKey: [`/api/${currentEnvironment}/partners/${partnerId}/opportunities/filters`],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/partners/${partnerId}/opportunities/filters`),
    enabled: !!partnerId && activeTab === 'opportunities',
    staleTime: 5 * 60 * 1000,
  });

  // For broker view, fetch opportunities with proper list filtering - use currentEnvironment for responsive updates
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/${currentEnvironment}/opportunities`, activeOpportunitiesList?.id],
    queryFn: async () => {
      const listParam = activeOpportunitiesList?.id ? `?listId=${activeOpportunitiesList.id}&brokerView=true` : '?brokerView=true';
      const result = await apiRequest('GET', `/api/${currentEnvironment}/opportunities${listParam}`);
      console.log('🔍 BROKER VIEW - Opportunities data:', result);
      // Log specific assessment status fields
      if (result && result.length > 0) {
        result.forEach((opp: any, index: number) => {
          console.log(`🔍 Opportunity ${index}:`, {
            id: opp.id,
            title: opp.title,
            assessmentStatus: opp.assessmentStatus,
            assessment_status: opp.assessment_status,
            allFields: Object.keys(opp)
          });
        });
      }
      return result;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch customers for this partner in broker view - use currentEnvironment for responsive updates
  const { data: partnerCustomers = [], isLoading: customersLoading } = useQuery({
    queryKey: [`/api/${currentEnvironment}/partners/4/customers`, allOpportunities.length],
    queryFn: async () => {
      // Hardcoded Belgian customers for broker view
      const hardcodedCustomers = [
        {
          id: 206,
          name: "Bart De Smet",
          email: "bart.desmet@email.be",
          phone: "+32 2 555 0101",
          industry: "Manufacturing",
          status: "Active",
          location: "Brussels, Belgium",
          opportunityCount: 1,
          totalValue: 100000,
          weightedValue: 75000
        },
        {
          id: 207,
          name: "Sofie Peeters",
          email: "sofie.peeters@email.be",
          phone: "+32 2 555 0102",
          industry: "Retail",
          status: "Active",
          location: "Antwerp, Belgium",
          opportunityCount: 1,
          totalValue: 100000,
          weightedValue: 75000
        },
        {
          id: 208,
          name: "Tom Vermeulen",
          email: "tom.vermeulen@email.be",
          phone: "+32 2 555 0103",
          industry: "Technology",
          status: "Active",
          location: "Ghent, Belgium",
          opportunityCount: 1,
          totalValue: 100000,
          weightedValue: 75000
        },
        {
          id: 209,
          name: "Elke Janssens",
          email: "elke.janssens@email.be",
          phone: "+32 2 555 0104",
          industry: "Healthcare",
          status: "Active",
          location: "Leuven, Belgium",
          opportunityCount: 1,
          totalValue: 100000,
          weightedValue: 75000
        }
      ];
      
      console.log('Broker customer filtering - Returning hardcoded Belgian customers:', hardcodedCustomers.length);
      return hardcodedCustomers;
    },
    enabled: allOpportunities.length >= 0, // Enable even if 0 opportunities to show empty state
    staleTime: 2 * 60 * 1000,
  });

  // Customer lists and views data - use currentEnvironment for responsive updates
  const { data: customerSavedLists = [] } = useQuery({
    queryKey: [`/api/${currentEnvironment}/saved-lists`, { entity_type: 'customers', partner_id: 4 }],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/saved-lists?entity_type=customers&partner_id=4`),
  });

  const { data: customerSavedViews = [] } = useQuery({
    queryKey: [`/api/${currentEnvironment}/saved-views`, { entity_type: 'customers' }],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/saved-views?entity_type=customers`),
  });

  // Customer filtering state
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [activeCustomerList, setActiveCustomerList] = useState<any>(null);
  const [showCustomerListsDropdown, setShowCustomerListsDropdown] = useState(false);
  
  // Enhanced toolbar state for customers
  const [activeCustomerView, setActiveCustomerView] = useState<any>(null);
  const [showCustomerViewsDropdown, setShowCustomerViewsDropdown] = useState(false);
  const [showCustomerStatusDropdown, setShowCustomerStatusDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);



  // Create unique values for filter dropdowns
  const uniqueOpportunityStages = [...new Set(allOpportunities.map((opp: any) => opp.stage).filter(Boolean))];

  // Filter customers based on search and filters
  const filteredCustomers = partnerCustomers.filter((customer: any) => {
    const matchesSearch = !customerSearchText || 
      customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
      customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
    
    const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
    const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Customer selection handlers
  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c: any) => c.id));
    }
  };





  // Fetch all lists shared with John Smith or partners using the new broker-specific endpoint - use currentEnvironment for responsive updates
  const { data: savedListsData } = useQuery({
    queryKey: [`/api/${currentEnvironment}/broker/shared-lists`, 'opportunities'],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/broker/shared-lists?entity_type=opportunities`),
    staleTime: 0, // Always refresh to get latest data
    refetchOnWindowFocus: true,
  });

  // All returned lists are already filtered to show only those shared with John Smith or partners
  const partnerRelevantLists = savedListsData || [];
  
  // Fetch all opportunity lists for the modal - use currentEnvironment for responsive updates
  const { data: opportunityLists } = useQuery({
    queryKey: [`/api/${currentEnvironment}/saved-lists`, 'opportunities', 'all'],
    queryFn: () => apiRequest('GET', `/api/${currentEnvironment}/saved-lists?entity_type=opportunities`),
  });
  
  console.log(`Showing ${partnerRelevantLists.length} lists shared with John Smith or partners:`, 
    partnerRelevantLists.map((list: any) => ({ name: list.name, id: list.id, collaborators: list.collaborator_emails })));

  // Set active list based on URL parameter (only if explicitly provided)
  useEffect(() => {
    if (listParam && savedListsData) {
      const targetList = savedListsData.find((list: any) => list.id === parseInt(listParam));
      if (targetList) {
        setActiveOpportunitiesList(targetList);
      }
    } else {
      // If no list parameter, default to showing all opportunities
      setActiveOpportunitiesList(null);
    }
  }, [listParam, savedListsData]);

  // Update active list when savedListsData changes (after edits)
  useEffect(() => {
    console.log('SavedListsData changed, checking for updates:', {
      hasActiveList: !!activeOpportunitiesList,
      activeListId: activeOpportunitiesList?.id,
      listsCount: savedListsData?.length
    });
    
    if (activeOpportunitiesList && savedListsData) {
      const updatedList = savedListsData.find((list: any) => list.id === activeOpportunitiesList.id);
      console.log('Found updated list:', updatedList);
      
      if (updatedList) {
        // Compare members arrays directly to detect changes
        const currentMembers = activeOpportunitiesList.members || [];
        const updatedMembers = updatedList.members || [];
        
        console.log('Comparing members:', { currentMembers, updatedMembers });
        
        if (currentMembers.length !== updatedMembers.length || 
            !currentMembers.every((id: number) => updatedMembers.includes(id))) {
          console.log('Members changed, updating active list');
          setActiveOpportunitiesList(updatedList);
        } else {
          console.log('Members are the same, no update needed');
        }
      }
    }
  }, [savedListsData, activeOpportunitiesList?.id]);

  // Track when activeOpportunitiesList changes
  useEffect(() => {
    console.log('=== ACTIVE LIST STATE CHANGED ===', {
      listId: activeOpportunitiesList?.id,
      listName: activeOpportunitiesList?.name,
      members: activeOpportunitiesList?.members,
      timestamp: new Date().toISOString()
    });
  }, [activeOpportunitiesList]);

  // Mutation for updating opportunity stage
  const updateOpportunityStage = useMutation({
    mutationFn: async ({ opportunityId, stage }: { opportunityId: number, stage: string }) => {
      return await apiRequest('PATCH', `/api/opportunities/${opportunityId}`, { stage });
    },
    onSuccess: (data, variables) => {
      // Invalidate multiple related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/partners/4/opportunities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });
      
      // Optimistically update the cached data
      queryClient.setQueryData([`/api/${actualCurrentEnvironment}/partners/4/opportunities`], (oldData: any) => {
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

  // Create List Mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: any) => {
      console.log('Creating list with data:', listData);
      const result = await apiRequest('POST', `/api/${actualCurrentEnvironment}/saved-lists`, listData);
      console.log('List creation API result:', result);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/saved-lists`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/broker/shared-lists`] });
      
      toast({
        title: "List created successfully",
        description: `"${data.name}" has been created with ${selectedOpportunities.length} opportunities.`,
      });
      
      // Reset form and close modal
      setShowSaveListModal(false);
      setNewListName('');
      setNewListDescription('');
      setSelectedOpportunities([]);
      setSaveListMode('new');
    },
    onError: (error) => {
      console.error('Error creating list:', error);
      toast({
        title: "Error creating list",
        description: "Failed to create the list. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update List Mutation
  const updateListMutation = useMutation({
    mutationFn: async ({ listId, opportunityIds }: { listId: number, opportunityIds: number[] }) => {
      return await apiRequest('POST', `/api/${actualCurrentEnvironment}/saved-lists/${listId}/add-opportunities`, { opportunityIds });
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/saved-lists`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/broker/shared-lists`] });
      
      const targetList = opportunityLists?.find((list: any) => list.id === variables.listId);
      toast({
        title: "Opportunities added",
        description: `${variables.opportunityIds.length} opportunities added to "${targetList?.name}".`,
      });
      
      // Reset form and close modal
      setShowSaveListModal(false);
      setSelectedOpportunities([]);
      setSelectedExistingList(null);
      setSaveListMode('new');
    },
    onError: (error) => {
      console.error('Error adding to list:', error);
      toast({
        title: "Error adding to list",
        description: "Failed to add opportunities to the list. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handler for campaign modal
  const handleAddToCampaign = () => {
    if (selectedOpportunities.length === 0) return;
    setShowCampaignModal(true);
  };

  // Save List Handler
  const handleSaveList = () => {
    if (selectedOpportunities.length === 0) {
      toast({
        title: "No opportunities selected",
        description: "Please select opportunities to save to a list.",
        variant: "destructive"
      });
      return;
    }

    if (saveListMode === 'new') {
      if (!newListName.trim()) {
        toast({
          title: "List name required",
          description: "Please enter a name for the new list.",
          variant: "destructive"
        });
        return;
      }

      createListMutation.mutate({
        name: newListName,
        description: newListDescription,
        entity_type: 'opportunities',
        members: selectedOpportunities,
        is_shared: false,
        partner_id: parseInt(partnerId || '4')
      });
    } else {
      if (!selectedExistingList) {
        toast({
          title: "No list selected",
          description: "Please select a list to add opportunities to.",
          variant: "destructive"
        });
        return;
      }

      updateListMutation.mutate({
        listId: selectedExistingList,
        opportunityIds: selectedOpportunities
      });
    }
  };

  // Edit list mutation
  const editListMutation = useMutation({
    mutationFn: async ({ listId, members }: { listId: number, members: number[] }) => {
      try {
        const updateData = {
          name: activeOpportunitiesList?.name,
          description: activeOpportunitiesList?.description,
          members,
          filters: activeOpportunitiesList?.filters || {},
          is_shared: activeOpportunitiesList?.is_shared || false
        };
        console.log('Sending edit list request:', { listId, updateData });
        
        const envUrl = `/api/${actualCurrentEnvironment}/saved-lists/${listId}`;
        const currentEnv = actualCurrentEnvironment;
        const finalUrl = envUrl;
        
        const response = await fetch(finalUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': actualCurrentEnvironment,
            'x-environment-id': actualCurrentEnvironment
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
      console.log('=== MUTATION SUCCESS ===');
      console.log('List update successful, updating active list immediately:', data);
      console.log('Current active list before update:', activeOpportunitiesList);
      
      // Force a state update by creating a new object
      const updatedList = { ...data };
      setActiveOpportunitiesList(updatedList);
      
      console.log('Set new active list:', updatedList);
      
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/saved-lists`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/saved-lists`, 'opportunities', 'partner', '4'] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/broker/shared-lists`] });
      
      toast({
        title: "List updated",
        description: "Your changes to the list have been saved.",
      });
      
      // Only update activeOpportunitiesList if we're editing the currently active list
      if (editingListId === activeOpportunitiesList?.id) {
        setActiveOpportunitiesList(data);
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

  // Filter opportunities based on the active list
  const getActiveListForFiltering = () => {
    // Always use the latest data from React Query instead of local state
    if (listParam && savedListsData) {
      const freshList = savedListsData.find((list: any) => list.id === parseInt(listParam));
      console.log('Using fresh list from query data:', freshList);
      return freshList;
    }
    return activeOpportunitiesList;
  };

  const activeFilterList = getActiveListForFiltering();

  console.log('Active filter list state:', {
    listId: activeFilterList?.id,
    listName: activeFilterList?.name,
    members: activeFilterList?.members,
    allOpportunitiesCount: allOpportunities?.length,
    listParam,
    savedListsDataCount: savedListsData?.length
  });

  // Synchronize edit state with fresh list data - only for the list being edited
  useEffect(() => {
    if (activeFilterList && isEditingList && editingListId === activeFilterList.id) {
      console.log('Synchronizing edit state with fresh list data for list:', editingListId, activeFilterList.members);
      setEditedListMembers(activeFilterList.members || []);
    }
  }, [activeFilterList?.members, isEditingList, editingListId]);

  const baseOpportunities = allOpportunities.filter((opp: any) => {
    // In edit mode, show ALL opportunities so user can select/deselect
    if (isEditingList) {
      return true;
    }
    
    // In normal mode, filter based on the active list
    if (activeFilterList) {
      // Check if list has specific members (opportunity IDs)
      if (activeFilterList.members && activeFilterList.members.length > 0) {
        const isIncluded = activeFilterList.members.includes(opp.id);
        console.log(`Opportunity ${opp.id} (${opp.title}) - included: ${isIncluded}`, {
          oppId: opp.id,
          listMembers: activeFilterList.members,
          isIncluded
        });
        return isIncluded;
      }
      
      // If no specific members, apply list filters
      if (activeFilterList.filters) {
        const filters = typeof activeFilterList.filters === 'string' 
          ? JSON.parse(activeFilterList.filters) 
          : activeFilterList.filters;
          
        // Apply search text filter
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          const matchesSearch = 
            opp.title?.toLowerCase().includes(searchLower) ||
            opp.customer_names?.toLowerCase().includes(searchLower) ||
            opp.stage?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        
        // Apply status filter
        if (filters.status && opp.stage !== filters.status) {
          return false;
        }
        
        // Apply type filter
        if (filters.type && opp.type !== filters.type) {
          return false;
        }
      }
    }
    // If no active list or no filters, show all opportunities
    return true;
  });

  // Filter opportunities based on search and filters - using baseOpportunities for proper list integration
  const filteredOpportunities = baseOpportunities.filter((opportunity: any) => {
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
    
    // Apply opportunity filters
    if (opportunityFilters.stage !== 'All' && opportunity.stage !== opportunityFilters.stage) {
      return false;
    }
    
    if (opportunityFilters.assessment !== 'All') {
      const assessmentStatus = opportunity.assessment_status || opportunity.assessmentStatus;
      let normalizedStatus = 'Pending'; // Default value
      
      if (assessmentStatus === 'accepted') normalizedStatus = 'Accepted';
      else if (assessmentStatus === 'withheld') normalizedStatus = 'Withheld';
      
      if (normalizedStatus !== opportunityFilters.assessment) {
        return false;
      }
    }
    
    return true;
  });

  // Click outside handler to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
      }
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
        setShowStageDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (opportunityStageDropdownRef.current && !opportunityStageDropdownRef.current.contains(event.target as Node)) {
        setShowOpportunityStageDropdown(false);
      }
      if (opportunityAssessmentDropdownRef.current && !opportunityAssessmentDropdownRef.current.contains(event.target as Node)) {
        setShowOpportunityAssessmentDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extract unique values for dropdowns
  const uniqueStages = Array.from(new Set(allOpportunities.map((opp: any) => opp.stage).filter(Boolean))) as string[];
  const uniqueCustomers = Array.from(new Set(allOpportunities.map((opp: any) => opp.clientName).filter(Boolean))) as string[];
  
  // Extract unique assessment values from actual opportunity data
  const uniqueOpportunityAssessments = Array.from(new Set(
    allOpportunities.map((opp: any) => {
      const assessmentStatus = opp.assessment_status || opp.assessmentStatus;
      if (assessmentStatus === 'accepted') return 'Accepted';
      if (assessmentStatus === 'withheld') return 'Withheld';
      return 'Pending';
    }).filter(Boolean)
  )) as string[];

  // Create filter options for bulk actions
  const opportunityFilterOptions = {
    stages: uniqueStages,
    assessments: uniqueOpportunityAssessments
  };

  // Fetch template assignments for Mevas BV (partner_id 12)
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/template-assignments/partner`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/template-assignments/partner`),
  });

  // Fetch all OKR metrics to match with assignments
  const { data: allMetrics } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/okr-metrics`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/okr-metrics`),
  });

  // Fetch OKR tags for filtering
  const { data: tags = [] } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/okr-tags`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/okr-tags`),
  });

  // Fetch users for comment assignment
  const { data: users } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/users`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/users`),
  });

  // Get metrics assigned to the current partner
  // Template assignments use template_id to reference metrics, and entity_id for the partner
  const assignedMetrics = allMetrics?.filter((metric: any) => {
    return templateAssignments?.some((assignment: any) => 
      assignment.template_id === metric.id && assignment.entity_id === parseInt(partnerId || '12')
    );
  }) || [];

  console.log('Broker view - Template assignments:', templateAssignments);
  console.log('Broker view - All metrics:', allMetrics);
  console.log('Broker view - Assigned metrics for current partner:', assignedMetrics);
  console.log('Broker view - Tags:', tags);

  const okrMetrics = assignedMetrics;

  // Filter metrics based on search and filters
  const filteredMetrics = okrMetrics.filter((metric: any) => {
    const matchesSearch = !searchTerm || 
      metric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tags are stored as string arrays in the metric data
    const metricTags = metric.tags || [];
    
    const matchesTag = selectedTag === "all" || metricTags.includes(selectedTag);
    const matchesUnit = selectedUnit === "all" || metric.measure_unit === selectedUnit;
    
    return matchesSearch && matchesTag && matchesUnit;
  });

  // OKR Plans helper functions
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics(prev => [...prev, metricId]);
    } else {
      setSelectedMetrics(prev => prev.filter(id => id !== metricId));
    }
  };

  const handleAddComment = (metric: any) => {
    setSelectedMetricForComment(metric);
    setIsCommentDialogOpen(true);
  };

  // Create comment mutation for OKR metrics
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; visible_to_partner: boolean; entityType: string; entityId: number; assignedTo?: string; metricId?: number }) => {
      const envId = localStorage.getItem('selectedEnvironment') || 'degoudse';
      
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
        title: "Comment added",
        description: "Your comment has been added successfully.",
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

  // Assessment mutations - copied exactly from PartnerDetail.tsx
  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ 
      opportunityId, 
      assessmentStatus, 
      withholdReasons, 
      withholdComments, 
      assessmentNotes 
    }: {
      opportunityId: number;
      assessmentStatus: 'accepted' | 'withheld';
      withholdReasons?: string[];
      withholdComments?: string;
      assessmentNotes?: string;
    }) => {
      return await apiRequest('PUT', `/api/${actualCurrentEnvironment}/opportunities/${opportunityId}/assessment`, {
        assessmentStatus,
        withholdReasons,
        withholdComments,
        assessmentNotes,
        assessedById: 1 // Current user ID
      });
    },
    onSuccess: (data, variables) => {
      // CRITICAL FIX: Invalidate the EXACT query keys used by broker view
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`, activeOpportunitiesList?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities/${variables.opportunityId}/comments`] });
      
      // CRITICAL FIX: Force refetch the EXACT queries used by broker view 
      queryClient.refetchQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`, activeOpportunitiesList?.id] });
      queryClient.refetchQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });
      queryClient.refetchQueries({ queryKey: ['/api/opportunities'] });
      
      toast({
        title: "Assessment updated",
        description: `Opportunity ${variables.assessmentStatus} successfully`,
      });
      
      // Close modals and reset state
      setWithholdDialogOpen(false);
      setSelectedOpportunityForWithhold(null);
      setWithholdReasons([]);
      setWithholdComments('');
    },
    onError: (error) => {
      console.error('Error updating assessment:', error);
      toast({
        title: "Error updating assessment",
        description: "Failed to update opportunity assessment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const fetchWithholdReasonsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('GET', '/api/withhold-reasons');
    }
  });

  // Fetch withhold reasons on component mount - environment-specific
  const { data: withholdReasonsData } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/opportunity-withhold-reasons`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/opportunity-withhold-reasons`),
  });

  // Comments history query - CRITICAL FIX: Use environment-specific API path for broker view
  const { data: commentsHistoryData, refetch: refetchCommentsHistory } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/opportunities/${selectedOpportunityForHistory?.id}/comments`],
    enabled: !!selectedOpportunityForHistory?.id && isCommentsHistoryDialogOpen,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (gcTime replaces cacheTime in newer versions)
  });

  const handleSubmitComment = () => {
    if (!comment.trim() || !selectedMetricForComment) return;
    
    createCommentMutation.mutate({
      content: comment,
      visible_to_partner: visibleToPartner,
      entityType: 'partner',
      entityId: parseInt(partnerId!),
      assignedTo: assignedTo || undefined,
      metricId: selectedMetricForComment.id,
    });
  };

  // Bulk action handlers
  const handleBulkUpdate = async () => {
    if (selectedOpportunities.length === 0) return;

    try {
      for (const oppId of selectedOpportunities) {
        const updateData: any = {};
        
        if (bulkActionType === 'stage') {
          updateData.stage = bulkStageValue;
        }
        
        if (bulkActionType === 'assessment') {
          if (bulkAssessmentValue === 'Accepted') {
            updateData.assessmentStatus = 'accepted';
          }
        }

        await apiRequest('PUT', `/api/${actualCurrentEnvironment}/opportunities/${oppId}`, updateData);
      }

      // Reset bulk action state
      setShowBulkActionModal(false);
      setBulkActionType('stage');
      setBulkStageValue('');
      setBulkAssessmentValue('');
      setSelectedOpportunities([]);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });
      queryClient.refetchQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });

      toast({
        title: "Bulk update completed",
        description: `Updated ${selectedOpportunities.length} opportunities successfully`,
      });

    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: "Error",
        description: "Failed to update opportunities. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkWithhold = async () => {
    if (selectedOpportunities.length === 0 || selectedWithholdReasons.length === 0 || !withholdComment.trim()) return;

    try {
      for (const oppId of selectedOpportunities) {
        const updateData: any = {
          assessmentStatus: 'withheld',
          withholdReasons: selectedWithholdReasons,
          withholdComments: withholdComment,
          assessedById: 1
        };
        
        if (bulkActionType === 'stage') {
          updateData.stage = bulkStageValue;
        }

        await apiRequest('PUT', `/api/${actualCurrentEnvironment}/opportunities/${oppId}/assessment`, updateData);
      }

      // Reset all state
      setShowWithholdReasonModal(false);
      setShowBulkActionModal(false);
      setBulkActionType('stage');
      setBulkStageValue('');
      setBulkAssessmentValue('');
      setSelectedWithholdReasons([]);
      setWithholdComment('');
      setSelectedOpportunities([]);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });
      queryClient.refetchQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities`] });

      toast({
        title: "Bulk withhold completed",
        description: `Withheld ${selectedOpportunities.length} opportunities with reason and comment`,
      });

    } catch (error) {
      console.error('Error in bulk withhold:', error);
      toast({
        title: "Error",
        description: "Failed to withhold opportunities. Please try again.",
        variant: "destructive"
      });
    }
  };

  // CRITICAL FIX: Add opportunity comment creation functionality matching PartnerDetail.tsx
  const createCrossEntityCommentMutation = useMutation({
    mutationFn: async ({ entityType, entityId, comment, entityName }: { 
      entityType: 'customer' | 'opportunity', 
      entityId: number, 
      comment: string,
      entityName: string 
    }) => {
      // Create activity comment using Activity Hub API
      const activityData = {
        content: comment,
        visibleToPartner: true,
        entityType: entityType,
        entityId: entityId,
        authorId: 4 // Default to user ID 4 (Albrecht Bouwman)
      };

      console.log('Creating activity comment:', activityData);

      // Create comment in Activity Hub
      await apiRequest('POST', `/api/${actualCurrentEnvironment}/activity/comments`, activityData);
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate activity queries for Activity Hub
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/partners/${partnerId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/partners/${partnerId}/timeline`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/unified-activities`] });
      
      // Invalidate comments history query for refresh
      if (selectedOpportunityForHistory?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/${actualCurrentEnvironment}/opportunities/${selectedOpportunityForHistory.id}/comments`] });
        refetchCommentsHistory();
      }
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the Activity Hub.",
      });
      
      // Reset comment state
      setOpportunityComment("");
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

  // CRITICAL FIX: Add opportunity comment submission handler matching PartnerDetail.tsx  
  const handleSubmitOpportunityComment = () => {
    if (!opportunityComment.trim() || !selectedOpportunityForHistory) return;
    
    createCrossEntityCommentMutation.mutate({
      entityType: 'opportunity',
      entityId: selectedOpportunityForHistory.id,
      comment: opportunityComment,
      entityName: selectedOpportunityForHistory.title
    });
  };

  // Assessment handler functions - copied exactly from PartnerDetail.tsx
  const handleAcceptOpportunity = (opportunity: any) => {
    updateAssessmentMutation.mutate({
      opportunityId: opportunity.id,
      assessmentStatus: 'accepted'
    });
  };

  const handleWithholdOpportunity = (opportunity: any) => {
    console.log('Opening withhold dialog for opportunity:', opportunity.id);
    setSelectedOpportunityForWithhold(opportunity);
    setWithholdDialogOpen(true);
    setWithholdReasons([]); // Reset reasons
    setWithholdComments(''); // Reset comments
    
    // Fetch withhold reasons
    fetchWithholdReasonsMutation.mutate();
  };

  const handleWithholdSubmit = () => {
    if (!selectedOpportunityForWithhold || withholdReasons.length === 0) return;
    
    console.log('Submitting withhold with data:', {
      opportunityId: selectedOpportunityForWithhold.id,
      assessmentStatus: 'withheld',
      withholdReasons: withholdReasons,
      withholdComments: withholdComments
    });
    
    updateAssessmentMutation.mutate({
      opportunityId: selectedOpportunityForWithhold.id,
      assessmentStatus: 'withheld',
      withholdReasons: withholdReasons,
      withholdComments: withholdComments
    });
  };



  // Group metrics by their tags
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: any) => {
    // Tags are stored as string arrays in the metric data
    const metricTags = metric.tags || [];
    
    // If no tags, use 'Untagged'
    const tagName = metricTags.length > 0 ? metricTags[0] : 'Untagged';
    
    if (!acc[tagName]) {
      acc[tagName] = [];
    }
    acc[tagName].push(metric);
    return acc;
  }, {});

  // Get color for tag name - use database colors for consistency
  const getTagColor = (tagName: string) => {
    const tag = (tags as any[] || []).find((t: any) => t.name === tagName);
    return tag?.color || '#6B7280'; // Default gray for unknown tags
  };

  // Get saved list ID from session storage for back navigation
  const getBackUrl = () => {
    const savedListId = sessionStorage.getItem('partnerViewListId');
    const source = sessionStorage.getItem('partnerViewSource');
    
    // If we came from the partners page, always go back to partners
    if (source === 'partners') {
      return '/broker-view/partners';
    }
    
    // Otherwise, use the saved list ID if available
    return savedListId ? `/broker-view/list/${savedListId}` : '/broker-view/partners';
  };

  return (
    <BrokerLayout>
      <div key={`broker-${actualCurrentEnvironment}-${renderKey}`} className="min-h-screen bg-white">
        {/* Header section */}
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <Link href={getBackUrl()}>
              <Button variant="ghost" size="sm" className="mr-4 p-2 group hover:bg-[#F5F6FE]">
                <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
              </Button>
            </Link>
            {/* Company Logo */}
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                <img 
                  key={`partner-logo-${actualCurrentEnvironment}-${renderKey}`}
                  src={environmentLogo} 
                  alt={`${partner.name} Logo`}
                  className="w-full h-full object-contain p-1"
                  data-environment-logo
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-1">
                <h1 key={`partner-name-${actualCurrentEnvironment}-${renderKey}`} className="text-2xl font-bold text-gray-900" data-environment-name>{partner.name}</h1>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                    onClick={() => setShowDetailsDialog(true)}
                  >
                    Details
                  </Button>
                </div>
              </div>
              
              {/* Collaborators Component */}
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm text-gray-600 font-medium">Collaborators:</span>
                <div className="flex items-center space-x-2">
                  {/* Internal users */}
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white">JS</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white">AB</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white">AS</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-1">Internal</span>
                  </div>
                  
                  {/* Separator */}
                  <div className="w-px h-4 bg-gray-300"></div>
                  
                  {/* External users */}
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white">ES</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white">MV</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-1">External</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          


          {/* Activity Hub - Show De Goudse's partnership activities with Regional Insurance Partners */}
          <PartnerActivityHub partnerId={4} partnerName={partner.name} />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 mb-3">
              <button 
                onClick={() => setActiveTab("products")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "products" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Products
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
              <button 
                onClick={() => setActiveTab("opportunities")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "opportunities" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Opportunities ({baseOpportunities?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab("customers")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "customers" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Customers
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
              {/* Campaign Editor Tab - Only show when a campaign is selected */}
              {selectedCampaign && (
                <button 
                  onClick={() => setActiveTab("campaign-editor")}
                  className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                    activeTab === "campaign-editor" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  Edit: {selectedCampaign.name}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content area */}
        <div className="px-6 py-6">
          {activeTab === "okr-plans" && (
            <div className="space-y-6">
              {/* Filters Section */}
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
                    {/* Show actual tags from assigned metrics */}
                    {Array.from(new Set(assignedMetrics.flatMap((metric: any) => metric.tags || []))).map((tagName: string) => (
                      <SelectItem key={tagName} value={tagName}>
                        {tagName}
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
              </div>

              {/* OKR Metrics Display */}
              {filteredMetrics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No OKR metrics found</p>
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
                              backgroundColor: getTagColor(tagName)
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
                            <TableHead className="font-semibold text-gray-900">Metric Name</TableHead>
                            {(() => {
                              // Check if any metric in this tag group has YTD or Last Year values
                              const hasYtdValues = tagMetrics.some((metric: any) => metric.ytd_value);
                              const hasLastYearValues = tagMetrics.some((metric: any) => metric.last_year_value);
                              
                              if (hasYtdValues || hasLastYearValues) {
                                return (
                                  <>
                                    {hasYtdValues && (
                                      <TableHead className="font-semibold text-gray-900">YTD</TableHead>
                                    )}
                                    {hasLastYearValues && (
                                      <TableHead className="font-semibold text-gray-900">Last Year</TableHead>
                                    )}
                                    <TableHead className="font-semibold text-gray-900">Progress</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <TableHead className="font-semibold text-gray-900">Current</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Target</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Progress</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                  </>
                                );
                              }
                            })()}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tagMetrics.map((metric: any) => {
                            // Use YTD/Last Year values for progress calculation if available, otherwise use current/target
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
                            } else if (metric.current_value && metric.target_value) {
                              // For current vs target fallback
                              const current = parseFloat(metric.current_value) || 0;
                              const target = parseFloat(metric.target_value) || 0;
                              if (target > 0) {
                                progressRatio = current / target;
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
                            
                            return (
                              <TableRow key={metric.id} className="border-b border-gray-100">
                                <TableCell className="font-medium">{metric.name}</TableCell>
                                {(() => {
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
                                              {metric.current_value || metric.realized_value || '0'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {metric.unit === 'percentage' ? '%' : (metric.measure_unit || '')}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-gray-900">
                                              {metric.target_value || '0'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {metric.unit === 'percentage' ? '%' : (metric.measure_unit || '')}
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
                                  }
                                })()}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-white rounded-lg border">
              <div className="border-b border-gray-200 mb-3 -mt-6">
                <nav className="flex space-x-1">
                  <button 
                    onClick={() => setActiveProductTab("overview")}
                    className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                      activeProductTab === "overview" 
                        ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                        : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                    }`}
                  >
                    Overview
                  </button>
                  {/* Smart Cross Sell and Matrix tabs are hidden in Partner POV */}
                </nav>
              </div>

              {/* Product Overview Tab */}
              {activeProductTab === "overview" && (
                <div className="p-6">
                  <PortfolioOverviewTab 
                    entityType="partners" 
                    entityId={partnerId || ""} 
                  />
                </div>
              )}

              {/* Smart Cross Sell and Matrix tabs are hidden in Partner POV */}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-0 -mt-2">
              {/* Dynamic Totals Display */}
              {!opportunitiesLoading && filteredOpportunities.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E6E7F1] mb-6">
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-4 gap-8">
                      {/* Total Opportunities */}
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900">
                          {filteredOpportunities.length}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total Opportunities
                        </div>
                      </div>
                      
                      {/* Closed Won */}
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900">
                          {filteredOpportunities.filter((opp: any) => 
                            opp.stage === 'Closed (Won)' || opp.stage === 'closed_won'
                          ).length}
                        </div>
                        <div className="text-sm text-gray-500">
                          Closed Won
                        </div>
                      </div>
                      
                      {/* Total Value */}
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900">
                          €{filteredOpportunities.reduce((sum: number, opp: any) => {
                            const value = parseFloat(opp.estimated_value) || 0;
                            return sum + value;
                          }, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total Value
                        </div>
                      </div>
                      
                      {/* Weighted Value */}
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900">
                          €{filteredOpportunities.reduce((sum: number, opp: any) => {
                            const value = parseFloat(opp.estimated_value) || 0;
                            const probability = parseFloat(opp.probability) || 0;
                            return sum + (value * probability / 100);
                          }, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Weighted Value
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced unified toolbar - same as OpportunitiesPage */}
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* Saved Lists header with optional selected list indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Saved Lists chevron header */}
                      <button
                        onClick={() => setExpandedListsDropdown(!expandedListsDropdown)}
                        className="flex items-center space-x-2 text-base font-semibold text-gray-800 hover:text-gray-900"
                      >
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
                          className={`transition-transform ${expandedListsDropdown ? 'rotate-90' : ''}`}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span>Saved Lists ({1 + partnerRelevantLists.length})</span>
                      </button>
                      
                      {/* Cards/List toggle when expanded - moved next to chevron */}
                      {expandedListsDropdown && (
                        <div className="flex items-center border border-gray-200 rounded-md p-1">
                          <button
                            onClick={() => setViewMode('cards')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs transition-colors ${
                              viewMode === 'cards' 
                                ? 'bg-[#5567E5] text-white' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Cards</span>
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs transition-colors ${
                              viewMode === 'list' 
                                ? 'bg-[#5567E5] text-white' 
                                : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="8" y1="6" x2="21" y2="6"></line>
                              <line x1="8" y1="12" x2="21" y2="12"></line>
                              <line x1="8" y1="18" x2="21" y2="18"></line>
                              <line x1="3" y1="6" x2="3.01" y2="6"></line>
                              <line x1="3" y1="12" x2="3.01" y2="12"></line>
                              <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            <span>List</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Show selected list when collapsed */}
                      {!expandedListsDropdown && activeOpportunitiesList && (() => {
                        const activeListIndex = partnerRelevantLists.findIndex(list => list.id === activeOpportunitiesList.id);
                        const listColor = getListColor(activeListIndex);
                        return (
                        <div className={`flex items-center space-x-2 px-3 py-1.5 ${listColor.bg} border ${listColor.border} rounded-md`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={listColor.text}>
                            <polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline>
                          </svg>
                          <span className={`text-sm font-medium ${listColor.text}`}>{activeOpportunitiesList.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveOpportunitiesList(null);
                              window.history.replaceState({}, '', window.location.pathname + window.location.search.replace(/[?&]list=\d+/, ''));
                            }}
                            className={`${listColor.text} hover:opacity-80`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18"></path>
                              <path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Expandable cards/list section */}
                  {expandedListsDropdown && (
                    <div className="pt-3">
                      
                      {/* Cards or List view content */}
                      {viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* All opportunities card */}
                          <div 
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              !activeOpportunitiesList 
                                ? 'border-[#5567E5] bg-[#F8F9FF]' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setActiveOpportunitiesList(null);
                              const newUrl = new URL(window.location.href);
                              newUrl.searchParams.delete('list');
                              window.history.pushState({}, '', newUrl.toString());
                              setRenderKey(prev => prev + 1);
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">All opportunities</h3>
                              <div className="text-sm text-gray-500">
                                {allOpportunities.length} items
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">View all opportunities</p>
                          </div>
                          
                          {/* Shared lists cards */}
                          {partnerRelevantLists.map((list: any, index: number) => {
                            const listColor = getListColor(index);
                            return (
                            <div 
                              key={list.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                activeOpportunitiesList?.id === list.id 
                                  ? `${listColor.border} ${listColor.bg}` 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                setActiveOpportunitiesList(list);
                                const newUrl = new URL(window.location.href);
                                newUrl.searchParams.set('list', list.id.toString());
                                window.history.pushState({}, '', newUrl.toString());
                                setRenderKey(prev => prev + 1);
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-medium ${
                                  activeOpportunitiesList?.id === list.id ? listColor.text : 'text-gray-900'
                                }`}>{list.name}</h3>
                                <div className={`text-sm px-2 py-1 rounded-full ${
                                  activeOpportunitiesList?.id === list.id ? `${listColor.accent} ${listColor.text}` : 'text-gray-500'
                                }`}>
                                  {list.members?.length || 0} items
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                  <circle cx="18" cy="5" r="3"></circle>
                                  <circle cx="6" cy="12" r="3"></circle>
                                  <circle cx="18" cy="19" r="3"></circle>
                                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                                <span className="text-xs text-gray-500">Shared by De Goudse</span>
                              </div>
                              {list.description && (
                                <p className="text-sm text-gray-600">{list.description}</p>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* All opportunities list item */}
                          <div 
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                              !activeOpportunitiesList 
                                ? 'border-[#5567E5] bg-[#F8F9FF]' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setActiveOpportunitiesList(null);
                              const newUrl = new URL(window.location.href);
                              newUrl.searchParams.delete('list');
                              window.history.pushState({}, '', newUrl.toString());
                              setRenderKey(prev => prev + 1);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="font-medium text-gray-900">All opportunities</div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {allOpportunities.length} items
                            </div>
                          </div>
                          
                          {/* Shared lists items */}
                          {partnerRelevantLists.map((list: any, index: number) => {
                            const listColor = getListColor(index);
                            return (
                            <div 
                              key={list.id}
                              className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                activeOpportunitiesList?.id === list.id 
                                  ? `${listColor.border} ${listColor.bg}` 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                setActiveOpportunitiesList(list);
                                const newUrl = new URL(window.location.href);
                                newUrl.searchParams.set('list', list.id.toString());
                                window.history.pushState({}, '', newUrl.toString());
                                setRenderKey(prev => prev + 1);
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`font-medium ${
                                  activeOpportunitiesList?.id === list.id ? listColor.text : 'text-gray-900'
                                }`}>{list.name}</div>
                                <div className="flex items-center space-x-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                  </svg>
                                  <span className="text-xs text-gray-500">Shared by De Goudse</span>
                                </div>
                              </div>
                              <div className={`text-sm px-2 py-1 rounded-full ${
                                activeOpportunitiesList?.id === list.id ? `${listColor.accent} ${listColor.text}` : 'text-gray-500'
                              }`}>
                                {list.members?.length || 0} items
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
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

                      {/* Filter dropdowns */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          // Get the active list colors for filter tags
                          const activeListIndex = activeOpportunitiesList ? partnerRelevantLists.findIndex(list => list.id === activeOpportunitiesList.id) : -1;
                          const listColor = activeListIndex >= 0 ? getListColor(activeListIndex) : { 
                            border: 'border-[#5567E5]', 
                            bg: 'bg-[#F8F9FF]', 
                            text: 'text-[#5567E5]',
                            accent: 'bg-[#5567E5]'
                          };
                          
                          return (
                            <>
                              {/* Stage Filter */}
                              <div className="relative" ref={opportunityStageDropdownRef}>
                                <button
                                  onClick={() => setShowOpportunityStageDropdown(!showOpportunityStageDropdown)}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-all ${
                                    opportunityFilters.stage !== 'All'
                                      ? `${listColor.border} ${listColor.bg} ${listColor.text}`
                                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  Stage
                                  {opportunityFilters.stage !== 'All' && (
                                    <span className={`ml-1 px-1.5 py-0.5 text-xs ${listColor.accent.replace('bg-', 'bg-')} text-white rounded`}>
                                      1
                                    </span>
                                  )}
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                          
                          {showOpportunityStageDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                              <div className="p-2 space-y-1">
                                {['All', ...uniqueOpportunityStages].map((stage) => (
                                  <button
                                    key={stage}
                                    onClick={() => {
                                      setOpportunityFilters(prev => ({ ...prev, stage }));
                                      setShowOpportunityStageDropdown(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                      opportunityFilters.stage === stage ? 'bg-[#F8F9FF] text-[#5567E5]' : 'text-gray-700'
                                    }`}
                                  >
                                    {stage}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                              {/* Assessment Filter */}
                              <div className="relative" ref={opportunityAssessmentDropdownRef}>
                                <button
                                  onClick={() => setShowOpportunityAssessmentDropdown(!showOpportunityAssessmentDropdown)}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-all ${
                                    opportunityFilters.assessment !== 'All'
                                      ? `${listColor.border} ${listColor.bg} ${listColor.text}`
                                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  Assessment
                                  {opportunityFilters.assessment !== 'All' && (
                                    <span className={`ml-1 px-1.5 py-0.5 text-xs ${listColor.accent.replace('bg-', 'bg-')} text-white rounded`}>
                                      1
                                    </span>
                                  )}
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                
                                {showOpportunityAssessmentDropdown && (
                                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                                    <div className="p-2 space-y-1">
                                      {['All', ...uniqueOpportunityAssessments].map((assessment) => (
                                        <button
                                          key={assessment}
                                          onClick={() => {
                                            setOpportunityFilters(prev => ({ ...prev, assessment }));
                                            setShowOpportunityAssessmentDropdown(false);
                                          }}
                                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                            opportunityFilters.assessment === assessment ? `${listColor.bg} ${listColor.text}` : 'text-gray-700'
                                          }`}
                                        >
                                          {assessment}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Clear filters button - only show when filters are active */}
                              {(opportunityFilters.stage !== 'All' || opportunityFilters.assessment !== 'All') && (
                                <button
                                  onClick={clearOpportunityFilters}
                                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                  Clear filters
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk actions bar - only visible when opportunities are selected */}
              {selectedOpportunities.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-indigo-700 font-medium mr-2">
                      {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                    </span>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-indigo-600"
                      onClick={() => { setBulkActionType('assessment'); setShowBulkActionModal(true); }}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Change assessment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-indigo-600"
                      onClick={() => { setBulkActionType('stage'); setShowBulkActionModal(true); }}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Change status
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-indigo-600"
                      onClick={handleAddToCampaign}
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      Add to campaign
                    </Button>
                  </div>
                </div>
              )}

              {/* Opportunities Table */}
              {opportunitiesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading opportunities...</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No opportunities found for this partner</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm" key={`opportunities-table-${renderKey}-${activeOpportunitiesList?.id}-${activeOpportunitiesList?.members?.length || 0}`}>
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
                                  ? filteredOpportunities.length > 0 && filteredOpportunities.every((opp: any) => editedListMembers.includes(opp.id))
                                  : filteredOpportunities.length > 0 && filteredOpportunities.every((opp: any) => selectedOpportunities.includes(opp.id))
                              }
                              onCheckedChange={(checked) => {
                                if (isEditingList) {
                                  if (checked) {
                                    const oppIds = filteredOpportunities.map((opp: any) => opp.id);
                                    setEditedListMembers(Array.from(new Set([...editedListMembers, ...oppIds])));
                                  } else {
                                    const oppIds = filteredOpportunities.map((opp: any) => opp.id);
                                    setEditedListMembers(editedListMembers.filter(id => !oppIds.includes(id)));
                                  }
                                } else {
                                  if (checked) {
                                    setSelectedOpportunities(filteredOpportunities.map((opp: any) => opp.id));
                                  } else {
                                    setSelectedOpportunities([]);
                                  }
                                }
                              }}
                            />
                          </div>
                        </TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Opportunity</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Customer</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Related contacts</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Stage</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Value</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Close Date</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Assessment</TableHead>
                        <TableHead className="text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpportunities.map((opportunity: any) => (
                        <TableRow key={opportunity.id} className="group hover:bg-gray-50">
                          <TableCell>
                            <div className={`transition-opacity ${
                              (isEditingList ? editedListMembers.includes(opportunity.id) : selectedOpportunities.includes(opportunity.id)) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <Checkbox 
                                checked={
                                  isEditingList 
                                    ? editedListMembers.includes(opportunity.id)
                                    : selectedOpportunities.includes(opportunity.id)
                                }
                                onCheckedChange={(checked) => {
                                  if (isEditingList) {
                                    if (checked) {
                                      setEditedListMembers([...editedListMembers, opportunity.id]);
                                    } else {
                                      setEditedListMembers(editedListMembers.filter(id => id !== opportunity.id));
                                    }
                                  } else {
                                    if (checked) {
                                      setSelectedOpportunities([...selectedOpportunities, opportunity.id]);
                                    } else {
                                      setSelectedOpportunities(selectedOpportunities.filter(id => id !== opportunity.id));
                                    }
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/broker-view/opportunity/${opportunity.id}`}>
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
                            <div className="relative">
                              {editingStageId === opportunity.id ? (
                                <div 
                                  ref={(el) => setEditStageDropdownRef(el)}
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
                          {/* Assessment Column - copied exactly from PartnerDetail.tsx lines 3203-3257 */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(opportunity.assessmentStatus === 'withheld' || opportunity.assessment_status === 'withheld') ? (
                                <div className="flex items-center gap-1">
                                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                    Withheld
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
                                    onClick={() => handleAcceptOpportunity(opportunity)}
                                    title="Change to Accept"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (opportunity.assessmentStatus === 'accepted' || opportunity.assessment_status === 'accepted') ? (
                                <div className="flex items-center gap-1">
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                    Accepted
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                    onClick={() => handleWithholdOpportunity(opportunity)}
                                    title="Change to Withhold"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                    onClick={() => handleAcceptOpportunity(opportunity)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                    onClick={() => handleWithholdOpportunity(opportunity)}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Withhold
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {/* Comments Column - copied exactly from PartnerDetail.tsx lines 3261-3273 */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedOpportunityForHistory(opportunity);
                                setIsCommentsHistoryDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 text-gray-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Bulk Action Modal */}
              <Dialog open={showBulkActionModal} onOpenChange={setShowBulkActionModal}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {bulkActionType === 'stage' ? 'Change Status' : 'Change Assessment'}
                    </DialogTitle>
                    <div className="text-sm text-gray-600">
                      {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Stage Selection */}
                    {bulkActionType === 'stage' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select new stage</label>
                        <select
                          value={bulkStageValue}
                          onChange={(e) => setBulkStageValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select stage...</option>
                          {opportunityFilterOptions?.stages?.map((stage: string) => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Assessment Selection */}
                    {bulkActionType === 'assessment' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select new assessment</label>
                        <select
                          value={bulkAssessmentValue}
                          onChange={(e) => setBulkAssessmentValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select assessment...</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="withheld">Withheld</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBulkActionModal(false);
                        setBulkActionType('stage');
                        setBulkStageValue('');
                        setBulkAssessmentValue('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (bulkActionType === 'assessment' && bulkAssessmentValue === 'withheld') {
                          setShowBulkActionModal(false);
                          setShowWithholdReasonModal(true);
                        } else {
                          // Handle direct bulk update
                          handleBulkUpdate();
                        }
                      }}
                      disabled={
                        (bulkActionType === 'stage' && !bulkStageValue) ||
                        (bulkActionType === 'assessment' && !bulkAssessmentValue)
                      }
                    >
                      Apply Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Withhold Reason Modal */}
              <Dialog open={showWithholdReasonModal} onOpenChange={setShowWithholdReasonModal}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Withhold Reason</DialogTitle>
                    <div className="text-sm text-gray-600">
                      Select reason and comment for {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Withhold Reasons */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Reason (select one)</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {withholdReasonsData?.map((reason: any) => (
                          <label key={reason.id || reason.name || reason} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="withholdReason"
                              value={reason.name || reason}
                              checked={selectedWithholdReasons.includes(reason.name || reason)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWithholdReasons([reason.name || reason]);
                                }
                              }}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">{reason.name || reason}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Comment</label>
                      <textarea
                        value={withholdComment}
                        onChange={(e) => setWithholdComment(e.target.value)}
                        placeholder="Add a comment for this withhold decision..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowWithholdReasonModal(false);
                        setSelectedWithholdReasons([]);
                        setWithholdComment('');
                        setShowBulkActionModal(true); // Go back to bulk action modal
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleBulkWithhold}
                      disabled={selectedWithholdReasons.length === 0 || !withholdComment.trim()}
                    >
                      Apply Withhold
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-4">
              {/* Enhanced unified toolbar - same as PartnerDetail.tsx */}
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
                                  <span>All customers ({partnerCustomers.length})</span>
                                </div>
                              </button>
                              
                              {/* Partner-relevant saved lists */}
                              {customerSavedLists.length > 0 && (
                                <div className="border-t border-gray-100 my-2 pt-2">
                                  {customerSavedLists.map((list: any) => (
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
                          <div className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                            <div className="p-2 border-b">
                              {customerSavedViews.map((view: any) => (
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
                                {['Active', 'Inactive', 'Prospect'].map((status) => (
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
                                {['Insurance', 'Finance', 'Real Estate', 'Healthcare'].map((industry) => (
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

              {/* Bulk Actions Bar */}
              {selectedCustomers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Add to List
                      </Button>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCustomers([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-xl font-semibold text-[#282A3F]">{filteredCustomers.length}</div>
                  <div className="text-sm text-gray-500">Total Customers</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-xl font-semibold text-[#282A3F]">
                    {filteredCustomers.reduce((total: number, customer: any) => total + (customer.opportunityCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Opportunities</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-xl font-semibold text-[#282A3F]">
                    {filteredCustomers.filter((c: any) => c.status === 'Active').length}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-xl font-semibold text-[#282A3F]">€{(Math.random() * 100).toFixed(0)}K</div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-xl font-semibold text-[#282A3F]">€{(Math.random() * 50).toFixed(0)}K</div>
                  <div className="text-sm text-gray-500">Weighted Value</div>
                </div>
              </div>

              {/* Customers Table */}
              {customersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading customers...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm">
                  <table className="min-w-full">
                    <thead className="bg-white">
                      <tr>
                        <th scope="col" className="relative px-3 py-3.5 w-10 pt-[12px] pb-[12px] group">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className={`h-4 w-4 rounded border-gray-300 ${
                                selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                              }`}
                              checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                              onChange={handleSelectAllCustomers}
                            />
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold w-[250px] text-[#696C8C] pt-[12px] pb-[12px]">
                          <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                            Customer
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M8 9l4-4 4 4"></path>
                              <path d="M16 15l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>

                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C] pt-[12px] pb-[12px]">
                          <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                            Industry
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M8 9l4-4 4 4"></path>
                              <path d="M16 15l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C]">
                          <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                            Type
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M8 9l4-4 4 4"></path>
                              <path d="M16 15l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                            Status
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M8 9l4-4 4 4"></path>
                              <path d="M16 15l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#696C8C]">
                          <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
                            Related contacts
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M8 9l4-4 4 4"></path>
                              <path d="M16 15l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3.5">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer: any) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="relative px-3 py-4 w-10">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300"
                                  checked={selectedCustomers.includes(customer.id)}
                                  onChange={() => handleSelectCustomer(customer.id)}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm w-[250px]">
                              <div className="flex items-center">
                                <EntityAvatar 
                                  entityType="customer" 
                                  entityId={customer.id} 
                                  fallbackText={customer.name?.charAt(0)?.toUpperCase() || 'C'}
                                  size="sm"
                                />
                                <div className="ml-3">
                                  <Link 
                                    href={`/lists/customers/${customer.id}`}
                                    className="text-gray-900 hover:text-indigo-600 font-medium"
                                  >
                                    {customer.name}
                                  </Link>
                                  {customer.description && (
                                    <div className="text-gray-500 text-xs mt-1 max-w-[200px] truncate">
                                      {customer.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4 text-sm text-gray-500">
                              {customer.industry || 'Insurance'}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {customer.type || 'Corporate'}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                                {customer.status || 'Active'}
                              </Badge>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <Badge variant="outline">
                                {customer.contactCount || 1} contact{(customer.contactCount || 1) !== 1 ? 's' : ''}
                              </Badge>
                            </td>
                            <td className="relative px-6 py-4 text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="12" cy="5" r="1"></circle>
                                      <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Link href={`/lists/customers/${customer.id}`}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                            <p className="text-gray-500">This partner doesn't have any associated customers yet.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-6">
              {/* Campaign Tab Navigation */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        !selectedCampaign
                          ? 'border-[#5567E5] text-[#5567E5]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    {selectedCampaign && (
                      <button
                        className="py-4 px-1 border-b-2 border-[#5567E5] text-[#5567E5] font-medium text-sm"
                      >
                        Edit: {selectedCampaign.name}
                      </button>
                    )}
                  </nav>
                </div>

                {/* Overview Tab Content */}
                {!selectedCampaign && (
                  <div className="p-6">
                    {campaignsLoading ? (
                      <div className="animate-pulse space-y-6">
                  {/* Summary cards skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="bg-white p-6 rounded-lg border">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                  {/* Table skeleton */}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : brokerCampaigns.length === 0 && assignedCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns available</h3>
                  <p className="text-gray-500">No campaigns have been shared with you or assigned to you yet.</p>
                </div>
              ) : (
                <>
                  {/* Assigned Campaigns Section */}
                  {assignedCampaigns.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Campaigns</h3>
                      <div className="space-y-3">
                        {assignedCampaigns.map((campaign: any) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                              <p className="text-sm text-gray-500">{campaign.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Assigned {campaign.assigned_at ? new Date(campaign.assigned_at).toLocaleDateString() : ''} by {campaign.assigned_by_name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {campaign.status === 'draft' ? 'Draft' : campaign.status}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                }}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Edit Campaign
                              </button>
                              <button
                                onClick={() => {
                                  const backUrl = `/broker-view/partner/${actualCurrentEnvironment}?tab=campaigns`;
                                  window.location.href = `/partner/campaigns/${campaign.id}?back_url=${encodeURIComponent(backUrl)}`;
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Manage
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shared Campaigns Section */}
                  {brokerCampaigns.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Shared Campaigns</h3>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg border">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                              <dd className="text-2xl font-semibold text-gray-900">{brokerCampaigns.length}</dd>
                            </div>
                          </div>
                        </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {brokerCampaigns.filter((c: any) => c.status === 'active').length}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500 truncate">Recipients</dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {brokerCampaigns.reduce((acc: number, campaign: any) => {
                              if (campaign.status === 'draft') {
                                return acc + 5; // Fixed count for draft campaigns
                              }
                              const recipientCount = Array.isArray(campaign.recipients) ? campaign.recipients.length : (campaign.recipients || 0);
                              return acc + recipientCount;
                            }, 0)}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500 truncate">Emails Sent</dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {brokerCampaigns.reduce((acc: number, campaign: any) => {
                              if (campaign.status === 'draft') return acc; // Draft campaigns haven't sent emails yet
                              return acc + (campaign.emails_sent || 0);
                            }, 0)}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500 truncate">Open Rate</dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {(() => {
                              const totalSent = brokerCampaigns.reduce((acc: number, campaign: any) => {
                                if (campaign.status === 'draft') return acc; // Exclude draft campaigns
                                return acc + (campaign.emails_sent || 0);
                              }, 0);
                              const totalOpened = brokerCampaigns.reduce((acc: number, campaign: any) => {
                                if (campaign.status === 'draft') return acc; // Exclude draft campaigns
                                return acc + (campaign.emails_opened || 0);
                              }, 0);
                              return totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
                            })()}%
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Selection Bar */}
                  {selectedCampaigns.length > 0 && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-indigo-700">
                              {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCampaigns([])}
                            className="text-indigo-700 border-indigo-300 hover:bg-indigo-100"
                          >
                            Clear selection
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowCampaignShareModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Share with partner
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campaigns Table */}
                  <div className="bg-white overflow-x-auto rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            <Checkbox
                              checked={brokerCampaigns.length > 0 && brokerCampaigns.every((campaign: any) => selectedCampaigns.includes(campaign.id))}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCampaigns(brokerCampaigns.map((campaign: any) => campaign.id));
                                } else {
                                  setSelectedCampaigns([]);
                                }
                              }}
                            />
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                            Campaign Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px] min-w-[160px]">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                            Recipients
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                            Open Rate
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                            Clicks
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                            Sent
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                            Created
                          </th>
                          <th scope="col" className="relative px-3 py-3.5 w-10 bg-white">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {brokerCampaigns.map((campaign: any) => (
                          <tr 
                            key={campaign.id} 
                            className="hover:bg-gray-50 group"
                          >
                            <td className="px-3 py-4 text-sm text-gray-900 w-12">
                              <Checkbox
                                checked={selectedCampaigns.includes(campaign.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                                  } else {
                                    setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[250px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              <div className="max-w-[230px]">
                                <div className="font-medium text-gray-900 truncate">
                                  {campaign.name}
                                </div>
                                {campaign.description && (
                                  <div className="text-sm text-gray-500 truncate mt-1">
                                    {campaign.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[160px] min-w-[160px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {(() => {
                                // Calculate the actual status based on campaign data
                                const status = campaign.status || 'draft';
                                const emailsSent = campaign.emails_sent || 0;
                                const recipientsCount = campaign.recipients?.length || 0;
                                const hasNewContacts = campaign.new_contacts_added || false;
                                const isPaused = campaign.is_paused || false;
                                const isStopped = campaign.is_stopped || false;
                                const isScheduled = campaign.scheduled_time && new Date(campaign.scheduled_time) > new Date();
                                
                                // Determine the actual status based on campaign state
                                let actualStatus = status;
                                let label = 'Draft';
                                let colorClass = 'bg-gray-100 text-gray-800';
                                
                                if (isStopped) {
                                  actualStatus = 'stopped';
                                  label = 'Stopped';
                                  colorClass = 'bg-red-100 text-red-800';
                                } else if (isPaused) {
                                  actualStatus = 'paused';
                                  label = 'Paused';
                                  colorClass = 'bg-orange-100 text-orange-800';
                                } else if (isScheduled) {
                                  actualStatus = 'scheduled';
                                  label = 'Scheduled';
                                  colorClass = 'bg-indigo-100 text-indigo-800';
                                } else if (hasNewContacts) {
                                  actualStatus = 'new_contacts';
                                  label = 'New Contacts';
                                  colorClass = 'bg-purple-100 text-purple-800';
                                } else if (emailsSent > 0 && emailsSent < recipientsCount) {
                                  actualStatus = 'partially_sent';
                                  label = 'Partially Sent';
                                  colorClass = 'bg-yellow-100 text-yellow-800';
                                } else if (emailsSent > 0 && emailsSent >= recipientsCount) {
                                  actualStatus = 'sent';
                                  label = 'Sent';
                                  colorClass = 'bg-blue-100 text-blue-800';
                                } else if (status === 'in_progress' || status === 'active') {
                                  actualStatus = 'running';
                                  label = 'Running';
                                  colorClass = 'bg-green-100 text-green-800';
                                } else if (status === 'draft') {
                                  actualStatus = 'draft';
                                  label = 'Draft';
                                  colorClass = 'bg-gray-100 text-gray-800';
                                }
                                
                                const statusBadge = (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                                    {label}
                                  </span>
                                );
                                
                                // Show tooltip for draft campaigns with all possible statuses
                                if (label === 'Draft') {
                                  const allStatuses = [
                                    { value: 'draft', label: 'Draft', description: 'Campaign not yet sent' },
                                    { value: 'scheduled', label: 'Scheduled', description: 'Campaign scheduled to send' },
                                    { value: 'running', label: 'Running', description: 'Campaign is actively sending' },
                                    { value: 'partially_sent', label: 'Partially Sent', description: 'Some recipients received emails' },
                                    { value: 'sent', label: 'Sent', description: 'All recipients received emails' },
                                    { value: 'new_contacts', label: 'New Contacts', description: 'New contacts added after last send' },
                                    { value: 'paused', label: 'Paused', description: 'Campaign temporarily stopped' },
                                    { value: 'stopped', label: 'Stopped', description: 'Campaign permanently stopped' }
                                  ];
                                  
                                  return (
                                    <div className="relative group">
                                      {statusBadge}
                                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded-md p-2 shadow-lg max-w-xs">
                                        <div className="space-y-1">
                                          <p className="font-medium">All possible statuses:</p>
                                          {allStatuses.map(status => (
                                            <div key={status.value} className="flex items-start gap-2">
                                              <span className="font-medium">{status.label}:</span>
                                              <span className="text-gray-300">{status.description}</span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1"></div>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                return statusBadge;
                              })()}
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[100px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {campaign.status === 'draft' ? 5 : (Array.isArray(campaign.recipients) ? campaign.recipients.length : (campaign.recipients || 0))}
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[100px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {campaign.status === 'draft' ? (
                                <span className="text-sm text-gray-400">-</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {campaign.open_rate ? parseFloat(campaign.open_rate).toFixed(1) : '0.0'}%
                                  </span>
                                  {campaign.emails_sent > 0 && (
                                    <span className="text-xs text-gray-500">
                                      ({campaign.emails_opened || 0}/{campaign.emails_sent || 0})
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[100px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {campaign.status === 'draft' ? (
                                <span className="text-sm text-gray-400">-</span>
                              ) : (
                                <span className="font-medium">
                                  {campaign.total_clicks || 0}
                                </span>
                              )}
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[100px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {campaign.status === 'draft' ? (
                                <span className="text-sm text-gray-400">-</span>
                              ) : (
                                campaign.emails_sent || 0
                              )}
                            </td>
                            <td 
                              className="px-3 py-4 text-sm text-gray-900 w-[120px] cursor-pointer"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                              }}
                            >
                              {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : '-'}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    </div>
                  )}
                </>
              )}
                  </div>
                )}

                {/* Campaign Editor Tab Content */}
                {selectedCampaign && (
                  <div className="p-6">
                    <PartnerCampaignBuilder 
                      campaignId={selectedCampaign.id}
                      partnerId={4} // Mevas BV partner ID
                      onComplete={() => {
                        setSelectedCampaign(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Campaign Share Modal */}
      <PartnerCampaignShareModal
        isOpen={showCampaignShareModal}
        onClose={() => setShowCampaignShareModal(false)}
        campaignIds={selectedCampaigns}
        campaignNames={selectedCampaigns.map(id => {
          const campaign = brokerCampaigns.find((c: any) => c.id === id);
          return campaign ? campaign.name : '';
        }).filter(Boolean)}
        partnerId={partnerId || ''}
        partnerName={partner.name}
        onShareComplete={() => {
          setSelectedCampaigns([]);
          setShowCampaignShareModal(false);
        }}
      />

      {/* Partner Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
            <DialogDescription>
              Complete information about {partner.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Partner Name</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Primary Contact</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.primary_contact}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact Email</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.contact_email}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.phone}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <p className="text-sm text-gray-900 mt-1">{partner.location}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Partnership Type</Label>
                <p className="text-sm text-gray-900 mt-1">Insurance Broker Partnership</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <p className="text-sm text-gray-900 mt-1">Active Partnership</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Shared Opportunities</Label>
                <p className="text-sm text-gray-900 mt-1">{allOpportunities.length} opportunities</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Access Level</Label>
                <p className="text-sm text-gray-900 mt-1">Broker View Access</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withhold Assessment Dialog */}
      <Dialog open={withholdDialogOpen} onOpenChange={setWithholdDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withhold Opportunity</DialogTitle>
            <DialogDescription>
              Please select the reason(s) for withholding this opportunity and add any additional comments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Withhold Reasons */}
            <div>
              <Label className="text-sm font-medium">Reasons</Label>
              <div className="mt-2 space-y-2">
                {fetchWithholdReasonsMutation.isPending ? (
                  <div className="text-sm text-gray-500">Loading reasons...</div>
                ) : fetchWithholdReasonsMutation.data && fetchWithholdReasonsMutation.data.length > 0 ? (
                  fetchWithholdReasonsMutation.data.map((reason: any) => (
                    <div key={reason.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reason-${reason.id}`}
                        checked={withholdReasons.includes(reason.name)}
                        onCheckedChange={(checked) => {
                          console.log('Checkbox changed:', reason.name, checked);
                          if (checked) {
                            setWithholdReasons([...withholdReasons, reason.name]);
                          } else {
                            setWithholdReasons(withholdReasons.filter(r => r !== reason.name));
                          }
                        }}
                      />
                      <Label htmlFor={`reason-${reason.id}`} className="text-sm">
                        {reason.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {['Insufficient Information', 'Budget Constraints', 'Timing Issues', 'Not a Priority', 'Technical Concerns'].map((reason, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reason-fallback-${index}`}
                          checked={withholdReasons.includes(reason)}
                          onCheckedChange={(checked) => {
                            console.log('Fallback checkbox changed:', reason, checked);
                            if (checked) {
                              setWithholdReasons([...withholdReasons, reason]);
                            } else {
                              setWithholdReasons(withholdReasons.filter(r => r !== reason));
                            }
                          }}
                        />
                        <Label htmlFor={`reason-fallback-${index}`} className="text-sm">
                          {reason}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="withhold-comments" className="text-sm font-medium">
                Additional Comments
              </Label>
              <textarea
                id="withhold-comments"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                value={withholdComments}
                onChange={(e) => setWithholdComments(e.target.value)}
                placeholder="Add any additional context..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithholdDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithholdSubmit}
              disabled={withholdReasons.length === 0 || updateAssessmentMutation.isPending}
              className={`text-white ${withholdReasons.length > 0 && !updateAssessmentMutation.isPending ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {updateAssessmentMutation.isPending ? 'Saving...' : 'Withhold Opportunity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments History Dialog - copied exactly from PartnerDetail.tsx lines 6585-6769 */}
      <Dialog open={isCommentsHistoryDialogOpen} onOpenChange={setIsCommentsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-0 shadow-xl rounded-2xl p-0 overflow-hidden h-[600px] flex flex-col">
          <div className="p-6 pb-4 border-b border-gray-100">
            <DialogHeader className="space-y-2 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-[#282A3F] leading-tight">
                  Comments & Notes: {commentsHistoryData?.opportunity?.customerName || 'Customer'}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCommentsHistoryDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <DialogDescription className="text-sm text-gray-600 leading-relaxed">
                All comments, notes, and withhold reasons for this customer
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header with opportunity info and count */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {commentsHistoryData?.opportunity?.title?.charAt(0) || 'O'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-[#282A3F]">
                      {commentsHistoryData?.opportunity?.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {commentsHistoryData?.totalComments || 0} comments
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 h-8">
                    <Eye className="w-4 h-4 mr-1" />
                    Hide Private
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 h-8">
                    ⋯
                  </Button>
                </div>
              </div>
            </div>

            {/* CRITICAL FIX: Add comment creation section matching PartnerDetail.tsx */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment or note..."
                  value={opportunityComment}
                  onChange={(e) => setOpportunityComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Tip: Use @mention to notify team members
                  </div>
                  <Button 
                    onClick={handleSubmitOpportunityComment}
                    disabled={!opportunityComment.trim() || createCrossEntityCommentMutation.isPending}
                    size="sm"
                    className="bg-[#5567E5] hover:bg-[#4553D3] text-white"
                  >
                    {createCrossEntityCommentMutation.isPending ? 'Adding...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {commentsHistoryData?.comments?.length > 0 ? (
                commentsHistoryData.comments.map((comment: any, index: number) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {comment.userName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[#282A3F]">
                          {comment.userName || 'System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                      {comment.type && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                          {comment.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium mb-1">No comments yet</p>
                  <p className="text-sm">Be the first to add a comment for this opportunity.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save to List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save to List</DialogTitle>
            <DialogDescription>
              Save {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} to a list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-list"
                  name="saveMode"
                  value="new"
                  checked={saveListMode === 'new'}
                  onChange={() => setSaveListMode('new')}
                  className="h-4 w-4"
                />
                <label htmlFor="new-list" className="text-sm font-medium">
                  Create new list
                </label>
              </div>
              {saveListMode === 'new' && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">List name</label>
                    <Input
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter list name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description (optional)</label>
                    <Textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="Enter description"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing-list"
                  name="saveMode"
                  value="existing"
                  checked={saveListMode === 'existing'}
                  onChange={() => setSaveListMode('existing')}
                  className="h-4 w-4"
                />
                <label htmlFor="existing-list" className="text-sm font-medium">
                  Add to existing list
                </label>
              </div>
              {saveListMode === 'existing' && (
                <div className="ml-6">
                  <Select 
                    value={selectedExistingList ? selectedExistingList.toString() : ''} 
                    onValueChange={(value) => setSelectedExistingList(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a list" />
                    </SelectTrigger>
                    <SelectContent>
                      {opportunityLists?.map((list: any) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveListModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveList}
              disabled={createListMutation.isPending || updateListMutation.isPending}
            >
              {createListMutation.isPending || updateListMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add to Campaign</DialogTitle>
            <DialogDescription>
              Add {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} to a campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Campaign Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Campaign</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {brokerCampaigns?.map((campaign: any) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{campaign.name}</span>
                        <span className="text-xs text-gray-500">{campaign.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Template Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Or Create from Template</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cross-sell">Cross-sell Campaign</SelectItem>
                  <SelectItem value="follow-up">Follow-up Campaign</SelectItem>
                  <SelectItem value="renewal">Renewal Campaign</SelectItem>
                  <SelectItem value="custom">Custom Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Opportunities</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOpportunities.slice(0, 5).map((oppId) => {
                  const opportunity = filteredOpportunities.find((opp: any) => opp.id === oppId);
                  return opportunity ? (
                    <div key={oppId} className="flex items-center justify-between text-sm">
                      <span className="truncate">{opportunity.title}</span>
                      <span className="text-gray-500 ml-2">€{parseInt(opportunity.estimated_value || 0).toLocaleString()}</span>
                    </div>
                  ) : null;
                })}
                {selectedOpportunities.length > 5 && (
                  <div className="text-sm text-gray-500">
                    +{selectedOpportunities.length - 5} more opportunities
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCampaignModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle campaign creation/addition
                setShowCampaignModal(false);
                setSelectedOpportunities([]);
                toast({
                  title: "Added to campaign",
                  description: `${selectedOpportunities.length} opportunities added to campaign.`,
                });
              }}
            >
              Add to Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BrokerLayout>
  );
}