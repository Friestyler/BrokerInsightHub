import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MoreVertical, Plus, Edit2, Trash2, Building, Upload, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import type { CustomEnvironment } from '@shared/schema';

const environmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  environmentId: z.string().min(1, 'Environment ID is required').regex(/^[a-zA-Z0-9-_]+$/, 'Environment ID can only contain letters, numbers, hyphens and underscores'),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
});

type EnvironmentFormData = z.infer<typeof environmentSchema>;

export default function EnvironmentManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<CustomEnvironment | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createForm = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: '',
      environmentId: '',
      logoUrl: '',
      description: '',
    },
  });

  const editForm = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema.omit({ environmentId: true })),
  });

  // Fetch custom environments
  const { data: environments = [], isLoading } = useQuery({
    queryKey: ['/api/admin/custom-environments'],
    queryFn: () => apiRequest('/api/admin/custom-environments'),
  });

  // Create environment mutation
  const createEnvironmentMutation = useMutation({
    mutationFn: (data: EnvironmentFormData) => 
      apiRequest('/api/admin/custom-environments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setLogoFile(null);
      setLogoPreview(null);
      toast({
        title: 'Environment created',
        description: 'New environment has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create environment.',
        variant: 'destructive',
      });
    },
  });

  // Update environment mutation
  const updateEnvironmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EnvironmentFormData> }) =>
      apiRequest(`/api/admin/custom-environments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      setIsEditDialogOpen(false);
      setEditingEnvironment(null);
      editForm.reset();
      toast({
        title: 'Environment updated',
        description: 'Environment has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update environment.',
        variant: 'destructive',
      });
    },
  });

  // Delete environment mutation
  const deleteEnvironmentMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/custom-environments/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      toast({
        title: 'Environment deleted',
        description: 'Environment has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete environment.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSubmit = (data: EnvironmentFormData) => {
    // If logo file is uploaded, we'd typically upload it first and get URL
    // For now, we'll use the logoUrl field directly
    createEnvironmentMutation.mutate(data);
  };

  const handleEditSubmit = (data: Partial<EnvironmentFormData>) => {
    if (!editingEnvironment) return;
    updateEnvironmentMutation.mutate({
      id: editingEnvironment.id,
      data,
    });
  };

  const handleEdit = (environment: CustomEnvironment) => {
    setEditingEnvironment(environment);
    editForm.reset({
      name: environment.name,
      logoUrl: environment.logoUrl || '',
      description: environment.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (environment: CustomEnvironment) => {
    if (confirm(`Are you sure you want to delete "${environment.name}"? This action cannot be undone.`)) {
      deleteEnvironmentMutation.mutate(environment.id);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Environment Management</h1>
          <p className="text-gray-600 mt-1">Create and manage custom environments with isolated data and branding</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#5567E5] hover:bg-[#4556D3]">
              <Plus className="w-4 h-4 mr-2" />
              New environment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Environment</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ACME Insurance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="environmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., acme-insurance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Environment description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEnvironmentMutation.isPending}
                    className="bg-[#5567E5] hover:bg-[#4556D3]"
                  >
                    {createEnvironmentMutation.isPending ? 'Creating...' : 'Create environment'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Environment List */}
      <div className="grid gap-4">
        {environments.length === 0 ? (
          <Card className="p-8 text-center border-[#E6E7F1]">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No custom environments</h3>
            <p className="text-gray-600 mb-4">Create your first custom environment to get started.</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#5567E5] hover:bg-[#4556D3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create environment
            </Button>
          </Card>
        ) : (
          environments.map((environment: CustomEnvironment) => (
            <Card key={environment.id} className="p-6 border-[#E6E7F1]">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {environment.logoUrl ? (
                      <img 
                        src={environment.logoUrl} 
                        alt={`${environment.name} logo`}
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{environment.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {environment.environmentId}
                      </Badge>
                    </div>
                    {environment.description && (
                      <p className="text-gray-600 text-sm mb-2">{environment.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created by {environment.createdByName || 'Unknown'}</span>
                      <span>•</span>
                      <span>Schema: {environment.schemaName}</span>
                      <span>•</span>
                      <span>{new Date(environment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(environment)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(environment)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Environment</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ACME Insurance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Environment description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateEnvironmentMutation.isPending}
                  className="bg-[#5567E5] hover:bg-[#4556D3]"
                >
                  {updateEnvironmentMutation.isPending ? 'Updating...' : 'Update environment'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}