import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Plus, Search, Edit, Target } from 'lucide-react';

// OKR Metric type matching the new schema
interface OKRMetric {
  id: number;
  name: string;
  description?: string;
  realized_value: number;
  target_value?: number;
  measure_unit: string;
  currency_type?: string;
  traffic_light_thresholds?: any;
  progress_bar_thresholds?: any;
  picklist_options: string[];
  responsible_user_id?: number;
  responsible_contact_id?: number;
  timeframe?: string;
  frequency: string;
  attachment_url?: string;
  due_date?: string;
  is_muted: boolean;
  is_archived: boolean;
  is_shared: boolean;
  hierarchy: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
}

// Fetch OKR metrics from database
const useOKRMetricsData = () => {
  return useQuery({
    queryKey: ['/api/okr-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/okr-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch OKR metrics');
      }
      return response.json();
    }
  });
};

export default function OKRTemplatesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  
  // Dialog states
  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<OKRMetric | null>(null);
  
  // Form states
  const [metricForm, setMetricForm] = useState({
    name: '',
    description: '',
    realized_value: '0',
    target_value: '',
    measure_unit: 'number',
    currency_type: 'USD',
    timeframe: 'quarterly',
    frequency: 'none',
    hierarchy: 'activity',
    tags: [] as string[],
    newTag: '',
  });

  // Fetch data
  const { data: metrics = [], isLoading: metricsLoading } = useOKRMetricsData();

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
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      setIsCreateMetricOpen(false);
      resetForm();
    },
  });

  // Update metric mutation
  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, metricData }: { id: number; metricData: any }) => {
      const response = await fetch(`/api/okr-metrics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      if (!response.ok) {
        throw new Error('Failed to update metric');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      setEditingMetric(null);
      resetForm();
    },
  });

  // Get all unique tags from metrics
  const allTags = Array.from(
    new Set(metrics.flatMap((metric: OKRMetric) => metric.tags || []))
  ).sort();

  // Filter metrics based on search and tags
  const filteredMetrics = metrics.filter((metric: OKRMetric) => {
    const matchesSearch = searchTerm === "" || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => metric.tags?.includes(tag));
    
    return matchesSearch && matchesTags && !metric.is_archived;
  });

  // Group metrics by tags
  const groupedMetrics = allTags.reduce((acc, tag) => {
    const tagMetrics = filteredMetrics.filter(metric => 
      metric.tags?.includes(tag)
    );
    if (tagMetrics.length > 0) {
      acc[tag] = tagMetrics;
    }
    return acc;
  }, {} as Record<string, OKRMetric[]>);

  // Metrics without tags
  const untaggedMetrics = filteredMetrics.filter(metric => 
    !metric.tags || metric.tags.length === 0
  );

  // Reset form
  const resetForm = () => {
    setMetricForm({
      name: '',
      description: '',
      realized_value: '0',
      target_value: '',
      measure_unit: 'number',
      currency_type: 'USD',
      timeframe: 'quarterly',
      frequency: 'none',
      hierarchy: 'activity',
      tags: [],
      newTag: '',
    });
  };

  // Handle metric creation
  const handleCreateMetric = () => {
    if (!metricForm.name.trim()) return;
    
    createMetricMutation.mutate({
      name: metricForm.name,
      description: metricForm.description,
      realized_value: parseFloat(metricForm.realized_value) || 0,
      target_value: metricForm.target_value ? parseFloat(metricForm.target_value) : null,
      measure_unit: metricForm.measure_unit,
      currency_type: metricForm.currency_type,
      timeframe: metricForm.timeframe,
      frequency: metricForm.frequency,
      hierarchy: metricForm.hierarchy,
      tags: metricForm.tags,
    });
  };

  // Handle metric update
  const handleUpdateMetric = () => {
    if (!editingMetric || !metricForm.name.trim()) return;
    
    updateMetricMutation.mutate({
      id: editingMetric.id,
      metricData: {
        name: metricForm.name,
        description: metricForm.description,
        realized_value: parseFloat(metricForm.realized_value) || 0,
        target_value: metricForm.target_value ? parseFloat(metricForm.target_value) : null,
        measure_unit: metricForm.measure_unit,
        currency_type: metricForm.currency_type,
        timeframe: metricForm.timeframe,
        frequency: metricForm.frequency,
        hierarchy: metricForm.hierarchy,
        tags: metricForm.tags,
      }
    });
  };

  // Open edit dialog
  const openEditDialog = (metric: OKRMetric) => {
    setEditingMetric(metric);
    setMetricForm({
      name: metric.name,
      description: metric.description || '',
      realized_value: metric.realized_value.toString(),
      target_value: metric.target_value?.toString() || '',
      measure_unit: metric.measure_unit,
      currency_type: metric.currency_type || 'USD',
      timeframe: metric.timeframe || 'quarterly',
      frequency: metric.frequency,
      hierarchy: metric.hierarchy,
      tags: metric.tags || [],
      newTag: '',
    });
  };

  // Add tag to form
  const addTag = () => {
    if (metricForm.newTag.trim() && !metricForm.tags.includes(metricForm.newTag.trim())) {
      setMetricForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  // Remove tag from form
  const removeTag = (tagToRemove: string) => {
    setMetricForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Calculate progress percentage
  const calculateProgress = (realized: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((realized / target) * 100), 100);
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  if (metricsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading OKR metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Templates</h1>
        
        <div className="flex gap-2">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateMetricOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create OKR Metric
          </Button>
        </div>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow">
            <Input
              placeholder="Search OKR metrics..."
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

      {/* Metrics grouped by tags */}
      <div className="space-y-6">
        {Object.entries(groupedMetrics).map(([tag, tagMetrics]) => (
          <div key={tag} className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Badge variant="secondary" className="mr-3">
                    {tag}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({tagMetrics.length} metrics)
                  </span>
                </h2>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric Name</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Realized / Target</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagMetrics.map((metric: OKRMetric) => {
                    const progress = calculateProgress(metric.realized_value, metric.target_value);
                    return (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            {metric.description && (
                              <div className="text-sm text-gray-500 mt-1">{metric.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {metric.hierarchy}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(progress)}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{metric.realized_value}</span>
                            {metric.target_value && (
                              <span className="text-gray-500"> / {metric.target_value}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.measure_unit}
                          {metric.measure_unit === 'currency' && metric.currency_type && (
                            <span className="text-gray-500 ml-1">({metric.currency_type})</span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.timeframe || 'Not specified'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(metric)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {/* Untagged metrics */}
        {untaggedMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Untagged Metrics ({untaggedMetrics.length})
              </h2>
            </div>
            
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric Name</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Realized / Target</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {untaggedMetrics.map((metric: OKRMetric) => {
                    const progress = calculateProgress(metric.realized_value, metric.target_value);
                    return (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            {metric.description && (
                              <div className="text-sm text-gray-500 mt-1">{metric.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {metric.hierarchy}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(progress)}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{metric.realized_value}</span>
                            {metric.target_value && (
                              <span className="text-gray-500"> / {metric.target_value}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.measure_unit}
                          {metric.measure_unit === 'currency' && metric.currency_type && (
                            <span className="text-gray-500 ml-1">({metric.currency_type})</span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {metric.timeframe || 'Not specified'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(metric)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filteredMetrics.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No OKR metrics found</h3>
            <p className="text-gray-500 mb-4">
              Create your first OKR metric to start tracking objectives and key results.
            </p>
            <Button 
              onClick={() => setIsCreateMetricOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create OKR Metric
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Metric Dialog */}
      <Dialog 
        open={isCreateMetricOpen || !!editingMetric} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateMetricOpen(false);
            setEditingMetric(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Edit OKR Metric' : 'Create OKR Metric'}
            </DialogTitle>
            <DialogDescription>
              {editingMetric 
                ? 'Update the OKR metric details below.'
                : 'Create a new OKR metric to track objectives and key results.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="metric-name">Name *</Label>
              <Input
                id="metric-name"
                value={metricForm.name}
                onChange={(e) => setMetricForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter metric name"
              />
            </div>
            
            <div>
              <Label htmlFor="metric-description">Description</Label>
              <Textarea
                id="metric-description"
                value={metricForm.description}
                onChange={(e) => setMetricForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter metric description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metric-realized">Realized Value</Label>
                <Input
                  id="metric-realized"
                  type="number"
                  step="0.01"
                  value={metricForm.realized_value}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, realized_value: e.target.value }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="metric-target">Target Value</Label>
                <Input
                  id="metric-target"
                  type="number"
                  step="0.01"
                  value={metricForm.target_value}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, target_value: e.target.value }))}
                  placeholder="Target value"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metric-unit">Measure Unit</Label>
                <Select
                  value={metricForm.measure_unit}
                  onValueChange={(value) => setMetricForm(prev => ({ ...prev, measure_unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="picklist_single">Picklist (Single)</SelectItem>
                    <SelectItem value="picklist_multiple">Picklist (Multiple)</SelectItem>
                    <SelectItem value="traffic_light">Traffic Light</SelectItem>
                    <SelectItem value="progress_bar">Progress Bar</SelectItem>
                    <SelectItem value="trend_chart">Trend Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {metricForm.measure_unit === 'currency' && (
                <div>
                  <Label htmlFor="metric-currency">Currency Type</Label>
                  <Select
                    value={metricForm.currency_type}
                    onValueChange={(value) => setMetricForm(prev => ({ ...prev, currency_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="metric-frequency">Frequency</Label>
                <Select
                  value={metricForm.frequency}
                  onValueChange={(value) => setMetricForm(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            
            <div>
              <Label htmlFor="metric-tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={metricForm.newTag}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {metricForm.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateMetricOpen(false);
                setEditingMetric(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingMetric ? handleUpdateMetric : handleCreateMetric}
              disabled={!metricForm.name.trim() || createMetricMutation.isPending || updateMetricMutation.isPending}
            >
              {(editingMetric ? updateMetricMutation.isPending : createMetricMutation.isPending) 
                ? 'Saving...' 
                : editingMetric ? 'Update Metric' : 'Create Metric'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}