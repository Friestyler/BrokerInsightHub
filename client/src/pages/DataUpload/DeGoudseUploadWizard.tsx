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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Settings, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface UploadedFile {
  file: File;
  data: any[][];
  headers: string[];
  name: string;
}

interface ColumnMapping {
  columnName: string;
  mappingType: 'attribute' | 'relationship' | 'skip';
  targetField?: string;
  entityType?: 'customer' | 'partner' | 'opportunity';
  isRequired?: boolean;
  validationStatus: 'valid' | 'invalid' | 'pending';
}

interface MappingTemplate {
  name: string;
  mappings: ColumnMapping[];
  createdAt: string;
}

const OPPORTUNITY_FIELDS = [
  'title', 'description', 'probability', 'estimatedValue', 'stage', 'type', 'status',
  'expectedCloseDate', 'notes', 'priority', 'source', 'tags'
];

const ENTITY_RELATIONSHIP_FIELDS = [
  { value: 'customer_name', label: 'Customer Name', entityType: 'customer' },
  { value: 'partner_name', label: 'Partner Name', entityType: 'partner' },
  { value: 'customer_email', label: 'Customer Email', entityType: 'customer' },
  { value: 'partner_email', label: 'Partner Email', entityType: 'partner' },
  { value: 'customer_phone', label: 'Customer Phone', entityType: 'customer' },
  { value: 'partner_phone', label: 'Partner Phone', entityType: 'partner' }
];

