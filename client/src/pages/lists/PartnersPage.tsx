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
function calculatePartnerStats(partners) {
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
function TemplateBadges({ industry, type }) {
  // Mock template badges based on industry and type
  const getBadges = (industry, type) => {
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
// Define props type for the PartnersTable
interface PartnersTableProps {
  filterText: string;
  selectedStatus: string;
  selectedIndustry: string;
  selectedType: string;
  setFilterText?: (text: string) => void;
  setSelectedStatus?: (status: string) => void;
  setSelectedIndustry?: (industry: string) => void;
  setSelectedType?: (type: string) => void;
}

function PartnersTable({ 
  filterText, 
  selectedStatus, 
  selectedIndustry, 
  selectedType, 
  setFilterText,
  setSelectedStatus,
  setSelectedIndustry,
  setSelectedType
}: PartnersTableProps) {
  // Component state for table
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
  // This function applies all current filters to the partner list
  const applyFilters = (partners) => {
    return partners.filter(partner => {
      const matchesText = !filterText || 
        partner.name.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.industry.toLowerCase().includes(filterText.toLowerCase()) ||
        partner.type.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesStatus = !selectedStatus || partner.status === selectedStatus;
      const matchesIndustry = !selectedIndustry || partner.industry === selectedIndustry;
      const matchesType = !selectedType || partner.type === selectedType;
      
      return matchesText && matchesStatus && matchesIndustry && matchesType;
    });
  };
  
  // First filter by list membership, then apply filters
  const displayedPartners = (() => {
    // Otherwise, first restrict to list members if a list is active
    let filteredPartners = mockPartners;
    
    if (activeList) {
      filteredPartners = mockPartners.filter(partner => 
        activeList.members?.includes(partner.id) || false
      );
    }
    
    // Then apply all other filters
    return applyFilters(filteredPartners);
  })();
  
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
      setFilterText?.(originalListFilters.searchText || '');
      setSelectedStatus?.(originalListFilters.status || '');
      setSelectedIndustry?.(originalListFilters.industry || '');
      setSelectedType?.(originalListFilters.type || '');
      setHasUnsavedChanges(false);
    }
  };
  
  // State for list creation from selection
  const [selectionListName, setSelectionListName] = useState('');
  const [selectionListDescription, setSelectionListDescription] = useState('');
  const [selectionListType, setSelectionListType] = useState<'filter' | 'selection'>('filter');
  
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
    } else {
      setSelectedPartners([...selectedPartners, id]);
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
  
  // Get total pages for pagination
  const totalPages = Math.ceil(displayedPartners.length / itemsPerPage);
  
  // Get current page of partners
  const currentPartners = displayedPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="space-y-4">
      {/* Filter and Quick Switcher action bar */}
      <div className="bg-white shadow-sm rounded-md p-3">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-3 border-b border-gray-200">
          {/* Left side - Lists dropdown and partner search */}
          <div className="flex-1 min-w-0 relative flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium mb-1">Lists</div>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-left pr-8 font-normal"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <span className="truncate">
                    {activeList ? activeList.name : "All Partners"}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </Button>
                
                {/* Lists dropdown */}
                {showListsDropdown && (
                  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                    {/* All Partners option */}
                    <div 
                      role="button"
                      aria-selected={activeList === null}
                      tabIndex={0}
                      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList === null ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                      onClick={() => {
                        setActiveList(null);
                        setShowListsDropdown(false);
                        // Clear all filters when switching to all partners
                        if (setFilterText) setFilterText('');
                        if (setSelectedStatus) setSelectedStatus('');
                        if (setSelectedIndustry) setSelectedIndustry('');
                        if (setSelectedType) setSelectedType('');
                        
                        // Clear active view
                        setActiveView(null);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>All Partners</span>
                        <Badge variant="outline" className="ml-2 text-xs py-0">
                          {mockPartners.length}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Custom lists */}
                    {savedLists.map(list => (
                      <div
                        key={list.id}
                        role="button"
                        aria-selected={activeList?.id === list.id}
                        tabIndex={0}
                        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                        onClick={() => {
                          // Set active list with this list
                          setActiveList(list);
                          // Store original filters
                          setOriginalListFilters(list.filters);
                          // Set current filters to list filters
                          if (setFilterText) setFilterText(list.filters.searchText || '');
                          if (setSelectedStatus) setSelectedStatus(list.filters.status || '');
                          if (setSelectedIndustry) setSelectedIndustry(list.filters.industry || '');
                          if (setSelectedType) setSelectedType(list.filters.type || '');
                          // Close dropdown
                          setShowListsDropdown(false);
                          // Clear active view as we're now using a list
                          setActiveView(null);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{list.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs py-0">
                            {list.members?.length || 0}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Create new list button */}
                    <div className="px-2 py-1">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => {
                          setShowListsDropdown(false);
                          setShowCreateListModal(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        <span>Create new list</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Search field */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search partners..."
                className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={filterText}
                onChange={(e) => {
                  if (setFilterText) setFilterText(e.target.value);
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            
            {/* Views dropdown */}
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium mb-1">Views</div>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-left pr-8 font-normal"
                  onClick={() => {
                    const dropdown = document.getElementById("views-dropdown");
                    if (dropdown) {
                      dropdown.classList.toggle("hidden");
                    }
                  }}
                >
                  <span className="truncate">
                    {activeView ? activeView.name : "No View"}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </Button>
                
                {/* Views dropdown would be here - simplified */}
              </div>
            </div>
          </div>
          
          {/* Right side action buttons */}
          <div className="flex items-center gap-2">
            
            {activeList && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex items-center"
                  onClick={() => setShowShareListModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share List
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex items-center"
                  onClick={() => {
                    // This would open an "Add to Campaign" workflow in a real implementation
                    alert('This would open the Add to Campaign dialog in the real application');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22 11 13 2 9 22 2z" />
                  </svg>
                  Add to Campaign
                </Button>
                
                {/* Return to all partners button removed */}
              </>
            )}
          </div>
        </div>
        
        {/* Filter options */}
        <div className="pt-3 flex flex-wrap gap-2">
          {/* Status filter */}
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              if (setSelectedStatus) setSelectedStatus(value);
            }}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Industry filter */}
          <Select
            value={selectedIndustry}
            onValueChange={(value) => {
              if (setSelectedIndustry) setSelectedIndustry(value);
            }}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Industries</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Banking">Banking</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Type filter */}
          <Select
            value={selectedType}
            onValueChange={(value) => {
              if (setSelectedType) setSelectedType(value);
            }}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Broker">Broker</SelectItem>
              <SelectItem value="Agency">Agency</SelectItem>
              <SelectItem value="Provider">Provider</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Filter action buttons */}
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {/* Save View button */}
            {(activeView || hasUnsavedChanges || (!activeView && (selectedStatus || selectedIndustry || selectedType || filterText))) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-[#5567E5] text-white hover:bg-[#4151c4] border-[#5567E5]"
                onClick={() => setShowSaveViewModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save as view
              </Button>
            )}
            
            {/* Reset Filters button */}
            {(selectedStatus || selectedIndustry || selectedType || filterText) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => {
                  // Reset all filters
                  if (setFilterText) setFilterText('');
                  if (setSelectedStatus) setSelectedStatus('');
                  if (setSelectedIndustry) setSelectedIndustry('');
                  if (setSelectedType) setSelectedType('');
                  // Clear active view
                  setActiveView(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M3 3h18v18H3z" />
                  <path d="M21 3 3 21" />
                </svg>
                Clear
              </Button>
            )}
            
            {/* Use actions */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={openCreateFromSelection}
              disabled={selectedPartners.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              New from selection
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setShowAddToListModal(true)}
              disabled={selectedPartners.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add to List
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => {
                // This would trigger an export of the current selection in a real implementation
                alert('This would export the selected partners in the real application');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Partners</p>
              <h3 className="text-2xl font-bold">{stats.totalPartners}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Partners</p>
              <h3 className="text-2xl font-bold">{stats.activePartners}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-4-4h-3"></path>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Opportunities</p>
              <h3 className="text-2xl font-bold">{stats.totalOpportunities}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic List List Creation Guidance - removed */}
      
      {/* Create List from Selection Modal */}
      <Dialog open={showCreateFromSelectionModal} onOpenChange={setShowCreateFromSelectionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create List from Selection</DialogTitle>
            <DialogDescription>
              Create a new list containing {selectedPartners.length} selected partners.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-name" className="text-right">
                Name
              </Label>
              <Input
                id="list-name"
                placeholder="My Partner List"
                className="col-span-3"
                value={selectionListName}
                onChange={(e) => setSelectionListName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="list-description"
                placeholder="Describe the purpose of this list"
                className="col-span-3"
                value={selectionListDescription}
                onChange={(e) => setSelectionListDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFromSelectionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectionListName.trim() === '') {
                  toast({
                    title: "Missing Name",
                    description: "Please provide a name for your list.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Create a new list with the selected partners
                const newList = {
                  id: `new-list-${Date.now()}`,
                  name: selectionListName,
                  description: selectionListDescription,
                  type: 'selection' as const,
                  filters: {}, // No filters for static lists
                  members: [...selectedPartners], // Copy selected partners
                  isShared: false,
                  createdBy: "Current User",
                  createdAt: new Date()
                };
                
                setSavedLists([...savedLists, newList]);
                setActiveList(newList);
                setOriginalListFilters({});
                
                // Clear selection
                setSelectedPartners([]);
                
                // Close modal
                setShowCreateFromSelectionModal(false);
                
                // Show success toast
                toast({
                  title: "List Created",
                  description: `'${selectionListName}' has been created with ${selectedPartners.length} partners.`
                });
              }}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save View Dialog */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a view for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-name" className="text-right">
                Name
              </Label>
              <Input
                id="view-name"
                placeholder="My View"
                className="col-span-3"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="view-description"
                placeholder="Describe the purpose of this view"
                className="col-span-3"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
              />
            </div>
            
            {/* Filter summary */}
            <div className="col-span-4 bg-[#EBEEFB] border border-[#D4D9F3] rounded-md p-3 mt-2">
              <h4 className="text-sm font-medium mb-2 text-indigo-900">Filters saved in this view</h4>
              <div className="space-y-1 text-sm">
                {filterText && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-indigo-600">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span>Search: <span className="font-medium">{filterText}</span></span>
                  </div>
                )}
                {selectedStatus && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Status: <span className="font-medium capitalize">{selectedStatus}</span></span>
                  </div>
                )}
                {selectedIndustry && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Industry: <span className="font-medium">{selectedIndustry}</span></span>
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-indigo-600">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Type: <span className="font-medium">{selectedType}</span></span>
                  </div>
                )}
                {!filterText && !selectedStatus && !selectedIndustry && !selectedType && (
                  <span className="text-gray-500 italic">No filters selected</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveViewModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newViewName.trim() === '') {
                  toast({
                    title: "Missing Name",
                    description: "Please provide a name for your view.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Check if we're updating an existing view
                if (activeView) {
                  // Update existing view
                  const updatedViews = views.map(view => {
                    if (view.id === activeView.id) {
                      return {
                        ...view,
                        name: newViewName,
                        description: newViewDescription,
                        filters: {
                          searchText: filterText || undefined,
                          status: selectedStatus || undefined,
                          industry: selectedIndustry || undefined,
                          type: selectedType || undefined
                        }
                      };
                    }
                    return view;
                  });
                  
                  setViews(updatedViews);
                  
                  // Update active view
                  setActiveView({
                    ...activeView,
                    name: newViewName,
                    description: newViewDescription,
                    filters: {
                      searchText: filterText || undefined,
                      status: selectedStatus || undefined,
                      industry: selectedIndustry || undefined,
                      type: selectedType || undefined
                    }
                  });
                  
                  toast({
                    title: "View Updated",
                    description: `'${newViewName}' has been updated with your current filters.`
                  });
                } else {
                  // Create new view
                  const newView = {
                    id: `view-${Date.now()}`,
                    name: newViewName,
                    description: newViewDescription,
                    filters: {
                      searchText: filterText || undefined,
                      status: selectedStatus || undefined,
                      industry: selectedIndustry || undefined,
                      type: selectedType || undefined
                    },
                    isShared: false,
                    createdBy: "Current User",
                    createdAt: new Date()
                  };
                  
                  setViews([...views, newView]);
                  setActiveView(newView);
                  
                  toast({
                    title: "View Created",
                    description: `'${newViewName}' has been saved for future use.`
                  });
                }
                
                // Reset form and close modal
                setShowSaveViewModal(false);
              }}
            >
              {activeView ? "Update View" : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* General Create List Modal */}
      <Dialog open={showCreateListModal} onOpenChange={setShowCreateListModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your partners.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-name" className="text-right">
                Name
              </Label>
              <Input
                id="list-name"
                placeholder="My Partner List"
                className="col-span-3"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="list-description"
                placeholder="Describe the purpose of this list"
                className="col-span-3"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateListModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newListName.trim() === '') {
                  toast({
                    title: "Missing Name",
                    description: "Please provide a name for your list.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Create a new empty list
                const newList = {
                  id: `new-list-${Date.now()}`,
                  name: newListName,
                  description: newListDescription,
                  type: 'selection' as const,
                  filters: {}, // No filters for static lists
                  members: [], // Start with empty members
                  isShared: false,
                  createdBy: "Current User",
                  createdAt: new Date()
                };
                
                setSavedLists([...savedLists, newList]);
                setActiveList(newList);
                setOriginalListFilters({});
                
                // Reset form and close modal
                setNewListName('');
                setNewListDescription('');
                setShowCreateListModal(false);
                
                toast({
                  title: "List Created",
                  description: `'${newListName}' has been created. You can now add partners to this list.`
                });
              }}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to List Modal */}
      <Dialog open={showAddToListModal} onOpenChange={setShowAddToListModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
            <DialogDescription>
              Add {selectedPartners.length} selected partners to an existing list or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-select" className="text-right">
                List
              </Label>
              <Select
                value={listToAddTo}
                onValueChange={(value) => setListToAddTo(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New List</SelectItem>
                  {savedLists.map(list => (
                    <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {listToAddTo === 'new' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-list-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="new-list-name"
                    placeholder="My Partner List"
                    className="col-span-3"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-list-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="new-list-description"
                    placeholder="Describe the purpose of this list"
                    className="col-span-3"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToListModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (listToAddTo === 'new') {
                  if (newListName.trim() === '') {
                    toast({
                      title: "Missing Name",
                      description: "Please provide a name for your list.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // Create a new list with the selected partners
                  const newList = {
                    id: `new-list-${Date.now()}`,
                    name: newListName,
                    description: newListDescription,
                    type: 'selection' as const,
                    filters: {}, // No filters for static lists
                    members: [...selectedPartners], // Copy selected partners
                    isShared: false,
                    createdBy: "Current User",
                    createdAt: new Date()
                  };
                  
                  setSavedLists([...savedLists, newList]);
                  
                  toast({
                    title: "List Created",
                    description: `'${newListName}' has been created with ${selectedPartners.length} partners.`
                  });
                } else {
                  // Add to existing list
                  const existingList = savedLists.find(list => list.id === listToAddTo);
                  
                  if (existingList) {
                    // First, filter out any partners that are already in the list to avoid duplicates
                    const newPartners = selectedPartners.filter(id => !existingList.members?.includes(id));
                    
                    // Update the list
                    const updatedList = {
                      ...existingList,
                      members: [...(existingList.members || []), ...newPartners]
                    };
                    
                    // Update savedLists with the modified list
                    const updatedLists = savedLists.map(list => 
                      list.id === listToAddTo ? updatedList : list
                    );
                    
                    setSavedLists(updatedLists);
                    
                    // Update active list if it's the one being modified
                    if (activeList && activeList.id === listToAddTo) {
                      setActiveList(updatedList);
                    }
                    
                    toast({
                      title: "Partners Added",
                      description: `${newPartners.length} partners added to '${existingList.name}'.${newPartners.length < selectedPartners.length ? ' Some partners were already in the list.' : ''}`
                    });
                  }
                }
                
                // Clear selection
                setSelectedPartners([]);
                
                // Reset form and close modal
                setListToAddTo('new');
                setNewListName('');
                setNewListDescription('');
                setShowAddToListModal(false);
              }}
            >
              {listToAddTo === 'new' ? "Create & Add" : "Add to List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share List Dialog */}
      <Dialog open={showShareListModal} onOpenChange={setShowShareListModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share List: {activeList?.name}</DialogTitle>
            <DialogDescription>
              Share this list with others in your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Share link</Label>
              <div className="flex">
                <Input 
                  className="rounded-r-none"
                  value={`https://qollabi.com/share/list/${activeList?.id}`}
                  readOnly
                />
                <Button 
                  className="rounded-l-none" 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://qollabi.com/share/list/${activeList?.id}`);
                    toast({
                      title: "Link Copied",
                      description: "Share link has been copied to your clipboard"
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Share with colleagues</Label>
              <Input 
                placeholder="Enter email addresses separated by commas..."
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="readonly" />
              <Label htmlFor="readonly">Read-only access</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
              // In a real implementation, this would save the sharing settings
              if (activeList) {
                // Update list sharing status
                const updatedLists = savedLists.map(list => {
                  if (list.id === activeList.id) {
                    return {
                      ...list,
                      isShared: true,
                      sharedWith: [...(list.sharedWith || []), 'new-user@example.com'] // This would be the actual entered emails
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
      
      {/* Edit Mode Indicator */}
      {isEditingList && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg mb-4 p-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <div>
              <h3 className="text-base font-medium text-indigo-900">Editing "{activeList?.name}" List</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Use the checkboxes to select or deselect partners. All selected partners will be included in this list when you save.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
                className={`hover:bg-gray-50 group ${
                  // When in edit mode, highlight based on editedListMembers
                  // Otherwise use normal selectedPartners
                  isEditingList
                    ? (editedListMembers?.includes(partner.id) ? 'bg-blue-50' : '')
                    : (selectedPartners.includes(partner.id) ? 'bg-blue-50' : '')
                }`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={
                      isEditingList 
                        ? editedListMembers?.includes(partner.id) 
                        : selectedPartners.includes(partner.id)
                    }
                    onChange={() => {
                      if (isEditingList) {
                        // In edit mode, modify editedListMembers
                        if (editedListMembers?.includes(partner.id)) {
                          setEditedListMembers(editedListMembers.filter(id => id !== partner.id));
                        } else {
                          setEditedListMembers([...(editedListMembers || []), partner.id]);
                        }
                      } else {
                        // Regular selection mode
                        toggleSelectPartner(partner.id);
                      }
                    }}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
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
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                  No partners match your search criteria. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Save button when in edit mode */}
      {isEditingList && (
        <div className="flex justify-end mt-4">
          <Button 
            size="sm" 
            className="md:flex items-center bg-[#5567E5] hover:bg-[#4151c4] text-white"
            onClick={() => {
              // Update the active list with edited members
              if (activeList) {
                const updatedList = {
                  ...activeList,
                  members: editedListMembers
                };
                
                // Update the list in savedLists
                const updatedLists = savedLists.map(list => 
                  list.id === activeList.id ? updatedList : list
                );
                
                setSavedLists(updatedLists);
                setActiveList(updatedList);
                
                // Exit edit mode
                setIsEditingList(false);
                
                // Show success toast
                toast({
                  title: "List Saved",
                  description: `${activeList.name} has been updated with ${editedListMembers?.length || 0} partners.`
                });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

export function DynamicListGuidance({ isNewList }: { isNewList: boolean }) {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-indigo-800">
            {isNewList ? "Create a new partner list" : "Edit this partner list"}
          </h3>
          <div className="mt-2 text-sm text-indigo-700">
            <p>
              {isNewList
                ? "Use this form to create a new list of partners. You can add partners to your list later."
                : "You're editing this list. Use the checkboxes to add or remove partners, then save your changes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const { environment } = useEnvironment();
  // Define filter state at the top-level component
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // List editing state
  const [isEditingList, setIsEditingList] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  return (
    <div className="max-w-full py-6 pl-8">
      <div className="flex justify-between items-center mb-2 px-4">
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
      
      {/* Edit Mode Indicator */}
      {isEditingList && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg mb-4 p-4 mx-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <div>
              <h3 className="text-base font-medium text-indigo-900">Editing List</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Use the checkboxes to select or deselect partners. All selected partners will be included in this list when you save.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <PartnersTable 
        filterText={filterText}
        selectedStatus={selectedStatus}
        selectedIndustry={selectedIndustry}
        selectedType={selectedType}
        setFilterText={setFilterText}
        setSelectedStatus={setSelectedStatus}
        setSelectedIndustry={setSelectedIndustry}
        setSelectedType={setSelectedType}
      />
    </div>
  );
}