import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Users, Target, Clock, TrendingUp, Eye, MousePointer, Reply, AlertTriangle, Plus, Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

const getEntityColor = (entityType: string) => {
  switch (entityType) {
    case 'opportunities': return 'text-green-600 bg-green-50 border-green-200';
    case 'customers': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'partners': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'internal': return 'text-orange-600 bg-orange-50 border-orange-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'sent': return 'bg-green-100 text-green-800';
    case 'archived': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function CampaignsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });

  // Calculate aggregate statistics
  const totalStats = campaigns.reduce((acc, campaign) => {
    const email1 = campaign.engagement_summary?.email1 || {};
    const email2 = campaign.engagement_summary?.email2 || {};
    
    return {
      sent: acc.sent + (email1.sent || 0) + (email2.sent || 0),
      opened: acc.opened + (email1.opened || 0) + (email2.opened || 0),
      clicked: acc.clicked + (email1.clicked || 0) + (email2.clicked || 0),
      replied: acc.replied + (email1.replied || 0) + (email2.replied || 0),
      bounced: acc.bounced + (email1.bounced || 0) + (email2.bounced || 0),
    };
  }, { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 });

  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeFilter === "all") return true;
    return campaign.target_entity_type === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.opened.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.sent > 0 ? `${((totalStats.opened / totalStats.sent) * 100).toFixed(1)}% open rate` : '0% open rate'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.clicked.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.sent > 0 ? `${((totalStats.clicked / totalStats.sent) * 100).toFixed(1)}% click rate` : '0% click rate'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.replied.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.sent > 0 ? `${((totalStats.replied / totalStats.sent) * 100).toFixed(1)}% reply rate` : '0% reply rate'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounced</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.bounced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.sent > 0 ? `${((totalStats.bounced / totalStats.sent) * 100).toFixed(1)}% bounce rate` : '0% bounce rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          {filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {activeFilter === "all" 
                    ? "Create your first campaign to get started with marketing automation."
                    : `No campaigns found for ${activeFilter}. Create a new campaign targeting this entity type.`
                  }
                </p>
                <Link href="/campaigns/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium",
                            getEntityColor(campaign.target_entity_type).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-50', '-500')
                          )}>
                            {campaign.icon === 'mail' ? <Mail className="w-4 h-4" /> : campaign.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">{campaign.name}</CardTitle>
                            <CardDescription className="text-xs">
                              Created by {campaign.created_by_name}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("text-xs", getStatusColor(campaign.status))}>
                        {campaign.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {campaign.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                    )}
                    
                    {campaign.objective && (
                      <p className="text-xs text-gray-500 italic">Goal: {campaign.objective}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span className={cn("px-2 py-1 rounded text-xs font-medium", getEntityColor(campaign.target_entity_type))}>
                          {campaign.target_entity_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{campaign.recipients?.length || 0} recipients</span>
                      </div>
                    </div>

                    {/* Email Engagement Stats */}
                    <div className="space-y-2">
                      {campaign.engagement_summary?.email1?.sent > 0 && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Email 1 Performance</div>
                          <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email1.sent}</div>
                              <div className="text-gray-500">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email1.opened}</div>
                              <div className="text-gray-500">Opened</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email1.clicked}</div>
                              <div className="text-gray-500">Clicked</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email1.replied}</div>
                              <div className="text-gray-500">Replied</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email1.bounced}</div>
                              <div className="text-gray-500">Bounced</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {campaign.engagement_summary?.email2?.sent > 0 && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Email 2 Performance</div>
                          <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email2.sent}</div>
                              <div className="text-gray-500">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email2.opened}</div>
                              <div className="text-gray-500">Opened</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email2.clicked}</div>
                              <div className="text-gray-500">Clicked</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email2.replied}</div>
                              <div className="text-gray-500">Replied</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{campaign.engagement_summary.email2.bounced}</div>
                              <div className="text-gray-500">Bounced</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                      {campaign.template_id && (
                        <span className="text-blue-600">From template</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}