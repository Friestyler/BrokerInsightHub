import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, Search, MoreVertical, Filter } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { IframeHeader } from "@/components/iframe/IframeHeader";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");

  // Products List tab state - EXACT MIRROR
  const [productSearchText, setProductSearchText] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [activeProductList, setActiveProductList] = useState<any>(null);
  const [activeProductView, setActiveProductView] = useState<any>(null);
  const [showProductListsDropdown, setShowProductListsDropdown] = useState(false);
  const [showProductViewsDropdown, setShowProductViewsDropdown] = useState(false);
  const [showProductCategoryDropdown, setShowProductCategoryDropdown] = useState(false);
  const [showPriceRangeDropdown, setShowPriceRangeDropdown] = useState(false);

  // Refs for dropdowns - EXACT MIRROR
  const productListsDropdownRef = useRef<HTMLDivElement>(null);
  const productViewsDropdownRef = useRef<HTMLDivElement>(null);
  const productCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const priceRangeDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch partner data - EXACT same as main app
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/${environment.id}/partners`],
  });

  // Fetch customers data - EXACT same as main app
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/${environment.id}/partners/${id}/customers`],
  });

  // Fetch opportunities data - EXACT same as main app
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/${environment.id}/opportunities`],
  });

  // Fetch assigned products - EXACT same as main app
  const { data: assignedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/${environment.id}/partners/${id}/assignedProducts`],
  });

  // Fetch users data
  const { data: users } = useQuery({
    queryKey: [`/api/users`],
  });

  // Fetch product assignments for authenticated data - EXACT same as main app
  const { data: productAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/${environment.id}/partners/${id}/product-assignments`],
    enabled: !!id,
  });

  // Click outside handlers for dropdowns - EXACT MIRROR
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productListsDropdownRef.current && !productListsDropdownRef.current.contains(event.target as Node)) {
        setShowProductListsDropdown(false);
      }
      if (productViewsDropdownRef.current && !productViewsDropdownRef.current.contains(event.target as Node)) {
        setShowProductViewsDropdown(false);
      }
      if (productCategoryDropdownRef.current && !productCategoryDropdownRef.current.contains(event.target as Node)) {
        setShowProductCategoryDropdown(false);
      }
      if (priceRangeDropdownRef.current && !priceRangeDropdownRef.current.contains(event.target as Node)) {
        setShowPriceRangeDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Product selection helper functions - EXACT MIRROR
  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isProductSelected = (productId: number) => {
    return selectedProducts.includes(productId);
  };

  const toggleSelectAllProducts = () => {
    const filteredProducts = (productAssignments as any[] || []).filter((product: any) => {
      const matchesSearch = !productSearchText || 
        product.productName?.toLowerCase().includes(productSearchText.toLowerCase()) ||
        product.productDescription?.toLowerCase().includes(productSearchText.toLowerCase());
      
      const matchesCategory = !selectedProductCategory || product.categoryName === selectedProductCategory;
      
      const matchesPrice = !selectedPriceRange || (() => {
        const price = parseFloat(product.premiumValue || '0');
        switch(selectedPriceRange) {
          case '€0 - €50K': return price >= 0 && price <= 50000;
          case '€50K - €100K': return price > 50000 && price <= 100000;
          case '€100K - €150K': return price > 100000 && price <= 150000;
          case '€150K+': return price > 150000;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  if (partnersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Find the current partner - EXACT same logic as main app
  const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));
  const relatedCustomers = customersData as any[] || [];
  const relatedOpportunities = opportunitiesData as any[] || [];

  if (!partner) {
    return <div className="p-6">Partner not found</div>;
  }

  const tabs = [
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
    { id: "opportunities", label: "Opportunities" },
    { id: "okr-plans", label: "OKR Plans" }
  ];

  return (
    <div className="iframe-container">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header with partner info and collaborators */}
        <IframeHeader 
          entityType="partner"
          entityId={id || ""}
          entityData={partner}
          users={users}
        />
        
        {/* Activity Hub */}
        <div className="mb-6">
          <PartnerActivityHub 
            partnerId={id || ""} 
            partnerName={partner?.name || ""} 
          />
        </div>

        {/* Main Tabs - Clean blue design for iframe */}
        <div className="bg-white rounded-lg shadow-sm">
          <nav className="flex border-b border-gray-200 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {/* Product Subtabs */}
              <div className="border-b py-4">
                <nav className="-mb-px flex space-x-6">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "matrix", label: "Matrix" },
                    { id: "list", label: "List" }
                  ].map((subtab) => (
                    <button
                      key={subtab.id}
                      onClick={() => setActiveProductTab(subtab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeProductTab === subtab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {subtab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Product Overview Tab */}
              {activeProductTab === "overview" && (
                <PortfolioOverviewTab 
                  entityType="partners" 
                  entityId={id || ""} 
                />
              )}

              {/* Matrix Tab */}
              {activeProductTab === "matrix" && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Matrix view</p>
                </div>
              )}

              {/* Products List Tab - EXACT MIRROR */}
              {activeProductTab === "list" && (
                <div>
                  {/* Enhanced unified toolbar - Products version - EXACT MIRROR */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col gap-4">
                      {/* Top row with saved lists and views */}
                      <div className="flex flex-wrap items-center justify-between">
                        {/* Left side - Saved Lists with actions */}
                        <div className="flex items-center gap-3">
                          {/* Lists heading */}
                          <div className="flex flex-col mr-2">
                            <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
                          </div>
                          {/* Saved Lists dropdown */}
                          <div className="relative" ref={productListsDropdownRef}>
                            <button 
                              className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                              onClick={() => setShowProductListsDropdown(!showProductListsDropdown)}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                                <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                              </svg>
                              <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                                {activeProductList ? activeProductList.name : 'All products'}
                              </span>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className={`transition-transform ${showProductListsDropdown ? 'rotate-180' : ''}`}
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                            
                            {/* Dropdown menu */}
                            {showProductListsDropdown && (
                              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                <div className="p-2">
                                  {/* Default "All products" option */}
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                      !activeProductList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                    }`}
                                    onClick={() => {
                                      setActiveProductList(null);
                                      setShowProductListsDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span>All products</span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    
                      {/* Bottom row with search, views, and filters */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 flex-grow">
                          {/* Search field */}
                          <div className="relative w-60">
                            <input
                              type="text"
                              placeholder="Search products..."
                              value={productSearchText}
                              onChange={(e) => setProductSearchText(e.target.value)}
                              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Search className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          
                          {/* Category Filter Dropdown */}
                          <div className="relative" ref={productCategoryDropdownRef}>
                            <button 
                              className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                                selectedProductCategory 
                                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                              onClick={() => setShowProductCategoryDropdown(!showProductCategoryDropdown)}
                            >
                              <Filter className="w-4 h-4 mr-2" />
                              <span>{selectedProductCategory ? `Category: ${selectedProductCategory}` : 'Category'}</span>
                            </button>
                            
                            {showProductCategoryDropdown && (
                              <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                                <div className="p-1">
                                  {selectedProductCategory && (
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                      onClick={() => {
                                        setSelectedProductCategory("");
                                        setShowProductCategoryDropdown(false);
                                      }}
                                    >
                                      Clear filter
                                    </button>
                                  )}
                                  {['Life', 'Non-Life', 'Property', 'Liability', 'Health', 'Travel'].map((category) => (
                                    <button
                                      key={category}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                        selectedProductCategory === category 
                                          ? 'bg-indigo-50 text-indigo-700' 
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      onClick={() => {
                                        setSelectedProductCategory(category);
                                        setShowProductCategoryDropdown(false);
                                      }}
                                    >
                                      {category}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Price Range Filter Dropdown */}
                          <div className="relative" ref={priceRangeDropdownRef}>
                            <button 
                              className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                                selectedPriceRange 
                                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                              onClick={() => setShowPriceRangeDropdown(!showPriceRangeDropdown)}
                            >
                              <span>{selectedPriceRange ? `Price: ${selectedPriceRange}` : 'Price Range'}</span>
                            </button>
                            
                            {showPriceRangeDropdown && (
                              <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                                <div className="p-1">
                                  {selectedPriceRange && (
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                      onClick={() => {
                                        setSelectedPriceRange("");
                                        setShowPriceRangeDropdown(false);
                                      }}
                                    >
                                      Clear filter
                                    </button>
                                  )}
                                  {['€0 - €50K', '€50K - €100K', '€100K - €150K', '€150K+'].map((range) => (
                                    <button
                                      key={range}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                        selectedPriceRange === range 
                                          ? 'bg-indigo-50 text-indigo-700' 
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      onClick={() => {
                                        setSelectedPriceRange(range);
                                        setShowPriceRangeDropdown(false);
                                      }}
                                    >
                                      {range}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bulk actions bar for products - only visible when products are selected */}
                  {selectedProducts.length > 0 && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-indigo-700 font-medium mr-2">
                          {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'} selected
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600"
                          onClick={() => setSelectedProducts([])}
                        >
                          Clear selection
                        </Button>
                      </div>
                    
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-indigo-600"
                          onClick={() => {
                            console.log('Add selected products to list:', selectedProducts);
                          }}
                        >
                          Add to list
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Products Table Content - EXACT MIRROR */}
                  <div className="space-y-6">
                    {assignmentsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : productAssignments && Array.isArray(productAssignments) && productAssignments.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Products ({
                            productAssignments.filter((product: any) => {
                              const matchesSearch = !productSearchText || 
                                product.productName?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                product.productDescription?.toLowerCase().includes(productSearchText.toLowerCase());
                              
                              const matchesCategory = !selectedProductCategory || product.categoryName === selectedProductCategory;
                              
                              const matchesPrice = !selectedPriceRange || (() => {
                                const price = parseFloat(product.premiumValue || '0');
                                switch(selectedPriceRange) {
                                  case '€0 - €50K': return price >= 0 && price <= 50000;
                                  case '€50K - €100K': return price > 50000 && price <= 100000;
                                  case '€100K - €150K': return price > 100000 && price <= 150000;
                                  case '€150K+': return price > 150000;
                                  default: return true;
                                }
                              })();
                              
                              return matchesSearch && matchesCategory && matchesPrice;
                            }).length
                          })</h3>
                          <p className="text-sm text-gray-600 mt-1">Products associated with this partner</p>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12 group">
                                  <div className={`transition-opacity ${
                                    selectedProducts.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  }`}>
                                    <Checkbox 
                                      checked={selectedProducts.length > 0}
                                      onCheckedChange={toggleSelectAllProducts}
                                    />
                                  </div>
                                </TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Name</TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Description</TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Category</TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Provider</TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Premium Value</TableHead>
                                <TableHead style={{ color: '#696C8C' }}>Premium %</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productAssignments
                                .filter((product: any) => {
                                  const matchesSearch = !productSearchText || 
                                    product.productName?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                                    product.productDescription?.toLowerCase().includes(productSearchText.toLowerCase());
                                  
                                  const matchesCategory = !selectedProductCategory || product.categoryName === selectedProductCategory;
                                  
                                  const matchesPrice = !selectedPriceRange || (() => {
                                    const price = parseFloat(product.premiumValue || '0');
                                    switch(selectedPriceRange) {
                                      case '€0 - €50K': return price >= 0 && price <= 50000;
                                      case '€50K - €100K': return price > 50000 && price <= 100000;
                                      case '€100K - €150K': return price > 100000 && price <= 150000;
                                      case '€150K+': return price > 150000;
                                      default: return true;
                                    }
                                  })();
                                  
                                  return matchesSearch && matchesCategory && matchesPrice;
                                })
                                .map((product: any) => (
                                <TableRow key={product.id} className="hover:bg-gray-50">
                                  <TableCell>
                                    <div className={`transition-opacity ${
                                      selectedProducts.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                      <Checkbox 
                                        checked={isProductSelected(product.id)}
                                        onCheckedChange={() => toggleSelectProduct(product.id)}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{product.productName}</TableCell>
                                  <TableCell className="text-sm text-gray-600">{product.productDescription}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">{product.categoryName}</Badge>
                                  </TableCell>
                                  <TableCell>{product.productProvider}</TableCell>
                                  <TableCell className="font-medium">€{parseFloat(product.premiumValue || '0').toLocaleString()}</TableCell>
                                  <TableCell>{product.premiumPercentage ? `${product.premiumPercentage}%` : '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No products found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customers ({relatedCustomers.length})</h3>
                <p className="text-sm text-gray-600 mt-1">Customers associated with this partner</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ color: '#696C8C' }}>Company</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Industry</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Location</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Annual Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedCustomers.map((customer: any) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{customer.companyName}</TableCell>
                        <TableCell>{customer.industry}</TableCell>
                        <TableCell>{customer.location}</TableCell>
                        <TableCell>€{customer.annualRevenue?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === "opportunities" && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Opportunities ({relatedOpportunities.length})</h3>
                <p className="text-sm text-gray-600 mt-1">Sales opportunities for this partner</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ color: '#696C8C' }}>Opportunity</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Stage</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Probability</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Estimated Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedOpportunities.map((opportunity: any) => (
                      <TableRow key={opportunity.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{opportunity.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{opportunity.stage}</Badge>
                        </TableCell>
                        <TableCell>{opportunity.probability}%</TableCell>
                        <TableCell>€{opportunity.estimatedValue?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* OKR Plans Tab */}
          {activeTab === "okr-plans" && (
            <div className="text-center py-12">
              <p className="text-gray-500">OKR plans view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}