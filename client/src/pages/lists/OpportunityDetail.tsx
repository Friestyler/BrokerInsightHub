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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { ChevronLeft, ChevronDown, ExternalLink, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";

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

// Mock metrics data
const metrics = [
  {
    id: 1,
    name: "Discovery Call Completion",
    target: "100%",
    current: "100%",
    progress: 100,
    status: "Complete"
  },
  {
    id: 2,
    name: "Requirements Documentation",
    target: "100%",
    current: "75%",
    progress: 75,
    status: "In Progress"
  },
  {
    id: 3,
    name: "Stakeholder Alignment",
    target: "100%",
    current: "50%",
    progress: 50,
    status: "In Progress"
  },
  {
    id: 4,
    name: "Budget Approval",
    target: "100%",
    current: "25%",
    progress: 25,
    status: "At Risk"
  },
  {
    id: 5,
    name: "Contract Preparation",
    target: "100%",
    current: "0%",
    progress: 0,
    status: "Not Started"
  }
];

// Helper function to format amounts as currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Helper function to determine the status badge variant based on stage
function getStatusBadgeVariant(status: string): string {
  switch (status) {
    case "Qualification":
      return "bg-purple-100 text-purple-800";
    case "Discovery":
      return "bg-blue-100 text-blue-800";
    case "Proposal":
      return "bg-indigo-100 text-indigo-800";
    case "Negotiation":
      return "bg-amber-100 text-amber-800";
    case "Closed Won":
      return "bg-green-100 text-green-800";
    case "Closed Lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Helper function to format dates
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
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
      {/* Header with opportunity name and details - restructured as requested */}
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
                    
                    {/* Details Button - Using FontAwesome icon */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-md flex items-center justify-center bg-gray-800"
                    >
                      <FontAwesomeIcon 
                        icon={faAddressCard} 
                        className="text-white" 
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
            </div>
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
              <span className="font-medium">{selectedMetrics.length} metrics selected</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Bulk Update</Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">Delete</Button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedMetrics.length === metrics.length && metrics.length > 0} 
                    onCheckedChange={toggleAllMetrics}
                  />
                </TableHead>
                <TableHead>Metric Name</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell>{metric.target}</TableCell>
                  <TableCell>{metric.current}</TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Progress value={metric.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      metric.status === "Complete" ? "bg-green-100 text-green-800" :
                      metric.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      metric.status === "At Risk" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {metric.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Tabs Section for Additional Details */}
      <div className="mt-8">
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium mb-2">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                    JS
                  </div>
                  <div>
                    <p className="text-sm font-medium">Jane Smith added a note</p>
                    <p className="text-sm text-gray-600">Customer confirmed budget approval process is starting.</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    RH
                  </div>
                  <div>
                    <p className="text-sm font-medium">Robert Harris updated the probability</p>
                    <p className="text-sm text-gray-600">Changed from 50% to 60%</p>
                    <p className="text-xs text-gray-500 mt-1">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <div className="bg-white p-4 rounded-md border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Documents</h3>
                <Button size="sm" variant="outline">Upload Document</Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Proposal_Draft_v3.pdf</span>
                  </div>
                  <span className="text-xs text-gray-500">Added 2 weeks ago</span>
                </div>
                
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Cost_Analysis_Spreadsheet.xlsx</span>
                  </div>
                  <span className="text-xs text-gray-500">Added 3 weeks ago</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4">
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium mb-4">Key Contacts</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border rounded-md">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">CTO, SARP Groupe</p>
                    <p className="text-sm text-indigo-600">john.doe@example.com</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      AS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-gray-600">Procurement Manager, SARP Groupe</p>
                    <p className="text-sm text-indigo-600">alice.smith@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div className="bg-white p-4 rounded-md border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Notes</h3>
                <Button size="sm" variant="outline">Add Note</Button>
              </div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Initial Discovery Call Notes</p>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Customer expressed interest in our Product B solution. Main pain points: current system is slow and doesn't integrate well with their existing tech stack. Budget is a potential concern, but they're willing to invest in the right solution.</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Follow-up Meeting Summary</p>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Demonstrated the integration capabilities of Product B. Customer was impressed with the performance improvements. They'll be starting the internal budget approval process next week. We should prepare a detailed ROI analysis to support their case.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}