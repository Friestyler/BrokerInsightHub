import { useState, useEffect, createContext, useContext } from 'react';

// Create a context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { useToast } from "@/hooks/use-toast";

// Sample data for opportunities - adapted from partners structure
const mockOpportunities = [
  {
    id: 1,
    title: "Enterprise Insurance Renewal", 
    initials: "EI",
    customerName: "TechCorp Solutions",
    partnerName: "ABC Insurance Brokers",
    status: "In Progress",
    type: "Renewal",
    stage: "Proposal",
    value: 125000,
    probability: 75,
    estimatedCloseDate: "2025-06-15",
    owner: "Sarah Johnson"
  },
  {
    id: 2,
    title: "Small Business Package",
    initials: "SB",
    customerName: "Local Bakery Co",
    partnerName: "Global Insurance Partners",
    status: "Qualified",
    type: "New Business",
    stage: "Discovery",
    value: 25000,
    probability: 60,
    estimatedCloseDate: "2025-07-01",
    owner: "Mike Davis"
  },
  {
    id: 3,
    title: "Commercial Property Coverage",
    initials: "CP",
    customerName: "Downtown Retail Mall",
    partnerName: "Premier Insurance Agency",
    status: "In Progress",
    type: "New Business",
    stage: "Negotiation",
    value: 85000,
    probability: 80,
    estimatedCloseDate: "2025-05-30",
    owner: "Emma Wilson"
  },
  {
    id: 4,
    title: "Fleet Insurance Upgrade",
    initials: "FI",
    customerName: "City Transport LLC",
    partnerName: "Secure Financial Services",
    status: "Closed Won",
    type: "Expansion",
    stage: "Closed",
    value: 95000,
    probability: 100,
    estimatedCloseDate: "2025-04-20",
    owner: "John Smith"
  },
  {
    id: 5,
    title: "Professional Liability Policy",
    initials: "PL",
    customerName: "Law Firm Associates",
    partnerName: "Pinnacle Risk Solutions",
    status: "Qualified",
    type: "New Business",
    stage: "Proposal",
    value: 45000,
    probability: 65,
    estimatedCloseDate: "2025-06-10",
    owner: "Jessica Brown"
  },
  {
    id: 6,
    title: "Manufacturing Coverage Review",
    initials: "MC",
    customerName: "Industrial Parts Inc",
    partnerName: "ABC Insurance Brokers",
    status: "Closed Lost",
    type: "Renewal",
    stage: "Closed",
    value: 150000,
    probability: 0,
    estimatedCloseDate: "2025-03-15",
    owner: "Robert Smith"
  }
];

// Calculate opportunity statistics
function calculateOpportunityStats(opportunities: typeof mockOpportunities) {
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const closedWon = opportunities.filter(o => o.status === 'Closed Won').length;
  
  return {
    totalOpportunities,
    totalValue: `$${(totalValue / 1000).toFixed(0)}K`,
    weightedValue: `$${(weightedValue / 1000).toFixed(0)}K`,
    closedWon
  };
}

