import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart2, Download, FileSpreadsheet, SlidersHorizontal, Table, Layers, Save, Star, Target, ListChecks, TrendingUp, AtSign } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Import different reporting components
import PivotTableReport from "./components/PivotTableReport";
import OkrDashboard from "./components/OkrDashboard";
import MetricsPerformance from "./components/MetricsPerformance";
import TaskMetrics from "./components/TaskMetrics";
import OpportunityStatus from "./components/OpportunityStatus";
import CampaignEngagement from "./components/CampaignEngagement";

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
            <OkrDashboard timeFrame={timeFrame} region={filterRegion} />
          </TabsContent>
          
          <TabsContent value="metrics-performance" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Metrics Performance</h2>
                <p className="text-sm text-gray-500">Performance analysis by metric, tag, or group</p>
              </div>
            </div>
            <MetricsPerformance timeFrame={timeFrame} region={filterRegion} />
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