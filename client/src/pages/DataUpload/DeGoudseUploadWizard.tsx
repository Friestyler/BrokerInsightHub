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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Settings, Save, Target, Users, User, Package, X, UserCheck } from "lucide-react";
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
  mappingType: 'opportunity_attribute' | 'entity_relationship' | 'skip';
  targetField?: string;
  entityType?: 'customer' | 'partner' | 'vendor' | 'product' | 'user' | 'contact';
  isRequired?: boolean;
  validationStatus: 'valid' | 'invalid' | 'pending';
}

interface MappingTemplate {
  id: number;
  name: string;
  description: string;
  column_mappings: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Updated to match actual database schema
const OPPORTUNITY_FIELDS = [
  'title', 'description', 'probability', 'estimated_value', 'stage', 'type', 'status',
  'expected_close_date', 'notes', 'priority', 'source', 'tags'
];

const CUSTOMER_FIELDS = [
  'name', 'description', 'industry', 'size', 'location', 'email', 'phone', 'website'
];

const PARTNER_FIELDS = [
  'name', 'description', 'industry', 'type', 'size', 'location', 'email', 'phone', 'website'
];

const VENDOR_FIELDS = [
  'name', 'description', 'industry', 'type', 'size', 'location', 'email', 'phone', 'website'
];

const PRODUCT_FIELDS = [
  'name', 'description', 'category', 'type', 'provider', 'premium', 'coverage', 'deductible'
];

const USER_FIELDS = [
  'username', 'first_name', 'last_name', 'email', 'phone', 'department', 'role', 'is_active'
];

const CONTACT_FIELDS = [
  'first_name', 'last_name', 'email', 'phone', 'company', 'position', 'notes', 'linked_entity_type', 'linked_entity_id'
];

const ENTITY_TYPES = [
  { value: 'customer', label: 'Customer', icon: '👤', fields: CUSTOMER_FIELDS },
  { value: 'partner', label: 'Partner', icon: '🤝', fields: PARTNER_FIELDS },
  { value: 'vendor', label: 'Vendor', icon: '🏢', fields: VENDOR_FIELDS },
  { value: 'product', label: 'Product', icon: '📦', fields: PRODUCT_FIELDS },
  { value: 'user', label: 'User', icon: '👥', fields: USER_FIELDS },
  { value: 'contact', label: 'Contact', icon: '📞', fields: CONTACT_FIELDS }
];

// Helper function to get fields for entity type
const getEntityFields = (entityType: string) => {
  const entity = ENTITY_TYPES.find(e => e.value === entityType);
  return entity ? entity.fields : [];
};

const MAPPING_OPTIONS = [
  { value: "opportunity_attribute", label: "Opportunity Attribute", icon: Target },
  { value: "entity_relationship", label: "Entity Relationship", icon: Users },
  { value: "skip", label: "Skip Column", icon: X }
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

  // Load saved templates on component mount
  React.useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const response = await fetch('/api/degoudse/mapping-templates');
      if (response.ok) {
        const templates = await response.json();
        setSavedTemplates(templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

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
        mappingType: 'opportunity_attribute',
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
      
      // Validate mapping based on the new structure
      const mapping = newMappings[index];
      if (mapping.mappingType === 'skip') {
        mapping.validationStatus = 'valid';
      } else if (mapping.mappingType === 'opportunity_attribute' && mapping.targetField) {
        mapping.validationStatus = 'valid';
      } else if (mapping.mappingType === 'entity_relationship' && mapping.entityType && mapping.targetField) {
        mapping.validationStatus = 'valid';
      } else {
        mapping.validationStatus = 'invalid';
      }
      
      return newMappings;
    });
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for this mapping template.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/degoudse/mapping-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName.trim(),
          description: `Template for ${uploadedFile?.name || 'data upload'}`,
          columnMappings: columnMappings
        })
      });

      if (response.ok) {
        await loadSavedTemplates(); // Reload templates
        setTemplateName('');
        toast({
          title: "Template Saved",
          description: `Mapping template "${templateName}" has been saved for reuse.`
        });
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: "Save Failed",
        description: "Could not save the mapping template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id.toString() === templateId);
    if (template && uploadedFile) {
      // Parse the stored column mappings and apply them to current file headers
      const storedMappings = JSON.parse(template.column_mappings);
      const newMappings: ColumnMapping[] = uploadedFile.headers.map(header => {
        const existingMapping = storedMappings.find((m: any) => m.columnName === header);
        if (existingMapping) {
          return {
            ...existingMapping,
            validationStatus: 'valid' as const
          };
        }
        return {
          columnName: header,
          mappingType: 'skip' as const,
          validationStatus: 'pending' as const
        };
      });
      setColumnMappings(newMappings);
      
      toast({
        title: "Template Applied",
        description: `Applied mapping template "${template.name}".`
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

      const totalEntities = results.entityStats ? Object.values(results.entityStats).reduce((a: number, b: number) => a + b, 0) : 0;
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${results.rowsProcessed} rows, created ${results.opportunitiesCreated} opportunities and ${totalEntities} new entities.`
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
                            <SelectItem key={template.id} value={template.id.toString()}>
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
                        onValueChange={(value: 'opportunity_attribute' | 'entity_relationship' | 'skip') =>
                          updateColumnMapping(index, { mappingType: value, targetField: undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAPPING_OPTIONS.map(option => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {/* Step 2: If Opportunity Attribute, show opportunity fields */}
                      {mapping.mappingType === 'opportunity_attribute' && (
                        <Select
                          value={mapping.targetField || ''}
                          onValueChange={(value) => updateColumnMapping(index, { targetField: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select opportunity field" />
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

                      {/* Step 2: If Entity Relationship, show entity types */}
                      {mapping.mappingType === 'entity_relationship' && !mapping.entityType && (
                        <Select
                          value={mapping.entityType || ''}
                          onValueChange={(value) => updateColumnMapping(index, { 
                            entityType: value as 'customer' | 'partner' | 'vendor' | 'contact' | 'product' | 'user',
                            targetField: undefined // Reset target field when entity changes
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ENTITY_TYPES.map(entity => (
                              <SelectItem key={entity.value} value={entity.value}>
                                <div className="flex items-center gap-2">
                                  <span>{entity.icon}</span>
                                  <span>{entity.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Step 3: If Entity Relationship with entity selected, show entity attributes */}
                      {mapping.mappingType === 'entity_relationship' && mapping.entityType && (
                        <div className="flex gap-2">
                          <Select
                            value={mapping.entityType}
                            onValueChange={(value) => updateColumnMapping(index, { 
                              entityType: value as 'customer' | 'partner' | 'vendor' | 'contact' | 'product' | 'user',
                              targetField: undefined
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ENTITY_TYPES.map(entity => (
                                <SelectItem key={entity.value} value={entity.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{entity.icon}</span>
                                    <span>{entity.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={mapping.targetField || ''}
                            onValueChange={(value) => updateColumnMapping(index, { targetField: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${mapping.entityType} field`} />
                            </SelectTrigger>
                            <SelectContent>
                              {getEntityFields(mapping.entityType)?.map(field => (
                                <SelectItem key={field} value={field}>
                                  {field.charAt(0).toUpperCase() + field.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
            <div className="text-center py-8 space-y-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-green-700">Upload Complete!</h3>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
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
                      {processedResults.rowsProcessed}
                    </div>
                    <div className="text-sm text-gray-600">Rows Processed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className="text-sm text-gray-600">Saved List</div>
                  </CardContent>
                </Card>
              </div>

              {processedResults.entityStats && Object.values(processedResults.entityStats).some((count: any) => count > 0) && (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-lg">Entities Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {processedResults.entityStats.customers > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">{processedResults.entityStats.customers}</div>
                          <div className="text-sm text-blue-700">Customers</div>
                        </div>
                      )}
                      {processedResults.entityStats.partners > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-purple-600">{processedResults.entityStats.partners}</div>
                          <div className="text-sm text-purple-700">Partners</div>
                        </div>
                      )}
                      {processedResults.entityStats.vendors > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-orange-600">{processedResults.entityStats.vendors}</div>
                          <div className="text-sm text-orange-700">Vendors</div>
                        </div>
                      )}
                      {processedResults.entityStats.products > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-600">{processedResults.entityStats.products}</div>
                          <div className="text-sm text-green-700">Products</div>
                        </div>
                      )}
                      {processedResults.entityStats.users > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-gray-600">{processedResults.entityStats.users}</div>
                          <div className="text-sm text-gray-700">Users</div>
                        </div>
                      )}
                      {processedResults.entityStats.contacts > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-yellow-600">{processedResults.entityStats.contacts}</div>
                          <div className="text-sm text-yellow-700">Contacts</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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