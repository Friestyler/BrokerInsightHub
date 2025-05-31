import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Filter } from 'lucide-react';

interface SavedView {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  filters: any;
  is_shared: boolean;
  is_default: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface SavedViewsManagerProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  currentFilters: any;
  onViewSelect: (view: SavedView | null) => void;
  selectedView?: SavedView | null;
}

export function SavedViewsManager({ 
  entityType, 
  currentFilters, 
  onViewSelect,
  selectedView 
}: SavedViewsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const queryClient = useQueryClient();

  // Fetch saved views - direct API call to bypass environment routing
  const { data: savedViewsData = [] } = useQuery({
    queryKey: ['saved-views-direct'],
    queryFn: async () => {
      const response = await fetch('/api/degoudse/saved-views');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Client-side filtering to ensure only relevant entity views are shown (same approach as lists)
  console.log('SavedViewsManager - Entity Type:', entityType);
  console.log('SavedViewsManager - Raw Views Data:', savedViewsData);
  console.log('SavedViewsManager - Looking for entity_type:', entityType + 's');
  
  const savedViews = Array.isArray(savedViewsData) ? savedViewsData.filter((view: any) => {
    console.log('SavedViewsManager - Checking view:', view.name, 'entity_type:', view.entity_type);
    const isMatch = view.entity_type === entityType + 's';
    console.log('SavedViewsManager - Match result:', isMatch);
    return isMatch;
  }) : [];
  
  console.log('SavedViewsManager - Filtered Views:', savedViews);

  // Create new view mutation
  const createViewMutation = useMutation({
    mutationFn: (newView: any) => apiRequest('POST', '/api/saved-views', newView),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/saved-views`] });
      setIsCreateDialogOpen(false);
      setNewViewName('');
      setNewViewDescription('');
      setIsShared(false);
    }
  });

  const handleCreateView = () => {
    if (!newViewName.trim()) return;

    createViewMutation.mutate({
      name: newViewName,
      description: newViewDescription || null,
      entity_type: entityType,
      filters: currentFilters,
      is_shared: isShared
    });
  };

  const hasActiveFilters = Object.keys(currentFilters).some(key => 
    currentFilters[key] && currentFilters[key] !== '' && currentFilters[key] !== 'all'
  );

  const entityDisplayName = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 's';

  return (
    <div className="flex items-center gap-2">
      {/* Views Dropdown */}
      <Select 
        value={selectedView?.id?.toString() || 'default'}
        onValueChange={(value) => {
          if (value === 'default') {
            onViewSelect(null);
          } else {
            const view = savedViews.find((v: SavedView) => v.id.toString() === value);
            if (view) onViewSelect(view);
          }
        }}
      >
        <SelectTrigger className="w-48">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600" />
            <SelectValue>
              {selectedView ? selectedView.name : `All ${entityDisplayName}`}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            <div className="flex items-center gap-2">
              <span>All {entityDisplayName}</span>
              <span className="text-xs text-gray-500 italic">Default</span>
            </div>
          </SelectItem>
          {savedViews.map((view: SavedView) => (
            <SelectItem key={view.id} value={view.id.toString()}>
              {view.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Save Current View Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasActiveFilters}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Save view
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <Filter className="h-4 w-4 inline mr-2" />
              Current filters will be saved with this view
            </div>
            <div>
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name"
              />
            </div>
            <div>
              <Label htmlFor="view-description">Description (optional)</Label>
              <Textarea
                id="view-description"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                placeholder="Enter view description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-shared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
              <Label htmlFor="is-shared">Share with team</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateView}
                disabled={!newViewName.trim() || createViewMutation.isPending}
              >
                {createViewMutation.isPending ? 'Saving...' : 'Save View'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}