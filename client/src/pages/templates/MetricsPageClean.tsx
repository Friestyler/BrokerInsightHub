import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for OKRs - exactly as it was in "Coming Soon" tab
const mockOKRs = [
  {
    id: 1,
    title: "Increase Monthly Recurring Revenue",
    description: "Drive sustainable revenue growth through new customer acquisition and retention",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 65,
    targetValue: 500000,
    currentValue: 325000,
    unit: "currency",
    status: "On Track",
    owner: "Sarah Johnson",
    dueDate: new Date('2024-12-31'),
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    tag: "Revenue Growth"
  },
  {
    id: 2,
    title: "Launch Mobile Application",
    description: "Develop and release mobile app with core functionality",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 30,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "In Progress",
    owner: "Mike Chen",
    dueDate: new Date('2024-11-30'),
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-11-30'),
    tag: "Product Innovation"
  },
  {
    id: 3,
    title: "Improve Customer Satisfaction Score",
    description: "Enhance customer experience and support quality",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 85,
    targetValue: 4.5,
    currentValue: 4.1,
    unit: "number",
    status: "On Track",
    owner: "Lisa Rodriguez",
    dueDate: new Date('2024-10-31'),
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-10-31'),
    tag: "Customer Success"
  },
  {
    id: 4,
    title: "Expand to European Markets",
    description: "Enter key European markets and establish local partnerships",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 20,
    targetValue: 1,
    currentValue: 0,
    unit: "checkbox",
    status: "Started",
    owner: "David Wilson",
    dueDate: new Date('2025-03-31'),
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-03-31'),
    tag: "Market Expansion"
  }
];

