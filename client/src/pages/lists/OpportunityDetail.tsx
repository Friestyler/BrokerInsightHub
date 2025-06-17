import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Users, Target, Search } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface Opportunity {
  id: number;
  title: string;
  description?: string;
  status: string;
  stage: string;
  type?: string;
  estimatedValue?: number;
  value?: number;
  probability?: number;
  location?: string;
  partnerName?: string;
  customerName?: string;
  clientName?: string;
  lastActivityDate?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt?: string;
  expectedCloseDate?: string;
  deliveryDate?: string;
  customerId?: number;
  partnerId?: number;
  linkedProductIds?: number[];
  linkedContactIds?: number[];
  createdBy?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("okr-plan");
  const [backUrl, setBackUrl] = useState("/opportunities");
  const [backLabel, setBackLabel] = useState("Back to Opportunities");
  
  // Filter states for OKR plans
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editedOpportunity, setEditedOpportunity] = useState({
    title: '',
    description: '',
    stage: '',
    status: '',
    type: '',
    location: '',
    estimatedValue: '',
    probability: '',
    expectedCloseDate: ''
  });
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<number[]>([]);

  // Handle tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
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
      
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        return;
      }
    }
    
    // Method 2: Check for partner context in URL or session storage
    const sessionReferrer = sessionStorage.getItem('opportunityReferrer');
    if (sessionReferrer) {
      const partnerDetailMatch = sessionReferrer.match(/\/lists\/partners\/(\d+)/);
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        // Clear the session storage after use
        sessionStorage.removeItem('opportunityReferrer');
        return;
      }
    }
    
    // Method 3: Check browser history if available
    if (window.history && window.history.length > 1) {
      // For SPAs, we can use the browser back functionality
      // But we'll still default to opportunities list for safety
    }
  }, []);

  // Fetch template assignments for this opportunity
  const { data: templateAssignments = [] } = useQuery({
    queryKey: [`/api/degoudse/template-assignments/opportunity/${id}`],
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch opportunity data
  const { data: opportunity, isLoading: opportunityLoading } = useQuery<Opportunity>({
    queryKey: [`/api/${environment.id}/opportunities/${id}`],
    enabled: !!id,
  });

  // Fetch related partners for this opportunity
  const { data: relatedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/${environment.id}/opportunities/${id}/partners`],
    enabled: !!id,
  });

  // Fetch related customers for this opportunity
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/${environment.id}/opportunities/${id}/customers`],
    enabled: !!id,
  });

  // Fetch related products for this opportunity
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/${environment.id}/opportunities/${id}/products`],
    enabled: !!id,
  });

  // Fetch all customers for multi-select
  const { data: allCustomersResponse } = useQuery({
    queryKey: ['/api/customers'],
  });
  const allCustomers = allCustomersResponse?.data || [];

  // Fetch all partners for multi-select
  const { data: allPartners } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Initialize dialog data when it opens
  useEffect(() => {
    if (showDetailsDialog && opportunity) {
      setEditedOpportunity({
        title: opportunity.title || '',
        description: opportunity.description || '',
        stage: opportunity.stage || '',
        status: opportunity.status || '',
        type: opportunity.type || '',
        location: opportunity.location || '',
        estimatedValue: opportunity.estimatedValue?.toString() || '',
        probability: opportunity.probability?.toString() || '',
        expectedCloseDate: opportunity.expectedCloseDate || ''
      });
      
      // Initialize with existing relationships
      const customerIds = Array.isArray(relatedCustomers) 
        ? relatedCustomers.map((customer: any) => customer.id) 
        : [];
      const partnerIds = Array.isArray(relatedPartners) 
        ? relatedPartners.map((partner: any) => partner.id) 
        : [];
        
      setSelectedCustomerIds(customerIds);
      setSelectedPartnerIds(partnerIds);
    }
  }, [showDetailsDialog, opportunity, relatedCustomers, relatedPartners]);

  if (opportunityLoading || partnersLoading || customersLoading || productsLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!opportunity) {
    return <div className="p-4">Opportunity not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="p-2 group hover:bg-[#F5F6FE]">
                  <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-4 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                      onClick={() => {
                        setEditedOpportunity({
                          title: opportunity.title || '',
                          description: opportunity.description || '',
                          stage: opportunity.stage || '',
                          status: opportunity.status || '',
                          type: opportunity.type || '',
                          location: opportunity.location || '',
                          estimatedValue: opportunity.estimatedValue?.toString() || '',
                          probability: opportunity.probability?.toString() || '',
                          expectedCloseDate: opportunity.expectedCloseDate || ''
                        });
                        setShowDetailsDialog(true);
                      }}
                    >
                      Details
                    </Button>
                    <span className="text-sm text-gray-500">Stage: <span className="text-blue-600">{opportunity.stage}</span></span>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">{opportunity.status}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">Edit</Button>
              <Button>View Details</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Overview */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Estimated Value</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(opportunity.estimatedValue || 0)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Probability</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{opportunity.probability}%</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Expected Close</h3>
              <p className="mt-1 text-lg text-gray-900">
                {opportunity.expectedCloseDate 
                  ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(opportunity.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {opportunity.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900">{opportunity.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 mb-3">
            <button
              onClick={() => setActiveTab("okr-plan")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "okr-plan"
                  ? "bg-[#E1E4FB] text-[#3E4DC4]"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="7" />
              </svg>
              OKR Plan ({templateAssignments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("partners")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "partners"
                  ? "bg-[#E1E4FB] text-[#3E4DC4]"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Partners ({relatedPartners?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "customers"
                  ? "bg-[#E1E4FB] text-[#3E4DC4]"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Customers ({relatedCustomers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "products"
                  ? "bg-[#E1E4FB] text-[#3E4DC4]"
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Products ({relatedProducts?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "partners" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedPartners?.map((partner: any) => (
                  <TableRow key={partner.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link 
                        href={`/partners/${partner.id}`}
                        onClick={() => {
                          // Store navigation context for partner detail back navigation
                          sessionStorage.setItem('partnerReferrer', `opportunities/${id}#partners`);
                        }}
                      >
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {partner.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{partner.location || 'Not set'}</TableCell>
                    <TableCell>{partner.contact_email || 'Not set'}</TableCell>
                    <TableCell>{partner.primary_contact || 'Not set'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedPartners || relatedPartners.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No partners associated with this opportunity</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedCustomers?.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}>
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {customer.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{customer.industry || 'Not set'}</TableCell>
                    <TableCell>{customer.location || 'Not set'}</TableCell>
                    <TableCell>{customer.contact_email || 'Not set'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedCustomers || relatedCustomers.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No customers associated with this opportunity</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedProducts?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <span className="font-medium text-indigo-600">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell>{product.category || 'Not set'}</TableCell>
                    <TableCell>{product.price ? formatCurrency(product.price) : 'Not set'}</TableCell>
                    <TableCell>{product.description || 'No description'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedProducts || relatedProducts.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products associated with this opportunity</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "okr-plan" && (
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="claims">Claims</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0-50">0-50</SelectItem>
                  <SelectItem value="51-100">51-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag-grouped Tables */}
            {(!templateAssignments || templateAssignments.length === 0) ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-400">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="7" />
                </svg>
                <p className="text-gray-500 mb-2">No OKR templates assigned</p>
                <p className="text-sm text-gray-400">Go to the Opportunities list to assign OKR templates to this opportunity</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Array.from(new Set(templateAssignments.flatMap((a: any) => a.tags || []))).map((tag: any) => {
                  const tagAssignments = templateAssignments.filter((a: any) => a.tags?.includes(tag));
                  const tagColors: Record<string, string> = {
                    'acquisition': 'bg-blue-100 text-blue-800',
                    'products': 'bg-green-100 text-green-800', 
                    'claims': 'bg-red-100 text-red-800',
                    'solar': 'bg-yellow-100 text-yellow-800',
                    'partnership': 'bg-purple-100 text-purple-800',
                    'performance': 'bg-indigo-100 text-indigo-800',
                    'diversification': 'bg-teal-100 text-teal-800',
                    'growth': 'bg-green-100 text-green-800',
                    'conversion': 'bg-orange-100 text-orange-800',
                    'renewable': 'bg-green-100 text-green-800',
                    'customers': 'bg-blue-100 text-blue-800',
                    'portfolio': 'bg-purple-100 text-purple-800'
                  };

                  return (
                    <div key={tag} className="space-y-4">
                      {/* Tag Badge */}
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>
                          {tag}
                        </span>
                      </div>

                      {/* Table for this tag */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"><Checkbox /></TableHead>
                            <TableHead>NAME</TableHead>
                            <TableHead>TIMEFRAME</TableHead>
                            <TableHead>MILESTONE FREQUENCY</TableHead>
                            <TableHead>TARGET</TableHead>
                            <TableHead>ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tagAssignments.map((assignment: any) => (
                            <TableRow key={assignment.id}>
                              <TableCell><Checkbox /></TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{assignment.template_name}</div>
                                  <div className="text-sm text-gray-600">{assignment.template_description}</div>
                                </div>
                              </TableCell>
                              <TableCell>Ongoing</TableCell>
                              <TableCell>Monthly</TableCell>
                              <TableCell>80</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">•••</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opportunity Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-[#ffffff] text-[#282A3F]" style={{ padding: '32px' }}>
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">Opportunity Details</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Complete information about {opportunity.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Opportunity Title</Label>
                <Input
                  value={editedOpportunity.title || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={editedOpportunity.description || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Stage</Label>
                <Input
                  value={editedOpportunity.stage || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, stage: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Input
                  value={editedOpportunity.status || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, status: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Type</Label>
                <Input
                  value={editedOpportunity.type || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, type: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <Input
                  value={editedOpportunity.location || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, location: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Estimated Value</Label>
                <Input
                  type="number"
                  value={editedOpportunity.estimatedValue || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, estimatedValue: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editedOpportunity.probability || ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, probability: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Customers</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value && !selectedCustomerIds.includes(parseInt(value))) {
                      setSelectedCustomerIds([...selectedCustomerIds, parseInt(value)]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 min-h-[42px]">
                    <div className="flex flex-wrap gap-1 py-1">
                      {selectedCustomerIds.length === 0 ? (
                        <span className="text-gray-500">Select customers...</span>
                      ) : (
                        selectedCustomerIds.map(customerId => {
                          const customer = allCustomers?.find((c: any) => c.id === customerId);
                          return customer ? (
                            <span key={customerId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {customer.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerIds(selectedCustomerIds.filter(id => id !== customerId));
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
                    {allCustomers?.filter((customer: any) => !selectedCustomerIds.includes(customer.id))
                      .map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Partners</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value && !selectedPartnerIds.includes(parseInt(value))) {
                      setSelectedPartnerIds([...selectedPartnerIds, parseInt(value)]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 min-h-[42px]">
                    <div className="flex flex-wrap gap-1 py-1">
                      {selectedPartnerIds.length === 0 ? (
                        <span className="text-gray-500">Select partners...</span>
                      ) : (
                        selectedPartnerIds.map(partnerId => {
                          const partner = allPartners?.find((p: any) => p.id === partnerId);
                          return partner ? (
                            <span key={partnerId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {partner.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPartnerIds(selectedPartnerIds.filter(id => id !== partnerId));
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
                    {allPartners?.filter((partner: any) => !selectedPartnerIds.includes(partner.id))
                      .map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.id.toString()}>
                          {partner.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Expected Close Date</Label>
                <Input
                  type="date"
                  value={editedOpportunity.expectedCloseDate ? editedOpportunity.expectedCloseDate.split('T')[0] : ''}
                  onChange={(e) => setEditedOpportunity({...editedOpportunity, expectedCloseDate: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                <p className="text-sm text-gray-500 mt-1">{new Date(opportunity.createdAt).toLocaleDateString()} (read-only)</p>
              </div>
            </div>
          </div>
          
          <DialogFooter style={{ marginTop: '24px' }}>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDetailsDialog(false);
                setEditedOpportunity({
                  title: '',
                  description: '',
                  stage: '',
                  status: '',
                  type: '',
                  location: '',
                  estimatedValue: '',
                  probability: '',
                  expectedCloseDate: ''
                });
              }}
              className="text-[#282A3F] border-[#282A3F]"
              style={{ padding: '8px 16px', marginRight: '12px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const updatedData = {
                    ...editedOpportunity,
                    estimatedValue: editedOpportunity.estimatedValue ? parseFloat(editedOpportunity.estimatedValue) : null,
                    probability: editedOpportunity.probability ? parseFloat(editedOpportunity.probability) : null
                  };
                  
                  console.log('Saving opportunity data:', updatedData);
                  console.log('Selected customers:', selectedCustomerIds);
                  console.log('Selected partners:', selectedPartnerIds);
                  
                  // Note: Add API call here when backend endpoint is available
                  // await apiRequest(`/api/${environment?.id}/opportunities/${id}`, {
                  //   method: 'PATCH',
                  //   body: JSON.stringify(updatedData)
                  // });
                  
                  toast({
                    title: "Success",
                    description: "Opportunity details saved successfully.",
                  });
                  
                  setShowDetailsDialog(false);
                  // Invalidate opportunity query to refresh data
                  // queryClient.invalidateQueries(['/api/opportunities', id]);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to save opportunity details.",
                    variant: "destructive",
                  });
                }
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