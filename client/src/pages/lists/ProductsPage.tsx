import { useState } from "react";
import { Link } from "wouter";
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
import { Package2, Plus, SquarePen, Building, FolderTree } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from "@/hooks/use-toast";
import { ProductCategoryManager } from "@/components/products/ProductCategoryManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  sku: string | null;
  price: number | null;
  vendorId: number | null;
  createdAt: string;
  updatedAt: string;
};

type Vendor = {
  id: number;
  name: string;
};

export default function ProductsPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    price: "",
    vendorId: ""
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [`/api/${environment.id}/products`],
    enabled: true
  });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: [`/api/${environment.id}/vendors`],
    enabled: true
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('POST', `/api/${environment.id}/products`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${environment.id}/products`] });
      setIsCreateModalOpen(false);
      setNewProduct({
        name: "",
        description: "",
        category: "",
        sku: "",
        price: "",
        vendorId: ""
      });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating product:", error);
    }
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.category || !newProduct.vendorId) {
      toast({
        title: "Validation Error",
        description: "Name, description, category, and vendor are required",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...newProduct,
      price: newProduct.price ? parseInt(newProduct.price) : null,
      vendorId: parseInt(newProduct.vendorId)
    };

    createProductMutation.mutate(productData);
  };

  const getVendorName = (vendorId: number | null) => {
    if (!vendorId || !vendors) return "Unknown";
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown";
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your product catalog and categories</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package2 className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <FolderTree className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package2 className="h-4 w-4 mr-2 text-indigo-600" />
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Link 
                        href={`/lists/vendors/${product.vendorId}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Building className="h-4 w-4 mr-1" />
                        {getVendorName(product.vendorId)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link href={`/lists/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <SquarePen className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
              <div className="mt-6">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <ProductCategoryManager envId={currentEnvironment?.id || 'degoudse'} />
        </TabsContent>
      </Tabs>

      {/* Create Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                className={!newProduct.name ? "border-red-300" : ""}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className={!newProduct.description ? "border-red-300" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="E.g., Software, Hardware"
                  className={!newProduct.category ? "border-red-300" : ""}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Enter SKU (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">Price (€)</label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price (optional)"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="vendor" className="text-sm font-medium">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newProduct.vendorId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, vendorId: value })}
                >
                  <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreateProduct}
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}