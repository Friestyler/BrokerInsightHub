import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface OKRTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  hierarchy: string;
  parent: number | null;
  progress: number;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  status: string;
  owner: string;
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date;
  tag?: string;
  frequency?: string;
  trafficLights?: boolean;
  trafficLightConfig?: string;
  progressBar?: boolean;
  dueDateRequired?: boolean;
  responsibleRequired?: boolean;
  measureUnit?: string;
}

const okrTemplates: OKRTemplate[] = [
  {
    id: 1,
    title: "Increase Partner Revenue",
    description: "Expand our partner network to drive more revenue through strategic partnerships",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 85,
    targetValue: 500000,
    currentValue: 425000,
    unit: "currency",
    status: "On Track",
    owner: "John Smith",
    tag: "Financial",
    frequency: "Quarterly",
    trafficLights: true,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true,
    measureUnit: "currency"
  },
  {
    id: 2,
    title: "Partner Acquisition",
    description: "Onboard 50 new qualified partners",
    type: "Key Result",
    hierarchy: "key-result",
    parent: 1,
    progress: 70,
    targetValue: 50,
    currentValue: 35,
    unit: "number",
    status: "In Progress",
    owner: "Sarah Johnson",
    tag: "Partner",
    frequency: "Monthly",
    trafficLights: false,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true,
    measureUnit: "number"
  },
  {
    id: 3,
    title: "Partner Onboarding Process",
    description: "Streamline new partner integration workflow",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 75,
    targetValue: 20,
    currentValue: 15,
    unit: "number",
    status: "In Progress",
    owner: "Mike Wilson",
    tag: "Operations",
    frequency: "Weekly",
    trafficLights: true,
    trafficLightConfig: "Green: >70%, Yellow: 40-70%, Red: <40%",
    progressBar: true,
    dueDateRequired: false,
    responsibleRequired: true,
    measureUnit: "number"
  },
  {
    id: 4,
    title: "Digital Transformation KPI",
    description: "Enhance digital capabilities across partner ecosystem",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 60,
    targetValue: 95,
    currentValue: 57,
    unit: "percent",
    status: "At Risk",
    owner: "Lisa Chen",
    tag: "Digital",
    frequency: "Quarterly",
    trafficLights: true,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true,
    measureUnit: "percent"
  },
  {
    id: 5,
    title: "Partner Training Completion",
    description: "Complete certification training for all active partners",
    type: "Key Result",
    hierarchy: "key-result",
    parent: 4,
    progress: 45,
    targetValue: 100,
    currentValue: 45,
    unit: "percent",
    status: "Behind",
    owner: "David Rodriguez",
    tag: "Training",
    frequency: "Monthly",
    trafficLights: false,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true,
    measureUnit: "percent"
  }
];

