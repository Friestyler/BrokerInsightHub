import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

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

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Motor Insurance',
    color: '#3B82F6',
    subcategories: [
      { id: '1-1', name: 'Car Insurance', categoryId: '1' },
      { id: '1-2', name: 'Motorcycle Insurance', categoryId: '1' },
      { id: '1-3', name: 'Commercial Vehicle', categoryId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Property Insurance',
    color: '#10B981',
    subcategories: [
      { id: '2-1', name: 'Home Insurance', categoryId: '2' },
      { id: '2-2', name: 'Contents Insurance', categoryId: '2' },
      { id: '2-3', name: 'Commercial Property', categoryId: '2' }
    ]
  },
  {
    id: '3',
    name: 'Life Insurance',
    color: '#F59E0B',
    subcategories: [
      { id: '3-1', name: 'Term Life', categoryId: '3' },
      { id: '3-2', name: 'Whole Life', categoryId: '3' },
      { id: '3-3', name: 'Critical Illness', categoryId: '3' }
    ]
  }
];

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export default function CategoryManagerForProducts() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newSubcategory, setNewSubcategory] = useState<{ categoryId: string; name: string } | null>(null);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: colors[categories.length % colors.length],
      subcategories: []
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditingCategoryName(category.name);
  };

  const saveEditCategory = () => {
    if (!editingCategoryName.trim()) return;
    
    setCategories(categories.map(cat => 
      cat.id === editingCategory 
        ? { ...cat, name: editingCategoryName }
        : cat
    ));
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const addSubcategory = (categoryId: string, name: string) => {
    if (!name.trim()) return;
    
    const newSub: Subcategory = {
      id: `${categoryId}-${Date.now()}`,
      name: name,
      categoryId: categoryId
    };
    
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSub] }
        : cat
    ));
    setNewSubcategory(null);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
        : cat
    ));
  };

  return (
    <div className="space-y-4">
      {/* Add New Category */}
      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
        />
        <Button onClick={addCategory} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <Card key={category.id} className="shadow-sm">
            <CardContent className="p-4">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={saveEditCategory}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditCategory}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.subcategories.length} subcategories
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => startEditCategory(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Subcategories */}
              <div className="space-y-2">
                {category.subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <span>{sub.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteSubcategory(category.id, sub.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {/* Add Subcategory */}
                {newSubcategory?.categoryId === category.id ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Subcategory name"
                      value={newSubcategory.name}
                      onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSubcategory(category.id, newSubcategory.name);
                        }
                      }}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addSubcategory(category.id, newSubcategory.name)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setNewSubcategory(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewSubcategory({ categoryId: category.id, name: '' })}
                    className="w-full text-sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Subcategory
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No categories yet. Create your first category above.</p>
        </div>
      )}
    </div>
  );
}