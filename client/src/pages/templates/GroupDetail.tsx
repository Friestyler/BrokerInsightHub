import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from '@/lib/queryClient';

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
    createdAt: new Date("2025-03-18"),
    updatedAt: new Date("2025-04-12"),
  },
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
    const tagMap: Record<string, string> = {
      Partner: "bg-slate-100 text-slate-800",
      Financial: "bg-green-100 text-green-800",
      Revenue: "bg-emerald-100 text-emerald-800",
      Pipeline: "bg-yellow-100 text-yellow-800",
      Sales: "bg-amber-100 text-amber-800",
      Training: "bg-orange-100 text-orange-800",
      Certification: "bg-rose-100 text-rose-800",
      People: "bg-pink-100 text-pink-800",
      Marketing: "bg-purple-100 text-purple-800",
      Budget: "bg-lime-100 text-lime-800",
      Campaign: "bg-fuchsia-100 text-fuchsia-800",
      Digital: "bg-indigo-100 text-indigo-800",
      Customer: "bg-blue-100 text-blue-800",
      Support: "bg-cyan-100 text-cyan-800",
      Service: "bg-sky-100 text-sky-800",
      Quality: "bg-teal-100 text-teal-800",
    };
    
    return tagMap[tag] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)} mr-2 mb-2`}>
      {tag}
    </span>
  );
};

// Dialog for editing the group
const EditGroupDialog = ({ 
  isOpen, 
  onClose, 
  group, 
  onSave, 
  existingTags 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  group: any; 
  onSave: (data: any) => void; 
  existingTags: string[]; 
}) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(group?.tags || []);
  
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setSelectedTags(group.tags || []);
    }
  }, [group]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...group,
      name,
      description,
      tags: selectedTags,
      updatedAt: new Date(),
    });
    
    onClose();
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  if (!group) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the group information and tags.
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
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Dialog for managing metrics in the group
const ManageMetricsDialog = ({ 
  isOpen, 
  onClose, 
  group, 
  allMetrics, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  group: any; 
  allMetrics: any[]; 
  onSave: (groupId: number, metricIds: number[]) => void; 
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (group) {
      setSelectedMetrics(group.metrics || []);
    }
  }, [group]);
  
  const filteredMetrics = allMetrics.filter(metric => 
    searchTerm === "" || 
    metric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleMetric = (id: number) => {
    setSelectedMetrics(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id) 
        : [...prev, id]
    );
  };
  
  const handleSubmit = () => {
    onSave(group.id, selectedMetrics);
    onClose();
  };
  
  if (!group) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Metrics</DialogTitle>
          <DialogDescription>
            Add or remove metrics from this group.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredMetrics.length > 0 && selectedMetrics.length === filteredMetrics.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics(filteredMetrics.map(m => m.id));
                        } else {
                          setSelectedMetrics([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No metrics found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMetrics.map(metric => (
                    <TableRow key={metric.id} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleMetric(metric.id)}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetric(metric.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{metric.title}</TableCell>
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
          {selectedMetrics.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedMetrics.length === 0}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dialog for applying the group to an entity
const ApplyGroupDialog = ({ 
  isOpen, 
  onClose, 
  group 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  group: any; 
}) => {
  const [entityType, setEntityType] = useState("partner");
  const [selectedEntity, setSelectedEntity] = useState("");
  
  // Mock data for different entity types
  const entityOptions = {
    partner: [
      { id: 1, name: "ABC Insurance Brokers" },
      { id: 2, name: "XYZ Agency" },
      { id: 3, name: "First Insurance Co." },
    ],
    customer: [
      { id: 1, name: "Acme Corporation" },
      { id: 2, name: "Wayne Enterprises" },
      { id: 3, name: "Stark Industries" },
    ],
    opportunity: [
      { id: 1, name: "Property Insurance Renewal" },
      { id: 2, name: "Cyber Security Coverage" },
      { id: 3, name: "Workers Compensation" },
    ],
  };
  
  const handleSubmit = () => {
    // In a real app, this would make an API call to apply the group to the entity
    console.log(`Applied group ${group.name} to ${entityType} ${selectedEntity}`);
    onClose();
  };
  
  if (!group) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Group to Entity</DialogTitle>
          <DialogDescription>
            Apply the "{group.name}" metric group to an entity to start tracking progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity Type</label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Entity</label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entityOptions[entityType as keyof typeof entityOptions].map(entity => (
                  <SelectItem key={entity.id} value={entity.id.toString()}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedEntity}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Apply
          </Button>
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

export default function GroupDetail() {
  const { id } = useParams();
  const groupId = parseInt(id || "1");
  
  const [group, setGroup] = useState<any>(null);
  const [groupMetrics, setGroupMetrics] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageMetricsOpen, setIsManageMetricsOpen] = useState(false);
  const [isApplyGroupOpen, setIsApplyGroupOpen] = useState(false);
  
  // Collect all unique tags from metrics
  const allTags = Array.from(
    new Set(mockMetrics.flatMap(metric => metric.tags))
  ).sort();
  
  // Fetch group data
  useEffect(() => {
    // In a real app, this would be a useQuery call
    const foundGroup = mockMetricGroups.find(g => g.id === groupId);
    if (foundGroup) {
      setGroup(foundGroup);
      
      // Get the metrics for this group
      const metrics = mockMetrics.filter(m => foundGroup.metrics.includes(m.id));
      setGroupMetrics(metrics);
    }
  }, [groupId]);
  
  // Handle group update
  const handleUpdateGroup = (updatedGroup: any) => {
    // In a real app, this would be an API call
    setGroup(updatedGroup);
  };
  
  // Handle metrics update
  const handleUpdateMetrics = (groupId: number, metricIds: number[]) => {
    // In a real app, this would be an API call
    setGroup({
      ...group,
      metrics: metricIds,
      updatedAt: new Date(),
    });
    
    // Update the metrics list
    const metrics = mockMetrics.filter(m => metricIds.includes(m.id));
    setGroupMetrics(metrics);
  };
  
  if (!group) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Group Details</h1>
        </div>
        <div className="text-center py-12">
          <p>Loading group...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/templates/metrics">
          <Button variant="ghost" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Metrics
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
              <p className="mt-2 text-gray-600">{group.description}</p>
              
              <div className="mt-4">
                {group.tags.map((tag: string) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Created: {group.createdAt.toLocaleDateString()}</p>
                <p>Last Updated: {group.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                Edit
              </Button>
              
              <Button 
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsApplyGroupOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Apply to Entity
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Metrics in this Group</h2>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsManageMetricsOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Manage Metrics
          </Button>
        </div>
        
        {groupMetrics.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <h3 className="font-medium">No metrics in this group</h3>
            <p className="mt-1 text-sm text-gray-500">Add metrics to define what should be measured</p>
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsManageMetricsOpen(true)}
            >
              Add Metrics
            </Button>
          </div>
        ) : (
          <>
            {/* Cards for objectives */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Objectives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMetrics
                  .filter(metric => metric.hierarchy === "objective")
                  .map(metric => (
                    <Card key={metric.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{metric.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="mb-1 capitalize text-sm text-gray-500">{metric.unit}</div>
                            <div className="font-semibold">{formatTargetValue(metric.targetValue, metric.unit)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap">
                          {metric.tags.map(tag => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
            
            {/* Table for activities and subactivities */}
            {groupMetrics.some(metric => metric.hierarchy !== "objective") && (
              <div>
                <h3 className="text-lg font-medium mb-4">Activities & Tasks</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hierarchy</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupMetrics
                      .filter(metric => metric.hierarchy !== "objective")
                      .map(metric => (
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
                          <TableCell>
                            <div className="flex flex-wrap">
                              {metric.tags.map(tag => (
                                <TagBadge key={tag} tag={tag} />
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Edit group dialog */}
      <EditGroupDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        group={group}
        onSave={handleUpdateGroup}
        existingTags={allTags}
      />
      
      {/* Manage metrics dialog */}
      <ManageMetricsDialog 
        isOpen={isManageMetricsOpen}
        onClose={() => setIsManageMetricsOpen(false)}
        group={group}
        allMetrics={mockMetrics}
        onSave={handleUpdateMetrics}
      />
      
      {/* Apply group dialog */}
      <ApplyGroupDialog 
        isOpen={isApplyGroupOpen}
        onClose={() => setIsApplyGroupOpen(false)}
        group={group}
      />
    </div>
  );
}