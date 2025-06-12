import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Play, Download, FileText, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
}

interface ProcessingStepProps {
  uploadedFile: File | null;
  attributeMappings: AttributeMapping[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
}

interface ValidationIssue {
  row: number;
  type: 'empty_required' | 'duplicate' | 'invalid_format';
  field: string;
  value: string;
  message: string;
  solution: 'skip' | 'replace' | 'ignore';
  duplicateOf?: any;
  rowData: any;
}

interface ProcessingResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsSkipped: number;
  errors: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
  validationErrors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdRecords: any[];
}

export default function ProcessingStep({
  uploadedFile,
  attributeMappings,
  uploadType,
  stepName,
  currentStep,
  onNext,
  onBack
}: ProcessingStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [phase, setPhase] = useState<'initial' | 'validation' | 'processing' | 'completed'>('initial');
  const { toast } = useToast();

  // Parse CSV data when component mounts
  useEffect(() => {
    if (uploadedFile) {
      parseCSVData();
    }
  }, [uploadedFile]);

  const parseCSVData = async () => {
    if (!uploadedFile) return;

    try {
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast({ title: 'Error', description: 'CSV file is empty', variant: 'destructive' });
        return;
      }

      // Extract headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);

      // Parse data rows
      const dataRows = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const rowData: any = { _rowNumber: index + 2 }; // +2 because we skip header and are 1-indexed
        
        headers.forEach((header, i) => {
          rowData[header] = values[i] || '';
        });
        
        return rowData;
      });

      setCsvData(dataRows);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to parse CSV file', variant: 'destructive' });
    }
  };

  const runValidation = async () => {
    setIsValidating(true);
    setPhase('validation');
    
    try {
      // First, fetch existing records to check for duplicates
      const response = await fetch(`/api/degoudse/${uploadType}`);
      const existing = response.ok ? await response.json() : [];
      setExistingRecords(existing);

      const issues: ValidationIssue[] = [];
      
      csvData.forEach((row, index) => {
        // Check for empty required fields
        attributeMappings
          .filter(mapping => mapping.isRequired && mapping.csvColumn)
          .forEach(mapping => {
            const value = row[mapping.csvColumn];
            if (!value || value.trim() === '') {
              issues.push({
                row: row._rowNumber,
                type: 'empty_required',
                field: mapping.attribute,
                value: value || '',
                message: `Required field '${mapping.attribute}' is empty`,
                solution: 'skip',
                rowData: row
              });
            }
          });

        // Check for duplicates based on unique identifiers
        const uniqueFields = ['title', 'name', 'email']; // Common unique fields
        uniqueFields.forEach(field => {
          const mapping = attributeMappings.find(m => m.attribute === field);
          if (mapping && mapping.csvColumn) {
            const value = row[mapping.csvColumn];
            if (value && value.trim() !== '') {
              const duplicate = existing.find(record => 
                record[field] && record[field].toLowerCase() === value.toLowerCase()
              );
              
              if (duplicate) {
                issues.push({
                  row: row._rowNumber,
                  type: 'duplicate',
                  field: mapping.attribute,
                  value: value,
                  message: `Duplicate ${field}: '${value}' already exists`,
                  solution: 'replace',
                  duplicateOf: duplicate,
                  rowData: row
                });
              }
            }
          }
        });

        // Check for invalid formats (email, dates, etc.)
        attributeMappings.forEach(mapping => {
          const value = row[mapping.csvColumn];
          if (value && value.trim() !== '') {
            // Email validation
            if (mapping.attribute.toLowerCase().includes('email')) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                issues.push({
                  row: row._rowNumber,
                  type: 'invalid_format',
                  field: mapping.attribute,
                  value: value,
                  message: `Invalid email format: '${value}'`,
                  solution: 'skip',
                  rowData: row
                });
              }
            }
            
            // Date validation
            if (mapping.attribute.toLowerCase().includes('date')) {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                issues.push({
                  row: row._rowNumber,
                  type: 'invalid_format',
                  field: mapping.attribute,
                  value: value,
                  message: `Invalid date format: '${value}'`,
                  solution: 'skip',
                  rowData: row
                });
              }
            }
          }
        });
      });

      setValidationIssues(issues);
      setShowValidation(issues.length > 0);
      
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to validate data', variant: 'destructive' });
    } finally {
      setIsValidating(false);
    }
  };

  const updateIssueSolution = (issueIndex: number, solution: 'skip' | 'replace' | 'ignore') => {
    setValidationIssues(prev => 
      prev.map((issue, index) => 
        index === issueIndex ? { ...issue, solution } : issue
      )
    );
  };

  const processData = async () => {
    setIsProcessing(true);
    setPhase('processing');
    setProcessingProgress(0);

    try {
      // Filter out rows that should be skipped based on validation issues
      const skipRows = new Set(
        validationIssues
          .filter(issue => issue.solution === 'skip')
          .map(issue => issue.row)
      );

      const rowsToProcess = csvData.filter(row => !skipRows.has(row._rowNumber));
      const totalRows = rowsToProcess.length;
      let processedCount = 0;
      let createdCount = 0;
      let skippedCount = 0;
      const errors: any[] = [];
      const createdRecords: any[] = [];

      for (const row of rowsToProcess) {
        try {
          // Transform row data according to attribute mappings
          const transformedData: any = {};
          
          attributeMappings.forEach(mapping => {
            if (mapping.csvColumn && row[mapping.csvColumn] !== undefined) {
              const value = row[mapping.csvColumn];
              
              // Transform data types
              if (mapping.attribute.includes('date') && value) {
                transformedData[mapping.attribute] = new Date(value).toISOString();
              } else if (mapping.attribute === 'value' || mapping.attribute.includes('amount')) {
                transformedData[mapping.attribute] = parseFloat(value) || 0;
              } else {
                transformedData[mapping.attribute] = value;
              }
            }
          });

          // Handle duplicates based on solution
          const duplicateIssue = validationIssues.find(
            issue => issue.row === row._rowNumber && issue.type === 'duplicate'
          );

          let response;
          if (duplicateIssue && duplicateIssue.solution === 'replace') {
            // Update existing record
            response = await fetch(`/api/degoudse/${uploadType}/${duplicateIssue.duplicateOf.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transformedData)
            });
          } else {
            // Create new record
            response = await fetch(`/api/degoudse/create-record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entityType: uploadType,
                data: transformedData
              })
            });
          }

          if (response.ok) {
            const result = await response.json();
            createdRecords.push(result);
            createdCount++;
          } else {
            const errorText = await response.text();
            errors.push({
              row: row._rowNumber,
              message: `Failed to ${duplicateIssue?.solution === 'replace' ? 'update' : 'create'} record: ${errorText}`,
              data: transformedData
            });
            skippedCount++;
          }
          
        } catch (error) {
          errors.push({
            row: row._rowNumber,
            message: `Processing error: ${error}`,
            data: row
          });
          skippedCount++;
        }

        processedCount++;
        setProcessingProgress((processedCount / totalRows) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const result: ProcessingResult = {
        success: errors.length === 0,
        recordsProcessed: processedCount,
        recordsCreated: createdCount,
        recordsSkipped: skippedCount + skipRows.size,
        errors,
        validationErrors: [],
        createdRecords
      };

      setProcessingResult(result);
      setIsCompleted(true);
      setPhase('completed');

      toast({
        title: 'Processing Complete',
        description: `${createdCount} records created, ${skippedCount + skipRows.size} skipped`
      });

    } catch (error) {
      toast({ title: 'Error', description: 'Processing failed', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadErrorReport = () => {
    if (!processingResult) return;

    const errorData = [
      ['Row', 'Error', 'Data'],
      ...processingResult.errors.map(error => [
        error.row,
        error.message,
        JSON.stringify(error.data)
      ])
    ];

    const csv = errorData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadType}_processing_errors.csv`;
    a.click();
  };

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'empty_required': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'duplicate': return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case 'invalid_format': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSolutionColor = (solution: string) => {
    switch (solution) {
      case 'skip': return 'text-red-600';
      case 'replace': return 'text-blue-600';
      case 'ignore': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Step {currentStep}: {stepName}</h2>
        <p className="text-gray-600">
          {phase === 'initial' && 'Review and validate your data before processing'}
          {phase === 'validation' && 'Validating data and checking for issues...'}
          {phase === 'processing' && 'Processing records and creating entries...'}
          {phase === 'completed' && 'Data processing completed successfully'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Initial Phase */}
          {phase === 'initial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Data Ready</h3>
                  <p className="text-sm text-gray-600">{csvData.length} rows to process</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Mappings Set</h3>
                  <p className="text-sm text-gray-600">{attributeMappings.filter(m => m.csvColumn).length} attributes mapped</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Play className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Ready to Process</h3>
                  <p className="text-sm text-gray-600">Click Start to begin validation</p>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={runValidation} disabled={isValidating} size="lg">
                  {isValidating ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                      Validating Data...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Validation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Validation Phase */}
          {phase === 'validation' && showValidation && (
            <div className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {validationIssues.length} issues that need your attention before processing.
                  Please review and choose how to handle each issue.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="issues">
                    Issues ({validationIssues.length})
                  </TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="issues" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {validationIssues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">Row {issue.row}</Badge>
                              <Badge variant={
                                issue.type === 'empty_required' ? 'destructive' :
                                issue.type === 'duplicate' ? 'default' : 'secondary'
                              }>
                                {issue.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{issue.message}</p>
                            <p className="text-xs text-gray-500">Field: {issue.field}, Value: "{issue.value}"</p>
                            {issue.duplicateOf && (
                              <p className="text-xs text-blue-600">
                                Duplicate of existing record: {JSON.stringify(issue.duplicateOf, null, 2).slice(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Solution:</span>
                          <Select
                            value={issue.solution}
                            onValueChange={(value: 'skip' | 'replace' | 'ignore') => 
                              updateIssueSolution(index, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">
                                <div className="flex items-center gap-2">
                                  <Trash2 className="h-3 w-3" />
                                  Skip
                                </div>
                              </SelectItem>
                              {issue.type === 'duplicate' && (
                                <SelectItem value="replace">
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="h-3 w-3" />
                                    Replace
                                  </div>
                                </SelectItem>
                              )}
                              <SelectItem value="ignore">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3" />
                                  Ignore
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <span className={`text-xs ${getSolutionColor(issue.solution)}`}>
                            {issue.solution === 'skip' && 'Row will be skipped'}
                            {issue.solution === 'replace' && 'Will update existing record'}
                            {issue.solution === 'ignore' && 'Will process as-is'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <Trash2 className="mx-auto h-8 w-8 text-red-600 mb-2" />
                      <h3 className="font-medium">To Skip</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {validationIssues.filter(i => i.solution === 'skip').length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <RefreshCw className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium">To Replace</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {validationIssues.filter(i => i.solution === 'replace').length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                      <h3 className="font-medium">To Ignore</h3>
                      <p className="text-2xl font-bold text-gray-600">
                        {validationIssues.filter(i => i.solution === 'ignore').length}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="text-center">
                <Button onClick={processData} disabled={isProcessing} size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Proceed with Processing
                </Button>
              </div>
            </div>
          )}

          {/* No Validation Issues */}
          {phase === 'validation' && !showValidation && (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <h3 className="text-lg font-medium">No Issues Found!</h3>
              <p className="text-gray-600">All data looks good and ready for processing.</p>
              <Button onClick={processData} disabled={isProcessing} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Processing
              </Button>
            </div>
          )}

          {/* Processing Phase */}
          {phase === 'processing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                  isProcessing ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {isProcessing ? (
                    <AlertCircle className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isProcessing ? 'Processing Data...' : 'Processing Complete!'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isProcessing 
                    ? 'Creating records in your database. This may take a few moments.' 
                    : 'All records have been processed successfully.'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>

              {processingResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-medium">Created</h3>
                    <p className="text-2xl font-bold text-green-600">{processingResult.recordsCreated}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Trash2 className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                    <h3 className="font-medium">Skipped</h3>
                    <p className="text-2xl font-bold text-gray-600">{processingResult.recordsSkipped}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
                    <h3 className="font-medium">Errors</h3>
                    <p className="text-2xl font-bold text-red-600">{processingResult.errors.length}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Phase */}
          {phase === 'completed' && processingResult && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-lg font-medium">Processing Complete!</h3>
                <p className="text-gray-600">
                  {processingResult.recordsCreated} {uploadType} records have been successfully processed.
                </p>
              </div>

              {processingResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {processingResult.errors.length} rows had errors during processing.
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal underline ml-1"
                      onClick={downloadErrorReport}
                    >
                      Download error report
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {isCompleted && (
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}