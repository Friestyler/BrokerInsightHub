import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tag, InsertTag } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Info } from "lucide-react";
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";
import { format } from "date-fns";

// Mock data for OKR templates
const mockOKRTemplates = [
  {
    id: 1,
    title: "Increase Annual Revenue",
    type: "currency",
    target: 1000000,
    tag: "Revenue Growth",
    timeframe: "this-year",
    milestoneFrequency: "Monthly",
    isExpanded: false,
    nestedCount: 2
  },
  {
    id: 2,
    title: "Improve Customer Satisfaction Score",
    type: "percent",
    target: 85,
    tag: "Customer Experience",
    timeframe: "this-quarter",
    milestoneFrequency: "Monthly",
    isExpanded: false,
    nestedCount: 0
  },
  {
    id: 3,
    title: "Launch New Product Feature",
    type: "checkbox",
    target: null,
    tag: "Product Innovation",
    timeframe: "next-quarter",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 3
  },
  {
    id: 4,
    title: "Expand Market Reach",
    type: "number",
    target: 50,
    tag: "Market Expansion",
    timeframe: "last-6-months",
    milestoneFrequency: "Quarterly",
    isExpanded: false,
    nestedCount: 1
  },
  {
    id: 5,
    title: "Team Development Program",
    type: "percent",
    target: 90,
    tag: "Team Development",
    timeframe: "this-month",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 0
  },
  {
    id: 6,
    title: "Customer Onboarding Optimization",
    type: "number",
    target: 25,
    tag: "Operational Excellence",
    timeframe: "last-30-days",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 1
  }
];

