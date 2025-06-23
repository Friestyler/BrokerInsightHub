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
  Tooltip, 
  Legend,
  Pie 
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  BarChart2, 
  PieChart as PieChartIcon 
} from 'lucide-react';

interface OpportunityStatusProps {
  timeFrame: string;
  region: string;
}

interface Opportunity {
  id: number;
  name: string;
  partner: string;
  customer: string;
  product: string;
  value: number;
  probability: number;
  stage: string;
  estimatedCloseDate: string;
  owner: string;
  region: string;
}

const OpportunityStatus: React.FC<OpportunityStatusProps> = ({ timeFrame, region }) => {
  const [viewMode, setViewMode] = useState<string>('table');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [valueSort, setValueSort] = useState<string>('desc');

  // Sample opportunity data
  const opportunities: Opportunity[] = [
    {
      id: 1,
      name: 'Mortgage Refinancing',
      partner: 'Jeroen Hypotheek Advies',
      customer: 'Van Dijk Familie',
      product: 'Mortgage',
      value: 250000,
      probability: 60,
      stage: 'Proposal',
      estimatedCloseDate: '2025-06-15',
      owner: 'Jeroen van der Meer',
      region: 'North'
    },
    {
      id: 2,
      name: 'Home Sustainability Loan',
      partner: 'Jeroen Hypotheek Advies',
      customer: 'Jansen Gezin',
      product: 'Verduurzamingslening',
      value: 35000,
      probability: 40,
      stage: 'Discovery',
      estimatedCloseDate: '2025-07-10',
      owner: 'Jeroen van der Meer',
      region: 'West'
    },
    {
      id: 3,
      name: 'Investment Product Bundle',
      partner: 'Jeroen Hypotheek Advies',
      customer: 'De Groot BV',
      product: 'Cross-sell',
      value: 42000,
      probability: 75,
      stage: 'Negotiation',
      estimatedCloseDate: '2025-06-30',
      owner: 'Linda Peters',
      region: 'South'
    },
    {
      id: 4,
      name: 'Family Protection Plan',
      partner: 'Jeroen Hypotheek Advies',
      customer: 'Visser Familie',
      product: 'Life Insurance',
      value: 28000,
      probability: 100,
      stage: 'Closed Won',
      estimatedCloseDate: '2025-05-15',
      owner: 'Linda Peters',
      region: 'East'
    },
    {
      id: 5,
      name: 'Office Building Insurance',
      partner: 'ABC Insurance Brokers',
      customer: 'Acme Corporation',
      product: 'Property Insurance',
      value: 125000,
      probability: 50,
      stage: 'Proposal',
      estimatedCloseDate: '2025-06-20',
      owner: 'Sarah Johnson',
      region: 'Central'
    },
    {
      id: 6,
      name: 'Cyber Security Package',
      partner: 'ABC Insurance Brokers',
      customer: 'Acme Corporation',
      product: 'Cyber Security',
      value: 75000,
      probability: 30,
      stage: 'Discovery',
      estimatedCloseDate: '2025-07-15',
      owner: 'Sarah Johnson',
      region: 'Central'
    },
    {
      id: 7,
      name: 'Employee Compensation Plan',
      partner: 'ABC Insurance Brokers',
      customer: 'Umbrella Corporation',
      product: 'Workers Compensation',
      value: 80000,
      probability: 0,
      stage: 'Closed Lost',
      estimatedCloseDate: '2025-05-10',
      owner: 'Michael Brown',
      region: 'North'
    },
    {
      id: 8,
      name: 'Business Liability Coverage',
      partner: 'Insurance Experts',
      customer: 'Tech Solutions Inc',
      product: 'Liability Insurance',
      value: 95000,
      probability: 100,
      stage: 'Closed Won',
      estimatedCloseDate: '2025-05-05',
      owner: 'Emma Williams',
      region: 'West'
    },
    {
      id: 9,
      name: 'Risk Management Assessment',
      partner: 'Insurance Experts',
      customer: 'Green Energy Co',
      product: 'Risk Management',
      value: 110000,
      probability: 65,
      stage: 'Negotiation',
      estimatedCloseDate: '2025-06-25',
      owner: 'Emma Williams',
      region: 'South'
    },
    {
      id: 10,
      name: 'Business Interruption Policy',
      partner: 'Global Assurance',
      customer: 'Retail Chain Ltd',
      product: 'Business Interruption',
      value: 150000,
      probability: 25,
      stage: 'Discovery',
      estimatedCloseDate: '2025-08-10',
      owner: 'Thomas De Vries',
      region: 'East'
    }
  ];

  // Filter opportunities based on selected filters and sort
  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
      const matchesRegion = region === 'all' || opp.region.toLowerCase() === region.toLowerCase();
      return matchesStage && matchesRegion;
    })
    .sort((a, b) => {
      if (valueSort === 'desc') {
        return b.value - a.value;
      } else {
        return a.value - b.value;
      }
    });

  // Calculate opportunity statistics
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => {
    const value = opp.value || 0;
    const probability = opp.stage === 'Closed Won' ? 1.0 : 
                      opp.stage === 'Closed (Won)' ? 1.0 : 
                      opp.stage === 'Negotiation' ? 0.7 :
                      opp.stage === 'Proposal Sent to Client' ? 0.6 :
                      opp.stage === 'Proposal Sent' ? 0.6 :
                      opp.stage === 'Proposal' ? 0.6 :
                      opp.stage === 'proposal' ? 0.6 :
                      opp.stage === 'Qualified Lead' ? 0.4 :
                      opp.stage === 'qualification' ? 0.4 :
                      opp.stage === 'Validated' ? 0.3 :
                      opp.stage === 'Discovery' ? 0.2 :
                      opp.stage === 'discovery' ? 0.2 :
                      opp.stage === 'Closed Lost' ? 0 :
                      opp.stage === 'Lost' ? 0 :
                      opp.stage === 'Rejected' ? 0 :
                      !opp.stage || opp.stage === '' ? 0.1 : 0.1;
    return sum + (value * probability);
  }, 0);
  const averageProbability = opportunities.length > 0 
    ? Math.round(opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length) 
    : 0;
  
  // Count opportunities by stage
  const stageGroups = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for charts
  const stageChartData = Object.entries(stageGroups).map(([stage, count]) => ({
    name: stage,
    value: count
  }));

  // Sum opportunity values by stage
  const stageValueGroups = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + opp.value;
    return acc;
  }, {} as Record<string, number>);

  const stageValueChartData = Object.entries(stageValueGroups).map(([stage, value]) => ({
    name: stage,
    value
  }));

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Get badge for stage
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Discovery':
        return <Badge className="bg-blue-500">Discovery</Badge>;
      case 'Proposal':
        return <Badge className="bg-orange-500">Proposal</Badge>;
      case 'Negotiation':
        return <Badge className="bg-purple-500">Negotiation</Badge>;
      case 'Closed Won':
        return <Badge className="bg-green-500">Closed Won</Badge>;
      case 'Closed Lost':
        return <Badge className="bg-red-500">Closed Lost</Badge>;
      default:
        return <Badge>{stage}</Badge>;
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
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <div className="mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-muted-foreground">Across all stages</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weighted Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weightedValue)}</div>
            <div className="mt-1 flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-muted-foreground">Adjusted by probability</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProbability}%</div>
            <Progress value={averageProbability} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From {opportunities.length} total opportunities
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
            <Clock className="h-4 w-4 mr-2" />
            Table View
          </button>
          <button 
            className={`px-3 py-2 rounded-md flex items-center ${viewMode === 'chart' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            onClick={() => setViewMode('chart')}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Chart View
          </button>
        </div>
        
        <div className="flex space-x-4">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Discovery">Discovery</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Closed Won">Closed Won</SelectItem>
              <SelectItem value="Closed Lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={valueSort} onValueChange={setValueSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Highest Value First</SelectItem>
              <SelectItem value="asc">Lowest Value First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border rounded-md">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-gray-100 rounded-t-md text-sm font-medium">
            <div>Opportunity</div>
            <div>Partner/Customer</div>
            <div>Value</div>
            <div>Stage</div>
            <div>Probability</div>
            <div>Close Date</div>
          </div>

          {filteredOpportunities.map(opp => (
            <div key={opp.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-t">
              <div className="flex items-center">
                <div className="flex flex-col">
                  <div className="font-medium">{opp.name}</div>
                  <div className="text-sm text-gray-500">{opp.product}</div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm font-medium">{opp.partner}</div>
                <div className="text-sm text-gray-500">{opp.customer}</div>
              </div>
              
              <div className="text-sm font-medium">
                {formatCurrency(opp.value)}
              </div>
              
              <div className="flex items-center">
                {getStageBadge(opp.stage)}
              </div>
              
              <div className="flex flex-col">
                <div className="text-sm mb-1">{opp.probability}%</div>
                <Progress value={opp.probability} className="h-2" />
              </div>
              
              <div className="text-sm">
                {new Date(opp.estimatedCloseDate).toLocaleDateString()}
              </div>
            </div>
          ))}

          {filteredOpportunities.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No opportunities found matching your filter criteria
            </div>
          )}
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Opportunities by Stage</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} opportunities`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Value by Stage</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stageValueChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${value/1000}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  <Legend />
                  <Bar dataKey="value" fill="#5567E5">
                    {stageValueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OpportunityStatus;