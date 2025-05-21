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

// Sample data for partners
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
    location: "Chicago, IL",
    contactEmail: "info@securefs.com",
    primaryContact: "Michael Brown"
  },
  {
    id: 6,
    name: "Capital Consulting Group",
    initials: "CC",
    industry: "Consulting",
    type: "Agency",
    status: "active",
    size: "large",
    customers: 12,
    opportunities: 7,
    location: "Washington, DC",
    contactEmail: "partners@ccg.com",
    primaryContact: "Jennifer Lee"
  },
  {
    id: 7,
    name: "Northwest Risk Solutions",
    initials: "NR",
    industry: "Insurance",
    type: "Agency",
    status: "inactive",
    size: "small",
    customers: 3,
    opportunities: 2,
    location: "Seattle, WA",
    contactEmail: "hello@nwrisksolutions.com",
    primaryContact: "David Wilson"
  },
  {
    id: 8,
    name: "Alpine Insurance Advisors",
    initials: "AI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "medium",
    customers: 8,
    opportunities: 5,
    location: "Denver, CO",
    contactEmail: "advisors@alpineinsurance.com",
    primaryContact: "Rachel Green"
  },
  {
    id: 9,
    name: "Strategic Consulting Partners",
    initials: "SC",
    industry: "Consulting",
    type: "Agency",
    status: "active",
    size: "enterprise",
    customers: 17,
    opportunities: 10,
    location: "San Francisco, CA",
    contactEmail: "hello@strategicconsulting.com",
    primaryContact: "Thomas Wright"
  },
  {
    id: 10,
    name: "Elite Wealth Management",
    initials: "EW",
    industry: "Finance",
    type: "Broker",
    status: "inactive",
    size: "medium",
    customers: 9,
    opportunities: 6,
    location: "Los Angeles, CA",
    contactEmail: "contact@elitewealth.com",
    primaryContact: "Amanda Miller"
  }
];

