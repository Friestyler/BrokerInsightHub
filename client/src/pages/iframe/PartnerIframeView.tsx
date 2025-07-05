import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Sparkles, ChevronRight, Users } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { IframeHeader } from "@/components/iframe/IframeHeader";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all partners to find this specific partner - EXACT same as main app
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch related customers for this partner - EXACT same as main app
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
    enabled: !!id,
  });

  // Fetch related opportunities for this partner - EXACT same as main app
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch users for collaborators - EXACT same as main app
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch related products for this partner - EXACT same as main app
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/products`],
    enabled: !!id,
  });

  // Partner Product Assignments - EXACT same as main app
  const { data: assignedProducts, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/degoudse/partners/${id}/product-assignments`],
    enabled: !!id
  });

  // Fetch OKR metrics - EXACT same as main app
  const { data: metrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  if (!id) {
    return <div className="p-6">Partner ID not found</div>;
  }

  if (partnersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Find the current partner - EXACT same logic as main app
  const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));

  const opportunityCount = Array.isArray(relatedOpportunities) ? relatedOpportunities.length : 0;
  const customerCount = Array.isArray(relatedCustomers) ? relatedCustomers.length : 0;
  const productCount = Array.isArray(assignedProducts) ? assignedProducts.length : 0;

  const handleCreateOpportunity = () => {
    setIsCreateModalOpen(true);
  };

  // Render Product subtabs exactly like main app
  const renderProductSubtabs = () => {
    return (
      <div className="space-y-0">
        {/* Product subtabs - with proper spacing and blue underlines */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
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
              entityType="partners"
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
            {/* EXACT same product assignment table from main app */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Assignments</h3>
              {Array.isArray(assignedProducts) && assignedProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Premium Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name || 'N/A'}</TableCell>
                        <TableCell>{product.description || 'N/A'}</TableCell>
                        <TableCell>{product.provider || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>€{product.premium_value || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No product assignments found for this partner</p>
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
        entityType="partner"
        entityName={partner?.name || 'Willis B.V'}
        entityDescription={`${partner?.description || 'Large insurance brokerage with focus on commercial lines'} • ${partner?.type || 'Broker'}`}
        users={users || []}
        onCreateOpportunity={handleCreateOpportunity}
        entityId={id || '1'}
      />

      {/* Activity section with EXACT same layout and functionality */}
      <div className="bg-white px-6 pt-0 pb-4">
        <PartnerActivityHub 
          partnerId={parseInt(id || '1')} 
          partnerName={partner?.name || 'Willis B.V'} 
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
            Products ({productCount})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
              activeTab === "customers"
                ? "bg-[#E1E4FB] text-[#3E4DC4]"
                : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
            }`}
          >
            Customers ({customerCount})
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
      <div className="bg-white min-h-screen">
        {activeTab === "products" && renderProductSubtabs()}

        {activeTab === "customers" && (
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Partner Customers</h3>
              {Array.isArray(relatedCustomers) ? relatedCustomers.map((customer: any) => (
                <div key={customer?.id || Math.random()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{customer?.name || 'Customer'}</h4>
                      <p className="text-sm text-gray-500">{customer?.industry || 'Industry not specified'}</p>
                    </div>
                    <Badge variant="outline">{customer?.status || 'Active'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{customer?.description || 'No description available'}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No customers found for this partner</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Partner Opportunities</h3>
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
                  <p>No opportunities found for this partner</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "okr" && (
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">OKR Plans</h3>
              {Array.isArray(metrics) ? metrics.map((metric: any) => (
                <div key={metric?.id || Math.random()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{metric?.name || 'Metric'}</h4>
                      <p className="text-sm text-gray-500">{metric?.description || 'No description'}</p>
                    </div>
                    <Badge variant="outline">{metric?.unit || 'Number'}</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No OKR metrics found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}