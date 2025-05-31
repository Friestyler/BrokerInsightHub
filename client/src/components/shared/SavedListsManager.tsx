import { useState, useEffect } from 'react';
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
import { Plus, List } from 'lucide-react';

interface SavedList {
  id: number;
  name: string;
  description?: string;
  type: string;
  entity_type: string;
  members: number[];
  filters: any;
  is_shared: boolean;
  is_default: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface SavedListsManagerProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  selectedItems: number[];
  onListSelect: (list: SavedList) => void;
  currentFilters?: any;
}

export function SavedListsManager({ 
  entityType, 
  selectedItems, 
  onListSelect,
  currentFilters = {}
}: SavedListsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const queryClient = useQueryClient();

  // Fetch saved lists
  const { data: savedLists = [] } = useQuery({
    queryKey: [`/api/saved-lists`, entityType],
    queryFn: () => apiRequest('GET', `/api/saved-lists?entity_type=${entityType}`)
  });

  console.log('SavedListsManager - Entity Type:', entityType);
  console.log('SavedListsManager - Raw Lists Data:', savedLists);

  // Create new list mutation
  const createListMutation = useMutation({
    mutationFn: (newList: any) => apiRequest('POST', '/api/saved-lists', newList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/saved-lists`] });
      setIsCreateDialogOpen(false);
      setNewListName('');
      setNewListDescription('');
      setIsShared(false);
    }
  });

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    createListMutation.mutate({
      name: newListName,
      description: newListDescription || null,
      type: 'manual',
      entity_type: entityType,
      members: selectedItems,
      filters: currentFilters,
      is_shared: isShared
    });
  };

  const canCreateList = selectedItems.length > 0;
  const entityDisplayName = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 's';

  return (
    <div className="flex items-center gap-2">
      {/* Lists Dropdown */}
      <Select onValueChange={(value) => {
        const list = savedLists.find((l: SavedList) => l.id.toString() === value);
        if (list) onListSelect(list);
      }}>
        <SelectTrigger className="w-48">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-blue-600" />
            <SelectValue placeholder={`All ${entityDisplayName}`} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {entityDisplayName}</SelectItem>
          {savedLists.map((list: SavedList) => (
            <SelectItem key={list.id} value={list.id.toString()}>
              {list.name} ({list.members?.length || 0})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add to List Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!canCreateList}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to list
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div>
              <Label htmlFor="list-description">Description (optional)</Label>
              <Textarea
                id="list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Enter list description"
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
                onClick={handleCreateList}
                disabled={!newListName.trim() || createListMutation.isPending}
              >
                {createListMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}