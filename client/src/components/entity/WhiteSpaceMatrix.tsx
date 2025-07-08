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

  // Generate realistic matrix data based on actual insurance categories
  const generateMatrixData = (): MatrixCell[] => {
    const matrixData: MatrixCell[] = [];
    
    selectedHorizontalCategories.forEach(fromCategory => {
      selectedVerticalCategories.forEach(toCategory => {
        if (fromCategory !== toCategory) {
          const key = `${fromCategory}-${toCategory}`;
          
          // Create realistic conversion rates based on insurance product relationships
          let baseRate = 0.20; // Base 20% conversion rate
          
          // Adjust rates based on category relationships
          if (fromCategory === "Pensioen" && toCategory === "Inkomen Collectief") baseRate = 0.45;
          if (fromCategory === "Inkomen Collectief" && toCategory === "Pensioen") baseRate = 0.38;
          if (fromCategory === "Schade Zakelijk" && toCategory === "Inkomen Collectief") baseRate = 0.32;
          if (fromCategory === "Pensioen" && toCategory === "Schade Zakelijk") baseRate = 0.25;
          
          const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
          const conversionRate = Math.max(0.05, Math.min(0.70, baseRate + variation));
          
          const benchmark = conversionRate * (0.7 + Math.random() * 0.4) * benchmarkAdjustment; // 70-110% of conversion rate
          const potentialCustomers = Math.floor(Math.random() * 40) + 15;
          const avgDealSize = fromCategory === "Pensioen" ? 2500 : fromCategory === "Schade Zakelijk" ? 1800 : 1200;
          const revenue = potentialCustomers * avgDealSize * (0.8 + Math.random() * 0.4);
          
          let priority: "high" | "medium" | "low" = "low";
          if (conversionRate > benchmark + 0.1) priority = "high";
          else if (conversionRate > benchmark - 0.05) priority = "medium";
          
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

  // Get color for cell based on performance vs benchmark
  const getCellColor = (cell: MatrixCell) => {
    const diff = cell.conversionRate - cell.benchmark;
    if (diff > 0.15) return "bg-emerald-100 border-emerald-300 text-emerald-800";
    if (diff > 0.05) return "bg-green-100 border-green-300 text-green-800";
    if (diff > -0.05) return "bg-amber-100 border-amber-300 text-amber-800";
    if (diff > -0.15) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-red-100 border-red-300 text-red-800";
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
                          <div className="text-xs font-bold mb-1">
                            {(cell.conversionRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs opacity-75 mb-1">
                            vs {(cell.benchmark * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs font-medium">
                            {cell.potentialCustomers} customers
                          </div>
                          <div className="text-xs opacity-75">
                            €{Math.round(cell.revenue / 1000)}k potential
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#5567E5]" />
                  <span className="font-semibold text-gray-900">
                    {selectedCellData.fromCategory} → {selectedCellData.toCategory}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Conversion:</span>
                    <span className="font-semibold text-blue-600">
                      {(selectedCellData.conversionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Benchmark:</span>
                    <span className="font-semibold text-gray-700">
                      {(selectedCellData.benchmark * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Potential:</span>
                    <span className="font-semibold text-green-600">
                      €{Math.round(selectedCellData.revenue / 1000)}k
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-semibold text-gray-700">
                      {selectedCellData.potentialCustomers}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={onCreateOpportunity} 
                  className="bg-[#5567E5] hover:bg-[#4456D4] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Creëer Kans
                </Button>
                <Button variant="outline" onClick={onCreateCampaign}>
                  <Zap className="w-4 h-4 mr-2" />
                  Campaign
                </Button>
                <Button variant="outline" onClick={onCreateList}>
                  <Users className="w-4 h-4 mr-2" />
                  Add to List
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCellData(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}