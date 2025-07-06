import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Settings, Target, ChevronDown, ChevronRight, Send, List } from 'lucide-react';

// Hook definitions
const useProductCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      // Return raw hierarchical data for smart UX
      return data.filter(item => !item.parent_id);
    }
  });
};

const useHierarchicalCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      // Transform hierarchical data into selectable items for matrix
      const selectableItems: any[] = [];
      
      data.filter(item => !item.parent_id).forEach(category => {
        // Add main category as selectable
        selectableItems.push({
          id: category.id.toString(),
          name: category.name,
          category: category.name,
          color: category.color,
          type: 'category',
          level: 0
        });
        
        // Add subcategories as selectable
        if (category.subcategories) {
          category.subcategories.forEach((sub: any) => {
            selectableItems.push({
              id: sub.id.toString(),
              name: sub.name,
              category: category.name,
              color: sub.color || category.color,
              parentName: category.name,
              type: 'subcategory',
              level: 1
            });
            
            // Add sub-subcategories as selectable
            if (sub.subSubcategories) {
              sub.subSubcategories.forEach((subSub: any) => {
                selectableItems.push({
                  id: subSub.id.toString(),
                  name: subSub.name,
                  category: category.name,
                  color: subSub.color || sub.color || category.color,
                  parentName: `${category.name} > ${sub.name}`,
                  type: 'sub-subcategory',
                  level: 2
                });
              });
            }
          });
        }
      });
      
      return selectableItems;
    }
  });
};

const useProducts = () => {
  return useQuery({
    queryKey: ['/api/product-catalogue'],
  });
};

// Data interfaces
interface CrossSellData {
  rate: number;
  benchmark: number;
  customers: number;
  potential: number;
  maxValue: number;
  expectedRevenue: number;
}

interface WhiteSpaceMatrixProps {
  entityType: 'partner' | 'customer';
  entityId: string;
  entityName?: string;
  onCreateOpportunity?: () => void;
  onCreateCampaign?: () => void;
  onCreateList?: () => void;
}

const customerSegments = [
  { id: 'all', name: 'All Customers', count: 1247 },
  { id: 'high-value', name: 'High Value (>€50K)', count: 234 },
  { id: 'medium-value', name: 'Medium Value (€10K-€50K)', count: 678 },
  { id: 'emerging', name: 'Emerging (<€10K)', count: 335 }
];

