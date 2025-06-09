import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Save, 
  Target, 
  Users, 
  User, 
  Package, 
  X, 
  UserCheck, 
  Building2,
  ArrowRight,
  GitMerge,
  Eye,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface UploadedFile {
  file: File;
  data: any[][];
  headers: string[];
  name: string;
  party: 'party1' | 'party2';
}

interface ColumnMapping {
  columnName: string;
  mappingType: 'entity_field' | 'identifier' | 'skip';
  targetField?: string;
  isIdentifier?: boolean;
  weight?: number; // for matching algorithm
  validationStatus: 'valid' | 'invalid' | 'pending';
}

interface MappingConfiguration {
  party1_name: string;
  party2_name: string;
  entity_type: string;
  matching_fields: string[];
  confidence_threshold: number;
}

// Standard fields for different entity types based on existing schema
const ENTITY_FIELD_MAPPINGS = {
  customers: [
    'name', 'email', 'phone', 'website', 'industry', 'size', 'location', 'description'
  ],
  partners: [
    'name', 'email', 'phone', 'website', 'industry', 'type', 'size', 'location', 'description'
  ],
  vendors: [
    'name', 'email', 'phone', 'website', 'industry', 'type', 'size', 'location', 'description'
  ],
  contacts: [
    'first_name', 'last_name', 'email', 'phone', 'company', 'position', 'notes'
  ]
};

const IDENTIFIER_FIELDS = [
  { value: 'name', label: 'Company/Entity Name', weight: 0.4 },
  { value: 'email', label: 'Email Address', weight: 0.3 },
  { value: 'phone', label: 'Phone Number', weight: 0.2 },
  { value: 'website', label: 'Website URL', weight: 0.1 }
];

