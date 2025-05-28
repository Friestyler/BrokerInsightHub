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
  FileSpreadsheet 
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

export default function DataUploadOptions() {
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
              <BreadcrumbPage>Data Upload</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Import your data</h1>
        <p className="text-gray-600">Choose a data source to import customer information for intelligent campaign creation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {environment.id === 'degoudse' && (
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer border-2 border-orange-100"
            onClick={() => setLocation("/data-upload/degoudse")}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-lg mt-2">De Goudse Data Use Case Upload</CardTitle>
              <CardDescription>
                Upload Excel files to create opportunities with intelligent entity mapping
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Upload Excel File
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer border-2 border-indigo-100"
          onClick={() => setLocation("/data-upload/brio")}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Upload from Brio</CardTitle>
            <CardDescription>
              Import your customer data directly from Brio
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Start Import
            </Button>
          </CardFooter>
        </Card>
        
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Upload from Broker Cloud</CardTitle>
            <CardDescription>
              Import data from your Broker Cloud account
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-gray-200"
            >
              Connect
            </Button>
          </CardFooter>
        </Card>
        
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Upload from other CRM or portal</CardTitle>
            <CardDescription>
              Import from any other third-party system
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-gray-200"
            >
              Select Source
            </Button>
          </CardFooter>
        </Card>
        
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Sync with your CRM</CardTitle>
            <CardDescription>
              Set up automatic data synchronization
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-gray-200"
            >
              Set Up Sync
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partner Pilot
        </Button>
      </div>
    </div>
  );
}