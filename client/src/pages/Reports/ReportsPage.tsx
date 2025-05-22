import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart2, Download, FileSpreadsheet, SlidersHorizontal, Table, Layers, Save } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Import different reporting components
import PivotTableReport from "./components/PivotTableReport";
import TremorDashboard from "./components/TremorDashboard";
import RechartsReport from "./components/RechartsReport";
import MUIChartDashboard from "./components/MUIChartDashboard";

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("pivot");
  const [currentView, setCurrentView] = useState("default");

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
          <p className="text-gray-500">Create and customize reports for your business insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={currentView} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default View</SelectItem>
              <SelectItem value="opportunities">Opportunity Analysis</SelectItem>
              <SelectItem value="partners">Partner Performance</SelectItem>
              <SelectItem value="products">Product Distribution</SelectItem>
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
          
          <Button>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pivot" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Pivot Table
          </TabsTrigger>
          <TabsTrigger value="tremor" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Tremor Dashboard
          </TabsTrigger>
          <TabsTrigger value="recharts" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Recharts Dashboard
          </TabsTrigger>
          <TabsTrigger value="mui" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            MUI Charts
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-md p-4">
          <TabsContent value="pivot" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Interactive Pivot Table</h2>
                <p className="text-sm text-gray-500">Drag and drop fields to analyze your data from different angles</p>
              </div>
            </div>
            <PivotTableReport />
          </TabsContent>

          <TabsContent value="tremor" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Tremor Dashboard</h2>
                <p className="text-sm text-gray-500">Interactive dashboard with customizable charts and metrics</p>
              </div>
            </div>
            <TremorDashboard />
          </TabsContent>

          <TabsContent value="recharts" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Recharts Dashboard</h2>
                <p className="text-sm text-gray-500">Highly customizable chart components based on D3</p>
              </div>
            </div>
            <RechartsReport />
          </TabsContent>

          <TabsContent value="mui" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">MUI X Charts</h2>
                <p className="text-sm text-gray-500">Material Design charts with a clean, modern look</p>
              </div>
            </div>
            <MUIChartDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}