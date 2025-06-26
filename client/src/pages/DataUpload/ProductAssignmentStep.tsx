import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ChevronDown, X } from 'lucide-react';
import Papa from 'papaparse';
import { useQuery } from '@tanstack/react-query';
import CategoryManagerForProducts from '@/components/CategoryManagerForProducts';

// Simple MultiSelect component
const MultiSelect = ({ options, value, onChange, placeholder }: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div
        className="min-h-[32px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map(v => (
              <span key={v} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                {options.find(opt => opt.value === v)?.label || v}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(v);
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {options.map(option => (
            <div
              key={option.value}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleOption(option.value)}
            >
              <Check
                className={`mr-2 h-4 w-4 ${value.includes(option.value) ? 'opacity-100' : 'opacity-0'}`}
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DetectedProduct {
  id: string;
  name: string;
  recordCount: number;
  matchedDbProductId?: string;
}

interface ProductMapping {
  targetId: string;
  targetType: 'category' | 'subcategory';
  productAction?: 'existing' | 'new';
  existingProductId?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface ProductAssignmentStepProps {
  csvData: string;
  onProductMappingsChange: (mappings: Record<string, ProductMapping>) => void;
  productMappings: Record<string, ProductMapping>;
  onContinue: () => void;
}

export default function ProductAssignmentStep({ 
  csvData, 
  onProductMappingsChange, 
  productMappings, 
  onContinue 
}: ProductAssignmentStepProps) {
  const [products, setProducts] = useState<DetectedProduct[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [productStructure, setProductStructure] = useState<'single-column' | 'multiple-columns'>('single-column');
  const [selectedProductColumn, setSelectedProductColumn] = useState<string>('');
  const [selectedProductColumns, setSelectedProductColumns] = useState<string[]>([]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductStructureSection] = useState(false); // Hidden as requested
  
  // Add missing state variables that are referenced in the component
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [specificValue, setSpecificValue] = useState<string>('');

  // Fetch product categories
  const { data: activeCategories = [] } = useQuery({
    queryKey: ['/api/product-categories']
  });

  // Fetch existing products from database
  const { data: dbProducts = [] } = useQuery({
    queryKey: ['/api/products']
  });

  // Parse CSV headers on mount
  useEffect(() => {
    if (csvData) {
      Papa.parse(csvData, {
        header: true,
        preview: 1,
        complete: (results: any) => {
          if (results.meta && results.meta.fields) {
            setCsvHeaders(results.meta.fields);
          }
        }
      });
    }
  }, [csvData]);

  // Process products when column selection changes or auto-detect from suitable columns
  useEffect(() => {
    if (!csvData) return;

    // If no column selected, try to auto-detect from suitable columns
    const columnToUse = selectedProductColumn || 
      csvHeaders.find(header => 
        header.toLowerCase().includes('product') ||
        header.toLowerCase().includes('company') ||
        header.toLowerCase().includes('name')
      ) || 
      csvHeaders[0]; // Fallback to first column

    if (columnToUse) {
      Papa.parse(csvData, {
        header: true,
        complete: (results: any) => {
          const detectedProducts: DetectedProduct[] = [];
          const productCounts: Record<string, number> = {};

          results.data.forEach((row: any) => {
            const productName = row[columnToUse];
            if (productName && productName.trim()) {
              productCounts[productName] = (productCounts[productName] || 0) + 1;
            }
          });

          Object.entries(productCounts).forEach(([name, count], index) => {
            // Check if this product name matches any existing database product
            const matchedDbProduct = dbProducts.find((dbProduct: any) => 
              dbProduct.name.toLowerCase().trim() === name.toLowerCase().trim()
            );
            
            detectedProducts.push({
              id: (index + 1000).toString(),
              name: name.trim(),
              recordCount: count,
              matchedDbProductId: matchedDbProduct?.id
            });
          });

          setProducts(detectedProducts);
        }
      });
    } else if (csvData && selectedProductColumns.length > 0) {
      // Handle multiple columns case
      Papa.parse(csvData, {
        header: true,
        complete: (results: any) => {
          const detectedProducts: DetectedProduct[] = [];
          
          selectedProductColumns.forEach((columnName, index) => {
            // Check if this product name matches any existing database product
            const matchedDbProduct = dbProducts.find((dbProduct: any) => 
              dbProduct.name.toLowerCase().trim() === columnName.toLowerCase().trim()
            );
            
            detectedProducts.push({
              id: (index + 2000).toString(),
              name: columnName,
              recordCount: results.data.length,
              matchedDbProductId: matchedDbProduct?.id
            });
          });

          setProducts(detectedProducts);
        }
      });
    }
  }, [csvData, selectedProductColumn, selectedProductColumns, dbProducts]);

  const handleStructureChange = (value: 'single-column' | 'multiple-columns') => {
    setProductStructure(value);
    setSelectedProductColumn('');
    setSelectedProductColumns([]);
    setProducts([]);
  };

  const handleColumnSelect = (column: string) => {
    setSelectedProductColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleProductMapping = (
    productId: string, 
    targetId: string, 
    targetType: 'category' | 'subcategory',
    productAction: 'existing' | 'new' = 'new',
    existingProductId?: string
  ) => {
    const newMappings = {
      ...productMappings,
      [productId]: {
        targetId,
        targetType,
        productAction,
        existingProductId
      }
    };
    
    onProductMappingsChange(newMappings);
  };

  // Calculate progress
  const totalProducts = products.length;
  const assignedCount = Object.keys(productMappings || {}).filter(productId => {
    const mapping = (productMappings || {})[productId];
    return mapping && (
      (mapping.productAction === 'existing' && mapping.existingProductId) ||
      (mapping.productAction === 'new' && mapping.targetId)
    );
  }).length;

  const canContinue = totalProducts > 0 && assignedCount === totalProducts;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowColumnDropdown(false);
    if (showColumnDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColumnDropdown]);

  if (!csvData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No CSV data available. Please upload a file first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Structure Selection */}
      <Card className="border border-[#E6E7F1] shadow-sm">
        <CardHeader className="border-b border-[#E6E7F1] bg-[#E6E7F1]/50">
          <CardTitle className="text-lg font-semibold text-gray-900">Where should we look for your products?</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Single Column Option */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                productStructure === 'single-column' ? 'border-[#5567E5] bg-[#5567E5]/5' : 'border-[#E6E7F1] hover:border-gray-300'
              }`}
              onClick={() => {
                setProductStructure('single-column');
                setSelectedColumns([]);
                setSpecificValue('');
              }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={productStructure === 'single-column'}
                  onChange={() => {}}
                  className="mt-1 text-[#5567E5] focus:ring-[#5567E5]"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Single column contains product names</h3>
                  <p className="text-sm text-gray-600">One column in your file contains all the product names</p>
                  
                  {productStructure === 'single-column' && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Select the column containing product names:
                      </label>
                      <MultiSelect
                        options={csvHeaders.map(header => ({ value: header, label: header }))}
                        value={selectedColumns}
                        onChange={setSelectedColumns}
                        placeholder="Select product column..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multiple Columns Option */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                productStructure === 'multiple-columns' ? 'border-[#5567E5] bg-[#5567E5]/5' : 'border-[#E6E7F1] hover:border-gray-300'
              }`}
              onClick={() => {
                setProductStructure('multiple-columns');
                setSelectedColumns([]);
                setSpecificValue('');
              }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={productStructure === 'multiple-columns'}
                  onChange={() => {}}
                  className="mt-1 text-[#5567E5] focus:ring-[#5567E5]"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Multiple columns contain product information</h3>
                  <p className="text-sm text-gray-600">Product names are spread across several columns that need to be combined</p>
                  
                  {productStructure === 'multiple-columns' && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Select columns to combine for product names:
                      </label>
                      <MultiSelect
                        options={csvHeaders.map(header => ({ value: header, label: header }))}
                        value={selectedColumns}
                        onChange={setSelectedColumns}
                        placeholder="Select columns to combine..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specific Value Option */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                productStructure === 'value' ? 'border-[#5567E5] bg-[#5567E5]/5' : 'border-[#E6E7F1] hover:border-gray-300'
              }`}
              onClick={() => {
                setProductStructure('value');
                setSelectedColumns([]);
                setSpecificValue('');
              }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={productStructure === 'value'}
                  onChange={() => {}}
                  className="mt-1 text-[#5567E5] focus:ring-[#5567E5]"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">All rows represent the same product</h3>
                  <p className="text-sm text-gray-600">Every row in your file represents the same product with different attributes</p>
                  
                  {productStructure === 'value' && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Enter the product name:
                      </label>
                      <input
                        type="text"
                        value={specificValue}
                        onChange={(e) => setSpecificValue(e.target.value)}
                        placeholder="Enter product name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detected Products Table - Always shown, populates when product name column is selected */}
      <Card className="border border-[#E6E7F1] shadow-sm">
          <CardHeader className="border-b border-[#E6E7F1] bg-[#E6E7F1]/50">
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

          {/* Product Rows or Empty State */}
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products detected</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select which column contains product names in the "Product Column Mapping" section above to detect products from your file.
                </p>
              </div>
            ) : (
              products.map((product) => {
                const mapping = (productMappings || {})[product.id];
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
                      <span className="font-medium">ID: {product.id}</span>
                    </div>
                  </div>

                  {/* Column 3: Product Action */}
                  <div>
                    <Select
                      value={mapping?.productAction || (product.matchedDbProductId ? 'existing' : '')}
                      onValueChange={(value: 'existing' | 'new') => {
                        if (value === 'existing') {
                          // Just set action without auto-matching
                          const newMappings = {
                            ...(productMappings || {}),
                            [product.id.toString()]: {
                              targetId: mapping?.targetId || '',
                              targetType: mapping?.targetType || 'category',
                              productAction: 'existing',
                              existingProductId: mapping?.existingProductId || ''
                            }
                          };
                          onProductMappingsChange(newMappings);
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
                            const newMappings = {
                              ...(productMappings || {}),
                              [product.id.toString()]: {
                                targetId: '',
                                targetType: 'category',
                                productAction: 'new'
                              }
                            };
                            onProductMappingsChange(newMappings);
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
                        const selectedProduct = dbProducts.find((p: any) => p.id.toString() === existingProductId);
                        
                        if (selectedProduct) {
                          // Auto-fill category based on selected product's category
                          const categoryId = selectedProduct.parentCategoryName ? 
                            activeCategories.find((cat: any) => cat.name === selectedProduct.parentCategoryName)?.id || '' : '';
                          
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
                            const newMappings = {
                              ...(productMappings || {}),
                              [product.id.toString()]: {
                                targetId: '',
                                targetType: 'category',
                                productAction: 'existing',
                                existingProductId: existingProductId
                              }
                            };
                            onProductMappingsChange(newMappings);
                          }
                        }
                      }}
                      disabled={mapping?.productAction !== 'existing' && !product.matchedDbProductId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={mapping?.productAction === 'existing' ? 'Select product...' : 'N/A'} />
                      </SelectTrigger>
                      <SelectContent>
                        {dbProducts.map((existingProduct: any) => {
                          // Check if this product is already selected by another row
                          const isAlreadySelected = Object.entries(productMappings || {}).some(([otherProductId, otherMapping]) => 
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
                              {existingProduct.name}
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
            })
          )}
          </div>
        </CardContent>
      </Card>
      
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