import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useEnvironment } from "../../contexts/EnvironmentContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../../lib/queryClient";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Package, Filter, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import PartnerActivityHub from "../../components/activity/PartnerActivityHub";

export default function PartnerDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location, setLocation] = useLocation();
  
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("list");

  // Query for partner data
  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}`],
    enabled: !!id
  });

  // Query for assigned products 
  const { data: assignedProducts, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/product-assignments`],
    enabled: !!id
  });

  const backUrl = "/partners";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="p-2 group hover:bg-[#F5F6FE]">
                  <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-[#5567E5]" />
                </Button>
              </Link>
              <div>
                <Breadcrumbs />
              </div>
            </div>
          </div>

          {/* Partner Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {partner?.name?.charAt(0) || 'P'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{partner?.name || 'Loading...'}</h1>
                <p className="text-gray-600">{partner?.type || 'Partner'}</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-1">
              <button 
                onClick={() => setActiveTab("products")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "products" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Products
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-6 bg-white">
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Product subtabs navigation */}
            <div className="bg-white border-b border-[#E6E7F1] mb-4">
              <nav className="flex space-x-0 px-2 pt-2">
                <button 
                  onClick={() => setActiveProductTab("overview")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "overview" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveProductTab("matrix")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "matrix" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  Matrix
                </button>
                <button 
                  onClick={() => setActiveProductTab("list")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "list" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  List
                </button>
              </nav>
            </div>

            {/* Product Overview Tab */}
            {activeProductTab === "overview" && (
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Product Portfolio Overview</h2>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M3 3v5h5"/>
                      <path d="M21 21v-5h-5"/>
                      <path d="M21 3a16 16 0 0 0-13.8 8"/>
                      <path d="M3 21a16 16 0 0 0 13.8-8"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product insights coming soon</h3>
                  <p className="text-gray-500">Get detailed portfolio analytics and product performance metrics</p>
                  <p className="text-sm text-gray-400 mt-2">Expected launch: Q2 2025</p>
                </div>
              </div>
            )}

            {/* Cross-sell Matrix Tab */}
            {activeProductTab === "matrix" && (
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Cross-sell Matrix</h2>
                <p className="text-gray-600 mb-4">
                  Analyze cross-selling opportunities based on partner's current product portfolio
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Cross-sell matrix analysis coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">Expected launch: Q2 2025</p>
                </div>
              </div>
            )}

            {/* List Tab */}
            {activeProductTab === "list" && (
              <div>
                {/* Toolbar Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Showing {assignedProducts?.length || 0} product assignments
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" disabled>
                      Add product
                    </Button>
                  </div>
                </div>

                {/* Product Table */}
                {assignedProducts && assignedProducts.length > 0 ? (
                  <div className="bg-white border border-[#E6E7F1] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Product Name</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Description</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Product ID</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Provider</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Category</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Contract Start</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Contract End</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Premium Value</TableHead>
                          <TableHead style={{ color: '#696C8C' }}>Premium %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedProducts.map((assignment: any) => (
                          <TableRow 
                            key={assignment.id}
                            className="hover:bg-gray-50 group"
                          >
                            <TableCell>
                              <Checkbox className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </TableCell>
                            <TableCell className="font-medium">{assignment.productname}</TableCell>
                            <TableCell className="text-gray-600 max-w-xs truncate">{assignment.productdescription}</TableCell>
                            <TableCell className="text-gray-600">{assignment.producttemplateid}</TableCell>
                            <TableCell className="text-gray-600">{assignment.providername}</TableCell>
                            <TableCell>
                              {assignment.category && (
                                <Badge variant="outline" className="capitalize">
                                  {assignment.category}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {assignment.contractstartdate ? new Date(assignment.contractstartdate).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {assignment.contractenddate ? new Date(assignment.contractenddate).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {assignment.premiumvalue ? `€${parseFloat(assignment.premiumvalue).toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {assignment.premiumpercentage ? `${assignment.premiumpercentage}%` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E6E7F1] rounded-lg p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">No products are currently associated with this partner.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Hub - always visible */}
        <div className="mt-6 space-y-0">
          <div className="bg-white border border-[#E6E7F1] rounded-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Hub</h2>
              <PartnerActivityHub 
                partnerId={id || ''}
                partnerName={partner?.name || ''}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}