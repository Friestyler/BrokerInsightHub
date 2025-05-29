import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

export default function PartnerDetailClean() {
  const { id } = useParams();

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
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{partner.name}</h1>
            <p className="text-gray-600">{partner.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Location: {partner.location}</span>
              <span>Contact: {partner.primaryContact}</span>
              <span>Email: {partner.contactEmail}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Edit</Button>
            <Button>Create Opportunity</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities ({relatedOpportunities?.length || 0})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({relatedCustomers?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-4">
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
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}