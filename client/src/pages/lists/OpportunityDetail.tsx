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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  ChevronLeft,
  CalendarClock,
  Layers,
  DollarSign,
  PieChart,
  Users,
  Building,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Tag,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type MetricStatus = "on_track" | "at_risk" | "off_track";

interface Metric {
  id: number;
  title: string;
  status: MetricStatus;
  progress: number;
  dueDate: Date;
  owner: string;
  ownerInitials: string;
  targetValue: number;
  realizedValue: number;
  unit: string;
  tags: string[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  user: string;
  userInitials: string;
  timestamp: Date;
}

// Mock opportunity for this example
const opportunity = {
  id: 1,
  name: "Property Insurance Renewal",
  customer: "Acme Corporation",
  customerInitials: "AC",
  partner: "ABC Insurance Brokers",
  partnerInitials: "AB",
  type: "Renewal",
  status: "In Progress",
  value: 125000,
  probability: 75,
  dueDate: new Date("2025-06-15"),
  createdAt: new Date("2025-01-10"),
  updatedAt: new Date("2025-05-01"),
  assignedTo: "Richard Newman",
  assignedToInitials: "RN",
  description: "Annual renewal of property insurance coverage for Acme Corporation's manufacturing facilities. The client is considering expanding coverage to include additional cyber protection elements.",
  notes: [
    {
      id: 1,
      text: "Client requested quote for additional cyber coverage",
      createdBy: "Richard Newman",
      createdByInitials: "RN",
      createdAt: new Date("2025-04-15")
    },
    {
      id: 2,
      text: "Sent updated proposal with cyber coverage options",
      createdBy: "Maria Johnson",
      createdByInitials: "MJ",
      createdAt: new Date("2025-04-20")
    },
    {
      id: 3,
      text: "Client is reviewing the proposal, follow-up scheduled for May 10",
      createdBy: "Richard Newman",
      createdByInitials: "RN",
      createdAt: new Date("2025-04-25")
    }
  ],
  contactHistory: [
    {
      id: 1,
      type: "Email",
      description: "Initial renewal notification",
      date: new Date("2025-03-10")
    },
    {
      id: 2,
      type: "Call",
      description: "Discussed coverage options and potential changes",
      date: new Date("2025-03-25")
    },
    {
      id: 3,
      type: "Meeting",
      description: "On-site facility inspection and coverage review",
      date: new Date("2025-04-15")
    }
  ],
  documents: [
    {
      id: 1,
      name: "Current Policy.pdf",
      size: "2.4 MB",
      uploadedBy: "Richard Newman",
      uploadedAt: new Date("2025-03-15")
    },
    {
      id: 2,
      name: "Renewal Proposal.pdf",
      size: "1.8 MB",
      uploadedBy: "Maria Johnson",
      uploadedAt: new Date("2025-04-20")
    },
    {
      id: 3,
      name: "Facility Inspection Report.pdf",
      size: "3.5 MB",
      uploadedBy: "Richard Newman",
      uploadedAt: new Date("2025-04-15")
    }
  ]
};

// Sample metrics
const metrics: Metric[] = [
  {
    id: 1,
    title: "Response time to customer inquiries",
    status: "on_track",
    progress: 90,
    dueDate: new Date("2025-06-15"),
    owner: "Richard Newman",
    ownerInitials: "RN",
    targetValue: 24,
    realizedValue: 18,
    unit: "hours",
    tags: ["Customer", "Service", "Response"]
  },
  {
    id: 2,
    title: "Documentation completion rate",
    status: "at_risk",
    progress: 65,
    dueDate: new Date("2025-05-30"),
    owner: "Maria Johnson",
    ownerInitials: "MJ",
    targetValue: 100,
    realizedValue: 65,
    unit: "percentage",
    tags: ["Documentation", "Compliance"]
  },
  {
    id: 3,
    title: "Customer satisfaction score",
    status: "on_track",
    progress: 85,
    dueDate: new Date("2025-06-15"),
    owner: "Richard Newman",
    ownerInitials: "RN",
    targetValue: 90,
    realizedValue: 85,
    unit: "percentage",
    tags: ["Customer", "Satisfaction", "Quality"]
  }
];

// Activity log
const activities: Activity[] = [
  {
    id: 1,
    type: "note",
    description: "Added a new note about client requirements",
    user: "Richard Newman",
    userInitials: "RN",
    timestamp: new Date("2025-05-01T14:30:00")
  },
  {
    id: 2,
    type: "document",
    description: "Uploaded Renewal Proposal.pdf",
    user: "Maria Johnson",
    userInitials: "MJ",
    timestamp: new Date("2025-04-20T10:15:00")
  },
  {
    id: 3,
    type: "contact",
    description: "Scheduled on-site meeting with client",
    user: "Richard Newman",
    userInitials: "RN",
    timestamp: new Date("2025-04-10T09:45:00")
  },
  {
    id: 4,
    type: "status",
    description: "Changed status from 'Qualification' to 'In Progress'",
    user: "Richard Newman",
    userInitials: "RN",
    timestamp: new Date("2025-03-28T16:20:00")
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
  switch (status) {
    case "Qualification":
      return "bg-purple-100 text-purple-800";
    case "In Progress":
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

// Metric status icon component
function MetricStatusIcon({ status }: { status: MetricStatus }) {
  switch (status) {
    case "on_track":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "at_risk":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "off_track":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
}

// Tag badge component
const TagBadge = ({ tag }: { tag: string }) => {
  // Get a consistent color for each tag based on a simple hash function
  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
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
      "Website": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Campaign": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      "Brand": "bg-red-100 text-red-800 border-red-200",
      "Customer": "bg-teal-100 text-teal-800 border-teal-200",
      "Support": "bg-slate-100 text-slate-800 border-slate-200",
      "Service": "bg-gray-100 text-gray-800 border-gray-200",
      "Quality": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Response": "bg-blue-100 text-blue-800 border-blue-200",
      "Satisfaction": "bg-green-100 text-green-800 border-green-200",
      "Compliance": "bg-red-100 text-red-800 border-red-200",
      "Documentation": "bg-amber-100 text-amber-800 border-amber-200",
    };
    
    return tagColors[tag] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 mb-1 ${getTagColor(tag)}`}>
      {tag}
    </span>
  );
};

// Opportunity detail component
export default function OpportunityDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{opportunity.name}</h1>
            <div className="flex items-center mt-1 text-gray-500">
              <Building className="h-4 w-4 mr-1" />
              <span className="mr-4 text-indigo-600">{opportunity.customer}</span>
              <Briefcase className="h-4 w-4 mr-1" />
              <span className="text-indigo-600">{opportunity.partner}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">Edit</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Add Note</Button>
          </div>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Left card: Basic information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{opportunity.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(opportunity.status)}`}>
                  {opportunity.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{formatDate(opportunity.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span>{formatDate(opportunity.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Owner</span>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                      {opportunity.assignedToInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{opportunity.assignedTo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Middle card: Financials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Value</span>
                <span className="text-xl font-semibold">{formatCurrency(opportunity.value)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Probability</span>
                  <span className="font-medium">{opportunity.probability}%</span>
                </div>
                <Progress value={opportunity.probability} className="h-2" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weighted Value</span>
                <span className="font-medium">{formatCurrency(opportunity.value * opportunity.probability / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Close Date</span>
                <span className="font-medium">{formatDate(opportunity.dueDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right card: Related entities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Related Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 block mb-2">Customer</span>
                <Link href="/lists/customers/1">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-indigo-100 text-indigo-800">
                        {opportunity.customerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium block">{opportunity.customer}</span>
                      <span className="text-sm text-gray-500">Manufacturing</span>
                    </div>
                  </div>
                </Link>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-gray-500 block mb-2">Partner</span>
                <Link href="/lists/partners/1">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-indigo-100 text-indigo-800">
                        {opportunity.partnerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium block">{opportunity.partner}</span>
                      <span className="text-sm text-gray-500">Insurance Broker</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different opportunity views */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>Overview</TabsTrigger>
          <TabsTrigger value="metrics" onClick={() => setActiveTab("metrics")}>Metrics</TabsTrigger>
          <TabsTrigger value="activity" onClick={() => setActiveTab("activity")}>Activity</TabsTrigger>
          <TabsTrigger value="documents" onClick={() => setActiveTab("documents")}>Documents</TabsTrigger>
        </TabsList>
        
        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{opportunity.description}</p>
                </CardContent>
              </Card>
              
              {/* Notes */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Notes</CardTitle>
                    <CardDescription>Recent notes and updates</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunity.notes.map((note) => (
                    <div key={note.id} className="flex p-3 border border-gray-100 rounded-md">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                          {note.createdByInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-sm">{note.createdBy}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{note.text}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {/* Contact History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact History</CardTitle>
                  <CardDescription>Recent customer interactions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {opportunity.contactHistory.map((contact) => (
                      <div key={contact.id} className="p-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{contact.type}</span>
                          <span className="text-sm text-gray-500">{formatDate(contact.date)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{contact.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Metrics tab */}
        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Opportunity Metrics</CardTitle>
                <CardDescription>Performance metrics and KPIs</CardDescription>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Assign Template
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium">{metric.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MetricStatusIcon status={metric.status} />
                          <span className="ml-2 capitalize">{metric.status.replace('_', ' ')}</span>
                        </div>
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
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                              {metric.ownerInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{metric.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap">
                          {metric.tags.map((tag, i) => (
                            <TagBadge key={i} tag={tag} />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
              <CardDescription>Recent activity and changes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 flex">
                    <div className="mr-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                          {activity.userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Documents</CardTitle>
                <CardDescription>Files related to this opportunity</CardDescription>
              </div>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunity.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                        {doc.name}
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}