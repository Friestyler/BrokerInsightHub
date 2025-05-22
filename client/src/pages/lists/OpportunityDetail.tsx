import { useState } from "react";
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

// Helper function to get status badge styling
const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'qualified':
      return 'bg-green-100 text-green-800';
    case 'closed won':
      return 'bg-green-100 text-green-800';
    case 'closed lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Mock metrics data for this opportunity
const metrics = [
  {
    id: 1,
    name: "Customer Satisfaction",
    type: "NPS",
    owner: "Customer Success",
    target: 90,
    current: 82,
    status: "on-track",
    lastUpdated: "2025-05-10",
  },
  {
    id: 2,
    name: "Revenue Growth",
    type: "Percentage",
    owner: "Finance",
    target: 20,
    current: 12,
    status: "at-risk",
    lastUpdated: "2025-05-15",
  },
  {
    id: 3,
    name: "API Adoption",
    type: "Active Users",
    owner: "Product",
    target: 1000,
    current: 875,
    status: "on-track",
    lastUpdated: "2025-05-12",
  },
  {
    id: 4,
    name: "Cost Reduction",
    type: "Percentage",
    owner: "Operations",
    target: 15,
    current: 8,
    status: "at-risk", 
    lastUpdated: "2025-05-14",
  }
];

// Main opportunity component
export default function OpportunityDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [, setLocation] = useLocation();
  
  // Find the opportunity from the mock data source shared with the list
  const opportunityData = mockOpportunities.find(opp => opp.id === Number(id));
  
  // If opportunity not found, render a not found message
  if (!opportunityData) {
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
    <div className="container mx-auto px-4 py-6">
      {/* Header with back navigation */}
      <div className="mb-6">
        <Link href="/lists/opportunities" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Opportunities
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">{opportunityData.title || "Opportunity"}</h1>
            <div className="ml-4 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                  {opportunityData.ownerInitials || "OI"}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-gray-600">{opportunityData.owner || "Owner"}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => {
                // Here you could implement the edit functionality
                // For now, we'll just show how it would update the name
                const newName = prompt("Enter new opportunity name:", opportunityData.title);
                if (newName && newName.trim() !== "") {
                  // In a real application, this would update the data in a database
                  // For our prototype, we'll update it directly in the array
                  const index = mockOpportunities.findIndex(opp => opp.id === opportunityData.id);
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
        
        <p className="text-gray-600 mt-2">Details for {opportunityData.title || "Opportunity"}</p>
      </div>
      
      {/* Key metrics section - similar to screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 mb-6">
        <div className="border-r border-gray-200 pr-6">
          <span className="text-sm text-gray-500 block">Amount</span>
          <span className="text-xl font-bold">€ {((opportunityData.value || 0) / 1000).toFixed(0)}.000</span>
        </div>
        
        <div className="border-r border-gray-200 px-6">
          <span className="text-sm text-gray-500 block">Probability</span>
          <span className="text-xl font-bold">{opportunityData.probability || 0}%</span>
        </div>
        
        <div className="pl-6">
          <span className="text-sm text-gray-500 block">Stage</span>
          <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadgeVariant(opportunityData.status || "")}`}>
            {opportunityData.status || "Unknown"}
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
              <Link href={`/lists/customers/${opportunityData.customerId || 0}`} className="text-indigo-600 hover:underline">
                {opportunityData.customerName || "Customer"}
              </Link>
            </div>
            <div>
              <span className="text-sm text-gray-500 mr-2">Partner:</span>
              <Link href={`/lists/partners/${opportunityData.partnerId || 0}`} className="text-indigo-600 hover:underline">
                {opportunityData.partnerName || "Partner"}
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
              <Button variant="outline" size="sm">Export Selected</Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Selected
              </Button>
            </div>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableCell className="w-10 px-4 py-2">
                  <Checkbox 
                    checked={metrics.length > 0 && selectedMetrics.length === metrics.length}
                    onCheckedChange={toggleAllMetrics}
                  />
                </TableCell>
                <TableCell className="font-medium px-4 py-2">Metric Name</TableCell>
                <TableCell className="font-medium px-4 py-2">Type</TableCell>
                <TableCell className="font-medium px-4 py-2">Owner</TableCell>
                <TableCell className="font-medium px-4 py-2">Target</TableCell>
                <TableCell className="font-medium px-4 py-2">Current</TableCell>
                <TableCell className="font-medium px-4 py-2">Progress</TableCell>
                <TableCell className="font-medium px-4 py-2 text-right">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map(metric => (
                <TableRow key={metric.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-2">
                    <Checkbox 
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetricSelection(metric.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium px-4 py-2">{metric.name}</TableCell>
                  <TableCell className="px-4 py-2">{metric.type}</TableCell>
                  <TableCell className="px-4 py-2">{metric.owner}</TableCell>
                  <TableCell className="px-4 py-2">{metric.type === 'Percentage' ? `${metric.target}%` : metric.target}</TableCell>
                  <TableCell className="px-4 py-2">{metric.type === 'Percentage' ? `${metric.current}%` : metric.current}</TableCell>
                  <TableCell className="px-4 py-2 w-32">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className={`h-2 ${metric.status === 'on-track' ? 'bg-green-100' : 'bg-orange-100'}`} 
                      />
                      <span className="text-xs text-gray-500">{Math.round((metric.current / metric.target) * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        metric.status === 'on-track' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {metric.status === 'on-track' ? 'On Track' : 'At Risk'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}