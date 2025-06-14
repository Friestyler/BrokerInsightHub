import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, Mail, Settings, Play, Pause, Archive, Edit, Trash2, Eye, Share, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CommFlow } from '@shared/schema';

interface CampaignListItem extends CommFlow {
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
  sentAt?: string;
  nextSendAt?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700';
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-yellow-100 text-yellow-700';
    case 'sent': return 'bg-green-100 text-green-700';
    case 'archived': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft': return Edit;
    case 'scheduled': return Calendar;
    case 'in_progress': return Play;
    case 'sent': return Mail;
    case 'archived': return Archive;
    default: return Mail;
  }
};

export default function CampaignsList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery<CampaignListItem[]>({
    queryKey: ['/api/comm-flows'],
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/comm-flows/${id}`, {
        method: 'PATCH',
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comm-flows'] });
      toast({ title: 'Campaign updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update campaign', description: error.message, variant: 'destructive' });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/comm-flows/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comm-flows'] });
      toast({ title: 'Campaign deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete campaign', description: error.message, variant: 'destructive' });
    },
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const CampaignCard = ({ campaign }: { campaign: CampaignListItem }) => {
    const StatusIcon = getStatusIcon(campaign.status);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                <Badge className={getStatusColor(campaign.status)}>
                  <StatusIcon size={12} className="mr-1" />
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                </Badge>
              </div>
              
              {campaign.description && (
                <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {campaign.recipientCount || 0} recipients
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {campaign.targetEntityType}
                </span>
                {campaign.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(campaign.scheduledAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation(`/campaigns/${campaign.id}`)}>
                  <Eye size={16} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation(`/campaigns/${campaign.id}/edit`)}>
                  <Edit size={16} className="mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share size={16} className="mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {campaign.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'scheduled')}>
                    <Play size={16} className="mr-2" />
                    Schedule
                  </DropdownMenuItem>
                )}
                
                {campaign.status === 'in_progress' && (
                  <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'archived')}>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </DropdownMenuItem>
                )}
                
                {campaign.status === 'sent' && (
                  <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'archived')}>
                    <Archive size={16} className="mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(campaign.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Performance metrics for sent campaigns */}
          {campaign.status === 'sent' && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campaign.openRate || 0}%</div>
                <div className="text-xs text-gray-500">Open Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campaign.clickRate || 0}%</div>
                <div className="text-xs text-gray-500">Click Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}
                </div>
                <div className="text-xs text-gray-500">Sent Date</div>
              </div>
            </div>
          )}

          {/* Next send info for recurring campaigns */}
          {campaign.frequency !== 'one_time' && campaign.nextSendAt && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Next send:</span>
                <span className="font-medium">{new Date(campaign.nextSendAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <p className="text-sm text-gray-600">Manage and monitor your email campaigns</p>
        </div>
        <Button onClick={() => setLocation('/campaigns/create')} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {campaigns.length === 0 
              ? 'Create your first campaign to start reaching your contacts.' 
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {campaigns.length === 0 && (
            <Button onClick={() => setLocation('/campaigns/create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {campaigns.filter(c => c.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'sent').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {campaigns.filter(c => c.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>
      )}
    </div>
  );
}