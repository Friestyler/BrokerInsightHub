import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, ChevronDown, ChevronRight, DollarSign } from "lucide-react";
import WhiteSpaceMatrix from "@/components/entity/WhiteSpaceMatrix";

interface ExtractedCustomerProductsTabProps {
  customerId: string;
  className?: string;
  isIframeMode?: boolean;
}

export function ExtractedCustomerProductsTab({ customerId, className = "", isIframeMode = false }: ExtractedCustomerProductsTabProps) {
  // State for category filtering and search - EXACT MIRROR from CustomerDetailNew.tsx
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch data - EXACT MIRROR from CustomerDetailNew.tsx
  const { data: assignedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/product-assignments`],
    enabled: !!customerId,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Toggle category selection
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // EXACT LOGIC from CustomerDetailNew.tsx - Willis-Style Main Category Processing
  const mainCategoriesData = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    // Group categories by parent/main category level
    const mainCategories = new Map();
    
    categories.forEach((category: any) => {
      // Determine main category name (parent category or self if no parent)
      const mainCategoryName = category.parent_category_name || category.name;
      
      // Count products for this specific category
      const categoryProducts = assignedProducts?.filter((product: any) => 
        product.category === category.name ||
        product.categoryName === category.name ||
        product.productCategoryName === category.name
      ) || [];
      
      // Add to main category group
      if (!mainCategories.has(mainCategoryName)) {
        mainCategories.set(mainCategoryName, {
          name: mainCategoryName,
          productCount: 0,
          color: category.color || 'blue',
          products: []
        });
      }
      
      const mainCategory = mainCategories.get(mainCategoryName);
      mainCategory.productCount += categoryProducts.length;
      mainCategory.products.push(...categoryProducts);
    });

    // Convert to array and sort - categories with products first, then blind spots
    return Array.from(mainCategories.entries()).map(([name, data]) => ({
      ...data,
      isBlindSpot: data.productCount === 0
    })).sort((a, b) => {
      // Categories with products first, then blind spots
      if (a.isBlindSpot !== b.isBlindSpot) {
        return a.isBlindSpot ? 1 : -1;
      }
      // Within same group, sort by product count descending
      return b.productCount - a.productCount;
    });
  }, [categories, assignedProducts]);

  // Visible and hidden categories for collapsible display
  const { visibleCategories, hiddenCategories } = useMemo(() => {
    return {
      visibleCategories: mainCategoriesData.slice(0, 4),
      hiddenCategories: mainCategoriesData.slice(4)
    };
  }, [mainCategoriesData]);

  // Get Willis-style colors for category - EXACT LOGIC from CustomerDetailNew.tsx
  const getWillisColors = (mainCategory: any, isSelected: boolean) => {
    const isBlindSpot = mainCategory.isBlindSpot;
    
    const getColorByName = (name: string) => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('pensioen') || lowerName.includes('pension')) return 'green';
      if (lowerName.includes('schade') || lowerName.includes('zakelijk') || lowerName.includes('property')) return 'orange';
      if (lowerName.includes('inkomen') || lowerName.includes('collectief') || lowerName.includes('income')) return 'blue';
      if (lowerName.includes('overige') || lowerName.includes('specialistische')) return 'purple';
      return 'blue';
    };
    
    const categoryColor = getColorByName(mainCategory.name);
    
    const colorMap: any = {
      'green': {
        bg: isSelected ? 'bg-green-100' : 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badge: 'bg-green-200 text-green-800'
      },
      'blue': {
        bg: isSelected ? 'bg-blue-100' : 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        badge: 'bg-blue-200 text-blue-800'
      },
      'purple': {
        bg: isSelected ? 'bg-purple-100' : 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        badge: 'bg-purple-200 text-purple-800'
      },
      'orange': {
        bg: isSelected ? 'bg-orange-100' : 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        badge: 'bg-orange-200 text-orange-800'
      }
    };
    
    return colorMap[categoryColor] || colorMap['blue'];
  };

  // Render category tag - EXACT LOGIC from CustomerDetailNew.tsx
  const renderCategoryTag = (mainCategory: any) => {
    const isSelected = selectedCategories.includes(mainCategory.name);
    const isBlindSpot = mainCategory.isBlindSpot;
    const colors = getWillisColors(mainCategory, isSelected);
    
    return (
      <button
        key={mainCategory.name}
        onClick={() => toggleCategory(mainCategory.name)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-all duration-200 hover:shadow-sm ${colors.bg} ${colors.text} ${colors.border} ${isBlindSpot ? 'opacity-70' : ''} ${isSelected ? 'ring-1 ring-blue-500' : ''}`}
      >
        <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
        {mainCategory.name}
        {isBlindSpot ? (
          <span className={`px-1.5 py-0.5 rounded-full text-xs ml-1 ${colors.badge}`}>
            Blind spot
          </span>
        ) : (
          <span className={`px-1.5 py-0.5 rounded-full text-xs ml-1 ${colors.badge}`}>
            {mainCategory.productCount}
          </span>
        )}
      </button>
    );
  };

  // Process main categories for display with filtering - EXACT LOGIC from CustomerDetailNew.tsx
  const filteredMainCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    // Group categories by parent/main category level - EXACT SAME LOGIC
    const mainCategories = new Map();
    
    categories.forEach((category: any) => {
      // Determine main category name (parent category or self if no parent)
      const mainCategoryName = category.parent_category_name || category.name;
      
      // Count products for this specific category
      const categoryProducts = assignedProducts?.filter((product: any) => 
        product.category === category.name ||
        product.categoryName === category.name ||
        product.productCategoryName === category.name ||
        product.parentcategoryname === category.name
      ) || [];
      
      // Add to main category group
      if (!mainCategories.has(mainCategoryName)) {
        mainCategories.set(mainCategoryName, {
          name: mainCategoryName,
          products: [],
          totalValue: 0,
          color: category.color || 'blue'
        });
      }
      
      const mainCategory = mainCategories.get(mainCategoryName);
      mainCategory.products.push(...categoryProducts);
      mainCategory.totalValue += categoryProducts.reduce((sum: number, product: any) => 
        sum + parseFloat(product.customprice || product.premiumValue || '0'), 0
      );
    });
    
    // Filter by selected categories and sort properly
    const filteredMainCategories = Array.from(mainCategories.entries())
      .map(([name, data]) => ({
        ...data,
        productCount: data.products.length,
        isBlindSpot: data.products.length === 0
      }))
      .filter((category) => 
        selectedCategories.length === 0 || selectedCategories.includes(category.name)
      )
      .sort((a, b) => {
        // Categories with products first, then empty categories at bottom
        if (a.isBlindSpot !== b.isBlindSpot) {
          return a.isBlindSpot ? 1 : -1;
        }
        // Within same group, sort by product count descending (most products first)
        return b.productCount - a.productCount;
      });
    
    // Debug logging to understand what's happening
    console.log('Categories with product counts:', filteredMainCategories.map(cat => ({
      name: cat.name,
      productCount: cat.productCount,
      isBlindSpot: cat.isBlindSpot
    })));
    
    return filteredMainCategories;
  }, [categories, assignedProducts, selectedCategories]);

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Filter Controls - EXACT MIRROR from CustomerDetailNew.tsx */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Search className="w-4 h-4 mr-2" />
            Category
          </Button>
          
          <Button variant="outline" size="sm" className="h-9">
            <DollarSign className="w-4 h-4 mr-2" />
            Price Range
          </Button>
        </div>

        {/* Willis-Style Main Category Tags - EXACT MIRROR */}
        {mainCategoriesData.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {/* Always visible categories */}
            {visibleCategories.map(renderCategoryTag)}
            
            {/* Collapsible additional categories */}
            {showAllCategories && hiddenCategories.map(renderCategoryTag)}
            
            {/* Show more/less button */}
            {hiddenCategories.length > 0 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {showAllCategories ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    +{hiddenCategories.length} more
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Categories Display - EXACT MIRROR from CustomerDetailNew.tsx */}
      <div className="space-y-6">
        {filteredMainCategories.length > 0 ? (
          filteredMainCategories.map((mainCategory: any) => {
            const isBlindSpot = mainCategory.products.length === 0;
            
            // Get Willis-style colors for this main category
            const getMainCategoryColor = (categoryName: string) => {
              const lowerName = categoryName.toLowerCase();
              if (lowerName.includes('pensioen') || lowerName.includes('pension')) return 'green';
              if (lowerName.includes('schade') || lowerName.includes('zakelijk') || lowerName.includes('property')) return 'orange';
              if (lowerName.includes('inkomen') || lowerName.includes('collectief') || lowerName.includes('income')) return 'blue';
              if (lowerName.includes('overige') || lowerName.includes('specialistische')) return 'purple';
              return 'blue';
            };
            
            const categoryColor = getMainCategoryColor(mainCategory.name);
            
            const headerColor = isBlindSpot 
              ? 'bg-gray-100'
              : categoryColor === 'green' ? 'bg-green-50' :
                categoryColor === 'blue' ? 'bg-blue-50' :
                categoryColor === 'purple' ? 'bg-purple-50' :
                categoryColor === 'orange' ? 'bg-orange-50' :
                'bg-gray-50';
            
            const dotColor = isBlindSpot 
              ? 'bg-gray-400'
              : categoryColor === 'green' ? 'bg-green-500' :
                categoryColor === 'blue' ? 'bg-blue-500' :
                categoryColor === 'purple' ? 'bg-purple-500' :
                categoryColor === 'orange' ? 'bg-orange-500' :
                'bg-gray-500';
            
            const textColor = isBlindSpot 
              ? 'text-gray-600'
              : categoryColor === 'green' ? 'text-green-600' :
                categoryColor === 'blue' ? 'text-blue-600' :
                categoryColor === 'purple' ? 'text-purple-600' :
                categoryColor === 'orange' ? 'text-orange-600' :
                'text-gray-600';

            return (
              <div key={mainCategory.name} className={`bg-white rounded-lg border border-gray-200 ${isBlindSpot ? 'opacity-70' : ''}`}>
                <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${headerColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {mainCategory.name} ({mainCategory.products.length})
                      {isBlindSpot && <span className="text-sm font-normal text-gray-500 ml-2">• Blind spot</span>}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isBlindSpot ? 'No products assigned' : `Total value: €${mainCategory.totalValue.toLocaleString()}`}
                  </div>
                </div>
                
                {/* Products within this category */}
                <div className="space-y-0">
                  {isBlindSpot ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="mb-2">No products in this category</div>
                      <div className="text-sm">Consider adding products to expand coverage</div>
                    </div>
                  ) : (
                    mainCategory.products.map((product: any) => (
                      <div key={product.productid || product.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.productname}</h4>
                          <p className="text-sm text-gray-600">{product.productdescription}</p>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                          <div className="text-right">
                            <div className={`font-semibold ${textColor}`}>
                              €{product.customprice ? parseFloat(product.customprice).toLocaleString() : '0'}
                            </div>
                            <div className="text-sm text-gray-500">Premium</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-700">
                              {product.customercontractenddate ? new Date(product.customercontractenddate).toLocaleDateString('en-GB') : '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.customercontractenddate && new Date(product.customercontractenddate) < new Date() ? 'Expired' :
                               product.customercontractenddate && new Date(product.customercontractenddate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' :
                               product.customercontractenddate ? `${Math.ceil((new Date(product.customercontractenddate).getTime() - new Date().getTime()) / (1000 * 3600 * 24 * 365))} years left` : '-'}
                            </div>
                            <div className="text-sm text-gray-500">Expiry Date</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">No products are currently associated with this customer.</p>
          </div>
        )}
      </div>
    </div>
  );
}