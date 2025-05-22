import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  PieChart, 
  ResponsiveContainer, 
  Cell, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend,
  Pie, 
  LineChart,
  Line 
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Users, 
  CalendarClock, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart2 
} from 'lucide-react';

interface CampaignEngagementProps {
  timeFrame: string;
  region: string;
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  participants: number;
  engagementRate: number;
  conversionRate: number;
  leads: number;
  opportunities: number;
  revenue: number;
  owner: string;
  tags: string[];
}

// Data for engagement rates over time
const engagementTrend = [
  { month: 'Jan', value: 25 },
  { month: 'Feb', value: 28 },
  { month: 'Mar', value: 32 },
  { month: 'Apr', value: 45 },
  { month: 'May', value: 52 },
  { month: 'Jun', value: 0 },
];

// Data for campaign performance comparison
const campaignComparison = [
  { name: 'HVL', engagementRate: 65, conversionRate: 32, leads: 45 },
  { name: 'HVL24', engagementRate: 75, conversionRate: 40, leads: 62 },
  { name: 'XSELL+', engagementRate: 55, conversionRate: 28, leads: 38 },
  { name: 'LIFE360', engagementRate: 48, conversionRate: 22, leads: 33 },
];

const CampaignEngagement: React.FC<CampaignEngagementProps> = ({ timeFrame, region }) => {
  const [viewMode, setViewMode] = useState<string>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Sample data for campaigns
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Hypotheek Vernieuwers Leven (HVL)',
      type: 'Mortgage',
      status: 'Active',
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      participants: 120,
      engagementRate: 65,
      conversionRate: 32,
      leads: 45,
      opportunities: 28,
      revenue: 420000,
      owner: 'Sarah Johnson',
      tags: ['mortgage', 'renewal', 'priority']
    },
    {
      id: 2,
      name: 'HVL24 Renew & Grow',
      type: 'Mortgage',
      status: 'Active',
      startDate: '2025-03-01',
      endDate: '2025-10-31',
      participants: 85,
      engagementRate: 75,
      conversionRate: 40,
      leads: 62,
      opportunities: 35,
      revenue: 525000,
      owner: 'Michael Brown',
      tags: ['mortgage', 'growth', 'priority']
    },
    {
      id: 3,
      name: 'Cross-Sell Expansion (XSELL+)',
      type: 'Cross-Sell',
      status: 'Active',
      startDate: '2025-02-15',
      endDate: '2025-08-15',
      participants: 95,
      engagementRate: 55,
      conversionRate: 28,
      leads: 38,
      opportunities: 22,
      revenue: 210000,
      owner: 'Emma Williams',
      tags: ['cross-sell', 'existing-customers']
    },
    {
      id: 4,
      name: 'Life Protection Program (LIFE360)',
      type: 'Insurance',
      status: 'Active',
      startDate: '2025-01-10',
      endDate: '2025-07-30',
      participants: 110,
      engagementRate: 48,
      conversionRate: 22,
      leads: 33,
      opportunities: 18,
      revenue: 180000,
      owner: 'Thomas De Vries',
      tags: ['insurance', 'life', 'protection']
    },
    {
      id: 5,
      name: 'Sustainable Home Renovation',
      type: 'Mortgage',
      status: 'Planning',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      participants: 0,
      engagementRate: 0,
      conversionRate: 0,
      leads: 0,
      opportunities: 0,
      revenue: 0,
      owner: 'Linda Peters',
      tags: ['mortgage', 'sustainability', 'renovation']
    },
    {
      id: 6,
      name: 'Business Protection Bundle',
      type: 'Insurance',
      status: 'Completed',
      startDate: '2024-11-01',
      endDate: '2025-04-30',
      participants: 65,
      engagementRate: 42,
      conversionRate: 20,
      leads: 25,
      opportunities: 15,
      revenue: 175000,
      owner: 'Sarah Johnson',
      tags: ['business', 'insurance', 'protection']
    },
    {
      id: 7,
      name: 'First-Time Homebuyers Workshop',
      type: 'Education',
      status: 'Completed',
      startDate: '2025-02-01',
      endDate: '2025-03-31',
      participants: 130,
      engagementRate: 85,
      conversionRate: 15,
      leads: 42,
      opportunities: 12,
      revenue: 150000,
      owner: 'Michael Brown',
      tags: ['education', 'first-time', 'mortgage']
    }
  ];

  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesStatus && matchesType;
  });

  // Calculate statistics for active campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const totalParticipants = activeCampaigns.reduce((sum, c) => sum + c.participants, 0);
  const avgEngagementRate = activeCampaigns.length > 0 
    ? Math.round(activeCampaigns.reduce((sum, c) => sum + c.engagementRate, 0) / activeCampaigns.length) 
    : 0;
  const totalLeads = activeCampaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalRevenue = activeCampaigns.reduce((sum, c) => sum + c.revenue, 0);

  // Calculate campaign type distribution
  const typeDistribution = campaigns.reduce((acc, campaign) => {
    acc[campaign.type] = (acc[campaign.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Chart colors
  const COLORS = ['#5567E5', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Get badge for campaign status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'Planning':
        return <Badge className="bg-blue-500">Planning</Badge>;
      case 'Completed':
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <div className="mt-1 flex items-center">
              <CalendarClock className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-muted-foreground">Currently running</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <div className="mt-1 flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm text-muted-foreground">Across active campaigns</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagementRate}%</div>
            <Progress value={avgEngagementRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-muted-foreground">From {totalLeads} leads</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex space-x-4 justify-between">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-2 rounded-md flex items-center ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            onClick={() => setViewMode('table')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Campaign List
          </button>
          <button 
            className={`px-3 py-2 rounded-md flex items-center ${viewMode === 'chart' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            onClick={() => setViewMode('chart')}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance Charts
          </button>
        </div>
        
        <div className="flex space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Mortgage">Mortgage</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Cross-Sell">Cross-Sell</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border rounded-md">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-gray-100 rounded-t-md text-sm font-medium">
            <div>Campaign</div>
            <div>Type</div>
            <div>Status / Timeline</div>
            <div>Participation</div>
            <div>Engagement</div>
            <div>Performance</div>
          </div>

          {filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-t">
              <div className="flex flex-col">
                <div className="font-medium">{campaign.name}</div>
                <div className="text-sm text-gray-500">Owner: {campaign.owner}</div>
              </div>
              
              <div className="flex items-center">
                <Badge variant="outline" className="bg-gray-100">
                  {campaign.type}
                </Badge>
              </div>
              
              <div className="flex flex-col">
                <div className="mb-1">{getStatusBadge(campaign.status)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{campaign.participants}</span>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm mb-1">{campaign.engagementRate}%</div>
                <Progress 
                  value={campaign.engagementRate} 
                  className="h-2"
                />
              </div>
              
              <div className="flex flex-col text-sm">
                <div className="flex justify-between">
                  <span>Leads:</span>
                  <span>{campaign.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conv. Rate:</span>
                  <span>{campaign.conversionRate}%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Revenue:</span>
                  <span>{formatCurrency(campaign.revenue)}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredCampaigns.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No campaigns found matching your filter criteria
            </div>
          )}
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Campaign Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} campaigns`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Monthly Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={engagementTrend}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Engagement Rate']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Engagement Rate" 
                      stroke="#5567E5" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Campaign Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignComparison}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'leads') return [value, 'Leads Generated'];
                    return [`${value}%`, name === 'engagementRate' ? 'Engagement Rate' : 'Conversion Rate'];
                  }} />
                  <Legend />
                  <Bar dataKey="engagementRate" name="Engagement Rate" fill="#5567E5" />
                  <Bar dataKey="conversionRate" name="Conversion Rate" fill="#00C49F" />
                  <Bar dataKey="leads" name="Leads" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignEngagement;