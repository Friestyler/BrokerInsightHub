import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X, Check } from 'lucide-react';
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
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newSubcategoryForCategory, setNewSubcategoryForCategory] = useState('');
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
            color: COLORS[index % COLORS.length],
            subcategories: []
          };
          
          // Add subcategories from children array
          if (dbCat.children && Array.isArray(dbCat.children)) {
            dbCat.children.forEach((child: any) => {
              category.subcategories.push({
                id: child.id.toString(),
                name: child.name,
                categoryId: dbCat.id.toString()
              });
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

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const startEditingCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditingCategoryName(currentName);
    setNewCategoryName(currentName);
    categoryInputRef.current?.focus();
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
          ? { ...cat, name: editingCategoryName.trim() }
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
        name: editingSubcategoryName.trim()
      });

      setEditingSubcategory(null);
      setEditingSubcategoryName('');

      toast({
        title: "Subcategory updated",
        description: "Subcategory name has been updated",
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
  const startEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditingCategoryName(currentName);
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
        parent_id: parseInt(addingSubcategoryTo),
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Category Creation Only */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Category</CardTitle>
              <p className="text-sm text-gray-600">Add main categories for your products</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <div className="flex gap-2">
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
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  After creating a category, click on it in the overview to add subcategories and manage details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Interactive Category Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <p className="text-sm text-gray-600">Click on categories to expand and edit them</p>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No categories created yet</p>
                  <p className="text-sm mt-1">Start by adding a main category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Category Header */}
                      <div 
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                          expandedCategories.has(category.id) ? 'bg-blue-50 border-b border-gray-200' : ''
                        }`}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {editingCategory === category.id ? (
                              <div className="flex items-center gap-2">
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
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveEditCategory();
                                  }}
                                  className="h-8 px-2"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEditCategory();
                                  }}
                                  className="h-8 px-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Badge 
                                  style={{ backgroundColor: category.color }}
                                  className="text-white text-sm px-3 py-1"
                                >
                                  {category.name}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {category.subcategories.length} subcategories
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {editingCategory !== category.id && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditCategory(category.id, category.name);
                                  }}
                                  className="h-8 px-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCategory(category.id);
                                  }}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Category Content */}
                      {expandedCategories.has(category.id) && (
                        <div className="p-4 bg-gray-50">
                          {/* Add Subcategory Section */}
                          <div className="mb-4">
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
                                  placeholder="e.g. Term Life"
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button
                                  onClick={addSubcategoryToCategory}
                                  disabled={!newSubcategoryForCategory.trim()}
                                  size="sm"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={cancelAddSubcategory}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => startAddSubcategory(category.id)}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subcategory
                              </Button>
                            )}
                          </div>

                          {/* Subcategories List */}
                          {category.subcategories.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subcategories ({category.subcategories.length})
                              </label>
                              <div className="space-y-2">
                                {category.subcategories.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2"
                                  >
                                    {editingSubcategory === sub.id ? (
                                      <div className="flex items-center gap-2 flex-1">
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
                                          className="text-sm h-8 flex-1"
                                          autoFocus
                                        />
                                        <Button
                                          onClick={saveEditSubcategory}
                                          size="sm"
                                          className="h-8 px-2"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={cancelEditSubcategory}
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-2"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-sm text-gray-700 flex-1">{sub.name}</span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            onClick={() => {
                                              setEditingSubcategory(sub.id);
                                              setEditingSubcategoryName(sub.name);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            onClick={() => deleteSubcategory(sub.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </>
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
      </div>
    </div>
  );
}