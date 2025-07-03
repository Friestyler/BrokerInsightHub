import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, Target, DollarSign, Package, AlertTriangle, Star, Plus, CalendarIcon, Users, Sparkles, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface PortfolioOverviewProps {
  entityType: 'partners' | 'customers' | 'opportunities';
  entityId: string;
}

interface PortfolioData {
  partnerName?: string;
  customerName?: string;
  opportunityName?: string;
  summary: {
    totalPremium: number;
    productsCovered: number;
    totalProducts: number;
    coveragePercentage: number;
    categoriesCovered: number;
    gapOpportunities: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    productsCovered: number;
    totalProducts: number;
    coveragePercentage: number;
    currentPremium: number;
    gapValue: number;
  }>;
  gapAnalysis: {
    critical: {
      count: number;
      totalValue: number;
      topProducts: Array<{
        productName: string;
        potentialValue: number;
        category: string;
      }>;
    };
    medium: {
      count: number;
      totalValue: number;
      topProducts: Array<{
        productName: string;
        potentialValue: number;
        category: string;
      }>;
    };
    wellCovered: {
      count: number;
      totalValue: number;
      coverageRate: number;
    };
  };
}

export function PortfolioOverviewTab({ entityType, entityId }: PortfolioOverviewProps) {
  const { environment } = useEnvironment();
  const envId = environment?.id || 'degoudse';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [closingDate, setClosingDate] = useState<Date>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedValue: '',
    probability: '',
    stage: 'qualification',
    insuranceType: '',
    comments: ''
  });

  const { data: portfolioData, isLoading } = useQuery<PortfolioData>({
    queryKey: [`/api/${envId}/${entityType}/${entityId}/portfolio-overview`],
    enabled: !!entityId
  });

  // Fetch entity data for prefilling
  const { data: entityData } = useQuery<any>({
    queryKey: [`/api/${envId}/${entityType}/${entityId}`],
    enabled: !!entityId && isModalOpen
  });

  // Fetch available products
  const { data: products } = useQuery({
    queryKey: [`/api/${envId}/product-catalogue`],
    enabled: isModalOpen
  });

  // Fetch users for mentions
  const { data: users } = useQuery({
    queryKey: [`/api/${envId}/users`],
    enabled: isModalOpen
  });

  // AI suggestion generation
  const generateAISuggestion = async () => {
    if (!entityData || !portfolioData) return;
    
    setIsGeneratingSuggestion(true);
    try {
      const entityName = entityData?.name || 'Unknown Entity';
      const partnerName = entityType === 'partners' ? entityName : entityData?.partner?.name || 'Unknown Partner';
      
      const prompt = `Generate a professional comment for a new insurance opportunity in Salesforce. Context:
- Entity: ${entityName} (${entityType.slice(0, -1)})
- Partner: ${partnerName}
- Portfolio coverage: ${portfolioData.summary.coveragePercentage}%
- Current premium: €${portfolioData.summary.totalPremium}
- Gap opportunities: ${portfolioData.summary.gapOpportunities}
- Top coverage gaps: ${portfolioData.categoryBreakdown.filter(cat => cat.coveragePercentage < 50).map(cat => cat.categoryName).join(', ')}

Create a concise, professional comment (max 200 words) that highlights the opportunity, mentions relevant coverage gaps, and suggests next steps for the account manager.`;

      const response = await apiRequest('POST', `/api/${envId}/ai/generate-comment`, {
        prompt,
        entityType,
        entityId,
        maxWords: 200
      });
      
      setFormData(prev => ({ ...prev, comments: response.comment }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // Prefill form when modal opens
  const handleModalOpen = () => {
    if (entityData && portfolioData) {
      const entityName = entityData?.name || 'Unknown Entity';
      const estimatedValue = portfolioData.summary.gapOpportunities > 0 
        ? Math.round(portfolioData.summary.totalPremium * 0.3).toString()
        : '';
      
      setFormData({
        title: `${entityName} - Portfolio Enhancement`,
        description: `Cross-sell opportunity based on portfolio gap analysis. Current coverage: ${portfolioData.summary.coveragePercentage}%`,
        estimatedValue,
        probability: '60',
        stage: 'qualification',
        insuranceType: portfolioData.categoryBreakdown.find(cat => cat.coveragePercentage < 50)?.categoryName || '',
        comments: ''
      });
    }
    setIsModalOpen(true);
  };

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: any) => {
      return apiRequest('POST', `/api/${envId}/opportunities`, opportunityData);
    },
    onSuccess: (newOpportunity) => {
      toast({
        title: "Success",
        description: "Opportunity created and synced with Salesforce"
      });
      
      // Create activity comment if provided
      if (formData.comments) {
        apiRequest('POST', `/api/${envId}/opportunities/${newOpportunity.id}/comments`, {
          content: formData.comments,
          visibleToPartner: true,
          mentionedUsers
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/opportunities`] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      estimatedValue: '',
      probability: '',
      stage: 'qualification',
      insuranceType: '',
      comments: ''
    });
    setClosingDate(undefined);
    setSelectedProducts([]);
    setMentionedUsers([]);
  };

  const handleSubmit = () => {
    const opportunityData = {
      title: formData.title,
      description: formData.description,
      estimated_value: parseFloat(formData.estimatedValue) || 0,
      probability: parseInt(formData.probability) || 0,
      stage: formData.stage,
      insurance_type: formData.insuranceType,
      closing_date: closingDate ? format(closingDate, 'yyyy-MM-dd') : null,
      customer_id: entityType === 'customers' ? parseInt(entityId) : null,
      partner_id: entityType === 'partners' ? parseInt(entityId) : entityData?.partner_id || null,
      products: selectedProducts,
      salesforce_sync: true
    };

    createOpportunityMutation.mutate(opportunityData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No portfolio data available
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEntityName = () => {
    return portfolioData.partnerName || portfolioData.customerName || portfolioData.opportunityName || 'Entity';
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getEntityName()} Portfolio Analysis</h2>
          <p className="text-gray-600 mt-1">Comprehensive portfolio overview and gap analysis</p>
        </div>
        <Button 
          onClick={handleModalOpen}
          className="bg-[#5567E5] hover:bg-[#4556D4]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Creëer kans
        </Button>
      </div>

      {/* Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#E6E7F1]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioData.summary.totalPremium)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6E7F1]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioData.summary.productsCovered} / {portfolioData.summary.totalProducts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6E7F1]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coverage Rate</p>
                <p className={`text-2xl font-bold ${getCoverageColor(portfolioData.summary.coveragePercentage)}`}>
                  {portfolioData.summary.coveragePercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6E7F1]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gap Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioData.summary.gapOpportunities}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Coverage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioData.categoryBreakdown.map((category) => {
          const gapCount = Math.max(0, category.totalProducts - category.productsCovered);
          const gapValue = category.gapValue || (gapCount * 50000); // Estimate gap value
          
          return (
            <Card key={category.categoryId} className="border border-[#E6E7F1] bg-white relative overflow-hidden">
              {/* Gap notification badge */}
              {gapCount > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {gapCount}
                </div>
              )}
              
              <CardContent className="p-6 text-center">
                {/* Circular Progress */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={category.categoryColor || '#6B7280'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(category.coveragePercentage, 100) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(category.coveragePercentage)}%
                    </span>
                  </div>
                </div>
                
                {/* Category Name */}
                <h3 className="font-semibold text-gray-900 mb-2">{category.categoryName}</h3>
                
                {/* Product Count */}
                <p className="text-sm text-gray-600 mb-2">
                  {category.productsCovered}/{category.totalProducts} products
                </p>
                
                {/* Current Value */}
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {formatCurrency(category.currentPremium)}
                </p>
                
                {/* Gap Information */}
                {gapCount > 0 && (
                  <p className="text-sm text-gray-600">
                    Gap: {formatCurrency(gapValue)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Gaps */}
        <Card className="border border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Critical Gaps
            </CardTitle>
            <div className="text-2xl font-bold text-red-800">
              {portfolioData.gapAnalysis.critical.count} products
            </div>
            <p className="text-sm text-red-600">
              {formatCurrency(portfolioData.gapAnalysis.critical.totalValue)} potential value
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioData.gapAnalysis.critical.topProducts.map((product, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
                <div className="font-medium text-gray-900 text-sm">{product.productName}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">{product.category}</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(product.potentialValue)}
                  </span>
                </div>
              </div>
            ))}
            {portfolioData.gapAnalysis.critical.count === 0 && (
              <p className="text-sm text-red-600">No critical gaps identified</p>
            )}
          </CardContent>
        </Card>

        {/* Medium Priority */}
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-yellow-700">
              <Target className="w-5 h-5 mr-2" />
              Medium Priority
            </CardTitle>
            <div className="text-2xl font-bold text-yellow-800">
              {portfolioData.gapAnalysis.medium.count} products
            </div>
            <p className="text-sm text-yellow-600">
              {formatCurrency(portfolioData.gapAnalysis.medium.totalValue)} potential value
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioData.gapAnalysis.medium.topProducts.map((product, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                <div className="font-medium text-gray-900 text-sm">{product.productName}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">{product.category}</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {formatCurrency(product.potentialValue)}
                  </span>
                </div>
              </div>
            ))}
            {portfolioData.gapAnalysis.medium.count === 0 && (
              <p className="text-sm text-yellow-600">No medium priority gaps</p>
            )}
          </CardContent>
        </Card>

        {/* Well Covered */}
        <Card className="border border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-700">
              <Star className="w-5 h-5 mr-2" />
              Well Covered
            </CardTitle>
            <div className="text-2xl font-bold text-green-800">
              {portfolioData.gapAnalysis.wellCovered.count} products
            </div>
            <p className="text-sm text-green-600">
              {formatCurrency(portfolioData.gapAnalysis.wellCovered.totalValue)} current value
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <div className="font-medium text-gray-900 text-sm">Coverage Rate</div>
                <div className="mt-2">
                  <Progress 
                    value={portfolioData.gapAnalysis.wellCovered.coverageRate} 
                    className="h-3"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-600">Current</span>
                    <span className="text-sm font-semibold text-green-600">
                      {portfolioData.gapAnalysis.wellCovered.coverageRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-700">
                  Strong portfolio foundation with good product coverage across key categories.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creëer Kans Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-[#E6E7F1]">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Creëer nieuwe kans
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Maak een nieuwe verkoopkans op basis van portfolio-analyse en sync met Salesforce
            </p>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Titel *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Voer kans titel in"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedValue" className="text-sm font-medium text-gray-700">
                  Geschatte waarde (€)
                </Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Beschrijving
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijf de verkoopkans..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Sales Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="probability" className="text-sm font-medium text-gray-700">
                  Kans (%)
                </Label>
                <Select value={formData.probability} onValueChange={(value) => setFormData(prev => ({ ...prev, probability: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer kans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10% - Vroeg prospectie</SelectItem>
                    <SelectItem value="25">25% - Initiële interesse</SelectItem>
                    <SelectItem value="50">50% - Ontwikkeling</SelectItem>
                    <SelectItem value="75">75% - Onderhandeling</SelectItem>
                    <SelectItem value="90">90% - Bijna gesloten</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stage" className="text-sm font-medium text-gray-700">
                  Stadium
                </Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer stadium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualification">Kwalificatie</SelectItem>
                    <SelectItem value="development">Ontwikkeling</SelectItem>
                    <SelectItem value="proposal">Voorstel</SelectItem>
                    <SelectItem value="negotiation">Onderhandeling</SelectItem>
                    <SelectItem value="closed_won">Gewonnen</SelectItem>
                    <SelectItem value="closed_lost">Verloren</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="closingDate" className="text-sm font-medium text-gray-700">
                  Verwachte sluitingsdatum
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !closingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {closingDate ? format(closingDate, "dd MMM yyyy") : "Selecteer datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={closingDate}
                      onSelect={setClosingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="insuranceType" className="text-sm font-medium text-gray-700">
                Verzekering type
              </Label>
              <Input
                id="insuranceType"
                value={formData.insuranceType}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceType: e.target.value }))}
                placeholder="bijv. Zakelijke verzekering, Auto verzekering"
                className="mt-1"
              />
            </div>

            {/* Product Selection */}
            {products && products.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Gerelateerde producten
                </Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-[#E6E7F1] rounded-lg p-3">
                  {products.slice(0, 10).map((product: any) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(prev => [...prev, product.id.toString()]);
                          } else {
                            setSelectedProducts(prev => prev.filter(id => id !== product.id.toString()));
                          }
                        }}
                        className="rounded text-[#5567E5]"
                      />
                      <label htmlFor={`product-${product.id}`} className="text-sm text-gray-700 cursor-pointer">
                        {product.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Generated Comments Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Commentaar voor Salesforce
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAISuggestion}
                  disabled={isGeneratingSuggestion || !portfolioData}
                  className="text-[#5567E5] border-[#5567E5] hover:bg-[#5567E5] hover:text-white"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isGeneratingSuggestion ? 'Genereren...' : 'AI suggestie'}
                </Button>
              </div>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Voeg een professioneel commentaar toe voor Salesforce en Activity Hub..."
                className="mt-1 min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dit commentaar wordt toegevoegd aan de opportunity in Salesforce en de Activity Hub
              </p>
            </div>

            {/* People Tagging */}
            {users && users.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Vermeld mensen
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {users.slice(0, 8).map((user: any) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        if (mentionedUsers.includes(user.id.toString())) {
                          setMentionedUsers(prev => prev.filter(id => id !== user.id.toString()));
                        } else {
                          setMentionedUsers(prev => [...prev, user.id.toString()]);
                        }
                      }}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-1 rounded-full text-sm border transition-colors",
                        mentionedUsers.includes(user.id.toString())
                          ? "bg-[#5567E5] text-white border-[#5567E5]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#5567E5]"
                      )}
                    >
                      <Users className="w-3 h-3" />
                      <span>{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E6E7F1] flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sync met Salesforce ingeschakeld</span>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
              >
                Annuleren
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createOpportunityMutation.isPending || !formData.title}
                className="bg-[#5567E5] hover:bg-[#4556D4]"
              >
                {createOpportunityMutation.isPending ? 'Maken...' : 'Kans aanmaken'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}