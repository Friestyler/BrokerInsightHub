import { useState } from 'react';
import ListLayout from "@/components/lists/ListLayout";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// Mock data - will be replaced with API calls
const mockPartners = [
  {
    id: 1,
    name: "ABC Insurance Brokers",
    segment: "broker",
    address: "123 Main St, New York, NY",
    customers: 42,
    opportunities: 12,
    initials: "AB",
  },
  {
    id: 2,
    name: "XYZ Consulting Group",
    segment: "consultant",
    address: "456 Market Ave, San Francisco, CA",
    customers: 27,
    opportunities: 8,
    initials: "XC",
  },
  {
    id: 3,
    name: "Global Risk Partners",
    segment: "broker",
    address: "789 Finance Blvd, Chicago, IL",
    customers: 63,
    opportunities: 19,
    initials: "GR",
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    segment: "agent",
    address: "321 High St, Boston, MA",
    customers: 18,
    opportunities: 5,
    initials: "PI",
  },
  {
    id: 5,
    name: "Summit Risk Advisors",
    segment: "consultant",
    address: "555 Tech Park, Seattle, WA",
    customers: 34,
    opportunities: 11,
    initials: "SR",
  },
];

// Table view for partners
function PartnersTable() {
  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Partner</TableHead>
            <TableHead>Segment</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Customers</TableHead>
            <TableHead className="text-center">Opportunities</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPartners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                    <AvatarFallback>{partner.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{partner.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {partner.segment}
                </Badge>
              </TableCell>
              <TableCell>{partner.address}</TableCell>
              <TableCell className="text-center">{partner.customers}</TableCell>
              <TableCell className="text-center">{partner.opportunities}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/lists/partners/${partner.id}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Card view for partners
function PartnersCardView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockPartners.map((partner) => (
        <Card key={partner.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3 bg-indigo-100 text-indigo-600">
                  <AvatarFallback>{partner.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{partner.name}</h3>
                  <Badge variant="outline" className="capitalize text-xs mt-1">
                    {partner.segment}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{partner.address}</p>
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <span className="font-medium text-gray-900">{partner.customers}</span>
                  <span className="text-gray-600 ml-1">customers</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">{partner.opportunities}</span>
                  <span className="text-gray-600 ml-1">opportunities</span>
                </div>
              </div>
            </div>
            <div className="border-t p-3 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lists/partners/${partner.id}`}>
                  View Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PartnersPage() {
  const { environment } = useEnvironment();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  const filterOptions = [
    { label: 'All Partners', value: 'all' },
    { label: 'Brokers', value: 'broker' },
    { label: 'Agents', value: 'agent' },
    { label: 'Consultants', value: 'consultant' },
  ];
  
  const sortOptions = [
    { label: 'Recently Added', value: 'recent' },
    { label: 'Alphabetical (A-Z)', value: 'alpha_asc' },
    { label: 'Most Customers', value: 'customers_desc' },
    { label: 'Most Opportunities', value: 'opportunities_desc' },
  ];
  
  const viewOptions = [
    { 
      label: 'Table View', 
      value: 'table',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
        </svg>
      )
    },
    { 
      label: 'Card View', 
      value: 'cards',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      )
    },
  ];
  
  return (
    <ListLayout
      title="Partners"
      description="Manage your broker, agent, and consultant relationships"
      entityName="Partner"
      createPath="/lists/partners/new"
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      viewOptions={viewOptions}
    >
      {viewType === 'table' ? <PartnersTable /> : <PartnersCardView />}
    </ListLayout>
  );
}