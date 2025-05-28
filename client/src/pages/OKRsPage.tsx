import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Independent mock data for OKRs page - completely separate from MetricsPage
const independentOKRData = [
  {
    id: 1,
    title: "Increase Partner Revenue",
    description: "Expand revenue streams through strategic partner relationships",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 65,
    targetValue: 500000,
    currentValue: 325000,
    unit: "€",
    status: "In Progress",
    owner: "John Smith",
    dueDate: new Date("2025-12-31"),
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    tag: "Revenue",
    frequency: "Quarterly",
    trafficLights: true,
    trafficLightConfig: "Green: >80%, Yellow: 50-80%, Red: <50%",
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true
  },
  {
    id: 2,
    title: "Launch Marketing Campaign",
    description: "Execute comprehensive digital marketing strategy",
    type: "Activity",
    hierarchy: "activity",
    parent: 1,
    progress: 40,
    targetValue: 10,
    currentValue: 4,
    unit: "campaigns",
    status: "In Progress",
    owner: "Sarah Johnson",
    dueDate: new Date("2025-06-30"),
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-06-30"),
    tag: "Marketing",
    frequency: "Monthly",
    trafficLights: false,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true
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
    unit: "partners",
    status: "In Progress",
    owner: "Mike Wilson",
    dueDate: new Date("2025-08-15"),
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-08-15"),
    tag: "Operations",
    frequency: "Weekly",
    trafficLights: true,
    trafficLightConfig: "Green: >70%, Yellow: 40-70%, Red: <40%",
    progressBar: true,
    dueDateRequired: false,
    responsibleRequired: true
  },
  {
    id: 4,
    title: "Customer Satisfaction Score",
    description: "Maintain high customer satisfaction ratings",
    type: "Objective",
    hierarchy: "objective",
    parent: null,
    progress: 85,
    targetValue: 4.5,
    currentValue: 4.25,
    unit: "rating",
    status: "In Progress",
    owner: "Lisa Chen",
    dueDate: new Date("2025-12-31"),
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    tag: "Customer",
    frequency: "Monthly",
    trafficLights: true,
    trafficLightConfig: "Green: >4.0, Yellow: 3.5-4.0, Red: <3.5",
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true
  },
  {
    id: 5,
    title: "Support Response Time",
    description: "Reduce average customer support response time",
    type: "Activity",
    hierarchy: "activity",
    parent: 4,
    progress: 60,
    targetValue: 2,
    currentValue: 3.2,
    unit: "hours",
    status: "In Progress",
    owner: "David Rodriguez",
    dueDate: new Date("2025-09-30"),
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-09-30"),
    tag: "Support",
    frequency: "Daily",
    trafficLights: false,
    progressBar: true,
    dueDateRequired: true,
    responsibleRequired: true
  }
];

// Available tags for filtering
const availableTags = ["Revenue", "Marketing", "Operations", "Customer", "Support", "Sales", "Product"];

// Available measure units
const measureUnits = ["€", "number", "%", "hours", "days", "rating", "campaigns", "partners", "customers"];

// Frequency options
const frequencyOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

// Status options
const statusOptions = ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"];

