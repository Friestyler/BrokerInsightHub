import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { BarChart3, Search, Settings, Target, X, Star, Send, Users, List, DollarSign, TrendingUp, Download, Filter, Eye, ChevronDown, ChevronRight, ChevronUp, Zap, Brain, Sparkles, Clock, Calendar, User, Building, Bot, CheckCircle, Play, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { AggregatedPortfolioCards } from "@/components/portfolio/AggregatedPortfolioCards";
import { AggregatedSmartAlerts } from "@/components/portfolio/AggregatedSmartAlerts";
import CustomersPageClean from "./lists/CustomersPage";

// Fetch authentic product categories with hierarchy
const useProductCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      // Return raw hierarchical data for smart UX
      return data.filter(item => !item.parent_id);
    }
  });
};

// Fetch hierarchical data for product configuration
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
                  type: 'subsubcategory',
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

// Fetch authentic products data
const useProducts = () => {
  return useQuery({
    queryKey: ['/api/products'],
    select: (data: any[]) => {
      return data.map(product => ({
        id: product.id.toString(),
        name: product.name,
        provider: product.provider,
        category: product.category || 'Uncategorized',
        totalValue: product.totalValue || 0,
        premiumValue: product.premiumValue || 0
      }));
    }
  });
};

const customerSegments = [
  { id: 'all', name: 'Alle segmenten', count: 5127 },
  { id: 'young_families', name: 'Jonge gezinnen', count: 1234 },
  { id: 'empty_nesters', name: 'Empty nesters', count: 987 },
  { id: 'singles', name: 'Alleenstaanden', count: 876 },
  { id: 'seniors', name: 'Senioren', count: 654 }
];

// Cross-sell matrix data with realistic insurance cross-sell rates
type CrossSellData = {
  rate: number;
  benchmark: number;
  customers: number;
  potential: number;
  maxValue: number;
  expectedRevenue: number;
};

const crossSellData: Record<string, CrossSellData> = {
  'auto-home': { rate: 72, benchmark: 80, customers: 1210, potential: 470, maxValue: 300000, expectedRevenue: 67000 },
  'auto-life': { rate: 45, benchmark: 50, customers: 800, potential: 350, maxValue: 250000, expectedRevenue: 45000 },
  'home-auto': { rate: 68, benchmark: 75, customers: 1190, potential: 560, maxValue: 285000, expectedRevenue: 64000 },
  'home-life': { rate: 82, benchmark: 65, customers: 668, potential: 144, maxValue: 175000, expectedRevenue: 39000 },
  'life-auto': { rate: 35, benchmark: 40, customers: 450, potential: 280, maxValue: 180000, expectedRevenue: 32000 },
  'life-home': { rate: 75, benchmark: 70, customers: 500, potential: 200, maxValue: 138000, expectedRevenue: 31000 }
};

function getCellColor(rate: number): string {
  if (rate >= 70) return 'bg-emerald-100 border-emerald-200'; // High potential - soft emerald
  if (rate >= 55) return 'bg-green-50 border-green-100'; // Good potential - subtle green
  if (rate >= 40) return 'bg-amber-50 border-amber-100'; // Medium potential - soft amber
  if (rate >= 25) return 'bg-orange-50 border-orange-100'; // Lower potential - soft orange
  return 'bg-red-50 border-red-100'; // Low potential - soft red
}

function getBenchmarkIcon(rate: number, benchmark: number): string {
  const diff = rate - benchmark;
  if (diff >= 10) return '🎯';
  if (diff >= 0) return '✅';
  if (diff >= -5) return '⚠️';
  return '🔴';
}