export default function DeGoudseUploadWizard() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'processing' | 'complete'>('upload');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<MappingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length === 0) {
        toast({
          title: "Error",
          description: "The Excel file appears to be empty.",
          variant: "destructive"
        });
        return;
      }

      const headers = data[0] as string[];
      const fileData: UploadedFile = {
        file,
        data: data.slice(1), // Remove header row
        headers,
        name: file.name.replace('.xlsx', '').replace('.xls', '')
      };

      setUploadedFile(fileData);
      
      // Initialize column mappings
      const initialMappings: ColumnMapping[] = headers.map(header => ({
        columnName: header,
        mappingType: 'attribute',
        validationStatus: 'pending'
      }));
      
      setColumnMappings(initialMappings);
      setCurrentStep('mapping');

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${data.length - 1} rows with ${headers.length} columns.`
      });

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process the Excel file. Please check the file format.",
        variant: "destructive"
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const updateColumnMapping = (index: number, updates: Partial<ColumnMapping>) => {
    setColumnMappings(prev => {
      const newMappings = [...prev];
      newMappings[index] = { ...newMappings[index], ...updates };
      
      // Validate mapping
      if (updates.mappingType && updates.targetField) {
        newMappings[index].validationStatus = 'valid';
      } else if (updates.mappingType === 'skip') {
        newMappings[index].validationStatus = 'valid';
      } else {
        newMappings[index].validationStatus = 'invalid';
      }
      
      return newMappings;
    });
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for this mapping template.",
        variant: "destructive"
      });
      return;
    }

    const template: MappingTemplate = {
      name: templateName,
      mappings: columnMappings,
      createdAt: new Date().toISOString()
    };

    setSavedTemplates(prev => [...prev, template]);
    localStorage.setItem('deGoudseMappingTemplates', JSON.stringify([...savedTemplates, template]));
    
    toast({
      title: "Template Saved",
      description: `Mapping template "${templateName}" has been saved for reuse.`
    });
    
    setTemplateName('');
  };

  const loadTemplate = (templateName: string) => {
    const template = savedTemplates.find(t => t.name === templateName);
    if (template && uploadedFile) {
      // Apply template mappings to current columns
      const updatedMappings = uploadedFile.headers.map(header => {
        const templateMapping = template.mappings.find(m => m.columnName === header);
        return templateMapping || {
          columnName: header,
          mappingType: 'attribute' as const,
          validationStatus: 'pending' as const
        };
      });
      
      setColumnMappings(updatedMappings);
      
      toast({
        title: "Template Applied",
        description: `Applied mapping template "${templateName}".`
      });
    }
  };

  const processUpload = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // Prepare the data for upload
      const uploadData = {
        fileName: uploadedFile.name,
        columnMappings,
        data: uploadedFile.data,
        headers: uploadedFile.headers
      };

      // Send to De Goudse environment endpoint
      const response = await fetch('/api/degoudse/upload-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const results = await response.json();
      setProcessedResults(results);
      setCurrentStep('complete');

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${results.opportunitiesCreated} opportunities and ${results.entitiesCreated} new entities.`
      });

    } catch (error) {
      console.error('Upload processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the upload. Please try again.",
        variant: "destructive"
      });
      setCurrentStep('mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWizard = () => {
    setUploadedFile(null);
    setCurrentStep('upload');
    setColumnMappings([]);
    setProcessedResults(null);
    setSelectedTemplate('');
    setTemplateName('');
  };

  const getValidMappingsCount = () => {
    return columnMappings.filter(m => m.validationStatus === 'valid').length;
  };

  const canProceed = () => {
    return columnMappings.length > 0 && columnMappings.every(m => m.validationStatus === 'valid');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            De Goudse Data Use Case Upload
          </CardTitle>
          <CardDescription>
            Upload Excel files to automatically create opportunities with intelligent entity linking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress 
              value={
                currentStep === 'upload' ? 25 : 
                currentStep === 'mapping' ? 50 : 
                currentStep === 'processing' ? 75 : 100
              } 
              className="w-full" 
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Upload</span>
              <span>Mapping</span>
              <span>Processing</span>
              <span>Complete</span>
            </div>
          </div>

          {currentStep === 'upload' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your Excel file here' : 'Upload Excel File'}
              </h3>
              <p className="text-gray-600">
                Drag and drop an Excel file, or click to browse. 
                Each row will become an opportunity record.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Supported formats: .xlsx, .xls
              </div>
            </div>
          )}

          {currentStep === 'mapping' && uploadedFile && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Column Mapping</h3>
                  <p className="text-gray-600">
                    Map each column to opportunity attributes or entity relationships
                  </p>
                </div>
                <Badge variant="outline">
                  {getValidMappingsCount()} / {columnMappings.length} mapped
                </Badge>
              </div>

              {savedTemplates.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <Label>Use Saved Template:</Label>
                      <Select value={selectedTemplate} onValueChange={(value) => {
                        setSelectedTemplate(value);
                        loadTemplate(value);
                      }}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedTemplates.map(template => (
                            <SelectItem key={template.name} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {columnMappings.map((mapping, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{mapping.columnName}</Badge>
                        {mapping.validationStatus === 'valid' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {mapping.validationStatus === 'invalid' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      <Select
                        value={mapping.mappingType}
                        onValueChange={(value: 'attribute' | 'relationship' | 'skip') =>
                          updateColumnMapping(index, { mappingType: value, targetField: undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attribute">Opportunity Attribute</SelectItem>
                          <SelectItem value="relationship">Entity Relationship</SelectItem>
                          <SelectItem value="skip">Skip Column</SelectItem>
                        </SelectContent>
                      </Select>

                      {mapping.mappingType === 'attribute' && (
                        <Select
                          value={mapping.targetField || ''}
                          onValueChange={(value) => updateColumnMapping(index, { targetField: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPPORTUNITY_FIELDS.map(field => (
                              <SelectItem key={field} value={field}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {mapping.mappingType === 'relationship' && (
                        <Select
                          value={mapping.targetField || ''}
                          onValueChange={(value) => {
                            const relationship = ENTITY_RELATIONSHIP_FIELDS.find(r => r.value === value);
                            updateColumnMapping(index, { 
                              targetField: value,
                              entityType: relationship?.entityType as 'customer' | 'partner'
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {ENTITY_RELATIONSHIP_FIELDS.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {mapping.mappingType === 'skip' && (
                        <div className="text-gray-500 italic">Column will be ignored</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Template name (optional)"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={saveTemplate} variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button onClick={resetWizard} variant="outline">
                  Start Over
                </Button>
                <Button 
                  onClick={processUpload} 
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Process Upload
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Processing Upload</h3>
              <p className="text-gray-600">
                Creating opportunities and linking entities...
              </p>
            </div>
          )}

          {currentStep === 'complete' && processedResults && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-green-700">Upload Complete!</h3>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {processedResults.opportunitiesCreated}
                    </div>
                    <div className="text-sm text-gray-600">Opportunities</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {processedResults.entitiesCreated}
                    </div>
                    <div className="text-sm text-gray-600">New Entities</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className="text-sm text-gray-600">Saved List</div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-gray-600">
                A new saved list "{uploadedFile?.name}" has been created under Opportunities &gt; Collaborate.
              </p>

              <div className="flex justify-center gap-4">
                <Button onClick={resetWizard} variant="outline">
                  Upload Another File
                </Button>
                <Button onClick={() => window.location.href = '/opportunities'}>
                  View Opportunities
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}