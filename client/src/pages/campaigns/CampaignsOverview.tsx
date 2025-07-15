import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import TemplatesPage from './TemplatesPage';
import CampaignsTable from './CampaignsTable';
import CampaignsSummaryCards from './CampaignsSummaryCards';
import ShareCampaignModal from '../../components/campaigns/ShareCampaignModal';
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
  Plus,
  Share2
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
  const [showShareModal, setShowShareModal] = useState(false);
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
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'all' 
                      ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                      : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                  }`}
                  onClick={() => setSelectedFilter('all')}
                >
                  All campaigns
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'partners' 
                      ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                      : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                  }`}
                  onClick={() => setSelectedFilter('partners')}
                >
                  Partners
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'customers' 
                      ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                      : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                  }`}
                  onClick={() => setSelectedFilter('customers')}
                >
                  Customers
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'opportunities' 
                      ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                      : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                  }`}
                  onClick={() => setSelectedFilter('opportunities')}
                >
                  Opportunities
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 ${
                    selectedFilter === 'internal' 
                      ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                      : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
                  }`}
                  onClick={() => setSelectedFilter('internal')}
                >
                  Internal
                </Button>
              </div>
              
              <Button
                onClick={() => window.location.href = '/campaigns/new'}
              >
                <Plus className="h-4 w-4" />
                Create new campaign
              </Button>
            </div>

            {/* Bulk actions bar - show when campaigns are selected */}
            {selectedCampaigns.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-indigo-700">
                    {selectedCampaigns.length} campaign(s) selected
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="w-4 h-4" />
                    Share with partner
                  </Button>
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
      
      {/* Share Campaign Modal */}
      <ShareCampaignModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        campaignIds={selectedCampaigns}
        campaignNames={selectedCampaigns.map(id => {
          const campaign = campaigns?.find((c: any) => c.id === id);
          return campaign?.name || `Campaign ${id}`;
        })}
        onSuccess={() => {
          setSelectedCampaigns([]);
          queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
        }}
      />
    </div>
  );
}