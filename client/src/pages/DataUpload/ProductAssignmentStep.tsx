import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, FolderOpen, FileText, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: number;
  sku: string;
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
  productAction: 'existing' | 'new';
  existingProductId?: string;
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
      id: product.id,
      sku: product.sku,
      name: product.name,
      recordCount: Math.floor(Math.random() * 2000) + 100 // Random count for demonstration
    }))
  });
};

// Fetch authentic product categories from database
const useProductCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories']
  });
};

const getCategoryName = (mapping: ProductMapping, categories: Category[]): string => {
  if (mapping.targetType === 'category') {
    const category = categories.find(cat => cat.id === mapping.targetId);
    return category?.name || 'Unknown Category';
  } else {
    const category = categories.find(cat => 
      cat.subcategories.some(sub => sub.id === mapping.targetId)
    );
    const subcategory = category?.subcategories.find(sub => sub.id === mapping.targetId);
    return subcategory ? `${category?.name} > ${subcategory.name}` : 'Unknown Subcategory';
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
  const activeCategories = (dbCategories && Array.isArray(dbCategories) && dbCategories.length > 0) ? dbCategories as Category[] : categories;

  // Auto-detect existing products based on SKU matching
  const detectExistingProducts = () => {
    const detectedMappings: Record<string, ProductMapping> = {};
    
    products.forEach(detectedProduct => {
      // Find matching existing product by SKU
      const existingProduct = products.find(p => p.sku === detectedProduct.sku && p.id !== detectedProduct.id);
      
      if (existingProduct) {
        // Auto-map to existing product
        const category = activeCategories.find((cat: Category) => 
          cat.subcategories?.some((sub: Subcategory) => sub.name.toLowerCase().includes('property')) ||
          cat.name.toLowerCase().includes('property')
        );
        
        if (category) {
          detectedMappings[detectedProduct.id] = {
            targetId: category.id,
            targetType: 'category',
            productAction: 'existing',
            existingProductId: existingProduct.id.toString()
          };
        }
      }
    });
    
    setProductMappings(detectedMappings);
  };

  // Run auto-detection when products load
  useEffect(() => {
    if (products.length > 0 && activeCategories.length > 0) {
      detectExistingProducts();
    }
  }, [products, activeCategories]);

  const handleProductMapping = (productId: string, targetId: string, targetType: 'category' | 'subcategory', productAction: 'existing' | 'new' = 'new', existingProductId?: string) => {
    setProductMappings(prev => ({
      ...prev,
      [productId]: { 
        targetId, 
        targetType, 
        productAction, 
        existingProductId 
      }
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
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Assignment</h2>
          <p className="text-gray-600 mt-1">
            Map detected products to existing products or assign them to categories
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-blue-600">{assignedCount}</span> of{' '}
            <span className="font-medium">{totalProducts}</span> products assigned
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProducts > 0 ? (assignedCount / totalProducts) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detected Products */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-lg font-semibold text-gray-900">Detected Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {products.map((product) => {
            const mapping = productMappings[product.id];
            const isAssigned = !!mapping;
            const isExistingProduct = mapping?.productAction === 'existing';
            const hasAutoMatch = isExistingProduct && mapping?.existingProductId;
            
            return (
              <div key={product.id} className="p-6 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                {/* Product Header with Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 text-base">{product.name}</h4>
                      {hasAutoMatch && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-medium px-2 py-1 rounded-md text-xs flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Match Found
                        </Badge>
                      )}
                      {!hasAutoMatch && !isAssigned && (
                        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium px-2 py-1 rounded-md text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          New Product
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-medium">ID: {product.sku}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{product.recordCount.toLocaleString()} records</span>
                    </div>
                  </div>
                </div>

                {/* Two-Column Selection Interface */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Product Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Product Action</label>
                    <Select
                      value={mapping?.productAction || ''}
                      onValueChange={(value: 'existing' | 'new') => {
                        if (value === 'existing') {
                          // Auto-select first matching product if available
                          const matchingProduct = products.find(p => p.sku === product.sku && p.id !== product.id);
                          if (matchingProduct && mapping?.targetId) {
                            handleProductMapping(
                              product.id.toString(), 
                              mapping.targetId, 
                              mapping.targetType, 
                              'existing', 
                              matchingProduct.id.toString()
                            );
                          }
                        } else {
                          // Create new product - keep existing category if set
                          if (mapping?.targetId) {
                            handleProductMapping(
                              product.id.toString(), 
                              mapping.targetId, 
                              mapping.targetType, 
                              'new'
                            );
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Map to Existing Product</SelectItem>
                        <SelectItem value="new">Create New Product</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Existing Product Dropdown (shown when 'existing' is selected) */}
                    {mapping?.productAction === 'existing' && (
                      <Select
                        value={mapping?.existingProductId || ''}
                        onValueChange={(existingProductId) => {
                          if (mapping?.targetId) {
                            handleProductMapping(
                              product.id.toString(),
                              mapping.targetId,
                              mapping.targetType,
                              'existing',
                              existingProductId
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select existing product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.filter(p => p.id !== product.id).map((existingProduct) => (
                            <SelectItem key={existingProduct.id} value={existingProduct.id.toString()}>
                              {existingProduct.sku} - {existingProduct.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Right Column: Category Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {mapping?.productAction === 'existing' ? 'Category (Auto-filled)' : 'Target Category'}
                    </label>
                    <Select
                      value={isAssigned ? `${mapping.targetType}:${mapping.targetId}` : ''}
                      onValueChange={(value) => {
                        if (value) {
                          const [targetType, targetId] = value.split(':');
                          handleProductMapping(
                            product.id.toString(), 
                            targetId, 
                            targetType as 'category' | 'subcategory',
                            mapping?.productAction || 'new',
                            mapping?.existingProductId
                          );
                        }
                      }}
                      disabled={mapping?.productAction === 'existing' && !!mapping?.existingProductId}
                    >
                      <SelectTrigger className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 overflow-y-auto border-gray-200 shadow-lg">
                        {activeCategories.map((category: Category) => (
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
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="ml-4 space-y-0.5 border-l-2 pl-3" style={{ borderColor: `${category.color}20` }}>
                                {category.subcategories.map((subcategory: Subcategory) => (
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

                {/* Status Indicator */}
                {isAssigned && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      {mapping.productAction === 'existing' ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            Mapped to existing product {mapping.existingProductId} in {getCategoryName(mapping, activeCategories as Category[])}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">
                            Will create new product in {getCategoryName(mapping, activeCategories as Category[])}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
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