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
import { format } from "date-fns";
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
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    tag: "Revenue Growth"
  },
  {
    id: 2,
    title: "Launch 3 Major Product Features",
    description: "Deliver key features to improve customer satisfaction and retention",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 33,
    targetValue: 3,
    currentValue: 1,
    unit: "number",
    status: "Behind Schedule",
    owner: "Mike Rodriguez",
    dueDate: new Date('2024-11-30'),
    startDate: new Date('2024-09-01'),
    endDate: null,
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
    startDate: null,
    endDate: new Date('2024-12-31'),
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
    startDate: new Date('2024-03-15'),
    endDate: new Date('2025-03-14'),
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
    startDate: new Date('2024-07-01'),
    endDate: null,
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
    startDate: null,
    endDate: new Date('2025-06-30'),
    tag: "Revenue Growth"
  },
  {
    id: 7,
    title: "Improve Team Communication",
    description: "Enhance internal communication processes and tools",
    type: "Objective",
    progress: 40,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Alex Thompson",
    dueDate: new Date('2024-09-30'),
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-09-30'),
    tag: ""
  },
  {
    id: 8,
    title: "Complete Security Audit",
    description: "Conduct comprehensive security review and implement fixes",
    type: "Key Result",
    hierarchy: "subactivity",
    parent: 9,
    progress: 20,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Not Started",
    owner: "Jordan Kim",
    dueDate: new Date('2024-11-15'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-11-15'),
    tag: ""
  },
  // New hierarchical items
  {
    id: 9,
    title: "Implement Sales Training Program",
    description: "Develop and execute comprehensive sales training for all team members",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 40,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Sarah Chen",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-10-31'),
    tag: "Revenue Growth"
  },
  {
    id: 10,
    title: "Create Training Materials",
    description: "Develop comprehensive training content and resources",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 9,
    progress: 80,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Nearly Complete",
    owner: "Sarah Chen",
    dueDate: new Date('2024-09-15'),
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-09-15'),
    tag: "Revenue Growth"
  },
  {
    id: 11,
    title: "Conduct Training Sessions",
    description: "Execute training sessions for all sales team members",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 9,
    progress: 10,
    targetValue: 5,
    currentValue: 1,
    unit: "number",
    status: "In Progress",
    owner: "Sarah Chen",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-09-16'),
    endDate: new Date('2024-10-31'),
    tag: "Revenue Growth"
  },
  {
    id: 12,
    title: "Expand Marketing Channels",
    description: "Diversify marketing efforts across multiple channels",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 25,
    targetValue: 3,
    currentValue: 1,
    unit: "number",
    status: "In Progress",
    owner: "Mike Rodriguez",
    dueDate: new Date('2024-11-30'),
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-11-30'),
    tag: "Revenue Growth"
  },
  {
    id: 13,
    title: "Set up Social Media Campaigns",
    description: "Launch targeted campaigns on LinkedIn and Twitter",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 12,
    progress: 60,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Mike Rodriguez",
    dueDate: new Date('2024-09-30'),
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-09-30'),
    tag: "Revenue Growth"
  },
  {
    id: 14,
    title: "Launch Email Marketing Campaign",
    description: "Create and execute email nurture sequences",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 12,
    progress: 30,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Mike Rodriguez",
    dueDate: new Date('2024-10-15'),
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-10-15'),
    tag: "Revenue Growth"
  },
  // Activities for Product Innovation objective
  {
    id: 15,
    title: "Develop Advanced Analytics Dashboard",
    description: "Create comprehensive analytics and reporting features",
    type: "Activity",
    hierarchy: "activity",
    parent: 2,
    progress: 45,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Emily Johnson",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-08-15'),
    endDate: new Date('2024-10-31'),
    tag: "Product Innovation"
  },
  {
    id: 16,
    title: "Design UI/UX Components",
    description: "Create user interface designs for analytics dashboard",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 15,
    progress: 80,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Nearly Complete",
    owner: "Emily Johnson",
    dueDate: new Date('2024-09-15'),
    startDate: new Date('2024-08-15'),
    endDate: new Date('2024-09-15'),
    tag: "Product Innovation"
  },
  {
    id: 17,
    title: "Implement Backend APIs",
    description: "Develop backend services for analytics data processing",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 15,
    progress: 20,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "David Wilson",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-10-31'),
    tag: "Product Innovation"
  },
  {
    id: 18,
    title: "Build Mobile App Features",
    description: "Develop mobile-specific functionality and optimization",
    type: "Activity",
    hierarchy: "activity",
    parent: 2,
    progress: 15,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Started",
    owner: "Alex Thompson",
    dueDate: new Date('2024-12-15'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-15'),
    tag: "Product Innovation"
  },
  {
    id: 19,
    title: "Design Mobile Interface",
    description: "Create responsive mobile interface designs",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 18,
    progress: 40,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Alex Thompson",
    dueDate: new Date('2024-11-15'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-11-15'),
    tag: "Product Innovation"
  },
  {
    id: 20,
    title: "Optimize for Performance",
    description: "Ensure mobile app meets performance benchmarks",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 18,
    progress: 5,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Not Started",
    owner: "David Wilson",
    dueDate: new Date('2024-12-15'),
    startDate: new Date('2024-11-16'),
    endDate: new Date('2024-12-15'),
    tag: "Product Innovation"
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
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [selectedTargetRange, setSelectedTargetRange] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [groupBy, setGroupBy] = useState("tag"); // Default grouping by tag

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
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setDateRange({ from: undefined, to: undefined });
    setShowNoTarget(false);
  }

  // Toggle expansion of an item
  const toggleExpansion = (id: number) => {
    setExpandedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Get count of nested items for an OKR
  const getNestedCount = (okr: any, allOkrs: any[]) => {
    if (okr.hierarchy === 'objective') {
      const activities = allOkrs.filter(item => item.parent === okr.id && item.hierarchy === 'activity');
      const subactivities = allOkrs.filter(item => activities.some(act => act.id === item.parent) && item.hierarchy === 'subactivity');
      return activities.length + subactivities.length;
    } else if (okr.hierarchy === 'activity') {
      const subactivities = allOkrs.filter(item => item.parent === okr.id && item.hierarchy === 'subactivity');
      return subactivities.length;
    }
    return 0;
  };

  // Build hierarchical structure with proper nesting
  const buildHierarchicalOKRs = (okrs: any[]) => {
    const result: any[] = [];
    
    // Start with objectives (top level)
    const objectives = okrs.filter(okr => okr.hierarchy === 'objective');
    
    objectives.forEach(objective => {
      const isExpanded = expandedItems.includes(objective.id);
      result.push({
        ...objective,
        level: 0,
        isExpanded,
        nestedCount: getNestedCount(objective, okrs)
      });
      
      // Add activities under this objective if expanded
      if (isExpanded) {
        const activities = okrs.filter(okr => okr.parent === objective.id && okr.hierarchy === 'activity');
        
        activities.forEach(activity => {
          const isActivityExpanded = expandedItems.includes(activity.id);
          result.push({
            ...activity,
            level: 1,
            isExpanded: isActivityExpanded,
            nestedCount: getNestedCount(activity, okrs)
          });
          
          // Add subactivities under this activity if expanded
          if (isActivityExpanded) {
            const subactivities = okrs.filter(okr => okr.parent === activity.id && okr.hierarchy === 'subactivity');
            
            subactivities.forEach(subactivity => {
              result.push({
                ...subactivity,
                level: 2,
                nestedCount: 0
              });
            });
          }
        });
      }
    });
    
    // Add standalone items that don't have parents
    const standalone = okrs.filter(okr => !okr.parent && okr.hierarchy !== 'objective');
    standalone.forEach(item => {
      result.push({
        ...item,
        level: 0,
        isStandalone: true,
        nestedCount: 0
      });
    });
    
    return result;
  };

  // Group OKRs by selected field
  const groupOKRs = (okrs: typeof mockOKRs) => {
    if (groupBy === "none") {
      return { "All OKRs": buildHierarchicalOKRs(okrs) };
    }

    const grouped = okrs.reduce((acc, okr) => {
      let groupKey = "";
      
      switch (groupBy) {
        case "tag":
          groupKey = okr.tag || "No Tag";
          break;
        case "type":
          groupKey = okr.type || "No Type";
          break;
        case "status":
          groupKey = okr.status || "No Status";
          break;
        default:
          groupKey = "All OKRs";
      }
      
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(okr);
      return acc;
    }, {} as Record<string, typeof mockOKRs>);

    // Sort groups and build hierarchical structure for each
    const sortedGroups: Record<string, any[]> = {};
    const regularGroups: string[] = [];
    const emptyGroups: string[] = [];
    
    Object.keys(grouped).forEach(key => {
      if (key === "No Tag" || key === "No Type" || key === "No Status") {
        emptyGroups.push(key);
      } else {
        regularGroups.push(key);
      }
    });
    
    // Add regular groups first (sorted alphabetically)
    regularGroups.sort().forEach(key => {
      sortedGroups[key] = buildHierarchicalOKRs(grouped[key]);
    });
    
    // Add empty groups at the bottom
    emptyGroups.forEach(key => {
      sortedGroups[key] = buildHierarchicalOKRs(grouped[key]);
    });

    return sortedGroups;
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

  // Filtered OKRs based on search, measure unit, target range, timeframe, and no target
  const filteredOKRs = mockOKRs.filter(okr => {
    const matchesSearch = searchTerm === "" || 
      okr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.includes(okr.tag);
    
    // Handle "No target" filter
    if (showNoTarget) {
      return matchesSearch && matchesTags && (!okr.targetValue || okr.targetValue === 0);
    }
    
    const matchesMeasureUnit = selectedMeasureUnit === "" || 
      okr.unit === selectedMeasureUnit.toLowerCase();
    
    const matchesTargetRange = selectedTargetRange === "" || (() => {
      // Handle different target range formats based on measure unit
      if (selectedMeasureUnit === 'checkbox') {
        // For checkbox type, match complete/incomplete
        const searchTerm = selectedTargetRange.toLowerCase();
        return searchTerm.includes('complete') || searchTerm.includes('incomplete');
      }
      
      // Parse numeric ranges like "10-50", "$100-$500", "20%-80%"
      const rangeMatch = selectedTargetRange.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        const [, min, max] = rangeMatch;
        const minVal = parseInt(min);
        const maxVal = parseInt(max);
        return okr.targetValue >= minVal && okr.targetValue <= maxVal;
      }
      
      // Parse single values like "100", "$500", "75%"
      const singleMatch = selectedTargetRange.match(/(\d+)/);
      if (singleMatch) {
        const targetVal = parseInt(singleMatch[1]);
        return okr.targetValue === targetVal;
      }
      
      return true;
    })();
    
    // Add date range filtering
    const matchesDateRange = (() => {
      if (!dateRange.from && !dateRange.to) return true;
      
      const okrStart = okr.startDate;
      const okrEnd = okr.endDate || okr.dueDate;
      
      // If we have a date range filter
      if (dateRange.from && dateRange.to) {
        // OKR must overlap with the selected date range
        if (okrStart && okrEnd) {
          return okrStart <= dateRange.to && okrEnd >= dateRange.from;
        } else if (okrStart) {
          return okrStart <= dateRange.to && okrStart >= dateRange.from;
        } else if (okrEnd) {
          return okrEnd >= dateRange.from && okrEnd <= dateRange.to;
        }
      }
      
      // If we only have a start date filter
      if (dateRange.from && !dateRange.to) {
        if (okrStart) return okrStart >= dateRange.from;
        if (okrEnd) return okrEnd >= dateRange.from;
      }
      
      // If we only have an end date filter
      if (!dateRange.from && dateRange.to) {
        if (okrEnd) return okrEnd <= dateRange.to;
        if (okrStart) return okrStart <= dateRange.to;
      }
      
      return true;
    })();
    
    return matchesSearch && matchesTags && matchesMeasureUnit && matchesTargetRange && matchesDateRange;
  });

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
        
        {/* Search and filter section - only show for metrics and groups tabs */}
        {activeTab !== "okrs" && (
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
                    {Array.from(new Set(mockOKRs.map(okr => okr.tag).filter(tag => tag && tag.trim() !== ""))).sort().map(tag => (
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
                
                <Select value={selectedMeasureUnit} onValueChange={(value) => {
                  if (value === "clear") {
                    setSelectedMeasureUnit("");
                    setSelectedTargetRange("");
                  } else {
                    setSelectedMeasureUnit(value);
                  }
                }}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Measure Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    {selectedMeasureUnit && (
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
                
                <input
                  type="text"
                  placeholder={
                    selectedMeasureUnit === 'currency' ? 'Target: $100-$500' : 
                    selectedMeasureUnit === 'percent' ? 'Target: 20%-80%' : 
                    selectedMeasureUnit === 'checkbox' ? 'Target: complete' : 
                    'Target Range'
                  }
                  value={selectedTargetRange}
                  onChange={(e) => setSelectedTargetRange(e.target.value)}
                  disabled={!selectedMeasureUnit && !showNoTarget}
                  className={`w-[160px] px-3 py-2 border border-gray-300 rounded-md text-sm ${!selectedMeasureUnit && !showNoTarget ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                    />
                    {(dateRange?.from || dateRange?.to) && (
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                          className="w-full text-sm"
                        >
                          Clear date range
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNoTarget}
                      onChange={(e) => {
                        setShowNoTarget(e.target.checked);
                        if (e.target.checked) {
                          setSelectedMeasureUnit("");
                          setSelectedTargetRange("");
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-sm mr-2 flex items-center justify-center ${showNoTarget ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                      {showNoTarget && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">No target set</span>
                  </label>
                </div>
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
              {(selectedTags.length > 0 || searchTerm || selectedMeasureUnit || selectedTargetRange || dateRange.from || dateRange.to) && (
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
            </div>
          </div>
        )}
        
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
          {/* Bulk Actions Bar - positioned underneath filters */}
          {selectedOKRs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOKRs.length} OKR{selectedOKRs.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4"/>
                        <path d="M16 2v4"/>
                        <rect width="18" height="18" x="3" y="4" rx="2"/>
                        <path d="M3 10h18"/>
                      </svg>
                      Assign to entity
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                      </svg>
                      Duplicate
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOKRs([])}
                  className="p-2 hover:bg-blue-100 rounded-md transition-colors"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                    <path d="M18 6L6 18"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Group OKRs and display in sections */}
          {Object.entries(groupOKRs(filteredOKRs)).map(([groupName, okrsInGroup]) => {
            
            return (
              <div key={groupName} className="bg-white" style={{ marginBottom: '32px' }}>
                <div className="px-6 pb-0 pt-3 bg-[#ffffff] text-[#282A3F]">
                  <div className="flex items-center">
                    {groupBy === "tag" ? (
                      groupName === "No Tag" ? (
                        <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium border border-dashed border-gray-400">
                          {groupName}
                        </div>
                      ) : (
                        <TagBadge tag={groupName} />
                      )
                    ) : groupBy === "none" ? null : (
                      groupName.startsWith("No ") ? (
                        <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium border border-dashed border-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          {groupName}
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {groupName}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="border-b min-w-full" style={{ borderColor: '#E6E7F1' }}>
                    <TableHeader>
                    <TableRow className="border-b hover:bg-[#F5F6FA] group" style={{ borderColor: '#E6E7F1' }}>
                      <TableHead className="w-12 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={okrsInGroup.length > 0 && okrsInGroup.every(okr => selectedOKRs.includes(okr.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOKRs(prev => [...new Set([...prev, ...okrsInGroup.map(okr => okr.id)])]);
                            } else {
                              setSelectedOKRs(prev => prev.filter(id => !okrsInGroup.map(okr => okr.id).includes(id)));
                            }
                          }}
                          className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ 
                            opacity: okrsInGroup.some(okr => selectedOKRs.includes(okr.id)) ? 1 : undefined 
                          }}
                        />
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[250px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        OKR
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[120px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Timeframe
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[150px]"
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
                        className="text-right px-3 py-2 min-w-[120px]"
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
                        className="text-right px-3 py-2 min-w-[80px]"
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
                    {okrsInGroup.map((okr) => (
                      <TableRow key={okr.id} className="hover:bg-[#F5F6FA] border-b group" style={{ borderColor: '#E6E7F1' }}>
                        <TableCell className="w-12 px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedOKRs.includes(okr.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOKRs(prev => [...prev, okr.id]);
                              } else {
                                setSelectedOKRs(prev => prev.filter(id => id !== okr.id));
                              }
                            }}
                            className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ opacity: selectedOKRs.includes(okr.id) ? 1 : undefined }}
                          />
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center" style={{ paddingLeft: `${(okr.level || 0) * 24}px` }}>
                            {/* Expand/Collapse button for objectives and activities with children */}
                            {(okr.hierarchy === 'objective' || okr.hierarchy === 'activity') && okr.nestedCount > 0 && (
                              <button
                                onClick={() => toggleExpansion(okr.id)}
                                className="mr-2 p-1 hover:bg-gray-100 rounded"
                              >
                                {okr.isExpanded ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m6 9 6 6 6-6"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                  </svg>
                                )}
                              </button>
                            )}
                            
                            <span className="font-medium">{okr.title}</span>
                            
                            {/* Nested count icon with count */}
                            {okr.nestedCount > 0 && (
                              <div className="flex items-center ml-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                                  <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                                  <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                                  <line x1="7.5" y1="7.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1"/>
                                </svg>
                                <span className="text-xs text-gray-500 ml-1">{okr.nestedCount}</span>
                              </div>
                            )}
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="8" 
                                    viewBox="0 0 14 8" 
                                    fill="none" 
                                    className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
                                    style={{ minWidth: '14px', minHeight: '8px', marginLeft: '4px' }}
                                  >
                                    <rect width="14" height="1" fill="currentColor"/>
                                    <rect y="3.5" width="14" height="1" fill="currentColor"/>
                                    <rect y="7" width="7" height="1" fill="currentColor"/>
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
                            {(() => {
                              const formatDate = (date: Date) => {
                                return date.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                });
                              };
                              
                              if (okr.startDate && okr.endDate) {
                                return `${formatDate(okr.startDate)} - ${formatDate(okr.endDate)}`;
                              } else if (okr.startDate) {
                                return `From ${formatDate(okr.startDate)}`;
                              } else if (okr.endDate) {
                                return `Until ${formatDate(okr.endDate)}`;
                              }
                              return 'Ongoing';
                            })()}
                          </span>
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
                        </TableCell>

                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                  <path d="m15 5 4 4"/>
                                </svg>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Assign
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New OKR Template</DialogTitle>
            <DialogDescription>
              Create a comprehensive OKR template with objectives, activities, and subactivities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Structure Selection */}
            <div className="grid gap-3">
              <label className="text-sm font-medium">Template Structure</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 border-blue-200 bg-blue-50">
                  <div className="font-medium text-sm">Objective Only</div>
                  <div className="text-xs text-gray-500 mt-1">Single objective template</div>
                </div>
                <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <div className="font-medium text-sm">With Activities</div>
                  <div className="text-xs text-gray-500 mt-1">Objective + activities</div>
                </div>
                <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <div className="font-medium text-sm">Full Hierarchy</div>
                  <div className="text-xs text-gray-500 mt-1">Objective + activities + subactivities</div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-sm">Basic Information</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter OKR title"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe this OKR"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="hierarchy" className="text-sm font-medium">
                      Level <span className="text-red-500">*</span>
                    </label>
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
                  <div className="grid gap-2">
                    <label htmlFor="tag" className="text-sm font-medium">
                      Tag <span className="text-red-500">*</span>
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Revenue Growth">Revenue Growth</SelectItem>
                        <SelectItem value="Product Innovation">Product Innovation</SelectItem>
                        <SelectItem value="Customer Experience">Customer Experience</SelectItem>
                        <SelectItem value="Operational Excellence">Operational Excellence</SelectItem>
                        <SelectItem value="Market Expansion">Market Expansion</SelectItem>
                        <SelectItem value="Team Development">Team Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Target & Measurement */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Target & Measurement</h3>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="unit" className="text-sm font-medium">Measure Unit</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="target" className="text-sm font-medium">Target Value</label>
                    <Input
                      id="target"
                      placeholder="Enter target"
                      type="number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="current" className="text-sm font-medium">Current Value</label>
                    <Input
                      id="current"
                      placeholder="Enter current"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Timeline</h3>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <Input
                      id="startDate"
                      type="date"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                    <Input
                      id="endDate"
                      type="date"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="frequency" className="text-sm font-medium">Milestone Frequency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assignment & Progress */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Assignment & Progress</h3>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="owner" className="text-sm font-medium">Responsible Person</label>
                    <Input
                      id="owner"
                      placeholder="Enter owner name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                    <Input
                      id="dueDate"
                      type="date"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Track">On Track</SelectItem>
                      <SelectItem value="Behind Schedule">Behind Schedule</SelectItem>
                      <SelectItem value="Nearly Complete">Nearly Complete</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Attachments</h3>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="grid gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                  className="file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 hover:file:bg-gray-200"
                />
                <p className="text-xs text-gray-500">Supported formats: PDF, DOC, XLS, JPG, PNG</p>
              </div>
            </div>

            {/* Nested Tasks Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Break Down into Tasks</h3>
                <div className="text-xs text-gray-500">Optional - helps organize complex objectives</div>
              </div>
              
              {/* Activities List */}
              <div className="space-y-3">
                {/* Sample Activity 1 */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <rect width="3" height="8" x="13" y="2" rx="1.5"/>
                        <path d="M19 8.5V10h1.5A1.5 1.5 0 1 1 19 11.5V19a1.5 1.5 0 0 1-3 0v-2"/>
                        <rect width="3" height="8" x="8" y="14" rx="1.5"/>
                        <path d="M5 15.5V14H3.5A1.5 1.5 0 1 1 5 12.5V5a1.5 1.5 0 0 1 3 0v2"/>
                      </svg>
                      <Input 
                        placeholder="Activity title (e.g., Implement Sales Training Program)"
                        className="flex-1 border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </Button>
                  </div>
                  
                  {/* Subactivities */}
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2 group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <Input 
                        placeholder="Subtask (e.g., Create training materials)"
                        className="flex-1 border-0 bg-white text-sm h-8 focus-visible:ring-1 focus-visible:ring-blue-200"
                      />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/>
                          <path d="m6 6 12 12"/>
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <Input 
                        placeholder="Subtask (e.g., Conduct training sessions)"
                        className="flex-1 border-0 bg-white text-sm h-8 focus-visible:ring-1 focus-visible:ring-blue-200"
                      />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/>
                          <path d="m6 6 12 12"/>
                        </svg>
                      </Button>
                    </div>
                    
                    {/* Add Subtask Button */}
                    <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm ml-4 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </svg>
                      Add subtask
                    </button>
                  </div>
                </div>

                {/* Add Activity Button */}
                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors w-full border-2 border-dashed border-gray-200 hover:border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  Add activity
                </button>
              </div>
              
              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Break down complex objectives</div>
                    <div className="text-blue-700">Activities help organize work into manageable chunks. Subtasks make tracking progress easier and more granular.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMetricOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Create OKR Template</Button>
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