import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Reply, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUpDown,
  Play,
  Pause,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import CampaignsSummaryCards from "./CampaignsSummaryCards";

interface Campaign {
  id: number;
  name: string;
  type: string;
  description: string;
  template_id?: number;
  target_entity_type: string;
  status: string;
  created_by_name: string;
  created_at: string;
  engagement_summary: {
    email1: {
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
      bounced: number;
    };
    email2: {
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
      bounced: number;
    };
  };
  recipients: any[];
  icon: string;
  objective?: string;
}

export default function CampaignsTable() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['/api/degoudse/campaigns'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.objective?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesEntity = entityFilter === "all" || campaign.target_entity_type === entityFilter;
    
    return matchesSearch && matchesStatus && matchesEntity;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a: any, b: any) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle special sorting cases
    if (sortBy === 'engagement_rate') {
      aValue = getEngagementRate(a);
      bValue = getEngagementRate(b);
    } else if (sortBy === 'recipients_count') {
      aValue = a.recipients?.length || 0;
      bValue = b.recipients?.length || 0;
    } else if (sortBy === 'created_at') {
      aValue = new Date(a.created_at).getTime();
      bValue = new Date(b.created_at).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Toggle campaign selection
  const toggleCampaignSelection = (campaignId: number) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedCampaigns.length === sortedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(sortedCampaigns.map((campaign: any) => campaign.id));
    }
  };

  // Get entity type badge color
  const getEntityColor = (entityType: string) => {
    const colors = {
      'partners': 'bg-purple-100 text-purple-800',
      'customers': 'bg-blue-100 text-blue-800',
      'opportunities': 'bg-green-100 text-green-800',
      'internal': 'bg-orange-100 text-orange-800'
    };
    return colors[entityType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Calculate engagement rate
  const getEngagementRate = (campaign: Campaign) => {
    const email1 = campaign.engagement_summary?.email1 || {};
    const email2 = campaign.engagement_summary?.email2 || {};
    const totalSent = (email1.sent || 0) + (email2.sent || 0);
    const totalOpened = (email1.opened || 0) + (email2.opened || 0);
    
    if (totalSent === 0) return 0;
    return Math.round((totalOpened / totalSent) * 100);
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-gray-600" />
      : <ChevronDown className="h-3 w-3 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <CampaignsSummaryCards />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage and track your marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns/templates">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/campaigns/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="sent">Sent</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          
          <select 
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Entities</option>
            <option value="partners">Partners</option>
            <option value="customers">Customers</option>
            <option value="opportunities">Opportunities</option>
            <option value="internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Results count and bulk actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {sortedCampaigns.length} of {campaigns.length} campaigns
        </p>
        {selectedCampaigns.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedCampaigns.length} selected
            </span>
            <Button size="sm" variant="outline">
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
            <Button size="sm" variant="outline">
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-12 pl-6">
                <Checkbox 
                  checked={selectedCampaigns.length === sortedCampaigns.length && sortedCampaigns.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 py-4"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Campaign</span>
                  {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('target_entity_type')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Entity</span>
                  {renderSortIcon('target_entity_type')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Status</span>
                  {renderSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('recipients_count')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Recipients</span>
                  {renderSortIcon('recipients_count')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('engagement_rate')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Engagement</span>
                  {renderSortIcon('engagement_rate')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Created</span>
                  {renderSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead className="w-24 text-center">
                <span className="font-medium text-gray-700">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign: any, index: number) => {
              const email1 = campaign.engagement_summary?.email1 || {};
              const email2 = campaign.engagement_summary?.email2 || {};
              const totalSent = (email1.sent || 0) + (email2.sent || 0);
              const totalOpened = (email1.opened || 0) + (email2.opened || 0);
              const engagementRate = getEngagementRate(campaign);

              return (
                <TableRow 
                  key={campaign.id} 
                  className={cn(
                    "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                    selectedCampaigns.includes(campaign.id) && "bg-blue-50/50"
                  )}
                >
                  <TableCell className="pl-6">
                    <Checkbox 
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                    />
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">
                          {campaign.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                          {campaign.description || campaign.objective}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      getEntityColor(campaign.target_entity_type)
                    )}>
                      {campaign.target_entity_type === 'partners' && 'Partner'}
                      {campaign.target_entity_type === 'customers' && 'Customer'}
                      {campaign.target_entity_type === 'opportunities' && 'Opportunity'}
                      {campaign.target_entity_type === 'internal' && 'Internal'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {campaign.status === 'draft' && 'Draft'}
                      {campaign.status === 'scheduled' && 'Scheduled'}
                      {campaign.status === 'in_progress' && 'In Progress'}
                      {campaign.status === 'sent' && 'Sent'}
                      {campaign.status === 'completed' && 'Completed'}
                      {campaign.status === 'paused' && 'Paused'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-gray-900 font-medium">
                      {campaign.recipients?.length || 0}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{engagementRate}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(engagementRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {campaign.created_by_name}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {sortedCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" || entityFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first campaign"}
            </p>
            {!searchTerm && statusFilter === "all" && entityFilter === "all" && (
              <div className="mt-6">
                <Link href="/campaigns/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}