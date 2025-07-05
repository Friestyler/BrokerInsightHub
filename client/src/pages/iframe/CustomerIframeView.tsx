import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Sparkles, Search } from "lucide-react";
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

  // Fetch specific customer data - EXACT same as main app
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: [`/api/customers/${id}`],
    enabled: !!id,
  });

  // Fetch all customers to find this specific customer - EXACT same as main app
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
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
  const { data: tags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Filter and group metrics exactly like main pages
  const filteredMetrics = (metrics as any[] || []).filter((metric: any) => {
    const matchesSearch = !searchTerm || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || metric.tags?.includes(selectedTag);
    const matchesUnit = selectedUnit === 'all' || metric.unit === selectedUnit;
    const matchesRange = selectedRange === 'all' || metric.time_range === selectedRange;
    
    return matchesSearch && matchesTag && matchesUnit && matchesRange;
  });

  // Group metrics by tag exactly like main pages
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: any) => {
    const tag = metric.tags?.[0] || 'Untagged';
    if (!acc[tag]) {
      acc[tag] = [];
    }
    acc[tag].push(metric);
    return acc;
  }, {});

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
            {/* EXACT same product assignment table from main app with authentic database fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Assignments</h3>
              {Array.isArray(assignedProducts) && assignedProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableRow key={assignment.id}>
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
                        <TableCell>€{assignment.premiumValue?.toLocaleString() || 0}</TableCell>
                        <TableCell>{assignment.premiumPercentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No product assignments found for this customer</p>
                </div>
              )}
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
          <div className="space-y-6">
            {/* Filters Section - Exact same as main page */}
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
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  <SelectItem value="Annual 2024">Annual 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grouped Metrics Display */}
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([tagName, tagMetrics]) => (
                <div key={tagName} className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {tagName}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ({(tagMetrics as any[]).length} metric{(tagMetrics as any[]).length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {(tagMetrics as any[]).map((metric: any) => (
                      <div key={metric.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {metric.unit}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {metric.realized || 0} {metric.unit === 'percentage' ? '%' : ''}
                              </p>
                              <p className="text-xs text-gray-500">Realized</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {metric.target || 0} {metric.unit === 'percentage' ? '%' : ''}
                              </p>
                              <p className="text-xs text-gray-500">Target</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${Math.min(100, ((metric.realized || 0) / (metric.target || 1)) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {Math.round(((metric.realized || 0) / (metric.target || 1)) * 100)}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">Progress</p>
                            </div>
                            
                            <div className="text-center">
                              <div className={`w-3 h-3 rounded-full ${
                                ((metric.realized || 0) / (metric.target || 1)) >= 0.9 ? 'bg-green-500' : 
                                ((metric.realized || 0) / (metric.target || 1)) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <p className="text-xs text-gray-500 mt-1">Status</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(groupedMetrics).length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
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