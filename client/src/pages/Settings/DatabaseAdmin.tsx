import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Trash2, Copy, Database, Loader2, AlertTriangle, CheckCircle, Users, Building, Briefcase, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ENVIRONMENTS = [
  { id: 'myqollabi', name: 'My Qollabi', description: 'Default environment' },
  { id: 'degoudse', name: 'De Goudse', description: 'Insurance company environment' },
  { id: 'acme', name: 'Acme Corp', description: 'Demo corporate environment' },
  { id: 'globex', name: 'Globex Corporation', description: 'Enterprise demo environment' },
  { id: 'oceanic', name: 'Oceanic Industries', description: 'Maritime industry environment' }
];

const ENTITY_TYPES = [
  { id: 'customers', name: 'Customers', icon: Users, description: 'Customer records and relationships' },
  { id: 'partners', name: 'Partners', icon: Building, description: 'Partner organizations and contacts' },
  { id: 'opportunities', name: 'Opportunities', icon: Briefcase, description: 'Sales opportunities and deals' },
  { id: 'products', name: 'Products', icon: Package, description: 'Product catalog and information' }
];

export default function DatabaseAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [newEnvironmentDescription, setNewEnvironmentDescription] = useState('');
  const [dataPrompt, setDataPrompt] = useState('');
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');

  // Fetch environment statistics
  const { data: environmentStats } = useQuery({
    queryKey: ['/api/admin/environment-stats'],
  });

  // Clean environment mutation
  const cleanEnvironmentMutation = useMutation({
    mutationFn: async ({ envId, entityType }: { envId: string; entityType?: string }) => {
      return await apiRequest(`/api/admin/clean-environment`, {
        method: 'POST',
        body: JSON.stringify({ envId, entityType }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Environment Cleaned",
        description: "Records have been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/environment-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clean environment",
        variant: "destructive",
      });
    },
  });

  // Clone environment mutation
  const cloneEnvironmentMutation = useMutation({
    mutationFn: async ({ sourceEnvId, targetEnvId, name, description }: { 
      sourceEnvId: string; 
      targetEnvId: string; 
      name: string; 
      description: string; 
    }) => {
      return await apiRequest(`/api/admin/clone-environment`, {
        method: 'POST',
        body: JSON.stringify({ sourceEnvId, targetEnvId, name, description }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Environment Cloned",
        description: "New environment has been created successfully.",
      });
      setNewEnvironmentName('');
      setNewEnvironmentDescription('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/environment-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clone environment",
        variant: "destructive",
      });
    },
  });

  // Populate data mutation
  const populateDataMutation = useMutation({
    mutationFn: async ({ envId, entityType, prompt }: { 
      envId: string; 
      entityType: string; 
      prompt: string; 
    }) => {
      return await apiRequest(`/api/admin/populate-data`, {
        method: 'POST',
        body: JSON.stringify({ envId, entityType, prompt }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Data Generated",
        description: "Entities have been successfully created in the database.",
      });
      setDataPrompt('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/environment-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate data",
        variant: "destructive",
      });
    },
  });

  const handleCleanEnvironment = (envId: string, entityType?: string) => {
    cleanEnvironmentMutation.mutate({ envId, entityType });
  };

  const handleCloneEnvironment = () => {
    if (!selectedEnvironment || !newEnvironmentName) return;
    
    const targetEnvId = newEnvironmentName.toLowerCase().replace(/\s+/g, '-');
    cloneEnvironmentMutation.mutate({
      sourceEnvId: selectedEnvironment,
      targetEnvId,
      name: newEnvironmentName,
      description: newEnvironmentDescription,
    });
  };

  const handlePopulateData = () => {
    if (!selectedEnvironment || !selectedEntity || !dataPrompt) return;
    
    populateDataMutation.mutate({
      envId: selectedEnvironment,
      entityType: selectedEntity,
      prompt: dataPrompt,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Database Administration</h1>
        <p className="mt-2 text-gray-600">
          Manage environments, clean data, and populate databases for demos
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clean">Clean Data</TabsTrigger>
          <TabsTrigger value="clone">Clone Environment</TabsTrigger>
          <TabsTrigger value="populate">Populate Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENVIRONMENTS.map((env) => (
              <Card key={env.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{env.name}</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {environmentStats?.[env.id]?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {env.description}
                  </p>
                  <div className="mt-4 space-y-2">
                    {ENTITY_TYPES.map((entity) => (
                      <div key={entity.id} className="flex justify-between text-sm">
                        <span>{entity.name}:</span>
                        <Badge variant="secondary">
                          {environmentStats?.[env.id]?.[entity.id] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clean" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Clean Environment Data
              </CardTitle>
              <CardDescription>
                Remove records from environments to prepare for demos. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Warning: This will permanently delete data from the selected environment.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity">Entity Type (Optional)</Label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All entities</SelectItem>
                      {ENTITY_TYPES.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={!selectedEnvironment || cleanEnvironmentMutation.isPending}
                  >
                    {cleanEnvironmentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Clean Environment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Data Cleanup</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {selectedEntity || 'all'} records from{" "}
                      {ENVIRONMENTS.find(e => e.id === selectedEnvironment)?.name}? 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleCleanEnvironment(selectedEnvironment, selectedEntity)}
                    >
                      Confirm Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clone" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Clone Environment
              </CardTitle>
              <CardDescription>
                Create a new environment with the same structure but separate database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source-environment">Source Environment</Label>
                <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENVIRONMENTS.map((env) => (
                      <SelectItem key={env.id} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-env-name">New Environment Name</Label>
                  <Input
                    id="new-env-name"
                    value={newEnvironmentName}
                    onChange={(e) => setNewEnvironmentName(e.target.value)}
                    placeholder="e.g., Demo Client Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-env-description">Description</Label>
                  <Input
                    id="new-env-description"
                    value={newEnvironmentDescription}
                    onChange={(e) => setNewEnvironmentDescription(e.target.value)}
                    placeholder="Environment description"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCloneEnvironment}
                disabled={!selectedEnvironment || !newEnvironmentName || cloneEnvironmentMutation.isPending}
              >
                {cloneEnvironmentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Clone Environment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="populate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Populate Database
              </CardTitle>
              <CardDescription>
                Generate realistic data for demo environments using AI prompts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-environment">Target Environment</Label>
                  <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          <div className="flex items-center gap-2">
                            <entity.icon className="h-4 w-4" />
                            {entity.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-prompt">Data Generation Prompt</Label>
                <Textarea
                  id="data-prompt"
                  value={dataPrompt}
                  onChange={(e) => setDataPrompt(e.target.value)}
                  placeholder="Describe the type of data you want to generate. E.g., 'Create 10 insurance companies in the Netherlands with realistic names, addresses, and contact information.'"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handlePopulateData}
                disabled={!selectedEnvironment || !selectedEntity || !dataPrompt || populateDataMutation.isPending}
              >
                {populateDataMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Data
              </Button>

              {populateDataMutation.isPending && (
                <div className="space-y-2">
                  <Progress value={operationProgress} className="w-full" />
                  <p className="text-sm text-gray-600">{operationStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}