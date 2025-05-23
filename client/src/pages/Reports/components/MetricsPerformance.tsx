import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Filter, Tag } from 'lucide-react';

interface MetricsPerformanceProps {
  timeFrame: string;
  region: string;
}

interface Metric {
  id: number;
  name: string;
  plan: string;
  planTag: string;
  planColor: string;
  team: string;
  teamTag: string;
  recordName: string;
  recordType: string;
  partner: string;
  milestone: string;
  realized: string;
  target: string;
  progress: number;
  tags: string[];
}

const MetricsPerformance: React.FC<MetricsPerformanceProps> = ({ timeFrame, region }) => {
  const [activeView, setActiveView] = useState<string>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data for metrics
  const metrics: Metric[] = [
    {
      id: 1,
      name: '10% turnover increase in product X',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Antwerpen',
      teamTag: 'SSp',
      recordName: 'Antwerpen',
      recordType: 'Partner',
      partner: 'Antwerpen',
      milestone: 'May',
      realized: '0 €',
      target: '8.1',
      progress: 0,
      tags: ['growth', 'sales', 'priority']
    },
    {
      id: 2,
      name: 'Product training',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Else',
      teamTag: 'AGP',
      recordName: 'Else',
      recordType: 'Partner',
      partner: 'Else',
      milestone: 'May',
      realized: '2 / 3 #',
      target: '8.1',
      progress: 67,
      tags: ['training', 'development']
    },
    {
      id: 3,
      name: 'Commercial Action',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Evergem',
      teamTag: 'SSp',
      recordName: 'Evergem',
      recordType: 'Partner',
      partner: 'Evergem',
      milestone: 'May',
      realized: '0 / 12 #',
      target: '8.1',
      progress: 0,
      tags: ['sales', 'action']
    },
    {
      id: 4,
      name: 'Desired amount of leads',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Gent',
      teamTag: 'BPa',
      recordName: 'Gent',
      recordType: 'Partner',
      partner: 'Gent',
      milestone: 'May',
      realized: '25 / 100 #',
      target: '8.1',
      progress: 25,
      tags: ['leads', 'acquisition', 'priority']
    },
    {
      id: 5,
      name: 'Ambition on amount of contracts',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Lochristi',
      teamTag: 'SSp',
      recordName: 'Lochristi',
      recordType: 'Partner',
      partner: 'Lochristi',
      milestone: 'May',
      realized: '3 / 20 #',
      target: '8.1',
      progress: 15,
      tags: ['contracts', 'closings']
    },
    {
      id: 6,
      name: 'National Marketing Campaign support',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Melle',
      teamTag: 'SSp',
      recordName: 'Melle',
      recordType: 'Partner',
      partner: 'Melle',
      milestone: 'May',
      realized: '1 / 8 #',
      target: '8.1',
      progress: 13,
      tags: ['marketing', 'support']
    },
    {
      id: 7,
      name: 'Breakfast Seminar Legal Update',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      team: 'Verzekeringskantoor',
      teamTag: 'BPa',
      recordName: 'Verzekeringskantoor',
      recordType: 'Partner',
      partner: 'Verzekeringskantoor',
      milestone: 'May',
      realized: '0 / 0 completed',
      target: '8.1',
      progress: 0,
      tags: ['event', 'legal', 'education']
    }
  ];

  // Filter metrics based on search query and selected tag
  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = searchQuery === '' || 
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.partner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || metric.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Sort metrics based on current sort field and direction
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    const aValue = a[sortField as keyof Metric];
    const bValue = b[sortField as keyof Metric];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Toggle sort direction or change sort field
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique tags from all metrics
  const allTags = Array.from(new Set(metrics.flatMap(metric => metric.tags)));
  
  // Get progress color based on value
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search metrics, plans, or partners..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[180px]">
            <Tag className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      <TabsContent value="list" className="mt-0">
        <div className="border rounded-md">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-gray-100 rounded-t-md text-sm font-medium">
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('name')}>
              OKRs
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('plan')}>
              PLANS
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('recordName')}>
              RECORD NAME
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('team')}>
              TEAM
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('recordType')}>
              RECORD TYPE
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('partner')}>
              PARTNERS
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleSort('progress')}>
              MILESTONE/PROGRESS
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </div>

          {sortedMetrics.map(metric => (
            <div key={metric.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-t hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                <span>{metric.name}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${metric.planColor} text-white flex items-center justify-center text-xs font-bold mr-2`}>
                  {metric.planTag}
                </div>
                <span className="truncate text-sm">{metric.plan}</span>
              </div>
              <div className="text-sm truncate">{metric.recordName}</div>
              <div className="flex items-center">
                <div className="bg-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                  {metric.teamTag}
                </div>
              </div>
              <div className="text-sm">{metric.recordType}</div>
              <div className="text-sm truncate">{metric.partner}</div>
              <div className="flex flex-col">
                <div className="text-sm mb-1 flex justify-between">
                  <span>{metric.milestone}</span>
                  <span>{metric.realized}</span>
                </div>
                <Progress 
                  value={metric.progress} 
                  className="h-2" 
                  indicatorColor={getProgressColor(metric.progress)}
                />
              </div>
            </div>
          ))}

          {filteredMetrics.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No metrics found matching your search criteria
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="matrix" className="mt-0">
        <div className="border rounded-md p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Matrix View</h3>
          <p className="text-gray-500">This view will show metrics in a matrix format, organized by tags and metric groups.</p>
          <p className="text-sm mt-4">This view will be implemented in the next phase.</p>
        </div>
      </TabsContent>
    </div>
  );
};

export default MetricsPerformance;