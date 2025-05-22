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
    name: "XYZ Insurance Group",
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
    name: "ABC Insurance Brokers",
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
    name: "Global Insurance Partners",
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

// Guide component for dynamic lists
function DynamicListGuidance({ isNewList }: { isNewList: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-800">Working with Views and Lists</h3>
              {!isCollapsed && (
                <>
                  <p className="mt-1 text-sm text-blue-700">
                    {isNewList 
                      ? "Lists and views help you organize your partners for efficient management."
                      : "This is your current list view. You can modify the filters and save changes."}
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-blue-700"><strong>Views</strong>: Save your filter settings to quickly find partners matching specific criteria later.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-blue-700"><strong>Lists</strong>: Select specific partners to create curated groups for campaigns or reports.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-blue-700">To create a list, select partners using the checkboxes and click "Create List" button.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-700 hover:bg-blue-100 ml-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main partner list component
function PartnersTable() {
  // Filter state
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // UI state
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showAddPartnersModal, setShowAddPartnersModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showDynamicListGuidance, setShowDynamicListGuidance] = useState(false);
  const [isGuidanceCollapsed, setIsGuidanceCollapsed] = useState(false);
  const [showCreateFromSelectionModal, setShowCreateFromSelectionModal] = useState(false);
  
  // Form state
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectionListName, setSelectionListName] = useState('');
  const [selectionListDescription, setSelectionListDescription] = useState('');
  const [selectionListType, setSelectionListType] = useState<'filter' | 'selection'>('filter');
  const [partnersToAdd, setPartnersToAdd] = useState<number[]>([]);
  
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
  
  // State for lists
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    // "All Partners" is not in the list as it's the default state when no list is selected
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
  
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
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
  
  // Use effect to track filter changes
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
      // If we're not dealing with list filters, check for view filter changes
      if (!activeView) {
        setHasUnsavedChanges(false);
      }
    }
  }, [filterText, selectedStatus, selectedIndustry, selectedType, activeList, originalListFilters, activeView]);
  
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
  
  // Function to save the current view - handles both updating existing views and creating new ones
  const saveView = () => {
    if (!activeView) {
      // Creating a new view
      if (!newViewName.trim()) {
        toast({
          title: "View name required",
          description: "Please enter a name for your view.",
          variant: "destructive"
        });
        return;
      }
      
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
        createdBy: 'Current User',
        createdAt: new Date()
      };
      
      setViews([...views, newView]);
      setActiveView(newView);
      setNewViewName('');
      setNewViewDescription('');
      setShowSaveViewModal(false);
      setHasUnsavedChanges(false);
      
      toast({
        title: "View saved",
        description: `The view "${newView.name}" has been created.`
      });
      
    } else {
      // Updating an existing view
      const updatedViews = views.map(view => 
        view.id === activeView.id 
          ? { 
              ...view, 
              filters: {
                searchText: filterText || undefined,
                status: selectedStatus || undefined,
                industry: selectedIndustry || undefined,
                type: selectedType || undefined
              }
            } 
          : view
      );
      
      setViews(updatedViews);
      // Update the active view reference
      const updatedActiveView = updatedViews.find(v => v.id === activeView.id) || null;
      setActiveView(updatedActiveView);
      setHasUnsavedChanges(false);
      
      toast({
        title: "View updated",
        description: `The view "${activeView.name}" has been updated with your current filters.`
      });
    }
  };
  
  // Function to apply a view
  const applyView = (view: typeof views[0]) => {
    // If there are unsaved changes in the current view, show a confirmation dialog
    if (hasUnsavedChanges) {
      // This would typically be a confirmation dialog
      if (!window.confirm("You have unsaved changes. Are you sure you want to switch views without saving?")) {
        return;
      }
    }
    
    setActiveView(view);
    // Apply the view's filters
    setFilterText(view.filters.searchText || '');
    setSelectedStatus(view.filters.status || '');
    setSelectedIndustry(view.filters.industry || '');
    setSelectedType(view.filters.type || '');
    setHasUnsavedChanges(false);
  };
  
  // Function to create a new list from selection
  const createListFromSelection = () => {
    if (!selectionListName.trim()) {
      toast({
        title: "List name required",
        description: "Please enter a name for your list.",
        variant: "destructive"
      });
      return;
    }
    
    const newList: SavedList = {
      id: `list-${Date.now()}`,
      name: selectionListName,
      description: selectionListDescription,
      type: 'selection',
      filters: {},
      members: [...selectedPartners],
      isShared: false,
      createdBy: 'Current User',
      createdAt: new Date()
    };
    
    setSavedLists([...savedLists, newList]);
    setActiveList(newList);
    setOriginalListFilters({});
    
    // Reset selection
    setSelectedPartners([]);
    setSelectionListName('');
    setSelectionListDescription('');
    setShowCreateFromSelectionModal(false);
    
    toast({
      title: "List created",
      description: `The list "${newList.name}" has been created with ${selectedPartners.length} partners.`
    });
  };
  
  // Function to create a new list from filters
  const createListFromFilters = () => {
    if (!newListName.trim()) {
      toast({
        title: "List name required",
        description: "Please enter a name for your list.",
        variant: "destructive"
      });
      return;
    }
    
    const newList: SavedList = {
      id: `list-${Date.now()}`,
      name: newListName,
      description: newListDescription,
      type: 'filter',
      filters: {
        searchText: filterText || undefined,
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
        type: selectedType || undefined
      },
      isShared: false,
      createdBy: 'Current User',
      createdAt: new Date()
    };
    
    setSavedLists([...savedLists, newList]);
    setActiveList(newList);
    setOriginalListFilters(newList.filters);
    
    // Reset form
    setNewListName('');
    setNewListDescription('');
    setShowCreateListModal(false);
    setHasUnsavedChanges(false);
    
    toast({
      title: "List created",
      description: `The list "${newList.name}" has been created.`
    });
  };
  
  // Function to save changes to an existing list
  const saveListChanges = () => {
    if (activeList) {
      const updatedList: SavedList = {
        ...activeList,
        filters: {
          searchText: filterText || undefined,
          status: selectedStatus || undefined,
          industry: selectedIndustry || undefined,
          type: selectedType || undefined,
          size: activeList.filters.size // Preserve size filter if it exists
        }
      };
      
      setSavedLists(savedLists.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
      
      setOriginalListFilters(updatedList.filters);
      setHasUnsavedChanges(false);
      
      toast({
        title: "List updated",
        description: `The list "${activeList.name}" has been updated with your current filters.`
      });
    }
  };
  
  // Function to add partners to an existing static list
  const addPartnersToList = () => {
    if (activeList && activeList.type === 'selection' && partnersToAdd.length > 0) {
      // Combine existing members with new members, removing duplicates
      const newMembers = [
        ...(activeList.members || []),
        ...partnersToAdd.filter(id => !(activeList.members || []).includes(id))
      ];
      
      const updatedList: SavedList = {
        ...activeList,
        members: newMembers
      };
      
      setSavedLists(savedLists.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
      
      setActiveList(updatedList);
      setPartnersToAdd([]);
      setShowAddPartnersModal(false);
      
      toast({
        title: "Partners added",
        description: `${partnersToAdd.length} partners added to "${activeList.name}".`
      });
    }
  };
  
  // Function to share a list
  const shareList = () => {
    if (activeList) {
      // In a real app, this would handle sharing logic with backend
      const updatedList: SavedList = {
        ...activeList,
        isShared: true
      };
      
      setSavedLists(savedLists.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
      
      setActiveList(updatedList);
      setShowShareListModal(false);
      
      toast({
        title: "List shared",
        description: `The list "${activeList.name}" has been shared.`
      });
    }
  };
  
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
  
  // Pagination logic
  const totalPages = Math.ceil(displayedPartners.length / itemsPerPage);
  const paginatedPartners = displayedPartners.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Toggle selection of a partner
  const togglePartnerSelection = (id: number) => {
    setSelectedPartners(prev => {
      if (prev.includes(id)) {
        return prev.filter(partnerId => partnerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Check if a partner is selected
  const isPartnerSelected = (id: number) => selectedPartners.includes(id);
  
  // Toggle selection of all displayed partners
  const toggleSelectAll = () => {
    if (selectedPartners.length === displayedPartners.length) {
      // If all are selected, deselect all
      setSelectedPartners([]);
    } else {
      // Otherwise, select all
      setSelectedPartners(displayedPartners.map(p => p.id));
    }
  };
  
  // Get partner stats for display
  const partnerStats = calculatePartnerStats(displayedPartners);
  
  // Get current environment name
  const { environment } = useEnvironment();
  
  // Return the JSX for the component
  return (
    <div className="space-y-6">
      {/* Environment banner */}
      {environment !== 'myqollabi' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You are viewing data for the <span className="font-medium">{environment}</span> environment.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Page header with stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Partners</h1>
          <p className="text-gray-500">
            {partnerStats.totalPartners} partners • {partnerStats.activePartners} active • {partnerStats.totalCustomers} customers • {partnerStats.totalOpportunities} opportunities
          </p>
        </div>
        
        {/* View management buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Show dynamic list guidance button */}
          {!showDynamicListGuidance && (
            <Button 
              variant="outline" 
              onClick={() => setShowDynamicListGuidance(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </Button>
          )}
          
          {/* Create list from selection */}
          {selectedPartners.length > 0 && (
            <Button 
              onClick={openCreateFromSelection}
              className="bg-[#5567E5] hover:bg-[#4456D4] text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create List
            </Button>
          )}
          
          {/* "Save as view" button - always visible */}
          <Button 
            variant="outline" 
            onClick={() => setShowSaveViewModal(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save as view
          </Button>
          
          {/* "Save" button - only visible when there are unsaved changes in an active view */}
          {activeView && hasUnsavedChanges && (
            <Button 
              onClick={saveView}
              className="bg-[#5567E5] hover:bg-[#4456D4] text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </Button>
          )}
        </div>
      </div>
      
      {/* Dynamic list guidance */}
      {showDynamicListGuidance && (
        <DynamicListGuidance isNewList={!activeList} />
      )}
      
      {/* Filter and search section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search box */}
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search partners..."
              className="pl-10"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter dropdowns */}
        <div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Industries</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Views dropdown */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Partner list type indicator */}
          <div className="text-sm font-medium">
            {activeList ? activeList.name : "All Partners"}
            {activeList?.type === 'selection' && (
              <span className="ml-1 text-xs text-gray-500">
                ({activeList.members?.length || 0} partners)
              </span>
            )}
          </div>
          
          {/* Return to all partners button (only show when a list is active) */}
          {activeList && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setActiveList(null);
                setOriginalListFilters(null);
                setFilterText('');
                setSelectedStatus('');
                setSelectedIndustry('');
                setSelectedType('');
              }}
              className="text-xs h-7 px-2"
            >
              Return to all partners
            </Button>
          )}
        </div>
        
        {/* Views dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowListsDropdown(!showListsDropdown)}
            className="flex items-center gap-1 text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Views
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          
          {/* Dropdown menu for views */}
          {showListsDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-2 px-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">Views</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {views.map((view) => (
                  <button
                    key={view.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => {
                      applyView(view);
                      setShowListsDropdown(false);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{view.name}</p>
                      {view.description && (
                        <p className="text-xs text-gray-500">{view.description}</p>
                      )}
                    </div>
                    {activeView?.id === view.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-200 py-2 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-blue-600"
                  onClick={() => {
                    setShowSaveViewModal(true);
                    setShowListsDropdown(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Save current filters as view
                </Button>
                
                {activeView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-blue-600 mt-1"
                    onClick={() => {
                      clearActiveView();
                      setShowListsDropdown(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear view
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Active view indicator */}
      {activeView && (
        <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-md p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3E4DC4] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              <div>
                <h3 className="font-medium text-[#3E4DC4]">View: {activeView.name}</h3>
                <p className="text-sm text-gray-600">Filters saved in this view:</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActiveView}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {activeView.filters.status && (
              <Badge variant="outline" className="bg-white">Status: {activeView.filters.status}</Badge>
            )}
            {activeView.filters.industry && (
              <Badge variant="outline" className="bg-white">Industry: {activeView.filters.industry}</Badge>
            )}
            {activeView.filters.type && (
              <Badge variant="outline" className="bg-white">Type: {activeView.filters.type}</Badge>
            )}
            {activeView.filters.searchText && (
              <Badge variant="outline" className="bg-white">Search: "{activeView.filters.searchText}"</Badge>
            )}
            {!activeView.filters.status && !activeView.filters.industry && !activeView.filters.type && !activeView.filters.searchText && (
              <span className="text-sm text-gray-500 italic">No filters set</span>
            )}
          </div>
        </div>
      )}
      
      {/* Selection controls */}
      {selectedPartners.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-md flex justify-between items-center">
          <div>
            <p className="text-blue-800 font-medium">{selectedPartners.length} partners selected</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedPartners([])}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Clear selection
            </Button>
            <Button 
              size="sm"
              onClick={openCreateFromSelection}
              className="bg-[#5567E5] hover:bg-[#4456D4] text-white"
            >
              Create List
            </Button>
          </div>
        </div>
      )}
      
      {/* Partner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPartners.map((partner) => (
          <Card 
            key={partner.id} 
            className={`overflow-hidden hover:shadow-md transition-shadow ${isPartnerSelected(partner.id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <CardContent className="p-0">
              <div className="relative">
                {/* Selection checkbox */}
                <div className="absolute top-2 right-2">
                  <Checkbox 
                    checked={isPartnerSelected(partner.id)}
                    onCheckedChange={() => togglePartnerSelection(partner.id)}
                    className="h-5 w-5"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 bg-blue-100 text-blue-800">
                      <AvatarFallback>{partner.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link href={`/partners/${partner.id}`} className="text-blue-600 hover:underline font-medium block truncate">
                        {partner.name}
                      </Link>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">{partner.type}</span>
                        <span className="mx-1 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{partner.industry}</span>
                      </div>
                    </div>
                    <TemplateBadges industry={partner.industry} type={partner.type} />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <Badge 
                      variant={partner.status === 'active' ? 'default' : 'secondary'}
                      className={partner.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                    >
                      {partner.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{partner.customers}</span>
                        <span className="text-gray-500 ml-1">customers</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{partner.opportunities}</span>
                        <span className="text-gray-500 ml-1">opportunities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty state */}
      {displayedPartners.length === 0 && (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No partners found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterText('');
              setSelectedStatus('');
              setSelectedIndustry('');
              setSelectedType('');
              if (activeList?.type === 'selection') {
                setActiveList(null);
              }
            }}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Save View Dialog */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeView ? 'Update View' : 'Save as View'}</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a view. You can quickly access this view later from any list, and it will apply the filters you saved.
            </DialogDescription>
          </DialogHeader>
          
          {!activeView && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="view-name">Name</Label>
                <Input
                  id="view-name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="View name"
                />
              </div>
              <div>
                <Label htmlFor="view-description">Description (optional)</Label>
                <Textarea
                  id="view-description"
                  value={newViewDescription}
                  onChange={(e) => setNewViewDescription(e.target.value)}
                  placeholder="What type of partners does this view show?"
                  rows={2}
                />
              </div>
            </div>
          )}
          
          <div className="bg-[#EBEEFB] border border-[#D4D9F3] rounded-md p-3 mt-2">
            <h4 className="text-sm font-medium text-[#3E4DC4] mb-2">Filters saved in this view:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedStatus && (
                <Badge variant="outline" className="bg-white">Status: {selectedStatus}</Badge>
              )}
              {selectedIndustry && (
                <Badge variant="outline" className="bg-white">Industry: {selectedIndustry}</Badge>
              )}
              {selectedType && (
                <Badge variant="outline" className="bg-white">Type: {selectedType}</Badge>
              )}
              {filterText && (
                <Badge variant="outline" className="bg-white">Search: "{filterText}"</Badge>
              )}
              {!selectedStatus && !selectedIndustry && !selectedType && !filterText && (
                <span className="text-sm text-gray-500 italic">No filters set</span>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveView} className="bg-[#5567E5] hover:bg-[#4456D4] text-white">
              {activeView ? 'Update View' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create List from Selection Dialog */}
      <Dialog open={showCreateFromSelectionModal} onOpenChange={setShowCreateFromSelectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create List from Selection</DialogTitle>
            <DialogDescription>
              Create a static list containing the {selectedPartners.length} partners you've selected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={selectionListName}
                onChange={(e) => setSelectionListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div>
              <Label htmlFor="list-description">Description (optional)</Label>
              <Textarea
                id="list-description"
                value={selectionListDescription}
                onChange={(e) => setSelectionListDescription(e.target.value)}
                placeholder="What type of partners are included in this list?"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={createListFromSelection} className="bg-[#5567E5] hover:bg-[#4456D4] text-white">
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main Partners Page component
export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <PartnersTable />
    </div>
  );
}