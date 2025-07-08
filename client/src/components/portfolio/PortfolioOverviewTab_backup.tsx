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
import { TrendingUp, Target, DollarSign, Package, AlertTriangle, Star, Plus, CalendarIcon, Users, X, CheckCircle, Shield, Heart, Briefcase, Car, Home, Plane, FileText, Zap, Play } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface PortfolioOverviewProps {
  entityType: 'partners' | 'customers' | 'opportunities';
  entityId: string;
  isModalOpen?: boolean;
  onModalClose?: () => void;
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

export function PortfolioOverviewTab({ entityType, entityId, isModalOpen: externalModalOpen, onModalClose: externalModalClose }: PortfolioOverviewProps) {
  const { environment } = useEnvironment();
  const envId = environment?.id || 'degoudse';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state for category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showProductsList, setShowProductsList] = useState(false);
  
  // Use external modal state if provided, otherwise use internal state
  const modalOpen = externalModalOpen !== undefined ? externalModalOpen : isModalOpen;
  const setModalOpen = externalModalClose !== undefined ? 
    (open: boolean) => {
      if (!open && externalModalClose) {
        externalModalClose();
      } else if (open) {
        // For external control, we don't open the modal directly
      }
    } : setIsModalOpen;
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [closingDate, setClosingDate] = useState<Date>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSelectionType, setCustomerSelectionType] = useState<'single' | 'multiple' | 'list'>('single');
  
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

  // Smart Cross Sell states
  const [activeAnalysis, setActiveAnalysis] = useState<'customer' | 'strategic' | 'custom' | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Analysis functions
  const runCustomerAnalysis = async () => {
    setIsAnalyzing(true);
    setActiveAnalysis('customer');
    
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          id: 1,
          name: "Amazon CS Netherlands B.V.",
          description: "E-commerce technology platform",
          opportunities: 3,
          totalPremium: "€296,128",
          avgPremium: "€98,709",
          crossSellPotential: "€45,200",
          products: ["Cyber Security Dekking", "Bedrijfsschade Continuïteit", "Aansprakelijkheid Professionals"]
        },
        {
          id: 2,
          name: "Tech Innovations B.V.",
          description: "Software development company",
          opportunities: 2,
          totalPremium: "€177,638",
          avgPremium: "€88,819",
          crossSellPotential: "€32,800",
          products: ["Cyber Security Dekking", "Bedrijfsschade Continuïteit"]
        },
        {
          id: 3,
          name: "Modern Building Co.",
          description: "Construction and real estate",
          opportunities: 4,
          totalPremium: "€92,468",
          avgPremium: "€23,117",
          crossSellPotential: "€28,500",
          products: ["Aansprakelijkheid Professionals", "Bedrijfsschade Continuïteit", "Cyber Security Dekking", "Woonverzekering Plus"]
        }
      ];
      
      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Error running customer analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runStrategicAnalysis = async () => {
    setIsAnalyzing(true);
    setActiveAnalysis('strategic');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          id: 1,
          name: "Cyber Insurance Expansion",
          description: "Growing demand for cyber insurance due to increasing digital threats",
          priority: "High",
          probability: "85%",
          totalPremium: "€75,117",
          avgPremium: "€37,559",
          crossSellPotential: "€23,123",
          products: ["Cyber Security Dekking", "Data Protection Plus"]
        },
        {
          id: 2,
          name: "ESG Insurance Products",
          description: "Capitalize on growing demand for ESG-compliant products",
          priority: "High",
          probability: "80%",
          totalPremium: "€354,348",
          avgPremium: "€88,587",
          crossSellPotential: "€23,075",
          products: ["Bewust Pensioen Plus Regeling", "Duurzame Bedrijfsverzekering"]
        },
        {
          id: 3,
          name: "SME Insurance Solutions",
          description: "Tailored insurance packages for SMEs addressing specific business risks",
          priority: "Medium",
          probability: "70%",
          totalPremium: "€612,032",
          avgPremium: "€87,433",
          crossSellPotential: "€12,826",
          products: ["Bedrijfsschade Continuïteit", "KMO Pakket Plus", "Aansprakelijkheid Professionals"]
        }
      ];
      
      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Error running strategic analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCustomAnalysis = async () => {
    if (!customPrompt.trim()) return;
    
    setIsAnalyzing(true);
    setActiveAnalysis('custom');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          id: 1,
          name: "Renewable Energy Insurance",
          description: "Insurance solutions for solar and wind energy projects",
          priority: "High",
          probability: "75%",
          totalPremium: "€444,372",
          avgPremium: "€88,874",
          crossSellPotential: "€35,600",
          products: ["Technische Verzekering", "Aansprakelijkheid Professionals", "Bedrijfsschade Continuïteit"]
        },
        {
          id: 2,
          name: "Construction Tech Solutions",
          description: "Specialized coverage for construction technology companies",
          priority: "Medium",
          probability: "65%",
          totalPremium: "€641,351",
          avgPremium: "€106,892",
          crossSellPotential: "€28,200",
          products: ["Cyber Security Dekking", "Technische Verzekering", "Aansprakelijkheid Professionals"]
        }
      ];
      
      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Error running custom analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  // Fetch customers attached to partner (only for partner entity type)
  const { data: partnerCustomers } = useQuery({
    queryKey: [`/api/${envId}/partners/${entityId}/customers`],
    enabled: isModalOpen && entityType === 'partners'
  });

  // Fetch saved customer lists
  const { data: savedCustomerLists } = useQuery({
    queryKey: [`/api/${envId}/saved-lists?entity_type=customers`],
    enabled: isModalOpen
  });

  // Fetch products for list view
  const { data: entityProducts } = useQuery({
    queryKey: [`/api/${envId}/${entityType}/${entityId}/products`],
    enabled: !!entityId && showProductsList
  });

  // Filter products based on selected categories
  const filteredProducts = entityProducts?.filter(product => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(product.categoryName);
  }) || [];

  // Toggle category selection
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
    setShowProductsList(true);
  };

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
    setModalOpen(true);
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
      setModalOpen(false);
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
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCoverageProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Simple coverage performance color system for circles only
  const getCoverageCircleColor = (coveragePercentage: number) => {
    if (coveragePercentage >= 80) {
      return '#10B981'; // Green for excellent coverage
    } else if (coveragePercentage >= 30) {
      return '#F59E0B'; // Orange for improving coverage
    } else {
      return '#EF4444'; // Red for needs attention
    }
  };

  // Helper function to get category-specific icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('pensioen') || name.includes('pension')) {
      return Heart; // Life/Pension insurance
    }
    if (name.includes('schade') || name.includes('damage') || name.includes('zakelijk') || name.includes('business')) {
      return Briefcase; // Business insurance
    }
    if (name.includes('inkomen') || name.includes('income') || name.includes('collectief') || name.includes('collective')) {
      return Shield; // Income/Collective insurance
    }
    if (name.includes('auto') || name.includes('car') || name.includes('vehicle')) {
      return Car; // Auto insurance
    }
    if (name.includes('woon') || name.includes('home') || name.includes('huis') || name.includes('house')) {
      return Home; // Home insurance
    }
    if (name.includes('reis') || name.includes('travel')) {
      return Plane; // Travel insurance
    }
    if (name.includes('overige') || name.includes('other') || name.includes('specialistische')) {
      return FileText; // Other/Specialized products
    }
    if (name.includes('services') || name.includes('diensten')) {
      return Zap; // Services
    }
    
    // Default fallback
    return Shield;
  };

  // Get category tag styling based on category color
  const getCategoryTagStyle = (categoryColor: string, categoryName?: string) => {
    // Special handling for "Schade Zakelijk" - always show as blue
    if (categoryName === 'Schade Zakelijk') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    // Handle both color names and hex values
    const colorMap: { [key: string]: string } = {
      // Color names
      'Blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'Green': 'bg-green-100 text-green-800 border-green-200',
      'Orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'Purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'Red': 'bg-blue-100 text-blue-800 border-blue-200', // Changed red to blue to avoid confusion
      'Cyan': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Lime': 'bg-lime-100 text-lime-800 border-lime-200',
      'Amber': 'bg-amber-100 text-amber-800 border-amber-200',
      'Pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'Gray': 'bg-gray-100 text-gray-800 border-gray-200',
      // Hex color mappings for common insurance category colors
      '#3B82F6': 'bg-blue-100 text-blue-800 border-blue-200', // Blue
      '#10B981': 'bg-green-100 text-green-800 border-green-200', // Green
      '#F59E0B': 'bg-orange-100 text-orange-800 border-orange-200', // Orange
      '#8B5CF6': 'bg-purple-100 text-purple-800 border-purple-200', // Purple
      '#EF4444': 'bg-blue-100 text-blue-800 border-blue-200', // Changed red to blue
      '#06B6D4': 'bg-cyan-100 text-cyan-800 border-cyan-200', // Cyan
      '#84CC16': 'bg-lime-100 text-lime-800 border-lime-200', // Lime
      '#EC4899': 'bg-pink-100 text-pink-800 border-pink-200', // Pink
      '#6B7280': 'bg-gray-100 text-gray-800 border-gray-200' // Gray
    };
    
    // First try exact match
    if (colorMap[categoryColor]) {
      return colorMap[categoryColor];
    }
    
    // If not found, try to map based on color hue for hex colors
    if (categoryColor?.startsWith('#')) {
      // Simple color mapping based on hex values
      const hex = categoryColor.toLowerCase();
      if (hex.includes('3b82f6') || hex.includes('2563eb') || hex.includes('1d4ed8')) {
        return 'bg-blue-100 text-blue-800 border-blue-200';
      }
      if (hex.includes('10b981') || hex.includes('059669') || hex.includes('047857')) {
        return 'bg-green-100 text-green-800 border-green-200';
      }
      if (hex.includes('f59e0b') || hex.includes('d97706') || hex.includes('b45309')) {
        return 'bg-orange-100 text-orange-800 border-orange-200';
      }
      if (hex.includes('8b5cf6') || hex.includes('7c3aed') || hex.includes('6d28d9')) {
        return 'bg-purple-100 text-purple-800 border-purple-200';
      }
      // Map red hex colors to blue to avoid confusion
      if (hex.includes('ef4444') || hex.includes('dc2626') || hex.includes('b91c1c')) {
        return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    }
    
    // Default fallback
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 p-6">



      {/* Category Coverage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioData.categoryBreakdown
          .sort((a, b) => {
            // Sort "Overige" or "Overige / Specialistische Producten" to the end
            if (a.categoryName === "Overige" || a.categoryName === "Overige / Specialistische Producten") return 1;
            if (b.categoryName === "Overige" || b.categoryName === "Overige / Specialistische Producten") return -1;
            return 0;
          })
          .map((category) => {
          const gapCount = Math.max(0, category.totalProducts - category.productsCovered);
          const gapValue = category.gapValue || (gapCount * 50000); // Estimate gap value
          const coverageCircleColor = getCoverageCircleColor(category.coveragePercentage);
          const categoryTagStyle = getCategoryTagStyle(category.categoryColor, category.categoryName);
          
          const isSelected = selectedCategories.includes(category.categoryName);
          
          return (
            <Card 
              key={category.categoryId} 
              className={`border bg-white relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                isSelected 
                  ? 'border-[#5567E5] bg-[#F5F6FE] shadow-md' 
                  : 'border-[#E6E7F1] hover:border-[#D1D5DB]'
              }`}
              onClick={() => toggleCategory(category.categoryName)}
            >
              {/* Gap count indicator moved to bottom right */}
              {gapCount > 0 && (
                <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-600">
                  {gapCount} gaps
                </div>
              )}
              
              <CardContent className="p-6 text-center">
                {/* Category Name with Colored Bullet - moved to top */}
                <div className="mb-4 flex items-center justify-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.categoryColor }}
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {category.categoryName === "Overige / Specialistische Producten" ? "Overige" : category.categoryName}
                  </span>
                </div>
                
                {/* Clean Circular Progress */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#E5E7EB"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress circle with coverage performance color */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={coverageCircleColor}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(category.coveragePercentage, 100) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(category.coveragePercentage)}%
                    </span>
                  </div>
                </div>
                
                {/* Product Count */}
                <p className="text-sm text-gray-600 mb-2">
                  {category.productsCovered} of {category.totalProducts} products
                </p>
                
                {/* Current Value */}
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(category.currentPremium)}
                </p>
                
                {/* Gap Information - subtle display */}
                {gapCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Potential: {formatCurrency(gapValue)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product List Section - Only show when categories are selected */}
      {showProductsList && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Products
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {selectedCategories.length === 1 ? 
                    `in ${selectedCategories[0]}` : 
                    `in ${selectedCategories.length} categories`
                  }
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {selectedCategories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowProductsList(false);
                  }}
                >
                  Clear filters
                </Button>
              )}
              <span className="text-sm text-gray-500">
                {filteredProducts.length} products
              </span>
            </div>
          </div>

          {/* Selected Category Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge 
                  key={category} 
                  variant="secondary" 
                  className="bg-[#F5F6FE] text-[#5567E5] border-[#E1E4FB] hover:bg-[#E1E4FB]"
                >
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Product List */}
          <div className="bg-white border border-[#E6E7F1] rounded-lg">
            {filteredProducts.length > 0 ? (
              <div className="divide-y divide-[#E6E7F1]">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {product.categoryName}
                          </Badge>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>ID: {product.productId}</span>
                          <span>Provider: {product.provider}</span>
                          {product.premiumValue && (
                            <span>Premium: {formatCurrency(product.premiumValue)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No products found in selected categories</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Cross Sell Section */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Smart Cross Sell</h2>
          {activeAnalysis && (
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveAnalysis(null);
                setAnalysisResults([]);
              }}
              className="text-sm"
            >
              Back to overview
            </Button>
          )}
        </div>
        
        {!activeAnalysis ? (
          // Summary Cards
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Cross-Sell Opportunities */}
            <Card 
              className="border border-[#E6E7F1] bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={runCustomerAnalysis}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#282A3F] text-lg">
                  <Target className="w-5 h-5 mr-2 text-[#5567E5]" />
                  Customer Cross-Sell Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  AI analysis of your customer portfolio to identify high-value cross-sell opportunities
                </div>
                
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-[#5567E5] mb-2">€106,500</div>
                  <div className="text-sm text-gray-500">Total potential identified</div>
                  <div className="text-sm text-gray-500 mt-1">3 customers with opportunities</div>
                </div>

                <div className="pt-4 border-t border-[#E6E7F1]">
                  <div className="flex items-center justify-center text-sm text-[#5567E5] font-medium">
                    <Play className="w-4 h-4 mr-2" />
                    Click to analyze
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Opportunities Analysis */}
            <Card 
              className="border border-[#E6E7F1] bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={runStrategicAnalysis}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#282A3F] text-lg">
                  <TrendingUp className="w-5 h-5 mr-2 text-[#5567E5]" />
                  Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  AI-powered market analysis combined with portfolio context to identify strategic growth opportunities
                </div>
                
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-[#5567E5] mb-2">€59,024</div>
                  <div className="text-sm text-gray-500">Strategic value potential</div>
                  <div className="text-sm text-gray-500 mt-1">3 high-priority opportunities</div>
                </div>

                <div className="pt-4 border-t border-[#E6E7F1]">
                  <div className="flex items-center justify-center text-sm text-[#5567E5] font-medium">
                    <Play className="w-4 h-4 mr-2" />
                    Click to analyze
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Prompt Analysis */}
            <Card className="border border-[#E6E7F1] bg-white p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#282A3F] text-lg">
                  <Zap className="w-5 h-5 mr-2 text-[#5567E5]" />
                  Custom Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Generate custom cross-sell opportunities based on your specific prompt and portfolio analysis
                </div>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="Describe what type of cross-sell opportunities you want to explore... (e.g., 'Focus on renewable energy insurance for construction companies')"
                    className="min-h-[100px] resize-none border-[#E6E7F1] focus:border-[#5567E5] focus:ring-[#5567E5]"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  
                  <Button 
                    className="w-full bg-[#5567E5] hover:bg-[#4556D4] text-white"
                    onClick={runCustomAnalysis}
                    disabled={!customPrompt.trim()}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate custom analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Analysis Results
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5567E5]"></div>
                  <span className="text-lg text-gray-600">Analyzing portfolio...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Analysis Header */}
                <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#E6E7F1]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#282A3F] text-lg">
                        {activeAnalysis === 'customer' && 'Customer Cross-Sell Analysis'}
                        {activeAnalysis === 'strategic' && 'Strategic Opportunities Analysis'}
                        {activeAnalysis === 'custom' && 'Custom Analysis Results'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {activeAnalysis === 'customer' && 'Customers with highest cross-sell potential'}
                        {activeAnalysis === 'strategic' && 'Market-driven strategic opportunities'}
                        {activeAnalysis === 'custom' && `Results based on: "${customPrompt}"`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#5567E5]">{analysisResults.length}</div>
                      <div className="text-sm text-gray-500">opportunities</div>
                    </div>
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
                                onClick={() => setIsModalOpen(true)}
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Creëer Kans Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-[#E6E7F1]">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Creëer Partner Kans
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

            {/* Customer Selection */}
            {entityType === 'partners' && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Klant selectie *
                </Label>
                <div className="mt-2 space-y-4">
                  {/* Selection Type */}
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="customerSelection"
                        value="single"
                        checked={customerSelectionType === 'single'}
                        onChange={(e) => setCustomerSelectionType(e.target.value as any)}
                        className="text-[#5567E5] focus:ring-[#5567E5]"
                      />
                      <span className="text-sm text-gray-700">Enkele klant</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="customerSelection"
                        value="multiple"
                        checked={customerSelectionType === 'multiple'}
                        onChange={(e) => setCustomerSelectionType(e.target.value as any)}
                        className="text-[#5567E5] focus:ring-[#5567E5]"
                      />
                      <span className="text-sm text-gray-700">Meerdere klanten</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="customerSelection"
                        value="list"
                        checked={customerSelectionType === 'list'}
                        onChange={(e) => setCustomerSelectionType(e.target.value as any)}
                        className="text-[#5567E5] focus:ring-[#5567E5]"
                      />
                      <span className="text-sm text-gray-700">Qollabi lijst</span>
                    </label>
                  </div>

                  {/* Customer Selection Interface */}
                  {customerSelectionType === 'single' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Selecteer klant
                      </Label>
                      <Select 
                        value={selectedCustomers[0] || ''} 
                        onValueChange={(value) => setSelectedCustomers([value])}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Kies een klant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {partnerCustomers && Array.isArray(partnerCustomers) && partnerCustomers.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {customerSelectionType === 'multiple' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Selecteer klanten
                      </Label>
                      <div className="mt-2 max-h-48 overflow-y-auto border border-[#E6E7F1] rounded-lg p-3 space-y-2">
                        {partnerCustomers && Array.isArray(partnerCustomers) && partnerCustomers.map((customer: any) => (
                          <label key={customer.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCustomers(prev => [...prev, customer.id.toString()]);
                                } else {
                                  setSelectedCustomers(prev => prev.filter(id => id !== customer.id.toString()));
                                }
                              }}
                              className="rounded text-[#5567E5] focus:ring-[#5567E5]"
                            />
                            <span className="text-sm text-gray-700">{customer.name}</span>
                          </label>
                        ))}
                      </div>
                      {selectedCustomers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedCustomers.map((customerId) => {
                            const customer = partnerCustomers?.find((c: any) => c.id.toString() === customerId);
                            return (
                              <Badge key={customerId} variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {customer?.name || `Customer ${customerId}`}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {customerSelectionType === 'list' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Selecteer Qollabi lijst
                      </Label>
                      <Select 
                        value={selectedCustomers[0] || ''} 
                        onValueChange={(value) => setSelectedCustomers([value])}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Kies een opgeslagen lijst..." />
                        </SelectTrigger>
                        <SelectContent>
                          {savedCustomerLists && Array.isArray(savedCustomerLists) && savedCustomerLists.map((list: any) => (
                            <SelectItem key={list.id} value={`list-${list.id}`}>
                              {list.name} ({list.item_count || 0} klanten)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  <Zap className="w-4 h-4 mr-1" />
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
                onClick={() => setModalOpen(false)}
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