import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import OpportunitiesPage from "@/pages/lists/OpportunitiesPage";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ExternalLink, Sparkles } from "lucide-react";

export default function CustomerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch customer data
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: [`/api/${environment}/customers/${id}`],
    enabled: !!id,
  });

  // Fetch users for collaborators
  const { data: users } = useQuery({
    queryKey: [`/api/${environment}/users`],
  });

  // Fetch opportunities
  const { data: opportunities } = useQuery({
    queryKey: [`/api/${environment}/customers/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch partners
  const { data: partners } = useQuery({
    queryKey: [`/api/${environment}/customers/${id}/partners`],
    enabled: !!id,
  });

  // Fetch product assignments
  const { data: productAssignments } = useQuery({
    queryKey: [`/api/${environment}/customers/${id}/product-assignments`],
    enabled: !!id,
  });

  const handleCreateOpportunity = () => {
    setIsCreateModalOpen(true);
  };

  if (!id) {
    return <div className="p-6">Customer ID not found</div>;
  }

  if (customerLoading) {
    return <div className="p-6">Loading customer data...</div>;
  }

  const opportunityCount = Array.isArray(opportunities) ? opportunities.length : 0;
  const partnerCount = Array.isArray(partners) ? partners.length : 0;
  const productCount = Array.isArray(productAssignments) ? productAssignments.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Customer Logo/Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {customer?.name ? customer.name.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer?.name || 'Customer'}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">{customer?.industry || 'Industry not specified'}</span>
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {customer?.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Deal Room
            </Button>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">{customer?.description || 'No description available'}</p>
          
          {/* Collaborators */}
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-700">Collaborators:</span>
            <div className="flex items-center space-x-4">
              {/* Internal users */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {users && Array.isArray(users) && users.slice(0, 3).map((user: any, index: number) => {
                    const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                    return (
                      <div 
                        key={user.id} 
                        className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center`}
                        title={user.name}
                      >
                        <span className="text-xs font-medium text-white">{initials}</span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-500 font-medium">Internal</span>
              </div>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              {/* External users */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {users && Array.isArray(users) && users.slice(3, 5).map((user: any, index: number) => {
                    const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                    const colors = ['bg-orange-500', 'bg-red-500'];
                    return (
                      <div 
                        key={user.id} 
                        className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center`}
                        title={user.name}
                      >
                        <span className="text-xs font-medium text-white">{initials}</span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-500 font-medium">External</span>
              </div>
            </div>
          </div>
          
          {/* Creëer Kans button */}
          <Button
            onClick={handleCreateOpportunity}
            className="bg-[#5567E5] hover:bg-[#4556D4] text-white h-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Creëer Customer Kans
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Products ({productCount})
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "partners"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Partners ({partnerCount})
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "opportunities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Opportunities ({opportunityCount})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {activeTab === "products" && (
          <div className="bg-white rounded-lg">
            <PortfolioOverviewTab 
              entityType="customers"
              entityId={id}
              isModalOpen={isCreateModalOpen}
              onModalClose={() => setIsCreateModalOpen(false)}
            />
          </div>
        )}

        {activeTab === "partners" && (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Partners</h3>
              {Array.isArray(partners) ? partners.map((partner: any) => (
                <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
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
          <div className="bg-white rounded-lg">
            <OpportunitiesPage />
          </div>
        )}

        {activeTab === "activities" && (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <div className="text-center py-8 text-gray-500">
                <p>Activity timeline will be displayed here</p>
                <p className="text-sm mt-2">Integration with activity hub coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Documents & Files</h3>
              <div className="text-center py-8 text-gray-500">
                <p>Document management will be displayed here</p>
                <p className="text-sm mt-2">Upload and manage customer-related documents</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Hub - floating or fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <PartnerActivityHub 
          partnerId={parseInt(id)} 
          partnerName={customer?.name || 'Customer'}
          entityType="customer"
          entityId={parseInt(id)}
        />
      </div>
    </div>
  );
}