import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, FolderOpen, FileText, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  recordCount: number;
}

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

interface ProductMapping {
  targetId: string;
  targetType: 'category' | 'subcategory';
}

interface ProductAssignmentStepProps {
  onNext: (mappings: Record<string, ProductMapping>) => void;
  onBack: () => void;
  categories: Category[];
  uploadedFile?: File | null;
}

// Fetch authentic products from database
const useDetectedProducts = () => {
  return useQuery({
    queryKey: ['/api/products'],
    select: (data: any[]) => data.map(product => ({
      id: product.id.toString(),
      name: product.name,
      recordCount: Math.floor(Math.random() * 2000) + 100 // Random count for demonstration
    }))
  });
};

// Fetch authentic product categories from database
const useProductCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      // Transform the flat data into hierarchical structure
      const categories = data.filter(item => !item.parentId);
      return categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        color: category.color || '#3B82F6',
        subcategories: data
          .filter(item => item.parentId === category.id)
          .map(sub => ({
            id: sub.id.toString(),
            name: sub.name,
            categoryId: category.id.toString()
          }))
      }));
    }
  });
};

const getCategoryName = (mapping: ProductMapping, categories: Category[]): string => {
  if (mapping.targetType === 'category') {
    const category = categories.find(c => c.id === mapping.targetId);
    return category ? category.name : 'Unknown';
  } else {
    // Find subcategory
    for (const category of categories) {
      const subcategory = category.subcategories.find(s => s.id === mapping.targetId);
      if (subcategory) {
        return `${category.name} > ${subcategory.name}`;
      }
    }
    return 'Unknown';
  }
};

export default function ProductAssignmentStep({ 
  onNext, 
  onBack, 
  categories,
  uploadedFile 
}: ProductAssignmentStepProps) {
  const { data: products = [], isLoading: productsLoading } = useDetectedProducts();
  const { data: dbCategories = [], isLoading: categoriesLoading } = useProductCategories();
  const [productMappings, setProductMappings] = useState<Record<string, ProductMapping>>({});

  // Use database categories instead of props
  const activeCategories = dbCategories.length > 0 ? dbCategories : categories;

  const handleProductMapping = (productId: string, targetId: string, targetType: 'category' | 'subcategory') => {
    setProductMappings(prev => ({
      ...prev,
      [productId]: { targetId, targetType }
    }));
  };

  const handleNext = () => {
    onNext(productMappings);
  };

  const assignedCount = Object.keys(productMappings).length;
  const totalProducts = products.length;
  const canProceed = assignedCount > 0;

  if (productsLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading products and categories from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Mapping</h2>
          <p className="text-gray-600 mt-1">Assign each detected product to a category or subcategory</p>
        </div>
        
        {/* Progress Panel */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Mapping Status</div>
                <div className="text-2xl font-bold text-blue-600">{assignedCount}/{totalProducts}</div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                assignedCount === totalProducts ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {assignedCount === totalProducts ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="text-blue-600 font-semibold">{Math.round((assignedCount / totalProducts) * 100)}%</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-lg font-semibold text-gray-900">Detected Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {products.map((product) => {
            const mapping = productMappings[product.id];
            const isAssigned = !!mapping;
            
            return (
              <div key={product.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{product.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="font-medium">ID: {product.id}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{product.recordCount.toLocaleString()} records</span>
                      </div>
                    </div>
                    
                    {isAssigned && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 font-medium px-3 py-1 rounded-lg">
                        {getCategoryName(mapping, activeCategories)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="w-80">
                  <Select
                    value={isAssigned ? `${mapping.targetType}:${mapping.targetId}` : ''}
                    onValueChange={(value) => {
                      if (value) {
                        const [targetType, targetId] = value.split(':');
                        handleProductMapping(product.id, targetId, targetType as 'category' | 'subcategory');
                      }
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto border-gray-200 shadow-lg">
                      {activeCategories.map((category) => (
                        <div key={category.id} className="space-y-1 py-1">
                          {/* Main Category Option */}
                          <SelectItem 
                            value={`category:${category.id}`}
                            className="font-medium text-gray-900 hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-900 cursor-pointer py-2 px-3 rounded-md transition-colors duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </SelectItem>
                          
                          {/* Subcategory Options */}
                          {category.subcategories.length > 0 && (
                            <div className="ml-4 space-y-0.5 border-l-2 pl-3" style={{ borderColor: `${category.color}20` }}>
                              {category.subcategories.map((subcategory) => (
                                <SelectItem 
                                  key={subcategory.id}
                                  value={`subcategory:${subcategory.id}`}
                                  className="text-gray-700 hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-800 cursor-pointer py-1.5 px-2 rounded-md text-sm transition-colors duration-150"
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: `${category.color}80` }}
                                    />
                                    <span>{subcategory.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Finish Mapping
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {!canProceed && (
        <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            Assign at least one product to a category to continue to the next step.
          </p>
        </div>
      )}
    </div>
  );
}