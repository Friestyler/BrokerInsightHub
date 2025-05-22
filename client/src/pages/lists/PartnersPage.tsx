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
const mockPartners = [
  {
    id: 1,
    name: "XYZ Insurance Group",  // Updated to match PartnerDetail.tsx
    initials: "XY",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 3,
    opportunities: 3,
    location: "New York, NY",
    contactEmail: "contact@xyz-insurance.com",
    primaryContact: "John Doe"
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

// Main partner list component
function PartnersTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
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
  
  // State for saved lists
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    {
      id: 'all-partners',
      name: 'All Partners',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true // Flag to indicate this is a default list that can't be edited/deleted
    },
    {
      id: '1',
      name: 'Active Insurance Brokers',
      filters: { status: 'active', industry: 'Insurance', type: 'Broker' },
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'Consulting Partners',
      filters: { industry: 'Consulting' },
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    },
    {
      id: '3',
      name: 'Enterprise Partners',
      filters: { size: 'enterprise' },
      isShared: true,
      sharedWith: ['partnerships@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15')
    }
  ]);
  const [activeList, setActiveList] = useState<SavedList | null>(
    savedLists.find(list => list.id === 'all-partners' && list.isDefault) || null
  );
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showAddPartnersModal, setShowAddPartnersModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showDynamicListGuidance, setShowDynamicListGuidance] = useState(false);
  const [isGuidanceCollapsed, setIsGuidanceCollapsed] = useState(false);
  // State for the name and description when creating a list through the general create modal
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [partnersToAdd, setPartnersToAdd] = useState<number[]>([]);
  const [showCreateFromSelectionModal, setShowCreateFromSelectionModal] = useState(false);
    
  // Filter partners based on search text, filter selections, and list type
  const displayedPartners = mockPartners.filter(partner => {
    // If we have an active static list, only show partners that were explicitly selected for that list
    if (activeList && activeList.type === 'selection') {
      // First check if the partner is in the selection list
      const isInSelectionList = activeList.members?.includes(partner.id) || false;
      
      if (!isInSelectionList) {
        return false; // Skip partners not in selection list
      }
      
      // Then apply filters only to the selected partners
      const matchesText = !filterText || 
        partner.name.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.industry.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.type.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesStatus = !selectedStatus || partner.status === selectedStatus;
      const matchesIndustry = !selectedIndustry || partner.industry === selectedIndustry;
      const matchesType = !selectedType || partner.type === selectedType;
      
      return matchesText && matchesStatus && matchesIndustry && matchesType;
    } else {
      // For dynamic lists or no list, apply filters to all partners
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
                      {activeList ? activeList.name : "My Lists"}
                    </span>
                    
                    {/* Dynamic List Type Indicator */}
                    {activeList && (
                      <div className="group relative ml-2">
                        <div className="flex items-center">
                          <div className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-xs">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              <span>Custom List</span>
                            </div>
                          </div>
                          <div className="opacity-0 absolute -top-9 left-0 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap transition-opacity group-hover:opacity-100 z-10">
                            Only includes partners you manually add
                          </div>
                        </div>
                      </div>
                    )}
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
                      {savedLists.map(list => (
                        <div 
                          key={list.id}
                          className="relative"
                        >
                          <div
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                            onClick={() => {
                              // Special handling for "All Partners" default list
                              if (list.isDefault && list.name === "All Partners") {
                                // Clear filters and active list (same behavior as "Return to all partners" button)
                                setActiveList(null);
                                setOriginalListFilters(null);
                                setFilterText('');
                                setSelectedStatus('');
                                setSelectedIndustry('');
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
                                setSelectedIndustry(list.filters.industry || '');
                                setSelectedType(list.filters.type || '');
                                setHasUnsavedChanges(false);
                              }
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
              
              {/* List actions - Share/Clear when a list is active */}
              {activeList && (
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
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => {
                      setActiveList(null);
                      setOriginalListFilters(null);
                      setFilterText('');
                      setSelectedStatus('');
                      setSelectedIndustry('');
                      setSelectedType('');
                      setHasUnsavedChanges(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Return to all partners
                  </Button>
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
          
          {/* Static List Information Banner - shows when a static list is active */}
          {activeList?.type === 'selection' && (
            <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-lg mb-4 overflow-hidden transition-all duration-300">
              <div className="p-4 cursor-pointer flex items-center justify-between" 
                   onClick={() => setIsGuidanceCollapsed(!isGuidanceCollapsed)}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-[#D4D9F3] rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-[#3E4DC4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Static List: Only changes when you make them
                  </h3>
                </div>
                <div>
                  {isGuidanceCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Collapsible content */}
              {!isGuidanceCollapsed && (
                <div className="px-4 pb-4 pt-1 ml-10">
                  <div className="text-sm text-[#5F6585]">
                    <p><strong>This list will only change when you explicitly add or remove partners.</strong></p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>No automatic updates:</strong> New partners will never be added automatically</li>
                      <li><strong>Full control:</strong> You decide exactly which partners should be included</li>
                      <li><strong>Manual management:</strong> Use the "Add Partners" button to expand your list anytime</li>
                    </ul>
                    <div className="flex mt-3">
                      <button 
                        className="flex items-center rounded-md bg-[#5567E5] text-white px-3 py-1.5 text-xs hover:bg-[#4555CB]"
                        onClick={() => {
                          setPartnersToAdd([]);
                          setShowAddPartnersModal(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Add partners to this list
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bottom row with search and filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              {/* Search field - moved to second row */}
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder="Search by name, industry..."
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
              
              {/* Filters - placed alongside search */}
              <div className="flex gap-2 flex-wrap">
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedStatus ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedStatus(selectedStatus ? '' : 'active')}
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
                  onClick={() => setSelectedIndustry(selectedIndustry ? '' : 'Insurance')}
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
                  onClick={() => setSelectedType(selectedType ? '' : 'Broker')}
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
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Add Partners button - only shown for static lists */}
              {activeList && activeList.type === 'selection' && (
                <button 
                  className="flex items-center rounded-md bg-[#EBEEFB] border border-[#D4D9F3] text-[#3E4DC4] px-4 py-2 hover:bg-[#D4D9F3]"
                  onClick={() => {
                    setPartnersToAdd([]);
                    setShowAddPartnersModal(true);
                  }}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 11h-6"></path>
                    <path d="M19 8v6"></path>
                  </svg>
                  <span className="font-medium">Add existing partners to this list</span>
                </button>
              )}

              {/* Revert button - only shown for non-default lists with unsaved changes */}
              {hasUnsavedChanges && activeList && !activeList.isDefault && (
                <button 
                  className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                  onClick={revertChanges}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                  <span className="text-[#5F6585]">Revert changes</span>
                </button>
              )}
              
              {/* Save button for existing non-default lists with unsaved changes */}
              {activeList && !activeList.isDefault && hasUnsavedChanges && (
                <button 
                  className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                  onClick={saveChanges}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span className="text-[#3E4DC4] font-medium">Save</span>
                </button>
              )}
              
              {/* Save as view button */}
              {(
                ((filterText || selectedStatus || selectedIndustry || selectedType) && (activeList?.isDefault || !activeList)) || 
                (activeList && !activeList.isDefault && hasUnsavedChanges)
              ) && (
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
                  <span className="text-[#3E4DC4] font-medium">Save as view</span>
                </button>
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
                // When creating from selection, we always create a custom list
                setShowCreateListModal(true);
                setNewListName('');
                setNewListDescription('');
                setSelectionListType('selection'); // Set to Custom List type
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Create Custom List
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
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Save Filter Combination as View</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a named view. You can quickly access this view later to apply the same filters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              {/* View Name */}
              <div className="grid gap-2">
                <Label htmlFor="viewName" className="text-sm font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>View Name</Label>
                <Input 
                  id="viewName" 
                  placeholder="Enter a descriptive name (e.g., Active Insurance Brokers)"
                  value={(filterText || selectedStatus || selectedIndustry || selectedType) ? 
                    `${selectedStatus ? 'Active ' : ''}${selectedIndustry || ''} ${selectedType || ''}`.trim() : 
                    ''
                  }
                  onChange={(e) => {
                    // In a real implementation, we would update state here
                    // For simplicity, we'll just use the input's value directly
                  }}
                />
                <div className="grid gap-2">
                  <Label htmlFor="viewDescription" className="text-sm font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>View Description (Optional)</Label>
                  <Textarea 
                    id="viewDescription" 
                    placeholder="Describe what this view shows (e.g., 'Active broker partners in the insurance industry')"
                    rows={2}
                  />
                </div>
              </div>
              
              {/* Current filters info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-0.5">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Filters to be saved in this view</h4>
                    <ul className="mt-1 text-xs text-gray-600">
                      {filterText && <li className="mb-1">• Search: "{filterText}"</li>}
                      {selectedStatus && <li className="mb-1">• Status: {selectedStatus}</li>}
                      {selectedIndustry && <li className="mb-1">• Industry: {selectedIndustry}</li>}
                      {selectedType && <li className="mb-1">• Type: {selectedType}</li>}
                      {!filterText && !selectedStatus && !selectedIndustry && !selectedType && (
                        <li className="text-amber-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          </svg>
                          No filters are currently applied
                        </li>
                      )}
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">
                      When you select this view later, these filters will be applied automatically. 
                      This view will dynamically update to show all partners matching these criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lists section - where to save the view */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Where to save this view</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Checkbox id="saveGlobally" defaultChecked={true} />
                  <div className="ml-3">
                    <Label htmlFor="saveGlobally" className="text-sm font-medium">
                      Save as global view
                    </Label>
                    <p className="text-xs text-gray-600">
                      This view will be available across all partner lists
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Checkbox id="shareView" defaultChecked={true} />
                  <div className="ml-3">
                    <Label htmlFor="shareView" className="text-sm font-medium">
                      Share with my team
                    </Label>
                    <p className="text-xs text-gray-600">
                      Make this view available to all team members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-xs text-gray-500">
              You can manage your saved views in the "Views" dropdown
            </div>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  // Validate required fields
                  const viewName = (document.getElementById('viewName') as HTMLInputElement).value;
                  const viewDescription = (document.getElementById('viewDescription') as HTMLTextAreaElement).value;
                  const isShared = (document.getElementById('shareView') as HTMLInputElement).checked;
                  const saveGlobally = (document.getElementById('saveGlobally') as HTMLInputElement).checked;
                  
                  if (!viewName.trim()) {
                    // Show error toast notification
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
                    description: viewDescription || '',
                    filters: {
                      searchText: filterText || '',
                      status: selectedStatus || '',
                      industry: selectedIndustry || '',
                      type: selectedType || ''
                    },
                    isGlobal: saveGlobally,
                    isShared,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // In a real implementation, we would store the view
                  toast({
                    title: "View saved successfully",
                    description: `"${viewName}" has been saved and is now available in the filters dropdown.`,
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
      
      {/* Add Partners Modal */}
      <Dialog open={showAddPartnersModal} onOpenChange={setShowAddPartnersModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Add partners to your Custom List</DialogTitle>
            <DialogDescription>
              Select partners you want to add to "{activeList?.name}". Only partners you specifically select will be included.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Help text banner */}
            <div className="bg-gray-50 border-l-4 border-[#3E4DC4] p-3 mb-4 rounded-r-md">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Can't find the partner you're looking for?</strong>
                  </p>
                  <a 
                    href="#" 
                    className="text-sm text-[#3E4DC4] hover:underline flex items-center mt-1"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddPartnersModal(false);
                      // This would navigate to partner creation in a real implementation
                      setTimeout(() => {
                        alert('This would open the new partner creation form in the real application');
                      }, 100);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M12 9v6"></path>
                      <path d="M15 12H9"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Create a new partner in Qollabi first
                  </a>
                </div>
              </div>
            </div>

            {/* Search and filter */}
            <div className="mb-4">
              <Input 
                placeholder="Search existing partners..." 
                className="mb-2"
              />
              
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Status
                </Button>
                
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  Industry
                </Button>
                
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Type
                </Button>
              </div>
            </div>
            
            {/* Partners list */}
            <div className="border rounded-md mb-4 overflow-hidden max-h-96 overflow-y-auto">
              {/* Filter out partners already in the list */}
              <div className="divide-y divide-gray-200">
                {mockPartners
                  .filter(p => !activeList?.members?.includes(p.id))
                  .map(partner => (
                    <div 
                      key={partner.id}
                      className={`flex items-center p-3 hover:bg-gray-50 ${partnersToAdd.includes(partner.id) ? 'bg-blue-50' : ''}`}
                    >
                      <Checkbox 
                        checked={partnersToAdd.includes(partner.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPartnersToAdd([...partnersToAdd, partner.id]);
                          } else {
                            setPartnersToAdd(partnersToAdd.filter(id => id !== partner.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex items-center grow">
                        <Avatar className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600">
                          <AvatarFallback>{partner.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{partner.name}</span>
                          <div className="flex text-xs text-gray-500 mt-1 space-x-3">
                            <span>{partner.industry}</span>
                            <span>•</span>
                            <span>{partner.type}</span>
                            <span>•</span>
                            <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize text-xs">
                              {partner.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
                {mockPartners.filter(p => !activeList?.members?.includes(p.id)).length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">All partners have already been added to this list.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected count */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {partnersToAdd.length} partners selected
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPartnersModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeList && activeList.type === 'selection') {
                  // Get current list members and add new selected partners
                  const currentMembers = activeList.members || [];
                  const updatedMembers = [...currentMembers];
                  
                  // Add each selected partner if not already in the list
                  partnersToAdd.forEach(id => {
                    if (!updatedMembers.includes(id)) {
                      updatedMembers.push(id);
                    }
                  });
                  
                  // Update the active list
                  const updatedList = {
                    ...activeList,
                    members: updatedMembers
                  };
                  
                  // Update active list state
                  setActiveList(updatedList);
                  
                  // Mark as having unsaved changes
                  setHasUnsavedChanges(true);
                  
                  // Update the saved lists
                  const updatedLists = savedLists.map(list => 
                    list.id === activeList.id ? updatedList : list
                  );
                  setSavedLists(updatedLists);
                  
                  // Display success message
                  toast({
                    title: "Partners added",
                    description: `${partnersToAdd.length} partners have been added to "${activeList.name}"`,
                  });
                  
                  // Close the modal
                  setShowAddPartnersModal(false);
                }
              }}
              disabled={partnersToAdd.length === 0}
            >
              Add to List
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
                        <Button 
                          className="bg-[#5567E5] hover:bg-[#4555CB] text-white"
                          onClick={() => {
                            setPartnersToAdd([]);
                            setShowAddPartnersModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                          </svg>
                          Add partners to Custom List
                        </Button>
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
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-1.5 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isNewList ? 'Define your filter criteria' : 'About this Saved Filter'}
          </h3>
          <div className="mt-1 text-sm text-blue-700">
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