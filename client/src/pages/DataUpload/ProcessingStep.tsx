import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Play, Download, FileText, AlertTriangle, Trash2, RefreshCw, Filter, X, ChevronDown, Copy, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
  customCode?: string;
  isCodeBased?: boolean;
}

interface ProcessingStepProps {
  uploadedFile: File | null;
  attributeMappings: AttributeMapping[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onProcessingComplete?: (results: ProcessingResult) => void;
}

interface ValidationIssue {
  row: number;
  type: 'missing_required' | 'duplicate' | 'invalid_format';
  field: string;
  value: string;
  message: string;
  solution: 'skip' | 'replace' | 'create_duplicate';
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
  onBack,
  onProcessingComplete
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
  const [targetEntityType, setTargetEntityType] = useState<string>(uploadType);
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

  // Helper function to apply custom code transformations
  const applyCustomCodeTransformations = (row: any) => {
    const transformedRow = { ...row };
    
    console.log('🔍 Processing row for custom code transformations:', row);
    
    attributeMappings.forEach(mapping => {
      if (mapping.csvColumn === 'CODE') {
        // Get custom code from mapping or try to access it via the any type
        const customCode = (mapping as any).customCode || mapping.customCode;
        console.log(`🔧 Custom code mapping found for ${mapping.attribute}:`, {
          attribute: mapping.attribute,
          customCode: customCode,
          csvColumn: mapping.csvColumn
        });
        
        if (customCode) {
          try {
            // Apply the custom code transformation
            const transformedValue = executeCustomCode(customCode, row);
            transformedRow[mapping.attribute] = transformedValue;
            console.log(`✅ Transformed ${mapping.attribute}:`, {
              originalRow: row,
              customCode: customCode,
              transformedValue: transformedValue
            });
          } catch (error) {
            console.warn(`❌ Failed to apply custom code for ${mapping.attribute}:`, error);
            transformedRow[mapping.attribute] = '';
          }
        } else {
          console.warn(`⚠️ No custom code found for CODE mapping ${mapping.attribute}`);
        }
      }
    });
    
    console.log('🎯 Final transformed row:', transformedRow);
    return transformedRow;
  };

  // Helper function to execute custom Python-like code
  const executeCustomCode = (code: string, rowData: any) => {
    console.log('🔄 Executing custom code:', { code, rowData });
    
    try {
      let evaluatedCode = code.trim();
      console.log('📝 Original code:', evaluatedCode);
      
      // Replace column references with actual CSV values (without quotes initially)
      Object.entries(rowData).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluatedCode = evaluatedCode.replace(regex, String(value || ''));
      });
      
      console.log('🔀 Code after column substitution:', evaluatedCode);

      let result = evaluatedCode;

