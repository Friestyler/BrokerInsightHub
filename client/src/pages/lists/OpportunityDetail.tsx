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

// Mock opportunity data
const opportunity = {
  id: 1,
  name: "Product B - SARP Groupe",
  description: "Objective to install B to help SARP Group with XYZ",
  amount: 2120000,
  probability: 60,
  stage: "Discovery",
  customer: {
    id: 1,
    name: "SARP Groupe",
    link: "/lists/customers/1"
  },
  partners: [
    {
      id: 1,
      name: "Computacenter",
      link: "/lists/partners/1"
    },
    {
      id: 2,
      name: "Deloitte",
      link: "/lists/partners/2"
    }
  ],
  owner: {
    name: "Lenny K.",
    initials: "LK"
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
      "Approval": "bg-red-100 text-red-800 border-red-200"
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