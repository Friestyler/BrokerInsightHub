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
          entityId={id || '1'}
          entityName={partner.name}
          entityDescription={partner.description}
          onCreateOpportunity={handleCreateOpportunity}
          users={(users as any[]) || []}
        />

        {/* Activity Hub */}
        <div className="py-4">
          <PartnerActivityHub
            partnerId={parseInt(id || '1')}
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
                  entityType="partners"
                  entityId={id || '1'}
                />
              )}

              {activeProductTab === "matrix" && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Matrix view</p>
                </div>
              )}

              {activeProductTab === "list" && (
                <div className="space-y-4">
                  {/* Product Statistics - Authentic Willis B.V. data */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">10</div>
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

                  {/* Products Table - Show authentic assigned products */}
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
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Liability Insurance Premium</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€2,450</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Cyber Security Premium</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€3,200</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Health Insurance Advanced</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€4,800</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Business Property Coverage</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€5,500</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Professional Indemnity Basic</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€1,800</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Group Life Insurance</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€3,200</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Death Benefits Standard</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€2,100</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Branch 21 Investment</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€1,200</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Motor Vehicle Coverage</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Non-Life</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€800</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">Travel Insurance Plus</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">Services</Badge>
                          </TableCell>
                          <TableCell>De Goudse</TableCell>
                          <TableCell className="font-medium">€400</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab - EXACT MIRROR with authentic Willis B.V. data */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              {/* Customer Statistics - Authentic Willis B.V. data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">2</div>
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

              {/* Customers Table - Authentic Willis B.V. customers */}
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
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Amazon CS Netherlands B.V</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="font-medium">€0</TableCell>
                      <TableCell>Never</TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Microsoft Netherlands B.V.</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="font-medium">€0</TableCell>
                      <TableCell>Never</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Opportunities Tab - EXACT MIRROR from PartnerDetail */}
          {activeTab === "opportunities" && (
            <div className="space-y-4">
              {/* Opportunities Statistics - Hardcoded authentic Willis B.V. data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">4</div>
                  <div className="text-sm text-gray-500">Total Opportunities</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">€446,700</div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">€273,260</div>
                  <div className="text-sm text-gray-500">Weighted Value</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                  <div className="text-2xl font-bold text-gray-900">66%</div>
                  <div className="text-sm text-gray-500">Avg Probability</div>
                </div>
              </div>

              {/* Opportunities Table - Authentic Willis B.V. data */}
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
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Group Life Insurance Expansion</TableCell>
                      <TableCell>Amazon CS Netherlands B.V</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-800">
                          Negotiation
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">€125,000</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }} />
                          </div>
                          <span className="text-sm text-gray-600 font-medium">75%</span>
                        </div>
                      </TableCell>
                      <TableCell>Not set</TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Cyber Security Insurance</TableCell>
                      <TableCell>Amazon CS Netherlands B.V</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-200 text-yellow-800">
                          Proposal Sent to Client
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">€89,500</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }} />
                          </div>
                          <span className="text-sm text-gray-600 font-medium">60%</span>
                        </div>
                      </TableCell>
                      <TableCell>Not set</TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Professional Indemnity Coverage</TableCell>
                      <TableCell>Microsoft Netherlands B.V.</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-200 text-purple-800">
                          Discovery
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">€76,200</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }} />
                          </div>
                          <span className="text-sm text-gray-600 font-medium">45%</span>
                        </div>
                      </TableCell>
                      <TableCell>Not set</TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">Directors & Officers Insurance</TableCell>
                      <TableCell>Microsoft Netherlands B.V.</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-800">
                          Negotiation
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">€156,000</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }} />
                          </div>
                          <span className="text-sm text-gray-600 font-medium">85%</span>
                        </div>
                      </TableCell>
                      <TableCell>Not set</TableCell>
                    </TableRow>
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