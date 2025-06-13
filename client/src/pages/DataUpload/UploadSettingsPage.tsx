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
  environmentId: string;
  entityType: string;
  scriptName: string;
  scriptContent: string;
  description?: string;
  isActive: boolean;
}



export default function UploadSettingsPage() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [activeTab, setActiveTab] = useState('settings');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available environments
  const { data: environments = [] } = useQuery<string[]>({
    queryKey: ['/api/upload/environments'],
    enabled: true
  });

  // Fetch supported entities
  const { data: supportedEntities = [] } = useQuery<string[]>({
    queryKey: ['/api/upload/supported-entities'],
    enabled: true
  });

  // Fetch entity schemas for selected environment
  const { data: entitySchemas = [], isLoading: schemasLoading } = useQuery<EntitySchema[]>({
    queryKey: ['/api/upload/entities', selectedEnvironment],
    enabled: !!selectedEnvironment
  });

  // Fetch upload settings for selected entity
  const { data: uploadSettings = [], isLoading: settingsLoading } = useQuery<UploadSetting[]>({
    queryKey: [`/api/${selectedEnvironment}/upload-settings/${selectedEntity}`, selectedEnvironment, selectedEntity],
    enabled: !!selectedEnvironment && !!selectedEntity
  });

  // Fetch transformation scripts
  const { data: transformationScripts = [] } = useQuery<TransformationScript[]>({
    queryKey: ['/api/transformation-scripts', selectedEnvironment, selectedEntity],
    enabled: !!selectedEnvironment && !!selectedEntity
  });



  // Update upload settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { attributeName: string; isMandatory: boolean; dataType?: string }[]) => {
      const response = await fetch(`/api/${selectedEnvironment}/upload-settings/${selectedEntity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Upload settings updated successfully' });
      queryClient.invalidateQueries({ queryKey: [`/api/${selectedEnvironment}/upload-settings/${selectedEntity}`, selectedEnvironment, selectedEntity] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update upload settings', variant: 'destructive' });
    }
  });

  // Set default environment when environments are loaded
  useEffect(() => {
    if (environments.length > 0 && !selectedEnvironment) {
      setSelectedEnvironment(environments[0]);
    }
  }, [environments, selectedEnvironment]);

  // Set default entity when entities are loaded
  useEffect(() => {
    if (supportedEntities.length > 0 && !selectedEntity) {
      setSelectedEntity(supportedEntities[0]);
    }
  }, [supportedEntities, selectedEntity]);

  const selectedSchema = entitySchemas.find(schema => schema.entityType === selectedEntity);

  const handleSettingChange = (attributeName: string, isMandatory: boolean) => {
    if (!selectedSchema || !selectedEnvironment || !selectedEntity) return;

    // Create the single setting update
    const settingUpdate = {
      attributeName,
      isMandatory,
      dataType: selectedSchema.attributes.find(attr => attr.name === attributeName)?.dataType
    };

    updateSettingsMutation.mutate([settingUpdate]);
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

      {settingsLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : selectedSchema ? (
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
            Select an environment and entity to configure upload settings.
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
                    <CardTitle className="text-base">{script.scriptName}</CardTitle>
                    <CardDescription>{script.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={script.isActive ? "default" : "secondary"}>
                      {script.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">{script.scriptContent.slice(0, 200)}...</code>
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



  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Upload Settings</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="environment-select">Environment</Label>
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map(env => (
                <SelectItem key={env} value={env}>{env}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entity-select">Entity Type</Label>
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
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

      <Separator />

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
    </div>
  );
}