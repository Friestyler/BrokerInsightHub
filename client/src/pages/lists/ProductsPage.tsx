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
import CategoryManagerForProducts from "@/components/CategoryManagerForProducts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Product = {
  id: number;
  productId?: string;
  productid?: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: number;
  categoryid?: number;
  
  // Provider information
  provider?: string;
  providerId?: number;
  providerType?: string;
  providerName?: string;
  providername?: string;
  providertype?: string;
  
  // Contract information
  contractStartDate?: string;
  contractEndDate?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contractstartdate?: string;
  contractenddate?: string;
  
  // Financial information
  totalValue?: string;
  premiumValue?: string;
  premiumPercentage?: string;
  discount?: string;
  discountPercentage?: string;
  total_value?: string;
  premium_value?: string;
  premium_percentage?: string;
  discount_percentage?: string;
  totalvalue?: string;
  premiumvalue?: string;
  premiumpercentage?: string;
  discountpercentage?: string;
  
  // Legacy fields
  sku: string | null;
  price: number | null;
  vendorId: number | null;
  
  // Linking fields
  customerId?: number;
  opportunityId?: number;
  partnerId?: number;
  
  // Relationship counts
  customerCount?: number;
  partnerCount?: number;
  opportunityCount?: number;
  
  // Metadata
  isActive?: boolean;
  status?: string;
  notes?: string;
  tags?: string[];
  
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
  const [activeTab, setActiveTab] = useState<string>('campaigns');
  const [newProduct, setNewProduct] = useState({
    productId: "",
    name: "",
    description: "",
    category: "",
    categoryId: "",
    
    // Provider information
    providerId: "",
    providerType: "",
    providerName: "",
    
    // Contract information
    contractStartDate: "",
    contractEndDate: "",
    
    // Financial information
    totalValue: "",
    premiumValue: "",
    premiumPercentage: "",
    discount: "",
    discountPercentage: "",
    
    // Legacy fields
    sku: "",
    price: "",
    vendorId: "",
    
    // Linking fields
    customerId: "",
    opportunityId: "",
    partnerId: "",
    
    // Metadata
    status: "active",
    notes: "",
    tags: []
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
        productId: "",
        name: "",
        description: "",
        category: "",
        categoryId: "",
        
        // Provider information
        providerId: "",
        providerType: "",
        providerName: "",
        
        // Contract information
        contractStartDate: "",
        contractEndDate: "",
        
        // Financial information
        totalValue: "",
        premiumValue: "",
        premiumPercentage: "",
        discount: "",
        discountPercentage: "",
        
        // Legacy fields
        sku: "",
        price: "",
        vendorId: "",
        
        // Linking fields
        customerId: "",
        opportunityId: "",
        partnerId: "",
        
        // Metadata
        status: "active",
        notes: "",
        tags: []
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
    if (!newProduct.name || !newProduct.productId || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Product ID, Name, Category)",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...newProduct,
      price: newProduct.price ? parseFloat(newProduct.price) : null,
      vendorId: newProduct.vendorId ? parseInt(newProduct.vendorId) : null,
      categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : null,
      providerId: newProduct.providerId ? parseInt(newProduct.providerId) : null,
      customerId: newProduct.customerId ? parseInt(newProduct.customerId) : null,
      opportunityId: newProduct.opportunityId ? parseInt(newProduct.opportunityId) : null,
      partnerId: newProduct.partnerId ? parseInt(newProduct.partnerId) : null,
      totalValue: newProduct.totalValue ? parseFloat(newProduct.totalValue) : null,
      premiumValue: newProduct.premiumValue ? parseFloat(newProduct.premiumValue) : null,
      premiumPercentage: newProduct.premiumPercentage ? parseFloat(newProduct.premiumPercentage) : null,
      discount: newProduct.discount ? parseFloat(newProduct.discount) : null,
      discountPercentage: newProduct.discountPercentage ? parseFloat(newProduct.discountPercentage) : null,
      isActive: newProduct.status === 'active'
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
    (product.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add product
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
                        <TableHead>Product ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Provider</TableHead>

                        <TableHead>Total Value</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Customers</TableHead>
                        <TableHead>Partners</TableHead>
                        <TableHead>Opportunities</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-sm">{product.productId || product.id}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-1 text-indigo-600" />
                              {product.category}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{(product as any).provider || (product as any).providername || product.providerName || getVendorName(product.vendorId) || "—"}</div>
                              {(product as any).providertype && (product as any).providertype !== (product as any).provider && (
                                <div className="text-gray-500 capitalize">{(product as any).providertype}</div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm font-medium">
                              {((product as any).total_value || (product as any).totalvalue || product.totalValue) ? 
                                `€${parseFloat((product as any).total_value || (product as any).totalvalue || product.totalValue).toLocaleString()}` : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {((product as any).premium_value || (product as any).premiumvalue || product.premiumValue) && (
                                <div className="font-medium">€{parseFloat((product as any).premium_value || (product as any).premiumvalue || product.premiumValue).toLocaleString()}</div>
                              )}
                              {((product as any).premium_percentage || (product as any).premiumpercentage || product.premiumPercentage) && (
                                <div className="text-gray-500">{parseFloat((product as any).premium_percentage || (product as any).premiumpercentage || product.premiumPercentage)}%</div>
                              )}
                              {!((product as any).premium_value || (product as any).premiumvalue || product.premiumValue) && 
                               !((product as any).premium_percentage || (product as any).premiumpercentage || product.premiumPercentage) && "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {((product as any).discount_percentage || (product as any).discountpercentage || product.discountPercentage) ? (
                                <div className="text-green-600 font-medium">{parseFloat((product as any).discount_percentage || (product as any).discountpercentage || product.discountPercentage)}%</div>
                              ) : "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {(product as any).customercount || product.customerCount || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                              {(product as any).partnercount || product.partnerCount || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              {(product as any).opportunitycount || product.opportunityCount || 0}
                            </span>
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
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add product
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <CategoryManagerForProducts />
        </TabsContent>
      </Tabs>

      {/* Create Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="product-id" className="text-sm font-medium">
                    Product ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="product-id"
                    value={newProduct.productId}
                    onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
                    placeholder="Enter unique product ID"
                    className={!newProduct.productId ? "border-red-300" : ""}
                  />
                </div>
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
              </div>
              <div className="grid gap-2">
                <label htmlFor="product-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={2}
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
                    placeholder="e.g., Car, Hospital, Life"
                    className={!newProduct.category ? "border-red-300" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="product-status" className="text-sm font-medium">Status</label>
                  <Select
                    value={newProduct.status}
                    onValueChange={(value) => setNewProduct({ ...newProduct, status: value })}
                  >
                    <SelectTrigger id="product-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Provider Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Provider Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="provider-type" className="text-sm font-medium">Provider Type</label>
                  <Select
                    value={newProduct.providerType}
                    onValueChange={(value) => setNewProduct({ ...newProduct, providerType: value })}
                  >
                    <SelectTrigger id="provider-type">
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="partner">Partner/Broker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="provider-name" className="text-sm font-medium">Provider Name</label>
                  <Input
                    id="provider-name"
                    value={newProduct.providerName}
                    onChange={(e) => setNewProduct({ ...newProduct, providerName: e.target.value })}
                    placeholder="Enter provider name"
                  />
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Contract Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="contract-start" className="text-sm font-medium">Contract Start Date</label>
                  <Input
                    id="contract-start"
                    type="date"
                    value={newProduct.contractStartDate}
                    onChange={(e) => setNewProduct({ ...newProduct, contractStartDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contract-end" className="text-sm font-medium">Contract End Date</label>
                  <Input
                    id="contract-end"
                    type="date"
                    value={newProduct.contractEndDate}
                    onChange={(e) => setNewProduct({ ...newProduct, contractEndDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Financial Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="total-value" className="text-sm font-medium">Total Value (EUR)</label>
                  <Input
                    id="total-value"
                    type="number"
                    step="0.01"
                    value={newProduct.totalValue}
                    onChange={(e) => setNewProduct({ ...newProduct, totalValue: e.target.value })}
                    placeholder="Enter total value"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="premium-value" className="text-sm font-medium">Premium Value (EUR)</label>
                  <Input
                    id="premium-value"
                    type="number"
                    step="0.01"
                    value={newProduct.premiumValue}
                    onChange={(e) => setNewProduct({ ...newProduct, premiumValue: e.target.value })}
                    placeholder="Enter premium value"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="premium-percentage" className="text-sm font-medium">Premium %</label>
                  <Input
                    id="premium-percentage"
                    type="number"
                    step="0.01"
                    value={newProduct.premiumPercentage}
                    onChange={(e) => setNewProduct({ ...newProduct, premiumPercentage: e.target.value })}
                    placeholder="Enter premium percentage"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="discount" className="text-sm font-medium">Discount (EUR)</label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                    placeholder="Enter discount amount"
                  />
                </div>
              </div>
            </div>

            {/* Linking Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Entity Links (Optional)</h4>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Textarea
                  id="notes"
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  placeholder="Enter any additional notes"
                  rows={2}
                />
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
              {createProductMutation.isPending ? "Creating..." : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}