export default function UploadMappingWizard() {
  const [uploadedFiles, setUploadedFiles] = useState<{ party1?: UploadedFile; party2?: UploadedFile }>({});
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'mapping' | 'preview' | 'processing'>('upload');
  const [mappingConfig, setMappingConfig] = useState<MappingConfiguration>({
    party1_name: '',
    party2_name: '',
    entity_type: 'customers',
    matching_fields: ['name', 'email'],
    confidence_threshold: 0.8
  });
  const [columnMappings, setColumnMappings] = useState<{
    party1: ColumnMapping[];
    party2: ColumnMapping[];
  }>({ party1: [], party2: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [mappingResults, setMappingResults] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[], party: 'party1' | 'party2') => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1);

        const uploadedFile: UploadedFile = {
          file,
          data: dataRows,
          headers,
          name: file.name,
          party
        };

        setUploadedFiles(prev => ({ ...prev, [party]: uploadedFile }));

        // Initialize column mappings
        const initialMappings: ColumnMapping[] = headers.map(header => ({
          columnName: header,
          mappingType: 'skip',
          validationStatus: 'pending'
        }));

        setColumnMappings(prev => ({ ...prev, [party]: initialMappings }));

        toast({
          title: "File Uploaded",
          description: `${file.name} uploaded successfully with ${headers.length} columns and ${dataRows.length} rows`,
        });

      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to parse the uploaded file. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const party1Dropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'party1'),
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const party2Dropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'party2'),
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const updateColumnMapping = (party: 'party1' | 'party2', columnIndex: number, updates: Partial<ColumnMapping>) => {
    setColumnMappings(prev => ({
      ...prev,
      [party]: prev[party].map((mapping, index) => 
        index === columnIndex ? { ...mapping, ...updates } : mapping
      )
    }));
  };

  const autoMapColumns = (party: 'party1' | 'party2') => {
    const file = uploadedFiles[party];
    if (!file) return;

    const availableFields = ENTITY_FIELD_MAPPINGS[mappingConfig.entity_type as keyof typeof ENTITY_FIELD_MAPPINGS] || [];
    const updatedMappings = columnMappings[party].map(mapping => {
      const columnName = mapping.columnName.toLowerCase();
      
      // Try to find exact matches first
      let targetField = availableFields.find(field => 
        field.toLowerCase() === columnName || 
        columnName.includes(field.toLowerCase())
      );

      if (targetField) {
        return {
          ...mapping,
          mappingType: 'entity_field' as const,
          targetField,
          validationStatus: 'valid' as const
        };
      }

      // Check for identifier fields
      const identifierField = IDENTIFIER_FIELDS.find(field => 
        columnName.includes(field.value.toLowerCase())
      );

      if (identifierField) {
        return {
          ...mapping,
          mappingType: 'identifier' as const,
          targetField: identifierField.value,
          isIdentifier: true,
          weight: identifierField.weight,
          validationStatus: 'valid' as const
        };
      }

      return mapping;
    });

    setColumnMappings(prev => ({ ...prev, [party]: updatedMappings }));

    toast({
      title: "Auto-mapping Complete",
      description: `Automatically mapped columns for ${party === 'party1' ? mappingConfig.party1_name : mappingConfig.party2_name}`,
    });
  };

  const validateMappings = () => {
    const party1Identifiers = columnMappings.party1.filter(m => m.mappingType === 'identifier').length;
    const party2Identifiers = columnMappings.party2.filter(m => m.mappingType === 'identifier').length;

    if (party1Identifiers === 0 || party2Identifiers === 0) {
      toast({
        title: "Validation Error",
        description: "Both parties must have at least one identifier field mapped for matching",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const startMapping = async () => {
    if (!validateMappings()) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentStep('processing');

    try {
      // Simulate processing with progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // API call to process mapping
      const response = await fetch('/api/account-mapping/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: mappingConfig,
          mappings: columnMappings,
          files: {
            party1: uploadedFiles.party1?.name,
            party2: uploadedFiles.party2?.name
          }
        })
      });

      if (response.ok) {
        const results = await response.json();
        setMappingResults(results);
        setProcessingProgress(100);
        
        setTimeout(() => {
          setCurrentStep('preview');
          setIsProcessing(false);
        }, 1000);

        toast({
          title: "Mapping Complete",
          description: `Found ${results.matches?.length || 0} potential matches`,
        });
      }

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process account mapping. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return uploadedFiles.party1 && uploadedFiles.party2;
      case 'configure':
        return mappingConfig.party1_name && mappingConfig.party2_name;
      case 'mapping':
        return validateMappings();
      default:
        return true;
    }
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'upload':
        if (canProceed()) setCurrentStep('configure');
        break;
      case 'configure':
        if (canProceed()) setCurrentStep('mapping');
        break;
      case 'mapping':
        startMapping();
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Account Mapping Wizard</CardTitle>
          <CardDescription>Upload and map entity data from both organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {['upload', 'configure', 'mapping', 'processing', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step ? 'bg-indigo-600 border-indigo-600 text-white' :
                  ['upload', 'configure', 'mapping'].indexOf(currentStep) > index ? 'bg-green-600 border-green-600 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {['upload', 'configure', 'mapping'].indexOf(currentStep) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium capitalize">{step}</span>
                {index < 4 && <ArrowRight className="h-4 w-4 ml-4 text-gray-400" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Party 1 Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Party 1 Data Upload
              </CardTitle>
              <CardDescription>Upload entity data for the first organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...party1Dropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  party1Dropzone.isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...party1Dropzone.getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFiles.party1 ? 'File Uploaded' : 'Upload Excel or CSV'}
                </p>
                <p className="text-sm text-gray-600">
                  {uploadedFiles.party1 
                    ? `${uploadedFiles.party1.name} - ${uploadedFiles.party1.headers.length} columns, ${uploadedFiles.party1.data.length} rows`
                    : 'Drag and drop your file here, or click to browse'
                  }
                </p>
              </div>
              {uploadedFiles.party1 && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">File ready for mapping</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Party 2 Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Party 2 Data Upload
              </CardTitle>
              <CardDescription>Upload entity data for the second organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...party2Dropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  party2Dropzone.isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...party2Dropzone.getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFiles.party2 ? 'File Uploaded' : 'Upload Excel or CSV'}
                </p>
                <p className="text-sm text-gray-600">
                  {uploadedFiles.party2 
                    ? `${uploadedFiles.party2.name} - ${uploadedFiles.party2.headers.length} columns, ${uploadedFiles.party2.data.length} rows`
                    : 'Drag and drop your file here, or click to browse'
                  }
                </p>
              </div>
              {uploadedFiles.party2 && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">File ready for mapping</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle>Mapping Configuration</CardTitle>
            <CardDescription>Configure the basic parameters for account mapping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="party1Name">Party 1 Organization Name</Label>
                <Input
                  id="party1Name"
                  value={mappingConfig.party1_name}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, party1_name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <Label htmlFor="party2Name">Party 2 Organization Name</Label>
                <Input
                  id="party2Name"
                  value={mappingConfig.party2_name}
                  onChange={(e) => setMappingConfig(prev => ({ ...prev, party2_name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={mappingConfig.entity_type} onValueChange={(value) => 
                setMappingConfig(prev => ({ ...prev, entity_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="partners">Partners</SelectItem>
                  <SelectItem value="vendors">Vendors</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="confidenceThreshold">Matching Confidence Threshold</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={mappingConfig.confidence_threshold}
                  onChange={(e) => setMappingConfig(prev => ({ 
                    ...prev, 
                    confidence_threshold: parseFloat(e.target.value) 
                  }))}
                  className="flex-1"
                />
                <Badge variant="outline">
                  {Math.round(mappingConfig.confidence_threshold * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Higher threshold = more strict matching, fewer false positives
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'mapping' && (
        <div className="space-y-6">
          <Tabs defaultValue="party1" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="party1">{mappingConfig.party1_name} Mapping</TabsTrigger>
              <TabsTrigger value="party2">{mappingConfig.party2_name} Mapping</TabsTrigger>
            </TabsList>

            {(['party1', 'party2'] as const).map(party => (
              <TabsContent key={party} value={party}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Column Mapping - {party === 'party1' ? mappingConfig.party1_name : mappingConfig.party2_name}</CardTitle>
                        <CardDescription>Map columns to entity fields and identifiers</CardDescription>
                      </div>
                      <Button variant="outline" onClick={() => autoMapColumns(party)}>
                        <Target className="h-4 w-4 mr-2" />
                        Auto-map
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {columnMappings[party].map((mapping, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">{mapping.columnName}</Label>
                            <p className="text-xs text-gray-500">Source column</p>
                          </div>

                          <div>
                            <Select 
                              value={mapping.mappingType} 
                              onValueChange={(value) => updateColumnMapping(party, index, { 
                                mappingType: value as any,
                                targetField: value === 'skip' ? undefined : mapping.targetField
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entity_field">Entity Field</SelectItem>
                                <SelectItem value="identifier">Identifier Field</SelectItem>
                                <SelectItem value="skip">Skip Column</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            {mapping.mappingType === 'entity_field' && (
                              <Select 
                                value={mapping.targetField} 
                                onValueChange={(value) => updateColumnMapping(party, index, { targetField: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(ENTITY_FIELD_MAPPINGS[mappingConfig.entity_type as keyof typeof ENTITY_FIELD_MAPPINGS] || []).map(field => (
                                    <SelectItem key={field} value={field}>{field}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {mapping.mappingType === 'identifier' && (
                              <Select 
                                value={mapping.targetField} 
                                onValueChange={(value) => updateColumnMapping(party, index, { 
                                  targetField: value,
                                  isIdentifier: true,
                                  weight: IDENTIFIER_FIELDS.find(f => f.value === value)?.weight || 0.1
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select identifier" />
                                </SelectTrigger>
                                <SelectContent>
                                  {IDENTIFIER_FIELDS.map(field => (
                                    <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          <div className="flex items-center">
                            {mapping.mappingType === 'identifier' && mapping.targetField && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Weight: {Math.round((mapping.weight || 0) * 100)}%
                              </Badge>
                            )}
                            {mapping.validationStatus === 'valid' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {currentStep === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitMerge className="h-5 w-5 mr-2" />
              Processing Account Mapping
            </CardTitle>
            <CardDescription>Analyzing data and identifying potential matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadedFiles.party1?.data.length || 0}
                </div>
                <div className="text-sm text-blue-800">{mappingConfig.party1_name} entities</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {uploadedFiles.party2?.data.length || 0}
                </div>
                <div className="text-sm text-purple-800">{mappingConfig.party2_name} entities</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">~</div>
                <div className="text-sm text-green-800">Potential matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            const steps = ['upload', 'configure', 'mapping', 'processing', 'preview'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1] as any);
          }}
          disabled={currentStep === 'upload' || isProcessing}
        >
          Previous
        </Button>
        
        <Button 
          onClick={nextStep}
          disabled={!canProceed() || isProcessing}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {currentStep === 'mapping' ? 'Start Mapping' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}