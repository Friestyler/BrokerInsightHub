import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Mock data - same as PartnersPage.tsx
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
    contactEmail: "info@securefinancial.com",
    primaryContact: "Michael Brown"
  },
  {
    id: 6,
    name: "Coastal Insurance Solutions",
    initials: "CI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "medium",
    customers: 8,
    opportunities: 5,
    location: "Miami, FL",
    contactEmail: "help@coastalinsurance.com",
    primaryContact: "Lisa Rodriguez"
  },
  {
    id: 7,
    name: "Midwest Benefit Consultants",
    initials: "MB",
    industry: "Consulting",
    type: "Partner",
    status: "active",
    size: "small",
    customers: 4,
    opportunities: 2,
    location: "Chicago, IL",
    contactEmail: "info@midwestbenefits.com",
    primaryContact: "Robert Miller"
  },
  {
    id: 8,
    name: "Eagle Risk Management",
    initials: "ER",
    industry: "Risk Management",
    type: "Partner",
    status: "inactive",
    size: "medium",
    customers: 7,
    opportunities: 3,
    location: "Dallas, TX",
    contactEmail: "contact@eaglerisk.com",
    primaryContact: "David Wilson"
  }
];

// Component for industry/type badges
function PartnerTypeBadges({ industry, type }: { industry: string, type: string }) {
  const getBadges = (industry: string, type: string) => {
    if (industry === 'Insurance' && type === 'Broker') {
      return [
        { code: 'IB', color: 'bg-blue-100 text-blue-800' }
      ];
    } else if (industry === 'Insurance' && type === 'Agency') {
      return [
        { code: 'IA', color: 'bg-green-100 text-green-800' }
      ];
    } else if (industry === 'Finance' && type === 'Broker') {
      return [
        { code: 'FB', color: 'bg-purple-100 text-purple-800' }
      ];
    } else if (industry === 'Consulting' && type === 'Partner') {
      return [
        { code: 'CP', color: 'bg-amber-100 text-amber-800' }
      ];
    } else if (industry === 'Risk Management') {
      return [
        { code: 'RM', color: 'bg-red-100 text-red-800' }
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
  type?: 'filter' | 'selection';
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    type?: string;
    size?: string;
  };
  members?: number[];
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
}

// Define interface for view
interface View {
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
}

// Define interface for list with views
interface ListWithViews extends SavedList {
  views: View[];
  activeViewId?: string;
}

// Main Partners Views Demo component
export default function PartnersViewsDemo() {
  // State for list data, views, and filters
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [selectedViewStyle, setSelectedViewStyle] = useState('tabs');
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Demo lists with views
  const [lists, setLists] = useState<ListWithViews[]>([
    {
      id: 'partners-list',
      name: 'All Partners',
      description: 'Complete list of all partners in the system',
      type: 'filter',
      filters: {},
      isShared: true,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true,
      views: [
        {
          id: 'partners-all',
          name: 'All Partners',
          description: 'Default view showing all partners without filters',
          filters: {},
          isShared: true,
          createdBy: 'System',
          createdAt: new Date('2025-01-01')
        },
        {
          id: 'partners-active-brokers',
          name: 'Active Brokers',
          description: 'All active insurance brokers',
          filters: { status: 'active', type: 'Broker' },
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-01')
        },
        {
          id: 'partners-insurance',
          name: 'Insurance Partners',
          description: 'All partners in the insurance industry',
          filters: { industry: 'Insurance' },
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-05-05')
        }
      ],
      activeViewId: 'partners-all'
    },
    {
      id: 'strategic-partners',
      name: 'Strategic Partners',
      description: 'Key strategic partners with special relationships',
      type: 'selection',
      filters: {},
      members: [1, 3, 5],
      isShared: true,
      createdBy: 'John Smith',
      createdAt: new Date('2025-02-15'),
      views: [
        {
          id: 'strategic-all',
          name: 'All Strategic Partners',
          description: 'Default view showing all strategic partners',
          filters: {},
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-02-15')
        },
        {
          id: 'strategic-insurance',
          name: 'Insurance Strategic Partners',
          description: 'Strategic partners in the insurance industry',
          filters: { industry: 'Insurance' },
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-03-10')
        }
      ],
      activeViewId: 'strategic-all'
    },
    {
      id: 'high-value',
      name: 'High-Value Partners',
      description: 'Partners with significant business opportunities',
      type: 'filter',
      filters: { type: 'Broker' },
      isShared: true,
      createdBy: 'John Smith', 
      createdAt: new Date('2025-04-05'),
      views: [
        {
          id: 'high-value-all',
          name: 'All High-Value',
          description: 'Default view showing all high-value partners',
          filters: {},
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-04-05')
        },
        {
          id: 'high-value-active',
          name: 'Active High-Value',
          description: 'Active high-value partners only',
          filters: { status: 'active' },
          isShared: true,
          createdBy: 'John Smith',
          createdAt: new Date('2025-04-10')
        }
      ],
      activeViewId: 'high-value-all'
    }
  ]);
  
  // Active list and view tracking
  const [activeListId, setActiveListId] = useState<string>('partners-list');
  const activeList = lists.find(list => list.id === activeListId) || lists[0];
  const activeViewId = activeList.activeViewId || activeList.views[0]?.id;
  const activeView = activeList.views.find(view => view.id === activeViewId) || null;
  const { toast } = useToast();
  
  // Calculate statistics for the dashboard
  const stats = {
    totalPartners: mockPartners.length,
    activePartners: mockPartners.filter(p => p.status === 'active').length,
    totalCustomers: mockPartners.reduce((sum, p) => sum + p.customers, 0),
    totalOpportunities: mockPartners.reduce((sum, p) => sum + p.opportunities, 0)
  };
  
  // Filter partners based on list type, selection, view, and additional filters
  const filteredPartners = mockPartners.filter(partner => {
    // For selection-type lists, only show partners that are in the members array
    if (activeList.type === 'selection') {
      if (!activeList.members || !activeList.members.includes(partner.id)) {
        return false;
      }
    }
    
    // Apply view filters from the active view
    if (activeView) {
      // Check status filter
      if (activeView.filters.status && partner.status !== activeView.filters.status) {
        return false;
      }
      
      // Check industry filter
      if (activeView.filters.industry && partner.industry !== activeView.filters.industry) {
        return false;
      }
      
      // Check type filter
      if (activeView.filters.type && partner.type !== activeView.filters.type) {
        return false;
      }
    }
    
    // Apply additional user-applied filters (these override or add to view filters)
    if (selectedStatus && partner.status !== selectedStatus) {
      return false;
    }
    
    if (selectedIndustry && partner.industry !== selectedIndustry) {
      return false;
    }
    
    if (selectedType && partner.type !== selectedType) {
      return false;
    }
    
    // Always apply text search
    if (filterText) {
      const searchTerms = filterText.toLowerCase().split(' ');
      const partnerText = `${partner.name.toLowerCase()} ${partner.industry.toLowerCase()} ${partner.type.toLowerCase()} ${partner.location.toLowerCase()}`;
      return searchTerms.every(term => partnerText.includes(term));
    }
    
    return true;
  });
  
  // Switch active list
  const switchList = (listId: string) => {
    setActiveListId(listId);
    // Reset manual filters when switching lists
    setFilterText('');
    setSelectedStatus('');
    setSelectedIndustry('');
    setSelectedType('');
  };
  
  // Apply a saved view within the current list
  const applyView = (viewId: string) => {
    // Update the active list with the new active view ID
    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          activeViewId: viewId
        };
      }
      return list;
    });
    
    setLists(updatedLists);
    
    // Reset manual filters when switching views
    const view = activeList.views.find(v => v.id === viewId);
    if (view) {
      setFilterText(view.filters.searchText || '');
      setSelectedStatus(view.filters.status || '');
      setSelectedIndustry(view.filters.industry || '');
      setSelectedType(view.filters.type || '');
    }
  };
  
  // Clear additional filters (but keep the active view's filters)
  const clearAdditionalFilters = () => {
    if (activeView) {
      setFilterText(activeView.filters.searchText || '');
      setSelectedStatus(activeView.filters.status || '');
      setSelectedIndustry(activeView.filters.industry || '');
      setSelectedType(activeView.filters.type || '');
    } else {
      setFilterText('');
      setSelectedStatus('');
      setSelectedIndustry('');
      setSelectedType('');
    }
  };
  
  // Reset to default view in the current list
  const resetToDefaultView = () => {
    const defaultViewId = activeList.views[0]?.id;
    if (defaultViewId) {
      applyView(defaultViewId);
    }
  };
  
  // Save current filters as a new view in the current list
  const saveAsView = () => {
    setShowSaveViewModal(true);
  };

  // Filter lists and views for the quick switcher search
  const filteredListsAndViews = searchQuery.trim() === '' 
    ? lists 
    : lists.map(list => {
        // Check if list name matches search
        const listMatches = list.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter views that match search
        const matchingViews = list.views.filter(view => 
          view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (view.description && view.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        // Include list if either the list name matches or it has matching views
        if (listMatches || matchingViews.length > 0) {
          return {
            ...list,
            views: matchingViews
          };
        }
        return null;
      }).filter(Boolean) as ListWithViews[];
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Partners (Views Demo)</h1>
        <p className="text-gray-500">This page demonstrates four different approaches for navigating between views in a list.</p>
      </div>
      
      {/* View style selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">View Style</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedViewStyle === 'tabs' ? 'default' : 'outline'} 
            onClick={() => setSelectedViewStyle('tabs')}
          >
            Tabs Interface
          </Button>
          <Button 
            variant={selectedViewStyle === 'panel' ? 'default' : 'outline'} 
            onClick={() => setSelectedViewStyle('panel')}
          >
            Filter Presets Panel
          </Button>
          <Button 
            variant={selectedViewStyle === 'combined' ? 'default' : 'outline'} 
            onClick={() => setSelectedViewStyle('combined')}
          >
            Combined View/Filter Interface
          </Button>
          <Button 
            variant={selectedViewStyle === 'quickswitcher' ? 'default' : 'outline'} 
            onClick={() => setSelectedViewStyle('quickswitcher')}
          >
            Quick Switcher Menu
          </Button>
        </div>
      </div>
      
      {/* Main content card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header with environment indicator and list controls */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">Partner List</h2>
                  <p className="text-sm text-gray-500">Manage your partner relationships and opportunities</p>
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
              
              {/* List Selector - only show if not in quickswitcher mode */}
              {selectedViewStyle !== 'quickswitcher' && (
                <div className="mb-4 flex items-center space-x-4">
                  <span className="text-sm font-medium">List:</span>
                  <div className="flex space-x-2">
                    {lists.map(list => (
                      <Button 
                        key={list.id}
                        variant={list.id === activeListId ? "default" : "outline"}
                        size="sm"
                        onClick={() => switchList(list.id)}
                      >
                        {list.name}
                        {list.type === 'selection' && (
                          <span className="ml-1 text-xs bg-indigo-100 text-indigo-800 px-1 rounded">
                            Custom
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Switcher Demo UI */}
              {selectedViewStyle === 'quickswitcher' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Current Selection</h3>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setQuickSwitcherOpen(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span>
                          {activeList.name}: <span className="font-medium">{activeView?.name}</span>
                        </span>
                        <kbd className="ml-2 inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tabs Interface */}
              {selectedViewStyle === 'tabs' && (
                <div className="border-b border-gray-200">
                  <Tabs defaultValue={activeViewId} onValueChange={(value) => {
                    applyView(value);
                  }}>
                    <div className="flex justify-between items-center">
                      <TabsList>
                        {activeList.views.map(view => (
                          <TabsTrigger key={view.id} value={view.id}>
                            {view.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2 border-dashed text-gray-500"
                        onClick={saveAsView}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New View
                      </Button>
                    </div>
                  </Tabs>
                </div>
              )}
              
              {/* Panel Interface */}
              {selectedViewStyle === 'panel' && (
                <div className="grid grid-cols-12 gap-4">
                  {/* Lists and Views panel */}
                  <div className="col-span-3 border-r pr-4">
                    {/* Lists section */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Lists</h3>
                      {lists.map(list => (
                        <div 
                          key={list.id}
                          className={`p-2 rounded-md cursor-pointer transition-colors mb-1 ${list.id === activeListId ? 'bg-indigo-50 border border-indigo-100 font-medium' : 'hover:bg-gray-50'}`}
                          onClick={() => switchList(list.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{list.name}</span>
                            {list.type === 'selection' && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-1 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{list.description}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Views section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Views in {activeList.name}</h3>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          onClick={saveAsView}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span className="sr-only">New view</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {activeList.views.map(view => (
                          <div 
                            key={view.id}
                            className={`p-2 rounded-md cursor-pointer transition-colors ${view.id === activeViewId ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}
                            onClick={() => applyView(view.id)}
                          >
                            <div className="font-medium text-sm">{view.name}</div>
                            <div className="text-xs text-gray-500">{view.description}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {view.filters.status && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Status: {view.filters.status}
                                </span>
                              )}
                              {view.filters.industry && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Industry: {view.filters.industry}
                                </span>
                              )}
                              {view.filters.type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Type: {view.filters.type}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Main content area */}
                  <div className="col-span-9">
                    {activeView && (
                      <div className="mb-4 flex justify-between items-center bg-indigo-50 p-3 rounded-md">
                        <div>
                          <h3 className="font-medium text-indigo-900">{activeView.name}</h3>
                          <p className="text-sm text-indigo-700">{activeView.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearAdditionalFilters}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                          Reset to view defaults
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Combined Interface */}
              {selectedViewStyle === 'combined' && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-3 items-center mb-4">
                    {/* List selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium whitespace-nowrap">List:</Label>
                      <div className="relative inline-block text-left">
                        <select
                          className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={activeListId}
                          onChange={(e) => switchList(e.target.value)}
                        >
                          {lists.map(list => (
                            <option key={list.id} value={list.id}>
                              {list.name} {list.type === 'selection' ? '(Custom)' : ''}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* View selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium whitespace-nowrap">View:</Label>
                      <div className="relative inline-block text-left">
                        <select
                          className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={activeViewId}
                          onChange={(e) => applyView(e.target.value)}
                        >
                          {activeList.views.map(view => (
                            <option key={view.id} value={view.id}>{view.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {activeView && (
                      <div className="text-sm text-gray-500">
                        {activeView.description}
                      </div>
                    )}
                    
                    <div className="ml-auto">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={saveAsView}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save as view
                      </Button>
                    </div>
                  </div>
                  
                  {activeView && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {activeView.filters.status && (
                        <div className="bg-blue-50 px-2 py-1 rounded-full text-xs font-medium text-blue-700 flex items-center">
                          <span>Status: {activeView.filters.status}</span>
                          <button 
                            className="ml-1 text-blue-400 hover:text-blue-600"
                            onClick={() => {
                              // Create an updated list of views
                              const updatedLists = lists.map(list => {
                                if (list.id === activeListId) {
                                  const updatedViews = list.views.map(v => {
                                    if (v.id === activeViewId) {
                                      return {
                                        ...v,
                                        filters: { ...v.filters, status: undefined }
                                      };
                                    }
                                    return v;
                                  });
                                  return { ...list, views: updatedViews };
                                }
                                return list;
                              });
                              setLists(updatedLists);
                              setSelectedStatus('');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {activeView.filters.industry && (
                        <div className="bg-green-50 px-2 py-1 rounded-full text-xs font-medium text-green-700 flex items-center">
                          <span>Industry: {activeView.filters.industry}</span>
                          <button 
                            className="ml-1 text-green-400 hover:text-green-600"
                            onClick={() => {
                              // Create an updated list of views
                              const updatedLists = lists.map(list => {
                                if (list.id === activeListId) {
                                  const updatedViews = list.views.map(v => {
                                    if (v.id === activeViewId) {
                                      return {
                                        ...v,
                                        filters: { ...v.filters, industry: undefined }
                                      };
                                    }
                                    return v;
                                  });
                                  return { ...list, views: updatedViews };
                                }
                                return list;
                              });
                              setLists(updatedLists);
                              setSelectedIndustry('');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {activeView.filters.type && (
                        <div className="bg-purple-50 px-2 py-1 rounded-full text-xs font-medium text-purple-700 flex items-center">
                          <span>Type: {activeView.filters.type}</span>
                          <button 
                            className="ml-1 text-purple-400 hover:text-purple-600"
                            onClick={() => {
                              // Create an updated list of views
                              const updatedLists = lists.map(list => {
                                if (list.id === activeListId) {
                                  const updatedViews = list.views.map(v => {
                                    if (v.id === activeViewId) {
                                      return {
                                        ...v,
                                        filters: { ...v.filters, type: undefined }
                                      };
                                    }
                                    return v;
                                  });
                                  return { ...list, views: updatedViews };
                                }
                                return list;
                              });
                              setLists(updatedLists);
                              setSelectedType('');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Filter section */}
              <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <Input 
                    type="text" 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search partners..." 
                    className="flex-1 h-9 text-sm" 
                  />
                </div>
                
                <div className="flex-1 flex flex-wrap gap-2 min-w-[200px]">
                  <select 
                    className="h-9 border-gray-300 rounded-md text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select 
                    className="h-9 border-gray-300 rounded-md text-sm"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                  >
                    <option value="">All Industries</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Risk Management">Risk Management</option>
                  </select>
                  
                  <select 
                    className="h-9 border-gray-300 rounded-md text-sm"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Broker">Broker</option>
                    <option value="Agency">Agency</option>
                    <option value="Partner">Partner</option>
                  </select>
                  
                  {/* Clear filters button */}
                  {(filterText || selectedStatus || selectedIndustry || selectedType) && (
                    <button 
                      onClick={clearAdditionalFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
              
              {/* Statistics overview */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Total Partners</div>
                  <div className="text-2xl font-bold mt-1">{stats.totalPartners}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Active Partners</div>
                  <div className="text-2xl font-bold mt-1">{stats.activePartners}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Total Customers</div>
                  <div className="text-2xl font-bold mt-1">{stats.totalCustomers}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Total Opportunities</div>
                  <div className="text-2xl font-bold mt-1">{stats.totalOpportunities}</div>
                </div>
              </div>
            </div>
            
            {/* Partners table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPartners(filteredPartners.map(p => p.id));
                          } else {
                            setSelectedPartners([]);
                          }
                        }}
                        checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                      />
                      Partner
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customers</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Opportunities</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPartners.map((partner) => (
                    <tr key={partner.id} className={selectedPartners.includes(partner.id) ? "bg-indigo-50" : ""}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                            checked={selectedPartners.includes(partner.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPartners([...selectedPartners, partner.id]);
                              } else {
                                setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                              }
                            }}
                          />
                          <div className="flex-shrink-0">
                            <Avatar>
                              <AvatarFallback className="bg-indigo-100 text-indigo-800">
                                {partner.initials}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{partner.name}</div>
                            <div className="text-gray-500">{partner.contactEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <PartnerTypeBadges industry={partner.industry} type={partner.type} />
                          <div>
                            <div>{partner.industry}</div>
                            <div className="text-xs">{partner.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                          {partner.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {partner.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {partner.customers}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {partner.opportunities}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to={`/lists/partners/${partner.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredPartners.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 mb-1">No partners match your current filters</p>
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            onClick={clearAdditionalFilters}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Switcher Dialog */}
      <Dialog open={quickSwitcherOpen} onOpenChange={setQuickSwitcherOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-semibold">Quick Switcher</DialogTitle>
            <DialogDescription className="text-left">
              Quickly switch between lists and views
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-3 left-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input 
                className="pl-10" 
                placeholder="Search lists and views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="mt-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-4">
                {/* Recently Used Section */}
                {searchQuery.trim() === '' && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">Recently Used</h4>
                    <div className="space-y-1">
                      <button 
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                        onClick={() => {
                          switchList('strategic-partners');
                          applyView('strategic-insurance');
                          setQuickSwitcherOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">R</div>
                        <div>
                          <div className="font-medium">Insurance Strategic Partners</div>
                          <div className="text-xs text-gray-500">in Strategic Partners list</div>
                        </div>
                      </button>
                      <button 
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                        onClick={() => {
                          switchList('partners-list');
                          applyView('partners-active-brokers');
                          setQuickSwitcherOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">R</div>
                        <div>
                          <div className="font-medium">Active Brokers</div>
                          <div className="text-xs text-gray-500">in All Partners list</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* All Lists and Views */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
                    {searchQuery.trim() !== '' ? "Search Results" : "All Lists"}
                  </h4>
                  <div className="space-y-3">
                    {filteredListsAndViews.map(list => (
                      <div key={list.id} className="space-y-1">
                        <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md mb-1">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <path d="M3 6h18"></path>
                              <path d="M3 12h18"></path>
                              <path d="M3 18h18"></path>
                            </svg>
                            <div className="font-medium text-sm">
                              <span className="text-xs uppercase text-gray-500 mr-1">List:</span> {list.name}
                              {list.type === 'selection' && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                  Custom
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="pl-3 space-y-1 border-l-2 border-indigo-200 ml-2">
                          {list.views.map(view => (
                            <button 
                              key={view.id}
                              className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100"
                              onClick={() => {
                                switchList(list.id);
                                applyView(view.id);
                                setQuickSwitcherOpen(false);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                              <div className="text-sm">
                                <span className="text-xs uppercase text-gray-500 mr-1">View:</span> {view.name}
                              </div>
                              {list.id === activeListId && view.id === activeViewId && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {searchQuery.trim() !== '' && filteredListsAndViews.length === 0 && (
                      <div className="px-3 py-2 text-center text-sm text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">Enter</kbd>
              <span>to select</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Save view modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Save as view</DialogTitle>
            <DialogDescription>
              Save your current filters as a view. You can create multiple views for each list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              {/* View Name */}
              <div className="grid gap-2">
                <Label htmlFor="viewName" className="text-sm font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>View Name</Label>
                <Input 
                  id="viewName" 
                  placeholder="Enter a name for this view"
                  defaultValue={''}
                />
                <div className="grid gap-2">
                  <Label htmlFor="viewDescription" className="text-sm font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>View Description (Optional)</Label>
                  <Textarea 
                    id="viewDescription" 
                    placeholder="Describe what this view shows (e.g., 'Active technology partners in Europe')"
                    rows={2}
                    defaultValue={''}
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
                    <h4 className="text-sm font-medium text-gray-900">Current Filters</h4>
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
                      This view will automatically show partners matching these criteria as data changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex p-3 rounded-lg border border-gray-200 items-center space-x-3 bg-gray-50">
              <Checkbox id="shareView" defaultChecked={true} />
              <div>
                <Label htmlFor="shareView" className="text-sm font-medium">
                  Share this view with my team
                </Label>
                <p className="text-xs text-gray-500">
                  Make this view available to all list members
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-xs text-gray-500">
              Views help organize different filtered perspectives of your data
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
                  
                  if (!viewName.trim()) {
                    toast({
                      title: "Missing required field",
                      description: "Please enter a name for your view.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Create a new view object
                  const newView: View = {
                    id: `view_${Date.now()}`,
                    name: viewName.trim(),
                    description: viewDescription.trim() || undefined,
                    filters: {
                      searchText: filterText || undefined,
                      status: selectedStatus || undefined,
                      industry: selectedIndustry || undefined,
                      type: selectedType || undefined
                    },
                    isShared: isShared,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // Add to the active list's views
                  const updatedLists = lists.map(list => {
                    if (list.id === activeListId) {
                      return {
                        ...list,
                        views: [...list.views, newView],
                        activeViewId: newView.id
                      };
                    }
                    return list;
                  });
                  
                  // Update lists state
                  setLists(updatedLists);
                  
                  // Close modal
                  setShowSaveViewModal(false);
                  
                  // Show confirmation
                  toast({
                    title: "View saved",
                    description: `"${viewName.trim()}" view is now available in your "${activeList.name}" list.`,
                  });
                }}
              >
                Save view
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comparison summary */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Comparison of View Navigation Approaches</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-indigo-600">Tabs Interface</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Pros:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Immediate visibility of all available views</li>
                <li>Familiar UI pattern that users understand</li>
                <li>Good for scenarios with a moderate number of views</li>
                <li>Clear visual indication of the active view</li>
              </ul>
              <p><strong>Cons:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Limited horizontal space for many views</li>
                <li>Filter details not immediately visible</li>
                <li>May require scrolling with many views</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-purple-600">Filter Presets Panel</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Pros:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Shows more information about each view</li>
                <li>Vertical layout accommodates many views</li>
                <li>Filter details visible at a glance</li>
                <li>More visual distinction between views</li>
              </ul>
              <p><strong>Cons:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Takes up more screen space</li>
                <li>Less familiar pattern for some users</li>
                <li>May compete with main content</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-green-600">Combined View/Filter Interface</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Pros:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Integrates directly with existing filter UI</li>
                <li>Space-efficient with dropdown selector</li>
                <li>Filter chips clearly show applied filters</li>
                <li>Most intuitive connection between views and filters</li>
              </ul>
              <p><strong>Cons:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Limited visibility of available views</li>
                <li>Requires an extra click to see all views</li>
                <li>May be less discoverable for new users</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-amber-600">Quick Switcher Menu</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Pros:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Saves screen space - no dedicated UI required</li>
                <li>Global access from anywhere in the interface</li>
                <li>Search capability makes it scalable for many lists/views</li>
                <li>Great for keyboard-driven workflows</li>
                <li>Shows hierarchical relationship clearly</li>
              </ul>
              <p><strong>Cons:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lower discoverability - requires learning a shortcut</li>
                <li>Two-step process to access views</li>
                <li>No visual preview of filter contents</li>
                <li>Not ideal for touch interfaces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}