// Dashboard Filters Component
function DashboardFilters() {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState('all');

  // Fetch partners data
  const { data: partners = [] } = useQuery({ queryKey: ['/api/partners'] });

  // Provider options
  const providers = [
    { id: 'all', name: 'All Providers' },
    { id: 'de_goudse', name: 'De Goudse' },
    { id: 'nn_group', name: 'NN Group' },
    { id: 'aegon', name: 'Aegon' },
    { id: 'allianz', name: 'Allianz' }
  ];

  // Customer segments
  const customerSegments = [
    { id: 'all', name: 'All Segments' },
    { id: 'young_families', name: 'Young Families' },
    { id: 'empty_nesters', name: 'Empty Nesters' },
    { id: 'singles', name: 'Singles' },
    { id: 'seniors', name: 'Seniors' }
  ];

  return (
    <Card className="bg-[#E6E7F1] border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Portfolio Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Customer Segment Selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Customer Segment
            </Label>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {customerSegments.map(segment => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Provider
            </Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Partner Selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Partner
            </Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {Array.isArray(partners) && partners.map((partner: any) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Section Component with Aggregated Data
function DashboardSection() {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<string | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Fetch aggregated portfolio data
  const { data: aggregatedPortfolioData, isLoading: isAggregatedLoading } = useQuery({
    queryKey: ['/api/portfolio-overview-aggregated'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch authentic data for product list
  const { data: customers = { data: [] } } = useQuery({ queryKey: ['/api/customers'] });
  const { data: opportunities = [] } = useQuery({ queryKey: ['/api/opportunities'] });
  const { data: products = [] } = useQuery({ queryKey: ['/api/products'] });
  const { data: categories = [] } = useQuery({ queryKey: ['/api/product-categories'] });
  
  // Fetch product assignments for detailed view
  const { data: productAssignments = [] } = useQuery({ 
    queryKey: ['/api/product-assignments-all']
  });

  // Calculate basic data for category analysis
  const totalCustomers = Array.isArray((customers as any)?.data) ? (customers as any).data.length : 0;
  
  // Build product analysis data from authentic database
  const productCategories = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(products)) {
      console.log('Missing data:', { categories: !!categories, products: !!products });
      return [];
    }
    
    console.log('Processing categories:', categories.length, 'products:', products.length);
    
    return (categories as any[]).map(category => {
      // Find products in this category - check multiple possible relationships
      const categoryProducts = (products as any[]).filter(product => 
        product.categoryId === category.id || 
        product.category === category.name ||
        product.categoryName === category.name ||
        product.parent_category_name === category.name ||
        // Map specific categories to parent categories
        (category.name === 'Non-Life' && (
          product.parent_category_name === 'Business' ||
          product.parent_category_name === 'Health' ||
          product.parent_category_name === 'Mobility' ||
          product.parent_category_name === 'Property & Liability'
        )) ||
        (category.name === 'Life' && (
          product.parent_category_name === 'Life' ||
          product.category?.toLowerCase().includes('life') ||
          product.category?.toLowerCase().includes('death') ||
          product.category?.toLowerCase().includes('pension')
        )) ||
        (category.name === 'Services' && (
          product.parent_category_name === 'Travel' ||
          product.category?.toLowerCase().includes('service')
        ))
      );
      
      console.log(`Category ${category.name}: found ${categoryProducts.length} products`);
      
      // Calculate metrics for this category
      const totalValue = categoryProducts.reduce((sum, product) => {
        const value = typeof product.totalValue === 'string' 
          ? parseFloat(product.totalValue.replace(/[^0-9.-]+/g, '')) || 0
          : product.totalValue || 0;
        return sum + value;
      }, 0);
      
      // Calculate current customers (products with relationships)
      const currentCustomers = categoryProducts.reduce((sum, product) => {
        const customers = product.customersCount || product.customers_count || 0;
        return sum + customers;
      }, 0);
      
      // Create realistic data based on category type and authentic base
      let baseCustomers = currentCustomers;
      if (baseCustomers === 0) {
        // Generate realistic customer counts based on insurance category type
        if (category.name.toLowerCase().includes('life') || category.name.toLowerCase().includes('leven')) {
          baseCustomers = Math.floor(totalCustomers * 0.18) + Math.floor(Math.random() * 50); // 18% for life insurance
        } else if (category.name.toLowerCase().includes('health') || category.name.toLowerCase().includes('zorg') || category.name.toLowerCase().includes('hospitalization')) {
          baseCustomers = Math.floor(totalCustomers * 0.72) + Math.floor(Math.random() * 100); // 72% for health insurance  
        } else if (category.name.toLowerCase().includes('auto') || category.name.toLowerCase().includes('car') || category.name.toLowerCase().includes('mobility')) {
          baseCustomers = Math.floor(totalCustomers * 0.58) + Math.floor(Math.random() * 80); // 58% for auto insurance
        } else if (category.name.toLowerCase().includes('property') || category.name.toLowerCase().includes('fire') || category.name.toLowerCase().includes('home')) {
          baseCustomers = Math.floor(totalCustomers * 0.45) + Math.floor(Math.random() * 60); // 45% for property
        } else if (category.name.toLowerCase().includes('travel') || category.name.toLowerCase().includes('reis')) {
          baseCustomers = Math.floor(totalCustomers * 0.28) + Math.floor(Math.random() * 40); // 28% for travel
        } else if (category.name.toLowerCase().includes('business') || category.name.toLowerCase().includes('liability')) {
          baseCustomers = Math.floor(totalCustomers * 0.35) + Math.floor(Math.random() * 50); // 35% for business
        } else {
          baseCustomers = Math.floor(totalCustomers * 0.22) + Math.floor(Math.random() * 30); // 22% default
        }
      }
      
      // Calculate potential based on total customers minus current
      const potential = Math.max(0, Math.floor(totalCustomers * 0.6) - baseCustomers);
      
      // Calculate penetration rate
      const penetration = totalCustomers > 0 ? (baseCustomers / totalCustomers) * 100 : 0;
      
      return {
        name: category.name,
        current: baseCustomers,
        potential: potential,
        value: totalValue || Math.floor(baseCustomers * 2500), // €2500 average per customer if no value
        penetration: penetration,
        color: category.color,
        productCount: Math.max(categoryProducts.length, 1) // Always show categories
      };
    }).filter(cat => cat.name); // Show all categories with names
  }, [categories, products, totalCustomers]);

  // Filter products based on selected category
  const filteredProductsForCategory = useMemo(() => {
    if (!selectedCategoryForProducts) {
      // If no category selected, return all product assignments
      return Array.isArray(productAssignments) ? productAssignments : [];
    }
    
    if (!Array.isArray(productAssignments)) return [];
    
    return (productAssignments as any[]).filter(product => 
      product.categoryName === selectedCategoryForProducts ||
      product.parentCategoryName === selectedCategoryForProducts ||
      // Map specific categories to parent categories
      (selectedCategoryForProducts === 'Pensioen' && (
        product.categoryName?.toLowerCase().includes('pensioen') ||
        product.parentCategoryName?.toLowerCase().includes('pensioen')
      )) ||
      (selectedCategoryForProducts === 'Inkomen Collectief' && (
        product.categoryName?.toLowerCase().includes('inkomen') ||
        product.parentCategoryName?.toLowerCase().includes('inkomen')
      )) ||
      (selectedCategoryForProducts === 'Schade Zakelijk' && (
        product.categoryName?.toLowerCase().includes('schade') ||
        product.parentCategoryName?.toLowerCase().includes('schade')
      )) ||
      (selectedCategoryForProducts === 'Overige' && (
        product.categoryName?.toLowerCase().includes('overige') ||
        product.parentCategoryName?.toLowerCase().includes('overige')
      ))
    );
  }, [selectedCategoryForProducts, productAssignments]);

  // Filter products based on search and selected product
  const filteredProducts = productCategories.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedProduct === 'all' || product.name === selectedProduct;
    return matchesSearch && matchesFilter;
  });

  // Handle category card click
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategoryForProducts(categoryName);
    setShowProductDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Customer Segment, Provider, and Partner Selectors */}
      <DashboardFilters />

      {/* Aggregated Portfolio Cards */}
      <AggregatedPortfolioCards 
        portfolioData={aggregatedPortfolioData} 
        isLoading={isAggregatedLoading}
        onCategoryClick={handleCategoryClick}
        selectedCategory={selectedCategoryForProducts}
      />

      {/* Smart Alerts */}
      <AggregatedSmartAlerts 
        alerts={aggregatedPortfolioData?.smartAlerts || []} 
        isLoading={isAggregatedLoading} 
      />

      {/* Product Portfolio Section - Similar to customer detail page */}
      <div className="mt-8">

        {/* Product List by Category */}
        <div className="space-y-6">
          {(() => {
            // Group products by category
            const groupedProducts = filteredProductsForCategory.reduce((acc: any, product: any) => {
              const categoryName = product.parentCategoryName || product.categoryName || 'Other';
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              acc[categoryName].push(product);
              return acc;
            }, {});

            // Get category color mapping
            const categoryColors: Record<string, string> = {
              'Pensioen': '#8B5CF6',
              'Inkomen Collectief': '#06B6D4', 
              'Schade Zakelijk': '#EF4444',
              'Overige': '#F59E0B'
            };

            return Object.entries(groupedProducts).map(([categoryName, products]: [string, any]) => {
              const categoryColor = categoryColors[categoryName] || '#6B7280';
              const totalValue = (products as any[]).reduce((sum, product) => {
                const value = product.totalValue || product.premiumValue || 0;
                return sum + (typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value);
              }, 0);

              return (
                <Card key={categoryName} className="border-l-4" style={{ borderLeftColor: categoryColor }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <CardTitle className="text-lg">{categoryName} ({(products as any[]).length})</CardTitle>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Total value: €{totalValue.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(products as any[]).map((product: any, index: number) => (
                        <div key={product.productId || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{product.productName}</h4>
                                {product.providerName && (
                                  <Badge variant="outline" className="text-xs">
                                    {product.providerName}
                                  </Badge>
                                )}
                              </div>
                              {product.productDescription && (
                                <p className="text-sm text-gray-600 mb-2">{product.productDescription}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {product.averagePrice && (
                                  <span>Price: €{typeof product.averagePrice === 'string' ? product.averagePrice : product.averagePrice.toFixed(2)}</span>
                                )}
                                {product.premiumPercentage && (
                                  <span>Premium: {product.premiumPercentage}%</span>
                                )}
                                {product.contractStartDate && (
                                  <span>Contract: {new Date(product.contractStartDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {product.customersCount || 0}
                            </div>
                            <div className="text-xs text-gray-500">Customers</div>
                            {product.totalValue && (
                              <div className="text-xs text-green-600 font-medium">
                                €{typeof product.totalValue === 'string' 
                                  ? parseFloat(product.totalValue.replace(/[^0-9.-]+/g, '')).toLocaleString()
                                  : product.totalValue.toLocaleString()
                                }
                              </div>
                            )}
                            {product.premiumValue && (
                              <div className="text-xs text-purple-600 font-medium">
                                €{typeof product.premiumValue === 'string' 
                                  ? parseFloat(product.premiumValue.replace(/[^0-9.-]+/g, '')).toLocaleString()
                                  : product.premiumValue.toLocaleString()
                                } Total Premium
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            });
          })()}
        </div>
      </div>

    </div>
  );
}



export default function PortfolioInsights() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [conversionRate, setConversionRate] = useState([20]);
  const [selectedHorizontalProducts, setSelectedHorizontalProducts] = useState<string[]>([]);
  const [selectedVerticalProducts, setSelectedVerticalProducts] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [showProductConfig, setShowProductConfig] = useState(false);
  const [showBenchmarkConfig, setShowBenchmarkConfig] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Set<string>>(new Set());

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
  const matrixProducts = horizontalProducts; // Use horizontal products for main matrix display

  const getCellData = (fromProduct: string, toProduct: string): CrossSellData | null => {
    if (fromProduct === toProduct) return null;
    
    // Generate realistic placeholder data based on category IDs
    const fromId = parseInt(fromProduct);
    const toId = parseInt(toProduct);
    
    // Create more varied rates with better contrast
    const hashValue = (fromId * 37 + toId * 41) % 100;
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
    const customers = 30 + ((fromId + toId * 2) % 180);
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

  const selectedCellData = selectedCell ? (() => {
    const [fromId, toId] = selectedCell.split('-');
    return getCellData(fromId, toId);
  })() : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Top Navigation */}
      <div className="flex space-x-1 mb-10">
        <Button 
          variant="ghost" 
          className={activeSection === 'dashboard' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('dashboard')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <Button 
          variant="ghost"
          className={activeSection === 'smartcustomerlists' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('smartcustomerlists')}
        >
          <List className="h-4 w-4 mr-2" />
          Smart Customer Lists
        </Button>

        <Button 
          variant="ghost"
          className={activeSection === 'whitespace' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('whitespace')}
        >
          <Search className="h-4 w-4 mr-2" />
          White Space Analysis
        </Button>

        <Button 
          variant="ghost"
          className={activeSection === 'smartcrosssell' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('smartcrosssell')}
        >
          <Zap className="h-4 w-4 mr-2" />
          Smart Cross Sell
        </Button>

      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <DashboardSection />
      )}

      {/* Smart Customer Lists Section - Exact duplicate of CustomersPage */}
      {activeSection === 'smartcustomerlists' && (
        <CustomersPageClean />
      )}

      {/* White Space Analysis Section */}
      {activeSection === 'whitespace' && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cross-sell & Upsell Matrix</h1>
            <p className="text-gray-600">Analyseer klantaantallen en potentiële waarden per productcombinatie</p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Filters Section */}
            <Card className="bg-[#E6E7F1] border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Matrix Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer Segment Selector */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Customer Segment
                    </Label>
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                      <SelectTrigger>
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

                  {/* Provider Selector */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Provider
                    </Label>
                    <Select value="all" onValueChange={() => {}}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="de_goudse">De Goudse</SelectItem>
                        <SelectItem value="nn_group">NN Group</SelectItem>
                        <SelectItem value="aegon">Aegon</SelectItem>
                        <SelectItem value="allianz">Allianz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Partner Selector */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Partner
                    </Label>
                    <Select value="all" onValueChange={() => {}}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        <SelectItem value="willis">Willis B.V</SelectItem>
                        <SelectItem value="zicht">Zicht B.V</SelectItem>
                        <SelectItem value="mevas">Mevas B.V</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-6">
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

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowBenchmarkConfig(!showBenchmarkConfig)}>
                  <Target className="h-4 w-4 mr-1" />
                  Benchmarks
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowProductConfig(!showProductConfig)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Products
                </Button>
              </div>
            </div>
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

                                    {/* Sub-subcategories */}
                                    {!isSubCollapsed && sub.subSubcategories && sub.subSubcategories.map((subSub: any) => (
                                      <label key={`h-subsub-${subSub.id}`} className="flex items-center space-x-3 p-1.5 rounded hover:bg-white cursor-pointer group ml-6">
                                        <input
                                          type="checkbox"
                                          checked={selectedHorizontalProducts.includes(subSub.id.toString())}
                                          onChange={(e) => {
                                            const subSubId = subSub.id.toString();
                                            if (e.target.checked) {
                                              setSelectedHorizontalProducts([...selectedHorizontalProducts, subSubId]);
                                            } else {
                                              setSelectedHorizontalProducts(selectedHorizontalProducts.filter(p => p !== subSubId));
                                            }
                                          }}
                                          className="rounded"
                                        />
                                        <div 
                                          className="w-2 h-2 rounded-full flex-shrink-0" 
                                          style={{ backgroundColor: subSub.color || sub.color || category.color }}
                                        />
                                        <span className="text-sm text-gray-700">{subSub.name}</span>
                                      </label>
                                    ))}

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

                                    {/* Sub-subcategories */}
                                    {!isSubCollapsed && sub.subSubcategories && sub.subSubcategories.map((subSub: any) => (
                                      <label key={`v-subsub-${subSub.id}`} className="flex items-center space-x-3 p-1.5 rounded hover:bg-white cursor-pointer group ml-6">
                                        <input
                                          type="checkbox"
                                          checked={selectedVerticalProducts.includes(subSub.id.toString())}
                                          onChange={(e) => {
                                            const subSubId = subSub.id.toString();
                                            if (e.target.checked) {
                                              setSelectedVerticalProducts([...selectedVerticalProducts, subSubId]);
                                            } else {
                                              setSelectedVerticalProducts(selectedVerticalProducts.filter(p => p !== subSubId));
                                            }
                                          }}
                                          className="rounded"
                                        />
                                        <div 
                                          className="w-2 h-2 rounded-full flex-shrink-0" 
                                          style={{ backgroundColor: subSub.color || sub.color || category.color }}
                                        />
                                        <span className="text-sm text-gray-700">{subSub.name}</span>
                                      </label>
                                    ))}

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

          {/* Benchmark Configuration Panel */}
          {showBenchmarkConfig && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Benchmark Configuratie</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowBenchmarkConfig(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {Object.entries(crossSellData).map(([key, data]) => {
                    const [from, to] = key.split('-');
                    return (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{from.charAt(0).toUpperCase() + from.slice(1)} → {to.charAt(0).toUpperCase() + to.slice(1)}</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={data.benchmark}
                            className="w-16 px-2 py-1 text-sm border rounded"
                            min="0"
                            max="100"
                            readOnly
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    );
                  })}
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

          {/* Overview Cards */}
          {!selectedCell ? (
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Total Overview</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowProductConfig(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Segment: All segments • {Object.values(crossSellData).reduce((acc, data) => acc + data.customers, 0).toLocaleString()} customers</div>
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
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Send className="h-3 w-3 mr-1" />
                      Start Campagne
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="h-3 w-3 mr-1" />
                      Creëer Opportuniteit
                    </Button>
                    <Button variant="outline" size="sm">
                      <List className="h-3 w-3 mr-1" />
                      Creëer Klanten Lijst
                    </Button>
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
              className={activeTab === 'matrix' ? "bg-[#E1E4FB] text-[#3E4DC4]" : "hover:bg-[#F5F6FE] hover:text-[#5567E5]"}
              onClick={() => setActiveTab('matrix')}
            >
              Klanten & Potentieel Matrix
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className={activeTab === 'opportunities' ? "bg-[#E1E4FB] text-[#3E4DC4]" : "hover:bg-[#F5F6FE] hover:text-[#5567E5]"}
              onClick={() => setActiveTab('opportunities')}
            >
              Top Kansen
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className={activeTab === 'insights' ? "bg-[#E1E4FB] text-[#3E4DC4]" : "hover:bg-[#F5F6FE] hover:text-[#5567E5]"}
              onClick={() => setActiveTab('insights')}
            >
              Segment Inzichten
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
                                  Has both: {cellData.customers}
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
                            {data.rate}% cross-sell rate • {data.potential} potentiële klanten • €{Math.round(data.maxValue / data.potential)} gem. waarde
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">€{Math.round(data.maxValue / 1000)}K</div>
                        <div className="text-sm text-gray-600">totaal potentieel</div>
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
                <CardTitle className="mb-4">Segment Overzicht</CardTitle>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{currentSegment?.count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Klanten in {currentSegment?.name}</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">Auto → Woon</div>
                    <div className="text-sm text-gray-600">Beste cross-sell kans voor dit segment</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <CardTitle className="mb-4">Conversie Impact</CardTitle>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Bij 10% conversie:</span>
                    <span className="font-medium">€245K verwacht</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bij 20% conversie:</span>
                    <span className="font-medium">€490K verwacht</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bij 30% conversie:</span>
                    <span className="font-medium">€735K verwacht</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Smart Cross Sell Section */}
      {activeSection === 'smartcrosssell' && (
        <SmartCrossSellSection />
      )}
    </div>
  );
}

// Smart Cross Sell Portfolio Section
function SmartCrossSellSection() {
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);

  const handleAnalyze = async (analysisType: string) => {
    setIsAnalyzing(true);
    setActiveAnalysis(analysisType);
    
    try {
      // For aggregated portfolio analysis, we'll use a special endpoint
      const response = await fetch('/api/degoudse/portfolio/smart-cross-sell', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform AI response into results format
      const transformedResults = data.opportunities.map((opportunity: any) => ({
        id: opportunity.id.toString(),
        name: opportunity.title,
        description: opportunity.description,
        probability: `${opportunity.probability}%`,
        totalPremium: opportunity.revenueLabel,
        avgPremium: `€${Math.round(opportunity.revenueAmount / 3)}`,
        crossSellPotential: `€${opportunity.revenueAmount.toLocaleString()}`,
        products: [opportunity.productName],
        priority: opportunity.priority
      }));
      
      setAnalysisResults(transformedResults);
      
    } catch (error) {
      console.error('Error fetching Smart Cross Sell analysis:', error);
      
      // Fallback to overview
      setActiveAnalysis(null);
      setAnalysisResults([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToOverview = () => {
    setActiveAnalysis(null);
    setAnalysisResults([]);
  };

  // Show analysis results if we have an active analysis
  if (activeAnalysis && analysisResults.length > 0) {
    return (
      <div className="space-y-6">
        {/* Back to Overview Button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToOverview}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Back to overview</span>
          </Button>
          <div className="text-sm text-gray-600">
            {analysisResults.length} results found
          </div>
        </div>

        {/* Structured Results List */}
        <div className="bg-white rounded-lg border border-[#E6E7F1]">
          <div className="p-4 border-b border-[#E6E7F1]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#282A3F] text-lg">
                {activeAnalysis === 'customer' && `Customer Cross-Sell Opportunities (${analysisResults.length})`}
                {activeAnalysis === 'strategic' && `Summer Trending Products Analysis (${analysisResults.length})`}
                {activeAnalysis === 'custom' && `Custom Analysis (${analysisResults.length})`}
              </h3>
              <div className="text-sm text-gray-500">
                Total value: {analysisResults.reduce((sum, result) => {
                  const value = parseInt(result.crossSellPotential.replace(/[€,]/g, ''));
                  return sum + value;
                }, 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#E6E7F1]">
            {analysisResults.map((result, index) => (
              <div key={result.id} className="p-6 hover:bg-[#F8F9FA] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-[#5567E5] rounded-full"></div>
                      <h4 className="font-semibold text-[#282A3F] text-lg">{result.name}</h4>
                      {result.priority && (
                        <Badge 
                          variant="outline" 
                          className={
                            result.priority === 'High' 
                              ? 'bg-red-50 text-red-600 border-red-200' 
                              : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }
                        >
                          {result.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.products.map((product: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-[#F8F9FA] text-gray-700">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right space-y-2 ml-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-[#5567E5]">
                          {result.probability}
                        </div>
                        <div className="text-xs text-gray-500">Probability</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{result.totalPremium}</div>
                        <div className="text-xs text-gray-500">Total Premium</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-[#5567E5]">{result.avgPremium}</div>
                        <div className="text-xs text-gray-500">Avg Premium</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-[#E6E7F1]">
                      <div className="text-sm text-gray-600">
                        Potential: <span className="font-semibold text-[#5567E5]">{result.crossSellPotential}</span>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-[#5567E5] hover:bg-[#4556D4] text-white ml-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create campaign
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state during analysis
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5567E5] mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing cross-sell opportunities...</p>
        </div>
      </div>
    );
  }

  // Show summary cards (default view)
  return (
    <div className="space-y-6">
      {/* Top Row - Customer Cross-Sell and Summer Trending Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Cross-Sell Opportunities */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-[#E6E7F1] flex flex-col" onClick={() => handleAnalyze('customer')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#5567E5] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Customer Cross-Sell Opportunities</CardTitle>
                  <CardDescription>Identify upsell potential in existing customer base</CardDescription>
                </div>
              </div>
              <Play className="w-5 h-5 text-[#5567E5]" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Opportunities</span>
                <span className="font-semibold text-[#5567E5]">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Potential</span>
                <span className="font-semibold text-green-600">€156,800</span>
              </div>
              <div className="flex-1 min-h-[60px]"></div>
            </div>
            <div className="pt-3 flex justify-center">
              <Button 
                className="bg-[#5567E5] hover:bg-[#4556D4] text-white font-medium rounded-lg h-10 justify-between px-4 min-w-[180px]"
              >
                <div className="flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  <span>Analyze insights</span>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summer Trending Products */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-[#E6E7F1] flex flex-col" onClick={() => handleAnalyze('strategic')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#5567E5] rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Summer Trending Products</CardTitle>
                  <CardDescription>Top 3 seasonal insurance products for summer 2025</CardDescription>
                </div>
              </div>
              <Play className="w-5 h-5 text-[#5567E5]" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Travel Insurance</span>
                <span className="font-semibold text-green-600">€45,200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Recreational Vehicle</span>
                <span className="font-semibold text-green-600">€38,600</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">3. Event & Festival</span>
                <span className="font-semibold text-green-600">€29,800</span>
              </div>
              <div className="flex-1 min-h-[20px]"></div>
            </div>
            <div className="pt-3 flex justify-center">
              <Button 
                className="bg-[#5567E5] hover:bg-[#4556D4] text-white font-medium rounded-lg h-10 justify-between px-4 min-w-[180px]"
              >
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  <span>Analyze trends</span>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Analysis Card */}
      <Card className="border-[#E6E7F1]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#5567E5] rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Custom Analysis</CardTitle>
                <CardDescription>Tailored cross-sell insights with custom prompting</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCustomExpanded(!isCustomExpanded)}
            >
              Configure parameters
              {isCustomExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardHeader>
        
        {isCustomExpanded && (
          <CardContent className="border-t border-[#E6E7F1] pt-6">
            <div className="space-y-6">
              {/* Free Prompt */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Free Prompt
                </Label>
                <textarea
                  className="w-full min-h-[80px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
                  placeholder="Enter your custom analysis prompt or specific requirements..."
                />
              </div>

              {/* Market Dynamic and Customer Segment Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Market Dynamic
                  </Label>
                  <textarea
                    className="w-full min-h-[80px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
                    placeholder="Current market trends, economic factors, regulatory changes..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Customer Segment
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Free Text" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free-text">Free Text</SelectItem>
                      <SelectItem value="high-value">High-Value Customers</SelectItem>
                      <SelectItem value="new-customers">New Customers</SelectItem>
                      <SelectItem value="inactive">Inactive Customers</SelectItem>
                    </SelectContent>
                  </Select>
                  <textarea
                    className="w-full min-h-[60px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent mt-2"
                    placeholder="Target customer profiles, demographics, business sectors..."
                  />
                </div>
              </div>

              {/* Partner Context and Product Segment Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Partner Context
                  </Label>
                  <textarea
                    className="w-full min-h-[80px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
                    placeholder="Partner strengths, focus areas, client base characteristics..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Segment
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Free Text" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free-text">Free Text</SelectItem>
                      <SelectItem value="life-insurance">Life Insurance</SelectItem>
                      <SelectItem value="non-life">Non-Life Insurance</SelectItem>
                      <SelectItem value="business-insurance">Business Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                  <textarea
                    className="w-full min-h-[60px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent mt-2"
                    placeholder="Product categories, coverage types, premium ranges..."
                  />
                </div>
              </div>

              {/* Strategy NN */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Strategy NN
                </Label>
                <textarea
                  className="w-full min-h-[80px] p-3 border border-[#E6E7F1] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
                  placeholder="NN Group strategic priorities, product focus, growth initiatives..."
                />
              </div>

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  className="bg-[#5567E5] hover:bg-[#4556D4] text-white font-medium px-8 py-3 text-base"
                  onClick={() => handleAnalyze('custom')}
                >
                  Generate custom analysis
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

