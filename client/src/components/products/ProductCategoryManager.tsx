import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen,
  Package,
  Building
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { ProductCategory, InsertProductCategory } from '@shared/schema';

interface CategoryTreeProps {
  categories: (ProductCategory & { children?: ProductCategory[]; product_count?: number; child_count?: number })[];
  onEditCategory: (category: ProductCategory) => void;
  onDeleteCategory: (categoryId: number) => void;
  expandedCategories: Set<number>;
  onToggleExpanded: (categoryId: number) => void;
  level?: number;
}

function CategoryTree({ 
  categories, 
  onEditCategory, 
  onDeleteCategory, 
  expandedCategories, 
  onToggleExpanded, 
  level = 0 
}: CategoryTreeProps) {
  const paddingLeft = level * 24;

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <div key={category.id} className="group">
          <div 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
          >
            <div className="flex items-center space-x-2 flex-1">
              {category.children && category.children.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={() => onToggleExpanded(category.id)}
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
              
              {category.children && category.children.length > 0 ? (
                expandedCategories.has(category.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-600" />
                )
              ) : (
                <Package className="h-4 w-4 text-gray-500" />
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.product_count || 0} products
                  </Badge>
                  {category.child_count && category.child_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {category.child_count} subcategories
                    </Badge>
                  )}
                  <Badge 
                    variant={category.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {category.status}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditCategory(category)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteCategory(category.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {category.children && 
           category.children.length > 0 && 
           expandedCategories.has(category.id) && (
            <CategoryTree
              categories={category.children}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              expandedCategories={expandedCategories}
              onToggleExpanded={onToggleExpanded}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface CategoryFormProps {
  category?: ProductCategory;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (data: InsertProductCategory) => void;
}

function CategoryForm({ category, categories, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<InsertProductCategory>({
    name: category?.name || '',
    description: category?.description || '',
    parentId: category?.parentId || undefined,
    status: category?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Build flat list of categories for parent selection (excluding current category and its descendants)
  const availableParents = categories.filter(cat => {
    if (!category) return true;
    if (cat.id === category.id) return false;
    // TODO: Add logic to prevent circular references
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Life Insurance, Property Coverage"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe this product category..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category</Label>
        <Select
          value={formData.parentId?.toString() || ''}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            parentId: value ? parseInt(value) : undefined 
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent category (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Parent (Root Category)</SelectItem>
            {availableParents.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'inactive') => 
            setFormData(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}

interface ProductCategoryManagerProps {
  envId: string;
}

export function ProductCategoryManager({ envId }: ProductCategoryManagerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch product categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: [`/api/${envId}/product-categories`],
    queryFn: () => apiRequest(`/api/${envId}/product-categories`)
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: InsertProductCategory) => 
      apiRequest(`/api/${envId}/product-categories`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/product-categories`] });
      setIsFormOpen(false);
      setEditingCategory(null);
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
    mutationFn: ({ id, data }: { id: number; data: InsertProductCategory }) =>
      apiRequest(`/api/${envId}/product-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/product-categories`] });
      setIsFormOpen(false);
      setEditingCategory(null);
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
      apiRequest(`/api/${envId}/product-categories/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/product-categories`] });
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

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleSaveCategory = (data: InsertProductCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  // Flatten categories for parent selection
  const flattenCategories = (cats: any[]): ProductCategory[] => {
    const result: ProductCategory[] = [];
    const flatten = (items: any[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    flatten(cats);
    return result;
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
            <CardTitle>Product Categories</CardTitle>
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
              <CategoryForm
                category={editingCategory || undefined}
                categories={flattenCategories(categories)}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveCategory}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No product categories yet</p>
            <p className="text-sm text-gray-500">
              Create your first category to organize your insurance products
            </p>
          </div>
        ) : (
          <CategoryTree
            categories={categories}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            expandedCategories={expandedCategories}
            onToggleExpanded={handleToggleExpanded}
          />
        )}
      </CardContent>
    </Card>
  );
}