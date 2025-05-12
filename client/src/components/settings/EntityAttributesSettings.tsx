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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from '@/contexts/EnvironmentContext';

// Define types for entity definitions and attributes
interface EntityDefinition {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  tableName: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
}

interface EntityAttribute {
  id: number;
  entityDefinitionId: number;
  name: string;
  displayName: string;
  description?: string;
  type: string;
  isRequired: boolean;
  isSystemAttribute: boolean;
  defaultValue?: string;
  options?: any;
  orderIndex: number;
  environment: string;
  createdAt: string;
  updatedAt: string;
}

// Validation schema for new attribute
const attributeSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-z0-9_]+$/, "Name must contain only lowercase letters, numbers, and underscores"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  type: z.enum([
    'text', 'long_text', 'number', 'date', 'datetime',
    'boolean', 'single_select', 'multi_select', 'user_single',
    'user_multi', 'currency', 'percent', 'relationship'
  ]),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().optional(),
  options: z.string().optional()
});

export default function EntityAttributesSettings() {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [entityDefinitions, setEntityDefinitions] = useState<EntityDefinition[]>([]);
  const [entityAttributes, setEntityAttributes] = useState<EntityAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);

  const form = useForm<z.infer<typeof attributeSchema>>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      type: 'text',
      isRequired: false,
      defaultValue: '',
      options: ''
    }
  });

  // Fetch entity definitions for current environment
  useEffect(() => {
    const fetchEntityDefinitions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/entity-definitions?environment=${environment.id}`);
        if (response.ok) {
          const data = await response.json();
          setEntityDefinitions(data);
        } else {
          console.error('Failed to fetch entity definitions');
          toast({
            title: 'Error',
            description: 'Failed to load entity definitions',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching entity definitions:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading entity definitions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (environment) {
      fetchEntityDefinitions();
    }
  }, [environment, toast]);

  // Fetch entity attributes when an entity is selected
  useEffect(() => {
    const fetchEntityAttributes = async () => {
      if (!selectedEntity) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/entity-attributes/${selectedEntity}`);
        if (response.ok) {
          const data = await response.json();
          setEntityAttributes(data);
        } else {
          console.error('Failed to fetch entity attributes');
          toast({
            title: 'Error',
            description: 'Failed to load entity attributes',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching entity attributes:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading entity attributes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEntityAttributes();
  }, [selectedEntity, toast]);

  // Handle form submission for new attribute
  const onSubmit = async (data: z.infer<typeof attributeSchema>) => {
    if (!selectedEntity) {
      toast({
        title: 'Error',
        description: 'Please select an entity before adding an attribute',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // Prepare options if provided
      let parsedOptions = undefined;
      if (data.options && (data.type === 'single_select' || data.type === 'multi_select')) {
        try {
          // Parse options as a comma-separated list
          parsedOptions = data.options.split(',').map(option => option.trim())
            .filter(option => option.length > 0);
        } catch (e) {
          toast({
            title: 'Error',
            description: 'Options format is invalid. Use comma-separated values.',
            variant: 'destructive',
          });
          return;
        }
      }

      const response = await fetch('/api/entity-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          entityDefinitionId: selectedEntity,
          environment: environment.id,
          options: parsedOptions
        }),
      });

      if (response.ok) {
        const newAttribute = await response.json();
        setEntityAttributes(prev => [...prev, newAttribute]);
        setIsAddAttributeOpen(false);
        form.reset();
        toast({
          title: 'Success',
          description: 'Attribute added successfully',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add attribute',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding attribute:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while adding the attribute',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle attribute deletion
  const handleDeleteAttribute = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        setLoading(true);
        const response = await fetch(`/api/entity-attributes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setEntityAttributes(prev => prev.filter(attr => attr.id !== id));
          toast({
            title: 'Success',
            description: 'Attribute deleted successfully',
          });
        } else {
          const errorData = await response.json();
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to delete attribute',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting attribute:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while deleting the attribute',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Get a human-readable type name
  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'text': 'Text',
      'long_text': 'Long Text',
      'number': 'Number',
      'date': 'Date',
      'datetime': 'Date & Time',
      'boolean': 'Yes/No',
      'single_select': 'Single Select',
      'multi_select': 'Multi Select',
      'user_single': 'User',
      'user_multi': 'Multiple Users',
      'currency': 'Currency',
      'percent': 'Percentage',
      'relationship': 'Relationship'
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Attributes</CardTitle>
        <CardDescription>
          Configure attributes for your entity types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select
                value={selectedEntity?.toString() || ''}
                onValueChange={(value) => setSelectedEntity(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  {entityDefinitions.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog
              open={isAddAttributeOpen}
              onOpenChange={setIsAddAttributeOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!selectedEntity}>Add Attribute</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Attribute</DialogTitle>
                  <DialogDescription>
                    Create a new attribute for the selected entity type.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. customer_name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            System identifier (lowercase, underscores only)
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
                            <Input
                              placeholder="e.g. Customer Name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Name shown in the user interface
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
                              className="h-20"
                              {...field}
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
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="long_text">Long Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="datetime">Date & Time</SelectItem>
                              <SelectItem value="boolean">Yes/No</SelectItem>
                              <SelectItem value="single_select">Single Select</SelectItem>
                              <SelectItem value="multi_select">Multi Select</SelectItem>
                              <SelectItem value="user_single">User</SelectItem>
                              <SelectItem value="user_multi">Multiple Users</SelectItem>
                              <SelectItem value="currency">Currency</SelectItem>
                              <SelectItem value="percent">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Data type for this attribute
                          </FormDescription>
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
                                className="h-20"
                                {...field}
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
                      name="defaultValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Value</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Default value"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Required</FormLabel>
                            <FormDescription>
                              Is this field required?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Attribute'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {selectedEntity && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>System Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entityAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {loading ? 'Loading...' : 'No attributes found. Click "Add Attribute" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  entityAttributes.map((attribute) => (
                    <TableRow key={attribute.id}>
                      <TableCell className="font-medium">{attribute.displayName}</TableCell>
                      <TableCell>{attribute.name}</TableCell>
                      <TableCell>{getTypeName(attribute.type)}</TableCell>
                      <TableCell>
                        {attribute.isRequired ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attribute.isSystemAttribute ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            System
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Custom
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttribute(attribute.id)}
                          disabled={attribute.isSystemAttribute || loading}
                        >
                          {attribute.isSystemAttribute ? 'System' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}