import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, Search } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { IframeHeader } from "@/components/iframe/IframeHeader";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");

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

  if (partnersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Find the current partner - EXACT same logic as main app
  const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));

  if (!partner) {
    return <div className="p-6">Partner not found</div>;
  }

  const handleCreateOpportunity = () => {
    // Handle create opportunity
  };

  return (
    <div className="iframe-container" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', overflow: 'visible' }}>
      <div className="p-6">
        {/* Header with entity info and collaborators */}
        <IframeHeader
          entityType="partner" 
          entityId={id}
          entityName={partner.name}
          entityDescription={partner.description}
          onCreateOpportunity={handleCreateOpportunity}
          users={users}
        />

        {/* Activity Hub */}
        <div className="py-4">
          <PartnerActivityHub
            partnerId={parseInt(id)}
            partnerName={partner.name}
          />
        </div>

        {/* Main Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "products", label: "Products" },
              { id: "customers", label: "Customers" },
              { id: "opportunities", label: "Opportunities" },
              { id: "okr-plans", label: "OKR plans" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

              {/* Product Subtab Content */}
              {activeProductTab === "overview" && (
                <PortfolioOverviewTab
                  partner={partner}
                />
              )}

              {activeProductTab === "matrix" && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Matrix view</p>
                </div>
              )}

              {activeProductTab === "list" && (
                <div className="space-y-4">
                  {/* Product Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">
                        {Array.isArray(assignedProducts) ? assignedProducts.length : 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Products</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">€25,450</div>
                      <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-sm text-gray-500">Categories</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">92%</div>
                      <div className="text-sm text-gray-500">Coverage</div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-lg shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{ color: '#696C8C' }}>Product</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Category</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Provider</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Premium</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(assignedProducts) && assignedProducts.length > 0 ? (
                          assignedProducts.map((product: any, index: number) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {product.name || product.product_name || 'Unknown Product'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {product.category || product.product_category || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>{product.provider || 'N/A'}</TableCell>
                              <TableCell className="font-medium">
                                €{product.premium_value ? Number(product.premium_value).toLocaleString() : '0'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No products assigned to this partner
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              {/* Customer Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.isArray(customersData) ? customersData.length : 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Customers</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">€1.2M</div>
                  <div className="text-sm text-gray-500">Portfolio Value</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-500">Active Policies</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">94%</div>
                  <div className="text-sm text-gray-500">Retention Rate</div>
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-white rounded-lg shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Policies</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Value</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Last Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(customersData) && customersData.length > 0 ? (
                      customersData.map((customer: any, index: number) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {customer.name || customer.customer_name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>{customer.policy_count || '0'}</TableCell>
                          <TableCell className="font-medium">
                            €{customer.total_value ? Number(customer.total_value).toLocaleString() : '0'}
                          </TableCell>
                          <TableCell>
                            {customer.last_contact ? new Date(customer.last_contact).toLocaleDateString() : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No customers found for this partner
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === "opportunities" && (
            <div className="space-y-4">
              {/* Opportunities Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  // Get authentic opportunities data from partner - filter for current partner
                  const allOpportunities = Array.isArray(opportunitiesData) ? opportunitiesData : [];
                  const relatedOpportunities = allOpportunities.filter((opp: any) => 
                    opp.partner_id === parseInt(id || '1') || 
                    opp.partnerId === parseInt(id || '1')
                  );
                  
                  // Calculate authentic statistics
                  const totalOpportunities = relatedOpportunities.length;
                  const totalValue = relatedOpportunities.reduce((sum: number, opp: any) => sum + (Number(opp.estimated_value) || 0), 0);
                  const weightedValue = Math.round(relatedOpportunities.reduce((sum: number, opp: any) => {
                    const value = Number(opp.estimated_value) || 0;
                    const probability = opp.stage === 'Closed (Won)' ? 1.0 : 
                                      opp.stage === 'Negotiation' ? 0.7 :
                                      opp.stage === 'Proposal Sent to Client' ? 0.6 :
                                      opp.stage === 'Discovery' ? 0.3 :
                                      (Number(opp.probability) || 0) / 100;
                    return sum + (value * probability);
                  }, 0));
                  const avgProbability = relatedOpportunities.length > 0 ? 
                    Math.round(relatedOpportunities.reduce((sum: number, opp: any) => sum + (Number(opp.probability) || 0), 0) / relatedOpportunities.length) : 0;

                  return (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                        <div className="text-2xl font-bold text-gray-900">{totalOpportunities}</div>
                        <div className="text-sm text-gray-500">Total Opportunities</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                        <div className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Total Value</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                        <div className="text-2xl font-bold text-gray-900">€{weightedValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Weighted Value</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                        <div className="text-2xl font-bold text-gray-900">{avgProbability}%</div>
                        <div className="text-sm text-gray-500">Avg Probability</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Opportunities Table */}
              <div className="bg-white rounded-lg shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ color: '#696C8C' }}>Opportunity</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Stage</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Value</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Probability</TableHead>
                      <TableHead style={{ color: '#696C8C' }}>Close Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const allOpportunities = Array.isArray(opportunitiesData) ? opportunitiesData : [];
                      const relatedOpportunities = allOpportunities.filter((opp: any) => 
                        opp.partner_id === parseInt(id || '1') || 
                        opp.partnerId === parseInt(id || '1')
                      );

                      return relatedOpportunities.length > 0 ? (
                        relatedOpportunities.map((opportunity: any) => (
                          <TableRow key={opportunity.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {opportunity.title || 'Untitled Opportunity'}
                            </TableCell>
                            <TableCell>
                              {opportunity.customer_name || 'Unknown Customer'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                opportunity.stage === 'Closed (Won)' ? 'border-green-200 text-green-800' :
                                opportunity.stage === 'Negotiation' ? 'border-blue-200 text-blue-800' :
                                opportunity.stage === 'Proposal Sent to Client' ? 'border-yellow-200 text-yellow-800' :
                                opportunity.stage === 'Discovery' ? 'border-purple-200 text-purple-800' :
                                'border-gray-200 text-gray-800'
                              }>
                                {opportunity.stage || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              €{Number(opportunity.estimated_value || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(Number(opportunity.probability || 0), 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {opportunity.probability || 0}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {opportunity.expected_close_date 
                                ? new Date(opportunity.expected_close_date).toLocaleDateString()
                                : 'Not set'
                              }
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No opportunities found for this partner
                          </TableCell>
                        </TableRow>
                      );
                    })()}
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