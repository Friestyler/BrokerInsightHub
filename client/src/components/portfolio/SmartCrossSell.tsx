import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Target, DollarSign, Users, X, Plus, Play, ChevronDown, ChevronUp, List, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface SmartCrossSellProps {
  entityType: 'partners' | 'customers';
  entityId: string;
  onCreateOpportunity?: () => void;
}

interface AnalysisResult {
  id: string;
  name: string;
  description: string;
  opportunities?: string;
  probability?: string;
  totalPremium: string;
  avgPremium: string;
  crossSellPotential: string;
  products: string[];
  priority?: string;
}

export function SmartCrossSell({ entityType, entityId, onCreateOpportunity }: SmartCrossSellProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);
  const [customPrompt, setCustomPrompt] = useState({
    freePrompt: '',
    marketDynamic: '',
    partnerContext: '',
    strategyNN: '',
    customerSegment: '',
    customerSegmentType: 'text', // 'text', 'list', 'segment'
    customerSegmentSelection: '',
    productSegment: '',
    productSegmentType: 'text', // 'text', 'category'
    productSegmentSelection: ''
  });
  const { toast } = useToast();

  // Fetch data for selections
  const { data: savedLists = [] } = useQuery({
    queryKey: ['/api/degoudse/saved-lists'],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-lists?entity_type=customers')
  });

  const { data: savedSegments = [] } = useQuery({
    queryKey: ['/api/degoudse/saved-views'],
    queryFn: () => apiRequest('GET', '/api/degoudse/saved-views?entity_type=customers')
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/degoudse/categories'],
    queryFn: () => apiRequest('GET', '/api/degoudse/categories')
  });

  const handleAnalyze = async (analysisType: string) => {
    setIsAnalyzing(true);
    setActiveAnalysis(analysisType);
    
    try {
      let response;
      
      if (analysisType === 'custom') {
        // For custom analysis, send structured prompting data
        const customPromptData = {
          freePrompt: customPrompt.freePrompt,
          marketDynamic: customPrompt.marketDynamic,
          partnerContext: customPrompt.partnerContext,
          strategyNN: customPrompt.strategyNN,
          customerSegment: customPrompt.customerSegment,
          customerSegmentType: customPrompt.customerSegmentType,
          customerSegmentSelection: customPrompt.customerSegmentSelection,
          productSegment: customPrompt.productSegment,
          productSegmentType: customPrompt.productSegmentType,
          productSegmentSelection: customPrompt.productSegmentSelection
        };
        
        response = await apiRequest('POST', `/api/degoudse/${entityType}/${entityId}/smart-cross-sell`, {
          analysisType: 'custom',
          customPrompt: customPromptData
        });
      } else {
        // For standard analysis types (seasonal, strategic, customer)
        response = await apiRequest('GET', `/api/degoudse/${entityType}/${entityId}/smart-cross-sell`);
      }
      
      // Transform AI response into AnalysisResult format
      const transformedResults: AnalysisResult[] = response.opportunities.map((opportunity: any) => ({
        id: opportunity.id.toString(),
        name: opportunity.title,
        description: opportunity.description,
        probability: `${opportunity.probability}%`,
        totalPremium: opportunity.revenueLabel,
        avgPremium: `€${Math.round(opportunity.revenueAmount / 3)}`, // Estimated average
        crossSellPotential: `€${opportunity.revenueAmount.toLocaleString()}`,
        products: [opportunity.productName],
        priority: opportunity.priority
      }));
      
      setAnalysisResults(transformedResults);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${transformedResults.length} ${analysisType === 'custom' ? 'custom' : 'seasonal'} cross-sell opportunities`,
      });
      
    } catch (error) {
      console.error('Error fetching Smart Cross Sell analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate cross-sell analysis. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to overview if API fails
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

  const handleCreateOpportunity = () => {
    if (onCreateOpportunity) {
      onCreateOpportunity();
    } else {
      setIsModalOpen(true);
    }
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

        {/* Structured Results List - Similar to Product Categories */}
        <div className="bg-white rounded-lg border border-[#E6E7F1]">
          <div className="p-4 border-b border-[#E6E7F1]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#282A3F] text-lg">
                {activeAnalysis === 'customer' && `Customer Opportunities (${analysisResults.length})`}
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
                          {activeAnalysis === 'customer' ? result.opportunities : result.probability}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activeAnalysis === 'customer' ? 'Opportunities' : 'Probability'}
                        </div>
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
                        onClick={handleCreateOpportunity}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Creëer kans
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Opportunity Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
              <DialogDescription>
                Create a new cross-sell opportunity based on the analysis results.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Opportunity Title</Label>
                <Input id="title" placeholder="Enter opportunity title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter opportunity description" />
              </div>
              <div>
                <Label htmlFor="value">Estimated Value</Label>
                <Input id="value" placeholder="€0" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)} className="bg-[#5567E5] hover:bg-[#4556D4]">
                Create Opportunity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              {/* Spacer to push button to bottom */}
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

        {/* Strategic Opportunities Analysis */}
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
              <div className="space-y-2">
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
              </div>
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

      {/* Custom Analysis - Full Width Below */}
      <Card className="border-[#E6E7F1]">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsCustomExpanded(!isCustomExpanded)}
        >
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Configure parameters</span>
              {isCustomExpanded ? (
                <ChevronUp className="w-5 h-5 text-[#5567E5]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#5567E5]" />
              )}
            </div>
          </div>
        </CardHeader>
        
        {isCustomExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Free Prompt Field */}
              <div>
                <Label htmlFor="freePrompt" className="text-sm font-medium text-gray-700">
                  Free Prompt
                </Label>
                <Textarea
                  id="freePrompt"
                  placeholder="Enter your custom analysis prompt or specific requirements..."
                  value={customPrompt.freePrompt}
                  onChange={(e) => setCustomPrompt(prev => ({ ...prev, freePrompt: e.target.value }))}
                  className="mt-1 h-20"
                />
              </div>

              {/* Custom Prompting Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="marketDynamic" className="text-sm font-medium text-gray-700">
                      Market Dynamic
                    </Label>
                    <Textarea
                      id="marketDynamic"
                      placeholder="Current market trends, economic factors, regulatory changes..."
                      value={customPrompt.marketDynamic}
                      onChange={(e) => setCustomPrompt(prev => ({ ...prev, marketDynamic: e.target.value }))}
                      className="mt-1 h-20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="partnerContext" className="text-sm font-medium text-gray-700">
                      Partner Context
                    </Label>
                    <Textarea
                      id="partnerContext"
                      placeholder="Partner strengths, focus areas, client base characteristics..."
                      value={customPrompt.partnerContext}
                      onChange={(e) => setCustomPrompt(prev => ({ ...prev, partnerContext: e.target.value }))}
                      className="mt-1 h-20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="strategyNN" className="text-sm font-medium text-gray-700">
                      Strategy NN
                    </Label>
                    <Textarea
                      id="strategyNN"
                      placeholder="NN Group strategic priorities, product focus, growth initiatives..."
                      value={customPrompt.strategyNN}
                      onChange={(e) => setCustomPrompt(prev => ({ ...prev, strategyNN: e.target.value }))}
                      className="mt-1 h-20"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Customer Segment with Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Customer Segment
                    </Label>
                    <div className="mt-1 space-y-2">
                      <Select
                        value={customPrompt.customerSegmentType}
                        onValueChange={(value) => setCustomPrompt(prev => ({ 
                          ...prev, 
                          customerSegmentType: value,
                          customerSegmentSelection: ''
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Free Text</SelectItem>
                          <SelectItem value="list">
                            <div className="flex items-center space-x-2">
                              <List className="w-4 h-4" />
                              <span>From Lists</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="segment">
                            <div className="flex items-center space-x-2">
                              <Layers className="w-4 h-4" />
                              <span>From Segments</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {customPrompt.customerSegmentType === 'text' && (
                        <Textarea
                          placeholder="Target customer profiles, demographics, business sectors..."
                          value={customPrompt.customerSegment}
                          onChange={(e) => setCustomPrompt(prev => ({ ...prev, customerSegment: e.target.value }))}
                          className="h-20"
                        />
                      )}
                      
                      {customPrompt.customerSegmentType === 'list' && (
                        <div className="space-y-2">
                          <Select
                            value={customPrompt.customerSegmentSelection}
                            onValueChange={(value) => setCustomPrompt(prev => ({ 
                              ...prev, 
                              customerSegmentSelection: value,
                              customerSegment: savedLists.find(list => list.id.toString() === value)?.name || ''
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer list" />
                            </SelectTrigger>
                            <SelectContent>
                              {savedLists.map((list) => (
                                <SelectItem key={list.id} value={list.id.toString()}>
                                  {list.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Additional customer segment context..."
                            value={customPrompt.customerSegment}
                            onChange={(e) => setCustomPrompt(prev => ({ ...prev, customerSegment: e.target.value }))}
                          />
                        </div>
                      )}
                      
                      {customPrompt.customerSegmentType === 'segment' && (
                        <div className="space-y-2">
                          <Select
                            value={customPrompt.customerSegmentSelection}
                            onValueChange={(value) => setCustomPrompt(prev => ({ 
                              ...prev, 
                              customerSegmentSelection: value,
                              customerSegment: savedSegments.find(segment => segment.id.toString() === value)?.name || ''
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer segment" />
                            </SelectTrigger>
                            <SelectContent>
                              {savedSegments.map((segment) => (
                                <SelectItem key={segment.id} value={segment.id.toString()}>
                                  {segment.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Additional customer segment context..."
                            value={customPrompt.customerSegment}
                            onChange={(e) => setCustomPrompt(prev => ({ ...prev, customerSegment: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Segment with Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Product Segment
                    </Label>
                    <div className="mt-1 space-y-2">
                      <Select
                        value={customPrompt.productSegmentType}
                        onValueChange={(value) => setCustomPrompt(prev => ({ 
                          ...prev, 
                          productSegmentType: value,
                          productSegmentSelection: ''
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Free Text</SelectItem>
                          <SelectItem value="category">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>From Categories</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {customPrompt.productSegmentType === 'text' && (
                        <Textarea
                          placeholder="Product categories, coverage types, premium ranges..."
                          value={customPrompt.productSegment}
                          onChange={(e) => setCustomPrompt(prev => ({ ...prev, productSegment: e.target.value }))}
                          className="h-20"
                        />
                      )}
                      
                      {customPrompt.productSegmentType === 'category' && (
                        <div className="space-y-2">
                          <Select
                            value={customPrompt.productSegmentSelection}
                            onValueChange={(value) => setCustomPrompt(prev => ({ 
                              ...prev, 
                              productSegmentSelection: value,
                              productSegment: categories.find(cat => cat.id.toString() === value)?.name || ''
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Additional product segment context..."
                            value={customPrompt.productSegment}
                            onChange={(e) => setCustomPrompt(prev => ({ ...prev, productSegment: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Analysis Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={() => handleAnalyze('custom')}
                      disabled={isAnalyzing}
                      className="w-full bg-[#5567E5] hover:bg-[#4556D4] text-white"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Generate custom analysis'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}