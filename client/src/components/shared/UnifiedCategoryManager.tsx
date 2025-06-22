import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ChevronRight, ChevronDown, Edit2, Trash2, Package, Building, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  status: 'active' | 'inactive';
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface InsertCategory {
  name: string;
  description?: string;
  parentId?: number | null;
  status: 'active' | 'inactive';
}

interface UnifiedCategoryManagerProps {
  mode: 'full' | 'selection'; // full = Products page, selection = Upload flow
  onCategorySelect?: (categories: Category[]) => void; // For selection mode
  selectedCategories?: Category[]; // For selection mode
  showActions?: boolean; // Show edit/delete actions
}

const CATEGORY_COLORS = [
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200'
];

export function UnifiedCategoryManager({ 
  mode = 'full', 
  onCategorySelect, 
  selectedCategories = [],
  showActions = true 
}: UnifiedCategoryManagerProps) {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('');
  const [newCategoryStatus, setNewCategoryStatus] = useState<'active' | 'inactive'>('active');

  // Fetch product categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: [`/api/${environment.id}/product-categories`],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: InsertCategory) => 
      apiRequest(`/api/${environment.id}/product-categories`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      resetForm();
      toast({
        title: "Success",
        description: "Product category created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertCategory }) =>
      apiRequest(`/api/${environment.id}/product-categories/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      resetForm();
      toast({
        title: "Success",
        description: "Product category updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive"
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/${environment.id}/product-categories/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      toast({
        title: "Success",
        description: "Product category deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryParentId('');
    setNewCategoryStatus('active');
  };

  const handleToggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryParentId(category.parentId?.toString() || '');
    setNewCategoryStatus(category.status);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const data: InsertCategory = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
      parentId: newCategoryParentId ? parseInt(newCategoryParentId) : null,
      status: newCategoryStatus
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleNewCategory = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Build hierarchical category tree
  const buildCategoryTree = (cats: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    cats.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    cats.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children!.push(category);
        } else {
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  // Get flat list for parent selection
  const getFlatCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (items: Category[], level = 0) => {
      items.forEach(item => {
        result.push({ ...item, name: '  '.repeat(level) + item.name });
        if (item.children) {
          flatten(item.children, level + 1);
        }
      });
    };
    flatten(cats);
    return result;
  };

  const hierarchicalCategories = buildCategoryTree(categories as any[]);
  const flatCategories = getFlatCategories(hierarchicalCategories);

  // Category tree component
  const CategoryTreeItem = ({ category, level = 0, colorIndex = 0 }: { 
    category: Category; 
    level?: number; 
    colorIndex?: number;
  }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const colorClass = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

    return (
      <div className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border ${colorClass} transition-all hover:shadow-sm`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleExpanded(category.id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <div>
                <div className="font-medium text-sm">{category.name}</div>
                {category.description && (
                  <div className="text-xs opacity-75">{category.description}</div>
                )}
              </div>
            </div>
          </div>

          {showActions && mode === 'full' && (
            <div className="flex items-center space-x-1">
              <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                {category.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditCategory(category)}
                className="p-1 h-6 w-6"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCategory(category.id)}
                className="p-1 h-6 w-6 hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {category.children!.map((child, index) => (
              <CategoryTreeItem 
                key={child.id} 
                category={child} 
                level={level + 1}
                colorIndex={colorIndex + index + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Product Categories</CardTitle>
              {mode === 'selection' && (
                <CardDescription className="mt-1">
                  Create and organize categories for your products
                </CardDescription>
              )}
            </div>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewCategory} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Category</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description (optional)"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Category</label>
                  <Select value={newCategoryParentId} onValueChange={setNewCategoryParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent (root category)</SelectItem>
                      {flatCategories
                        .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newCategoryStatus} onValueChange={(value) => setNewCategoryStatus(value as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button 
                  onClick={handleSaveCategory}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                    ? "Saving..." 
                    : editingCategory ? "Update Category" : "Create Category"
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {hierarchicalCategories.length === 0 ? (
          <div className="text-center py-8">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No product categories yet</p>
            <p className="text-sm text-gray-500">
              Create your first category to organize your insurance products
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {hierarchicalCategories.map((category, index) => (
              <CategoryTreeItem 
                key={category.id} 
                category={category} 
                colorIndex={index}
              />
            ))}
          </div>
        )}
        
        {mode === 'selection' && onCategorySelect && hierarchicalCategories.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={() => onCategorySelect(hierarchicalCategories as any[])}
              className="w-full"
            >
              Continue with {hierarchicalCategories.length} Categories
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}