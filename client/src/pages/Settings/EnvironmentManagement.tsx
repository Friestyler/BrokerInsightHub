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
import { useEnvironment } from '@/contexts/EnvironmentContext';

// Import logo assets
import deGoudseLogo from '@assets/De_Goudse_logo_1749670246231.png';
import baloiseLogo from '@assets/Baloise_1750499789244.png';
import nnLogo from '@assets/NN_Group_logo_1751474283145.jpeg';
import concordiaLogo from '@assets/images-Concordia_1752649338540.png';

const environmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  environmentId: z.string().min(1, 'Environment ID is required').regex(/^[a-zA-Z0-9-_]+$/, 'Environment ID can only contain letters, numbers, hyphens and underscores'),
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
  const { refreshEnvironments } = useEnvironment();

  // Logo mapping function
  const getAssetLogo = (logoUrl: string): string | null => {
    const assetMapping: Record<string, string> = {
      '@assets/De_Goudse_logo_1749670246231.png': deGoudseLogo,
      '@assets/Baloise_1750499789244.png': baloiseLogo,
      '@assets/NN_Group_logo_1751474283145.jpeg': nnLogo,
      '@assets/images-Concordia_1752649338540.png': concordiaLogo,
    };
    return assetMapping[logoUrl] || logoUrl;
  };

  const createForm = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: '',
      environmentId: '',
      description: '',
    },
  });

  const editForm = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema.omit({ environmentId: true })),
  });

  // Fetch ALL environments (both built-in and custom)
  const { data: environments = [], isLoading } = useQuery({
    queryKey: ['/api/admin/custom-environments'],
    queryFn: () => apiRequest('GET', '/api/admin/custom-environments'),
  });

  // Separate environments into built-in and custom
  const builtInEnvironments = environments.filter(env => 
    ['degoudse', 'baloise', 'nn', 'concordia'].includes(env.environment_id || env.environmentId)
  );
  
  const customEnvironments = environments.filter(env => 
    !['degoudse', 'baloise', 'nn', 'concordia'].includes(env.environment_id || env.environmentId)
  );

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      const result = await response.json();
      return result.logoUrl;
    },
  });

  // Create environment mutation
  const createEnvironmentMutation = useMutation({
    mutationFn: async (data: EnvironmentFormData & { logoFile?: File }) => {
      let logoUrl = '';
      
      // Upload logo first if provided
      if (data.logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(data.logoFile);
      }
      
      return apiRequest('POST', '/api/admin/custom-environments', {
        name: data.name,
        environmentId: data.environmentId,
        description: data.description,
        logoUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      refreshEnvironments(); // Refresh the environment dropdown
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
    mutationFn: async ({ id, data, logoFile }: { id: number; data: Partial<EnvironmentFormData>; logoFile?: File }) => {
      let logoUrl = data.logoUrl || '';
      
      // Upload new logo if provided
      if (logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(logoFile);
      }
      
      return apiRequest('PUT', `/api/admin/custom-environments/${id}`, {
        ...data,
        logoUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      refreshEnvironments(); // Refresh the environment dropdown
      setIsEditDialogOpen(false);
      setEditingEnvironment(null);
      editForm.reset();
      setLogoFile(null);
      setLogoPreview(null);
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
      apiRequest('DELETE', `/api/admin/custom-environments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-environments'] });
      refreshEnvironments(); // Refresh the environment dropdown
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
    createEnvironmentMutation.mutate({
      ...data,
      logoFile: logoFile || undefined,
    });
  };

  const handleEditSubmit = (data: Partial<EnvironmentFormData>) => {
    if (!editingEnvironment) return;
    updateEnvironmentMutation.mutate({
      id: editingEnvironment.id,
      data,
      logoFile: logoFile || undefined,
    });
  };

  const handleEdit = (environment: CustomEnvironment) => {
    setEditingEnvironment(environment);
    editForm.reset({
      name: environment.name,
      description: environment.description || '',
    });
    setLogoFile(null);
    // Handle both logoUrl and logo_url field names and map asset paths to imported URLs
    const logoUrl = environment.logoUrl || environment.logo_url;
    const resolvedLogoUrl = logoUrl ? getAssetLogo(logoUrl) : null;
    setLogoPreview(resolvedLogoUrl);
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
          <p className="text-gray-600 mt-1">Manage all environments including built-in and custom environments with branded logos</p>
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

                <div className="space-y-2">
                  <FormLabel>Logo (Optional)</FormLabel>
                  <div className="flex items-center space-x-4">
                    {logoPreview && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload PNG, JPG, or SVG. Max size: 2MB
                      </p>
                    </div>
                  </div>
                </div>

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

      {/* Built-in Environments Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-[#5567E5]" />
          <h2 className="text-lg font-semibold text-gray-900">Built-in Environments</h2>
          <Badge variant="secondary" className="text-xs">
            {builtInEnvironments.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {builtInEnvironments.map((env) => (
            <Card key={`builtin-${env.id}`} className="p-4 border-[#E6E7F1] bg-gradient-to-br from-[#5567E5]/5 to-transparent">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {env.logoUrl || env.logo_url ? (
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border">
                      <img 
                        src={getAssetLogo(env.logoUrl || env.logo_url) || env.logoUrl || env.logo_url} 
                        alt={`${env.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(env)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit logo & info
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{env.name}</h3>
                <Badge variant="outline" className="text-xs mb-2">
                  {env.environmentId || env.environment_id}
                </Badge>
                {env.description && (
                  <p className="text-sm text-gray-600 mb-3">{env.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center text-green-600">
                    <Globe className="h-3 w-3 mr-1" />
                    Built-in
                  </span>
                  <span>Database: degoudse</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Environments Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-[#5567E5]" />
          <h2 className="text-lg font-semibold text-gray-900">Custom Environments</h2>
          <Badge variant="secondary" className="text-xs">
            {customEnvironments.length}
          </Badge>
        </div>
        {customEnvironments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customEnvironments.map((env) => (
              <Card key={`custom-${env.id}`} className="p-4 border-[#E6E7F1]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {env.logoUrl || env.logo_url ? (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={getAssetLogo(env.logoUrl || env.logo_url) || env.logoUrl || env.logo_url} 
                          alt={`${env.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{env.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {env.environmentId || env.environment_id}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(env)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(env)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {env.description && (
                  <p className="text-sm text-gray-600 mb-3">{env.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    Custom
                  </span>
                  <span>Database: degoudse</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 border-[#E6E7F1] border-dashed">
            <div className="text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No custom environments</h3>
              <p className="text-gray-600 mb-4">
                Create your first custom environment with branded logos and descriptions.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#5567E5] hover:bg-[#4556D3]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create environment
              </Button>
            </div>
          </Card>
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

              <div className="space-y-2">
                <FormLabel>Logo (Optional)</FormLabel>
                <div className="flex items-center space-x-4">
                  {logoPreview && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload PNG, JPG, or SVG. Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>

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