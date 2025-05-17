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
import { format } from "date-fns";

// Sample data for opportunity entities
const mockOpportunities = [
  {
    id: 1,
    title: "Commercial Property Insurance",
    description: "Cross-sell commercial property coverage to supplement existing liability policy",
    status: "open",
    owner: "John Smith",
    ownerId: 1,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    productMissing: "Commercial Property Insurance",
    estimatedValue: 12500,
    probability: 75,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 4, 10),
    source: "campaign",
    tags: ["commercial", "property", "high-priority"],
  },
  {
    id: 2,
    title: "Fleet Vehicle Coverage",
    description: "Add coverage for the newly acquired delivery fleet",
    status: "in_progress",
    owner: "Sarah Johnson",
    ownerId: 2,
    customerId: 1,
    customerName: "Acme Corporation",
    partnerId: 1,
    partnerName: "ABC Insurance Brokers",
    productMissing: "Commercial Auto Insurance",
    estimatedValue: 8750,
    probability: 60,
    createdAt: new Date(2025, 4, 2),
    updatedAt: new Date(2025, 4, 12),
    source: "manual",
    tags: ["auto", "fleet", "expansion"],
  },
  {
    id: 3,
    title: "Directors & Officers Insurance",
    description: "D&O coverage for newly appointed board members",
    status: "won",
    owner: "Michael Lee",
    ownerId: 3,
    customerId: 3,
    customerName: "Stark Enterprises",
    partnerId: 2,
    partnerName: "XYZ Consulting Group",
    productMissing: "Directors & Officers Insurance",
    estimatedValue: 18000,
    probability: 100,
    createdAt: new Date(2025, 2, 20),
    updatedAt: new Date(2025, 4, 5),
    source: "wizard",
    tags: ["liability", "executive", "governance"],
  },
  {
    id: 4,
    title: "Cyber Security Insurance",
    description: "Protection against growing cyber threats in the technology sector",
    status: "lost",
    owner: "Emily Chen",
    ownerId: 4,
    customerId: 2,
    customerName: "Globex Industries",
    partnerId: 3,
    partnerName: "Global Risk Partners",
    productMissing: "Cyber Security Insurance",
    estimatedValue: 22000,
    probability: 0,
    createdAt: new Date(2025, 1, 15),
    updatedAt: new Date(2025, 3, 25),
    source: "campaign",
    tags: ["cyber", "technology", "digital-risk"],
  },
  {
    id: 5,
    title: "Business Interruption Coverage",
    description: "Coverage for potential business disruptions",
    status: "open",
    owner: "James Wilson",
    ownerId: 5,
    customerId: 5,
    customerName: "Oceanic Airlines",
    partnerId: 4,
    partnerName: "Premier Insurance Agency",
    productMissing: "Business Interruption Insurance",
    estimatedValue: 15000,
    probability: 40,
    createdAt: new Date(2025, 4, 1),
    updatedAt: new Date(2025, 4, 1),
    source: "manual",
    tags: ["continuity", "operations", "disaster-recovery"],
  },
];

// Get the appropriate badge color for opportunity status
function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
    case 'won':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Won</Badge>;
    case 'lost':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Lost</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Format currency values
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Table view for opportunities
function OpportunitiesTable() {
  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Opportunity</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOpportunities.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium text-gray-900">{opportunity.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[280px]">{opportunity.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <Link 
                  href={`/lists/customers/${opportunity.customerId}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {opportunity.customerName}
                </Link>
              </TableCell>
              <TableCell>
                <Link 
                  href={`/lists/partners/${opportunity.partnerId}`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {opportunity.partnerName}
                </Link>
              </TableCell>
              <TableCell>
                {getStatusBadge(opportunity.status)}
              </TableCell>
              <TableCell>
                {formatCurrency(opportunity.estimatedValue)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        opportunity.probability >= 70 ? 'bg-green-500' : 
                        opportunity.probability >= 40 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${opportunity.probability}%` }}
                    ></div>
                  </div>
                  <span>{opportunity.probability}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/lists/opportunities/${opportunity.id}`}>
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

// Card view for opportunities
function OpportunitiesCardView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockOpportunities.map((opportunity) => (
        <Card key={opportunity.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                {getStatusBadge(opportunity.status)}
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Customer</div>
                  <Link 
                    href={`/lists/customers/${opportunity.customerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    {opportunity.customerName}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Partner</div>
                  <Link 
                    href={`/lists/partners/${opportunity.partnerId}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    {opportunity.partnerName}
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Est. Value</div>
                  <div className="font-semibold">{formatCurrency(opportunity.estimatedValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Probability</div>
                  <div className="flex items-center">
                    <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          opportunity.probability >= 70 ? 'bg-green-500' : 
                          opportunity.probability >= 40 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${opportunity.probability}%` }}
                      ></div>
                    </div>
                    <span>{opportunity.probability}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {opportunity.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                Created {format(opportunity.createdAt, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="border-t p-3 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lists/opportunities/${opportunity.id}`}>
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

export default function OpportunitiesPage() {
  const { environment } = useEnvironment();
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  const filterOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
    { label: 'High Probability (70%+)', value: 'high_probability' },
    { label: 'High Value ($10k+)', value: 'high_value' },
  ];
  
  const sortOptions = [
    { label: 'Recently Updated', value: 'recent' },
    { label: 'Highest Value', value: 'value_desc' },
    { label: 'Highest Probability', value: 'probability_desc' },
    { label: 'Oldest First', value: 'created_asc' },
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
      title="Opportunities"
      description="Manage cross-sell and upsell opportunities for your customers"
      entityName="Opportunity"
      createPath="/lists/opportunities/new"
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      viewOptions={viewOptions}
    >
      {viewType === 'table' ? <OpportunitiesTable /> : <OpportunitiesCardView />}
    </ListLayout>
  );
}