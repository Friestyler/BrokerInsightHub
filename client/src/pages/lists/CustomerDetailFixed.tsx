import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Clock, AlertTriangle, Target, Shield, Lightbulb } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import EntityAvatar from "@/components/EntityAvatar";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetailFixed() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [backUrl, setBackUrl] = useState("/customers");
  const [backLabel, setBackLabel] = useState("Back to Customers");

  // Customer data query
  const { data: customer = {}, isLoading } = useQuery({
    queryKey: [`/api/customers/${id}`, id],
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="mr-4 p-2 group hover:bg-[#F5F6FE]">
              <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
            </Button>
          </Link>
          
          {/* Customer Logo */}
          <div className="flex-shrink-0 mr-4">
            <EntityAvatar
              entityType="customer"
              entityId={parseInt(id || '0')}
              fallbackText={customer?.name?.substring(0, 2) || 'CU'}
              size="lg"
              className="w-16 h-16"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name || 'Customer Details'}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {customer.industry || 'Insurance Client'} • Customer ID: {id}
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Decision Cockpit' },
              { id: 'opportunities', label: 'Opportunities' },
              { id: 'products', label: 'Products' },
              { id: 'activity', label: 'Activity' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#5567E5] text-[#5567E5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Premium Value</p>
                    <p className="text-2xl font-bold text-gray-900">€47,280</p>
                    <p className="text-xs text-emerald-600 mt-1">+12% this year</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-xs text-blue-600 mt-1">Across 3 categories</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cross-sell Potential</p>
                    <p className="text-2xl font-bold text-gray-900">€9,300</p>
                    <p className="text-xs text-orange-600 mt-1">5 opportunities</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time-Sensitive</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-red-600 mt-1">Require action</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Cross-Sell Opportunities */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Strategic Cross-Sell Opportunities</h3>
                <div className="text-sm text-gray-500">Prioritized by value & timing</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* High Value Opportunities */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-lg">💸</div>
                    <h4 className="font-semibold text-gray-900">High Value</h4>
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      €8,700 potential
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">Business Insurance Package</div>
                        <div className="text-sm text-gray-600">Professional Liability + Cyber Security</div>
                      </div>
                      <div className="text-xl">🔥</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-red-600 font-medium">€4,500</div>
                        <div className="text-gray-500">78% conversion</div>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Create proposal
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">Legal Services Suite</div>
                        <div className="text-sm text-gray-600">Contract Review + Tax Planning</div>
                      </div>
                      <div className="text-xl">💰</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-purple-600 font-medium">€4,200</div>
                        <div className="text-gray-500">85% acceptance</div>
                      </div>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                        Schedule call
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Time-Sensitive Opportunities */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-lg">⚠️</div>
                    <h4 className="font-semibold text-gray-900">Time-Sensitive</h4>
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      Act within 30 days
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">Auto Insurance Renewal</div>
                        <div className="text-sm text-gray-600">Upgrade to Premium with multi-car discount</div>
                      </div>
                      <div className="text-xl">⏰</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-orange-600 font-medium">€1,800 extra</div>
                        <div className="text-red-600 font-medium">19 days left</div>
                      </div>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                        Start renewal
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">Travel Insurance Bundle</div>
                        <div className="text-sm text-gray-600">Perfect timing for summer vacation planning</div>
                      </div>
                      <div className="text-xl">✈️</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-blue-600 font-medium">€720/year</div>
                        <div className="text-gray-500">Q1 timing</div>
                      </div>
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        Send offer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Easy Wins Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="text-lg">✅</div>
                  <h4 className="font-semibold text-gray-900">Easy Wins</h4>
                  <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                    High conversion probability
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Add Health Supplement</div>
                        <div className="text-sm text-gray-600 mt-1">Natural extension to existing health coverage</div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-emerald-600 font-medium text-sm">€240/year</div>
                          <Button size="sm" variant="ghost" className="text-emerald-700 hover:bg-emerald-100 h-6 text-xs">
                            Quick add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">📱</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Digital Asset Protection</div>
                        <div className="text-sm text-gray-600 mt-1">Covers online fraud and identity theft</div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-blue-600 font-medium text-sm">€180/year</div>
                          <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100 h-6 text-xs">
                            Learn more
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🏠</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Home Office Coverage</div>
                        <div className="text-sm text-gray-600 mt-1">Equipment and liability protection</div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-purple-600 font-medium text-sm">€360/year</div>
                          <Button size="sm" variant="ghost" className="text-purple-700 hover:bg-purple-100 h-6 text-xs">
                            Get quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="text-center py-12">
            <div className="text-gray-500">Opportunities content would go here</div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="text-center py-12">
            <div className="text-gray-500">Products content would go here</div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-12">
            <div className="text-gray-500">Activity content would go here</div>
          </div>
        )}
      </div>
    </div>
  );
}