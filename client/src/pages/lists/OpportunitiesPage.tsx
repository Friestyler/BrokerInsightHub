import { useState } from 'react';
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

// Sample data for opportunities
const mockOpportunities = [
  {
    id: 1,
    title: "Property Insurance Renewal",
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    type: "Renewal",
    status: "In Progress",
    probability: 80,
    value: 125000,
    dueDate: "2025-06-15",
    owner: "Sarah Johnson",
    ownerInitials: "SJ",
    createdAt: "2025-04-15"
  },
  {
    id: 2,
    title: "Cyber Security Coverage",
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    type: "New Business",
    status: "Qualification",
    probability: 40,
    value: 75000,
    dueDate: "2025-07-30",
    owner: "Michael Chen",
    ownerInitials: "MC",
    createdAt: "2025-05-01"
  },
  {
    id: 3,
    title: "D&O Insurance",
    customerId: 2,
    customerName: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    type: "New Business",
    status: "Proposal",
    probability: 60,
    value: 150000,
    dueDate: "2025-06-01",
    owner: "Emma Wilson",
    ownerInitials: "EW",
    createdAt: "2025-04-22"
  },
  {
    id: 4,
    title: "Group Health Insurance",
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    type: "Renewal",
    status: "Negotiation",
    probability: 70,
    value: 225000,
    dueDate: "2025-07-01",
    owner: "Robert Smith",
    ownerInitials: "RS",
    createdAt: "2025-05-05"
  },
  {
    id: 5,
    title: "Workers Compensation",
    customerId: 4,
    customerName: "Umbrella Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    type: "Cross-sell",
    status: "Closed Lost",
    probability: 0,
    value: 80000,
    dueDate: "2025-05-15",
    owner: "Sarah Johnson",
    ownerInitials: "SJ",
    createdAt: "2025-03-15"
  },
  {
    id: 6,
    title: "Professional Liability",
    customerId: 5,
    customerName: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    type: "New Business",
    status: "Closed Won",
    probability: 100,
    value: 95000,
    dueDate: "2025-04-01",
    owner: "John Davis",
    ownerInitials: "JD",
    createdAt: "2025-03-01"
  },
  {
    id: 7,
    title: "Product Liability Insurance",
    customerId: 6,
    customerName: "Wayne Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    type: "New Business",
    status: "Discovery",
    probability: 20,
    value: 110000,
    dueDate: "2025-08-15",
    owner: "Michael Chen",
    ownerInitials: "MC",
    createdAt: "2025-05-10"
  }
];

// Calculate opportunity statistics
function calculateOpportunityStats(opportunities: typeof mockOpportunities) {
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
}