export default function WhiteSpaceMatrix({ 
  entityType, 
  entityId, 
  entityName, 
  onCreateOpportunity, 
  onCreateCampaign, 
  onCreateList 
}: WhiteSpaceMatrixProps) {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [conversionRate, setConversionRate] = useState([20]);
  const [selectedHorizontalProducts, setSelectedHorizontalProducts] = useState<string[]>([]);
  const [selectedVerticalProducts, setSelectedVerticalProducts] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [showProductConfig, setShowProductConfig] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Set<string>>(new Set());

  // Helper functions for collapse/expand
  const toggleCategoryCollapse = useCallback((categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  }, [collapsedCategories]);

  const toggleSubcategoryCollapse = useCallback((subcategoryId: string) => {
    const newCollapsed = new Set(collapsedSubcategories);
    if (newCollapsed.has(subcategoryId)) {
      newCollapsed.delete(subcategoryId);
    } else {
      newCollapsed.add(subcategoryId);
    }
    setCollapsedSubcategories(newCollapsed);
  }, [collapsedSubcategories]);

  // Fetch authentic data
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: hierarchicalItems = [], isLoading: hierarchicalLoading } = useHierarchicalCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  
  // Initialize selected products with first few hierarchical items
  const [initialized, setInitialized] = useState(false);
  if (!initialized && hierarchicalItems.length > 0) {
    const defaultSelection = hierarchicalItems.slice(0, 4).map(c => c.id);
    setSelectedHorizontalProducts(defaultSelection);
    setSelectedVerticalProducts(defaultSelection);
    setInitialized(true);
  }

  const currentSegment = customerSegments.find(s => s.id === selectedSegment);

  // Get selected items for matrix display - mix of categories and products
  const getSelectedItems = (selectedIds: string[]) => {
    const items: any[] = [];
    
    selectedIds.forEach(id => {
      if (id.startsWith('product-')) {
        // Find the actual product
        const productId = id.replace('product-', '');
        const product = products.find(p => p.id.toString() === productId);
        if (product) {
          items.push({
            id: id,
            name: product.name,
            color: '#9CA3AF',
            type: 'product',
            provider: product.provider
          });
        }
      } else {
        // Find the category/subcategory
        const categoryItem = hierarchicalItems.find(item => item.id === id);
        if (categoryItem) {
          items.push(categoryItem);
        }
      }
    });
    
    return items;
  };

  const horizontalProducts = getSelectedItems(selectedHorizontalProducts);
  const verticalProducts = getSelectedItems(selectedVerticalProducts);

  // Generate cross-sell data based on entity context
  const getCellData = (fromProduct: string, toProduct: string): CrossSellData | null => {
    if (fromProduct === toProduct) return null;
    
    // Generate realistic placeholder data based on category IDs and entity context
    const fromId = parseInt(fromProduct);
    const toId = parseInt(toProduct);
    const entityHashValue = parseInt(entityId) || 1;
    
    // Create more varied rates with better contrast
    const hashValue = ((fromId * 37 + toId * 41) + entityHashValue * 23) % 100;
    let baseRate: number;
    
    // Generate more varied distribution for better visual contrast
    if (hashValue < 15) {
      baseRate = 10 + (hashValue % 15); // Low: 10-24%
    } else if (hashValue < 35) {
      baseRate = 25 + (hashValue % 15); // Medium-low: 25-39%
    } else if (hashValue < 60) {
      baseRate = 40 + (hashValue % 15); // Medium: 40-54%
    } else if (hashValue < 80) {
      baseRate = 55 + (hashValue % 15); // Good: 55-69%
    } else {
      baseRate = 70 + (hashValue % 20); // High: 70-89%
    }
    
    const benchmark = Math.max(15, baseRate + ((fromId - toId) % 20) - 10);
    const customers = entityType === 'partner' ? 
      30 + ((fromId + toId * 2 + entityHashValue) % 180) : 
      Math.min(50, 5 + ((fromId + toId * 2 + entityHashValue) % 45)); // Smaller customer base for individual customers
    const potential = Math.floor(customers * (baseRate / 100) * (0.8 + (hashValue % 40) / 100));
    const maxValue = (30000 + ((fromId + toId) * 8000)) * (1 + (baseRate / 100));
    
    return {
      rate: baseRate,
      benchmark: benchmark,
      customers: customers,
      potential: potential,
      maxValue: maxValue,
      expectedRevenue: maxValue * (baseRate / 100) * 0.4
    };
  };

  // Cross-sell data for overview calculations
  const crossSellData: Record<string, CrossSellData> = {};
  horizontalProducts.forEach(fromProduct => {
    verticalProducts.forEach(toProduct => {
      const cellData = getCellData(fromProduct.id, toProduct.id);
      if (cellData) {
        crossSellData[`${fromProduct.id}-${toProduct.id}`] = cellData;
      }
    });
  });

  const selectedCellData = selectedCell ? (() => {
    const [fromId, toId] = selectedCell.split('-');
    return getCellData(fromId, toId);
  })() : null;

  // Color coding for matrix cells based on cross-sell potential
  const getCellColor = (rate: number) => {
    if (rate >= 70) return 'bg-emerald-100 text-emerald-800 border-emerald-200'; // Dark green
    if (rate >= 55) return 'bg-green-100 text-green-800 border-green-200'; // Medium green
    if (rate >= 40) return 'bg-amber-100 text-amber-800 border-amber-200'; // Yellow
    if (rate >= 25) return 'bg-orange-100 text-orange-800 border-orange-200'; // Orange
    return 'bg-red-100 text-red-800 border-red-200'; // Red
  };

  const getBenchmarkIcon = (rate: number, benchmark: number) => {
    if (rate > benchmark) return '↗️';
    if (rate < benchmark) return '↘️';
    return '→';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cross-sell & Upsell Matrix for {entityName || entityType}
        </h3>
        <p className="text-gray-600">
          Analyze customer potential and values per product combination for this {entityType}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-[#E6E7F1] p-4 rounded-lg">
        <div className="flex items-center space-x-6">
          {/* Segment Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Customer Segment</span>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customerSegments.map(segment => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name} ({segment.count.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conversion Rate Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Conversion rate: {conversionRate[0]}%</span>
            <Slider
              value={conversionRate}
              onValueChange={setConversionRate}
              max={50}
              min={5}
              step={5}
              className="w-32"
            />
          </div>

          <div className="text-sm text-gray-600">
            {currentSegment?.name} - {currentSegment?.count.toLocaleString()} customers
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowProductConfig(!showProductConfig)}>
          <Settings className="h-4 w-4 mr-1" />
          Products
        </Button>
      </div>

      {/* Product Configuration Panel */}
      {showProductConfig && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Product Configuration</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowProductConfig(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Horizontal Axis */}
              <div>
                <h4 className="font-medium mb-3">Horizontal Axis ({selectedHorizontalProducts.length} selected)</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {hierarchicalLoading ? (
                    <div className="text-sm text-gray-500">Loading categories...</div>
                  ) : (
                    categories.map(category => {
                      const categoryId = category.id.toString();
                      const isCategoryCollapsed = collapsedCategories.has(categoryId);
                      
                      return (
                        <div key={`h-cat-${category.id}`} className="space-y-1">
                          {/* Main Category */}
                          <div className="flex items-center space-x-2 p-2 rounded hover:bg-white group">
                            <button
                              onClick={() => toggleCategoryCollapse(categoryId)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {isCategoryCollapsed ? (
                                <ChevronRight className="h-3 w-3 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-gray-500" />
                              )}
                            </button>
                            <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedHorizontalProducts.includes(categoryId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedHorizontalProducts([...selectedHorizontalProducts, categoryId]);
                                  } else {
                                    setSelectedHorizontalProducts(selectedHorizontalProducts.filter(p => p !== categoryId));
                                  }
                                }}
                                className="rounded"
                              />
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                                <div className="text-xs text-gray-500">{category.child_count} subcategories</div>
                              </div>
                            </label>
                          </div>

                          {/* Subcategories */}
                          {!isCategoryCollapsed && category.subcategories && category.subcategories.map((sub: any) => {
                            const subId = sub.id.toString();
                            const isSubCollapsed = collapsedSubcategories.has(subId);
                            
                            return (
                              <div key={`h-sub-${sub.id}`} className="ml-6 space-y-1">
                                <div className="flex items-center space-x-2 p-1.5 rounded hover:bg-white group">
                                  <button
                                    onClick={() => toggleSubcategoryCollapse(subId)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {sub.child_count > 0 ? (
                                      isSubCollapsed ? (
                                        <ChevronRight className="h-3 w-3 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 text-gray-500" />
                                      )
                                    ) : (
                                      <div className="h-3 w-3" />
                                    )}
                                  </button>
                                  <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedHorizontalProducts.includes(subId)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedHorizontalProducts([...selectedHorizontalProducts, subId]);
                                        } else {
                                          setSelectedHorizontalProducts(selectedHorizontalProducts.filter(p => p !== subId));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: sub.color || category.color }}
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                                      {sub.child_count > 0 && (
                                        <div className="text-xs text-gray-500">{sub.child_count} sub-subcategories</div>
                                      )}
                                    </div>
                                  </label>
                                </div>

                                {/* Products under subcategory */}
                                {!isSubCollapsed && products.filter(p => p.category === sub.name).map((product: any) => (
                                  <label key={`h-prod-${product.id}`} className="flex items-center space-x-3 p-1 rounded hover:bg-white cursor-pointer group ml-8">
                                    <input
                                      type="checkbox"
                                      checked={selectedHorizontalProducts.includes(`product-${product.id}`)}
                                      onChange={(e) => {
                                        const productId = `product-${product.id}`;
                                        if (e.target.checked) {
                                          setSelectedHorizontalProducts([...selectedHorizontalProducts, productId]);
                                        } else {
                                          setSelectedHorizontalProducts(selectedHorizontalProducts.filter(p => p !== productId));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">{product.name}</span>
                                    {product.provider && (
                                      <span className="text-xs text-gray-400">({product.provider})</span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Vertical Axis */}
              <div>
                <h4 className="font-medium mb-3">Vertical Axis ({selectedVerticalProducts.length} selected)</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {hierarchicalLoading ? (
                    <div className="text-sm text-gray-500">Loading categories...</div>
                  ) : (
                    categories.map(category => {
                      const categoryId = category.id.toString();
                      const isCategoryCollapsed = collapsedCategories.has(categoryId);
                      
                      return (
                        <div key={`v-cat-${category.id}`} className="space-y-1">
                          {/* Main Category */}
                          <div className="flex items-center space-x-2 p-2 rounded hover:bg-white group">
                            <button
                              onClick={() => toggleCategoryCollapse(categoryId)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {isCategoryCollapsed ? (
                                <ChevronRight className="h-3 w-3 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-gray-500" />
                              )}
                            </button>
                            <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedVerticalProducts.includes(categoryId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVerticalProducts([...selectedVerticalProducts, categoryId]);
                                  } else {
                                    setSelectedVerticalProducts(selectedVerticalProducts.filter(p => p !== categoryId));
                                  }
                                }}
                                className="rounded"
                              />
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                                <div className="text-xs text-gray-500">{category.child_count} subcategories</div>
                              </div>
                            </label>
                          </div>

                          {/* Subcategories */}
                          {!isCategoryCollapsed && category.subcategories && category.subcategories.map((sub: any) => {
                            const subId = sub.id.toString();
                            const isSubCollapsed = collapsedSubcategories.has(subId);
                            
                            return (
                              <div key={`v-sub-${sub.id}`} className="ml-6 space-y-1">
                                <div className="flex items-center space-x-2 p-1.5 rounded hover:bg-white group">
                                  <button
                                    onClick={() => toggleSubcategoryCollapse(subId)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {sub.child_count > 0 ? (
                                      isSubCollapsed ? (
                                        <ChevronRight className="h-3 w-3 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 text-gray-500" />
                                      )
                                    ) : (
                                      <div className="h-3 w-3" />
                                    )}
                                  </button>
                                  <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedVerticalProducts.includes(subId)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedVerticalProducts([...selectedVerticalProducts, subId]);
                                        } else {
                                          setSelectedVerticalProducts(selectedVerticalProducts.filter(p => p !== subId));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: sub.color || category.color }}
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                                      {sub.child_count > 0 && (
                                        <div className="text-xs text-gray-500">{sub.child_count} sub-subcategories</div>
                                      )}
                                    </div>
                                  </label>
                                </div>

                                {/* Products under subcategory */}
                                {!isSubCollapsed && products.filter(p => p.category === sub.name).map((product: any) => (
                                  <label key={`v-prod-${product.id}`} className="flex items-center space-x-3 p-1 rounded hover:bg-white cursor-pointer group ml-8">
                                    <input
                                      type="checkbox"
                                      checked={selectedVerticalProducts.includes(`product-${product.id}`)}
                                      onChange={(e) => {
                                        const productId = `product-${product.id}`;
                                        if (e.target.checked) {
                                          setSelectedVerticalProducts([...selectedVerticalProducts, productId]);
                                        } else {
                                          setSelectedVerticalProducts(selectedVerticalProducts.filter(p => p !== productId));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">{product.name}</span>
                                    {product.provider && (
                                      <span className="text-xs text-gray-400">({product.provider})</span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      {!selectedCell ? (
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Segment: {currentSegment?.name} • {currentSegment?.count.toLocaleString()} customers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(crossSellData).reduce((acc, data) => acc + data.potential, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total potential customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  €{Math.round(Object.values(crossSellData).reduce((acc, data) => acc + data.maxValue, 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Total max. potential</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  €{Math.round(Object.values(crossSellData).reduce((acc, data) => acc + (data.expectedRevenue * conversionRate[0]) / 100, 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">At {conversionRate[0]}% conversion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Selected Cell Detail */
        selectedCellData && (
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedCell?.split('-').map(id => {
                    const product = [...horizontalProducts, ...verticalProducts].find(p => p.id.toString() === id);
                    return product?.name || id;
                  }).join(' → ')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedCellData.rate}%</div>
                  <div className="text-sm text-gray-600">Cross-sell rate (benchmark: {selectedCellData.benchmark}%)</div>
                  <div className="text-xs text-gray-500 font-medium">
                    {selectedCellData.rate > selectedCellData.benchmark ? '+' : ''}{selectedCellData.rate - selectedCellData.benchmark}%
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedCellData.potential}</div>
                  <div className="text-sm text-gray-600">Potential customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">€{Math.round(selectedCellData.maxValue / 1000)}K</div>
                  <div className="text-sm text-gray-600">Max. potential</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">€{Math.round((selectedCellData.expectedRevenue * conversionRate[0]) / 100000)}K</div>
                  <div className="text-sm text-gray-600">At {conversionRate[0]}% conversion</div>
                </div>
              </div>
              <div className="flex space-x-2">
                {onCreateCampaign && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onCreateCampaign}>
                    <Send className="h-3 w-3 mr-1" />
                    Start campaign
                  </Button>
                )}
                {onCreateOpportunity && (
                  <Button variant="outline" size="sm" onClick={onCreateOpportunity}>
                    <Target className="h-3 w-3 mr-1" />
                    Create opportunity
                  </Button>
                )}
                {onCreateList && (
                  <Button variant="outline" size="sm" onClick={onCreateList}>
                    <List className="h-3 w-3 mr-1" />
                    Create customer list
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <Button 
          variant="ghost"
          size="sm"
          className={activeTab === 'matrix' ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500" : "hover:bg-gray-100"}
          onClick={() => setActiveTab('matrix')}
        >
          Cross-sell Matrix
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          className={activeTab === 'opportunities' ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500" : "hover:bg-gray-100"}
          onClick={() => setActiveTab('opportunities')}
        >
          Top Opportunities
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          className={activeTab === 'insights' ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500" : "hover:bg-gray-100"}
          onClick={() => setActiveTab('insights')}
        >
          Segment Insights
        </Button>
      </div>

      {/* Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="overflow-x-auto">
          {categoriesLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading product categories...</div>
            </div>
          ) : horizontalProducts.length === 0 || verticalProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Please select products in the configuration panel to display the matrix</div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 text-left">
                    <div className="text-sm font-medium">Has Product →</div>
                    <div className="text-xs text-gray-600">Wants Product ↓</div>
                  </th>
                  {horizontalProducts.map(product => (
                    <th key={product.id} className="border p-2 bg-blue-50 text-center min-w-32">
                      <div className="flex items-center justify-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: product.color }}
                        />
                        <div className="font-medium">{product.name}</div>
                      </div>
                      {product.parentName && (
                        <div className="text-xs text-gray-500">{product.parentName}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verticalProducts.map(rowProduct => (
                  <tr key={rowProduct.id}>
                    <td className="border p-2 bg-blue-50 font-medium">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: rowProduct.color }}
                        />
                        <div>
                          <div className="font-medium">{rowProduct.name}</div>
                          {rowProduct.parentName && (
                            <div className="text-xs text-gray-500">{rowProduct.parentName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {horizontalProducts.map(colProduct => {
                      const cellData = getCellData(colProduct.id, rowProduct.id);
                      const isSelected = selectedCell === `${colProduct.id}-${rowProduct.id}`;
                      
                      if (!cellData) {
                        return (
                          <td key={colProduct.id} className="border p-2 bg-gray-100 text-center text-gray-400">
                            <div className="text-sm">—</div>
                            <div className="text-xs">No data</div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={colProduct.id} 
                          className={`border p-2 cursor-pointer transition-all ${getCellColor(cellData.rate)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedCell(`${colProduct.id}-${rowProduct.id}`)}
                        >
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="font-bold text-gray-700">{cellData.rate}%</span>
                              <span className="text-xs">{getBenchmarkIcon(cellData.rate, cellData.benchmark)}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              vs {cellData.benchmark}% benchmark
                            </div>
                            <div className="text-xs text-gray-600">
                              {cellData.rate > cellData.benchmark ? '+' : ''}{cellData.rate - cellData.benchmark}%
                            </div>
                            <div className="text-xs text-gray-700 font-medium">
                              Current customers: {cellData.customers}
                            </div>
                            <div className="text-xs text-gray-600">
                              Cross-sell potential: {cellData.potential}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">
                              €{Math.round(cellData.maxValue / 1000)}K max potential
                            </div>
                            <div className="text-xs text-gray-600">
                              €{Math.round((cellData.expectedRevenue * conversionRate[0]) / 20000)}K at {conversionRate[0]}% conversion
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Top Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {Object.entries(crossSellData)
            .sort(([,a], [,b]) => b.maxValue - a.maxValue)
            .slice(0, 10)
            .map(([key, data], index) => (
              <Card key={key} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{key.replace('-', ' → ').toUpperCase()}</div>
                      <div className="text-sm text-gray-600">
                        {data.rate}% cross-sell rate • {data.potential} potential customers • €{Math.round(data.maxValue / data.potential)} avg. value
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">€{Math.round(data.maxValue / 1000)}K</div>
                    <div className="text-sm text-gray-600">total potential</div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Segment Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardTitle className="mb-4">Segment Overview</CardTitle>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{currentSegment?.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Customers in {currentSegment?.name}</div>
              </div>
              <div>
                <div className="text-lg font-medium">Best cross-sell opportunity</div>
                <div className="text-sm text-gray-600">Based on current matrix configuration</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <CardTitle className="mb-4">Performance Summary</CardTitle>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">
                  €{Math.round(Object.values(crossSellData).reduce((acc, data) => acc + data.expectedRevenue, 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Expected revenue at current rates</div>
              </div>
              <div>
                <div className="text-lg font-medium">
                  {Math.round(Object.values(crossSellData).reduce((acc, data) => acc + data.rate, 0) / Object.keys(crossSellData).length)}%
                </div>
                <div className="text-sm text-gray-600">Average cross-sell rate</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}