export default function OKRsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [selectedTargetRange, setSelectedTargetRange] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [groupBy, setGroupBy] = useState("tag");
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Filter OKR templates based on search and filters
  const filteredOKRTemplates = okrTemplates.filter(okr => {
    const matchesSearch = searchTerm === "" || 
      okr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.includes(okr.tag || "");
      
    const matchesMeasureUnit = selectedMeasureUnit === "" || okr.measureUnit === selectedMeasureUnit;
    
    // Target range filtering
    let matchesTargetRange = true;
    if (selectedTargetRange && okr.targetValue !== undefined) {
      if (selectedMeasureUnit === 'currency') {
        const rangeMatch = selectedTargetRange.match(/\$?(\d+)-\$?(\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[2]);
          matchesTargetRange = okr.targetValue >= min && okr.targetValue <= max;
        }
      } else if (selectedMeasureUnit === 'percent') {
        const rangeMatch = selectedTargetRange.match(/(\d+)%-(\d+)%/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[2]);
          matchesTargetRange = okr.targetValue >= min && okr.targetValue <= max;
        }
      } else if (selectedMeasureUnit === 'number') {
        const rangeMatch = selectedTargetRange.match(/(\d+)-(\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[2]);
          matchesTargetRange = okr.targetValue >= min && okr.targetValue <= max;
        }
      }
    }
    
    // No target filter
    const matchesNoTarget = !showNoTarget || okr.targetValue === undefined;
    
    return matchesSearch && matchesTags && matchesMeasureUnit && matchesTargetRange && matchesNoTarget;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setSelectedTimeframe("");
    setShowNoTarget(false);
    setDateRange({ from: undefined, to: undefined });
  };

  // Group OKR templates
  const groupedOKRs = () => {
    if (groupBy === "none") return { "All OKRs": filteredOKRTemplates };
    
    const groups: { [key: string]: OKRTemplate[] } = {};
    
    filteredOKRTemplates.forEach(okr => {
      let groupKey = "Uncategorized";
      
      switch (groupBy) {
        case "tag":
          groupKey = okr.tag || "Uncategorized";
          break;
        case "type":
          groupKey = okr.type;
          break;
        case "status":
          groupKey = okr.status;
          break;
        case "owner":
          groupKey = okr.owner;
          break;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(okr);
    });
    
    return groups;
  };

  // Get tag colors
  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      Financial: "bg-green-100 text-green-800",
      Revenue: "bg-blue-100 text-blue-800", 
      Partner: "bg-purple-100 text-purple-800",
      Pipeline: "bg-yellow-100 text-yellow-800",
      Sales: "bg-red-100 text-red-800",
      Training: "bg-indigo-100 text-indigo-800",
      Certification: "bg-pink-100 text-pink-800",
      People: "bg-orange-100 text-orange-800",
      Marketing: "bg-teal-100 text-teal-800",
      Budget: "bg-cyan-100 text-cyan-800",
      Digital: "bg-violet-100 text-violet-800",
      Operations: "bg-gray-100 text-gray-800",
      "Market Expansion": "bg-emerald-100 text-emerald-800"
    };
    return colors[tag] || "bg-gray-100 text-gray-800";
  };

  // Toggle OKR selection
  const toggleOKRSelection = (id: number) => {
    setSelectedOKRs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle expanded state
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OKRs</h1>
          <p className="text-gray-600">Manage your Objectives and Key Results</p>
        </div>
      </div>

      {/* Search and filter section */}
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
                          className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                            selectedTimeframe === option.value ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right side - calendar (only show when Custom is selected) */}
                  {selectedTimeframe === "custom" && (
                    <div className="p-2">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                      />
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-target" 
              checked={showNoTarget}
              onCheckedChange={(checked) => setShowNoTarget(checked as boolean)}
            />
            <Label htmlFor="no-target" className="text-sm">Show items without targets</Label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag">Group by Tag</SelectItem>
              <SelectItem value="type">Group by Type</SelectItem>
              <SelectItem value="status">Group by Status</SelectItem>
              <SelectItem value="owner">Group by Owner</SelectItem>
              <SelectItem value="none">No Grouping</SelectItem>
            </SelectContent>
          </Select>
          
          {(selectedTags.length > 0 || searchTerm || selectedMeasureUnit || selectedTargetRange || selectedTimeframe || showNoTarget) && (
            <Button variant="ghost" onClick={clearFilters} className="h-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedOKRs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedOKRs.length} OKR{selectedOKRs.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Assign to Partners
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedOKRs([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OKR Templates Grid */}
      <div className="space-y-6">
        {Object.entries(groupedOKRs()).map(([groupName, okrs]) => (
          <div key={groupName}>
            {groupBy !== "none" && (
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                {groupName} ({okrs.length})
              </h2>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {okrs.map((okr) => (
                <div 
                  key={okr.id} 
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedOKRs.includes(okr.id)}
                        onCheckedChange={() => toggleOKRSelection(okr.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <h3 className="font-medium text-gray-900 text-sm">{okr.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {okr.tag && (
                        <Badge variant="secondary" className={`text-xs ${getTagColor(okr.tag)}`}>
                          {okr.tag}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{okr.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{okr.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${okr.progress}%` }}
                      />
                    </div>
                    
                    {okr.targetValue && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Target</span>
                        <span className="font-medium">
                          {okr.measureUnit === 'currency' ? '$' : ''}
                          {okr.targetValue.toLocaleString()}
                          {okr.measureUnit === 'percent' ? '%' : ''}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Owner</span>
                      <span className="font-medium">{okr.owner}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          okr.status === 'On Track' ? 'bg-green-100 text-green-800' :
                          okr.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
                          okr.status === 'Behind' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {okr.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredOKRTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 34l-8-8m0 0L18 18m8 8l8-8m-8 8l-8 8" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No OKR templates found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}