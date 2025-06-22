import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const subcategoryInputRef = useRef<HTMLInputElement>(null);

  // Load categories from database
  const { data: dbCategories, isLoading } = useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      if (!data || !Array.isArray(data)) return [];
      
      // Transform database categories to local format
      const categoryMap = new Map<string, Category>();
      
      data.forEach((dbCat: any) => {
        if (!dbCat.parentId) {
          // This is a main category
          if (!categoryMap.has(dbCat.id.toString())) {
            categoryMap.set(dbCat.id.toString(), {
              id: dbCat.id.toString(),
              name: dbCat.name,
              color: COLORS[categoryMap.size % COLORS.length],
              subcategories: []
            });
          }
        } else {
          // This is a subcategory
          const parentId = dbCat.parentId.toString();
          if (categoryMap.has(parentId)) {
            categoryMap.get(parentId)!.subcategories.push({
              id: dbCat.id.toString(),
              name: dbCat.name,
              categoryId: parentId
            });
          }
        }
      });
      
      return Array.from(categoryMap.values());
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
      return apiRequest('/api/product-categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return apiRequest(`/api/product-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/product-categories/${id}`, {
        method: 'DELETE'
      });
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
      addCategory();
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
  };

  const saveEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory,
        name: editingCategoryName.trim()
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
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }

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
        {/* Left Column - Category Creation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorieën Aanmaken</CardTitle>
              <p className="text-sm text-gray-600">Maak hoofdcategorieën en subcategorieën aan voor uw producten</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Main Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nieuwe Hoofdcategorie
                </label>
                <div className="flex gap-2">
                  <Input
                    ref={categoryInputRef}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={handleCategoryKeyPress}
                    placeholder="Bijv. Levensverzekeringen"
                    className="flex-1"
                  />
                  <Button
                    onClick={addCategory}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    size="icon"
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subcategory for Selected Category */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategorie voor "{selectedCategory.name}"
                  </label>
                  <div className="flex gap-2">
                    <Input
                      ref={subcategoryInputRef}
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      onKeyPress={handleSubcategoryKeyPress}
                      placeholder="Bijv. Term Life"
                      className="flex-1"
                    />
                    <Button
                      onClick={addSubcategory}
                      disabled={!newSubcategoryName.trim() || createCategoryMutation.isPending}
                      size="icon"
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Category Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorie Overzicht</CardTitle>
              <p className="text-sm text-gray-600">Uw aangemaakte categorieën en subcategorieën</p>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nog geen categorieën aangemaakt</p>
                  <p className="text-sm mt-1">Begin met het toevoegen van een hoofdcategorie</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCategoryId === category.id
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectCategory(category.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {editingCategory === category.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={saveEditCategory}
                              disabled={updateCategoryMutation.isPending}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditCategory}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Badge className={`${category.color} font-medium`}>
                              {category.name}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingCategory(category.id, category.name);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category.id);
                                }}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {category.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category.subcategories.map((subcategory) => (
                            <span
                              key={subcategory.id}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                            >
                              {subcategory.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {category.subcategories.length} subcategorieën
                      </div>
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