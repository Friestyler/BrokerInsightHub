import { useState } from "react";
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
            
            {/* Dropdown menu */}
            {dataMenuOpen && (
              <div className={`${sidebarCollapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
                <Link href="/broker-view/partners">
                  <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-600`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Partners
                  </div>
                </Link>
                <Link href="/broker-view/list/2">
                  <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-600`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Opportunities
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar */}
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
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailBrokerPOV() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [activeTab, setActiveTab] = useState("okr-plans");
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");

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

  // For De Goudse partner in broker view, show the shared opportunities from the list
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/opportunities'),
    staleTime: 2 * 60 * 1000,
  });

  // Get the saved list ID from session storage to filter opportunities
  const getSharedListId = () => {
    const savedListId = sessionStorage.getItem('partnerViewListId');
    return savedListId ? parseInt(savedListId) : 2; // Default to list 2 if not found
  };

  // Fetch the shared list details
  const { data: listData } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', getSharedListId()],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/degoudse/saved-lists`);
      return response.find((list: any) => list.id === getSharedListId());
    }
  });

  // Filter opportunities based on the shared list
  const relatedOpportunities = allOpportunities.filter((opp: any) => {
    if (listData && listData.members && listData.members.length > 0) {
      return listData.members.includes(opp.id);
    }
    // If no specific list members, show all opportunities
    return true;
  });

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

  // Filter metrics based on search and filters
  const filteredMetrics = okrMetrics.filter(metric => {
    const matchesSearch = !searchTerm || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || metric.tag === selectedTag;
    const matchesUnit = selectedUnit === "all" || metric.unit === selectedUnit;
    
    return matchesSearch && matchesTag && matchesUnit;
  });

  // Group metrics by tag
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: any) => {
    const tag = metric.tag || 'Untagged';
    if (!acc[tag]) {
      acc[tag] = [];
    }
    acc[tag].push(metric);
    return acc;
  }, {});

  // Get saved list ID from session storage for back navigation
  const getBackUrl = () => {
    const savedListId = sessionStorage.getItem('partnerViewListId');
    return savedListId ? `/broker-view/list/${savedListId}` : '/broker-view/partners';
  };

  return (
    <BrokerLayout>
      <div className="min-h-screen bg-white">
        {/* Header section */}
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <Link href={getBackUrl()}>
              <Button variant="ghost" size="sm" className="mr-4 p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-gray-600">{partner.description}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Details</span>
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Partner</span>
                  <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">De Goudse</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">Joint action & business plan to drive growth with insurance business</p>

          {/* Activity Hub - Show De Goudse's partnership activities with Regional Insurance Partners */}
          <PartnerActivityHub partnerId={4} partnerName={partner.name} />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab("okr-plans")}
                className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "okr-plans" 
                    ? "bg-blue-100 text-blue-700 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
              >
                OKR plans
              </button>
              <button 
                onClick={() => setActiveTab("opportunities")}
                className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "opportunities" 
                    ? "bg-blue-100 text-blue-700 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
              >
                Opportunities ({relatedOpportunities?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Content area */}
        <div className="px-6 py-6">
          {activeTab === "okr-plans" && (
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search metrics..."
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
                    {tags?.map((tag: any) => (
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
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* OKR Metrics Display */}
              {filteredMetrics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No OKR metrics found</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg">
                  {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                    <div key={tagName} className="mb-8">
                      {/* Tag Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span 
                            className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white"
                            style={{ 
                              backgroundColor: tags?.find((tag: any) => tag.name === tagName)?.color || '#6B7280'
                            }}
                          >
                            {tagName}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({tagMetrics.length} metric{tagMetrics.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>

                      {/* Metrics Table */}
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200">
                            <TableHead className="font-semibold text-gray-900">Metric Name</TableHead>
                            <TableHead className="font-semibold text-gray-900">Description</TableHead>
                            <TableHead className="font-semibold text-gray-900">Current</TableHead>
                            <TableHead className="font-semibold text-gray-900">Target</TableHead>
                            <TableHead className="font-semibold text-gray-900">Progress</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tagMetrics.map((metric: any) => {
                            const progress = Math.round((metric.current_value / metric.target_value) * 100);
                            return (
                              <TableRow key={metric.id} className="border-b border-gray-100">
                                <TableCell className="font-medium">{metric.name}</TableCell>
                                <TableCell className="text-gray-600">{metric.description}</TableCell>
                                <TableCell>
                                  {metric.current_value}
                                  {metric.unit === 'percentage' && '%'}
                                </TableCell>
                                <TableCell>
                                  {metric.target_value}
                                  {metric.unit === 'percentage' && '%'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{progress}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-6">
              {opportunitiesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading opportunities...</p>
                </div>
              ) : relatedOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No opportunities found for this partner</p>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Close Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedOpportunities.map((opportunity: any) => (
                          <TableRow key={opportunity.id}>
                            <TableCell>
                              <Link href={`/broker-view/opportunity/${opportunity.id}`}>
                                <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer">
                                  {opportunity.title}
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>{opportunity.customerName}</TableCell>
                            <TableCell>{opportunity.productName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                opportunity.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
                                opportunity.status === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {opportunity.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'USD',
                                maximumFractionDigits: 0
                              }).format(opportunity.estimatedValue || 0)}
                            </TableCell>
                            <TableCell>{opportunity.expectedCloseDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BrokerLayout>
  );
}