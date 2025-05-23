import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area
} from 'recharts';

// Sample data - Opportunity by Quarter
const quarterlyData = [
  { quarter: 'Q1 2025', value: 345000, deals: 4 },
  { quarter: 'Q2 2025', value: 563000, deals: 6 },
  { quarter: 'Q3 2025', value: 522000, deals: 7 },
  { quarter: 'Q4 2025', value: 330000, deals: 3 },
];

// Sample data - Partners
const partnerData = [
  { name: 'Jeroen Hypotheek Advies', value: 355000 },
  { name: 'ABC Insurance Brokers', value: 280000 },
  { name: 'Insurance Experts', value: 205000 },
  { name: 'Global Assurance', value: 350000 },
  { name: 'Regional Brokers', value: 110000 },
  { name: 'Elite Insurance', value: 430000 },
];

// Sample data - Stage Distribution
const stageData = [
  { name: 'Qualification', value: 215000 },
  { name: 'Discovery', value: 185000 },
  { name: 'Proposal', value: 580000 },
  { name: 'Negotiation', value: 332000 },
  { name: 'Closed Won', value: 373000 },
  { name: 'Closed Lost', value: 80000 },
];

// Sample data - Product Category Comparison
const productCategoryData = [
  { 
    category: 'Mortgage',
    revenue: 250000,
    deals: 1,
    avgSize: 250000
  },
  { 
    category: 'Life Insurance',
    revenue: 28000,
    deals: 1,
    avgSize: 28000
  },
  { 
    category: 'Property',
    revenue: 375000,
    deals: 2,
    avgSize: 187500
  },
  { 
    category: 'Liability',
    revenue: 160000,
    deals: 2,
    avgSize: 80000
  },
  { 
    category: 'Fleet',
    revenue: 180000,
    deals: 1,
    avgSize: 180000
  },
  { 
    category: 'Special',
    revenue: 115000,
    deals: 2,
    avgSize: 57500
  },
];

// Sample data - Performance Trend
const performanceTrendData = [
  { month: 'Jan', actual: 80000, target: 100000 },
  { month: 'Feb', actual: 120000, target: 120000 },
  { month: 'Mar', actual: 145000, target: 140000 },
  { month: 'Apr', actual: 160000, target: 160000 },
  { month: 'May', actual: 203000, target: 180000 },
  { month: 'Jun', actual: 220000, target: 200000 },
  { month: 'Jul', actual: 230000, target: 220000 },
  { month: 'Aug', actual: 290000, target: 240000 },
];

// Custom colors
const COLORS = ['#5567E5', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

// Currency formatter
const formatCurrency = (value: number) => {
  return `€${value.toLocaleString('en-US')}`;
};

export default function RechartsReport() {
  const [timeFrame, setTimeFrame] = useState('ytd');
  const [compareMode, setCompareMode] = useState('prev-year');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Opportunity Insights</h3>
        <div className="flex gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={compareMode} onValueChange={setCompareMode}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prev-year">vs. Previous Year</SelectItem>
              <SelectItem value="target">vs. Target</SelectItem>
              <SelectItem value="none">No Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quarterly Chart */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Quarterly Opportunity Value</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `€${value / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'value') return formatCurrency(value as number);
                    return value;
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" name="Value" fill="#5567E5" barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="deals" name="Deals" stroke="#22C55E" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Partner Distribution */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Partner Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partnerData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {partnerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Stage Distribution */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Opportunity by Stage</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#5567E5">
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Trend */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Performance Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#5567E5" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Product Category Analysis */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Product Category Analysis</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `€${value / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value} />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue' || name === 'avgSize') return formatCurrency(value as number);
                  return value;
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#5567E5" barSize={50} />
                <Bar yAxisId="left" dataKey="avgSize" name="Avg. Deal Size" fill="#22C55E" barSize={50} />
                <Line yAxisId="right" type="monotone" dataKey="deals" name="Deals" stroke="#F59E0B" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}