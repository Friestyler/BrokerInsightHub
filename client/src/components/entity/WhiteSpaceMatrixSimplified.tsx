import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Zap, Users, Settings } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  level: number;
  parent_id?: number;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedHorizontalCategories, setSelectedHorizontalCategories] = useState<string[]>([]);
  const [selectedVerticalCategories, setSelectedVerticalCategories] = useState<string[]>([]);
  const [selectedCellData, setSelectedCellData] = useState<SelectedCellData | null>(null);
  const [showConfigPanels, setShowConfigPanels] = useState(false);

  // Create hierarchical items for dropdown
  const hierarchicalItems = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    level: cat.level
  }));

  // Initialize with main categories
  useEffect(() => {
    const mainCategories = ['Pensioen', 'Inkomen Collectief', 'Schade Zakelijk', 'Overige'];
    setSelectedHorizontalCategories(mainCategories);
    setSelectedVerticalCategories(mainCategories);
  }, []);

  // Generate matrix data with conversion rates
  const generateMatrixData = (from: string, to: string) => {
    if (from === to) return null;
    
    // Generate consistent hash-based conversion rate (10-89%)
    const hash = from.charCodeAt(0) + to.charCodeAt(0) + from.length + to.length;
    const conversionRate = 0.10 + (hash % 80) / 100; // 10-89%
    
    // Generate benchmark (independent market baseline)
    const benchmarkHash = (from.charCodeAt(0) * 7 + to.charCodeAt(0) * 11) % 100;
    const benchmark = 0.30 + (benchmarkHash % 40) / 100; // 30-70%
    
    const potentialCustomers = 50 + (hash % 200);
    const revenue = potentialCustomers * (1000 + (hash % 3000));
    
    // Priority based on conversion rate
    let priority = 'low';
    if (conversionRate >= 0.70) priority = 'high';
    else if (conversionRate >= 0.55) priority = 'medium';
    else if (conversionRate >= 0.40) priority = 'medium';
    
    return {
      fromCategory: from,
      toCategory: to,
      conversionRate,
      benchmark,
      revenue,
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
    <div className="space-y-4">
      {/* Category Selection */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Matrix Configuration</CardTitle>
          <CardDescription>
            Select categories for cross-sell analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
      {selectedHorizontalCategories.length > 0 && selectedVerticalCategories.length > 0 ? (
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
                    {selectedVerticalCategories.map(category => (
                      <th key={category} className="p-2 text-center text-xs font-medium text-gray-500 border-b min-w-[120px]">
                        {category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedHorizontalCategories.map(fromCategory => (
                    <tr key={fromCategory}>
                      <td className="p-2 text-left text-xs font-medium text-gray-700 border-r min-w-[100px]">
                        {fromCategory}
                      </td>
                      {selectedVerticalCategories.map(toCategory => {
                        const cellData = generateMatrixData(fromCategory, toCategory);
                        if (!cellData) {
                          return (
                            <td key={toCategory} className="p-1">
                              <div className="h-20 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-400">—</span>
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={toCategory} className="p-1">
                            <div 
                              className={`h-20 rounded border cursor-pointer transition-all duration-200 p-2 ${getCellColor(cellData.conversionRate)} ${
                                selectedCellData?.fromCategory === fromCategory && selectedCellData?.toCategory === toCategory
                                  ? 'ring-2 ring-blue-500 ring-offset-1' 
                                  : ''
                              }`}
                              onClick={() => handleCellClick(fromCategory, toCategory)}
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
                  ))}
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