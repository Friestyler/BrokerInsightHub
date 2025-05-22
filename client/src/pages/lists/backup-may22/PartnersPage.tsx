import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
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

// Sample data for partners - updated to match the detail page data
export const mockPartners = [
  {
    id: 1,
    name: "Jeroen Hypotheek Advies", 
    initials: "JH",
    industry: "Finance",
    type: "Advisor",
    status: "active",
    size: "medium",
    customers: 3,
    opportunities: 4,
    location: "Amsterdam, NL",
    contactEmail: "contact@jeroen-hypotheek.nl",
    primaryContact: "Jeroen de Vries"
  },
  {
    id: 2,
    name: "ABC Insurance Brokers",  // This matches PartnerDetail.tsx
    initials: "AB",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 5,
    opportunities: 4,
    location: "New York, NY",
    contactEmail: "contact@abc-insurance.com",
    primaryContact: "Sarah Johnson"
  },
  {
    id: 3,
    name: "Global Insurance Partners",  // Updated to match PartnerDetail.tsx
    initials: "GI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 15,
    opportunities: 12,
    location: "London, UK",
    contactEmail: "partnerships@grp.com",
    primaryContact: "Emma Wilson"
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    initials: "PI",
    industry: "Insurance",
    type: "Agency",
    status: "inactive",
    size: "medium",
    customers: 6,
    opportunities: 3,
    location: "Boston, MA",
    contactEmail: "support@premierinsurance.co",
    primaryContact: "John Davis"
  },
  {
    id: 5,
    name: "Secure Financial Services",
    initials: "SF",
    industry: "Finance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 22,
    opportunities: 15,
    location: "San Francisco, CA",
    contactEmail: "info@secure-financial.com",
    primaryContact: "Jessica Brown"
  },
  {
    id: 6,
    name: "Pinnacle Risk Solutions",
    initials: "PR",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 18,
    opportunities: 9,
    location: "Miami, FL",
    contactEmail: "contact@pinnacle-risk.com",
    primaryContact: "Robert Smith"
  }
];

// Calculate partner statistics
function calculatePartnerStats(partners: typeof mockPartners) {
  const totalPartners = partners.length;
  const totalCustomers = partners.reduce((sum, partner) => sum + partner.customers, 0);
  const totalOpportunities = partners.reduce((sum, partner) => sum + partner.opportunities, 0);
  const activePartners = partners.filter(p => p.status === 'active').length;
  
  return {
    totalPartners,
    totalCustomers,
    totalOpportunities,
    activePartners
  };
}

