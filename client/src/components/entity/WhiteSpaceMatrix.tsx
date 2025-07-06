import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, TrendingUp, Users, DollarSign, Zap, Plus, Filter, Settings } from "lucide-react";
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
                <SelectContent>
                  {mainCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
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
                <SelectContent>
                  {mainCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
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
                          className={`p-1 border rounded cursor-pointer transition-all hover:shadow-md ${getCellColor(cell)}`}
                          onClick={() => setSelectedCellData(cell)}
                        >
                          <div className="text-xs font-medium">
                            {(cell.conversionRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs opacity-75">
                            vs {(cell.benchmark * 100).toFixed(1)}%
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

      {/* Selected Cell Details */}
      {selectedCellData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-4 h-4" />
              {selectedCellData.fromCategory} → {selectedCellData.toCategory}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {(selectedCellData.conversionRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-blue-700">Conversion Rate</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">
                  {(selectedCellData.benchmark * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-700">Benchmark</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  €{Math.round(selectedCellData.revenue / 1000)}k
                </div>
                <div className="text-xs text-green-700">Revenue Potential</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={onCreateOpportunity} size="sm" className="flex-1">
                <Plus className="w-3 h-3 mr-1" />
                Create Opportunity
              </Button>
              <Button variant="outline" onClick={onCreateCampaign} size="sm" className="flex-1">
                <Zap className="w-3 h-3 mr-1" />
                Campaign
              </Button>
              <Button variant="outline" onClick={onCreateList} size="sm" className="flex-1">
                <Users className="w-3 h-3 mr-1" />
                Add to List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}