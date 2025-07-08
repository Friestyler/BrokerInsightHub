import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Zap, Users, Settings, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface Category {
  id: number;
  name: string;
  color: string;
  level: number;
  parent_id?: number;
  child_count?: number;
  subcategories?: Category[];
}

interface WhiteSpaceMatrixProps {
  entityType: string;
  entityId: string;
  onCreateOpportunity: () => void;
  onCreateCampaign: () => void;
  onCreateList: () => void;
}

interface SelectedCellData {
  fromCategory: string;
  toCategory: string;
  conversionRate: number;
  benchmark: number;
  revenue: number;
  potentialCustomers: number;
  priority: string;
}

export function WhiteSpaceMatrix({ 
  entityType, 
  entityId, 
  onCreateOpportunity, 
  onCreateCampaign, 
  onCreateList 
}: WhiteSpaceMatrixProps) {
  const { environment } = useEnvironment();
  const [selectedHorizontalProducts, setSelectedHorizontalProducts] = useState<string[]>([]);
  const [selectedVerticalProducts, setSelectedVerticalProducts] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedCellData, setSelectedCellData] = useState<SelectedCellData | null>(null);
  const [showProductConfig, setShowProductConfig] = useState(true);
  const [showBenchmarkConfig, setShowBenchmarkConfig] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Set<string>>(new Set());
  const [conversionRate, setConversionRate] = useState([20]);

  // Fetch hierarchical categories from API
  const { data: categories = [], isLoading: hierarchicalLoading } = useQuery({
    queryKey: ['categories-hierarchical', entityType, entityId],
    queryFn: async () => {
      const response = await fetch(`/api/degoudse/product-categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      console.log('Categories loaded for Matrix:', data);
      console.log('Categories array length:', data.length);
      console.log('Categories structure:', data.map((c: any) => ({ id: c.id, name: c.name, level: c.level })));
      return data;
    }
  });

  // Helper functions for collapse/expand
  const toggleCategoryCollapse = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const toggleSubcategoryCollapse = (subcategoryId: string) => {
    const newCollapsed = new Set(collapsedSubcategories);
    if (newCollapsed.has(subcategoryId)) {
      newCollapsed.delete(subcategoryId);
    } else {
      newCollapsed.add(subcategoryId);
    }
    setCollapsedSubcategories(newCollapsed);
  };

  // Initialize with main categories when data loads
  useEffect(() => {
    if (categories.length > 0) {
      const mainCategoryIds = categories.map((cat: Category) => cat.id.toString());
      setSelectedHorizontalProducts(mainCategoryIds);
      setSelectedVerticalProducts(mainCategoryIds);
    }
  }, [categories]);

  // Force update matrix when conversion rate changes
  useEffect(() => {
    console.log('Conversion rate changed:', conversionRate[0]);
    // Clear selected cell to force recalculation
    if (selectedCellData) {
      const newCellData = generateMatrixData(selectedCellData.fromCategory, selectedCellData.toCategory);
      setSelectedCellData(newCellData);
    }
  }, [conversionRate]);

  // Generate matrix data with conversion rates
  const generateMatrixData = (from: string, to: string) => {
    if (from === to) return null;
    
    // Generate consistent hash-based conversion rate (10-89%)
    const hash = from.charCodeAt(0) + to.charCodeAt(0) + from.length + to.length;
    const baseConversionRate = 0.10 + (hash % 80) / 100; // 10-89%
    
    // Apply user's conversion rate adjustment
    const userConversionRate = conversionRate[0] / 100; // Convert from percentage
    const adjustedConversionRate = Math.min(0.95, Math.max(0.05, baseConversionRate * (userConversionRate / 0.20))); // Adjust based on 20% baseline
    
    // Generate benchmark (independent market baseline)
    const benchmarkHash = (from.charCodeAt(0) * 7 + to.charCodeAt(0) * 11) % 100;
    const benchmark = 0.30 + (benchmarkHash % 40) / 100; // 30-70%
    
    const potentialCustomers = 50 + (hash % 200);
    const adjustedRevenue = potentialCustomers * (1000 + (hash % 3000)) * adjustedConversionRate;
    
    // Priority based on adjusted conversion rate
    let priority = 'low';
    if (adjustedConversionRate >= 0.70) priority = 'high';
    else if (adjustedConversionRate >= 0.55) priority = 'medium';
    else if (adjustedConversionRate >= 0.40) priority = 'medium';
    
    return {
      fromCategory: from,
      toCategory: to,
      conversionRate: adjustedConversionRate,
      benchmark,
      revenue: adjustedRevenue,
      potentialCustomers,
      priority
    };
  };

  const handleCellClick = (from: string, to: string) => {
    const cellData = generateMatrixData(from, to);
    if (cellData) {
      setSelectedCellData(cellData);
    }
  };

  const getCellColor = (conversionRate: number) => {
    const percentage = conversionRate * 100;
    if (percentage >= 70) return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300';
    if (percentage >= 55) return 'bg-green-100 hover:bg-green-200 border-green-300';
    if (percentage >= 40) return 'bg-amber-100 hover:bg-amber-200 border-amber-300';
    if (percentage >= 25) return 'bg-orange-100 hover:bg-orange-200 border-orange-300';
    return 'bg-red-100 hover:bg-red-200 border-red-300';
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar - Customer Segment */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Customer Segment</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All segments... (5,127)</SelectItem>
              <SelectItem value="young">Young families (1,234)</SelectItem>
              <SelectItem value="business">Business owners (892)</SelectItem>
            </SelectContent>
          </Select>
          
          <Label className="text-sm font-medium">Conversion rate: {conversionRate[0]}%</Label>
          <input
            type="range"
            min="10"
            max="50"
            value={conversionRate[0]}
            onChange={(e) => setConversionRate([parseInt(e.target.value)])}
            className="w-24"
          />
          
          <span className="text-sm text-gray-600">All segments - 5,127 customers</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={showBenchmarkConfig ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowBenchmarkConfig(!showBenchmarkConfig)}
          >
            Benchmarks
          </Button>
          <Button 
            variant={showProductConfig ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowProductConfig(!showProductConfig)}
          >
            Products
          </Button>
        </div>
      </div>

      {/* Product Configuration Panel */}
      {showProductConfig && (
        <Card className="border-2 border-purple-200">
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
                  ) : categories.length === 0 ? (
                    <div className="text-sm text-gray-500">No categories found</div>
                  ) : (
                    categories.map((category: Category) => {
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
                                  console.log('Horizontal checkbox clicked:', categoryId, e.target.checked);
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
                                <div className="text-xs text-gray-500">{category.child_count || 0} subcategories</div>
                              </div>
                            </label>
                          </div>

                          {/* Subcategories */}
                          {!isCategoryCollapsed && category.subcategories && category.subcategories.map((sub: Category) => {
                            const subId = sub.id.toString();
                            const isSubCollapsed = collapsedSubcategories.has(subId);
                            
                            return (
                              <div key={`h-sub-${sub.id}`} className="ml-6 space-y-1">
                                <div className="flex items-center space-x-2 p-1.5 rounded hover:bg-white group">
                                  <button
                                    onClick={() => toggleSubcategoryCollapse(subId)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {sub.child_count && sub.child_count > 0 ? (
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
                                      {sub.child_count && sub.child_count > 0 && (
                                        <div className="text-xs text-gray-500">{sub.child_count} sub-subcategories</div>
                                      )}
                                    </div>
                                  </label>
                                </div>
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
                  ) : categories.length === 0 ? (
                    <div className="text-sm text-gray-500">No categories found</div>
                  ) : (
                    categories.map((category: Category) => {
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
                                  console.log('Vertical checkbox clicked:', categoryId, e.target.checked);
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
                                <div className="text-xs text-gray-500">{category.child_count || 0} subcategories</div>
                              </div>
                            </label>
                          </div>

                          {/* Subcategories */}
                          {!isCategoryCollapsed && category.subcategories && category.subcategories.map((sub: Category) => {
                            const subId = sub.id.toString();
                            const isSubCollapsed = collapsedSubcategories.has(subId);
                            
                            return (
                              <div key={`v-sub-${sub.id}`} className="ml-6 space-y-1">
                                <div className="flex items-center space-x-2 p-1.5 rounded hover:bg-white group">
                                  <button
                                    onClick={() => toggleSubcategoryCollapse(subId)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {sub.child_count && sub.child_count > 0 ? (
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
                                      {sub.child_count && sub.child_count > 0 && (
                                        <div className="text-xs text-gray-500">{sub.child_count} sub-subcategories</div>
                                      )}
                                    </div>
                                  </label>
                                </div>
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

      {/* Benchmark Configuration Panel */}
      {showBenchmarkConfig && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Benchmark Configuration</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowBenchmarkConfig(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">Life → Non-Life</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue={45}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">Non-Life → Life</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue={60}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Default Benchmark (%)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue={50}
                  className="w-16 px-2 py-1 text-sm border rounded"
                  min="0"
                  max="100"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Cell Detail */}
      {selectedCellData && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Cross-sell Analysis: {selectedCellData.fromCategory} → {selectedCellData.toCategory}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {setSelectedCell(null); setSelectedCellData(null);}}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(selectedCellData.conversionRate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Benchmark</div>
                <div className="text-2xl font-bold text-gray-600">
                  {(selectedCellData.benchmark * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Potential Customers</div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedCellData.potentialCustomers.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Revenue Potential</div>
                <div className="text-2xl font-bold text-green-600">
                  €{Math.round(selectedCellData.revenue / 1000)}K
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar - simplified version matching screenshot */}
      {selectedCellData && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              (selectedCellData.conversionRate * 100) >= 70 ? 'bg-emerald-500' :
              (selectedCellData.conversionRate * 100) >= 55 ? 'bg-green-500' :
              (selectedCellData.conversionRate * 100) >= 40 ? 'bg-amber-500' :
              (selectedCellData.conversionRate * 100) >= 25 ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-900 font-medium">
              {selectedCellData.fromCategory} → {selectedCellData.toCategory}
            </span>
            <Badge variant="outline" className="text-xs">
              {selectedCellData.priority.charAt(0).toUpperCase() + selectedCellData.priority.slice(1)} Priority
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600 ml-2"
              onClick={() => setSelectedCellData(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear selection
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={onCreateOpportunity} 
              className="bg-[#5567E5] hover:bg-[#4456D4] text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Creëer Kans
            </Button>
            <Button variant="outline" size="sm" onClick={onCreateCampaign}>
              <Zap className="w-4 h-4 mr-2" />
              Campaign
            </Button>
            <Button variant="outline" size="sm" onClick={onCreateList}>
              <Users className="w-4 h-4 mr-2" />
              Add to List
            </Button>
          </div>
        </div>
      )}

      {/* Matrix Display */}
      {selectedHorizontalProducts.length > 0 && selectedVerticalProducts.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cross-sell Analysis Matrix</CardTitle>
            <CardDescription className="text-sm">
              Conversion rates vs market benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 border-b"></th>
                    {selectedVerticalProducts.map(categoryId => {
                      const category = categories.find(cat => cat.id.toString() === categoryId);
                      return (
                        <th key={categoryId} className="p-2 text-center text-xs font-medium text-gray-500 border-b min-w-[120px]">
                          {category?.name || categoryId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {selectedHorizontalProducts.map(fromCategoryId => {
                    const fromCategory = categories.find(cat => cat.id.toString() === fromCategoryId);
                    return (
                      <tr key={fromCategoryId}>
                        <td className="p-2 text-left text-xs font-medium text-gray-700 border-r min-w-[100px]">
                          {fromCategory?.name || fromCategoryId}
                        </td>
                        {selectedVerticalProducts.map(toCategoryId => {
                          const toCategory = categories.find(cat => cat.id.toString() === toCategoryId);
                          const cellData = generateMatrixData(fromCategory?.name || fromCategoryId, toCategory?.name || toCategoryId);
                          if (!cellData) {
                            return (
                              <td key={toCategoryId} className="p-1">
                              <div className="h-20 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-400">—</span>
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={toCategoryId} className="p-1">
                            <div 
                              className={`h-20 rounded border cursor-pointer transition-all duration-200 p-2 ${getCellColor(cellData.conversionRate)} ${
                                selectedCellData?.fromCategory === (fromCategory?.name || fromCategoryId) && selectedCellData?.toCategory === (toCategory?.name || toCategoryId)
                                  ? 'ring-2 ring-blue-500 ring-offset-1' 
                                  : ''
                              }`}
                              onClick={() => handleCellClick(fromCategory?.name || fromCategoryId, toCategory?.name || toCategoryId)}
                            >
                              <div className="text-center h-full flex flex-col justify-center">
                                <div className="text-lg font-bold text-gray-900">
                                  {(cellData.conversionRate * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-600">
                                  vs {(cellData.benchmark * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {cellData.potentialCustomers} customers
                                </div>
                                <div className="text-xs text-green-600 font-medium">
                                  €{Math.round(cellData.revenue / 1000)}k potential
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p className="text-sm">Select categories for both axes to generate the cross-sell matrix</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}