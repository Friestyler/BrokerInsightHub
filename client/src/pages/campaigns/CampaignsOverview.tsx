import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import TemplatesPage from './TemplatesPage';
import CampaignsTable from './CampaignsTable';
import CampaignsSummaryCards from './CampaignsSummaryCards';
import { 
  FileText, 
  Send, 
  Trash2, 
  Edit2, 
  Clock, 
  Play, 
  CheckCircle, 
  RefreshCw, 
  Pause, 
  Archive 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CampaignsOverview() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: [`/api/${environment.id}/campaigns`],
    staleTime: 5 * 60 * 1000,
  });

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) return [];
    
    return (campaigns as any[]).filter(campaign => {
      if (selectedFilter === 'all') return true;
      return campaign.target_entity_type === selectedFilter;
    });
  }, [campaigns, selectedFilter]);

  const { toast } = useToast();

  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      await apiRequest(`/api/${environment.id}/campaigns/bulk-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ campaignIds: selectedCampaigns }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      toast({
        title: "Success",
        description: `${selectedCampaigns.length} campaign(s) deleted successfully`,
      });
      
      setSelectedCampaigns([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaigns",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      await apiRequest(`/api/${environment.id}/campaigns/bulk-status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          campaignIds: selectedCampaigns, 
          status: newStatus 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      const statusLabels: Record<string, string> = {
        'draft': 'Draft',
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'sent_once': 'Sent Once',
        'sent_open': 'Sent & Open',
        'stopped': 'Stopped',
        'archived': 'Archived'
      };
      
      toast({
        title: "Success",
        description: `${selectedCampaigns.length} campaign(s) marked as ${statusLabels[newStatus] || newStatus}`,
      });
      
      setSelectedCampaigns([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading campaigns: {(error as any)?.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'campaigns' 
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('campaigns')}
            >
              <Send className="h-4 w-4" />
              Campaigns
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'templates' 
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              <FileText className="h-4 w-4" />
              Templates
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'campaigns' && (
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <CampaignsSummaryCards campaigns={campaigns} />

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className={selectedFilter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                All Campaigns
              </Button>
              <Button
                variant={selectedFilter === 'partners' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('partners')}
                className={selectedFilter === 'partners' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                Partners
              </Button>
              <Button
                variant={selectedFilter === 'customers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('customers')}
                className={selectedFilter === 'customers' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Customers
              </Button>
              <Button
                variant={selectedFilter === 'opportunities' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('opportunities')}
                className={selectedFilter === 'opportunities' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Opportunities
              </Button>
              <Button
                variant={selectedFilter === 'internal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('internal')}
                className={selectedFilter === 'internal' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Internal
              </Button>
            </div>

            {/* Bulk actions bar - show when campaigns are selected */}
            {selectedCampaigns.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between">
                <div className="flex items-center">
                  <span className="text-indigo-700 font-medium mr-2">
                    {selectedCampaigns.length} {selectedCampaigns.length === 1 ? 'campaign' : 'campaigns'} selected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => setSelectedCampaigns([])}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Clear selection
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Status
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('draft')} className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Mark as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('scheduled')} className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('in_progress')} className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('sent_once')} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('sent_open')} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Keep Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('stopped')} className="flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        Stop Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange('archived')} className="flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Campaigns Table */}
            <CampaignsTable 
              campaigns={filteredCampaigns} 
              selectedCampaigns={selectedCampaigns}
              onSelectionChange={setSelectedCampaigns}
            />
          </div>
        )}
        {activeTab === 'templates' && <TemplatesPage />}
      </div>
    </div>
  );
}