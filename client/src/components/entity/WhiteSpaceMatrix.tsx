import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, TrendingUp, Users, DollarSign, Zap, Plus, Filter, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface WhiteSpaceMatrixProps {
  entityType: "partner" | "customer";
  entityId: string;
  entityName?: string;
  onCreateOpportunity: () => void;
  onCreateCampaign: () => void;
  onCreateList: () => void;
}

interface Category {
  id: number;
  name: string;
  color: string;
  parent_id?: number;
  level: number;
  subcategories?: Category[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
}

interface MatrixCell {
  fromCategory: string;
  toCategory: string;
  conversionRate: number;
  benchmark: number;
  potentialCustomers: number;
  revenue: number;
  priority: "high" | "medium" | "low";
}

export default function WhiteSpaceMatrix({ 
  entityType, 
  entityId, 
  entityName,
  onCreateOpportunity,
  onCreateCampaign,
  onCreateList 
}: WhiteSpaceMatrixProps) {
  const { environment } = useEnvironment();
  const [selectedHorizontalCategories, setSelectedHorizontalCategories] = useState<string[]>([]);
  const [selectedVerticalCategories, setSelectedVerticalCategories] = useState<string[]>([]);
  const [selectedCellData, setSelectedCellData] = useState<MatrixCell | null>(null);
  const [conversionRates, setConversionRates] = useState<{[key: string]: number}>({});
  const [benchmarkAdjustment, setBenchmarkAdjustment] = useState<number>(1);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: true
  });

  // Fetch entity products
  const { data: products = [] } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/products`],
    enabled: !!entityId
  });

  // Get main categories (level 1)
  const mainCategories = categories.filter((cat: any) => cat.level === 1);
  
  // Get subcategories for selected main categories
  const getSubcategories = (parentId: number) => {
    return categories.filter((cat: any) => cat.parent_id === parentId);
  };

  // Auto-initialize with main categories when data loads
  useEffect(() => {
    if (mainCategories.length > 0 && !isInitialized) {
      const mainCategoryNames = mainCategories.map((cat: any) => cat.name);
      setSelectedHorizontalCategories(mainCategoryNames);
      setSelectedVerticalCategories(mainCategoryNames);
      setIsInitialized(true);
    }
  }, [mainCategories, isInitialized]);

  // Create hierarchical structure for category selection
  const createHierarchicalItems = () => {
    const items: any[] = [];
    
    mainCategories.forEach((category: any) => {
      // Add main category
      items.push({
        id: `category-${category.id}`,
        name: category.name,
        color: category.color,
        level: 1,
        type: 'category',
        categoryId: category.id
      });
      
      // Add subcategories
      const subcategories = getSubcategories(category.id);
      subcategories.forEach((subcat: any) => {
        items.push({
          id: `subcategory-${subcat.id}`,
          name: subcat.name,
          color: subcat.color,
          level: 2,
          type: 'subcategory',
          parentId: category.id,
          categoryId: subcat.id
        });
      });
    });
    
    return items;
  };

  const hierarchicalItems = createHierarchicalItems();

  // Generate realistic matrix data based on actual insurance categories - matching Portfolio Insights logic
  const generateMatrixData = (): MatrixCell[] => {
    const matrixData: MatrixCell[] = [];
    
    selectedHorizontalCategories.forEach(fromCategory => {
      selectedVerticalCategories.forEach(toCategory => {
        if (fromCategory !== toCategory) {
          // Create consistent hash-based calculation like Portfolio Insights
          const fromHash = fromCategory.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const toHash = toCategory.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const hashValue = (fromHash * 37 + toHash * 41) % 100;
          
          // Generate varied distribution for better visual contrast - matching Portfolio Insights
          let baseRate: number;
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
          
          const conversionRate = baseRate / 100; // Convert to decimal
          
          // Calculate benchmark as a realistic market benchmark (usually different from actual rate)
          const benchmark = Math.max(0.15, (baseRate + ((fromHash - toHash) % 20) - 10)) / 100;
          
          // Calculate other metrics
          const potentialCustomers = 30 + ((fromHash + toHash * 2) % 180);
          const avgDealSize = fromCategory === "Pensioen" ? 3500 : fromCategory === "Schade Zakelijk" ? 2800 : 1800;
          const revenue = Math.floor(potentialCustomers * avgDealSize * (0.8 + (hashValue % 40) / 100));
          
          // Priority based on how much actual rate exceeds benchmark
          let priority: "high" | "medium" | "low" = "low";
          const diff = conversionRate - benchmark;
          if (diff > 0.15) priority = "high";
          else if (diff > 0.05) priority = "medium";
          
          matrixData.push({
            fromCategory,
            toCategory,
            conversionRate,
            benchmark,
            potentialCustomers,
            revenue,
            priority
          });
        }
      });
    });
    
    return matrixData;
  };

  const matrixData = generateMatrixData();

  // Get color for cell based on conversion rate - matching Portfolio Insights logic
  const getCellColor = (cell: MatrixCell) => {
    const rate = cell.conversionRate * 100; // Convert to percentage for comparison
    if (rate >= 70) return 'bg-emerald-50 border-emerald-100 text-emerald-800'; // High potential - soft emerald
    if (rate >= 55) return 'bg-green-50 border-green-100 text-green-800'; // Good potential - subtle green
    if (rate >= 40) return 'bg-amber-50 border-amber-100 text-amber-800'; // Medium potential - soft amber
    if (rate >= 25) return 'bg-orange-50 border-orange-100 text-orange-800'; // Lower potential - soft orange
    return 'bg-red-50 border-red-100 text-red-800'; // Low potential - soft red
  };

  return (
    <div className="w-full space-y-4">
      {/* Configuration Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Product Configuration</CardTitle>
              <CardDescription className="text-sm">
                Select product categories for cross-sell analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Benchmark:</Label>
              <div className="w-20">
                <Slider
                  value={[benchmarkAdjustment]}
                  onValueChange={(value) => setBenchmarkAdjustment(value[0])}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-gray-500">{(benchmarkAdjustment * 100).toFixed(0)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Horizontal Axis (From)</Label>
              <Select onValueChange={(value) => {
                if (!selectedHorizontalCategories.includes(value)) {
                  setSelectedHorizontalCategories([...selectedHorizontalCategories, value]);
                }
              }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select categories..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {hierarchicalItems.map((item: any) => (
                    <SelectItem key={item.id} value={item.name}>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {selectedHorizontalCategories.map(category => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs cursor-pointer"
                    onClick={() => setSelectedHorizontalCategories(prev => 
                      prev.filter(c => c !== category)
                    )}
                  >
                    {category} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Vertical Axis (To)</Label>
              <Select onValueChange={(value) => {
                if (!selectedVerticalCategories.includes(value)) {
                  setSelectedVerticalCategories([...selectedVerticalCategories, value]);
                }
              }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select categories..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {hierarchicalItems.map((item: any) => (
                    <SelectItem key={item.id} value={item.name}>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {selectedVerticalCategories.map(category => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs cursor-pointer"
                    onClick={() => setSelectedVerticalCategories(prev => 
                      prev.filter(c => c !== category)
                    )}
                  >
                    {category} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Display */}
      {selectedHorizontalCategories.length > 0 && selectedVerticalCategories.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cross-sell Analysis Matrix</CardTitle>
            <CardDescription className="text-sm">
              Conversion rates vs market benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Matrix Header */}
                <div className="grid gap-1 mb-1" style={{ 
                  gridTemplateColumns: `100px repeat(${selectedVerticalCategories.length}, 1fr)` 
                }}>
                  <div className="p-2 text-xs font-medium text-gray-500">From → To</div>
                  {selectedVerticalCategories.map(category => (
                    <div key={category} className="p-1 text-xs font-medium text-center text-gray-700 bg-gray-50 rounded">
                      {category}
                    </div>
                  ))}
                </div>
                
                {/* Matrix Rows */}
                {selectedHorizontalCategories.map(fromCategory => (
                  <div 
                    key={fromCategory} 
                    className="grid gap-1 mb-1" 
                    style={{ 
                      gridTemplateColumns: `100px repeat(${selectedVerticalCategories.length}, 1fr)` 
                    }}
                  >
                    <div className="p-2 text-xs font-medium text-gray-700 bg-gray-50 rounded flex items-center">
                      {fromCategory}
                    </div>
                    {selectedVerticalCategories.map(toCategory => {
                      const cell = matrixData.find(d => 
                        d.fromCategory === fromCategory && d.toCategory === toCategory
                      );
                      if (!cell) return <div key={toCategory} className="p-1" />;
                      
                      return (
                        <div 
                          key={toCategory}
                          className={`p-2 border rounded cursor-pointer transition-all hover:shadow-md ${getCellColor(cell)} ${
                            selectedCellData?.fromCategory === cell.fromCategory && 
                            selectedCellData?.toCategory === cell.toCategory ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedCellData(cell)}
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-bold">
                              {(cell.conversionRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs opacity-80">
                              vs {(cell.benchmark * 100).toFixed(1)}%
                            </div>
                            <div className="border-t border-current opacity-20 my-1"></div>
                            <div className="text-xs font-medium">
                              {cell.potentialCustomers} customers
                            </div>
                            <div className="text-xs opacity-80">
                              €{Math.round(cell.revenue / 1000)}k value
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Please select products in the configuration panel to display the matrix</p>
            <p className="text-xs text-gray-400">Choose categories for both horizontal and vertical axes</p>
          </CardContent>
        </Card>
      )}

      {/* Action Bar - appears when cell is selected */}
      {selectedCellData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    (selectedCellData.conversionRate * 100) >= 70 ? 'bg-emerald-500' :
                    (selectedCellData.conversionRate * 100) >= 55 ? 'bg-green-500' :
                    (selectedCellData.conversionRate * 100) >= 40 ? 'bg-amber-500' :
                    (selectedCellData.conversionRate * 100) >= 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedCellData.fromCategory} → {selectedCellData.toCategory}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {selectedCellData.priority.charAt(0).toUpperCase() + selectedCellData.priority.slice(1)} Priority
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {(selectedCellData.conversionRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">Conversion Rate</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      {(selectedCellData.benchmark * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">Market Benchmark</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-green-600">
                      €{Math.round(selectedCellData.revenue / 1000)}k
                    </span>
                    <span className="text-xs text-gray-500">Revenue Potential</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      {selectedCellData.potentialCustomers}
                    </span>
                    <span className="text-xs text-gray-500">Target Customers</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={onCreateOpportunity} 
                  className="bg-[#5567E5] hover:bg-[#4456D4] text-white px-6 py-2 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Creëer Kans
                </Button>
                <Button variant="outline" onClick={onCreateCampaign} className="shadow-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Campaign
                </Button>
                <Button variant="outline" onClick={onCreateList} className="shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Add to List
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCellData(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <span className="text-xl">×</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}