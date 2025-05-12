import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useEnvironment } from '../../contexts/EnvironmentContext';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';

import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define types for your data
interface EntityDefinition {
  id: number;
  name: string;
  displayName: string;
  tableName: string;
  description: string | null;
  environment: string;
}

interface EntityAttribute {
  id: number;
  entityDefinitionId: number;
  name: string;
  displayName: string;
  description: string | null;
  type: string;
  isRequired: boolean;
  isSystemAttribute: boolean;
  defaultValue: string | null;
  options: string[] | null;
  orderIndex: number;
  environment: string;
}

interface RelationshipAttribute {
  id: number;
  sourceEntityId: number;
  targetEntityId: number;
  sourceAttributeId: number;
  targetAttributeId: number;
  relationshipType: 'one_to_many' | 'many_to_one' | 'many_to_many';
  environment: string;
  // Additional properties from join
  sourceEntityName?: string;
  sourceEntityDisplayName?: string;
  targetEntityName?: string;
  targetEntityDisplayName?: string;
  sourceAttributeName?: string;
  sourceAttributeDisplayName?: string;
  targetAttributeName?: string;
  targetAttributeDisplayName?: string;
}

// Create form schema with zod
const relationshipFormSchema = z.object({
  sourceEntityId: z.number().min(1, "Source entity is required"),
  targetEntityId: z.number().min(1, "Target entity is required"),
  relationshipType: z.enum(['one_to_many', 'many_to_one', 'many_to_many']),
  sourceAttributeName: z.string().min(2, "Source attribute name is required"),
  sourceAttributeDisplayName: z.string().min(2, "Source attribute display name is required"),
  targetAttributeName: z.string().min(2, "Target attribute name is required"),
  targetAttributeDisplayName: z.string().min(2, "Target attribute display name is required"),
});

type RelationshipFormValues = z.infer<typeof relationshipFormSchema>;

