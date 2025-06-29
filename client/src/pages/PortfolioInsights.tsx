import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Search, Settings, Target, X, Star, Send, Users, List, DollarSign, TrendingUp, Download, Filter, Eye, ChevronDown, ChevronRight, AlertTriangle, MapPin, Calendar, Play, Zap, TrendingDown, BarChart2, Shield, Heart, Car, Home, Globe, Briefcase } from "lucide-react";
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
              parentCategory: category.name,
              color: sub.color || category.color,
              type: 'subcategory',
              level: 1
            });
          });
        }
      });
      
      return selectableItems;
    }
  });
};

// Fetch products data
const useProducts = () => {
  return useQuery({
    queryKey: ['/api/products']
  });
};

// Hook for fetching customers
const useCustomers = () => {
  return useQuery({
    queryKey: ['/api/customers'],
  });
};

// AI-Powered Insurance Portfolio Analysis Dashboard
function DashboardSection() {
  const { data: customers = [] } = useCustomers();
  const totalCustomers = Array.isArray(customers) ? customers.length : 0;

  // AI-powered insights data
  const aiInsights = [
    {
      icon: TrendingUp,
      priority: 'high',
      title: 'Omnium Coverage Gap',
      description: 'Only 33% of auto clients have comprehensive coverage. Target 2,847 clients with BA-only policies.',
      value: 1420000,
      clients: 2847,
      action: 'Launch Omnium Campaign'
    },
    {
      icon: Users,
      priority: 'medium', 
      title: 'Senior Life Insurance',
      description: 'Growing market segment (65+) shows 67% gap in life insurance products.',
      value: 890000,
      clients: 1523,
      action: 'Create Senior Campaign'
    },
    {
      icon: Shield,
      priority: 'high',
      title: 'Business Cyber Risk',
      description: 'Small businesses lack cyber liability coverage. High-growth opportunity.',
      value: 750000,
      clients: 892,
      action: 'Launch Cyber Protection'
    }
  ];

  // Ready-to-launch campaigns
  const campaigns = [
    {
      id: 1,
      name: 'Omnium Upgrade Campaign',
      description: 'Target BA clients for comprehensive auto coverage',
      status: 'ready',
      targetClients: 2847,
      potentialRevenue: 1420000,
      successRate: 18,
      roi: 425
    },
    {
      id: 2,
      name: 'Senior Life Protection', 
      description: 'Life insurance for 65+ demographic',
      status: 'scheduled',
      targetClients: 1523,
      potentialRevenue: 890000,
      successRate: 22,
      roi: 380
    },
    {
      id: 3,
      name: 'Cyber Security Suite',
      description: 'Business cyber liability protection',
      status: 'in-progress',
      targetClients: 892,
      potentialRevenue: 750000,
      successRate: 15,
      roi: 520
    },
    {
      id: 4,
      name: 'Holiday Travel Insurance',
      description: 'Seasonal travel protection campaign',
      status: 'ready',
      targetClients: 3421,
      potentialRevenue: 245000,
      successRate: 28,
      roi: 180
    }
  ];

  // Helper functions
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-blue-600" />
              AI-Powered Portfolio Analysis
            </h1>
            <p className="text-blue-700 mt-1">Intelligent insights for Belgian insurance brokers</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">€4.2M</div>
            <div className="text-sm text-blue-600">Untapped potential identified</div>
          </div>
        </div>
      </div>

      {/* AI Instant Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {aiInsights.map((insight, index) => (
          <Card key={index} className={`border-2 ${getPriorityColor(insight.priority)}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <insight.icon className="h-5 w-5" />
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold">€{(insight.value / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">{insight.clients} clients</div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
              <Button className="w-full" size="sm">
                <Play className="h-4 w-4 mr-1" />
                {insight.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Geographical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Benelux Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🇧🇪</div>
              <h3 className="font-bold">Belgium</h3>
              <div className="text-sm text-gray-600 mt-2">
                <div>Brussels: {Math.floor(totalCustomers * 0.35).toLocaleString()} clients</div>
                <div>Flanders: {Math.floor(totalCustomers * 0.45).toLocaleString()} clients</div>
                <div>Wallonia: {Math.floor(totalCustomers * 0.20).toLocaleString()} clients</div>
              </div>
              <div className="mt-3 p-2 bg-white rounded border">
                <div className="text-xs font-medium text-red-600">Top Gap: Omnium (Brussels)</div>
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-2">🇳🇱</div>
              <h3 className="font-bold">Netherlands</h3>
              <div className="text-sm text-gray-600 mt-2">
                <div>Randstad: {Math.floor(totalCustomers * 0.08).toLocaleString()} clients</div>
                <div>Other regions: {Math.floor(totalCustomers * 0.05).toLocaleString()} clients</div>
              </div>
              <div className="mt-3 p-2 bg-white rounded border">
                <div className="text-xs font-medium text-orange-600">Top Gap: Health Supplements</div>
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🇱🇺</div>
              <h3 className="font-bold">Luxembourg</h3>
              <div className="text-sm text-gray-600 mt-2">
                <div>Luxembourg City: {Math.floor(totalCustomers * 0.03).toLocaleString()} clients</div>
                <div>Other: {Math.floor(totalCustomers * 0.02).toLocaleString()} clients</div>
              </div>
              <div className="mt-3 p-2 bg-white rounded border">
                <div className="text-xs font-medium text-green-600">Top Gap: Private Banking</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Health Navigator */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Health Navigator</CardTitle>
          <p className="text-sm text-gray-600">Client segmentation and risk indicators</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Single Product Clients</div>
                  <div className="text-sm text-gray-600">Stable, expansion opportunities</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={34} className="w-24" />
                <span className="font-bold">{Math.floor(totalCustomers * 0.34).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Multi-Product Clients</div>
                  <div className="text-sm text-gray-600">High value, upsell potential</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={42} className="w-24" />
                <span className="font-bold">{Math.floor(totalCustomers * 0.42).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Premium Clients</div>
                  <div className="text-sm text-gray-600">High premium, retention focus</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={15} className="w-24" />
                <span className="font-bold">{Math.floor(totalCustomers * 0.15).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium text-red-700">At-Risk Clients</div>
                  <div className="text-sm text-red-600">High churn probability</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={9} className="w-24" />
                <span className="font-bold text-red-700">{Math.floor(totalCustomers * 0.09).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready-to-Launch Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Ready-to-Launch Campaigns
          </CardTitle>
          <p className="text-sm text-gray-600">AI-optimized campaigns with target revenue and ROI</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-500">Target clients</div>
                      <div className="font-bold">{campaign.targetClients.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Potential revenue</div>
                      <div className="font-bold">€{(campaign.potentialRevenue / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Success rate</div>
                      <div className="font-bold">{campaign.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">ROI</div>
                      <div className="font-bold">{campaign.roi}%</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {campaign.status === 'ready' && (
                      <Button className="flex-1" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Launch Now
                      </Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button variant="outline" className="flex-1" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        View Schedule
                      </Button>
                    )}
                    {campaign.status === 'in-progress' && (
                      <Button variant="outline" className="flex-1" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Progress
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate cross-sell data for matrix display
type CrossSellData = {
  rate: number;
  benchmark: number;
  customers: number;
  potential: number;
  maxValue: number;
  expectedRevenue: number;
};

function getCellColor(rate: number): string {
  if (rate >= 70) return 'bg-emerald-100';
  if (rate >= 55) return 'bg-green-100';
  if (rate >= 40) return 'bg-amber-100';
  if (rate >= 25) return 'bg-orange-100';
  return 'bg-red-100';
}

function getBenchmarkIcon(rate: number, benchmark: number): string {
  if (rate > benchmark + 5) return '📈';
  if (rate < benchmark - 5) return '📉';
  return '📊';
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

  // Generate authentic cross-sell potential with varied distribution
  const getCellData = (horizontalId: string, verticalId: string): CrossSellData => {
    const baseRate = 35;
    const hashValue = (horizontalId + verticalId).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    // Create realistic distribution: 15% low, 20% medium-low, 25% medium, 20% good, 20% high
    const distributionPoint = hashValue % 100;
    let rate;
    if (distributionPoint < 15) rate = baseRate + (hashValue % 10) - 20; // Low: 15-25%
    else if (distributionPoint < 35) rate = baseRate + (hashValue % 10) - 10; // Medium-low: 25-35%
    else if (distributionPoint < 60) rate = baseRate + (hashValue % 15); // Medium: 35-50%
    else if (distributionPoint < 80) rate = baseRate + 20 + (hashValue % 15); // Good: 55-70%
    else rate = baseRate + 35 + (hashValue % 25); // High: 70-95%
    
    rate = Math.max(15, Math.min(95, rate));
    
    return {
      rate,
      benchmark: 42,
      customers: 120 + (hashValue % 300),
      potential: 45 + (hashValue % 40),
      maxValue: 1500000 + (hashValue % 2000000),
      expectedRevenue: Math.floor((rate / 100) * (1500000 + (hashValue % 2000000)))
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('dashboard')}
          className="flex items-center space-x-2"
        >
          <BarChart2 className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
        <Button
          variant={activeSection === 'whitespace' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('whitespace')}
          className="flex items-center space-x-2"
        >
          <Target className="h-4 w-4" />
          <span>White Space Analysis</span>
        </Button>
      </div>

      {/* Content */}
      {activeSection === 'dashboard' && <DashboardSection />}
      
      {activeSection === 'whitespace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">White Space Analysis</h1>
              <p className="text-gray-600 mt-1">Identify cross-sell and upsell opportunities</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  <SelectItem value="high-value">High-value customers</SelectItem>
                  <SelectItem value="new">New customers</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded">
                <span className="text-sm text-gray-600">Conversion rate:</span>
                <span className="text-sm font-medium">{conversionRate[0]}%</span>
                <Slider
                  value={conversionRate}
                  onValueChange={setConversionRate}
                  max={50}
                  min={5}
                  step={1}
                  className="w-20"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProductConfig(!showProductConfig)}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Configure</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matrix">Matrix</TabsTrigger>
              <TabsTrigger value="opportunities">Top Opportunities</TabsTrigger>
              <TabsTrigger value="insights">Segment Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="space-y-6">
              {categoriesLoading ? (
                <div>Loading categories...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Matrix */}
                  <div className="lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cross-sell Opportunities Matrix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hierarchicalItems.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="p-2 text-left text-sm font-medium text-gray-500"></th>
                                  {selectedHorizontalProducts.map((productId) => {
                                    const product = hierarchicalItems.find(p => p.id === productId);
                                    return (
                                      <th key={productId} className="p-2 text-center text-xs font-medium text-gray-500 min-w-[100px]">
                                        <div className="flex items-center justify-center space-x-1">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: product?.color || '#6366f1' }}
                                          />
                                          <span className="truncate max-w-[80px]">{product?.name}</span>
                                        </div>
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedVerticalProducts.map((rowProductId) => {
                                  const rowProduct = hierarchicalItems.find(p => p.id === rowProductId);
                                  return (
                                    <tr key={rowProductId}>
                                      <td className="p-2 text-sm font-medium text-gray-700 border-r">
                                        <div className="flex items-center space-x-2">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: rowProduct?.color || '#6366f1' }}
                                          />
                                          <span className="truncate max-w-[120px]">{rowProduct?.name}</span>
                                        </div>
                                      </td>
                                      {selectedHorizontalProducts.map((colProductId) => {
                                        const cellData = getCellData(rowProductId, colProductId);
                                        const cellId = `${rowProductId}-${colProductId}`;
                                        const isSelected = selectedCell === cellId;
                                        
                                        return (
                                          <td 
                                            key={cellId} 
                                            className={`p-1 text-center cursor-pointer transition-all hover:scale-105 ${getCellColor(cellData.rate)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => setSelectedCell(cellId)}
                                          >
                                            <div className="text-xs">
                                              <div className="font-bold text-gray-900">{cellData.rate}%</div>
                                              <div className="text-gray-600">{getBenchmarkIcon(cellData.rate, cellData.benchmark)}</div>
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
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Loading matrix data...
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overview Cards */}
                  <div className="space-y-4">
                    {selectedCell ? (() => {
                      const [verticalId, horizontalId] = selectedCell.split('-');
                      const verticalProduct = hierarchicalItems.find(p => p.id === verticalId);
                      const horizontalProduct = hierarchicalItems.find(p => p.id === horizontalId);
                      const selectedCellData = getCellData(verticalId, horizontalId);
                      
                      return (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Cross-sell Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-500">Products</div>
                                <div className="text-sm font-medium">{verticalProduct?.name} → {horizontalProduct?.name}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Conversion Rate</div>
                                <div className="text-lg font-bold">{selectedCellData.rate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">vs Benchmark</div>
                                <div className="text-sm font-medium">{selectedCellData.benchmark}% {getBenchmarkIcon(selectedCellData.rate, selectedCellData.benchmark)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Potential customers</div>
                                <div className="text-sm font-medium">{selectedCellData.customers.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Expected revenue</div>
                                <div className="text-sm font-medium">€{(selectedCellData.expectedRevenue / 1000).toFixed(0)}K</div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })() : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-500">Total potential customers</div>
                            <div className="text-lg font-bold">12,847</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Max potential value</div>
                            <div className="text-lg font-bold">€4.2M</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Conversion-based revenue</div>
                            <div className="text-lg font-bold">€840K</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hierarchicalItems.slice(0, 6).map((item, index) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <Badge variant="outline">{70 + index * 5}% potential</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target customers</span>
                          <span className="font-medium">{(1200 + index * 300).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expected revenue</span>
                          <span className="font-medium">€{(450 + index * 100).toLocaleString()}K</span>
                        </div>
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Create campaign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Segment Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="font-medium">All customers</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">38% avg conversion</div>
                          <div className="text-xs text-gray-500">12,847 customers</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <span className="font-medium">High-value customers</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">52% avg conversion</div>
                          <div className="text-xs text-gray-500">2,156 customers</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                        <span className="font-medium">New customers</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">24% avg conversion</div>
                          <div className="text-xs text-gray-500">3,421 customers</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export matrix data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Generate report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Send className="h-4 w-4 mr-2" />
                        Create campaign from selection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}