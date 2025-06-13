import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Play, Download, FileText, AlertTriangle, Trash2, RefreshCw, Filter, X, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  type: 'missing_required' | 'duplicate' | 'invalid_format';
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
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredIssues, setFilteredIssues] = useState<ValidationIssue[]>([]);
  const [activeFilters, setActiveFilters] = useState<Array<{key: string, value: string, label: string}>>([]);
  const { toast } = useToast();

  // Parse CSV data when component mounts
  useEffect(() => {
    if (uploadedFile) {
      parseCSVData();
    }
  }, [uploadedFile]);

  // Filter issues based on filters
  useEffect(() => {
    let filtered = validationIssues;
    const activeFiltersArray: Array<{key: string, value: string, label: string}> = [];
    
    Object.entries(filters).forEach(([field, value]) => {
      if (value.trim()) {
        filtered = filtered.filter(issue => {
          if (field === 'issueType') {
            return issue.type.toLowerCase().includes(value.toLowerCase());
          } else if (field === 'field') {
            return issue.field.toLowerCase().includes(value.toLowerCase());
          } else if (field === 'value') {
            return issue.value.toLowerCase().includes(value.toLowerCase());
          } else if (field === 'message') {
            return issue.message.toLowerCase().includes(value.toLowerCase());
          } else {
            const rowValue = issue.rowData[field];
            return rowValue && rowValue.toString().toLowerCase().includes(value.toLowerCase());
          }
        });
        
        // Create readable label for active filter
        let label = field;
        if (field === 'issueType') label = 'Issue Type';
        else if (field === 'field') label = 'Field';
        else if (field === 'value') label = 'Value';
        else if (field === 'message') label = 'Message';
        
        activeFiltersArray.push({
          key: field,
          value: value,
          label: `${label}: ${value}`
        });
      }
    });
    
    setFilteredIssues(filtered);
    setActiveFilters(activeFiltersArray);
  }, [validationIssues, filters]);

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
        // Check for empty required fields - only validate mandatory attributes
        attributeMappings
          .filter(mapping => mapping.isRequired && mapping.csvColumn)
          .forEach(mapping => {
            const value = row[mapping.csvColumn];
            if (!value || value.trim() === '') {
              issues.push({
                row: row._rowNumber,
                type: 'missing_required',
                field: mapping.attribute,
                value: value || '',
                message: `Missing required value for '${mapping.attribute}'`,
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
              const duplicate = existing.find((record: any) => 
                record[field] && record[field].toLowerCase() === value.toLowerCase()
              );
              
              if (duplicate) {
                issues.push({
                  row: row._rowNumber,
                  type: 'duplicate',
                  field: mapping.attribute,
                  value: value,
                  message: `Duplicate ${field}: '${value}' already exists`,
                  solution: 'ignore',
                  duplicateOf: duplicate,
                  rowData: row
                });
              }
            }
          }
        });

        // Note: ID conflicts are automatically handled by skipping ID field during insertion

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
            
            // Numeric validation for integer fields
            if (mapping.attribute === 'probability' || mapping.attribute.includes('Id') || mapping.attribute === 'id') {
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                issues.push({
                  row: row._rowNumber,
                  type: 'invalid_format',
                  field: mapping.attribute,
                  value: value,
                  message: `Invalid numeric value for '${mapping.attribute}': '${value}'`,
                  solution: 'skip',
                  rowData: row
                });
              }
            }
            
            // Numeric validation for decimal fields
            if (mapping.attribute === 'value' || mapping.attribute.includes('amount') || mapping.attribute.includes('Value')) {
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                issues.push({
                  row: row._rowNumber,
                  type: 'invalid_format',
                  field: mapping.attribute,
                  value: value,
                  message: `Invalid decimal value for '${mapping.attribute}': '${value}'`,
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

  const toggleIssueSelection = (issueIndex: number) => {
    setSelectedIssues(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(issueIndex)) {
        newSelected.delete(issueIndex);
      } else {
        newSelected.add(issueIndex);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map((_, index) => validationIssues.indexOf(_))));
    }
  };

  const bulkUpdateSolution = (solution: 'skip' | 'replace' | 'ignore') => {
    setValidationIssues(prev => 
      prev.map((issue, index) => 
        selectedIssues.has(index) ? { ...issue, solution } : issue
      )
    );
    setSelectedIssues(new Set());
  };

  const updateFilter = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const removeFilter = (filterKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
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
              
              // Skip ID field to avoid primary key conflicts - let database auto-generate
              if (mapping.attribute === 'id') {
                return;
              }
              
              // Transform data types
              if (mapping.attribute.includes('date') && value) {
                transformedData[mapping.attribute] = new Date(value).toISOString();
              } else if (mapping.attribute === 'value' || mapping.attribute.includes('amount') || mapping.attribute.includes('Value')) {
                transformedData[mapping.attribute] = parseFloat(value) || 0;
              } else if (mapping.attribute === 'probability' || mapping.attribute.includes('Id')) {
                // Handle numeric fields that should be integers
                const numValue = parseFloat(value);
                transformedData[mapping.attribute] = isNaN(numValue) ? 0 : Math.round(numValue);
              } else {
                transformedData[mapping.attribute] = value;
              }
            }
          });

          // Handle duplicates based on solution
          const duplicateIssue = validationIssues.find(
            issue => issue.row === row._rowNumber && issue.type === 'duplicate'
          );

          // Skip rows that are marked to be skipped
          if (duplicateIssue && duplicateIssue.solution === 'skip') {
            console.log('Skipping row due to duplicate with skip solution:', row._rowNumber);
            skippedCount++;
            continue;
          }

          // For 'ignore' solution, proceed with creating new record despite duplicate warning

          let response;
          if (duplicateIssue && duplicateIssue.solution === 'replace') {
            // Update existing record
            console.log('Updating existing record:', duplicateIssue.duplicateOf.id);
            response = await fetch(`/api/degoudse/${uploadType}/${duplicateIssue.duplicateOf.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transformedData)
            });
          } else {
            // Create new record
            console.log('Creating new record for row:', row._rowNumber);
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
            console.error('Record creation failed:', {
              row: row._rowNumber,
              status: response.status,
              statusText: response.statusText,
              errorText,
              transformedData,
              originalRow: row
            });
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
      case 'missing_required': return <AlertCircle className="h-4 w-4 text-red-500" />;
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
              <div className="flex items-center justify-end">
                <Button onClick={processData} disabled={isProcessing} size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Proceed with Processing
                </Button>
              </div>

              {/* Summary Stats - Moved to top */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="mx-auto h-6 w-6 text-orange-600 mb-2" />
                  <h3 className="font-medium text-sm">Total Issues</h3>
                  <p className="text-2xl font-bold text-orange-700">{validationIssues.length}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <Trash2 className="mx-auto h-6 w-6 text-red-600 mb-2" />
                  <h3 className="font-medium text-sm">To Skip</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {validationIssues.filter(i => i.solution === 'skip').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <RefreshCw className="mx-auto h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-medium text-sm">To Replace</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {validationIssues.filter(i => i.solution === 'replace').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">To Process</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      // Get unique row numbers that should be skipped
                      const skipRows = new Set(
                        validationIssues
                          .filter(issue => issue.solution === 'skip')
                          .map(issue => issue.row)
                      );
                      return csvData.length - skipRows.size;
                    })()}
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {validationIssues.length} issues that need your attention before processing.
                  Please review and choose how to handle each issue.
                </AlertDescription>
              </Alert>

              {/* Bulk Actions Bar */}
              {selectedIssues.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedIssues.size} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkUpdateSolution('skip')}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Skip Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkUpdateSolution('replace')}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Replace Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkUpdateSolution('ignore')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ignore Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Active Filters:</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.key}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {filter.label}
                        <button
                          onClick={() => removeFilter(filter.key)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIssues.size === filteredIssues.length && filteredIssues.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Row</TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-1">
                          <span>Issue Type</span>
                          <button
                            onClick={() => updateFilter('issueType', '')}
                            className="text-gray-400 hover:text-blue-600 p-0.5"
                            title="Filter by issue type"
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        </div>
                        {filters.hasOwnProperty('issueType') && (
                          <Input
                            placeholder="Filter issue type..."
                            value={filters.issueType || ''}
                            onChange={(e) => updateFilter('issueType', e.target.value)}
                            className="h-6 mt-1 text-xs"
                            autoFocus
                          />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-1">
                          <span>Field</span>
                          <button
                            onClick={() => updateFilter('field', '')}
                            className="text-gray-400 hover:text-blue-600 p-0.5"
                            title="Filter by field"
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        </div>
                        {filters.hasOwnProperty('field') && (
                          <Input
                            placeholder="Filter field..."
                            value={filters.field || ''}
                            onChange={(e) => updateFilter('field', e.target.value)}
                            className="h-6 mt-1 text-xs"
                            autoFocus
                          />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-1">
                          <span>Value</span>
                          <button
                            onClick={() => updateFilter('value', '')}
                            className="text-gray-400 hover:text-blue-600 p-0.5"
                            title="Filter by value"
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        </div>
                        {filters.hasOwnProperty('value') && (
                          <Input
                            placeholder="Filter value..."
                            value={filters.value || ''}
                            onChange={(e) => updateFilter('value', e.target.value)}
                            className="h-6 mt-1 text-xs"
                            autoFocus
                          />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-1">
                          <span>Message</span>
                          <button
                            onClick={() => updateFilter('message', '')}
                            className="text-gray-400 hover:text-blue-600 p-0.5"
                            title="Filter by message"
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        </div>
                        {filters.hasOwnProperty('message') && (
                          <Input
                            placeholder="Filter message..."
                            value={filters.message || ''}
                            onChange={(e) => updateFilter('message', e.target.value)}
                            className="h-6 mt-1 text-xs"
                            autoFocus
                          />
                        )}
                      </TableHead>
                      {attributeMappings
                        .filter(mapping => mapping.csvColumn)
                        .slice(0, 3)
                        .map(mapping => (
                          <TableHead key={mapping.attribute} className="cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center gap-1">
                              <span>{mapping.attribute}</span>
                              <button
                                onClick={() => updateFilter(mapping.csvColumn, '')}
                                className="text-gray-400 hover:text-blue-600 p-0.5"
                                title={`Filter by ${mapping.attribute}`}
                              >
                                <Filter className="h-3 w-3" />
                              </button>
                            </div>
                            {filters.hasOwnProperty(mapping.csvColumn) && (
                              <Input
                                placeholder={`Filter ${mapping.attribute}...`}
                                value={filters[mapping.csvColumn] || ''}
                                onChange={(e) => updateFilter(mapping.csvColumn, e.target.value)}
                                className="h-6 mt-1 text-xs"
                                autoFocus
                              />
                            )}
                          </TableHead>
                        ))}
                      <TableHead className="w-32">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue, filteredIndex) => {
                      const originalIndex = validationIssues.indexOf(issue);
                      return (
                        <TableRow key={originalIndex}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIssues.has(originalIndex)}
                              onCheckedChange={() => toggleIssueSelection(originalIndex)}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {issue.row}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getIssueIcon(issue.type)}
                              <Badge variant={
                                issue.type === 'missing_required' ? 'destructive' :
                                issue.type === 'duplicate' ? 'default' : 'secondary'
                              }>
                                {issue.type === 'missing_required' ? 'Missing required value' : 
                                 issue.type === 'duplicate' ? 'Duplicate' : 
                                 'Invalid format'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {issue.field}
                          </TableCell>
                          <TableCell className="max-w-32 truncate">
                            <span className="font-mono text-xs">
                              "{issue.value}"
                            </span>
                          </TableCell>
                          <TableCell className="max-w-48 truncate">
                            <span className="text-xs text-gray-600">
                              {issue.message}
                            </span>
                            {issue.duplicateOf && (
                              <div className="text-xs text-blue-600 mt-1">
                                Duplicate of ID: {issue.duplicateOf.id}
                              </div>
                            )}
                          </TableCell>
                          {attributeMappings
                            .filter(mapping => mapping.csvColumn)
                            .slice(0, 3)
                            .map(mapping => (
                              <TableCell key={mapping.attribute} className="max-w-24 truncate">
                                <span className="text-xs">
                                  {issue.rowData[mapping.csvColumn] || '-'}
                                </span>
                              </TableCell>
                            ))}
                          <TableCell>
                            <Select
                              value={issue.solution}
                              onValueChange={(value: 'skip' | 'replace' | 'ignore') => 
                                updateIssueSolution(originalIndex, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-28">
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-600">
                    <span className="text-red-600 font-medium">{processingResult.errors.length} rows had errors during processing.</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal underline ml-1 text-red-600 hover:text-red-700"
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