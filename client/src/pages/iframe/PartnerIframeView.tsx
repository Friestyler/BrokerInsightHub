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
    queryKey: [`/api/${environment.id}/partners/${id}/product-assignments`],
  });

  // Fetch users data
  const { data: users } = useQuery({
    queryKey: [`/api/users`],
  });

  // OKR Plans queries - EXACT MIRROR
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/${environment.id}/template-assignments/partner`],
  });

  const { data: allMetrics } = useQuery({
    queryKey: [`/api/${environment.id}/okr-metrics`],
  });

  const { data: allTags } = useQuery({
    queryKey: [`/api/${environment.id}/okr-tags`],
  });

  // Process OKR data - EXACT MIRROR (ALL HOOKS MUST BE AT TOP)
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

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(assignedProducts)) return [];
    
    return assignedProducts.filter((product: any) => {
      const matchesSearch = !productSearchText || 
        product.productName?.toLowerCase().includes(productSearchText.toLowerCase()) ||
        product.productDescription?.toLowerCase().includes(productSearchText.toLowerCase());
      
      const matchesCategory = selectedProductCategory === 'all' || 
        product.categoryName?.toLowerCase().includes(selectedProductCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [assignedProducts, productSearchText, selectedProductCategory]);

  if (partnersLoading) {
    return <div className="p-6">Loading...</div>;
  }

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
            partnerId={parseInt(id || "1")} 
            partnerName={partner?.name || ""} 
          />
        </div>

        {/* Main Tabs - EXACT UX/UI with blue background and counts */}
        <div className="bg-white rounded-lg shadow-sm">
          <nav className="flex gap-2 p-4">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-[#E6E7F1] text-[#5567E5]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Products ({Array.isArray(assignedProducts) ? assignedProducts.length : 0})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "customers"
                  ? "bg-[#E6E7F1] text-[#5567E5]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Customers ({Array.isArray(relatedCustomers) ? relatedCustomers.length : 0})
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "opportunities"
                  ? "bg-[#E6E7F1] text-[#5567E5]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Opportunities ({Array.isArray(relatedOpportunities) ? relatedOpportunities.length : 0})
            </button>
            <button
              onClick={() => setActiveTab("okr-plans")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "okr-plans"
                  ? "bg-[#E6E7F1] text-[#5567E5]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              OKR plans
            </button>
          </nav>

          <div className="py-2">
            {activeTab === "products" && (
              <div>
                {/* Product subtabs with blue underline when selected */}
                <div className="flex px-6 mb-4 border-b border-gray-200">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "matrix", label: "Matrix" },
                    { id: "list", label: "List" }
                  ].map((subtab) => (
                    <button
                      key={subtab.id}
                      onClick={() => setActiveProductTab(subtab.id)}
                      className={`px-4 py-3 text-sm font-medium transition-colors mr-4 border-b-2 -mb-px ${
                        activeProductTab === subtab.id
                          ? "text-[#5567E5] border-[#5567E5]"
                          : "text-gray-600 hover:text-[#5567E5] border-transparent"
                      }`}
                    >
                      {subtab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {activeProductTab === "overview" && (
                    <PortfolioOverviewTab 
                      entityType="partners"
                      entityId={id || "1"}
                    />
                  )}
                  {activeProductTab === "matrix" && (
                    <div className="text-center py-12 text-gray-500">
                      Cross-sell matrix functionality coming soon
                    </div>
                  )}
                  {activeProductTab === "list" && (
                    <div>
                      {/* EXACT MIRROR of main app product list functionality */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                placeholder="Search products..."
                                value={productSearchText}
                                onChange={(e) => setProductSearchText(e.target.value)}
                                className="pl-10 w-64"
                              />
                            </div>
                            
                            <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="All categories" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                <SelectItem value="life">Life Insurance</SelectItem>
                                <SelectItem value="non-life">Non-Life Insurance</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="All prices" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All prices</SelectItem>
                                <SelectItem value="0-100">€0 - €100</SelectItem>
                                <SelectItem value="100-500">€100 - €500</SelectItem>
                                <SelectItem value="500+">€500+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Product Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedProducts(filteredProducts.map((p: any) => p.id));
                                      } else {
                                        setSelectedProducts([]);
                                      }
                                    }}
                                  />
                                </TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Product</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Category</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Provider</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Premium</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Premium %</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Contract</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProducts.map((product: any) => (
                                <TableRow 
                                  key={product.id} 
                                  className={`hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedProducts.includes(product.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedProducts(prev => [...prev, product.id]);
                                        } else {
                                          setSelectedProducts(prev => prev.filter(id => id !== product.id));
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <div>
                                      <div className="font-medium text-gray-900">{product.productName}</div>
                                      <div className="text-sm text-gray-500">{product.productDescription}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{product.categoryName || 'Insurance'}</Badge>
                                  </TableCell>
                                  <TableCell>{product.provider || 'De Goudse'}</TableCell>
                                  <TableCell>€{(product.premiumValue || 0).toLocaleString()}</TableCell>
                                  <TableCell>{(product.premiumPercentage || 0)}%</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div>{new Date(product.contractStartDate || Date.now()).toLocaleDateString()}</div>
                                      <div className="text-gray-500">to {new Date(product.contractEndDate || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectedProducts.length > 0 && (
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-900">
                                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedProducts([])}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Clear selection
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                                  Add to campaign
                                </Button>
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                                  Create opportunity
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "okr-plans" && (
              <div className="p-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">OKR Metrics</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search metrics..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      
                      <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All tags" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tags</SelectItem>
                          {(allTags as any[] || []).map((tag: any) => (
                            <SelectItem key={tag.id} value={tag.name}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All units</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="currency">€</SelectItem>
                          <SelectItem value="number">#</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedRange} onValueChange={setSelectedRange}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ranges</SelectItem>
                          <SelectItem value="0-50">0-50</SelectItem>
                          <SelectItem value="50-100">50-100</SelectItem>
                          <SelectItem value="100+">100+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* OKR Table with exact structure matching user screenshot */}
                  <div className="space-y-6">
                    {Object.entries(filteredMetricsByTag).map(([tagName, metrics]) => (
                      <div key={tagName} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`${
                              tagName === 'Customer Satisfaction' ? 'border-blue-500 text-blue-700 bg-blue-50' : 
                              tagName === 'Risk Management' ? 'border-red-500 text-red-700 bg-red-50' : 
                              'border-gray-500 text-gray-700 bg-gray-50'
                            }`}
                          >
                            {tagName}
                          </Badge>
                          <span className="text-sm text-gray-500">({(metrics as any[]).length} metrics)</span>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={(metrics as any[]).every(metric => selectedMetrics.includes(metric.id))}
                                    onCheckedChange={(checked) => {
                                      const metricIds = (metrics as any[]).map(m => m.id);
                                      if (checked) {
                                        setSelectedMetrics(prev => [...new Set([...prev, ...metricIds])]);
                                      } else {
                                        setSelectedMetrics(prev => prev.filter(id => !metricIds.includes(id)));
                                      }
                                    }}
                                  />
                                </TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Name</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Realized</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Target</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Progress</TableHead>
                                <TableHead className="font-medium text-[#696C8C]">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(metrics as any[]).map((metric: any) => {
                                const realized = parseFloat(metric.current_value || '0');
                                const target = parseFloat(metric.target_value || '1');
                                const progress = target > 0 ? (realized / target) * 100 : 0;
                                const isSelected = selectedMetrics.includes(metric.id);
                                
                                return (
                                  <TableRow 
                                    key={metric.id}
                                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                  >
                                    <TableCell>
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      <div>
                                        <div className="font-medium text-gray-900">{metric.name}</div>
                                        {metric.description && (
                                          <div className="text-sm text-gray-500">{metric.description}</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-medium">
                                        {metric.unit === 'percentage' ? `${realized.toFixed(1)}%` :
                                         metric.unit === 'currency' ? `€${realized.toLocaleString()}` :
                                         realized.toLocaleString()}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-gray-700">
                                        {metric.unit === 'percentage' ? `${target.toFixed(1)}%` :
                                         metric.unit === 'currency' ? `€${target.toLocaleString()}` :
                                         target.toLocaleString()}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${
                                              progress >= 100 ? 'bg-green-500' :
                                              progress >= 75 ? 'bg-blue-500' :
                                              progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                          {progress.toFixed(0)}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant="outline"
                                        className={
                                          progress >= 100 ? 'border-green-500 text-green-700 bg-green-50' :
                                          progress >= 75 ? 'border-blue-500 text-blue-700 bg-blue-50' :
                                          progress >= 50 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                          'border-red-500 text-red-700 bg-red-50'
                                        }
                                      >
                                        {progress >= 100 ? 'Completed' :
                                         progress >= 75 ? 'On Track' :
                                         progress >= 50 ? 'At Risk' : 'Behind'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}

                    {Object.keys(filteredMetricsByTag).length === 0 && (
                      <div className="text-center py-12">
                        <Target className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="p-4">
                {/* EXACT MIRROR of main app customers functionality */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search customers..."
                          value={customerSearchText}
                          onChange={(e) => setCustomerSearchText(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      
                      <Select value={selectedCustomerStatus} onValueChange={setSelectedCustomerStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All industries</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Customer Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Customer</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Industry</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Status</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Opportunities</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedCustomers.map((customer: any) => (
                          <TableRow key={customer.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.industry || 'Technology'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>{customer.opportunity_count || 0}</TableCell>
                            <TableCell>€{(customer.total_value || 0).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "opportunities" && (
              <div className="p-4">
                {/* EXACT MIRROR of main app opportunities functionality */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search opportunities..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All stages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All stages</SelectItem>
                          <SelectItem value="discovery">Discovery</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed-won">Closed Won</SelectItem>
                          <SelectItem value="closed-lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All customers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All customers</SelectItem>
                          {relatedCustomers.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.name}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Opportunities Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Opportunity</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Customer</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Stage</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Value</TableHead>
                          <TableHead className="font-medium text-[#696C8C]">Probability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedOpportunities.slice(0, 10).map((opportunity: any) => (
                          <TableRow key={opportunity.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium text-gray-900">{opportunity.title}</div>
                                <div className="text-sm text-gray-500">{opportunity.insurance_description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{opportunity.customer_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                opportunity.stage === 'closed-won' ? 'border-green-500 text-green-700 bg-green-50' :
                                opportunity.stage === 'negotiation' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                                'border-gray-500 text-gray-700 bg-gray-50'
                              }>
                                {opportunity.stage?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Discovery'}
                              </Badge>
                            </TableCell>
                            <TableCell>€{(opportunity.estimated_value || 0).toLocaleString()}</TableCell>
                            <TableCell>{(opportunity.probability || 0)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}