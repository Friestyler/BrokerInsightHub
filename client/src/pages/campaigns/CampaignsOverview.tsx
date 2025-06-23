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
  Archive,
  Plus 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CampaignsOverview() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { environment } = useEnvironment();
  const { toast } = useToast();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: [`/api/${environment.id}/campaigns`],
    enabled: activeTab === 'campaigns'
  });

  const filteredCampaigns = useMemo(() => {
    if (!campaigns || selectedFilter === 'all') return campaigns;
    return campaigns.filter((campaign: any) => 
      campaign.target_entity_type === selectedFilter
    );
  }, [campaigns, selectedFilter]);

  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      await apiRequest('DELETE', `/api/${environment.id}/campaigns/bulk-delete`, { campaignIds: selectedCampaigns });
      
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      toast({
        title: "Success",
        description: `Deleted ${selectedCampaigns.length} campaign(s)`,
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
      await apiRequest('PATCH', `/api/${environment.id}/campaigns/bulk-status`, { 
        campaignIds: selectedCampaigns, 
        status: newStatus 
      });
      
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      toast({
        title: "Success",
        description: `Updated ${selectedCampaigns.length} campaign(s) to ${newStatus}`,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit2 className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sent_once': return <Play className="w-4 h-4" />;
      case 'sent_open': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'stopped': return <Pause className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Edit2 className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: <Edit2 className="w-4 h-4" /> },
    { value: 'scheduled', label: 'Scheduled', icon: <Clock className="w-4 h-4" /> },
    { value: 'sent_once', label: 'Sent Once', icon: <Play className="w-4 h-4" /> },
    { value: 'sent_open', label: 'Sent & Open', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'in_progress', label: 'In Progress', icon: <RefreshCw className="w-4 h-4" /> },
    { value: 'stopped', label: 'Stopped', icon: <Pause className="w-4 h-4" /> },
    { value: 'archived', label: 'Archived', icon: <Archive className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white">
        <div className="px-6 py-4">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'campaigns' 
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
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
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
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

            {/* Action Bar */}
            <div className="flex items-center justify-between">
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
              
              <Button
                onClick={() => window.location.href = '/campaigns/new'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Campaign
              </Button>
            </div>

            {/* Bulk actions bar - show when campaigns are selected */}
            {selectedCampaigns.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-indigo-700">
                    {selectedCampaigns.length} campaign(s) selected
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        {getStatusIcon('draft')}
                        Change Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleBulkStatusChange(option.value)}
                          className="flex items-center gap-2"
                        >
                          {option.icon}
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCampaigns([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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