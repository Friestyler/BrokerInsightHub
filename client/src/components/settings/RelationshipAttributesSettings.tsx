import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnvironment } from "@/contexts/EnvironmentContext";
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
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  ArrowRight 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Type definitions for entities, attributes, and relationships
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

type RelationshipAttribute = {
  id: number;
  sourceEntityId: number;
  targetEntityId: number;
  sourceAttributeId: number;
  targetAttributeId: number;
  relationshipType: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields from related tables (added by backend)
  sourceEntity?: EntityDefinition;
  targetEntity?: EntityDefinition;
  sourceAttribute?: EntityAttribute;
  targetAttribute?: EntityAttribute;
};

export default function RelationshipAttributesSettings() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for creating a new relationship
  const [newRelationship, setNewRelationship] = useState({
    sourceEntityId: "",
    targetEntityId: "",
    sourceAttributeName: "",
    targetAttributeName: "",
    relationshipType: "many_to_many",
  });

  // Fetch entity definitions
  const { data: entities = [], isLoading: isLoadingEntities } = useQuery({
    queryKey: ['/api/entity-definitions', currentEnvironment.id],
    queryFn: () => apiRequest(`/api/entity-definitions?environment=${currentEnvironment.id}`),
  });

  // Fetch relationship attributes
  const { data: relationships = [], isLoading: isLoadingRelationships } = useQuery({
    queryKey: ['/api/relationship-attributes', currentEnvironment.id],
    queryFn: () => apiRequest(`/api/relationship-attributes?environment=${currentEnvironment.id}`),
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: (newRelationship: any) => apiRequest('/api/relationship-attributes', {
      method: 'POST',
      body: JSON.stringify({
        ...newRelationship,
        environment: currentEnvironment.id
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/relationship-attributes'] });
      setIsCreateDialogOpen(false);
      setNewRelationship({
        sourceEntityId: "",
        targetEntityId: "",
        sourceAttributeName: "",
        targetAttributeName: "",
        relationshipType: "many_to_many",
      });
      toast({
        title: "Relationship created",
        description: "The relationship has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating relationship",
        description: error.message || "An error occurred while creating the relationship.",
        variant: "destructive",
      });
    }
  });

  // Handle relationship creation
  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    createRelationshipMutation.mutate({
      sourceEntityId: parseInt(newRelationship.sourceEntityId),
      targetEntityId: parseInt(newRelationship.targetEntityId),
      sourceAttributeName: newRelationship.sourceAttributeName,
      targetAttributeName: newRelationship.targetAttributeName,
      relationshipType: newRelationship.relationshipType,
    });
  };

  // Get relationship type display text
  const getRelationshipTypeDisplay = (type: string) => {
    switch(type) {
      case 'many_to_many':
        return 'Many-to-Many';
      case 'one_to_many':
        return 'One-to-Many';
      case 'many_to_one':
        return 'Many-to-One';
      default:
        return type;
    }
  };

  // If loading, show a simple message
  if (isLoadingRelationships || isLoadingEntities) {
    return <div>Loading relationships...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configure Entity Relationships</h3>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Relationship
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Relationship</DialogTitle>
              <DialogDescription>
                Connect entities with a bidirectional relationship.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRelationship}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sourceEntityId" className="text-right">
                    Source Entity
                  </Label>
                  <Select
                    value={newRelationship.sourceEntityId}
                    onValueChange={(value) => setNewRelationship({ ...newRelationship, sourceEntityId: value })}
                  >
                    <SelectTrigger id="sourceEntityId" className="col-span-3">
                      <SelectValue placeholder="Select source entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity: EntityDefinition) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sourceAttributeName" className="text-right">
                    Source Attribute Name
                  </Label>
                  <Input
                    id="sourceAttributeName"
                    value={newRelationship.sourceAttributeName}
                    onChange={(e) => setNewRelationship({ ...newRelationship, sourceAttributeName: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., 'customers'"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="relationshipType" className="text-right">
                    Relationship Type
                  </Label>
                  <Select
                    value={newRelationship.relationshipType}
                    onValueChange={(value) => setNewRelationship({ ...newRelationship, relationshipType: value })}
                  >
                    <SelectTrigger id="relationshipType" className="col-span-3">
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="many_to_many">Many-to-Many</SelectItem>
                      <SelectItem value="one_to_many">One-to-Many</SelectItem>
                      <SelectItem value="many_to_one">Many-to-One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetEntityId" className="text-right">
                    Target Entity
                  </Label>
                  <Select
                    value={newRelationship.targetEntityId}
                    onValueChange={(value) => setNewRelationship({ ...newRelationship, targetEntityId: value })}
                  >
                    <SelectTrigger id="targetEntityId" className="col-span-3">
                      <SelectValue placeholder="Select target entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity: EntityDefinition) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAttributeName" className="text-right">
                    Target Attribute Name
                  </Label>
                  <Input
                    id="targetAttributeName"
                    value={newRelationship.targetAttributeName}
                    onChange={(e) => setNewRelationship({ ...newRelationship, targetAttributeName: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., 'partners'"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRelationshipMutation.isPending}>
                  {createRelationshipMutation.isPending ? "Creating..." : "Create Relationship"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {relationships.length === 0 ? (
        <div className="border rounded-md p-8 text-center">
          <h3 className="font-medium mb-2">No relationships defined</h3>
          <p className="text-muted-foreground mb-4">
            Create your first relationship to connect entities.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Relationship
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Entity</TableHead>
              <TableHead>Source Attribute</TableHead>
              <TableHead className="text-center">Relationship Type</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>Target Attribute</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.map((relationship: RelationshipAttribute) => (
              <TableRow key={relationship.id}>
                <TableCell className="font-medium">
                  {relationship.sourceEntity?.displayName || 'Unknown'}
                </TableCell>
                <TableCell>
                  {relationship.sourceAttribute?.displayName || 'Unknown'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    {getRelationshipTypeDisplay(relationship.relationshipType)}
                    <ArrowRight className="h-4 w-4 mx-2" />
                  </div>
                </TableCell>
                <TableCell>
                  {relationship.targetEntity?.displayName || 'Unknown'}
                </TableCell>
                <TableCell>
                  {relationship.targetAttribute?.displayName || 'Unknown'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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
    </div>
  );
}