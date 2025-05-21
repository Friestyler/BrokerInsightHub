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
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  
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
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Partners (Views Demo)</h1>
        <p className="text-gray-500">This page demonstrates three different approaches for navigating between views in a list.</p>
      </div>
      
      {/* View style selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">View Style</h2>
        <div className="flex gap-2">
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
              
              {/* List Selector */}
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

              {/* View navigation - Different options based on selected style */}
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
              
              {/* Bottom row with search and filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-grow">
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
                  {/* Save as view button */}
                  {(
                    (filterText || selectedStatus || selectedIndustry || selectedType)
                  ) && (
                    <button 
                      className="flex items-center rounded-md bg-[#EBEEFB] px-4 py-2 hover:bg-[#E3E6F7]"
                      onClick={saveAsView}
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
                
                {/* Clear filters button */}
                {(filterText || selectedStatus || selectedIndustry || selectedType) && (
                  <button 
                    onClick={clearFilters}
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
            
            {/* Partners list */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 flex justify-between items-center">
                <div>
                  {filteredPartners.length} {filteredPartners.length === 1 ? 'partner' : 'partners'} 
                  {activeView ? ` in "${activeView.name}" view` : ''}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPartners([])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21v-2z"></path>
                    </svg>
                    Sort
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredPartners.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={clearFilters}
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredPartners.map(partner => (
                    <div key={partner.id} className="flex items-center p-4 hover:bg-gray-50">
                      <div className="mr-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedPartners.includes(partner.id)}
                          onChange={() => {
                            if (selectedPartners.includes(partner.id)) {
                              setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                            } else {
                              setSelectedPartners([...selectedPartners, partner.id]);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 rounded-md bg-indigo-100 text-indigo-800 mr-4">
                            <AvatarFallback>{partner.initials}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center">
                              <Link href={`/lists/partners/${partner.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                {partner.name}
                              </Link>
                              <Badge className={`ml-2 ${partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {partner.status}
                              </Badge>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                              <span>{partner.industry}</span>
                              <span className="mx-2">•</span>
                              <span>{partner.type}</span>
                              <span className="mx-2">•</span>
                              <span>{partner.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0 sm:ml-6 flex items-center space-x-3">
                          <PartnerTypeBadges industry={partner.industry} type={partner.type} />
                          
                          <div className="flex flex-col items-end text-sm">
                            <div className="text-gray-900 font-medium">{partner.customers} customers</div>
                            <div className="text-gray-500">{partner.opportunities} opportunities</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
                    id: String(Date.now()),
                    name: viewName,
                    description: viewDescription || undefined,
                    filters: {
                      searchText: filterText || undefined,
                      status: selectedStatus || undefined,
                      industry: selectedIndustry || undefined,
                      type: selectedType || undefined
                    },
                    isShared,
                    createdBy: 'John Smith',
                    createdAt: new Date()
                  };
                  
                  // Add the view to the active list and set it as the active view
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
                  
                  // Update the lists state
                  setLists(updatedLists);
                  
                  // Show success message
                  toast({
                    title: "View saved",
                    description: `"${viewName}" has been saved to the "${activeList.name}" list and will show partners matching your criteria.`,
                  });
                  
                  // Close the modal
                  setShowSaveViewModal(false);
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
        
        <div className="grid md:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}