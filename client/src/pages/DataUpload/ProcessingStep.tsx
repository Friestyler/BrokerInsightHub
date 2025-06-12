import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Play, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
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
      setTotalRows(dataRows.length);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to parse CSV file', variant: 'destructive' });
    }
  };

  const validateRow = (rowData: any, mappings: AttributeMapping[]): Array<{ field: string; message: string }> => {
    const errors: Array<{ field: string; message: string }> = [];

    mappings.forEach(mapping => {
      const value = rowData[mapping.csvColumn];
      
      // Check required fields
      if (mapping.isRequired && (!value || value.trim() === '')) {
        errors.push({
          field: mapping.attribute,
          message: `Required field '${mapping.attribute}' is missing or empty`
        });
      }

      // Basic data type validation
      if (value && value.trim()) {
        // Validate email format
        if (mapping.attribute.toLowerCase().includes('email')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              field: mapping.attribute,
              message: `Invalid email format for '${mapping.attribute}'`
            });
          }
        }

        // Validate numeric fields
        if (['value', 'probability', 'customer_id', 'partner_id', 'owner_id', 'id'].includes(mapping.attribute)) {
          if (isNaN(Number(value))) {
            errors.push({
              field: mapping.attribute,
              message: `'${mapping.attribute}' must be a valid number`
            });
          }
        }

        // Validate date fields
        if (mapping.attribute.toLowerCase().includes('date') || mapping.attribute.includes('_at')) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              field: mapping.attribute,
              message: `'${mapping.attribute}' must be a valid date`
            });
          }
        }
      }
    });

    return errors;
  };

  const transformRowData = (rowData: any, mappings: AttributeMapping[]): any => {
    const transformedData: any = {};
    
    mappings.forEach(mapping => {
      const value = rowData[mapping.csvColumn];
      
      if (value && value.trim()) {
        let transformedValue = value.trim();
        
        // Transform based on attribute type
        if (['value', 'probability', 'customer_id', 'partner_id', 'owner_id', 'id'].includes(mapping.attribute)) {
          transformedValue = Number(transformedValue);
        } else if (mapping.attribute.toLowerCase().includes('date') || mapping.attribute.includes('_at')) {
          // Convert to ISO date string
          const date = new Date(transformedValue);
          if (!isNaN(date.getTime())) {
            transformedValue = date.toISOString();
          }
        }
        
        transformedData[mapping.attribute] = transformedValue;
      } else if (mapping.isRequired) {
        // This should be caught by validation, but handle it here too
        transformedData[mapping.attribute] = null;
      }
    });

    // Add standard fields
    if (!transformedData.created_at) {
      transformedData.created_at = new Date().toISOString();
    }
    if (!transformedData.updated_at) {
      transformedData.updated_at = new Date().toISOString();
    }

    return transformedData;
  };

  const processCSVData = async () => {
    if (!csvData.length || !attributeMappings.length) {
      toast({ title: 'Error', description: 'No data or mappings available', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentRow(0);

    const result: ProcessingResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
      validationErrors: [],
      createdRecords: []
    };

    const environmentId = localStorage.getItem('currentEnvironment') || 'degoudse';
    
    try {
      for (let i = 0; i < csvData.length; i++) {
        const rowData = csvData[i];
        setCurrentRow(i + 1);
        setProcessingProgress(((i + 1) / csvData.length) * 100);

        // Validate row
        const validationErrors = validateRow(rowData, attributeMappings);
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => {
            result.validationErrors.push({
              row: rowData._rowNumber,
              field: error.field,
              message: error.message
            });
          });
          result.recordsSkipped++;
          continue;
        }

        // Transform data
        const transformedData = transformRowData(rowData, attributeMappings);

        try {
          // Send to backend for creation
          const response = await fetch(`/api/${environmentId}/create-record`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              entityType: uploadType,
              data: transformedData,
              originalRow: rowData
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            result.errors.push({
              row: rowData._rowNumber,
              message: errorData.error || 'Failed to create record',
              data: transformedData
            });
            result.recordsSkipped++;
          } else {
            const createdRecord = await response.json();
            result.createdRecords.push(createdRecord);
            result.recordsCreated++;
          }
        } catch (error) {
          result.errors.push({
            row: rowData._rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error',
            data: transformedData
          });
          result.recordsSkipped++;
        }

        result.recordsProcessed++;
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      result.success = result.recordsCreated > 0;
      setProcessingResult(result);

      if (result.success) {
        toast({
          title: 'Processing Complete',
          description: `Successfully created ${result.recordsCreated} ${uploadType} records`
        });
      } else {
        toast({
          title: 'Processing Failed',
          description: `No records were created. Check the errors below.`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      toast({
        title: 'Processing Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadErrorReport = () => {
    if (!processingResult) return;

    const errorData = [
      ['Row', 'Type', 'Field', 'Message', 'Data'],
      ...processingResult.validationErrors.map(error => [
        error.row,
        'Validation Error',
        error.field,
        error.message,
        ''
      ]),
      ...processingResult.errors.map(error => [
        error.row,
        'Processing Error',
        '',
        error.message,
        JSON.stringify(error.data || {})
      ])
    ];

    const csv = errorData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadType}_processing_errors.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasValidMappings = attributeMappings.length > 0 && 
    attributeMappings.filter(m => m.isRequired).every(m => m.csvColumn);

  const canProcess = uploadedFile && csvData.length > 0 && hasValidMappings && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Step {currentStep}: {stepName}</h3>
          <p className="text-sm text-muted-foreground">
            Process and validate CSV data to create {uploadType} records
          </p>
        </div>
      </div>

      {/* Pre-processing Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Processing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{csvData.length}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{attributeMappings.length}</div>
              <div className="text-sm text-muted-foreground">Mapped Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {attributeMappings.filter(m => m.isRequired).length}
              </div>
              <div className="text-sm text-muted-foreground">Required Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{uploadType}</div>
              <div className="text-sm text-muted-foreground">Entity Type</div>
            </div>
          </div>

          {/* Validation Status */}
          {hasValidMappings ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All required field mappings are configured. Ready to process {csvData.length} rows.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing required field mappings. Please go back and complete the mapping step.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Processing Controls */}
      {!processingResult && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Start Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <Button 
                onClick={processCSVData}
                disabled={!canProcess}
                size="lg"
                className="w-full max-w-md"
              >
                <Play className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </Button>
              
              {!hasValidMappings && (
                <p className="text-sm text-muted-foreground">
                  Complete field mappings in the previous step to enable processing
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Processing Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Processing row {currentRow} of {totalRows}</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Creating {uploadType} records from CSV data...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {processingResult && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              {processingResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processingResult.recordsProcessed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{processingResult.recordsCreated}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{processingResult.recordsSkipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {processingResult.errors.length + processingResult.validationErrors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Error Summary */}
            {(processingResult.errors.length > 0 || processingResult.validationErrors.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Error Summary</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadErrorReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Report
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {processingResult.validationErrors.slice(0, 10).map((error, index) => (
                    <Alert key={`validation-${index}`} variant="destructive">
                      <AlertDescription>
                        <strong>Row {error.row}:</strong> {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {processingResult.errors.slice(0, 10).map((error, index) => (
                    <Alert key={`error-${index}`} variant="destructive">
                      <AlertDescription>
                        <strong>Row {error.row}:</strong> {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {(processingResult.errors.length + processingResult.validationErrors.length) > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {(processingResult.errors.length + processingResult.validationErrors.length) - 10} more errors...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {processingResult.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully created {processingResult.recordsCreated} {uploadType} records. 
                  You can now proceed to review the results.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mapping
        </Button>
        
        {processingResult && (
          <Button onClick={onNext}>
            View Results
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}