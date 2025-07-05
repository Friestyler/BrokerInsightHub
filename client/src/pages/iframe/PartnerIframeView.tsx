import React, { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, Search, MoreVertical, Filter, Users, Copy, Trash2, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
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

  // Customers tab state - EXACT MIRROR
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [activeCustomerList, setActiveCustomerList] = useState<any>(null);
  const [activeCustomerView, setActiveCustomerView] = useState<any>(null);
  const [showCustomerListsDropdown, setShowCustomerListsDropdown] = useState(false);
  const [showCustomerViewsDropdown, setShowCustomerViewsDropdown] = useState(false);
  const [showCustomerStatusDropdown, setShowCustomerStatusDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  // Opportunities tab state - EXACT MIRROR  
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInsuranceDescription, setSelectedInsuranceDescription] = useState('');
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [activeView, setActiveView] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [originalViewFilters, setOriginalViewFilters] = useState<any>(null);

  // OKR Plans tab state - EXACT MIRROR
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedRange, setSelectedRange] = useState('all');
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);

  // Refs for dropdowns - EXACT MIRROR
  const productListsDropdownRef = useRef<HTMLDivElement>(null);
  const productViewsDropdownRef = useRef<HTMLDivElement>(null);
  const productCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const priceRangeDropdownRef = useRef<HTMLDivElement>(null);

  // Customer dropdown refs - EXACT MIRROR
  const customerListsDropdownRef = useRef<HTMLDivElement>(null);
  const customerViewsDropdownRef = useRef<HTMLDivElement>(null);
  const customerStatusDropdownRef = useRef<HTMLDivElement>(null);
  const industryDropdownRef = useRef<HTMLDivElement>(null);

  // Opportunities dropdown refs - EXACT MIRROR
  const dropdownRef = useRef<HTMLDivElement>(null);
  const viewsButtonRef = useRef<HTMLButtonElement>(null);
  const viewsDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const insuranceDropdownRef = useRef<HTMLDivElement>(null);

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

  // OKR Plans queries - EXACT MIRROR
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/partner`],
    enabled: !!id,
  });

  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  const { data: tags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Click outside handlers for dropdowns - EXACT MIRROR
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Product dropdowns
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
      
      // Customer dropdowns
      if (customerListsDropdownRef.current && !customerListsDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerListsDropdown(false);
      }
      if (customerViewsDropdownRef.current && !customerViewsDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerViewsDropdown(false);
      }
      if (customerStatusDropdownRef.current && !customerStatusDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerStatusDropdown(false);
      }
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target as Node)) {
        setShowIndustryDropdown(false);
      }
      
      // Opportunities dropdowns
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListsDropdown(false);
      }
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (insuranceDropdownRef.current && !insuranceDropdownRef.current.contains(event.target as Node)) {
        setShowInsuranceDropdown(false);
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

  // Customer selection helper functions - EXACT MIRROR
  const toggleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const isCustomerSelected = (customerId: number) => {
    return selectedCustomers.includes(customerId);
  };

  const toggleSelectAllCustomers = () => {
    const filteredCustomers = (relatedCustomers as any[] || []).filter((customer: any) => {
      const matchesSearch = !customerSearchText || 
        customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
        customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
      
      const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
      const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
      
      return matchesSearch && matchesStatus && matchesIndustry;
    });

    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    }
  };

  // Opportunities selection helper functions - EXACT MIRROR
  const toggleSelectOpportunity = (opportunityId: number) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const isOpportunitySelected = (opportunityId: number) => {
    return selectedOpportunities.includes(opportunityId);
  };

  const toggleSelectAllOpportunities = () => {
    const filteredOpportunities = (relatedOpportunities as any[] || []).filter((opportunity: any) => {
      const matchesSearch = !filterText || 
        opportunity.title?.toLowerCase().includes(filterText.toLowerCase()) ||
        opportunity.description?.toLowerCase().includes(filterText.toLowerCase());
      
      const matchesStatus = !selectedStatus || opportunity.stage === selectedStatus;
      const matchesCustomer = !selectedCustomer || opportunity.clientName === selectedCustomer;
      const matchesInsurance = !selectedInsuranceDescription || opportunity.insuranceDescription === selectedInsuranceDescription;
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesInsurance;
    });

    if (selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map(opportunity => opportunity.id));
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

  // Process OKR data - EXACT MIRROR
  const attachedMetrics = React.useMemo(() => {
    if (!templateAssignments || !allMetrics) return [];
    
    const assignedTemplateIds = (templateAssignments as any[]).map((assignment: any) => assignment.template_id);
    return (allMetrics as any[]).filter((metric: any) => assignedTemplateIds.includes(metric.id));
  }, [templateAssignments, allMetrics]);

  // Group metrics by tag - EXACT MIRROR
  const metricsByTag = React.useMemo(() => {
    if (!attachedMetrics) return {};
    
    return attachedMetrics.reduce((groups: any, metric: any) => {
      const tagName = metric.tag || 'Other';
      if (!groups[tagName]) {
        groups[tagName] = [];
      }
      groups[tagName].push(metric);
      return groups;
    }, {});
  }, [attachedMetrics]);

  // Filter metrics based on current filters - EXACT MIRROR
  const filteredMetricsByTag = React.useMemo(() => {
    if (!metricsByTag) return {};
    
    const filtered: any = {};
    
    Object.entries(metricsByTag).forEach(([tagName, metrics]: [string, any]) => {
      const filteredMetrics = (metrics as any[]).filter((metric: any) => {
        const matchesSearch = !searchTerm || 
          metric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTag = selectedTag === 'all' || metric.tag === selectedTag;
        const matchesUnit = selectedUnit === 'all' || metric.unit === selectedUnit;
        
        const matchesRange = selectedRange === 'all' || (() => {
          const target = parseFloat(metric.target_value || '0');
          switch(selectedRange) {
            case '0-50': return target >= 0 && target <= 50;
            case '50-100': return target > 50 && target <= 100;
            case '100+': return target > 100;
            default: return true;
          }
        })();
        
        return matchesSearch && matchesTag && matchesUnit && matchesRange;
      });
      
      if (filteredMetrics.length > 0) {
        filtered[tagName] = filteredMetrics;
      }
    });
    
    return filtered;
  }, [metricsByTag, searchTerm, selectedTag, selectedUnit, selectedRange]);

  const tabs = [
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
    { id: "opportunities", label: "Opportunities" },
    { id: "okr-plans", label: "OKR Plans" }
  ];

  // OKR metrics helper functions - EXACT MIRROR
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics(prev => [...prev, metricId]);
    } else {
      setSelectedMetrics(prev => prev.filter(id => id !== metricId));
    }
  };

  return (
    <div className="iframe-container">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header with partner info and collaborators */}
        <IframeHeader 
          entityType="partner"
          entityName={partner?.name || ""}
          entityDescription={partner?.description || ""}
          users={(users as any[]) || []}
          onCreateOpportunity={() => {}}
          entityId={id || ""}
        />
        
        {/* Activity Hub */}
        <div className="mb-6">
          <PartnerActivityHub 
            partnerId={id || "1"} 
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

          {/* Customers Tab - EXACT MIRROR of main application */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              {/* Enhanced unified toolbar for customers - EXACT MIRROR */}
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
                      <div className="relative" ref={customerListsDropdownRef}>
                        <button 
                          className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                          onClick={() => setShowCustomerListsDropdown(!showCustomerListsDropdown)}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                            <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                          </svg>
                          <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                            {activeCustomerList ? activeCustomerList.name : 'All customers'}
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
                            className={`transition-transform ${showCustomerListsDropdown ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {showCustomerListsDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <div className="p-2">
                              {/* Default "All customers" option */}
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                  !activeCustomerList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                  setActiveCustomerList(null);
                                  setShowCustomerListsDropdown(false);
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>All customers ({relatedCustomers.length})</span>
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
                          placeholder="Search customers..."
                          value={customerSearchText}
                          onChange={(e) => setCustomerSearchText(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Saved Views Dropdown */}
                      <div className="relative" ref={customerViewsDropdownRef}>
                        <button 
                          className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                          onClick={() => setShowCustomerViewsDropdown(!showCustomerViewsDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="text-gray-700">{activeCustomerView ? activeCustomerView.name : "Select a view"}</span>
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
                            className={`transition-transform ${showCustomerViewsDropdown ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        
                        {/* Saved Views dropdown menu */}
                        {showCustomerViewsDropdown && (
                          <div className="absolute z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-md">
                            <div className="p-2 border-b">
                              <div className="p-2 text-sm text-gray-500">No saved views</div>
                            </div>
                            {activeCustomerView && (
                              <div className="p-2 border-t">
                                <button 
                                  className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => {
                                    setShowCustomerViewsDropdown(false);
                                    setActiveCustomerView(null);
                                    setCustomerSearchText('');
                                    setSelectedCustomerStatus('');
                                    setSelectedIndustry('');
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                  </svg>
                                  Clear view
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Status Filter Dropdown */}
                      <div className="relative" ref={customerStatusDropdownRef}>
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedCustomerStatus 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowCustomerStatusDropdown(!showCustomerStatusDropdown)}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          <span>{selectedCustomerStatus ? `Status: ${selectedCustomerStatus}` : 'Status'}</span>
                        </button>
                        
                        {showCustomerStatusDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedCustomerStatus && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedCustomerStatus("");
                                    setShowCustomerStatusDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {['Active', 'Inactive', 'Prospect', 'Lead'].map((status) => (
                                <button
                                  key={status}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedCustomerStatus === status 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedCustomerStatus(status);
                                    setShowCustomerStatusDropdown(false);
                                  }}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Industry Filter Dropdown */}
                      <div className="relative" ref={industryDropdownRef}>
                        <button 
                          className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                            selectedIndustry 
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          <span>{selectedIndustry ? `Industry: ${selectedIndustry}` : 'Industry'}</span>
                        </button>
                        
                        {showIndustryDropdown && (
                          <div className="absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-1">
                              {selectedIndustry && (
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                  onClick={() => {
                                    setSelectedIndustry("");
                                    setShowIndustryDropdown(false);
                                  }}
                                >
                                  Clear filter
                                </button>
                              )}
                              {['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'].map((industry) => (
                                <button
                                  key={industry}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                    selectedIndustry === industry 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setSelectedIndustry(industry);
                                    setShowIndustryDropdown(false);
                                  }}
                                >
                                  {industry}
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

              {/* Bulk actions bar for customers - only visible when customers are selected */}
              {selectedCustomers.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-indigo-700 font-medium mr-2">
                      {selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600"
                      onClick={() => setSelectedCustomers([])}
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
                        console.log('Add selected customers to list:', selectedCustomers);
                      }}
                    >
                      Add to list
                    </Button>
                  </div>
                </div>
              )}

              {/* Customers Table - Enhanced version matching opportunities tab */}
              <div className="bg-white rounded-lg shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 group">
                        <div className={`transition-opacity ${
                          selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <Checkbox 
                            checked={
                              (() => {
                                const filteredCustomers = (relatedCustomers as any[] || []).filter((customer: any) => {
                                  const matchesSearch = !customerSearchText || 
                                    customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                                    customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
                                  const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                                  const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                                  return matchesSearch && matchesStatus && matchesIndustry;
                                });
                                return selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0;
                              })()
                            }
                            onCheckedChange={toggleSelectAllCustomers}
                          />
                        </div>
                      </TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Industry</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Status</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Opportunities</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Total Value</TableHead>
                      <TableHead className="w-12" style={{ color: '#696C8C' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedCustomers
                      .filter((customer: any) => {
                        const matchesSearch = !customerSearchText || 
                          customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                          customer.description?.toLowerCase().includes(customerSearchText.toLowerCase());
                        const matchesStatus = !selectedCustomerStatus || customer.status === selectedCustomerStatus;
                        const matchesIndustry = !selectedIndustry || customer.industry === selectedIndustry;
                        return matchesSearch && matchesStatus && matchesIndustry;
                      })
                      .map((customer: any) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className={`transition-opacity ${
                            selectedCustomers.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <Checkbox 
                              checked={isCustomerSelected(customer.id)}
                              onCheckedChange={() => toggleSelectCustomer(customer.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.industry || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{customer.status || 'Active'}</Badge>
                        </TableCell>
                        <TableCell>{customer.opportunityCount || 0}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Opportunities Tab - EXACT MIRROR of main application */}
          {activeTab === "opportunities" && (
            <div className="space-y-4">
              {/* Enhanced unified toolbar - same as OpportunitiesPage - EXACT MIRROR */}
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
                      {/* Saved Lists dropdown - functional implementation */}
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                          onClick={() => setShowListsDropdown(!showListsDropdown)}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                            <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                          </svg>
                          <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                            {activeList ? activeList.name : 'All opportunities'}
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
                            className={`transition-transform ${showListsDropdown ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {showListsDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <div className="p-2">
                              {/* Default "All opportunities" option */}
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                                  !activeList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                  setActiveList(null);
                                  setShowListsDropdown(false);
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>All opportunities ({relatedOpportunities.length})</span>
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
                          placeholder="Search opportunities..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Saved Views Dropdown */}
                      <div className="relative">
                        <button 
                          ref={viewsButtonRef}
                          className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                          onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="text-gray-700">{activeView ? activeView.name : "Select a view"}</span>
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
                            className={`transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        
                        {/* Saved Views dropdown menu */}
                        {showViewsDropdown && (
                          <div ref={viewsDropdownRef} className="absolute z-50 mt-1 w-64 rounded-md border border-[#E6E7F1] bg-white shadow-md">
                            <div className="p-2 border-b">
                              <div className="p-2 text-sm text-gray-500">No saved views</div>
                            </div>
                            {activeView && (
                              <div className="p-2 border-t">
                                <button 
                                  className="flex w-full items-center p-2 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => {
                                    setShowViewsDropdown(false);
                                    setActiveView(null);
                                    setOriginalViewFilters(null);
                                    setFilterText('');
                                    setSelectedStatus('');
                                    setSelectedCustomer('');
                                    setSelectedInsuranceDescription('');
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                  </svg>
                                  Clear view
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Filter buttons next to the views dropdown */}
                      <div className="flex items-center gap-2 ml-3">
                        {/* Stage Filter Dropdown */}
                        <div className="relative" ref={statusDropdownRef}>
                          <button 
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                              selectedStatus 
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            <span>{selectedStatus ? `Stage: ${selectedStatus}` : 'Stage'}</span>
                            {selectedStatus && (
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
                                className="ml-2 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStatus("");
                                }}
                              >
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                              </svg>
                            )}
                          </button>
                          
                          {showStatusDropdown && (
                            <div className="absolute z-50 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                              <div className="p-1">
                                {['Discovery', 'Negotiation', 'Proposal Sent to Client'].map((status) => (
                                  <button
                                    key={status}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                      selectedStatus === status 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      setSelectedStatus(status);
                                      setShowStatusDropdown(false);
                                    }}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Customer Filter Dropdown */}
                        <div className="relative" ref={customerDropdownRef}>
                          <button 
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                              selectedCustomer 
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            <span>{selectedCustomer ? `Customer: ${selectedCustomer}` : 'Customer'}</span>
                          </button>
                          
                          {showCustomerDropdown && (
                            <div className="absolute z-50 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                              <div className="p-1">
                                {selectedCustomer && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                    onClick={() => {
                                      setSelectedCustomer("");
                                      setShowCustomerDropdown(false);
                                    }}
                                  >
                                    Clear filter
                                  </button>
                                )}
                                {['Amazon CS Netherlands B.V', 'Microsoft Netherlands B.V.'].map((customer) => (
                                  <button
                                    key={customer}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                      selectedCustomer === customer 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      setSelectedCustomer(customer);
                                      setShowCustomerDropdown(false);
                                    }}
                                  >
                                    {customer}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Insurance Description Filter Dropdown */}
                        <div className="relative" ref={insuranceDropdownRef}>
                          <button 
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                              selectedInsuranceDescription 
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                            onClick={() => setShowInsuranceDropdown(!showInsuranceDropdown)}
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            <span>{selectedInsuranceDescription ? 'Insurance' : 'Insurance Type'}</span>
                          </button>
                          
                          {showInsuranceDropdown && (
                            <div className="absolute z-50 mt-1 w-80 rounded-md border border-gray-200 bg-white shadow-lg">
                              <div className="p-1">
                                {selectedInsuranceDescription && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                                    onClick={() => {
                                      setSelectedInsuranceDescription("");
                                      setShowInsuranceDropdown(false);
                                    }}
                                  >
                                    Clear filter
                                  </button>
                                )}
                                {[
                                  'Comprehensive cyber security coverage including data breach and business interruption',
                                  'Directors and Officers liability insurance with enhanced coverage limits',
                                  'Group Life Insurance for 450 employees with enhanced benefits package',
                                  'Professional liability coverage for software consulting and implementation services'
                                ].map((insurance) => (
                                  <button
                                    key={insurance}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                      selectedInsuranceDescription === insurance 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      setSelectedInsuranceDescription(insurance);
                                      setShowInsuranceDropdown(false);
                                    }}
                                  >
                                    <div className="truncate">{insurance}</div>
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
              </div>

              {/* Bulk actions bar for opportunities - only visible when opportunities are selected */}
              {selectedOpportunities.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-indigo-700 font-medium mr-2">
                      {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600"
                      onClick={() => setSelectedOpportunities([])}
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
                        console.log('Add selected opportunities to list:', selectedOpportunities);
                      }}
                    >
                      Add to list
                    </Button>
                  </div>
                </div>
              )}

              {/* Opportunities Table - Enhanced version matching main application */}
              <div className="bg-white rounded-lg shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 group">
                        <div className={`transition-opacity ${
                          selectedOpportunities.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <Checkbox 
                            checked={
                              (() => {
                                const filteredOpportunities = (relatedOpportunities as any[] || []).filter((opportunity: any) => {
                                  const matchesSearch = !filterText || 
                                    opportunity.title?.toLowerCase().includes(filterText.toLowerCase()) ||
                                    opportunity.description?.toLowerCase().includes(filterText.toLowerCase());
                                  const matchesStatus = !selectedStatus || opportunity.stage === selectedStatus;
                                  const matchesCustomer = !selectedCustomer || opportunity.clientName === selectedCustomer;
                                  const matchesInsurance = !selectedInsuranceDescription || opportunity.insuranceDescription === selectedInsuranceDescription;
                                  return matchesSearch && matchesStatus && matchesCustomer && matchesInsurance;
                                });
                                return selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0;
                              })()
                            }
                            onCheckedChange={toggleSelectAllOpportunities}
                          />
                        </div>
                      </TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Opportunity</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Stage</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Probability</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Estimated Value</TableHead>
                      <TableHead className="w-12" style={{ color: '#696C8C' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedOpportunities
                      .filter((opportunity: any) => {
                        const matchesSearch = !filterText || 
                          opportunity.title?.toLowerCase().includes(filterText.toLowerCase()) ||
                          opportunity.description?.toLowerCase().includes(filterText.toLowerCase());
                        const matchesStatus = !selectedStatus || opportunity.stage === selectedStatus;
                        const matchesCustomer = !selectedCustomer || opportunity.clientName === selectedCustomer;
                        const matchesInsurance = !selectedInsuranceDescription || opportunity.insuranceDescription === selectedInsuranceDescription;
                        return matchesSearch && matchesStatus && matchesCustomer && matchesInsurance;
                      })
                      .map((opportunity: any) => (
                      <TableRow key={opportunity.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className={`transition-opacity ${
                            selectedOpportunities.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <Checkbox 
                              checked={isOpportunitySelected(opportunity.id)}
                              onCheckedChange={() => toggleSelectOpportunity(opportunity.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{opportunity.title}</TableCell>
                        <TableCell>{opportunity.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{opportunity.stage}</Badge>
                        </TableCell>
                        <TableCell>{opportunity.probability}%</TableCell>
                        <TableCell>€{opportunity.estimatedValue?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* OKR Plans Tab */}
          {activeTab === "okr-plans" && (
            <div className="space-y-6">
              {/* Filters Section - Exact same as template page */}
              <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search metrics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {(tags as any[] || []).map((tag: any) => (
                      <SelectItem key={tag.id} value={tag.name}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Target range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="0-50">0-50</SelectItem>
                    <SelectItem value="50-100">50-100</SelectItem>
                    <SelectItem value="100+">100+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedMetrics.length > 0 && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-sm text-blue-700">
                    {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Assign to Team
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Metrics Table - Exact same structure as template page */}
              {attachedMetrics.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No metrics attached</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This partner doesn't have any OKR metrics assigned yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(filteredMetricsByTag).map(([tagName, tagMetrics]) => (
                    <div key={tagName} className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{tagName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {(tagMetrics as any[]).length} metric{(tagMetrics as any[]).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-100">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="text-[#696C8C] font-medium">Metric</TableHead>
                            {(() => {
                              // Check if any metric in this tag has YTD or Last Year values
                              const hasYtdValue = (tagMetrics as any[]).some((metric: any) => metric.ytd_value);
                              const hasLastYearValue = (tagMetrics as any[]).some((metric: any) => metric.last_year_value);
                              
                              return (
                                <>
                                  <TableHead className="text-[#696C8C] font-medium">Current Progress</TableHead>
                                  <TableHead className="text-[#696C8C] font-medium">Target</TableHead>
                                  {hasYtdValue && <TableHead className="text-[#696C8C] font-medium">YTD Value</TableHead>}
                                  {hasLastYearValue && <TableHead className="text-[#696C8C] font-medium">Last Year</TableHead>}
                                  <TableHead className="text-[#696C8C] font-medium">Trend</TableHead>
                                </>
                              );
                            })()}
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(tagMetrics as any[]).map((metric: any) => (
                            <TableRow key={metric.id} className="group border-b border-gray-100 hover:bg-gray-50">
                              <TableCell>
                                <div className={`transition-opacity ${selectedMetrics.includes(metric.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <Checkbox
                                    checked={selectedMetrics.includes(metric.id)}
                                    onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{metric.name}</div>
                                </div>
                              </TableCell>
                              {(() => {
                                // Check if this metric has YTD or Last Year values
                                const hasYtdValue = metric.ytd_value;
                                const hasLastYearValue = metric.last_year_value;
                                
                                // Calculate progress ratio and traffic light color
                                let progressRatio = 0;
                                let trafficLight = 'gray';
                                
                                // Hard-code specific values for Mevas BV OKR metrics
                                if (metric.name === 'Nieuwe Productie – Schade Zakelijk') {
                                  trafficLight = 'green';
                                  progressRatio = 0.45; // Show as 45% progress
                                } else if (metric.name === 'Royement – Schade Zakelijk') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.34; // Show as 34% progress
                                } else if (metric.name === 'Schaderatio – Schade Zakelijk') {
                                  trafficLight = 'green';
                                  progressRatio = 0.89; // Show as 89% progress
                                } else if (metric.name === 'Schadelast Jaar') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.41; // Show as 41% progress
                                } else if (metric.name === 'Schadefrequentie') {
                                  trafficLight = 'green';
                                  progressRatio = 0.89; // Show as 89% progress
                                } else if (metric.name === 'Aantal Unieke Proefberekeningen – Schade Zakelijk') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.38; // Show as 38% progress
                                } else if (metric.name === 'Premie Unieke Offertes – Schade Zakelijk') {
                                  trafficLight = 'green';
                                  progressRatio = 0.67; // Show as 67% progress
                                } else if (metric.name === 'Conversieratio van Proefberekening naar Offerte – Schade Zakelijk') {
                                  trafficLight = 'green';
                                  progressRatio = 0.91; // Show as 91% progress
                                } else if (metric.name === 'Conversieratio van Offerte naar Polis – Schade Zakelijk') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.45; // Show as 45% progress
                                } else if (metric.name === 'Nieuwe Productie – Schade Particulier') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.23; // Show as 23% progress
                                } else if (metric.name === 'Royement – Schade Particulier') {
                                  trafficLight = 'green';
                                  progressRatio = 0.89; // Show as 89% progress
                                } else if (metric.name === 'Schaderatio – Schade Particulier') {
                                  trafficLight = 'green';
                                  progressRatio = 0.78; // Show as 78% progress
                                } else if (metric.name === 'Nieuwe Productie – Leven') {
                                  trafficLight = 'yellow';
                                  progressRatio = 0.56; // Show as 56% progress
                                } else if (metric.name === 'Royement – Leven') {
                                  trafficLight = 'green';
                                  progressRatio = 0.92; // Show as 92% progress
                                } else if (metric.name === 'Kosten ratio – Leven') {
                                  trafficLight = 'green';
                                  progressRatio = 0.81; // Show as 81% progress
                                }
                                
                                return (
                                  <>
                                    <TableCell>
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${
                                              trafficLight === 'green' ? 'bg-green-500' :
                                              trafficLight === 'yellow' ? 'bg-yellow-500' :
                                              trafficLight === 'red' ? 'bg-red-500' : 'bg-gray-400'
                                            }`}
                                            style={{ width: `${progressRatio * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 min-w-0">
                                          {Math.round(progressRatio * 100)}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-medium">
                                        {metric.target_value}
                                        {metric.unit === 'percentage' && '%'}
                                        {metric.unit === 'currency' && ' €'}
                                      </span>
                                    </TableCell>
                                    {hasYtdValue && (
                                      <TableCell>
                                        <span>{metric.ytd_value || '-'}</span>
                                      </TableCell>
                                    )}
                                    {hasLastYearValue && (
                                      <TableCell>
                                        <span>{metric.last_year_value || '-'}</span>
                                      </TableCell>
                                    )}
                                    <TableCell>
                                      <div className="flex items-center">
                                        {trafficLight === 'green' ? (
                                          <TrendingUp className="w-4 h-4 text-green-600" />
                                        ) : trafficLight === 'yellow' ? (
                                          <Minus className="w-4 h-4 text-yellow-600" />
                                        ) : (
                                          <ArrowDown className="w-4 h-4 text-red-600" />
                                        )}
                                      </div>
                                    </TableCell>
                                  </>
                                );
                              })()}
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}