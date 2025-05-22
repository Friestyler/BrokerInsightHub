import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  BarChart2, Download, FileSpreadsheet, SlidersHorizontal, Table, 
  Layers, Save, Star, Target, ListChecks, TrendingUp, AtSign,
  LineChart, Layout
} from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Import different reporting components
import PivotTableReport from "./components/PivotTableReport";
import MetabaseDashboard from "./components/MetabaseDashboard";

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("metabase");
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
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="metabase" className="flex items-center">
            <Layout className="h-4 w-4 mr-2" />
            Metabase Dashboard
          </TabsTrigger>
          <TabsTrigger value="pivot" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Chart Builder
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-md p-4">
          <TabsContent value="metabase" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Interactive Dashboards</h2>
                <p className="text-sm text-gray-500">Comprehensive view of OKRs, metrics, and business performance</p>
              </div>
            </div>
            <MetabaseDashboard timeFrame={timeFrame} region={filterRegion} />
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
          
          <TabsContent value="charts" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Chart Builder</h2>
                <p className="text-sm text-gray-500">Create custom charts for your presentations and analysis</p>
              </div>
            </div>
            <div className="bg-white p-8 text-center rounded-lg border border-dashed border-gray-300">
              <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chart Builder</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Build custom charts by selecting data sources, chart types, and visualization options.
                This feature will be available in the next phase.
              </p>
              <Button variant="outline">Coming Soon</Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}