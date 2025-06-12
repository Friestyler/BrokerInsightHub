import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Code, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TemplateCarousel } from '@/components/TemplateCarousel';

interface AttributeMappingStepProps {
  uploadedFile: File | null;
  csvHeaders: string[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
}

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  customCode?: string;
  isRequired: boolean;
  isCodeBased: boolean;
}

export default function AttributeMappingStep({ 
  uploadedFile, 
  csvHeaders,
  uploadType, 
  stepName, 
  currentStep,
  onNext, 
  onBack 
}: AttributeMappingStepProps) {
  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingCodeFor, setEditingCodeFor] = useState<string | null>(null);
  const [extractedHeaders, setExtractedHeaders] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract CSV headers from uploaded file
  useEffect(() => {
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setExtractedHeaders(headers);
        }
      };
      reader.readAsText(uploadedFile);
    }
  }, [uploadedFile]);

  // Get environment ID from localStorage
  const environmentId = localStorage.getItem('currentEnvironment') || 'degoudse';

  // Fetch entity schema to get attributes
  const { data: entityData = [] } = useQuery({
    queryKey: ['/api/admin/entity-schemas', environmentId],
    enabled: !!environmentId,
  });

  // Fetch upload settings to determine required attributes
  const { data: uploadSettings = [] } = useQuery({
    queryKey: ['/api/upload-settings', environmentId],
    enabled: !!environmentId,
  });

  // Fetch templates for this entity type
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/upload-templates', environmentId, uploadType],
    enabled: !!environmentId && !!uploadType,
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/upload-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/upload-templates'] });
      toast({ title: 'Template saved successfully' });
      setShowTemplateForm(false);
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
      const response = await fetch(`/api/upload-templates/${templateId}/usage`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update usage');
      return response.json();
    },
  });

  // Initialize required attributes based on upload settings
  useEffect(() => {
    if (Array.isArray(entityData) && Array.isArray(uploadSettings) && uploadType) {
      const entitySchema = entityData.find((e: any) => 
        e.tableName && e.tableName.toLowerCase().includes(uploadType.toLowerCase())
      );
      
      const entityUploadSettings = uploadSettings.find((s: any) => 
        s.entityType === uploadType
      );

      if (entitySchema && entityUploadSettings) {
        const requiredAttributes = entityUploadSettings.requiredAttributes || [];
        const mappings = requiredAttributes.map((attr: string) => ({
          attribute: attr,
          csvColumn: '',
          isRequired: true,
          isCodeBased: false,
        }));
        setAttributeMappings(mappings);
      }
    }
  }, [entityData, uploadSettings, uploadType]);

  // Get available entity attributes
  const getEntityAttributes = () => {
    if (!Array.isArray(entityData) || !uploadType) return [];
    const entitySchema = entityData.find((e: any) => 
      e.tableName && e.tableName.toLowerCase().includes(uploadType.toLowerCase())
    );
    return entitySchema?.columns
      ?.map((col: any) => col.name)
      ?.filter((name: string) => name && name.trim().length > 0) || [];
  };

  // Update attribute mapping
  const updateMapping = (index: number, field: string, value: string) => {
    setAttributeMappings(prev => prev.map((mapping, i) => 
      i === index ? { 
        ...mapping, 
        [field]: value,
        // Reset code when switching to CSV column
        ...(field === 'csvColumn' && value !== '__code__' ? { customCode: '', isCodeBased: false } : {}),
        // Set code flag when switching to code
        ...(field === 'csvColumn' && value === '__code__' ? { isCodeBased: true } : {})
      } : mapping
    ));
  };

  // Add optional attribute
  const addOptionalAttribute = () => {
    const availableAttributes = getEntityAttributes();
    const usedAttributes = attributeMappings.map(m => m.attribute);
    const nextAvailable = availableAttributes.find((attr: string) => !usedAttributes.includes(attr));
    
    setAttributeMappings(prev => [...prev, {
      attribute: nextAvailable || '',
      csvColumn: '',
      isRequired: false,
      isCodeBased: false,
    }]);
  };

  // Remove optional attribute
  const removeAttribute = (index: number) => {
    setAttributeMappings(prev => prev.filter((_, i) => i !== index));
  };

  // Load template
  const loadTemplate = (templateId: string) => {
    if (!Array.isArray(templates)) return;
    const template = templates.find((t: any) => t.id.toString() === templateId);
    if (template && template.columnMappings) {
      const mappings = Object.entries(template.columnMappings).map(([attr, mapping]: [string, any]) => ({
        attribute: attr,
        csvColumn: mapping.csvColumn || '',
        customCode: mapping.customCode || '',
        isRequired: mapping.isRequired || false,
        isCodeBased: mapping.isCodeBased || false,
      }));
      setAttributeMappings(mappings);
      updateUsageMutation.mutate(templateId);
      toast({ title: `Template "${template.name}" loaded successfully` });
    }
  };

  // Save current mapping as template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }

    const columnMappings = attributeMappings.reduce((acc, mapping) => {
      acc[mapping.attribute] = {
        csvColumn: mapping.csvColumn,
        customCode: mapping.customCode,
        isRequired: mapping.isRequired,
        isCodeBased: mapping.isCodeBased,
      };
      return acc;
    }, {} as any);

    saveTemplateMutation.mutate({
      name: templateName,
      description: templateDescription,
      entityType: uploadType,
      environmentId,
      columnMappings,
      isShared: false,
    });
  };

  const canProceed = attributeMappings
    .filter(m => m.isRequired)
    .every(mapping => mapping.csvColumn || mapping.customCode);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Step {currentStep}: {stepName}</h3>
          <p className="text-sm text-muted-foreground">
            Map CSV columns to {uploadType} attributes
          </p>
        </div>
      </div>

      {/* Template Carousel */}
      {Array.isArray(templates) && templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateCarousel
              templates={Array.isArray(templates) ? templates : []}
              onSelectTemplate={loadTemplate}
              entityType={uploadType || ''}
              environmentId={environmentId}
            />
          </CardContent>
        </Card>
      )}

      {/* File Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            CSV Headers ({(extractedHeaders.length || csvHeaders.length)} columns)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(extractedHeaders.length > 0 ? extractedHeaders : csvHeaders).map((header, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {header}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attribute Mappings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attribute Mappings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attributeMappings.map((mapping, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{mapping.attribute}</Label>
                  {mapping.isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
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

              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Map to:</Label>
                  <Select 
                    value={mapping.isCodeBased ? '__code__' : mapping.csvColumn} 
                    onValueChange={(value) => {
                      updateMapping(index, 'csvColumn', value);
                      if (value === '__code__') {
                        setEditingCodeFor(mapping.attribute);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column or custom code" />
                    </SelectTrigger>
                    <SelectContent>
                      {(extractedHeaders.length > 0 ? extractedHeaders : csvHeaders).map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                      <Separator />
                      <SelectItem value="__code__">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Custom Code
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {mapping.isCodeBased && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Python Code:</Label>
                    <Textarea
                      placeholder="# Define custom logic using column references
# Example: column_first_name + ' ' + column_last_name
# Available columns: ${(extractedHeaders.length > 0 ? extractedHeaders : csvHeaders).join(', ')}"
                      value={mapping.customCode || ''}
                      onChange={(e) => updateMapping(index, 'customCode', e.target.value)}
                      className="font-mono text-sm"
                      rows={4}
                    />
                    <div className="text-xs text-muted-foreground">
                      Use column names as variables: {(extractedHeaders.length > 0 ? extractedHeaders : csvHeaders).map(h => `column_${h.replace(/[^a-zA-Z0-9]/g, '_')}`).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button 
            variant="outline" 
            onClick={addOptionalAttribute}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Optional Attribute
          </Button>
        </CardContent>
      </Card>

      {/* Save Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Save as Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showTemplateForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateForm(true)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Mapping as Template
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe this template..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveAsTemplate}
                  disabled={saveTemplateMutation.isPending}
                >
                  {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
        >
          Continue to Processing
        </Button>
      </div>
    </div>
  );
}