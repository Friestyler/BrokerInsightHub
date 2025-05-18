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

// Calculate customer statistics
function calculateCustomerStats(customers: typeof mockCustomers) {
  const totalCustomers = customers.length;
  const totalProducts = customers.reduce((sum, customer) => sum + customer.products, 0);
  const totalOpportunities = customers.reduce((sum, customer) => sum + customer.opportunities, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  
  return {
    totalCustomers,
    totalProducts,
    totalOpportunities,
    activeCustomers
  };
}

// Template badges component for customers
function TemplateBadges({ industry, size }: { industry: string, size: string }) {
  // Mock template badges based on industry and size
  const getBadges = (industry: string, size: string) => {
    if (industry === 'Manufacturing') {
      return [
        { code: 'RP', color: 'bg-blue-200 text-blue-800' },
        { code: 'CO', color: 'bg-purple-200 text-purple-800' }
      ];
    } else if (industry === 'Technology') {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (industry === 'Energy') {
      return [
        { code: 'AC', color: 'bg-teal-200 text-teal-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    } else if (industry === 'Transportation') {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' }
      ];
    } else {
      return [
        { code: 'CO', color: 'bg-purple-200 text-purple-800' },
        { code: 'RP', color: 'bg-blue-200 text-blue-800' }
      ];
    }
  };
  
  const badges = getBadges(industry, size);
  
  return (
    <div className="flex space-x-2">
      {badges.map((badge, index) => (
        <div key={index} className={`${badge.color} w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium`}>
          {badge.code}
        </div>
      ))}
    </div>
  );
}

// Table view for customers
function CustomersTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Calculate stats
  const stats = calculateCustomerStats(mockCustomers);
  
  // Function to toggle customer selection
  const toggleSelectCustomer = (id: number) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(customerId => customerId !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };
  
  // Function to select/deselect all customers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === mockCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(mockCustomers.map(customer => customer.id));
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-60">
          <input
            type="text"
            placeholder="Search by name, industry..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            onClick={() => setSelectedStatus(selectedStatus ? '' : 'active')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Status</span>
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Industry</span>
          </button>
        </div>
        
        <div className="ml-auto flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Import/Export
          </Button>
          
          <Button size="sm" className="flex items-center bg-indigo-600 hover:bg-indigo-700">
            <span className="mr-1 text-lg">+</span>
            New Customer
          </Button>
        </div>
      </div>
      
      {/* Statistics overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.activeCustomers}</div>
          <div className="text-sm text-gray-500">Active Customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalProducts}</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
      </div>
      
      {/* Table section without a border */}
      <div className="bg-white overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={selectedCustomers.length === mockCustomers.length && mockCustomers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
                <div className="flex items-center">
                  Customer
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Partner
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Industry
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Size
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Status
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Products
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Opportunities
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M8 9l4-4 4 4"></path>
                    <path d="M16 15l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Template
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className={`hover:bg-gray-50 group ${selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${selectedCustomers.includes(customer.id) ? 'visible' : 'invisible group-hover:visible'}`}
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleSelectCustomer(customer.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                      <AvatarFallback>{customer.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Link 
                    href={`/lists/partners/${customer.partnerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {customer.partnerName}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{customer.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {customer.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.products}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{customer.opportunities}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges industry={customer.industry} size={customer.size} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <a href="#" className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</a>
          <a href="#" className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{selectedCustomers.length}</span> of <span className="font-medium">{mockCustomers.length}</span> item(s) selected
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-700">
                Items per page: 
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="ml-1 rounded border-gray-300 text-indigo-600 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">1</span> of <span className="font-medium">1</span>
              </p>
            </div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">First</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Last</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Customers</h1>
      <CustomersTable />
    </div>
  );
}