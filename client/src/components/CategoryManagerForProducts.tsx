import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X, Check } from 'lucide-react';
import { Folder, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
  subSubcategories?: SubSubcategory[];
}

interface SubSubcategory {
  id: string;
  name: string;
  subcategoryId: string;
  color?: string;
}

const COLORS = [
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

export function CategoryManagerForProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState('#3b82f6');
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');
  const [editingSubcategoryColor, setEditingSubcategoryColor] = useState('#6b7280');
  const [editingSubSubcategory, setEditingSubSubcategory] = useState<string | null>(null);
  const [editingSubSubcategoryName, setEditingSubSubcategoryName] = useState('');
  const [editingSubSubcategoryColor, setEditingSubSubcategoryColor] = useState('#9ca3af');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newSubcategoryForCategory, setNewSubcategoryForCategory] = useState('');
  const [addingSubSubcategoryTo, setAddingSubSubcategoryTo] = useState<string | null>(null);
  const [newSubSubcategoryForSubcategory, setNewSubSubcategoryForSubcategory] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const subcategoryInputRef = useRef<HTMLInputElement>(null);

  // Load categories from database
  const { data: dbCategories, isLoading } = useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      if (!data || !Array.isArray(data)) return [];
      
      // Transform database hierarchical structure to local format
      const categories: Category[] = [];
      
      data.forEach((dbCat: any, index: number) => {
        if (!dbCat.parent_id) {
          // This is a main category
          const category: Category = {
            id: dbCat.id.toString(),
            name: dbCat.name,
            color: dbCat.color || COLORS[index % COLORS.length],
            subcategories: []
          };
          
          // Add subcategories from the subcategories array
          if (dbCat.subcategories && Array.isArray(dbCat.subcategories)) {
            dbCat.subcategories.forEach((sub: any) => {
              const subcategory: Subcategory = {
                id: sub.id.toString(),
                name: sub.name,
                categoryId: dbCat.id.toString(),
                color: sub.color || '#6b7280',
                subSubcategories: []
              };
              
              // Add sub-subcategories if they exist
              if (sub.subSubcategories && Array.isArray(sub.subSubcategories)) {
                sub.subSubcategories.forEach((subSub: any) => {
                  subcategory.subSubcategories!.push({
                    id: subSub.id.toString(),
                    name: subSub.name,
                    subcategoryId: sub.id.toString(),
                    color: subSub.color || '#9ca3af'
                  });
                });
              }
              
              category.subcategories.push(subcategory);
            });
          }
          
          categories.push(category);
        }
      });
      
      return categories;
    }
  });

  useEffect(() => {
    if (dbCategories) {
      setCategories(dbCategories);
    }
  }, [dbCategories]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; parentId?: number }) => {
      return apiRequest('POST', '/api/product-categories', categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, description, status }: { id: string; name: string; description?: string; status?: string }) => {
      return apiRequest('PUT', `/api/product-categories/${id}`, { 
        name, 
        description: description || '', 
        status: status || 'active' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/product-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
    }
  });

  const getNextColor = () => {
    return COLORS[categories.length % COLORS.length];
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      // Create in database
      await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim()
      });

      // Update local state immediately for better UX
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        color: getNextColor(),
        subcategories: []
      };

      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setSelectedCategoryId(newCategory.id);
      
      toast({
        title: "Category created",
        description: `"${newCategory.name}" has been added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const addSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;

    try {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (!selectedCategory) return;

      // Create in database
      await createCategoryMutation.mutateAsync({
        name: newSubcategoryName.trim(),
        parentId: parseInt(selectedCategoryId)
      });

      // Update local state
      const newSubcategory: Subcategory = {
        id: generateId(),
        name: newSubcategoryName.trim(),
        categoryId: selectedCategoryId
      };

      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategoryId 
          ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
          : cat
      ));
      
      setNewSubcategoryName('');
      
      toast({
        title: "Subcategory added",
        description: `"${newSubcategory.name}" has been added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive"
      });
    }
  };

  const handleCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingCategory) {
        saveEditCategory();
      } else {
        addCategory();
      }
    }
  };

  const handleSubcategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSubcategory();
    }
  };



  const saveEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory,
        name: editingCategoryName.trim(),
        description: '',
        status: 'active'
      });

      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory 
          ? { ...cat, name: editingCategoryName.trim(), color: editingCategoryColor }
          : cat
      ));

      setEditingCategory(null);
      setEditingCategoryName('');

      toast({
        title: "Category updated",
        description: "Category name has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
    setEditingCategoryColor('#3b82f6');
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));

      toast({
        title: "Category deleted",
        description: "Category and all subcategories have been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };



  // Subcategory editing functions
  const startEditingSubcategory = (subcategoryId: string, subcategoryName: string) => {
    setEditingSubcategory(subcategoryId);
    setEditingSubcategoryName(subcategoryName);
  };

  const saveEditSubcategory = async () => {
    if (!editingSubcategory || !editingSubcategoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingSubcategory,
        name: editingSubcategoryName.trim(),
        description: '',
        status: 'active'
      });

      // Update local state to reflect color change immediately
      setCategories(prev => prev.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => 
          sub.id === editingSubcategory 
            ? { ...sub, name: editingSubcategoryName.trim(), color: editingSubcategoryColor }
            : sub
        )
      })));

      setEditingSubcategory(null);
      setEditingSubcategoryName('');
      setEditingSubcategoryColor('#6b7280');

      toast({
        title: "Subcategory updated",
        description: "Subcategory name and color have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subcategory",
        variant: "destructive"
      });
    }
  };

  const cancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditingSubcategoryName('');
    setEditingSubcategoryColor('#6b7280');
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  // Start editing subcategory with color
  const startEditSubcategory = (subcategoryId: string, currentName: string, currentColor: string = '#6b7280') => {
    setEditingSubcategory(subcategoryId);
    setEditingSubcategoryName(currentName);
    setEditingSubcategoryColor(currentColor);
  };

  // Sub-subcategory management functions
  const startAddSubSubcategory = (subcategoryId: string) => {
    setAddingSubSubcategoryTo(subcategoryId);
    setNewSubSubcategoryForSubcategory('');
  };

  const cancelAddSubSubcategory = () => {
    setAddingSubSubcategoryTo(null);
    setNewSubSubcategoryForSubcategory('');
  };

  const addSubSubcategoryToSubcategory = async () => {
    if (!addingSubSubcategoryTo || !newSubSubcategoryForSubcategory.trim()) return;

    try {
      const subSubcategoryData = {
        name: newSubSubcategoryForSubcategory.trim(),
        description: '',
        parentId: parseInt(addingSubSubcategoryTo),
        status: 'active'
      };

      await createCategoryMutation.mutateAsync(subSubcategoryData);
      
      cancelAddSubSubcategory();
      toast({
        title: "Success",
        description: "Sub-subcategory created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-subcategory",
        variant: "destructive",
      });
    }
  };

  const startEditSubSubcategory = (subSubcategoryId: string, currentName: string, currentColor: string = '#9ca3af') => {
    setEditingSubSubcategory(subSubcategoryId);
    setEditingSubSubcategoryName(currentName);
    setEditingSubSubcategoryColor(currentColor);
  };

  const saveEditSubSubcategory = async () => {
    if (!editingSubSubcategory || !editingSubSubcategoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingSubSubcategory,
        name: editingSubSubcategoryName.trim(),
        description: '',
        status: 'active'
      });

      // Update local state to reflect color change immediately
      setCategories(prev => prev.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => ({
          ...sub,
          subSubcategories: sub.subSubcategories?.map(subSub => 
            subSub.id === editingSubSubcategory 
              ? { ...subSub, name: editingSubSubcategoryName.trim(), color: editingSubSubcategoryColor }
              : subSub
          )
        }))
      })));

      setEditingSubSubcategory(null);
      setEditingSubSubcategoryName('');
      setEditingSubSubcategoryColor('#9ca3af');

      toast({
        title: "Sub-subcategory updated",
        description: "Sub-subcategory name and color have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-subcategory",
        variant: "destructive"
      });
    }
  };

  const cancelEditSubSubcategory = () => {
    setEditingSubSubcategory(null);
    setEditingSubSubcategoryName('');
    setEditingSubSubcategoryColor('#9ca3af');
  };

  const deleteSubSubcategory = async (subSubcategoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(subSubcategoryId);

      toast({
        title: "Sub-subcategory deleted",
        description: "Sub-subcategory has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sub-subcategory",
        variant: "destructive"
      });
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
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

  // Start editing category
  const startEditCategory = (categoryId: string, currentName: string, currentColor: string = '#3b82f6') => {
    setEditingCategory(categoryId);
    setEditingCategoryName(currentName);
    setEditingCategoryColor(currentColor);
  };

  // Start adding subcategory to specific category
  const startAddSubcategory = (categoryId: string) => {
    setAddingSubcategoryTo(categoryId);
    setNewSubcategoryForCategory('');
  };

  // Cancel adding subcategory
  const cancelAddSubcategory = () => {
    setAddingSubcategoryTo(null);
    setNewSubcategoryForCategory('');
  };

  // Add subcategory to specific category
  const addSubcategoryToCategory = async () => {
    if (!addingSubcategoryTo || !newSubcategoryForCategory.trim()) return;

    try {
      const subcategoryData = {
        name: newSubcategoryForCategory.trim(),
        description: '',
        parentId: parseInt(addingSubcategoryTo),
        status: 'active'
      };

      await createCategoryMutation.mutateAsync(subcategoryData);
      
      cancelAddSubcategory();
      toast({
        title: "Success",
        description: "Subcategory created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive",
      });
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(subcategoryId);

      toast({
        title: "Subcategory deleted",
        description: "Subcategory has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive"
      });
    }
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-sm text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Create New Category - Top Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Category
          </CardTitle>
          <p className="text-sm text-gray-600">Add main categories for your products</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              ref={categoryInputRef}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={handleCategoryKeyPress}
              placeholder="e.g. Life Insurance"
              className="flex-1"
            />
            <Button
              onClick={addCategory}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Management - Collapsible Tag Style Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Category Management
          </CardTitle>
          <p className="text-sm text-gray-600">Manage your product categories and subcategories</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No categories created yet</p>
              <p className="text-sm mt-1">Start by adding your first category above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header with Tag */}
                  <div 
                    className={`p-4 cursor-pointer transition-all ${
                      expandedCategories.has(category.id) 
                        ? 'bg-gray-50 border-b border-gray-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {editingCategory === category.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditCategory();
                                } else if (e.key === 'Escape') {
                                  cancelEditCategory();
                                }
                              }}
                              className="text-sm h-8 w-48"
                              autoFocus
                            />
                            {/* Color Picker */}
                            <input
                              type="color"
                              value={editingCategoryColor}
                              onChange={(e) => setEditingCategoryColor(e.target.value)}
                              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                              title="Change color"
                            />
                            <Button
                              onClick={saveEditCategory}
                              size="sm"
                              className="h-8 px-2 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={cancelEditCategory}
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div 
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                              style={{ 
                                backgroundColor: `${category.color}20`,
                                borderColor: category.color,
                                color: category.color
                              }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              {category.subcategories.length} subcategories
                            </Badge>
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {editingCategory !== category.id && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditCategory(category.id, category.name, category.color);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-500 hover:text-gray-700"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCategory(category.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Subcategories */}
                  {expandedCategories.has(category.id) && (
                    <div className="p-4 bg-gray-50 space-y-4">
                      {/* Add Subcategory Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Subcategory
                        </label>
                        {addingSubcategoryTo === category.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={newSubcategoryForCategory}
                              onChange={(e) => setNewSubcategoryForCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addSubcategoryToCategory();
                                } else if (e.key === 'Escape') {
                                  cancelAddSubcategory();
                                }
                              }}
                              placeholder="Subcategory name"
                              className="flex-1 h-8"
                              autoFocus
                            />
                            <Button
                              onClick={addSubcategoryToCategory}
                              disabled={!newSubcategoryForCategory.trim()}
                              size="sm"
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                            <Button
                              onClick={cancelAddSubcategory}
                              variant="outline"
                              size="sm"
                              className="h-8 px-3"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => startAddSubcategory(category.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Subcategory
                          </Button>
                        )}
                      </div>

                      {/* Subcategories - Collapsible with Third Level */}
                      {category.subcategories.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Subcategories ({category.subcategories.length})
                          </label>
                          <div className="space-y-2">
                            {category.subcategories.map((sub) => (
                              <div key={sub.id} className="border border-gray-100 rounded-md overflow-hidden">
                                {/* Subcategory Header */}
                                <div 
                                  className={`p-3 cursor-pointer transition-all ${
                                    expandedSubcategories.has(sub.id) 
                                      ? 'bg-gray-25 border-b border-gray-100' 
                                      : 'hover:bg-gray-25'
                                  }`}
                                  onClick={() => toggleSubcategory(sub.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {editingSubcategory === sub.id ? (
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                          <Input
                                            value={editingSubcategoryName}
                                            onChange={(e) => setEditingSubcategoryName(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                saveEditSubcategory();
                                              } else if (e.key === 'Escape') {
                                                cancelEditSubcategory();
                                              }
                                            }}
                                            className="text-sm h-7 w-32"
                                            autoFocus
                                          />
                                          <input
                                            type="color"
                                            value={editingSubcategoryColor}
                                            onChange={(e) => setEditingSubcategoryColor(e.target.value)}
                                            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                            title="Change color"
                                          />
                                          <Button
                                            onClick={saveEditSubcategory}
                                            size="sm"
                                            className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            onClick={cancelEditSubcategory}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <div 
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                                            style={{ 
                                              backgroundColor: `${sub.color || '#6b7280'}15`,
                                              borderColor: sub.color || '#6b7280',
                                              color: sub.color || '#6b7280'
                                            }}
                                          >
                                            <div 
                                              className="w-1.5 h-1.5 rounded-full"
                                              style={{ backgroundColor: sub.color || '#6b7280' }}
                                            />
                                            {sub.name}
                                          </div>
                                          <Badge variant="outline" className="bg-gray-50 text-gray-500 text-xs">
                                            {sub.subSubcategories?.length || 0} items
                                          </Badge>
                                          {expandedSubcategories.has(sub.id) ? (
                                            <ChevronDown className="h-3 w-3 text-gray-400" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-gray-400" />
                                          )}
                                        </>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      {editingSubcategory !== sub.id && (
                                        <>
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditSubcategory(sub.id, sub.name, sub.color);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-1 text-gray-400 hover:text-gray-600"
                                          >
                                            <Edit2 className="h-2.5 w-2.5" />
                                          </Button>
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteSubcategory(sub.id);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-1 text-red-400 hover:text-red-600"
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Sub-subcategories Section */}
                                {expandedSubcategories.has(sub.id) && (
                                  <div className="p-3 bg-gray-25 space-y-3">
                                    {/* Add Sub-subcategory */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Add Sub-item
                                      </label>
                                      {addingSubSubcategoryTo === sub.id ? (
                                        <div className="flex gap-2">
                                          <Input
                                            value={newSubSubcategoryForSubcategory}
                                            onChange={(e) => setNewSubSubcategoryForSubcategory(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                addSubSubcategoryToSubcategory();
                                              } else if (e.key === 'Escape') {
                                                cancelAddSubSubcategory();
                                              }
                                            }}
                                            placeholder="Sub-item name"
                                            className="flex-1 h-7 text-sm"
                                            autoFocus
                                          />
                                          <Button
                                            onClick={addSubSubcategoryToSubcategory}
                                            disabled={!newSubSubcategoryForSubcategory.trim()}
                                            size="sm"
                                            className="h-7 px-2 bg-blue-600 hover:bg-blue-700"
                                          >
                                            <Check className="h-2.5 w-2.5 mr-1" />
                                            Add
                                          </Button>
                                          <Button
                                            onClick={cancelAddSubSubcategory}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          onClick={() => startAddSubSubcategory(sub.id)}
                                          variant="outline"
                                          size="sm"
                                          className="h-7 px-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                          <Plus className="h-2.5 w-2.5 mr-1" />
                                          Add Sub-item
                                        </Button>
                                      )}
                                    </div>

                                    {/* Sub-subcategories as Small Tags */}
                                    {sub.subSubcategories && sub.subSubcategories.length > 0 && (
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                          Sub-items ({sub.subSubcategories.length})
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                          {sub.subSubcategories.map((subSub) => (
                                            <div key={subSub.id} className="flex items-center gap-1">
                                              {editingSubSubcategory === subSub.id ? (
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    value={editingSubSubcategoryName}
                                                    onChange={(e) => setEditingSubSubcategoryName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        saveEditSubSubcategory();
                                                      } else if (e.key === 'Escape') {
                                                        cancelEditSubSubcategory();
                                                      }
                                                    }}
                                                    className="text-xs h-6 w-28"
                                                    autoFocus
                                                  />
                                                  <input
                                                    type="color"
                                                    value={editingSubSubcategoryColor}
                                                    onChange={(e) => setEditingSubSubcategoryColor(e.target.value)}
                                                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                                                    title="Change color"
                                                  />
                                                  <Button
                                                    onClick={saveEditSubSubcategory}
                                                    size="sm"
                                                    className="h-6 px-1 bg-green-600 hover:bg-green-700"
                                                  >
                                                    <Check className="h-2 w-2" />
                                                  </Button>
                                                  <Button
                                                    onClick={cancelEditSubSubcategory}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 px-1"
                                                  >
                                                    <X className="h-2 w-2" />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="group flex items-center gap-0.5">
                                                  <div 
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors"
                                                    style={{ 
                                                      backgroundColor: `${subSub.color || '#9ca3af'}10`,
                                                      borderColor: subSub.color || '#9ca3af',
                                                      color: subSub.color || '#9ca3af'
                                                    }}
                                                  >
                                                    <div 
                                                      className="w-1 h-1 rounded-full mr-1.5"
                                                      style={{ backgroundColor: subSub.color || '#9ca3af' }}
                                                    />
                                                    {subSub.name}
                                                  </div>
                                                  <Button
                                                    onClick={() => startEditSubSubcategory(subSub.id, subSub.name, subSub.color)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                                                  >
                                                    <Edit2 className="h-2 w-2" />
                                                  </Button>
                                                  <Button
                                                    onClick={() => deleteSubSubcategory(subSub.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                  >
                                                    <Trash2 className="h-2 w-2" />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}