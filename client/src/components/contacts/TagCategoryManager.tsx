// Tag and Category Management System - Senior Engineering Standard
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Tag as TagIcon, Folder } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  category?: string;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

interface TagCategoryManagerProps {
  envId?: string;
  onTagCreated?: (tag: Tag) => void;
  onTagUpdated?: (tag: Tag) => void;
  onTagDeleted?: (tagId: number) => void;
}

const TAG_CATEGORIES = [
  { value: 'Role', label: 'Role Category', description: 'Organizational roles and positions', color: '#DC2626' },
  { value: 'Department', label: 'Department Category', description: 'Business departments and divisions', color: '#3B82F6' },
  { value: 'Skill', label: 'Skill Category', description: 'Professional skills and expertise', color: '#16A34A' },
  { value: 'Location', label: 'Location Category', description: 'Geographic and office locations', color: '#EA580C' },
  { value: 'Project', label: 'Project Category', description: 'Project and initiative tags', color: '#8B5CF6' },
  { value: 'Custom', label: 'Custom Category', description: 'Custom organizational tags', color: '#6B7280' }
];

const PREDEFINED_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
  '#059669', '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED',
  '#9333EA', '#C026D3', '#DB2777', '#E11D48', '#6B7280', '#374151'
];

export function TagCategoryManager({
  envId = 'degoudse',
  onTagCreated,
  onTagUpdated,
  onTagDeleted
}: TagCategoryManagerProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    category: '',
    description: ''
  });

  // Fetch tags with caching
  const { data: tags = [], isLoading } = useQuery({
    queryKey: [`/api/${envId}/tags`],
    queryFn: () => apiRequest(`/api/${envId}/tags`),
    staleTime: 5 * 60 * 1000
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (tagData: typeof formData) => 
      apiRequest(`/api/${envId}/tags`, 'POST', tagData),
    onSuccess: (newTag) => {
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag created successfully' });
      onTagCreated?.(newTag);
    }
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: (tagData: { id: number } & typeof formData) => 
      apiRequest(`/api/${envId}/tags/${tagData.id}`, 'PUT', tagData),
    onSuccess: (updatedTag) => {
      setShowEditDialog(false);
      setEditingTag(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag updated successfully' });
      onTagUpdated?.(updatedTag);
    }
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => 
      apiRequest(`/api/${envId}/tags/${tagId}`, 'DELETE'),
    onSuccess: (_, tagId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag deleted successfully' });
      onTagDeleted?.(tagId);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      category: '',
      description: ''
    });
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      category: tag.category || '',
      description: tag.description || ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteTag = (tag: Tag) => {
    if (tag.usage_count && tag.usage_count > 0) {
      if (!confirm(`This tag is used ${tag.usage_count} time(s). Are you sure you want to delete it?`)) {
        return;
      }
    }
    if (confirm('Are you sure you want to delete this tag?')) {
      deleteTagMutation.mutate(tag.id);
    }
  };

  // Filter tags by category and search
  const filteredTags = tags.filter((tag: Tag) => {
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Group tags by category
  const groupedTags = filteredTags.reduce((groups: Record<string, Tag[]>, tag: Tag) => {
    const category = tag.category || 'Uncategorized';
    if (!groups[category]) groups[category] = [];
    groups[category].push(tag);
    return groups;
  }, {});

  // Get category info
  const getCategoryInfo = (categoryName: string) => {
    const category = TAG_CATEGORIES.find(c => c.value === categoryName);
    return category || { value: categoryName, label: categoryName, description: '', color: '#6B7280' };
  };

  if (isLoading) {
    return <div className="p-4">Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tag Management</h2>
          <p className="text-sm text-gray-600 mt-1">Organize contacts with hierarchical tags and categories</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="h-8">
          <Plus className="h-4 w-4 mr-2" />
          Create tag
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TAG_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
              <SelectItem value="Uncategorized">Uncategorized</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{tags.length}</div>
                <div className="text-sm text-gray-600">Total Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{Object.keys(groupedTags).length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-600 rounded-full" />
              <div>
                <div className="text-2xl font-bold">{tags.filter((t: Tag) => t.usage_count && t.usage_count > 0).length}</div>
                <div className="text-sm text-gray-600">In Use</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-400 rounded-full" />
              <div>
                <div className="text-2xl font-bold">{tags.filter((t: Tag) => !t.usage_count || t.usage_count === 0).length}</div>
                <div className="text-sm text-gray-600">Unused</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Tag Display */}
      <div className="space-y-6">
        {Object.entries(groupedTags).map(([categoryName, categoryTags]) => {
          const categoryInfo = getCategoryInfo(categoryName);
          return (
            <Card key={categoryName} className="border-2" style={{ borderColor: categoryInfo.color + '30' }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryInfo.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{categoryInfo.label}</CardTitle>
                      <p className="text-sm text-gray-600">{categoryInfo.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {categoryTags.length} tag{categoryTags.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTags.map((tag: Tag) => (
                    <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit tag
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTag(tag)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete tag
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {tag.description && (
                        <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Usage: {tag.usage_count || 0}</span>
                        <span>Created: {new Date(tag.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Executive, Marketing, Developer"
              />
            </div>
            <div>
              <Label htmlFor="tagCategory">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tagColor">Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
                <Input
                  id="tagColor"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20"
                />
                <div className="flex-1">
                  <div className="grid grid-cols-9 gap-1">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="tagDescription">Description</Label>
              <Textarea
                id="tagDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this tag"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createTagMutation.mutate(formData)} 
                disabled={createTagMutation.isPending || !formData.name.trim()}
              >
                {createTagMutation.isPending ? 'Creating...' : 'Create Tag'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTagName">Tag Name</Label>
              <Input
                id="editTagName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editTagCategory">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editTagColor">Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
                <Input
                  id="editTagColor"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20"
                />
                <div className="flex-1">
                  <div className="grid grid-cols-9 gap-1">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="editTagDescription">Description</Label>
              <Textarea
                id="editTagDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingTag && updateTagMutation.mutate({ ...formData, id: editingTag.id })} 
                disabled={updateTagMutation.isPending || !formData.name.trim()}
              >
                {updateTagMutation.isPending ? 'Updating...' : 'Update Tag'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TagCategoryManager;