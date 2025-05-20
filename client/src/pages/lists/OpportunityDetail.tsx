import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
// Opportunity data map - this would typically come from an API or context
// This allows for consistent naming across the application
interface OpportunityData {
  id: number;
  name: string;
  description: string;
  amount: number;
  probability: number;
  stage: string;
  customer: {
    id: number;
    name: string;
    link: string;
  };
  partners: Array<{
    id: number;
    name: string;
    link: string;
  }>;
  owner: {
    id: number;
    name: string;
    initials: string;
  };
  expectedCloseDate: string;
}

const opportunityDataMap: Record<string, OpportunityData> = {
  "1": {
    id: 1,
    name: "Property Insurance Renewal",
    description: "Annual renewal of property insurance policy for Acme Corporation",
    amount: 125000,
    probability: 80,
    stage: "In Progress",
    customer: {
      id: 1,
      name: "Acme Corporation",
      link: "/lists/clients/1"
    },
    partners: [
      {
        id: 2,
        name: "ABC Insurance Brokers",
        link: "/lists/partners/2"
      }
    ],
    owner: {
      id: 1,
      name: "Sarah Johnson",
      initials: "SJ"
    },
    expectedCloseDate: "2025-06-15"
  },
  "2": {
    id: 2,
    name: "Cyber Security Coverage",
    description: "New cyber security insurance policy for improved digital protection",
    amount: 75000,
    probability: 40,
    stage: "Qualification",
    customer: {
      id: 1,
      name: "Acme Corporation",
      link: "/lists/clients/1"
    },
    partners: [
      {
        id: 2,
        name: "ABC Insurance Brokers",
        link: "/lists/partners/2"
      }
    ],
    owner: {
      id: 2,
      name: "Michael Chen",
      initials: "MC"
    },
    expectedCloseDate: "2025-07-30"
  },
  "3": {
    id: 3,
    name: "D&O Insurance",
    description: "Directors and Officers liability insurance for Globex Industries",
    amount: 150000,
    probability: 60,
    stage: "Proposal",
    customer: {
      id: 2,
      name: "Globex Industries",
      link: "/lists/clients/2"
    },
    partners: [
      {
        id: 3,
        name: "Global Insurance Partners",
        link: "/lists/partners/3"
      }
    ],
    owner: {
      id: 3,
      name: "Emma Wilson",
      initials: "EW"
    },
    expectedCloseDate: "2025-06-01"
  },
  "4": {
    id: 4,
    name: "Group Health Insurance",
    description: "Comprehensive group health insurance for Stark Enterprises employees",
    amount: 225000,
    probability: 70,
    stage: "Negotiation",
    customer: {
      id: 3,
      name: "Stark Enterprises",
      link: "/lists/clients/3"
    },
    partners: [
      {
        id: 1,
        name: "XYZ Insurance Group",
        link: "/lists/partners/1"
      }
    ],
    owner: {
      id: 4,
      name: "Robert Smith",
      initials: "RS"
    },
    expectedCloseDate: "2025-07-01"
  },
  "5": {
    id: 5,
    name: "Workers Compensation",
    description: "Workers compensation policy for Umbrella Corporation employees",
    amount: 80000,
    probability: 0,
    stage: "Closed Lost",
    customer: {
      id: 4,
      name: "Umbrella Corporation",
      link: "/lists/clients/3"
    },
    partners: [
      {
        id: 2,
        name: "ABC Insurance Brokers",
        link: "/lists/partners/2"
      }
    ],
    owner: {
      id: 1,
      name: "Sarah Johnson",
      initials: "SJ"
    },
    expectedCloseDate: "2025-05-15"
  },
  "6": {
    id: 6,
    name: "Professional Liability",
    description: "Professional liability coverage for Oceanic Airlines staff",
    amount: 95000,
    probability: 100,
    stage: "Closed Won",
    customer: {
      id: 5,
      name: "Oceanic Airlines",
      link: "/lists/clients/5"
    },
    partners: [
      {
        id: 4,
        name: "Premier Insurance Agency",
        link: "/lists/partners/4"
      }
    ],
    owner: {
      id: 4,
      name: "John Davis",
      initials: "JD"
    },
    expectedCloseDate: "2025-04-01"
  },
  "7": {
    id: 7,
    name: "Product Liability Insurance",
    description: "Product liability coverage for Wayne Enterprises manufacturing",
    amount: 110000,
    probability: 20,
    stage: "Discovery",
    customer: {
      id: 6,
      name: "Wayne Enterprises",
      link: "/lists/clients/6"
    },
    partners: [
      {
        id: 1,
        name: "XYZ Insurance Group",
        link: "/lists/partners/1"
      }
    ],
    owner: {
      id: 2,
      name: "Michael Chen",
      initials: "MC"
    },
    expectedCloseDate: "2025-08-15"
  }
};
// Mock metrics data for this opportunity
const metrics = [
  {
    id: 1,
    title: "New contracts signed",
    status: "on_track",
    progress: 75,
    dueDate: new Date("2025-06-30"),
    targetValue: 1,
    realizedValue: 0,
    unit: "contracts",
    tags: ["Sales", "Contract"]
  },
  {
    id: 2,
    title: "Client meetings conducted",
    status: "on_track",
    progress: 100,
    dueDate: new Date("2025-05-15"),
    targetValue: 3,
    realizedValue: 3,
    unit: "meetings",
    tags: ["Client", "Meeting"]
  },
  {
    id: 3,
    title: "Requirements documentation completion",
    status: "at_risk",
    progress: 60,
    dueDate: new Date("2025-05-20"),
    targetValue: 100,
    realizedValue: 60,
    unit: "%",
    tags: ["Documentation", "Requirements"]
  },
  {
    id: 4,
    title: "Technical proposal submission",
    status: "not_started",
    progress: 0,
    dueDate: new Date("2025-06-10"),
    targetValue: 1,
    realizedValue: 0,
    unit: "proposals",
    tags: ["Proposal", "Technical"]
  },
  {
    id: 5,
    title: "Budget approval",
    status: "not_started",
    progress: 0,
    dueDate: new Date("2025-06-20"),
    targetValue: 1,
    realizedValue: 0,
    unit: "approvals",
    tags: ["Budget", "Approval"]
  }
];

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

