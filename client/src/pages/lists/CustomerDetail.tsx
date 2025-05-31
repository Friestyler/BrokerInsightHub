import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Target } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("partners");

  // Fetch customer data
  const { data: customers, isLoading: customersLoading } = useQuery({
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

  if (customersLoading || partnersLoading || opportunitiesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const customer = customers?.find((c: any) => c.id === parseInt(id || '1'));
  
  if (!customer) {
    return <div className="p-4">Customer not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Customers
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {customer.initials}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                  <p className="text-sm text-gray-500">{customer.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">Edit Customer</Button>
              <Button size="sm">Create Opportunity</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("partners")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "partners"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Partners ({relatedPartners?.length || 0})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Opportunities ({relatedOpportunities?.length || 0})</span>
              </div>
            </button>
          </div>
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
                <p className="text-gray-500">No partners associated with this customer</p>
              </div>
            )}
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

            {(!relatedOpportunities || relatedOpportunities.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No opportunities associated with this customer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}