import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Create a context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});

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
import { Plus, Tag, Edit2, Trash2, MoreHorizontal, Filter, Search, Settings, ChevronRight, Users, Copy } from 'lucide-react';

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

export function ListEditingProvider({ children }: { children: React.ReactNode }) {
  const [isEditingList, setIsEditingList] = useState(false);

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      {children}
    </ListEditingContext.Provider>
  );
}

export function useListEditing() {
  return useContext(ListEditingContext);
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
  const [groupBy, setGroupBy] = useState('tag');
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
    const tag = (tags as OKRTag[]).find((t: OKRTag) => t.name === tagName);
    return tag?.color || '#6B7280';
  };

  // Filter metrics
  const displayMetrics = (metrics as OKRMetric[]).filter((metric: OKRMetric) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrequency = selectedFrequency === 'all' || metric.frequency === selectedFrequency;
    const matchesUnit = selectedUnit === 'all' || metric.measure_unit === selectedUnit;
    
    return matchesSearch && matchesFrequency && matchesUnit;
  });

  // Group metrics by tags or none
  const groupedMetrics = groupBy === 'tag' 
    ? displayMetrics.reduce((acc: any, metric: OKRMetric) => {
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
      }, {})
    : { 'All Metrics': displayMetrics };

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

  const handleMetricSelect = (metricId: number, checked: boolean) => {
    setSelectedMetrics(prev => 
      checked 
        ? [...prev, metricId]
        : prev.filter(id => id !== metricId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const currentPageMetrics = Object.values(groupedMetrics).flat() as OKRMetric[];
    setSelectedMetrics(checked ? currentPageMetrics.map((m: OKRMetric) => m.id) : []);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFrequency('all');
    setSelectedUnit('all');
    setCurrentPage(1);
  };

  return (
    <ListEditingProvider>
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
        <div className="min-h-screen bg-white px-6 py-6">

          {/* Group By */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-sm text-gray-600">Group by:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tag">Tag</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection Bar */}
          {selectedMetrics.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 mb-6">
              <span className="text-sm font-medium text-blue-900">
                {selectedMetrics.length} OKR selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Users className="w-4 h-4 mr-2" />
                  Assign to entity
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Metrics Table */}
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {groupBy === 'none' && (
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 px-6 py-3 text-left">
                        <Checkbox
                          checked={selectedMetrics.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timeframe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Milestone Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody className="bg-white">
                  {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any], groupIndex) => [
                    // Tag Header Row (only show for tag grouping)
                    ...(groupBy === 'tag' ? [
                      <tr key={`header-${tagName}-${groupIndex}`} className="border-b border-gray-200">
                        <td colSpan={6} className="px-6 py-3">
                          <span 
                            className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                            style={{ 
                              backgroundColor: tagName === 'Customer Success' ? '#d1fae5' : 
                                             tagName === 'Market Expansion' ? '#fef3c7' : 
                                             tagName === 'Product Innovation' ? '#dbeafe' : '#f3f4f6',
                              color: tagName === 'Customer Success' ? '#065f46' : 
                                     tagName === 'Market Expansion' ? '#92400e' : 
                                     tagName === 'Product Innovation' ? '#1e40af' : '#374151'
                            }}
                          >
                            {tagName}
                          </span>
                        </td>
                      </tr>,
                      // Column Headers for this group
                      <tr key={`subheader-${tagName}-${groupIndex}`} className="border-b border-gray-200 bg-gray-50">
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeframe</td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone Frequency</td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</td>
                        <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</td>
                      </tr>
                    ] : []),
                    // Metrics under this tag
                    ...tagMetrics.map((metric: OKRMetric, metricIndex: number) => {
                      const formatTimeframe = () => {
                        if (metric.timeframe_start && metric.timeframe_end) {
                          const start = new Date(metric.timeframe_start);
                          const end = new Date(metric.timeframe_end);
                          return `Until ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                        }
                        return 'Ongoing';
                      };

                      const isLastInGroup = metricIndex === tagMetrics.length - 1;
                      const isLastGroup = groupIndex === Object.keys(groupedMetrics).length - 1;

                      return (
                        <tr key={`metric-${metric.id}-${tagName}-${metricIndex}`} 
                            className={`hover:bg-gray-50 ${!isLastInGroup || !isLastGroup ? 'border-b border-gray-100' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              checked={selectedMetrics.includes(metric.id)}
                              onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                            {metric.description && (
                              <div className="text-sm text-gray-500">{metric.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {formatTimeframe()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 capitalize">
                              {metric.frequency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {metric.target_value || '-'}
                              {metric.measure_unit === 'percent' && metric.target_value ? '%' : ''}
                              {metric.measure_unit === 'currency' && metric.target_value ? 'M' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    })
                  ]).flat()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Metric Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create OKR Metric</DialogTitle>
            </DialogHeader>
            <CreateMetricForm 
              tags={tags as OKRTag[]}
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
                {(tags as OKRTag[]).map((tag: OKRTag) => (
                  <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingProvider>
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