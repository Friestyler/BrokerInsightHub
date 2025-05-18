import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from '@/lib/queryClient';

// Mock template data
const mockTemplates = [
  {
    id: 1,
    name: "Focus Partner Plan Template",
    description: "Standard OKR template for setting up partner plans",
    tags: ["Partner", "Financial", "Growth"],
    metrics: [
      {
        id: 1,
        title: "Revenue Goal",
        description: "Revenue target for the partnership",
        unit: "currency",
        targetValue: 1000000,
        hierarchy: "objective",
      },
      {
        id: 2,
        title: "Pipeline New Business",
        description: "Target for pipeline of new business opportunities",
        unit: "currency",
        targetValue: 2000000,
        hierarchy: "objective",
      },
      {
        id: 3,
        title: "Training & Certification",
        description: "Complete required training and certification courses",
        unit: "boolean",
        targetValue: 1,
        hierarchy: "activity",
      },
      {
        id: 4,
        title: "Marketing Development Funds",
        description: "Allocated marketing development funds",
        unit: "currency",
        targetValue: 100000,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-04-15"),
  },
  {
    id: 2,
    name: "Marketing Plan Template",
    description: "Template for creating marketing plans with partners",
    tags: ["Marketing", "Campaign", "Brand"],
    metrics: [
      {
        id: 5,
        title: "Co-branded Campaigns",
        description: "Number of co-branded campaigns to launch",
        unit: "number",
        targetValue: 4,
        hierarchy: "objective",
      },
      {
        id: 6,
        title: "Website Overhaul",
        description: "Complete website redesign project",
        unit: "boolean",
        targetValue: 1,
        hierarchy: "activity",
      },
      {
        id: 7,
        title: "Marketing Content",
        description: "Create marketing content (blog posts, case studies)",
        unit: "number",
        targetValue: 12,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-04-10"),
  },
];

// Component for the tag badge with colors based on tag name
const TagBadge = ({ tag }: { tag: string }) => {
  const getTagColor = (tag: string) => {
    const tagMap: Record<string, string> = {
      Partner: "bg-indigo-100 text-indigo-800",
      Financial: "bg-green-100 text-green-800",
      Growth: "bg-emerald-100 text-emerald-800",
      Marketing: "bg-purple-100 text-purple-800",
      Campaign: "bg-fuchsia-100 text-fuchsia-800",
      Brand: "bg-pink-100 text-pink-800",
      Support: "bg-blue-100 text-blue-800",
      Customer: "bg-cyan-100 text-cyan-800",
      Service: "bg-sky-100 text-sky-800",
      Sales: "bg-amber-100 text-amber-800",
      Territory: "bg-orange-100 text-orange-800",
      Quota: "bg-yellow-100 text-yellow-800",
    };
    
    return tagMap[tag] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)} mr-2 mb-2`}>
      {tag}
    </span>
  );
};

// Component for adding a new metric
const AddMetricForm = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("number");
  const [targetValue, setTargetValue] = useState("");
  const [hierarchy, setHierarchy] = useState("activity");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metricData = {
      title,
      description,
      unit,
      targetValue: unit === "boolean" ? (targetValue === "true" ? 1 : 0) : parseFloat(targetValue),
      hierarchy,
    };
    
    onSubmit(metricData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setUnit("number");
    setTargetValue("");
    setHierarchy("activity");
    
    onClose();
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Metric</DialogTitle>
          <DialogDescription>
            Create a new metric for this OKR template.
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
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
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Metric</Button>
          </DialogFooter>
        </form>
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

// Main OKR Template Detail page component
export default function OkrTemplateDetail() {
  const { id } = useParams();
  const templateId = parseInt(id || "1");
  
  const [template, setTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  
  // Fetch template data
  useEffect(() => {
    // In a real app, this would be a useQuery call
    const foundTemplate = mockTemplates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      setName(foundTemplate.name);
      setDescription(foundTemplate.description || "");
      setTags(foundTemplate.tags.join(", "));
    }
  }, [templateId]);
  
  // Handle template update
  const handleUpdateTemplate = () => {
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      name,
      description,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      updatedAt: new Date(),
    };
    
    // In a real app, this would be an API call
    setTemplate(updatedTemplate);
    setIsEditing(false);
  };
  
  // Handle adding a new metric
  const handleAddMetric = (metricData: any) => {
    if (!template) return;
    
    const newMetric = {
      id: Math.max(0, ...template.metrics.map((m: any) => m.id)) + 1,
      ...metricData,
    };
    
    const updatedTemplate = {
      ...template,
      metrics: [...template.metrics, newMetric],
      updatedAt: new Date(),
    };
    
    // In a real app, this would be an API call
    setTemplate(updatedTemplate);
  };
  
  if (!template) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Template Details</h1>
        </div>
        <div className="text-center py-12">
          <p>Loading template...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/templates/okr">
          <Button variant="ghost" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Templates
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Template Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags (comma separated)
              </label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="pt-2">
              <Button onClick={handleUpdateTemplate} className="mr-2 bg-indigo-600 hover:bg-indigo-700">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => {
                setName(template.name);
                setDescription(template.description || "");
                setTags(template.tags.join(", "));
                setIsEditing(false);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
                <p className="mt-2 text-gray-600">{template.description}</p>
                
                <div className="mt-4">
                  {template.tags.map((tag: string) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                Edit Template
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Created: {template.createdAt.toLocaleDateString()}</p>
              <p>Last Updated: {template.updatedAt.toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Metrics</h2>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsAddMetricOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Metric
          </Button>
        </div>
        
        {template.metrics.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <h3 className="font-medium">No metrics defined yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add metrics to define what should be measured in this template</p>
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsAddMetricOpen(true)}
            >
              Add Your First Metric
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead>Hierarchy</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.metrics.map((metric: any) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.title}</TableCell>
                  <TableCell>{metric.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {metric.hierarchy}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{metric.unit}</TableCell>
                  <TableCell>{formatTargetValue(metric.targetValue, metric.unit)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Add metric dialog */}
      <AddMetricForm 
        isOpen={isAddMetricOpen}
        onClose={() => setIsAddMetricOpen(false)}
        onSubmit={handleAddMetric}
      />
    </div>
  );
}