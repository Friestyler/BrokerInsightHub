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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  { id: 16, name: "Quality", color: "teal" },
  { id: 17, name: "Growth", color: "slate" },
  { id: 18, name: "Regional", color: "zinc" },
  { id: 19, name: "Expansion", color: "neutral" },
  { id: 20, name: "Market Expansion", color: "stone" }
];

// Mock data for metric groups
const mockMetricGroups = [
  {
    id: 1,
    name: "Revenue Tracking",
    description: "Group for tracking revenue-related metrics",
    tags: ["Financial", "Revenue"],
    metrics: [1, 2], // References to metric IDs
    createdAt: new Date("2025-04-01"),
    updatedAt: new Date("2025-04-20"),
  },
  {
    id: 2,
    name: "Partnership Development",
    description: "Metrics related to developing partnerships",
    tags: ["Partner", "Growth"],
    metrics: [3, 4],
    createdAt: new Date("2025-04-05"),
    updatedAt: new Date("2025-04-22"),
  },
  {
    id: 3,
    name: "Digital Marketing",
    description: "Digital marketing and campaign metrics",
    tags: ["Digital", "Marketing", "Campaign"],
    metrics: [5, 6],
    createdAt: new Date("2025-04-10"),
    updatedAt: new Date("2025-04-25"),
  },
  {
    id: 4,
    name: "Customer Excellence",
    description: "Customer satisfaction and support metrics",
    tags: ["Customer", "Support", "Quality"],
    metrics: [7, 8],
    createdAt: new Date("2025-04-12"),
    updatedAt: new Date("2025-04-28"),
  }
];

// Mock OKR data for Coming Soon tab
const mockOKRs = [
  {
    id: 1,
    title: "Increase Partner Network Growth",
    description: "Expand our partner network by onboarding new strategic partners",
    tag: "Growth",
    unit: "number",
    targetValue: 25,
    realizedValue: 18,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    milestoneFrequency: "Quarterly",
    nestedCount: 3
  },
  {
    id: 2,
    title: "Revenue Target Achievement",
    description: "Achieve annual revenue target through improved sales processes",
    tag: "Financial",
    unit: "currency",
    targetValue: 5000000,
    realizedValue: 3200000,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    milestoneFrequency: "Monthly",
    nestedCount: 0
  },
  {
    id: 3,
    title: "Customer Satisfaction Excellence",
    description: "Maintain high customer satisfaction scores across all touchpoints",
    tag: "Customer",
    unit: "percent",
    targetValue: 95,
    realizedValue: 92,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    milestoneFrequency: "Monthly",
    nestedCount: 2
  }
];

// Format target value helper
const formatTargetValue = (value: number | undefined, unit: string) => {
  if (value === undefined) return "-";
  
  switch (unit) {
    case "currency":
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    case "percentage":
    case "percent":
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
  const [activeTab, setActiveTab] = useState("groups");
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [selectedTargetRange, setSelectedTargetRange] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [advancedTimeframe, setAdvancedTimeframe] = useState("");
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [groupBy, setGroupBy] = useState("tag");
  const [okrTemplates, setOkrTemplates] = useState(() => {
    const stored = localStorage.getItem('okrTemplates');
    try {
      return stored ? JSON.parse(stored) : mockOKRs;
    } catch {
      return mockOKRs;
    }
  });

  // Get all tags from groups only
  const allTags = Array.from(new Set([
    ...mockMetricGroups.flatMap(group => group.tags)
  ])).sort();

  // Filter groups based on search and tags
  const filteredGroups = mockMetricGroups.filter(group => {
    const matchesSearch = searchTerm === "" || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => group.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setSelectedTimeframe("");
    setDateRange({ from: undefined, to: undefined });
    setShowNoTarget(false);
  };

  // OKR functions
  const toggleOKRSelection = (id: number) => {
    setSelectedOKRs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
        </div>
      </div>
      
      {/* Tabs for Metric Groups and Coming Soon */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-64 mb-6">
          <TabsTrigger value="groups">Metric Groups</TabsTrigger>
          <TabsTrigger value="okrs">Coming Soon</TabsTrigger>
        </TabsList>
        
        {/* Search and filter section - only show for groups tab */}
        {activeTab === "groups" && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-grow">
                <Input
                  placeholder="Search groups..."
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
        )}

        {/* Coming Soon tab search and filter section */}
        {activeTab === "okrs" && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search field */}
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder="Search OKR templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
              
              {/* Filter buttons */}
              <div className="flex items-center gap-2">
                <Select 
                  value={selectedTags.length === 1 ? selectedTags[0] : ""}
                  onValueChange={(value) => {
                    if (value === "clear") {
                      setSelectedTags([]);
                    } else if (value && value !== "all_tags") {
                      setSelectedTags([value]);
                    } else {
                      setSelectedTags([]);
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_tags">All Tags</SelectItem>
                    {Array.from(new Set(okrTemplates.map(okr => okr.tag).filter(tag => tag && tag.trim() !== ""))).sort().map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                    {selectedTags.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="clear" className="text-gray-600">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                            Clear filter
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Group by dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Group by:</span>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tag">Tag</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {(selectedTags.length > 0 || searchTerm) && (
                <div className="flex items-center gap-2">
                  <button 
                    className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={clearFilters}
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M18 6L6 18"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                    <span className="text-[#5F6585]">Clear filters</span>
                  </button>
                </div>
              )}
              
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setIsCreateOKROpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M5 12h14"/>
                  <path d="M12 5v14"/>
                </svg>
                Add OKR Metric
              </Button>
            </div>
          </div>
        )}
        
        {/* Metric Groups tab content */}
        <TabsContent value="groups" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Metrics Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-gray-500">{group.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{group.metrics.length} metrics</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Coming Soon tab content - preserve existing functionality */}
        <TabsContent value="okrs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {okrTemplates.map((okr: any) => (
              <Card key={okr.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {okr.title}
                    </CardTitle>
                    <input
                      type="checkbox"
                      checked={selectedOKRs.includes(okr.id)}
                      onChange={() => toggleOKRSelection(okr.id)}
                      className="mt-1 rounded border-gray-300"
                    />
                  </div>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {okr.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Target:</span>
                      <span className="font-medium">{formatTargetValue(okr.targetValue, okr.unit)}</span>
                    </div>
                    
                    {okr.realizedValue !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Realized:</span>
                        <span className="font-medium">{formatTargetValue(okr.realizedValue, okr.unit)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Timeframe:</span>
                      <span className="text-gray-700">{okr.milestoneFrequency}</span>
                    </div>

                    {okr.nestedCount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Activities:</span>
                        <span className="text-gray-700">{okr.nestedCount} nested</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        {okr.tag}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Manage Tags Modal */}
      <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add, edit, or remove tags for organizing your metrics and groups.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageTagsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}