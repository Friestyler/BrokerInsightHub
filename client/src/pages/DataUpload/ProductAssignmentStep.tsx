import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FolderOpen, FileText } from 'lucide-react';
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

interface DetectedProduct {
  id: string;
  name: string;
  code: string;
  recordCount: number;
}

interface ProductMapping {
  targetId: string;
  targetType: 'category' | 'subcategory';
  targetName: string;
}

interface ProductAssignmentStepProps {
  categories: Category[];
  detectedProducts: DetectedProduct[];
  onNext: (mappings: Record<string, ProductMapping>) => void;
  onBack: () => void;
  initialMappings?: Record<string, ProductMapping>;
}

export default function ProductAssignmentStep({ 
  categories, 
  detectedProducts, 
  onNext, 
  onBack, 
  initialMappings = {} 
}: ProductAssignmentStepProps) {
  const [productMappings, setProductMappings] = useState<Record<string, ProductMapping>>(initialMappings);
  const { toast } = useToast();

  const handleProductAssignment = (productId: string, targetId: string, targetType: 'category' | 'subcategory') => {
    let targetName = '';
    
    if (targetType === 'category') {
      const category = categories.find(cat => cat.id === targetId);
      targetName = category ? `📁 ${category.name}` : '';
    } else {
      const subcategory = categories
        .flatMap(cat => cat.subcategories)
        .find(sub => sub.id === targetId);
      const parentCategory = categories.find(cat => 
        cat.subcategories.some(sub => sub.id === targetId)
      );
      targetName = subcategory && parentCategory 
        ? `📄 ${parentCategory.name} > ${subcategory.name}` 
        : '';
    }

    setProductMappings(prev => ({
      ...prev,
      [productId]: {
        targetId,
        targetType,
        targetName
      }
    }));

    toast({
      title: "Product assigned",
      description: `Product mapped to ${targetName}`,
    });
  };

  const getMappedCount = () => Object.keys(productMappings).length;
  const getTotalCount = () => detectedProducts.length;
  const getProgressPercentage = () => (getMappedCount() / getTotalCount()) * 100;

  const canProceed = () => getMappedCount() > 0;

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Assignment required",
        description: "Please assign at least one product before proceeding",
        variant: "destructive"
      });
      return;
    }
    onNext(productMappings);
  };

  const getCategoryName = (mapping: ProductMapping) => {
    return mapping.targetName;
  };

  const generateSelectOptions = () => {
    const options: Array<{ value: string; label: string; type: 'category' | 'subcategory' }> = [];

    categories.forEach(category => {
      // Add main category
      options.push({
        value: `category_${category.id}`,
        label: `📁 ${category.name}`,
        type: 'category'
      });

      // Add subcategories
      category.subcategories.forEach(subcategory => {
        options.push({
          value: `subcategory_${subcategory.id}`,
          label: `📄 ${category.name} > ${subcategory.name}`,
          type: 'subcategory'
        });
      });
    });

    return options;
  };

  const selectOptions = generateSelectOptions();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Mapping</h1>
          <p className="text-gray-600 mt-1">Wijs elk gevonden product toe aan een categorie of subcategorie</p>
        </div>
        <div className="flex items-center gap-3">
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
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Next: Variables & Aggregation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product Assignment List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Product Assignment</CardTitle>
              <p className="text-sm text-gray-600">Assign each detected product to the appropriate category</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detectedProducts.map((product) => {
                  const mapping = productMappings[product.id];
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{product.code}</span>
                              <span>•</span>
                              <span>{product.recordCount.toLocaleString()} records</span>
                            </div>
                          </div>
                          {mapping && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-3">
                              {getCategoryName(mapping)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-64">
                        <Select
                          value={mapping ? `${mapping.targetType}_${mapping.targetId}` : ''}
                          onValueChange={(value) => {
                            const [type, id] = value.split('_');
                            handleProductAssignment(
                              product.id,
                              id,
                              type as 'category' | 'subcategory'
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer categorie..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
                
                {detectedProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No products detected</p>
                    <p className="text-xs mt-1">Upload a file with product data to begin mapping</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapping Status Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mapping Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getMappedCount()} of {getTotalCount()}</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Products</span>
                  <span className="text-sm font-medium">{getTotalCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned</span>
                  <span className="text-sm font-medium text-green-600">{getMappedCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-medium text-orange-600">{getTotalCount() - getMappedCount()}</span>
                </div>
              </div>

              {getMappedCount() > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Assignments</h4>
                  <div className="space-y-2">
                    {Object.entries(productMappings).slice(-3).map(([productId, mapping]) => {
                      const product = detectedProducts.find(p => p.id === productId);
                      return (
                        <div key={productId} className="text-xs">
                          <div className="font-medium text-gray-700 truncate">
                            {product?.name}
                          </div>
                          <div className="text-gray-500 truncate">
                            → {getCategoryName(mapping)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}