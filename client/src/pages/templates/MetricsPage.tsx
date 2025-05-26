import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for metrics
const mockMetrics = [
  {
    id: 1,
    title: "Revenue Goal",
    description: "Revenue target for the partnership",
    unit: "currency",
    targetValue: 1000000,
    hierarchy: "objective",
    tags: ["Financial", "Revenue", "Partner"],
    parent: null,
    children: [3, 4],
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-04-15"),
  },
  {
    id: 2,
    title: "Pipeline New Business",
    description: "Target for pipeline of new business opportunities",
    unit: "currency",
    targetValue: 2000000,
    hierarchy: "objective",
    tags: ["Financial", "Pipeline", "Sales"],
    parent: null,
    children: [],
    createdAt: new Date("2025-03-12"),
    updatedAt: new Date("2025-04-16"),
  },
  {
    id: 3,
    title: "Training & Certification",
    description: "Complete required training and certification courses",
    unit: "boolean",
    targetValue: 1,
    hierarchy: "activity",
    tags: ["Training", "Certification", "People"],
    parent: 1,
    children: [9],
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-04-10"),
  },
  {
    id: 4,
    title: "Marketing Development Funds",
    description: "Allocated marketing development funds",
    unit: "currency",
    targetValue: 100000,
    hierarchy: "activity",
    tags: ["Financial", "Marketing", "Budget"],
    parent: 1,
    children: [],
    createdAt: new Date("2025-03-18"),
    updatedAt: new Date("2025-04-12"),
  },
  {
    id: 5,
    title: "Co-branded Campaigns",
    description: "Number of co-branded campaigns to launch",
    unit: "number",
    targetValue: 4,
    hierarchy: "objective",
    tags: ["Marketing", "Campaign", "Brand"],
    parent: null,
    children: [6],
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-04-10"),
  },
  {
    id: 6,
    title: "Website Overhaul",
    description: "Complete website redesign project",
    unit: "boolean",
    targetValue: 1,
    hierarchy: "activity",
    tags: ["Digital", "Website", "Marketing"],
    parent: 5,
    children: [],
    createdAt: new Date("2025-02-20"),
    updatedAt: new Date("2025-04-05"),
  },
  {
    id: 7,
    title: "Customer Satisfaction",
    description: "CSAT score target",
    unit: "percentage",
    targetValue: 95,
    hierarchy: "objective",
    tags: ["Customer", "Support", "Quality"],
    parent: null,
    children: [8],
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-03-05"),
  },
  {
    id: 8,
    title: "Response Time",
    description: "Average time to first response in hours",
    unit: "number",
    targetValue: 4,
    hierarchy: "activity",
    tags: ["Support", "Service", "Quality"],
    parent: 7,
    children: [10],
    createdAt: new Date("2025-01-22"),
    updatedAt: new Date("2025-03-10"),
  },
  {
    id: 9,
    title: "Document Review Sessions",
    description: "Number of document review sessions with team",
    unit: "number",
    targetValue: 6,
    hierarchy: "subactivity",
    tags: ["Training", "Certification"],
    parent: 3,
    children: [],
    createdAt: new Date("2025-03-16"),
    updatedAt: new Date("2025-04-11"),
  },
  {
    id: 10,
    title: "Customer Support Scripts",
    description: "Creation of standard customer support scripts",
    unit: "boolean",
    targetValue: 1,
    hierarchy: "subactivity",
    tags: ["Support", "Service"],
    parent: 8,
    children: [],
    createdAt: new Date("2025-01-25"),
    updatedAt: new Date("2025-03-12"),
  }
];

