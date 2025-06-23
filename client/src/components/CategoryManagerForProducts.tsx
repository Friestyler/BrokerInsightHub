import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit2, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';

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
  subcategories?: Subcategory[];
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Motor Insurance',
    color: '#3E4DC4',
    subcategories: [
      { 
        id: '1-1', 
        name: 'Car Insurance', 
        categoryId: '1',
        subcategories: [
          { id: '1-1-1', name: 'Comprehensive', categoryId: '1', subcategories: [] },
          { id: '1-1-2', name: 'Third Party', categoryId: '1', subcategories: [] },
          { id: '1-1-3', name: 'Fire & Theft', categoryId: '1', subcategories: [] }
        ]
      },
      { 
        id: '1-2', 
        name: 'Motorcycle Insurance', 
        categoryId: '1',
        subcategories: [
          { id: '1-2-1', name: 'Sport Bikes', categoryId: '1', subcategories: [] },
          { id: '1-2-2', name: 'Cruisers', categoryId: '1', subcategories: [] }
        ]
      },
      { id: '1-3', name: 'Commercial Vehicle', categoryId: '1', subcategories: [] }
    ]
  },
  {
    id: '2',
    name: 'Property Insurance',
    color: '#5567E5',
    subcategories: [
      { 
        id: '2-1', 
        name: 'Home Insurance', 
        categoryId: '2',
        subcategories: [
          { id: '2-1-1', name: 'Buildings Cover', categoryId: '2', subcategories: [] },
          { id: '2-1-2', name: 'Contents Cover', categoryId: '2', subcategories: [] }
        ]
      },
      { id: '2-2', name: 'Contents Insurance', categoryId: '2', subcategories: [] },
      { id: '2-3', name: 'Commercial Property', categoryId: '2', subcategories: [] }
    ]
  },
  {
    id: '3',
    name: 'Life Insurance',
    color: '#6366F1',
    subcategories: [
      { id: '3-1', name: 'Term Life', categoryId: '3', subcategories: [] },
      { id: '3-2', name: 'Whole Life', categoryId: '3', subcategories: [] },
      { id: '3-3', name: 'Critical Illness', categoryId: '3', subcategories: [] }
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
  const [newSubcategory, setNewSubcategory] = useState<{ categoryId: string; parentId?: string; name: string } | null>(null);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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

  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const addSubcategory = (categoryId: string, name: string, parentId?: string) => {
    if (!name.trim()) return;
    
    const newSub: Subcategory = {
      id: `${categoryId}-${Date.now()}`,
      name: name,
      categoryId: categoryId,
      subcategories: []
    };
    
    if (parentId) {
      // Add to nested subcategory
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          const updateSubcategories = (subs: Subcategory[]): Subcategory[] => {
            return subs.map(sub => {
              if (sub.id === parentId) {
                return { ...sub, subcategories: [...(sub.subcategories || []), newSub] };
              }
              return { ...sub, subcategories: updateSubcategories(sub.subcategories || []) };
            });
          };
          return { ...cat, subcategories: updateSubcategories(cat.subcategories) };
        }
        return cat;
      }));
    } else {
      // Add to main category
      setCategories(categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subcategories: [...cat.subcategories, newSub] }
          : cat
      ));
    }
    
    setNewSubcategory(null);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const removeSubcategory = (subs: Subcategory[]): Subcategory[] => {
          return subs.filter(sub => sub.id !== subcategoryId).map(sub => ({
            ...sub,
            subcategories: removeSubcategory(sub.subcategories || [])
          }));
        };
        return { ...cat, subcategories: removeSubcategory(cat.subcategories) };
      }
      return cat;
    }));
  };

  // Recursive component for rendering nested subcategories
  const SubcategoryRenderer = ({ 
    subcategory, 
    categoryId, 
    level = 0 
  }: { 
    subcategory: Subcategory; 
    categoryId: string; 
    level?: number; 
  }) => {
    const hasSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
    const isExpanded = expandedSubcategories.has(subcategory.id);
    const isAddingSubcategory = newSubcategory?.parentId === subcategory.id;

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className={`flex items-center justify-between p-2 rounded text-sm ${
          level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-gray-100' : 'bg-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            {hasSubcategories ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleSubcategoryExpansion(subcategory.id)}
                className="h-5 w-5 p-0 hover:bg-blue-100"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-blue-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-blue-600" />
                )}
              </Button>
            ) : (
              <div className="w-5 h-5" /> // Spacer to maintain alignment
            )}
            <span className={hasSubcategories ? 'font-medium' : ''}>{subcategory.name}</span>
            {hasSubcategories && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {subcategory.subcategories?.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNewSubcategory({ 
                categoryId, 
                parentId: subcategory.id, 
                name: '' 
              })}
              className="h-6 w-6 p-0 hover:bg-blue-100 hover:border-blue-200 border border-transparent"
              title={`Add subcategory under "${subcategory.name}"`}
            >
              <Plus className="h-3 w-3 text-blue-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteSubcategory(categoryId, subcategory.id)}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Add Subcategory Input */}
        {isAddingSubcategory && (
          <div className={`flex gap-2 mt-2 ${level > 0 ? 'ml-4' : ''}`}>
            <Input
              placeholder="Subcategory name"
              value={newSubcategory.name}
              onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSubcategory(categoryId, newSubcategory.name, subcategory.id);
                }
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={() => addSubcategory(categoryId, newSubcategory.name, subcategory.id)}
              className="bg-blue-600 hover:bg-blue-700"
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
        )}

        {/* Nested Subcategories */}
        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            {hasSubcategories && (
              <div className="mt-2 space-y-2">
                {subcategory.subcategories!.map((nestedSub) => (
                  <SubcategoryRenderer
                    key={nestedSub.id}
                    subcategory={nestedSub}
                    categoryId={categoryId}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
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
                  <SubcategoryRenderer
                    key={sub.id}
                    subcategory={sub}
                    categoryId={category.id}
                    level={0}
                  />
                ))}
                
                {/* Add Main Subcategory */}
                {newSubcategory?.categoryId === category.id && !newSubcategory.parentId ? (
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
                      className="bg-blue-600 hover:bg-blue-700"
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
                    className="w-full text-sm border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
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