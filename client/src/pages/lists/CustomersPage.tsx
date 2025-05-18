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

// Sample data for partners (for reference in customer data)
const mockPartners = [
  {
    id: 1,
    name: "ABC Insurance Brokers",
    initials: "AB",
    industry: "Insurance",
    type: "Broker"
  },
  {
    id: 2,
    name: "XYZ Consulting Group",
    initials: "XY",
    industry: "Consulting",
    type: "Agent"
  },
  {
    id: 3,
    name: "Global Risk Partners",
    initials: "GR",
    industry: "Insurance",
    type: "Broker"
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    initials: "PI",
    industry: "Insurance",
    type: "Agency"
  },
];

// Sample data for customer entities - tied to specific partners
const mockCustomers = [
  {
    id: 1,
    name: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    industry: "Manufacturing",
    size: "enterprise",
    status: "active",
    products: 5,
    opportunities: 2,
    initials: "AC",
    lastContact: "2025-05-01",
    annualRevenue: "$25M-$50M",
    location: "New York, NY"
  },
  {
    id: 2,
    name: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    industry: "Technology",
    size: "large",
    status: "active",
    products: 3,
    opportunities: 1,
    initials: "GI",
    lastContact: "2025-05-10",
    annualRevenue: "$100M-$250M",
    location: "San Francisco, CA"
  },
  {
    id: 3,
    name: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    industry: "Energy",
    size: "enterprise",
    status: "active",
    products: 8,
    opportunities: 3,
    initials: "SE",
    lastContact: "2025-04-22",
    annualRevenue: "$500M+",
    location: "Chicago, IL"
  },
  {
    id: 4,
    name: "Umbrella Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    industry: "Pharmaceuticals",
    size: "large",
    status: "inactive",
    products: 2,
    opportunities: 0,
    initials: "UC",
    lastContact: "2024-12-15",
    annualRevenue: "$50M-$100M",
    location: "Boston, MA"
  },
  {
    id: 5,
    name: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    industry: "Transportation",
    size: "medium",
    status: "active",
    products: 4,
    opportunities: 1,
    initials: "OA",
    lastContact: "2025-05-08",
    annualRevenue: "$25M-$50M",
    location: "Miami, FL"
  },
  {
    id: 6,
    name: "Wayne Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    industry: "Manufacturing",
    size: "enterprise",
    status: "active",
    products: 6,
    opportunities: 2,
    initials: "WE",
    lastContact: "2025-05-12",
    annualRevenue: "$500M+",
    location: "Gotham City, NY"
  },
  {
    id: 7,
    name: "LexCorp",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    industry: "Technology",
    size: "large",
    status: "active",
    products: 4,
    opportunities: 2,
    initials: "LC",
    lastContact: "2025-04-30",
    annualRevenue: "$100M-$250M",
    location: "Metropolis, IL"
  },
  {
    id: 8,
    name: "Cyberdyne Systems",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    industry: "Technology",
    size: "medium",
    status: "active",
    products: 3,
    opportunities: 1,
    initials: "CS",
    lastContact: "2025-05-15",
    annualRevenue: "$25M-$50M",
    location: "Los Angeles, CA"
  },
];

// Sample data for opportunities - tied to specific customers and partners
const mockOpportunities = [
  {
    id: 1,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    title: "Property Insurance Renewal",
    type: "Renewal",
    status: "In Progress",
    probability: 80,
    value: 125000,
    dueDate: "2025-06-15"
  },
  {
    id: 2,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    title: "Cyber Security Coverage",
    type: "New Business",
    status: "Qualification",
    probability: 40,
    value: 75000,
    dueDate: "2025-07-30"
  },
  {
    id: 3,
    customerId: 2,
    customerName: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    title: "D&O Insurance",
    type: "New Business",
    status: "Proposal",
    probability: 60,
    value: 150000,
    dueDate: "2025-06-01"
  },
  {
    id: 4,
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    title: "Fleet Insurance",
    type: "Renewal",
    status: "Negotiation",
    probability: 90,
    value: 320000,
    dueDate: "2025-05-30"
  },
  {
    id: 5,
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    title: "Liability Coverage Expansion",
    type: "Expansion",
    status: "In Progress",
    probability: 75,
    value: 180000,
    dueDate: "2025-07-15"
  },
  {
    id: 6,
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    title: "Workers Compensation",
    type: "Renewal",
    status: "Qualification",
    probability: 50,
    value: 95000,
    dueDate: "2025-08-01"
  },
  {
    id: 7,
    customerId: 5,
    customerName: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    title: "Aviation Insurance",
    type: "New Business",
    status: "Proposal",
    probability: 65,
    value: 500000,
    dueDate: "2025-06-20"
  },
  {
    id: 8,
    customerId: 7,
    customerName: "LexCorp",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    title: "Research Lab Coverage",
    type: "New Business",
    status: "In Progress",
    probability: 70,
    value: 250000,
    dueDate: "2025-07-10"
  },
  {
    id: 9,
    customerId: 7,
    customerName: "LexCorp",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    title: "Executive Protection",
    type: "New Business",
    status: "Qualification",
    probability: 30,
    value: 80000,
    dueDate: "2025-08-15"
  },
  {
    id: 10,
    customerId: 8,
    customerName: "Cyberdyne Systems",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    title: "Product Liability",
    type: "New Business",
    status: "Proposal",
    probability: 60,
    value: 175000,
    dueDate: "2025-06-25"
  },
];

