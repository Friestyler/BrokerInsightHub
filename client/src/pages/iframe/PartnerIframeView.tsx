import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import OpportunitiesPage from "@/pages/lists/OpportunitiesPage";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ExternalLink, Sparkles, Download } from "lucide-react";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch partner data
  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}`],
    enabled: !!id,
  });

  // Fetch users for collaborators
  const { data: users } = useQuery({
    queryKey: [`/api/${environment}/users`],
  });

  // Fetch opportunities count
  const { data: opportunities } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch customers count
  const { data: customers } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/customers`],
    enabled: !!id,
  });

  // Fetch product assignments count
  const { data: productAssignments } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/product-assignments`],
    enabled: !!id,
  });

  const handleCreateOpportunity = () => {
    setIsCreateModalOpen(true);
  };

  if (!id) {
    return <div className="p-6">Partner ID not found</div>;
  }

  if (partnerLoading) {
    return <div className="p-6">Loading partner data...</div>;
  }

  const opportunityCount = Array.isArray(opportunities) ? opportunities.length : 0;
  const customerCount = Array.isArray(customers) ? customers.length : 0;
  const productCount = Array.isArray(productAssignments) ? productAssignments.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Salesforce-style header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-600">View in Deal Room</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => window.close()}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open Full View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Activity summary bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Activity</span>
              <Badge variant="secondary" className="text-xs">5 pending</Badge>
              <Badge variant="outline" className="text-xs">5 total</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Generate Next Best Action
          </Button>
        </div>
      </div>

      {/* Collaborators Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
          
          {/* Creëer Partner Kans button */}
          <Button
            onClick={handleCreateOpportunity}
            className="bg-[#5567E5] hover:bg-[#4556D4] text-white h-8"
          >
            <Target className="w-4 h-4 mr-2" />
            Creëer Partner Kans
          </Button>
        </div>
      </div>

      {/* Main tabs */}
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
            onClick={() => setActiveTab("customers")}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "customers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Customers ({customerCount})
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

      {/* Products subtabs */}
      {activeTab === "products" && (
        <div className="bg-white border-b border-gray-200 px-6 -mt-6">
          <div className="flex space-x-6 pt-4">
            <button
              onClick={() => setActiveProductTab("overview")}
              className={`py-2 px-3 text-sm font-medium ${
                activeProductTab === "overview"
                  ? "text-[#5567E5] border-b-2 border-[#5567E5]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveProductTab("matrix")}
              className={`py-2 px-3 text-sm font-medium ${
                activeProductTab === "matrix"
                  ? "text-[#5567E5] border-b-2 border-[#5567E5]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveProductTab("list")}
              className={`py-2 px-3 text-sm font-medium ${
                activeProductTab === "list"
                  ? "text-[#5567E5] border-b-2 border-[#5567E5]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              List
            </button>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="p-4">
        {activeTab === "products" && (
          <div className="bg-white rounded-lg">
            <PortfolioOverviewTab 
              entityType="partners"
              entityId={id}
              isModalOpen={isCreateModalOpen}
              onModalClose={() => setIsCreateModalOpen(false)}
            />
          </div>
        )}

        {activeTab === "customers" && (
          <div className="bg-white rounded-lg p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Customer relationships</div>
              <div className="text-2xl font-bold text-gray-900">{customerCount}</div>
              <div className="text-sm text-gray-500 mt-2">Active customer connections</div>
            </div>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="bg-white rounded-lg">
            <OpportunitiesPage />
          </div>
        )}

        {activeTab === "customers" && (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Partner Customers</h3>
              {Array.isArray(customers) ? customers.map((customer: any) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
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
                <p className="text-sm mt-2">Upload and manage partner-related documents</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "okr" && (
          <div className="bg-white rounded-lg p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">OKR Plans</div>
              <div className="text-sm text-gray-500">Performance tracking and goal management</div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Hub - floating or fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <PartnerActivityHub 
          partnerId={parseInt(id)} 
          partnerName={partner?.name || 'Partner'}
        />
      </div>
    </div>
  );
}