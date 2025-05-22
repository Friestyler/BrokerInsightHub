import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  PieChart, 
  LineChart,
  AreaChart,
  ScatterChart
} from '@mui/x-charts';

// Mock data for the dashboard
const monthlyTrend = [
  { month: 'Jan', value: 210000 },
  { month: 'Feb', value: 190000 },
  { month: 'Mar', value: 320000 },
  { month: 'Apr', value: 290000 },
  { month: 'May', value: 250000 },
  { month: 'Jun', value: 380000 },
  { month: 'Jul', value: 420000 },
  { month: 'Aug', value: 390000 },
  { month: 'Sep', value: 450000 },
  { month: 'Oct', value: 410000 },
  { month: 'Nov', value: 380000 },
  { month: 'Dec', value: 430000 },
];

// Partner performance
const partnerPerformance = [
  { name: 'Jeroen Hypotheek Advies', value: 355000, target: 400000 },
  { name: 'ABC Insurance Brokers', value: 280000, target: 300000 },
  { name: 'Insurance Experts', value: 205000, target: 250000 },
  { name: 'Global Assurance', value: 350000, target: 300000 },
  { name: 'Regional Brokers', value: 110000, target: 150000 },
  { name: 'Elite Insurance', value: 430000, target: 400000 },
];

// Type distribution data
const typeDistribution = [
  { id: 0, value: 40, label: 'New Business' },
  { id: 1, value: 25, label: 'Cross-sell' },
  { id: 2, value: 20, label: 'Upsell' },
  { id: 3, value: 15, label: 'Renewal' },
];

// KPIs for the dashboard
const kpis = [
  { 
    name: 'Total Value', 
    value: '€1.73M', 
    change: '+15%', 
    progress: 72,
    trend: [210, 230, 245, 270, 310, 350, 390, 420]
  },
  { 
    name: 'Win Rate', 
    value: '26%', 
    change: '+5%', 
    progress: 26,
    trend: [15, 18, 20, 22, 19, 24, 26, 26]
  },
  { 
    name: 'Avg. Deal Size', 
    value: '€115K', 
    change: '+10%', 
    progress: 65,
    trend: [85, 90, 95, 100, 105, 110, 115, 115]
  },
  { 
    name: 'Deals in Pipeline', 
    value: '15', 
    change: '+3', 
    progress: 60,
    trend: [8, 9, 11, 10, 12, 13, 14, 15]
  },
];

// Deal scatter data
const dealScatterData = [
  { x: 110000, y: 65, id: 1, size: 100 },
  { x: 250000, y: 60, id: 2, size: 200 },
  { x: 35000, y: 40, id: 3, size: 60 },
  { x: 75000, y: 30, id: 4, size: 80 },
  { x: 42000, y: 75, id: 5, size: 70 },
  { x: 95000, y: 90, id: 6, size: 100 },
  { x: 150000, y: 25, id: 7, size: 150 },
  { x: 80000, y: 0, id: 8, size: 80 },
  { x: 110000, y: 65, id: 9, size: 110 },
  { x: 200000, y: 80, id: 10, size: 200 },
  { x: 28000, y: 100, id: 11, size: 50 },
  { x: 180000, y: 70, id: 12, size: 180 },
];

export default function MUIChartDashboard() {
  const [period, setPeriod] = useState('year');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Performance Dashboard</h3>
          <p className="text-sm text-gray-500">Visualize key metrics with Material UI charts</p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{kpi.name}</h4>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <span className={`text-sm font-medium ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
              </div>
              <Progress value={kpi.progress} className="h-1 mb-3" />
              
              <div className="h-12">
                <LineChart
                  xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8], scaleType: 'band' }]}
                  series={[{ data: kpi.trend, area: true, showMark: false }]}
                  height={50}
                  margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Opportunity Trend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Monthly Opportunity Value</h3>
            <div style={{ height: 300, width: '100%' }}>
              <BarChart
                series={[
                  {
                    data: monthlyTrend.map(item => item.value),
                    label: 'Value',
                    color: '#5567E5',
                  },
                ]}
                xAxis={[
                  {
                    data: monthlyTrend.map(item => item.month),
                    scaleType: 'band',
                  },
                ]}
                yAxis={[
                  {
                    label: 'Value (€)',
                  },
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Type Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Opportunity Type Distribution</h3>
            <div style={{ height: 300, width: '100%' }}>
              <PieChart
                series={[
                  {
                    data: typeDistribution,
                    innerRadius: 60,
                    outerRadius: 120,
                    paddingAngle: 1,
                    cornerRadius: 4,
                    startAngle: -180,
                    endAngle: 180,
                    cx: 150,
                    cy: 150,
                  },
                ]}
                height={300}
                slotProps={{
                  legend: {
                    direction: 'column',
                    position: { vertical: 'middle', horizontal: 'right' },
                    padding: 0,
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Partner Performance */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Partner Performance vs Target</h3>
            <div style={{ height: 300, width: '100%' }}>
              <BarChart
                series={[
                  {
                    data: partnerPerformance.map(item => item.value),
                    label: 'Actual',
                    color: '#5567E5',
                  },
                  {
                    data: partnerPerformance.map(item => item.target),
                    label: 'Target',
                    color: '#F59E0B',
                  },
                ]}
                xAxis={[
                  {
                    data: partnerPerformance.map(item => item.name.split(' ')[0]),
                    scaleType: 'band',
                  },
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Deal Opportunity Map */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Deal Opportunity Map</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ScatterChart
                series={[
                  {
                    data: dealScatterData.map((item) => ({
                      x: item.x,
                      y: item.y,
                      id: item.id
                    })),
                    label: 'Deals',
                    valueFormatter: (value: any) => 
                      `Value: €${value.x.toLocaleString()}\nProbability: ${value.y}%`,
                  },
                ]}
                xAxis={[
                  {
                    label: 'Deal Value (€)',
                  },
                ]}
                yAxis={[
                  {
                    label: 'Probability (%)',
                  },
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}