      // Handle Python string functions
      // Handle upper() function
      if (result.includes('upper(')) {
        result = result.replace(/(\w+)\.upper\(\)/g, (match, variable) => {
          return `"${variable.toUpperCase()}"`;
        });
        result = result.replace(/upper\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.toUpperCase()}"`;
        });
        console.log('🔠 After upper() processing:', result);
      }
      
      // Handle lower() function
      if (result.includes('lower(')) {
        result = result.replace(/(\w+)\.lower\(\)/g, (match, variable) => {
          return `"${variable.toLowerCase()}"`;
        });
        result = result.replace(/lower\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.toLowerCase()}"`;
        });
        console.log('🔡 After lower() processing:', result);
      }
      
      // Handle capitalize() function
      if (result.includes('capitalize(')) {
        result = result.replace(/(\w+)\.capitalize\(\)/g, (match, variable) => {
          return `"${variable.charAt(0).toUpperCase() + variable.slice(1).toLowerCase()}"`;
        });
        result = result.replace(/capitalize\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.charAt(0).toUpperCase() + cleanContent.slice(1).toLowerCase()}"`;
        });
        console.log('🔤 After capitalize() processing:', result);
      }
      
      // Handle title() function
      if (result.includes('title(')) {
        result = result.replace(/(\w+)\.title\(\)/g, (match, variable) => {
          return `"${variable.replace(/\w\S*/g, (txt: any) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}"`;
        });
        result = result.replace(/title\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.replace(/\w\S*/g, (txt: any) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}"`;
        });
        console.log('🔢 After title() processing:', result);
      }
      
      // Handle strip() function
      if (result.includes('strip(')) {
        result = result.replace(/(\w+)\.strip\(\)/g, (match, variable) => {
          return `"${variable.trim()}"`;
        });
        result = result.replace(/strip\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.trim()}"`;
        });
        console.log('✂️ After strip() processing:', result);
      }
      
      // Handle lstrip() function
      if (result.includes('lstrip(')) {
        result = result.replace(/(\w+)\.lstrip\(\)/g, (match, variable) => {
          return `"${variable.replace(/^\s+/, '')}"`;
        });
        result = result.replace(/lstrip\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.replace(/^\s+/, '')}"`;
        });
        console.log('⬅️ After lstrip() processing:', result);
      }
      
      // Handle rstrip() function
      if (result.includes('rstrip(')) {
        result = result.replace(/(\w+)\.rstrip\(\)/g, (match, variable) => {
          return `"${variable.replace(/\s+$/, '')}"`;
        });
        result = result.replace(/rstrip\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.replace(/\s+$/, '')}"`;
        });
        console.log('➡️ After rstrip() processing:', result);
      }
      
      // Handle replace() function
      if (result.includes('replace(')) {
        result = result.replace(/(\w+)\.replace\(['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\)/g, (match, variable, oldStr, newStr) => {
          return `"${variable.replace(new RegExp(oldStr, 'g'), newStr)}"`;
        });
        result = result.replace(/replace\(([^,]+),\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\)/g, (match, content, oldStr, newStr) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${cleanContent.replace(new RegExp(oldStr, 'g'), newStr)}"`;
        });
        console.log('🔄 After replace() processing:', result);
      }
      
      // Handle startswith() function
      if (result.includes('startswith(')) {
        // Handle method syntax: variable.startswith("prefix")
        result = result.replace(/(\w+)\.startswith\(['"]([^'"]*)['"]\)/g, (match, variable, prefix) => {
          return variable.startsWith(prefix) ? 'True' : 'False';
        });
        // Handle function syntax: startswith(variable, "prefix")
        result = result.replace(/startswith\(([^,]+),\s*['"]([^'"]*)['"]\)/g, (match, variable, prefix) => {
          const cleanVariable = variable.replace(/['"]/g, '');
          return cleanVariable.startsWith(prefix) ? 'True' : 'False';
        });
        console.log('🎯 After startswith() processing:', result);
      }
      
      // Handle endswith() function
      if (result.includes('endswith(')) {
        // Handle method syntax: variable.endswith("suffix")
        result = result.replace(/(\w+)\.endswith\(['"]([^'"]*)['"]\)/g, (match, variable, suffix) => {
          return variable.endsWith(suffix) ? 'True' : 'False';
        });
        // Handle function syntax: endswith(variable, "suffix")
        result = result.replace(/endswith\(([^,]+),\s*['"]([^'"]*)['"]\)/g, (match, variable, suffix) => {
          const cleanVariable = variable.replace(/['"]/g, '');
          return cleanVariable.endsWith(suffix) ? 'True' : 'False';
        });
        console.log('🏁 After endswith() processing:', result);
      }
      
      // Handle find() function
      if (result.includes('find(')) {
        // Handle method syntax: variable.find("search")
        result = result.replace(/(\w+)\.find\(['"]([^'"]*)['"]\)/g, (match, variable, searchStr) => {
          return String(variable.indexOf(searchStr));
        });
        // Handle function syntax: find(variable, "search")
        result = result.replace(/find\(([^,]+),\s*['"]([^'"]*)['"]\)/g, (match, variable, searchStr) => {
          const cleanVariable = variable.replace(/['"]/g, '');
          return String(cleanVariable.indexOf(searchStr));
        });
        console.log('🔍 After find() processing:', result);
      }
      
      // Handle count() function
      if (result.includes('count(')) {
        // Handle method syntax: variable.count("search")
        result = result.replace(/(\w+)\.count\(['"]([^'"]*)['"]\)/g, (match, variable, searchStr) => {
          return String((variable.match(new RegExp(searchStr, 'g')) || []).length);
        });
        // Handle function syntax: count(variable, "search")
        result = result.replace(/count\(([^,]+),\s*['"]([^'"]*)['"]\)/g, (match, variable, searchStr) => {
          const cleanVariable = variable.replace(/['"]/g, '');
          return String((cleanVariable.match(new RegExp(searchStr, 'g')) || []).length);
        });
        console.log('🔢 After count() processing:', result);
      }
      
      // Handle split() function
      if (result.includes('split(')) {
        result = result.replace(/(\w+)\.split\(['"]([^'"]*)['"]\)/g, (match, variable, delimiter) => {
          const parts = variable.split(delimiter);
          return `"${parts.join(' | ')}"`;  // Join with separator for display
        });
        result = result.replace(/(\w+)\.split\(\)/g, (match, variable) => {
          const parts = variable.split(' ');
          return `"${parts.join(' | ')}"`;
        });
        console.log('✂️ After split() processing:', result);
      }
      
      // Handle format() function (basic version)
      if (result.includes('format(')) {
        result = result.replace(/(['"])([^'"]*)\1\.format\(([^)]*)\)/g, (match, quote, template, args) => {
          // Simple format handling - replace {} with arguments
          let formatted = template;
          const argsList = args.split(',').map(arg => arg.trim().replace(/['"]/g, ''));
          argsList.forEach((arg, index) => {
            formatted = formatted.replace('{}', arg);
          });
          return `"${formatted}"`;
        });
        console.log('📝 After format() processing:', result);
      }
      
      // Handle join() function
      if (result.includes('join(')) {
        result = result.replace(/(['"])([^'"]*)\1\.join\(\[([^\]]*)\]\)/g, (match, quote, separator, arrayContent) => {
          const items = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
          return `"${items.join(separator)}"`;
        });
        console.log('🔗 After join() processing:', result);
      }
      
      // Handle str() function
      if (result.includes('str(')) {
        result = result.replace(/str\(([^)]+)\)/g, (match, content) => {
          const cleanContent = content.replace(/['"]/g, '');
          return `"${String(cleanContent)}"`;
        });
        console.log('🔤 After str() processing:', result);
      }

      // Handle string concatenation with +
      if (result.includes('+') && !result.includes('if')) {
        const parts = result.split('+').map(p => p.trim().replace(/^["']|["']$/g, ''));
        result = parts.join('');
        console.log('➕ Concatenation result:', result);
      }
      
      // Handle conditional expressions (if/else)
      if (result.includes('if') && result.includes('else')) {
        const match = result.match(/"?([^"]*)"?\s+if\s+(.+?)\s+else\s+"?([^"]*)"?/);
        if (match) {
          const [, trueValue, condition, falseValue] = match;
          console.log('🔀 Conditional detected:', { trueValue, condition, falseValue });
          
          // Simple condition evaluation
          let conditionResult = false;
          if (condition.includes('==')) {
            const [left, right] = condition.split('==').map(s => s.trim().replace(/['"]/g, ''));
            conditionResult = left === right;
          } else if (condition.includes('!=')) {
            const [left, right] = condition.split('!=').map(s => s.trim().replace(/['"]/g, ''));
            conditionResult = left !== right;
          } else {
            conditionResult = true; // fallback for complex conditions
          }
          result = conditionResult ? trueValue : falseValue;
          console.log('🔍 Condition result:', result);
        }
      }
      
      // Clean up quotes for final result
      result = result.replace(/^["']|["']$/g, '');
      
      console.log('✅ Final result:', result);
      return result;
    } catch (error) {
      console.warn('❌ Error executing custom code:', error);
      return '';
    }
  };

  const runValidation = async () => {
    setIsValidating(true);
    setPhase('validation');
    
    try {
      console.log('🔍 Starting validation process...');
      console.log('Upload type:', uploadType);
      console.log('Original CSV data length:', csvData.length);
      console.log('Attribute mappings:', attributeMappings);
      
      // Validate inputs before proceeding
      if (!csvData || csvData.length === 0) {
        throw new Error('No CSV data available for validation');
      }
      
      if (!attributeMappings || attributeMappings.length === 0) {
        throw new Error('No attribute mappings configured');
      }

      // First, get the transformed CSV data
      console.log('📊 Running transformation script to get clean data for validation...');
      let transformedCsvData = csvData;
      
      if (uploadedFile) {
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('scriptId', '7'); // Default transformation script
          formData.append('entityType', uploadType);
          formData.append('environmentId', 'degoudse');
          
          const transformResponse = await fetch('/api/degoudse/transformation-scripts/execute', {
            method: 'POST',
            body: formData
          });
          
          if (transformResponse.ok) {
            const transformResult = await transformResponse.json();
            if (transformResult.success && transformResult.transformedCsv) {
              // Parse the transformed CSV manually
              const lines = transformResult.transformedCsv.split('\n').filter(line => line.trim());
              if (lines.length > 1) {
                const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
                const dataRows = lines.slice(1).map((line: string, index: number) => {
                  const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
                  const rowObj: any = { _rowNumber: index + 1 };
                  headers.forEach((header: string, i: number) => {
                    rowObj[header] = values[i] || '';
                  });
                  return rowObj;
                });
                
                if (dataRows.length > 0) {
                  transformedCsvData = dataRows;
                  console.log('✅ Using transformed CSV data for validation:', transformedCsvData.length, 'rows');
                  console.log('✅ Transformed headers:', headers);
                  console.log('✅ Sample transformed row:', dataRows[0]);
                }
              }
            }
          }
        } catch (transformError) {
          console.warn('⚠️ Transformation failed, using original data:', transformError);
        }
      }
      
      // Determine target entity type from attribute mappings
      let entityType = uploadType;
      if (uploadType === 'salesforce') {
        // For special formats, determine entity type from the mapped attributes
        const hasOpportunityFields = attributeMappings.some(m => 
          ['title', 'probability', 'stage', 'estimatedValue', 'clientId'].includes(m.attribute)
        );
        if (hasOpportunityFields) {
          entityType = 'opportunities';
        }
      }
      
      // Store the determined entity type for processing
      setTargetEntityType(entityType);
      
      console.log('📡 Fetching existing records for duplicate detection...');
      console.log('Target entity type determined:', entityType);
      
      const response = await fetch(`/api/degoudse/${entityType}`);
      
      if (!response.ok) {
        console.error('Failed to fetch existing records:', response.status, response.statusText);
        throw new Error(`Failed to fetch existing records: ${response.status} ${response.statusText}`);
      }
      
      const existing = await response.json();
      console.log('✅ Fetched existing records:', existing.length);
      setExistingRecords(existing);

      const issues: ValidationIssue[] = [];
      
      transformedCsvData.forEach((row, index) => {
        // Apply custom code transformations first
        const transformedRow = applyCustomCodeTransformations(row);
        
        // Check for empty required fields - validate ALL mandatory attributes including CODE-based ones
        attributeMappings
          .filter(mapping => mapping.isRequired)
          .forEach(mapping => {
            let value;
            if (mapping.csvColumn === 'CODE') {
              // Use the transformed value for CODE mappings
              value = transformedRow[mapping.attribute];
            } else {
              // Use the original CSV value for direct mappings
              value = row[mapping.csvColumn];
            }
            
            if (!value || value.toString().trim() === '') {
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

        // Check for duplicates based on ALL mandatory attributes (excluding ID field)
        // A record is considered duplicate if ALL mandatory attributes match an existing record
        const mandatoryMappings = attributeMappings.filter(mapping => mapping.isRequired && mapping.attribute !== 'id');
        
        console.log(`🔍 Row ${row._rowNumber} - Duplicate detection debug:`, {
          totalMandatoryMappings: mandatoryMappings.length,
          mandatoryFields: mandatoryMappings.map(m => m.attribute),
          existingRecordsCount: existing.length
        });
        
        if (mandatoryMappings.length > 0) {
          // Build the values for mandatory fields from current row (including transformed values)
          const currentRowMandatoryValues: Record<string, string> = {};
          let hasAllMandatoryValues = true;
          
          mandatoryMappings.forEach(mapping => {
            let value;
            if (mapping.csvColumn === 'CODE') {
              // Use the transformed value for CODE mappings
              value = transformedRow[mapping.attribute];
            } else {
              // Use the original CSV value for direct mappings
              value = row[mapping.csvColumn];
            }
            
            console.log(`  Field ${mapping.attribute}: csvColumn="${mapping.csvColumn}", rawValue="${value}"`);
            
            if (value && value.toString().trim() !== '') {
              currentRowMandatoryValues[mapping.attribute] = value.toString().trim().toLowerCase();
            } else {
              hasAllMandatoryValues = false;
              console.log(`  ❌ Missing value for mandatory field: ${mapping.attribute}`);
            }
          });
          
          console.log(`  Current row values:`, currentRowMandatoryValues);
          console.log(`  Has all mandatory values: ${hasAllMandatoryValues}`);
          
          // Only check for duplicates if we have all mandatory values
          if (hasAllMandatoryValues) {
            let duplicateFound = false;
            let checkedRecords = 0;
            let matchingRecord = null;
            
            // Search through ALL existing records to find duplicates
            for (const record of existing) {
              checkedRecords++;
              
              // Check if ALL mandatory attributes match
              const allMatch = mandatoryMappings.every(mapping => {
                const existingValue = record[mapping.attribute];
                const currentValue = currentRowMandatoryValues[mapping.attribute];
                
                // Handle different data types and normalize for comparison
                let normalizedExisting = '';
                let normalizedCurrent = currentValue;
                
                if (existingValue !== null && existingValue !== undefined) {
                  if (mapping.attribute === 'probability') {
                    // Handle probability: both should be in percentage format for comparison
                    const existingProb = parseFloat(existingValue.toString());
                    let currentProb = parseFloat(currentValue);
                    
                    // Convert decimal to percentage if needed for comparison
                    if (currentProb <= 1) {
                      currentProb = Math.round(currentProb * 100);
                    } else {
                      currentProb = Math.round(currentProb);
                    }
                    
                    normalizedExisting = existingProb.toString();
                    normalizedCurrent = currentProb.toString();
                  } else if (mapping.attribute === 'estimatedValue') {
                    // Handle estimated value: compare as numbers
                    const existingVal = parseFloat(existingValue.toString());
                    const currentVal = parseFloat(currentValue);
                    normalizedExisting = existingVal.toString();
                    normalizedCurrent = currentVal.toString();
                  } else if (mapping.attribute === 'clientId' || mapping.attribute === 'productId') {
                    // Handle IDs: compare as numbers
                    normalizedExisting = parseInt(existingValue.toString()).toString();
                    normalizedCurrent = parseInt(currentValue).toString();
                  } else {
                    // Handle text fields: normalize case and trim
                    normalizedExisting = existingValue.toString().toLowerCase().trim();
                    normalizedCurrent = currentValue.toLowerCase().trim();
                  }
                } else {
                  normalizedExisting = '';
                }
                
                const match = normalizedExisting === normalizedCurrent;
                
                // Log detailed comparison for potential matches
                if (record.clientId && parseInt(record.clientId.toString()) >= 10001 && parseInt(record.clientId.toString()) <= 10010) {
                  console.log(`    Compare ${mapping.attribute}: existing="${normalizedExisting}" vs current="${normalizedCurrent}" = ${match}`);
                }
                
                return match;
              });
              
              if (allMatch) {
                duplicateFound = true;
                matchingRecord = record;
                console.log(`  ✅ DUPLICATE FOUND! Record ID: ${record.id}, ClientId: ${record.clientId}`);
                break; // Found a duplicate, no need to check more
              }
            }
            
            console.log(`  Checked ${checkedRecords} existing records, duplicate found: ${duplicateFound}`);
            
            const duplicate = matchingRecord;
            
            if (duplicate) {
              // Create a summary of the matching mandatory fields
              const matchingFields = mandatoryMappings.map(m => m.attribute).join(', ');
              const matchingValues = mandatoryMappings.map(m => currentRowMandatoryValues[m.attribute]).join(', ');
              
              console.log(`  🚨 Adding duplicate issue for row ${row._rowNumber}`);
              
              issues.push({
                row: row._rowNumber,
                type: 'duplicate',
                field: matchingFields,
                value: matchingValues,
                message: `Duplicate record found - all mandatory fields match: ${matchingFields}`,
                solution: 'skip',
                duplicateOf: duplicate,
                rowData: row
              });
            }
          }
        }

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
      console.error('Validation error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({ 
        title: 'Validation Error', 
        description: `Failed to validate data: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const updateIssueSolution = (issueIndex: number, solution: 'skip' | 'replace' | 'create_duplicate') => {
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

  const bulkUpdateSolution = (solution: 'skip' | 'replace' | 'create_duplicate') => {
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
      // Get the same transformed CSV data that was used for validation
      console.log('📊 Getting transformed data for processing...');
      let transformedCsvData = csvData;
      
      if (uploadedFile) {
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('scriptId', '7'); // Default transformation script
          formData.append('entityType', uploadType);
          formData.append('environmentId', 'degoudse');
          
          const transformResponse = await fetch('/api/degoudse/transformation-scripts/execute', {
            method: 'POST',
            body: formData
          });
          
          if (transformResponse.ok) {
            const transformResult = await transformResponse.json();
            if (transformResult.success && transformResult.transformedCsv) {
              // Parse the transformed CSV manually
              const lines = transformResult.transformedCsv.split('\n').filter(line => line.trim());
              if (lines.length > 1) {
                const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
                const dataRows = lines.slice(1).map((line: string, index: number) => {
                  const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
                  const rowObj: any = { _rowNumber: index + 1 };
                  headers.forEach((header: string, i: number) => {
                    rowObj[header] = values[i] || '';
                  });
                  return rowObj;
                });
                
                if (dataRows.length > 0) {
                  transformedCsvData = dataRows;
                  console.log('✅ Using transformed CSV data for processing:', transformedCsvData.length, 'rows');
                }
              }
            }
          }
        } catch (transformError) {
          console.warn('⚠️ Transformation failed, using original data:', transformError);
        }
      }

      // Filter out rows that should be skipped based on validation issues
      const skipRows = new Set(
        validationIssues
          .filter(issue => issue.solution === 'skip')
          .map(issue => issue.row)
      );

      const rowsToProcess = transformedCsvData.filter(row => !skipRows.has(row._rowNumber));
      const totalRows = rowsToProcess.length;
      let processedCount = 0;
      let createdCount = 0;
      let skippedCount = 0;
      const errors: any[] = [];
      const createdRecords: any[] = [];

      for (const row of rowsToProcess) {
        try {
          // Apply custom code transformations first
          const transformedRow = applyCustomCodeTransformations(row);
          
          // Transform row data according to attribute mappings
          const transformedData: any = {};
          
          attributeMappings.forEach(mapping => {
            let value;
            
            // Skip ID field to avoid primary key conflicts - let database auto-generate
            if (mapping.attribute === 'id') {
              return;
            }
            
            // Get value from appropriate source
            if (mapping.csvColumn === 'CODE') {
              // Use transformed value for CODE mappings
              value = transformedRow[mapping.attribute];
            } else if (mapping.csvColumn && row[mapping.csvColumn] !== undefined) {
              // Use direct CSV value for regular mappings
              value = row[mapping.csvColumn];
            } else {
              return; // Skip if no value available
            }
            
            // Transform data types
            if (mapping.attribute.includes('date') && value) {
              transformedData[mapping.attribute] = new Date(value).toISOString();
            } else if (mapping.attribute === 'value' || mapping.attribute.includes('amount') || mapping.attribute.includes('Value')) {
              transformedData[mapping.attribute] = parseFloat(value) || 0;
            } else if (mapping.attribute === 'probability') {
              // Handle probability: convert from decimal (0.95) to percentage (95) for storage
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                transformedData[mapping.attribute] = 0;
              } else if (numValue <= 1) {
                // If value is decimal format (0.95), convert to percentage (95)
                transformedData[mapping.attribute] = Math.round(numValue * 100);
              } else {
                // If value is already percentage format (95), keep as is
                transformedData[mapping.attribute] = Math.round(numValue);
              }
            } else if (mapping.attribute.includes('Id')) {
              // Handle ID fields as integers
              const numValue = parseFloat(value);
              transformedData[mapping.attribute] = isNaN(numValue) ? 0 : Math.round(numValue);
            } else {
              transformedData[mapping.attribute] = value;
            }
          });
          
          console.log('📦 Final transformed data for database:', {
            row: row._rowNumber,
            transformedData: transformedData,
            hasTitle: 'title' in transformedData,
            titleValue: transformedData.title
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

          let response;
          
          if (duplicateIssue && duplicateIssue.solution === 'replace') {
            // Strategy 1: Replace Existing - Update the existing record with new data
            console.log('Updating existing record:', duplicateIssue.duplicateOf.id);
            response = await fetch(`/api/degoudse/${targetEntityType}/${duplicateIssue.duplicateOf.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transformedData)
            });

          } else {
            // Strategy 3: Create Duplicate - Allow multiple records with same values
            // This includes 'create_duplicate' solution and no duplicate issue
            console.log('Creating new record for row:', row._rowNumber);
            console.log('Using target entity type:', targetEntityType);
            response = await fetch(`/api/degoudse/${targetEntityType}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transformedData)
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
      
      // Notify parent component of processing completion
      if (onProcessingComplete) {
        onProcessingComplete(result);
      }
      
      // Automatically advance to next step
      setTimeout(() => {
        onNext();
      }, 500);



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
      case 'create_duplicate': return 'text-green-600';

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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="mx-auto h-6 w-6 text-orange-600 mb-2" />
                  <h3 className="font-medium text-sm">Total Issues</h3>
                  <p className="text-2xl font-bold text-orange-700">{validationIssues.length}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <SkipForward className="mx-auto h-6 w-6 text-red-600 mb-2" />
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
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Copy className="mx-auto h-6 w-6 text-yellow-600 mb-2" />
                  <h3 className="font-medium text-sm">Create Duplicate</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {validationIssues.filter(i => i.solution === 'create_duplicate').length}
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
                      <SkipForward className="h-3 w-3 mr-1" />
                      Skip Upload Row
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkUpdateSolution('replace')}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Replace Existing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkUpdateSolution('create_duplicate')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Create Duplicate
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
              <div className="border border-[#E6E7F1] rounded-lg">
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
                      const uniqueKey = `${issue.row}-${issue.field}-${issue.type}-${filteredIndex}`;
                      return (
                        <TableRow key={uniqueKey}>
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
                              onValueChange={(value: 'skip' | 'replace' | 'create_duplicate') => 
                                updateIssueSolution(originalIndex, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skip">
                                  <div className="flex items-center gap-2">
                                    <SkipForward className="h-3 w-3" />
                                    Skip Upload Row
                                  </div>
                                </SelectItem>
                                {issue.type === 'duplicate' && (
                                  <SelectItem value="replace">
                                    <div className="flex items-center gap-2">
                                      <RefreshCw className="h-3 w-3" />
                                      Replace Existing
                                    </div>
                                  </SelectItem>
                                )}
                                {issue.type === 'duplicate' && (
                                  <>
                                    <SelectItem value="create_duplicate">
                                      <div className="flex items-center gap-2">
                                        <Copy className="h-3 w-3" />
                                        Create Duplicate
                                      </div>
                                    </SelectItem>

                                  </>
                                )}
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

          {/* Validation Loading State */}
          {phase === 'validation' && isValidating && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-medium">Validating Data...</h3>
              <p className="text-gray-600">Checking for issues and validating your data. Please wait.</p>
            </div>
          )}

          {/* No Validation Issues */}
          {phase === 'validation' && !showValidation && !isValidating && (
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
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Processing Data...</h3>
                <p className="text-gray-600 mb-4">
                  Creating records in your database. This may take a few moments.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>
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
        {/* Processing automatically advances to next step when complete */}
      </div>
    </div>
  );
}