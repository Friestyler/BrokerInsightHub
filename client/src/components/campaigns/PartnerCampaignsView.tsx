import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import CampaignsTable from '../../pages/campaigns/CampaignsTable';
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
  AlertCircle,
  Mail,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PartnerCampaignsViewProps {
  partnerId: string;
  partnerName?: string;
  onCampaignClick?: (campaign: any) => void;
}

export default function PartnerCampaignsView({ partnerId, partnerName, onCampaignClick }: PartnerCampaignsViewProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { environment } = useEnvironment();
  const { toast } = useToast();

  // Fetch partner-specific campaigns
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: [`/api/${environment.id}/campaigns`, 'partner', partnerId],
    queryFn: () => apiRequest('GET', `/api/campaigns?partner_id=${partnerId}`),
    enabled: !!partnerId
  });

  // Filter campaigns based on type
  const filteredCampaigns = useMemo(() => {
    if (!campaigns || selectedFilter === 'all') return campaigns || [];
    return campaigns.filter((campaign: any) => campaign.type === selectedFilter);
  }, [campaigns, selectedFilter]);

  // Calculate summary statistics for partner-specific campaigns
  const summaryStats = useMemo(() => {
    const campaignData = campaigns || [];
    
    const totalCampaigns = campaignData.length;
    const activeCampaigns = campaignData.filter((c: any) => 
      c.status === 'active' || c.status === 'scheduled'
    ).length;
    
    const totalRecipients = campaignData.reduce((acc: number, campaign: any) => 
      acc + (campaign.recipients?.length || 0), 0
    );
    
    const totalSent = campaignData.reduce((acc: number, campaign: any) => {
      const email1 = campaign.engagement_summary?.email1 || {};
      const email2 = campaign.engagement_summary?.email2 || {};
      return acc + (email1.sent || 0) + (email2.sent || 0);
    }, 0);
    
    const totalOpened = campaignData.reduce((acc: number, campaign: any) => {
      const email1 = campaign.engagement_summary?.email1 || {};
      const email2 = campaign.engagement_summary?.email2 || {};
      return acc + (email1.opened || 0) + (email2.opened || 0);
    }, 0);

    const overallEngagementRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

    return [
      {
        title: "Total Campaigns",
        value: totalCampaigns,
        icon: Mail,
        color: "text-blue-600"
      },
      {
        title: "Active Campaigns",
        value: activeCampaigns,
        icon: TrendingUp,
        color: "text-green-600"
      },
      {
        title: "Total Recipients",
        value: totalRecipients,
        icon: Users,
        color: "text-purple-600"
      },
      {
        title: "Emails Sent",
        value: totalSent,
        icon: Target,
        color: "text-orange-600"
      },
      {
        title: "Engagement Rate",
        value: `${overallEngagementRate}%`,
        icon: Clock,
        color: "text-indigo-600"
      }
    ];
  }, [campaigns]);

  // Status options and handlers
  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'scheduled', label: 'Scheduled', icon: <Clock className="w-4 h-4" /> },
    { value: 'active', label: 'Active', icon: <Play className="w-4 h-4" /> },
    { value: 'paused', label: 'Paused', icon: <Pause className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.icon : <AlertCircle className="w-4 h-4" />;
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      // Implementation for bulk status change
      await Promise.all(
        selectedCampaigns.map(campaignId =>
          apiRequest('PATCH', `/api/campaigns/${campaignId}`, { status: newStatus })
        )
      );
      
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      toast({
        title: "Status Updated",
        description: `${selectedCampaigns.length} campaign(s) updated to ${newStatus}`,
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

  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      // Implementation for bulk delete (remove access for this partner)
      await Promise.all(
        selectedCampaigns.map(campaignId =>
          apiRequest('DELETE', `/api/campaigns/${campaignId}/partners/${partnerId}`)
        )
      );
      
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/campaigns`] });
      
      toast({
        title: "Access Removed",
        description: `Access removed for ${selectedCampaigns.length} campaign(s)`,
      });
      
      setSelectedCampaigns([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove campaign access",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {summaryStats.map((item) => (
          <Card key={item.title} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.title}</p>
                </div>
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            variant={selectedFilter === 'cross_sell' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('cross_sell')}
            className={selectedFilter === 'cross_sell' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Cross-sell
          </Button>
          <Button
            variant={selectedFilter === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('email')}
            className={selectedFilter === 'email' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Email
          </Button>
          <Button
            variant={selectedFilter === 'retention' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('retention')}
            className={selectedFilter === 'retention' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Retention
          </Button>
        </div>
        

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
              Remove Access
            </Button>
          </div>
        </div>
      )}

      {/* Campaigns Table or Empty State */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500">
            {selectedFilter === 'all' 
              ? `No campaigns have been shared with ${partnerName || 'this partner'} yet.` 
              : `No ${selectedFilter} campaigns have been shared with ${partnerName || 'this partner'}.`}
          </p>
        </div>
      ) : (
        <CampaignsTable 
          campaigns={filteredCampaigns} 
          selectedCampaigns={selectedCampaigns}
          onSelectionChange={setSelectedCampaigns}
          isPartnerView={true}
          partnerId={partnerId}
          onCampaignClick={onCampaignClick}
        />
      )}
    </div>
  );
}