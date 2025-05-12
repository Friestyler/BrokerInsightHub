import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from '@/contexts/EnvironmentContext';

// Define types
interface EntityDefinition {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  tableName: string;
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
  sourceEntity: EntityDefinition;
  targetEntity: EntityDefinition;
  sourceAttribute: {
    name: string;
    displayName: string;
  };
  targetAttribute: {
    name: string;
    displayName: string;
  };
}

// Validation schema for new relationship
const relationshipSchema = z.object({
  sourceEntityId: z.string().min(1, 'Source entity is required'),
  targetEntityId: z.string().min(1, 'Target entity is required'),
  sourceAttributeName: z.string().min(1, 'Source attribute name is required'),
  targetAttributeName: z.string().min(1, 'Target attribute name is required'),
  relationshipType: z.enum(['one_to_many', 'many_to_one', 'many_to_many']),
});

export default function RelationshipAttributesSettings() {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const [entityDefinitions, setEntityDefinitions] = useState<EntityDefinition[]>([]);
  const [relationships, setRelationships] = useState<RelationshipAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof relationshipSchema>>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      sourceEntityId: '',
      targetEntityId: '',
      sourceAttributeName: '',
      targetAttributeName: '',
      relationshipType: 'one_to_many',
    },
  });

  // Fetch entity definitions and relationships for current environment
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch entity definitions
        const defsResponse = await fetch(`/api/entity-definitions?environment=${environment.id}`);
        if (defsResponse.ok) {
          const defsData = await defsResponse.json();
          setEntityDefinitions(defsData);
        } else {
          console.error('Failed to fetch entity definitions');
          toast({
            title: 'Error',
            description: 'Failed to load entity definitions',
            variant: 'destructive',
          });
        }

        // Fetch relationships
        const relsResponse = await fetch(`/api/relationship-attributes?environment=${environment.id}`);
        if (relsResponse.ok) {
          const relsData = await relsResponse.json();
          setRelationships(relsData);
        } else {
          console.error('Failed to fetch relationships');
          toast({
            title: 'Error',
            description: 'Failed to load relationship attributes',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (environment) {
      fetchData();
    }
  }, [environment, toast]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof relationshipSchema>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/relationship-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sourceEntityId: parseInt(data.sourceEntityId),
          targetEntityId: parseInt(data.targetEntityId),
          environment: environment.id,
        }),
      });

      if (response.ok) {
        const newRelationship = await response.json();
        // Refetch relationships to get the full data with entity info
        const refreshResponse = await fetch(`/api/relationship-attributes?environment=${environment.id}`);
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setRelationships(refreshedData);
        }
        
        setIsDialogOpen(false);
        form.reset();
        toast({
          title: 'Success',
          description: 'Relationship created successfully',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create relationship',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating relationship:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the relationship',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle relationship deletion
  const handleDeleteRelationship = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      try {
        setLoading(true);
        const response = await fetch(`/api/relationship-attributes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setRelationships(prev => prev.filter(rel => rel.id !== id));
          toast({
            title: 'Success',
            description: 'Relationship deleted successfully',
          });
        } else {
          const errorData = await response.json();
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to delete relationship',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting relationship:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while deleting the relationship',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Get readable relationship type
  const getRelationshipTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'one_to_many': 'One to Many',
      'many_to_one': 'Many to One',
      'many_to_many': 'Many to Many'
    };
    return types[type] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Relationships</CardTitle>
        <CardDescription>
          Configure relationships between entity types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Add Relationship</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Relationship</DialogTitle>
                  <DialogDescription>
                    Define a relationship between two entity types.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="sourceEntityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Entity</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select entity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {entityDefinitions.map((entity) => (
                                <SelectItem 
                                  key={entity.id} 
                                  value={entity.id.toString()}
                                >
                                  {entity.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The primary entity in this relationship
                          </FormDescription>
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
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select entity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {entityDefinitions.map((entity) => (
                                <SelectItem 
                                  key={entity.id} 
                                  value={entity.id.toString()}
                                >
                                  {entity.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The related entity in this relationship
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sourceAttributeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Field Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. related_customers"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Name of the field on the source entity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAttributeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Field Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. related_partner"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Name of the field on the target entity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="relationshipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="one_to_many">One to Many</SelectItem>
                              <SelectItem value="many_to_one">Many to One</SelectItem>
                              <SelectItem value="many_to_many">Many to Many</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The cardinality of the relationship
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Relationship'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Entity</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source Field</TableHead>
                <TableHead>Target Field</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {loading ? 'Loading...' : 'No relationships found. Click "Add Relationship" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                relationships.map((relationship) => (
                  <TableRow key={relationship.id}>
                    <TableCell className="font-medium">
                      {relationship.sourceEntity?.displayName || 'Unknown Entity'}
                    </TableCell>
                    <TableCell>
                      {relationship.targetEntity?.displayName || 'Unknown Entity'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {getRelationshipTypeDisplay(relationship.relationshipType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {relationship.sourceAttribute?.displayName || 'Unknown Field'}
                    </TableCell>
                    <TableCell>
                      {relationship.targetAttribute?.displayName || 'Unknown Field'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRelationship(relationship.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}