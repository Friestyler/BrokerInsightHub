import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Tag, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OKRMetric {
  id: number;
  name: string;
  description?: string;
  realized_value: number;
  target_value?: number;
  measure_unit: string;
  frequency: string;
  hierarchy: string;
  tags: string[];
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

const DEFAULT_TAG_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

export default function OKRTemplatesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<OKRTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  
  const queryClient = useQueryClient();

  // Fetch OKR metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/okr-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/okr-metrics');
      if (!response.ok) throw new Error('Failed to fetch OKR metrics');
      return response.json();
    }
  });

  // Fetch OKR tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/okr-tags'],
    queryFn: async () => {
      const response = await fetch('/api/okr-tags');
      if (!response.ok) throw new Error('Failed to fetch OKR tags');
      return response.json();
    }
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; color: string }) => {
      const response = await fetch('/api/okr-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData)
      });
      if (!response.ok) throw new Error('Failed to create tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setNewTagName('');
      setNewTagColor('#3B82F6');
    }
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, ...tagData }: { id: number; name: string; color: string }) => {
      const response = await fetch(`/api/okr-tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData)
      });
      if (!response.ok) throw new Error('Failed to update tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setEditingTag(null);
    }
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/okr-tags/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
    }
  });

  // Create metric mutation
  const createMetricMutation = useMutation({
    mutationFn: async (metricData: any) => {
      const response = await fetch('/api/okr-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricData)
      });
      if (!response.ok) throw new Error('Failed to create metric');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      setIsCreateDialogOpen(false);
    }
  });

  // Group metrics by tags
  const groupedMetrics = metrics.reduce((acc: any, metric: OKRMetric) => {
    if (metric.tags && metric.tags.length > 0) {
      metric.tags.forEach((tag: string) => {
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(metric);
      });
    } else {
      if (!acc['untagged']) acc['untagged'] = [];
      acc['untagged'].push(metric);
    }
    return acc;
  }, {});

  // Get tag color
  const getTagColor = (tagName: string) => {
    const tag = tags.find((t: OKRTag) => t.name === tagName);
    return tag ? tag.color : '#3B82F6';
  };

  // Filter metrics by selected tag
  const filteredMetrics = selectedTag 
    ? metrics.filter((metric: OKRMetric) => 
        selectedTag === 'untagged' 
          ? (!metric.tags || metric.tags.length === 0)
          : (metric.tags && metric.tags.includes(selectedTag))
      )
    : metrics;

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate({ name: newTagName.trim(), color: newTagColor });
    }
  };

  const handleUpdateTag = (tag: OKRTag) => {
    updateTagMutation.mutate(tag);
  };

  const handleDeleteTag = (id: number) => {
    deleteTagMutation.mutate(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">OKR Templates</h1>
          <p className="text-sm text-gray-500">
            Create and manage OKR metric templates with tags
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="w-4 h-4 mr-2" />
                Manage Tags
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Tags</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Create new tag */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create New Tag</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tagName">Tag Name</Label>
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Enter tag name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagColor">Color</Label>
                      <div className="flex gap-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                        >
                          {DEFAULT_TAG_COLORS.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                        <div 
                          className="w-10 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: newTagColor }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tag
                  </Button>
                </div>

                {/* Existing tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Existing Tags</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tags.map((tag: OKRTag) => (
                      <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                        {editingTag?.id === tag.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingTag.name}
                              onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                              className="flex-1"
                            />
                            <select
                              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={editingTag.color}
                              onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                            >
                              {DEFAULT_TAG_COLORS.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: editingTag.color }}
                            />
                            <Button size="sm" onClick={() => handleUpdateTag(editingTag)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingTag(null)}>
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
                                onClick={() => setEditingTag(tag)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteTag(tag.id)}
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
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Metric
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="grouped" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grouped">Grouped by Tags</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grouped" className="space-y-6">
            {/* Tag filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All ({metrics.length})
              </Button>
              {Object.keys(groupedMetrics).map((tagName) => (
                <Button
                  key={tagName}
                  variant={selectedTag === tagName ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tagName)}
                  style={{ 
                    backgroundColor: selectedTag === tagName ? getTagColor(tagName) : undefined,
                    borderColor: getTagColor(tagName)
                  }}
                >
                  {tagName === 'untagged' ? 'Untagged' : tagName} ({groupedMetrics[tagName].length})
                </Button>
              ))}
            </div>

            {/* Grouped metrics */}
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                <div key={tagName}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getTagColor(tagName) }}
                    />
                    <h2 className="text-lg font-semibold">
                      {tagName === 'untagged' ? 'Untagged Metrics' : tagName}
                    </h2>
                    <Badge variant="secondary">{tagMetrics.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagMetrics.map((metric: OKRMetric) => (
                      <MetricCard key={metric.id} metric={metric} tags={tags} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric: OKRMetric) => (
                <MetricCard key={metric.id} metric={metric} tags={tags} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {metrics.length === 0 && !metricsLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No OKR metrics found</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Metric
            </Button>
          </div>
        )}
      </div>
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

function MetricCard({ metric, tags }: { metric: OKRMetric; tags: OKRTag[] }) {
  const getTagColor = (tagName: string) => {
    const tag = tags.find((t: OKRTag) => t.name === tagName);
    return tag ? tag.color : '#3B82F6';
  };

  const progress = metric.target_value 
    ? Math.min((metric.realized_value / metric.target_value) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{metric.name}</CardTitle>
        {metric.description && (
          <CardDescription>{metric.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Current / Target</span>
          <div className="text-right">
            <div className="font-semibold">
              {metric.realized_value}
              {metric.target_value && ` / ${metric.target_value}`}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {metric.measure_unit} • {metric.frequency}
            </div>
          </div>
        </div>

        {metric.target_value && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {metric.tags && metric.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {metric.tags.map((tagName: string) => (
              <Badge 
                key={tagName} 
                variant="secondary"
                style={{ 
                  backgroundColor: `${getTagColor(tagName)}20`,
                  color: getTagColor(tagName),
                  borderColor: getTagColor(tagName)
                }}
              >
                {tagName}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}