// Mock data for tags
const mockTags = [
  { id: 1, name: "Financial", color: "green" },
  { id: 2, name: "Marketing", color: "purple" },
  { id: 3, name: "Customer", color: "blue" },
  { id: 4, name: "Support", color: "cyan" },
  { id: 5, name: "Sales", color: "amber" },
  { id: 6, name: "Digital", color: "indigo" },
  { id: 7, name: "Training", color: "orange" },
  { id: 8, name: "People", color: "pink" },
  { id: 9, name: "Revenue", color: "emerald" },
  { id: 10, name: "Pipeline", color: "yellow" },
  { id: 11, name: "Certification", color: "rose" },
  { id: 12, name: "Budget", color: "lime" },
  { id: 13, name: "Campaign", color: "fuchsia" },
  { id: 14, name: "Brand", color: "red" },
  { id: 15, name: "Website", color: "violet" },
  { id: 16, name: "Quality", color: "sky" },
  { id: 17, name: "Service", color: "teal" },
  { id: 18, name: "Partner", color: "slate" },
];

// Mock data for metric groups
const mockMetricGroups = [
  {
    id: 1,
    name: "Focus Partner Plan",
    description: "Standard metrics for managing partner relationships and performance",
    tags: ["Partner", "Financial", "Marketing"],
    metrics: [1, 2, 3, 4],
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-04-18"),
  },
  {
    id: 2,
    name: "Marketing Plan",
    description: "Metrics for tracking marketing performance and initiatives",
    tags: ["Marketing", "Campaign", "Digital"],
    metrics: [4, 5, 6],
    createdAt: new Date("2025-02-28"),
    updatedAt: new Date("2025-04-15"),
  },
  {
    id: 3,
    name: "Customer Support Goals",
    description: "Metrics for measuring customer support performance",
    tags: ["Customer", "Support", "Service", "Quality"],
    metrics: [7, 8],
    createdAt: new Date("2025-01-25"),
    updatedAt: new Date("2025-03-15"),
  }
];

// Sample OKR data grouped by tags
const mockOKRs = [
  {
    id: 1,
    title: "Increase Annual Recurring Revenue by 40%",
    description: "Grow our subscription revenue through new acquisitions and expansion",
    type: "Objective",
    progress: 65,
    targetValue: 5000000,
    currentValue: 3250000,
    unit: "currency",
    status: "On Track",
    owner: "Sarah Chen",
    dueDate: new Date('2024-12-31'),
    tag: "Revenue Growth"
  },
  {
    id: 2,
    title: "Launch 3 Major Product Features",
    description: "Deliver key features to improve customer satisfaction and retention",
    type: "Objective", 
    progress: 33,
    targetValue: 3,
    currentValue: 1,
    unit: "number",
    status: "Behind Schedule",
    owner: "Mike Rodriguez",
    dueDate: new Date('2024-11-30'),
    tag: "Product Innovation"
  },
  {
    id: 3,
    title: "Achieve 95% Customer Satisfaction Score",
    description: "Maintain high customer satisfaction through excellent service delivery",
    type: "Objective",
    progress: 88,
    targetValue: 95,
    currentValue: 84,
    unit: "percentage",
    status: "On Track",
    owner: "Emily Johnson",
    dueDate: new Date('2024-12-31'),
    tag: "Customer Success"
  },
  {
    id: 4,
    title: "Reduce Customer Churn to Below 5%",
    description: "Implement retention strategies to minimize customer loss",
    type: "Key Result",
    progress: 70,
    targetValue: 5,
    currentValue: 6.5,
    unit: "percentage",
    status: "On Track",
    owner: "Emily Johnson",
    dueDate: new Date('2024-12-31'),
    tag: "Customer Success"
  },
  {
    id: 5,
    title: "Expand to 2 New Geographic Markets",
    description: "Enter European and Asian markets to diversify revenue streams",
    type: "Objective",
    progress: 50,
    targetValue: 2,
    currentValue: 1,
    unit: "number",
    status: "On Track",
    owner: "David Wilson",
    dueDate: new Date('2024-10-31'),
    tag: "Market Expansion"
  },
  {
    id: 6,
    title: "Achieve $2M Monthly Recurring Revenue",
    description: "Reach sustainable monthly revenue milestone",
    type: "Key Result",
    progress: 75,
    targetValue: 2000000,
    currentValue: 1500000,
    unit: "currency",
    status: "On Track",
    owner: "Sarah Chen",
    dueDate: new Date('2024-12-31'),
    tag: "Revenue Growth"
  }
];

