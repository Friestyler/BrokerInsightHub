import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Users, Target } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("partners");

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
              <Link href="/opportunities">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Opportunities
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
                <p className="text-sm text-gray-500">
                  {opportunity.status} • {opportunity.stage}
                </p>
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
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("partners")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "partners"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Partners ({relatedPartners?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Customers ({relatedCustomers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                      <Link href={`/partners/${partner.id}`}>
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
      </div>
    </div>
  );
}