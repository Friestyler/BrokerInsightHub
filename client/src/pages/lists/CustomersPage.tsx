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

// Sample data for customer entities
const mockCustomers = [
  {
    id: 1,
    name: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    industry: "Manufacturing",
    size: "enterprise",
    status: "active",
    products: 5,
    opportunities: 2,
    initials: "AC",
  },
  {
    id: 2,
    name: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    industry: "Technology",
    size: "large",
    status: "active",
    products: 3,
    opportunities: 1,
    initials: "GI",
  },
  {
    id: 3,
    name: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    industry: "Energy",
    size: "enterprise",
    status: "active",
    products: 8,
    opportunities: 3,
    initials: "SE",
  },
  {
    id: 4,
    name: "Umbrella Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    industry: "Pharmaceuticals",
    size: "large",
    status: "inactive",
    products: 2,
    opportunities: 0,
    initials: "UC",
  },
  {
    id: 5,
    name: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    industry: "Transportation",
    size: "medium",
    status: "active",
    products: 4,
    opportunities: 1,
    initials: "OA",
  },
];

// Table view for customers
function CustomersTable() {
  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Customer</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Products</TableHead>
            <TableHead className="text-center">Opportunities</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                    <AvatarFallback>{customer.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Link 
                  href={`/lists/partners/${customer.partnerId}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {customer.partnerName}
                </Link>
              </TableCell>
              <TableCell>{customer.industry}</TableCell>
              <TableCell>
                <span className="capitalize">{customer.size}</span>
              </TableCell>
              <TableCell>
                <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                  {customer.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{customer.products}</TableCell>
              <TableCell className="text-center">{customer.opportunities}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/lists/customers/${customer.id}`}>
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

// Card view for customers
function CustomersCardView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockCustomers.map((customer) => (
        <Card key={customer.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3 bg-indigo-100 text-indigo-600">
                  <AvatarFallback>{customer.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize text-xs mt-1">
                    {customer.status}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm text-gray-500">Partner</div>
                <Link 
                  href={`/lists/partners/${customer.partnerId}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                >
                  {customer.partnerName}
                </Link>
              </div>
              <div className="flex gap-4 text-sm mb-3">
                <div>
                  <div className="text-gray-500">Industry</div>
                  <div>{customer.industry}</div>
                </div>
                <div>
                  <div className="text-gray-500">Size</div>
                  <div className="capitalize">{customer.size}</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{customer.products}</span>
                  <span className="text-gray-600 ml-1">products</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">{customer.opportunities}</span>
                  <span className="text-gray-600 ml-1">opportunities</span>
                </div>
              </div>
            </div>
            <div className="border-t p-3 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lists/customers/${customer.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CustomersPage() {
  const { environment } = useEnvironment();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  const filterOptions = [
    { label: 'All Customers', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Enterprise', value: 'enterprise' },
    { label: 'Large', value: 'large' },
    { label: 'Medium', value: 'medium' },
    { label: 'Small', value: 'small' },
  ];
  
  const sortOptions = [
    { label: 'Recently Added', value: 'recent' },
    { label: 'Alphabetical (A-Z)', value: 'alpha_asc' },
    { label: 'Most Products', value: 'products_desc' },
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
      title="Customers"
      description="Manage your end clients and their product portfolio"
      entityName="Customer"
      createPath="/lists/customers/new"
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      viewOptions={viewOptions}
    >
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <Button 
            variant={viewType === 'table' ? 'default' : 'outline'} 
            size="sm"
            className={viewType === 'table' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            onClick={() => setViewType('table')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
            </svg>
            Table
          </Button>
          <Button 
            variant={viewType === 'cards' ? 'default' : 'outline'} 
            size="sm"
            className={`ml-0.5 ${viewType === 'cards' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            onClick={() => setViewType('cards')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            Cards
          </Button>
        </div>
      </div>
      
      {viewType === 'table' ? <CustomersTable /> : <CustomersCardView />}
    </ListLayout>
  );
}