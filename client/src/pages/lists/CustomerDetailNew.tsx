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
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight } from "lucide-react";
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

  // Product selection states
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

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
                onClick={() => setShowAddProductDialog(true)}
                className="bg-[#5567E5] text-white hover:bg-[#4556D4] h-8"
              >
                Add product
              </Button>
            </div>
            
            {/* Products Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead>Premium Value</TableHead>
                  <TableHead>Premium %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(assignedProducts || []).map((assignment: any) => (
                  <TableRow key={assignment.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {assignment.productTemplate?.name || 'Unknown Product'}
                          </div>
                          {assignment.productTemplate?.description && (
                            <div className="text-sm text-gray-500">
                              {assignment.productTemplate.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {assignment.productTemplate?.productId || 'N/A'}
                    </TableCell>
                    <TableCell>{assignment.productTemplate?.providerName || 'Not specified'}</TableCell>
                    <TableCell>{assignment.productTemplate?.category || 'Not categorized'}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {assignment.productTemplate?.contractStartDate && assignment.productTemplate?.contractEndDate
                        ? `${new Date(assignment.productTemplate.contractStartDate).toLocaleDateString()} - ${new Date(assignment.productTemplate.contractEndDate).toLocaleDateString()}`
                        : 'Not specified'
                      }
                    </TableCell>
                    <TableCell>
                      {assignment.customPrice 
                        ? `€${Number(assignment.customPrice).toLocaleString()}`
                        : assignment.productTemplate?.premiumValue 
                        ? `€${Number(assignment.productTemplate.premiumValue).toLocaleString()}`
                        : 'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      {assignment.customPremiumPercentage 
                        ? `${assignment.customPremiumPercentage}%`
                        : assignment.productTemplate?.premiumPercentage 
                        ? `${assignment.productTemplate.premiumPercentage}%`
                        : 'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!assignedProducts || assignedProducts.length === 0) && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No product assignments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No products have been assigned to this customer yet.
                </p>
              </div>
            )}
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 9h6v6H9z"/>
                <path d="M9 3v6"/>
                <path d="M15 9v6"/>
                <path d="M9 15h6"/>
                <path d="M3 9h6"/>
                <path d="M15 3v6"/>
                <path d="M21 9h-6"/>
                <path d="M9 21v-6"/>
                <path d="M15 15h6"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Dashboard Coming Soon</h3>
            <p className="text-gray-600 max-w-md mb-4">
              We're building comprehensive product analytics and insights for this customer. 
              This dashboard will show product performance, purchasing patterns, and recommendations.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Expected launch: Q2 2025
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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-white text-foreground">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Add Product Template</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign a product template to {customer?.name} with custom attributes
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex min-h-0">
            {/* Left Panel - Product Selection */}
            <div className="flex-1 flex flex-col space-y-4 pr-6 border-r min-h-0">
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
                      // Filter and organize products by category
                      const filteredTemplates = productTemplates?.filter((template: any) => {
                        const searchMatch = !productSearchTerm || 
                          template.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          template.category?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          template.providerName?.toLowerCase().includes(productSearchTerm.toLowerCase());
                        
                        const categoryMatch = !selectedCategoryFilter || 
                          template.categoryId === selectedCategoryFilter;
                        
                        return searchMatch && categoryMatch;
                      }) || [];

                      // Group templates by hierarchy - show root categories (level 1)
                      const groupedTemplates: Record<string, any[]> = {};
                      
                      filteredTemplates.forEach((template: any) => {
                        // Find the category for this template
                        const templateCategory = categories?.find((c: any) => c.name === template.category);
                        
                        // Determine the root category (level 1)
                        let rootCategoryName = 'Uncategorized';
                        if (templateCategory) {
                          // If it's level 1, use it directly
                          if (templateCategory.level === 1) {
                            rootCategoryName = templateCategory.name;
                          } else {
                            // Find the root parent for this category
                            const rootCategory = categories?.find((c: any) => 
                              c.level === 1 && 
                              (c.id === templateCategory.parentId || 
                               categories?.some((parent: any) => 
                                 parent.parentId === c.id && parent.id === templateCategory.parentId
                               ))
                            );
                            rootCategoryName = rootCategory?.name || template.category || 'Uncategorized';
                          }
                        }
                        
                        if (!groupedTemplates[rootCategoryName]) {
                          groupedTemplates[rootCategoryName] = [];
                        }
                        groupedTemplates[rootCategoryName].push(template);
                      });

                      if (Object.keys(groupedTemplates).length === 0) {
                        return (
                          <div className="h-full flex items-center justify-center p-8 text-center">
                            <div>
                              <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                              <h3 className="text-sm font-medium text-foreground mb-1">No products found</h3>
                              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                            </div>
                          </div>
                        );
                      }

                      return Object.entries(groupedTemplates).map(([categoryName, templates]) => (
                        <div key={categoryName} className="border-b border-border last:border-b-0">
                          {/* Category Header */}
                          <div 
                            className="px-4 py-2 bg-muted/30 border-b border-border cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              const categoryId = categories?.find((c: any) => c.name === categoryName)?.id;
                              if (categoryId) {
                                setExpandedCategories(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(categoryId)) {
                                    newSet.delete(categoryId);
                                  } else {
                                    newSet.add(categoryId);
                                  }
                                  return newSet;
                                });
                              }
                            }}
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-foreground">{categoryName}</span>
                              <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                {templates.length}
                              </span>
                            </div>
                            {(() => {
                              const categoryId = categories?.find((c: any) => c.name === categoryName)?.id;
                              const isExpanded = categoryId ? expandedCategories.has(categoryId) : true;
                              return isExpanded ? 
                                <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />;
                            })()}
                          </div>

                          {/* Category Products */}
                          {(() => {
                            const categoryId = categories?.find((c: any) => c.name === categoryName)?.id;
                            const isExpanded = categoryId ? expandedCategories.has(categoryId) : true;
                            
                            if (!isExpanded) return null;

                            return (
                              <div className="divide-y divide-border">
                                {templates.map((template: any) => (
                                  <div 
                                    key={template.id}
                                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                                      selectedProductTemplate?.id === template.id ? 
                                        'bg-primary/5 border-l-2 border-l-primary' : ''
                                    }`}
                                    onClick={() => setSelectedProductTemplate(template)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-foreground truncate">{template.name}</div>
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
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Product Details & Configuration */}
            <div className="w-96 flex-shrink-0 pl-6 flex flex-col min-h-0">
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
                          <span className="text-foreground font-medium">€{selectedProductTemplate.averagePrice}</span>
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
                  
                  const assignmentData = {
                    productTemplateId: selectedProductTemplate.id,
                    customPrice: customAttributes.customPrice ? parseFloat(customAttributes.customPrice) : null,
                    customDiscountPercentage: customAttributes.customDiscountPercentage ? parseFloat(customAttributes.customDiscountPercentage) : null,
                    customPremiumPercentage: customAttributes.customPremiumPercentage ? parseFloat(customAttributes.customPremiumPercentage) : null,
                    customerContractStartDate: customAttributes.customerContractStartDate || null,
                    customerContractEndDate: customAttributes.customerContractEndDate || null,
                    notes: ''
                  };
                  
                  addProductMutation.mutate(assignmentData, {
                    onSuccess: () => {
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
                    }
                  });
                }}
                disabled={!selectedProductTemplate || addProductMutation.isPending}
                className="h-9"
              >
                {addProductMutation.isPending ? 'Adding...' : 'Add & continue'}
              </Button>
              
              <Button 
                onClick={() => {
                  if (!selectedProductTemplate) return;
                  
                  const assignmentData = {
                    productTemplateId: selectedProductTemplate.id,
                    customPrice: customAttributes.customPrice ? parseFloat(customAttributes.customPrice) : null,
                    customDiscountPercentage: customAttributes.customDiscountPercentage ? parseFloat(customAttributes.customDiscountPercentage) : null,
                    customPremiumPercentage: customAttributes.customPremiumPercentage ? parseFloat(customAttributes.customPremiumPercentage) : null,
                    customerContractStartDate: customAttributes.customerContractStartDate || null,
                    customerContractEndDate: customAttributes.customerContractEndDate || null,
                    notes: ''
                  };
                  
                  addProductMutation.mutate(assignmentData, {
                    onSuccess: () => {
                      // Close dialog after adding
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
                    }
                  });
                }}
                disabled={!selectedProductTemplate || addProductMutation.isPending}
                className="bg-[#5567E5] text-white hover:bg-[#4556D4] h-9"
              >
                {addProductMutation.isPending ? 'Adding...' : 'Add & close'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}