// Status badge variant helper
function getStatusBadgeVariant(status: string): string {
  const statusClasses: {[key: string]: string} = {
    "on_track": "bg-green-100 text-green-800",
    "at_risk": "bg-amber-100 text-amber-800",
    "off_track": "bg-red-100 text-red-800",
    "not_started": "bg-gray-100 text-gray-800",
    "completed": "bg-blue-100 text-blue-800",
    "Discovery": "bg-indigo-100 text-indigo-800",
    "Qualification": "bg-purple-100 text-purple-800",
    "Proposal": "bg-amber-100 text-amber-800",
    "Negotiation": "bg-blue-100 text-blue-800",
    "Closed Won": "bg-green-100 text-green-800",
    "Closed Lost": "bg-red-100 text-red-800"
  };
  
  return statusClasses[status] || "bg-gray-100 text-gray-800";
}

// Tag badge component
const TagBadge = ({ tag }: { tag: string }) => {
  // Get a consistent color for each tag
  const getTagColor = (tag: string) => {
    const tagColors: {[key: string]: string} = {
      "Financial": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Revenue": "bg-green-100 text-green-800 border-green-200",
      "Partner": "bg-blue-100 text-blue-800 border-blue-200",
      "Pipeline": "bg-amber-100 text-amber-800 border-amber-200",
      "Sales": "bg-orange-100 text-orange-800 border-orange-200",
      "Training": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Certification": "bg-violet-100 text-violet-800 border-violet-200",
      "People": "bg-pink-100 text-pink-800 border-pink-200",
      "Marketing": "bg-purple-100 text-purple-800 border-purple-200",
      "Budget": "bg-lime-100 text-lime-800 border-lime-200",
      "Digital": "bg-sky-100 text-sky-800 border-sky-200",
      "Contract": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Proposal": "bg-amber-100 text-amber-800 border-amber-200",
      "Technical": "bg-blue-100 text-blue-800 border-blue-200",
      "Client": "bg-teal-100 text-teal-800 border-teal-200",
      "Meeting": "bg-slate-100 text-slate-800 border-slate-200",
      "Documentation": "bg-gray-100 text-gray-800 border-gray-200",
      "Requirements": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Approval": "bg-red-100 text-red-800 border-red-200",
    };
    
    return tagColors[tag] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getTagColor(tag)}`}>
      {tag}
    </span>
  );
};

// Date formatter
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(date));
};

// Main opportunity component
export default function OpportunityDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  // Get the opportunity data based on the ID from URL
  // In a real app, this would use a database query or API call
  const opportunity = opportunityDataMap[id as keyof typeof opportunityDataMap] || opportunityDataMap["1"];
  
  // Enhanced back navigation based on referrer
  const getBackNavigationLink = () => {
    // Parse the query string to see if we came from a specific page
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    if (fromParam) {
      // Handle various sources
      if (fromParam.startsWith('partner/')) {
        // Extract partner ID and return to that partner page
        const partnerId = fromParam.split('/')[1];
        return `/lists/partners/${partnerId}`;
      } else if (fromParam.startsWith('client/')) {
        // Extract client ID and return to that client page
        const clientId = fromParam.split('/')[1];
        return `/lists/clients/${clientId}`;
      } else if (fromParam.startsWith('dashboard')) {
        // Return to dashboard
        return `/`;
      } else if (fromParam.startsWith('customer/')) {
        // Extract customer ID and return to that customer page
        const customerId = fromParam.split('/')[1];
        return `/lists/customers/${customerId}`;
      } else if (fromParam === 'list') {
        // Return to the saved list view
        const listId = urlParams.get('listId');
        if (listId) {
          return `/lists/opportunities?list=${listId}`;
        }
      } else if (fromParam === 'opportunity_list') {
        // Return to the main opportunities list
        return `/lists/opportunities`;
      }
    }
    
    // Try to get referrer from document.referrer if no query param
    const referrer = document.referrer;
    if (referrer) {
      try {
        const url = new URL(referrer);
        const pathname = url.pathname;
        
        // Only use referrer if it's an internal page
        if (pathname && url.origin === window.location.origin) {
          return pathname + url.search;
        }
      } catch (e) {
        console.error("Error parsing referrer URL:", e);
      }
    }
    
    // Default back to opportunities list instead of customers
    return "/lists/opportunities";
  };

  // Toggle selection of a metric
  const toggleMetricSelection = (id: number) => {
    if (selectedMetrics.includes(id)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== id));
    } else {
      setSelectedMetrics([...selectedMetrics, id]);
    }
  };
  
  // Toggle all metrics
  const toggleAllMetrics = () => {
    if (selectedMetrics.length === metrics.length) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(metrics.map(m => m.id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back navigation */}
      <div className="mb-6">
        <Link href="/lists/opportunities" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Opportunities
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">{opportunity.name}</h1>
            <div className="ml-4 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                  {opportunity.owner.initials}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-gray-600">{opportunity.owner.name}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">Edit</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Actions</Button>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">{opportunity.description}</p>
      </div>
      
      {/* Key metrics section - similar to screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 mb-6">
        <div className="border-r border-gray-200 pr-6">
          <span className="text-sm text-gray-500 block">Amount</span>
          <span className="text-xl font-bold">€ {(opportunity.amount / 1000).toFixed(0)}.000</span>
        </div>
        
        <div className="border-r border-gray-200 px-6">
          <span className="text-sm text-gray-500 block">Probability</span>
          <span className="text-xl font-bold">{opportunity.probability}%</span>
        </div>
        
        <div className="pl-6">
          <span className="text-sm text-gray-500 block">Stage</span>
          <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadgeVariant(opportunity.stage)}`}>
            {opportunity.stage}
          </span>
        </div>
      </div>
      
      {/* Related records section */}
      <div className="mb-8">
        <div className="flex items-start">
          <div className="w-full">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  {/* Opportunity Name and Details Button */}
                  <div className="flex items-center gap-3">
                    <Link href={getBackNavigationLink()} className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                      <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-[20px] font-bold tracking-tight text-black">
                      {opportunity.name}
                    </h1>
                    
                    {/* Details Button - Using FontAwesome icon with improved styling */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-md flex items-center justify-center border-gray-200"
                    >
                      <FontAwesomeIcon 
                        icon={faAddressCard} 
                        className="text-indigo-600" 
                        size="xs" 
                      />
                    </Button>
                    
                    {/* Owner Information */}
                    <div className="flex items-center space-x-2 ml-3">
                      <span className="text-sm text-gray-500">Owner:</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                          {opportunity.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* Description text - positioned 10px under the record name */}
                  <div className="mt-[10px]">
                    <div className="text-gray-600 text-[14px]">
                      {opportunity.description}
                    </div>
                  </div>
                </div>
                
                {/* Right side - attribute cards and related records on the same level */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Amount Card */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Amount</div>
                      <div className="text-[16px] font-semibold text-[#282A3F]">€ {(opportunity.amount / 1000).toFixed(0)}.000</div>
                    </CardContent>
                  </Card>
                  
                  {/* Probability Card */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Probability</div>
                      <div className="text-[16px] font-semibold text-[#282A3F]">{opportunity.probability}%</div>
                    </CardContent>
                  </Card>
                  
                  {/* Stage Card */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Stage</div>
                      <div className="text-[16px] font-semibold text-[#282A3F]">{opportunity.stage}</div>
                    </CardContent>
                  </Card>
                  
                  {/* Related Records Dropdown - positioned at the end */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-[72px] flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-[#282A3F]">Related Records (3)</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Customer</h3>
                          <Link href={opportunity.customer.link} className="text-indigo-600 hover:underline flex items-center gap-1">
                            <span>{opportunity.customer.name}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Partners</h3>
                          <div className="space-y-2">
                            {opportunity.partners.map(partner => (
                              <Link 
                                key={partner.id} 
                                href={partner.link} 
                                className="text-indigo-600 hover:underline flex items-center gap-1 block"
                              >
                                <span>{partner.name}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
        <h2 className="text-base font-medium mb-3">Related Records</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <span className="text-sm text-gray-500 mr-2">Customer:</span>
              <Link href={opportunity.customer.link} className="text-indigo-600 hover:underline">
                {opportunity.customer.name}
              </Link>
            </div>
            
            {opportunity.partners.map((partner, index) => (
              <div key={partner.id}>
                <span className="text-sm text-gray-500 mr-2">Partner{opportunity.partners.length > 1 ? ` ${index + 1}` : ''}:</span>
                <Link href={partner.link} className="text-indigo-600 hover:underline">
                  {partner.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* OKR Metrics Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">OKR Metrics</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">Add Metric</Button>
          </div>
        </div>
        
        {selectedMetrics.length > 0 && (
          <div className="bg-indigo-50 rounded p-3 mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-indigo-700 font-medium mr-2">{selectedMetrics.length} metrics selected</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700 p-1 h-auto"
                onClick={() => setSelectedMetrics([])}
              >
                Clear selection
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-indigo-700">
                Assign
              </Button>
              
              <Button variant="ghost" size="sm" className="text-indigo-700">
                Change Status
              </Button>
            </div>
          </div>
        )}
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedMetrics.length === metrics.length && metrics.length > 0}
                    onCheckedChange={toggleAllMetrics}
                  />
                </TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetricSelection(metric.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{metric.title}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadgeVariant(metric.status)}`}>
                      {metric.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-[100px]">
                      <Progress value={metric.progress} className="h-2" />
                      <div className="text-xs text-right mt-1">{metric.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {metric.targetValue} {metric.unit}
                  </TableCell>
                  <TableCell>
                    {metric.realizedValue} {metric.unit}
                  </TableCell>
                  <TableCell>{formatDate(metric.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap">
                      {metric.tags.map((tag, i) => (
                        <TagBadge key={i} tag={tag} />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {metrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-gray-500">No metrics assigned to this opportunity</p>
                    <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                      Assign Metrics
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}