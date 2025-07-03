import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, DollarSign, Package, AlertTriangle, Star, Plus } from 'lucide-react';

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
  const { data: portfolioData, isLoading } = useQuery<PortfolioData>({
    queryKey: [`/api/degoudse/${entityType}/${entityId}/portfolio-overview`],
    enabled: !!entityId
  });

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
        <Button className="bg-[#5567E5] hover:bg-[#4556D4]">
          <Plus className="w-4 h-4 mr-2" />
          Add products
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
    </div>
  );
}