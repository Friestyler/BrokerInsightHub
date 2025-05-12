import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Users, 
  Briefcase, 
  Target, 
  FolderKanban,
  UserSquare2 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Type definitions for entities and attributes
type EntityDefinition = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  tableName: string;
  environment: string;
};

type EntityAttribute = {
  id: number;
  entityDefinitionId: number;
  name: string;
  displayName: string;
  description: string;
  type: string;
  isRequired: boolean;
  isSystemAttribute: boolean;
  defaultValue?: string;
  options?: any;
  orderIndex: number;
  environment: string;
};

// Array of attribute types
const attributeTypes = [
  { value: "text", label: "Text" },
  { value: "long_text", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & Time" },
  { value: "boolean", label: "Yes/No" },
  { value: "single_select", label: "Single Select" },
  { value: "multi_select", label: "Multi Select" },
  { value: "user_single", label: "User (Single)" },
  { value: "user_multi", label: "Users (Multiple)" },
  { value: "currency", label: "Currency" },
  { value: "percent", label: "Percentage" },
  { value: "relationship", label: "Relationship" },
];

// Get entity icon based on entity name
const getEntityIcon = (entityName: string) => {
  switch(entityName.toLowerCase()) {
    case 'customers':
      return <Users className="mr-2 h-5 w-5" />;
    case 'partners':
      return <Briefcase className="mr-2 h-5 w-5" />;
    case 'opportunities':
      return <Target className="mr-2 h-5 w-5" />;
    case 'projects':
      return <FolderKanban className="mr-2 h-5 w-5" />;
    case 'contacts':
      return <UserSquare2 className="mr-2 h-5 w-5" />;
    default:
      return null;
  }
};

export default function EntityAttributesSettings() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [isEntityDialogOpen, setIsEntityDialogOpen] = useState(false);
  
  // New attribute form state
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    displayName: "",
    description: "",
    type: "text",
    isRequired: false,
    entityDefinitionId: 0,
  });
  
  // New entity form state
  const [newEntity, setNewEntity] = useState({
    name: "",
    displayName: "",
    description: "",
    tableName: "",
  });

  // Fetch entity definitions
  const { data: entities = [], isLoading: isLoadingEntities } = useQuery({
    queryKey: ['/api/entity-definitions', currentEnvironment.id],
    queryFn: () => apiRequest(`/api/entity-definitions?environment=${currentEnvironment.id}`),
  });

  // Fetch attributes for selected entity
  const { data: attributes = [], isLoading: isLoadingAttributes } = useQuery({
    queryKey: ['/api/entity-attributes', selectedEntity],
    queryFn: () => selectedEntity ? apiRequest(`/api/entity-attributes/${selectedEntity}`) : Promise.resolve([]),
    enabled: !!selectedEntity,
  });

  // Set first entity as selected when data loads
  useEffect(() => {
    if (entities.length > 0 && !selectedEntity) {
      setSelectedEntity(entities[0].id.toString());
    }
  }, [entities, selectedEntity]);

  // Create entity mutation
  const createEntityMutation = useMutation({
    mutationFn: (newEntity: any) => apiRequest('/api/entity-definitions', {
      method: 'POST',
      body: JSON.stringify({
        ...newEntity,
        environment: currentEnvironment.id
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entity-definitions'] });
      setIsEntityDialogOpen(false);
      setNewEntity({ name: "", displayName: "", description: "", tableName: "" });
      toast({
        title: "Entity created",
        description: "The entity has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating entity",
        description: error.message || "An error occurred while creating the entity.",
        variant: "destructive",
      });
    }
  });

  // Create attribute mutation
  const createAttributeMutation = useMutation({
    mutationFn: (newAttribute: any) => apiRequest('/api/entity-attributes', {
      method: 'POST',
      body: JSON.stringify({
        ...newAttribute,
        entityDefinitionId: parseInt(selectedEntity || "0", 10),
        environment: currentEnvironment.id
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entity-attributes', selectedEntity] });
      setIsAttributeDialogOpen(false);
      setNewAttribute({
        name: "",
        displayName: "",
        description: "",
        type: "text",
        isRequired: false,
        entityDefinitionId: 0,
      });
      toast({
        title: "Attribute created",
        description: "The attribute has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating attribute",
        description: error.message || "An error occurred while creating the attribute.",
        variant: "destructive",
      });
    }
  });

  // Update attribute mutation (for toggling isRequired)
  const updateAttributeMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number, changes: any }) => apiRequest(`/api/entity-attributes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entity-attributes', selectedEntity] });
      toast({
        title: "Attribute updated",
        description: "The attribute has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating attribute",
        description: error.message || "An error occurred while updating the attribute.",
        variant: "destructive",
      });
    }
  });

  // Handle entity creation
  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    createEntityMutation.mutate(newEntity);
  };

  // Handle attribute creation
  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    createAttributeMutation.mutate(newAttribute);
  };

  // Handle required attribute toggle
  const handleToggleRequired = (attribute: EntityAttribute) => {
    if (!attribute.isSystemAttribute) {
      updateAttributeMutation.mutate({
        id: attribute.id,
        changes: { isRequired: !attribute.isRequired }
      });
    }
  };

  // For now, we'll return a simple message if loading
  if (isLoadingEntities) {
    return <div>Loading entity definitions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configure Entity Attributes</h3>
        
        <Dialog open={isEntityDialogOpen} onOpenChange={setIsEntityDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
              <DialogDescription>
                Add a new entity definition to {currentEnvironment.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEntity}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Internal Name
                  </Label>
                  <Input
                    id="name"
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="displayName" className="text-right">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={newEntity.displayName}
                    onChange={(e) => setNewEntity({ ...newEntity, displayName: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newEntity.description}
                    onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tableName" className="text-right">
                    Table Name
                  </Label>
                  <Input
                    id="tableName"
                    value={newEntity.tableName}
                    onChange={(e) => setNewEntity({ ...newEntity, tableName: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createEntityMutation.isPending}>
                  {createEntityMutation.isPending ? "Creating..." : "Create Entity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entities.length === 0 ? (
        <div className="border rounded-md p-8 text-center">
          <h3 className="font-medium mb-2">No entities defined</h3>
          <p className="text-muted-foreground mb-4">
            Create your first entity definition to get started.
          </p>
          <Button onClick={() => setIsEntityDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entity
          </Button>
        </div>
      ) : (
        <>
          <Tabs
            value={selectedEntity || ""}
            onValueChange={setSelectedEntity}
            className="w-full"
          >
            <TabsList className="w-full inline-flex flex-wrap h-auto justify-start mb-4 bg-transparent gap-2">
              {entities.map((entity: EntityDefinition) => (
                <TabsTrigger
                  key={entity.id}
                  value={entity.id.toString()}
                  className="flex items-center px-4 py-2 data-[state=active]:bg-primary/10 rounded-md"
                >
                  {getEntityIcon(entity.name)}
                  {entity.displayName}
                </TabsTrigger>
              ))}
            </TabsList>

            {entities.map((entity: EntityDefinition) => (
              <TabsContent
                key={entity.id}
                value={entity.id.toString()}
                className="border rounded-md p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-medium flex items-center">
                      {getEntityIcon(entity.name)}
                      {entity.displayName}
                    </h3>
                    <p className="text-muted-foreground">{entity.description}</p>
                  </div>
                  
                  <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Attribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Attribute to {entity.displayName}</DialogTitle>
                        <DialogDescription>
                          Configure a new attribute for this entity.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateAttribute}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Internal Name
                            </Label>
                            <Input
                              id="name"
                              value={newAttribute.name}
                              onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="displayName" className="text-right">
                              Display Name
                            </Label>
                            <Input
                              id="displayName"
                              value={newAttribute.displayName}
                              onChange={(e) => setNewAttribute({ ...newAttribute, displayName: e.target.value })}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                              Description
                            </Label>
                            <Input
                              id="description"
                              value={newAttribute.description}
                              onChange={(e) => setNewAttribute({ ...newAttribute, description: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                              Attribute Type
                            </Label>
                            <Select
                              value={newAttribute.type}
                              onValueChange={(value) => setNewAttribute({ ...newAttribute, type: value })}
                            >
                              <SelectTrigger id="type" className="col-span-3">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {attributeTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="required" className="text-right">
                              Required
                            </Label>
                            <div className="flex items-center space-x-2 col-span-3">
                              <Checkbox
                                id="required"
                                checked={newAttribute.isRequired}
                                onCheckedChange={(checked) => 
                                  setNewAttribute({ 
                                    ...newAttribute, 
                                    isRequired: checked === true 
                                  })
                                }
                              />
                              <label
                                htmlFor="required"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Make this attribute required
                              </label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={createAttributeMutation.isPending}>
                            {createAttributeMutation.isPending ? "Creating..." : "Create Attribute"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoadingAttributes ? (
                  <div>Loading attributes...</div>
                ) : attributes.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground mb-4">
                      No attributes defined for this entity yet.
                    </p>
                    <Button onClick={() => setIsAttributeDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add first attribute
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Required</TableHead>
                        <TableHead className="text-center">System</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attributes.map((attribute: EntityAttribute) => (
                        <TableRow key={attribute.id}>
                          <TableCell className="font-medium">
                            {attribute.displayName}
                          </TableCell>
                          <TableCell>
                            {attributeTypes.find(t => t.value === attribute.type)?.label || attribute.type}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {attribute.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={attribute.isRequired}
                              onCheckedChange={() => handleToggleRequired(attribute)}
                              disabled={attribute.isSystemAttribute}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {attribute.isSystemAttribute ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={attribute.isSystemAttribute}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={attribute.isSystemAttribute}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}