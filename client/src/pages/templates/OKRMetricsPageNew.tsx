import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, Search, Settings, Plus, MoreHorizontal, Eye, Copy, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OKRMetric {
  id: number;
  name: string;
  description: string;
  realized_value: string;
  target_value: string;
  measure_unit: string;
  currency_type: string;
  traffic_light_thresholds: any;
  progress_bar_thresholds: any;
  picklist_options: string[];
  responsible_user_id: number;
  responsible_contact_ids: number[];
  timeframe_start: Date | null;
  timeframe_end: Date | null;
  frequency: string;
  attachment_url: string;
  due_date: Date | null;
  is_muted: boolean;
  is_archived: boolean;
  is_shared: boolean;
  hierarchy: string;
  parent_id: number | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  created_by: number;
}

interface OKRTag {
  id: number;
  name: string;
  color: string;
}

const measureUnitOptions = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percent', label: 'Percent' },
  { value: 'checkbox', label: 'Checkbox (complete/not complete)' },
  { value: 'picklist_single', label: 'Picklist (single-choice)' },
  { value: 'picklist_multiple', label: 'Picklist (multiple-choice)' },
  { value: 'traffic_light', label: 'Traffic light' },
  { value: 'progress_bar', label: 'Progress bar' },
  { value: 'trend_chart', label: 'Trend chart' }
];

const frequencyOptions = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'none', label: 'None' },
  { value: 'custom', label: 'Custom' }
];

const hierarchyOptions = [
  { value: 'objective', label: 'Objective' },
  { value: 'activity', label: 'Activity' },
  { value: 'subactivity', label: 'Subactivity' }
];

