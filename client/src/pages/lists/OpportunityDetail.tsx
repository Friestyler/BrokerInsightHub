import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
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
import { mockOpportunities } from "./OpportunitiesPage";

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
      "Financial": "bg-emerald-100 text-emerald-800",
      "Revenue": "bg-green-100 text-green-800",
      "Partner": "bg-blue-100 text-blue-800",
      "Pipeline": "bg-amber-100 text-amber-800",
      "Sales": "bg-orange-100 text-orange-800",
      "Training": "bg-indigo-100 text-indigo-800",
      "Certification": "bg-violet-100 text-violet-800",
      "People": "bg-pink-100 text-pink-800",
      "Marketing": "bg-purple-100 text-purple-800",
      "Budget": "bg-lime-100 text-lime-800",
      "Digital": "bg-sky-100 text-sky-800",
      "Contract": "bg-cyan-100 text-cyan-800",
      "Proposal": "bg-amber-100 text-amber-800",
      "Technical": "bg-blue-100 text-blue-800",
      "Client": "bg-teal-100 text-teal-800",
      "Meeting": "bg-slate-100 text-slate-800",
      "Documentation": "bg-gray-100 text-gray-800",
      "Requirements": "bg-yellow-100 text-yellow-800",
      "Approval": "bg-red-100 text-red-800"
    };
    
    return tagColors[tag] || "bg-gray-100 text-gray-800";
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
  const [, setLocation] = useLocation();
  
  // Find the opportunity from the mock data source shared with the list
  const opportunity = mockOpportunities.find(opp => opp.id === Number(id));
  
  // If opportunity not found, render a not found message
  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Opportunity Not Found</h1>
          <p className="text-gray-600 mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/lists/opportunities")}>
            Return to Opportunities
          </Button>
        </div>
      </div>
    );
  }
  
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
    <div className="container mx-auto px-4 py-6 pl-8">
      {/* Header with back navigation */}
      <div className="mb-6">
        <Link href="/lists/opportunities" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Opportunities
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">{opportunity.title}</h1>
            <div className="ml-4 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                  {opportunity.ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-gray-600">{opportunity.owner}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => {
                // Here you could implement the edit functionality
                // For now, we'll just show how it would update the name
                const newName = prompt("Enter new opportunity name:", opportunity.title);
                if (newName && newName.trim() !== "") {
                  // In a real application, this would update the data in a database
                  // For our prototype, we'll update it directly in the array
                  const index = mockOpportunities.findIndex(opp => opp.id === opportunity.id);
                  if (index !== -1) {
                    mockOpportunities[index].title = newName;
                    // Force refresh the page to show the updated name
                    window.location.reload();
                  }
                }
              }}
            >
              Edit
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Actions</Button>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">Details for {opportunity.title}</p>
      </div>
      
      {/* Key metrics section - similar to screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 mb-6">
        <div className="border-r border-gray-200 pr-6">
          <span className="text-sm text-gray-500 block">Amount</span>
          <span className="text-xl font-bold">€ {(opportunity.value / 1000).toFixed(0)}.000</span>
        </div>
        
        <div className="border-r border-gray-200 px-6">
          <span className="text-sm text-gray-500 block">Probability</span>
          <span className="text-xl font-bold">{opportunity.probability}%</span>
        </div>
        
        <div className="pl-6">
          <span className="text-sm text-gray-500 block">Stage</span>
          <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadgeVariant(opportunity.status)}`}>
            {opportunity.status}
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
              <Link href={`/lists/customers/${opportunity.customerId}`} className="text-indigo-600 hover:underline">
                {opportunity.customerName}
              </Link>
            </div>
            
            <div>
              <span className="text-sm text-gray-500 mr-2">Partner:</span>
              <Link href={`/lists/partners/${opportunity.partnerId}`} className="text-indigo-600 hover:underline">
                {opportunity.partnerName}
              </Link>
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