// Main opportunity list component
function OpportunitiesTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // State for saved lists
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    {
      id: '1',
      name: 'High Value Renewals',
      filters: { status: 'In Progress', type: 'Renewal' },
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'New Business Pipeline',
      filters: { type: 'New Business' },
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    },
    {
      id: '3',
      name: 'Acme Corporation Opportunities',
      filters: { customerId: "1" },
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15')
    }
  ]);
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  
  // Filter opportunities based on search text and filter selections
  const displayedOpportunities = mockOpportunities.filter(opportunity => {
    const matchesText = !filterText || 
      opportunity.title.toLowerCase().includes(filterText.toLowerCase()) ||
      opportunity.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
      opportunity.partnerName.toLowerCase().includes(filterText.toLowerCase());
      
    const matchesStatus = !selectedStatus || opportunity.status === selectedStatus;
    const matchesType = !selectedType || opportunity.type === selectedType;
    
    // Handle filters from active list
    const matchesCustomerId = !activeList?.filters.customerId || 
      String(opportunity.customerId) === activeList.filters.customerId;
    const matchesPartnerId = !activeList?.filters.partnerId || 
      String(opportunity.partnerId) === activeList.filters.partnerId;
    
    return matchesText && matchesStatus && matchesType && matchesCustomerId && matchesPartnerId;
  });
  
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
      {/* Unified toolbar with more emphasis on saved lists */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top row with saved lists and action buttons */}
          <div className="flex flex-wrap items-center justify-between">
            {/* Left side - Saved Lists with actions */}
            <div className="flex items-center gap-3">
              {/* Saved Lists dropdown - now more prominent */}
              <div className="relative">
                <button 
                  className={`flex items-center space-x-2 px-4 py-2.5 border-2 rounded-md text-sm font-medium ${activeList ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeList ? 'text-indigo-600' : 'text-gray-500'}>
                    <path d="M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
                  </svg>
                  <span className="max-w-[180px] truncate font-medium">{activeList ? activeList.name : 'Saved Lists'}</span>
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
                
                {/* Saved Lists dropdown menu */}
                {showListsDropdown && (
                  <div className="absolute z-40 mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="text-sm font-medium mb-1">Saved Lists</div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search saved lists..."
                          className="w-full pl-3 pr-10 py-1.5 text-xs border border-gray-300 rounded-md"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {savedLists.map(list => (
                        <button
                          key={list.id}
                          className={`w-full text-left py-2 px-3 hover:bg-gray-50 flex items-center justify-between ${activeList?.id === list.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => {
                            setActiveList(list);
                            if (list.filters.searchText) setFilterText(list.filters.searchText);
                            if (list.filters.status) setSelectedStatus(list.filters.status);
                            if (list.filters.type) setSelectedType(list.filters.type);
                            setShowListsDropdown(false);
                          }}
                        >
                          <div>
                            <div className="font-medium text-sm">{list.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(list.filters)
                                .filter(([_, value]) => value)
                                .map(([key]) => key)
                                .join(', ')}
                            </div>
                          </div>
                          {list.isShared && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                              <circle cx="18" cy="5" r="3"></circle>
                              <circle cx="6" cy="12" r="3"></circle>
                              <circle cx="18" cy="19" r="3"></circle>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-2 border-t">
                      <button
                        className="w-full text-left py-1.5 px-3 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm flex items-center"
                        onClick={() => {
                          setActiveList(null);
                          setFilterText('');
                          setSelectedStatus('');
                          setSelectedType('');
                          setShowSaveListModal(true);
                          setShowListsDropdown(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create New List
                      </button>
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
                    onClick={() => setActiveList(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Clear
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
          
          {/* Bottom row with search and filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              {/* Search field - moved to second row */}
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
              
              {/* Filters - placed alongside search */}
              <div className="flex gap-2 flex-wrap">
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedStatus ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedStatus(selectedStatus ? '' : 'In Progress')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedStatus ? 'text-indigo-500' : 'text-gray-500'}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>Status{selectedStatus ? `: ${selectedStatus}` : ''}</span>
                  {selectedStatus && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedType ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setSelectedType(selectedType ? '' : 'Renewal')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedType ? 'text-indigo-500' : 'text-gray-500'}>
                    <path d="m2 2 20 20"></path>
                    <path d="M5.5 13.5C7 15 9 16 11.5 16"></path>
                    <path d="M11.5 8c2.5 0 4.5 1 6 2.5"></path>
                    <path d="M15.5 13.5c1.5 1.5 3.5 2.5 6 2.5"></path>
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
            
            {/* Clear filters button - only shown when at least one filter is applied */}
            {(filterText || selectedStatus || selectedType) && (
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
                      filters: {
                        searchText: filterText || undefined,
                        status: selectedStatus || undefined,
                        type: selectedType || undefined
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
                          filters: {
                            searchText: filterText || undefined,
                            status: selectedStatus || undefined,
                            type: selectedType || undefined
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
                  {mockOpportunities.reduce((partners, opp) => {
                    if (!partners.some(p => p.id === opp.partnerId)) {
                      partners.push({ id: opp.partnerId, name: opp.partnerName });
                    }
                    return partners;
                  }, [] as { id: number, name: string }[]).map(partner => (
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
                    href={`/lists/opportunities/${opportunity.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {opportunity.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Link 
                    href={`/lists/customers/${opportunity.customerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {opportunity.customerName}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Link 
                    href={`/lists/partners/${opportunity.partnerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {opportunity.partnerName}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{opportunity.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeVariant(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{formatCurrency(opportunity.value)}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {new Date(opportunity.dueDate).toLocaleDateString()}
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Opportunities</h1>
      </div>
      
      <OpportunitiesTable />
    </div>
  );
}