export default function OKRMetricsPageNew() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState<string>('');
  const [groupBy, setGroupBy] = useState<string>('Tag');
  const [targetRange, setTargetRange] = useState('');
  const [noTargetSet, setNoTargetSet] = useState(false);
  const [timeframe1, setTimeframe1] = useState<Date>();
  const [timeframe2, setTimeframe2] = useState<Date>();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load OKR metrics from API
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/okr-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/okr-metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });

  // Load OKR tags from API
  const { data: tags = [] } = useQuery({
    queryKey: ['/api/okr-tags'],
    queryFn: async () => {
      const response = await fetch('/api/okr-tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });

  // Create metric mutation
  const createMetricMutation = useMutation({
    mutationFn: async (newMetric: any) => {
      const response = await fetch('/api/okr-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetric)
      });
      if (!response.ok) throw new Error('Failed to create metric');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      toast({ title: "Success", description: "OKR metric created successfully" });
      setShowCreateModal(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create metric", variant: "destructive" });
    }
  });

  // Filter and group metrics
  const filteredMetrics = metrics.filter((metric: OKRMetric) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (metric.tags && metric.tags.includes(selectedTag));
    const matchesMeasureUnit = !selectedMeasureUnit || metric.measure_unit === selectedMeasureUnit;
    const matchesTargetRange = !targetRange || (metric.target_value && metric.target_value.includes(targetRange));
    const matchesNoTarget = !noTargetSet || !metric.target_value;
    
    return matchesSearch && matchesTag && matchesMeasureUnit && matchesTargetRange && matchesNoTarget;
  });

  // Group metrics by selected criteria
  const groupedMetrics = filteredMetrics.reduce((groups: any, metric: OKRMetric) => {
    let groupKey = 'No Tag';
    
    if (groupBy === 'Tag') {
      groupKey = metric.tags && metric.tags.length > 0 ? metric.tags[0] : 'No Tag';
    } else if (groupBy === 'Hierarchy') {
      groupKey = metric.hierarchy || 'Unknown';
    } else if (groupBy === 'Frequency') {
      groupKey = metric.frequency || 'None';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(metric);
    return groups;
  }, {});

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t: OKRTag) => t.name === tagName);
    return tag?.color || '#3B82F6';
  };

  const formatTimeframe = (start: Date | null, end: Date | null) => {
    if (!start && !end) return 'Ongoing';
    if (!end) return `From ${format(new Date(start!), 'MMM d, yyyy')}`;
    if (!start) return `Until ${format(new Date(end), 'MMM d, yyyy')}`;
    return `${format(new Date(start), 'MMM d, yyyy')} - ${format(new Date(end), 'MMM d, yyyy')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">OKR Metrics</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manage Tags
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Create Metric
            </Button>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gray-100 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600">Coming Soon</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search OKR templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {/* Tag Filter */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {tags.map((tag: OKRTag) => (
                <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Measure Unit Filter */}
          <Select value={selectedMeasureUnit} onValueChange={setSelectedMeasureUnit}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Measure Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Units</SelectItem>
              {measureUnitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Target Range */}
          <Input
            placeholder="Target Range"
            value={targetRange}
            onChange={(e) => setTargetRange(e.target.value)}
            className="w-32 h-9"
          />

          {/* Timeframe 1 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-44 h-9 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {timeframe1 ? format(timeframe1, 'MMM d, yyyy') : 'Select timeframe 1'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={timeframe1}
                onSelect={setTimeframe1}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Timeframe 2 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-44 h-9 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {timeframe2 ? format(timeframe2, 'MMM d, yyyy') : 'Select timeframe 2'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={timeframe2}
                onSelect={setTimeframe2}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* No target checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-target"
              checked={noTargetSet}
              onCheckedChange={(checked) => setNoTargetSet(Boolean(checked))}
            />
            <Label htmlFor="no-target" className="text-sm">No target set</Label>
          </div>
        </div>

        {/* Group By and Add Button Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Group by:</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-28 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tag">Tag</SelectItem>
                <SelectItem value="Hierarchy">Hierarchy</SelectItem>
                <SelectItem value="Frequency">Frequency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center gap-2 h-9" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Add OKR Metric
          </Button>
        </div>

        {/* Selection Bar */}
        {selectedMetrics.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedMetrics.length} OKR selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-8">
                <Eye className="w-4 h-4" />
                Assign to entity
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-8">
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 hover:text-red-700 h-8">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetrics([])}
                className="text-gray-500 h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* OKR Metrics Groups */}
        <div className="space-y-4">
          {Object.entries(groupedMetrics).map(([groupName, groupMetrics]: [string, any]) => (
            <div key={groupName} className="bg-white rounded-lg border">
              {/* Group Header */}
              <div 
                className="px-4 py-3 border-b"
                style={{ backgroundColor: getTagColor(groupName) + '15' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTagColor(groupName) }}
                  />
                  <h3 className="font-medium text-gray-900">{groupName}</h3>
                </div>
              </div>

              {/* Metrics Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left">
                        <Checkbox />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Timeframe</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Milestone Frequency</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Target</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupMetrics.map((metric: OKRMetric) => (
                      <tr key={metric.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedMetrics.includes(metric.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMetrics([...selectedMetrics, metric.id]);
                              } else {
                                setSelectedMetrics(selectedMetrics.filter(id => id !== metric.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {metric.hierarchy === 'objective' && (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{metric.name}</div>
                              {metric.description && (
                                <div className="text-sm text-gray-500">{metric.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatTimeframe(metric.timeframe_start, metric.timeframe_end)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                          {metric.frequency}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {metric.target_value || '-'}
                          {metric.measure_unit === 'percent' && '%'}
                          {metric.measure_unit === 'currency' && ` ${metric.currency_type}`}
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Create Metric Modal */}
        <CreateMetricModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMetricMutation.mutate(data)}
          tags={tags}
          isLoading={createMetricMutation.isPending}
        />
      </div>
    </div>
  );
}

// Create Metric Modal Component
function CreateMetricModal({ 
  open, 
  onClose, 
  onSubmit, 
  tags, 
  isLoading 
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  tags: OKRTag[];
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    realized_value: '0',
    target_value: '',
    measure_unit: 'number',
    currency_type: 'USD',
    frequency: 'quarterly',
    hierarchy: 'activity',
    tags: [] as string[],
    timeframe_start: null as Date | null,
    timeframe_end: null as Date | null,
    due_date: null as Date | null,
    is_shared: true,
    created_by: 1 // Hardcoded for now
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New OKR Metric</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="hierarchy">Hierarchy</Label>
              <Select value={formData.hierarchy} onValueChange={(value) => updateFormData('hierarchy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hierarchyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="realized">Realized Value</Label>
              <Input
                id="realized"
                value={formData.realized_value}
                onChange={(e) => updateFormData('realized_value', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="target">Target Value</Label>
              <Input
                id="target"
                value={formData.target_value}
                onChange={(e) => updateFormData('target_value', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="measure-unit">Measure Unit</Label>
              <Select value={formData.measure_unit} onValueChange={(value) => updateFormData('measure_unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {measureUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => updateFormData('frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="shared"
                checked={formData.is_shared}
                onCheckedChange={(checked) => updateFormData('is_shared', checked)}
              />
              <Label htmlFor="shared">Shared/Public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Metric'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}