export default function RelationshipAttributesSettings() {
  const { environment } = useEnvironment();
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch entity definitions (entity types)
  const { data: entityDefinitions, isLoading: loadingDefinitions } = useQuery({
    queryKey: ['/api/entity-definitions', environment.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/entity-definitions?environment=${environment.id}`);
      return response as EntityDefinition[];
    }
  });

  // Fetch all relationship attributes for this environment
  const { data: relationships, isLoading: loadingRelationships } = useQuery({
    queryKey: ['/api/relationship-attributes', environment.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/relationship-attributes?environment=${environment.id}`);
      return response as RelationshipAttribute[];
    }
  });

  // Form setup
  const form = useForm<RelationshipFormValues>({
    resolver: zodResolver(relationshipFormSchema),
    defaultValues: {
      sourceEntityId: 0,
      targetEntityId: 0,
      relationshipType: 'many_to_many',
      sourceAttributeName: '',
      sourceAttributeDisplayName: '',
      targetAttributeName: '',
      targetAttributeDisplayName: '',
    }
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: async (formData: RelationshipFormValues) => {
      // Add environment to the form data
      const dataWithEnv = {
        ...formData,
        environment: environment.id
      };

      return await apiRequest('/api/relationship-attributes', {
        method: 'POST',
        body: JSON.stringify(dataWithEnv)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/relationship-attributes', environment.id] });
      toast({
        title: 'Relationship created',
        description: 'The entity relationship was created successfully.'
      });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating relationship',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Delete relationship mutation
  const deleteRelationshipMutation = useMutation({
    mutationFn: async (relationshipId: number) => {
      return await apiRequest(`/api/relationship-attributes/${relationshipId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/relationship-attributes', environment.id] });
      toast({
        title: 'Relationship deleted',
        description: 'The entity relationship was deleted successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting relationship',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Submit handler
  const onSubmit = (data: RelationshipFormValues) => {
    createRelationshipMutation.mutate(data);
  };

  const handleDeleteRelationship = (relationshipId: number) => {
    if (confirm('Are you sure you want to delete this relationship? This action cannot be undone.')) {
      deleteRelationshipMutation.mutate(relationshipId);
    }
  };

  // Helper function to get entity name by id
  const getEntityNameById = (id: number): string => {
    const entity = entityDefinitions?.find(e => e.id === id);
    return entity ? entity.displayName : 'Unknown';
  };

  // Update source/target attribute names
  const handleSourceEntityChange = (sourceId: number) => {
    form.setValue('sourceEntityId', sourceId);
    
    // Suggest attribute names based on target entity (if selected)
    const targetId = form.getValues('targetEntityId');
    if (targetId) {
      updateSuggestedAttributeNames(sourceId, targetId);
    }
  };

  const handleTargetEntityChange = (targetId: number) => {
    form.setValue('targetEntityId', targetId);
    
    // Suggest attribute names based on source entity (if selected)
    const sourceId = form.getValues('sourceEntityId');
    if (sourceId) {
      updateSuggestedAttributeNames(sourceId, targetId);
    }
  };

  // Suggest attribute names based on selected entities
  const updateSuggestedAttributeNames = (sourceId: number, targetId: number) => {
    if (!entityDefinitions) return;

    const sourceEntity = entityDefinitions.find(e => e.id === sourceId);
    const targetEntity = entityDefinitions.find(e => e.id === targetId);

    if (sourceEntity && targetEntity) {
      // Create suggested attribute names
      const sourceAttrName = targetEntity.name + 's'; // plural of target entity
      const targetAttrName = sourceEntity.name + 's'; // plural of source entity
      
      form.setValue('sourceAttributeName', sourceAttrName);
      form.setValue('sourceAttributeDisplayName', capitalizeFirstLetter(targetEntity.displayName) + 's');
      
      form.setValue('targetAttributeName', targetAttrName);
      form.setValue('targetAttributeDisplayName', capitalizeFirstLetter(sourceEntity.displayName) + 's');
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getRelationshipTypeDisplay = (type: string) => {
    switch (type) {
      case 'one_to_many': return 'One-to-Many';
      case 'many_to_one': return 'Many-to-One';
      case 'many_to_many': return 'Many-to-Many';
      default: return type;
    }
  };

  if (loadingDefinitions || loadingRelationships) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Relationships</CardTitle>
        <CardDescription>
          Define and manage relationships between entity types in the {environment.name} environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Entity Relationships</h3>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Relationship
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Relationship</DialogTitle>
                  <DialogDescription>
                    Create a new relationship between two entity types. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sourceEntityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Entity</FormLabel>
                            <Select 
                              onValueChange={(value) => handleSourceEntityChange(parseInt(value))}
                              value={field.value ? field.value.toString() : ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source entity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {entityDefinitions?.map((entity) => (
                                  <SelectItem key={entity.id} value={entity.id.toString()}>
                                    {entity.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetEntityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Entity</FormLabel>
                            <Select 
                              onValueChange={(value) => handleTargetEntityChange(parseInt(value))}
                              value={field.value ? field.value.toString() : ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target entity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {entityDefinitions?.map((entity) => (
                                  <SelectItem key={entity.id} value={entity.id.toString()}>
                                    {entity.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="relationshipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="one_to_many">One-to-Many</SelectItem>
                              <SelectItem value="many_to_one">Many-to-One</SelectItem>
                              <SelectItem value="many_to_many">Many-to-Many</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border p-4 rounded-lg space-y-4">
                      <h4 className="font-medium">Source Entity Attribute</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sourceAttributeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attribute Name</FormLabel>
                              <FormControl>
                                <input 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="customers" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="sourceAttributeDisplayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <input 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Customers" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="border p-4 rounded-lg space-y-4">
                      <h4 className="font-medium">Target Entity Attribute</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="targetAttributeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attribute Name</FormLabel>
                              <FormControl>
                                <input 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="opportunities" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="targetAttributeDisplayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <input 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Opportunities" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreating(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createRelationshipMutation.isPending}
                      >
                        {createRelationshipMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Relationship
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {relationships && relationships.length > 0 ? (
            <Table>
              <TableCaption>List of entity relationships in the {environment.name} environment</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Entity</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Relationship Type</TableHead>
                  <TableHead>Source Attribute</TableHead>
                  <TableHead>Target Attribute</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationships.map((relationship) => (
                  <TableRow key={relationship.id}>
                    <TableCell>
                      {relationship.sourceEntityDisplayName || getEntityNameById(relationship.sourceEntityId)}
                    </TableCell>
                    <TableCell>
                      {relationship.targetEntityDisplayName || getEntityNameById(relationship.targetEntityId)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {getRelationshipTypeDisplay(relationship.relationshipType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {relationship.sourceAttributeDisplayName || relationship.sourceAttributeName || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {relationship.targetAttributeDisplayName || relationship.targetAttributeName || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRelationship(relationship.id)}
                        disabled={deleteRelationshipMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No relationships defined for this environment. Add some relationships to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}