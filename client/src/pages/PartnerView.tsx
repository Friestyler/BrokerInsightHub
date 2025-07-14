import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BrokerLayout } from '@/components/layouts/BrokerLayout';
import PartnersViewforPartner from './PartnersViewforPartner';
import CampaignFromTemplate from './campaigns/CampaignFromTemplate';



// Partner View Page Component
export default function PartnerView() {
  const { listId } = useParams<{ listId: string }>();
  const [location] = useLocation();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Check if we're on the partners page, opportunities page, or campaigns page
  const isPartnersPage = location === '/broker-view/partners';
  const isAllOpportunitiesPage = location === '/broker-view/opportunities';
  const isCampaignsPage = location === '/broker-view/campaigns';
  const isCampaignEditPage = location.includes('/broker-view/campaigns/edit/');
  
  // State for Lists dropdown and filters
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  
  // Bulk actions state
  const [bulkStatusValue, setBulkStatusValue] = useState('');

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

  // Fetch broker campaigns if on campaigns page
  const { data: brokerCampaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/broker/shared-campaigns'],
    queryFn: () => apiRequest('GET', '/api/broker/shared-campaigns'),
    enabled: isCampaignsPage,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch opportunities based on list members
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/opportunities', listId],
    queryFn: () => {
      // For broker view with specific list, pass listId parameter to filter opportunities
      const url = listId ? `/api/degoudse/opportunities?listId=${listId}` : '/api/degoudse/opportunities';
      return apiRequest('GET', url);
    },
    staleTime: 2 * 60 * 1000,
  });

  // Save current list ID to session storage for back navigation
  useEffect(() => {
    if (listId) {
      sessionStorage.setItem('partnerViewListId', listId);
      sessionStorage.setItem('partnerViewSource', 'list');
    } else if (isPartnersPage) {
      // Clear the stored list ID when on the partners page
      sessionStorage.removeItem('partnerViewListId');
      sessionStorage.removeItem('partnerViewSource');
    } else if (isAllOpportunitiesPage) {
      // Set source as opportunities page
      sessionStorage.removeItem('partnerViewListId');
      sessionStorage.setItem('partnerViewSource', 'opportunities');
    }
  }, [listId, isPartnersPage, isAllOpportunitiesPage]);

  // Filter opportunities based on list members and current filters
  useEffect(() => {
    if (allOpportunities.length > 0) {
      let filtered = allOpportunities;
      
      // Skip list-based filtering if we're on the "All Opportunities" page OR if we have a listId but no listData (list not found)
      if (!isAllOpportunitiesPage && !(listId && !listData)) {
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

  // Opportunity statuses for bulk actions
  const opportunityStatuses = ['New', 'In Progress', 'Qualified', 'Closed Won', 'Closed Lost', 'On Hold'];

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Qualified': return 'bg-green-500';
      case 'Closed Won': return 'bg-green-600';
      case 'Closed Lost': return 'bg-red-500';
      case 'On Hold': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOpportunities.length === 0) return;

    try {
      // Update opportunities in the broker view
      await apiRequest('PUT', '/api/degoudse/opportunities/bulk-update', {
        opportunityIds: selectedOpportunities,
        updates: { status: newStatus }
      });

      // Update local state
      setOpportunities(prev => prev.map(opp => 
        selectedOpportunities.includes(opp.id) 
          ? { ...opp, status: newStatus }
          : opp
      ));

      // Show success message
      toast({
        title: "Status Updated",
        description: `Updated ${selectedOpportunities.length} ${selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} to ${newStatus}`,
      });

      // Clear selection and reset dropdown
      setSelectedOpportunities([]);
      setBulkStatusValue('');
    } catch (error) {
      console.error('Error updating opportunity statuses:', error);
      toast({
        title: "Error",
        description: "Failed to update opportunity statuses. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If we're on the partners page, render the Partners component
  if (isPartnersPage) {
    return (
      <BrokerLayout>
        <PartnersViewforPartner />
      </BrokerLayout>
    );
  }

  // If we're on the campaigns page, render the campaigns view
  if (isCampaignsPage) {
    return (
      <BrokerLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared Campaigns</h1>
            <p className="text-gray-600">Campaigns shared with you by De Goudse</p>
          </div>

          {campaignsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : brokerCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns shared</h3>
              <p className="text-gray-500">No campaigns have been shared with you yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {brokerCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          campaign.status === 'template' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Shared by De Goudse</span>
                        <span>•</span>
                        <span>{campaign.sponsorName}</span>
                        {campaign.sharedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(campaign.sharedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/campaigns/${campaign.id}?from_broker_view=true`}>
                      <Button variant="outline" size="sm">
                        View Campaign
                      </Button>
                    </Link>
                  </div>
                  
                  {(campaign.emails_sent > 0 || campaign.emails_opened > 0) && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Emails Sent</div>
                          <div className="font-semibold">{campaign.emails_sent || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Opened</div>
                          <div className="font-semibold">{campaign.emails_opened || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Open Rate</div>
                          <div className="font-semibold">{campaign.open_rate || '0.00'}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </BrokerLayout>
    );
  }

  if (opportunitiesLoading || (listId && listLoading)) {
    return (
      <BrokerLayout>
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
      </BrokerLayout>
    );
  }

  // If a specific list was requested but not found, fall back to showing all opportunities
  // instead of showing an error. This provides a better user experience.

  // If we're on a campaign edit page, render the campaign builder
  if (isCampaignEditPage) {
    return (
      <BrokerLayout>
        <CampaignFromTemplate />
      </BrokerLayout>
    );
  }

  return (
    <BrokerLayout>
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
          
          {/* Bulk actions bar - only visible when opportunities are selected */}
          {selectedOpportunities.length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-indigo-700 font-medium mr-2">
                  {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                </span>
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
                
                {/* Show selected opportunity titles */}
                {selectedOpportunities.length <= 3 && (
                  <div className="flex flex-wrap gap-1 ml-3">
                    {selectedOpportunities.slice(0, 3).map((oppId) => {
                      const opp = opportunities.find((o: any) => o.id === oppId);
                      return opp ? (
                        <span key={oppId} className="bg-blue-200 px-2 py-1 rounded text-xs">
                          {opp.title}
                        </span>
                      ) : null;
                    })}
                    {selectedOpportunities.length > 3 && (
                      <span className="text-blue-600 text-xs">
                        +{selectedOpportunities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Bulk Status Change dropdown */}
                <div className="flex items-center gap-1">
                  <Select
                    value={bulkStatusValue}
                    onValueChange={(value) => {
                      setBulkStatusValue(value);
                      handleBulkStatusChange(value);
                    }}
                  >
                    <SelectTrigger className="h-9 border-indigo-200 bg-white text-sm w-[180px]">
                      <SelectValue placeholder="Change Status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opportunityStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeVariant(status)}`}></span>
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-indigo-600"
                  onClick={() => {
                    toast({
                      title: "Campaign Creation",
                      description: "Selected opportunities can be added to a campaign. This feature will be available in the Campaigns section.",
                    });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22 11 13 2 9 22 2z" />
                  </svg>
                  Add to Campaign
                </Button>
                

              </div>
            </div>
          )}
          
          {/* Opportunities table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="w-12 group relative px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      <div className={`transition-opacity ${
                        selectedOpportunities.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Checkbox 
                          checked={selectedOpportunities.length === opportunities.length && opportunities.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOpportunities(opportunities.map((o: any) => o.id));
                            } else {
                              setSelectedOpportunities([]);
                            }
                          }}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Close Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="group hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`transition-opacity ${
                          selectedOpportunities.includes(opportunity.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <Checkbox 
                            checked={selectedOpportunities.includes(opportunity.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOpportunities([...selectedOpportunities, opportunity.id]);
                              } else {
                                setSelectedOpportunities(selectedOpportunities.filter(id => id !== opportunity.id));
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link 
                            href={`/broker-view/opportunity/${opportunity.id}`}
                            onClick={() => {
                              // Store the current page as the referrer for smart back navigation
                              sessionStorage.setItem('opportunityReferrer', window.location.pathname);
                            }}
                          >
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
    </BrokerLayout>
  );
}