const TagBadge = ({ tag }: { tag: string }) => {
  // Get a consistent color for each tag based on a simple hash function
  const getTagColor = (tag: string) => {
    const tagColors = {
      "Financial": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Revenue": "bg-green-100 text-green-800 border-green-200",
      "Partner": "bg-blue-100 text-blue-800 border-blue-200",
      "Pipeline": "bg-amber-100 text-amber-800 border-amber-200",
      "Sales": "bg-orange-100 text-orange-800 border-orange-200",
      "Training": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Certification": "bg-violet-100 text-violet-800 border-violet-200",
      "People": "bg-pink-100 text-pink-800 border-pink-200",
      "Marketing": "bg-purple-100 text-purple-800 border-purple-200",
      "Budget": "bg-lime-100 text-lime-800 border-lime-200",
      "Digital": "bg-sky-100 text-sky-800 border-sky-200",
      "Website": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Campaign": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      "Brand": "bg-red-100 text-red-800 border-red-200",
      "Customer": "bg-teal-100 text-teal-800 border-teal-200",
      "Support": "bg-slate-100 text-slate-800 border-slate-200",
      "Service": "bg-gray-100 text-gray-800 border-gray-200",
      "Quality": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Revenue Growth": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Product Innovation": "bg-blue-100 text-blue-800 border-blue-200",
      "Customer Success": "bg-teal-100 text-teal-800 border-teal-200",
      "Market Expansion": "bg-purple-100 text-purple-800 border-purple-200",
    };
    
    return tagColors[tag] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  return (
    <Badge 
      variant="outline"
      className={`mr-2 mb-1 font-semibold ${getTagColor(tag)}`}
      style={{ fontSize: '15px', fontFamily: 'Poppins' }}
    >
      {tag}
    </Badge>
  );
};

const formatTargetValue = (value: number | undefined, unit: string) => {
  if (value === undefined) return "-";
  
  switch (unit) {
    case "currency":
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    case "percentage":
      return `${value}%`;
    case "boolean":
      return value === 1 ? "Complete" : "Not Complete";
    default:
      return value.toString();
  }
};

export default function MetricsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("metrics");
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Filtered metrics based on search and selected tags
  const filteredMetrics = mockMetrics.filter(metric => {
    const matchesSearch = searchTerm === "" || 
      metric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => metric.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Filter groups based on search and tags
  const filteredGroups = mockMetricGroups.filter(group => {
    const matchesSearch = searchTerm === "" || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => group.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Toggle metric selection
  const toggleMetricSelection = (id: number) => {
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle expansion of a metric
  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all metrics
  const handleSelectAllMetrics = (checked: boolean) => {
    if (checked) {
      setSelectedMetrics(filteredMetrics.map(m => m.id));
    } else {
      setSelectedMetrics([]);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedMetrics([]);
  };

  // Helper function to build the hierarchical structure
  const buildHierarchicalView = () => {
    // Start with top-level objectives
    const objectives = filteredMetrics.filter(m => m.hierarchy === "objective");
    const result: any[] = [];

    objectives.forEach(objective => {
      result.push({
        ...objective,
        level: 0
      });

      // Add activities under this objective
      const activities = filteredMetrics.filter(m => m.parent === objective.id);
      activities.forEach(activity => {
        if (expandedItems.includes(objective.id)) {
          result.push({
            ...activity,
            level: 1
          });

          // Add subactivities under this activity
          const subactivities = filteredMetrics.filter(m => m.parent === activity.id);
          if (expandedItems.includes(activity.id)) {
            subactivities.forEach(subactivity => {
              result.push({
                ...subactivity,
                level: 2
              });
            });
          }
        }
      });
    });

    // Add standalone metrics that don't have a parent
    const standalone = filteredMetrics.filter(m => !m.parent && m.hierarchy !== "objective");
    if (standalone.length > 0) {
      result.push({
        id: -1,
        title: "Standalone Metrics",
        isHeader: true
      });
      
      standalone.forEach(metric => {
        result.push({
          ...metric,
          level: 0,
          isStandalone: true
        });
      });
    }

    return result;
  };

  // Build the hierarchical metrics view
  const hierarchicalMetrics = buildHierarchicalView();
  
  // All unique tags
  const allTags = Array.from(new Set(filteredMetrics.flatMap(m => m.tags))).sort();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Metrics</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsManageTagsOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"></path>
              <path d="M6 9.01V9"></path>
            </svg>
            Manage Tags
          </Button>
          
          <Button 
            onClick={() => setIsCreateMetricOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Metric
          </Button>
        </div>
      </div>
      {/* Tabs for Metrics and Metric Groups */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-96 mb-6">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="groups">Metric Groups</TabsTrigger>
          <TabsTrigger value="okrs">Coming Soon</TabsTrigger>
        </TabsList>
        
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow">
              <Input
                placeholder={`Search ${activeTab === "metrics" ? "metrics" : "groups"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={selectedTags.length === 1 ? selectedTags[0] : "all_tags"}
                onValueChange={(value) => {
                  if (value && value !== "all_tags") {
                    setSelectedTags([value]);
                  } else {
                    setSelectedTags([]);
                  }
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_tags">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(selectedTags.length > 0 || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters} className="h-10">
                Clear filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Selection action bar */}
        {activeTab === "metrics" && selectedMetrics.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{selectedMetrics.length}</span> metrics selected
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                size="sm"
                onClick={() => setIsCreateGroupOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Create Group
              </Button>
            </div>
          </div>
        )}
        
        {/* Metrics tab content */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredMetrics.length > 0 && filteredMetrics.every(m => selectedMetrics.includes(m.id))}
                      onCheckedChange={handleSelectAllMetrics}
                    />
                  </TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="whitespace-nowrap">Target</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hierarchicalMetrics.map((metric) => {
                  if (metric.isHeader) {
                    return (
                      <TableRow key={`header-${metric.id}`} className="border-t border-gray-200">
                        <TableCell colSpan={5} className="py-2">
                          <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  // Determine if this metric has children
                  const hasChildren = mockMetrics.some(m => m.parent === metric.id);
                  
                  // Set up the visual indicators for the hierarchy
                  let indentationElement = null;
                  
                  if (metric.level === 1) {
                    // Activity level indentation
                    indentationElement = (
                      <div className="w-8 pl-6 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <polyline points="9 10 4 15 9 20" />
                          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                        </svg>
                      </div>
                    );
                  } else if (metric.level === 2) {
                    // Subactivity level indentation
                    indentationElement = (
                      <>
                        <div className="w-8 pl-6 flex justify-center opacity-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <polyline points="9 10 4 15 9 20" />
                            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                          </svg>
                        </div>
                        <div className="w-8 ml-8 flex justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </div>
                      </>
                    );
                  }
                  
                  // Set up styling based on the row type
                  let rowStyle = "";
                  if (selectedMetrics.includes(metric.id)) {
                    rowStyle = "bg-indigo-50";
                  } else if (metric.level === 0 && !metric.isStandalone) {
                    rowStyle = "hover:bg-amber-50/30 font-medium";
                  } else {
                    rowStyle = "hover:bg-slate-50";
                  }
                  
                  return (
                    <TableRow key={`metric-${metric.id}`} className={rowStyle}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetricSelection(metric.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {indentationElement}
                          {hasChildren && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 mr-2" 
                              onClick={() => toggleExpand(metric.id)}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className={`transition-transform ${expandedItems.includes(metric.id) ? 'rotate-90' : ''}`}
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </Button>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={metric.level === 0 ? "font-semibold" : metric.level === 1 ? "font-medium" : ""}>
                                  {metric.title.length > 35 ? `${metric.title.substring(0, 35)}...` : metric.title}
                                </span>
                              </TooltipTrigger>
                              {metric.title.length > 35 && (
                                <TooltipContent>
                                  <div className="max-w-xs">
                                    <p>{metric.title}</p>
                                    {metric.description && (
                                      <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                          {metric.description && metric.title.length <= 35 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-400">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{metric.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatTargetValue(metric.targetValue, metric.unit)}</div>
                        <div className="text-xs text-gray-500 capitalize">{metric.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap">
                          {metric.tags.map((tag: string) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Groups tab content */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <Card key={group.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap mb-3">
                    {group.tags.map(tag => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{group.metrics.length}</span> metrics included
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button variant="outline" size="sm">Apply</Button>
                  <Link href={`/templates/groups/${group.id}`}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Edit Group</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Coming Soon (OKRs) tab content */}
        <TabsContent value="okrs" className="space-y-4">
          {/* Group OKRs by tags and display in sections */}
          {Array.from(new Set(mockOKRs.map(okr => okr.tag))).map(tag => {
            const okrsForTag = mockOKRs.filter(okr => okr.tag === tag);
            
            return (
              <div key={tag} className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-3 border-b bg-[#ffffff] text-[#282A3F]">
                  <div className="flex items-center">
                    <TagBadge tag={tag} />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b" style={{ borderColor: '#E6E7F1' }}>
                      <TableHead 
                        className="px-3 py-2"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        OKR Name
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Milestone Frequency
                      </TableHead>
                      <TableHead 
                        className="text-right px-3 py-2"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Target
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Tags
                      </TableHead>
                      <TableHead 
                        className="text-right px-3 py-2"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {okrsForTag.map((okr) => (
                      <TableRow key={okr.id} className="hover:bg-slate-50 border-b" style={{ borderColor: '#E6E7F1' }}>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{okr.title}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="text-gray-400 hover:text-gray-600 cursor-help"
                                    style={{ marginLeft: '4px' }}
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{okr.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <span className="text-sm">
                            {okr.milestoneFrequency || 'Quarterly'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="font-medium">
                            {okr.unit === 'currency' 
                              ? `$${(okr.targetValue / 1000000).toFixed(1)}M`
                              : okr.unit === 'percentage'
                              ? `${okr.targetValue}%`
                              : okr.targetValue.toString()
                            }
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{okr.unit}</div>
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex flex-wrap gap-1">
                            {okr.tags?.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            )) || (
                              <Badge variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="h-8">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                              </svg>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              Assign
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
      {/* Manage Tags Dialog */}
      <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, and organize tags used for metrics and groups.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-2">
              <Input placeholder="New tag name" className="flex-grow" />
              <Button className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
            </div>
            <div className="border-t my-2"></div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockTags.map(tag => (
                <div key={tag.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{tag.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageTagsOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Metric Dialog */}
      <Dialog open={isCreateMetricOpen} onOpenChange={setIsCreateMetricOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Metric</DialogTitle>
            <DialogDescription>
              Create a new metric for your OKR tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Metric Title</label>
              <Input
                id="title"
                placeholder="Enter metric title"
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Describe this metric"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="hierarchy" className="text-sm font-medium">Level</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objective">Objective</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="subactivity">Subactivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags</label>
              <Input
                id="tags"
                placeholder="Enter tags (comma separated)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMetricOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Create Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Metric Group</DialogTitle>
            <DialogDescription>
              Group selected metrics into a template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="groupName" className="text-sm font-medium">Group Name</label>
              <Input
                id="groupName"
                placeholder="Enter group name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="groupDesc" className="text-sm font-medium">Description</label>
              <Textarea
                id="groupDesc"
                placeholder="Describe this group"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Selected Metrics</label>
              <div className="p-3 border rounded-md max-h-40 overflow-y-auto">
                {selectedMetrics.length === 0 ? (
                  <p className="text-sm text-gray-500">No metrics selected.</p>
                ) : (
                  <ul className="space-y-1">
                    {mockMetrics.filter(m => selectedMetrics.includes(m.id)).map(metric => (
                      <li key={metric.id} className="text-sm">{metric.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}