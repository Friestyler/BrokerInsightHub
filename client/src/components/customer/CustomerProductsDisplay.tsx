import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface CustomerProductsDisplayProps {
  customerId: string;
}

interface CustomerProduct {
  id: number;
  customer_id: number;
  product_id: number;
  contract_start_date: string | null;
  contract_end_date: string | null;
  premium_value: number;
  status: string;
  product_name: string;
  category: string;
  category_name: string;
  category_color: string;
}

export function CustomerProductsDisplay({ customerId }: CustomerProductsDisplayProps) {
  const { environment } = useEnvironment();
  const envId = environment?.id || 'degoudse';

  // Fetch customer products with category information
  const { data: customerProducts, isLoading } = useQuery<CustomerProduct[]>({
    queryKey: [`/api/${envId}/customers/${customerId}/products`],
    enabled: !!customerId
  });

  // Fetch all categories to show gaps
  const { data: allCategories } = useQuery<any[]>({
    queryKey: [`/api/${envId}/categories`],
    enabled: !!customerId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const products = customerProducts || [];
  const categories = allCategories || [];

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const categoryName = product.category_name || product.category || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: categoryName,
        color: product.category_color || '#6B7280',
        products: []
      };
    }
    acc[categoryName].products.push(product);
    return acc;
  }, {} as Record<string, { category: string; color: string; products: CustomerProduct[] }>);

  // Add empty categories to show gaps
  categories.forEach(category => {
    if (category.parent_id === null && !productsByCategory[category.name]) {
      productsByCategory[category.name] = {
        category: category.name,
        color: category.color || '#6B7280',
        products: []
      };
    }
  });

  // Helper function to get expiry status
  const getExpiryStatus = (contractEndDate: string | null) => {
    if (!contractEndDate) return { status: 'unknown', label: 'No expiry', color: 'gray' };
    
    const endDate = parseISO(contractEndDate);
    const now = new Date();
    const threeMonthsFromNow = addMonths(now, 3);
    const sixMonthsFromNow = addMonths(now, 6);

    if (isBefore(endDate, now)) {
      return { status: 'expired', label: 'Expired', color: 'red' };
    } else if (isBefore(endDate, threeMonthsFromNow)) {
      return { status: 'critical', label: 'Expires soon', color: 'red' };
    } else if (isBefore(endDate, sixMonthsFromNow)) {
      return { status: 'warning', label: 'Expiring', color: 'yellow' };
    } else {
      return { status: 'active', label: 'Active', color: 'green' };
    }
  };

  // Calculate coverage percentage for each category
  const getCoveragePercentage = (categoryProducts: CustomerProduct[]) => {
    const totalPossibleProducts = 5; // Assuming 5 possible products per category
    return Math.round((categoryProducts.length / totalPossibleProducts) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categories Covered</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(productsByCategory).filter(cat => productsByCategory[cat].products.length > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{products.reduce((sum, p) => sum + (p.premium_value || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => getExpiryStatus(p.contract_end_date).status === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-based Product Display */}
      <div className="space-y-4">
        {Object.entries(productsByCategory).map(([categoryName, categoryData]) => {
          const { products: categoryProducts, color } = categoryData;
          const coveragePercentage = getCoveragePercentage(categoryProducts);
          const hasProducts = categoryProducts.length > 0;

          return (
            <Card key={categoryName} className="border border-[#E6E7F1]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {categoryName}
                    </CardTitle>
                    <Badge variant={hasProducts ? "default" : "secondary"}>
                      {categoryProducts.length} products
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Coverage</span>
                    <Progress value={coveragePercentage} className="w-20" />
                    <span className="text-sm font-medium text-gray-700">{coveragePercentage}%</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {hasProducts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryProducts.map((product) => {
                      const expiryStatus = getExpiryStatus(product.contract_end_date);
                      
                      return (
                        <div 
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {product.product_name}
                            </h4>
                            <Badge 
                              variant={expiryStatus.color === 'green' ? 'default' : 
                                      expiryStatus.color === 'yellow' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {expiryStatus.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Premium:</span>
                              <span className="font-medium">€{product.premium_value?.toLocaleString() || 0}</span>
                            </div>
                            {product.contract_end_date && (
                              <div className="flex justify-between">
                                <span>Expires:</span>
                                <span className="font-medium">
                                  {format(parseISO(product.contract_end_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="font-medium capitalize">{product.status || 'Active'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-1">No products in this category</p>
                    <p className="text-xs text-gray-400">Cross-sell opportunity available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {products.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">This customer doesn't have any products assigned yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}