import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Search, Settings, Target, X, Star, Send, Users, List, DollarSign, TrendingUp, Download, Filter, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

// Dashboard Section Component
function DashboardSection() {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Fetch authentic data
  const { data: customers = { data: [] } } = useQuery({ queryKey: ['/api/customers'] });
  const { data: opportunities = [] } = useQuery({ queryKey: ['/api/opportunities'] });
  const { data: products = [] } = useQuery({ queryKey: ['/api/products'] });
  const { data: categories = [] } = useQuery({ queryKey: ['/api/product-categories'] });

  // Calculate KPI data from authentic data
  const totalCustomers = Array.isArray((customers as any)?.data) ? (customers as any).data.length : 0;
  const totalOpportunities = Array.isArray(opportunities) ? (opportunities as any[]).length : 0;
  
  // Calculate potential value from opportunities
  const potentialValue = Array.isArray(opportunities) 
    ? (opportunities as any[]).reduce((sum: number, opp: any) => {
        const value = typeof opp.estimatedValue === 'string' 
          ? parseFloat(opp.estimatedValue.replace(/[^0-9.-]+/g, '')) || 0
          : opp.estimatedValue || 0;
        return sum + value;
      }, 0)
    : 0;

  // Calculate cross-sell potential from customer data
  const crossSellPotential = Math.floor(totalCustomers * 0.65); // 65% of customers have cross-sell potential
  
  // Build product analysis data from authentic database
  const productCategories = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(products)) return [];
    
    return (categories as any[]).map(category => {
      // Find products in this category
      const categoryProducts = (products as any[]).filter(product => 
        product.categoryId === category.id || 
        product.category === category.name
      );
      
      // Calculate metrics for this category
      const totalValue = categoryProducts.reduce((sum, product) => {
        const value = typeof product.totalValue === 'string' 
          ? parseFloat(product.totalValue.replace(/[^0-9.-]+/g, '')) || 0
          : product.totalValue || 0;
        return sum + value;
      }, 0);
      
      // Calculate current customers (products with relationships)
      const currentCustomers = categoryProducts.reduce((sum, product) => {
        return sum + (product.customersCount || 0);
      }, 0);
      
      // Estimate potential based on total customers minus current
      const potential = Math.max(0, Math.floor(totalCustomers * 0.4) - currentCustomers);
      
      // Calculate penetration rate
      const penetration = totalCustomers > 0 ? (currentCustomers / totalCustomers) * 100 : 0;
      
      return {
        name: category.name,
        current: currentCustomers,
        potential: potential,
        value: totalValue,
        penetration: penetration,
        color: category.color,
        productCount: categoryProducts.length
      };
    }).filter(cat => cat.productCount > 0); // Only show categories with products
  }, [categories, products, totalCustomers]);

  // Chart data based on authentic database
  const penetrationChartData = productCategories.map(category => ({
    name: category.name.length > 15 ? category.name.substring(0, 12) + '...' : category.name,
    current: category.current,
    potential: category.potential
  }));

  // Calculate totals for pie chart from authentic data
  const totalCurrent = productCategories.reduce((sum, cat) => sum + cat.current, 0);
  const totalPotential = productCategories.reduce((sum, cat) => sum + cat.potential, 0);
  const upsellPotential = Math.floor(totalCurrent * 0.35); // 35% of current customers have upsell potential

  const pieChartData = [
    { name: 'Bestaande klanten', value: totalCurrent, color: '#6366f1' },
    { name: 'Cross-sell potentieel', value: totalPotential, color: '#a855f7' },
    { name: 'Upsell potentieel', value: upsellPotential, color: '#06b6d4' }
  ];

  // Calculate average penetration from authentic data
  const averagePenetration = productCategories.length > 0 
    ? productCategories.reduce((sum, cat) => sum + cat.penetration, 0) / productCategories.length 
    : 0;

  // Filter products based on search and selected product
  const filteredProducts = productCategories.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedProduct === 'all' || product.name === selectedProduct;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Analyse Dashboard</h1>
          <p className="text-gray-600 mt-1">Cross- en upsell kansen in uw klantenportefeuille</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Instellingen
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <Input
            placeholder="Zoek productcategorieën..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle producten</SelectItem>
            {productCategories.map(category => (
              <SelectItem key={category.name} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setShowMoreFilters(!showMoreFilters)}>
          <Filter className="h-4 w-4 mr-1" />
          Meer filters
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Klanten</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% vs vorige maand</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cross-sell Potentieel</p>
                <p className="text-2xl font-bold text-gray-900">{crossSellPotential.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Geschatte kansen</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potentiële Waarde</p>
                <p className="text-2xl font-bold text-gray-900">€{(potentialValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500 mt-1">Jaarlijkse premie potentieel</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gem. Penetratie</p>
                <p className="text-2xl font-bold text-gray-900">{averagePenetration.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Across alle producten</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Penetratie</CardTitle>
            <p className="text-sm text-gray-600">Huidige klanten vs. potentieel per product</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={penetrationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#6366f1" name="Huidige klanten" />
                <Bar dataKey="potential" fill="#a855f7" name="Potentieel" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Verdeling</CardTitle>
            <p className="text-sm text-gray-600">Huidige vs. potentiële klanten</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categorieën Detail</CardTitle>
          <p className="text-sm text-gray-600">Gedetailleerde analyse per productcategorie</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <Badge 
                      variant={product.penetration > 50 ? "default" : "secondary"}
                      className={product.penetration > 50 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {product.penetration}% penetratie
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">{product.current.toLocaleString()} klanten</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{product.potential.toLocaleString()} potentieel</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">€{(product.value / 1000000).toFixed(1)}M waarde</p>
                    </div>
                  </div>
                  <Progress value={product.penetration} className="h-2" />
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
          className={activeSection === 'whitespace' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('whitespace')}
        >
          <Search className="h-4 w-4 mr-2" />
          White Space Analysis
        </Button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <DashboardSection />
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
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-6">
              {/* Segment Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Klantensegment</span>
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
                <span className="text-sm font-medium">Conversie rate: {conversionRate[0]}%</span>
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
                {currentSegment?.name} - {currentSegment?.count.toLocaleString()} klanten
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowBenchmarkConfig(!showBenchmarkConfig)}>
                <Target className="h-4 w-4 mr-1" />
                Benchmarks
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowProductConfig(!showProductConfig)}>
                <Settings className="h-4 w-4 mr-1" />
                Producten
              </Button>
            </div>
          </div>

          {/* Product Configuration Panel */}
          {showProductConfig && (
            <Card className="border-2 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Product Configuratie</CardTitle>
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
                  <CardTitle className="text-lg">Totaal Overzicht</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowProductConfig(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Segment: Alle segmenten • {Object.values(crossSellData).reduce((acc, data) => acc + data.customers, 0).toLocaleString()} klanten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(crossSellData).reduce((acc, data) => acc + data.potential, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Totaal potentiële klanten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      €{Math.round(Object.values(crossSellData).reduce((acc, data) => acc + data.maxValue, 0) / 1000)}K
                    </div>
                    <div className="text-sm text-gray-600">Totaal max. potentieel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      €{Math.round(Object.values(crossSellData).reduce((acc, data) => acc + (data.expectedRevenue * conversionRate[0]) / 100, 0) / 1000)}K
                    </div>
                    <div className="text-sm text-gray-600">Bij {conversionRate[0]}% conversie</div>
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
                      <div className="text-sm text-gray-600">Potentiële klanten</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">€{Math.round(selectedCellData.maxValue / 1000)}K</div>
                      <div className="text-sm text-gray-600">Max. potentieel</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">€{Math.round((selectedCellData.expectedRevenue * conversionRate[0]) / 100000)}K</div>
                      <div className="text-sm text-gray-600">Bij {conversionRate[0]}% conversie</div>
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
              variant={activeTab === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('matrix')}
            >
              Klanten & Potentieel Matrix
            </Button>
            <Button 
              variant={activeTab === 'opportunities' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('opportunities')}
            >
              Top Kansen
            </Button>
            <Button 
              variant={activeTab === 'insights' ? 'default' : 'ghost'}
              size="sm"
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
    </div>
  );
}