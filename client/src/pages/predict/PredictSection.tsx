import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileOutput, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileSpreadsheet,
  FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ClientType, OpportunityType, Metric } from "@/lib/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PredictSection() {
  const [clientPortfolio, setClientPortfolio] = useState("all");
  const [opportunityType, setOpportunityType] = useState("all");
  const [timeFrame, setTimeFrame] = useState("30");

  const { data: opportunities, isLoading, isError } = useQuery<OpportunityType[]>({
    queryKey: ['/api/opportunities'],
  });

  const { data: clients } = useQuery<ClientType[]>({
    queryKey: ['/api/clients'],
  });

  // Combine the client data with opportunities
  const opportunitiesWithClients = opportunities?.map(opp => {
    const client = clients?.find(c => c.id === opp.clientId);
    return { ...opp, client };
  });

  // Metrics data
  const metrics: Metric[] = [
    {
      icon: "users",
      label: "Clients with Opportunities",
      value: "48",
      change: "+12%",
      bgColor: "bg-primary-50",
      iconBgColor: "bg-primary-100",
      iconTextColor: "text-primary-600",
      changeColor: "text-primary-600"
    },
    {
      icon: "chart-line",
      label: "Potential Revenue",
      value: "€23,450",
      change: "+8%",
      bgColor: "bg-green-50",
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-600",
      changeColor: "text-green-600"
    },
    {
      icon: "percentage",
      label: "Average Probability",
      value: "68%",
      change: "+3%",
      bgColor: "bg-yellow-50",
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-600",
      changeColor: "text-yellow-600"
    }
  ];

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setUploadMessage("");
      } else {
        setSelectedFile(null);
        setUploadMessage("Please select a CSV or Excel file");
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    if (!selectedFile) {
      setUploadMessage("Please select a file first");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadMessage("File uploaded successfully! The data will be processed shortly.");
      // In a real app, we would send the file to the server here
    }, 1500);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Predict Cross and Upsell Opportunities</h2>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50">
                <FileUp className="h-4 w-4 mr-2" /> Upload Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Client Data</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file containing client data to analyze cross-sell and upsell opportunities.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div 
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-all"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-neutral-500 mb-3" />
                  <p className="text-sm font-medium text-neutral-700">
                    {selectedFile ? selectedFile.name : "Click to select a file"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Supports CSV, XLS, and XLSX files
                  </p>
                </div>
                
                {uploadMessage && (
                  <p className={`text-sm ${uploadMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {uploadMessage}
                  </p>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  variant="default" 
                  className="w-full bg-primary-600 hover:bg-primary-700" 
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>Upload File</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="default" className="bg-primary-600 hover:bg-primary-700">
            <FileOutput className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Client Portfolio</Label>
            <Select value={clientPortfolio} onValueChange={setClientPortfolio}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select client portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="high-value">High-Value Clients</SelectItem>
                <SelectItem value="business">Business Clients</SelectItem>
                <SelectItem value="recent">Recent Clients (Last 6 Months)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Opportunity Type</Label>
            <Select value={opportunityType} onValueChange={setOpportunityType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select opportunity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Opportunities</SelectItem>
                <SelectItem value="cross-sell">Cross-Sell Only</SelectItem>
                <SelectItem value="upsell">Upsell Only</SelectItem>
                <SelectItem value="high-probability">High Probability ({'>'}75%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Time Frame</Label>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Next 30 Days</SelectItem>
                <SelectItem value="90">Next Quarter</SelectItem>
                <SelectItem value="180">Next 6 Months</SelectItem>
                <SelectItem value="365">Next Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.bgColor} rounded-lg p-4 border border-${metric.bgColor.replace('bg-', '')}`}>
            <div className="flex items-center">
              <div className={`h-12 w-12 ${metric.iconBgColor} rounded-lg flex items-center justify-center`}>
                {metric.icon === "users" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${metric.iconTextColor} h-5 w-5`}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                )}
                {metric.icon === "chart-line" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${metric.iconTextColor} h-5 w-5`}
                  >
                    <path d="M21 21H4.6a2.6 2.6 0 0 1-2.6-2.6V3"></path>
                    <path d="m6 16 6-6 6 6"></path>
                    <path d="M6 8v8"></path>
                    <path d="M12 10v6"></path>
                    <path d="M18 12v4"></path>
                  </svg>
                )}
                {metric.icon === "percentage" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${metric.iconTextColor} h-5 w-5`}
                  >
                    <path d="M19 5 5 19"></path>
                    <circle cx="6.5" cy="6.5" r="2.5"></circle>
                    <circle cx="17.5" cy="17.5" r="2.5"></circle>
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-600">{metric.label}</p>
                <p className="text-2xl font-semibold text-neutral-900">{metric.value}</p>
              </div>
            </div>
            <div className={`mt-2 text-xs ${metric.changeColor}`}>
              <span className="font-medium">{metric.change}</span> from last month
            </div>
          </div>
        ))}
      </div>

      {/* Opportunities Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin h-8 w-8 mx-auto border-4 border-primary-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-neutral-600">Loading opportunities...</p>
          </div>
        ) : isError ? (
          <div className="py-10 text-center">
            <p className="text-destructive">Failed to load opportunities. Please try again.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Current Products</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Opportunity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Probability</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Potential Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {opportunitiesWithClients?.map((opportunity) => {
                const client = opportunity.client;
                if (!client) return null;
                
                let badgeColor = "";
                if (opportunity.opportunityType.includes("Business")) {
                  badgeColor = "bg-green-100 text-green-800";
                } else if (opportunity.opportunityType.includes("Life")) {
                  badgeColor = "bg-blue-100 text-blue-800";
                } else {
                  badgeColor = "bg-yellow-100 text-yellow-800";
                }
                
                const initials = client.fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('');
                
                return (
                  <tr key={opportunity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                          <span className="font-medium">{initials}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{client.fullName}</div>
                          <div className="text-sm text-neutral-500">{client.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{client.products.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}`}>
                        {opportunity.opportunityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                          <div 
                            className={`${
                              opportunity.probability >= 75 ? 'bg-green-600' : 
                              opportunity.probability >= 65 ? 'bg-blue-600' : 'bg-yellow-600'
                            } h-2 rounded-full`} 
                            style={{ width: `${opportunity.probability}%` }}
                          ></div>
                        </div>
                        <span>{opportunity.probability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{opportunity.potentialValue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">Contact</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          Showing {opportunitiesWithClients?.length || 0} of 48 opportunities
        </div>
        <div className="flex">
          <button className="px-3 py-1 border border-neutral-300 rounded-l-md text-neutral-700 hover:bg-neutral-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="px-3 py-1 border-t border-b border-neutral-300 bg-primary-50 text-primary-700">1</button>
          <button className="px-3 py-1 border-t border-b border-neutral-300 text-neutral-700 hover:bg-neutral-50">2</button>
          <button className="px-3 py-1 border-t border-b border-neutral-300 text-neutral-700 hover:bg-neutral-50">3</button>
          <button className="px-3 py-1 border border-neutral-300 rounded-r-md text-neutral-700 hover:bg-neutral-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
