import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileUp, 
  Cloud, 
  Database, 
  RefreshCw,
  ArrowLeft,
  FileSpreadsheet,
  Settings,
  Zap
} from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DataUpload2() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Partner Pilot</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Upload 2</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Advanced Data Upload</h1>
        <p className="text-gray-600">Enhanced data import capabilities with advanced processing and transformation options</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Batch Processing */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">Enhanced</Badge>
            </div>
            <CardTitle className="text-lg">Batch Data Processing</CardTitle>
            <CardDescription>
              Process multiple files simultaneously with advanced validation and error handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Parallel file processing</li>
              <li>• Advanced validation rules</li>
              <li>• Duplicate detection</li>
              <li>• Progress tracking</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/batch")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Start Batch Upload
            </Button>
          </CardFooter>
        </Card>

        {/* API Integration */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary">Real-time</Badge>
            </div>
            <CardTitle className="text-lg">API Data Sync</CardTitle>
            <CardDescription>
              Connect directly to external APIs for real-time data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Real-time synchronization</li>
              <li>• Custom API endpoints</li>
              <li>• Webhook support</li>
              <li>• Automated scheduling</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/api")}
            >
              <Cloud className="h-4 w-4 mr-2" />
              Configure API Sync
            </Button>
          </CardFooter>
        </Card>

        {/* Data Transformation */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary">Advanced</Badge>
            </div>
            <CardTitle className="text-lg">Data Transformation</CardTitle>
            <CardDescription>
              Apply advanced transformations and enrichment to your data during import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Custom field mapping</li>
              <li>• Data enrichment</li>
              <li>• Format conversion</li>
              <li>• Quality validation</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/transform")}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Setup Transformation
            </Button>
          </CardFooter>
        </Card>

        {/* Scheduled Import */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary">Automated</Badge>
            </div>
            <CardTitle className="text-lg">Scheduled Imports</CardTitle>
            <CardDescription>
              Set up recurring data imports with flexible scheduling options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Flexible scheduling</li>
              <li>• Error notifications</li>
              <li>• Import history</li>
              <li>• Performance monitoring</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/schedule")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardFooter>
        </Card>

        {/* Data Validation */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <FileUp className="h-6 w-6 text-red-600" />
              </div>
              <Badge variant="secondary">Quality</Badge>
            </div>
            <CardTitle className="text-lg">Data Quality Check</CardTitle>
            <CardDescription>
              Comprehensive data validation and quality assurance tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Data profiling</li>
              <li>• Quality scoring</li>
              <li>• Anomaly detection</li>
              <li>• Cleansing suggestions</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/validation")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Run Quality Check
            </Button>
          </CardFooter>
        </Card>

        {/* Import History */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-gray-600" />
              </div>
              <Badge variant="secondary">Analytics</Badge>
            </div>
            <CardTitle className="text-lg">Import Analytics</CardTitle>
            <CardDescription>
              View detailed analytics and history of all your data imports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Import timeline</li>
              <li>• Success metrics</li>
              <li>• Error analysis</li>
              <li>• Performance insights</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-2/analytics")}
            >
              <Database className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Upload Activity</h2>
        <div className="bg-white rounded-lg border">
          <div className="p-6">
            <div className="text-center text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent upload activity</p>
              <p className="text-sm">Your upload history will appear here once you start importing data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: string }) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = variant === "secondary" 
    ? "bg-gray-100 text-gray-800" 
    : "bg-blue-100 text-blue-800";
  
  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {children}
    </span>
  );
}