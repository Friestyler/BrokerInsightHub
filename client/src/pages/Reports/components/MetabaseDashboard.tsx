import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, LineChart, PieChart, ResponsiveContainer, Cell, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Line 
} from 'recharts';
import { 
  Download, Share2, MoreHorizontal, BarChart2, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, TableProperties, RefreshCw, Calendar, Filter 
} from 'lucide-react';

interface MetabaseDashboardProps {
  timeFrame: string;
  region: string;
}

// Data for metrics chart
const metricProgressData = [
  { name: 'Aantal hypotheekaanvragen', progress: 74, target: 100, color: '#5567E5' },
  { name: 'Hypotheek volume', progress: 79, target: 100, color: '#5567E5' },
  { name: '10% turnover increase', progress: 78, target: 100, color: '#36B37E' },
  { name: 'Become preferred partner', progress: 80, target: 100, color: '#36B37E' },
  { name: 'Production efficiency', progress: 80, target: 100, color: '#36B37E' },
  { name: 'Quality conversations', progress: 0, target: 100, color: '#FF5630' },
  { name: 'Open offers discussion', progress: 0, target: 100, color: '#FF5630' },
];

// Data for opportunity by stage
const opportunityByStageData = [
  { name: 'Discovery', value: 325000, count: 4 },
  { name: 'Proposal', value: 555000, count: 4 },
  { name: 'Negotiation', value: 152000, count: 2 },
  { name: 'Closed Won', value: 123000, count: 2 },
  { name: 'Closed Lost', value: 80000, count: 1 },
];

// Data for campaign performance
const campaignPerformanceData = [
  { name: 'HVL', leads: 45, engagementRate: 65, conversionRate: 32 },
  { name: 'HVL24', leads: 62, engagementRate: 75, conversionRate: 40 },
  { name: 'XSELL+', leads: 38, engagementRate: 55, conversionRate: 28 },
  { name: 'LIFE360', leads: 33, engagementRate: 48, conversionRate: 22 },
];

// Data for regional performance
const regionalPerformanceData = [
  { name: 'North', value: 28, color: '#5567E5' },
  { name: 'South', value: 22, color: '#36B37E' },
  { name: 'East', value: 15, color: '#FF5630' },
  { name: 'West', value: 18, color: '#FFAB00' },
  { name: 'Central', value: 17, color: '#8777D9' },
];

// Data for monthly trends
const monthlyTrendsData = [
  { name: 'Jan', mortgage: 15, insurance: 12, crosssell: 8 },
  { name: 'Feb', mortgage: 18, insurance: 13, crosssell: 9 },
  { name: 'Mar', mortgage: 22, insurance: 15, crosssell: 11 },
  { name: 'Apr', mortgage: 25, insurance: 19, crosssell: 14 },
  { name: 'May', mortgage: 32, insurance: 22, crosssell: 16 },
  { name: 'Jun', mortgage: 0, insurance: 0, crosssell: 0 },
];

const COLORS = ['#5567E5', '#36B37E', '#FF5630', '#FFAB00', '#8777D9', '#6554C0'];

