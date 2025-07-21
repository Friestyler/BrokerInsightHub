import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Tag {
  id: number;
  name: string;
  color: string;
  category?: string;
  description?: string;
  usage_count?: number;
}

interface TagCategoryManagerProps {
  envId?: string;
}

const PREDEFINED_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
  '#059669', '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED',
  '#9333EA', '#C026D3', '#DB2777', '#E11D48', '#6B7280', '#374151'
];

const AVAILABLE_CATEGORIES = ['Role', 'Department', 'Skill', 'Location', 'Project'];

export default function TagCategoryManager({ envId = 'degoudse' }: TagCategoryManagerProps) {
  const { toast } = useToast();
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState(AVAILABLE_CATEGORIES);
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    category: '',
    description: ''
  });

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: [`/api/${envId}/tags`],
    queryFn: () => apiRequest('GET', `/api/${envId}/tags`),
    staleTime: 5 * 60 * 1000
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (tagData: typeof formData) => 
      apiRequest('POST', `/api/${envId}/tags`, tagData),
    onSuccess: () => {
      setShowCreateTagDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag created successfully' });
    },
    onError: (error) => {
      console.error('Create tag error:', error);
      toast({ title: 'Failed to create tag', variant: 'destructive' });
    }
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: (tagData: { id: number } & typeof formData) => {
      const { id, ...updateData } = tagData;
      return apiRequest('PUT', `/api/${envId}/tags/${id}`, updateData);
    },
    onSuccess: () => {
      setShowEditDialog(false);
      setEditingTag(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update tag', variant: 'destructive' });
    }
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) => 
      apiRequest('DELETE', `/api/${envId}/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/tags`] });
      toast({ title: 'Tag deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete tag', variant: 'destructive' });
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

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
      setShowCreateCategoryDialog(false);
      toast({ title: 'Category created successfully' });
    }
  };

  const handleCreateTag = () => {
    if (!formData.name.trim() || !formData.category) {
      toast({ title: 'Name and category are required', variant: 'destructive' });
      return;
    }
    createTagMutation.mutate(formData);
  };

  const handleUpdateTag = () => {
    if (!editingTag || !formData.name.trim() || !formData.category) {
      toast({ title: 'Name and category are required', variant: 'destructive' });
      return;
    }
    updateTagMutation.mutate({ ...formData, id: editingTag.id });
  };

  // Group tags by category - only include tags that have a category
  const tagsByCategory = tags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
    if (tag.category && tag.category.trim()) {
      const category = tag.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tag);
    }
    return acc;
  }, {});

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tag Management</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateCategoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    Create Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateTagDialog} onOpenChange={setShowCreateTagDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Tag
              </Button>
            </DialogTrigger>
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tag name..."
                  />
                </div>
                <div>
                  <Label htmlFor="tagCategory">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tagColor">Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-200"
                      style={{ backgroundColor: formData.color }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {PREDEFINED_COLORS.slice(0, 8).map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateTagDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag} disabled={createTagMutation.isPending}>
                    Create Tag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tag Lists by Category - Google/Apple Style */}
      <div className="space-y-6">
        {Object.keys(tagsByCategory).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No tags created yet.</p>
            <p className="text-xs mt-1">Create your first category and tag to get started.</p>
          </div>
        ) : (
          Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {category} ({categoryTags.length})
              </h3>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {categoryTags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tag.usage_count || 0} contacts
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTagMutation.mutate(tag.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editTagCategory">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editTagColor">Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-200"
                  style={{ backgroundColor: formData.color }}
                />
                <div className="flex flex-wrap gap-1">
                  {PREDEFINED_COLORS.slice(0, 8).map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTag} disabled={updateTagMutation.isPending}>
                Update Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}