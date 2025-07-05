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

export default function CustomerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // OKR filtering state - exact same as main pages
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedRange, setSelectedRange] = useState('all');
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);

  // Fetch specific customer data - EXACT same as main app
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: [`/api/customers/${id}`],
    enabled: !!id,
  });

  // Fetch all customers to find this specific customer - EXACT same as main app
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  // OKR Plans queries - EXACT MIRROR
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/customer`],
    enabled: !!id,
  });

  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });



  // Fetch related partners for this customer - EXACT same as main app
  const { data: relatedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/customers/${id}/partners`],
    enabled: !!id,
  });

  // Fetch related opportunities for this customer - EXACT same as main app
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/customers/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch users for collaborators - EXACT same as main app
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Customer Product Assignments - EXACT same as main app
  const { data: assignedProducts, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/degoudse/customers/${id}/product-assignments`],
    enabled: !!id
  });

  // Fetch OKR metrics - EXACT same as main app
  const { data: metrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch OKR tags - EXACT same as main app
  const { data: okrTags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

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

  // OKR metrics helper functions - EXACT MIRROR
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics(prev => [...prev, metricId]);
    } else {
      setSelectedMetrics(prev => prev.filter(id => id !== metricId));
    }
  };

  if (!id) {
    return <div className="p-6">Customer ID not found</div>;
  }

  if (customerLoading || customersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const opportunityCount = Array.isArray(relatedOpportunities) ? relatedOpportunities.length : 0;
  const partnerCount = Array.isArray(relatedPartners) ? relatedPartners.length : 0;

  const handleCreateOpportunity = () => {
    setIsCreateModalOpen(true);
  };

  // Render Product subtabs exactly like main app
  const renderProductSubtabs = () => {
    return (
      <div className="space-y-4">
        {/* Product subtabs - with proper spacing and blue underlines */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 mb-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveProductTab("overview")}
              className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-md border-b-2 ${
                activeProductTab === "overview"
                  ? "bg-[#E1E4FB] text-[#3E4DC4] border-blue-500"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5] border-transparent"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveProductTab("matrix")}
              className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-md border-b-2 ${
                activeProductTab === "matrix"
                  ? "bg-[#E1E4FB] text-[#3E4DC4] border-blue-500"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5] border-transparent"
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveProductTab("list")}
              className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-md border-b-2 ${
                activeProductTab === "list"
                  ? "bg-[#E1E4FB] text-[#3E4DC4] border-blue-500"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5] border-transparent"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Product content based on selected subtab */}
        {activeProductTab === "overview" && (
          <div className="p-4">
            <PortfolioOverviewTab 
              entityType="customers"
              entityId={id}
              isModalOpen={isCreateModalOpen}
              onModalClose={() => setIsCreateModalOpen(false)}
            />
          </div>
        )}

        {activeProductTab === "matrix" && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <p>Cross-sell matrix view coming soon</p>
            </div>
          </div>
        )}

        {activeProductTab === "list" && (
          <div className="p-4">
            {/* EXACT MIRROR of Customer Product Assignments structure */}
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
                      <div className="relative">
                        <button 
                          className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                            <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                          </svg>
                          <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                            All products
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
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced unified toolbar - second row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Search products..."
                        value=""
                        onChange={() => {}}
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                      <select className="h-8 px-3 py-1 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="all">All Categories</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="relative">
                      <select className="h-8 px-3 py-1 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="all">All Prices</option>
                        <option value="€0 - €50K">€0 - €50K</option>
                        <option value="€50K - €100K">€50K - €100K</option>
                        <option value="€100K - €150K">€100K - €150K</option>
                        <option value="€150K+">€150K+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Statistics Cards - EXACT MIRROR */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{(assignedProducts as any[] || []).length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        €{(assignedProducts as any[] || []).reduce((sum: number, product: any) => sum + parseFloat(product.premiumValue || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {[...new Set((assignedProducts as any[] || []).map((p: any) => p.categoryName).filter(Boolean))].length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg Premium %</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(assignedProducts as any[] || []).length > 0 
                          ? ((assignedProducts as any[]).reduce((sum: number, product: any) => sum + parseFloat(product.premiumPercentage || 0), 0) / (assignedProducts as any[]).length).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table - EXACT MIRROR */}
              <div className="space-y-6 mt-6">
                {assignmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : assignedProducts && Array.isArray(assignedProducts) && assignedProducts.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Product Assignments ({(assignedProducts as any[]).length})</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Product Name</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Description</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Category</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Contract Start</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Contract End</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Premium Value</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Premium %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedProducts.map((assignment: any) => (
                          <TableRow key={assignment.id} className="group hover:bg-gray-50">
                            <TableCell>
                              <div className="transition-opacity opacity-0 group-hover:opacity-100">
                                <Checkbox />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{assignment.productName}</TableCell>
                            <TableCell>{assignment.productDescription}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {assignment.categoryName || assignment.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {assignment.contractStartDate ? new Date(assignment.contractStartDate).toLocaleDateString('en-GB') : '-'}
                            </TableCell>
                            <TableCell>
                              {assignment.contractEndDate ? new Date(assignment.contractEndDate).toLocaleDateString('en-GB') : '-'}
                            </TableCell>
                            <TableCell>€{parseFloat(assignment.premiumValue || 0).toLocaleString()}</TableCell>
                            <TableCell>{assignment.premiumPercentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">No products are currently associated with this customer.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 iframe-container" 
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        border: 'none !important',
        outline: 'none !important',
        margin: '0 !important',
        padding: '0 !important',
        boxShadow: 'none !important',
        borderRadius: '0 !important',
        overflow: 'visible'
      }}>
      {/* Shared IframeHeader component */}
      <IframeHeader
        entityType="customer"
        entityName={customer?.name || 'Customer'}
        entityDescription="Business customer with multiple insurance needs"
        users={users || []}
        onCreateOpportunity={handleCreateOpportunity}
        entityId={id || '18'}
      />

      {/* Activity section with EXACT same layout and functionality as partner iframe */}
      <div className="bg-white px-6 pt-0 pb-4">
        <PartnerActivityHub 
          partnerId={parseInt(id || '18')} 
          partnerName={customer?.name || 'Customer'} 
          entityType="customer"
          entityId={parseInt(id || '18')}
        />
      </div>

      {/* Main tabs exactly like partner detail page */}
      <div className="bg-white px-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
              activeTab === "products"
                ? "bg-[#E1E4FB] text-[#3E4DC4]"
                : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
            }`}
          >
            Products (0)
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
              activeTab === "partners"
                ? "bg-[#E1E4FB] text-[#3E4DC4]"
                : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
            }`}
          >
            Partners ({partnerCount})
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
              activeTab === "opportunities"
                ? "bg-[#E1E4FB] text-[#3E4DC4]"
                : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
            }`}
          >
            Opportunities ({opportunityCount})
          </button>
          <button
            onClick={() => setActiveTab("okr")}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
              activeTab === "okr"
                ? "bg-[#E1E4FB] text-[#3E4DC4]"
                : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
            }`}
          >
            OKR plans
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="bg-white">
        {activeTab === "products" && renderProductSubtabs()}

        {activeTab === "partners" && (
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Partners</h3>
              {Array.isArray(relatedPartners) ? relatedPartners.map((partner: any) => (
                <div key={partner?.id || Math.random()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{partner?.name || 'Partner'}</h4>
                      <p className="text-sm text-gray-500">{partner?.type || 'Partnership not specified'}</p>
                    </div>
                    <Badge variant="outline">{partner?.status || 'Active'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{partner?.description || 'No description available'}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No partners found for this customer</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Opportunities</h3>
              {Array.isArray(relatedOpportunities) ? relatedOpportunities.map((opportunity: any) => (
                <div key={opportunity?.id || Math.random()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{opportunity?.title || 'Opportunity'}</h4>
                      <p className="text-sm text-gray-500">{opportunity?.description || 'No description'}</p>
                    </div>
                    <Badge variant="outline">{opportunity?.stage || 'Open'}</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No opportunities found for this customer</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "okr" && (
          <div className="p-6 space-y-6">
            {/* Filters Section - EXACT MIRROR */}
            <div className="flex items-center space-x-4">
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
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {(okrTags as any[] || []).map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Units" />
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
                  <SelectValue placeholder="All Ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0-50">0-50</SelectItem>
                  <SelectItem value="50-100">50-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Display - EXACT screenshot table layout */}
            <div className="space-y-6">
              {Object.entries(filteredMetricsByTag).map(([tagName, tagMetrics]) => (
                <div key={tagName} className="bg-white">
                  <div className="mb-4">
                    <Badge 
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tagName === 'Customer Satisfaction' ? 'bg-blue-100 text-blue-800' :
                        tagName === 'Risk Management' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tagName}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-500">
                      ({(tagMetrics as any[]).length} metric{(tagMetrics as any[]).length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="text-[#696C8C] font-medium">Name</TableHead>
                        <TableHead className="text-[#696C8C] font-medium">Realized</TableHead>
                        <TableHead className="text-[#696C8C] font-medium">Target</TableHead>
                        <TableHead className="text-[#696C8C] font-medium">Progress</TableHead>
                        <TableHead className="text-[#696C8C] font-medium">Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tagMetrics as any[]).map((metric: any) => (
                        <TableRow key={metric.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium text-gray-900">{metric.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-gray-900">
                                {metric.current_value || 0}
                              </span>
                              <span className="ml-1 text-gray-500 text-sm">
                                {metric.unit === 'percentage' ? 'percent' : metric.unit}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-gray-900">
                                {metric.target_value || 0}
                              </span>
                              <span className="ml-1 text-gray-500 text-sm">
                                {metric.unit === 'percentage' ? 'percent' : metric.unit}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ 
                                    width: `${Math.min(100, ((metric.current_value || 0) / (metric.target_value || 1)) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 min-w-0">
                                {Math.round(((metric.current_value || 0) / (metric.target_value || 1)) * 100)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`w-3 h-3 rounded-full ${
                              ((metric.current_value || 0) / (metric.target_value || 1)) >= 0.9 ? 'bg-green-500' : 
                              ((metric.current_value || 0) / (metric.target_value || 1)) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          </TableCell>
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
              
              {Object.keys(filteredMetricsByTag).length === 0 && (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm || selectedTag !== 'all' || selectedUnit !== 'all' || selectedRange !== 'all'
                      ? 'Try adjusting your filters to see more metrics.'
                      : 'No OKR metrics have been assigned to this customer yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}