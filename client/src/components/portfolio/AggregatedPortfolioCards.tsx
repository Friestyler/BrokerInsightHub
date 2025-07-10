import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AggregatedPortfolioData {
  summary: {
    totalPremium: number;
    productsCovered: number;
    totalProducts: number;
    coveragePercentage: number;
    customersCovered: number;
    totalCustomers: number;
    customerCoveragePercentage: number;
    categoriesCovered: number;
    totalCategories: number;
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
    productsInCategory: number;
  }>;
  smartAlerts: Array<{
    type: string;
    title: string;
    description: string;
    customerCount: number;
    totalValue: number;
    backgroundColor: string;
    textColor: string;
    categories: string[];
  }>;
  aggregatedView: boolean;
  timestamp: string;
}

interface AggregatedPortfolioCardsProps {
  portfolioData: AggregatedPortfolioData;
  isLoading?: boolean;
}

// Circular Progress Component
function CircularProgress({ 
  percentage, 
  color, 
  size = 120, 
  strokeWidth = 8 
}: { 
  percentage: number; 
  color: string; 
  size?: number; 
  strokeWidth?: number; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Format currency utility
function formatCurrency(amount: number): string {
  return `€${Math.round(amount).toLocaleString()}`;
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function AggregatedPortfolioCards({ portfolioData, isLoading = false }: AggregatedPortfolioCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!portfolioData?.categoryBreakdown?.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No portfolio data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get top 4 categories by coverage or value
  const topCategories = portfolioData.categoryBreakdown
    .filter(cat => cat.currentPremium > 0) // Only show categories with actual data
    .sort((a, b) => b.currentPremium - a.currentPremium) // Sort by value
    .slice(0, 4); // Take top 4

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {topCategories.map((category) => {
        const percentage = Math.round(category.coveragePercentage);
        const potentialValue = Math.round(category.currentPremium * 0.25); // 25% potential increase
        
        return (
          <Card key={category.categoryId} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Category header with color indicator */}
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.categoryColor }}
                  ></div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {category.categoryName}
                  </h3>
                </div>

                {/* Circular progress */}
                <CircularProgress 
                  percentage={percentage} 
                  color={category.categoryColor}
                  size={100}
                  strokeWidth={6}
                />

                {/* Customer coverage */}
                <div className="text-sm text-gray-600">
                  {category.productsCovered} of {category.totalProducts} customers
                </div>

                {/* Current value */}
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(category.currentPremium)}
                </div>

                {/* Potential value */}
                <div className="text-xs text-gray-500">
                  Potential: {formatCurrency(potentialValue)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}