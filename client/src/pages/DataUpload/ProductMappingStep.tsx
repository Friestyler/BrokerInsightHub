import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ChevronRight, Search, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  color: string;
  subSubcategories: SubSubcategory[];
}

interface SubSubcategory {
  id: number;
  name: string;
  color: string;
}

interface ProductMapping {
  productId: number;
  categoryId?: number;
  subcategoryId?: number;
  subSubcategoryId?: number;
}

interface ProductMappingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ProductMappingStep({ onNext, onBack }: ProductMappingStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<number>>(new Set());
  const [productMappings, setProductMappings] = useState<Map<number, ProductMapping>>(new Map());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products from database
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    select: (data) => data || []
  });

  // Fetch categories with hierarchy
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/product-categories'],
    select: (data) => {
      const categories: Category[] = [];
      
      data.forEach((dbCat: any) => {
        if (!dbCat.parent_id) {
          const category: Category = {
            id: dbCat.id,
            name: dbCat.name,
            color: dbCat.color || '#6b7280',
            subcategories: []
          };
          
          if (dbCat.subcategories && Array.isArray(dbCat.subcategories)) {
            dbCat.subcategories.forEach((sub: any) => {
              const subcategory: Subcategory = {
                id: sub.id,
                name: sub.name,
                color: sub.color || '#6b7280',
                subSubcategories: []
              };
              
              if (sub.subSubcategories && Array.isArray(sub.subSubcategories)) {
                sub.subSubcategories.forEach((subSub: any) => {
                  subcategory.subSubcategories.push({
                    id: subSub.id,
                    name: subSub.name,
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

  // Filter products based on search and category
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: number) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Handle product mapping
  const handleProductMapping = (productId: number, categoryId?: number, subcategoryId?: number, subSubcategoryId?: number) => {
    const newMappings = new Map(productMappings);
    newMappings.set(productId, {
      productId,
      categoryId,
      subcategoryId,
      subSubcategoryId
    });
    setProductMappings(newMappings);
  };

  // Get mapping status for a product
  const getMappingStatus = (productId: number) => {
    return productMappings.get(productId);
  };

  // Get category path for display
  const getCategoryPath = (mapping: ProductMapping) => {
    if (!mapping.categoryId) return '';
    
    const category = categoriesData.find(c => c.id === mapping.categoryId);
    if (!category) return '';
    
    let path = category.name;
    
    if (mapping.subcategoryId) {
      const subcategory = category.subcategories.find(s => s.id === mapping.subcategoryId);
      if (subcategory) {
        path += ` > ${subcategory.name}`;
        
        if (mapping.subSubcategoryId) {
          const subSubcategory = subcategory.subSubcategories.find(ss => ss.id === mapping.subSubcategoryId);
          if (subSubcategory) {
            path += ` > ${subSubcategory.name}`;
          }
        }
      }
    }
    
    return path;
  };

  const mappedCount = productMappings.size;
  const totalProducts = products.length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Step 4: Product Mapping</h1>
            <p className="text-gray-600">Map your products to insurance categories</p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{mappedCount} of {totalProducts} products mapped</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Products ({filteredProducts.length})
            </CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by current category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {Array.from(new Set(products.map((p: Product) => p.category))).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {productsLoading ? (
                <div className="text-center py-4">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No products found</div>
              ) : (
                filteredProducts.map((product: Product) => {
                  const mapping = getMappingStatus(product.id);
                  const isSelected = !!mapping;
                  
                  return (
                    <div
                      key={product.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {product.category}
                      </div>
                      {mapping && (
                        <div className="text-sm text-green-600 mt-1">
                          Mapped to: {getCategoryPath(mapping)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Categories</CardTitle>
            <p className="text-sm text-gray-600">Select categories to map products</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categoriesLoading ? (
                <div className="text-center py-4">Loading categories...</div>
              ) : (
                categoriesData.map((category: Category) => (
                  <div key={category.id} className="space-y-1">
                    {/* Main Category */}
                    <div
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.subcategories.length > 0 && (
                        expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle direct category mapping
                          const selectedProducts = filteredProducts.filter((p: Product) => 
                            !getMappingStatus(p.id)
                          );
                          if (selectedProducts.length > 0) {
                            handleProductMapping(selectedProducts[0].id, category.id);
                          }
                        }}
                      >
                        Map
                      </Button>
                    </div>

                    {/* Subcategories */}
                    {expandedCategories.has(category.id) && category.subcategories.map((subcategory: Subcategory) => (
                      <div key={subcategory.id} className="ml-6 space-y-1">
                        <div
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleSubcategory(subcategory.id)}
                        >
                          {subcategory.subSubcategories.length > 0 && (
                            expandedSubcategories.has(subcategory.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )
                          )}
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: subcategory.color }}
                          />
                          <span>{subcategory.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              const selectedProducts = filteredProducts.filter((p: Product) => 
                                !getMappingStatus(p.id)
                              );
                              if (selectedProducts.length > 0) {
                                handleProductMapping(selectedProducts[0].id, category.id, subcategory.id);
                              }
                            }}
                          >
                            Map
                          </Button>
                        </div>

                        {/* Sub-subcategories */}
                        {expandedSubcategories.has(subcategory.id) && subcategory.subSubcategories.map((subSubcategory: SubSubcategory) => (
                          <div key={subSubcategory.id} className="ml-6">
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: subSubcategory.color }}
                              />
                              <span>{subSubcategory.name}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-auto h-6 text-xs"
                                onClick={() => {
                                  const selectedProducts = filteredProducts.filter((p: Product) => 
                                    !getMappingStatus(p.id)
                                  );
                                  if (selectedProducts.length > 0) {
                                    handleProductMapping(selectedProducts[0].id, category.id, subcategory.id, subSubcategory.id);
                                  }
                                }}
                              >
                                Map
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous Step
        </Button>
        <Button
          onClick={onNext}
          disabled={mappedCount === 0}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
        >
          Next Step
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}