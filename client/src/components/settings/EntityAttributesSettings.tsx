import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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

// Create form schema with zod
const attributeFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-z][a-z0-9_]*$/, "Name must start with a lowercase letter and can only contain lowercase letters, numbers, and underscores"),
  displayName: z.string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  description: z.string().nullable().optional(),
  type: z.enum([
    'text', 'long_text', 'number', 'date', 'datetime', 'boolean', 
    'single_select', 'multi_select', 'user_single', 'user_multi', 
    'currency', 'percent', 'relationship'
  ]),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().nullable().optional(),
  options: z.string().optional().nullable(),
  entityDefinitionId: z.number(),
});

type AttributeFormValues = z.infer<typeof attributeFormSchema>;

export default function EntityAttributesSettings() {
  const { environment } = useEnvironment();
  const [selectedEntityType, setSelectedEntityType] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch entity definitions (entity types)
  const { data: entityDefinitions, isLoading: loadingDefinitions } = useQuery({
    queryKey: ['/api/entity-definitions', environment.id],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest(`/api/entity-definitions?environment=${environment.id}`);
      return response as EntityDefinition[];
    }
  });

  // Fetch attributes for the selected entity type
  const { data: attributes, isLoading: loadingAttributes } = useQuery({
    queryKey: ['/api/entity-attributes', selectedEntityType],
    queryFn: async ({ queryKey }) => {
      if (!selectedEntityType) return [];
      const response = await apiRequest(`/api/entity-attributes?entityDefinitionId=${selectedEntityType}`);
      return response as EntityAttribute[];
    },
    enabled: !!selectedEntityType,
  });

  // Form setup
  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      type: 'text',
      isRequired: false,
      defaultValue: '',
      options: '',
      entityDefinitionId: selectedEntityType || 0,
    }
  });

  // Update the entityDefinitionId when selectedEntityType changes
  useEffect(() => {
    if (selectedEntityType) {
      form.setValue('entityDefinitionId', selectedEntityType);
    }
  }, [selectedEntityType, form]);

  // Create attribute mutation
  const createAttributeMutation = useMutation({
    mutationFn: async (formData: AttributeFormValues) => {
      // Process options if provided and type is appropriate
      let processedData: any = { ...formData };
      if (
        formData.options && 
        (formData.type === 'single_select' || formData.type === 'multi_select')
      ) {
        processedData.options = formData.options
          .split(',')
          .map(o => o.trim())
          .filter(o => o.length > 0);
      } else {
        processedData.options = null;
      }

      // Add environment
      const dataWithEnv = {
        ...processedData,
        environment: environment.id,
        orderIndex: attributes ? attributes.length + 1 : 1
      };

      return await apiRequest('/api/entity-attributes', {
        method: 'POST',
        body: JSON.stringify(dataWithEnv)
      } as RequestInit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entity-attributes', selectedEntityType] });
      toast({
        title: 'Attribute created',
        description: 'The entity attribute was created successfully.'
      });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating attribute',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Delete attribute mutation
  const deleteAttributeMutation = useMutation({
    mutationFn: async (attributeId: number) => {
      return await apiRequest(`/api/entity-attributes/${attributeId}`, {
        method: 'DELETE'
      } as RequestInit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entity-attributes', selectedEntityType] });
      toast({
        title: 'Attribute deleted',
        description: 'The entity attribute was deleted successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting attribute',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Submit handler
  const onSubmit = (data: AttributeFormValues) => {
    createAttributeMutation.mutate(data);
  };

  const handleDeleteAttribute = (attributeId: number, isSystemAttribute: boolean) => {
    if (isSystemAttribute) {
      toast({
        title: 'Cannot delete system attribute',
        description: 'System attributes cannot be deleted as they are required for the system to function properly.',
        variant: 'destructive'
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this attribute? This action cannot be undone.')) {
      deleteAttributeMutation.mutate(attributeId);
    }
  };

  if (loadingDefinitions) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Attributes</CardTitle>
        <CardDescription>
          Define and manage attributes for each entity type in the {environment.name} environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <Label htmlFor="entityType">Select Entity Type</Label>
            <Select 
              onValueChange={(value) => setSelectedEntityType(parseInt(value))}
              value={selectedEntityType?.toString() || ''}
            >
              <SelectTrigger id="entityType" className="w-[280px]">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {entityDefinitions?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id.toString()}>
                    {entity.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEntityType && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Attributes</h3>
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Attribute</DialogTitle>
                      <DialogDescription>
                        Create a new attribute for this entity type. Fill in the details below.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attribute Name</FormLabel>
                              <FormControl>
                                <Input placeholder="customer_id" {...field} />
                              </FormControl>
                              <FormDescription>
                                Internal name used in the database (lowercase with underscores)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Customer ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                User-friendly name displayed in the UI
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Description of this attribute" 
                                  {...field} 
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select attribute type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="long_text">Long Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="datetime">Date & Time</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="single_select">Single Select</SelectItem>
                                  <SelectItem value="multi_select">Multi Select</SelectItem>
                                  <SelectItem value="user_single">User (Single)</SelectItem>
                                  <SelectItem value="user_multi">User (Multiple)</SelectItem>
                                  <SelectItem value="currency">Currency</SelectItem>
                                  <SelectItem value="percent">Percentage</SelectItem>
                                  <SelectItem value="relationship">Relationship</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {(form.watch('type') === 'single_select' || form.watch('type') === 'multi_select') && (
                          <FormField
                            control={form.control}
                            name="options"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Options</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Option 1, Option 2, Option 3" 
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Comma-separated list of options
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <FormField
                          control={form.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>
                                  Is this attribute required when creating the entity?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="defaultValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Value</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Default value" 
                                  {...field} 
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormDescription>
                                Default value if none is provided
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                            disabled={createAttributeMutation.isPending}
                          >
                            {createAttributeMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Attribute
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {loadingAttributes ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : attributes && attributes.length > 0 ? (
                <Table>
                  <TableCaption>List of attributes for this entity type</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributes.map((attribute) => (
                      <TableRow key={attribute.id}>
                        <TableCell className="font-medium">{attribute.name}</TableCell>
                        <TableCell>{attribute.displayName}</TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {attribute.type.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {attribute.isRequired ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attribute.isSystemAttribute ? (
                            <span className="text-blue-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAttribute(attribute.id, attribute.isSystemAttribute)}
                            disabled={deleteAttributeMutation.isPending}
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
                  No attributes found for this entity type. Add some attributes to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}