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
import { CalendarIcon } from "lucide-react";
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
    timeframe: "Yearly",
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
    timeframe: "Quarterly",
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
    timeframe: "Quarterly",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 3
  }
];

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
  const [formData, setFormData] = useState({
    okrType: '',
    tag: '',
    name: '',
    description: '',
    timeframe: '',
    milestoneFrequency: '',
    target: 0,
    hasTarget: false,
    targetValue: '',
    trafficLights: false,
    trafficLightConfig: '',
    progressBar: false,
    dueDateRequired: false,
    responsibleRequired: false
  });

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
      target: 0,
      hasTarget: false,
      targetValue: '',
      trafficLights: false,
      trafficLightConfig: '',
      progressBar: false,
      dueDateRequired: false,
      responsibleRequired: false
    });
    setIsCreateOKROpen(false);
  };

  const handleCreateOKR = () => {
    console.log("Creating OKR with data:", formData);
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[72px]">
        <div className="flex items-center justify-between h-10">
          {selectedOKRs.length > 0 ? (
            <>
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
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-blue-900">
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
                      {okr.timeframe}
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
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-[#ffffff]">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create OKR template
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Create a new OKR template that can be assigned to partners, opportunities, and customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* OKR Type Field */}
            <div className="space-y-3">
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

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Tag Field */}
            <div className="space-y-2">
              <label htmlFor="okr-tag" className="text-sm font-medium text-gray-900">
                Tag
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add a tag if you want to add this OKR to a plan.
              </p>
              <Select value={formData.tag} onValueChange={(value) => setFormData(prev => ({...prev, tag: value}))}>
                <SelectTrigger id="okr-tag" className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Choose tag (optional)" />
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

            {/* Essential Fields */}
            <div className="space-y-4">
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
                  <AdvancedTimeframeFilter
                    value={formData.timeframe}
                    onValueChange={(value) => setFormData(prev => ({...prev, timeframe: value}))}
                    placeholder="Select timeframe"
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
              )}

              {/* Milestone Frequency Field */}
              {formData.okrType && (
                <div className="space-y-2">
                  <label htmlFor="okr-milestone-frequency" className="text-sm font-medium text-gray-900">
                    Milestone Frequency <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.milestoneFrequency} onValueChange={(value) => setFormData(prev => ({...prev, milestoneFrequency: value}))}>
                    <SelectTrigger id="okr-milestone-frequency" className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="On completion">On completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target Field - Currency */}
              {formData.okrType === 'currency' && (
                <div className="space-y-2">
                  <label htmlFor="okr-target" className="text-sm font-medium text-gray-900">
                    Target Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <Input 
                      id="okr-target"
                      type="number"
                      value={formData.target || ''}
                      onChange={(e) => setFormData(prev => ({...prev, target: parseFloat(e.target.value) || 0}))}
                      placeholder="1000"
                      className="pl-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Target Field - Percentage */}
              {formData.okrType === 'percent' && (
                <div className="space-y-2">
                  <label htmlFor="okr-target" className="text-sm font-medium text-gray-900">
                    Target Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      id="okr-target"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.target || ''}
                      onChange={(e) => setFormData(prev => ({...prev, target: parseFloat(e.target.value) || 0}))}
                      placeholder="75"
                      className="pr-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              )}

              {/* Target Field - Number */}
              {formData.okrType === 'number' && (
                <div className="space-y-2">
                  <label htmlFor="okr-target" className="text-sm font-medium text-gray-900">
                    Target Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      id="okr-target"
                      type="number"
                      value={formData.target || ''}
                      onChange={(e) => setFormData(prev => ({...prev, target: parseFloat(e.target.value) || 0}))}
                      placeholder="50"
                      className="pr-8 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">#</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-6 border-t flex justify-between">
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