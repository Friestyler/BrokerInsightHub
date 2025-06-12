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
  Bot,
  Brain,
  Workflow,
  Sparkles
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

export default function DataUpload3() {
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
              <BreadcrumbPage>Data Upload 3</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Data Upload</h1>
        <p className="text-gray-600">Intelligent data processing with machine learning and automated insights generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Document Processing */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <Badge variant="primary">AI-Powered</Badge>
            </div>
            <CardTitle className="text-lg">Smart Document AI</CardTitle>
            <CardDescription>
              Extract and process data from documents using advanced AI and OCR technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• OCR text extraction</li>
              <li>• Table recognition</li>
              <li>• Entity extraction</li>
              <li>• Document classification</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/ai-document")}
            >
              <Brain className="h-4 w-4 mr-2" />
              Process Documents
            </Button>
          </CardFooter>
        </Card>

        {/* Automated Workflows */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="primary">Automated</Badge>
            </div>
            <CardTitle className="text-lg">Smart Workflows</CardTitle>
            <CardDescription>
              Create intelligent workflows that automatically process and categorize your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Auto-categorization</li>
              <li>• Smart routing</li>
              <li>• Conditional processing</li>
              <li>• Workflow templates</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/workflows")}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Build Workflow
            </Button>
          </CardFooter>
        </Card>

        {/* Predictive Analytics */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="primary">Predictive</Badge>
            </div>
            <CardTitle className="text-lg">Predictive Insights</CardTitle>
            <CardDescription>
              Generate predictive insights and recommendations from your uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Trend prediction</li>
              <li>• Anomaly detection</li>
              <li>• Risk assessment</li>
              <li>• Opportunity scoring</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/insights")}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </CardFooter>
        </Card>

        {/* AI Data Matching */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="primary">Intelligent</Badge>
            </div>
            <CardTitle className="text-lg">Smart Data Matching</CardTitle>
            <CardDescription>
              Use AI to automatically match and deduplicate records across data sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fuzzy matching</li>
              <li>• Duplicate detection</li>
              <li>• Record merging</li>
              <li>• Confidence scoring</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/matching")}
            >
              <Bot className="h-4 w-4 mr-2" />
              Start Matching
            </Button>
          </CardFooter>
        </Card>

        {/* Natural Language Processing */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-yellow-600" />
              </div>
              <Badge variant="primary">NLP</Badge>
            </div>
            <CardTitle className="text-lg">Text Analytics</CardTitle>
            <CardDescription>
              Extract insights from unstructured text data using natural language processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Sentiment analysis</li>
              <li>• Topic modeling</li>
              <li>• Entity recognition</li>
              <li>• Content summarization</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/nlp")}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Analyze Text
            </Button>
          </CardFooter>
        </Card>

        {/* AI Model Training */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-red-600" />
              </div>
              <Badge variant="primary">Custom</Badge>
            </div>
            <CardTitle className="text-lg">Custom AI Models</CardTitle>
            <CardDescription>
              Train custom AI models on your data for specific business use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Model training</li>
              <li>• Performance metrics</li>
              <li>• A/B testing</li>
              <li>• Model deployment</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/data-upload-3/models")}
            >
              <Database className="h-4 w-4 mr-2" />
              Train Model
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* AI Processing Pipeline */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">AI Processing Pipeline</h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">Intelligent Data Processing</h3>
                <p className="text-sm text-gray-600">End-to-end AI pipeline for your data</p>
              </div>
            </div>
            <Button onClick={() => setLocation("/data-upload-3/pipeline")}>
              <Workflow className="h-4 w-4 mr-2" />
              Configure Pipeline
            </Button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-indigo-600">1</span>
              </div>
              <p className="text-xs text-gray-600">Data Ingestion</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-indigo-600">2</span>
              </div>
              <p className="text-xs text-gray-600">AI Processing</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-indigo-600">3</span>
              </div>
              <p className="text-xs text-gray-600">Insight Generation</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-indigo-600">4</span>
              </div>
              <p className="text-xs text-gray-600">Action Recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Activity */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent AI Processing</h2>
        <div className="bg-white rounded-lg border">
          <div className="p-6">
            <div className="text-center text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No AI processing activity yet</p>
              <p className="text-sm">Your AI processing history and insights will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: string }) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = variant === "primary" 
    ? "bg-indigo-100 text-indigo-800" 
    : "bg-gray-100 text-gray-800";
  
  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {children}
    </span>
  );
}