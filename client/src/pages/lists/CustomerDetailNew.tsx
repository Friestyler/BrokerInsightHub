import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetailNew() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("okr-plans");
  const [backUrl, setBackUrl] = useState("/customers");
  const [backLabel, setBackLabel] = useState("Back to Customers");
  
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

  // Load existing logo on component mount
  useEffect(() => {
    const loadExistingLogo = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/entity-logos?entityType=customer&entityId=${id}&environmentId=${environment || 'myqollabi'}`);
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
  }, [id, environment]);

  // Fetch customer data from database
  const { data: customersResponse, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch related partners for this customer
  const { data: relatedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/customers/${id}/partners`],
    enabled: !!id,
  });

  // Fetch related opportunities for this customer
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/customers/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch related products for this customer
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/customers/${id}/products`],
    enabled: !!id,
  });

  // Fetch related contacts for this customer
  const { data: relatedContacts, isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/customers/${id}/contacts`],
    enabled: !!id,
  });

  // Fetch template assignments for this customer
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/customer/${id}`],
    enabled: !!id,
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

  // Extract customers array from paginated response
  const customers = customersResponse?.data || [];
  const customer = customers?.find((c: any) => c.id === parseInt(id || '0'));
  
  // Initialize dialog data when it opens (after customer is declared)
  useEffect(() => {
    if (showDetailsDialog && customer) {
      setEditedCustomer({
        name: customer.name || '',
        industry: customer.industry || '',
        contactEmail: customer.contactEmail || '',
        contactPhone: customer.contactPhone || '',
        website: customer.website || '',
        address: customer.address || '',
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

  // Filter metrics based on search and filters
  const filteredMetrics = assignedMetrics.filter((metric: any) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || metric.tags?.includes(selectedTag);
    const matchesUnit = selectedUnit === 'all' || metric.measure_unit === selectedUnit;
    
    return matchesSearch && matchesTag && matchesUnit;
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
                      contactEmail: customer.contactEmail || '',
                      contactPhone: customer.contactPhone || '',
                      website: customer.website || '',
                      address: customer.address || '',
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
                      <Link href={`/lists/partners/${partner.id}`}>
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
                {relatedOpportunities?.map((opportunity: any) => (
                  <TableRow key={opportunity.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {opportunity.title}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {opportunity.partner_name || 'No partner'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {opportunity.stage}
                      </span>
                    </TableCell>
                    <TableCell>
                      €{opportunity.estimated_value ? Number(opportunity.estimated_value).toLocaleString() : '0'}
                    </TableCell>
                    <TableCell>
                      {opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'Not set'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedProducts?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                      {product.description && (
                        <div className="text-sm text-gray-500">{product.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.type || 'Product'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.category || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.vendorName || 'No vendor'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {product.price ? `€${product.price}` : 'Contact for price'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {product.status || 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedProducts || relatedProducts.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products associated with this customer</p>
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
    </div>
  );
}