export default function OKRsPage() {
  // State management - independent from MetricsPage
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("all-units");
  const [selectedTargetRange, setSelectedTargetRange] = useState("all-ranges");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all-frequencies");
  const [advancedTimeframe, setAdvancedTimeframe] = useState("");
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [groupBy, setGroupBy] = useState("tag");
  
  // Independent state for OKR data - not connected to localStorage
  const [okrData, setOkrData] = useState(independentOKRData);
  
  // State for creating activities linked to an objective
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [parentObjective, setParentObjective] = useState<any>(null);
  
  // State for editing existing OKRs
  const [isEditing, setIsEditing] = useState(false);
  const [editingOKR, setEditingOKR] = useState<any>(null);
  
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

  // Filter OKRs based on search and selected tags
  const filteredOKRs = okrData.filter(okr => {
    const matchesSearch = searchTerm === "" || 
      okr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.includes(okr.tag || "");
      
    const matchesMeasureUnit = selectedMeasureUnit === "all-units" || okr.unit === selectedMeasureUnit;
    const matchesTimeframe = selectedTimeframe === "all-frequencies" || okr.frequency === selectedTimeframe;
    
    // Target range filtering
    let matchesTargetRange = true;
    if (selectedTargetRange && selectedTargetRange !== "all-ranges" && okr.targetValue !== undefined) {
      switch (selectedTargetRange) {
        case "0-100":
          matchesTargetRange = okr.targetValue >= 0 && okr.targetValue <= 100;
          break;
        case "100-1000":
          matchesTargetRange = okr.targetValue > 100 && okr.targetValue <= 1000;
          break;
        case "1000+":
          matchesTargetRange = okr.targetValue > 1000;
          break;
      }
    }
    
    // No target filter
    const matchesNoTarget = !showNoTarget || okr.targetValue === undefined;
    
    return matchesSearch && matchesTags && matchesMeasureUnit && matchesTimeframe && matchesTargetRange && matchesNoTarget;
  });

  // Toggle OKR selection
  const toggleOKRSelection = (id: number) => {
    setSelectedOKRs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
  const groupOKRs = (okrs: any[]) => {
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
    }, {} as Record<string, any[]>);

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

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedMeasureUnit("");
    setSelectedTargetRange("");
    setSelectedTimeframe("");
    setShowNoTarget(false);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedOKRs([]);
  };

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

  // Reset form
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
    setIsCreateOKROpen(false);
    setIsEditing(false);
    setEditingOKR(null);
    setIsCreatingActivity(false);
    setParentObjective(null);
  };

  // Handle form submission for creating new OKR or updating existing one
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
      
      setOkrData(prev => prev.map(okr => 
        okr.id === editingOKR.id ? updatedOKR : okr
      ));
    } else {
      // Create new OKR
      const newOKR = {
        ...baseOKR,
        id: okrData.length > 0 ? Math.max(...okrData.map(o => o.id)) + 1 : 1,
      };
      
      setOkrData(prev => [...prev, newOKR]);
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
      id: okrData.length > 0 ? Math.max(...okrData.map(o => o.id)) + 1 : 1,
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
    
    setOkrData(prev => [...prev, newObjective]);
    
    // Set up for creating activity
    setParentObjective(newObjective);
    setIsCreatingActivity(true);
    
    // Reset form but keep dialog open
    setFormData({
      okrType: "",
      tag: newObjective.tag || "",
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

  // Delete OKR
  const handleDeleteOKR = (id: number) => {
    if (confirm("Are you sure you want to delete this OKR?")) {
      setOkrData(prev => prev.filter(okr => okr.id !== id));
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Get grouped OKRs
  const groupedOKRs = groupOKRs(filteredOKRs);

  // Get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "On Hold":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKRs</h1>
        
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setIsCreateOKROpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          Add OKR
        </Button>
      </div>

      {/* Filters section */}
      <div className="mb-6 space-y-4">
        {/* Search and basic controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search OKRs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tag">Group by Tag</SelectItem>
                <SelectItem value="type">Group by Type</SelectItem>
                <SelectItem value="status">Group by Status</SelectItem>
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
            
            {(selectedTags.length > 0 || selectedMeasureUnit || selectedTargetRange || selectedTimeframe || showNoTarget) && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                <span className="text-[#5F6585]">Clear filters</span>
              </Button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedMeasureUnit} onValueChange={setSelectedMeasureUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Measure Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-units">All Units</SelectItem>
              {measureUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTargetRange} onValueChange={setSelectedTargetRange}>
            <SelectTrigger>
              <SelectValue placeholder="Target Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-ranges">All Ranges</SelectItem>
              <SelectItem value="0-100">0 - 100</SelectItem>
              <SelectItem value="100-1000">100 - 1,000</SelectItem>
              <SelectItem value="1000+">1,000+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-frequencies">All Frequencies</SelectItem>
              {frequencyOptions.map(freq => (
                <SelectItem key={freq} value={freq}>{freq}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-target" 
              checked={showNoTarget}
              onCheckedChange={(checked) => setShowNoTarget(checked as boolean)}
            />
            <Label htmlFor="no-target" className="text-sm">No Target</Label>
          </div>
        </div>

        {/* Tags filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
          {availableTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Selection action bar */}
      {selectedOKRs.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{selectedOKRs.length}</span> OKRs selected
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
            >
              Bulk Actions
            </Button>
          </div>
        </div>
      )}

      {/* OKRs content */}
      <div className="space-y-6">
        {Object.entries(groupedOKRs).map(([groupName, okrs]) => (
          <div key={groupName} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {groupName} ({okrs.length})
            </h2>
            
            <div className="space-y-2">
              {okrs.map((okr) => (
                <Card key={okr.id} className={`transition-all hover:shadow-md ${okr.level > 0 ? 'ml-' + (okr.level * 8) : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={selectedOKRs.includes(okr.id)}
                          onCheckedChange={() => toggleOKRSelection(okr.id)}
                        />
                        
                        {/* Expand/Collapse button for items with nested content */}
                        {okr.nestedCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpansion(okr.id)}
                            className="p-1 h-6 w-6"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="12" 
                              height="12" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className={`transition-transform ${okr.isExpanded ? 'rotate-90' : ''}`}
                            >
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </Button>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{okr.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {okr.type}
                            </Badge>
                            {okr.tag && (
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {okr.tag}
                              </Badge>
                            )}
                            <Badge variant={getStatusBadgeVariant(okr.status)} className="text-xs">
                              {okr.status}
                            </Badge>
                          </div>
                          
                          {okr.description && (
                            <p className="text-sm text-gray-600 mb-2">{okr.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {okr.targetValue !== undefined && (
                              <span>Target: {okr.targetValue} {okr.unit}</span>
                            )}
                            {okr.currentValue !== undefined && (
                              <span>Current: {okr.currentValue} {okr.unit}</span>
                            )}
                            {okr.owner && (
                              <span>Owner: {okr.owner}</span>
                            )}
                            {okr.dueDate && (
                              <span>Due: {new Date(okr.dueDate).toLocaleDateString()}</span>
                            )}
                            {okr.nestedCount > 0 && (
                              <span>{okr.nestedCount} nested items</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Progress bar */}
                        {okr.progressBar && (
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getProgressColor(okr.progress)}`}
                              style={{ width: `${okr.progress}%` }}
                            />
                          </div>
                        )}
                        
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {okr.progress}%
                        </span>
                        
                        {/* Actions */}
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOKR(okr)}
                            className="p-2 h-8 w-8"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            </svg>
                          </Button>
                          
                          {okr.hierarchy === 'objective' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setParentObjective(okr);
                                setIsCreatingActivity(true);
                                setIsCreateOKROpen(true);
                              }}
                              className="p-2 h-8 w-8"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"/>
                                <path d="M12 5v14"/>
                              </svg>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOKR(okr.id)}
                            className="p-2 h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit OKR Dialog */}
      <Dialog open={isCreateOKROpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit OKR' : isCreatingActivity ? `Add Activity to ${parentObjective?.title}` : 'Create New OKR'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the OKR details below.' : isCreatingActivity ? 'Add a new activity under the selected objective.' : 'Create a new OKR to track your objectives and key results.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* OKR Name */}
            <div>
              <Label htmlFor="okr-name">OKR Name</Label>
              <Input
                id="okr-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter OKR name"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Tag */}
            {!isCreatingActivity && (
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Select value={formData.tag} onValueChange={(value) => setFormData(prev => ({ ...prev, tag: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Has Target */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-target"
                checked={formData.hasTarget}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasTarget: checked as boolean }))}
              />
              <Label htmlFor="has-target">Has Target Value</Label>
            </div>

            {/* Target details */}
            {formData.hasTarget && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="Enter target value"
                  />
                </div>
                <div>
                  <Label htmlFor="measure-unit">Measure Unit</Label>
                  <Select value={formData.measureUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, measureUnit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {measureUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="traffic-lights"
                  checked={formData.trafficLights}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trafficLights: checked as boolean }))}
                />
                <Label htmlFor="traffic-lights">Enable Traffic Lights</Label>
              </div>

              {formData.trafficLights && (
                <div>
                  <Label htmlFor="traffic-config">Traffic Light Configuration</Label>
                  <Input
                    id="traffic-config"
                    value={formData.trafficLightConfig}
                    onChange={(e) => setFormData(prev => ({ ...prev, trafficLightConfig: e.target.value }))}
                    placeholder="e.g., Green: >80%, Yellow: 50-80%, Red: <50%"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="progress-bar"
                  checked={formData.progressBar}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, progressBar: checked as boolean }))}
                />
                <Label htmlFor="progress-bar">Show Progress Bar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="due-date-required"
                  checked={formData.dueDateRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dueDateRequired: checked as boolean }))}
                />
                <Label htmlFor="due-date-required">Due Date Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="responsible-required"
                  checked={formData.responsibleRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, responsibleRequired: checked as boolean }))}
                />
                <Label htmlFor="responsible-required">Responsible Person Required</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            {!isEditing && !isCreatingActivity && (
              <Button 
                onClick={handleSaveAndCreateActivity}
                className="bg-green-600 hover:bg-green-700"
              >
                Save & Add Activity
              </Button>
            )}
            <Button onClick={handleCreateOKR} className="bg-indigo-600 hover:bg-indigo-700">
              {isEditing ? 'Update OKR' : isCreatingActivity ? 'Add Activity' : 'Create OKR'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}