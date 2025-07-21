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
import { ArrowLeft, Search, Bot, Copy, Users, Trash2, MoreHorizontal, MoreVertical, MessageSquare, MessageCircle, CheckCircle, XCircle, Eye, Edit, Filter, Package, Target, Crown, ChevronDown, ChevronRight, Share2, X, Bookmark, Columns3, Send, AlertTriangle, Plus, Mail, Calendar, Clock, Play, Pause, AlertCircle } from "lucide-react";
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

// GET ENVIRONMENT BRANDING - RESPECTS USER SELECTION
const getEnvironmentBranding = (envId: string) => {
  console.log('🎯 BROKER VIEW - getEnvironmentBranding called with envId:', envId);
  
  // Use simple environment mapping based on user selection
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
    } else {
      // Just update state to match current detected environment
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

  // Opportunities toolbar state management
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeOpportunitiesList, setActiveOpportunitiesList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOpportunityType, setSelectedOpportunityType] = useState('');
  const [renderKey, setRenderKey] = useState(0);

  // Always use fresh environment value to ensure we get the latest
  const actualCurrentEnvironment = getCurrentEnvironment();

  // Debug logs after state declarations
  console.log('🚨 BROKER VIEW - RENDER - Render key:', renderKey);
  console.log('🚨 BROKER VIEW - Current environment (state):', currentEnvironment);
  console.log('🚨 BROKER VIEW - Current environment (actual):', actualCurrentEnvironment);
  
  // Force re-render when environment changes
  useEffect(() => {
    const handleEnvironmentChange = () => {
      console.log('🚨 BROKER VIEW - Environment changed detected!');
      const newEnv = getCurrentEnvironment();
      console.log('🚨 BROKER VIEW - New environment:', newEnv);
      setCurrentEnvironment(newEnv);
      setRenderKey(prev => prev + 1);
    };

    // Listen for stable environment changes
    window.addEventListener('stableEnvironmentChanged', handleEnvironmentChange);
    window.addEventListener('environmentChanged', handleEnvironmentChange);
    window.addEventListener('storage', handleEnvironmentChange);
    
    // Also check for environment changes on window focus
    const handleFocus = () => {
      const newEnv = getCurrentEnvironment();
      if (newEnv !== currentEnvironment) {
        console.log('🚨 BROKER VIEW - Environment changed on focus:', newEnv);
        setCurrentEnvironment(newEnv);
        setRenderKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('stableEnvironmentChanged', handleEnvironmentChange);
      window.removeEventListener('environmentChanged', handleEnvironmentChange);
      window.removeEventListener('storage', handleEnvironmentChange);
      window.removeEventListener('focus', handleFocus);
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
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Mirror PartnerDetail.tsx state exactly for opportunities
  const [opportunityFilters, setOpportunityFilters] = useState({
    status: 'All',
    stage: 'All', 
    size: 'All',
    type: 'All'
  });
  const [hasActiveOpportunityFilters, setHasActiveOpportunityFilters] = useState(false);
  const [activeOpportunityView, setActiveOpportunityView] = useState<any>(null);
  const [showOpportunityViewsDropdown, setShowOpportunityViewsDropdown] = useState(false);
  const [showSaveOpportunityViewModal, setShowSaveOpportunityViewModal] = useState(false);
  const [opportunityViewNameInput, setOpportunityViewNameInput] = useState('');
  const [showOpportunityFieldsDropdown, setShowOpportunityFieldsDropdown] = useState(false);
  const [opportunityVisibleFields, setOpportunityVisibleFields] = useState({
    title: true,
    customer: true,
    stage: true,
    value: true,
    priority: true,
    type: true,
    size: true,
    accountManager: true,
    lastActivity: true
  });
  const [originalOpportunityFilters, setOriginalOpportunityFilters] = useState<any>(null);
  const [originalOpportunityVisibleFields, setOriginalOpportunityVisibleFields] = useState<any>(null);
  const [showOpportunityFilter, setShowOpportunityFilter] = useState(false);

  // Mirror PartnerDetail.tsx state exactly for customers  
  const [customerFilters, setCustomerFilters] = useState({
    status: 'All',
    industry: 'All', 
    size: 'All',
    region: 'All'
  });
  const [hasActiveCustomerFilters, setHasActiveCustomerFilters] = useState(false);
  const [activeCustomerView, setActiveCustomerView] = useState<any>(null);
  const [showCustomerViewsDropdown, setShowCustomerViewsDropdown] = useState(false);
  const [showSaveCustomerViewModal, setShowSaveCustomerViewModal] = useState(false);
  const [customerViewNameInput, setCustomerViewNameInput] = useState('');
  const [showCustomerFieldsDropdown, setShowCustomerFieldsDropdown] = useState(false);
  const [customerVisibleFields, setCustomerVisibleFields] = useState({
    name: true,
    industry: true,
    region: true,
    contactPerson: true,
    phone: true,
    email: true,
    opportunities: true,
    totalValue: true,
    lastActivity: true
  });
  const [originalCustomerFilters, setOriginalCustomerFilters] = useState<any>(null);
  const [originalCustomerVisibleFields, setOriginalCustomerVisibleFields] = useState<any>(null);
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [customerViewMode, setCustomerViewMode] = useState<'list' | 'cards'>('cards');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Add required refs to match PartnerDetail.tsx
  const opportunityViewsDropdownRef = useRef<HTMLDivElement>(null);
  const opportunityViewsButtonRef = useRef<HTMLButtonElement>(null);
  const opportunityFieldsDropdownRef = useRef<HTMLDivElement>(null);
  const customerViewsDropdownRef = useRef<HTMLDivElement>(null);
  const customerViewsButtonRef = useRef<HTMLButtonElement>(null);
  const customerFieldsDropdownRef = useRef<HTMLDivElement>(null);
  const customerFilterDropdownRef = useRef<HTMLDivElement>(null);

  // Add change detection functions exactly like PartnerDetail.tsx
  const hasOpportunityChanges = () => {
    if (activeOpportunityView && (originalOpportunityFilters || originalOpportunityVisibleFields)) {
      const filtersChanged = originalOpportunityFilters && JSON.stringify(opportunityFilters) !== JSON.stringify(originalOpportunityFilters);
      const fieldsChanged = originalOpportunityVisibleFields && JSON.stringify(opportunityVisibleFields) !== JSON.stringify(originalOpportunityVisibleFields);
      return filtersChanged || fieldsChanged;
    }
    if (!activeOpportunityView) {
      const hasFilterChanges = opportunityFilters.status !== 'All' || 
                              opportunityFilters.stage !== 'All' || 
                              opportunityFilters.size !== 'All' || 
                              opportunityFilters.type !== 'All';
      const hasFieldChanges = Object.values(opportunityVisibleFields).some(visible => !visible);
      return hasFilterChanges || hasFieldChanges;
    }
    return false;
  };

  const hasCustomerChanges = () => {
    if (activeCustomerView && (originalCustomerFilters || originalCustomerVisibleFields)) {
      const filtersChanged = originalCustomerFilters && JSON.stringify(customerFilters) !== JSON.stringify(originalCustomerFilters);
      const fieldsChanged = originalCustomerVisibleFields && JSON.stringify(customerVisibleFields) !== JSON.stringify(originalCustomerVisibleFields);
      return filtersChanged || fieldsChanged;
    }
    if (!activeCustomerView) {
      const hasFilterChanges = customerFilters.status !== 'All' || 
                              customerFilters.industry !== 'All' || 
                              customerFilters.size !== 'All' || 
                              customerFilters.region !== 'All';
      const hasFieldChanges = Object.values(customerVisibleFields).some(visible => !visible);
      return hasFilterChanges || hasFieldChanges;
    }
    return false;
  };

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

  // Get partner information based on selected environment (front-end only hack)
  const getPartnerInfoForEnvironment = (envId: string) => {
    console.log('🚨 BROKER VIEW - getPartnerInfoForEnvironment called with envId:', envId);
    const branding = getEnvironmentBranding(envId);
    console.log('🚨 BROKER VIEW - branding result:', branding);
    const partnerInfo = {
      id: envId,
      name: branding.partnerName,
      description: `Insurance company that shared this list with Regional Insurance Partners`,
      primary_contact: 'Partnership Manager',
      contact_email: `partnerships@${envId}.nl`,
      location: 'Netherlands',
      phone: '+31 70 344 2000'
    };
    console.log('🚨 BROKER VIEW - partnerInfo result:', partnerInfo);
    return partnerInfo;
  };

  // For broker view, show the appropriate partner based on selected environment
  console.log('Broker POV - Current environment (state):', currentEnvironment);
  console.log('Broker POV - Current environment (actual):', actualCurrentEnvironment);
  
  // Get the correct logo for broker view with fallback (using environment branding)
  const getBrokerLogo = (envId: string) => {
    const branding = getEnvironmentBranding(envId);
    return branding.logo;
  };
  
  // Use the actual current environment instead of stale state - force cache bust
  const environmentLogo = getBrokerLogo(actualCurrentEnvironment);
  const partner = getPartnerInfoForEnvironment(actualCurrentEnvironment);
  
  // Simple environment logging without aggressive cache busting
  useEffect(() => {
    console.log('🎯 BROKER VIEW - Environment and partner info:', {
      environment: actualCurrentEnvironment,
      partnerName: partner.name,
      logoSrc: environmentLogo
    });
  }, [partner.name, actualCurrentEnvironment, environmentLogo]);
  
  // Simple environment sync without aggressive cache busting
  useEffect(() => {
    const syncEnvironment = () => {
      const freshEnv = getCurrentEnvironment();
      if (freshEnv !== currentEnvironment) {
        console.log('🎯 BROKER VIEW - Environment sync:', { from: currentEnvironment, to: freshEnv });
        setCurrentEnvironment(freshEnv);
        setRenderKey(prev => prev + 1);
      }
    };
    
    syncEnvironment();
  }, [currentEnvironment]);

  // Fetch broker campaigns (shared campaigns)
  const { data: brokerCampaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/broker/shared-campaigns`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/broker/shared-campaigns`),
    enabled: activeTab === 'campaigns',
    staleTime: 2 * 60 * 1000,
  });

  // Fetch assigned campaigns for this partner
  const { data: assignedCampaigns = [], isLoading: assignedCampaignsLoading } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/partners/${partnerId}/assigned-campaigns`],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/partners/${partnerId}/assigned-campaigns`),
    enabled: activeTab === 'campaigns' && !!partnerId,
    staleTime: 2 * 60 * 1000,
  });

  // For broker view, fetch opportunities with proper list filtering
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/opportunities`, activeOpportunitiesList?.id],
    queryFn: async () => {
      const listParam = activeOpportunitiesList?.id ? `?listId=${activeOpportunitiesList.id}&brokerView=true` : '?brokerView=true';
      const result = await apiRequest('GET', `/api/${actualCurrentEnvironment}/opportunities${listParam}`);
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

  // Fetch customers for this partner in broker view - filtered by shared opportunities
  const { data: partnerCustomers = [], isLoading: customersLoading } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/partners/4/customers`, allOpportunities.length],
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

  // Customer lists and views data
  const { data: customerSavedLists = [] } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/saved-lists`, { entity_type: 'customers', partner_id: 4 }],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/saved-lists?entity_type=customers&partner_id=4`),
  });

  const { data: customerSavedViews = [] } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/saved-views`, { entity_type: 'customers' }],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/saved-views?entity_type=customers`),
  });

  // Customer filtering state (avoid duplicates)
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  
  // Add customers data fetch - similar to opportunities
  const { data: customers = [] } = useQuery({
    queryKey: [`/api/${currentEnvironment}/customers`],
    enabled: activeTab === "customers"
  });
  const [activeCustomerList, setActiveCustomerList] = useState<any>(null);
  const [showCustomerListsDropdown, setShowCustomerListsDropdown] = useState(false);
  const [showCustomerStatusDropdown, setShowCustomerStatusDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

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





  // Fetch all lists shared with John Smith or partners using the new broker-specific endpoint
  const { data: savedListsData } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/broker/shared-lists`, 'opportunities'],
    queryFn: () => apiRequest('GET', `/api/${actualCurrentEnvironment}/broker/shared-lists?entity_type=opportunities`),
    staleTime: 0, // Always refresh to get latest data
    refetchOnWindowFocus: true,
  });

  // All returned lists are already filtered to show only those shared with John Smith or partners
  const partnerRelevantLists = savedListsData || [];
  
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

  // Further filter opportunities based on search and selected filters
  const filteredOpportunities = baseOpportunities.filter((opportunity: any) => {
    // Filter by search text
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.clientName?.toLowerCase().includes(searchLower) ||
        opportunity.customerName?.toLowerCase().includes(searchLower) ||
        opportunity.stage?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Filter by status/stage if selected
    if (selectedStatus && selectedStatus !== 'all' && opportunity.stage !== selectedStatus) {
      return false;
    }
    
    // Filter by customer if selected
    if (selectedCustomer && selectedCustomer !== 'all' && opportunity.clientName !== selectedCustomer) {
      return false;
    }
    
    // Filter by opportunity type if selected
    if (selectedOpportunityType && selectedOpportunityType !== 'all' && opportunity.type !== selectedOpportunityType) {
      return false;
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
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extract unique values for dropdowns
  const uniqueStages = Array.from(new Set(allOpportunities.map((opp: any) => opp.stage).filter(Boolean))) as string[];
  const uniqueCustomers = Array.from(new Set(allOpportunities.map((opp: any) => opp.clientName).filter(Boolean))) as string[];

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

  // Comments history query - CRITICAL FIX: Use environment-specific API path for broker view
  const { data: commentsHistoryData, refetch: refetchCommentsHistory } = useQuery({
    queryKey: [`/api/${actualCurrentEnvironment}/opportunities/${selectedOpportunityForHistory?.id}/comments`],
    enabled: !!selectedOpportunityForHistory?.id && isCommentsHistoryDialogOpen,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
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


        </div>

        {/* Content area - Clean broker view without tabs */}
        <div className="px-6 py-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Broker Portal</h3>
            <p className="text-gray-600">Welcome to your broker portal interface</p>
          </div>
        </div>

        {/* Close main container div */}
      </div>

      {/* Campaign Share Modal */}
      <PartnerCampaignShareModal
        isOpen={isCampaignShareModalOpen}
        onOpenChange={setIsCampaignShareModalOpen}
        partnerId={partnerId}
        partnerName={partner.name}
        selectedCampaign={campaignToShare}
        onShare={(type) => {
          console.log('Campaign shared:', type);
          setIsCampaignShareModalOpen(false);
          setCampaignToShare(null);
        }}
      />

      {/* Comments History Dialog */}
      <Dialog open={isCommentsHistoryDialogOpen} onOpenChange={setIsCommentsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Comments History: {selectedOpportunityForHistory?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {commentsHistoryData && commentsHistoryData.length > 0 ? (
              commentsHistoryData.map((comment: any) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-gray-900">{comment.author_name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</div>
                  {comment.activity_type && (
                    <div className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {comment.activity_type}
                    </div>
                  )}
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
        </DialogContent>
      </Dialog>
    </BrokerLayout>
  );
}
