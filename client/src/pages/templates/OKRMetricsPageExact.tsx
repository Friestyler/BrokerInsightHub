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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
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

interface SavedList {
  id: string;
  name: string;
  type: 'filter' | 'selection';
  filters: any;
  members?: number[];
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
}

interface SavedView {
  id: string;
  name: string;
  filters: any;
  createdBy: string;
  createdAt: Date;
}

// Fetch OKR metrics from database
const useOKRMetricsData = () => {
  return useQuery({
    queryKey: ['/api/okr-metrics'],
    queryFn: async () => {
      console.log('Fetching OKR metrics data...');
      const response = await fetch('/api/okr-metrics');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch OKR metrics');
      }
      
      const metrics = await response.json();
      console.log('Got OKR metrics from API:', metrics);
      return metrics;
    }
  });
};

// Fetch OKR tags from database
const useOKRTagsData = () => {
  return useQuery({
    queryKey: ['/api/okr-tags'],
    queryFn: async () => {
      const response = await fetch('/api/okr-tags');
      if (!response.ok) {
        throw new Error('Failed to fetch OKR tags');
      }
      return response.json();
    }
  });
};

// Calculate OKR metric statistics
function calculateMetricStats(metrics: any[]) {
  const totalMetrics = metrics.length;
  const completedMetrics = metrics.filter(m => m.target_value && m.realized_value >= m.target_value).length;
  const inProgressMetrics = metrics.filter(m => m.target_value && m.realized_value < m.target_value && m.realized_value > 0).length;
  const notStartedMetrics = metrics.filter(m => m.realized_value === 0).length;
  
  return {
    totalMetrics,
    completedMetrics,
    inProgressMetrics,
    notStartedMetrics
  };
}

// Template badges component for metrics
function TemplateBadges({ metricId, templateAssignments }: { metricId: number, templateAssignments: any[] }) {
  const metricAssignments = templateAssignments.filter((assignment: any) => assignment.metricId === metricId);
  
  if (metricAssignments.length === 0) {
    return (
      <span className="text-gray-400 text-xs">No templates</span>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {metricAssignments.slice(0, 2).map((assignment: any) => {
        const firstTag = assignment.tags && assignment.tags.length > 0 ? assignment.tags[0] : null;
        const tagColor = firstTag || '#6b7280';
        
        return (
          <Badge 
            key={assignment.id}
            variant="secondary" 
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: `${tagColor}20`,
              color: tagColor,
              borderColor: `${tagColor}40`
            }}
          >
            {assignment.name}
          </Badge>
        );
      })}
      {metricAssignments.length > 2 && (
        <Badge variant="secondary" className="text-xs">
          +{metricAssignments.length - 2}
        </Badge>
      )}
    </div>
  );
}

// Create list editing context provider
export function ListEditingProvider({ children }: { children: React.ReactNode }) {
  const [isEditingList, setIsEditingList] = useState(false);
  
  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      {children}
    </ListEditingContext.Provider>
  );
}

// Hook to use list editing context
export function useListEditing() {
  return useContext(ListEditingContext);
}

export default function OKRMetricsPage() {
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Use the shared context for list editing state
  const { isEditingList, setIsEditingList } = useListEditing();
  const [isSavingList, setIsSavingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // State for unsaved changes confirmation
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingListAction, setPendingListAction] = useState<{
    type: 'select' | 'clear';
    list?: SavedList;
  } | null>(null);
  
  // State for saved lists
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    {
      id: 'all-metrics',
      name: 'All OKR Metrics',
      type: 'filter',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true
    },
    {
      id: '1',
      name: 'Customer Success KPIs',
      type: 'selection',
      filters: {},
      members: [11, 12, 13],
      isShared: true,
      sharedWith: ['team@acme.com'],
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    },
    {
      id: '2',
      name: 'Revenue Metrics',
      type: 'selection',
      filters: {},
      members: [14, 15, 16],
      isShared: false,
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-10')
    }
  ]);
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [originalListFilters, setOriginalListFilters] = useState<SavedList['filters'] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // State for saved views
  const [savedViews, setSavedViews] = useState<SavedView[]>([
    {
      id: 'view-1',
      name: 'Customer Success Metrics',
      filters: {
        tags: ['Customer Success'],
        frequency: 'quarterly'
      },
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    }
  ]);
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<OKRTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  
  // Fetch data
  const { data: metrics = [], isLoading: metricsLoading } = useOKRMetricsData();
  const { data: tags = [], isLoading: tagsLoading } = useOKRTagsData();
  
  // Mock template assignments data (replace with real data when available)
  const templateAssignments: any[] = [];
  
  // Calculate statistics
  const stats = calculateMetricStats(metrics);
  
  // Filter metrics based on current filters
  const filteredMetrics = metrics.filter((metric: OKRMetric) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (metric.description && metric.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFrequency = !selectedFrequency || selectedFrequency === 'all' || metric.frequency === selectedFrequency;
    const matchesUnit = !selectedUnit || selectedUnit === 'all' || metric.measure_unit === selectedUnit;
    
    return matchesSearch && matchesFrequency && matchesUnit;
  });
  
  // Apply list filtering
  let displayMetrics = filteredMetrics;
  if (activeList && activeList.type === 'selection' && activeList.members) {
    displayMetrics = filteredMetrics.filter(metric => activeList.members!.includes(metric.id));
  }
  
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create metric');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-metrics'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "OKR metric created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create OKR metric",
        variant: "destructive",
      });
    },
  });
  
  // Tag management mutations
  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const response = await fetch('/api/okr-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tag');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setNewTagName('');
      setNewTagColor('#3B82F6');
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
  });
  
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; color: string } }) => {
      const response = await fetch(`/api/okr-tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tag');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      setEditingTag(null);
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    },
  });
  
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/okr-tags/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/okr-tags'] });
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    },
  });
  
  // Helper functions
  const getTagColor = (tagName: string) => {
    const tag = tags.find((t: OKRTag) => t.name === tagName);
    return tag ? tag.color : '#3B82F6';
  };
  
  const formatTimeframe = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return '-';
    if (start && end) {
      return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
    }
    if (start) return `From ${new Date(start).toLocaleDateString()}`;
    if (end) return `Until ${new Date(end).toLocaleDateString()}`;
    return '-';
  };
  
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMetrics(paginatedMetrics.map(metric => metric.id));
    } else {
      setSelectedMetrics([]);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedFrequency('');
    setSelectedUnit('');
    setCurrentPage(1);
  };
  
  if (metricsLoading || tagsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading OKR metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OKR Metrics</h1>
              <p className="text-gray-500 text-sm mt-1">Coming Soon</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsTagDialogOpen(true)}
                className="flex items-center gap-2 text-gray-600 border-gray-300"
              >
                <Tag className="w-4 h-4" />
                Manage Tags
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Metric
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
                    Metric
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMetrics.map((metric: OKRMetric) => {
                  const progress = metric.target_value 
                    ? Math.min((metric.realized_value / metric.target_value) * 100, 100)
                    : 0;
                  
                  return (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {metric.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                            {metric.description && (
                              <div className="text-sm text-gray-500">{metric.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{metric.realized_value}</span>
                              <span>{metric.target_value || '-'}</span>
                            </div>
                            {metric.target_value && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="secondary" className="capitalize">
                          {metric.frequency}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
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