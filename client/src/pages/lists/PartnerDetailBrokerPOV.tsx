import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Search } from "lucide-react";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import EntityAvatar from "@/components/EntityAvatar";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { BrokerLayout } from "@/components/layouts/BrokerLayout";
import deGoudseLogo from "@assets/De_Goudse_logo_1749714740191.png";



export default function PartnerDetailBrokerPOV() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { environment } = useEnvironment();
  const { toast } = useToast();
  
  // Get URL parameters for tab and list selection
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const listParam = urlParams.get('list');
  
  const [activeTab, setActiveTab] = useState(tabParam || "okr-plans");
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");

  // Opportunities toolbar state management
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeOpportunitiesList, setActiveOpportunitiesList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOpportunityType, setSelectedOpportunityType] = useState('');
  const [renderKey, setRenderKey] = useState(0);
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

  // For broker view, show De Goudse as the sharing partner
  const partner = {
    id: 'degoudse',
    name: 'De Goudse',
    description: 'Insurance company that shared this list with Regional Insurance Partners',
    primary_contact: 'Partnership Manager',
    contact_email: 'partnerships@degoudse.nl',
    location: 'Netherlands',
    phone: '+31 20 123 4567'
  };

  // For Regional Insurance Partners in broker view, show opportunities associated with this partner
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/partners/4/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/partners/4/opportunities'),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch customers for this partner in broker view
  const { data: partnerCustomers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/degoudse/partners/4/customers'],
    queryFn: () => apiRequest('GET', '/api/degoudse/partners/4/customers'),
    staleTime: 2 * 60 * 1000,
  });

  // Customer lists and views data
  const { data: customerSavedLists = [] } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', { entity_type: 'customers', partner_id: 4 }],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-lists?entity_type=customers&partner_id=4'),
  });

  const { data: customerSavedViews = [] } = useQuery({
    queryKey: ['/api/degoudse/saved-views', { entity_type: 'customers' }],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-views?entity_type=customers'),
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





  // Fetch saved lists for opportunities including partner-specific ones
  const { data: savedListsData } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', 'opportunities', 'partner', '4'],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-lists?entity_type=opportunities&partner_id=4'),
    staleTime: 0, // Always refresh to get latest data
    refetchOnWindowFocus: true,
  });

  // Filter lists to only show those shared with this broker (John Smith - john.smith@partner.com)
  // For broker view, only show lists that are explicitly shared with this broker
  const partnerRelevantLists = (savedListsData || []).filter((list: any) => {
    // Check if list is marked as shared - this represents proper access control
    // In production, this would also check the list_collaborators table for john.smith@partner.com
    if (list.is_shared === true) {
      console.log(`Broker has access to shared list: ${list.name} (ID: ${list.id})`);
      return true;
    } else {
      console.log(`Broker denied access to private list: ${list.name} (ID: ${list.id})`);
      return false;
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/partners/4/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      
      // Optimistically update the cached data
      queryClient.setQueryData(['/api/degoudse/partners/4/opportunities'], (oldData: any) => {
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
      console.log('=== MUTATION SUCCESS ===');
      console.log('List update successful, updating active list immediately:', data);
      console.log('Current active list before update:', activeOpportunitiesList);
      
      // Force a state update by creating a new object
      const updatedList = { ...data };
      setActiveOpportunitiesList(updatedList);
      
      console.log('Set new active list:', updatedList);
      
      const currentEnv = window.__APP_ENV__ || localStorage.getItem('selectedEnvironment') || 'myqollabi';
      
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'opportunities', 'partner', '4'] });
      
      if (currentEnv !== 'myqollabi') {
        queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/saved-lists`] });
        queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/saved-lists`, 'opportunities', 'partner', '4'] });
      }
      
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

  // Fetch OKR tags for filtering
  const { data: tags = [] } = useQuery({
    queryKey: ['/api/degoudse/okr-tags'],
    queryFn: () => apiRequest('GET', '/api/degoudse/okr-tags'),
  });

  // Mock OKR metrics for De Goudse since this is broker view
  const okrMetrics = [
    {
      id: 1,
      name: 'Customer Satisfaction Score',
      description: 'Track customer satisfaction ratings',
      unit: 'percentage',
      target_value: 85,
      current_value: 78,
      tag: 'Customer Satisfaction'
    },
    {
      id: 2,
      name: 'Premium Revenue Growth',
      description: 'Quarterly premium revenue growth rate',
      unit: 'percentage',
      target_value: 15,
      current_value: 12,
      tag: 'Financial Performance'
    }
  ];

  // Filter metrics based on search and filters
  const filteredMetrics = okrMetrics.filter(metric => {
    const matchesSearch = !searchTerm || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || metric.tag === selectedTag;
    const matchesUnit = selectedUnit === "all" || metric.unit === selectedUnit;
    
    return matchesSearch && matchesTag && matchesUnit;
  });

  // Group metrics by tag
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: any) => {
    const tag = metric.tag || 'Untagged';
    if (!acc[tag]) {
      acc[tag] = [];
    }
    acc[tag].push(metric);
    return acc;
  }, {});

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
      <div className="min-h-screen bg-white">
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
              {partner.name === 'De Goudse' ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                  <img 
                    src={deGoudseLogo} 
                    alt="De Goudse Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto">
                    Details
                  </Button>
                  <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">De Goudse</span></span>
                </div>
              </div>
              <div className="mt-1">
                <span className="text-gray-600">{partner.description}</span>
              </div>
            </div>
          </div>
          


          {/* Activity Hub - Show De Goudse's partnership activities with Regional Insurance Partners */}
          <PartnerActivityHub partnerId={4} partnerName={partner.name} />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
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
                    {tags?.map((tag: any) => (
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
                              backgroundColor: tags?.find((tag: any) => tag.name === tagName)?.color || '#6B7280'
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
                            <TableHead className="font-semibold text-gray-900">Description</TableHead>
                            <TableHead className="font-semibold text-gray-900">Current</TableHead>
                            <TableHead className="font-semibold text-gray-900">Target</TableHead>
                            <TableHead className="font-semibold text-gray-900">Progress</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tagMetrics.map((metric: any) => {
                            const progress = Math.round((metric.current_value / metric.target_value) * 100);
                            return (
                              <TableRow key={metric.id} className="border-b border-gray-100">
                                <TableCell className="font-medium">{metric.name}</TableCell>
                                <TableCell className="text-gray-600">{metric.description}</TableCell>
                                <TableCell>
                                  {metric.current_value}
                                  {metric.unit === 'percentage' && '%'}
                                </TableCell>
                                <TableCell>
                                  {metric.target_value}
                                  {metric.unit === 'percentage' && '%'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{progress}%</span>
                                  </div>
                                </TableCell>
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
                            {activeOpportunitiesList ? activeOpportunitiesList.name : 'All opportunities'}
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
                                  !activeOpportunitiesList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                  setActiveOpportunitiesList(null);
                                  setShowListsDropdown(false);
                                  // Remove list parameter from URL
                                  const newUrl = new URL(window.location.href);
                                  newUrl.searchParams.delete('list');
                                  window.history.pushState({}, '', newUrl.toString());
                                  // Force a re-render by updating the render key
                                  setRenderKey(prev => prev + 1);
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
                                    <button
                                      key={list.id}
                                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                        activeOpportunitiesList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                      }`}
                                      onClick={() => {
                                        setActiveOpportunitiesList(list);
                                        setShowListsDropdown(false);
                                        // Update URL to reflect the selected list
                                        const newUrl = new URL(window.location.href);
                                        newUrl.searchParams.set('list', list.id.toString());
                                        window.history.pushState({}, '', newUrl.toString());
                                        // Force a re-render by updating the render key
                                        setRenderKey(prev => prev + 1);
                                      }}
                                    >
                                      <div className="flex flex-col space-y-1 w-full">
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
                                            <span className="text-xs text-gray-500">Shared by {environment.name}</span>
                                          </div>
                                        )}
                                      </div>
                                    </button>
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
                      {/* Edit list functionality HIDDEN IN BROKER VIEW for proper access control */}

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
                        onClick={() => {/* Handle new opportunity creation */}}
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
                          className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium border-gray-300 hover:border-gray-400"
                          onClick={() => {/* Handle views dropdown */}}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                          <span className="max-w-[120px] truncate">Views</span>
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
                            className="transition-transform"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Filter dropdowns next to the views dropdown */}
                      <div className="flex items-center gap-2 ml-3">
                        {/* Stage filter dropdown */}
                        <div className="relative" ref={stageDropdownRef}>
                          <button 
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                              selectedStatus ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'
                            } hover:border-gray-400`}
                            onClick={() => setShowStageDropdown(!showStageDropdown)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            <span>{selectedStatus || 'Stage'}</span>
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
                              className={`ml-2 transition-transform ${showStageDropdown ? 'rotate-180' : ''}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          
                          {showStageDropdown && (
                            <div className="absolute z-50 mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg">
                              <div className="py-1">
                                <button
                                  className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => {
                                    setSelectedStatus('');
                                    setShowStageDropdown(false);
                                  }}
                                >
                                  All Stages
                                </button>
                                {uniqueStages.map((stage) => (
                                  <button
                                    key={stage}
                                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedStatus(stage);
                                      setShowStageDropdown(false);
                                    }}
                                  >
                                    {stage}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Customer filter dropdown */}
                        <div className="relative" ref={customerDropdownRef}>
                          <button 
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                              selectedCustomer ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'
                            } hover:border-gray-400`}
                            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            <span>{selectedCustomer || 'Customer'}</span>
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
                              className={`ml-2 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          
                          {showCustomerDropdown && (
                            <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-lg">
                              <div className="py-1">
                                <button
                                  className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => {
                                    setSelectedCustomer('');
                                    setShowCustomerDropdown(false);
                                  }}
                                >
                                  All Customers
                                </button>
                                {uniqueCustomers.map((customer) => (
                                  <button
                                    key={customer}
                                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedCustomer(customer);
                                      setShowCustomerDropdown(false);
                                    }}
                                  >
                                    <span className="truncate">{customer}</span>
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

              {/* Bulk actions bar - always visible */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4" style={{ minHeight: '64px' }}>
                {selectedOpportunities.length > 0 ? (
                  <>
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
                        onClick={() => {/* Add to campaign functionality */}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          <path d="m15 5 4 4"></path>
                        </svg>
                        Add to campaign
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-indigo-600"
                        onClick={() => {/* Add export functionality */}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export Selected
                      </Button>
                    </div>
                  </>
                ) : (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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
                          <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
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
                            Partner
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
                              <div className="flex items-center">
                                <EntityAvatar 
                                  entityType="partner" 
                                  entityId={customer.partnerId || 4} 
                                  fallbackText={(customer.partnerName || "De Goudse").charAt(0)}
                                  size="sm"
                                />
                                <span className="ml-2">{customer.partnerName || "De Goudse"}</span>
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
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22 11 13 2 9 22 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Campaigns</h3>
                <p className="text-gray-500 mb-6">Campaign management functionality will be available here soon.</p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/campaigns', '_blank')}
                    className="text-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22 11 13 2 9 22 2z" />
                    </svg>
                    Go to Campaigns
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/campaigns/new', '_blank')}
                    className="text-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Create Campaign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BrokerLayout>
  );
}