const TagBadge = ({ tag }: { tag: string }) => {
  const getTagColor = (tag: string) => {
    const tagColors = {
      "Revenue Growth": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Product Innovation": "bg-blue-100 text-blue-800 border-blue-200",
      "Customer Success": "bg-teal-100 text-teal-800 border-teal-200",
      "Market Expansion": "bg-purple-100 text-purple-800 border-purple-200",
    };
    
    return tagColors[tag as keyof typeof tagColors] || "bg-gray-100 text-gray-800 border-gray-200";
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

export default function MetricsPage() {
  // State needed for the OKR functionality
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

  // Save OKR templates to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('okrTemplates', JSON.stringify(okrTemplates));
  }, [okrTemplates]);

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

  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [parentObjective, setParentObjective] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOKR, setEditingOKR] = useState<any>(null);

  // Clear filters
  const clearFilters = () => {
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setSelectedTimeframe("");
    setAdvancedTimeframe("");
    setShowNoTarget(false);
    setDateRange({ from: undefined, to: undefined });
  };

  // Toggle OKR selection
  const toggleOKRSelection = (id: number) => {
    setSelectedOKRs(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Select all OKRs
  const handleSelectAllOKRs = (checked: boolean) => {
    if (checked) {
      setSelectedOKRs(okrTemplates.map((o: any) => o.id));
    } else {
      setSelectedOKRs([]);
    }
  };

  // Clear OKR selection
  const clearOKRSelection = () => {
    setSelectedOKRs([]);
  };

  // Delete selected OKRs
  const deleteSelectedOKRs = () => {
    setOkrTemplates((prev: any) => 
      prev.filter((okr: any) => !selectedOKRs.includes(okr.id))
    );
    setSelectedOKRs([]);
  };

  // Create new OKR
  const handleCreateOKR = () => {
    const newOKR = {
      id: Date.now(),
      title: formData.name,
      description: formData.description,
      type: isCreatingActivity ? "Activity" : "Objective",
      hierarchy: isCreatingActivity ? "activity" : "objective",
      parent: isCreatingActivity ? parentObjective?.id : null,
      progress: 0,
      targetValue: formData.hasTarget ? parseFloat(formData.targetValue) || 0 : null,
      currentValue: 0,
      unit: formData.measureUnit || "number",
      status: "Not Started",
      owner: "",
      dueDate: formData.endDate ? new Date(formData.endDate) : null,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      tag: formData.tag
    };

    if (isEditing && editingOKR) {
      setOkrTemplates((prev: any) => 
        prev.map((okr: any) => okr.id === editingOKR.id ? { ...newOKR, id: editingOKR.id } : okr)
      );
      setIsEditing(false);
      setEditingOKR(null);
    } else {
      setOkrTemplates((prev: any) => [...prev, newOKR]);
    }

    setIsCreateOKROpen(false);
    setIsCreatingActivity(false);
    setParentObjective(null);
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
  };

  // Group OKRs by tag
  const groupedOKRs = okrTemplates.reduce((acc: any, okr: any) => {
    const tag = okr.tag || 'Uncategorized';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(okr);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Templates</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateOKROpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create OKR Template
          </Button>
        </div>
      </div>
      
      {/* OKR Templates Content */}
      <div className="w-full">
        {/* Filtering controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tag">Group by Tag</SelectItem>
                  <SelectItem value="status">Group by Status</SelectItem>
                  <SelectItem value="owner">Group by Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedOKRs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedOKRs.length} selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearOKRSelection}
                >
                  Clear
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={deleteSelectedOKRs}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* OKR Templates Display */}
        <div className="space-y-6">
          {Object.entries(groupedOKRs).map(([tag, okrs]: [string, any]) => (
            <div key={tag} className="space-y-4">
              <div className="flex items-center gap-3">
                <TagBadge tag={tag} />
                <span className="text-sm text-gray-500">
                  {(okrs as any[]).length} template{(okrs as any[]).length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid gap-4">
                {(okrs as any[]).map((okr: any) => (
                  <Card key={okr.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedOKRs.includes(okr.id)}
                            onChange={() => toggleOKRSelection(okr.id)}
                            className="mt-1 rounded border-gray-300"
                          />
                          <div>
                            <CardTitle className="text-lg">{okr.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {okr.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {okr.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingOKR(okr);
                              setIsEditing(true);
                              setFormData({
                                okrType: okr.type.toLowerCase(),
                                tag: okr.tag,
                                name: okr.title,
                                description: okr.description,
                                hasTarget: okr.targetValue !== null,
                                measureUnit: okr.unit,
                                targetValue: okr.targetValue?.toString() || "",
                                startDate: okr.startDate ? format(new Date(okr.startDate), 'yyyy-MM-dd') : "",
                                endDate: okr.endDate ? format(new Date(okr.endDate), 'yyyy-MM-dd') : "",
                                frequency: "",
                                trafficLights: false,
                                trafficLightConfig: "",
                                progressBar: false,
                                dueDateRequired: false,
                                responsibleRequired: false,
                                showAdvanced: false
                              });
                              setIsCreateOKROpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {okr.targetValue && (
                          <span>Target: {okr.targetValue.toLocaleString()}</span>
                        )}
                        {okr.unit && (
                          <span>Unit: {okr.unit}</span>
                        )}
                        {okr.owner && (
                          <span>Owner: {okr.owner}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit OKR Dialog */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit OKR Template' : 'Create New OKR Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* OKR Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OKR Type
              </label>
              <Select 
                value={formData.okrType} 
                onValueChange={(value) => setFormData(prev => ({...prev, okrType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OKR type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="objective">Objective</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <Input
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({...prev, tag: e.target.value}))}
                placeholder="Enter tag"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder="Enter OKR name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Has Target */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has-target"
                checked={formData.hasTarget}
                onChange={(e) => setFormData(prev => ({...prev, hasTarget: e.target.checked}))}
                className="rounded border-gray-300"
              />
              <label htmlFor="has-target" className="text-sm font-medium text-gray-700">
                Has Target Value
              </label>
            </div>

            {/* Target Value Fields */}
            {formData.hasTarget && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Measure Unit
                  </label>
                  <Select
                    value={formData.measureUnit}
                    onValueChange={(value) => setFormData(prev => ({...prev, measureUnit: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="currency">Currency</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value
                  </label>
                  <Input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({...prev, targetValue: e.target.value}))}
                    placeholder="Enter target value"
                  />
                </div>
              </>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOKROpen(false);
                setIsEditing(false);
                setEditingOKR(null);
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
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOKR} className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}