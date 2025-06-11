import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import PartnersViewforPartner from './PartnersViewforPartner';

// Partner View Layout Component with same structure as main Layout
function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dataMenuOpen, setDataMenuOpen] = useState(true); // Start with collaborate menu open
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isPartnersPage = location === '/broker-view/partners';
  const isOpportunitiesPage = location.startsWith('/broker-view/list/');

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - using same structure as main sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-16 md:w-64"} bg-gray-50 flex flex-col h-full overflow-hidden transition-all duration-300 relative`}>
        
        {/* De Goudse Logo */}
        <div className="pt-4 px-4 pb-1 flex justify-center md:justify-start flex-shrink-0">
          <div className={`${sidebarCollapsed ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center`}>
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DG</span>
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 hidden md:flex items-center">
              <span className="text-lg font-semibold text-gray-900">De Goudse</span>
            </div>
          )}
        </div>
        
        {/* No Environment Selector - hidden as requested */}
        
        {/* Navigation Links */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto px-2 pt-4">
          {/* Broker Copilot - disabled */}
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-400 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
              Broker Copilot
            </span>
          </div>

          {/* Collaborate section */}
          <div className="relative">
            <button 
              className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${dataMenuOpen ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
              <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
                Collaborate
              </span>
              {!sidebarCollapsed && (
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
                  className={`ml-auto transition-transform ${dataMenuOpen ? 'rotate-180' : ''} ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
            
            {/* Dropdown menu - show Partners and Opportunities */}
            {dataMenuOpen && (
              <div className={`${sidebarCollapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
                <Link href="/broker-view/partners">
                  <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left cursor-pointer ${isPartnersPage ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Partners
                  </div>
                </Link>
                <Link href="/broker-view/list/2">
                  <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left cursor-pointer ${isOpportunitiesPage ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Opportunities
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Campaigns */}
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
          </div>

          {/* Templates, Smart Updates, Settings - all hidden as requested */}
        </div>
      </div>
      
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar - similar to main layout but simplified */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </button>
            <div className="text-sm text-gray-600">Broker View</div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* No avatar for anonymous partner view */}
          </div>
        </div>
        
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Partner View Page Component
export default function PartnerView() {
  const { listId } = useParams<{ listId: string }>();
  const [location] = useLocation();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  // Check if we're on the partners page or all opportunities page
  const isPartnersPage = location === '/broker-view/partners';
  const isAllOpportunitiesPage = location === '/broker-view/opportunities';
  
  // State for Lists dropdown and filters
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch all shared lists that a partner can see
  const { data: sharedLists = [], isLoading: sharedListsLoading } = useQuery({
    queryKey: ['/api/degoudse/saved-lists'],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-lists'),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch the shared list details for the current list
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', listId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/degoudse/saved-lists`);
      return response.find((list: any) => list.id === parseInt(listId || '0'));
    },
    enabled: !!listId
  });

  // Fetch opportunities based on list members
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/opportunities'),
    staleTime: 2 * 60 * 1000,
  });

  // Save current list ID to session storage for back navigation
  useEffect(() => {
    if (listId) {
      sessionStorage.setItem('partnerViewListId', listId);
    }
  }, [listId]);

  // Filter opportunities based on list members and current filters
  useEffect(() => {
    if (allOpportunities.length > 0) {
      let filtered = allOpportunities;
      
      // Skip list-based filtering if we're on the "All Opportunities" page
      if (!isAllOpportunitiesPage) {
        // First, filter by list members if we have a specific list
        if (listData && listData.members && listData.members.length > 0) {
          filtered = filtered.filter((opp: any) => 
            listData.members.includes(opp.id)
          );
        } else if (listData && listData.filters) {
          // Apply saved list filters
          const filters = typeof listData.filters === 'string' ? JSON.parse(listData.filters) : listData.filters;
          
          if (filters.searchText) {
            filtered = filtered.filter((opp: any) =>
              opp.title?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
              opp.description?.toLowerCase().includes(filters.searchText.toLowerCase())
            );
          }
          
          if (filters.status) {
            filtered = filtered.filter((opp: any) => opp.status === filters.status);
          }
          
          if (filters.type) {
            filtered = filtered.filter((opp: any) => opp.type === filters.type);
          }
        }
      }
      
      // Then apply current user filters
      if (filterText) {
        filtered = filtered.filter((opp: any) =>
          opp.title?.toLowerCase().includes(filterText.toLowerCase()) ||
          opp.description?.toLowerCase().includes(filterText.toLowerCase())
        );
      }
      
      if (selectedStatus) {
        filtered = filtered.filter((opp: any) => opp.status === selectedStatus);
      }
      
      if (selectedType) {
        filtered = filtered.filter((opp: any) => opp.type === selectedType);
      }
      
      setOpportunities(filtered);
    }
  }, [listData, allOpportunities, filterText, selectedStatus, selectedType, isAllOpportunitiesPage]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualifying': return 'bg-yellow-100 text-yellow-800';
      case 'Needs Analysis': return 'bg-blue-100 text-blue-800';
      case 'Proposal': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Closed Won': return 'bg-green-100 text-green-800';
      case 'Closed Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // If we're on the partners page, render the Partners component
  if (isPartnersPage) {
    return (
      <PartnerLayout>
        <PartnersViewforPartner />
      </PartnerLayout>
    );
  }

  if (opportunitiesLoading || (listId && listLoading)) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  // Only show "List not found" if we're expecting a specific list but can't find it
  if (listId && !listData) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">List not found</h2>
            <p className="text-gray-600">The shared list you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="p-6">
        <div className="space-y-4">
          {/* Enhanced unified toolbar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Top row with saved lists */}
              <div className="flex flex-wrap items-center justify-between">
                {/* Left side - Shared Lists dropdown */}
                <div className="flex items-center gap-3">
                  {/* Lists heading */}
                  <div className="flex flex-col mr-2">
                    <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
                  </div>
                  {/* Shared Lists dropdown */}
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                      onClick={() => setShowListsDropdown(!showListsDropdown)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                        <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                      </svg>
                      <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                        {isAllOpportunitiesPage ? "All Opportunities" : (activeList ? activeList.name : listData?.name || "All Opportunities")}
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
                    
                    {/* Shared Lists dropdown menu */}
                    {showListsDropdown && (
                      <div className="absolute z-50 mt-1.5 w-80 rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80">
                        <div className="max-h-[300px] overflow-y-auto p-1">
                          {/* All Opportunities option */}
                          <div className="relative">
                            <div
                              className={`flex flex-1 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${isAllOpportunitiesPage ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700'}`}
                              onClick={() => {
                                // Navigate to all opportunities view
                                window.location.href = `/broker-view/opportunities`;
                                setShowListsDropdown(false);
                              }}
                            >
                              <div className="flex flex-col flex-1">
                                <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>All Opportunities</span>
                                <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  All opportunities you have access to
                                </span>
                              </div>
                              <div className="ml-auto">
                                <span className="text-xs text-[#282A3F] italic" style={{ fontFamily: 'Poppins, sans-serif' }}>Default</span>
                              </div>
                            </div>
                          </div>

                          {/* Note: Broker view only shows default "All Opportunities" - no shared lists */}
                        </div>
                      </div>
                    )}
                  </div>
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
                  
                  {/* Filter buttons */}
                  <div className="flex items-center gap-2 ml-3">
                    <button 
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedStatus ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                      onClick={() => setSelectedStatus(selectedStatus ? '' : 'In Progress')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <span>{selectedStatus ? `Status: ${selectedStatus}` : 'Status'}</span>
                      {selectedStatus && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      )}
                    </button>
                    
                    <button 
                      className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${selectedType ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}
                      onClick={() => setSelectedType(selectedType ? '' : 'Renewal')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <span>{selectedType ? `Type: ${selectedType}` : 'Type'}</span>
                      {selectedType && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Clear filters button */}
                {(filterText || selectedStatus || selectedType) && (
                  <button 
                    onClick={() => {
                      setFilterText('');
                      setSelectedStatus('');
                      setSelectedType('');
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
          
          {/* Opportunities table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Close Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link href={`/broker-view/opportunity/${opportunity.id}`}>
                            <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer">
                              {opportunity.title}
                            </div>
                          </Link>
                          <div className="text-sm text-gray-500">
                            {opportunity.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.partnerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(opportunity.status)} border-0`}>
                          {opportunity.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(opportunity.estimatedValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.probability}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.expectedCloseDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty state */}
          {opportunities.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities</h3>
              <p className="mt-1 text-sm text-gray-500">This list doesn't contain any opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}