// Function to convert timeframe values to date range display
const getTimeframeDisplayLabel = (timeframe: string): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Undefined';
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const getDateRange = (startDate: Date | null, endDate: Date | null): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };
  
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  
  switch (timeframe) {
    case 'today':
      startDate = new Date(currentYear, currentMonth, currentDate);
      endDate = new Date(currentYear, currentMonth, currentDate);
      break;
    case 'yesterday':
      startDate = new Date(currentYear, currentMonth, currentDate - 1);
      endDate = new Date(currentYear, currentMonth, currentDate - 1);
      break;
    case 'this-month':
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case 'next-month':
      startDate = new Date(currentYear, currentMonth + 1, 1);
      endDate = new Date(currentYear, currentMonth + 2, 0);
      break;
    case 'last-month':
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;
    case 'this-quarter':
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      startDate = new Date(currentYear, quarterStart, 1);
      endDate = new Date(currentYear, quarterStart + 3, 0);
      break;
    case 'next-quarter':
      const nextQuarterStart = Math.floor(currentMonth / 3) * 3 + 3;
      startDate = new Date(currentYear, nextQuarterStart, 1);
      endDate = new Date(currentYear, nextQuarterStart + 3, 0);
      break;
    case 'last-quarter':
      const lastQuarterStart = Math.floor(currentMonth / 3) * 3 - 3;
      startDate = new Date(currentYear, lastQuarterStart, 1);
      endDate = new Date(currentYear, lastQuarterStart + 3, 0);
      break;
    case 'this-year':
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      break;
    case 'next-year':
      startDate = new Date(currentYear + 1, 0, 1);
      endDate = new Date(currentYear + 1, 11, 31);
      break;
    case 'last-year':
      startDate = new Date(currentYear - 1, 0, 1);
      endDate = new Date(currentYear - 1, 11, 31);
      break;
    case 'last-7-days':
      startDate = new Date(currentYear, currentMonth, currentDate - 6);
      endDate = new Date(currentYear, currentMonth, currentDate);
      break;
    case 'last-14-days':
      startDate = new Date(currentYear, currentMonth, currentDate - 13);
      endDate = new Date(currentYear, currentMonth, currentDate);
      break;
    case 'last-30-days':
      startDate = new Date(currentYear, currentMonth, currentDate - 29);
      endDate = new Date(currentYear, currentMonth, currentDate);
      break;
    case 'last-3-months':
      startDate = new Date(currentYear, currentMonth - 2, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case 'last-6-months':
      startDate = new Date(currentYear, currentMonth - 5, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    default:
      return timeframe;
  }
  
  return getDateRange(startDate, endDate);
};

// TagBadge component
const TagBadge = ({ tag }: { tag: string }) => {
  const tagColors: { [key: string]: string } = {
    "Revenue Growth": "bg-green-100 text-green-800",
    "Customer Experience": "bg-blue-100 text-blue-800",
    "Product Innovation": "bg-purple-100 text-purple-800",
    "Operational Excellence": "bg-orange-100 text-orange-800",
    "Market Expansion": "bg-red-100 text-red-800",
    "Team Development": "bg-yellow-100 text-yellow-800"
  };

  return (
    <Badge className={`${tagColors[tag] || "bg-gray-100 text-gray-800"} text-xs px-2 py-1 rounded-full`}>
      {tag}
    </Badge>
  );
};

export default function MetricsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [selectedTargetRange, setSelectedTargetRange] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [advancedTimeframe, setAdvancedTimeframe] = useState("");
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [groupBy, setGroupBy] = useState("tag");
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  
  // Fetch tags from API
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: () => fetch('/api/tags').then(res => res.json()),
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (tagData: InsertTag) => 
      apiRequest('POST', '/api/tags', tagData),
    onSuccess: (newTag: Tag) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setFormData(prev => ({ ...prev, tag: newTag.name }));
      setIsCreatingNewTag(false);
      setNewTagName("");
      setNewTagColor("blue");
      toast({
        title: "Tag created",
        description: `Tag "${newTag.name}" has been created and selected.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    },
  });
  const [formData, setFormData] = useState({
    okrType: '',
    tag: '',
    name: '',
    description: '',
    timeframe: '',
    milestoneFrequency: '',
    target: 0 as number | undefined,
    totalTarget: 0,
    hasTarget: false,
    targetValue: '',
    trafficLights: false,
    trafficLightConfig: '',
    progressBar: false,
    dueDateRequired: false,
    responsibleRequired: false,
    hasPresetTarget: true,
    isTargetRequired: false,
    targetLabel: 'Target',
    realizedLabel: 'Realized',
    showAdvancedSettings: false,
    enableProgressBar: true,
    progressStyle: 'system',
    warningThreshold: 50,
    successThreshold: 80,
    enableTrafficLights: false,
    trafficLightStyle: 'system',
    trafficLightYellowThreshold: 50,
    trafficLightGreenThreshold: 75,
    targetDistribution: 'equal', // 'equal' or 'custom'
    customMilestoneTargets: [] as number[]
  });

  // Calculate total target whenever target, timeframe, or milestone frequency changes
  const calculateTotalTarget = (target: number | undefined, timeframe: string, frequency: string): number => {
    if (!target || !timeframe || !frequency) {
      return 0;
    }
    
    // Determine timeframe duration in months
    let timeframeDuration = 0;
    if (timeframe.includes('quarter') || timeframe.includes('Q1') || timeframe.includes('Q2') || timeframe.includes('Q3') || timeframe.includes('Q4')) {
      timeframeDuration = 3; // Quarter = 3 months
    } else if (timeframe.includes('H1') || timeframe.includes('H2')) {
      timeframeDuration = 6; // Half year = 6 months
    } else if (timeframe === '2024' || timeframe === '2025' || timeframe === 'This year' || timeframe === 'this-year') {
      timeframeDuration = 12; // Full year = 12 months
    } else if (timeframe === 'this-month' || timeframe === 'next-month') {
      timeframeDuration = 1; // Month = 1 month
    } else if (timeframe === 'today' || timeframe === 'yesterday') {
      timeframeDuration = 0.033; // Day ≈ 0.033 months
    } else if (timeframe.includes('days')) {
      // Extract number of days and convert to months
      const days = parseInt(timeframe.match(/\d+/)?.[0] || '0');
      timeframeDuration = days * 0.033; // Convert days to months
    } else if (timeframe.includes('months')) {
      // Handle "last X months" timeframes
      const months = parseInt(timeframe.match(/\d+/)?.[0] || '0');
      timeframeDuration = months;
    }
    
    // Determine milestone frequency in months
    let milestoneInterval = 0;
    switch (frequency) {
      case 'Weekly':
        milestoneInterval = 0.25; // ~1 week = 0.25 months
        break;
      case 'Monthly':
        milestoneInterval = 1;
        break;
      case 'Quarterly':
        milestoneInterval = 3;
        break;
      case 'Yearly':
        milestoneInterval = 12;
        break;
      case 'Custom':
        milestoneInterval = 1; // Default to monthly for custom
        break;
      case 'No milestone (target needs to be met only once)':
        return target; // Single target
      default:
        return 0;
    }
    
    // Calculate number of milestones
    const numberOfMilestones = Math.ceil(timeframeDuration / milestoneInterval);
    const totalTarget = target * numberOfMilestones;
    
    return totalTarget;
  };

  const okrTemplates = mockOKRTemplates;

  // Filter and group functions
  const filteredOKRs = okrTemplates.filter(okr => {
    const matchesSearch = okr.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTags.length === 0 || selectedTags.includes(okr.tag);
    const matchesMeasureUnit = !selectedMeasureUnit || okr.type === selectedMeasureUnit;
    return matchesSearch && matchesTag && matchesMeasureUnit;
  });

  const groupOKRs = (okrs: typeof okrTemplates) => {
    if (groupBy === "tag") {
      return okrs.reduce((groups: { [key: string]: typeof okrs }, okr) => {
        const tagName = okr.tag || "No Tag";
        if (!groups[tagName]) groups[tagName] = [];
        groups[tagName].push(okr);
        return groups;
      }, {});
    }
    return { "All OKRs": okrs };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setSelectedTimeframe("");
    setDateRange({ from: undefined, to: undefined });
    setShowNoTarget(false);
  };

  const resetForm = () => {
    setFormData({
      okrType: '',
      tag: '',
      name: '',
      description: '',
      timeframe: '',
      milestoneFrequency: '',
      target: 0 as number | undefined,
      totalTarget: 0,
      hasTarget: false,
      targetValue: '',
      trafficLights: false,
      trafficLightConfig: '',
      progressBar: false,
      dueDateRequired: false,
      responsibleRequired: false,
      hasPresetTarget: true,
      isTargetRequired: false,
      targetLabel: 'Target',
      realizedLabel: 'Realized',
      showAdvancedSettings: false,
      enableProgressBar: true,
      progressStyle: 'system',
      warningThreshold: 50,
      successThreshold: 80,
      enableTrafficLights: false,
      trafficLightStyle: 'system',
      trafficLightYellowThreshold: 50,
      trafficLightGreenThreshold: 75,
      targetDistribution: 'equal',
      customMilestoneTargets: []
    });
    setIsCreateOKROpen(false);
    setIsCreatingNewTag(false);
    setNewTagName("");
    setNewTagColor("blue");
  };

  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;
    
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  // Clear milestone frequency when timeframe changes to prevent invalid combinations
  React.useEffect(() => {
    if (formData.timeframe) {
      setFormData(prev => ({ ...prev, milestoneFrequency: '' }));
    }
  }, [formData.timeframe]);

  // Auto-enable progress bar for currency types
  React.useEffect(() => {
    if (formData.okrType === 'currency') {
      setFormData(prev => ({ ...prev, enableProgressBar: true }));
    }
  }, [formData.okrType]);

  // Recalculate total target whenever relevant fields change
  React.useEffect(() => {
    const newTotalTarget = calculateTotalTarget(formData.target, formData.timeframe, formData.milestoneFrequency);
    if (newTotalTarget !== formData.totalTarget) {
      setFormData(prev => ({ ...prev, totalTarget: newTotalTarget }));
    }
  }, [formData.target, formData.timeframe, formData.milestoneFrequency]);

  const handleCreateOKR = () => {
    const submissionData = {
      ...formData,
      enableTrafficLights: formData.enableTrafficLights,
      trafficLightStyle: formData.trafficLightStyle,
      trafficLightYellowThreshold: formData.trafficLightYellowThreshold,
      trafficLightGreenThreshold: formData.trafficLightGreenThreshold
    };
    console.log("Creating OKR with data:", submissionData);
    // Handle form submission here
    resetForm();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OKR Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage OKR templates for your organization</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setIsCreateOKROpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          Add OKR metric template
        </Button>
      </div>
      {/* Search and filter section for OKR templates */}
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
              <SelectTrigger className={`w-[140px] transition-colors border ${
                selectedTags.length > 0 
                  ? '!bg-[#E6E7F1] !text-[#51536C] !border-[#E6E7F1] hover:!bg-[#D5D7E5] hover:!text-[#3E4257]' 
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}>
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
            

            
            <AdvancedTimeframeFilter
              value={advancedTimeframe}
              onValueChange={(value) => setAdvancedTimeframe(value)}
              placeholder="Timeframe2"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            
            {/* Group by dropdown */}
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger 
                className={`w-[140px] transition-colors border ${
                  groupBy && groupBy !== "none" 
                    ? '!bg-[#E6E7F1] !text-[#51536C] !border-[#E6E7F1] hover:!bg-[#D5D7E5] hover:!text-[#3E4257]' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SelectValue>
                  {groupBy && groupBy !== "none" ? (
                    <span>Group | {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</span>
                  ) : (
                    <span className="text-gray-500">Group by</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tag">Tag</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          

        </div>
      </div>
      {/* Bulk Actions Bar */}
      <div className="bg-[#F0F1FB] border border-[#D4D9F3] rounded-lg p-4 min-h-[72px]">
        <div className="flex items-center justify-between h-10">
          {selectedOKRs.length > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins' }}>
                  {selectedOKRs.length} OKR{selectedOKRs.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#3E4DC4] bg-white hover:bg-[#F0F1FB] border border-[#3E4DC4] rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v4"/>
                      <path d="M16 2v4"/>
                      <rect width="18" height="18" x="3" y="4" rx="2"/>
                      <path d="M3 10h18"/>
                    </svg>
                    Assign to entity
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#3E4DC4] bg-white hover:bg-[#F0F1FB] border border-[#3E4DC4] rounded-md transition-colors">
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
                className="flex items-center rounded-md px-4 py-2 text-[#3E4DC4] hover:bg-[#F0F1FB]"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E4DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="text-[#3E4DC4]">Clear selection</span>
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-[#696C8C]" style={{ fontFamily: 'Poppins' }}>
              Select at least one OKR from the table to perform bulk actions
            </span>
          )}
        </div>
      </div>
      {/* Group OKRs and display in sections */}
      <div className="mt-6">
        {Object.entries(groupOKRs(filteredOKRs)).sort(([a], [b]) => {
        // Sort "No Tag" to the end, otherwise sort alphabetically
        if (a === "No Tag") return 1;
        if (b === "No Tag") return -1;
        return a.localeCompare(b);
      }).map(([groupName, okrsInGroup]) => (
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
                          setSelectedOKRs(prev => Array.from(new Set([...prev, ...okrsInGroup.map(okr => okr.id)])));
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
                      </div>
                    </TableCell>
                    <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                      <div className="flex items-center w-full">
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
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-[#282A3F]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
                      {getTimeframeDisplayLabel(okr.timeframe)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-[#282A3F]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
                      {okr.milestoneFrequency}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-[#282A3F]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
                      {okr.target ? (
                        okr.type === 'currency' ? `€${okr.target.toLocaleString()}` :
                        okr.type === 'percent' ? `${okr.target}%` :
                        okr.target.toString()
                      ) : 'No target'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        ))}
      </div>
      {/* Create OKR Dialog */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[850px] max-h-[85vh] overflow-y-auto bg-[#ffffff]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create OKR template
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Create a new OKR template that can be assigned to partners, opportunities, and customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* OKR Type Field */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">
                  OKR Type <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fields below adapt based on your selection
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'currency', icon: '💰', title: 'Currency', color: 'border-green-200 bg-green-50', example: '€1,000' },
                  { value: 'percent', icon: '📊', title: 'Percentage', color: 'border-blue-200 bg-blue-50', example: '75%' },
                  { value: 'number', icon: '🔢', title: 'Number', color: 'border-purple-200 bg-purple-50', example: '50#' },
                  { value: 'checkbox', icon: '✅', title: 'Checkbox', color: 'border-orange-200 bg-orange-50', example: 'Done/Not Done' },
                  { value: 'traffic-light', icon: '🚦', title: 'Traffic Light', color: 'border-red-200 bg-red-50', example: 'Red/Green' }
                ].map((type) => (
                  <div 
                    key={type.value}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      formData.okrType === type.value 
                        ? `${type.color} shadow-md ring-2 ring-blue-500 ring-opacity-50` 
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({...prev, okrType: type.value}))}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs font-medium text-gray-900 mb-1">{type.title}</div>
                      <div className="text-xs text-gray-600 leading-tight">{type.example}</div>
                    </div>
                    
                    {formData.okrType === type.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!formData.okrType && (
                <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded text-center">
                  👆 Choose a measurement type to see how the form adapts
                </p>
              )}
            </div>

            {/* Tag Field */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <label htmlFor="okr-tag" className="text-sm font-medium text-gray-900">
                Tag
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add a tag if you want to add this OKR to a plan.
              </p>
              
              <Select value={formData.tag} onValueChange={(value) => {
                setFormData(prev => ({...prev, tag: value}));
              }}>
                <SelectTrigger id="okr-tag" className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Choose tag (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: 
                            tag.color === 'blue' ? '#3B82F6' :
                            tag.color === 'green' ? '#10B981' :
                            tag.color === 'purple' ? '#8B5CF6' :
                            tag.color === 'red' ? '#EF4444' :
                            tag.color === 'orange' ? '#F97316' :
                            tag.color === 'yellow' ? '#EAB308' :
                            tag.color === 'pink' ? '#EC4899' :
                            tag.color === 'gray' ? '#6B7280' : '#3B82F6'
                          }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Essential Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="okr-name" className="text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="okr-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Increase Annual Revenue"
                  className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label htmlFor="okr-description" className="text-sm font-medium text-gray-900">
                  Description
                </label>
                <Textarea 
                  id="okr-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Add a description to provide context and details..."
                  rows={3}
                  className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Timeframe Field */}
              {formData.okrType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Timeframe <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <AdvancedTimeframeFilter
                      value={formData.timeframe}
                      onValueChange={(value) => setFormData(prev => ({...prev, timeframe: value}))}
                      placeholder="Select timeframe"
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </div>
                </div>
              )}

              {/* Milestone Frequency Field */}
              {formData.okrType && (
                <div className="space-y-2">
                  <label htmlFor="okr-milestone-frequency" className="text-sm font-medium text-gray-900">
                    Milestone Frequency <span className="text-red-500">*</span>
                  </label>
                  {!formData.timeframe && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Please select a timeframe first to set the milestone frequency
                    </p>
                  )}
                  <Select 
                    value={formData.milestoneFrequency} 
                    onValueChange={(value) => setFormData(prev => ({...prev, milestoneFrequency: value}))}
                    disabled={!formData.timeframe}
                  >
                    <SelectTrigger id="okr-milestone-frequency" className="w-[350px] border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const timeframe = formData.timeframe;
                        const availableFrequencies = [];
                        
                        // Calculate timeframe duration in months to determine available frequencies
                        let timeframeDuration = 0;
                        if (timeframe.includes('quarter') || timeframe.includes('Q1') || timeframe.includes('Q2') || timeframe.includes('Q3') || timeframe.includes('Q4')) {
                          timeframeDuration = 3;
                        } else if (timeframe.includes('H1') || timeframe.includes('H2')) {
                          timeframeDuration = 6;
                        } else if (timeframe === '2024' || timeframe === '2025' || timeframe === 'this-year') {
                          timeframeDuration = 12;
                        } else if (timeframe === 'this-month' || timeframe === 'next-month') {
                          timeframeDuration = 1;
                        } else if (timeframe === 'today' || timeframe === 'yesterday') {
                          timeframeDuration = 0.033;
                        } else if (timeframe.includes('days')) {
                          const days = parseInt(timeframe.match(/\d+/)?.[0] || '0');
                          timeframeDuration = days * 0.033;
                        } else if (timeframe.includes('months')) {
                          // Handle "last X months" timeframes
                          const months = parseInt(timeframe.match(/\d+/)?.[0] || '0');
                          timeframeDuration = months;
                        }
                        
                        // Determine available frequencies based on timeframe duration
                        if (timeframeDuration <= 1) {
                          // 1 month or less: Weekly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration > 1 && timeframeDuration < 6) {
                          // Between 1-6 months: Weekly, Monthly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration === 6) {
                          // Exactly 6 months: Weekly, Monthly, Quarterly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration > 6 && timeframeDuration < 12) {
                          // Between 6-12 months: Weekly, Monthly, Quarterly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration === 12) {
                          // Exactly 12 months: Weekly, Monthly, Quarterly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration > 12 && timeframeDuration < 24) {
                          // Between 12-24 months: Weekly, Monthly, Quarterly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else if (timeframeDuration >= 24) {
                          // 2+ years: Weekly, Monthly, Quarterly, Yearly, No milestone
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="yearly" value="Yearly">Yearly</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        } else {
                          // Default: show all options
                          availableFrequencies.push(
                            <SelectItem key="weekly" value="Weekly">Weekly</SelectItem>,
                            <SelectItem key="monthly" value="Monthly">Monthly</SelectItem>,
                            <SelectItem key="quarterly" value="Quarterly">Quarterly</SelectItem>,
                            <SelectItem key="yearly" value="Yearly">Yearly</SelectItem>,
                            <SelectItem key="custom" value="Custom">Custom</SelectItem>,
                            <SelectItem key="no-milestone" value="No milestone (target needs to be met only once)">No milestone (target needs to be met only once)</SelectItem>
                          );
                        }
                        
                        return availableFrequencies;
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target & Measurement Section */}
              {formData.okrType && (
                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Set Your Target <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
                    <p className="text-sm text-gray-600">Users will track their results against these targets. You can leave targets empty if you prefer to let users set their own targets, or define default values here.</p>
                  </div>

                  {/* Target Field - Currency */}
                  {formData.okrType === 'currency' && (
                    <div className="space-y-4">
                      {/* Total Target Input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <label htmlFor="okr-total-target" className="text-sm font-medium text-gray-900">
                            {formData.targetLabel || 'Target'} for full timeframe
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Set the total target amount you want to achieve over the entire timeframe period.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative" style={{ width: '350px' }}>
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                          <Input 
                            id="okr-total-target"
                            type="number"
                            value={formData.totalTarget || ''}
                            onChange={(e) => setFormData(prev => ({...prev, totalTarget: parseFloat(e.target.value) || 0}))}
                            placeholder="Optional (e.g., 12000)"
                            className="pl-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Target Distribution Options */}
                      {formData.totalTarget > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">Target Distribution</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="equal-distribution"
                                name="targetDistribution"
                                value="equal"
                                checked={formData.targetDistribution === 'equal'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'equal'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="equal-distribution" className="text-sm text-gray-900">
                                <span className="font-medium">Split equally</span> - Divide total target evenly across all milestones
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="custom-distribution"
                                name="targetDistribution"
                                value="custom"
                                checked={formData.targetDistribution === 'custom'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'custom'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="custom-distribution" className="text-sm text-gray-900">
                                <span className="font-medium">Custom distribution</span> - Set specific targets for each milestone
                              </label>
                            </div>
                          </div>

                          {/* Equal Distribution Preview */}
                          {formData.targetDistribution === 'equal' && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-800 mb-2 font-medium">Equal Distribution Preview</p>
                              <p className="text-xs text-blue-700">
                                Target per milestone: €{Math.round(formData.totalTarget / calculateTotalTarget(1, formData.timeframe, formData.milestoneFrequency)).toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Total milestones: {calculateTotalTarget(1, formData.timeframe, formData.milestoneFrequency)}
                              </p>
                            </div>
                          )}

                          {/* Custom Distribution Interface */}
                          {formData.targetDistribution === 'custom' && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-xs text-orange-800 mb-3 font-medium">Custom Milestone Targets</p>
                              <p className="text-xs text-orange-700 mb-2">
                                Set individual targets for each milestone (must total €{formData.totalTarget.toLocaleString()})
                              </p>
                              <div className="text-xs text-orange-600">
                                Custom target configuration will be available when users assign this template to themselves.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Target Field - Percentage */}
                  {formData.okrType === 'percent' && (
                    <div className="space-y-4">
                      {/* Total Target Input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <label htmlFor="okr-total-target" className="text-sm font-medium text-gray-900">
                            {formData.targetLabel || 'Target'} for full timeframe
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Set the target percentage you want to achieve over the entire timeframe period.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative" style={{ width: '350px' }}>
                          <Input 
                            id="okr-total-target"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.totalTarget || ''}
                            onChange={(e) => setFormData(prev => ({...prev, totalTarget: parseFloat(e.target.value) || 0}))}
                            placeholder="Optional (e.g., 85)"
                            className="pr-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Target Distribution Options */}
                      {formData.totalTarget > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">Target Distribution</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="equal-distribution-percent"
                                name="targetDistribution"
                                value="equal"
                                checked={formData.targetDistribution === 'equal'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'equal'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="equal-distribution-percent" className="text-sm text-gray-900">
                                <span className="font-medium">Same target for all milestones</span> - Each milestone has the same percentage target
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="custom-distribution-percent"
                                name="targetDistribution"
                                value="custom"
                                checked={formData.targetDistribution === 'custom'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'custom'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="custom-distribution-percent" className="text-sm text-gray-900">
                                <span className="font-medium">Custom targets per milestone</span> - Set different percentage targets for each milestone
                              </label>
                            </div>
                          </div>

                          {/* Equal Distribution Preview */}
                          {formData.targetDistribution === 'equal' && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-800 mb-2 font-medium">Equal Distribution Preview</p>
                              <p className="text-xs text-blue-700">
                                Target per milestone: {formData.totalTarget}%
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Total milestones: {calculateTotalTarget(1, formData.timeframe, formData.milestoneFrequency)}
                              </p>
                            </div>
                          )}

                          {/* Custom Distribution Interface */}
                          {formData.targetDistribution === 'custom' && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-xs text-orange-800 mb-3 font-medium">Custom Milestone Targets</p>
                              <p className="text-xs text-orange-700 mb-2">
                                Set individual percentage targets for each milestone
                              </p>
                              <div className="text-xs text-orange-600">
                                Custom target configuration will be available when users assign this template to themselves.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Target Field - Number */}
                  {formData.okrType === 'number' && (
                    <div className="space-y-4">
                      {/* Total Target Input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <label htmlFor="okr-total-target" className="text-sm font-medium text-gray-900">
                            {formData.targetLabel || 'Target'} for full timeframe
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Set the total target number you want to achieve over the entire timeframe period.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative" style={{ width: '350px' }}>
                          <Input 
                            id="okr-total-target"
                            type="number"
                            value={formData.totalTarget || ''}
                            onChange={(e) => setFormData(prev => ({...prev, totalTarget: parseFloat(e.target.value) || 0}))}
                            placeholder="Optional (e.g., 200)"
                            className="pr-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">#</span>
                        </div>
                      </div>

                      {/* Target Distribution Options */}
                      {formData.totalTarget > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">Target Distribution</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="equal-distribution-number"
                                name="targetDistribution"
                                value="equal"
                                checked={formData.targetDistribution === 'equal'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'equal'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="equal-distribution-number" className="text-sm text-gray-900">
                                <span className="font-medium">Split equally</span> - Divide total target evenly across all milestones
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="custom-distribution-number"
                                name="targetDistribution"
                                value="custom"
                                checked={formData.targetDistribution === 'custom'}
                                onChange={() => setFormData(prev => ({...prev, targetDistribution: 'custom'}))}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="custom-distribution-number" className="text-sm text-gray-900">
                                <span className="font-medium">Custom distribution</span> - Set specific targets for each milestone
                              </label>
                            </div>
                          </div>

                          {/* Equal Distribution Preview */}
                          {formData.targetDistribution === 'equal' && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-800 mb-2 font-medium">Equal Distribution Preview</p>
                              <p className="text-xs text-blue-700">
                                Target per milestone: {Math.round(formData.totalTarget / calculateTotalTarget(1, formData.timeframe, formData.milestoneFrequency)).toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Total milestones: {calculateTotalTarget(1, formData.timeframe, formData.milestoneFrequency)}
                              </p>
                            </div>
                          )}

                          {/* Custom Distribution Interface */}
                          {formData.targetDistribution === 'custom' && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-xs text-orange-800 mb-3 font-medium">Custom Milestone Targets</p>
                              <p className="text-xs text-orange-700 mb-2">
                                Set individual targets for each milestone (must total {formData.totalTarget.toLocaleString()})
                              </p>
                              <div className="text-xs text-orange-600">
                                Custom target configuration will be available when users assign this template to themselves.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Bar Configuration */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Progress Visualization</h4>
                      <p className="text-xs text-gray-600">Configure how progress is displayed to users</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="enable-progress-bar"
                        checked={formData.enableProgressBar !== false}
                        onChange={(e) => setFormData(prev => ({...prev, enableProgressBar: e.target.checked}))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                          <label htmlFor="enable-progress-bar" className="text-sm font-medium text-gray-900">
                            Enable progress bar visualization
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 w-8" style={{ fontSize: '14px', lineHeight: '14px' }}>60%</span>
                            <div className="w-[120px] bg-gray-200 rounded-full h-[6px]">
                              <div 
                                className={`h-[6px] rounded-full transition-all duration-300 ${
                                  formData.enableProgressBar !== false ? 'bg-gray-500' : 'bg-gray-300'
                                }`}
                                style={{ width: '60%' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {(formData.target || 0) > 0 
                            ? "Shows a visual progress bar with percentage completion based on target vs realized values"
                            : "Will be auto-enabled when users add targets to their assigned OKRs"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Lights Configuration */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Traffic Light Status</h4>
                      <p className="text-xs text-gray-600">Alternative visualization using color-coded status indicators</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="enable-traffic-lights"
                        checked={formData.enableTrafficLights}
                        onChange={(e) => setFormData(prev => ({...prev, enableTrafficLights: e.target.checked}))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                          <label htmlFor="enable-traffic-lights" className="text-sm font-medium text-gray-900">
                            Enable traffic light indicators
                          </label>
                          <div className="flex items-center gap-1">
                            <span 
                              className={`w-4 h-4 rounded-full transition-opacity duration-300 ${
                                formData.enableTrafficLights ? 'opacity-100' : 'opacity-40'
                              }`} 
                              style={{ backgroundColor: '#bcbcd2' }}
                            ></span>
                            <span 
                              className={`w-4 h-4 rounded-full transition-opacity duration-300 ${
                                formData.enableTrafficLights ? 'opacity-100' : 'opacity-40'
                              }`} 
                              style={{ backgroundColor: '#f4828b' }}
                            ></span>
                            <span 
                              className={`w-4 h-4 rounded-full transition-opacity duration-300 ${
                                formData.enableTrafficLights ? 'opacity-100' : 'opacity-40'
                              }`} 
                              style={{ backgroundColor: '#ffb372' }}
                            ></span>
                            <span 
                              className={`w-4 h-4 rounded-full transition-opacity duration-300 ${
                                formData.enableTrafficLights ? 'opacity-100' : 'opacity-40'
                              }`} 
                              style={{ backgroundColor: '#00c99c' }}
                            ></span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Shows status using colored circles: Gray (no data), Red (off track), Yellow (at risk), Green (on track)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Advanced Settings</h4>
                        <p className="text-xs text-gray-600">Optional customizations for power users</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, showAdvancedSettings: !prev.showAdvancedSettings}))}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {formData.showAdvancedSettings ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {formData.showAdvancedSettings && (
                      <div className="space-y-4">
                        {/* Progress Bar Style Configuration */}
                        {(formData.enableProgressBar !== false) && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-800 mb-2">Progress Bar Style</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="progress-system"
                                  name="progressStyle"
                                  value="system"
                                  checked={formData.progressStyle !== 'custom'}
                                  onChange={() => setFormData(prev => ({...prev, progressStyle: 'system'}))}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="progress-system" className="text-xs text-gray-900">
                                  <span className="font-medium">Simple grey bar</span> - Shows percentage completion (recommended)
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="progress-custom"
                                  name="progressStyle"
                                  value="custom"
                                  checked={formData.progressStyle === 'custom'}
                                  onChange={() => setFormData(prev => ({...prev, progressStyle: 'custom'}))}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="progress-custom" className="text-xs text-gray-900">
                                  <span className="font-medium">Color-coded bar</span> - Changes color based on performance levels
                                </label>
                              </div>
                            </div>

                            {formData.progressStyle === 'custom' && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-3">
                                <p className="text-xs text-blue-800 mb-3 font-medium">Color-Coded Progress Settings</p>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs text-gray-700">Yellow warning at (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.warningThreshold || 50}
                                        onChange={(e) => setFormData(prev => ({...prev, warningThreshold: parseInt(e.target.value)}))}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                                        placeholder="50"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-700">Green success at (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.successThreshold || 80}
                                        onChange={(e) => setFormData(prev => ({...prev, successThreshold: parseInt(e.target.value)}))}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                                        placeholder="80"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-1"></span>Red: Below {formData.warningThreshold || 50}% • 
                                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1 ml-2"></span>Yellow: {formData.warningThreshold || 50}%-{formData.successThreshold || 80}% • 
                                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 ml-2"></span>Green: Above {formData.successThreshold || 80}%
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Traffic Light Style Configuration */}
                        {formData.enableTrafficLights && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-800 mb-2">Traffic Light Thresholds</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="traffic-system"
                                  name="trafficLightStyle"
                                  value="system"
                                  checked={formData.trafficLightStyle !== 'custom'}
                                  onChange={() => setFormData(prev => ({...prev, trafficLightStyle: 'system'}))}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="traffic-system" className="text-xs text-gray-900">
                                  <span className="font-medium">Standard thresholds</span> - Red &lt;50%, Yellow 50-74%, Green ≥75% (recommended)
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="traffic-custom"
                                  name="trafficLightStyle"
                                  value="custom"
                                  checked={formData.trafficLightStyle === 'custom'}
                                  onChange={() => setFormData(prev => ({...prev, trafficLightStyle: 'custom'}))}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="traffic-custom" className="text-xs text-gray-900">
                                  <span className="font-medium">Custom thresholds</span> - Define your own performance ranges
                                </label>
                              </div>
                            </div>

                            {formData.trafficLightStyle === 'custom' && (
                              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md mt-3">
                                <p className="text-xs text-orange-800 mb-3 font-medium">Custom Traffic Light Thresholds</p>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs text-gray-700">Yellow threshold (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.trafficLightYellowThreshold || 50}
                                        onChange={(e) => setFormData(prev => ({...prev, trafficLightYellowThreshold: parseInt(e.target.value)}))}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                                        placeholder="50"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-700">Green threshold (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.trafficLightGreenThreshold || 75}
                                        onChange={(e) => setFormData(prev => ({...prev, trafficLightGreenThreshold: parseInt(e.target.value)}))}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                                        placeholder="75"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#f4828b' }}></span>Red: Below {formData.trafficLightYellowThreshold || 50}% • 
                                    <span className="inline-block w-2 h-2 rounded-full mr-1 ml-2" style={{ backgroundColor: '#ffb372' }}></span>Yellow: {formData.trafficLightYellowThreshold || 50}%-{formData.trafficLightGreenThreshold || 75}% • 
                                    <span className="inline-block w-2 h-2 rounded-full mr-1 ml-2" style={{ backgroundColor: '#00c99c' }}></span>Green: {formData.trafficLightGreenThreshold || 75}%+ • 
                                    <span className="inline-block w-2 h-2 rounded-full mr-1 ml-2" style={{ backgroundColor: '#bcbcd2' }}></span>Gray: No data
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Field Labels */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-800 mb-2">Field Labels</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="target-label" className="text-xs font-medium text-gray-700">
                                Target field name
                              </label>
                              <Input 
                                id="target-label"
                                value={formData.targetLabel || 'Target'}
                                onChange={(e) => setFormData(prev => ({...prev, targetLabel: e.target.value}))}
                                placeholder="e.g., YTD, Goal"
                                className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="realized-label" className="text-xs font-medium text-gray-700">
                                Progress field name
                              </label>
                              <Input 
                                id="realized-label"
                                value={formData.realizedLabel || 'Realized'}
                                onChange={(e) => setFormData(prev => ({...prev, realizedLabel: e.target.value}))}
                                placeholder="e.g., Full Year, Progress"
                                className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-8 border-t flex justify-between">
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
              onClick={handleCreateOKR}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}