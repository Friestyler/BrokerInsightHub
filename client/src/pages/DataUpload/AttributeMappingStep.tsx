import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Edit, ArrowLeft, ArrowRight, CheckCircle, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AttributeMappingStepProps {
  uploadedFile: File | null;
  csvHeaders: string[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  selectedTransformationScript?: { id: number; name: string } | null;
  onNext: (mappings: AttributeMapping[]) => void;
  onBack: () => void;
}

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
  customCode?: string;
  isCodeBased?: boolean;
}

interface Template {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  column_mappings: any;
  isShared?: boolean;
  createdBy?: number;
}

export default function AttributeMappingStep({ 
  uploadedFile, 
  csvHeaders,
  uploadType, 
  stepName, 
  currentStep,
  selectedTransformationScript,
  onNext, 
  onBack 
}: AttributeMappingStepProps) {
  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [selectedNewAttribute, setSelectedNewAttribute] = useState<string>('');
  const [extractedHeaders, setExtractedHeaders] = useState<string[]>([]);
  const [showCodeEditor, setShowCodeEditor] = useState<{ [key: number]: boolean }>({});
  const [codeEditorContent, setCodeEditorContent] = useState<{ [key: number]: string }>({});
  const [codeValidation, setCodeValidation] = useState<{ [key: number]: { isValid: boolean; error?: string } }>({});
  const [codePreview, setCodePreview] = useState<{ [key: number]: string[] }>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if this is a special format upload (should pre-select last used template)
  const isSpecialFormat = uploadType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType);

  // Storage functions for last used template
  const getLastUsedTemplateKey = (uploadType: string) => `lastUsedTemplate_${uploadType}`;
  
  const saveLastUsedTemplate = (templateId: number, uploadType: string) => {
    if (isSpecialFormat) {
      localStorage.setItem(getLastUsedTemplateKey(uploadType), templateId.toString());
    }
  };

  const getLastUsedTemplate = (uploadType: string): string | null => {
    if (isSpecialFormat) {
      return localStorage.getItem(getLastUsedTemplateKey(uploadType));
    }
    return null;
  };

  // Extract CSV headers and data from uploaded file with transformation
  useEffect(() => {
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      processCSVFile();
    }
  }, [uploadedFile, selectedTransformationScript]);

  const processCSVFile = async () => {
    if (!uploadedFile) return;

    try {
      // Check if we need to apply transformation script
      const isSpecialFormat = uploadType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType);
      
      if (isSpecialFormat && selectedTransformationScript) {
        // Apply transformation script first
        console.log('🔄 TRANSFORMATION DEBUG: Starting transformation process');
        console.log('🔄 Selected transformation script:', selectedTransformationScript);
        console.log('🔄 Upload type:', uploadType);
        console.log('🔄 Is special format:', isSpecialFormat);
        console.log('🔄 Environment ID:', environmentId);
        console.log('🔄 Original file size:', uploadedFile.size, 'bytes');
        
        const formData = new FormData();
        formData.append('csvFile', uploadedFile);
        formData.append('scriptId', selectedTransformationScript.id.toString());
        formData.append('entityType', uploadType);

        console.log('🔄 Making transformation API call to:', `/api/${environmentId}/transformation-scripts/execute`);
        
        const response = await fetch(`/api/${environmentId}/transformation-scripts/execute`, {
          method: 'POST',
          body: formData
        });

        console.log('🔄 Transformation API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ TRANSFORMATION SUCCESS:', {
            originalHeaders: 'N/A (will extract from original file for comparison)',
            transformedHeaders: result.headers,
            transformedRowCount: result.rowCount,
            transformedCsvLength: result.transformedCsv?.length || 0
          });
          
          // Also log a sample of the transformed CSV for debugging
          const transformedLines = result.transformedCsv.split('\n').filter((line: string) => line.trim());
          console.log('✅ First few lines of transformed CSV:');
          transformedLines.slice(0, 3).forEach((line: string, index: number) => {
            console.log(`   Line ${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          });
          
          // Use the transformed headers and data
          setExtractedHeaders(result.headers);
          
          // Parse transformed CSV data for preview
          const dataRows = transformedLines.slice(1, 6).map((line: string) => {
            const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
            const row: Record<string, any> = {};
            result.headers.forEach((header: string, index: number) => {
              const columnVar = `column_${header.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
              row[columnVar] = values[index] || '';
            });
            return row;
          });
          setCsvData(dataRows);
          
          console.log('✅ Transformed data preview:', dataRows.slice(0, 2));
          
        } else {
          const errorText = await response.text();
          console.error('❌ TRANSFORMATION FAILED:', {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText
          });
          // Fall back to original CSV processing
          processOriginalCSV();
        }
      } else {
        // No transformation needed, process original CSV
        processOriginalCSV();
      }
    } catch (error) {
      console.error('Error processing CSV with transformation:', error);
      // Fall back to original CSV processing
      processOriginalCSV();
    }
  };

  const processOriginalCSV = () => {
    if (!uploadedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setExtractedHeaders(headers);
        
        // Parse CSV data (first 5 rows for preview)
        const dataRows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            const columnVar = `column_${header.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            row[columnVar] = values[index] || '';
          });
          return row;
        });
        setCsvData(dataRows);
      }
    };
    reader.readAsText(uploadedFile);
  };

  // Get environment ID from localStorage
  const environmentId = localStorage.getItem('currentEnvironment') || 'degoudse';

  // Get upload settings to determine mandatory attributes
  const { data: uploadSettings = [] } = useQuery({
    queryKey: [`/api/${environmentId}/upload-settings/${uploadType}`],
    enabled: !!environmentId && !!uploadType,
  });

  // Get entity schema to get all available attributes
  const { data: entityData = [] } = useQuery({
    queryKey: ['/api/admin/entity-schemas'],
    enabled: true,
  });

  // Fetch templates for this entity type
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: [`/api/${environmentId}/upload-templates`],
    enabled: !!environmentId,
  });

  // Auto-select last used template for special format uploads
  useEffect(() => {
    if (templates.length > 0 && isSpecialFormat && attributeMappings.length === 0) {
      const lastUsedTemplateId = getLastUsedTemplate(uploadType);
      
      if (lastUsedTemplateId) {
        const lastUsedTemplate = templates.find(template => template.id.toString() === lastUsedTemplateId);
        if (lastUsedTemplate && lastUsedTemplate.entity_type === uploadType) {
          console.log(`Auto-loading last used template for ${uploadType}:`, lastUsedTemplate.name);
          loadTemplate(lastUsedTemplate.id.toString());
        }
      }
    }
  }, [templates, uploadType, isSpecialFormat, attributeMappings.length]);

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch(`/api/${environmentId}/upload-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environmentId}/upload-templates`] });
      toast({ title: 'Template saved successfully' });
      setShowSaveTemplate(false);
      setTemplateName('');
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ templateId, templateData }: { templateId: string, templateData: any }) => {
      const response = await fetch(`/api/${environmentId}/upload-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environmentId}/upload-templates`] });
      toast({ title: 'Template updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update template', variant: 'destructive' });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/${environmentId}/upload/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environmentId}/upload-templates`] });
      toast({ title: 'Template deleted successfully' });
      setSelectedTemplateId('');
    },
    onError: () => {
      toast({ title: 'Failed to delete template', variant: 'destructive' });
    },
  });

  // Get available entity attributes
  const getEntityAttributes = () => {
    if (!Array.isArray(entityData) || !uploadType) return [];
    
    // Check if this is a special format (contains hyphen) or special entity
    const isSpecialFormat = uploadType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType);
    
    if (isSpecialFormat) {
      // For special formats, return all attributes from all entities
      const allAttributes: string[] = [];
      entityData.forEach((entity: any) => {
        if (entity.columns && Array.isArray(entity.columns)) {
          entity.columns.forEach((col: any) => {
            if (col.name && col.name.trim().length > 0) {
              // Prefix with entity name to avoid conflicts and provide context
              allAttributes.push(`${entity.tableName}.${col.name}`);
            }
          });
        }
      });
      
      console.log('Special format entity attributes:', {
        uploadType,
        isSpecialFormat,
        availableSchemas: entityData.map((e: any) => e.tableName),
        totalAttributes: allAttributes.length,
        sampleAttributes: allAttributes.slice(0, 10)
      });
      
      return allAttributes;
    }
    
    // For regular entity uploads, try to match specific entity
    let entitySchema = entityData.find((e: any) => 
      e.tableName && e.tableName.toLowerCase().includes(uploadType.toLowerCase())
    );
    
    // If not found, try exact match
    if (!entitySchema) {
      entitySchema = entityData.find((e: any) => 
        e.tableName && e.tableName.toLowerCase() === uploadType.toLowerCase()
      );
    }
    
    // If still not found, try plural/singular variations
    if (!entitySchema) {
      const variations = [
        uploadType + 's',
        uploadType.endsWith('s') ? uploadType.slice(0, -1) : uploadType + 's',
        uploadType.replace('ies', 'y'),
        uploadType.replace('y', 'ies')
      ];
      
      entitySchema = entityData.find((e: any) => 
        e.tableName && variations.some(v => 
          e.tableName.toLowerCase().includes(v.toLowerCase())
        )
      );
    }
    
    console.log('Regular entity schema lookup:', {
      uploadType,
      isSpecialFormat,
      availableSchemas: entityData.map((e: any) => e.tableName),
      foundSchema: entitySchema?.tableName,
      columns: entitySchema?.columns?.map((col: any) => col.name)
    });
    
    return entitySchema?.columns
      ?.map((col: any) => col.name)
      ?.filter((name: string) => name && name.trim().length > 0) || [];
  };

  // Get mandatory attributes from upload settings
  const getMandatoryAttributes = () => {
    if (!Array.isArray(uploadSettings)) return [];
    return uploadSettings
      .filter((setting: any) => setting.is_mandatory === true)
      .map((setting: any) => setting.attribute_name);
  };

  // Initialize mandatory attributes
  useEffect(() => {
    const mandatoryAttrs = getMandatoryAttributes();
    if (mandatoryAttrs.length > 0) {
      const mappings = mandatoryAttrs.map((attr: string) => ({
        attribute: attr,
        csvColumn: '',
        isRequired: true,
      }));
      setAttributeMappings(mappings);
    }
  }, [uploadSettings]);

  // Update attribute mapping
  const updateMapping = (index: number, csvColumn: string) => {
    setAttributeMappings(prev => prev.map((mapping, i) => 
      i === index ? { 
        ...mapping, 
        csvColumn,
        isCodeBased: csvColumn === 'CODE',
        customCode: csvColumn === 'CODE' ? (codeEditorContent[index] || '') : undefined
      } : mapping
    ));

    // Show/hide code editor based on selection
    if (csvColumn === 'CODE') {
      setShowCodeEditor(prev => ({ ...prev, [index]: true }));
      if (!codeEditorContent[index]) {
        setCodeEditorContent(prev => ({ ...prev, [index]: '' }));
      }
    } else {
      setShowCodeEditor(prev => ({ ...prev, [index]: false }));
    }
  };

  // Validate Python code
  const validatePythonCode = (code: string, index: number) => {
    try {
      // Basic Python syntax validation
      if (!code.trim()) {
        setCodeValidation(prev => ({ 
          ...prev, 
          [index]: { isValid: false, error: 'Code cannot be empty' }
        }));
        setCodePreview(prev => ({ ...prev, [index]: [] }));
        return false;
      }

      // Check for basic Python syntax issues
      const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      if (lines.length === 0) {
        setCodeValidation(prev => ({ 
          ...prev, 
          [index]: { isValid: false, error: 'Please add some code logic' }
        }));
        setCodePreview(prev => ({ ...prev, [index]: [] }));
        return false;
      }

      // Check for Python syntax patterns
      const invalidPatterns = [
        /^\s*if\s+.*:\s*$/, // if statement without body
        /^\s*for\s+.*:\s*$/, // for loop without body
        /^\s*while\s+.*:\s*$/, // while loop without body
        /^\s*def\s+.*:\s*$/, // function definition without body
      ];

      const hasInvalidPattern = lines.some(line => 
        invalidPatterns.some(pattern => pattern.test(line))
      );

      if (hasInvalidPattern) {
        setCodeValidation(prev => ({ 
          ...prev, 
          [index]: { isValid: false, error: 'Incomplete Python syntax - missing function body or logic' }
        }));
        setCodePreview(prev => ({ ...prev, [index]: [] }));
        return false;
      }

      // Check for basic expression validity
      const mainLine = lines[lines.length - 1]; // Last non-comment line should be the expression
      if (!mainLine || mainLine.trim().length < 3) {
        setCodeValidation(prev => ({ 
          ...prev, 
          [index]: { isValid: false, error: 'Please add a valid Python expression' }
        }));
        setCodePreview(prev => ({ ...prev, [index]: [] }));
        return false;
      }

      // Basic validation passed
      setCodeValidation(prev => ({ 
        ...prev, 
        [index]: { isValid: true }
      }));
      
      // Generate preview
      generateCodePreview(code, index);
      return true;
    } catch (error) {
      setCodeValidation(prev => ({ 
        ...prev, 
        [index]: { isValid: false, error: 'Invalid Python syntax' }
      }));
      setCodePreview(prev => ({ ...prev, [index]: [] }));
      return false;
    }
  };

  // Generate code preview
  const generateCodePreview = (code: string, index: number) => {
    try {
      // Use actual CSV data if available, otherwise create minimal sample data
      let dataToUse = csvData;
      if (!dataToUse || dataToUse.length === 0) {
        // Create minimal sample data only if no CSV data is available
        dataToUse = [
          { column_placeholder: 'No CSV data available' },
          { column_placeholder: 'Please upload CSV file' },
          { column_placeholder: 'To see actual preview' }
        ];
      }

      // Try to evaluate the code with actual CSV data
      const previews = dataToUse.slice(0, 3).map((rowData, idx) => {
        try {
          // Simple evaluation for basic expressions
          let evaluatedCode = code.trim();
          
          // Replace column references with actual CSV values
          Object.entries(rowData).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            if (typeof value === 'string') {
              evaluatedCode = evaluatedCode.replace(regex, `"${value}"`);
            } else {
              evaluatedCode = evaluatedCode.replace(regex, String(value));
            }
          });

          // Handle simple operations
          if (evaluatedCode.includes('+') && !evaluatedCode.includes('if')) {
            // Simple addition/concatenation
            const parts = evaluatedCode.split('+').map(p => p.trim().replace(/"/g, ''));
            const result = parts.join(' ');
            return `Row ${idx + 1}: ${result}`;
          } else if (evaluatedCode.includes('if') && evaluatedCode.includes('else')) {
            // Simple conditional
            const match = evaluatedCode.match(/"([^"]*)" if .* else "([^"]*)"/);
            if (match) {
              // For demo, randomly choose true/false based on row
              const condition = idx % 2 === 0;
              return `Row ${idx + 1}: ${condition ? match[1] : match[2]}`;
            }
          }
          
          // For simple column references, show the actual value
          if (evaluatedCode.includes('column_') && !evaluatedCode.includes('+') && !evaluatedCode.includes('if')) {
            // Find the column being referenced
            const columnMatch = evaluatedCode.match(/column_\w+/);
            if (columnMatch && rowData[columnMatch[0]]) {
              return `Row ${idx + 1}: ${rowData[columnMatch[0]]}`;
            }
          }
          
          // Fallback to showing the evaluated code
          return `Row ${idx + 1}: ${evaluatedCode.slice(0, 50)}${evaluatedCode.length > 50 ? '...' : ''}`;
        } catch (error) {
          return `Row ${idx + 1}: Error evaluating code`;
        }
      });

      setCodePreview(prev => ({ 
        ...prev, 
        [index]: previews
      }));
    } catch (error) {
      setCodePreview(prev => ({ 
        ...prev, 
        [index]: ['Error generating preview']
      }));
    }
  };

  // Handle code editor changes
  const handleCodeChange = (index: number, code: string) => {
    setCodeEditorContent(prev => ({ ...prev, [index]: code }));
    
    // Update the mapping with the new code
    setAttributeMappings(prev => prev.map((mapping, i) => 
      i === index && mapping.isCodeBased ? { ...mapping, customCode: code } : mapping
    ));

    // Clear previous validation timeout
    if (typeof window !== 'undefined') {
      (window as any)[`validationTimeout_${index}`] && clearTimeout((window as any)[`validationTimeout_${index}`]);
      
      // Set new validation timeout
      (window as any)[`validationTimeout_${index}`] = setTimeout(() => {
        validatePythonCode(code, index);
      }, 800);
    }
  };

  // Get available attributes for adding (excluding already used ones)
  const getAvailableAttributesForAdding = () => {
    const allAttributes = getEntityAttributes();
    const usedAttributes = attributeMappings.map(m => m.attribute);
    const availableAttributes = allAttributes.filter((attr: string) => !usedAttributes.includes(attr));
    
    console.log('Available attributes for adding:', {
      allAttributes,
      usedAttributes,
      availableAttributes,
      attributeMappings
    });
    
    return availableAttributes;
  };

  // Add selected optional attribute
  const addSelectedAttribute = () => {
    if (selectedNewAttribute) {
      setAttributeMappings(prev => [...prev, {
        attribute: selectedNewAttribute,
        csvColumn: '',
        isRequired: false,
      }]);
      setSelectedNewAttribute('');
      setShowAddAttribute(false);
    }
  };

  // Load template
  const loadTemplate = (templateId: string | Template) => {
    const template = typeof templateId === 'string' 
      ? templates.find((t) => t.id.toString() === templateId)
      : templateId;
      
    if (template && template.column_mappings) {
      // Save template selection for special format uploads
      if (isSpecialFormat) {
        saveLastUsedTemplate(template.id, uploadType);
      }
      
      let mappings;
      try {
        mappings = typeof template.column_mappings === 'string' 
          ? JSON.parse(template.column_mappings) 
          : template.column_mappings;
        
        setAttributeMappings(mappings);
        
        // Load code editor states and content for code-based mappings
        mappings.forEach((mapping: AttributeMapping, index: number) => {
          if (mapping.isCodeBased && mapping.customCode) {
            setShowCodeEditor(prev => ({ ...prev, [index]: true }));
            setCodeEditorContent(prev => ({ ...prev, [index]: mapping.customCode || '' }));
            // Validate the loaded code
            setTimeout(() => validatePythonCode(mapping.customCode || '', index), 100);
          }
        });
        
        toast({ title: `Template "${template.name}" loaded` });
      } catch (error) {
        toast({ title: 'Failed to load template', variant: 'destructive' });
      }
    }
  };

  // Save current mapping as template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }

    saveTemplateMutation.mutate({
      name: templateName,
      description: `Template for ${uploadType}`,
      entityType: uploadType,
      environmentId: environmentId,
      columnMappings: attributeMappings,
      isShared: false,
      createdBy: 1,
    });
  };

  // Update existing template
  const updateTemplate = () => {
    if (!selectedTemplateId) return;
    
    const template = templates.find((t) => t.id.toString() === selectedTemplateId);
    if (!template) return;

    updateTemplateMutation.mutate({
      templateId: selectedTemplateId,
      templateData: {
        name: template.name,
        description: template.description,
        entityType: uploadType,
        environmentId: environmentId,
        columnMappings: attributeMappings,
        isShared: template.isShared || false,
        createdBy: template.createdBy || 1,
      }
    });
  };

  const canProceed = attributeMappings
    .filter(m => m.isRequired)
    .every(mapping => {
      if (mapping.csvColumn === 'CODE') {
        // For code-based mappings, check if code is valid
        return mapping.customCode && 
               mapping.customCode.trim().length > 0 && 
               codeValidation[attributeMappings.indexOf(mapping)]?.isValid;
      }
      return mapping.csvColumn;
    });

  const csvHeadersToUse = extractedHeaders.length > 0 ? extractedHeaders : csvHeaders;

  const handleNext = () => {
    onNext(attributeMappings);
  };

  return (
    <div className="space-y-6">

      {/* Template Management Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Template Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            {/* Use Template Dropdown */}
            <div className="flex-1">
              <Label className="text-sm font-medium">Use Template</Label>
              <Select 
                value={selectedTemplateId} 
                onValueChange={(value) => {
                  setSelectedTemplateId(value);
                  if (value && value !== 'none') {
                    loadTemplate(value);
                  } else if (value === 'none') {
                    // Clear current mappings to reset to default state
                    const mandatoryAttrs = getMandatoryAttributes();
                    const mappings = mandatoryAttrs.map((attr: string) => ({
                      attribute: attr,
                      csvColumn: '',
                      isRequired: true,
                    }));
                    setAttributeMappings(mappings);
                    toast({ title: 'Template cleared' });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Template Button */}
            <Button 
              variant="outline" 
              onClick={() => setShowSaveTemplate(true)}
              className="shrink-0"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>

            {/* Update Template Button */}
            {selectedTemplateId && selectedTemplateId !== 'none' && (
              <Button 
                variant="outline" 
                onClick={updateTemplate}
                disabled={updateTemplateMutation.isPending}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                {updateTemplateMutation.isPending ? 'Updating...' : 'Update Template'}
              </Button>
            )}

            {/* Delete Template Button */}
            {selectedTemplateId && selectedTemplateId !== 'none' && (
              <Button 
                variant="outline" 
                onClick={() => deleteTemplateMutation.mutate(selectedTemplateId)}
                disabled={deleteTemplateMutation.isPending}
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteTemplateMutation.isPending ? 'Deleting...' : 'Delete Template'}
              </Button>
            )}
          </div>

          {/* Save Template Form */}
          {showSaveTemplate && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <div>
                <Label className="text-sm font-medium">Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveAsTemplate}
                  disabled={saveTemplateMutation.isPending}
                  size="sm"
                >
                  {saveTemplateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveTemplate(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Mapping Section - Row-based alignment */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Column Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Column Headers */}
          <div className="grid grid-cols-2 gap-8 mb-3">
            <h4 className="font-medium text-sm text-muted-foreground">Entity Attributes</h4>
            <h4 className="font-medium text-sm text-muted-foreground">CSV Column Mapping</h4>
          </div>
          
          {/* Mapping Rows */}
          <div className="space-y-3">
            {attributeMappings.map((mapping, index) => (
              <div key={`mapping-row-${index}`} className="space-y-4">
                <div className="grid grid-cols-2 gap-8 items-stretch">
                  {/* Left: Entity Attribute */}
                  <div className={`p-3 rounded-lg border flex items-center ${
                    mapping.isRequired 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{mapping.attribute}</span>
                      {mapping.isRequired && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Right: CSV Column Dropdown */}
                  <div className={`p-3 rounded-lg border ${
                    mapping.isRequired 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <Select 
                      value={mapping.csvColumn} 
                      onValueChange={(value) => updateMapping(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CSV column" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[270px]">
                        <div className="sticky top-0 z-50 bg-white border-b px-2 py-1 shadow-sm">
                          <input
                            type="text"
                            placeholder="Search columns..."
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const items = e.target.closest('[role="listbox"]')?.querySelectorAll('[role="option"]');
                              items?.forEach((item) => {
                                const text = item.textContent?.toLowerCase() || '';
                                const shouldShow = text.includes(searchTerm);
                                (item as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
                              });
                            }}
                          />
                        </div>
                        <SelectItem value="CODE" className="bg-purple-50 text-purple-700 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">&lt;/&gt;</span>
                            Code (Custom Logic)
                          </div>
                        </SelectItem>
                        {csvHeadersToUse.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Code Editor Section - appears when "Code" is selected */}
                {showCodeEditor[index] && mapping.csvColumn === 'CODE' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Editor Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Python Code Editor</h4>
                        <div className="flex items-center gap-2">
                          {codeValidation[index]?.isValid ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs">Valid</span>
                            </div>
                          ) : codeValidation[index]?.error ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <X className="h-4 w-4" />
                              <span className="text-xs">Error</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        Define custom logic using column references (Python)
                      </p>
                      
                      <div className="relative">
                        <textarea
                          value={codeEditorContent[index] || ''}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          className="w-full h-32 p-3 border rounded-md font-mono text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="# Write your Python code here
# Example: column_first_name + ' ' + column_last_name
# Available columns: column_name1, column_name2, etc."
                        />
                      </div>
                      
                      {codeValidation[index]?.error && (
                        <div className="text-red-600 text-xs bg-red-50 p-2 rounded border">
                          {codeValidation[index].error}
                        </div>
                      )}
                      
                      {/* Quick Insert Helper Buttons */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Quick Insert:</p>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const currentCode = codeEditorContent[index] || '';
                              handleCodeChange(index, currentCode + ' + ');
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentCode = codeEditorContent[index] || '';
                              handleCodeChange(index, currentCode + ' - ');
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentCode = codeEditorContent[index] || '';
                              handleCodeChange(index, currentCode + '"Yes" if column_name == "Active" else "No"');
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Conditional
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentCode = codeEditorContent[index] || '';
                              handleCodeChange(index, currentCode + 'str(column_name1) + " " + str(column_name2)');
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Concatenate
                          </button>
                        </div>
                      </div>
                      
                      {/* Available Columns Dropdown */}
                      {extractedHeaders.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Insert Column Reference:</p>
                          <Select
                            onValueChange={(value) => {
                              const currentCode = codeEditorContent[index] || '';
                              const columnRef = `column_${value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                              handleCodeChange(index, currentCode + columnRef);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select column to insert" />
                            </SelectTrigger>
                            <SelectContent>
                              {extractedHeaders.map((header, headerIndex) => (
                                <SelectItem key={headerIndex} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {/* Preview Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Preview</h4>
                      <p className="text-xs text-gray-600">
                        Sample output from your Python code
                      </p>
                      
                      <div className="border rounded-md p-3 bg-white min-h-32">
                        {codePreview[index] && codePreview[index].length > 0 ? (
                          <div className="space-y-1">
                            {codePreview[index].map((preview, previewIndex) => (
                              <div key={previewIndex} className="text-sm font-mono text-gray-700 py-1 px-2 bg-gray-50 rounded">
                                {preview}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            Preview will appear here when you write valid Python code
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Example Code Section */}
                  <div className="mt-4 pt-4 border-t">
                    <details className="space-y-2">
                      <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                        View Example Python Code
                      </summary>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono space-y-2">
                        <div>
                          <div className="text-gray-600"># Combine first and last name</div>
                          <div>column_first_name + " " + column_last_name</div>
                        </div>
                        <div>
                          <div className="text-gray-600"># Add 20 to price</div>
                          <div>column_price + 20</div>
                        </div>
                        <div>
                          <div className="text-gray-600"># Conditional logic</div>
                          <div>"Yes" if column_status == "Active" else "No"</div>
                        </div>
                        <div>
                          <div className="text-gray-600"># Sum multiple columns</div>
                          <div>column_amount1 + column_amount2 + column_amount3</div>
                        </div>
                      </div>
                    </details>
                  </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Attribute Section */}
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              {!showAddAttribute ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAttribute(true)}
                  className="w-full"
                  size="sm"
                  disabled={getAvailableAttributesForAdding().length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              ) : (
                <div className="border rounded-lg p-3 bg-muted/50 space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Select Attribute</Label>
                    <Select 
                      value={selectedNewAttribute} 
                      onValueChange={setSelectedNewAttribute}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an attribute to add" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[270px]">
                        <div className="sticky top-0 z-50 bg-white border-b px-2 py-1 shadow-sm">
                          <input
                            type="text"
                            placeholder="Search attributes..."
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const items = e.target.closest('[role="listbox"]')?.querySelectorAll('[role="option"]');
                              items?.forEach((item) => {
                                const text = item.textContent?.toLowerCase() || '';
                                const shouldShow = text.includes(searchTerm);
                                (item as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
                              });
                            }}
                          />
                        </div>
                        {getAvailableAttributesForAdding().map((attr: string) => {
                          // Format display name for better UX
                          const displayName = attr.includes('.') 
                            ? `${attr.split('.')[1]} (${attr.split('.')[0]})`
                            : attr;
                          return (
                            <SelectItem key={attr} value={attr}>
                              {displayName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addSelectedAttribute}
                      disabled={!selectedNewAttribute}
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddAttribute(false);
                        setSelectedNewAttribute('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* Empty space on the right to maintain alignment */}
            <div></div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
        >
          Continue to Processing
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}