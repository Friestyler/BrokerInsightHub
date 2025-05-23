import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart2, Download, FileSpreadsheet, SlidersHorizontal, Table, Layers, Save, Star, Target, ListChecks, TrendingUp, AtSign } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Import different reporting components
import { 
  OkrDashboard,
  MetricsPerformance,
  TaskMetrics,
  OpportunityStatus,
  CampaignEngagement,
  PivotTableReport
} from "./components";

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("okr-dashboard");
  const [currentView, setCurrentView] = useState("default");
  const [timeFrame, setTimeFrame] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");

  // Save current view setup
  const handleSaveView = () => {
    // This would typically save the current configuration to a database
    alert("View saved successfully!");
  };

  // Change current report view
  const handleViewChange = (value: string) => {
    setCurrentView(value);
    // In a real application, this would load a saved configuration
  };

  // Export current report
  const handleExport = (format: string) => {
    // This would typically export the data in the selected format
    alert(`Exporting report in ${format} format`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Partner Pilot</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">Monitor performance and track progress across your OKRs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="2025">Year 2025</SelectItem>
              <SelectItem value="q2-2025">Q2 2025</SelectItem>
              <SelectItem value="may-2025">May 2025</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={currentView} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default View</SelectItem>
              <SelectItem value="commercial">Commercial Team View</SelectItem>
              <SelectItem value="performance">Performance (KPIs)</SelectItem>
              <SelectItem value="actionplan">Action Plan View</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleSaveView} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save View
          </Button>
          
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center">
                  <Table className="h-4 w-4 mr-2" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="okr-dashboard" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            OKR Dashboard
          </TabsTrigger>
          <TabsTrigger value="metrics-performance" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Metrics Performance
          </TabsTrigger>
          <TabsTrigger value="task-metrics" className="flex items-center">
            <ListChecks className="h-4 w-4 mr-2" />
            Task Metrics
          </TabsTrigger>
          <TabsTrigger value="opportunity-status" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Opportunity Status
          </TabsTrigger>
          <TabsTrigger value="campaign-engagement" className="flex items-center">
            <AtSign className="h-4 w-4 mr-2" />
            Campaign Engagement
          </TabsTrigger>
          <TabsTrigger value="pivot" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Custom Reports
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-md p-4">
          <TabsContent value="okr-dashboard" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">OKR Progress Dashboard</h2>
                <p className="text-sm text-gray-500">Track partner progress on assigned objectives and key results</p>
              </div>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">OKR Dashboard</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <div className="text-xs text-muted-foreground">5 active, 2 completed</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">62%</div>
                    <Progress value={62} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Metrics Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs">5</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
                        <span className="text-xs">4</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        <span className="text-xs">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold mr-2">CG</div>
                    <h3 className="text-lg font-medium">Commerciële Groei Top Segment</h3>
                  </div>
                  
                  <div className="pl-6 space-y-4 mt-4">
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b pb-3">
                      <div>Focus nieuwe klanten</div>
                      <div className="text-center">2025</div>
                      <div>
                        <Progress value={50} className="h-2 bg-orange-100" indicatorColor="#f97316" />
                        <div className="text-right text-xs mt-1">50%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b pb-3">
                      <div>Lead generatiecampagne</div>
                      <div className="text-center">Unique</div>
                      <div>
                        <Progress value={33} className="h-2 bg-orange-100" indicatorColor="#f97316" />
                        <div className="text-right text-xs mt-1">33%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2">P</div>
                    <h3 className="text-lg font-medium">Performance (KPIs)</h3>
                  </div>
                  
                  <div className="pl-6 space-y-4 mt-4">
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b pb-3">
                      <div>Aantal hypotheekaanvragen</div>
                      <div className="text-center">May</div>
                      <div>
                        <Progress value={74} className="h-2 bg-orange-100" indicatorColor="#f97316" />
                        <div className="text-right text-xs mt-1">74% (211 / 285 #)</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b pb-3">
                      <div>Hypotheek volume</div>
                      <div className="text-center">May</div>
                      <div>
                        <Progress value={79} className="h-2 bg-orange-100" indicatorColor="#f97316" />
                        <div className="text-right text-xs mt-1">79% (47.5M € / 60M €)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics-performance" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Metrics Performance</h2>
                <p className="text-sm text-gray-500">Performance analysis by metric, tag, or group</p>
              </div>
            </div>
            <div className="border rounded-md p-4">
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Input
                      type="search"
                      placeholder="Search metrics, plans, or partners..."
                      className="pl-9"
                    />
                    <div className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by Tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
                      Filters
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-gray-100 rounded-t-md text-sm font-medium">
                    <div className="flex items-center cursor-pointer">
                      OKRs
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
                    </div>
                    <div>PLANS</div>
                    <div>RECORD NAME</div>
                    <div>TEAM</div>
                    <div>RECORD TYPE</div>
                    <div>PROGRESS</div>
                  </div>
                  
                  <div className="divide-y">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                        <span>10% turnover increase in product X</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2">EA</div>
                        <span className="truncate text-sm">Excellent Agent Plan</span>
                      </div>
                      <div className="text-sm">Antwerpen</div>
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                          SSp
                        </div>
                      </div>
                      <div className="text-sm">Partner</div>
                      <div className="flex flex-col">
                        <div className="text-sm mb-1 flex justify-between">
                          <span>May</span>
                          <span>0 €</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                        <span>Product training</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2">EA</div>
                        <span className="truncate text-sm">Excellent Agent Plan</span>
                      </div>
                      <div className="text-sm">Else</div>
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                          AGP
                        </div>
                      </div>
                      <div className="text-sm">Partner</div>
                      <div className="flex flex-col">
                        <div className="text-sm mb-1 flex justify-between">
                          <span>May</span>
                          <span>2 / 3 #</span>
                        </div>
                        <Progress value={67} className="h-2" indicatorColor="#10b981" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                        <span>Commercial Action</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2">EA</div>
                        <span className="truncate text-sm">Excellent Agent Plan</span>
                      </div>
                      <div className="text-sm">Evergem</div>
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                          SSp
                        </div>
                      </div>
                      <div className="text-sm">Partner</div>
                      <div className="flex flex-col">
                        <div className="text-sm mb-1 flex justify-between">
                          <span>May</span>
                          <span>0 / 12 #</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                        <span>Desired amount of leads</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2">EA</div>
                        <span className="truncate text-sm">Excellent Agent Plan</span>
                      </div>
                      <div className="text-sm">Gent</div>
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded px-2 py-0.5 text-xs font-medium">
                          BPa
                        </div>
                      </div>
                      <div className="text-sm">Partner</div>
                      <div className="flex flex-col">
                        <div className="text-sm mb-1 flex justify-between">
                          <span>May</span>
                          <span>25 / 100 #</span>
                        </div>
                        <Progress value={25} className="h-2" indicatorColor="#f97316" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="task-metrics" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Open Task Metrics</h2>
                <p className="text-sm text-gray-500">Overview of incomplete tasks and activities</p>
              </div>
            </div>
            <TaskMetrics timeFrame={timeFrame} region={filterRegion} />
          </TabsContent>
          
          <TabsContent value="opportunity-status" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Opportunity Status</h2>
                <p className="text-sm text-gray-500">Overview of current opportunities by stage and value</p>
              </div>
            </div>
            <OpportunityStatus timeFrame={timeFrame} region={filterRegion} />
          </TabsContent>
          
          <TabsContent value="campaign-engagement" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Campaign Engagement</h2>
                <p className="text-sm text-gray-500">Analysis of campaign performance and partner engagement</p>
              </div>
            </div>
            <CampaignEngagement timeFrame={timeFrame} region={filterRegion} />
          </TabsContent>

          <TabsContent value="pivot" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Custom Report Builder</h2>
                <p className="text-sm text-gray-500">Create your own reports with our flexible pivot table</p>
              </div>
            </div>
            <PivotTableReport timeFrame={timeFrame} region={filterRegion} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}