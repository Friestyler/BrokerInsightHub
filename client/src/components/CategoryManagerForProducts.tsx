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
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Folder className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No categories created yet</p>
              <p className="text-sm mt-1 text-gray-400">Start by adding your first category above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="group">
                  {/* Category Header - Clean Tag Style */}
                  <div 
                    className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                    onClick={() => toggleCategory(category.id)}
                  >
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
                            className="h-7 w-40 text-sm border-0 bg-white shadow-sm"
                            autoFocus
                          />
                          <input
                            type="color"
                            value={editingCategoryColor}
                            onChange={(e) => setEditingCategoryColor(e.target.value)}
                            className="w-7 h-7 border-0 rounded-md cursor-pointer"
                            title="Change color"
                          />
                          <Button
                            onClick={saveEditCategory}
                            size="sm"
                            className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={cancelEditCategory}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 hover:bg-gray-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <div 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                              style={{ 
                                backgroundColor: `${category.color}15`,
                                color: category.color
                              }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 ml-2">
                            {category.subcategories.length} items
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingCategory !== category.id && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditCategory(category.id, category.name, category.color);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                            className="h-7 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Subcategories */}
                  {expandedCategories.has(category.id) && (
                    <div className="ml-6 mt-2 space-y-2">
                      {/* Add Subcategory Section */}
                      <div className="mb-3">
                        {addingSubcategoryTo === category.id ? (
                          <div className="flex gap-2 items-center">
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
                              placeholder="Add subcategory..."
                              className="flex-1 h-7 text-sm border-0 bg-gray-50 focus:bg-white shadow-sm"
                              autoFocus
                            />
                            <Button
                              onClick={addSubcategoryToCategory}
                              disabled={!newSubcategoryForCategory.trim()}
                              size="sm"
                              className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={cancelAddSubcategory}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 hover:bg-gray-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => startAddSubcategory(category.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add subcategory
                          </Button>
                        )}
                      </div>

                      {/* Subcategories List */}
                      {category.subcategories.length > 0 && (
                        <div className="space-y-1">
                          {category.subcategories.map((sub) => (
                            <div key={sub.id} className="group">
                              {/* Subcategory Header */}
                              <div 
                                className="flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-all hover:bg-gray-50"
                                onClick={() => toggleSubcategory(sub.id)}
                              >
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
                                        className="h-6 w-32 text-sm border-0 bg-white shadow-sm"
                                        autoFocus
                                      />
                                      <input
                                        type="color"
                                        value={editingSubcategoryColor}
                                        onChange={(e) => setEditingSubcategoryColor(e.target.value)}
                                        className="w-6 h-6 border-0 rounded cursor-pointer"
                                        title="Change color"
                                      />
                                      <Button
                                        onClick={saveEditSubcategory}
                                        size="sm"
                                        className="h-6 px-1.5 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={cancelEditSubcategory}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-1.5 hover:bg-gray-100"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        {expandedSubcategories.has(sub.id) ? (
                                          <ChevronDown className="h-3 w-3 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-gray-400" />
                                        )}
                                        <div 
                                          className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium"
                                          style={{ 
                                            backgroundColor: `${sub.color || '#6b7280'}10`,
                                            color: sub.color || '#6b7280'
                                          }}
                                        >
                                          <div 
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: sub.color || '#6b7280' }}
                                          />
                                          {sub.name}
                                        </div>
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {sub.subSubcategories?.length || 0}
                                      </span>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {editingSubcategory !== sub.id && (
                                    <>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditSubcategory(sub.id, sub.name, sub.color);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                                        className="h-6 px-1 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-2.5 w-2.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Sub-subcategories Section */}
                              {expandedSubcategories.has(sub.id) && (
                                <div className="ml-6 mt-2 space-y-2">
                                  {/* Add Sub-subcategory */}
                                  <div>
                                    {addingSubSubcategoryTo === sub.id ? (
                                      <div className="flex gap-2 items-center">
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
                                          placeholder="Add sub-item..."
                                          className="flex-1 h-6 text-xs border-0 bg-gray-50 focus:bg-white shadow-sm"
                                          autoFocus
                                        />
                                        <Button
                                          onClick={addSubSubcategoryToSubcategory}
                                          disabled={!newSubSubcategoryForSubcategory.trim()}
                                          size="sm"
                                          className="h-6 px-1.5 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                                        >
                                          <Check className="h-2.5 w-2.5" />
                                        </Button>
                                        <Button
                                          onClick={cancelAddSubSubcategory}
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-1.5 hover:bg-gray-100"
                                        >
                                          <X className="h-2.5 w-2.5" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        onClick={() => startAddSubSubcategory(sub.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                      >
                                        <Plus className="h-2.5 w-2.5 mr-1" />
                                        Add sub-item
                                      </Button>
                                    )}
                                  </div>

                                  {/* Sub-subcategories as Compact Tags */}
                                  {sub.subSubcategories && sub.subSubcategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {sub.subSubcategories.map((subSub) => (
                                        <div key={subSub.id} className="group flex items-center">
                                          {editingSubSubcategory === subSub.id ? (
                                            <div className="flex items-center gap-1.5">
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
                                                className="h-5 w-24 text-xs border-0 bg-white shadow-sm"
                                                autoFocus
                                              />
                                              <input
                                                type="color"
                                                value={editingSubSubcategoryColor}
                                                onChange={(e) => setEditingSubSubcategoryColor(e.target.value)}
                                                className="w-5 h-5 border-0 rounded cursor-pointer"
                                                title="Change color"
                                              />
                                              <Button
                                                onClick={saveEditSubSubcategory}
                                                size="sm"
                                                className="h-5 px-1 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                                              >
                                                <Check className="h-2 w-2" />
                                              </Button>
                                              <Button
                                                onClick={cancelEditSubSubcategory}
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 px-1 hover:bg-gray-100"
                                              >
                                                <X className="h-2 w-2" />
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center">
                                              <div 
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer"
                                                style={{ 
                                                  backgroundColor: `${subSub.color || '#9ca3af'}08`,
                                                  color: subSub.color || '#9ca3af'
                                                }}
                                                onClick={() => startEditSubSubcategory(subSub.id, subSub.name, subSub.color)}
                                              >
                                                <div 
                                                  className="w-1 h-1 rounded-full mr-1"
                                                  style={{ backgroundColor: subSub.color || '#9ca3af' }}
                                                />
                                                {subSub.name}
                                              </div>
                                              <Button
                                                onClick={() => deleteSubSubcategory(subSub.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 px-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                              >
                                                <X className="h-2 w-2" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
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