import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Check,
  Database,
  BrainCircuit,
  ChevronRight, 
  Lightbulb,
  UserCircle,
  Users
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
import { Progress } from "@/components/ui/progress";

export default function BrioUploadFlow() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mapping, setMapping] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Total number of steps in the flow
  const totalSteps = 4;

  // Mock fields for demonstration
  const dataFields = [
    { id: 'name', label: 'Customer Name', mapped: 'customer_name' },
    { id: 'email', label: 'Email Address', mapped: 'email' },
    { id: 'phone', label: 'Phone Number', mapped: 'telephone' },
    { id: 'address', label: 'Address', mapped: 'address' },
    { id: 'policy_type', label: 'Policy Type', mapped: 'product_type' },
    { id: 'policy_number', label: 'Policy Number', mapped: 'policy_id' },
    { id: 'renewal_date', label: 'Renewal Date', mapped: 'contract_end_date' },
    { id: 'premium', label: 'Premium Amount', mapped: 'annual_premium' },
  ];

  // Mock field context descriptions for AI context
  const fieldContexts = [
    { id: 'name', context: 'Used for personalization in outreach campaigns' },
    { id: 'email', context: 'Primary contact method for digital campaigns' },
    { id: 'phone', context: 'Used for SMS campaigns and call center contact' },
    { id: 'policy_type', context: 'Determines cross-sell and upsell opportunities' },
    { id: 'renewal_date', context: 'Timing for renewal campaigns and retention efforts' },
    { id: 'premium', context: 'Used for value-based targeting and pricing optimization' },
  ];

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Simulate upload progress
  const simulateUpload = () => {
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentStep(2);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Simulate processing
  const simulateProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(prev => prev + 1);
    }, 2000);
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Flow complete, redirect to collaborate page
      setLocation("/collaborate");
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      // Go back to data upload options page
      setLocation("/data-upload");
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                <Lightbulb className="h-4 w-4 mr-2" />
                Why upload from Brio?
              </h3>
              <p className="text-sm text-blue-700">
                Brio contains valuable customer data that can be used to create highly targeted campaigns. 
                Importing this data will allow our AI to identify optimal cross-sell and upsell opportunities.
              </p>
            </div>
            
            <Card className="border-dashed border-2 p-8">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload your Brio data export</h3>
                  <p className="text-gray-500 mb-6">Drag and drop your CSV file here, or click to browse</p>
                </div>
                
                <Input 
                  type="file" 
                  accept=".csv" 
                  className="max-w-sm cursor-pointer" 
                  onChange={handleFileChange}
                />
                
                {selectedFile && (
                  <div className="mt-4 flex items-center">
                    <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                )}
                
                {uploadProgress > 0 && (
                  <div className="w-full mt-4 max-w-sm">
                    <Progress value={uploadProgress} className="h-2 bg-gray-100" />
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {uploadProgress}% uploaded
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium">Requirements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  CSV format from Brio export
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Customer data must include at least name and email
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Product data helps improve campaign targeting
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                <Lightbulb className="h-4 w-4 mr-2" />
                Map your data columns
              </h3>
              <p className="text-sm text-blue-700">
                We've automatically mapped the fields from your Brio export. Please review and adjust if needed to ensure accurate data import.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Column Mapping</CardTitle>
                <CardDescription>
                  Match your Brio fields to our system fields for optimal processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center py-2 font-medium text-sm border-b">
                    <div className="w-1/3">System Field</div>
                    <div className="w-1/3">Mapped To</div>
                    <div className="w-1/3">Preview</div>
                  </div>
                  
                  {dataFields.map(field => (
                    <div key={field.id} className="flex items-center py-2 text-sm">
                      <div className="w-1/3 font-medium">{field.label}</div>
                      <div className="w-1/3">
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-gray-700">
                          <span>{field.mapped}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="w-1/3 text-gray-600">
                        {field.id === 'name' ? 'John Smith' : 
                         field.id === 'email' ? 'john.smith@example.com' :
                         field.id === 'phone' ? '+31 6 12345678' :
                         field.id === 'policy_type' ? 'Home Insurance' :
                         field.id === 'renewal_date' ? '15-07-2025' :
                         field.id === 'premium' ? '€1,250.00' : 'Sample data'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                <Lightbulb className="h-4 w-4 mr-2" />
                Add context for AI processing
              </h3>
              <p className="text-sm text-blue-700">
                Help our AI understand how you plan to use this data in your campaigns. 
                This context will improve cross-sell and upsell recommendations.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Field Context for Campaign Intelligence</CardTitle>
                <CardDescription>
                  Provide details about how these fields should be used in campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fieldContexts.map(field => (
                    <div key={field.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{dataFields.find(f => f.id === field.id)?.label}</h4>
                        <div className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                          {field.id === 'name' || field.id === 'email' || field.id === 'phone' 
                            ? 'Contact Info' 
                            : field.id === 'policy_type' || field.id === 'premium'
                            ? 'Product Info'
                            : 'Timing Info'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{field.context}</p>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <h5 className="text-xs font-medium text-gray-500 mb-1">AI Suggestion:</h5>
                        <p className="text-sm">
                          {field.id === 'name' ? 'Use for personalized greetings and tailored messaging' : 
                           field.id === 'email' ? 'Segment campaigns by email domain (corporate vs personal)' :
                           field.id === 'phone' ? 'Flag international numbers for specialized communication' :
                           field.id === 'policy_type' ? 'Create product affinity groups for targeted cross-selling' :
                           field.id === 'renewal_date' ? 'Schedule campaigns 45-60 days before renewal date' :
                           'Segment customers into premium tiers for value-based offerings'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-6">
              <h3 className="text-sm font-medium text-green-800 flex items-center mb-2">
                <Check className="h-4 w-4 mr-2" />
                Import Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your Brio data has been successfully imported and processed. You can now use this data to create targeted campaigns.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Import Summary</CardTitle>
                <CardDescription>
                  Overview of the imported data and next steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-semibold mb-1">285</div>
                    <div className="text-sm text-gray-600">Customer Records</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-semibold mb-1">412</div>
                    <div className="text-sm text-gray-600">Policy Records</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-semibold mb-1">8</div>
                    <div className="text-sm text-gray-600">Product Categories</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-2xl font-semibold mb-1">42</div>
                    <div className="text-sm text-gray-600">Renewal Opportunities</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Next Steps</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start border-l-2 border-indigo-500 pl-3 py-1">
                      <Users className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Collaborate Section</p>
                        <p className="text-sm text-gray-600">Visit the Collaborate section to view your imported customers and records</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start border-l-2 border-green-500 pl-3 py-1">
                      <BrainCircuit className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">AI-Powered Campaigns</p>
                        <p className="text-sm text-gray-600">Our AI has analyzed your data and created campaign recommendations to maximize cross-sell and upsell opportunities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start border-l-2 border-blue-500 pl-3 py-1">
                      <UserCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Customer 360° View</p>
                        <p className="text-sm text-gray-600">Access the comprehensive customer view with all imported data and campaign insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  // Render button actions for current step
  const renderActions = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button variant="outline" onClick={() => setLocation("/data-upload")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            disabled={!selectedFile}
            onClick={simulateUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </>
      );
    } else if (currentStep === totalSteps) {
      return (
        <>
          <Button variant="outline" onClick={goToPreviousStep}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => setLocation("/collaborate")}>
            Go to Collaborate
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button variant="outline" onClick={goToPreviousStep}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={goToNextStep}>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      );
    }
  };

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
              <BreadcrumbLink href="/data-upload">Data Upload</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Brio Upload</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Upload Data from Brio</h1>
        <p className="text-gray-600">Follow these steps to import your Brio data for intelligent campaign creation</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
            <div key={step} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step < currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : step === currentStep
                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' 
                    : 'bg-gray-100 text-gray-400'
                } mr-2`}
              >
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              <div className="text-sm font-medium">
                {step === 1 
                  ? 'Upload' 
                  : step === 2 
                  ? 'Map Fields' 
                  : step === 3 
                  ? 'Add Context' 
                  : 'Complete'}
              </div>
              {step < totalSteps && (
                <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {renderStepContent()}
      </div>

      <div className="flex justify-between mt-8">
        {renderActions()}
      </div>
    </div>
  );
}