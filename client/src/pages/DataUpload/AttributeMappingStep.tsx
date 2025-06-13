import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Edit, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AttributeMappingStepProps {
  uploadedFile: File | null;
  csvHeaders: string[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: (mappings: AttributeMapping[]) => void;
  onBack: () => void;
}

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
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

  // Get available entity attributes
  const getEntityAttributes = () => {
    if (!Array.isArray(entityData) || !uploadType) return [];
    
    // Try multiple matching strategies
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
    
    console.log('Entity schema lookup:', {
      uploadType,
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
      i === index ? { ...mapping, csvColumn } : mapping
    ));
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
  const loadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id.toString() === templateId);
    if (template && template.column_mappings) {
      let mappings;
      try {
        mappings = typeof template.column_mappings === 'string' 
          ? JSON.parse(template.column_mappings) 
          : template.column_mappings;
        
        setAttributeMappings(mappings);
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
    .every(mapping => mapping.csvColumn);

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
                  if (value) loadTemplate(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
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
            {selectedTemplateId && (
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
              <div key={`mapping-row-${index}`} className="grid grid-cols-2 gap-8 items-stretch">
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
                    <SelectContent className="max-h-[200px]">
                      <div className="px-2 py-1">
                        <input
                          type="text"
                          placeholder="Search columns..."
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      {csvHeadersToUse.map(header => (
                        <SelectItem key={header} value={header}>{header}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectContent className="max-h-[200px]">
                        <div className="px-2 py-1">
                          <input
                            type="text"
                            placeholder="Search attributes..."
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        {getAvailableAttributesForAdding().map((attr: string) => (
                          <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                        ))}
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