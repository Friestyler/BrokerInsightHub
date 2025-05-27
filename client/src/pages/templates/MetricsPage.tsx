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
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";
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
  // Additional Revenue Growth activities to demonstrate better hierarchy
  {
    id: 26,
    title: "Optimize Sales Process Automation",
    description: "Streamline sales workflows and implement automated follow-ups",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 60,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Sarah Chen",
    dueDate: new Date('2024-11-30'),
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30'),
    tag: "Revenue Growth"
  },
  {
    id: 27,
    title: "Configure CRM Automation Rules",
    description: "Set up automated lead routing and follow-up sequences",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 26,
    progress: 75,
    targetValue: 8,
    currentValue: 6,
    unit: "number",
    status: "On Track",
    owner: "Sarah Chen",
    dueDate: new Date('2024-10-15'),
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-10-15'),
    tag: "Revenue Growth"
  },
  {
    id: 28,
    title: "Implement Sales Dashboard",
    description: "Create real-time sales performance monitoring dashboard",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 26,
    progress: 40,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Sarah Chen",
    dueDate: new Date('2024-11-15'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-11-15'),
    tag: "Revenue Growth"
  },
  {
    id: 29,
    title: "Launch Customer Success Initiatives",
    description: "Implement programs to increase customer lifetime value and reduce churn",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 30,
    targetValue: 3,
    currentValue: 1,
    unit: "number",
    status: "In Progress",
    owner: "Emily Johnson",
    dueDate: new Date('2024-12-31'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    tag: "Revenue Growth"
  },
  {
    id: 30,
    title: "Design Onboarding Experience",
    description: "Create seamless customer onboarding journey with guided tutorials",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 29,
    progress: 85,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Nearly Complete",
    owner: "Emily Johnson",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-10-31'),
    tag: "Revenue Growth"
  },
  {
    id: 31,
    title: "Implement Customer Health Scoring",
    description: "Deploy predictive analytics to identify at-risk customers",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 29,
    progress: 15,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Planning",
    owner: "Emily Johnson",
    dueDate: new Date('2024-12-15'),
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-15'),
    tag: "Revenue Growth"
  },
  {
    id: 32,
    title: "Launch Referral Program",
    description: "Create incentive program to encourage customer referrals",
    type: "Subactivity",
    hierarchy: "subactivity",
    parent: 29,
    progress: 50,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Emily Johnson",
    dueDate: new Date('2024-11-30'),
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-11-30'),
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
      return value?.toString() || "-";
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
  const [groupBy, setGroupBy] = useState("tag"); // Default grouping by tag
  const [okrTemplates, setOkrTemplates] = useState(() => {
    // Initialize from localStorage if available, otherwise use mockOKRs
    const stored = localStorage.getItem('okrTemplates');
    try {
      return stored ? JSON.parse(stored) : mockOKRs;
    } catch {
      return mockOKRs;
    }
  });

  // Save OKR templates to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('okrTemplates', JSON.stringify(okrTemplates));
  }, [okrTemplates]);

  // Initialize localStorage with mock data if it's empty
  React.useEffect(() => {
    const stored = localStorage.getItem('okrTemplates');
    if (!stored) {
      localStorage.setItem('okrTemplates', JSON.stringify(mockOKRs));
    }
  }, []);
  
  // Form state for OKR creation
  const [formData, setFormData] = useState({
    okrType: "",
    tag: "",
    name: "",
    description: "",
    hasTarget: false,
    measureUnit: "",
    targetValue: "",
    startDate: "",
    endDate: "",
    frequency: "",
    trafficLights: false,
    trafficLightConfig: "",
    progressBar: false,
    dueDateRequired: false,
    responsibleRequired: false,
    showAdvanced: false
  });

  // State for creating activities linked to an objective
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [parentObjective, setParentObjective] = useState<any>(null);
  
  // State for editing existing OKRs
  const [isEditing, setIsEditing] = useState(false);
  const [editingOKR, setEditingOKR] = useState<any>(null);

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
    setSelectedTimeframe("");
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

  // Handle editing an existing OKR
  const handleEditOKR = (okr: any) => {
    setEditingOKR(okr);
    setIsEditing(true);
    
    // Pre-fill form with existing data
    setFormData({
      okrType: okr.okrType || "",
      tag: okr.tag || "",
      name: okr.title || "",
      description: okr.description || "",
      hasTarget: okr.targetValue !== undefined,
      measureUnit: okr.unit || "",
      targetValue: okr.targetValue?.toString() || "",
      startDate: okr.startDate ? new Date(okr.startDate).toISOString().split('T')[0] : "",
      endDate: okr.endDate ? new Date(okr.endDate).toISOString().split('T')[0] : "",
      frequency: okr.frequency || "",
      trafficLights: okr.trafficLights || false,
      trafficLightConfig: okr.trafficLightConfig || "",
      progressBar: okr.progressBar || false,
      dueDateRequired: okr.dueDateRequired || false,
      responsibleRequired: okr.responsibleRequired || false,
      showAdvanced: false
    });
    
    setIsCreateOKROpen(true);
  };

  // Handle form submission for creating new OKR template or updating existing one
  const handleCreateOKR = () => {
    if (!formData.name.trim()) {
      alert("Please enter an OKR name");
      return;
    }
    
    const baseOKR = {
      title: formData.name,
      description: formData.description,
      type: isCreatingActivity ? "Activity" : (isEditing ? editingOKR.type : "Objective"),
      hierarchy: isCreatingActivity ? "activity" : (isEditing ? editingOKR.hierarchy : "objective"),
      parent: isCreatingActivity ? parentObjective?.id : (isEditing ? editingOKR.parent : null),
      progress: isEditing ? editingOKR.progress : 0,
      targetValue: formData.hasTarget && formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      currentValue: isEditing ? editingOKR.currentValue : 0,
      unit: formData.hasTarget ? formData.measureUnit : undefined,
      status: isEditing ? editingOKR.status : "Not Started",
      owner: isEditing ? editingOKR.owner : "",
      dueDate: formData.endDate ? new Date(formData.endDate) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      tag: isCreatingActivity ? parentObjective?.tag : (formData.tag || undefined),
      frequency: formData.frequency || undefined,
      trafficLights: formData.trafficLights,
      trafficLightConfig: formData.trafficLightConfig,
      progressBar: formData.progressBar,
      dueDateRequired: formData.dueDateRequired,
      responsibleRequired: formData.responsibleRequired
    };

    if (isEditing) {
      // Update existing OKR
      const updatedOKR = {
        ...baseOKR,
        id: editingOKR.id,
      };
      
      setOkrTemplates(prev => prev.map(okr => 
        okr.id === editingOKR.id ? updatedOKR : okr
      ));
    } else {
      // Create new OKR
      const newOKR = {
        ...baseOKR,
        id: okrTemplates.length > 0 ? Math.max(...okrTemplates.map(o => o.id)) + 1 : 1,
      };
      
      setOkrTemplates(prev => [...prev, newOKR]);
    }
    
    // Reset form and close dialog
    resetForm();
  };

  // Handle saving objective and creating activity
  const handleSaveAndCreateActivity = () => {
    if (!formData.name.trim()) {
      alert("Please enter an OKR name");
      return;
    }
    
    const newObjective = {
      id: okrTemplates.length > 0 ? Math.max(...okrTemplates.map(o => o.id)) + 1 : 1,
      title: formData.name,
      description: formData.description,
      type: "Objective",
      hierarchy: "objective",
      parent: null,
      progress: 0,
      targetValue: formData.hasTarget && formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      currentValue: 0,
      unit: formData.hasTarget ? formData.measureUnit : undefined,
      status: "Not Started",
      owner: "",
      dueDate: formData.endDate ? new Date(formData.endDate) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      tag: formData.tag || undefined,
      frequency: formData.frequency || undefined,
      trafficLights: formData.trafficLights,
      trafficLightConfig: formData.trafficLightConfig,
      progressBar: formData.progressBar,
      dueDateRequired: formData.dueDateRequired,
      responsibleRequired: formData.responsibleRequired
    };
    
    // Save the objective
    setOkrTemplates(prev => [...prev, newObjective]);
    
    // Set up for creating activity
    setParentObjective(newObjective);
    setIsCreatingActivity(true);
    
    // Reset form for activity creation
    resetForm();
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      okrType: "",
      tag: "",
      name: "",
      description: "",
      hasTarget: false,
      measureUnit: "",
      targetValue: "",
      startDate: "",
      endDate: "",
      frequency: "",
      trafficLights: false,
      trafficLightConfig: "",
      progressBar: false,
      dueDateRequired: false,
      responsibleRequired: false,
      showAdvanced: false
    });
    
    if (isCreatingActivity) {
      setIsCreatingActivity(false);
      setParentObjective(null);
    }
    
    if (isEditing) {
      setIsEditing(false);
      setEditingOKR(null);
    }
    
    setIsCreateOKROpen(false);
  };

  // Filtered OKRs based on search, measure unit, target range, timeframe, and no target
  const filteredOKRs = okrTemplates.filter(okr => {
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
                      className="w-[180px] justify-start text-left font-normal bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedTimeframe === "custom" && dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, y")
                        )
                      ) : selectedTimeframe ? (
                        selectedTimeframe.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      ) : (
                        "Select timeframe 1"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      {/* Left side - preset options */}
                      <div className="w-48 border-r border-gray-200 p-2">
                        <div className="space-y-1">
                          {[
                            { value: "last-year", label: "Last Year" },
                            { value: "this-year", label: "This Year" },
                            { value: "next-year", label: "Next Year" },
                            { value: "last-quarter", label: "Last Quarter" },
                            { value: "this-quarter", label: "This Quarter" },
                            { value: "next-quarter", label: "Next Quarter" },
                            { value: "last-month", label: "Last Month" },
                            { value: "this-month", label: "This Month" },
                            { value: "next-month", label: "Next Month" },
                            { value: "last-week", label: "Last Week" },
                            { value: "this-week", label: "This Week" },
                            { value: "next-week", label: "Next Week" },
                            { value: "custom", label: "Custom" }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSelectedTimeframe(option.value);
                                if (option.value !== "custom") {
                                  setDateRange({ from: undefined, to: undefined });
                                }
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                selectedTimeframe === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              {selectedTimeframe === option.value && (
                                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {option.label}
                            </button>
                          ))}
                          <div className="border-t border-gray-200 my-2"></div>
                          <button
                            onClick={() => {
                              setSelectedTimeframe("");
                              setDateRange({ from: undefined, to: undefined });
                            }}
                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2">
                              <path d="M18 6L6 18"/>
                              <path d="M6 6l12 12"/>
                            </svg>
                            Clear filter
                          </button>
                        </div>
                      </div>
                      
                      {/* Right side - calendar (only show when Custom is selected) */}
                      {selectedTimeframe === "custom" && (
                        <div className="p-3">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                            numberOfMonths={2}
                          />
                          {(dateRange?.from || dateRange?.to) && (
                            <div className="pt-3 border-t mt-3">
                              <Button
                                variant="ghost"
                                onClick={() => setDateRange({ from: undefined, to: undefined })}
                                className="w-full text-sm"
                              >
                                Clear date range
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Advanced Timeframe Filter (Alternative) */}
                <AdvancedTimeframeFilter
                  value={advancedTimeframe}
                  onValueChange={(value, dateRange) => {
                    setAdvancedTimeframe(value);
                    console.log('Advanced filter selected:', value, dateRange);
                  }}
                  className="w-[200px]"
                />

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
              {(selectedTags.length > 0 || searchTerm || selectedMeasureUnit || selectedTargetRange || selectedTimeframe || dateRange.from || dateRange.to) && (
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
                        className="px-3 py-2 min-w-[300px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Name
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
                        <TableCell className="w-12 px-1 py-3">
                          <div className="flex items-center" style={{ gap: '4px' }}>
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
                            {/* Expand/collapse arrows - visible by default for nested items */}
                            {okr.nestedCount > 0 ? (
                              <button
                                onClick={() => toggleExpansion(okr.id)}
                                className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                              >
                                {okr.isExpanded ? (
                                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(90deg)' }}>
                                    <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
                                  </svg>
                                ) : (
                                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
                                  </svg>
                                )}
                              </button>
                            ) : (
                              /* Empty space for non-nested items - arrows only on hover */
                              <button
                                className="p-1 hover:bg-gray-100 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ width: '20px', height: '20px' }}
                              >
                                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </TableCell>

                        
                        {/* Name Column */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center w-full">
                            {/* Title - consistent styling for all OKRs */}
                            <span 
                              className="text-[#282A3F]"
                              style={{ 
                                fontFamily: 'Poppins', 
                                fontWeight: '500', 
                                fontSize: '14px' 
                              }}
                            >
                              {okr.title}
                            </span>
                            
                            {/* Nested count icon - 4px from text */}
                            {okr.nestedCount > 0 && (
                              <div className="flex items-center" style={{ marginLeft: '4px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="4" cy="4" r="2" fill="#666666"/>
                                  <circle cx="12" cy="12" r="2" fill="#666666"/>
                                  <path d="M4 6C4 8 6 10 10 12" stroke="#666666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                </svg>
                                <span className="text-xs text-gray-500 ml-1">{okr.nestedCount}</span>
                              </div>
                            )}
                            
                            {/* Description icon - 4px from nested icon or text */}
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
                              const formatDate = (date: any) => {
                                if (!date) return '';
                                const dateObj = date instanceof Date ? date : new Date(date);
                                if (isNaN(dateObj.getTime())) return '';
                                return dateObj.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                });
                              };
                              
                              if (okr.startDate && okr.endDate) {
                                const start = formatDate(okr.startDate);
                                const end = formatDate(okr.endDate);
                                return start && end ? `${start} - ${end}` : 'Date range';
                              } else if (okr.startDate) {
                                const start = formatDate(okr.startDate);
                                return start ? `From ${start}` : 'Start date';
                              } else if (okr.endDate) {
                                const end = formatDate(okr.endDate);
                                return end ? `Until ${end}` : 'End date';
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
                              : okr.targetValue?.toString() || "-"
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
                              <DropdownMenuItem onClick={() => handleEditOKR(okr)}>
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
      
      {/* Create OKR Metric Dialog */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-neutral-900">
                  {isEditing ? `Edit "${editingOKR?.title}"` : 
                   isCreatingActivity ? `Add Activity to "${parentObjective?.title}"` : "Create OKR template"}
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-500 mt-1">
                  {isEditing 
                    ? `Edit the details and configuration of this ${editingOKR?.type?.toLowerCase()}`
                    : isCreatingActivity 
                    ? `Create a new activity under "${parentObjective?.title}"`
                    : "Choose how to measure progress and set up your template"
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-6">
            {/* Measurement Type - Always visible */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">Measurement Type</h3>
                <span className="text-red-500 text-sm font-medium">Required</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'currency', icon: '€', title: 'Currency', desc: 'Track monetary values', example: '€1,000', color: 'bg-green-50 border-green-200 text-green-700' },
                  { value: 'percent', icon: '%', title: 'Percent', desc: 'Track percentage progress', example: '75%', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { value: 'number', icon: '#', title: 'Number', desc: 'Track numeric counts', example: '50 units', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                  { value: 'checkbox', icon: '✓', title: 'Checkbox', desc: 'Done/Not Done tracking', example: 'Complete', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { value: 'traffic-light', icon: '●', title: 'Traffic Light', desc: 'Color status indicators', example: 'Green/Red', color: 'bg-red-50 border-red-200 text-red-700' }
                ].map((type) => (
                  <div 
                    key={type.value}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      formData.okrType === type.value 
                        ? 'border-primary-500 bg-primary-50 shadow-sm' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setFormData(prev => ({...prev, okrType: type.value}))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-semibold ${type.color}`}>
                        {type.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-neutral-900 text-sm">{type.title}</h4>
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{type.example}</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{type.desc}</p>
                      </div>
                      {formData.okrType === type.value && (
                        <div className="w-4 h-4 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Information - Always visible */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Name Field with Context-Aware Placeholder */}
                <div className="space-y-2">
                  <label htmlFor="okr-name" className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
                    OKR Name 
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="okr-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder={
                      formData.okrType === 'currency' ? "e.g., Increase annual revenue to €500K" :
                      formData.okrType === 'percent' ? "e.g., Improve customer satisfaction to 90%" :
                      formData.okrType === 'number' ? "e.g., Acquire 100 new customers" :
                      formData.okrType === 'checkbox' ? "e.g., Complete market research study" :
                      formData.okrType === 'traffic-light' ? "e.g., Project delivery status" :
                      "e.g., Increase Annual Revenue"
                    }
                    className="text-base border-neutral-300 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>

                {/* Tag Field with Smart Defaults */}
                {!isCreatingActivity && (
                  <div className="space-y-2">
                    <label htmlFor="okr-tag" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      Plan Category
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">Optional</span>
                    </label>
                    <Select value={formData.tag} onValueChange={(value) => setFormData(prev => ({...prev, tag: value}))}>
                      <SelectTrigger id="okr-tag" className="border-neutral-300 focus:border-primary-500 bg-white">
                        <SelectValue placeholder="Choose a category to organize this OKR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Revenue Growth">💰 Revenue Growth</SelectItem>
                        <SelectItem value="Product Innovation">🚀 Product Innovation</SelectItem>
                        <SelectItem value="Customer Experience">😊 Customer Experience</SelectItem>
                        <SelectItem value="Operational Excellence">⚙️ Operational Excellence</SelectItem>
                        <SelectItem value="Market Expansion">🌍 Market Expansion</SelectItem>
                        <SelectItem value="Team Development">👥 Team Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Inherited Category for Activities */}
                {isCreatingActivity && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Plan Category</label>
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm text-primary-700">
                          Inherited: <strong>{parentObjective?.tag || "No category"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="okr-description" className="text-sm font-medium text-neutral-700">
                    Description
                  </label>
                  <Textarea 
                    id="okr-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Provide context and explain what success looks like..."
                    rows={3}
                    className="resize-none border-neutral-300 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Target Setup - Contextual based on type */}
            {formData.okrType && formData.okrType !== 'checkbox' && formData.okrType !== 'traffic-light' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-neutral-900">Quick Target</h3>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">Optional</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="has-target" 
                    checked={formData.hasTarget}
                    onChange={(e) => setFormData(prev => ({...prev, hasTarget: e.target.checked}))}
                    className="rounded border-neutral-300" 
                  />
                  <label htmlFor="has-target" className="text-sm font-medium text-neutral-700">
                    Set a target value now
                  </label>
                  <span className="text-xs text-neutral-500">(Can be changed when assigned)</span>
                </div>
                
                {formData.hasTarget && (
                  <div className="ml-6 max-w-xs">
                    <div className="relative">
                      {formData.okrType === 'currency' && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-neutral-500 text-sm">€</span>
                        </div>
                      )}
                      <Input 
                        type="number" 
                        value={formData.targetValue}
                        onChange={(e) => setFormData(prev => ({...prev, targetValue: e.target.value}))}
                        placeholder={
                          formData.okrType === 'currency' ? "1000" :
                          formData.okrType === 'percent' ? "75" :
                          formData.okrType === 'number' ? "50" : ""
                        }
                        className={`border-neutral-300 focus:border-primary-500 ${formData.okrType === 'currency' ? 'pl-8' : ''}`}
                      />
                      {formData.okrType === 'percent' && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-neutral-500 text-sm">%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expandable Advanced Settings */}
            <div className="border border-neutral-200 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData(prev => ({...prev, showAdvanced: !prev.showAdvanced}))}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-neutral-900">Advanced Settings</h3>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">Optional configuration</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-neutral-500 transition-transform ${formData.showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {formData.showAdvanced && (
                <div className="px-4 pb-4 space-y-4 border-t border-neutral-100">
                  {/* Configuration checkboxes */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="traffic-lights" 
                        checked={formData.okrType === 'traffic-light' ? true : formData.trafficLights}
                        onChange={(e) => setFormData(prev => ({...prev, trafficLights: e.target.checked}))}
                        disabled={formData.okrType === 'traffic-light'}
                        className="rounded border-neutral-300" 
                      />
                      <label htmlFor="traffic-lights" className="text-sm font-medium text-neutral-700">
                        {formData.okrType === 'traffic-light' ? 'Traffic Light Status (Built-in)' : 'Enable Traffic Lights'}
                      </label>
                    </div>

                    {/* Progress Bar */}
                    {(formData.okrType === 'currency' || formData.okrType === 'percent' || formData.okrType === 'number') && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="progress-bar" 
                          checked={formData.progressBar}
                          onChange={(e) => setFormData(prev => ({...prev, progressBar: e.target.checked}))}
                          className="rounded border-neutral-300" 
                        />
                        <label htmlFor="progress-bar" className="text-sm font-medium text-neutral-700">
                          Enable Progress Bar
                        </label>
                      </div>
                    )}

                    {/* Due Date Required */}
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="due-date-required" 
                        checked={formData.dueDateRequired}
                        onChange={(e) => setFormData(prev => ({...prev, dueDateRequired: e.target.checked}))}
                        className="rounded border-neutral-300" 
                      />
                      <label htmlFor="due-date-required" className="text-sm font-medium text-neutral-700">
                        Require Due Date when assigned
                      </label>
                    </div>

                    {/* Responsible Person Required */}
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="responsible-required" 
                        checked={formData.responsibleRequired}
                        onChange={(e) => setFormData(prev => ({...prev, responsibleRequired: e.target.checked}))}
                        className="rounded border-neutral-300" 
                      />
                      <label htmlFor="responsible-required" className="text-sm font-medium text-neutral-700">
                        Require Responsible Person when assigned
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


          
          <DialogFooter className="pt-6 border-t flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
              }}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            
            <div className="flex gap-3">
              {isEditing ? (
                // When editing an existing OKR
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                  onClick={handleCreateOKR}
                >
                  Save Changes
                </Button>
              ) : isCreatingActivity ? (
                // When creating an activity
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                  onClick={handleCreateOKR}
                >
                  Create Activity
                </Button>
              ) : (
                // When creating an objective
                <>
                  <Button 
                    variant="outline"
                    className="px-4 py-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={handleSaveAndCreateActivity}
                  >
                    Save Objective and Create Activity
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                    onClick={handleCreateOKR}
                  >
                    Create Objective
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}