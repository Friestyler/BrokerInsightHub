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

// Fetch opportunities from database
const useOpportunitiesData = () => {
  return useQuery({
    queryKey: ['/api/opportunities'],
    staleTime: 2 * 60 * 1000,
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'opportunities'],
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('/api/saved-lists', {
        method: 'POST',
        body: JSON.stringify(newList)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
    }
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'opportunities'],
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedView = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newView: any) => {
      const response = await fetch('/api/saved-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newView)
      });
      if (!response.ok) throw new Error('Failed to create view');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
    }
  });
};

// All opportunity data now comes from database - no mock data needed

// Calculate opportunity statistics
function calculateOpportunityStats(opportunities: any[]) {
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const weightedValue = opportunities.reduce((sum, opportunity) => sum + (opportunity.value * opportunity.probability / 100), 0);
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
function TemplateBadges({ type, status }: { type: string, status: string }) {
  // Mock template badges based on type and status
  const getBadges = (type: string, status: string) => {
    if (type === 'Renewal') {
      return [
        { code: 'RN', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (type === 'New Business') {
      return [
        { code: 'NB', color: 'bg-green-200 text-green-800' }
      ];
    } else if (type === 'Cross-sell') {
      return [
        { code: 'CS', color: 'bg-purple-200 text-purple-800' }
      ];
    } else {
      return [
        { code: 'OT', color: 'bg-gray-200 text-gray-800' }
      ];
    }
  };
  
  const badges = getBadges(type, status);
  
  return (
    <div className="flex space-x-2">
      {badges.map((badge) => (
        <div key={badge.code} className={`${badge.color} w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium`}>
          {badge.code}
        </div>
      ))}
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

// Main opportunity list component
function OpportunitiesTable() {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const { data: opportunities = [], isLoading, error } = useOpportunitiesData();
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedLists();
  const createSavedListMutation = useCreateSavedList();
  const { data: savedViewsData = [], isLoading: savedViewsLoading } = useSavedViews();
  const createSavedViewMutation = useCreateSavedView();
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Database data is already fetched via the hook at the top of the component
  
  // Enhanced state management
  const [isCreatingNewList, setIsCreatingNewList] = useState(true);
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // Views state - using database data
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  
  // State for saved lists - using database data
  const [activeList, setActiveList] = useState<any>(null);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [pendingListAction, setPendingListAction] = useState<any>(null);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
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
  const displayedOpportunities = (() => {
    let opportunitiesData = opportunities;
    
    // If we have an active list that's selection-based, use its members
    if (activeList && activeList.type === 'selection' && activeList.members) {
      opportunitiesData = opportunities.filter((opp: any) => activeList.members!.includes(opp.id));
    }
    
    // Apply current filters (from UI or active list/view)
    return opportunitiesData.filter((opportunity: any) => {
      // Text search - handle both database format and mock format
      const title = opportunity.title || '';
      const customerName = opportunity.customerName || opportunity.client?.name || '';
      const partnerName = opportunity.partnerName || opportunity.partner?.name || '';
      
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
      setSelectedOpportunities(displayedOpportunities.map(opp => opp.id));
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
    <div className="space-y-4">
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
                      
                      {/* Database saved lists */}
                      {savedListsData.map((list: any) => (
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
                              {list.isShared && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-indigo-500">
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
              
              <Button size="sm" className="flex items-center bg-indigo-600 hover:bg-indigo-700">
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
                  onClick={() => setSelectedStatus(selectedStatus ? '' : 'In Progress')}
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
      
      {/* Selection actions bar - visible when items are selected */}
      {selectedOpportunities.length > 0 && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
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
              onClick={() => {
                // TODO: Implement template assignment
                alert('Assign template functionality will be implemented in future');
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.closedWon}</div>
          <div className="text-sm text-gray-500">Closed Won</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalValue}</div>
          <div className="text-sm text-gray-500">Total Value</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.weightedValue}</div>
          <div className="text-sm text-gray-500">Weighted Value</div>
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
      
      {/* Share List Modal with Extended Options */}
      <Dialog open={showShareListModal} onOpenChange={setShowShareListModal}>
        <DialogContent className="sm:max-w-2xl bg-[#ffffff] text-[#282A3F] p-[32px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOpportunities.length > 0 
                ? `Share ${selectedOpportunities.length} Selected Opportunities`
                : `Share List: ${activeList?.name}`
              }
            </DialogTitle>
            <DialogDescription>
              {selectedOpportunities.length > 0 
                ? `Share the ${selectedOpportunities.length} selected opportunity records with other partners, teams, or individuals.`
                : "Share this list with partners, teams, or individuals."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Show selected opportunities summary when bulk sharing */}
            {selectedOpportunities.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 6h18l-2 13H5L3 6z"></path>
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    Selected Opportunities ({selectedOpportunities.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedOpportunities.slice(0, 5).map(oppId => {
                    const opportunity = opportunities.find(o => o.id === oppId);
                    return opportunity ? (
                      <span key={oppId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {opportunity.title}
                      </span>
                    ) : null;
                  })}
                  {selectedOpportunities.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      +{selectedOpportunities.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tabs for different sharing options */}
            <div className="flex border-b">
              <button className="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                Partners
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Teams
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Individuals
              </button>
            </div>
            
            {/* Partners Section with individual contact selection */}
            <div className="grid gap-3">
              <Label>Select Partners and Contacts</Label>
              
              {/* Dynamic list of partners with their contacts */}
              <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3">
                {opportunities.reduce((partners, opp) => {
                  if (!partners.some(p => p.id === opp.partnerId)) {
                    partners.push({ id: opp.partnerId, name: opp.partnerName || 'Unknown Partner' });
                  }
                  return partners;
                }, [] as { id: number, name: string }[]).map(partner => {
                  const partnerName = partner.name || 'Unknown Partner';
                  const partnerFirstName = partnerName.includes(' ') ? partnerName.split(' ')[0] : partnerName;
                  const partnerContacts = [
                    { id: 1, name: `${partnerFirstName} Manager`, email: `manager@${partnerName.toLowerCase().replace(/\s+/g, '')}.com` },
                    { id: 2, name: `${partnerFirstName} Sales`, email: `sales@${partnerName.toLowerCase().replace(/\s+/g, '')}.com` },
                    { id: 3, name: `${partnerFirstName} Admin`, email: `admin@${partnerName.toLowerCase().replace(/\s+/g, '')}.com` }
                  ];
                  
                  return (
                    <div key={partner.id} className="border border-gray-100 rounded-md p-3">
                      <div className="flex items-center mb-2">
                        <Checkbox 
                          id={`share-partner-${partner.id}`}
                          className="mr-2"
                          onChange={(e) => {
                            const isChecked = (e.target as HTMLInputElement).checked;
                            partnerContacts.forEach(contact => {
                              const contactCheckbox = document.querySelector(`input[id="contact-${partner.id}-${contact.id}"]`) as HTMLInputElement;
                              if (contactCheckbox) contactCheckbox.checked = isChecked;
                            });
                          }}
                        />
                        <Label htmlFor={`share-partner-${partner.id}`} className="font-medium text-sm cursor-pointer">
                          {partner.name}
                        </Label>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        {partnerContacts.map(contact => (
                          <div key={contact.id} className="flex items-center">
                            <Checkbox 
                              id={`contact-${partner.id}-${contact.id}`}
                              className="mr-2"
                              onChange={() => {
                                const allContactsSelected = partnerContacts.every(c => {
                                  const checkbox = document.querySelector(`input[id="contact-${partner.id}-${c.id}"]`) as HTMLInputElement;
                                  return checkbox?.checked;
                                });
                                const partnerCheckbox = document.querySelector(`input[id="share-partner-${partner.id}"]`) as HTMLInputElement;
                                if (partnerCheckbox) partnerCheckbox.checked = allContactsSelected;
                              }}
                            />
                            <Label htmlFor={`contact-${partner.id}-${contact.id}`} className="text-xs cursor-pointer flex-grow">
                              <div>
                                <div className="font-medium text-gray-800">{contact.name}</div>
                                <div className="text-gray-500">{contact.email}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Permission Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="canView" defaultChecked />
                  <Label htmlFor="canView" className="text-sm font-normal">
                    Can view this saved list
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="canEdit" />
                  <Label htmlFor="canEdit" className="text-sm font-normal">
                    Can edit this saved list
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="shareMessage">Add a Message (Optional)</Label>
              <Textarea 
                id="shareMessage" 
                placeholder="Include a note to the recipients"
                rows={2}
              />
            </div>
            
            {/* Copy Link Section */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium">Direct Link</div>
                <div className="text-xs text-gray-500">Only accessible by people with permissions</div>
              </div>
              <div className="flex">
                <Input 
                  id="shareLink" 
                  value={`https://qollabi.com/share/list/${activeList?.id}`}
                  readOnly
                  className="text-xs"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://qollabi.com/share/list/${activeList?.id}`);
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => {
              // Handle sharing logic for both list and bulk opportunity sharing
              const canEdit = (document.getElementById('canEdit') as HTMLInputElement)?.checked || false;
              const canView = (document.getElementById('canView') as HTMLInputElement)?.checked || true;
              const message = (document.getElementById('shareMessage') as HTMLTextAreaElement)?.value || '';
              
              // Collect all selected contact emails
              const selectedContactEmails: string[] = [];
              const selectedPartnerNames: string[] = [];
              
              opportunities.reduce((partners, opp) => {
                if (!partners.some(p => p.id === opp.partnerId)) {
                  partners.push({ id: opp.partnerId, name: opp.partnerName });
                }
                return partners;
              }, [] as { id: number, name: string }[]).forEach(partner => {
                const partnerContacts = [
                  { id: 1, name: `${partner.name.split(' ')[0]} Manager`, email: `manager@${partner.name.toLowerCase().replace(/\s+/g, '')}.com` },
                  { id: 2, name: `${partner.name.split(' ')[0]} Sales`, email: `sales@${partner.name.toLowerCase().replace(/\s+/g, '')}.com` },
                  { id: 3, name: `${partner.name.split(' ')[0]} Admin`, email: `admin@${partner.name.toLowerCase().replace(/\s+/g, '')}.com` }
                ];
                
                let hasSelectedContacts = false;
                partnerContacts.forEach(contact => {
                  const contactCheckbox = document.querySelector(`input[id="contact-${partner.id}-${contact.id}"]`) as HTMLInputElement;
                  if (contactCheckbox?.checked) {
                    selectedContactEmails.push(contact.email);
                    hasSelectedContacts = true;
                  }
                });
                
                if (hasSelectedContacts && !selectedPartnerNames.includes(partner.name)) {
                  selectedPartnerNames.push(partner.name);
                }
              });
              
              if (selectedContactEmails.length === 0) {
                toast({
                  title: "No contacts selected",
                  description: "Please select at least one contact to share with.",
                  variant: "destructive"
                });
                return;
              }

              // Determine what's being shared
              const isListShare = selectedOpportunities.length === 0;
              const isBulkOpportunityShare = selectedOpportunities.length > 0;

              if (isListShare && activeList) {
                // Sharing the entire list
                const updatedLists = savedLists.map(list => {
                  if (list.id === activeList.id) {
                    return {
                      ...list,
                      isShared: true,
                      sharedWith: [...(list.sharedWith || []), ...selectedContactEmails]
                    };
                  }
                  return list;
                });
                
                setSavedLists(updatedLists);
                setActiveList(updatedLists.find(v => v.id === activeList.id) || null);

                toast({
                  title: "List shared successfully",
                  description: `"${activeList.name}" has been shared with ${selectedContactEmails.length} contact${selectedContactEmails.length > 1 ? 's' : ''} at ${selectedPartnerNames.length} partner${selectedPartnerNames.length > 1 ? 's' : ''}.`
                });
              } else if (isBulkOpportunityShare) {
                // Sharing selected opportunity records
                const bulkOpportunityNames = selectedOpportunities
                  .map(id => opportunities.find(o => o.id === id)?.title)
                  .filter(Boolean)
                  .slice(0, 3);

                toast({
                  title: "Opportunities shared successfully",
                  description: `${selectedOpportunities.length} opportunity record${selectedOpportunities.length > 1 ? 's' : ''} (${bulkOpportunityNames.join(', ')}${selectedOpportunities.length > 3 ? '...' : ''}) shared with ${selectedContactEmails.length} contact${selectedContactEmails.length > 1 ? 's' : ''} at ${selectedPartnerNames.length} partner${selectedPartnerNames.length > 1 ? 's' : ''}.`
                });

                // Clear selection after sharing
                setSelectedOpportunities([]);
              }
              
              setShowShareListModal(false);
            }}>
              Share List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a quick view that you can easily access later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="viewName">View Name</Label>
              <Input 
                id="viewName" 
                placeholder="Enter a name for this view"
                value={viewNameInput}
                onChange={(e) => setViewNameInput(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Current filters:</div>
              <div className="space-y-1">
                {filterText && <div>• Search: "{filterText}"</div>}
                {selectedStatus && <div>• Status: {selectedStatus}</div>}
                {selectedType && <div>• Type: {selectedType}</div>}
                {!filterText && !selectedStatus && !selectedType && (
                  <div className="text-gray-400">No filters applied</div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (!viewNameInput.trim()) return;
                
                // Create new view via database mutation
                createSavedViewMutation.mutate({
                  name: viewNameInput.trim(),
                  description: null,
                  entity_type: 'opportunities',
                  filters: JSON.stringify({
                    searchText: filterText || undefined,
                    status: selectedStatus || undefined,
                    type: selectedType || undefined
                  }),
                  is_shared: false,
                  created_by: 'current-user'
                });
                setViewNameInput('');
                setShowSaveViewModal(false);
                
                toast({
                  title: "View saved successfully",
                  description: `"${viewNameInput.trim()}" has been saved to your quick views.`,
                  className: "bg-indigo-50 border-indigo-200 text-indigo-800",
                });
              }}
              disabled={!viewNameInput.trim()}
            >
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Table section without a border */}
      <div className="bg-white overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={selectedOpportunities.length === displayedOpportunities.length && displayedOpportunities.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
                <div className="flex items-center">
                  Title
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Customer
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Partner
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Type
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Status
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Value
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Due Date
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Template
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {displayedOpportunities.map((opportunity) => (
              <tr 
                key={opportunity.id} 
                className={`hover:bg-gray-50 group ${selectedOpportunities.includes(opportunity.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${selectedOpportunities.includes(opportunity.id) ? 'visible' : 'invisible group-hover:visible'}`}
                    checked={selectedOpportunities.includes(opportunity.id)}
                    onChange={() => toggleSelectOpportunity(opportunity.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <Link 
                    href={`/opportunities/${opportunity.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {opportunity.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Link 
                    href={`/lists/customers/${opportunity.clientId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {opportunity.clientName}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="flex flex-col space-y-1">
                    {opportunity.partnerNames ? (
                      <Link 
                        href={`/lists/partners/${opportunity.partnerId || 1}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {opportunity.partnerNames}
                      </Link>
                    ) : (
                      <span className="text-gray-900">No Partner</span>
                    )}
                    <div className="flex space-x-2 text-xs text-gray-500">
                      <span>Partners: {opportunity.partnerCount || 0}</span>
                      <span>•</span>
                      <span>Products: {opportunity.productCount || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{opportunity.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeVariant(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{formatCurrency(opportunity.estimatedValue)}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'TBD'}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges type={opportunity.type} status={opportunity.status} />
                </td>
              </tr>
            ))}
            
            {displayedOpportunities.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No opportunities found</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      There are no opportunities matching your filter criteria.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setFilterText('');
                        setSelectedStatus('');
                        setSelectedType('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingList, setIsEditingList] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form data for creating new opportunity with all available fields
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    status: 'pipeline',
    stage: 'initial_contact',
    type: 'new_business',
    estimatedValue: '',
    probability: 50,
    location: ''
  });

  const handleCreateOpportunity = async () => {
    if (!opportunityFormData.title.trim() || !opportunityFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...opportunityFormData,
          clientId: parseInt(opportunityFormData.clientId) || 1,
          estimatedValue: parseInt(opportunityFormData.estimatedValue) || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create opportunity');
      }

      const newOpportunity = await response.json();
      
      // Invalidate and refetch opportunities data
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      
      toast({
        title: "Opportunity Created",
        description: `"${opportunityFormData.title}" has been created successfully.`
      });

      // Reset form and close modal
      setOpportunityFormData({
        title: '',
        description: '',
        clientId: '',
        status: 'pipeline',
        stage: 'initial_contact',
        type: 'new_business',
        estimatedValue: '',
        probability: 50,
        location: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Opportunities</h1>
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
          Create new opportunity
        </button>
      </div>
      
      <OpportunitiesTable />
      
      {/* Create Opportunity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Add a new opportunity to track business potential. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={opportunityFormData.title}
                  onChange={(e) => setOpportunityFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter opportunity title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  type="number"
                  value={opportunityFormData.clientId}
                  onChange={(e) => setOpportunityFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="Customer/Client ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={opportunityFormData.description}
                onChange={(e) => setOpportunityFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the opportunity"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={opportunityFormData.estimatedValue}
                  onChange={(e) => setOpportunityFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={opportunityFormData.probability}
                  onChange={(e) => setOpportunityFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={opportunityFormData.location}
                onChange={(e) => setOpportunityFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={opportunityFormData.status} onValueChange={(value) => setOpportunityFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pipeline">Pipeline</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={opportunityFormData.stage} onValueChange={(value) => setOpportunityFormData(prev => ({ ...prev, stage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_contact">Initial Contact</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={opportunityFormData.type} onValueChange={(value) => setOpportunityFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_business">New Business</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="upsell">Upsell</SelectItem>
                    <SelectItem value="cross_sell">Cross Sell</SelectItem>
                  </SelectContent>
                </Select>
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
    </div>
  );
}