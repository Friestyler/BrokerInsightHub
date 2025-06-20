import { useState } from "react";
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
import { Package2, Plus, Search, Tag } from "lucide-react";
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

type Category = {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export default function ProductsPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('products');
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

  const { data: categories } = useQuery<Category[]>({
    queryKey: [`/api/${environment.id}/product-categories`],
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    }
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.category || !newProduct.vendorId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...newProduct,
      price: newProduct.price ? parseFloat(newProduct.price) : null,
      vendorId: parseInt(newProduct.vendorId)
    };

    createProductMutation.mutate(productData);
  };

  const getVendorName = (vendorId: number | null): string => {
    if (!vendorId || !vendors) return "Unknown";
    const vendor = vendors.find((v) => v.id === vendorId);
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

  const filteredProducts = products?.filter(product => 
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#282A3F]">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalogue and categories</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package2 className="mr-2 h-5 w-5" />
                All Products
              </CardTitle>
              <CardDescription>
                View and manage all products in your catalogue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-1 text-indigo-600" />
                              {product.category}
                            </div>
                          </TableCell>
                          <TableCell>{product.sku || "—"}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>{getVendorName(product.vendorId)}</TableCell>
                          <TableCell>
                            {new Date(product.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-[#282A3F]">No products found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm ? "No products match your search criteria." : "Get started by creating your first product."}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <ProductCategoryManager />
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
              <label htmlFor="product-name" className="text-sm font-medium">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="product-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                className={!newProduct.name ? "border-red-300" : ""}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="product-description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="product-description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className={!newProduct.description ? "border-red-300" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="product-category" className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Input
                  id="product-category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Enter category"
                  className={!newProduct.category ? "border-red-300" : ""}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="product-sku" className="text-sm font-medium">SKU</label>
                <Input
                  id="product-sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Enter SKU (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="product-price" className="text-sm font-medium">Price (EUR)</label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="product-vendor" className="text-sm font-medium">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newProduct.vendorId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, vendorId: value })}
                >
                  <SelectTrigger id="product-vendor" className={!newProduct.vendorId ? "border-red-300" : ""}>
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