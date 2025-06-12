import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Plus, Save, Upload as UploadIcon, Trash2, Edit, Code, Bookmark } from 'lucide-react';

interface MappingStepProps {
  uploadType: string;
  uploadedFile: File | null;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  stepName: string;
}

interface UploadTemplate {
  id: number;
  name: string;
  description?: string;
  entityType: string;
  environmentId: string;
  columnMappings: any;
  isShared: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ColumnMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
  customCode?: string;
}

export function MappingStep({ uploadType, uploadedFile, onNext, onPrevious, currentStep, stepName }: MappingStepProps) {
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const environmentId = 'degoudse'; // Default environment

  // Fetch available templates
  const { data: templates = [] } = useQuery<UploadTemplate[]>({
    queryKey: ['/api', environmentId, 'upload', 'templates', { entityType: uploadType }],
    enabled: !!uploadType,
  });

  // Fetch entity attributes for the upload type
  const { data: entityData } = useQuery({
    queryKey: ['/api', environmentId, 'upload', 'entities'],
    enabled: !!uploadType,
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch(`/api/${environmentId}/upload/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', environmentId, 'upload', 'templates'] });
      toast({ title: 'Template saved successfully' });
      setSaveTemplateDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    },
  });

  // Update template usage mutation
  const updateUsageMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/${environmentId}/upload/templates/${templateId}/use`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to update template usage');
      return response.json();
    },
  });

  // Parse CSV headers when file is uploaded
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',')
            .map(h => h.trim().replace(/"/g, ''))
            .filter(h => h.length > 0); // Remove empty headers
          setCsvHeaders(headers);
        }
      };
      reader.readAsText(uploadedFile);
    }
  }, [uploadedFile]);

  // Initialize column mappings based on entity type
  useEffect(() => {
    if (entityData && uploadType) {
      const entitySchema = entityData.find((e: any) => e.tableName.toLowerCase().includes(uploadType.toLowerCase()));
      if (entitySchema) {
        const requiredColumns = entitySchema.columns
          .filter((col: any) => !col.hasDefault && !col.isNullable && col.name !== 'id')
          .map((col: any) => ({
            attribute: col.name,
            csvColumn: '',
            isRequired: true,
          }));
        setColumnMappings(requiredColumns);
      }
    }
  }, [entityData, uploadType]);

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setColumnMappings(template.columnMappings);
      updateUsageMutation.mutate(templateId);
      toast({ title: `Template "${template.name}" loaded successfully` });
    }
  };

  // Add optional attribute
  const addOptionalAttribute = () => {
    setColumnMappings(prev => [...prev, {
      attribute: '',
      csvColumn: '',
      isRequired: false,
    }]);
  };

  // Remove optional attribute
  const removeAttribute = (index: number) => {
    setColumnMappings(prev => prev.filter((_, i) => i !== index));
  };

  // Update column mapping
  const updateMapping = (index: number, field: string, value: string) => {
    setColumnMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  // Save current mapping as template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }

    saveTemplateMutation.mutate({
      name: templateName,
      description: templateDescription,
      entityType: uploadType,
      environmentId,
      columnMappings,
      isShared: false,
    });
  };

  // Get available entity attributes for dropdown
  const getEntityAttributes = () => {
    if (!entityData || !uploadType) return [];
    const entitySchema = entityData.find((e: any) => e.tableName.toLowerCase().includes(uploadType.toLowerCase()));
    return entitySchema?.columns?.map((col: any) => col.name) || [];
  };

  const canProceed = columnMappings.every(mapping => 
    !mapping.isRequired || (mapping.csvColumn || mapping.customCode)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Step {currentStep}: {stepName}</h3>
          <p className="text-gray-600">Map your CSV columns to {uploadType} attributes</p>
        </div>
        
        {/* Template Management */}
        <div className="flex gap-2">
          <Select value={selectedTemplate} onValueChange={(value) => {
            setSelectedTemplate(value);
            if (value) loadTemplate(value);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Load template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No template</SelectItem>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{template.name}</span>
                    <Badge variant="secondary" className="ml-2">{template.usageCount}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-1" />
                Save Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Mapping Template</DialogTitle>
                <DialogDescription>
                  Save your current column mappings as a reusable template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Input
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe this template"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveAsTemplate} disabled={saveTemplateMutation.isPending}>
                  {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Entity Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {columnMappings.map((mapping, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {mapping.isRequired ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                    {mapping.isRequired ? mapping.attribute : (
                      <Select 
                        value={mapping.attribute} 
                        onValueChange={(value) => updateMapping(index, 'attribute', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {getEntityAttributes().map(attr => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Label>
                  {!mapping.isRequired && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAttribute(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Column Selection or Code Editor */}
                <div className="space-y-2">
                  <Select 
                    value={mapping.csvColumn || '__no_mapping__'} 
                    onValueChange={(value) => {
                      if (value === 'code') {
                        setShowCodeEditor(prev => ({ ...prev, [index]: true }));
                      } else {
                        const mappingValue = value === '__no_mapping__' ? '' : value;
                        updateMapping(index, 'csvColumn', mappingValue);
                        setShowCodeEditor(prev => ({ ...prev, [index]: false }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__no_mapping__">No mapping</SelectItem>
                      {csvHeaders.filter(header => header && header.trim().length > 0).map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                      <SelectItem value="code">
                        <div className="flex items-center">
                          <Code className="h-4 w-4 mr-2" />
                          Custom Code
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {showCodeEditor[index] && (
                    <div className="border rounded-md p-3 bg-gray-50">
                      <Label className="text-sm text-gray-600 mb-2 block">
                        Python Code (use column names as variables)
                      </Label>
                      <textarea
                        className="w-full p-2 border rounded text-sm font-mono"
                        rows={3}
                        value={mapping.customCode || ''}
                        onChange={(e) => updateMapping(index, 'customCode', e.target.value)}
                        placeholder="# Example: first_name + ' ' + last_name"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button variant="outline" onClick={addOptionalAttribute} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Optional Attribute
            </Button>
          </CardContent>
        </Card>

        {/* Right side: CSV Preview */}
        <Card>
          <CardHeader>
            <CardTitle>CSV File Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {csvHeaders.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Available columns in your file:</p>
                <div className="flex flex-wrap gap-2">
                  {csvHeaders.map(header => (
                    <Badge key={header} variant="outline">{header}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No file uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Processing
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}