import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Search, Settings, Target, X, Star, Send, Users, List, DollarSign, TrendingUp, Download, Filter, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Fetch authentic product categories from database
const useProductCategories = () => {
  return useQuery({
    queryKey: ['/api/product-categories'],
    select: (data: any[]) => {
      // Transform hierarchical data into flattened product list for matrix
      const allProducts: any[] = [];
      
      data.filter(item => !item.parent_id).forEach(category => {
        // Add main category products
        if (category.product_count > 0) {
          allProducts.push({
            id: category.id.toString(),
            name: category.name,
            category: category.name,
            color: category.color,
            type: 'category'
          });
        }
        
        // Add subcategory products
        if (category.subcategories) {
          category.subcategories.forEach((sub: any) => {
            allProducts.push({
              id: sub.id.toString(),
              name: sub.name,
              category: category.name,
              color: sub.color || category.color,
              parentName: category.name,
              type: 'subcategory'
            });
            
            // Add sub-subcategory products
            if (sub.subSubcategories) {
              sub.subSubcategories.forEach((subSub: any) => {
                allProducts.push({
                  id: subSub.id.toString(),
                  name: subSub.name,
                  category: category.name,
                  color: subSub.color || sub.color || category.color,
                  parentName: `${category.name} > ${sub.name}`,
                  type: 'subsubcategory'
                });
              });
            }
          });
        }
      });
      
      return allProducts;
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
  if (rate >= 70) return 'bg-green-400';
  if (rate >= 50) return 'bg-green-300';
  if (rate >= 30) return 'bg-yellow-300';
  if (rate >= 15) return 'bg-orange-300';
  return 'bg-red-300';
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

  // Product analysis data
  const productCategories = [
    { name: 'Autoverzekering', current: 2847, potential: 1253, value: 2100000, penetration: 69.4 },
    { name: 'Woonverzekering', current: 1923, potential: 2177, value: 1800000, penetration: 46.9 },
    { name: 'Reisverzekering', current: 1456, potential: 2644, value: 980000, penetration: 35.5 },
    { name: 'Levensverzekering', current: 892, potential: 3208, value: 3200000, penetration: 21.8 },
    { name: 'Ziektekostenverzekering', current: 3421, potential: 679, value: 4100000, penetration: 83.4 },
    { name: 'Rechtsbijstandverzekering', current: 567, potential: 3533, value: 1100000, penetration: 13.8 }
  ];

  // Chart data
  const penetrationChartData = productCategories.map(category => ({
    name: category.name.replace('verzekering', ''),
    current: category.current,
    potential: category.potential
  }));

  const pieChartData = [
    { name: 'Bestaande klanten', value: 11106, color: '#6366f1' },
    { name: 'Cross-sell potentieel', value: 13494, color: '#a855f7' },
    { name: 'Upsell potentieel', value: 8234, color: '#06b6d4' }
  ];

  // Filter products based on search
  const filteredProducts = productCategories.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <SelectItem value="auto">Autoverzekering</SelectItem>
            <SelectItem value="woon">Woonverzekering</SelectItem>
            <SelectItem value="reis">Reisverzekering</SelectItem>
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
                <p className="text-2xl font-bold text-gray-900">13,494</p>
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
                <p className="text-2xl font-bold text-gray-900">45.1%</p>
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

  // Fetch authentic data
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  
  // Initialize selected products with first few categories
  const [initialized, setInitialized] = useState(false);
  if (!initialized && categories.length > 0) {
    const defaultSelection = categories.slice(0, 4).map(c => c.id);
    setSelectedHorizontalProducts(defaultSelection);
    setSelectedVerticalProducts(defaultSelection);
    setInitialized(true);
  }

  const currentSegment = customerSegments.find(s => s.id === selectedSegment);
  const horizontalProducts = categories.filter(c => selectedHorizontalProducts.includes(c.id));
  const verticalProducts = categories.filter(c => selectedVerticalProducts.includes(c.id));
  const matrixProducts = horizontalProducts; // Use horizontal products for main matrix display

  const getCellData = (fromProduct: string, toProduct: string): CrossSellData | null => {
    if (fromProduct === toProduct) return null;
    const key = `${fromProduct}-${toProduct}`;
    return crossSellData[key] || null;
  };

  const selectedCellData = selectedCell ? crossSellData[selectedCell] || null : null;

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
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categoriesLoading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                      ) : (
                        categories.map(category => (
                          <label key={`h-${category.id}`} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedHorizontalProducts.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHorizontalProducts([...selectedHorizontalProducts, category.id]);
                                } else {
                                  setSelectedHorizontalProducts(selectedHorizontalProducts.filter(p => p !== category.id));
                                }
                              }}
                              className="rounded"
                            />
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{category.name}</span>
                              {category.parentName && (
                                <div className="text-xs text-gray-500">{category.parentName}</div>
                              )}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Vertical Axis ({selectedVerticalProducts.length} selected)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categoriesLoading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                      ) : (
                        categories.map(category => (
                          <label key={`v-${category.id}`} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedVerticalProducts.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVerticalProducts([...selectedVerticalProducts, category.id]);
                                } else {
                                  setSelectedVerticalProducts(selectedVerticalProducts.filter(p => p !== category.id));
                                }
                              }}
                              className="rounded"
                            />
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{category.name}</span>
                              {category.parentName && (
                                <div className="text-xs text-gray-500">{category.parentName}</div>
                              )}
                            </div>
                          </label>
                        ))
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

          {/* Selected Cell Detail */}
          {selectedCellData && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedCell?.replace('-', ' → ').toUpperCase()}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectedCellData.rate}%</div>
                    <div className="text-sm text-gray-600">Cross-sell rate</div>
                    <div className="text-xs text-gray-500">vs {selectedCellData.benchmark}% benchmark</div>
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
                    <div className="text-2xl font-bold text-orange-600">€{Math.round(selectedCellData.expectedRevenue / 1000)}K</div>
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
                                  <span className="font-bold text-white">{cellData.rate}%</span>
                                  <span className="text-xs">{getBenchmarkIcon(cellData.rate, cellData.benchmark)}</span>
                                </div>
                                <div className="text-xs text-white opacity-90">
                                  vs {cellData.benchmark}% benchmark
                                </div>
                                <div className="text-xs text-white">
                                  {cellData.rate > cellData.benchmark ? '+' : ''}{cellData.rate - cellData.benchmark}%
                                </div>
                                <div className="text-xs text-white font-medium">
                                  Has both: {cellData.customers}
                                </div>
                                <div className="text-xs text-white">
                                  Cross-sell potential: {cellData.potential}
                                </div>
                                <div className="text-xs text-white font-medium">
                                  €{Math.round(cellData.maxValue / 1000)}K max potential
                                </div>
                                <div className="text-xs text-white">
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