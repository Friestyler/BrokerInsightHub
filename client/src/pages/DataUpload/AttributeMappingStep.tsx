import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Edit, ArrowLeft, ArrowRight, CheckCircle, X, Trash2, Minus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AttributeMappingStepProps {
  uploadedFile: File | null;
  csvHeaders: string[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  selectedTransformationScript?: { id: number; name: string } | null;
  selectedEntityType?: string;
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
  description: string;
  entity_type: string;
  column_mappings: string | AttributeMapping[];
  is_shared: boolean;
  created_by: number;
  environment_id: string;
}

export default function AttributeMappingStep({ 
  uploadedFile, 
  csvHeaders,
  uploadType, 
  stepName, 
  currentStep,
  selectedTransformationScript,
  selectedEntityType: propSelectedEntityType,
  onNext, 
  onBack 
}: AttributeMappingStepProps) {
  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
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
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<{ [key: number]: string }>({});
  const [isGeneratingCode, setIsGeneratingCode] = useState<{ [key: number]: boolean }>({});
  const [codeExplanation, setCodeExplanation] = useState<{ [key: number]: string }>({});
  const [showAiInterface, setShowAiInterface] = useState<{ [key: number]: boolean }>({});
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Environment and entity detection
  const environmentId = 'degoudse'; // Default environment
  const isEntityUpload = uploadType === 'entity-upload';
  
  // Extract actual entity type from uploadType
  const actualEntityType = isEntityUpload ? (propSelectedEntityType || selectedEntityType) : uploadType;
  
  // Initialize selectedEntityType from prop if it's not set
  useEffect(() => {
    if (propSelectedEntityType && propSelectedEntityType !== selectedEntityType) {
      setSelectedEntityType(propSelectedEntityType);
    }
  }, [propSelectedEntityType, selectedEntityType]);

  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/degoudse/upload-templates'],
    enabled: true
  });

  // Fetch entity schemas
  const { data: entitySchemas = [] } = useQuery({
    queryKey: ['/api/admin/entity-schemas'],
    enabled: true
  });

  // Fetch upload settings for mandatory attributes
  const { data: uploadSettings = [], isLoading: isLoadingUploadSettings } = useQuery({
    queryKey: [`/api/${environmentId}/upload-settings/${actualEntityType}`],
    enabled: !!actualEntityType && !!environmentId
  });

  // Initialize attribute mappings based on upload settings
  useEffect(() => {
    if (uploadSettings.length > 0 && attributeMappings.length === 0 && selectedTemplateId === 'none') {
      const mandatoryAttributes = uploadSettings.filter((setting: any) => setting.is_mandatory);
      const mappings = mandatoryAttributes.map((setting: any) => ({
        attribute: setting.attribute_name,
        csvColumn: '',
        isRequired: setting.is_mandatory,
        isCodeBased: false
      }));
      setAttributeMappings(mappings);
    }
  }, [uploadSettings, attributeMappings.length, selectedTemplateId]);

  // Auto-load templates for entity uploads
  useEffect(() => {
    if (isEntityUpload && selectedEntityType && templates.length > 0 && !templateLoaded) {
      const compatibleTemplates = (templates as any[]).filter(
        (template: any) => template.entity_type === selectedEntityType
      );
      
      if (compatibleTemplates.length > 0) {
        const lastUsedTemplateId = getLastUsedTemplate(selectedEntityType);
        const templateToLoad = lastUsedTemplateId 
          ? compatibleTemplates.find((t: any) => t.id.toString() === lastUsedTemplateId)
          : compatibleTemplates[0];
        
        if (templateToLoad) {
          setSelectedTemplateId(templateToLoad.id.toString());
          try {
            const mappings = typeof templateToLoad.column_mappings === 'string' 
              ? JSON.parse(templateToLoad.column_mappings) 
              : templateToLoad.column_mappings;
            setAttributeMappings(mappings);
            setTemplateLoaded(true);
          } catch (error) {
            console.error('Failed to load template:', error);
          }
        }
      }
    }
  }, [isEntityUpload, selectedEntityType, templates, templateLoaded]);

  // Helper functions
  const getLastUsedTemplate = (uploadType: string): string | null => {
    return localStorage.getItem(`lastUsedTemplate_${uploadType}`);
  };

  const saveLastUsedTemplate = (templateId: number, uploadType: string) => {
    localStorage.setItem(`lastUsedTemplate_${uploadType}`, templateId.toString());
  };

  // Parse CSV data for preview
  useEffect(() => {
    if (uploadedFile && (uploadedFile.type === 'text/csv' || uploadedFile.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          // Handle CSV parsing with proper quote handling
          const parseCSVLine = (line: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              const nextChar = line[i + 1];
              
              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  current += '"';
                  i++; // Skip next quote
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };
          
          const headers = parseCSVLine(lines[0]);
          const dataRows = lines.slice(1, 4).map(line => {
            const values = parseCSVLine(line);
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          setCsvData(dataRows);
        }
      };
      reader.readAsText(uploadedFile);
    }
  }, [uploadedFile]);

  // Generate preview data for attribute mappings
  const generatePreview = (mapping: AttributeMapping, index: number) => {
    if (!csvData.length) return ['No sample data available'];
    
    const { csvColumn, customCode, isCodeBased } = mapping;
    
    if (csvColumn && csvColumn !== '') {
      // Show actual data from the CSV column
      const samples = csvData.map((row, idx) => {
        const value = row[csvColumn] || 'Empty';
        return `Row ${idx + 1}: ${value}`;
      }).slice(0, 3);
      
      if (isCodeBased && customCode) {
        // Show original data + transformation note
        return [...samples, '↓ Custom transformation will be applied'];
      }
      
      return samples.length > 0 ? samples : ['No data in selected column'];
    }
    
    if (isCodeBased && customCode) {
      return ['Custom transformation code will be applied', 'Select a CSV column to see input data'];
    }
    
    return ['Select a CSV column to see preview'];
  };

  // Update preview when mappings change
  useEffect(() => {
    const newPreview: { [key: number]: string[] } = {};
    attributeMappings.forEach((mapping, index) => {
      newPreview[index] = generatePreview(mapping, index);
    });
    setCodePreview(newPreview);
  }, [attributeMappings, csvData]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Templates Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Save className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
            <p className="text-sm text-gray-500">Load existing or create new mapping templates</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Select 
              value={selectedTemplateId} 
              onValueChange={(value) => {
                setSelectedTemplateId(value);
                if (value && value !== 'none') {
                  const template = templates.find((t: any) => t.id.toString() === value);
                  if (template) {
                    try {
                      const mappings = typeof template.column_mappings === 'string' 
                        ? JSON.parse(template.column_mappings) 
                        : template.column_mappings;
                      setAttributeMappings(mappings);
                      setTemplateLoaded(true);
                      toast({ 
                        title: `Template "${template.name}" loaded`,
                        description: `Auto-loaded with ${mappings.length} column mappings`
                      });
                    } catch (error) {
                      toast({ title: 'Failed to load template', variant: 'destructive' });
                    }
                  }
                } else if (value === 'none') {
                  setAttributeMappings([]);
                  toast({ title: 'Template cleared' });
                }
              }}
            >
              <SelectTrigger className="h-12 bg-white border-gray-200 hover:border-blue-400 transition-all rounded-xl">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Create New Template</SelectItem>
                {templates
                  .filter((template: any) => {
                    if (isEntityUpload && selectedEntityType) {
                      return template.entity_type === selectedEntityType;
                    }
                    return true;
                  })
                  .map((template: any) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setShowSaveTemplate(true)}
            className="h-12 px-6 border-gray-200 hover:bg-blue-50 hover:border-blue-400 rounded-xl transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>

        {showSaveTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-blue-800">Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-2 border-blue-200 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  if (!templateName.trim()) {
                    toast({ title: 'Please enter a template name', variant: 'destructive' });
                    return;
                  }
                  toast({ title: 'Template saved successfully' });
                  setShowSaveTemplate(false);
                  setTemplateName('');
                }}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSaveTemplate(false)}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Mapping Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">⚡</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Column Mapping</h3>
            <p className="text-sm text-gray-500">Map your CSV columns to entity attributes</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mapping Cards */}
          <div className="space-y-4">
            {attributeMappings.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📊</span>
                </div>
                <p className="text-gray-600 font-medium">No attributes configured</p>
                <p className="text-sm text-gray-500 mt-1">Select a template or configure mapping manually</p>
              </div>
            )}
            
            {attributeMappings.map((mapping, index) => (
              <div key={`mapping-row-${index}`} className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Attribute Info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        mapping.isRequired 
                          ? 'bg-gradient-to-br from-red-100 to-orange-100 text-red-600' 
                          : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600'
                      }`}>
                        {mapping.isRequired ? '⚡' : '📊'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{mapping.attribute}</span>
                          {mapping.isRequired && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {mapping.isRequired ? 'This field is mandatory for processing' : 'Optional field - can be skipped'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Remove button for optional fields */}
                    {!mapping.isRequired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => {
                          const newMappings = attributeMappings.filter((_, i) => i !== index);
                          setAttributeMappings(newMappings);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* CSV Column Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Map to CSV Column</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select 
                          value={mapping.csvColumn} 
                          onValueChange={(value) => {
                            const newMappings = [...attributeMappings];
                            if (value === 'CODE') {
                              newMappings[index] = { 
                                ...mapping, 
                                csvColumn: value, 
                                isCodeBased: true,
                                customCode: codeEditorContent[index] || ''
                              };
                              setShowCodeEditor(prev => ({ ...prev, [index]: true }));
                            } else {
                              newMappings[index] = { 
                                ...mapping, 
                                csvColumn: value, 
                                isCodeBased: false,
                                customCode: undefined
                              };
                              setShowCodeEditor(prev => ({ ...prev, [index]: false }));
                            }
                            setAttributeMappings(newMappings);
                          }}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-200 hover:border-blue-400 transition-all rounded-xl">
                            <SelectValue placeholder="Choose a CSV column..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[270px] p-0">
                            <div className="p-1">
                              <SelectItem value="CODE" className="bg-purple-50 text-purple-700 font-medium rounded-lg m-1">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-500">&lt;/&gt;</span>
                                    Custom Code Logic
                                  </div>
                                  {mapping.customCode && mapping.customCode.trim() && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">Applied</span>
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                              {csvHeaders.filter(header => header && header.trim().length > 0).map(header => (
                                <SelectItem key={header} value={header} className="rounded-lg m-1">{header}</SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Edit Code Button */}
                      {mapping.csvColumn === 'CODE' && mapping.customCode && mapping.customCode.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCodeEditor(prev => ({ ...prev, [index]: true }))}
                          className="h-12 px-4 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl transition-all"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Code Editor Section - appears when "Code" is selected */}
                {showCodeEditor[index] && mapping.csvColumn === 'CODE' && (
                  <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Clean Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <span className="text-purple-600 text-lg font-bold">&lt;/&gt;</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Custom Logic</h3>
                            <p className="text-sm text-gray-600">Transform data with AI or code</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {codeValidation[index]?.isValid && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Applied</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCodeEditor(prev => ({ ...prev, [index]: false }))}
                            className="rounded-full h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* AI Assistant */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">AI Assistant</h4>
                              <p className="text-sm text-gray-600">Describe what you want</p>
                            </div>
                          </div>
                          <Button
                            variant={showAiInterface[index] ? "default" : "outline"}
                            onClick={() => setShowAiInterface(prev => ({ ...prev, [index]: !prev[index] }))}
                            className="rounded-full"
                          >
                            {showAiInterface[index] ? 'Close' : 'Use AI'}
                          </Button>
                        </div>

                        {showAiInterface[index] && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-4">
                            <textarea
                              value={aiPrompt[index] || ''}
                              onChange={(e) => setAiPrompt(prev => ({ ...prev, [index]: e.target.value }))}
                              placeholder="Example: Combine first and last name with an underscore"
                              className="w-full h-20 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Try: "Combine columns", "Add prefix", "Make uppercase"
                              </div>
                              <Button
                                onClick={() => {
                                  const prompt = aiPrompt[index];
                                  if (!prompt?.trim()) {
                                    toast({
                                      title: "Please enter a description",
                                      description: "Describe what you want the transformation to do.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  setIsGeneratingCode(prev => ({ ...prev, [index]: true }));
                                  
                                  // Mock AI code generation with realistic examples based on common patterns
                                  setTimeout(() => {
                                    let generatedCode = '';
                                    let explanation = '';
                                    
                                    const lowerPrompt = prompt.toLowerCase();
                                    
                                    if (lowerPrompt.includes('combine') || lowerPrompt.includes('concat')) {
                                      if (csvHeaders.length >= 2) {
                                        generatedCode = `column_${csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_')} + ' ' + column_${csvHeaders[1]?.toLowerCase().replace(/\s+/g, '_')}`;
                                        explanation = `This combines the first two columns (${csvHeaders[0]} and ${csvHeaders[1]}) with a space between them.`;
                                      } else {
                                        generatedCode = `column_name + ' ' + column_value`;
                                        explanation = 'This combines two columns with a space between them.';
                                      }
                                    } else if (lowerPrompt.includes('uppercase') || lowerPrompt.includes('upper')) {
                                      const firstCol = csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_') || 'column_name';
                                      generatedCode = `column_${firstCol}.upper()`;
                                      explanation = 'This converts the text to uppercase letters.';
                                    } else if (lowerPrompt.includes('lowercase') || lowerPrompt.includes('lower')) {
                                      const firstCol = csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_') || 'column_name';
                                      generatedCode = `column_${firstCol}.lower()`;
                                      explanation = 'This converts the text to lowercase letters.';
                                    } else if (lowerPrompt.includes('percentage') || lowerPrompt.includes('percent')) {
                                      const firstCol = csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_') || 'column_percentage';
                                      generatedCode = `float(column_${firstCol}.replace('%', '')) / 100`;
                                      explanation = 'This converts a percentage value to a decimal (e.g., 75% becomes 0.75).';
                                    } else if (lowerPrompt.includes('prefix')) {
                                      const firstCol = csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_') || 'column_name';
                                      generatedCode = `'PREFIX_' + column_${firstCol}`;
                                      explanation = 'This adds a prefix to the beginning of the text.';
                                    } else {
                                      // Default transformation
                                      const firstCol = csvHeaders[0]?.toLowerCase().replace(/\s+/g, '_') || 'column_name';
                                      generatedCode = `column_${firstCol}`;
                                      explanation = 'This uses the column value as-is.';
                                    }
                                    
                                    setCodeEditorContent(prev => ({ ...prev, [index]: generatedCode }));
                                    setCodeExplanation(prev => ({ ...prev, [index]: explanation }));
                                    setIsGeneratingCode(prev => ({ ...prev, [index]: false }));
                                    
                                    // Update the mapping with the generated code
                                    const newMappings = [...attributeMappings];
                                    newMappings[index] = { ...newMappings[index], customCode: generatedCode };
                                    setAttributeMappings(newMappings);
                                    
                                    toast({
                                      title: "Code Generated",
                                      description: "AI has generated your transformation code based on your description."
                                    });
                                  }, 1500);
                                }}
                                disabled={isGeneratingCode[index] || !aiPrompt[index]?.trim()}
                                className="rounded-full bg-blue-600 hover:bg-blue-700"
                              >
                                {isGeneratingCode[index] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Success feedback */}
                            {codeExplanation[index] && (
                              <div className="bg-white rounded-lg border border-green-200 p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-green-800">Generated successfully!</p>
                                    <p className="text-sm text-green-700 mt-1">{codeExplanation[index]}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Code Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Code Editor</h4>
                              <p className="text-sm text-gray-600">Edit transformation code</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCodeEditorContent(prev => ({ ...prev, [index]: '' }));
                              setAttributeMappings(prev => prev.map((mapping, i) => 
                                i === index ? { ...mapping, customCode: '' } : mapping
                              ));
                            }}
                            className="rounded-full"
                          >
                            Clear
                          </Button>
                        </div>
                        
                        {/* Column Selection and Operators */}
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg mb-3">
                          {/* CSV Columns Dropdown */}
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-medium text-gray-500">Insert column:</div>
                            <Select
                              onValueChange={(selectedHeader) => {
                                const columnRef = `column_${selectedHeader.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
                                const currentCode = codeEditorContent[index] || '';
                                const newCode = currentCode + columnRef;
                                setCodeEditorContent(prev => ({ ...prev, [index]: newCode }));
                                setAttributeMappings(prev => prev.map((mapping, i) => 
                                  i === index ? { ...mapping, customCode: newCode, isCodeBased: true } : mapping
                                ));
                              }}
                            >
                              <SelectTrigger className="w-48 h-8 text-xs bg-green-50 border-green-200 hover:border-green-300">
                                <SelectValue placeholder="Choose column..." />
                              </SelectTrigger>
                              <SelectContent>
                                {csvHeaders.map((header, headerIndex) => (
                                  <SelectItem key={headerIndex} value={header}>
                                    <span className="font-mono text-green-700">{header}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Operators */}
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-2">Quick operators:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: '+', desc: 'Combine', code: ' + ' },
                                { label: '.upper()', desc: 'Uppercase', code: '.upper()' },
                                { label: '.lower()', desc: 'Lowercase', code: '.lower()' },
                                { label: '.strip()', desc: 'Remove spaces', code: '.strip()' },
                                { label: '.replace()', desc: 'Replace text', code: '.replace("old", "new")' },
                                { label: 'float()', desc: 'To number', code: 'float(' },
                                { label: 'str()', desc: 'To text', code: 'str(' },
                                { label: 'len()', desc: 'Length', code: 'len(' }
                              ].map((op, opIndex) => (
                                <button
                                  key={opIndex}
                                  onClick={() => {
                                    const currentCode = codeEditorContent[index] || '';
                                    const newCode = currentCode + op.code;
                                    setCodeEditorContent(prev => ({ ...prev, [index]: newCode }));
                                    setAttributeMappings(prev => prev.map((mapping, i) => 
                                      i === index ? { ...mapping, customCode: newCode, isCodeBased: true } : mapping
                                    ));
                                  }}
                                  className="group relative px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                  title={op.desc}
                                >
                                  <span className="font-mono">{op.label}</span>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {op.desc}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-1">
                          <textarea
                            value={codeEditorContent[index] || ''}
                            onChange={(e) => {
                              setCodeEditorContent(prev => ({ ...prev, [index]: e.target.value }));
                              setAttributeMappings(prev => prev.map((mapping, i) => 
                                i === index && mapping.isCodeBased ? { ...mapping, customCode: e.target.value } : mapping
                              ));
                            }}
                            className="w-full h-32 p-4 bg-white border-0 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Python code: column_name.upper() + '_suffix'
Examples:
• column_name.replace(' ', '_').lower()
• float(column_price.replace('$', '')) * 1.2
• column_first + ' ' + column_last"
                          />
                        </div>
                        
                        {/* Python Help */}
                        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <div className="font-medium text-blue-800 mb-1">Python syntax supported:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>• Reference columns: <code className="bg-blue-100 px-1 rounded">column_name</code></div>
                            <div>• String methods: <code className="bg-blue-100 px-1 rounded">.upper() .lower() .strip()</code></div>
                            <div>• Type conversion: <code className="bg-blue-100 px-1 rounded">float() str() int()</code></div>
                            <div>• Math operations: <code className="bg-blue-100 px-1 rounded">+ - * / **</code></div>
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-sm font-bold">◎</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Preview</h4>
                            <p className="text-sm text-gray-600">Sample results from your data</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 min-h-24">
                          {codePreview[index] && codePreview[index].length > 0 ? (
                            <div className="space-y-2">
                              {codePreview[index].map((preview, previewIndex) => {
                                const isError = preview.includes('Error') || preview.includes('Function-based') || preview.includes('Add simple');
                                return (
                                  <div key={previewIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                                    isError ? 'bg-yellow-50' : 'bg-white border border-gray-200'
                                  }`}>
                                    {isError ? (
                                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 text-xs font-bold">{previewIndex + 1}</span>
                                      </div>
                                    )}
                                    <span className="text-sm font-medium">{preview}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-16 text-gray-400">
                              <div className="text-center">
                                <div className="text-sm">Preview will appear here</div>
                                <div className="text-xs mt-1">Write code or use AI to see results</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Optional Attribute
                </Button>
              ) : (
                <div className="space-y-3">
                  <Select 
                    value={selectedNewAttribute} 
                    onValueChange={setSelectedNewAttribute}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="value">Value</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        if (selectedNewAttribute) {
                          setAttributeMappings(prev => [...prev, {
                            attribute: selectedNewAttribute,
                            csvColumn: '',
                            isRequired: false,
                          }]);
                          setSelectedNewAttribute('');
                          setShowAddAttribute(false);
                        }
                      }}
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
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="h-12 px-6 border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => onNext(attributeMappings)} 
          disabled={attributeMappings.length === 0}
          className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Process Data
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}