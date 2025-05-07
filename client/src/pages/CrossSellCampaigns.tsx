import React, { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { 
  UploadCloud, 
  Table, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Database,
  LayoutList
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table as TableUI,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

enum WorkflowStep {
  WELCOME = 'welcome',
  FILE_UPLOAD = 'file_upload',
  MAPPING = 'mapping',
  FIELD_CUSTOMIZATION = 'field_customization',
  CONTEXT_INFORMATION = 'context_information',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
}

interface CustomerField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  mapped: boolean;
  sourceField?: string;
  context?: string;
}

interface FileColumn {
  name: string;
  sample: string;
}

export default function CrossSellCampaigns() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.WELCOME);
  const [file, setFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<FileColumn[]>([]);
  const [customerFields, setCustomerFields] = useState<CustomerField[]>([
    { name: 'name', type: 'text', required: true, description: 'Customer name or company name', mapped: false },
    { name: 'description', type: 'text', required: true, description: 'Brief description of the customer', mapped: false },
    { name: 'email', type: 'email', required: false, description: 'Primary contact email', mapped: false },
    { name: 'phone', type: 'text', required: false, description: 'Primary contact phone number', mapped: false },
    { name: 'industry', type: 'text', required: false, description: 'Customer industry or sector', mapped: false },
    { name: 'size', type: 'text', required: false, description: 'Company size (Small, Medium, Enterprise)', mapped: false },
    { name: 'revenue', type: 'number', required: false, description: 'Annual revenue', mapped: false },
  ]);
  const [customFields, setCustomFields] = useState<CustomerField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldDescription, setNewFieldDescription] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);

  // Simulated data for preview
  const previewData = [
    { column1: 'Acme Inc.', column2: 'Manufacturing company', column3: 'acme@example.com', column4: '+32 123 456 789' },
    { column1: 'Globex Corp', column2: 'Technology services', column3: 'info@globex.com', column4: '+32 987 654 321' },
    { column1: 'Oceanic Air', column2: 'Transportation', column3: 'contact@oceanic.com', column4: '+32 555 123 456' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Simulate parsing the file to get columns
      setTimeout(() => {
        // This would be replaced with actual file parsing logic
        const mockColumns: FileColumn[] = [
          { name: 'CompanyName', sample: 'Acme Inc.' },
          { name: 'Description', sample: 'Manufacturing company specializing in widgets' },
          { name: 'ContactEmail', sample: 'contact@acme.com' },
          { name: 'PhoneNumber', sample: '+32 123 456 789' },
          { name: 'Industry', sample: 'Manufacturing' },
          { name: 'CompanySize', sample: 'Medium' },
          { name: 'AnnualRevenue', sample: '€2,500,000' },
        ];
        setFileColumns(mockColumns);
      }, 1000);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(WorkflowStep.MAPPING), 500);
        }
      }, 100);
    }
  };

  const handleFieldMapping = (fieldName: string, columnName: string) => {
    setCustomerFields(fields => 
      fields.map(field => 
        field.name === fieldName 
          ? { ...field, mapped: true, sourceField: columnName } 
          : field
      )
    );
    
    setCustomFields(fields => 
      fields.map(field => 
        field.name === fieldName 
          ? { ...field, mapped: true, sourceField: columnName } 
          : field
      )
    );
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim()) {
      const newField: CustomerField = {
        name: newFieldName.trim(),
        type: newFieldType,
        required: false,
        description: newFieldDescription.trim() || `Custom field: ${newFieldName}`,
        mapped: false
      };
      
      setCustomFields([...customFields, newField]);
      setNewFieldName('');
      setNewFieldType('text');
      setNewFieldDescription('');
    }
  };

  const handleFieldContext = (fieldName: string, context: string) => {
    // Update context for standard fields
    setCustomerFields(fields => 
      fields.map(field => 
        field.name === fieldName 
          ? { ...field, context } 
          : field
      )
    );
    
    // Update context for custom fields
    setCustomFields(fields => 
      fields.map(field => 
        field.name === fieldName 
          ? { ...field, context } 
          : field
      )
    );
  };

  const startProcessing = () => {
    setCurrentStep(WorkflowStep.PROCESSING);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setProcessingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setImportedCount(23); // Simulated number of imported records
        setCurrentStep(WorkflowStep.COMPLETE);
      }
    }, 100);
  };

  const handleContinue = () => {
    switch (currentStep) {
      case WorkflowStep.WELCOME:
        setCurrentStep(WorkflowStep.FILE_UPLOAD);
        break;
      case WorkflowStep.MAPPING:
        setCurrentStep(WorkflowStep.FIELD_CUSTOMIZATION);
        break;
      case WorkflowStep.FIELD_CUSTOMIZATION:
        setCurrentStep(WorkflowStep.CONTEXT_INFORMATION);
        break;
      case WorkflowStep.CONTEXT_INFORMATION:
        startProcessing();
        break;
      case WorkflowStep.COMPLETE:
        setLocation('/clients');
        break;
      default:
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case WorkflowStep.FILE_UPLOAD:
        setCurrentStep(WorkflowStep.WELCOME);
        break;
      case WorkflowStep.MAPPING:
        setCurrentStep(WorkflowStep.FILE_UPLOAD);
        break;
      case WorkflowStep.FIELD_CUSTOMIZATION:
        setCurrentStep(WorkflowStep.MAPPING);
        break;
      case WorkflowStep.CONTEXT_INFORMATION:
        setCurrentStep(WorkflowStep.FIELD_CUSTOMIZATION);
        break;
      default:
        break;
    }
  };

  const getProgress = () => {
    switch (currentStep) {
      case WorkflowStep.WELCOME:
        return 0;
      case WorkflowStep.FILE_UPLOAD:
        return 16;
      case WorkflowStep.MAPPING:
        return 33;
      case WorkflowStep.FIELD_CUSTOMIZATION:
        return 50;
      case WorkflowStep.CONTEXT_INFORMATION:
        return 67;
      case WorkflowStep.PROCESSING:
        return 83;
      case WorkflowStep.COMPLETE:
        return 100;
      default:
        return 0;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case WorkflowStep.WELCOME:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Cross & Upsell Campaign Builder</CardTitle>
              <CardDescription>
                Let's build a targeted campaign to grow your business with existing clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-xl font-semibold mb-4">How it works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        <UploadCloud className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">1. Upload your customer data</h4>
                        <p className="text-muted-foreground">Import your client information from Excel or CSV files</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        <Table className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">2. Map data fields</h4>
                        <p className="text-muted-foreground">Match your file columns to our system fields</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        <Database className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">3. Enrich with context</h4>
                        <p className="text-muted-foreground">Add additional information to enable smart analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        <LayoutList className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">4. Create targeted campaigns</h4>
                        <p className="text-muted-foreground">Use AI to identify opportunities and generate campaigns</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>What file formats are supported?</AccordionTrigger>
                    <AccordionContent>
                      You can upload Excel (.xlsx, .xls) or CSV (.csv) files. Make sure your file has headers in the first row.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>Is my data secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes, all data is processed securely and stored according to industry standards. We never share your client data with third parties.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>Can I use my own custom fields?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely! You can create custom fields to capture any specific client information that's important for your business.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setLocation('/')}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Start Building <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case WorkflowStep.FILE_UPLOAD:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Your Client Data</CardTitle>
              <CardDescription>
                Import client information from an Excel or CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/40">
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drag & drop your file here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports Excel (.xlsx, .xls) and CSV (.csv) files
                    </p>
                    
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                        Browse Files
                      </div>
                      <Input 
                        id="file-upload" 
                        type="file" 
                        accept=".csv,.xlsx,.xls" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>
                </div>
                
                {file && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    
                    <Progress value={uploadProgress} className="h-2" />
                    
                    <p className="text-sm text-muted-foreground">
                      {uploadProgress < 100 
                        ? 'Uploading and analyzing file...' 
                        : 'File analyzed successfully! Click Continue to proceed.'}
                    </p>
                  </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-700">Tips for successful import</h4>
                      <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                        <li>Make sure your file has headers in the first row</li>
                        <li>Remove any empty rows or columns</li>
                        <li>If using CSV, check that text with commas is properly quoted</li>
                        <li>For optimal results, include as much client information as possible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={!file || uploadProgress < 100}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case WorkflowStep.MAPPING:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Map Your Data Fields</CardTitle>
              <CardDescription>
                Match the columns from your file to our system fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">File Preview</h3>
                  <div className="overflow-x-auto">
                    <TableUI>
                      <TableHeader>
                        <TableRow>
                          {fileColumns.map((column, index) => (
                            <TableHead key={index}>{column.name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {fileColumns.map((column, index) => (
                            <TableCell key={index}>{column.sample}</TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </TableUI>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Map Fields</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For each system field below, select the corresponding column from your file.
                    Required fields are marked with an asterisk (*).
                  </p>
                  
                  <div className="space-y-4">
                    {customerFields.map((field) => (
                      <div key={field.name} className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <Label htmlFor={`field-${field.name}`} className="inline-flex items-center">
                            {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{field.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                        </div>
                        
                        <div className="col-span-2">
                          <Select 
                            onValueChange={(value) => handleFieldMapping(field.name, value)}
                            value={field.sourceField}
                          >
                            <SelectTrigger id={`field-${field.name}`}>
                              <SelectValue placeholder="Select a column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">- Not mapped -</SelectItem>
                              {fileColumns.map((column) => (
                                <SelectItem key={column.name} value={column.name}>
                                  {column.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={customerFields.some(f => f.required && !f.mapped)}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case WorkflowStep.FIELD_CUSTOMIZATION:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Customize Customer Fields</CardTitle>
              <CardDescription>
                Add additional fields to better describe your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Why Custom Fields Matter</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Custom fields help you capture specific client information that's unique to your business.
                    This data will enhance our AI's ability to identify the best cross-selling and upselling opportunities.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Examples: Risk tolerance, Contract renewal dates, Family composition, Business assets
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Your Custom Fields</h3>
                  
                  {customFields.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {customFields.map((field, index) => (
                        <div key={index} className="p-4 grid grid-cols-3 gap-4">
                          <div>
                            <p className="font-medium">{field.name}</p>
                            <p className="text-sm text-muted-foreground">{field.type}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                          </div>
                          <div>
                            <Select 
                              onValueChange={(value) => handleFieldMapping(field.name, value)}
                              value={field.sourceField}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Map to column" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">- Not mapped -</SelectItem>
                                {fileColumns.map((column) => (
                                  <SelectItem key={column.name} value={column.name}>
                                    {column.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No custom fields added yet</p>
                    </div>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Add New Custom Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Field</DialogTitle>
                        <DialogDescription>
                          Add a new field to capture additional client information
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="field-name">Field Name</Label>
                          <Input 
                            id="field-name" 
                            placeholder="e.g., RiskTolerance"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="field-type">Field Type</Label>
                          <Select 
                            value={newFieldType} 
                            onValueChange={setNewFieldType}
                          >
                            <SelectTrigger id="field-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="boolean">Yes/No</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="field-description">Description</Label>
                          <Input 
                            id="field-description" 
                            placeholder="What this field represents"
                            value={newFieldDescription}
                            onChange={(e) => setNewFieldDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleAddCustomField}
                          disabled={!newFieldName.trim()}
                        >
                          Add Field
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <Button onClick={handleContinue}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case WorkflowStep.CONTEXT_INFORMATION:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Add Context Information</CardTitle>
              <CardDescription>
                Help our AI understand your data better
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-medium text-primary-foreground mb-2">Why Context Matters</h3>
                  <p className="text-sm">
                    Adding context to your fields helps our AI understand what your data means, not just what it contains.
                    This critical information allows us to provide better insights and recommendations for your campaigns.
                  </p>
                </div>
                
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">Standard Fields</TabsTrigger>
                    <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="space-y-4 mt-4">
                    {customerFields.filter(f => f.mapped).map((field) => (
                      <div key={field.name} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Mapped to: <span className="font-medium">{field.sourceField}</span>
                            </p>
                          </div>
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                            {field.type}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`context-${field.name}`} className="mb-2 block">
                            Provide context about this field
                          </Label>
                          <Input
                            id={`context-${field.name}`}
                            placeholder={`What does ${field.name} represent in your business?`}
                            value={field.context || ''}
                            onChange={(e) => handleFieldContext(field.name, e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Example: "{field.name === 'revenue' 
                              ? 'This represents the total annual revenue in euros for the last fiscal year'
                              : field.name === 'industry' 
                                ? 'This indicates the primary industry sector using standard NACE codes'
                                : 'This field shows how the client prefers to be addressed in formal communications'}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4 mt-4">
                    {customFields.length > 0 ? (
                      customFields.map((field) => (
                        <div key={field.name} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {field.sourceField 
                                  ? `Mapped to: ${field.sourceField}`
                                  : 'Not mapped to any column'}
                              </p>
                            </div>
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                              {field.type}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`context-${field.name}`} className="mb-2 block">
                              Provide context about this field
                            </Label>
                            <Input
                              id={`context-${field.name}`}
                              placeholder={`What does ${field.name} represent in your business?`}
                              value={field.context || ''}
                              onChange={(e) => handleFieldContext(field.name, e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: "This field represents the client's preference for risk in their insurance portfolio, from very conservative to aggressive"
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No custom fields added</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <Button onClick={handleContinue}>
                Process Data <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case WorkflowStep.PROCESSING:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Processing Your Data</CardTitle>
              <CardDescription>
                Please wait while we import and analyze your client information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 py-8">
                <div className="text-center">
                  <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                    <Database className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Processing in progress...</h3>
                  <p className="text-muted-foreground mb-8">
                    This may take a few moments depending on the size of your data
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
                
                <div className="border rounded-lg divide-y">
                  <div className="p-3 flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Validating data</span>
                    </span>
                    <span className="text-sm text-muted-foreground">Complete</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Mapping fields</span>
                    </span>
                    <span className="text-sm text-muted-foreground">Complete</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="flex items-center">
                      {processingProgress >= 50 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin mr-2" />
                      )}
                      <span>Importing records</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {processingProgress >= 50 ? 'Complete' : 'In progress'}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="flex items-center">
                      {processingProgress >= 75 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        processingProgress >= 50 ? (
                          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin mr-2" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted mr-2" />
                        )
                      )}
                      <span>Analyzing for opportunities</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {processingProgress >= 75 ? 'Complete' : processingProgress >= 50 ? 'In progress' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="flex items-center">
                      {processingProgress >= 90 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        processingProgress >= 75 ? (
                          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin mr-2" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted mr-2" />
                        )
                      )}
                      <span>Preparing results</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {processingProgress >= 90 ? 'Complete' : processingProgress >= 75 ? 'In progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case WorkflowStep.COMPLETE:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Import Complete!</CardTitle>
              <CardDescription>
                Your client data has been successfully imported and analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-green-50 mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Success!</h3>
                  <p className="text-muted-foreground mb-4">
                    We've imported {importedCount} clients into your portal
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Clients Imported
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{importedCount}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Potential Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Estimated Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€42,500</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-medium mb-2">What's Next?</h3>
                  <div className="space-y-2">
                    <TooltipProvider delayDuration={100}>
                      <div className="flex items-start">
                        <Tooltip open={showTooltip}>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-primary text-primary-foreground p-1 rounded-full mr-2 flex-shrink-0"
                              onMouseEnter={() => setShowTooltip(true)}
                              onMouseLeave={() => setShowTooltip(false)}
                            >
                              <span className="block w-4 h-4 flex items-center justify-center font-bold">1</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={5} className="bg-black text-white p-2 rounded">
                            <p>Click here after closing this dialog</p>
                            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
                              <ChevronRight className="h-4 w-4 text-black" />
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <div>
                          <span className="font-medium">View your client list</span>
                          <p className="text-sm text-muted-foreground">
                            See all imported clients in the Lists &gt; Clients section
                          </p>
                        </div>
                      </div>
                    </TooltipProvider>
                    
                    <div className="flex items-start">
                      <div className="bg-muted text-muted-foreground p-1 rounded-full mr-2 flex-shrink-0">
                        <span className="block w-4 h-4 flex items-center justify-center font-bold">2</span>
                      </div>
                      <div>
                        <span className="font-medium">Analyze opportunities</span>
                        <p className="text-sm text-muted-foreground">
                          Review AI-identified cross and upsell opportunities
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-muted text-muted-foreground p-1 rounded-full mr-2 flex-shrink-0">
                        <span className="block w-4 h-4 flex items-center justify-center font-bold">3</span>
                      </div>
                      <div>
                        <span className="font-medium">Create targeted campaigns</span>
                        <p className="text-sm text-muted-foreground">
                          Build personalized outreach campaigns based on client data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleContinue} size="lg">
                View Clients
              </Button>
            </CardFooter>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="space-y-1 mb-4">
          <h2 className="text-3xl font-bold">Import Client Data</h2>
          <p className="text-muted-foreground">A step-by-step guide to bring your client data into the platform</p>
        </div>
        
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-primary h-2 transition-all duration-500 ease-in-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep === WorkflowStep.WELCOME ? 1 : 
            currentStep === WorkflowStep.FILE_UPLOAD ? 2 :
            currentStep === WorkflowStep.MAPPING ? 3 :
            currentStep === WorkflowStep.FIELD_CUSTOMIZATION ? 4 :
            currentStep === WorkflowStep.CONTEXT_INFORMATION ? 5 :
            currentStep === WorkflowStep.PROCESSING ? 6 : 7} of 7</span>
          <span>{getProgress()}% Complete</span>
        </div>
      </div>
      
      {renderStepContent()}
    </div>
  );
}