import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Database, Code, Info, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface EntityAttribute {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  maxLength: number | null;
  isArray: boolean;
}

interface EntitySchema {
  entityType: string;
  tableName: string;
  attributes: EntityAttribute[];
}

interface UploadSetting {
  id: number;
  environment_id: string;
  entity_type: string;
  attribute_name: string;
  is_mandatory: boolean;
  data_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface TransformationScript {
  id: number;
  environment_id: string;
  entity_type: string;
  name: string;
  script_name?: string;
  script_content: string;
  description?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}



export default function UploadSettingsPage() {
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [activeTab, setActiveTab] = useState('settings');
  const [editingScript, setEditingScript] = useState<TransformationScript | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingScript, setDeletingScript] = useState<TransformationScript | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { environment } = useEnvironment();

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 [UploadSettings] State Debug:', {
      selectedEntity,
      environmentId: environment?.id,
      activeTab,
      timestamp: new Date().toISOString()
    });
  }, [selectedEntity, environment?.id, activeTab]);

  // Fetch supported entities
  const { data: supportedEntities = [], isLoading: entitiesLoading, error: entitiesError } = useQuery<string[]>({
    queryKey: ['/api/upload/supported-entities'],
    enabled: true
  });

  // Fetch entity schemas for current environment
  const { data: entitySchemas = [], isLoading: schemasLoading, error: schemasError } = useQuery<EntitySchema[]>({
    queryKey: [`/api/${environment.id}/upload/entities`, environment.id],
    enabled: !!environment.id
  });

  // Fetch upload settings for selected entity
  const { data: uploadSettings = [], isLoading: settingsLoading, error: settingsError } = useQuery<UploadSetting[]>({
    queryKey: [`/api/${environment.id}/upload-settings/${selectedEntity}`, environment.id, selectedEntity],
    enabled: !!environment.id && !!selectedEntity
  });

  // Fetch transformation scripts
  const { data: transformationScripts = [], isLoading: scriptsLoading, error: scriptsError } = useQuery<TransformationScript[]>({
    queryKey: [`/api/${environment.id}/transformation-scripts`],
    enabled: !!environment.id
  });

  // Debug logging for query results
  useEffect(() => {
    console.log('📊 [UploadSettings] Query Data Debug:', {
      supportedEntities: { data: supportedEntities, loading: entitiesLoading, error: entitiesError },
      entitySchemas: { data: entitySchemas, loading: schemasLoading, error: schemasError },
      uploadSettings: { data: uploadSettings, loading: settingsLoading, error: settingsError },
      transformationScripts: { data: transformationScripts, loading: scriptsLoading, error: scriptsError },
      timestamp: new Date().toISOString()
    });
  }, [supportedEntities, entitiesLoading, entitiesError, entitySchemas, schemasLoading, schemasError, uploadSettings, settingsLoading, settingsError, transformationScripts, scriptsLoading, scriptsError]);



  // Update transformation script mutation
  const updateScriptMutation = useMutation({
    mutationFn: async (data: { scriptId: number; name: string; description: string; scriptContent: string }) => {
      const response = await fetch(`/api/${environment.id}/transformation-scripts/${data.scriptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          script_content: data.scriptContent
        })
      });
      if (!response.ok) throw new Error('Failed to update script');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/transformation-scripts`] });
      setIsEditDialogOpen(false);
      setEditingScript(null);
      toast({
        title: "Success",
        description: "Transformation script updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update transformation script",
        variant: "destructive"
      });
    }
  });

  // Update upload settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { attributeName: string; isMandatory: boolean; dataType?: string }[]) => {
      const response = await fetch(`/api/${environment.id}/upload-settings/${selectedEntity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Upload settings updated successfully' });
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/upload-settings/${selectedEntity}`, environment.id, selectedEntity] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update upload settings', variant: 'destructive' });
    }
  });

  // Delete transformation script mutation
  const deleteScriptMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      const response = await fetch(`/api/${environment.id}/transformation-scripts/${scriptId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete script');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/transformation-scripts`] });
      setIsDeleteDialogOpen(false);
      setDeletingScript(null);
      toast({
        title: "Success",
        description: "Transformation script deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transformation script",
        variant: "destructive"
      });
    }
  });

  // Set default entity when entities are loaded
  useEffect(() => {
    if (supportedEntities.length > 0 && !selectedEntity) {
      setSelectedEntity(supportedEntities[0]);
    }
  }, [supportedEntities, selectedEntity]);

  const selectedSchema = entitySchemas.find(schema => schema.entityType === selectedEntity);
  
  const isLoading = settingsLoading || schemasLoading;
  const hasValidData = selectedSchema && selectedEntity;

  // Debug rendering logic
  useEffect(() => {
    console.log('🎨 [UploadSettings] Render Logic Debug:', {
      selectedEntity,
      selectedSchema: selectedSchema ? {
        entityType: selectedSchema.entityType,
        tableName: selectedSchema.tableName,
        attributesCount: selectedSchema.attributes?.length || 0,
        attributes: selectedSchema.attributes?.map(attr => ({ name: attr.name, dataType: attr.dataType })) || []
      } : null,
      uploadSettings: uploadSettings?.map(setting => ({
        attribute_name: setting.attribute_name,
        is_mandatory: setting.is_mandatory
      })) || [],
      isLoading,
      hasValidData,
      timestamp: new Date().toISOString()
    });
  }, [selectedEntity, selectedSchema, uploadSettings, isLoading, hasValidData]);

  const handleSettingChange = (attributeName: string, isMandatory: boolean) => {
    if (!selectedSchema || !environment.id || !selectedEntity) return;

    // Create the single setting update
    const settingUpdate = {
      attributeName,
      isMandatory,
      dataType: selectedSchema.attributes.find(attr => attr.name === attributeName)?.dataType
    };

    updateSettingsMutation.mutate([settingUpdate]);
  };

  const handleDeleteScript = () => {
    if (!deletingScript) return;
    deleteScriptMutation.mutate(deletingScript.id);
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Upload Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure which fields are mandatory for data uploads
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {selectedSchema?.tableName}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entity-select">Entity Type</Label>
        <Select value={selectedEntity} onValueChange={(value) => {
          console.log('🔄 [UploadSettings] Entity Selection Debug:', {
            previousEntity: selectedEntity,
            newEntity: value,
            timestamp: new Date().toISOString()
          });
          setSelectedEntity(value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            {supportedEntities.map(entity => (
              <SelectItem key={entity} value={entity}>{entity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : hasValidData && selectedSchema ? (
        <div className="space-y-4">
          {selectedSchema.attributes.map((attribute) => {
            const setting = uploadSettings.find(s => s.attribute_name === attribute.name);
            const isMandatory = setting?.is_mandatory || false;

            return (
              <Card key={attribute.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{attribute.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {attribute.dataType}
                      </Badge>
                      {attribute.isArray && (
                        <Badge variant="outline" className="text-xs">Array</Badge>
                      )}
                      {!attribute.isNullable && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`mandatory-${attribute.name}`} className="text-sm">
                      Mandatory
                    </Label>
                    <Switch
                      id={`mandatory-${attribute.name}`}
                      checked={isMandatory}
                      onCheckedChange={(checked) => handleSettingChange(attribute.name, checked)}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select an entity type to configure upload settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderScriptsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Transformation Scripts</h3>
          <p className="text-sm text-muted-foreground">
            Custom scripts for data transformation during upload
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Transformation Script</DialogTitle>
              <DialogDescription>
                Create a new transformation script for processing uploaded data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="script-name">Script Name</Label>
                  <Input id="script-name" placeholder="Enter script name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="script-entity">Target Entity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedEntities.map(entity => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="script-description">Description</Label>
                <Input id="script-description" placeholder="Script description (optional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="script-content">Script Content</Label>
                <Textarea 
                  id="script-content" 
                  placeholder="// Transform data function&#10;function transform(data) {&#10;  // Your transformation logic here&#10;  return data;&#10;}"
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Script</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {transformationScripts.length > 0 ? (
          transformationScripts.map((script) => (
            <Card key={script.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{script.name}</CardTitle>
                    {script.description && (
                      <CardDescription>{script.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingScript(script);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setDeletingScript(script);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">{script.script_content.slice(0, 200)}...</code>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert>
            <Code className="h-4 w-4" />
            <AlertDescription>
              No transformation scripts found. Create a script to transform data during upload.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );



  // Handle save script changes
  const handleSaveScript = () => {
    if (!editingScript) return;
    
    const nameInput = document.getElementById('edit-script-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('edit-script-description') as HTMLInputElement;
    const contentTextarea = document.getElementById('edit-script-content') as HTMLTextAreaElement;
    
    if (nameInput && contentTextarea) {
      updateScriptMutation.mutate({
        scriptId: editingScript.id,
        name: nameInput.value,
        description: descriptionInput?.value || '',
        scriptContent: contentTextarea.value
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Upload Settings</h1>
      </div>



      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          {renderSettingsTab()}
        </TabsContent>

        <TabsContent value="scripts" className="mt-6">
          {renderScriptsTab()}
        </TabsContent>
      </Tabs>

      {/* Edit Script Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transformation Script</DialogTitle>
            <DialogDescription>
              Modify the transformation script for data processing
            </DialogDescription>
          </DialogHeader>
          {editingScript && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-script-name">Script Name</Label>
                <Input 
                  id="edit-script-name" 
                  defaultValue={editingScript.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-script-description">Description</Label>
                <Input 
                  id="edit-script-description" 
                  defaultValue={editingScript.description || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-script-content">Script Content</Label>
                <Textarea 
                  id="edit-script-content" 
                  defaultValue={editingScript.script_content}
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveScript}
              disabled={updateScriptMutation.isPending}
            >
              {updateScriptMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Script Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transformation Script</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transformation script? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingScript && (
            <div className="py-4">
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium text-sm">{deletingScript.name}</h4>
                {deletingScript.description && (
                  <p className="text-sm text-muted-foreground mt-1">{deletingScript.description}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteScript}
              disabled={deleteScriptMutation.isPending}
            >
              {deleteScriptMutation.isPending ? 'Deleting...' : 'Delete Script'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}