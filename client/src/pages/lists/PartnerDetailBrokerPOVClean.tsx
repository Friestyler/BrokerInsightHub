import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Menu } from "lucide-react";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";

// Broker View Layout Component
function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-16 md:w-64"} bg-gray-50 flex flex-col h-full overflow-hidden transition-all duration-300 relative`}>
        
        {/* Qollabi Logo */}
        <div className="pt-4 px-4 pb-1 flex justify-center md:justify-start flex-shrink-0">
          <div className={`${sidebarCollapsed ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center`}>
            <div className="w-10 h-10 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 hidden md:flex items-center">
              <span className="text-lg font-semibold text-gray-900">Qollabi</span>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto px-2 pt-4">
          {/* Broker Copilot - disabled */}
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-400 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 3h4" />
            </svg>
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm font-medium hidden md:inline-block">Broker Copilot</span>
            )}
          </div>

          {/* Data section header */}
          <div className="flex items-center justify-between px-4 py-2 mt-4">
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:inline-block">Data</span>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => setDataMenuOpen(!dataMenuOpen)}
                className="p-1 rounded hover:bg-gray-200 hidden md:block"
              >
                <svg className={`w-3 h-3 transform transition-transform ${dataMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Data menu items */}
          {(dataMenuOpen || sidebarCollapsed) && (
            <div className="space-y-1 px-2">
              {/* Partners - current page */}
              <Link href="/partners">
                <div className="flex items-center py-2 px-3 rounded-md bg-indigo-100 text-indigo-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm hidden md:inline-block">Partners</span>
                  )}
                </div>
              </Link>

              {/* Opportunities */}
              <Link href="/lists/opportunities">
                <div className="flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm hidden md:inline-block">Opportunities</span>
                  )}
                </div>
              </Link>

              {/* Customers */}
              <Link href="/lists/customers">
                <div className="flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm hidden md:inline-block">Customers</span>
                  )}
                </div>
              </Link>

              {/* Products */}
              <Link href="/lists/products">
                <div className="flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm hidden md:inline-block">Products</span>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom area */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JS</span>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-gray-900">John Smith</p>
                <p className="text-xs text-gray-500">Regional Insurance Partners</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-4 md:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">De Goudse Partnership</h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailBrokerPOV() {
  const { partnerId } = useParams<{ partnerId: string }>();
  
  // Get URL parameters for tab and list selection
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const listParam = urlParams.get('list');
  
  const [activeTab, setActiveTab] = useState(tabParam || "okr-plans");
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");

  // Opportunities toolbar state management
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeOpportunitiesList, setActiveOpportunitiesList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOpportunityType, setSelectedOpportunityType] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For broker view, show De Goudse as the sharing partner
  const partner = {
    id: 'degoudse',
    name: 'De Goudse',
    description: 'Insurance company that shared this list with Regional Insurance Partners',
    primary_contact: 'Partnership Manager',
    contact_email: 'partnerships@degoudse.nl',
    location: 'Netherlands',
    phone: '+31 20 123 4567'
  };

  // For Regional Insurance Partners in broker view, show opportunities associated with this partner
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/partners/4/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/partners/4/opportunities'),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch saved lists for opportunities including partner-specific ones
  const { data: savedListsData } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', 'opportunities', 'partner', '4'],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-lists?entity_type=opportunities&partner_id=4'),
    staleTime: 0, // Always refresh to get latest data
    refetchOnWindowFocus: true,
  });

  // Filter lists to only show those shared with this broker
  const partnerRelevantLists = (savedListsData || []).filter((list: any) => {
    if (list.is_shared === true) {
      console.log(`Broker has access to shared list: ${list.name} (ID: ${list.id})`);
      return true;
    } else {
      console.log(`Broker denied access to private list: ${list.name} (ID: ${list.id})`);
      return false;
    }
  });

  // Set active list based on URL parameter
  useEffect(() => {
    if (listParam && savedListsData) {
      const targetList = savedListsData.find((list: any) => list.id === parseInt(listParam));
      if (targetList) {
        setActiveOpportunitiesList(targetList);
      }
    } else {
      setActiveOpportunitiesList(null);
    }
  }, [listParam, savedListsData]);

  // Filter opportunities based on the active list
  const getActiveListForFiltering = () => {
    if (listParam && savedListsData) {
      const freshList = savedListsData.find((list: any) => list.id === parseInt(listParam));
      return freshList;
    }
    return activeOpportunitiesList;
  };

  const activeFilterList = getActiveListForFiltering();

  const baseOpportunities = allOpportunities.filter((opp: any) => {
    if (activeFilterList) {
      // Check if list has specific members (opportunity IDs)
      if (activeFilterList.members && activeFilterList.members.length > 0) {
        const isIncluded = activeFilterList.members.includes(opp.id);
        return isIncluded;
      }
      
      // If no specific members, apply list filters
      if (activeFilterList.filters) {
        const filters = typeof activeFilterList.filters === 'string' 
          ? JSON.parse(activeFilterList.filters) 
          : activeFilterList.filters;
          
        // Apply search text filter
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          const matchesSearch = 
            opp.title?.toLowerCase().includes(searchLower) ||
            opp.customer_names?.toLowerCase().includes(searchLower) ||
            opp.stage?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        
        // Apply status filter
        if (filters.status && opp.stage !== filters.status) {
          return false;
        }
        
        // Apply type filter
        if (filters.type && opp.type !== filters.type) {
          return false;
        }
      }
    }
    return true;
  });

  // Further filter opportunities based on search and selected filters
  const filteredOpportunities = baseOpportunities.filter((opportunity: any) => {
    // Filter by search text
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.clientName?.toLowerCase().includes(searchLower) ||
        opportunity.stage?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Filter by status if selected
    if (selectedStatus && selectedStatus !== 'all' && opportunity.stage !== selectedStatus) {
      return false;
    }
    
    // Filter by opportunity type if selected
    if (selectedOpportunityType && selectedOpportunityType !== 'all' && opportunity.type !== selectedOpportunityType) {
      return false;
    }
    
    return true;
  });

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch OKR tags for filtering
  const { data: tags = [] } = useQuery({
    queryKey: ['/api/degoudse/okr-tags'],
    queryFn: () => apiRequest('GET', '/api/degoudse/okr-tags'),
  });

  // Mock OKR metrics for De Goudse since this is broker view
  const okrMetrics = [
    {
      id: 1,
      name: 'Customer Satisfaction Score',
      description: 'Track customer satisfaction ratings',
      unit: 'percentage',
      target_value: 85,
      current_value: 78,
      tag: 'Customer Satisfaction'
    },
    {
      id: 2,
      name: 'Premium Revenue Growth',
      description: 'Quarterly premium revenue growth rate',
      unit: 'percentage',
      target_value: 15,
      current_value: 12,
      tag: 'Financial Performance'
    }
  ];

  // Filter metrics based on search term and selected tag/unit
  const filteredMetrics = okrMetrics.filter((metric) => {
    const matchesSearch = searchTerm === "" || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || metric.tag === selectedTag;
    const matchesUnit = selectedUnit === "all" || metric.unit === selectedUnit;

    return matchesSearch && matchesTag && matchesUnit;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <BrokerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/partners">
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Partners
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
              <p className="text-gray-600">{partner.description}</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("okr-plans")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "okr-plans"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              OKR Plans
            </button>
            <button
              onClick={() => handleTabChange("opportunities")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Opportunities ({filteredOpportunities.length})
            </button>
            <button
              onClick={() => handleTabChange("activity")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "activity"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === "okr-plans" && (
          <div>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search OKR metrics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {tags.map((tag: any) => (
                      <SelectItem key={tag.id} value={tag.name}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* OKR Metrics Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Tag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics.map((metric) => {
                    const progress = metric.target_value > 0 ? (metric.current_value / metric.target_value) * 100 : 0;
                    const progressColor = progress >= 90 ? 'bg-green-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-red-500';
                    
                    return (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell className="text-gray-600">{metric.description}</TableCell>
                        <TableCell>
                          {metric.target_value}
                          {metric.unit === 'percentage' && '%'}
                          {metric.unit === 'currency' && ' €'}
                        </TableCell>
                        <TableCell>
                          {metric.current_value}
                          {metric.unit === 'percentage' && '%'}
                          {metric.unit === 'currency' && ' €'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${progressColor}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 min-w-12">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {metric.tag}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No OKR metrics found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            {/* Opportunities toolbar */}
            <div className="mb-6">
              {/* Top row with list selector and actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Shared Lists dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium ${activeOpportunitiesList ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                      onClick={() => setShowListsDropdown(!showListsDropdown)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeOpportunitiesList ? 'text-indigo-600' : 'text-gray-500'}>
                        <path d="M8 6h13"></path>
                        <path d="M8 12h13"></path>
                        <path d="M8 18h13"></path>
                        <path d="M3 6h.01"></path>
                        <path d="M3 12h.01"></path>
                        <path d="M3 18h.01"></path>
                      </svg>
                      <span className="max-w-[150px] truncate">
                        {activeOpportunitiesList ? activeOpportunitiesList.name : 'Shared Lists'}
                      </span>
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
                    
                    {/* Dropdown content */}
                    {showListsDropdown && (
                      <div className="absolute z-50 mt-1 w-80 rounded-md border border-slate-200 bg-white shadow-md">
                        <div className="max-h-[300px] overflow-y-auto p-1">
                          {/* Clear selection option */}
                          <button
                            className={`w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 text-left ${!activeOpportunitiesList ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                            onClick={() => {
                              setActiveOpportunitiesList(null);
                              setShowListsDropdown(false);
                            }}
                          >
                            <div className="flex flex-1 items-center">
                              <span className="font-medium text-[#282A3F]">All Opportunities</span>
                            </div>
                          </button>
                          
                          {/* Show shared lists that broker has access to */}
                          {partnerRelevantLists.map((list: any) => (
                            <button
                              key={list.id}
                              className={`w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 text-left ${activeOpportunitiesList?.id === list.id ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                              onClick={() => {
                                setActiveOpportunitiesList(list);
                                setShowListsDropdown(false);
                              }}
                            >
                              <div className="flex flex-1 items-center">
                                <span className="font-medium text-[#282A3F]">{list.name}</span>
                                {/* Show share icon if list is shared */}
                                {list.is_shared && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-green-500">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                  </svg>
                                )}
                              </div>
                              
                              {/* Show active indicator */}
                              {activeOpportunitiesList?.id === list.id && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 ml-2">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right-side action buttons - Read-only for broker view */}
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
              
              {/* Bottom row with search and filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-grow">
                  {/* Search field */}
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
                  
                  {/* Filters */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                  
                  <select
                    value={selectedOpportunityType}
                    onChange={(e) => setSelectedOpportunityType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="New Business">New Business</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Cross-sell">Cross-sell</option>
                    <option value="Upsell">Upsell</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Opportunities table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Close Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity: any) => (
                    <TableRow
                      key={opportunity.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        window.location.href = `/opportunities/${opportunity.id}`;
                      }}
                    >
                      <TableCell className="px-3 py-4 text-sm text-gray-900 w-[250px]">
                        <div className="max-w-[230px]">
                          <div className="font-medium text-gray-900 truncate">
                            {opportunity.title}
                          </div>
                          <div className="text-gray-500 text-xs truncate">
                            {opportunity.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 text-sm w-[120px]">
                        <div className="max-w-[100px] truncate text-gray-900">
                          {opportunity.customerName || opportunity.customer_names || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4 text-sm w-[100px]">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.stage === 'Won' ? 'bg-green-100 text-green-800' :
                          opportunity.stage === 'Lost' ? 'bg-red-100 text-red-800' :
                          opportunity.stage === 'Negotiation' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.stage || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                        {opportunity.value ? `€${Number(opportunity.value).toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-3 py-4 text-sm text-gray-500 w-[100px]">
                        {opportunity.type || 'N/A'}
                      </TableCell>
                      <TableCell className="px-3 py-4 text-sm text-gray-500 w-[100px]">
                        {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredOpportunities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {opportunitiesLoading ? 'Loading opportunities...' : 'No opportunities found matching your criteria.'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <PartnerActivityHub partnerId="4" envId="degoudse" />
          </div>
        )}
      </div>
    </BrokerLayout>
  );
}