const MetabaseDashboard: React.FC<MetabaseDashboardProps> = ({ timeFrame, region }) => {
  const [dashboardTab, setDashboardTab] = useState('metrics');
  const [refreshing, setRefreshing] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Simulate refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Filter data based on region
  const filteredRegionalData = region === 'all' 
    ? regionalPerformanceData 
    : regionalPerformanceData.filter(item => 
        item.name.toLowerCase() === region.toLowerCase()
      );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="w-full">
            <TabsList className="grid w-[600px] grid-cols-4">
              <TabsTrigger value="metrics" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                OKR Metrics
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Opportunity Analysis
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center">
                <LineChartIcon className="h-4 w-4 mr-2" />
                Campaign Insights
              </TabsTrigger>
              <TabsTrigger value="regional" className="flex items-center">
                <TableProperties className="h-4 w-4 mr-2" />
                Regional Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {timeFrame === 'all' ? 'All Time' : timeFrame}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {region === 'all' ? 'All Regions' : region}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* OKR Metrics Dashboard */}
      <TabsContent value="metrics" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-muted-foreground mt-1">Across 4 plans</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56%</div>
              <Progress value={56} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">2</div>
              <div className="text-xs text-muted-foreground mt-1">Requiring immediate attention</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Metric Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={metricProgressData}
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                  <Legend />
                  <Bar dataKey="progress" name="Current Progress" radius={[0, 4, 4, 0]}>
                    {metricProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Performance (KPIs)', value: 3, color: '#5567E5' },
                      { name: 'Commercial Growth', value: 3, color: '#FFAB00' },
                      { name: 'Excellent Agent Plan', value: 4, color: '#36B37E' },
                      { name: 'Intern Actieplan', value: 2, color: '#8777D9' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Performance (KPIs)', value: 3, color: '#5567E5' },
                      { name: 'Commercial Growth', value: 3, color: '#FFAB00' },
                      { name: 'Excellent Agent Plan', value: 4, color: '#36B37E' },
                      { name: 'Intern Actieplan', value: 2, color: '#8777D9' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} metrics`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Opportunity Analysis Dashboard */}
      <TabsContent value="opportunities" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 1,235,000</div>
              <div className="text-xs text-muted-foreground mt-1">13 active opportunities</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 596,850</div>
              <div className="text-xs text-muted-foreground mt-1">Adjusted by probability</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48%</div>
              <Progress value={48} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 95,000</div>
              <div className="text-xs text-muted-foreground mt-1">+12% from last period</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Opportunity by Stage</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={opportunityByStageData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${value/1000}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  <Legend />
                  <Bar dataKey="value" name="Pipeline Value" fill="#5567E5" />
                  <Bar dataKey="count" name="# Opportunities" fill="#36B37E" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Product Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mortgage', value: 355000, color: '#5567E5' },
                      { name: 'Life Insurance', value: 28000, color: '#FFAB00' },
                      { name: 'Property Insurance', value: 570000, color: '#36B37E' },
                      { name: 'Risk Management', value: 110000, color: '#8777D9' },
                      { name: 'Liability', value: 160000, color: '#FF5630' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Mortgage', value: 355000, color: '#5567E5' },
                      { name: 'Life Insurance', value: 28000, color: '#FFAB00' },
                      { name: 'Property Insurance', value: 570000, color: '#36B37E' },
                      { name: 'Risk Management', value: 110000, color: '#8777D9' },
                      { name: 'Liability', value: 160000, color: '#FF5630' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Campaign Insights Dashboard */}
      <TabsContent value="campaigns" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-muted-foreground mt-1">3 more in planning</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">178</div>
              <div className="text-xs text-muted-foreground mt-1">+22% from last month</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">61%</div>
              <Progress value={61} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campaign Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 1,335,000</div>
              <div className="text-xs text-muted-foreground mt-1">From all active campaigns</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'leads') return [value, 'Leads Generated'];
                    return [`${value}%`, name === 'engagementRate' ? 'Engagement Rate' : 'Conversion Rate'];
                  }} />
                  <Legend />
                  <Bar dataKey="engagementRate" name="Engagement Rate" fill="#5567E5" />
                  <Bar dataKey="conversionRate" name="Conversion Rate" fill="#36B37E" />
                  <Bar dataKey="leads" name="Leads" fill="#FFAB00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mortgage" name="Mortgage Campaigns" stroke="#5567E5" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="insurance" name="Insurance Campaigns" stroke="#36B37E" strokeWidth={2} />
                  <Line type="monotone" dataKey="crosssell" name="Cross-sell Campaigns" stroke="#FFAB00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Regional Dashboard */}
      <TabsContent value="regional" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRegionalData.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Active in reporting period</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">North</div>
              <div className="text-xs text-muted-foreground mt-1">28% of total performance</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Regional Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">13%</div>
              <div className="text-xs text-muted-foreground mt-1">Between best and worst region</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Regional Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredRegionalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {filteredRegionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Regional Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] overflow-auto">
              <div className="space-y-6">
                {filteredRegionalData.map((region) => (
                  <div key={region.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{region.name}</h3>
                      <span className="text-sm text-gray-500">{region.value}%</span>
                    </div>
                    <Progress value={region.value} className="h-2" indicatorColor={region.color} />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Partners</div>
                        <div className="font-medium">{Math.floor(Math.random() * 10) + 5}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Opportunities</div>
                        <div className="font-medium">{Math.floor(Math.random() * 20) + 10}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Revenue</div>
                        <div className="font-medium">€{(Math.floor(Math.random() * 300) + 100)}k</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </div>
  );
};

export default MetabaseDashboard;