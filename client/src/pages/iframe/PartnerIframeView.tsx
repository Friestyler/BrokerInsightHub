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
        {/* Product subtabs - EXACT replica from main app */}
        <div className="flex space-x-6 border-b border-gray-200 -mt-6 px-6">
          <button
            onClick={() => setActiveProductTab("overview")}
            className={`py-2 px-3 text-sm font-medium border-b-2 -mb-px ${
              activeProductTab === "overview"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveProductTab("matrix")}
            className={`py-2 px-3 text-sm font-medium border-b-2 -mb-px ${
              activeProductTab === "matrix"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Matrix
          </button>
          <button
            onClick={() => setActiveProductTab("list")}
            className={`py-2 px-3 text-sm font-medium border-b-2 -mb-px ${
              activeProductTab === "list"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            List
          </button>
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
    <div className="min-h-screen bg-gray-50">
      {/* Partner header with name and details - EXACT same as main app */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#5567E5] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {partner?.name ? partner.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'W'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{partner?.name || 'Willis B.V'}</h1>
              <p className="text-gray-600">{partner?.description || 'Details'} • {partner?.type || 'Other'}</p>
            </div>
          </div>
          <Button
            onClick={handleCreateOpportunity}
            className="bg-[#5567E5] hover:bg-[#4556D4] text-white"
          >
            Creëer Partner Kans
          </Button>
        </div>

        {/* Collaborators section exactly like screenshot */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Collaborators:</span>
          
          {/* Internal collaborators */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1">
              {users && Array.isArray(users) && users.slice(0, 3).map((user: any, index: number) => {
                const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                return (
                  <div 
                    key={user?.id || index} 
                    className={`w-8 h-8 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                    title={user?.name || 'User'}
                    onClick={() => window.location.href = `/iframe/partner/${id}`}
                  >
                    <span className="text-xs font-medium text-white">{initials}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-sm text-gray-500 font-medium">Internal</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300"></div>
          
          {/* External collaborators */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1">
              {users && Array.isArray(users) && users.slice(3, 5).map((user: any, index: number) => {
                const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                const colors = ['bg-orange-500', 'bg-red-500'];
                return (
                  <div 
                    key={user?.id || index} 
                    className={`w-8 h-8 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                    title={user?.name || 'User'}
                    onClick={() => window.location.href = `/iframe/partner/${id}`}
                  >
                    <span className="text-xs font-medium text-white">{initials}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-sm text-gray-500 font-medium">External</span>
          </div>
        </div>

        {/* Activity section with EXACT same layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Activity</span>
            <span className="text-sm text-gray-500">5 pending</span>
            <span className="text-sm text-gray-500">5 total</span>
          </div>
          <Button variant="outline" className="text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Next Best Action
          </Button>
        </div>
      </div>

      {/* Main tabs exactly like screenshot */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "products"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Products ({productCount})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "customers"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Customers ({customerCount})
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "opportunities"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Opportunities ({opportunityCount})
          </button>
          <button
            onClick={() => setActiveTab("okr")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "okr"
                ? "border-[#5567E5] text-[#5567E5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            OKR plans
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="bg-white">
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