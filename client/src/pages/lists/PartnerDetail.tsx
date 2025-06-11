import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Copy, Users, Trash2, MoreHorizontal, MessageSquare, ArrowLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { ShareModal } from "@/components/ShareModal";
import { apiRequest } from "@/lib/queryClient";

export default function PartnerDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("opportunities");
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

  // Opportunities-specific state
  const [filterText, setFilterText] = useState("");
  const [activeList, setActiveList] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingList, setSelectedExistingList] = useState<number | null>(null);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [currentSharedLink, setCurrentSharedLink] = useState<string | null>(null);
  const [existingSharedLinks, setExistingSharedLinks] = useState<any[]>([]);
  // State to track collaborators for each list
  const [listCollaborators, setListCollaborators] = useState<Record<number, any[]>>({});

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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for creating new lists
  const createListMutation = useMutation({
    mutationFn: async (listData: any) => {
      try {
        console.log('Creating list with data:', listData);
        const result = await apiRequest('POST', '/api/saved-lists', listData);
        console.log('List creation API result:', result);
        return result;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation onSuccess called with:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
    },
    onError: (error) => {
      console.error('Mutation onError called with:', error);
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

  // Fetch saved lists for opportunities that include this partner
  const { data: savedListsData } = useQuery({
    queryKey: ['/api/saved-lists', 'opportunities', 'partner', id],
    queryFn: () => apiRequest('GET', `/api/saved-lists?entity_type=opportunities&partner_id=${id}`),
    enabled: !!id,
  });

  // Fetch all opportunity lists for the modal
  const { data: opportunityLists } = useQuery({
    queryKey: ['/api/saved-lists', 'opportunities', 'all'],
    queryFn: () => fetch(`/api/saved-lists?entity_type=opportunities`).then(res => res.json()),
  });

  // Filter saved lists to show partner-relevant lists
  const partnerRelevantLists = (savedListsData as any[] || []).filter((list: any) => {
    // Show lists that belong to this partner (partner_id matches) or are general lists (partner_id is null)
    // The backend already handles this filtering, so we can show all returned lists
    return true;
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

  // Filter opportunities based on search and active list
  const filteredOpportunities = (relatedOpportunities as any[] || []).filter((opportunity: any) => {
    // Filter by search text
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.clientName?.toLowerCase().includes(searchLower) ||
        opportunity.stage?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
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

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
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
              <Link href="/partners">
                <Button variant="ghost" size="sm" className="p-2 group hover:bg-[#F5F6FE]">
                  <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Details</span>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Partner</span>
                    <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">NA</span></span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className="text-gray-600">{partner.description || 'Partner created from zonnepanelen'}</span>
                </div>
              </div>
            </div>
          </div>
          


          {/* Activity Hub */}
          <PartnerActivityHub partnerId={parseInt(id!)} partnerName={partner?.name || 'Partner'} />

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab("okr-plans")}
                className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "okr-plans" 
                    ? "bg-blue-100 text-blue-700 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
              >
                OKR plans
              </button>
              <button 
                onClick={() => setActiveTab("opportunities")}
                className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "opportunities" 
                    ? "bg-blue-100 text-blue-700 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
              >
                Opportunities ({(relatedOpportunities as any[] || []).length})
              </button>
              <button 
                onClick={() => setActiveTab("customers")}
                className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "customers" 
                    ? "bg-blue-100 text-blue-700 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
              >
                Customers ({(relatedCustomers as any[] || []).length})
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
                          <TableHead className="w-12">
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
                          </TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Name</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Timeframe</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Milestone Frequency</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Target</TableHead>
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
                                <div className="text-sm text-gray-500">{metric.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">{metric.timeframe || 'Not set'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">{metric.milestone_frequency || 'Not set'}</span>
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
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="p-2">
                            {/* Default "All opportunities" option */}
                            <button
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                !activeList ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                      activeList?.id === list.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                                  >
                                    <button
                                      className="flex-1 text-left flex items-center space-x-2"
                                      onClick={() => {
                                        setActiveList(list);
                                        setShowListsDropdown(false);
                                      }}
                                    >
                                      <span>{list.name}</span>
                                      {/* Show share icon if list is shared */}
                                      {list.is_shared && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-green-500">
                                          <circle cx="18" cy="5" r="3"></circle>
                                          <circle cx="6" cy="12" r="3"></circle>
                                          <circle cx="18" cy="19" r="3"></circle>
                                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                        </svg>
                                      )}
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
                                                // Redirect to the connected partner's detail page (De Goudse = partner ID 1) with the list opened
                                                const connectedPartnerId = 1; // De Goudse is the connected partner
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
                    
                    {/* Filter buttons next to the views dropdown */}
                    <div className="flex items-center gap-2 ml-3">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700"
                        onClick={() => {/* Handle status filter */}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span>Status</span>
                      </button>
                      
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700"
                        onClick={() => {/* Handle type filter */}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span>Type</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection actions bar - visible when items are selected or in edit mode */}
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
                      Create List
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Opportunities Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={
                          isEditingList 
                            ? editedListMembers.length === filteredOpportunities.length && filteredOpportunities.length > 0
                            : selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Close Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity: any) => (
                    <TableRow key={opportunity.id}>
                      <TableCell>
                        <Checkbox 
                          checked={isOpportunitySelected(opportunity.id)}
                          onCheckedChange={() => toggleSelectOpportunity(opportunity.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link href={`/lists/opportunities/${opportunity.id}`}>
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
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {opportunity.stage}
                        </span>
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
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Opportunities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(relatedCustomers as any[] || []).map((customer: any) => {
                  const customerOpportunities = (relatedOpportunities as any[] || []).filter((o: any) => o.clientName === customer.name);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        <Link href={`/lists/customers/${customer.id}`}>
                          <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                            {customer.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{customer.contact_name || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_email || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_phone || 'Not set'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {customerOpportunities.length} opportunities
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
                    onSuccess: (data) => {
                      console.log('List creation successful:', data);
                      toast({
                        title: "List created successfully",
                        description: `"${listData.name}" has been saved with ${selectedOpportunities.length} opportunities.`,
                      });
                      setShowSaveListModal(false);
                      setSelectedOpportunities([]);
                      setSaveListMode('new');
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
    </div>
  );
}