import { useState } from 'react';
import ListLayout from "@/components/lists/ListLayout";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

// Sample data for opportunity entities
const mockOpportunities = [
  {
    id: 1,
    title: "Commercial Property Insurance",
    description: "Cross-sell commercial property coverage to supplement existing liability policy",
    status: "open",
    owner: "John Smith",
    ownerId: 1,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    productMissing: "Commercial Property Insurance",
    estimatedValue: 12500,
    probability: 75,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 4, 10),
    source: "campaign",
    tags: ["commercial", "property", "high-priority"],
  },
  {
    id: 2,
    title: "Fleet Vehicle Coverage",
    description: "Add coverage for the newly acquired delivery fleet",
    status: "in_progress",
    owner: "Sarah Johnson",
    ownerId: 2,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    productMissing: "Commercial Auto Insurance",
    estimatedValue: 8750,
    probability: 60,
    createdAt: new Date(2025, 4, 2),
    updatedAt: new Date(2025, 4, 12),
    source: "manual",
    tags: ["auto", "fleet", "expansion"],
  },
  {
    id: 3,
    title: "Directors & Officers Insurance",
    description: "D&O coverage for newly appointed board members",
    status: "won",
    owner: "Michael Lee",
    ownerId: 3,
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    productMissing: "Directors & Officers Insurance",
    estimatedValue: 18000,
    probability: 100,
    createdAt: new Date(2025, 2, 20),
    updatedAt: new Date(2025, 4, 5),
    source: "wizard",
    tags: ["liability", "executive", "governance"],
  },
  {
    id: 4,
    title: "Cyber Security Insurance",
    description: "Protection against growing cyber threats in the technology sector",
    status: "lost",
    owner: "Emily Chen",
    ownerId: 4,
    customerId: 2,
    customerName: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    productMissing: "Cyber Security Insurance",
    estimatedValue: 22000,
    probability: 0,
    createdAt: new Date(2025, 1, 15),
    updatedAt: new Date(2025, 3, 25),
    source: "campaign",
    tags: ["cyber", "technology", "digital-risk"],
  },
  {
    id: 5,
    title: "Business Interruption Coverage",
    description: "Coverage for potential business disruptions",
    status: "open",
    owner: "James Wilson",
    ownerId: 5,
    customerId: 5,
    customerName: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    productMissing: "Business Interruption Insurance",
    estimatedValue: 15000,
    probability: 40,
    createdAt: new Date(2025, 4, 1),
    updatedAt: new Date(2025, 4, 1),
    source: "manual",
    tags: ["continuity", "operations", "disaster-recovery"],
  },
];

// Get the appropriate badge color for opportunity status
function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
    case 'won':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Won</Badge>;
    case 'lost':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Lost</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Format currency values
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Calculate opportunity statistics
function calculateOpportunityStats(opportunities: typeof mockOpportunities) {
  const openOpportunities = opportunities.filter(o => o.status === 'open' || o.status === 'in_progress');
  const wonOpportunities = opportunities.filter(o => o.status === 'won');
  
  // Total values
  const newBusinessValue = openOpportunities
    .filter(o => o.tags.includes('new-business'))
    .reduce((sum, o) => sum + o.estimatedValue * (o.probability / 100), 0);
  
  const currentPageValue = openOpportunities
    .reduce((sum, o) => sum + o.estimatedValue, 0);
  
  const renewalsValue = wonOpportunities
    .filter(o => o.tags.includes('renewal'))
    .reduce((sum, o) => sum + o.estimatedValue, 0);
  
  const upsellCount = openOpportunities.length;
  
  return {
    newBusinessValue,
    currentPageValue,
    renewalsValue,
    upsellCount
  };
}

