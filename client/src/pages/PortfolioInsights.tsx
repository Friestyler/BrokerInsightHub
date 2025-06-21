import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, Settings, Target, X, Star, Send, Users, List } from "lucide-react";

// Mock data based on typical insurance cross-sell scenarios
const insuranceProducts = [
  { id: 'auto', name: 'Auto', category: 'Property' },
  { id: 'home', name: 'Woon', category: 'Property' },
  { id: 'life', name: 'Term Leven', category: 'Life' },
  { id: 'pension', name: 'Pensioen', category: 'Life' },
  { id: 'health', name: 'Gezondheid', category: 'Health' },
  { id: 'business', name: 'Bedrijf', category: 'Commercial' }
];

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

export default function PortfolioInsights() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [conversionRate, setConversionRate] = useState([20]);
  const [selectedProducts, setSelectedProducts] = useState(['auto', 'home', 'life', 'pension']);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [showProductConfig, setShowProductConfig] = useState(false);
  const [showBenchmarkConfig, setShowBenchmarkConfig] = useState(false);

  const currentSegment = customerSegments.find(s => s.id === selectedSegment);
  const matrixProducts = insuranceProducts.filter(p => selectedProducts.includes(p.id));

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
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio Dashboard</h2>
          <p className="text-gray-600">Dashboard content will be implemented here</p>
        </div>
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
                    <h4 className="font-medium mb-3">Horizontale As (4 geselecteerd)</h4>
                    <div className="space-y-2">
                      {insuranceProducts.map(product => (
                        <label key={`h-${product.id}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(p => p !== product.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Verticale As (4 geselecteerd)</h4>
                    <div className="space-y-2">
                      {insuranceProducts.map(product => (
                        <label key={`v-${product.id}`} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(p => p !== product.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      ))}
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
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 text-left">
                      <div className="text-sm font-medium">Heeft Product →</div>
                      <div className="text-xs text-gray-600">Wil Product ↓</div>
                    </th>
                    {matrixProducts.map(product => (
                      <th key={product.id} className="border p-2 bg-blue-50 text-center min-w-32">
                        <div className="font-medium">{product.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixProducts.map(rowProduct => (
                    <tr key={rowProduct.id}>
                      <td className="border p-2 bg-blue-50 font-medium">
                        {rowProduct.name}
                      </td>
                      {matrixProducts.map(colProduct => {
                        const cellData = getCellData(colProduct.id, rowProduct.id);
                        const isSelected = selectedCell === `${colProduct.id}-${rowProduct.id}`;
                        
                        if (!cellData) {
                          return (
                            <td key={colProduct.id} className="border p-2 bg-gray-100 text-center text-gray-400">
                              —
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
                                Heeft beide: {cellData.customers}
                              </div>
                              <div className="text-xs text-white">
                                Kan cross-sell: {cellData.potential}
                              </div>
                              <div className="text-xs text-white font-medium">
                                €{Math.round(cellData.maxValue / 1000)}K max. potentieel
                              </div>
                              <div className="text-xs text-white">
                                €{Math.round((cellData.expectedRevenue * conversionRate[0]) / 20000)}K bij {conversionRate[0]}% conversie
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