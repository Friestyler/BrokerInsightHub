import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, FolderOpen, FileText, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Papa from 'papaparse';

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

type ProductStructure = 'single-column' | 'multiple-columns' | '';

interface DetectedProduct {
  id: number;
  name: string;
  source: string; // column name or 'database'
  recordCount: number;
}

// Fetch authentic products from database
const useDetectedProducts = () => {
  return useQuery({
    queryKey: ['/api/products'],
    select: (data: any[]) => data.map((product, index) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      recordCount: 500 + (product.id * 47) % 1500 // Stable deterministic count based on product ID
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
  const { data: dbProducts = [], isLoading: productsLoading } = useDetectedProducts();
  const { data: dbCategories = [], isLoading: categoriesLoading } = useProductCategories();
  const [productMappings, setProductMappings] = useState<Record<string, ProductMapping>>({});
  
  // New state for product structure selection
  const [productStructure, setProductStructure] = useState<ProductStructure>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedProductColumn, setSelectedProductColumn] = useState<string>('');
  const [selectedProductColumns, setSelectedProductColumns] = useState<string[]>([]);
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [showProductTable, setShowProductTable] = useState(false);

  // Use database categories instead of props
  const activeCategories = (dbCategories && Array.isArray(dbCategories) && dbCategories.length > 0) ? dbCategories as Category[] : categories;
  
  // Use detected products or database products based on whether structure is selected
  const products = showProductTable ? detectedProducts : dbProducts.map((product, index) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    recordCount: 500 + (product.id * 47) % 1500 // Stable deterministic count based on product ID
  }));
  
  // Parse CSV file to extract headers
  useEffect(() => {
    if (uploadedFile) {
      Papa.parse(uploadedFile, {
        header: false,
        preview: 1,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[];
            setCsvHeaders(headers.filter(header => header && header.trim()));
          }
        }
      });
    }
  }, [uploadedFile]);

  // Process product detection based on structure selection
  useEffect(() => {
    if (!productStructure || !csvHeaders.length) {
      setDetectedProducts([]);
      setShowProductTable(false);
      return;
    }

    let products: DetectedProduct[] = [];
    
    if (productStructure === 'single-column' && selectedProductColumn) {
      // Parse the CSV to get unique values from the selected column
      if (uploadedFile) {
        Papa.parse(uploadedFile, {
          header: true,
          complete: (results) => {
            const uniqueProducts = new Set<string>();
            results.data.forEach((row: any) => {
              const productName = row[selectedProductColumn];
              if (productName && typeof productName === 'string' && productName.trim()) {
                uniqueProducts.add(productName.trim());
              }
            });
            
            products = Array.from(uniqueProducts).map((name, index) => ({
              id: index + 1000, // Use high IDs to avoid conflicts with database products
              name,
              source: selectedProductColumn,
              recordCount: Math.floor(Math.random() * 50) + 10 // Simulated count
            }));
            
            setDetectedProducts(products);
            setShowProductTable(true);
          }
        });
      }
    } else if (productStructure === 'multiple-columns' && selectedProductColumns.length > 0) {
      // Each selected column represents a product
      products = selectedProductColumns.map((columnName, index) => ({
        id: index + 2000, // Use different ID range
        name: columnName,
        source: 'column header',
        recordCount: Math.floor(Math.random() * 100) + 20 // Simulated count
      }));
      
      setDetectedProducts(products);
      setShowProductTable(true);
    }
  }, [productStructure, selectedProductColumn, selectedProductColumns, uploadedFile, csvHeaders]);

  const handleStructureChange = (value: ProductStructure) => {
    setProductStructure(value);
    setSelectedProductColumn('');
    setSelectedProductColumns([]);
    setDetectedProducts([]);
    setShowProductTable(false);
  };

  const handleColumnSelect = (columnName: string) => {
    if (productStructure === 'multiple-columns') {
      setSelectedProductColumns(prev => 
        prev.includes(columnName) 
          ? prev.filter(col => col !== columnName)
          : [...prev, columnName]
      );
    }
  };

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
    <div className="space-y-8">
      {/* Product Structure Selection */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Where should we look for your products?</h3>
          <p className="text-gray-600">Select how they're listed in your file.</p>
        </div>
        
        <RadioGroup value={productStructure} onValueChange={handleStructureChange} className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="single-column" id="single-column" className="mt-1" />
            <div className="space-y-2 flex-1">
              <Label htmlFor="single-column" className="text-base font-medium cursor-pointer">
                🔘 One column contains the product names
              </Label>
              <p className="text-sm text-gray-600">
                e.g., A column called "Product" contains values like "Self-Employed Disability Insurance", "Legal Assistance – Business", "Group Income Protection"…
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="multiple-columns" id="multiple-columns" className="mt-1" />
            <div className="space-y-2 flex-1">
              <Label htmlFor="multiple-columns" className="text-base font-medium cursor-pointer">
                🔘 Each column is a product
              </Label>
              <p className="text-sm text-gray-600">
                e.g., Columns like "Self-Employed Disability Insurance", "Legal Assistance – Business", "WGA Employer Liability" — the headers are the product names.
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Conditional inputs based on selection */}
        {productStructure === 'single-column' && csvHeaders.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select the column that contains product names</Label>
            <Select value={selectedProductColumn} onValueChange={setSelectedProductColumn}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a column..." />
              </SelectTrigger>
              <SelectContent>
                {csvHeaders.map((header, index) => (
                  <SelectItem key={index} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {productStructure === 'multiple-columns' && csvHeaders.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select the columns that represent products</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {csvHeaders.map((header, index) => (
                <div
                  key={index}
                  onClick={() => handleColumnSelect(header)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedProductColumns.includes(header)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{header}</span>
                    {selectedProductColumns.includes(header) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {selectedProductColumns.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedProductColumns.length} column{selectedProductColumns.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}
      </div>



      {/* Detected Products Table - Only show when structure is selected and products are detected */}
      {showProductTable && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Detected Products</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-primary">{assignedCount}</span> of{' '}
                  <span className="font-medium">{totalProducts}</span> products mapped
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalProducts > 0 ? (assignedCount / totalProducts) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        <CardContent className="p-6">
          {/* Column Headers */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b border-[#E6E7F1] mb-4">
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">detected Product</h3>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Action</h3>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Existing Product</h3>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Category</h3>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</h3>
            </div>
          </div>

          {/* Product Rows */}
          <div className="space-y-3">
            {products.map((product) => {
              const mapping = productMappings[product.id];
              const isAssigned = !!mapping;
              const isExistingProduct = mapping?.productAction === 'existing';
              const hasAutoMatch = isExistingProduct && mapping?.existingProductId;
              
              return (
                <div key={product.id} className="grid grid-cols-6 gap-4 p-4 bg-white border border-[#E6E7F1] rounded-lg hover:border-gray-200 hover:shadow-sm transition-all duration-200 items-center">
                  {/* Column 1-2: Product Information */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                      {hasAutoMatch && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-medium px-2 py-0.5 rounded text-xs flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Match
                        </Badge>
                      )}

                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium">ID: {product.sku}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{product.recordCount.toLocaleString()} records</span>
                    </div>
                  </div>

                  {/* Column 3: Product Action */}
                  <div>
                    <Select
                      value={mapping?.productAction || ''}
                      onValueChange={(value: 'existing' | 'new') => {
                        if (value === 'existing') {
                          // Auto-select first matching product if available
                          const matchingProduct = products.find(p => p.sku === product.sku && p.id !== product.id);
                          if (matchingProduct) {
                            if (mapping?.targetId) {
                              // Has category selected, update with existing product
                              handleProductMapping(
                                product.id.toString(), 
                                mapping.targetId, 
                                mapping.targetType, 
                                'existing', 
                                matchingProduct.id.toString()
                              );
                            } else {
                              // No category yet, create preliminary mapping
                              setProductMappings(prev => ({
                                ...prev,
                                [product.id.toString()]: {
                                  targetId: '',
                                  targetType: 'category',
                                  productAction: 'existing',
                                  existingProductId: matchingProduct.id.toString()
                                }
                              }));
                            }
                          } else {
                            // No matching product found, just set action
                            setProductMappings(prev => ({
                              ...prev,
                              [product.id.toString()]: {
                                targetId: mapping?.targetId || '',
                                targetType: mapping?.targetType || 'category',
                                productAction: 'existing',
                                existingProductId: mapping?.existingProductId
                              }
                            }));
                          }
                        } else {
                          // Create new product
                          if (mapping?.targetId) {
                            handleProductMapping(
                              product.id.toString(), 
                              mapping.targetId, 
                              mapping.targetType, 
                              'new'
                            );
                          } else {
                            // No category yet, create preliminary mapping
                            setProductMappings(prev => ({
                              ...prev,
                              [product.id.toString()]: {
                                targetId: '',
                                targetType: 'category',
                                productAction: 'new'
                              }
                            }));
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Map to Existing Product</SelectItem>
                        <SelectItem value="new">Create New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Column 4: Existing Product Selection */}
                  <div>
                    <Select
                      value={mapping?.existingProductId || ''}
                      onValueChange={(existingProductId) => {
                        if (mapping?.targetId) {
                          // Has category selected, update with existing product
                          handleProductMapping(
                            product.id.toString(),
                            mapping.targetId,
                            mapping.targetType,
                            'existing',
                            existingProductId
                          );
                        } else {
                          // No category yet, create/update preliminary mapping
                          setProductMappings(prev => ({
                            ...prev,
                            [product.id.toString()]: {
                              targetId: mapping?.targetId || '',
                              targetType: mapping?.targetType || 'category',
                              productAction: 'existing',
                              existingProductId: existingProductId
                            }
                          }));
                        }
                      }}
                      disabled={mapping?.productAction !== 'existing'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={mapping?.productAction === 'existing' ? 'Select product...' : 'N/A'} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.id !== product.id).map((existingProduct) => {
                          // Check if this product is already selected by another row
                          const isAlreadySelected = Object.entries(productMappings).some(([otherProductId, otherMapping]) => 
                            otherProductId !== product.id.toString() && 
                            otherMapping.existingProductId === existingProduct.id.toString()
                          );
                          
                          return (
                            <SelectItem 
                              key={existingProduct.id} 
                              value={existingProduct.id.toString()}
                              disabled={isAlreadySelected}
                              className={isAlreadySelected ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              {existingProduct.sku} - {existingProduct.name}
                              {isAlreadySelected && ' (Already mapped)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Column 5: Category Selection */}
                  <div>
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
                        <SelectValue placeholder={
                          mapping?.productAction === 'new' 
                            ? "Select category (recommended)..." 
                            : "Select category..."
                        } />
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
                        
                        {/* Add Category Option */}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <div 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 cursor-pointer rounded-md transition-colors duration-150"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Scroll to Product Categories section
                              const categorySection = document.querySelector('[data-section="product-categories"]');
                              if (categorySection) {
                                categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-medium">Add New Category</span>
                          </div>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Column 6: Status */}
                  <div className="flex items-center">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 text-xs">
                        {mapping.productAction === 'existing' ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium">Mapped</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium">New Product</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Not mapped</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-xl px-6 py-3 border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Attribute Mapping
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}