// Template badges component for opportunities
function TemplateBadges({ type, status }: { type: string, status: string }) {
  // Mock template badges based on type and status
  const getBadges = (type: string, status: string) => {
    if (type === 'Renewal' && status === 'In Progress') {
      return [
        { code: 'RN', color: 'bg-blue-200 text-blue-800' },
        { code: 'IP', color: 'bg-yellow-200 text-yellow-800' }
      ];
    } else if (type === 'New Business') {
      return [
        { code: 'NB', color: 'bg-green-200 text-green-800' },
        { code: 'PR', color: 'bg-purple-200 text-purple-800' }
      ];
    } else if (type === 'Expansion') {
      return [
        { code: 'EX', color: 'bg-teal-200 text-teal-800' },
        { code: 'UP', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (status === 'Closed Won') {
      return [
        { code: 'CW', color: 'bg-green-200 text-green-800' }
      ];
    } else if (status === 'Closed Lost') {
      return [
        { code: 'CL', color: 'bg-red-200 text-red-800' }
      ];
    } else {
      return [
        { code: 'OP', color: 'bg-gray-200 text-gray-800' }
      ];
    }
  };
  
  const badges = getBadges(type, status);
  
  return (
    <div className="flex space-x-2">
      {badges.map((badge, index) => (
        <div key={index} className={`${badge.color} w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium`}>
          {badge.code}
        </div>
      ))}
    </div>
  );
}

// Define interface for saved lists
interface SavedList {
  id: string;
  name: string;
  description?: string;
  type?: 'filter' | 'selection'; // 'filter' for Saved Filters, 'selection' for Custom Lists
  filters: {
    searchText?: string;
    status?: string;
    type?: string;
    stage?: string;
    owner?: string;
  };
  members?: number[]; // Array of opportunity IDs for Custom Lists
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean; // Flag for system-generated default lists that can't be edited/deleted
}

// Define interface for saved views (filter combinations)
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    type?: string;
    stage?: string;
    owner?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Main opportunity list component
// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

function OpportunitiesTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Use the shared context for list editing state
  const { isEditingList, setIsEditingList } = useListEditing();
  const [isSavingList, setIsSavingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // State for unsaved changes confirmation
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingListAction, setPendingListAction] = useState<{
    type: 'select' | 'clear';
    list?: SavedList;
  } | null>(null);
  
  // Function to handle navigation with unsaved changes in list editing
  const handleNavigationWithUnsavedChanges = (action: { type: 'select' | 'clear', list?: SavedList }) => {
    // Check if we're in list editing mode with unsaved changes
    if (isEditingList && activeList && !activeList.isDefault) {
      // Store the pending action and show confirmation dialog
      setPendingListAction(action);
      setShowUnsavedChangesModal(true);
      return true; // Navigation was interrupted
    }
    return false; // Navigation can proceed
  };
  
  // State for saved lists
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    {
      id: 'all-opportunities',
      name: 'All Opportunities',
      type: 'filter',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true // Flag to indicate this is a default list that can't be edited/deleted
    },
    {
      id: '1',
      name: 'High Value Renewals',
      type: 'selection',
      filters: {},
      members: [1, 3, 6], // IDs of the opportunities in this list
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'New Business Pipeline',
      type: 'selection',
      filters: {},
      members: [2, 3, 5], // IDs of the opportunities in this list
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    },
    {
      id: '3',
      name: 'Q2 Targets',
      type: 'selection',
      filters: {},
      members: [1, 2, 4], // IDs of the opportunities in this list
      isShared: true,
      sharedWith: ['sales@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15')
    }
  ]);
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // State for saved views (filter combinations)
  const [savedViews, setSavedViews] = useState<SavedView[]>([
    {
      id: 'view-1',
      name: 'Active Renewals',
      filters: {
        status: 'In Progress',
        type: 'Renewal'
      },
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: 'view-2',
      name: 'New Business Focus',
      filters: {
        type: 'New Business'
      },
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    }
  ]);
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false); // Default to adding to existing list
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);
    
  // Filter opportunities based on search text, filter selections, and list membership
  const displayedOpportunities = mockOpportunities
    .filter(opportunity => {
      // If we have an active list that's not a default list, filter by membership
      if (activeList && !activeList.isDefault && activeList.type === 'selection' && Array.isArray(activeList.members)) {
        // Only show opportunities that are members of the active list
        if (!activeList.members.includes(opportunity.id)) {
          return false;
        }
      }
      
      const matchesText = !filterText || 
        opportunity.title.toLowerCase().includes(filterText.toLowerCase()) ||
        opportunity.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
        opportunity.partnerName.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesStatus = !selectedStatus || opportunity.status === selectedStatus;
      const matchesType = !selectedType || opportunity.type === selectedType;
      const matchesStage = !selectedStage || opportunity.stage === selectedStage;
      
      return matchesText && matchesStatus && matchesType && matchesStage;
    })
    // Sort alphabetically by title by default
    .sort((a, b) => a.title.localeCompare(b.title));
  
  // Check if current filters differ from original list filters to detect unsaved changes
  useEffect(() => {
    if (activeList && originalListFilters) {
      const currentFilters = {
        searchText: filterText || undefined,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
        stage: selectedStage || undefined,
        owner: originalListFilters.owner // Preserve owner filter if it exists
      };
      
      // Compare current filters with original list filters
      const hasChanges = 
        currentFilters.searchText !== originalListFilters.searchText ||
        currentFilters.status !== originalListFilters.status ||
        currentFilters.type !== originalListFilters.type ||
        currentFilters.stage !== originalListFilters.stage;
      
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [filterText, selectedStatus, selectedType, selectedStage, activeList, originalListFilters]);
  
  // Function to revert changes to the original list filters
  const revertChanges = () => {
    if (activeList && originalListFilters) {
      setFilterText(originalListFilters.searchText || '');
      setSelectedStatus(originalListFilters.status || '');
      setSelectedType(originalListFilters.type || '');
      setSelectedStage(originalListFilters.stage || '');
      setHasUnsavedChanges(false);
    }
  };
  
  // Initialize toast
  const { toast } = useToast();

  // Function to save changes to the current list
  const saveChanges = () => {
    if (activeList && !activeList.isDefault) {
      const updatedList = {
        ...activeList,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          type: selectedType || undefined,
          stage: selectedStage || undefined,
          owner: originalListFilters?.owner // Preserve owner filter if it exists
        },
        createdAt: new Date() // Update the timestamp
      };
      
      // Update the list in the savedLists array
      const updatedLists = savedLists.map(list => 
        list.id === activeList.id ? updatedList : list
      );
      
      setSavedLists(updatedLists);
      setActiveList(updatedList);
      setOriginalListFilters(updatedList.filters);
      setHasUnsavedChanges(false);
      
      // Show toast notification for successful save
      toast({
        title: "List Saved",
        description: "Your changes have been saved successfully"
      });
    }
  };
  


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
      setSelectedOpportunities(displayedOpportunities.map(opportunity => opportunity.id));
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Unified toolbar with more emphasis on saved lists */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top row with saved lists and action buttons */}
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
                      {savedLists.map(list => (
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
                                setSelectedStage('');
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
                                setSelectedStage(list.filters.stage || '');
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
              {(filterText || selectedStatus || selectedType || selectedStage) && (
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
                  <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                    <div className="p-2 border-b">
                      <div className="text-xs font-medium mb-2 text-gray-500">SAVED VIEWS</div>
                      {savedViews.map(view => (
                        <div 
                          key={view.id}
                          className={`flex justify-between items-center p-2 text-sm rounded-md cursor-pointer hover:bg-slate-50 ${activeView?.id === view.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                          onClick={() => {
                            setActiveView(view);
                            setFilterText(view.filters.searchText || '');
                            setSelectedStatus(view.filters.status || '');
                            setSelectedType(view.filters.type || '');
                            setSelectedStage(view.filters.stage || '');
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
                            // Clear active view
                            setActiveView(null);
                            // Reset filters if needed
                            setFilterText('');
                            setSelectedStatus('');
                            setSelectedType('');
                            setSelectedStage('');
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
                  onClick={() => setSelectedType(selectedType ? '' : 'New Business')}
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
                
                <button 
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedStage ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedStage(selectedStage ? '' : 'Proposal')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>{selectedStage ? `Stage: ${selectedStage}` : 'Stage'}</span>
                  {selectedStage && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Right side - Views management and filters */}
            <div className="flex items-center gap-3">
              {/* Views management section - complex logic for different states */}
              {(() => {
                // Check if filters have changed from the active view
                const filtersChanged = activeView && 
                  (filterText !== (activeView.filters.searchText || '') || 
                   selectedStatus !== (activeView.filters.status || '') || 
                   selectedType !== (activeView.filters.type || '') || 
                   selectedStage !== (activeView.filters.stage || ''));
                   
                // Only render buttons if there are filters applied or filters have changed
                return (filterText || selectedStatus || selectedType || selectedStage) && (
                  <div className="flex items-center gap-2">
                    {/* Show Revert and Save buttons only when a view is active AND filters have changed */}
                    {filtersChanged && (
                      <>
                        {/* Revert changes button */}
                        <button 
                          className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                          onClick={() => {
                            // Revert to view's original filters
                            setFilterText(activeView.filters.searchText || '');
                            setSelectedStatus(activeView.filters.status || '');
                            setSelectedType(activeView.filters.type || '');
                            setSelectedStage(activeView.filters.stage || '');
                          }}
                          style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M3 7v6h6"></path>
                            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                          </svg>
                          <span className="text-[#5F6585]">Revert changes</span>
                        </button>
                        
                        {/* Save button - updates the current view */}
                        <button 
                          className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                          onClick={() => {
                            // Update the current view
                            const updatedViews = savedViews.map(view => {
                              if (view.id === activeView.id) {
                                return {
                                  ...view,
                                  filters: {
                                    searchText: filterText || undefined,
                                    status: selectedStatus || undefined,
                                    type: selectedType || undefined,
                                    stage: selectedStage || undefined
                                  }
                                };
                              }
                              return view;
                            });
                            setSavedViews(updatedViews);
                            setActiveView(updatedViews.find(view => view.id === activeView.id) || null);
                            
                            toast({
                              title: "View Updated",
                              description: "Your changes have been saved to the current view"
                            });
                          }}
                          style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          <span className="text-[#3E4DC4] font-medium">Save</span>
                        </button>
                        
                        {/* Save as new view button - only shown when filters have changed */}
                        <button 
                          className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
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
                      </>
                    )}
                    
                    {/* Show Save as new view button only when no view is active but filters are applied */}
                    {!activeView && (
                      <button 
                        className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
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
                );
              })()}
            </div>
            
            {/* Clear filters button - shown when any filters are applied */}
            {(filterText || selectedStatus || selectedType || selectedStage) && (
              <div className="mt-2">
                <button 
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setFilterText('');
                    setSelectedStatus('');
                    setSelectedType('');
                    setSelectedStage('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                  Clear all filters
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
              Add to List
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
      
      {/* Opportunities table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={isEditingList 
                    ? editedListMembers.length === (activeList ? mockOpportunities.length : displayedOpportunities.length) && (activeList ? mockOpportunities.length : displayedOpportunities.length) > 0
                    : selectedOpportunities.length === displayedOpportunities.length && displayedOpportunities.length > 0
                  }
                  onChange={isEditingList 
                    ? () => {
                        if (editedListMembers.length === (activeList ? mockOpportunities.length : displayedOpportunities.length)) {
                          setEditedListMembers([]);
                        } else {
                          setEditedListMembers(mockOpportunities.map(o => o.id));
                        }
                      }
                    : toggleSelectAll
                  }
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
                <div className="flex items-center">
                  Opportunity
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
                  Stage
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
                  Template
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {(isEditingList ? mockOpportunities : displayedOpportunities).map((opportunity) => (
              <tr 
                key={opportunity.id} 
                className={`hover:bg-gray-50 group ${
                  isEditingList 
                    ? editedListMembers.includes(opportunity.id) ? 'bg-indigo-50' : '' 
                    : selectedOpportunities.includes(opportunity.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${
                      isEditingList 
                        ? editedListMembers.includes(opportunity.id) ? 'text-indigo-600 focus:ring-indigo-500' : ''
                        : selectedOpportunities.includes(opportunity.id) ? 'text-indigo-600 focus:ring-indigo-500' : ''
                    }`}
                    checked={isEditingList 
                      ? editedListMembers.includes(opportunity.id)
                      : selectedOpportunities.includes(opportunity.id)
                    }
                    onChange={isEditingList 
                      ? () => {
                          if (editedListMembers.includes(opportunity.id)) {
                            setEditedListMembers(editedListMembers.filter(id => id !== opportunity.id));
                          } else {
                            setEditedListMembers([...editedListMembers, opportunity.id]);
                          }
                        }
                      : () => toggleOpportunitySelection(opportunity.id)
                    }
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm w-[250px]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                          {opportunity.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                      <div className="text-sm text-gray-500">{opportunity.owner}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{opportunity.customerName}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{opportunity.partnerName}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{opportunity.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{opportunity.stage}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={opportunity.status === 'Closed Won' ? 'outline' : 'secondary'} className="capitalize">
                    {opportunity.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">${opportunity.value.toLocaleString()}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges type={opportunity.type} status={opportunity.status} />
                </td>
              </tr>
            ))}
            
            {displayedOpportunities.length === 0 && !isEditingList && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No opportunities found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                        type: selectedType || undefined,
                        stage: selectedStage || undefined
                      },
                      isShared,
                      createdBy: 'John Smith',
                      createdAt: new Date()
                    };
                    
                    setSavedLists([...savedLists, newList]);
                    setActiveList(newList);
                  } else {
                    // Update existing list
                    const listName = (document.getElementById('listName') as HTMLInputElement).value;
                    const listDescription = (document.getElementById('listDescription') as HTMLTextAreaElement).value;
                    const isShared = (document.getElementById('shareList') as HTMLInputElement).checked;
                    
                    const updatedLists = savedLists.map(list => {
                      if (list.id === activeList.id) {
                        return {
                          ...list,
                          name: listName,
                          description: listDescription || undefined,
                          type: selectedOpportunities.length > 0 ? 'selection' as const : 'filter' as const,
                          members: selectedOpportunities.length > 0 ? selectedOpportunities : list.members,
                          filters: {
                            searchText: filterText || undefined,
                            status: selectedStatus || undefined,
                            type: selectedType || undefined,
                            stage: selectedStage || undefined
                          },
                          isShared
                        };
                      }
                      return list;
                    });
                    
                    setSavedLists(updatedLists);
                    setActiveList(updatedLists.find(v => v.id === activeList.id) || null);
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
      
      {/* Save View Modal */}
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
                {filterText && (
                  <div className="flex items-center text-sm text-[#282A3F]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search: "{filterText}"
                  </div>
                )}
                {selectedStatus && (
                  <div className="flex items-center text-sm text-[#282A3F]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Status: {selectedStatus}
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center text-sm text-[#282A3F]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Type: {selectedType}
                  </div>
                )}
                {selectedStage && (
                  <div className="flex items-center text-sm text-[#282A3F]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Stage: {selectedStage}
                  </div>
                )}
                {!filterText && !selectedStatus && !selectedType && !selectedStage && (
                  <div className="text-sm text-gray-500 italic">No filters currently applied</div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              disabled={!viewNameInput.trim()}
              onClick={() => {
                const newView: SavedView = {
                  id: `view-${Date.now()}`,
                  name: viewNameInput.trim(),
                  description: '',
                  filters: {
                    searchText: filterText || undefined,
                    status: selectedStatus || undefined,
                    type: selectedType || undefined,
                    stage: selectedStage || undefined
                  },
                  createdBy: 'John Smith',
                  createdAt: new Date()
                };
                
                setSavedViews([...savedViews, newView]);
                setActiveView(newView);
                
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
      
      {/* Share List Modal */}
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
            <div className="flex border-b">
              <button className="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                External Partners
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500">
                Internal Teams
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500">
                Individuals
              </button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="shareEmails">Partner Email Addresses</Label>
              <Textarea 
                id="shareEmails" 
                placeholder="Enter email addresses separated by commas"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="shareMessage">Message (Optional)</Label>
              <Textarea 
                id="shareMessage" 
                placeholder="Add a message to include with the shared list"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={() => {
                // Handle share functionality
                toast({
                  title: "List Shared",
                  description: "Your list has been shared successfully"
                });
                setShowShareListModal(false);
              }}
            >
              Share List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Opportunities2Page() {
  const [isEditingList, setIsEditingList] = useState(false);
  
  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-black">Opportunities</h1>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] pl-[12px] pr-[12px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
            onClick={() => {
              if (!isEditingList) {
                alert("Create new opportunity functionality coming soon!");
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
      </div>
    </ListEditingContext.Provider>
  );
}