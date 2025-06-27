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
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight, Shield, TrendingUp, Clock, AlertTriangle, Target, Zap, Briefcase, Plane, PiggyBank, Scale, Lightbulb } from "lucide-react";
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
          <div className="space-y-6">
            {/* Category Prioritization Visual */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Where to Focus Your Time</h3>
                <div className="text-sm text-gray-500">Ranked by impact & urgency</div>
              </div>
              
              <div className="space-y-4">
                {/* Services - Highest Priority */}
                <div className="relative">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xl font-bold text-gray-900">Services</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">€4,200</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Upsell Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">🔥</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">High Urgency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">67%</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Under-coverage</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Focus Score: 94
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-5 right-5 h-3 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full animate-in slide-in-from-left duration-1000" style={{width: '94%'}}></div>
                  </div>
                </div>

                {/* Non-Life - Medium Priority */}
                <div className="relative">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-xl font-bold text-gray-900">Non-Life</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">€4,500</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Upsell Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">⚠️</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Medium Urgency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">75%</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Under-coverage</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Focus Score: 78
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-5 right-5 h-3 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-in slide-in-from-left duration-1000 delay-200" style={{width: '78%'}}></div>
                  </div>
                </div>

                {/* Life - Lower Priority */}
                <div className="relative">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-lg hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                        <span className="text-xl font-bold text-gray-900">Life</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">€3,200</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Upsell Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">💡</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Low Urgency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">62%</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Under-coverage</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Focus Score: 61
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-5 right-5 h-3 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-in slide-in-from-left duration-1000 delay-400" style={{width: '61%'}}></div>
                  </div>
                </div>
              </div>

              {/* Key Insight Callout */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900">Most untapped value in Services</div>
                    <div className="text-sm text-amber-700 mt-1">
                      Customer has high-value financial advisory but is missing Legal Services and Tax Planning - both natural upsells with 78% conversion rate in similar profiles.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Best Actions Panel */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Next Best Actions</h3>
                <div className="text-sm text-gray-500">No thinking required</div>
              </div>

              <div className="space-y-4">
                {/* Urgent Action */}
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg group hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">🔥</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Renew Auto Insurance - Premium Plan</div>
                      <div className="text-sm text-gray-600">Expires Feb 15, 2025 • 19 days left</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      19 days
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Start renewal
                    </Button>
                  </div>
                </div>

                {/* High Value Action */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg group hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Propose Business Insurance</div>
                      <div className="text-sm text-gray-600">78% conversion rate • €4,500 potential value</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      €4,500
                    </div>
                    <Button size="sm" className="bg-[#5567E5] hover:bg-[#4556D4] text-white">
                      Create proposal
                    </Button>
                  </div>
                </div>

                {/* Bundle Opportunity */}
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg group hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">⏰</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Send Travel + Life bundle offer</div>
                      <div className="text-sm text-gray-600">Perfect timing before Death Cover renewal • 15% bundle discount</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      Bundle
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      Send offer
                    </Button>
                  </div>
                </div>

                {/* Easy Win */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg group hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Add Legal Services to Financial Advisory</div>
                      <div className="text-sm text-gray-600">Natural extension • €720 annual value • High acceptance rate</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                      Easy win
                    </div>
                    <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      Schedule call
                    </Button>
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
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">€3,200/year</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors border-t pt-3 mt-3">
                        <span className="text-gray-400">Branch 23</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <span className="text-gray-400">Pension Savings</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
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
                            strokeDasharray="25, 100"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">25%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Non-Life Insurance</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedDashboardCategories.has('nonlife') ? 'transform rotate-180' : ''
                          }`} />
                        </div>
                        <span className="text-sm text-gray-500">3 of 12 products</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedDashboardCategories.has('nonlife') && (
                    <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <span className="text-gray-600">Health Insurance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">€1,200/year</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <span className="text-gray-600">Auto Insurance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">€850/year</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors">
                        <span className="text-gray-600">Home Insurance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">€680/year</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors border-t pt-3 mt-3">
                        <span className="text-gray-400">Business Insurance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <span className="text-gray-400">Travel Insurance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
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
                            strokeDasharray="33, 100"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">33%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Services</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedDashboardCategories.has('services') ? 'transform rotate-180' : ''
                          }`} />
                        </div>
                        <span className="text-sm text-gray-500">1 of 3 products</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedDashboardCategories.has('services') && (
                    <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-purple-50 transition-colors">
                        <span className="text-gray-600">Financial Advisory</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">€2,400/year</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors border-t pt-3 mt-3">
                        <span className="text-gray-400">Legal Services</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                        <span className="text-gray-400">Tax Planning</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                            Add product
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Timeline */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Contract Timeline</h3>
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
                    <div className="flex items-center group hover:bg-red-50 rounded-lg p-2 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-red-500 rounded-full z-10 relative group-hover:scale-110 transition-transform"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Auto Insurance - Premium Plan</div>
                            <div className="text-sm text-gray-500">Expires Feb 15, 2025</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">19 days</span>
                            <Button variant="outline" size="sm" className="h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                              Renew
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(selectedTimelineFilter === "all" || selectedTimelineFilter === "upcoming") && (
                    <div className="flex items-center group hover:bg-orange-50 rounded-lg p-2 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-orange-500 rounded-full z-10 relative group-hover:scale-110 transition-transform"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Home Insurance - Comprehensive</div>
                            <div className="text-sm text-gray-500">Expires Apr 22, 2025</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">85 days</span>
                            <Button variant="outline" size="sm" className="h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(selectedTimelineFilter === "all" || selectedTimelineFilter === "upcoming") && (
                    <div className="flex items-center group hover:bg-green-50 rounded-lg p-2 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-green-500 rounded-full z-10 relative group-hover:scale-110 transition-transform"></div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Death Cover - Family Plan</div>
                            <div className="text-sm text-gray-500">Expires Aug 10, 2025</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">195 days</span>
                            <Button variant="ghost" size="sm" className="h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                              Monitor
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTimelineFilter !== "all" && selectedTimelineFilter === "urgent" && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      1 contract requires urgent attention
                    </div>
                  )}
                  
                  {selectedTimelineFilter !== "all" && selectedTimelineFilter === "upcoming" && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      2 contracts up for review
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cross-sell Opportunities */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Cross-sell Opportunities</h3>
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
                        <div className="text-sm text-gray-500">High potential match</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">€4,500</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Customer has home and auto insurance but no business coverage. Similar profiles show 78% conversion rate.
                  </p>
                  {hoveredOpportunity === "business" && (
                    <div className="mb-3 p-2 bg-blue-100 rounded text-xs text-blue-800 animate-in slide-in-from-bottom-2 duration-200">
                      💡 Best time to approach: Within 30 days of auto insurance renewal
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Add to campaign
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-blue-300 transition-colors">
                      Share with partner
                    </Button>
                  </div>
                </div>

                <div 
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("travel")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plane className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Travel Insurance</div>
                        <div className="text-sm text-gray-500">Bundle opportunity</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-purple-600 group-hover:text-purple-700">€480</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Perfect add-on to existing life insurance. Can be bundled with current Death Cover renewal.
                  </p>
                  {hoveredOpportunity === "travel" && (
                    <div className="mb-3 p-2 bg-purple-100 rounded text-xs text-purple-800 animate-in slide-in-from-bottom-2 duration-200">
                      🎯 Bundle with Death Cover renewal for 15% discount
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Add to campaign
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-purple-300 transition-colors">
                      Share with partner
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
                        <div className="font-medium text-gray-900">Pension Savings</div>
                        <div className="text-sm text-gray-500">Life stage match</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">€3,200</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Customer age and income profile suggest retirement planning need. Strong complement to existing life products.
                  </p>
                  {hoveredOpportunity === "pension" && (
                    <div className="mb-3 p-2 bg-emerald-100 rounded text-xs text-emerald-800 animate-in slide-in-from-bottom-2 duration-200">
                      ⏰ Tax year deadline: December 31st - €2,350 max benefit
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Add to campaign
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-emerald-300 transition-colors">
                      Share with partner
                    </Button>
                  </div>
                </div>

                <div 
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  onMouseEnter={() => setHoveredOpportunity("legal")}
                  onMouseLeave={() => setHoveredOpportunity(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Scale className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Legal Services</div>
                        <div className="text-sm text-gray-500">Service upsell</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-amber-600 group-hover:text-amber-700">€720</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                    Add legal advisory services to complement existing financial advisory. Increases customer lifetime value.
                  </p>
                  {hoveredOpportunity === "legal" && (
                    <div className="mb-3 p-2 bg-amber-100 rounded text-xs text-amber-800 animate-in slide-in-from-bottom-2 duration-200">
                      📋 Cross-sell with existing financial advisory for package discount
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-8 bg-[#5567E5] text-white hover:bg-[#4556D4] transition-all">
                      Add to campaign
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 group-hover:border-amber-300 transition-colors">
                      Share with partner
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      <LogoUploadModal
        isOpen={showLogoUploadModal}
        onClose={() => setShowLogoUploadModal(false)}
        onUpload={(logoUrl) => {
          setCustomerLogo(logoUrl);
          setShowLogoUploadModal(false);
        }}
        entityName={customer?.name || 'Customer'}
        entityType="customer"
        entityId={customer?.id || 0}
      />

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-[#ffffff] text-[#282A3F]" style={{ padding: '32px' }}>
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">Customer Details</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Complete information about {customer?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                <Input
                  value={editedCustomer.name || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={editedCustomer.description || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Industry</Label>
                <Input
                  value={editedCustomer.industry || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, industry: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact Email</Label>
                <Input
                  type="email"
                  value={editedCustomer.contactEmail || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, contactEmail: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact Phone</Label>
                <Input
                  value={editedCustomer.contactPhone || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, contactPhone: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Website</Label>
                <Input
                  value={editedCustomer.website || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, website: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Address</Label>
                <Textarea
                  value={editedCustomer.address || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, address: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Opportunities</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value && !selectedOpportunityIds.includes(parseInt(value))) {
                      setSelectedOpportunityIds([...selectedOpportunityIds, parseInt(value)]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 min-h-[42px]">
                    <div className="flex flex-wrap gap-1 py-1">
                      {selectedOpportunityIds.length === 0 ? (
                        <span className="text-gray-500">Select opportunities...</span>
                      ) : (
                        selectedOpportunityIds.map(oppId => {
                          const opportunity = allOpportunities?.find((o: any) => o.id === oppId);
                          return opportunity ? (
                            <span key={oppId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {opportunity.title}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOpportunityIds(selectedOpportunityIds.filter(id => id !== oppId));
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {allOpportunities?.filter((opp: any) => !selectedOpportunityIds.includes(opp.id))
                      .map((opportunity: any) => (
                        <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                          {opportunity.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Products</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value && !selectedProductIds.includes(parseInt(value))) {
                      setSelectedProductIds([...selectedProductIds, parseInt(value)]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 min-h-[42px]">
                    <div className="flex flex-wrap gap-1 py-1">
                      {selectedProductIds.length === 0 ? (
                        <span className="text-gray-500">Select products...</span>
                      ) : (
                        selectedProductIds.map(productId => {
                          const product = allProducts?.find((p: any) => p.id === productId);
                          return product ? (
                            <span key={productId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {product.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
                                }}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts?.filter((prod: any) => !selectedProductIds.includes(prod.id))
                      .map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contacts</Label>
                <p className="text-sm text-gray-900 mt-1">{(relatedContacts as any[] || []).length} contacts</p>
              </div>
            </div>
          </div>
          
          <DialogFooter style={{ marginTop: '24px' }}>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
              className="text-[#282A3F] border-[#282A3F]"
              style={{ padding: '8px 16px', marginRight: '12px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Save the edited customer data
                console.log('Saving customer data:', editedCustomer);
                console.log('Selected opportunities:', selectedOpportunityIds);
                console.log('Selected products:', selectedProductIds);
                // Here you would typically make an API call to update the customer
                // For now, we'll just close the dialog
                setShowDetailsDialog(false);
                toast({
                  title: "Customer updated",
                  description: "Customer information has been saved successfully.",
                });
              }}
              className="bg-[#5567E5] text-[#ffffff] hover:bg-[#4556D4]"
              style={{ padding: '8px 16px' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col bg-white text-foreground">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Add Product Template</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign a product template to {customer?.name} with custom attributes
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex min-h-0">
            {/* Left Panel - Product Selection (narrower) */}
            <div className="w-2/5 flex flex-col space-y-4 pr-6 border-r min-h-0">
              <div className="flex-shrink-0">
                <Label className="text-sm font-medium text-foreground">Select Product Template</Label>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex-shrink-0 flex space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products and categories..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10 h-9 border-border bg-background"
                  />
                </div>
                <Select 
                  value={selectedCategoryFilter?.toString() || "all"} 
                  onValueChange={(value) => setSelectedCategoryFilter(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-48 h-9 border-border">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Template Selection Interface */}
              {templatesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Loading templates...</div>
                </div>
              ) : (
                <div className="flex-1 border border-border rounded-lg overflow-hidden min-h-0">
                  <div className="h-full overflow-y-auto">
                    {(() => {
                      // Filter products for search
                      const filteredTemplates = productTemplates?.filter((template: any) => {
                        const searchMatch = !productSearchTerm || 
                          template.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          template.category?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          template.providerName?.toLowerCase().includes(productSearchTerm.toLowerCase());
                        
                        const categoryMatch = !selectedCategoryFilter || 
                          template.categoryId === selectedCategoryFilter;
                        
                        return searchMatch && categoryMatch;
                      }) || [];

                      // Build complete category hierarchy from database - filter authentic root categories only
                      const rootCategories = categories?.filter((c: any) => 
                        c.level === 1 && c.parent_id === null && 
                        ['Life', 'Non-Life', 'Services'].includes(c.name)
                      ) || [];
                      
                      if (rootCategories.length === 0) {
                        return (
                          <div className="h-full flex items-center justify-center p-8 text-center">
                            <div>
                              <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                              <h3 className="text-sm font-medium text-foreground mb-1">No categories found</h3>
                              <p className="text-sm text-muted-foreground">Categories will appear here once configured.</p>
                            </div>
                          </div>
                        );
                      }

                      return rootCategories.map((rootCategory: any) => {
                        const rootCategoryId = rootCategory.id;
                        const isRootExpanded = expandedCategories.has(rootCategoryId);
                        
                        // Get level 2 subcategories for this root category (proper hierarchy)
                        const subcategories = categories?.filter((c: any) => 
                          c.parent_id === rootCategoryId && c.level === 2
                        ) || [];
                        
                        // Count total products in this root category and all its subcategories
                        const totalProducts = filteredTemplates.filter((template: any) => {
                          const templateCategory = categories?.find((c: any) => c.name === template.category);
                          if (!templateCategory) return false;
                          
                          // Check if template belongs to this root category or any of its subcategories
                          if (templateCategory.level === 1 && templateCategory.id === rootCategoryId) return true;
                          if (templateCategory.level === 2 && templateCategory.parent_id === rootCategoryId) return true;
                          if (templateCategory.level === 3) {
                            const parentCategory = categories?.find((c: any) => c.id === templateCategory.parent_id);
                            return parentCategory?.parent_id === rootCategoryId;
                          }
                          return false;
                        }).length;
                        
                        return (
                          <div key={rootCategory.name} className="border-b border-border last:border-b-0">
                            {/* Root Category Header (Life, Non-Life, Services) */}
                            <div 
                              className="px-4 py-3 bg-muted/40 border-b border-border cursor-pointer flex items-center justify-between hover:bg-muted/60 transition-colors"
                              onClick={() => {
                                setExpandedCategories(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(rootCategoryId)) {
                                    newSet.delete(rootCategoryId);
                                  } else {
                                    newSet.add(rootCategoryId);
                                  }
                                  return newSet;
                                });
                              }}
                            >
                              <div className="flex items-center">
                                {isRootExpanded ? 
                                  <ChevronDown className="h-4 w-4 text-muted-foreground mr-2" /> : 
                                  <ChevronRight className="h-4 w-4 text-muted-foreground mr-2" />
                                }
                                <span className="text-sm font-semibold text-foreground">{rootCategory.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  {totalProducts}
                                </span>
                              </div>
                            </div>

                            {/* Products directly assigned to root category */}
                            {isRootExpanded && (() => {
                              // Get products directly assigned to this root category (level 1)
                              const directRootTemplates = filteredTemplates.filter((template: any) => {
                                const templateCategory = categories?.find((c: any) => c.name === template.category);
                                return templateCategory?.level === 1 && templateCategory?.id === rootCategoryId;
                              });

                              return directRootTemplates.length > 0 && (
                                <div className="divide-y divide-border/30 border-b border-border/50">
                                  {directRootTemplates.map((template: any) => (
                                    <div 
                                      key={template.id}
                                      className={`px-8 py-3 cursor-pointer hover:bg-accent transition-colors ${
                                        selectedProductTemplate?.id === template.id ? 
                                          'bg-primary/5 border-l-2 border-l-primary' : ''
                                      }`}
                                      onClick={() => setSelectedProductTemplate(template)}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-foreground truncate">{template.name}</div>
                                            {configuredProducts.includes(template.id) && (
                                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Configured"></div>
                                            )}
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            {template.providerName} • Product ID: {template.productId}
                                          </div>
                                          {template.description && (
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                              {template.description}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* Level 2 and Level 3 Subcategories with Products */}
                            {isRootExpanded && (
                              <div>
                                {subcategories.map((subcategory: any) => {
                                  const subcategoryId = subcategory.id;
                                  const isSubExpanded = expandedCategories.has(subcategoryId);
                                  
                                  // Get products assigned to this Level 2 subcategory
                                  const directSubcategoryTemplates = filteredTemplates.filter((template: any) => {
                                    const templateCategory = categories?.find((c: any) => c.name === template.category);
                                    return templateCategory?.id === subcategoryId;
                                  });
                                  
                                  // Count products in this subcategory
                                  const totalSubcategoryProducts = directSubcategoryTemplates.length;
                                  
                                  return (
                                    <div key={subcategory.name} className="border-b border-border/50 last:border-b-0">
                                      {/* Level 2 Subcategory Header */}
                                      <div 
                                        className="px-6 py-2 bg-muted/20 cursor-pointer flex items-center justify-between hover:bg-muted/30 transition-colors"
                                        onClick={() => {
                                          setExpandedCategories(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(subcategoryId)) {
                                              newSet.delete(subcategoryId);
                                            } else {
                                              newSet.add(subcategoryId);
                                            }
                                            return newSet;
                                          });
                                        }}
                                      >
                                        <div className="flex items-center">
                                          {isSubExpanded ? 
                                            <ChevronDown className="h-3 w-3 text-muted-foreground mr-2" /> : 
                                            <ChevronRight className="h-3 w-3 text-muted-foreground mr-2" />
                                          }
                                          <span className="text-sm font-medium text-foreground">{subcategory.name}</span>
                                          <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                            {totalSubcategoryProducts}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Products under Level 2 subcategory */}
                                      {isSubExpanded && directSubcategoryTemplates.length > 0 && (
                                        <div className="divide-y divide-border/30">
                                          {directSubcategoryTemplates.map((template: any) => (
                                            <div 
                                              key={template.id}
                                              className={`px-12 py-3 cursor-pointer hover:bg-accent transition-colors ${
                                                selectedProductTemplate?.id === template.id ? 
                                                  'bg-primary/5 border-l-2 border-l-primary' : ''
                                              }`}
                                              onClick={() => setSelectedProductTemplate(template)}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-foreground truncate">{template.name}</div>
                                                    {configuredProducts.includes(template.id) && (
                                                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Configured"></div>
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground mt-0.5">
                                                    {template.providerName} • Product ID: {template.productId}
                                                  </div>
                                                  {template.description && (
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                      {template.description}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Product Details & Configuration (wider) */}
            <div className="w-3/5 flex-shrink-0 pl-6 flex flex-col min-h-0">
              {/* Staged Products Area */}
              {stagedProducts.length > 0 && (
                <div className="flex-shrink-0 mb-4">
                  <div className="text-sm font-medium text-foreground mb-2">Configured Products ({stagedProducts.length})</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {stagedProducts.map((staged) => (
                      <div key={staged.templateId} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{staged.template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {staged.template.providerName} • €{staged.customAttributes.customPrice || staged.template.averagePrice}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProductTemplate(staged.template);
                              setCustomAttributes({
                                ...staged.customAttributes,
                                notes: staged.customAttributes.notes || ''
                              });
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStagedProducts(prev => prev.filter(p => p.templateId !== staged.templateId));
                              setConfiguredProducts(prev => prev.filter(id => id !== staged.templateId));
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProductTemplate ? (
                <div className="flex flex-col h-full min-h-0 space-y-4">
                  {/* Selected Product Summary */}
                  <div className="flex-shrink-0 bg-accent/50 border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{selectedProductTemplate.name}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {selectedProductTemplate.providerName} • €{selectedProductTemplate.averagePrice}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedProductTemplate(null)}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">
                    {/* Template Details */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3">Template Details</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provider:</span>
                          <span className="text-foreground font-medium">{selectedProductTemplate.providerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="text-foreground font-medium">{selectedProductTemplate.category || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Price:</span>
                          <span className="text-foreground font-medium">
                            {selectedProductTemplate.averagePrice ? `€${selectedProductTemplate.averagePrice}` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Premium:</span>
                          <span className="text-foreground font-medium">{selectedProductTemplate.premiumPercentage || 0}%</span>
                        </div>
                      </div>
                      {selectedProductTemplate.description && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <span className="text-sm text-muted-foreground">Description:</span>
                          <p className="mt-1 text-sm text-foreground">{selectedProductTemplate.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Custom Attributes */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Custom Attributes for {customer?.name}</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="custom-price" className="text-sm">Custom Price (€)</Label>
                            <Input
                              id="custom-price"
                              type="number"
                              step="0.01"
                              placeholder={`${selectedProductTemplate.averagePrice}`}
                              value={customAttributes.customPrice}
                              onChange={(e) => setCustomAttributes(prev => ({
                                ...prev,
                                customPrice: e.target.value
                              }))}
                              className="h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="custom-discount-percentage" className="text-sm">Discount (%)</Label>
                            <Input
                              id="custom-discount-percentage"
                              type="number"
                              step="0.01"
                              max="100"
                              placeholder={`${selectedProductTemplate.discountPercentage || 0}`}
                              value={customAttributes.customDiscountPercentage}
                              onChange={(e) => setCustomAttributes(prev => ({
                                ...prev,
                                customDiscountPercentage: e.target.value
                              }))}
                              className="h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="custom-premium-percentage" className="text-sm">Premium (%)</Label>
                            <Input
                              id="custom-premium-percentage"
                              type="number"
                              step="0.01"
                              placeholder={`${selectedProductTemplate.premiumPercentage || 0}`}
                              value={customAttributes.customPremiumPercentage}
                              onChange={(e) => setCustomAttributes(prev => ({
                                ...prev,
                                customPremiumPercentage: e.target.value
                              }))}
                              className="h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contract-start" className="text-sm">Contract Start</Label>
                            <Input
                              id="contract-start"
                              type="date"
                              value={customAttributes.customerContractStartDate}
                              onChange={(e) => setCustomAttributes(prev => ({
                                ...prev,
                                customerContractStartDate: e.target.value
                              }))}
                              className="h-9"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="contract-end" className="text-sm">Contract End Date</Label>
                          <Input
                            id="contract-end"
                            type="date"
                            value={customAttributes.customerContractEndDate}
                            onChange={(e) => setCustomAttributes(prev => ({
                              ...prev,
                              customerContractEndDate: e.target.value
                            }))}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-sm font-medium text-foreground mb-1">Select a Product</h3>
                    <p className="text-sm text-muted-foreground">Choose a product template from the list to configure custom attributes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>



          <DialogFooter className="flex-shrink-0 border-t border-border pt-4 justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddProductDialog(false);
                setSelectedProductTemplate(null);
                setConfiguredProducts([]);
                setCustomAttributes({
                  customPrice: '',
                  customDiscountPercentage: '',
                  customPremiumPercentage: '',
                  customerContractStartDate: '',
                  customerContractEndDate: '',
                  notes: ''
                });
              }}
              className="h-9"
            >
              Close
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => {
                  if (!selectedProductTemplate) return;
                  
                  // Stage the product instead of immediately saving it
                  const stagedProduct = {
                    templateId: selectedProductTemplate.id,
                    template: selectedProductTemplate,
                    customAttributes: { 
                      ...customAttributes,
                      notes: customAttributes.notes || ''
                    }
                  };

                  // Add to staged products or update existing
                  setStagedProducts(prev => {
                    const existing = prev.findIndex(p => p.templateId === selectedProductTemplate.id);
                    if (existing >= 0) {
                      const updated = [...prev];
                      updated[existing] = stagedProduct;
                      return updated;
                    } else {
                      return [...prev, stagedProduct];
                    }
                  });

                  // Mark as configured
                  if (!configuredProducts.includes(selectedProductTemplate.id)) {
                    setConfiguredProducts(prev => [...prev, selectedProductTemplate.id]);
                  }

                  // Reset form but keep dialog open
                  setSelectedProductTemplate(null);
                  setCustomAttributes({
                    customPrice: '',
                    customDiscountPercentage: '',
                    customPremiumPercentage: '',
                    customerContractStartDate: '',
                    customerContractEndDate: '',
                    notes: ''
                  });
                }}
                disabled={!selectedProductTemplate}
                className="h-9"
              >
                Add & continue
              </Button>
              
              <Button 
                onClick={async () => {
                  // If there's a currently selected product, stage it first
                  if (selectedProductTemplate) {
                    const stagedProduct = {
                      templateId: selectedProductTemplate.id,
                      template: selectedProductTemplate,
                      customAttributes: { 
                        ...customAttributes,
                        notes: customAttributes.notes || ''
                      }
                    };

                    setStagedProducts(prev => {
                      const existing = prev.findIndex(p => p.templateId === selectedProductTemplate.id);
                      if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = stagedProduct;
                        return updated;
                      } else {
                        return [...prev, stagedProduct];
                      }
                    });
                  }

                  // Now save all staged products
                  const allProductsToSave = selectedProductTemplate ? 
                    [...stagedProducts.filter(p => p.templateId !== selectedProductTemplate.id), {
                      templateId: selectedProductTemplate.id,
                      template: selectedProductTemplate,
                      customAttributes: { 
                        ...customAttributes,
                        notes: customAttributes.notes || ''
                      }
                    }] : stagedProducts;

                  // Save each staged product
                  for (const staged of allProductsToSave) {
                    const assignmentData = {
                      productTemplateId: staged.templateId,
                      customPrice: staged.customAttributes.customPrice ? parseFloat(staged.customAttributes.customPrice) : null,
                      customDiscountPercentage: staged.customAttributes.customDiscountPercentage ? parseFloat(staged.customAttributes.customDiscountPercentage) : null,
                      customPremiumPercentage: staged.customAttributes.customPremiumPercentage ? parseFloat(staged.customAttributes.customPremiumPercentage) : null,
                      customerContractStartDate: staged.customAttributes.customerContractStartDate || null,
                      customerContractEndDate: staged.customAttributes.customerContractEndDate || null,
                      notes: ''
                    };
                    
                    try {
                      await addProductMutation.mutateAsync(assignmentData);
                    } catch (error) {
                      console.error('Failed to save product:', error);
                      return; // Stop on first error
                    }
                  }

                  // Clear all state and close dialog
                  setStagedProducts([]);
                  setConfiguredProducts([]);
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
                }}
                disabled={stagedProducts.length === 0 && !selectedProductTemplate || addProductMutation.isPending}
                className="bg-[#5567E5] text-white hover:bg-[#4556D4] h-9"
              >
                {addProductMutation.isPending ? 'Saving...' : 'Add & close'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}