// Calculate customer statistics
function calculateCustomerStats(customers: typeof mockCustomers) {
  const totalCustomers = customers.length;
  const totalProducts = customers.reduce((sum, customer) => sum + customer.products, 0);
  const totalOpportunities = customers.reduce((sum, customer) => sum + customer.opportunities, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  
  return {
    totalCustomers,
    totalProducts,
    totalOpportunities,
    activeCustomers
  };
}

// Template badges component for customers
function TemplateBadges({ industry, size }: { industry: string, size: string }) {
  // Mock template badges based on industry and size
  const getBadges = (industry: string, size: string) => {
    if (industry === 'Manufacturing') {
      return [
        { code: 'RP', color: 'bg-blue-200 text-blue-800' },
        { code: 'CO', color: 'bg-purple-200 text-purple-800' }
      ];
    } else if (industry === 'Technology') {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (industry === 'Energy') {
      return [
        { code: 'AC', color: 'bg-teal-200 text-teal-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (industry === 'Transportation') {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' }
      ];
    } else {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    }
  };
  
  const badges = getBadges(industry, size);
  
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
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    size?: string;
    partnerId?: string;
  };
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
}

// Table view for customers
function CustomersTable({ partnerId }: { partnerId?: number }) {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // State for saved views
  const [savedViews, setSavedViews] = useState<SavedView[]>([
    {
      id: '1',
      name: 'Active Manufacturing Clients',
      filters: { status: 'active', industry: 'Manufacturing' },
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'Tech Companies',
      filters: { industry: 'Technology' },
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    },
    {
      id: '3',
      name: 'ABC Insurance Brokers Customers',
      filters: { partnerId: "1" },
      isShared: true,
      sharedWith: ['team@abc-insurance.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-15')
    },
    {
      id: '4',
      name: 'Inactive Customers',
      filters: { status: 'inactive' },
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-11')
    }
  ]);
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showShareViewModal, setShowShareViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  
  // Apply filtering based on the partnerId if provided
  const filteredCustomers = partnerId
    ? mockCustomers.filter(customer => customer.partnerId === partnerId)
    : mockCustomers;
    
  // Filter customers based on search text and filter selections
  const displayedCustomers = filteredCustomers.filter(customer => {
    const matchesText = !filterText || 
      customer.name.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.industry.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.partnerName.toLowerCase().includes(filterText.toLowerCase());
      
    const matchesStatus = !selectedStatus || customer.status === selectedStatus;
    const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
    const matchesSize = !selectedSize || customer.size === selectedSize;
    
    return matchesText && matchesStatus && matchesIndustry && matchesSize;
  });
  
  // Calculate stats based on filtered customers
  const stats = calculateCustomerStats(displayedCustomers);
  
  // Function to toggle customer selection
  const toggleSelectCustomer = (id: number) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(customerId => customerId !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };
  
  // Function to toggle select/deselect all customers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === displayedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(displayedCustomers.map(customer => customer.id));
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Saved Views dropdown */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <div className="relative">
          <button 
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
            onClick={() => setShowViewsDropdown(!showViewsDropdown)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M2 7V1h20v6"></path>
              <path d="M11 9h10v6H11z"></path>
              <path d="M2 9h6v6H2z"></path>
              <path d="M2 23v-6h20v6"></path>
            </svg>
            <span>{activeView ? activeView.name : 'Saved Lists'}</span>
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
          
          {/* Saved Lists dropdown menu */}
          {showViewsDropdown && (
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
                {savedViews.map(view => (
                  <button
                    key={view.id}
                    className={`w-full text-left py-2 px-3 hover:bg-gray-50 flex items-center justify-between ${activeView?.id === view.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => {
                      setActiveView(view);
                      if (view.filters.searchText) setFilterText(view.filters.searchText);
                      if (view.filters.status) setSelectedStatus(view.filters.status);
                      if (view.filters.industry) setSelectedIndustry(view.filters.industry);
                      if (view.filters.size) setSelectedSize(view.filters.size);
                      setShowViewsDropdown(false);
                    }}
                  >
                    <div>
                      <div className="font-medium text-sm">{view.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {Object.entries(view.filters)
                          .filter(([_, value]) => value)
                          .map(([key]) => key)
                          .join(', ')}
                      </div>
                    </div>
                    {view.isShared && (
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
                    setActiveView(null);
                    setFilterText('');
                    setSelectedStatus('');
                    setSelectedIndustry('');
                    setSelectedSize('');
                    setShowSaveViewModal(true);
                    setShowViewsDropdown(false);
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
        
        {activeView && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-600"
              onClick={() => setShowShareViewModal(true)}
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
              className="text-gray-600"
              onClick={() => setActiveView(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear View
            </Button>
          </div>
        )}
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
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
        
        <div className="relative">
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
        </div>
        
        <div className="relative">
          <button 
            className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedIndustry ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
            onClick={() => setSelectedIndustry(selectedIndustry ? '' : 'Manufacturing')}
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
        </div>
        
        <div className="flex items-center ml-auto">
          {/* Save List button - only shown when filters are applied or when editing existing list */}
          {(filterText || selectedStatus || selectedIndustry || selectedSize || activeView) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 text-indigo-600"
              onClick={() => setShowSaveViewModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {activeView ? 'Update List' : 'Save List'}
            </Button>
          )}
          
          <Button variant="outline" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Import/Export
          </Button>
          
          <Button size="sm" className="flex items-center bg-indigo-600 hover:bg-indigo-700 ml-2">
            <span className="mr-1 text-lg">+</span>
            New Customer
          </Button>
        </div>
      </div>
      
      {/* Statistics overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.activeCustomers}</div>
          <div className="text-sm text-gray-500">Active Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalProducts}</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
      </div>
      
      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeView ? 'Update Saved List' : 'Save Current List'}</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a list that you can easily access later.
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
                placeholder="Add a short description to help others understand this view"
                rows={3}
                defaultValue={activeView?.description || ''}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="shareView" defaultChecked={activeView?.isShared || false} />
              <Label htmlFor="shareView" className="text-sm font-normal">
                Share this view with collaborators
              </Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-xs text-gray-500">
              {activeView ? 'Last updated on ' + new Date(activeView.createdAt).toLocaleDateString() : 'Applied filters will be saved with this view'}
            </div>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  // Handle save/update view
                  if (!activeView) {
                    // Create new view
                    const viewName = (document.getElementById('viewName') as HTMLInputElement).value;
                    const viewDescription = (document.getElementById('viewDescription') as HTMLTextAreaElement).value;
                    const isShared = (document.getElementById('shareView') as HTMLInputElement).checked;
                    
                    const newView: SavedView = {
                      id: String(Date.now()),
                      name: viewName,
                      description: viewDescription || undefined,
                      filters: {
                        searchText: filterText || undefined,
                        status: selectedStatus || undefined,
                        industry: selectedIndustry || undefined,
                        size: selectedSize || undefined
                      },
                      isShared,
                      createdBy: 'John Smith',
                      createdAt: new Date()
                    };
                    
                    setSavedViews([...savedViews, newView]);
                    setActiveView(newView);
                  } else {
                    // Update existing view
                    const viewName = (document.getElementById('viewName') as HTMLInputElement).value;
                    const viewDescription = (document.getElementById('viewDescription') as HTMLTextAreaElement).value;
                    const isShared = (document.getElementById('shareView') as HTMLInputElement).checked;
                    
                    const updatedViews = savedViews.map(view => {
                      if (view.id === activeView.id) {
                        return {
                          ...view,
                          name: viewName,
                          description: viewDescription || undefined,
                          filters: {
                            searchText: filterText || undefined,
                            status: selectedStatus || undefined,
                            industry: selectedIndustry || undefined,
                            size: selectedSize || undefined
                          },
                          isShared
                        };
                      }
                      return view;
                    });
                    
                    setSavedViews(updatedViews);
                    setActiveView(updatedViews.find(v => v.id === activeView.id) || null);
                  }
                  
                  setShowSaveViewModal(false);
                }}
              >
                {activeView ? 'Update View' : 'Save View'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share List Modal with Extended Options */}
      <Dialog open={showShareViewModal} onOpenChange={setShowShareViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share List: {activeView?.name}</DialogTitle>
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
                  value={`https://qollabi.com/share/list/${activeView?.id}`}
                  readOnly
                  className="text-xs"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://qollabi.com/share/list/${activeView?.id}`);
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
              
              // Update the active view's sharing settings
              if (activeView) {
                const updatedViews = savedViews.map(view => {
                  if (view.id === activeView.id) {
                    return {
                      ...view,
                      isShared: true,
                      sharedWith: recipientEmails
                    };
                  }
                  return view;
                });
                
                setSavedViews(updatedViews);
                setActiveView(updatedViews.find(v => v.id === activeView.id) || null);
              }
              
              setShowShareViewModal(false);
            }}>
              Share List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Table section without a border */}
      <div className="bg-white overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={selectedCustomers.length === displayedCustomers.length && displayedCustomers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
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
                  Industry
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
                  Products
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
            {displayedCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className={`hover:bg-gray-50 group ${selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${selectedCustomers.includes(customer.id) ? 'visible' : 'invisible group-hover:visible'}`}
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleSelectCustomer(customer.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                      <AvatarFallback>{customer.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Link 
                    href={`/lists/customers?partnerId=${customer.partnerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {customer.partnerName}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{customer.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {customer.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.products}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.opportunities}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges industry={customer.industry} size={customer.size} />
                </td>
              </tr>
            ))}
            
            {displayedCustomers.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-3">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No customers found</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      {partnerId 
                        ? `There are no customers associated with this partner that match your filter criteria.` 
                        : `There are no customers matching your filter criteria.`}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setFilterText('');
                        setSelectedStatus('');
                        setSelectedIndustry('');
                        setSelectedSize('');
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

// Card view for customers list
function CustomersCardView({ partnerId }: { partnerId?: number }) {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  // Apply filtering based on the partnerId if provided
  const filteredCustomers = partnerId
    ? mockCustomers.filter(customer => customer.partnerId === partnerId)
    : mockCustomers;
    
  // Filter customers based on search text and filter selections
  const displayedCustomers = filteredCustomers.filter(customer => {
    const matchesText = !filterText || 
      customer.name.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.industry.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.partnerName.toLowerCase().includes(filterText.toLowerCase());
      
    const matchesStatus = !selectedStatus || customer.status === selectedStatus;
    const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
    const matchesSize = !selectedSize || customer.size === selectedSize;
    
    return matchesText && matchesStatus && matchesIndustry && matchesSize;
  });
  
  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        
        <div className="relative">
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
        </div>
        
        <div className="relative">
          <button 
            className={`flex items-center space-x-1 px-3 py-2 border rounded-md text-sm ${selectedIndustry ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
            onClick={() => setSelectedIndustry(selectedIndustry ? '' : 'Technology')}
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCustomers.map((customer) => (
          <Card key={customer.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <Avatar className="h-10 w-10 mr-3 bg-indigo-100 text-indigo-600">
                    <AvatarFallback>{customer.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-xs text-gray-500">{customer.industry}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 p-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-500">Partner</div>
                  <div className="text-right">
                    <Link 
                      href={`/lists/customers?partnerId=${customer.partnerId}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {customer.partnerName}
                    </Link>
                  </div>
                  
                  <div className="text-gray-500">Status</div>
                  <div className="text-right">
                    <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize">{customer.status}</Badge>
                  </div>
                  
                  <div className="text-gray-500">Size</div>
                  <div className="text-right capitalize">{customer.size}</div>
                  
                  <div className="text-gray-500">Products</div>
                  <div className="text-right">{customer.products}</div>
                  
                  <div className="text-gray-500">Opportunities</div>
                  <div className="text-right">{customer.opportunities}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 border-t border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <TemplateBadges industry={customer.industry} size={customer.size} />
                </div>
                
                <Link href={`/lists/customers/${customer.id}`}>
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {displayedCustomers.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              {partnerId 
                ? `There are no customers associated with this partner that match your filter criteria.` 
                : `There are no customers matching your filter criteria.`}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setFilterText('');
                setSelectedStatus('');
                setSelectedIndustry('');
                setSelectedSize('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { environment } = useEnvironment();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  // Get URL search parameters - extract partnerId if present
  // Format example: /lists/customers?partnerId=1
  const [path, searchParam] = useLocation();
  const searchParams = new URLSearchParams(searchParam || "");
  const partnerId = searchParams.get('partnerId') ? Number(searchParams.get('partnerId')) : undefined;
  
  // Get the partner name if partnerId is provided
  const partnerName = partnerId 
    ? mockPartners.find(p => p.id === partnerId)?.name 
    : undefined;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          {partnerId 
            ? `${partnerName || 'Partner'} Customers` 
            : "Customers"}
        </h1>
        
        {/* View switcher */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewType('table')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              viewType === 'table' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            Table
          </button>
          
          <button
            onClick={() => setViewType('cards')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              viewType === 'cards' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Cards
          </button>
        </div>
      </div>
      
      {/* Partner filter indicator */}
      {partnerId && (
        <div className="mb-4">
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md">
            <span className="mr-2">Filtered by Partner: {partnerName}</span>
            <Link href="/lists/customers">
              <button className="text-indigo-500 hover:text-indigo-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </Link>
          </div>
        </div>
      )}
      
      {viewType === 'table' ? <CustomersTable partnerId={partnerId} /> : <CustomersCardView partnerId={partnerId} />}
    </div>
  );
}