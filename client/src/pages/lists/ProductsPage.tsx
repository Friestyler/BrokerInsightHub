import { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { Package2, Plus, SquarePen, Building, FolderTree, Search, Filter, Settings, Tag } from "lucide-react";
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

type Catalogue = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

type CatalogueProduct = {
  id: number;
  product_id: number;
  catalogue_id: number;
  category_id: number | null;
  visible: boolean;
  name_override: string | null;
  price_override: number | null;
  display_name: string;
  display_price: number | null;
  product_name: string;
  base_price: number | null;
  category_name: string | null;
};

type ProductWithCatalogues = Product & {
  catalogues: string[];
  catalogue_count: number;
};

export default function ProductsPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatalogueFilter, setSelectedCatalogueFilter] = useState<string>('all');
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<number | null>(null);
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

  const { data: catalogues } = useQuery<Catalogue[]>({
    queryKey: [`/api/${environment.id}/product-catalogues`],
    enabled: true
  });

  const { data: catalogueProducts } = useQuery({
    queryKey: [`/api/${environment.id}/catalogue-products`],
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

  const getProductCountForCatalogue = (catalogueId: number): number => {
    if (!catalogueProducts || !Array.isArray(catalogueProducts)) return 0;
    return catalogueProducts.filter((cp: any) => cp.catalogue_id === catalogueId).length;
  };

  const handleCatalogueRowClick = (catalogueId: number) => {
    setLocation(`/products/catalogue/${catalogueId}`);
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
          <TabsTrigger value="catalogues" className="flex items-center space-x-2">
            <FolderTree className="h-4 w-4" />
            <span>Catalogues</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedCatalogueFilter} onValueChange={setSelectedCatalogueFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by catalogue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Catalogues</SelectItem>
                  {catalogues?.map((catalogue) => (
                    <SelectItem key={catalogue.id} value={catalogue.id.toString()}>
                      {catalogue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Catalogues</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-gray-600 max-w-xs truncate">{product.description}</TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Multiple Catalogues
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/lists/vendors/${product.vendorId}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Building className="h-4 w-4 mr-1" />
                        {getVendorName(product.vendorId)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit Assignment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
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

        <TabsContent value="catalogues" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      <div className="opacity-0">
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider min-w-[250px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Catalogue Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider w-[200px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider w-[120px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider w-[100px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider w-[120px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#696C8C] uppercase tracking-wider w-[120px]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {catalogues && catalogues.length > 0 ? (
                    catalogues.map((catalogue) => (
                      <tr 
                        key={catalogue.id} 
                        className={`hover:bg-gray-50 group ${
                          selectedCatalogueId === catalogue.id ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => handleCatalogueRowClick(catalogue.id)}
                      >
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 invisible group-hover:visible"
                            checked={selectedCatalogueId === catalogue.id}
                            onChange={() => setSelectedCatalogueId(catalogue.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FolderTree className="h-5 w-5 mr-3 text-indigo-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{catalogue.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">{catalogue.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            catalogue.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {catalogue.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Package2 className="h-4 w-4 mr-2 text-gray-400" />
                            {getProductCountForCatalogue(catalogue.id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(catalogue.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCatalogueId(catalogue.id);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No catalogues found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first product catalogue.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Management Panel */}
          {selectedCatalogueId && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Category Management</CardTitle>
                    <CardDescription>
                      Manage categories for {catalogues?.find(c => c.id === selectedCatalogueId)?.name}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Catalogue
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProductCategoryManager 
                  envId={environment?.id || 'degoudse'} 
                />
              </CardContent>
            </Card>
          )}
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