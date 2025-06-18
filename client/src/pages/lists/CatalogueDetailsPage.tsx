import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit2, Trash2, FolderTree, Package2, Settings } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from "@/hooks/use-toast";

type Catalogue = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

interface CatalogueDetailsPageProps {
  catalogueId: string;
}

export default function CatalogueDetailsPage({ catalogueId }: CatalogueDetailsPageProps) {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentId: "",
    status: "active"
  });

  const { data: catalogue, isLoading: catalogueLoading } = useQuery<Catalogue>({
    queryKey: [`/api/${environment.id}/product-catalogues/${catalogueId}`],
    enabled: !!catalogueId
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [`/api/${environment.id}/product-categories`],
    enabled: true
  });

  const { data: catalogueProducts } = useQuery({
    queryKey: [`/api/${environment.id}/catalogue-products`],
    enabled: true
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('POST', `/api/${environment.id}/product-categories`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      setIsCreateCategoryModalOpen(false);
      setNewCategory({
        name: "",
        description: "",
        parentId: "",
        status: "active"
      });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/${environment.id}/product-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      setIsEditCategoryModalOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/${environment.id}/product-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/product-categories`] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  });

  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const categoryData = {
      ...newCategory,
      parentId: newCategory.parentId ? parseInt(newCategory.parentId) : null,
    };

    createCategoryMutation.mutate(categoryData);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory) return;

    const categoryData = {
      name: selectedCategory.name,
      description: selectedCategory.description,
      parentId: selectedCategory.parentId,
      status: selectedCategory.status,
    };

    updateCategoryMutation.mutate({ id: selectedCategory.id, data: categoryData });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const getProductCountForCatalogue = (): number => {
    if (!catalogueProducts || !Array.isArray(catalogueProducts)) return 0;
    return catalogueProducts.filter((cp: any) => cp.catalogue_id === parseInt(catalogueId)).length;
  };

  const getParentCategoryName = (parentId: number | null): string => {
    if (!parentId || !categories) return "—";
    const parent = categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : "—";
  };

  if (catalogueLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">Loading catalogue details...</div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/products')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalogues
        </Button>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">Catalogue not found</h3>
          <p className="text-gray-500">The requested catalogue could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => setLocation('/products')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Catalogues
      </Button>

      {/* Catalogue Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderTree className="h-8 w-8 mr-3 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{catalogue.name}</h1>
              <p className="text-gray-500 mt-1">{catalogue.description}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Catalogue
          </Button>
        </div>
      </div>

      {/* Catalogue Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{getProductCountForCatalogue()}</div>
            <p className="text-sm text-gray-500">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                catalogue.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {catalogue.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">Status</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {new Date(catalogue.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <p className="text-sm text-gray-500">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {new Date(catalogue.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <p className="text-sm text-gray-500">Last Updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage product categories for this catalogue
              </CardDescription>
            </div>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsCreateCategoryModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : categories && categories.length > 0 ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FolderTree className="h-4 w-4 mr-2 text-indigo-600" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {getParentCategoryName(category.parentId)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first category.</p>
              <div className="mt-6">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsCreateCategoryModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Dialog open={isCreateCategoryModalOpen} onOpenChange={setIsCreateCategoryModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                className={!newCategory.name ? "border-red-300" : ""}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="category-description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Enter category description"
                rows={3}
                className={!newCategory.description ? "border-red-300" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="parent-category" className="text-sm font-medium">Parent Category</label>
                <Select
                  value={newCategory.parentId}
                  onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value })}
                >
                  <SelectTrigger id="parent-category">
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="category-status" className="text-sm font-medium">Status</label>
                <Select
                  value={newCategory.status}
                  onValueChange={(value) => setNewCategory({ ...newCategory, status: value })}
                >
                  <SelectTrigger id="category-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory}
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditCategoryModalOpen} onOpenChange={setIsEditCategoryModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-category-name" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-category-name"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-category-description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="edit-category-description"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-parent-category" className="text-sm font-medium">Parent Category</label>
                  <Select
                    value={selectedCategory.parentId?.toString() || ""}
                    onValueChange={(value) => setSelectedCategory({ 
                      ...selectedCategory, 
                      parentId: value ? parseInt(value) : null 
                    })}
                  >
                    <SelectTrigger id="edit-parent-category">
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Parent</SelectItem>
                      {categories?.filter(cat => cat.id !== selectedCategory.id).map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-category-status" className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedCategory.status}
                    onValueChange={(value) => setSelectedCategory({ 
                      ...selectedCategory, 
                      status: value as 'active' | 'inactive' 
                    })}
                  >
                    <SelectTrigger id="edit-category-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}