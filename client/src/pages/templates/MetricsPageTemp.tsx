import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from '@/lib/queryClient';

// Mock data for metrics with parent-child relationships
const mockMetrics = [
  {
    id: 1,
    title: "Revenue Goal",
    description: "Revenue target for the partnership",
    unit: "currency",
    targetValue: 1000000,
    hierarchy: "objective",
    tags: ["Financial", "Revenue", "Partner"],
    children: [3, 4], // References to child metrics
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
    children: [], // No children
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
    parent: 1, // Parent reference
    children: [9], // References to child metrics
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
    parent: 1, // Parent reference
    children: [], // No children
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
    children: [6], // References to child metrics
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
    parent: 5, // Parent reference
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
    children: [8], // References to child metrics
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
    parent: 7, // Parent reference
    children: [10], // References to child metrics
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
    parent: 3, // Parent reference
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
    parent: 8, // Parent reference
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

// Component for the tag badge with colors based on tag name
const TagBadge = ({ tag }: { tag: string }) => {
  const getTagColor = (tag: string) => {
    const foundTag = mockTags.find(t => t.name === tag);
    if (!foundTag) return "bg-gray-100 text-gray-800";
    
    const colorMap: Record<string, string> = {
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      blue: "bg-blue-100 text-blue-800",
      cyan: "bg-cyan-100 text-cyan-800",
      amber: "bg-amber-100 text-amber-800",
      indigo: "bg-indigo-100 text-indigo-800",
      orange: "bg-orange-100 text-orange-800",
      pink: "bg-pink-100 text-pink-800",
      emerald: "bg-emerald-100 text-emerald-800",
      yellow: "bg-yellow-100 text-yellow-800",
      rose: "bg-rose-100 text-rose-800",
      lime: "bg-lime-100 text-lime-800",
      fuchsia: "bg-fuchsia-100 text-fuchsia-800",
      red: "bg-red-100 text-red-800",
      violet: "bg-violet-100 text-violet-800",
      sky: "bg-sky-100 text-sky-800",
      teal: "bg-teal-100 text-teal-800",
      slate: "bg-slate-100 text-slate-800",
    };
    
    return colorMap[foundTag.color] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)} mr-2 mb-2`}>
      {tag}
    </span>
  );
};

// Format the target value based on unit
const formatTargetValue = (value: number | undefined, unit: string) => {
  if (value === undefined) return "-";
  
  switch (unit) {
    case "currency":
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return `${value}%`;
    case "boolean":
      return value === 1 ? "Complete" : "Not Complete";
    default:
      return value.toString();
  }
};

// Main Metrics Page component
export default function MetricsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [metrics, setMetrics] = useState(mockMetrics);
  const [metricGroups, setMetricGroups] = useState(mockMetricGroups);
  const [tags, setTags] = useState(mockTags);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("metrics");
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  
  // Collect all unique tags, units from metrics
  const allTagNames = Array.from(
    new Set(metrics.flatMap(metric => metric.tags))
  ).sort();
  
  const allUnits = Array.from(
    new Set(metrics.map(metric => metric.unit))
  ).sort();
  
  // Filter metrics based on search, tags, groups, hierarchy, and unit
  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = searchTerm === "" || 
      metric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => metric.tags.includes(tag));
    
    const matchesGroups = selectedGroups.length === 0 ||
      selectedGroups.some(groupId => 
        metricGroups.find(g => g.id === groupId)?.metrics.includes(metric.id)
      );
    
    const matchesHierarchy = selectedHierarchy === "all" || 
      metric.hierarchy === selectedHierarchy;
    
    const matchesUnit = selectedUnit === "all" || 
      metric.unit === selectedUnit;
    
    return matchesSearch && matchesTags && matchesGroups && matchesHierarchy && matchesUnit;
  });
  
  // Filter groups based on search and tags
  const filteredGroups = metricGroups.filter(group => {
    const matchesSearch = searchTerm === "" || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => group.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Helper function to toggle expansion of a metric
  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Helper function to toggle metric selection
  const toggleMetricSelection = (id: number) => {
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all metrics
  const handleSelectAllMetrics = (checked: boolean) => {
    if (checked) {
      setSelectedMetrics(filteredMetrics.map(m => m.id));
    } else {
      setSelectedMetrics([]);
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Toggle group selection
  const toggleGroup = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  // Handle metric creation
  const handleCreateMetric = (metricData: any) => {
    const newMetric = {
      id: Math.max(0, ...metrics.map(m => m.id)) + 1,
      ...metricData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setMetrics([...metrics, newMetric]);
    
    // If this metric has a parent, update the parent's children
    if (metricData.parent) {
      setMetrics(prev => 
        prev.map(m => 
          m.id === metricData.parent 
            ? { ...m, children: [...(m.children || []), newMetric.id] }
            : m
        )
      );
    }
    
    // Update tags if there are new ones
    const newTags = metricData.tags.filter((tag: string) => !allTagNames.includes(tag));
    
    if (newTags.length > 0) {
      const tagObjects = newTags.map(tag => ({
        id: Math.max(0, ...tags.map(t => t.id)) + 1,
        name: tag,
        color: "indigo", // Default color
      }));
      
      setTags([...tags, ...tagObjects]);
    }
  };
  
  // Handle group creation
  const handleCreateGroup = (groupData: any) => {
    const newGroup = {
      id: Math.max(0, ...metricGroups.map(g => g.id)) + 1,
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setMetricGroups([...metricGroups, newGroup]);
    setSelectedMetrics([]);
  };
  
  // Clear all selected filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedGroups([]);
    setSelectedHierarchy("all");
    setSelectedUnit("all");
  };
  
  // Clear metric selection
  const clearMetricSelection = () => {
    setSelectedMetrics([]);
  };
  
  // Get all objectives (top-level)
  const objectives = filteredMetrics.filter(m => m.hierarchy === "objective");
  
  // Build the hierarchical tree structure
  const createHierarchicalMetrics = () => {
    const result: any[] = [];
    
    // Process objectives first
    objectives.forEach(objective => {
      result.push({
        ...objective,
        level: 0,
        children: [] as any[]
      });
      
      // Find activities for this objective
      const activities = filteredMetrics.filter(m => m.parent === objective.id);
      activities.forEach(activity => {
        result.push({
          ...activity,
          level: 1,
          parent: objective.id
        });
        
        // Find subactivities for this activity
        const subactivities = filteredMetrics.filter(m => m.parent === activity.id);
        subactivities.forEach(subactivity => {
          result.push({
            ...subactivity,
            level: 2, 
            parent: activity.id,
            grandparent: objective.id
          });
        });
      });
    });
    
    // Add standalone metrics at the end
    const standalone = filteredMetrics.filter(m => 
      m.hierarchy !== "objective" && !m.parent
    );
    standalone.forEach(metric => {
      result.push({
        ...metric,
        level: 0,
        isStandalone: true
      });
    });
    
    return result;
  };
  
  // Determine what items should be visible based on expanded state
  const getVisibleMetrics = () => {
    const hierarchicalMetrics = createHierarchicalMetrics();
    
    return hierarchicalMetrics.filter(metric => {
      // Always show objectives and standalone metrics
      if (metric.level === 0) {
        return true;
      }
      
      // Show activities if their parent objective is expanded
      if (metric.level === 1) {
        return expandedItems.includes(metric.parent);
      }
      
      // Show subactivities if both their parent activity and grandparent objective are expanded
      if (metric.level === 2) {
        return expandedItems.includes(metric.parent) && expandedItems.includes(metric.grandparent);
      }
      
      return false;
    });
  };
  
  const visibleMetrics = getVisibleMetrics();
  
  return (
    <div className="container mx-auto px-4 py-6 pl-8">
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
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateMetricOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Metric
          </Button>
        </div>
      </div>
      
      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-64 mb-6">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="groups">Metric Groups</TabsTrigger>
        </TabsList>
        
        {/* Filters section */}
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
            
            <div className="flex space-x-2 items-center">
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
                  {allTagNames.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {activeTab === "metrics" && (
                <>
                  <Select 
                    value={selectedHierarchy}
                    onValueChange={setSelectedHierarchy}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Hierarchy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="objective">Objectives</SelectItem>
                      <SelectItem value="activity">Activities</SelectItem>
                      <SelectItem value="subactivity">Subactivities</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedUnit}
                    onValueChange={setSelectedUnit}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {allUnits.map(unit => (
                        <SelectItem key={unit} value={unit} className="capitalize">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            
            {(selectedTags.length > 0 || selectedGroups.length > 0 || searchTerm || selectedHierarchy !== "all" || selectedUnit !== "all") && (
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
                onClick={clearMetricSelection}
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
        <TabsContent value="metrics">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <h3 className="font-medium">No metrics found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {(selectedTags.length > 0 || selectedGroups.length > 0 || selectedHierarchy !== "all" || selectedUnit !== "all") ? 
                  'Try adjusting your filters.' : 
                  'Create your first metric to get started.'}
              </p>
              <Button 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsCreateMetricOpen(true)}
              >
                Create New Metric
              </Button>
            </div>
          ) : (
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
                  {visibleMetrics.map((metric, idx) => {
                    // Add visual separator before standalone metrics
                    const isFirstStandalone = metric.isStandalone && 
                      (!visibleMetrics[idx-1]?.isStandalone);
                    
                    const hasChildren = metrics.some(m => m.parent === metric.id);
                    const isExpanded = expandedItems.includes(metric.id);
                    
                    // Determine indentation and visual indicators
                    let indentationElement = null;
                    
                    if (metric.level === 1) {
                      // Activity level
                      indentationElement = (
                        <div className="w-8 pl-6 flex justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <polyline points="9 10 4 15 9 20" />
                            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                          </svg>
                        </div>
                      );
                    } else if (metric.level === 2) {
                      // Subactivity level
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
                    
                    // Set row style based on metric level
                    let rowStyle = "";
                    if (selectedMetrics.includes(metric.id)) {
                      rowStyle = "bg-indigo-50";
                    } else if (metric.level === 0 && !metric.isStandalone) {
                      rowStyle = "hover:bg-amber-50/30 font-medium";
                    } else {
                      rowStyle = "hover:bg-slate-50";
                    }
                    
                    // Add top border for standalone metrics section
                    if (isFirstStandalone) {
                      return (
                        <React.Fragment key={`section-${metric.id}`}>
                          <TableRow className="border-t border-gray-200">
                            <TableCell colSpan={5} className="py-2">
                              <h3 className="text-sm font-medium text-gray-500">Standalone Metrics</h3>
                            </TableCell>
                          </TableRow>
                          <TableRow className={rowStyle}>
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
                                      className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    >
                                      <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                  </Button>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={metric.level === 0 ? "font-semibold" : 
                                                       metric.level === 1 ? "font-medium" : ""}>
                                        {metric.title.length > 35 
                                          ? `${metric.title.substring(0, 35)}...` 
                                          : metric.title
                                        }
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
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <TableRow 
                        key={`metric-${metric.id}`} 
                        className={rowStyle}
                      >
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
                                  className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                >
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                              </Button>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={metric.level === 0 ? "font-semibold" : 
                                                   metric.level === 1 ? "font-medium" : ""}>
                                    {metric.title.length > 35 
                                      ? `${metric.title.substring(0, 35)}...` 
                                      : metric.title
                                    }
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
          )}
        </TabsContent>
        
        {/* Groups tab content */}
        <TabsContent value="groups">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <h3 className="font-medium">No metric groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTags.length > 0 ? 
                  'Try adjusting your filters.' : 
                  'Create metrics first, then group them into templates.'}
              </p>
              <Button 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsCreateGroupOpen(true)}
              >
                Create New Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => {
                const groupMetrics = metrics.filter(m => group.metrics.includes(m.id));
                
                return (
                  <Card 
                    key={group.id} 
                    className={`overflow-hidden hover:shadow-md transition-shadow ${selectedGroups.includes(group.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : ''}`}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroup(group.id)}
                        />
                        {group.name}
                      </CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <div className="mb-3">
                        {group.tags.map(tag => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="mb-1">
                          <span className="font-medium">{group.metrics.length}</span> metrics included
                        </div>
                        <ul className="list-disc pl-5 mt-2 text-gray-700">
                          {groupMetrics.slice(0, 3).map(metric => (
                            <li key={metric.id} className="text-sm">{metric.title}</li>
                          ))}
                          {groupMetrics.length > 3 && (
                            <li className="text-sm text-gray-500">+{groupMetrics.length - 3} more metrics</li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                      <Link href={`/templates/groups/${group.id}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          Edit Group
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}