// Template badges component for partners
function TemplateBadges({ industry, type }: { industry: string, type: string }) {
  // Mock template badges based on industry and type
  const getBadges = (industry: string, type: string) => {
    if (industry === 'Insurance' && type === 'Broker') {
      return [
        { code: 'IB', color: 'bg-blue-200 text-blue-800' },
        { code: 'PR', color: 'bg-purple-200 text-purple-800' }
      ];
    } else if (industry === 'Insurance' && type === 'Agency') {
      return [
        { code: 'IA', color: 'bg-teal-200 text-teal-800' },
        { code: 'SM', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (industry === 'Consulting') {
      return [
        { code: 'CO', color: 'bg-amber-200 text-amber-800' },
        { code: 'AD', color: 'bg-purple-200 text-purple-800' }
      ];
    } else if (industry === 'Finance') {
      return [
        { code: 'FS', color: 'bg-green-200 text-green-800' }
      ];
    } else {
      return [
        { code: 'GP', color: 'bg-gray-200 text-gray-800' }
      ];
    }
  };
  
  const badges = getBadges(industry, type);
  
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
    industry?: string;
    type?: string;
    size?: string;
  };
  members?: number[]; // Array of partner IDs for Custom Lists
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
    industry?: string;
    type?: string;
    size?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Main partner list component
function PartnersTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // This function will be defined in the main component instead
  
  // Track changes code has been moved to the main component
  
  // This function will be defined in the main component

  // State for views
  const [views, setViews] = useState<{
    id: string;
    name: string;
    description?: string;
    filters: {
      searchText?: string;
      status?: string;
      industry?: string;
      type?: string;
    };
    isShared: boolean;
    createdBy: string;
    createdAt: Date;
  }[]>([
    {
      id: 'active-partners',
      name: 'Active Partners',
      description: 'Shows only active partners',
      filters: { status: 'active' },
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01')
    },
    {
      id: 'insurance-partners',
      name: 'Insurance Partners',
      description: 'Partners in the insurance industry',
      filters: { industry: 'Insurance' },
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01')
    },
    {
      id: 'active-brokers',
      name: 'Active Brokers',
      description: 'Active insurance brokers',
      filters: { status: 'active', type: 'Broker' },
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01')
    }
  ]);
  
  const [activeView, setActiveView] = useState<typeof views[0] | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  
  // State for saved lists - Note: Lists now only contain members, not filters
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    // "All Partners" is not in the list as it's the default state when no list is selected
    {
      id: '1',
      name: 'Active Insurance Brokers',
      description: 'Manually selected active insurance brokers',
      type: 'selection',
      filters: {}, // Lists don't have filters anymore
      members: [1, 2, 4, 6], // Only member IDs are stored in lists
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'Consulting Partners',
      description: 'Consulting partners we work with',
      type: 'selection',
      filters: {}, // Lists don't have filters anymore
      members: [3, 5], // Only member IDs are stored in lists
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    },
    {
      id: '3',
      name: 'Enterprise Partners',
      description: 'Our enterprise-level partners',
      type: 'selection',
      filters: {}, // Lists don't have filters anymore
      members: [2, 4, 6], // Only member IDs are stored in lists
      isShared: true,
      sharedWith: ['partnerships@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15')
    }
  ]);
  // Start with no active list since "All Partners" is the default state, not a separate list
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  // Add Partners Modal state removed
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [listToAddTo, setListToAddTo] = useState<string>('new'); // 'new' or list ID
  const [showDynamicListGuidance, setShowDynamicListGuidance] = useState(false);
  const [isGuidanceCollapsed, setIsGuidanceCollapsed] = useState(false);
  // State for the name and description when creating a list through the general create modal
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  // Add Partners functionality removed
  const [showCreateFromSelectionModal, setShowCreateFromSelectionModal] = useState(false);   
  // Filter partners based on search text, filter selections, and list type
  const displayedPartners = mockPartners.filter(partner => {
    // If we have an active list, only show partners that are members of that list
    // Lists should only be about membership, not filters
    if (activeList) {
      // For lists, only check membership - no automatic filters  
      return activeList.members?.includes(partner.id) || false;
    } else {
      // When no list is selected (All Partners or using Views), apply the current filters
      const matchesText = !filterText || 
        partner.name.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.industry.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.type.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesStatus = !selectedStatus || partner.status === selectedStatus;
      const matchesIndustry = !selectedIndustry || partner.industry === selectedIndustry;
      const matchesType = !selectedType || partner.type === selectedType;
      
      return matchesText && matchesStatus && matchesIndustry && matchesType;
    }
  });
  
  // Check if current filters differ from original list filters to detect unsaved changes
  useEffect(() => {
    if (activeList && originalListFilters) {
      const currentFilters = {
        searchText: filterText || undefined,
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
        type: selectedType || undefined,
        size: originalListFilters.size // Preserve size filter if it exists
      };
      
      // Compare current filters with original list filters
      const hasChanges = 
        currentFilters.searchText !== originalListFilters.searchText ||
        currentFilters.status !== originalListFilters.status ||
        currentFilters.industry !== originalListFilters.industry ||
        currentFilters.type !== originalListFilters.type;
      
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [filterText, selectedStatus, selectedIndustry, selectedType, activeList, originalListFilters]);
  
  // Function to revert changes to the original list filters
  const revertChanges = () => {
    if (activeList && originalListFilters) {
      setFilterText(originalListFilters.searchText || '');
      setSelectedStatus(originalListFilters.status || '');
      setSelectedIndustry(originalListFilters.industry || '');
      setSelectedType(originalListFilters.type || '');
      setHasUnsavedChanges(false);
    }
  };
  
  // State for list creation from selection
  const [selectionListName, setSelectionListName] = useState('');
  const [selectionListDescription, setSelectionListDescription] = useState('');
  const [selectionListType, setSelectionListType] = useState<'filter' | 'selection'>('filter');
  
  // We're now using the state defined earlier in the component
  
  // Initialize toast
  const { toast } = useToast();
  
  // Function to open list creation from selection
  const openCreateFromSelection = () => {
    if (selectedPartners.length > 0) {
      // When creating from selection, we always create a static list
      setSelectionListType('selection'); // Force static selection type
      setSelectionListName('');
      setSelectionListDescription('');
      // Clear any existing filters to prevent them from carrying over to the new static list
      setShowCreateFromSelectionModal(true);
    } else {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner to create a list.",
        variant: "destructive"
      });
    }
  };

  // Function to save changes to the current list
  const saveChanges = () => {
    if (activeList && !activeList.isDefault) {
      const updatedList = {
        ...activeList,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          industry: selectedIndustry || undefined,
          type: selectedType || undefined,
          size: originalListFilters?.size // Preserve size filter if it exists
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

  // Calculate stats based on filtered partners
  const stats = calculatePartnerStats(displayedPartners);
  
  // Function to toggle partner selection
  const toggleSelectPartner = (id: number) => {
    if (selectedPartners.includes(id)) {
      setSelectedPartners(selectedPartners.filter(partnerId => partnerId !== id));
      
      // If we have an active static list, update its members and mark as having unsaved changes
      if (activeList && activeList.type === 'selection') {
        // Update the activeList temporarily but don't save to savedLists yet
        const updatedList: SavedList = {
          ...activeList,
          members: activeList.members?.filter((memberId: number) => memberId !== id) || []
        };
        setActiveList(updatedList);
        setHasUnsavedChanges(true);
      }
    } else {
      setSelectedPartners([...selectedPartners, id]);
      
      // If we have an active static list, update its members and mark as having unsaved changes
      if (activeList && activeList.type === 'selection') {
        // Update the activeList temporarily but don't save to savedLists yet
        const updatedList: SavedList = {
          ...activeList,
          members: [...(activeList.members || []), id]
        };
        setActiveList(updatedList);
        setHasUnsavedChanges(true);
      }
    }
  };
  
  // Function to toggle select/deselect all partners
  const toggleSelectAll = () => {
    if (selectedPartners.length === displayedPartners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(displayedPartners.map(partner => partner.id));
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
              {/* Saved Lists dropdown - redesigned to match provided image */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                    <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                  </svg>
                  <div className="flex items-center">
                    <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      {activeList ? activeList.name : "All Partners"}
                    </span>
                    
                    {/* No list type indicator shown - removed as requested */}
                  </div>
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
                    {/* Search section */}
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search lists..."
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-transparent border border-slate-200 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Lists with edit options */}
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {/* All Partners default option at the top */}
                      <div className="relative">
                        <div
                          className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList === null ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                          onClick={() => {
                            // Clear filters and active list (same behavior as "Return to all partners" button)
                            setActiveList(null);
                            setOriginalListFilters(null);
                            setFilterText('');
                            setSelectedStatus('');
                            setSelectedIndustry('');
                            setSelectedType('');
                            // Clear any active view when returning to All Partners
                            setActiveView(null);
                            setHasUnsavedChanges(false);
                            setShowListsDropdown(false);
                          }}
                        >
                          <div className="flex flex-1 items-center">
                            <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>All Partners</span>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs text-[#282A3F] italic" style={{ fontFamily: 'Poppins, sans-serif' }}>Default</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* No divider between lists */}
                      
                      {/* Other saved lists */}
                      {savedLists.map(list => (
                        <div 
                          key={list.id}
                          className="relative"
                        >
                          <div
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                            onClick={() => {
                              // Normal behavior for other lists
                              setActiveList(list);
                              // Store the original filters to enable reverting changes
                              setOriginalListFilters(list.filters);
                              // Apply filter settings
                              setFilterText(list.filters.searchText || '');
                              setSelectedStatus(list.filters.status || '');
                              setSelectedIndustry(list.filters.industry || '');
                              setSelectedType(list.filters.type || '');
                              // Clear any active view when switching lists
                              setActiveView(null);
                              setHasUnsavedChanges(false);
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
                            
                            {/* Three dots menu - only shown for non-default lists */}
                            {!list.isDefault && (
                              <div className="group ml-auto relative">
                                <div 
                                  className="rounded-full p-1 hover:bg-slate-200 text-slate-500 focus:outline-none cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // This would toggle the edit menu in a real implementation
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                  </svg>
                                </div>
                                
                                {/* Edit menu - shown on hover */}
                                <div className="absolute right-0 mt-1 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-md hidden group-hover:block z-50">
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 w-full text-left text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                                    Rename
                                  </div>
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 w-full text-left text-red-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                                    Delete
                                  </div>
                                </div>
                              </div>
                            )}
                            
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
                    
                  </div>
                )}
              </div>
              
              {/* List actions - Share/Clear when a list is active and it's not the default "All Partners" list */}
              {activeList && !(activeList.isDefault && activeList.name === "All Partners") && (
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
                  
                  {/* Return to all partners button removed */}
                </div>
              )}
            </div>
            
            {/* Right-side action buttons */}
            <div className="flex items-center gap-2">
              

              
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
          
          {/* View Management Guidance - appears when creating or using Views */}
          {showDynamicListGuidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg mb-4 overflow-hidden transition-all duration-300">
              <div className="p-4 cursor-pointer flex items-center justify-between" 
                   onClick={() => setIsGuidanceCollapsed(!isGuidanceCollapsed)}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Use Views to save and apply filter combinations
                  </h3>
                </div>
                <div>
                  {isGuidanceCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Collapsible content */}
              {!isGuidanceCollapsed && (
                <div className="px-4 pb-4 pt-1 ml-10">
                  <div className="text-sm text-blue-700">
                    <p>Apply filters and save them as named views for quick access later.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Save Time:</strong> Create reusable filter combinations for common partner segments</li>
                      <li><strong>Quick Access:</strong> Instantly apply complex filter combinations with a single click</li>
                      <li><strong>Global Views:</strong> Use your saved views across all your partner lists</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* No explanation blocks anymore */}
          
          {/* Bottom row with search and filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              {/* Search field - first position */}
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder="Search by name, industry..."
                  value={filterText}
                  onChange={(e) => {
                    setFilterText(e.target.value);
                    // Only set hasUnsavedChanges if we have an active view
                    if (activeView) {
                      setHasUnsavedChanges(true);
                    }
                  }}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
              {/* Views dropdown - moved after search bar with icon */}
              <div className="relative w-60">
                <Select 
                  value={activeView ? activeView.id : ""} 
                  onValueChange={(value) => {
                    // If we have unsaved changes, ask for confirmation
                    if (hasUnsavedChanges) {
                      if (!confirm("You have unsaved changes. Are you sure you want to switch views?")) {
                        return;
                      }
                    }
                    
                    // Set active view
                    const view = views.find(v => v.id === value);
                    if (view) {
                      setActiveView(view);
                      setFilterText(view.filters.searchText || '');
                      setSelectedStatus(view.filters.status || '');
                      setSelectedIndustry(view.filters.industry || '');
                      setSelectedType(view.filters.type || '');
                      setHasUnsavedChanges(false);
                    }
                  }}
                >
                  <SelectTrigger 
                    className="w-full flex items-center border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 500 }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        <line x1="6" y1="9" x2="18" y2="9"></line>
                        <polyline points="12 13 12 17"></polyline>
                        <line x1="10" y1="15" x2="14" y2="15"></line>
                      </svg>
                      <SelectValue placeholder={activeView ? activeView.name : "Select a view"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {views.length > 0 ? (
                      <>
                        {views.map(view => (
                          <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>
                        ))}
                        {activeView && (
                          <div className="pt-2 mt-1 border-t border-gray-200">
                            <div 
                              className="py-1.5 px-2 flex items-center text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => {
                                // Clear active view and reset filters
                                setActiveView(null);
                                setFilterText('');
                                setSelectedStatus('');
                                setSelectedIndustry('');
                                setSelectedType('');
                                setHasUnsavedChanges(false);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              Clear view
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-2 px-2 text-sm text-gray-500 italic">
                        No saved views
                      </div>
                    )}
                  </SelectContent>
                </Select>

              </div>
              
              {/* Filters - placed alongside search */}
              <div className="flex gap-2 flex-wrap">
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedStatus ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => {
                    setSelectedStatus(selectedStatus ? '' : 'active');
                    // If we have an active view, mark as having unsaved changes
                    if (activeView) {
                      setHasUnsavedChanges(true);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedStatus ? 'text-indigo-500' : 'text-gray-500'}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>Status{selectedStatus ? ': Active' : ''}</span>
                  {selectedStatus && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedIndustry ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => {
                    setSelectedIndustry(selectedIndustry ? '' : 'Insurance');
                    // If we have an active view, mark as having unsaved changes
                    if (activeView) {
                      setHasUnsavedChanges(true);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedIndustry ? 'text-indigo-500' : 'text-gray-500'}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  <span>Industry{selectedIndustry ? `: ${selectedIndustry}` : ''}</span>
                  {selectedIndustry && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedType ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => {
                    setSelectedType(selectedType ? '' : 'Broker');
                    // If we have an active view, mark as having unsaved changes
                    if (activeView) {
                      setHasUnsavedChanges(true);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedType ? 'text-indigo-500' : 'text-gray-500'}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Type{selectedType ? `: ${selectedType}` : ''}</span>
                  {selectedType && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  )}
                </button>
                
                {/* Save View Button - only shown when filters are applied and no view is active or filters don't match active view */}
                {(filterText || selectedStatus || selectedIndustry || selectedType) && (
                  <button 
                    className="flex items-center space-x-1 px-3 py-2 border border-indigo-200 rounded-md text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    onClick={() => setShowSaveViewModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>Save View</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Add Partners button removed */}

              {/* CASE 1: No view is active but filters are applied (on any list including All Partners) */}
              {(filterText || selectedStatus || selectedIndustry || selectedType) && !activeView && (
                <div className="flex items-center gap-2">
                  {/* Revert changes button - always shown when filters are applied without a view */}
                  <button 
                    className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      // Clear all filters
                      setFilterText('');
                      setSelectedStatus('');
                      setSelectedIndustry('');
                      setSelectedType('');
                    }}
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M3 7v6h6"></path>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                    </svg>
                    <span className="text-[#5F6585]">Revert changes</span>
                  </button>
                
                  {/* Save as view button */}
                  <div className="group relative">
                    <button 
                      className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                      onClick={() => setShowSaveListModal(true)}
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      <span className="text-[#3E4DC4] font-medium">Save filters as new view</span>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="opacity-0 absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded bg-gray-800 text-white text-xs whitespace-nowrap transition-opacity group-hover:opacity-100 z-10">
                      Save your selected filters as a view for quick access later
                    </div>
                  </div>
                </div>
              )}
              
              {/* CASE 2: View is active with unsaved changes - only show buttons when filters have changed */}
              {activeView && hasUnsavedChanges && (
                /* Now we'll compare the actual current filter values with the view's filter values
                   to ensure we only show these buttons when there have been real changes */
                (() => {
                  // Check if the filters have actually changed compared to the active view
                  const hasActualFilterChanges = 
                    filterText !== (activeView.filters.searchText || '') ||
                    selectedStatus !== (activeView.filters.status || '') ||
                    selectedIndustry !== (activeView.filters.industry || '') ||
                    selectedType !== (activeView.filters.type || '');
                  
                  // Only render the buttons if there are actual filter changes
                  return hasActualFilterChanges ? (
                    <div className="flex items-center gap-2">
                      {/* Revert changes button */}
                      <button 
                        className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => {
                          // Revert to the original view filters
                          setFilterText(activeView.filters.searchText || '');
                          setSelectedStatus(activeView.filters.status || '');
                          setSelectedIndustry(activeView.filters.industry || '');
                          setSelectedType(activeView.filters.type || '');
                          setHasUnsavedChanges(false);
                        }}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M3 7v6h6"></path>
                          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                        </svg>
                        <span className="text-[#5F6585]">Revert changes</span>
                      </button>
                    
                      {/* Save as new view button */}
                      <button 
                        className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                        onClick={() => setShowSaveListModal(true)}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span className="text-[#3E4DC4] font-medium">Save as new view</span>
                      </button>
                    
                      {/* Save button */}
                      <div className="group relative">
                        <button 
                          className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                          onClick={() => {
                            // Save changes to active view
                            const updatedView = {
                              ...activeView,
                              filters: {
                                searchText: filterText || '',
                                status: selectedStatus || '',
                                industry: selectedIndustry || '',
                                type: selectedType || ''
                              }
                            };
                            
                            // Update the view in the views array
                            const updatedViews = views.map(view => 
                              view.id === activeView.id ? updatedView : view
                            );
                            
                            setViews(updatedViews);
                            setActiveView(updatedView);
                            setHasUnsavedChanges(false);
                            
                            toast({
                              title: "View saved",
                              description: `"${activeView.name}" has been updated with your current filter settings.`
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
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </div>
            
            {/* Clear filters button - only shown when at least one filter is applied */}
            {(filterText || selectedStatus || selectedIndustry || selectedType) && (
              <button 
                onClick={() => {
                  setFilterText('');
                  setSelectedStatus('');
                  setSelectedIndustry('');
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
            )}
          </div>
        </div>
      </div>
      
      {/* Selection actions bar - visible when items are selected */}
      {selectedPartners.length > 0 && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-indigo-700 font-medium mr-2">{selectedPartners.length} partners selected</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600"
              onClick={() => setSelectedPartners([])}
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
              variant="default" 
              size="sm"
              className="bg-[#5567E5] hover:bg-[#4555CB] text-white"
              onClick={() => {
                // Open add to list dialog
                setShowAddToListModal(true);
                setNewListName('');
                setNewListDescription('');
                setListToAddTo('new'); // Default to creating a new list
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
                // TODO: Implement campaign creation
                alert('Selected partners can be added to a campaign. This will be available in the Campaigns section');
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
          <div className="text-xl font-semibold">{stats.totalPartners}</div>
          <div className="text-sm text-gray-500">Total Partners</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.activePartners}</div>
          <div className="text-sm text-gray-500">Active Partners</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
      </div>
      
      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Save View</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a view. You can quickly access this view later from any list, and it will apply the filters you saved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* View Name */}
            <div>
              <Label htmlFor="viewName" className="text-sm font-medium text-[#282A3F]">View Name</Label>
              <Input 
                id="viewName" 
                placeholder="Enter a name (e.g., Active Insurance Brokers)"
                defaultValue={(filterText || selectedStatus || selectedIndustry || selectedType) ? 
                  `${selectedStatus ? 'Active ' : ''}${selectedIndustry || ''} ${selectedType || ''}`.trim() : 
                  ''
                }
                className="mt-1.5"
              />
            </div>
            
            {/* Elegant filter summary */}
            {(filterText || selectedStatus || selectedIndustry || selectedType) && (
              <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-lg p-3 text-sm">
                <div className="flex items-center text-[#282A3F] font-medium mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filters saved in this view
                </div>
                <div className="space-y-1.5 text-[#5F6585]">
                  {filterText && (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3E4DC4] mr-2"></div>
                      <span className="font-medium">Search:</span> <span className="ml-1">"{filterText}"</span>
                    </div>
                  )}
                  {selectedStatus && (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3E4DC4] mr-2"></div>
                      <span className="font-medium">Status:</span> <span className="ml-1">{selectedStatus}</span>
                    </div>
                  )}
                  {selectedIndustry && (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3E4DC4] mr-2"></div>
                      <span className="font-medium">Industry:</span> <span className="ml-1">{selectedIndustry}</span>
                    </div>
                  )}
                  {selectedType && (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3E4DC4] mr-2"></div>
                      <span className="font-medium">Type:</span> <span className="ml-1">{selectedType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            

          </div>
          
          <DialogFooter>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  // Validate required fields
                  const viewName = (document.getElementById('viewName') as HTMLInputElement).value;
                  
                  if (!viewName.trim()) {
                    toast({
                      title: "Missing required field",
                      description: "Please enter a name for your view.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Create a view object with current filters
                  const newView = {
                    id: `view-${Date.now()}`,
                    name: viewName,
                    description: '',
                    filters: {
                      searchText: filterText || '',
                      status: selectedStatus || '',
                      industry: selectedIndustry || '',
                      type: selectedType || ''
                    },
                    isShared: false,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // Add the new view to the views array
                  setViews([...views, newView]);
                  
                  // Set as active view
                  setActiveView(newView);
                  
                  // Reset hasUnsavedChanges
                  setHasUnsavedChanges(false);
                  
                  toast({
                    title: "View saved successfully",
                    description: `"${viewName}" has been saved and is now available in the views dropdown.`,
                  });
                  
                  // Close the modal
                  setShowSaveListModal(false);
                }}
              >
                Save View
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Partners Modal - Removed */}
      
      {/* Add to List Modal - allows creating a new list or adding to existing list */}
      <Dialog open={showAddToListModal} onOpenChange={setShowAddToListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Add partners to list
            </DialogTitle>
            <DialogDescription>
              Add selected partners to an existing list or create a new list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              {/* List selection */}
              <div>
                <Label htmlFor="list-selection" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Select an option
                </Label>
                <Select 
                  value={listToAddTo} 
                  onValueChange={setListToAddTo}
                >
                  <SelectTrigger id="list-selection" className="mt-1.5">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create a new list</SelectItem>
                    {savedLists.map(list => (
                      <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* New list fields - only shown when creating a new list */}
              {listToAddTo === 'new' && (
                <>
                  <div>
                    <Label htmlFor="new-list-name" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      List name*
                    </Label>
                    <Input 
                      id="new-list-name" 
                      value={newListName} 
                      onChange={(e) => setNewListName(e.target.value)} 
                      placeholder="Enter list name" 
                      className="mt-1.5"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-list-description" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Description (optional)
                    </Label>
                    <Textarea 
                      id="new-list-description" 
                      value={newListDescription} 
                      onChange={(e) => setNewListDescription(e.target.value)} 
                      placeholder="Enter list description" 
                      className="mt-1.5"
                    />
                  </div>
                </>
              )}
              
              {/* Selected partners count */}
              <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-lg p-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 rounded-full p-2 bg-[#D4D9F3]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#282A3F]">{selectedPartners.length} partners selected</h4>
                    <p className="text-sm text-[#5F6585] mt-1">
                      These partners will be added to your list.
                    </p>
                  </div>
                </div>
      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeView ? 'Update Saved View' : 'Save Current View'}</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a view that you can easily access later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="viewName">View Name</Label>
              <Input 
                id="viewName" 
                placeholder="Enter a name for this view"
                defaultValue={activeView?.name || ''}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="viewDescription">Description (Optional)</Label>
              <Textarea 
                id="viewDescription" 
                placeholder="Add a short description to help remember what this view shows"
                rows={2}
                defaultValue={activeView?.description || ''}
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium mb-2">Current Filters</div>
              <div className="space-y-1">
                {selectedStatus && (
                  <div className="flex items-center text-xs">
                    <span className="font-medium w-20">Status:</span>
                    <span className="text-gray-700">{selectedStatus}</span>
                  </div>
                )}
                {selectedIndustry && (
                  <div className="flex items-center text-xs">
                    <span className="font-medium w-20">Industry:</span>
                    <span className="text-gray-700">{selectedIndustry}</span>
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center text-xs">
                    <span className="font-medium w-20">Type:</span>
                    <span className="text-gray-700">{selectedType}</span>
                  </div>
                )}
                {filterText && (
                  <div className="flex items-center text-xs">
                    <span className="font-medium w-20">Search:</span>
                    <span className="text-gray-700">{filterText}</span>
                  </div>
                )}
                {!selectedStatus && !selectedIndustry && !selectedType && !filterText && (
                  <div className="text-xs text-gray-500">No filters currently applied</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (listToAddTo === 'new') {
                  // Create a new list
                  if (!newListName.trim()) {
                    toast({
                      title: "List name required",
                      description: "Please enter a name for your list.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Create a new list with the selected partners
                  const newList: SavedList = {
                    id: `list-${Date.now()}`,
                    name: newListName,
                    description: newListDescription,
                    type: 'selection',
                    filters: {},
                    members: selectedPartners,
                    isShared: false,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // Add the new list to saved lists
                  setSavedLists([...savedLists, newList]);
                  
                  // Set as active list
                  setActiveList(newList);
                  
                  // Reset selected partners
                  setSelectedPartners([]);
                  
                  toast({
                    title: "List created successfully",
                    description: `"${newListName}" has been created with ${selectedPartners.length} partners.`,
                  });
                } else {
                  // Add to existing list
                  const existingList = savedLists.find(list => list.id === listToAddTo);
                  
                  if (existingList) {
                    // Get current list members
                    const currentMembers = existingList.members || [];
                    const updatedMembers = [...currentMembers];
                    
                    // Add each selected partner if not already in the list
                    selectedPartners.forEach(id => {
                      if (!updatedMembers.includes(id)) {
                        updatedMembers.push(id);
                      }
                    });
                    
                    // Update the list
                    const updatedList = {
                      ...existingList,
                      members: updatedMembers
                    };
                    
                    // Update saved lists
                    const updatedLists = savedLists.map(list => 
                      list.id === existingList.id ? updatedList : list
                    );
                    
                    setSavedLists(updatedLists);
                    
                    if (activeList && activeList.id === existingList.id) {
                      setActiveList(updatedList);
                    }
                    
                    // Reset selected partners
                    setSelectedPartners([]);
                    
                    toast({
                      title: "Partners added to list",
                      description: `${selectedPartners.length} partners have been added to "${existingList.name}".`,
                    });
                  }
                }
                
                // Close the modal
                setShowAddToListModal(false);
              }}
              disabled={selectedPartners.length === 0}
            >
              {listToAddTo === 'new' ? 'Create list' : 'Add to list'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create List Modal - used for creating both Saved Filters and Custom Lists */}
      <Dialog open={showCreateListModal} onOpenChange={setShowCreateListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectionListType === 'filter' ? 'Create a Saved Filter' : 'Create a Custom List'}
            </DialogTitle>
            <DialogDescription>
              {selectionListType === 'filter' 
                ? 'Define a filter that will automatically show partners matching your criteria.' 
                : 'Create a list where you manually add and remove partners.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-list-name" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>List name</Label>
                <Input 
                  id="new-list-name" 
                  value={newListName} 
                  onChange={(e) => setNewListName(e.target.value)} 
                  placeholder="Enter list name" 
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="new-list-description" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Description (optional)</Label>
                <Textarea 
                  id="new-list-description" 
                  value={newListDescription} 
                  onChange={(e) => setNewListDescription(e.target.value)} 
                  placeholder="Enter list description" 
                  className="mt-1.5"
                />
              </div>
              
              {selectionListType === 'filter' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 rounded-full p-2 bg-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#282A3F]">Saved Filter</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        This will create a list that automatically updates to show partners matching your filter criteria.
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        After creating this filter, you'll be able to set filter criteria to determine which partners are included.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectionListType === 'selection' && (
                <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 rounded-full p-2 bg-[#D4D9F3]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#282A3F]">Custom List</h4>
                      <p className="text-sm text-[#5F6585] mt-1">
                        Your list will start empty and you'll manually add partners to it.
                      </p>
                      <p className="text-xs text-[#5F6585] mt-1">
                        Only partners you specifically add will be included in this list.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                // Check if list name is provided
                if (!newListName.trim()) {
                  toast({
                    title: "List name required",
                    description: "Please enter a name for your list.",
                    variant: "destructive",
                  });
                  return;
                }
                // Generate a new ID
                const newId = Date.now().toString();
                
                // Create the new list
                const newList: SavedList = {
                  id: newId,
                  name: newListName.trim(),
                  description: newListDescription.trim() || undefined,
                  type: selectionListType,
                  filters: selectionListType === 'filter' ? {} : {},
                  members: selectionListType === 'selection' ? selectedPartners : undefined,
                  isShared: false,
                  createdBy: 'John Smith', // Hardcoded for demo
                  createdAt: new Date()
                };
                
                // Add the new list to saved lists
                const updatedLists = [...savedLists, newList];
                setSavedLists(updatedLists);
                
                // Set the new list as active
                setActiveList(newList);
                
                // Show appropriate success message
                if (selectionListType === 'selection') {
                  toast({
                    title: "Custom List created",
                    description: `"${newListName}" has been created. You can now add partners to it.`,
                  });
                } else {
                  toast({
                    title: "Saved Filter created",
                    description: `"${newListName}" is ready! Now set your filter criteria to view partners matching your requirements.`,
                  });
                  
                  // Set flag to show guidance banner for Saved Filters
                  setShowDynamicListGuidance(true);
                }
                
                // Close the modal
                setShowCreateListModal(false);
              }}
              className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create List from Selection Modal - with extremely clear distinction between list types */}
      <Dialog open={showCreateFromSelectionModal} onOpenChange={setShowCreateFromSelectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Create list with {selectedPartners.length} selected partner{selectedPartners.length > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              This will create a static list containing only the partners you've selected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="selection-list-name" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>List name</Label>
                <Input 
                  id="selection-list-name" 
                  value={selectionListName} 
                  onChange={(e) => setSelectionListName(e.target.value)} 
                  placeholder="Enter list name" 
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="selection-list-description" className="text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Description (optional)</Label>
                <Textarea 
                  id="selection-list-description" 
                  value={selectionListDescription} 
                  onChange={(e) => setSelectionListDescription(e.target.value)} 
                  placeholder="Enter list description" 
                  className="mt-1.5"
                />
              </div>
              
              <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-lg p-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 rounded-full p-2 bg-[#D4D9F3]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-base font-semibold text-[#282A3F]">Static Partner List</h4>
                      <div className="ml-2 bg-[#D4D9F3] text-[#3E4DC4] rounded-full px-2 py-0.5 text-xs">
                        {selectedPartners.length} Partner{selectedPartners.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <p className="text-sm text-[#5F6585] mt-1">Your list will include <strong>only the partners you've selected</strong>.</p>
                    <p className="text-xs text-[#5F6585] mt-1">You can add or remove partners from this list at any time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFromSelectionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Check if list name is provided
                if (!selectionListName.trim()) {
                  toast({
                    title: "List name required",
                    description: "Please enter a name for your list.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Generate a new ID
                const newId = Date.now().toString();
                
                // Create the new list based on type
                const newList: SavedList = {
                  id: newId,
                  name: selectionListName.trim(),
                  description: selectionListDescription.trim() || undefined,
                  type: selectionListType,
                  // For Saved Filters, analyze the selected partners to create intelligent filters
                  filters: selectionListType === 'filter' 
                    ? { 
                      // This is a simplified approach - in a real app you'd analyze the
                      // selected partners to determine common attributes for smarter filters
                    }
                    : {}, // For Custom Lists, we'll use the members array instead
                  // For Custom Lists, use the selection directly
                  members: selectionListType === 'selection' ? selectedPartners : undefined, 
                  isShared: false,
                  createdBy: 'John Smith', // Hardcoded for demo
                  createdAt: new Date()
                };
                
                // Add to saved lists
                setSavedLists([...savedLists, newList]);
                
                // Set as active list
                setActiveList(newList);
                setOriginalListFilters(newList.filters);
                
                // Close the modal
                setShowCreateFromSelectionModal(false);
                
                // Reset form fields
                setSelectionListName('');
                setSelectionListDescription('');
                
                // Clear selection after creating the list
                setSelectedPartners([]);
                
                // Show success message with guidance for next steps
                if (selectionListType === 'selection') {
                  // Success message for Custom List
                  toast({
                    title: "Custom List created",
                    description: `"${selectionListName}" has been created with ${selectedPartners.length} partners.`,
                  });
                } else {
                  // Success message with next steps guidance for Saved Filter
                  toast({
                    title: "Saved Filter created",
                    description: `"${selectionListName}" is ready! Now set your filter criteria to view partners matching your requirements.`,
                  });
                  
                  // Set flag to show guidance banner
                  setShowDynamicListGuidance(true);
                  
                  // After a brief delay, show a second toast with business value
                  setTimeout(() => {
                    toast({
                      title: "💡 Pro Tip",
                      description: "Fine-tune your filters to maintain up-to-date partner segments for campaigns, reporting, and opportunity tracking.",
                    });
                  }, 2000);
                }
              }}
              disabled={!selectionListName.trim()}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share List Modal with Extended Options */}
      <Dialog open={showShareListModal} onOpenChange={setShowShareListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share List: {activeList?.name}</DialogTitle>
            <DialogDescription>
              Share this list with partners, teams, or individuals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
            
            {/* Partners Section */}
            <div className="grid gap-3">
              <Label>Select Partner</Label>
              <div className="relative">
                <select className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm appearance-none">
                  <option value="">Select a partner...</option>
                  {mockPartners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              <Label className="mt-2">Partner Contacts</Label>
              <div className="border border-gray-200 rounded-md max-h-36 overflow-y-auto">
                <div className="p-2 border-b hover:bg-gray-50">
                  <div className="flex items-center">
                    <Checkbox id="contact-1" className="mr-2" />
                    <Label htmlFor="contact-1" className="text-sm font-normal cursor-pointer flex-grow">
                      Sarah Johnson <span className="text-xs text-gray-500 ml-1">(sjohnson@abc-insurance.com)</span>
                    </Label>
                  </div>
                </div>
                <div className="p-2 border-b hover:bg-gray-50">
                  <div className="flex items-center">
                    <Checkbox id="contact-2" className="mr-2" />
                    <Label htmlFor="contact-2" className="text-sm font-normal cursor-pointer flex-grow">
                      Michael Chen <span className="text-xs text-gray-500 ml-1">(mchen@abc-insurance.com)</span>
                    </Label>
                  </div>
                </div>
                <div className="p-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Checkbox id="contact-3" className="mr-2" />
                    <Label htmlFor="contact-3" className="text-sm font-normal cursor-pointer flex-grow">
                      All Contacts <span className="text-xs text-gray-500 ml-1">(3 people)</span>
                    </Label>
                  </div>
                </div>
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
                <div className="flex items-center space-x-2">
                  <Checkbox id="canShare" />
                  <Label htmlFor="canShare" className="text-sm font-normal">
                    Can share this list with others
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
              // Handle sharing logic
              const partners = document.querySelectorAll('input[type="checkbox"]:checked');
              const canEdit = (document.getElementById('canEdit') as HTMLInputElement).checked;
              const canShare = (document.getElementById('canShare') as HTMLInputElement).checked;
              const message = (document.getElementById('shareMessage') as HTMLTextAreaElement).value;
              
              // Extract recipients from selected partners and contacts
              const selectedPartnerIds = Array.from(partners).map(el => el.id.split('-')[1]);
              
              // Just for demonstration, we'll use hardcoded emails
              const recipientEmails = ['sjohnson@abc-insurance.com', 'mchen@abc-insurance.com'];
              
              // Update the active list's sharing settings
              if (activeList) {
                const updatedLists = savedLists.map(list => {
                  if (list.id === activeList.id) {
                    return {
                      ...list,
                      isShared: true,
                      sharedWith: recipientEmails
                    };
                  }
                  return list;
                });
                
                setSavedLists(updatedLists);
                setActiveList(updatedLists.find(v => v.id === activeList.id) || null);
              }
              
              setShowShareListModal(false);
            }}>
              Share List
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
                  checked={selectedPartners.length === displayedPartners.length && displayedPartners.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
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
                  Industry
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
                  Size
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
                  Customers
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Opportunities
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
            {displayedPartners.map((partner) => (
              <tr 
                key={partner.id} 
                className={`hover:bg-gray-50 group ${selectedPartners.includes(partner.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${selectedPartners.includes(partner.id) ? 'visible' : 'invisible group-hover:visible'}`}
                    checked={selectedPartners.includes(partner.id)}
                    onChange={() => toggleSelectPartner(partner.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                      <AvatarFallback>{partner.initials}</AvatarFallback>
                    </Avatar>
                    <Link href={`/lists/partners/${partner.id}`} className="font-medium text-gray-900 hover:text-indigo-700">{partner.name}</Link>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{partner.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {partner.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.customers}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.opportunities}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges industry={partner.industry} type={partner.type} />
                </td>
              </tr>
            ))}
            
            {displayedPartners.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    {activeList && activeList.type === 'selection' ? (
                      // Empty state for Custom Lists
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3 className="text-base font-medium text-gray-900 mb-1">Custom List is empty</h3>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          Your Custom List is waiting for partners! Add your first partner to get started.
                        </p>
                        {/* Add partners button removed */}
                      </>
                    ) : (
                      // Empty state for Saved Filters or regular filtered view
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3 className="text-base font-medium text-gray-900 mb-1">No matching partners</h3>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          No partners match your current filter criteria. Try adjusting your filters.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setFilterText('');
                            setSelectedStatus('');
                            setSelectedIndustry('');
                            setSelectedType('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </>
                    )}
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

// Export the Partners page
export default function PartnersPage() {
  const { environment } = useEnvironment();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
        
        {/* New Partner button */}
        <button 
          className="flex items-center rounded-md bg-[#5567E5] text-white px-4 py-2 hover:bg-[#4555CB] transition-colors"
          onClick={() => {
            // This would navigate to a partner creation form in a real implementation
            alert('This would open the new partner creation form in the real application');
          }}
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="font-medium">Create new partner</span>
        </button>
      </div>
      
      <PartnersTable />
    </div>
  );
}

// Helper component to guide users on dynamic list usage
function DynamicListGuidance({ isNewList }: { isNewList: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 overflow-hidden transition-all duration-300" style={{ maxHeight: isCollapsed ? '60px' : '1000px' }}>
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-1.5 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div className="ml-3 flex-grow">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {isNewList ? 'Define your filter criteria' : 'About this Saved Filter'}
            </h3>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          </div>
          <div className={`mt-1 text-sm text-blue-700 ${isCollapsed ? 'hidden' : 'block'}`}>
            <p>Set up filters below to define which partners should be shown in this view. This helps you:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Quickly access specific partner segments (e.g., active insurance brokers)</li>
              <li>See an always up-to-date view for targeted campaigns and reporting</li>
              <li>Find all partners that match your specific business criteria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* IMPORTANT NOTE: 
   - Dynamic lists automatically include ALL partners matching the criteria, even new ones added in the future
   - Static lists only include the specific partners that are manually selected
   This distinction needs to be extremely clear to users in the UI
*/