import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles } from "lucide-react";
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
            <div className="text-center py-8 text-gray-500">
              <p>Product list view coming soon</p>
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
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>OKR plans coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}