// Icons
const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Helper function to get partner initials
function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function PartnerCard({ partner, selected, onSelect }: any) {
  return (
    <Card className={`border transition-all ${selected ? 'border-[#5567E5] bg-[#F7F8FE]' : 'border-gray-200 hover:border-gray-300'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#5567E5] text-white">{partner.initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <Link to={`/partners/${partner.id}`}>
                <h3 className="text-sm font-medium text-gray-900 hover:text-[#5567E5]">
                  {partner.name}
                </h3>
              </Link>
              <Checkbox 
                checked={selected}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(partner.id);
                }}
              />
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {partner.industry}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {partner.type}
              </Badge>
              <Badge 
                className={`text-xs ${
                  partner.status === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {partner.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {partner.customers}
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                {partner.opportunities}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

// Types for partner lists and views
interface ListView {
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
  isDefault?: boolean;
  createdBy: string;
  createdAt: Date;
}

interface PartnerList {
  id: string;
  name: string;
  description?: string;
  type: 'custom' | 'system'; // Custom list (user-created) or system list (all partners)
  members?: number[]; // For custom lists, store selected partner IDs
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
  views: ListView[];
  activeViewId?: string; // ID of the currently selected view
}

function PartnerListsRedesign() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateViewModal, setShowCreateViewModal] = useState(false);
  const [showAddPartnersModal, setShowAddPartnersModal] = useState(false);
  const [partnersToAdd, setPartnersToAdd] = useState<number[]>([]);
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Sample data for partner lists with views
  const [partnerLists, setPartnerLists] = useState<PartnerList[]>([
    // System list - All Partners
    {
      id: 'all-partners',
      name: 'All Partners',
      type: 'system',
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true,
      views: [
        {
          id: 'all-partners-default',
          name: 'All Partners',
          filters: { },
          isDefault: true,
          createdBy: 'System',
          createdAt: new Date('2025-01-01')
        },
        {
          id: 'active-partners',
          name: 'Active Partners',
          filters: { status: 'active' },
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-01')
        },
        {
          id: 'insurance-partners',
          name: 'Insurance Industry',
          filters: { industry: 'Insurance' },
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-05')
        }
      ],
      activeViewId: 'all-partners-default'
    },
    // Custom list - Insurance Brokers
    {
      id: 'insurance-brokers',
      name: 'Insurance Brokers',
      type: 'custom',
      members: [1, 2, 3], // IDs of partners in this list
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01'),
      views: [
        {
          id: 'insurance-brokers-default',
          name: 'All Insurance Brokers',
          filters: { },
          isDefault: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-01')
        },
        {
          id: 'active-brokers',
          name: 'Active Brokers',
          filters: { status: 'active' },
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-10')
        }
      ],
      activeViewId: 'insurance-brokers-default'
    },
    // Custom list - Strategic Partners
    {
      id: 'strategic-partners',
      name: 'Strategic Partners',
      type: 'custom',
      members: [3, 5, 9], // IDs of partners in this list
      isShared: true,
      sharedWith: ['partnerships@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15'),
      views: [
        {
          id: 'strategic-partners-default',
          name: 'All Strategic Partners',
          filters: { },
          isDefault: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-15')
        }
      ],
      activeViewId: 'strategic-partners-default'
    }
  ]);
  
  // Current active list and view
  const [activeListId, setActiveListId] = useState<string>('all-partners');
  const [activeViewId, setActiveViewId] = useState<string>('all-partners-default');
  
  // Find the active list and view
  const activeList = partnerLists.find(list => list.id === activeListId);
  const activeView = activeList?.views.find(view => view.id === activeViewId);
  
  // Form state for creating new list and view
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  
  // Filter partners based on the active list, view, and any additional filters
  const filteredPartners = mockPartners.filter(partner => {
    // If we have a custom list, only show partners in that list
    if (activeList?.type === 'custom') {
      if (!activeList.members?.includes(partner.id)) {
        return false;
      }
    }
    
    // Apply manual filters (these override view filters)
    if (selectedStatus && selectedStatus !== 'all' && partner.status !== selectedStatus) {
      return false;
    }
    
    if (selectedIndustry && selectedIndustry !== 'all' && partner.industry !== selectedIndustry) {
      return false;
    }
    
    if (selectedType && selectedType !== 'all' && partner.type !== selectedType) {
      return false;
    }
    
    // Apply manual search 
    if (searchTerm) {
      return partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.type.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, startIndex + itemsPerPage);
  
  // Create a new list
  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "List name required",
        description: "Please enter a name for your list.",
        variant: "destructive",
      });
      return;
    }
    
    const newListId = `list-${Date.now()}`;
    const newViewId = `view-${Date.now()}`;
    
    const newList: PartnerList = {
      id: newListId,
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
      type: 'custom',
      members: selectedPartners.length > 0 ? [...selectedPartners] : [],
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date(),
      views: [
        {
          id: newViewId,
          name: 'All Partners',
          filters: { },
          isDefault: true,
          createdBy: 'John Smith',
          createdAt: new Date()
        }
      ],
      activeViewId: newViewId
    };
    
    setPartnerLists([...partnerLists, newList]);
    setActiveListId(newListId);
    setActiveViewId(newViewId);
    
    // Reset form
    setNewListName('');
    setNewListDescription('');
    setShowCreateListModal(false);
    
    // Clear selected partners
    setSelectedPartners([]);
    
    toast({
      title: "List created",
      description: `"${newListName}" has been created successfully.`,
    });
  };
  
  // Create a new view
  const handleCreateView = () => {
    if (!activeList) {
      toast({
        title: "No active list",
        description: "Please select a list first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newViewName.trim()) {
      toast({
        title: "View name required",
        description: "Please enter a name for your view.",
        variant: "destructive",
      });
      return;
    }
    
    const newViewId = `view-${Date.now()}`;
    
    const newView: ListView = {
      id: newViewId,
      name: newViewName.trim(),
      description: newViewDescription.trim() || undefined,
      filters: {
        // Capture current filters
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
        type: selectedType || undefined,
        searchText: searchTerm || undefined
      },
      createdBy: 'John Smith',
      createdAt: new Date()
    };
    
    // Add the new view to the active list
    const updatedLists = partnerLists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          views: [...list.views, newView],
          activeViewId: newViewId
        };
      }
      return list;
    });
    
    setPartnerLists(updatedLists);
    setActiveViewId(newViewId);
    
    // Reset form
    setNewViewName('');
    setNewViewDescription('');
    setShowCreateViewModal(false);
    
    toast({
      title: "View created",
      description: `"${newViewName}" view has been added to "${activeList.name}".`,
    });
  };
  
  // Add partners to a list
  const handleAddPartnersToList = () => {
    if (!activeList || activeList.type !== 'custom') {
      toast({
        title: "Invalid operation",
        description: "You can only add partners to custom lists.",
        variant: "destructive",
      });
      return;
    }
    
    // Add selected partners to the list
    const updatedLists = partnerLists.map(list => {
      if (list.id === activeListId) {
        const currentMembers = list.members || [];
        // Make a unique array of members without using Set
        const newMembers = [...currentMembers];
        partnersToAdd.forEach(id => {
          if (!newMembers.includes(id)) {
            newMembers.push(id);
          }
        });
        
        return {
          ...list,
          members: newMembers
        };
      }
      return list;
    });
    
    setPartnerLists(updatedLists);
    setPartnersToAdd([]);
    setShowAddPartnersModal(false);
    
    toast({
      title: "Partners added",
      description: `${partnersToAdd.length} partner(s) have been added to "${activeList.name}".`,
    });
  };
  
  // Toggle partner selection
  const togglePartnerSelection = (id: number) => {
    if (selectedPartners.includes(id)) {
      setSelectedPartners(selectedPartners.filter(partnerId => partnerId !== id));
    } else {
      setSelectedPartners([...selectedPartners, id]);
    }
  };
  
  // Toggle partner selection for adding to list
  const togglePartnerToAdd = (id: number) => {
    if (partnersToAdd.includes(id)) {
      setPartnersToAdd(partnersToAdd.filter(partnerId => partnerId !== id));
    } else {
      setPartnersToAdd([...partnersToAdd, id]);
    }
  };
  
  // Switch to a different list
  const switchToList = (listId: string) => {
    const list = partnerLists.find(l => l.id === listId);
    if (list) {
      setActiveListId(listId);
      // Switch to the default view or the active view
      setActiveViewId(list.activeViewId || list.views.find(v => v.isDefault)?.id || list.views[0].id);
      // Reset filters
      setSearchTerm('');
      setSelectedStatus('');
      setSelectedIndustry('');
      setSelectedType('');
      setIsListMenuOpen(false);
    }
  };
  
  // Switch to a different view
  const switchToView = (viewId: string) => {
    if (!activeList) return;
    
    const view = activeList.views.find(v => v.id === viewId);
    if (view) {
      setActiveViewId(viewId);
      
      // Update the active view ID in the list
      const updatedLists = partnerLists.map(list => {
        if (list.id === activeListId) {
          return {
            ...list,
            activeViewId: viewId
          };
        }
        return list;
      });
      
      setPartnerLists(updatedLists);
      
      // Apply the view's filters
      setSelectedStatus(view.filters.status || '');
      setSelectedIndustry(view.filters.industry || '');
      setSelectedType(view.filters.type || '');
      setSearchTerm(view.filters.searchText || '');
      setIsViewMenuOpen(false);
    }
  };
  
  // Save current filters as a new view
  const saveFiltersAsView = () => {
    setNewViewName(`${activeList?.name} - ${selectedStatus || selectedIndustry || selectedType || 'Filtered'}`.trim());
    setShowCreateViewModal(true);
  };
  
  // Calculate partner stats
  const stats = calculatePartnerStats(filteredPartners);
  
  return (
    <div className="space-y-4">
      {/* Header with list and view selectors */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top row with navigation menus and actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* List selector */}
            <div className="relative min-w-[200px]">
              <button 
                className="flex items-center justify-between w-full px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                onClick={() => setIsListMenuOpen(!isListMenuOpen)}
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#5567E5]">
                    <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#5567E5"/>
                  </svg>
                  <span className="font-medium text-gray-900">{activeList?.name || 'All Partners'}</span>
                  
                  {/* List type indicator */}
                  {activeList && (
                    <Badge className={`text-xs py-0.5 ${activeList.type === 'custom' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {activeList.type === 'custom' ? 'Custom List' : 'System List'}
                    </Badge>
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
                  className={`transition-transform ${isListMenuOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              
              {/* List dropdown menu */}
              {isListMenuOpen && (
                <div className="absolute z-50 mt-1.5 w-full rounded-md border border-slate-200 bg-white text-slate-950 shadow-md">
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search lists..."
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-transparent border border-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5567E5] focus-visible:ring-offset-2"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {partnerLists.map(list => (
                      <div 
                        key={list.id}
                        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeListId === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                        onClick={() => switchToList(list.id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {/* List type icon */}
                          {list.type === 'custom' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          )}
                          
                          <span>{list.name}</span>
                          
                          {/* Badge showing number of views */}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {list.views.length} {list.views.length === 1 ? 'view' : 'views'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Create new list option */}
                    <div
                      className="flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 text-[#5567E5] border-t border-slate-100 mt-1 pt-2"
                      onClick={() => {
                        setShowCreateListModal(true);
                        setIsListMenuOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>
                      Create new list
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* View selector - only show when a list is selected */}
            {activeList && (
              <div className="relative min-w-[200px]">
                <button 
                  className="flex items-center justify-between w-full px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5567E5]">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span className="font-medium text-gray-900">{activeView?.name || 'Default View'}</span>
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
                    className={`transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {/* View dropdown menu */}
                {isViewMenuOpen && (
                  <div className="absolute z-50 mt-1.5 w-full rounded-md border border-slate-200 bg-white text-slate-950 shadow-md">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {activeList.views.map(view => (
                        <div 
                          key={view.id}
                          className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${activeViewId === view.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                          onClick={() => switchToView(view.id)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={view.isDefault ? "text-green-500" : "text-blue-500"}>
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            <span>{view.name}</span>
                            
                            {/* Default view indicator */}
                            {view.isDefault && (
                              <Badge className="ml-auto text-xs bg-green-100 text-green-800">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Create new view option */}
                      <div
                        className="flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 text-[#5567E5] border-t border-slate-100 mt-1 pt-2"
                        onClick={() => {
                          setShowCreateViewModal(true);
                          setIsViewMenuOpen(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                        Create new view
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Filter indicators - Only show when filters are applied */}
            {(selectedStatus || selectedIndustry || selectedType || searchTerm) && (
              <div className="flex items-center gap-2 ml-2">
                {selectedStatus && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {selectedStatus}
                    <button onClick={() => setSelectedStatus('')} className="ml-1">×</button>
                  </Badge>
                )}
                {selectedIndustry && (
                  <Badge variant="secondary" className="gap-1">
                    Industry: {selectedIndustry}
                    <button onClick={() => setSelectedIndustry('')} className="ml-1">×</button>
                  </Badge>
                )}
                {selectedType && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {selectedType}
                    <button onClick={() => setSelectedType('')} className="ml-1">×</button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1">×</button>
                  </Badge>
                )}
                
                {/* Save filters as view button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#5567E5] border-[#5567E5] hover:bg-[#5567E5] hover:text-white"
                  onClick={saveFiltersAsView}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save as View
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus('');
                    setSelectedIndustry('');
                    setSelectedType('');
                    setSearchTerm('');
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}
            
            {/* Right side - Search, Add Partners, Create List */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Search box */}
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search partners..."
                  className="pl-10 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Add partners button - only for custom lists */}
              {activeList?.type === 'custom' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartnersModal(true)}
                  className="border-[#5567E5] text-[#5567E5] hover:bg-[#5567E5] hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Add Partners
                </Button>
              )}
              
              {/* Create List Button */}
              <Button
                className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
                onClick={() => setShowCreateListModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </div>
          </div>
          
          {/* Filters for Industry and Type */}
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedIndustry}
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Industry Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Broker">Broker</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Partner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      
      {/* Partner List */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredPartners.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredPartners.length)} of {filteredPartners.length} partners
          </div>
          
          {selectedPartners.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedPartners.length} selected</span>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPartners([])}
              >
                Clear selection
              </Button>
              <Button
                size="sm"
                className="bg-[#5567E5] hover:bg-[#4151c4] text-white"
                onClick={() => setShowCreateListModal(true)}
              >
                Create List from Selection
              </Button>
            </div>
          )}
        </div>
        
        {/* Partner Grid */}
        {filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPartners.map(partner => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                selected={selectedPartners.includes(partner.id)}
                onSelect={togglePartnerSelection}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-100 inline-flex rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium">No partners found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search term</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredPartners.length > itemsPerPage && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={currentPage === pageNumber ? "bg-[#5567E5]" : ""}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create List Modal */}
      <Dialog open={showCreateListModal} onOpenChange={setShowCreateListModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your partners. Lists can have multiple views.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="list-name">List Name</Label>
              <Input 
                id="list-name" 
                value={newListName} 
                onChange={(e) => setNewListName(e.target.value)} 
                placeholder="Enter list name" 
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="list-description">Description (optional)</Label>
              <Textarea 
                id="list-description" 
                value={newListDescription} 
                onChange={(e) => setNewListDescription(e.target.value)} 
                placeholder="Enter list description" 
                className="mt-1.5"
              />
            </div>
            
            {selectedPartners.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800">
                      Your selection of {selectedPartners.length} partners will be added to this list automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateListModal(false)}>
              Cancel
            </Button>
            <Button className="bg-[#5567E5] hover:bg-[#4151c4] text-white" onClick={handleCreateList}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create View Modal */}
      <Dialog open={showCreateViewModal} onOpenChange={setShowCreateViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New View</DialogTitle>
            <DialogDescription>
              Save your current filters as a view for the list "{activeList?.name}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="view-name">View Name</Label>
              <Input 
                id="view-name" 
                value={newViewName} 
                onChange={(e) => setNewViewName(e.target.value)} 
                placeholder="Enter view name" 
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="view-description">Description (optional)</Label>
              <Textarea 
                id="view-description" 
                value={newViewDescription} 
                onChange={(e) => setNewViewDescription(e.target.value)} 
                placeholder="Enter view description" 
                className="mt-1.5"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <div>
                  <p className="text-sm text-blue-800">
                    This view will save the following filters:
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-blue-700">
                    {selectedStatus && <div>Status: {selectedStatus}</div>}
                    {selectedIndustry && <div>Industry: {selectedIndustry}</div>}
                    {selectedType && <div>Type: {selectedType}</div>}
                    {searchTerm && <div>Search term: {searchTerm}</div>}
                    {!selectedStatus && !selectedIndustry && !selectedType && !searchTerm && (
                      <div>No filters currently applied</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateViewModal(false)}>
              Cancel
            </Button>
            <Button className="bg-[#5567E5] hover:bg-[#4151c4] text-white" onClick={handleCreateView}>
              Create View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Partners to List Modal */}
      <Dialog open={showAddPartnersModal} onOpenChange={setShowAddPartnersModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Partners to {activeList?.name}</DialogTitle>
            <DialogDescription>
              Select partners to add to your list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium text-gray-500 text-sm">Partner</th>
                    <th className="p-2 text-left font-medium text-gray-500 text-sm">Industry</th>
                    <th className="p-2 text-left font-medium text-gray-500 text-sm">Type</th>
                    <th className="p-2 text-left font-medium text-gray-500 text-sm">Status</th>
                    <th className="p-2 text-center font-medium text-gray-500 text-sm">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPartners
                    // Don't show partners already in this list
                    .filter(partner => !(activeList?.members?.includes(partner.id)))
                    .map(partner => (
                      <tr key={partner.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-[#5567E5] text-white text-xs">{partner.initials}</AvatarFallback>
                            </Avatar>
                            <span>{partner.name}</span>
                          </div>
                        </td>
                        <td className="p-2">{partner.industry}</td>
                        <td className="p-2">{partner.type}</td>
                        <td className="p-2">
                          <Badge 
                            className={
                              partner.status === 'active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }
                          >
                            {partner.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox 
                            checked={partnersToAdd.includes(partner.id)}
                            onClick={() => togglePartnerToAdd(partner.id)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter>
            <div className="text-sm text-gray-500 mr-auto">
              {partnersToAdd.length} partners selected
            </div>
            <Button variant="outline" onClick={() => setShowAddPartnersModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#5567E5] hover:bg-[#4151c4] text-white" 
              onClick={handleAddPartnersToList}
              disabled={partnersToAdd.length === 0}
            >
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PartnerListsRedesign;