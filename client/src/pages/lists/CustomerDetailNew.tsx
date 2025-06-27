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
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight, Shield, TrendingUp, Clock, AlertTriangle, Target, Zap, Briefcase, Plane, PiggyBank, Scale } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetailNew() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [backUrl, setBackUrl] = useState("/customers");
  const [backLabel, setBackLabel] = useState("Back to Customers");
  
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
      } else if (previousLocation.includes('/partners')) {
        setBackLabel("Back to Partners");
      } else {
        setBackLabel("Back to Customers");
      }
    }
  }, []);
  
  // OKR metrics state management
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");

  // Logo upload state
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [customerLogo, setCustomerLogo] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [groupBy, setGroupBy] = useState("tag");
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<any>({});
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<number[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
  // Add Product dialog state
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [selectedProductTemplate, setSelectedProductTemplate] = useState<any>(null);
  const [customAttributes, setCustomAttributes] = useState({
    customPrice: '',
    customDiscountPercentage: '',
    customPremiumPercentage: '',
    customerContractStartDate: '',
    customerContractEndDate: '',
    notes: ''
  });

  // Track configured products (products that have been set up but not necessarily saved yet)
  const [configuredProducts, setConfiguredProducts] = useState<number[]>([]);
  const [stagedProducts, setStagedProducts] = useState<Array<{
    templateId: number;
    template: any;
    customAttributes: {
      customPrice: string;
      customDiscountPercentage: string;
      customPremiumPercentage: string;
      customerContractStartDate: string;
      customerContractEndDate: string;
      notes: string;
    };
  }>>([]);

  // Product selection states
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Product dashboard interactive state
  const [expandedDashboardCategories, setExpandedDashboardCategories] = useState<Set<string>>(new Set());
  const [selectedTimelineFilter, setSelectedTimelineFilter] = useState("all");
  const [hoveredOpportunity, setHoveredOpportunity] = useState<string | null>(null);

  // Handle tab parameter from URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tabParam = urlParams.get('tab');
    const storedTab = sessionStorage.getItem('customerDetailTab');
    
    console.log('CustomerDetail URL parsing:', { location, tabParam, storedTab });
    
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (storedTab) {
      setActiveTab(storedTab);
      // Clear the stored tab after using it
      sessionStorage.removeItem('customerDetailTab');
    }
  }, [location]);

  // Detect navigation context and set appropriate back URL
  useEffect(() => {
    // Try multiple methods to detect the source page
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // Method 1: Check document.referrer
    if (referrer && referrer.startsWith(currentOrigin)) {
      const referrerPath = new URL(referrer).pathname;
      const partnerDetailMatch = referrerPath.match(/\/lists\/partners\/(\d+)/);
      const opportunityDetailMatch = referrerPath.match(/\/opportunities\/(\d+)/);
      
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        return;
      }
    }
    
    // Method 2: Check for context in session storage
    const sessionReferrer = sessionStorage.getItem('customerReferrer');
    if (sessionReferrer) {
      const partnerDetailMatch = sessionReferrer.match(/\/lists\/partners\/(\d+)/);
      const opportunityDetailMatch = sessionReferrer.match(/\/opportunities\/(\d+)/);
      
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        sessionStorage.removeItem('customerReferrer');
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        sessionStorage.removeItem('customerReferrer');
        return;
      }
    }
  }, []);

  // Parse and validate customer ID first
  const customerId = id ? parseInt(id as string) : null;
  const isValidId = Boolean(customerId && !isNaN(customerId));

  // Load existing logo on component mount
  useEffect(() => {
    const loadExistingLogo = async () => {
      if (customerId) {
        try {
          const response = await fetch(`/api/entity-logos?entityType=customer&entityId=${customerId}&environmentId=${environment || 'myqollabi'}`);
          if (response.ok) {
            const logoData = await response.json();
            if (logoData?.logoData) {
              setCustomerLogo(logoData.logoData);
            }
          }
        } catch (error) {
          console.error('Error loading existing logo:', error);
        }
      }
    };
    
    loadExistingLogo();
  }, [customerId, environment]);

  // Fetch individual customer data from database
  const { data: customer, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    enabled: isValidId,
  });

  // Fetch related partners for this customer
  const { data: relatedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/partners`],
    enabled: isValidId,
  });

  // Fetch related opportunities for this customer
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/opportunities`],
    enabled: isValidId,
  });

  // Fetch related products for this customer
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/products`],
    enabled: isValidId,
  });

  // Fetch related contacts for this customer
  const { data: relatedContacts, isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/contacts`],
    enabled: isValidId,
  });

  // Fetch template assignments for this customer
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/customer/${customerId}`],
    enabled: isValidId,
  });

  // Fetch all OKR metrics to match with assignments
  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch available tags for filtering
  const { data: availableTags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Fetch all opportunities for multi-select
  const { data: allOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  // Fetch all products for multi-select
  const { data: allProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // Product Templates for selection
  const { data: productTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/product-templates'],
    enabled: showAddProductDialog
  });

  // Categories for hierarchical display
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: showAddProductDialog
  });

  // Customer Product Assignments
  const { data: assignedProducts, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: [`/api/customers/${customerId}/product-assignments`],
    enabled: isValidId
  });

  // Mutations
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/customers/${customerId}/product-assignments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/product-assignments`] });
      refetchAssignments();
      setShowAddProductDialog(false);
      setSelectedProductTemplate(null);
      setCustomAttributes({
        customPrice: '',
        customDiscountPercentage: '',
        customPremiumPercentage: '',
        customerContractStartDate: '',
        customerContractEndDate: '',
        notes: ''
      });
    },
  });

  // Initialize dialog data when it opens (after customer is declared)
  useEffect(() => {
    if (showDetailsDialog && customer) {
      setEditedCustomer({
        name: customer.name || '',
        industry: customer.industry || '',
        description: customer.description || ''
      });
      
      // Initialize with existing relationships
      const opportunityIds = Array.isArray(relatedOpportunities) 
        ? relatedOpportunities.map((opp: any) => opp.id) 
        : [];
      const productIds = Array.isArray(relatedProducts) 
        ? relatedProducts.map((product: any) => product.id) 
        : [];
        
      setSelectedOpportunityIds(opportunityIds);
      setSelectedProductIds(productIds);
    }
  }, [showDetailsDialog, customer, relatedOpportunities, relatedProducts]);
  
  if (customersLoading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!customer) {
    return <div className="p-6">Customer not found</div>;
  }

  // Get assigned metrics for this customer
  const assignedMetrics = templateAssignments?.length > 0 
    ? allMetrics?.filter((metric: any) => 
        templateAssignments.some((assignment: any) => assignment.metric_id === metric.id)
      ) || []
    : [];

  // Filter metrics based on search and filters with error handling
  const filteredMetrics = (assignedMetrics || []).filter((metric: any) => {
    try {
      if (!metric || typeof metric !== 'object') return false;
      
      const metricName = metric.name || '';
      const metricDescription = metric.description || '';
      const metricTags = metric.tags || [];
      const metricUnit = metric.measure_unit || '';
      
      const matchesSearch = metricName.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                           metricDescription.toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesTag = selectedTag === 'all' || metricTags.includes(selectedTag);
      const matchesUnit = selectedUnit === 'all' || metricUnit === selectedUnit;
      
      return matchesSearch && matchesTag && matchesUnit;
    } catch (error) {
      console.error('Error filtering metric:', error, metric);
      return false;
    }
  });

  // Group metrics by tag if grouping is enabled
  const groupedMetrics = groupBy === 'tag' && availableTags?.length > 0
    ? availableTags.reduce((acc: any, tag: any) => {
        const tagMetrics = filteredMetrics.filter((metric: any) => 
          metric.tags?.includes(tag.name)
        );
        if (tagMetrics.length > 0) {
          acc[tag.name] = tagMetrics;
        }
        return acc;
      }, {})
    : { 'All Metrics': filteredMetrics };

  // Selection handlers
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };

  const handleSelectAll = () => {
    if (selectedMetrics.length === filteredMetrics.length) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(filteredMetrics.map((metric: any) => metric.id));
    }
  };

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
            <button
              onClick={() => setShowLogoUploadModal(true)}
              className="relative group"
              title="Click to upload logo"
            >
              <EntityAvatar
                entityType="customer"
                entityId={parseInt(id || '0')}
                fallbackText={customer?.name?.substring(0, 2) || 'CU'}
                size="lg"
                className="w-16 h-16"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                  onClick={() => {
                    setEditedCustomer({
                      name: customer.name || '',
                      industry: customer.industry || '',
                      description: customer.description || ''
                    });
                    setShowDetailsDialog(true);
                  }}
                >
                  Details
                </Button>
                <span className="text-sm text-gray-500">Type: <span className="text-blue-600">Customer</span></span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-gray-600">{customer.description}</span>
            </div>
          </div>
        </div>
        


        {/* Custom tab styling to match design */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 mb-3">
            <button 
              onClick={() => setActiveTab("okr-plans")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "okr-plans" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              OKR plans
            </button>
            <button 
              onClick={() => setActiveTab("partners")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "partners" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Partners ({relatedPartners?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "opportunities" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Opportunities ({relatedOpportunities?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "products" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Products ({relatedProducts?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("contacts")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "contacts" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Contacts ({relatedContacts?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("product-dashboard")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "product-dashboard" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Product dashboard
            </button>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-6">
        {activeTab === "okr-plans" && (
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {availableTags?.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="tag">Group by Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Content */}
            {Object.entries(groupedMetrics).map(([groupName, metrics]: [string, any]) => (
              <div key={groupName} className="space-y-4">
                {groupBy === 'tag' && Object.keys(groupedMetrics).length > 1 && (
                  <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedMetrics.length === filteredMetrics.length && filteredMetrics.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Metric Name</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Target Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric: any) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedMetrics.includes(metric.id)}
                            onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-gray-500">{metric.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{metric.realized_value || 0}</TableCell>
                        <TableCell>{metric.target_value || 0}</TableCell>
                        <TableCell>{metric.measure_unit}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, ((metric.realized_value || 0) / (metric.target_value || 1)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}

        {activeTab === "partners" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedPartners?.map((partner: any) => (
                  <TableRow key={partner.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link 
                        href={`/lists/partners/${partner.id}`}
                        onClick={() => {
                          // Store navigation context for partner detail back navigation
                          sessionStorage.setItem('partnerReferrer', `customers/${id}#partners`);
                        }}
                      >
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {partner.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {partner.partner_type || 'Partner'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {partner.status || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {partner.location || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {partner.contact_email || 'Not specified'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(relatedOpportunities || []).map((opportunity: any) => {
                  if (!opportunity || typeof opportunity !== 'object') return null;
                  
                  try {
                    // Safe property access with error handling
                    const opportunityId = opportunity.id || 0;
                    const title = opportunity.title || 'Untitled Opportunity';
                    const partnerNames = opportunity.partnerNames || 'No partner';
                    const stage = opportunity.stage || 'Unknown';
                    const estimatedValue = opportunity.estimated_value ? Number(opportunity.estimated_value) || 0 : 0;
                    const expectedCloseDate = opportunity.expected_close_date;
                    
                    return (
                      <TableRow key={opportunityId}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <Link 
                            href={`/opportunities/${opportunityId}`}
                            onClick={() => {
                              // Store navigation context for opportunity detail back navigation
                              sessionStorage.setItem('opportunityReferrer', `customers/${id}#opportunities`);
                            }}
                          >
                            <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                              {title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {partnerNames}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {stage}
                          </span>
                        </TableCell>
                        <TableCell>
                          €{estimatedValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {expectedCloseDate ? new Date(expectedCloseDate).toLocaleDateString() : 'Not set'}
                        </TableCell>
                      </TableRow>
                    );
                  } catch (error) {
                    console.error('Error rendering opportunity:', error, opportunity);
                    return null;
                  }
                }).filter(Boolean)}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            {/* Add Product Button */}
            <div className="flex justify-end items-center mb-4">
              <Button 
                disabled
                className="bg-gray-300 text-gray-500 cursor-not-allowed h-8"
              >
                Add product
              </Button>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedContacts?.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {contact.jobTitle || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {contact.department || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-gray-500">No email</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">No phone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedContacts || relatedContacts.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No contacts associated with this customer</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "product-dashboard" && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Coverage */}
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Active Coverage</h3>
                      <p className="text-sm text-gray-500">Products in force</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform">7</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-emerald-600 mr-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2 this quarter
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Expiring Soon</h3>
                      <p className="text-sm text-gray-500">Next 90 days</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform">2</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-orange-600 mr-2">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Action required
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Cross-sell Ready</h3>
                      <p className="text-sm text-gray-500">High-potential gaps</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">4</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-blue-600 mr-2">
                    <Zap className="w-4 h-4 mr-1" />
                    €12K potential value
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Coverage Grid */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Coverage by Category</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                    Active products
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
                    Available products
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Life Insurance */}
                <div 
                  className="space-y-4 cursor-pointer group"
                  onClick={() => {
                    const newExpanded = new Set(expandedDashboardCategories);
                    if (newExpanded.has('life')) {
                      newExpanded.delete('life');
                    } else {
                      newExpanded.add('life');
                    }
                    setExpandedDashboardCategories(newExpanded);
                  }}
                >
                  <div className="flex items-center justify-between p-3 rounded-lg group-hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {/* Progress Ring */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray="37.5, 100"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-emerald-600">38%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Life Insurance</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedDashboardCategories.has('life') ? 'transform rotate-180' : ''
                          }`} />
                        </div>
                        <span className="text-sm text-gray-500">3 of 8 products</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedDashboardCategories.has('life') && (
                    <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-700">Death Cover - Family Plan</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-700">Branch 21 - Savings Plan</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-700">Group Insurance - Professional</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium">Active</span>
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="text-xs text-gray-500 mb-2">Available coverage gaps:</div>
                        <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-600">Branch 23 - Investment Plan</span>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">Gap</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-600">Pension Savings Plan</span>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">Gap</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Non-Life Insurance */}
                <div 
                  className="space-y-4 cursor-pointer group"
                  onClick={() => {
                    const newExpanded = new Set(expandedDashboardCategories);
                    if (newExpanded.has('nonlife')) {
                      newExpanded.delete('nonlife');
                    } else {
                      newExpanded.add('nonlife');
                    }
                    setExpandedDashboardCategories(newExpanded);
                  }}
                >
                  <div className="flex items-center justify-between p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {/* Progress Ring */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="50, 100"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">50%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Non-Life Insurance</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedDashboardCategories.has('nonlife') ? 'transform rotate-180' : ''
                          }`} />
                        </div>
                        <span className="text-sm text-gray-500">4 of 8 products</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedDashboardCategories.has('nonlife') && (
                    <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Auto Insurance - Premium Plan</span>
                        </div>
                        <span className="text-xs text-red-600 font-medium">Expires Soon</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Home Insurance - Comprehensive</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">Review Soon</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Health Insurance - Basic</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Travel Insurance - Annual</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Active</span>
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="text-xs text-gray-500 mb-2">Available coverage gaps:</div>
                        <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-600">Business Insurance</span>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">High Priority</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-600">Cyber Insurance</span>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">Gap</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Services */}
                <div 
                  className="space-y-4 cursor-pointer group"
                  onClick={() => {
                    const newExpanded = new Set(expandedDashboardCategories);
                    if (newExpanded.has('services')) {
                      newExpanded.delete('services');
                    } else {
                      newExpanded.add('services');
                    }
                    setExpandedDashboardCategories(newExpanded);
                  }}
                >
                  <div className="flex items-center justify-between p-3 rounded-lg group-hover:bg-purple-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {/* Progress Ring */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeDasharray="0, 100"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">0%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Services</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedDashboardCategories.has('services') ? 'transform rotate-180' : ''
                          }`} />
                        </div>
                        <span className="text-sm text-gray-500">0 of 3 services</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedDashboardCategories.has('services') && (
                    <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="text-xs text-gray-500 mb-2">All services available:</div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-600">Legal Advisory Services</span>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">Recommended</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-600">Financial Advisory</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">Gap</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-600">Tax Advisory</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">Gap</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Policies Requiring Attention */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Policies Requiring Attention</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant={selectedTimelineFilter === "all" ? "default" : "ghost"} 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setSelectedTimelineFilter("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={selectedTimelineFilter === "urgent" ? "default" : "ghost"} 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setSelectedTimelineFilter("urgent")}
                    >
                      Urgent
                    </Button>
                    <Button 
                      variant={selectedTimelineFilter === "upcoming" ? "default" : "ghost"} 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setSelectedTimelineFilter("upcoming")}
                    >
                      Upcoming
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                {/* Timeline bar */}
                <div className="absolute top-8 left-0 w-full h-2 bg-gray-100 rounded-full"></div>
                
                {/* Timeline items */}
                <div className="relative space-y-4">
                  {(selectedTimelineFilter === "all" || selectedTimelineFilter === "urgent") && (
                    <div className="flex items-center group hover:bg-red-50 rounded-lg p-3 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-red-500 rounded-full z-10 relative group-hover:scale-110 transition-transform"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Auto Insurance - Premium Plan</div>
                            <div className="text-sm text-gray-500">Expires Feb 15, 2025</div>
                            <div className="text-xs text-red-600 mt-1">Risk exposure: €45,000 vehicle value unprotected</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">19 days</div>
                              <div className="text-xs text-gray-500 mt-1">€2,400 premium uplift available</div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                              Prepare renewal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(selectedTimelineFilter === "all" || selectedTimelineFilter === "upcoming") && (
                    <div className="flex items-center group hover:bg-orange-50 rounded-lg p-3 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-orange-500 rounded-full z-10 relative group-hover:scale-110 transition-transform"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Home Insurance - Comprehensive</div>
                            <div className="text-sm text-gray-500">Expires Apr 22, 2025</div>
                            <div className="text-xs text-orange-600 mt-1">Review for coverage optimization</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">85 days</div>
                              <div className="text-xs text-gray-500 mt-1">€350 savings opportunity</div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                              Schedule review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTimelineFilter !== "all" && selectedTimelineFilter === "urgent" && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      1 policy requires urgent attention
                    </div>
                  )}
                  
                  {selectedTimelineFilter !== "all" && selectedTimelineFilter === "upcoming" && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      1 policy up for review
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coverage Expansion Paths */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Coverage Expansion Paths</h3>
                <Button variant="outline" size="sm" className="h-8">
                  View all opportunities
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("business")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Business Insurance</div>
                        <div className="text-sm text-gray-500">High Value • Profile Fit</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">€4,500</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Customer has home and auto coverage but no business protection. Similar profiles show 78% adoption rate.
                  </p>
                  {hoveredOpportunity === "business" && (
                    <div className="mb-3 p-2 bg-blue-100 rounded text-xs text-blue-800 animate-in slide-in-from-bottom-2 duration-200">
                      💡 Best approach: Bundle with upcoming auto renewal for maximum acceptance
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Prepare quote
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-blue-300 transition-colors">
                      Send offer
                    </Button>
                  </div>
                </div>

                <div 
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("legal")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Scale className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Legal Advisory Services</div>
                        <div className="text-sm text-gray-500">Easy Win • Service Upsell</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-purple-600 group-hover:text-purple-700">€720</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Add legal advisory to complement existing financial coverage. Increases customer lifetime value.
                  </p>
                  {hoveredOpportunity === "legal" && (
                    <div className="mb-3 p-2 bg-purple-100 rounded text-xs text-purple-800 animate-in slide-in-from-bottom-2 duration-200">
                      📋 Package with existing advisory for 15% combined service discount
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Schedule call
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-purple-300 transition-colors">
                      Send offer
                    </Button>
                  </div>
                </div>

                <div 
                  className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("pension")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PiggyBank className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Pension Savings Plan</div>
                        <div className="text-sm text-gray-500">Time-Sensitive • Tax Benefit</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">€3,200</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Customer age and income profile suggest retirement planning need. Strong complement to existing life coverage.
                  </p>
                  {hoveredOpportunity === "pension" && (
                    <div className="mb-3 p-2 bg-emerald-100 rounded text-xs text-emerald-800 animate-in slide-in-from-bottom-2 duration-200">
                      ⏰ Tax year deadline: December 31st - €2,350 maximum annual tax benefit
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Prepare quote
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-emerald-300 transition-colors">
                      Schedule call
                    </Button>
                  </div>
                </div>

                <div 
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("cyber")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Cyber Insurance</div>
                        <div className="text-sm text-gray-500">Risk Exposure • Modern Need</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-amber-600 group-hover:text-amber-700">€1,200</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Digital protection gap identified. Essential coverage for modern business and personal digital assets.
                  </p>
                  {hoveredOpportunity === "cyber" && (
                    <div className="mb-3 p-2 bg-amber-100 rounded text-xs text-amber-800 animate-in slide-in-from-bottom-2 duration-200">
                      🔒 Bundle with business coverage for comprehensive digital protection
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Prepare quote
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-amber-300 transition-colors">
                      Send offer
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Premium Impact Panel */}
            <div className="bg-gradient-to-r from-[#5567E5] to-[#4556D4] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Total Premium Impact</h3>
                  <p className="text-blue-100 text-sm">Estimated uplift from recommended actions</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">€9,620</div>
                  <div className="text-blue-100 text-sm">per year</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-400">
                <div className="text-center">
                  <div className="text-2xl font-bold">+47%</div>
                  <div className="text-blue-100 text-sm">Portfolio growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-blue-100 text-sm">Coverage gaps to fill</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-blue-100 text-sm">Urgent renewals</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
