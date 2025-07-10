import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Target, DollarSign, Users, X, Plus, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const { toast } = useToast();

  const handleAnalyze = async (analysisType: string) => {
    setIsAnalyzing(true);
    setActiveAnalysis(analysisType);
    
    // Simulate analysis with loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let mockResults: AnalysisResult[] = [];
    
    if (analysisType === 'customer') {
      mockResults = [
        {
          id: '1',
          name: 'Amazon CS Nederland B.V.',
          description: 'Large enterprise customer with multiple business units and expansion potential',
          opportunities: '12',
          totalPremium: '€45,200',
          avgPremium: '€3,767',
          crossSellPotential: '€89,500',
          products: ['Business Insurance', 'Cyber Security', 'Directors & Officers'],
          priority: 'High'
        },
        {
          id: '2',
          name: 'Mevas B.V.',
          description: 'Medium-sized business with growing insurance needs',
          opportunities: '8',
          totalPremium: '€23,800',
          avgPremium: '€2,975',
          crossSellPotential: '€42,300',
          products: ['Professional Liability', 'Property Insurance'],
          priority: 'Medium'
        }
      ];
    } else if (analysisType === 'strategic') {
      mockResults = [
        {
          id: '1',
          name: 'Pension Products Cross-Sell',
          description: 'Comprehensive pension solutions for corporate clients',
          probability: '78%',
          totalPremium: '€125,600',
          avgPremium: '€15,700',
          crossSellPotential: '€234,800',
          products: ['Garant Pension Plan', 'Netto Pension Arrangement'],
          priority: 'High'
        },
        {
          id: '2',
          name: 'Property & Casualty Bundle',
          description: 'Integrated property and casualty insurance solutions',
          probability: '65%',
          totalPremium: '€89,200',
          avgPremium: '€11,150',
          crossSellPotential: '€156,700',
          products: ['Property Insurance', 'General Liability', 'Motor Insurance'],
          priority: 'Medium'
        }
      ];
    } else if (analysisType === 'custom') {
      mockResults = [
        {
          id: '1',
          name: 'High-Value Corporate Accounts',
          description: 'Large corporations with premium insurance requirements',
          probability: '85%',
          totalPremium: '€198,400',
          avgPremium: '€24,800',
          crossSellPotential: '€387,600',
          products: ['Executive Protection', 'Cyber Insurance', 'International Coverage'],
          priority: 'High'
        }
      ];
    }
    
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
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
                {activeAnalysis === 'strategic' && `Strategic Opportunities (${analysisResults.length})`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Cross-Sell Opportunities */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-[#E6E7F1]" onClick={() => handleAnalyze('customer')}>
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
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Opportunities</span>
                <span className="font-semibold text-[#5567E5]">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Potential</span>
                <span className="font-semibold text-green-600">€156,800</span>
              </div>
              <div className="pt-2 border-t border-[#E6E7F1]">
                <p className="text-sm text-[#5567E5] font-medium">Click to analyze →</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Opportunities Analysis */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-[#E6E7F1]" onClick={() => handleAnalyze('strategic')}>
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
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">1. Travel Insurance</span>
                  <span className="font-semibold text-green-600">+34%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">2. Recreational Vehicle</span>
                  <span className="font-semibold text-green-600">+28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">3. Event & Festival</span>
                  <span className="font-semibold text-green-600">+22%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E6E7F1]">
                <p className="text-sm text-[#5567E5] font-medium">Click to analyze →</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Analysis */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-[#E6E7F1]" onClick={() => handleAnalyze('custom')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#5567E5] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Custom Analysis</CardTitle>
                  <CardDescription>Tailored cross-sell insights and recommendations</CardDescription>
                </div>
              </div>
              <Play className="w-5 h-5 text-[#5567E5]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custom Segments</span>
                <span className="font-semibold text-[#5567E5]">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Potential Value</span>
                <span className="font-semibold text-green-600">€298,600</span>
              </div>
              <div className="pt-2 border-t border-[#E6E7F1]">
                <p className="text-sm text-[#5567E5] font-medium">Click to analyze →</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}