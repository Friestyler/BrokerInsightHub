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

// Interfaces
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
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setCsvHeaders(results.meta.fields);
            
            // Auto-detect products using default column selection
            const productColumn = results.meta.fields.find(field => 
              field.toLowerCase().includes('product') || 
              field.toLowerCase().includes('naam') ||
              field.toLowerCase().includes('name')
            ) || results.meta.fields[0];
            
            if (productColumn) {
              setSelectedColumns([productColumn]);
              detectProducts(results.data, [productColumn]);
            }
          }
        }
      });
    }
  }, [csvData]);

  // Auto-detect products from selected columns
  const detectProducts = (data: any[], columns: string[]) => {
    if (!data || columns.length === 0) return;

    const uniqueProducts = new Set<string>();
    const productCounts: Record<string, number> = {};

    data.forEach(row => {
      let productName = '';
      
      if (productStructure === 'single-column') {
        productName = row[columns[0]] || '';
      } else if (productStructure === 'multiple-columns') {
        productName = columns.map(col => row[col] || '').filter(Boolean).join(' ');
      }

      if (productName.trim()) {
        uniqueProducts.add(productName.trim());
        productCounts[productName.trim()] = (productCounts[productName.trim()] || 0) + 1;
      }
    });

    const detectedProducts: DetectedProduct[] = Array.from(uniqueProducts).map((productName, index) => {
      // Check if this product matches any existing database product
      const matchedDbProduct = (dbProducts as any[]).find((dbProduct: any) => 
        dbProduct.name?.toLowerCase() === productName.toLowerCase()
      );

      return {
        id: `${index + 1000}`,
        name: productName,
        recordCount: productCounts[productName],
        matchedDbProductId: matchedDbProduct?.id
      };
    });

    setProducts(detectedProducts);

    // Auto-populate mappings for matched products
    const newMappings: Record<string, ProductMapping> = {};
    detectedProducts.forEach(product => {
      if (product.matchedDbProductId) {
        const dbProduct = (dbProducts as any[]).find((p: any) => p.id === product.matchedDbProductId);
        if (dbProduct) {
          newMappings[product.id] = {
            targetId: dbProduct.categoryId || '',
            targetType: 'category' as const,
            productAction: 'existing' as const,
            existingProductId: product.matchedDbProductId
          };
        }
      }
    });
    
    onProductMappingsChange({ ...productMappings, ...newMappings });
  };

  // Handle column selection changes
  useEffect(() => {
    if (csvData && selectedColumns.length > 0) {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          detectProducts(results.data, selectedColumns);
        }
      });
    }
  }, [selectedColumns, csvData, productStructure]);

  // Handle product action change
  const handleProductActionChange = (productId: string, action: string) => {
    const newMappings = { ...productMappings };
    
    if (action === 'existing') {
      newMappings[productId] = {
        ...newMappings[productId],
        targetId: '',
        targetType: 'category',
        productAction: 'existing' as const,
        existingProductId: ''
      };
    } else if (action === 'new') {
      newMappings[productId] = {
        ...newMappings[productId],
        targetId: '',
        targetType: 'category',
        productAction: 'new' as const
      };
      delete newMappings[productId].existingProductId;
    }
    
    onProductMappingsChange(newMappings);
  };

  // Handle existing product selection
  const handleExistingProductChange = (productId: string, existingProductId: string) => {
    const selectedDbProduct = (dbProducts as any[]).find((p: any) => p.id === existingProductId);
    const selectedCategory = (activeCategories as any[]).find((cat: any) => cat.id === selectedDbProduct?.categoryId);
    
    const newMappings = { ...productMappings };
    newMappings[productId] = {
      ...newMappings[productId],
      targetId: selectedCategory?.id || '',
      targetType: 'category',
      productAction: 'existing' as const,
      existingProductId: existingProductId
    };
    
    onProductMappingsChange(newMappings);
  };

  // Handle category assignment
  const handleCategoryChange = (productId: string, categoryId: string) => {
    const newMappings = { ...productMappings };
    newMappings[productId] = {
      ...newMappings[productId],
      targetId: categoryId,
      targetType: 'category',
      productAction: newMappings[productId]?.productAction || 'new' as const
    };
    
    onProductMappingsChange(newMappings);
  };

  // Calculate progress
  const totalProducts = products.length;
  const assignedCount = Object.keys(productMappings).filter(productId => {
    const mapping = productMappings[productId];
    return mapping && (
      (mapping.productAction === 'existing' && mapping.existingProductId) ||
      (mapping.productAction === 'new' && mapping.targetId)
    );
  }).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColumnDropdown(false);
    };

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
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Select product columns above to detect products from your file</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const mapping = productMappings[product.id];
                const isMatched = !!product.matchedDbProductId;
                const isMapped = mapping && (
                  (mapping.productAction === 'existing' && mapping.existingProductId) ||
                  (mapping.productAction === 'new' && mapping.targetId)
                );

                return (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <span className="text-xs text-gray-500">ID: {product.id}</span>
                        {isMatched && (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            Match
                          </Badge>
                        )}
                        {isMapped && (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            {mapping.productAction === 'existing' ? 'Mapped' : 'New Product'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="min-w-[140px]">
                        <Label className="text-xs text-gray-600 mb-1 block">Action</Label>
                        <Select
                          value={mapping?.productAction || ''}
                          onValueChange={(value) => handleProductActionChange(product.id, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Choose action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="existing">Map to existing product</SelectItem>
                            <SelectItem value="new">Create new product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {mapping?.productAction === 'existing' && (
                        <div className="min-w-[200px]">
                          <Label className="text-xs text-gray-600 mb-1 block">Existing Product</Label>
                          <Select
                            value={mapping?.existingProductId || ''}
                            onValueChange={(value) => handleExistingProductChange(product.id, value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {(dbProducts as any[]).map((dbProduct: any) => (
                                <SelectItem key={dbProduct.id} value={dbProduct.id}>
                                  {dbProduct.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="min-w-[200px]">
                        <Label className="text-xs text-gray-600 mb-1 block">Category</Label>
                        <Select
                          value={mapping?.targetId || ''}
                          onValueChange={(value) => handleCategoryChange(product.id, value)}
                          disabled={mapping?.productAction === 'existing' && !mapping?.existingProductId}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(activeCategories as any[]).map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="add-new">Add new category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Categories Management */}
      <Card className="border border-[#E6E7F1] shadow-sm">
        <CardHeader className="border-b border-[#E6E7F1] bg-[#E6E7F1]/50">
          <CardTitle className="text-lg font-semibold text-gray-900">Product Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Manage your product categories for better organization
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryModal(true)}
              className="h-8"
            >
              Category management
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(activeCategories as any[]).map((category: any) => (
              <div
                key={category.id}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900 truncate">{category.name}</span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {category.subcategories.length}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-600">
          {assignedCount} of {totalProducts} products mapped
        </div>
        <Button 
          onClick={onContinue}
          disabled={assignedCount === 0}
          className="h-8"
        >
          Continue to product mapping
        </Button>
      </div>

      {/* Category Management Dialog */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Product Categories</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <CategoryManagerForProducts 
              onClose={() => setShowCategoryModal(false)}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCategoryModal(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}