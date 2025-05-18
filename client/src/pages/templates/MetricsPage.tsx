import { useState, useEffect } from 'react';
import { Link } from 'wouter';
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

// Component for creating a new metric form
const NewMetricForm = ({ isOpen, onClose, onSubmit, metrics, existingTags }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (data: any) => void,
  metrics: any[],
  existingTags: string[] 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("number");
  const [targetValue, setTargetValue] = useState("");
  const [hierarchy, setHierarchy] = useState("activity");
  const [parentId, setParentId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Get potential parent metrics based on hierarchy
  const getPotentialParents = () => {
    if (hierarchy === "activity") {
      return metrics.filter(m => m.hierarchy === "objective");
    } else if (hierarchy === "subactivity") {
      return metrics.filter(m => m.hierarchy === "activity");
    }
    return [];
  };
  
  const potentialParents = getPotentialParents();
  
  useEffect(() => {
    // Reset parent when hierarchy changes
    setParentId("");
  }, [hierarchy]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metricData = {
      title,
      description,
      unit,
      targetValue: unit === "boolean" ? (targetValue === "true" ? 1 : 0) : parseFloat(targetValue),
      hierarchy,
      parent: parentId ? parseInt(parentId) : undefined,
      tags: selectedTags,
      children: [],
    };
    
    onSubmit(metricData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setUnit("number");
    setTargetValue("");
    setHierarchy("activity");
    setParentId("");
    setSelectedTags([]);
    setNewTag("");
    
    onClose();
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const addNewTag = () => {
    if (newTag.trim() && !existingTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const renderTargetValueInput = () => {
    switch (unit) {
      case "boolean":
        return (
          <Select value={targetValue} onValueChange={setTargetValue}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select completion status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Complete</SelectItem>
              <SelectItem value="false">Not Complete</SelectItem>
            </SelectContent>
          </Select>
        );
      case "currency":
        return (
          <Input
            id="targetValue"
            placeholder="Enter target amount"
            className="col-span-3"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        );
      case "percentage":
        return (
          <Input
            id="targetValue"
            placeholder="Enter target percentage (0-100)"
            className="col-span-3"
            type="number"
            min="0"
            max="100"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        );
      default: // number
        return (
          <Input
            id="targetValue"
            placeholder="Enter target value"
            className="col-span-3"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Metric</DialogTitle>
          <DialogDescription>
            Define a new metric that can be used in OKR templates and assigned to entities.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Metric title"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium pt-2">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe this metric"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="unit" className="text-right text-sm font-medium">
                Unit
              </label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="boolean">Boolean (Complete/Not Complete)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="targetValue" className="text-right text-sm font-medium">
                Target Value
              </label>
              {renderTargetValueInput()}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="hierarchy" className="text-right text-sm font-medium">
                Hierarchy
              </label>
              <Select value={hierarchy} onValueChange={setHierarchy}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select hierarchy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="objective">Objective</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="subactivity">Subactivity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hierarchy !== "objective" && potentialParents.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="parent" className="text-right text-sm font-medium">
                  Parent {hierarchy === "activity" ? "Objective" : "Activity"}
                </label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select parent ${hierarchy === "activity" ? "objective" : "activity"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {potentialParents.map(parent => (
                      <SelectItem key={parent.id} value={parent.id.toString()}>
                        {parent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Tags
              </label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className={selectedTags.includes(tag) ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Add a new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addNewTag}
                    disabled={!newTag.trim() || existingTags.includes(newTag.trim())}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Metric</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Component for creating a new group form
const NewGroupForm = ({ isOpen, onClose, onSubmit, metrics, existingTags, selectedMetrics = [] }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (data: any) => void,
  metrics: any[],
  existingTags: string[],
  selectedMetrics?: number[] 
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [metricIds, setMetricIds] = useState<number[]>(selectedMetrics);
  const [filteredMetrics, setFilteredMetrics] = useState<any[]>(metrics);
  
  // Update filtered metrics when tags change
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredMetrics(metrics);
    } else {
      setFilteredMetrics(
        metrics.filter(metric => 
          selectedTags.some(tag => metric.tags.includes(tag))
        )
      );
    }
  }, [selectedTags, metrics]);
  
  // Update selected metrics when the selectedMetrics prop changes
  useEffect(() => {
    if (selectedMetrics.length > 0) {
      setMetricIds(selectedMetrics);
    }
  }, [selectedMetrics]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const groupData = {
      name,
      description,
      tags: selectedTags,
      metrics: metricIds,
    };
    
    onSubmit(groupData);
    
    // Reset form
    setName("");
    setDescription("");
    setSelectedTags([]);
    setMetricIds([]);
    
    onClose();
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const toggleMetric = (id: number) => {
    setMetricIds(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id) 
        : [...prev, id]
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Metric Group</DialogTitle>
          <DialogDescription>
            Group related metrics together into a reusable template that can be assigned to entities.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Group name"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium pt-2">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe this metric group"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Filter by Tags
              </label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className={selectedTags.includes(tag) ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Select Metrics
              </label>
              <div className="col-span-3">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={filteredMetrics.length > 0 && metricIds.length === filteredMetrics.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setMetricIds(filteredMetrics.map(m => m.id));
                              } else {
                                setMetricIds([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Metric</TableHead>
                        <TableHead>Hierarchy</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Tags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMetrics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            No metrics found that match the selected tags
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMetrics.map(metric => (
                          <TableRow 
                            key={metric.id} 
                            className={`cursor-pointer hover:bg-gray-50 ${metricIds.includes(metric.id) ? "bg-indigo-50" : ""}`} 
                            onClick={() => toggleMetric(metric.id)}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={metricIds.includes(metric.id)}
                                onCheckedChange={() => toggleMetric(metric.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{metric.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {metric.hierarchy}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{metric.unit}</TableCell>
                            <TableCell>
                              {metric.unit === 'currency' ? `€${metric.targetValue.toLocaleString()}` : 
                               metric.unit === 'percentage' ? `${metric.targetValue}%` :
                               metric.unit === 'boolean' ? (metric.targetValue === 1 ? 'Complete' : 'Not Complete') :
                               metric.targetValue}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap">
                                {metric.tags.slice(0, 2).map(tag => (
                                  <TagBadge key={tag} tag={tag} />
                                ))}
                                {metric.tags.length > 2 && (
                                  <Badge variant="outline">+{metric.tags.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {metricIds.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {metricIds.length} metric{metricIds.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || metricIds.length === 0}
            >
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Component for managing tags
const TagManager = ({ isOpen, onClose, tags, onCreateTag, onUpdateTag, onDeleteTag }: { 
  isOpen: boolean, 
  onClose: () => void, 
  tags: { id: number; name: string; color: string }[],
  onCreateTag: (tag: { name: string, color: string }) => void,
  onUpdateTag: (id: number, updates: { name?: string, color?: string }) => void,
  onDeleteTag: (id: number) => void,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("indigo");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  
  const colorOptions = [
    "green", "purple", "blue", "cyan", "amber", "indigo", 
    "orange", "pink", "emerald", "yellow", "rose", "lime", 
    "fuchsia", "red", "violet", "sky", "teal", "slate"
  ];
  
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName("");
      setNewTagColor("indigo");
    }
  };
  
  const startEditingTag = (tag: { id: number; name: string; color: string }) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };
  
  const saveTagEdit = (id: number) => {
    if (editTagName.trim()) {
      onUpdateTag(id, { name: editTagName.trim(), color: editTagColor });
    }
    setEditingTag(null);
  };
  
  const cancelEditingTag = () => {
    setEditingTag(null);
  };
  
  const getColorClass = (color: string) => {
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
    
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create, edit, or delete tags used to categorize metrics and templates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="font-medium">Create New Tag</div>
            <div className="flex gap-2">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-grow"
              />
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(color => (
                    <SelectItem key={color} value={color} className="capitalize">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${getColorClass(color)}`}></span>
                        {color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreateTag} 
                disabled={!newTagName.trim()}
              >
                Add
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="font-medium mb-2">Existing Tags</div>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map(tag => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        {editingTag === tag.id ? (
                          <Input
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                          />
                        ) : (
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass(tag.color)}`}>
                            {tag.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTag === tag.id ? (
                          <Select value={editTagColor} onValueChange={setEditTagColor}>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map(color => (
                                <SelectItem key={color} value={color} className="capitalize">
                                  <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${getColorClass(color)}`}></span>
                                    {color}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="capitalize">{tag.color}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingTag === tag.id ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={cancelEditingTag}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveTagEdit(tag.id)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEditingTag(tag)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => onDeleteTag(tag.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  
  // Collect all unique tags from metrics
  const allTagNames = Array.from(
    new Set(metrics.flatMap(metric => metric.tags))
  ).sort();
  
  // Get top-level objectives
  const objectives = metrics.filter(m => m.hierarchy === "objective");
  
  // Filter metrics based on search, tags, and selected groups
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
    
    return matchesSearch && matchesTags && matchesGroups;
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
  const toggleMetricSelection = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
  
  // Handle tag creation
  const handleCreateTag = (tagData: { name: string, color: string }) => {
    const newTag = {
      id: Math.max(0, ...tags.map(t => t.id)) + 1,
      ...tagData,
    };
    
    setTags([...tags, newTag]);
  };
  
  // Handle tag update
  const handleUpdateTag = (id: number, updates: { name?: string, color?: string }) => {
    setTags(tags.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };
  
  // Handle tag deletion
  const handleDeleteTag = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id));
  };
  
  // Clear all selected filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedGroups([]);
  };
  
  // Clear metric selection
  const clearMetricSelection = () => {
    setSelectedMetrics([]);
  };
  
  // Recursively render a metric and its children
  const renderMetricTree = (metric: any, level: number = 0) => {
    const isExpanded = expandedItems.includes(metric.id);
    const hasChildren = metric.children && metric.children.length > 0;
    const childMetrics = hasChildren 
      ? metrics.filter(m => metric.children.includes(m.id))
      : [];
    
    const getBadgeColorByHierarchy = (hierarchy: string) => {
      switch (hierarchy) {
        case "objective":
          return "bg-amber-100 text-amber-800 hover:bg-amber-100";
        case "activity":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "subactivity":
          return "bg-gray-100 text-gray-700 hover:bg-gray-100";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };
    
    return (
      <div key={metric.id} className="mb-1">
        <div 
          className={`flex items-center p-3 rounded-md ${selectedMetrics.includes(metric.id) ? "bg-indigo-50" : "hover:bg-gray-50"} ${level > 0 ? `ml-${level * 6}` : ""} cursor-pointer`}
          onClick={() => hasChildren && toggleExpand(metric.id)}
        >
          <div className="flex-shrink-0 mr-2">
            <Checkbox 
              checked={selectedMetrics.includes(metric.id)}
              onCheckedChange={() => toggleMetricSelection(metric.id)}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
          
          <div className="flex-shrink-0 mr-2">
            {hasChildren && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand(metric.id)}>
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
          </div>
          
          <div className="flex-shrink-0 mr-2">
            <Badge variant="outline" className={`capitalize ${getBadgeColorByHierarchy(metric.hierarchy)}`}>
              {metric.hierarchy}
            </Badge>
          </div>
          
          <div className="flex-grow">
            <div className="font-medium">{metric.title}</div>
            <div className="text-sm text-gray-600 mt-1">{metric.description}</div>
            <div className="flex flex-wrap mt-1">
              {metric.tags.map((tag: string) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2 text-right">
            <div className="text-sm font-medium">{formatTargetValue(metric.targetValue, metric.unit)}</div>
            <div className="text-xs text-gray-500 capitalize">{metric.unit}</div>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
            </Button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="pl-6">
            {childMetrics.map(childMetric => renderMetricTree(childMetric, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Find metrics that don't belong to any objective (standalone metrics)
  const standaloneMetrics = filteredMetrics.filter(
    m => !m.parent && m.hierarchy !== "objective"
  );
  
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
      
      {/* Simplified search and filter bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow">
            <Input
              placeholder="Search metrics or groups..."
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
              value={selectedTags.length === 1 ? selectedTags[0] : " "}
              onValueChange={(value) => {
                if (value && value !== " ") {
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
                <SelectItem value=" ">All Tags</SelectItem>
                {allTagNames.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    <div className="flex items-center">
                      <TagBadge tag={tag} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedGroups.length === 1 ? selectedGroups[0].toString() : " "}
              onValueChange={(value) => {
                if (value && value !== " ") {
                  setSelectedGroups([parseInt(value)]);
                } else {
                  setSelectedGroups([]);
                }
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Groups</SelectItem>
                {metricGroups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(selectedTags.length > 0 || selectedGroups.length > 0 || searchTerm) && (
            <Button variant="ghost" onClick={clearFilters} className="h-10">
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Selection action bar */}
      {selectedMetrics.length > 0 && (
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
      
      {/* Main content area */}
      {filteredMetrics.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md">
          <h3 className="font-medium">No metrics found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {(selectedTags.length > 0 || selectedGroups.length > 0) ? 
              'Try adjusting your search or filters.' : 
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
        <div className="space-y-8">
          {/* Hierarchical metrics view */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Metrics</h2>
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex items-center mr-4">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 mr-2">Objective</Badge>
                  <span>Top-level goals</span>
                </div>
                <div className="flex items-center mr-4">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 mr-2">Activity</Badge>
                  <span>Supporting tasks</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 mr-2">Subactivity</Badge>
                  <span>Detailed steps</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-1 mb-4">
                {/* Filter to show only objectives that match the filtered metrics */}
                {objectives
                  .filter(obj => filteredMetrics.some(m => m.id === obj.id))
                  .map(objective => renderMetricTree(objective))}
                
                {/* Show standalone metrics (not part of hierarchy) */}
                {standaloneMetrics.length > 0 && (
                  <>
                    <div className="border-t my-4 pt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Standalone Metrics</h3>
                    </div>
                    {standaloneMetrics.map(metric => renderMetricTree(metric))}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Metric Groups section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Metric Groups</h2>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                size="sm"
                onClick={() => setIsCreateGroupOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Group
              </Button>
            </div>
            <div className="p-4">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-md">
                  <h3 className="font-medium">No metric groups found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedTags.length > 0 ? 
                      'Try adjusting your search or filters.' : 
                      'Create metrics first, then group them into templates.'}
                  </p>
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
                          <Link href={`/templates/groups/${group.id}`} onClick={(e) => e.stopPropagation()}>
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
            </div>
          </div>
        </div>
      )}
      
      {/* Create metric dialog */}
      <NewMetricForm 
        isOpen={isCreateMetricOpen}
        onClose={() => setIsCreateMetricOpen(false)}
        onSubmit={handleCreateMetric}
        metrics={metrics}
        existingTags={allTagNames}
      />
      
      {/* Create group dialog */}
      <NewGroupForm 
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        metrics={metrics}
        existingTags={allTagNames}
        selectedMetrics={selectedMetrics}
      />
      
      {/* Manage tags dialog */}
      <TagManager 
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        tags={tags}
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}