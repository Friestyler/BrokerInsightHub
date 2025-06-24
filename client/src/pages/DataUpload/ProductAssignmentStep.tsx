import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, FolderOpen, FileText, CheckCircle, AlertTriangle, Check, ChevronDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import CategoryManagerForProducts from "@/components/CategoryManagerForProducts";

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // New state for product structure selection
  const [productStructure, setProductStructure] = useState<ProductStructure>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedProductColumn, setSelectedProductColumn] = useState<string>('');
  const [selectedProductColumns, setSelectedProductColumns] = useState<string[]>([]);
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [showProductTable, setShowProductTable] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Use database categories instead of props
  const activeCategories = (dbCategories && Array.isArray(dbCategories) && dbCategories.length > 0) ? dbCategories as Category[] : categories;
  
  // Only use detected products when they are available, otherwise show empty table
  const products = detectedProducts;
  
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
            
            products = Array.from(uniqueProducts).map((name, index) => {
              // Check if this product name matches any existing database product by name
              const matchedDbProduct = dbProducts.find(dbProduct => 
                dbProduct.name.toLowerCase().trim() === name.toLowerCase().trim()
              );
              
              return {
                id: index + 1000, // Use high IDs to avoid conflicts with database products
                sku: `${index + 1000}`, // Give detected products unique SKUs
                name,
                source: selectedProductColumn,
                recordCount: Math.floor(Math.random() * 50) + 10, // Simulated count
                matchedDbProductId: matchedDbProduct?.id || null,
                matchedDbProduct: matchedDbProduct || null
              };
            });
            
            setDetectedProducts(products);
            setShowProductTable(true);
            
            // Auto-create preliminary mappings for matched products (no category pre-fill)
            const autoMappings: Record<string, ProductMapping> = {};
            products.forEach(product => {
              if (product.matchedDbProduct) {
                autoMappings[product.id.toString()] = {
                  targetId: '', // Don't pre-fill category
                  targetType: 'category',
                  productAction: 'existing',
                  existingProductId: product.matchedDbProduct.id.toString()
                };
              }
            });
            setProductMappings(autoMappings);
          }
        });
      }
    } else if (productStructure === 'multiple-columns' && selectedProductColumns.length > 0) {
      // Each selected column represents a product
      products = selectedProductColumns.map((columnName, index) => {
        // Check if this column name matches any existing database product by name
        const matchedDbProduct = dbProducts.find(dbProduct => 
          dbProduct.name.toLowerCase().trim() === columnName.toLowerCase().trim()
        );
        
        return {
          id: index + 2000, // Use different ID range
          sku: `${index + 2000}`, // Give detected products unique SKUs
          name: columnName,
          source: 'column header',
          recordCount: Math.floor(Math.random() * 100) + 20, // Simulated count
          matchedDbProductId: matchedDbProduct?.id || null,
          matchedDbProduct: matchedDbProduct || null
        };
      });
      
      setDetectedProducts(products);
      setShowProductTable(true);
      
      // Auto-create preliminary mappings for matched products (no category pre-fill)
      const autoMappings: Record<string, ProductMapping> = {};
      products.forEach(product => {
        if (product.matchedDbProduct) {
          autoMappings[product.id.toString()] = {
            targetId: '', // Don't pre-fill category
            targetType: 'category',
            productAction: 'existing',
            existingProductId: product.matchedDbProduct.id.toString()
          };
        }
      });
      setProductMappings(autoMappings);
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
      <Card className="border border-[#E6E7F1] shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-left space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Where should we look for your products?</h3>
              <p className="text-gray-600 text-sm">Select how they're listed in the file your uploaded.</p>
            </div>
            
            <RadioGroup value={productStructure} onValueChange={handleStructureChange} className="space-y-3">
              {/* Single Column Option */}
              <div 
                className={`relative rounded-2xl border cursor-pointer transition-all duration-300 ${
                  productStructure === 'single-column' 
                    ? 'border-[#5567E5] bg-[#5567E5]/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-25'
                }`}
                onClick={() => handleStructureChange('single-column')}
              >
                <div className="flex items-start space-x-4 p-5">
                  <RadioGroupItem 
                    value="single-column" 
                    id="single-column" 
                    className={`mt-0.5 pointer-events-none ${productStructure === 'single-column' ? 'border-[#5567E5] text-[#5567E5]' : ''}`}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="single-column" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-semibold cursor-pointer text-gray-900 text-[14px]">
                      One column contains the product names
                    </Label>
                    <p className="text-sm text-gray-600 leading-relaxed">For example, a single column called "Product" contains values like "Self-Employed Disability Insurance", "Legal Assistance – Business", etc</p>
                  </div>
                </div>
                
                {/* Inline configuration for single column */}
                {productStructure === 'single-column' && csvHeaders.length > 0 && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#5567E5]/20 bg-[#5567E5]/2">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Select the column that contains product names</Label>
                      <Select value={selectedProductColumn} onValueChange={setSelectedProductColumn}>
                        <SelectTrigger className="w-full bg-white">
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
                  </div>
                )}
              </div>
              
              {/* Multiple Columns Option */}
              <div 
                className={`relative rounded-2xl border cursor-pointer transition-all duration-300 ${
                  productStructure === 'multiple-columns' 
                    ? 'border-[#5567E5] bg-[#5567E5]/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-25'
                }`}
                onClick={() => handleStructureChange('multiple-columns')}
              >
                <div className="flex items-start space-x-4 p-5">
                  <RadioGroupItem 
                    value="multiple-columns" 
                    id="multiple-columns" 
                    className={`mt-0.5 pointer-events-none ${productStructure === 'multiple-columns' ? 'border-[#5567E5] text-[#5567E5]' : ''}`}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="multiple-columns" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-semibold cursor-pointer text-gray-900 text-[14px]">
                      Each column is a product
                    </Label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Column headers like "Self-Employed Disability Insurance", "Legal Assistance – Business", "WGA Employer Liability" are the product names
                    </p>
                  </div>
                </div>
                
                {/* Inline configuration for multiple columns */}
                {productStructure === 'multiple-columns' && csvHeaders.length > 0 && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#5567E5]/20 bg-[#5567E5]/2">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Select the columns that represent products</Label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColumnDropdown(!showColumnDropdown);
                          }}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-left hover:border-gray-400 focus:border-[#5567E5] focus:ring-2 focus:ring-[#5567E5]/20 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              {selectedProductColumns.length === 0 
                                ? 'Choose columns...'
                                : `${selectedProductColumns.length} column${selectedProductColumns.length > 1 ? 's' : ''} selected`
                              }
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showColumnDropdown ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {showColumnDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div className="p-2">
                              {csvHeaders.map((header, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleColumnSelect(header);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-150 ${
                                    selectedProductColumns.includes(header)
                                      ? 'bg-[#5567E5]/10 text-[#5567E5]'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="text-sm font-medium truncate">{header}</span>
                                  {selectedProductColumns.includes(header) && (
                                    <Check className="h-4 w-4 text-[#5567E5] flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedProductColumns.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedProductColumns.map((column, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5567E5]/10 text-[#5567E5] text-xs font-medium rounded-full"
                            >
                              {column}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColumnSelect(column);
                                }}
                                className="hover:bg-[#5567E5]/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
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
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">product Category</h3>
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
              const hasAutoMatch = !!product.matchedDbProductId;
              
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
                    </div>
                  </div>

                  {/* Column 3: Product Action */}
                  <div>
                    <Select
                      value={mapping?.productAction || (product.matchedDbProductId ? 'existing' : '')}
                      onValueChange={(value: 'existing' | 'new') => {
                        if (value === 'existing') {
                          // Just set action without auto-matching
                          setProductMappings(prev => ({
                            ...prev,
                            [product.id.toString()]: {
                              targetId: mapping?.targetId || '',
                              targetType: mapping?.targetType || 'category',
                              productAction: 'existing',
                              existingProductId: mapping?.existingProductId || ''
                            }
                          }));
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
                      value={mapping?.existingProductId || (product.matchedDbProductId ? product.matchedDbProductId.toString() : '')}
                      onValueChange={(existingProductId) => {
                        // Find the selected existing product
                        const selectedProduct = dbProducts.find(p => p.id.toString() === existingProductId);
                        
                        if (selectedProduct) {
                          // Auto-fill category based on selected product's category
                          const categoryId = selectedProduct.parentCategoryName ? 
                            activeCategories.find(cat => cat.name === selectedProduct.parentCategoryName)?.id || '' : '';
                          
                          if (categoryId) {
                            // Product has a category, complete the mapping
                            handleProductMapping(
                              product.id.toString(),
                              categoryId,
                              'category',
                              'existing',
                              existingProductId
                            );
                          } else {
                            // Product has no category, create preliminary mapping
                            setProductMappings(prev => ({
                              ...prev,
                              [product.id.toString()]: {
                                targetId: '',
                                targetType: 'category',
                                productAction: 'existing',
                                existingProductId: existingProductId
                              }
                            }));
                          }
                        }
                      }}
                      disabled={mapping?.productAction !== 'existing' && !product.matchedDbProductId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={mapping?.productAction === 'existing' ? 'Select product...' : 'N/A'} />
                      </SelectTrigger>
                      <SelectContent>
                        {dbProducts.map((existingProduct) => {
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
                      value={isAssigned && mapping?.targetId ? `${mapping.targetType}:${mapping.targetId}` : ''}
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
                      disabled={mapping?.productAction === 'existing' && !!mapping?.existingProductId && !!mapping?.targetId}
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
                        
                        {/* Add Category Option */}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <div 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 cursor-pointer rounded-md transition-colors duration-150"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Open category management modal
                              setShowCategoryModal(true);
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
                    {mapping?.productAction === 'existing' && mapping?.existingProductId ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">Mapped</span>
                      </div>
                    ) : mapping?.productAction === 'new' && mapping?.targetId ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">New Product</span>
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
      {/* Category Management Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-white border-0 shadow-xl flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold" style={{ color: '#282A3F' }}>
              Manage Product Categories
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6">
            <CategoryManagerForProducts />
          </div>
          
          <DialogFooter className="border-t border-gray-100 p-6">
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryModal(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowCategoryModal(false)}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}