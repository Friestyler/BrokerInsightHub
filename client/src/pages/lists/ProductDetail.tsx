import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Package, Building2, Tag, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  sku?: string;
  price?: number;
  vendorId: number;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: number;
  name: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { environment } = useEnvironment();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/${environment.id}/products/${id}`],
    enabled: !!id,
  });

  // Fetch vendors for dropdown
  const { data: vendors } = useQuery({
    queryKey: [`/api/${environment.id}/vendors`],
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: Partial<Product>) => {
      return apiRequest(`/api/${environment.id}/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedProduct),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/products`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/products/${id}`] });
      setIsEditing(false);
      setEditedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditedProduct(product as Product);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedProduct) {
      updateProductMutation.mutate(editedProduct);
    }
  };

  const handleCancel = () => {
    setEditedProduct(null);
    setIsEditing(false);
  };

  if (productLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">The product you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Button onClick={() => setLocation('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = editedProduct || product;
  const vendor = vendors?.find((v: Vendor) => v.id === currentProduct.vendorId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/products')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentProduct.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary">{currentProduct.category}</Badge>
              {currentProduct.sku && (
                <Badge variant="outline">SKU: {currentProduct.sku}</Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateProductMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="bg-indigo-600 hover:bg-indigo-700">
                Edit Product
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProduct?.name || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{currentProduct.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  {isEditing ? (
                    <Input
                      id="category"
                      value={editedProduct?.category || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{currentProduct.category}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  {isEditing ? (
                    <Input
                      id="sku"
                      value={editedProduct?.sku || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? { ...prev, sku: e.target.value } : null)}
                      placeholder="Enter SKU"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{currentProduct.sku || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  {isEditing ? (
                    <Select
                      value={editedProduct?.vendorId?.toString()}
                      onValueChange={(value) => setEditedProduct(prev => prev ? { ...prev, vendorId: parseInt(value) } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors?.map((vendor: Vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{vendor?.name || 'Unknown Vendor'}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedProduct?.description || ''}
                    onChange={(e) => setEditedProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">{currentProduct.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendor ? (
                <div className="space-y-4">
                  <div>
                    <Label>Vendor Name</Label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.name}</p>
                  </div>
                  <div>
                    <Label>Vendor ID</Label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.id}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No vendor information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="mr-2 h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="price">Price (€)</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    value={editedProduct?.price || ''}
                    onChange={(e) => setEditedProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || undefined } : null)}
                    placeholder="Enter price"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">
                    {currentProduct.price ? `€${currentProduct.price}` : 'Not specified'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Activity & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Created At</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(currentProduct.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(currentProduct.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Product ID</Label>
                <p className="text-sm text-gray-900 mt-1">{currentProduct.id}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}