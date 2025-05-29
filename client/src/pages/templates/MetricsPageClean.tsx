import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, Tag } from 'lucide-react';

// Types for OKR templates and metrics
interface OKRTemplate {
  id: number;
  name: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface OKRMetric {
  id: number;
  title: string;
  description?: string;
  template_id: number;
  target_value?: number;
  realized_value?: number;
  unit: string;
  progress?: number;
  status: string;
  responsible_id?: number;
  due_date?: string;
  timeframe?: string;
  frequency: string;
  parent_id?: number;
  hierarchy: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Fetch OKR templates from database
const useOKRTemplatesData = () => {
  return useQuery({
    queryKey: ['/api/okr-templates'],
    queryFn: async () => {
      const response = await fetch('/api/okr-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch OKR templates');
      }
      return response.json();
    }
  });
};

// Fetch OKR metrics for a template
const useOKRMetricsData = (templateId: number | null) => {
  return useQuery({
    queryKey: ['/api/okr-templates', templateId, 'metrics'],
    queryFn: async () => {
      if (!templateId) return [];
      const response = await fetch(`/api/okr-templates/${templateId}/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch OKR metrics');
      }
      return response.json();
    },
    enabled: !!templateId,
  });
};

export default function MetricsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  
  // Dialog states
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  
  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  
  const [metricForm, setMetricForm] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: 'number',
    timeframe: 'quarterly',
    frequency: 'once',
    hierarchy: 'activity',
    tags: [] as string[],
  });

  // Fetch data
  const { data: templates = [], isLoading: templatesLoading } = useOKRTemplatesData();
  const { data: metrics = [], isLoading: metricsLoading } = useOKRMetricsData(selectedTemplate);

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/okr-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-templates'] });
      setIsCreateTemplateOpen(false);
      setTemplateForm({ name: '', description: '', tags: [] });
    },
  });

  // Create metric mutation
  const createMetricMutation = useMutation({
    mutationFn: async (metricData: any) => {
      const response = await fetch('/api/okr-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      if (!response.ok) {
        throw new Error('Failed to create metric');
      }
      return response.json();
    },
    onSuccess: () => {
      if (selectedTemplate) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/okr-templates', selectedTemplate, 'metrics'] 
        });
      }
      setIsCreateMetricOpen(false);
      setMetricForm({
        title: '',
        description: '',
        targetValue: '',
        unit: 'number',
        timeframe: 'quarterly',
        frequency: 'once',
        hierarchy: 'activity',
        tags: [],
      });
    },
  });

  // Get all unique tags from templates
  const allTags = Array.from(
    new Set(templates.flatMap((template: OKRTemplate) => template.tags || []))
  ).sort();

  // Filter templates based on search and tags
  const filteredTemplates = templates.filter((template: OKRTemplate) => {
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => template.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Handle template creation
  const handleCreateTemplate = () => {
    if (!templateForm.name.trim()) return;
    
    createTemplateMutation.mutate({
      name: templateForm.name,
      description: templateForm.description,
      tags: templateForm.tags,
    });
  };

  // Handle metric creation
  const handleCreateMetric = () => {
    if (!metricForm.title.trim() || !selectedTemplate) return;
    
    createMetricMutation.mutate({
      title: metricForm.title,
      description: metricForm.description,
      templateId: selectedTemplate,
      targetValue: metricForm.targetValue ? parseInt(metricForm.targetValue) : null,
      unit: metricForm.unit,
      timeframe: metricForm.timeframe,
      frequency: metricForm.frequency,
      hierarchy: metricForm.hierarchy,
      tags: metricForm.tags,
    });
  };

  // Toggle template selection
  const toggleTemplateSelection = (id: number) => {
    setSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  if (templatesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading OKR templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Metrics</h1>
        
        <div className="flex gap-2">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateTemplateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-64 mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
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
                {allTags.map((tag: string) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(selectedTags.length > 0 || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters} className="h-10">
                Clear filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Templates tab content */}
        <TabsContent value="templates" className="space-y-4">
          {selectedTemplates.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">{selectedTemplates.length}</span> templates selected
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTemplates([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredTemplates.length > 0 && filteredTemplates.every((t: OKRTemplate) => selectedTemplates.includes(t.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemplates(filteredTemplates.map((t: OKRTemplate) => t.id));
                        } else {
                          setSelectedTemplates([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template: OKRTemplate) => (
                  <TableRow 
                    key={template.id}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedTemplates.includes(template.id) ? 'bg-indigo-50' : ''}`}
                    onClick={() => toggleTemplateSelection(template.id)}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTemplates([...selectedTemplates, template.id]);
                          } else {
                            setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{template.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {template.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.tags?.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags && template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template.id);
                          setActiveTab('metrics');
                        }}
                      >
                        View Metrics
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No OKR templates found. Create your first template to get started.
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Metrics tab content */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Select
                value={selectedTemplate?.toString() || ""}
                onValueChange={(value) => setSelectedTemplate(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a template to view metrics" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: OKRTemplate) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTemplate && (
              <Button
                onClick={() => setIsCreateMetricOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            )}
          </div>
          
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric Title</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        Loading metrics...
                      </TableCell>
                    </TableRow>
                  ) : metrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No metrics found for this template. Add your first metric to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.map((metric: OKRMetric) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <div className="font-medium">{metric.title}</div>
                          {metric.description && (
                            <div className="text-sm text-gray-500 mt-1">{metric.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {metric.hierarchy}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {metric.target_value || 'No target set'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.unit}
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.timeframe || 'Not specified'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={metric.status === 'on_track' ? 'default' : 
                                   metric.status === 'at_risk' ? 'secondary' : 'destructive'}
                          >
                            {metric.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OKR Template</DialogTitle>
            <DialogDescription>
              Create a new OKR template that can be assigned to entities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!templateForm.name.trim() || createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Metric Dialog */}
      <Dialog open={isCreateMetricOpen} onOpenChange={setIsCreateMetricOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Metric</DialogTitle>
            <DialogDescription>
              Add a new metric to the selected template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric-title">Metric Title</Label>
              <Input
                id="metric-title"
                value={metricForm.title}
                onChange={(e) => setMetricForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter metric title"
              />
            </div>
            
            <div>
              <Label htmlFor="metric-description">Description</Label>
              <Textarea
                id="metric-description"
                value={metricForm.description}
                onChange={(e) => setMetricForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter metric description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metric-target">Target Value</Label>
                <Input
                  id="metric-target"
                  type="number"
                  value={metricForm.targetValue}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, targetValue: e.target.value }))}
                  placeholder="Target value"
                />
              </div>
              
              <div>
                <Label htmlFor="metric-unit">Unit</Label>
                <Select
                  value={metricForm.unit}
                  onValueChange={(value) => setMetricForm(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metric-timeframe">Timeframe</Label>
                <Select
                  value={metricForm.timeframe}
                  onValueChange={(value) => setMetricForm(prev => ({ ...prev, timeframe: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="metric-hierarchy">Hierarchy</Label>
                <Select
                  value={metricForm.hierarchy}
                  onValueChange={(value) => setMetricForm(prev => ({ ...prev, hierarchy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objective">Objective</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="subactivity">Subactivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMetricOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMetric}
              disabled={!metricForm.title.trim() || createMetricMutation.isPending}
            >
              {createMetricMutation.isPending ? 'Adding...' : 'Add Metric'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}