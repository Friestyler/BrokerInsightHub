import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ProductMappingStepProps {
  onNext: (categories: Category[]) => void;
  onBack: () => void;
  initialCategories?: Category[];
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

export default function ProductMappingStep({ onNext, onBack, initialCategories = [] }: ProductMappingStepProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const { toast } = useToast();
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const subcategoryInputRef = useRef<HTMLInputElement>(null);

  const getNextColor = () => {
    return COLORS[categories.length % COLORS.length];
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

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
  };

  const addSubcategory = () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;

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

  const handleNext = () => {
    if (categories.length === 0) {
      toast({
        title: "Categories required",
        description: "Please create at least one category before proceeding",
        variant: "destructive"
      });
      return;
    }
    onNext(categories);
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories Setup</h1>
          <p className="text-gray-600 mt-1">Create main categories and subcategories for your products</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={categories.length === 0}
            className="flex items-center gap-2"
          >
            Next: Product Mapping
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
                    disabled={!newCategoryName.trim()}
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
                      disabled={!newSubcategoryName.trim()}
                      size="icon"
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {!selectedCategory && categories.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Select a main category from the overview to add subcategories
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Category Overview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categorie Overzicht</CardTitle>
              <p className="text-sm text-gray-600">Uw aangemaakte categorieën en subcategorieën</p>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No categories created yet</p>
                  <p className="text-xs mt-1">Create your first main category to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => selectCategory(category.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                        selectedCategoryId === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${category.color} border`}>
                            {category.name}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {category.subcategories.length} subcategorieën
                        </span>
                      </div>
                      
                      {category.subcategories.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.map((sub) => (
                              <Badge
                                key={sub.id}
                                variant="outline"
                                className="text-xs bg-gray-50"
                              >
                                {sub.name}
                              </Badge>
                            ))}
                          </div>
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