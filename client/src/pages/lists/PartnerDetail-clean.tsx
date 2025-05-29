import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function PartnerDetailClean() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("okr-plans");

  // Fetch partner data from database
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch related customers for this partner
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
    enabled: !!id,
  });

  // Fetch related opportunities for this partner
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities`],
    enabled: !!id,
  });

  if (partnersLoading || customersLoading || opportunitiesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const partner = partners?.find((p: any) => p.id === parseInt(id || '1'));
  
  if (!partner) {
    return <div className="p-4">Partner not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <Link href="/partners">
            <Button variant="ghost" size="sm" className="mr-4 p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-600">{partner.description}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Details</span>
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Partner</span>
                <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">NA</span></span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Joint action & business plan to drive growth with insurance business</p>

        {/* Custom tab styling to match design */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab("okr-plans")}
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "okr-plans" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              OKR plans
            </button>
            <button 
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "opportunities" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              Opportunities ({relatedOpportunities?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("customers")}
              className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "customers" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              Customers ({relatedCustomers?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-6">
        {activeTab === "okr-plans" && (
          <div className="text-center py-12">
            <p className="text-gray-500">OKR plans content coming soon...</p>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Customer</TableHead>
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
                      <Link href={`/lists/opportunities/${opportunity.id}`}>
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {opportunity.title}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {opportunity.clientName || 'Unknown Customer'}
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

        {activeTab === "customers" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Opportunities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedCustomers?.map((customer: any) => {
                  const customerOpportunities = relatedOpportunities?.filter((o: any) => o.clientName === customer.name) || [];
                  return (
                    <TableRow key={customer.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        <Link href={`/lists/clients/${customer.id}`}>
                          <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                            {customer.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{customer.contact_name || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_email || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_phone || 'Not set'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {customerOpportunities.length} opportunities
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}