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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
  
  // Function to determine if current filters differ from active view
  const haveViewFiltersChanged = () => {
    if (!activeView) return false;
    
    const currentFilters = {
      searchText: filterText || '',
      status: selectedStatus || '',
      industry: selectedIndustry || '',
      type: selectedType || ''
    };
    
    return currentFilters.searchText !== (activeView.filters.searchText || '') ||
           currentFilters.status !== (activeView.filters.status || '') ||
           currentFilters.industry !== (activeView.filters.industry || '') ||
           currentFilters.type !== (activeView.filters.type || '');
  };
  
  // Use this effect to check for unsaved changes when filters change
  useEffect(() => {
    if (activeView) {
      setHasUnsavedChanges(haveViewFiltersChanged());
    }
  }, [filterText, selectedStatus, selectedIndustry, selectedType, activeView]);
  
  // Function to clear the active view and reset filters
  const clearActiveView = () => {
    setActiveView(null);
    setFilterText('');
    setSelectedStatus('');
    setSelectedIndustry('');
    setSelectedType('');
    setHasUnsavedChanges(false);
  };
  
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    // "All Partners" is not in the list as it's the default state when no list is selected
    {
      id: 'all-partners',
      name: 'All Partners',
      description: 'Complete list of all partners',
      type: 'filter',
      filters: {},
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true
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
  
  // Start with no active list since "All Partners" is the default state, not a separate list
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
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

  // Function to create a list from selected partners
  const createListFromSelection = () => {
    if (selectionListName.trim() === '') {
      toast({
        title: "Missing name",
        description: "Please provide a name for your list.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPartners.length === 0) {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner to create a list.",
        variant: "destructive"
      });
      return;
    }
    
    const newList: SavedList = {
      id: Date.now().toString(), // Simple ID generation
      name: selectionListName,
      description: selectionListDescription || undefined,
      type: 'selection', // Always create a static list from selection
      filters: {}, // No filters for static lists initially
      members: [...selectedPartners], // Copy the selected partners
      isShared: false,
      createdBy: 'Current User',
      createdAt: new Date()
    };
    
    setSavedLists([...savedLists, newList]);
    setActiveList(newList);
    setOriginalListFilters({});
    setShowCreateFromSelectionModal(false);
    
    toast({
      title: "List created",
      description: `Your list "${newList.name}" has been created successfully.`
    });
    
    // Clear selections after creating the list
    setSelectedPartners([]);
  };
  
  // Function to save the current list with updated filters
  const saveListChanges = () => {
    if (!activeList) return;
    
    const updatedList: SavedList = {
      ...activeList,
      filters: {
        searchText: filterText || undefined,
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
        type: selectedType || undefined,
        size: activeList.filters.size // Preserve size filter
      }
    };
    
    // Update the list in the saved lists array
    const updatedLists = savedLists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    
    setSavedLists(updatedLists);
    setActiveList(updatedList);
    setOriginalListFilters(updatedList.filters);
    setHasUnsavedChanges(false);
    
    toast({
      title: "List updated",
      description: `Your list "${updatedList.name}" has been updated successfully.`
    });
  };
  
  // Function to add selected partners to the current list
  const addPartnersToList = () => {
    if (!activeList || activeList.type !== 'selection' || partnersToAdd.length === 0) return;
    
    // Combine existing members with new partners, removing duplicates
    const existingMembers = activeList.members || [];
    const uniqueNewPartners = partnersToAdd.filter(id => !existingMembers.includes(id));
    const allMembers = [...existingMembers, ...uniqueNewPartners];
    
    // Update the list with new members
    const updatedList: SavedList = {
      ...activeList,
      members: allMembers
    };
    
    // Update the list in the saved lists array
    const updatedLists = savedLists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    
    setSavedLists(updatedLists);
    setActiveList(updatedList);
    setPartnersToAdd([]);
    setShowAddPartnersModal(false);
    
    toast({
      title: "Partners added",
      description: `${uniqueNewPartners.length} new partners have been added to "${updatedList.name}".`
    });
  };
  
  // Function to save the current view
  const saveView = () => {
    if (newViewName.trim() === '') {
      toast({
        title: "Missing name",
        description: "Please provide a name for your view.",
        variant: "destructive"
      });
      return;
    }
    
    if (activeView) {
      // Update existing view
      const updatedView = {
        ...activeView,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          industry: selectedIndustry || undefined,
          type: selectedType || undefined,
        }
      };
      
      // Update the view in the views array
      const updatedViews = views.map(view => 
        view.id === updatedView.id ? updatedView : view
      );
      
      setViews(updatedViews);
      setActiveView(updatedView);
      setHasUnsavedChanges(false);
      
      toast({
        title: "View updated",
        description: `Your view "${updatedView.name}" has been updated successfully.`
      });
    } else {
      // Create new view
      const newView = {
        id: Date.now().toString(), // Simple ID generation
        name: newViewName,
        description: newViewDescription || undefined,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          industry: selectedIndustry || undefined,
          type: selectedType || undefined,
        },
        isShared: false,
        createdBy: 'Current User',
        createdAt: new Date()
      };
      
      setViews([...views, newView]);
      setActiveView(newView);
      setHasUnsavedChanges(false);
      
      toast({
        title: "View created",
        description: `Your view "${newView.name}" has been created successfully.`
      });
    }
    
    setShowSaveViewModal(false);
    setNewViewName('');
    setNewViewDescription('');
  };
  
  // Function to apply a view
  const applyView = (view: typeof views[0]) => {
    if (hasUnsavedChanges) {
      // Ask for confirmation before switching views with unsaved changes
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch views?')) {
        return;
      }
    }
    
    // Apply the view's filters
    setFilterText(view.filters.searchText || '');
    setSelectedStatus(view.filters.status || '');
    setSelectedIndustry(view.filters.industry || '');
    setSelectedType(view.filters.type || '');
    
    // Set the active view
    setActiveView(view);
    setHasUnsavedChanges(false);
  };
  
  // Component for view selection
  const ViewsDropdown = () => {
    return (
      <div className="relative">
        <button
          onClick={() => setShowListsDropdown(!showListsDropdown)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
        >
          <span className="text-indigo-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M7 7h10v10H7z" />
            </svg>
          </span>
          <span>Views</span>
          <span className="text-indigo-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        
        {showListsDropdown && (
          <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white z-10 border border-gray-200">
            <div className="py-1">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => {
                    applyView(view);
                    setShowListsDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    activeView?.id === view.id ? 'bg-indigo-50 text-indigo-700 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-700">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-4 h-4"
                      >
                        <path d="M3 3h18v18H3z" />
                      </svg>
                    </span>
                    {view.name}
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowSaveViewModal(true);
                    setShowListsDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create new view
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Function to open the save view modal
  const openSaveViewModal = () => {
    if (activeView) {
      setNewViewName(activeView.name);
      setNewViewDescription(activeView.description || '');
    } else {
      setNewViewName('');
      setNewViewDescription('');
    }
    
    setShowSaveViewModal(true);
  };
  
  // Component for the active view summary
  const ActiveViewSummary = () => {
    if (!activeView) return null;
    
    return (
      <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-md p-4 mb-4">
        <h3 className="text-indigo-800 font-medium mb-2">Filters saved in this view</h3>
        <div className="space-y-2">
          {activeView.filters.searchText && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Search:</span>
              <span>{activeView.filters.searchText}</span>
            </div>
          )}
          {activeView.filters.status && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{activeView.filters.status}</span>
            </div>
          )}
          {activeView.filters.industry && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Industry:</span>
              <span>{activeView.filters.industry}</span>
            </div>
          )}
          {activeView.filters.type && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Type:</span>
              <span>{activeView.filters.type}</span>
            </div>
          )}
          {!activeView.filters.searchText && !activeView.filters.status && 
           !activeView.filters.industry && !activeView.filters.type && (
            <div className="text-sm italic text-gray-500">No filters applied</div>
          )}
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearActiveView}
            className="text-xs"
          >
            Clear view
          </Button>
        </div>
      </div>
    );
  };
  
  // Pagination logic
  const totalPages = Math.ceil(displayedPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, displayedPartners.length);
  const currentPartners = displayedPartners.slice(startIndex, endIndex);
  
  // Partner selection logic
  const handleSelectPartner = (id: number) => {
    setSelectedPartners(prev => {
      if (prev.includes(id)) {
        return prev.filter(partnerId => partnerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Check if all displayed partners are selected
  const allSelected = currentPartners.length > 0 && 
    currentPartners.every(partner => selectedPartners.includes(partner.id));
  
  // Handle select all function
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all current partners
      setSelectedPartners(prev => prev.filter(id => 
        !currentPartners.some(partner => partner.id === id)));
    } else {
      // Select all current partners
      const newSelectedIds = currentPartners.map(partner => partner.id);
      setSelectedPartners(prev => {
        const existingIds = new Set(prev);
        const uniqueNewIds = newSelectedIds.filter(id => !existingIds.has(id));
        return [...prev, ...uniqueNewIds];
      });
    }
  };
  
  // Compute partner statistics
  const stats = calculatePartnerStats(displayedPartners);
  
  // Handle toggling filter menu
  const toggleFilterMenu = () => {
    setFilterMenuOpen(!filterMenuOpen);
  };
  
  // Handle switching to a different list
  const switchToList = (list: SavedList) => {
    if (hasUnsavedChanges) {
      // Ask for confirmation before switching lists with unsaved changes
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch lists?')) {
        return;
      }
    }
    
    // Clear any active view when switching lists
    setActiveView(null);
    
    // Apply the list's filters
    setFilterText(list.filters.searchText || '');
    setSelectedStatus(list.filters.status || '');
    setSelectedIndustry(list.filters.industry || '');
    setSelectedType(list.filters.type || '');
    
    // Set the active list and store original filters for change detection
    setActiveList(list);
    setOriginalListFilters({...list.filters});
    setHasUnsavedChanges(false);
    
    // Close the dropdown
    setShowListsDropdown(false);
  };
  
  // Function to switch back to "All Partners" (default state)
  const switchToAllPartners = () => {
    if (hasUnsavedChanges) {
      // Ask for confirmation before switching with unsaved changes
      if (!window.confirm('You have unsaved changes. Are you sure you want to return to all partners?')) {
        return;
      }
    }
    
    // Clear any active view
    setActiveView(null);
    
    // Reset filters
    setFilterText('');
    setSelectedStatus('');
    setSelectedIndustry('');
    setSelectedType('');
    
    // Clear active list
    setActiveList(null);
    setOriginalListFilters(null);
    setHasUnsavedChanges(false);
  };
  
  // Return to all partners when component mounts
  useEffect(() => {
    switchToAllPartners();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Set up guidance system based on active list type
  useEffect(() => {
    // Only show guidance for Custom Lists (selection type), not for Filtered Lists
    if (activeList && activeList.type === 'selection') {
      setShowDynamicListGuidance(true);
    } else {
      setShowDynamicListGuidance(false);
    }
  }, [activeList]);
  
  return (
    <div className="flex flex-col">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Search input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              className="pl-10 w-[250px]"
              type="search"
              placeholder="Search partners..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          
          {/* Views dropdown */}
          <ViewsDropdown />
          
          {/* Filter trigger */}
          <button
            onClick={toggleFilterMenu}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-input ${
              filterMenuOpen || selectedStatus || selectedIndustry || selectedType
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className={selectedStatus || selectedIndustry || selectedType ? 'text-indigo-700' : ''}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </span>
            <span>Filters</span>
            {(selectedStatus || selectedIndustry || selectedType) && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-700 rounded-full">
                {[selectedStatus, selectedIndustry, selectedType].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Display count of selected partners */}
          {selectedPartners.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedPartners.length} selected
            </span>
          )}
          
          {/* Create list button */}
          {selectedPartners.length > 0 && (
            <Button 
              onClick={openCreateFromSelection}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              Create List
            </Button>
          )}

          {/* Save view button - only show when there are unsaved changes */}
          {hasUnsavedChanges && activeView && (
            <Button 
              onClick={saveView}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              Save
            </Button>
          )}
          
          {/* Save as view button */}
          <Button
            variant="outline"
            className="border-[#5567E5] text-[#5567E5] hover:bg-[#EFF1FF]"
            onClick={openSaveViewModal}
            title="Save your current filter settings as a view that can be applied to any list"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4 mr-2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save as view
          </Button>
        </div>
      </div>
      
      {/* Filter menu */}
      {filterMenuOpen && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={selectedIndustry} 
                onValueChange={setSelectedIndustry}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All industries</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="Broker">Broker</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedStatus('');
                setSelectedIndustry('');
                setSelectedType('');
                setFilterMenuOpen(false);
              }}
            >
              Clear filters
            </Button>
            <Button 
              onClick={() => setFilterMenuOpen(false)}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              Apply filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Show active view summary */}
      {activeView && <ActiveViewSummary />}
      
      {/* Dynamic list guidance */}
      {showDynamicListGuidance && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-md">
          <div className="flex justify-between items-start">
            <div className={`flex ${isGuidanceCollapsed ? 'items-center' : 'items-start'}`}>
              <div className="shrink-0 text-indigo-600 mt-1 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-indigo-800">
                  {isGuidanceCollapsed 
                    ? 'This is a Custom List with specific partners' 
                    : 'You are viewing a Custom List'}
                </h3>
                {!isGuidanceCollapsed && (
                  <p className="text-indigo-600 text-sm mt-1">
                    This list only contains partners that were specifically added to it. 
                    You can add more partners using the "Add partners to this list" button.
                  </p>
                )}
              </div>
            </div>
            <button
              className="text-indigo-600 hover:text-indigo-800"
              onClick={() => setIsGuidanceCollapsed(!isGuidanceCollapsed)}
            >
              {isGuidanceCollapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
          </div>
          
          {!isGuidanceCollapsed && activeList?.type === 'selection' && (
            <div className="mt-3 flex gap-2 justify-end">
              <Button
                onClick={() => setShowAddPartnersModal(true)}
                className="bg-[#5567E5] hover:bg-[#4557D5]"
              >
                Add partners to this list
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Partner stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Total Partners</span>
            <span className="text-2xl font-bold">{stats.totalPartners}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Active Partners</span>
            <span className="text-2xl font-bold">{stats.activePartners}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Total Customers</span>
            <span className="text-2xl font-bold">{stats.totalCustomers}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Opportunities</span>
            <span className="text-2xl font-bold">{stats.totalOpportunities}</span>
          </CardContent>
        </Card>
      </div>
      
      {/* Partners grid */}
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <Checkbox 
              id="select-all"
              checked={allSelected && currentPartners.length > 0}
              onCheckedChange={handleSelectAll}
              className="mr-2"
            />
            <Label htmlFor="select-all" className="text-sm">
              {selectedPartners.length ? `Selected (${selectedPartners.length})` : 'Select all'}
            </Label>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{endIndex} of {displayedPartners.length} partners
          </div>
        </div>
        
        {currentPartners.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-md">
            <div className="text-gray-400 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No partners found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              className="mt-4 bg-[#5567E5] hover:bg-[#4557D5]"
              onClick={() => {
                setFilterText('');
                setSelectedStatus('');
                setSelectedIndustry('');
                setSelectedType('');
                setFilterMenuOpen(false);
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPartners.map((partner) => (
              <Card key={partner.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-start p-4">
                    <Checkbox 
                      checked={selectedPartners.includes(partner.id)}
                      onCheckedChange={() => handleSelectPartner(partner.id)}
                      className="mr-3 mt-1"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 bg-indigo-100 text-indigo-800 mr-3">
                            <AvatarFallback>{partner.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/partners/${partner.id}`}>
                              <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                                {partner.name}
                              </span>
                            </Link>
                            <div className="text-sm text-gray-500">{partner.location}</div>
                          </div>
                        </div>
                        <TemplateBadges industry={partner.industry} type={partner.type} />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="w-24 text-gray-500">Industry:</span>
                            <span>{partner.industry}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-24 text-gray-500">Type:</span>
                            <span>{partner.type}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-24 text-gray-500">Size:</span>
                            <span className="capitalize">{partner.size}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-24 text-gray-500">Contact:</span>
                            <span>{partner.primaryContact}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-3 text-sm">
                        <Badge className={`capitalize ${
                          partner.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        }`}>
                          {partner.status}
                        </Badge>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </span>
                            <span>{partner.customers}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                            </span>
                            <span>{partner.opportunities}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                className={currentPage === page ? "bg-[#5567E5] hover:bg-[#4557D5]" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Modals */}
      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeView ? "Update View" : "Save as View"}</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a view. You can quickly access this view later from any list, and it will apply the filters you saved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="view-name">View name</Label>
              <Input
                id="view-name"
                placeholder="Enter a name for this view"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="view-description">Description (optional)</Label>
              <Textarea
                id="view-description"
                placeholder="Enter a description for this view"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
              />
            </div>
            
            <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-md p-3">
              <h4 className="font-medium text-sm text-indigo-800 mb-2">Filters saved in this view</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Search text:</span> {filterText || '(none)'}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedStatus || '(any)'}
                </div>
                <div>
                  <span className="font-medium">Industry:</span> {selectedIndustry || '(any)'}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedType || '(any)'}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={saveView}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              {activeView ? "Update View" : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create List from Selection Modal */}
      <Dialog open={showCreateFromSelectionModal} onOpenChange={setShowCreateFromSelectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create List from Selection</DialogTitle>
            <DialogDescription>
              Create a new list containing the {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''} you've selected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="list-name">List name</Label>
              <Input
                id="list-name"
                placeholder="Enter a name for this list"
                value={selectionListName}
                onChange={(e) => setSelectionListName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="list-description">Description (optional)</Label>
              <Textarea
                id="list-description"
                placeholder="Enter a description for this list"
                value={selectionListDescription}
                onChange={(e) => setSelectionListDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={createListFromSelection}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Partners Modal */}
      <Dialog open={showAddPartnersModal} onOpenChange={setShowAddPartnersModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Partners to List</DialogTitle>
            <DialogDescription>
              Select partners to add to "{activeList?.name || ''}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox 
                      checked={mockPartners.every(p => partnersToAdd.includes(p.id) || 
                                                (activeList?.members && activeList.members.includes(p.id)))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Add all partners that aren't already in the list
                          const currentMembers = activeList?.members || [];
                          const newPartners = mockPartners
                            .filter(p => !currentMembers.includes(p.id))
                            .map(p => p.id);
                          setPartnersToAdd(newPartners);
                        } else {
                          setPartnersToAdd([]);
                        }
                      }}
                    />
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPartners.map(partner => {
                  const isAlreadyInList = activeList?.members?.includes(partner.id) || false;
                  
                  return (
                    <tr key={partner.id} className={isAlreadyInList ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4">
                        {isAlreadyInList ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Added
                          </span>
                        ) : (
                          <Checkbox 
                            checked={partnersToAdd.includes(partner.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPartnersToAdd(prev => [...prev, partner.id]);
                              } else {
                                setPartnersToAdd(prev => prev.filter(id => id !== partner.id));
                              }
                            }}
                          />
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-800 mr-2">
                            <AvatarFallback>{partner.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{partner.name}</div>
                            <div className="text-xs text-gray-500">{partner.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-500">{partner.industry}</td>
                      <td className="py-2 px-4 text-sm text-gray-500">{partner.type}</td>
                      <td className="py-2 px-4">
                        <Badge className={`capitalize ${
                          partner.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        }`}>
                          {partner.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            {partnersToAdd.length} new partners selected to add
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={addPartnersToList}
              disabled={partnersToAdd.length === 0}
              className="bg-[#5567E5] hover:bg-[#4557D5]"
            >
              Add {partnersToAdd.length} Partners
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Guidance component for new lists
function DynamicListGuidance({ isNewList }: { isNewList: boolean }) {
  return (
    <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
      <div className="flex">
        <div className="mr-3 flex-shrink-0 text-indigo-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-indigo-800">
            {isNewList ? 'Getting started with your new list' : 'About this list'}
          </h3>
          <p className="mt-1 text-sm text-indigo-600">
            {isNewList
              ? 'Your list is empty. Use the "Add partners to this list" button to add partners. You can filter this list further using the filter options above.'
              : 'This is a selection-based list containing specific partners you\'ve added. You can continue to add more partners or filter the existing ones.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Main partner list page component
export default function PartnersPage() {
  const { environment } = useEnvironment();
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-2">Partners</h1>
      <p className="text-gray-500 mb-6">
        Manage your broker and agency partnerships across {environment.name}.
      </p>
      
      <PartnersTable />
    </div>
  );
}