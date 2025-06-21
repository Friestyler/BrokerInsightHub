import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, FolderOpen, FileText, CheckCircle } from 'lucide-react';

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

// Mock detected products - in real implementation this would come from CSV analysis
const getDetectedProducts = (file?: File | null): Product[] => {
  return [
    { id: 'AUTO_001', name: 'Autoverzekering WA', recordCount: 1250 },
    { id: 'AUTO_002', name: 'Autoverzekering Casco', recordCount: 890 },
    { id: 'HOME_001', name: 'Woonverzekering Basis', recordCount: 1680 },
    { id: 'HOME_002', name: 'Woonverzekering Premium', recordCount: 420 },
    { id: 'LIFE_001', name: 'Levensverzekering Term', recordCount: 650 },
    { id: 'LIFE_002', name: 'Levensverzekering Whole', recordCount: 330 }
  ];
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
  const [products] = useState<Product[]>(getDetectedProducts(uploadedFile));
  const [productMappings, setProductMappings] = useState<Record<string, ProductMapping>>({});

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Mapping</h2>
          <p className="text-gray-600 mt-1">Wijs elk gedetecteerd product toe aan een categorie of subcategorie</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Gedetecteerde Producten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product) => {
            const mapping = productMappings[product.id];
            const isAssigned = !!mapping;
            
            return (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{product.id}</span>
                        <span>•</span>
                        <span>{product.recordCount.toLocaleString()} records</span>
                      </div>
                    </div>
                    
                    {isAssigned && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {getCategoryName(mapping, categories)}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer categorie..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <div key={category.id}>
                          {/* Main Category Option */}
                          <SelectItem 
                            value={`category:${category.id}`}
                            className="font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-blue-500" />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                          
                          {/* Subcategory Options */}
                          {category.subcategories.map((subcategory) => (
                            <SelectItem 
                              key={subcategory.id}
                              value={`subcategory:${subcategory.id}`}
                              className="pl-8"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span>{category.name} &gt; {subcategory.name}</span>
                              </div>
                            </SelectItem>
                          ))}
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
            Wijs ten minste één product toe aan een categorie om door te gaan naar de volgende stap.
          </p>
        </div>
      )}
    </div>
  );
}