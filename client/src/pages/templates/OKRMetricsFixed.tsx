import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { Plus, Tag, X, Edit2, Trash2, MoreHorizontal, Filter, Search, Users, Settings, Share, Eye, EyeOff, Pencil, Calendar, Target, BarChart3, ChevronDown } from 'lucide-react';

// Interfaces
interface OKRMetric {
  id: number;
  name: string;
  description?: string;
  realized_value: number;
  target_value?: number;
  measure_unit: string;
  currency_type?: string;
  frequency: string;
  hierarchy: string;
  tags: string[];
  timeframe_start?: Date | null;
  timeframe_end?: Date | null;
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface OKRTag {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export default function OKRMetricsPage() {
  const { toast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Tag management state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [editingTag, setEditingTag] = useState<OKRTag | null>(null);

  // Fetch metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t: OKRTag) => t.name === tagName);
    return tag?.color || '#6B7280';
  };

  // Filter metrics
  const displayMetrics = metrics.filter((metric: OKRMetric) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrequency = selectedFrequency === 'all' || metric.frequency === selectedFrequency;
    const matchesUnit = selectedUnit === 'all' || metric.measure_unit === selectedUnit;
    
    return matchesSearch && matchesFrequency && matchesUnit;
  });

  // Pagination
  const totalPages = Math.ceil(displayMetrics.length / itemsPerPage);
  const paginatedMetrics = displayMetrics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Create metric mutation
  const createMetricMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/okr-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create metric');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "OKR metric created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create OKR metric", variant: "destructive" });
    },
  });

  // Tag mutations
  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const response = await fetch('/api/okr-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setNewTagName('');
      setNewTagColor('#3B82F6');
      toast({ title: "Success", description: "Tag created successfully!" });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; color: string } }) => {
      const response = await fetch(`/api/okr-tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setEditingTag(null);
      toast({ title: "Success", description: "Tag updated successfully!" });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/okr-tags/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      toast({ title: "Success", description: "Tag deleted successfully!" });
    },
  });

  const handleMetricSelect = (metricId: number, checked: boolean) => {
    setSelectedMetrics(prev => 
      checked 
        ? [...prev, metricId]
        : prev.filter(id => id !== metricId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedMetrics(checked ? paginatedMetrics.map((m: OKRMetric) => m.id) : []);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFrequency('all');
    setSelectedUnit('all');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OKR Templates</h1>
              <p className="text-gray-600">Manage your OKR metrics and templates</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setIsTagDialogOpen(true)}>
                <Tag className="w-4 h-4 mr-2" />
                Manage Tags
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add OKR Metric
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search OKR metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Frequency Filter */}
            <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Unit Filter */}
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Measure Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="percent">Percentage</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Group by:</span>
              <Select defaultValue="tag">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tag">Tag</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedMetrics.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedMetrics.length} selected</span>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Metrics List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedMetrics.length === paginatedMetrics.length && paginatedMetrics.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeframe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Milestone Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {(() => {
                  // Group metrics by tags
                  const groupedMetrics = paginatedMetrics.reduce((acc: any, metric: OKRMetric) => {
                    if (metric.tags.length === 0) {
                      if (!acc['No Tag']) acc['No Tag'] = [];
                      acc['No Tag'].push(metric);
                    } else {
                      metric.tags.forEach((tag: string) => {
                        if (!acc[tag]) acc[tag] = [];
                        acc[tag].push(metric);
                      });
                    }
                    return acc;
                  }, {});

                  return Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                    <React.Fragment key={tagName}>
                      {/* Tag Header Row */}
                      <tr>
                        <td colSpan={6} className="px-0 py-0">
                          <div 
                            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-sm"
                            style={{ 
                              backgroundColor: tagName === 'No Tag' ? '#6B7280' : getTagColor(tagName)
                            }}
                          >
                            <span className="mr-2">▶</span>
                            {tagName}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Metrics under this tag */}
                      {tagMetrics.map((metric: OKRMetric) => {
                        const formatTimeframe = () => {
                          if (metric.timeframe_start && metric.timeframe_end) {
                            const start = new Date(metric.timeframe_start);
                            const end = new Date(metric.timeframe_end);
                            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                          }
                          return 'Ongoing';
                        };

                        return (
                          <tr key={metric.id} className="hover:bg-gray-50 border-b border-gray-100">
                            <td className="px-4 py-4">
                              <Checkbox
                                checked={selectedMetrics.includes(metric.id)}
                                onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center pl-6">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                                  {metric.description && (
                                    <div className="text-sm text-gray-500">{metric.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-600">
                                {formatTimeframe()}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-600 capitalize">
                                {metric.frequency}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">
                                {metric.target_value || '-'}
                                {metric.measure_unit === 'percent' && metric.target_value ? '%' : ''}
                                {metric.measure_unit === 'currency' && metric.target_value ? 'M' : ''}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, displayMetrics.length)} of {displayMetrics.length} metrics
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {displayMetrics.length === 0 && !metricsLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No OKR metrics found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first OKR metric.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Metric
            </Button>
          </div>
        )}
      </div>

      {/* Create Metric Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OKR Metric</DialogTitle>
          </DialogHeader>
          <CreateMetricForm 
            tags={tags}
            onSubmit={(data) => createMetricMutation.mutate(data)}
            isSubmitting={createMetricMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <Input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-16"
              />
              <Button 
                onClick={() => createTagMutation.mutate({ name: newTagName, color: newTagColor })}
                disabled={!newTagName.trim() || createTagMutation.isPending}
              >
                Add
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.map((tag: OKRTag) => (
                <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                  {editingTag?.id === tag.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-16"
                      />
                      <Button 
                        size="sm"
                        onClick={() => {
                          updateTagMutation.mutate({
                            id: tag.id,
                            data: { name: newTagName, color: newTagColor }
                          });
                        }}
                        disabled={updateTagMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingTag(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingTag(tag);
                            setNewTagName(tag.name);
                            setNewTagColor(tag.color);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteTagMutation.mutate(tag.id)}
                          disabled={deleteTagMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateMetricForm({ tags, onSubmit, isSubmitting }: {
  tags: OKRTag[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    measure_unit: 'number',
    frequency: 'monthly',
    hierarchy: 'metric',
    tags: [] as string[],
    target_value: '',
    realized_value: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_value: formData.target_value ? Number(formData.target_value) : null,
      realized_value: Number(formData.realized_value) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter metric name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter metric description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="measure_unit">Measure Unit</Label>
          <Select value={formData.measure_unit} onValueChange={(value) => setFormData({ ...formData, measure_unit: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="realized_value">Current Value</Label>
          <Input
            id="realized_value"
            type="number"
            value={formData.realized_value}
            onChange={(e) => setFormData({ ...formData, realized_value: e.target.value })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="target_value">Target Value</Label>
          <Input
            id="target_value"
            type="number"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
            placeholder="Enter target value"
          />
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag: OKRTag) => (
            <Button
              key={tag.id}
              type="button"
              variant={formData.tags.includes(tag.name) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFormData({
                  ...formData,
                  tags: formData.tags.includes(tag.name)
                    ? formData.tags.filter(t => t !== tag.name)
                    : [...formData.tags, tag.name]
                });
              }}
              style={{
                backgroundColor: formData.tags.includes(tag.name) ? tag.color : undefined,
                borderColor: tag.color
              }}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Metric'}
        </Button>
      </div>
    </form>
  );
}