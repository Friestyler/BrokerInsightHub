import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight, Shield, TrendingUp, Clock, AlertTriangle, Target, Zap, Briefcase, Plane, PiggyBank, Scale, DollarSign, CheckCircle, ArrowUp, Filter } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { useToast } from "@/hooks/use-toast";

export default function PartnerDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [backUrl, setBackUrl] = useState("/partners");
  const [backLabel, setBackLabel] = useState("Back to Partners");
  
  // Handle back navigation from stored location
  useEffect(() => {
    const previousLocation = sessionStorage.getItem('previousLocation');
    if (previousLocation) {
      setBackUrl(previousLocation);
      // Clear the stored location after using it
      sessionStorage.removeItem('previousLocation');
      
      // Set appropriate back label based on the previous location
      if (previousLocation.includes('/opportunities')) {
        setBackLabel("Back to Opportunities");
      } else if (previousLocation.includes('/customers')) {
        setBackLabel("Back to Customers");
      } else {
        setBackLabel("Back to Partners");
      }
    }
  }, []);
  
  // OKR metrics state management
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  
  // Product dashboard filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Life Insurance', 'Non-Life Insurance', 'Services']);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Tooltip and product list dialog state
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [isProductListDialogOpen, setIsProductListDialogOpen] = useState(false);
  const [selectedTooltipProducts, setSelectedTooltipProducts] = useState<any[]>([]);
  const [tooltipCategoryName, setTooltipCategoryName] = useState('');
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Get category info from database with fallback colors
  const getCategoryInfo = (categoryName: string) => {
    const dbCategory = Array.isArray(categories) ? categories.find((cat: any) => cat.name === categoryName) : null;
    if (dbCategory) {
      return {
        color: dbCategory.color || 'blue',
        icon: dbCategory.icon,
        id: dbCategory.id
      };
    }
    
    // Fallback colors if not in database
    const fallbackColors: any = {
      'Life Insurance': 'green',
      'Non-Life Insurance': 'blue', 
      'Services': 'purple'
    };
    
    return {
      color: fallbackColors[categoryName] || 'gray',
      icon: null,
      id: null
    };
  };

  // Helper function to render category badge like Products page
  const renderCategoryBadge = (category: any) => {
    const iconMap: any = {
      'shield': Shield,
      'trending-up': TrendingUp,
      'clock': Clock,
      'alert-triangle': AlertTriangle,
      'target': Target,
      'zap': Zap,
      'briefcase': Briefcase,
      'plane': Plane,
      'piggy-bank': PiggyBank,
      'scale': Scale,
      'dollar-sign': DollarSign,
      'check-circle': CheckCircle,
      'arrow-up': ArrowUp
    };
    
    const IconComponent = iconMap[category.icon] || Shield;
    
    return (
      <Badge key={category.id} variant="outline" className="capitalize">
        <IconComponent className="w-3 h-3 mr-1" />
        {category.name}
      </Badge>
    );
  };

  // Queries
  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}`],
    enabled: !!id
  });

  const { data: partnerCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/customers`],
    enabled: !!id
  });

  const { data: partnerOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/opportunities`],
    enabled: !!id
  });

  const { data: partnerProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/products`],
    enabled: !!id
  });

  const { data: partnerContacts, isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/contacts`],
    enabled: !!id
  });

  const { data: assignedMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/${environment}/template-assignments/partner/${id}`],
    enabled: !!id
  });

  const { data: allProducts, isLoading: allProductsLoading } = useQuery({
    queryKey: [`/api/${environment}/products`],
    enabled: !!id
  });

  const { data: assignedProducts, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/${environment}/partners/${id}/product-assignments`],
    enabled: !!id
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: [`/api/${environment}/categories`],
    enabled: !!id
  });

  const renderTabContent = () => {
    if (activeTab === "products") {
      return (
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
      );
    }

    if (activeTab === "customers") {
      return (
        <div className="space-y-4">
          {/* Customers Content */}
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
              <span className="text-sm text-gray-500">
                {partnerCustomers?.length || 0} customer{partnerCustomers?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {partnerCustomers && partnerCustomers.length > 0 ? (
              <div className="space-y-2">
                {partnerCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <EntityAvatar entityType="customer" entityName={customer.name} />
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.description || 'No description'}</p>
                      </div>
                    </div>
                    <Link href={`/customers/${customer.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500">No customers are currently associated with this partner.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "opportunities") {
      return (
        <div className="space-y-4">
          {/* Opportunities Content */}
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
              <span className="text-sm text-gray-500">
                {partnerOpportunities?.length || 0} opportunit{partnerOpportunities?.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>
            
            {partnerOpportunities && partnerOpportunities.length > 0 ? (
              <div className="space-y-2">
                {partnerOpportunities.map((opportunity: any) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                        <p className="text-sm text-gray-500">
                          {opportunity.estimatedValue ? `€${parseFloat(opportunity.estimatedValue).toLocaleString()}` : 'No value'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/opportunities/${opportunity.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-500">No opportunities are currently associated with this partner.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "okr") {
      return (
        <div className="space-y-4">
          {/* OKR Content */}
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">OKR Plans</h2>
              <span className="text-sm text-gray-500">
                {assignedMetrics?.length || 0} metric{assignedMetrics?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {assignedMetrics && assignedMetrics.length > 0 ? (
              <div className="space-y-2">
                {assignedMetrics.map((metric: any) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{metric.metricName}</h3>
                        <p className="text-sm text-gray-500">{metric.templateName}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{metric.unit}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No OKR plans found</h3>
                <p className="text-gray-500">No OKR metrics are currently assigned to this partner.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (partnerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-600">{partner?.name || 'Partner'}</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Details</span>
                <span className="text-sm text-gray-500">Type: Partner</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <EntityAvatar entityType="partner" entityName={partner?.name || 'Partner'} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{partner?.name || 'Loading...'}</h1>
                <p className="text-gray-600">{partner?.description || 'Partner created from Excel import'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Hub */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Activity</span>
            <span className="text-sm text-gray-500">0 pending</span>
            <span className="text-sm text-gray-500">0 total</span>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Generate Next Best Action</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products ({assignedProducts?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Customers ({partnerCustomers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Opportunities ({partnerOpportunities?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("okr")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "okr"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              OKR plans
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {renderTabContent()}
      </div>

      {/* Activity Hub */}
      <div className="px-6 py-6">
        <PartnerActivityHub 
          partnerId={id || ''}
          partnerName={partner?.name || ''}
          className="border-0 shadow-none"
        />
      </div>
    </div>
  );
}