// Table view for opportunities
function OpportunitiesTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Calculate stats
  const stats = calculateOpportunityStats(mockOpportunities);
  
  // Function to toggle opportunity selection
  const toggleSelectOpportunity = (id: number) => {
    if (selectedOpportunities.includes(id)) {
      setSelectedOpportunities(selectedOpportunities.filter(oppId => oppId !== id));
    } else {
      setSelectedOpportunities([...selectedOpportunities, id]);
    }
  };
  
  // Function to select/deselect all opportunities
  const toggleSelectAll = () => {
    if (selectedOpportunities.length === mockOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(mockOpportunities.map(opp => opp.id));
    }
  };
  
  // Owner avatar component
  const OwnerAvatar = ({ owner }: { owner: string }) => {
    // Mock profile pictures for specific owners
    const profilePics: Record<string, string | null> = {
      'John Smith': null,
      'Sarah Johnson': null,
      'Michael Lee': null,
      'Emily Chen': null,
      'James Wilson': null
    };
    
    // Get initials from owner name
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    };
    
    // Different avatar background colors based on owner
    const getAvatarColor = (name: string) => {
      const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-green-500',
        'bg-indigo-500',
        'bg-teal-500'
      ];
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    // If owner has a profile pic, show it, otherwise show initials
    const avatarImg = profilePics[owner];
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${avatarImg ? '' : getAvatarColor(owner)}`}>
        {avatarImg ? (
          <img src={avatarImg} alt={owner} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{getInitials(owner)}</span>
        )}
      </div>
    );
  };
  
  // Template badges component
  const TemplateBadges = ({ type }: { type: string }) => {
    // Mock template badges based on type
    const getBadges = (type: string) => {
      if (type === 'Commercial Property Insurance') {
        return [
          { code: 'RP', color: 'bg-blue-100 text-blue-600' },
          { code: 'CO', color: 'bg-purple-100 text-purple-600' }
        ];
      } else if (type === 'Directors & Officers Insurance') {
        return [
          { code: 'CO', color: 'bg-purple-100 text-purple-600' }
        ];
      } else if (type === 'Cyber Security Insurance') {
        return [
          { code: 'AC', color: 'bg-teal-100 text-teal-600' }
        ];
      } else if (type === 'Business Interruption Insurance') {
        return [
          { code: 'RP', color: 'bg-blue-100 text-blue-600' },
          { code: 'CO', color: 'bg-purple-100 text-purple-600' }
        ];
      } else {
        return [
          { code: 'CO', color: 'bg-purple-100 text-purple-600' },
          { code: 'RP', color: 'bg-blue-100 text-blue-600' }
        ];
      }
    };
    
    const badges = getBadges(type);
    
    return (
      <div className="flex space-x-1">
        {badges.map((badge, index) => (
          <div key={index} className={`${badge.color} w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium`}>
            {badge.code}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Header with title and dropdown */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Open Opportunities</h2>
          <button className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-60">
          <input
            type="text"
            placeholder="Search by name, customer..."
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
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            onClick={() => setSelectedStage(selectedStage ? '' : 'open')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Stage</span>
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            onClick={() => setSelectedOwner(selectedOwner ? '' : 'me')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Owner</span>
          </button>
        </div>
        
        <button 
          className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          <span>More filters</span>
        </button>
        
        <div className="ml-auto flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Import/Export
          </Button>
          
          <Button size="sm" className="flex items-center bg-indigo-600 hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add opportunity
          </Button>
        </div>
      </div>
      
      {/* Statistics overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">€154,569,000</div>
          <div className="text-sm text-gray-500">Total Value New Business in Partner Ecosystem</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">€{stats.currentPageValue.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Value Opportunities on this page</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.upsellCount}</div>
          <div className="text-sm text-gray-500"># Upsell Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">€546,250,345</div>
          <div className="text-sm text-gray-500">Total Value Renewals</div>
        </div>
      </div>
      
      {/* Table section without a border */}
      <div className="bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={selectedOpportunities.length === mockOpportunities.length && mockOpportunities.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Name
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
                  Amount
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Prob.
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Stage
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Closing date
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 rotate-180">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Plans
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
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Owner
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockOpportunities.map((opportunity) => (
              <tr 
                key={opportunity.id} 
                className={`hover:bg-gray-50 group ${selectedOpportunities.includes(opportunity.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedOpportunities.includes(opportunity.id)}
                    onChange={() => toggleSelectOpportunity(opportunity.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  {opportunity.title}
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
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {formatCurrency(opportunity.estimatedValue)}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {opportunity.probability}%
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {getStatusBadge(opportunity.status)}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {format(opportunity.updatedAt, 'dd.MM.yyyy')}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  {opportunity.productMissing}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges type={opportunity.productMissing} />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <OwnerAvatar owner={opportunity.owner} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <a href="#" className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</a>
          <a href="#" className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">0</span> of <span className="font-medium">250</span> item(s) selected
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-700">
                Items per page: 
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="ml-1 rounded border-gray-300 text-indigo-600 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">1</span> of <span className="font-medium">25</span>
              </p>
            </div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">First</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                2
              </a>
              <a
                href="#"
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                ...
              </span>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                24
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                25
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Last</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card view for opportunities
function OpportunitiesCardView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockOpportunities.map((opportunity) => (
        <Card key={opportunity.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                {getStatusBadge(opportunity.status)}
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Customer</div>
                  <Link 
                    href={`/lists/customers/${opportunity.customerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    {opportunity.customerName}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Partner</div>
                  <Link 
                    href={`/lists/partners/${opportunity.partnerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    {opportunity.partnerName}
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Est. Value</div>
                  <div className="font-semibold">{formatCurrency(opportunity.estimatedValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Probability</div>
                  <div className="flex items-center">
                    <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          opportunity.probability >= 70 ? 'bg-green-500' : 
                          opportunity.probability >= 40 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${opportunity.probability}%` }}
                      ></div>
                    </div>
                    <span>{opportunity.probability}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {opportunity.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                Created {format(opportunity.createdAt, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="border-t p-3 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lists/opportunities/${opportunity.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OpportunitiesPage() {
  const { environment } = useEnvironment();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  // We're using our custom table view now instead of the ListLayout's built-in view options
  return (
    <div className="container mx-auto px-4 py-6">
      <OpportunitiesTable />
    </div>
  );
}