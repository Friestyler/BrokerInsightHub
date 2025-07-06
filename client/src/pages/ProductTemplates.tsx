import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker } from "@/components/ui/icon-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Building2, 
  Car, 
  Heart, 
  Shield, 
  Home, 
  Plane, 
  Briefcase, 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  FileText, 
  Settings, 
  Zap, 
  Globe, 
  Lock, 
  Star, 
  CheckCircle,
  X,
  Calendar,
  Euro 
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CategoryManagerForProducts from "@/components/CategoryManagerForProducts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductTemplate, InsertProductTemplate } from "@shared/schema";

// Extended interface for frontend with additional fields from backend joins
interface ProductTemplateWithCategory extends ProductTemplate {
  categoryColor?: string;
  categoryName?: string;
  vendorName?: string;
  categoryIcon?: string;
  partnerCount?: number;
  customerCount?: number;
  opportunityCount?: number;
}

// Interface for product customers
interface ProductCustomer {
  id: number;
  name: string;
  description?: string;
  status: string;
  contract_start_date: string;
  contract_end_date: string;
  premium_value: number;
  premium_percentage: number;
  discount_percentage: number;
  contract_status: string;
  contract_created_at: string;
}

// Icon mapping for category icons
const ICON_MAP = {
  "Building2": Building2,
  "Car": Car,
  "Heart": Heart,
  "Shield": Shield,
  "Home": Home,
  "Plane": Plane,
  "Briefcase": Briefcase,
  "Users": Users,
  "DollarSign": DollarSign,
  "Target": Target,
  "TrendingUp": TrendingUp,
  "Award": Award,
  "Clock": Clock,
  "FileText": FileText,
  "Settings": Settings,
  "Zap": Zap,
  "Globe": Globe,
  "Lock": Lock,
  "Star": Star,
  "CheckCircle": CheckCircle,
} as const;

// Helper function to render category icon
const renderCategoryIcon = (iconName?: string) => {
  if (!iconName || !(iconName in ICON_MAP)) return null;
  const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
  return <IconComponent className="h-4 w-4" />;
};

const productTemplateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  category: z.string().optional(),
  providerId: z.number().optional(),
  providerType: z.string().optional(),
  providerName: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  averagePrice: z.number().min(0, "Average price must be positive").optional(),
  premiumValue: z.number().min(0, "Premium value must be positive").optional(),
  premiumPercentage: z.number().min(0).max(100, "Premium percentage must be between 0-100").optional(),
  discount: z.number().min(0, "Discount must be positive").optional(),
  discountPercentage: z.number().min(0).max(100, "Discount percentage must be between 0-100").optional(),
  vendorId: z.number().optional(),
  isActive: z.boolean().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ProductTemplateFormData = z.infer<typeof productTemplateSchema>;

export default function ProductTemplates() {
  const [activeTab, setActiveTab] = useState<'templates' | 'categories'>('templates');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
  const [createSubcategoryDialogOpen, setCreateSubcategoryDialogOpen] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<any>(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [newSubcategoryColor, setNewSubcategoryColor] = useState("#3B82F6");
  const [editCategoryColor, setEditCategoryColor] = useState("#3B82F6");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newSubcategoryIcon, setNewSubcategoryIcon] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("");
  
  // Customer popup states
  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);
  const [selectedProductForCustomers, setSelectedProductForCustomers] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to map color hex values to badge variants
  const getBadgeVariantFromColor = (color: string | null): "blue" | "green" | "amber" | "red" | "purple" | "cyan" | "lime" | "orange" | "pink" | "gray" => {
    if (!color) return 'blue';
    
    const colorMap: { [key: string]: "blue" | "green" | "amber" | "red" | "purple" | "cyan" | "lime" | "orange" | "pink" | "gray" } = {
      '#3B82F6': 'blue',
      '#10B981': 'green', 
      '#F59E0B': 'amber',
      '#EF4444': 'red',
      '#8B5CF6': 'purple',
      '#06B6D4': 'cyan',
      '#84CC16': 'lime',
      '#F97316': 'orange',
      '#EC4899': 'pink',
      '#6B7280': 'gray'
    };
    
    return colorMap[color] || 'blue';
  };

  // Simplified category rendering - main categories only
  const renderMainCategories = () => {
    return mainCategories.map((category: any) => (
      <SelectItem key={category.id} value={category.name}>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </div>
      </SelectItem>
    ));
  };

  // Fetch product catalogue
  const { data: productTemplates = [], isLoading } = useQuery<ProductTemplateWithCategory[]>({
    queryKey: ['/api/products'],
  });

  // Fetch product categories using the working pattern
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/product-categories'],
  });

  // Create main categories structure exactly like ProductListsTab.tsx
  const mainCategoriesData = useMemo(() => {
    if (!productTemplates || !categories) return [];

    const mainCategories = new Map();

    // Get all main categories (no parent_id)
    const rootCategories = categories.filter((cat: any) => !cat.parent_id);
    
    rootCategories.forEach((category: any) => {
      // Find products that belong to this main category
      const categoryProducts = productTemplates.filter((product: any) => 
        product.parent_category_name === category.name
      );
      
      if (!mainCategories.has(category.name)) {
        mainCategories.set(category.name, {
          id: category.id,
          name: category.name,
          color: category.color || '#6b7280',
          products: categoryProducts,
          productCount: categoryProducts.length,
          isBlindSpot: categoryProducts.length === 0
        });
      }
    });

    return Array.from(mainCategories.values());
  }, [productTemplates, categories]);

  // Extract simple list for filter pills
  const mainCategories = mainCategoriesData;

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });

  // Fetch customers for selected product
  const { data: productCustomers = [], isLoading: customersLoading } = useQuery<ProductCustomer[]>({
    queryKey: [`/api/products/${selectedProductForCustomers}/customers`],
    enabled: !!selectedProductForCustomers,
  });

  // Create product catalogue mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductTemplateFormData) => {
      return apiRequest('POST', '/api/product-templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-templates'] });
      setCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Product catalogue created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product catalogue",
        variant: "destructive",
      });
    },
  });

  // Update product catalogue mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductTemplateFormData }) => {
      return apiRequest('PUT', `/api/product-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-templates'] });
      setEditDialogOpen(false);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Product catalogue updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product catalogue",
        variant: "destructive",
      });
    },
  });

  // Delete product catalogue mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/product-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-templates'] });
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Product catalogue deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product catalogue",
        variant: "destructive",
      });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; icon?: string; description?: string; parentId?: number }) => {
      return apiRequest('POST', '/api/product-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      setCreateCategoryDialogOpen(false);
      setCreateSubcategoryDialogOpen(false);
      setSelectedParentCategory(null);
      setNewCategoryColor("#3B82F6");
      setNewSubcategoryColor("#3B82F6");
      setNewCategoryIcon("");
      setNewSubcategoryIcon("");
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/product-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      setEditCategoryDialogOpen(false);
      setSelectedCategory(null);
      setEditCategoryColor("#3B82F6");
      setEditCategoryIcon("");
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/product-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      setDeleteCategoryDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const createForm = useForm<ProductTemplateFormData>({
    resolver: zodResolver(productTemplateSchema),
    defaultValues: {
      isActive: true,
      status: "active",
      tags: [],
    },
  });

  const editForm = useForm<ProductTemplateFormData>({
    resolver: zodResolver(productTemplateSchema),
  });

  // Filter templates based on search and category
  const filteredTemplates = (productTemplates as ProductTemplate[]).filter((template: ProductTemplate) => {
    // Text search filter
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter - use parent_category_name for filtering
    const parentCategoryName = (template as any).parent_category_name || (template as any).parentCategoryName;
    const matchesCategory = selectedCategoryFilter === "all" || 
      parentCategoryName === selectedCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (template: ProductTemplate) => {
    setSelectedTemplate(template);
    editForm.reset({
      productId: template.productId,
      name: template.name,
      description: template.description || "",
      categoryId: template.categoryId || undefined,
      category: template.category || "",
      providerId: template.providerId || undefined,
      providerType: template.providerType || "",
      providerName: template.providerName || "",

      averagePrice: template.averagePrice ? Number(template.averagePrice) : undefined,
      premiumValue: template.premiumValue ? Number(template.premiumValue) : undefined,
      premiumPercentage: template.premiumPercentage ? Number(template.premiumPercentage) : undefined,
      discount: template.discount ? Number(template.discount) : undefined,
      discountPercentage: template.discountPercentage ? Number(template.discountPercentage) : undefined,
      vendorId: template.vendorId || undefined,
      isActive: template.isActive,

      notes: template.notes || "",
      tags: Array.isArray(template.tags) ? template.tags : [],
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (template: ProductTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number | string | null) => {
    if (!amount) return "€0.00";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const formatPercentage = (percentage: number | string | null) => {
    if (!percentage) return "0%";
    const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    return `${num}%`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Simplified category helpers - only main categories
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getSubcategories = (parentId: number) => {
    return categories?.filter((cat: any) => cat.parent_id === parentId) || [];
  };

  const getSubcategoryCount = (parentId: number) => {
    return categories?.filter((cat: any) => cat.parent_id === parentId)?.length || 0;
  };

  // Handlers for category dialogs
  const handleCreateSubcategory = (parentCategory: any) => {
    setSelectedParentCategory(parentCategory);
    setNewSubcategoryColor(parentCategory.color || "#10B981");
    setCreateSubcategoryDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setEditCategoryColor(category.color || "#3B82F6");
    setEditCategoryIcon(category.icon || "");
    setEditCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setDeleteCategoryDialogOpen(true);
  };

  const renderProductTemplateForm = (form: any, onSubmit: (data: ProductTemplateFormData) => void) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories && renderCategoriesHierarchy(categories as any[])}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="providerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter provider name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>



        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="averagePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Price (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="premiumValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Value (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="premiumPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save template"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="flex-1">
      {/* Tab Navigation */}
      <div className="bg-white">
        <div className="px-6 py-4">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'templates' 
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              Products
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'categories' 
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Product Categories
            </Button>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      {activeTab === 'categories' && (
        <div className="mx-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
              <Dialog open={createCategoryDialogOpen} onOpenChange={setCreateCategoryDialogOpen}>
                <DialogTrigger asChild>
                <Button className="bg-[#5567E5] hover:bg-[#4451c7]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-[#282A3F]">Create New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  createCategoryMutation.mutate({
                    name: formData.get('name') as string,
                    color: newCategoryColor,
                    icon: newCategoryIcon || undefined,
                    description: formData.get('description') as string || undefined,
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#282A3F]">Category Name</label>
                      <Input name="name" placeholder="Enter category name" required className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#282A3F]">Color</label>
                      <div className="mt-1">
                        <ColorPicker value={newCategoryColor} onChange={setNewCategoryColor} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#282A3F]">Icon (Optional)</label>
                      <div className="mt-1">
                        <IconPicker 
                          value={newCategoryIcon}
                          onChange={setNewCategoryIcon}
                          placeholder="Select icon..."
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Choose a visual icon to represent this category</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#282A3F]">Description</label>
                      <Textarea name="description" placeholder="Enter description (optional)" className="mt-1" />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setCreateCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#5567E5] hover:bg-[#4451c7]" disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? "Creating..." : "Create category"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
            <p className="text-sm text-gray-600 mb-4">Organize your insurance products into categories and subcategories for better structure and easier management.</p>
          </div>

          {/* Badge-based Category Tree */}
          <div className="space-y-4">
            {mainCategories.map((category: any) => (
              <div key={category.id}>
                <Collapsible 
                  open={expandedCategories.has(category.id)}
                  onOpenChange={(open) => {
                    const newExpanded = new Set(expandedCategories);
                    if (open) {
                      newExpanded.add(category.id);
                    } else {
                      newExpanded.delete(category.id);
                    }
                    setExpandedCategories(newExpanded);
                  }}
                >
                  <div className="flex items-center space-x-3 group">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedCategories.has(category.id) ? 'rotate-90' : ''
                        }`} />
                      </Button>
                    </CollapsibleTrigger>
                    
                    <Badge 
                      variant={getBadgeVariantFromColor(category.color)}
                      className="text-sm font-medium px-3 py-1.5 cursor-pointer hover:opacity-80"
                      onClick={() => {
                        const newExpanded = new Set(expandedCategories);
                        if (expandedCategories.has(category.id)) {
                          newExpanded.delete(category.id);
                        } else {
                          newExpanded.add(category.id);
                        }
                        setExpandedCategories(newExpanded);
                      }}
                    >
                      {category.icon && (
                        <span className="mr-2">{renderCategoryIcon(category.icon)}</span>
                      )}
                      {category.name}
                    </Badge>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#5567E5] hover:text-[#4451c7] hover:bg-[#5567E5]/10 h-7 px-2"
                        onClick={() => {
                          setSelectedParentCategory(category);
                          setCreateSubcategoryDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add subcategory
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="ml-8 mt-3 space-y-3">
                      {getSubcategories(category.id).map((subcategory: any) => (
                        <div key={subcategory.id}>
                          <Collapsible 
                            open={expandedCategories.has(subcategory.id)}
                            onOpenChange={(open) => {
                              const newExpanded = new Set(expandedCategories);
                              if (open) {
                                newExpanded.add(subcategory.id);
                              } else {
                                newExpanded.delete(subcategory.id);
                              }
                              setExpandedCategories(newExpanded);
                            }}
                          >
                            <div className="flex items-center group">
                              <div className="w-3 flex justify-center mr-3">
                                {getSubcategoryCount(subcategory.id) > 0 ? (
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-0 h-auto w-3">
                                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                                        expandedCategories.has(subcategory.id) ? 'rotate-90' : ''
                                      }`} />
                                    </Button>
                                  </CollapsibleTrigger>
                                ) : null}
                              </div>
                              
                              <Badge 
                                variant={getBadgeVariantFromColor(subcategory.color || category.color)}
                                className="text-sm px-3 py-1 cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  if (getSubcategoryCount(subcategory.id) > 0) {
                                    const newExpanded = new Set(expandedCategories);
                                    if (expandedCategories.has(subcategory.id)) {
                                      newExpanded.delete(subcategory.id);
                                    } else {
                                      newExpanded.add(subcategory.id);
                                    }
                                    setExpandedCategories(newExpanded);
                                  }
                                }}
                              >
                                {subcategory.icon && (
                                  <span className="mr-2">{renderCategoryIcon(subcategory.icon)}</span>
                                )}
                                {subcategory.name}
                              </Badge>
                              
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#5567E5] hover:text-[#4451c7] hover:bg-[#5567E5]/10 h-6 px-2 text-xs"
                                  onClick={() => {
                                    setSelectedParentCategory(subcategory);
                                    setCreateSubcategoryDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add subcategory
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditCategory(subcategory)}>
                                      <Edit className="h-3 w-3 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleDeleteCategory(subcategory)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <CollapsibleContent>
                              <div className="ml-6 mt-3 space-y-2">
                                {getSubcategories(subcategory.id).map((nestedSubcategory: any) => (
                                  <div key={nestedSubcategory.id} className="flex items-center space-x-3 group">
                                    <div className="w-3 h-3" />
                                    
                                    <Badge 
                                      variant={getBadgeVariantFromColor(nestedSubcategory.color || subcategory.color || category.color)}
                                      className="text-sm px-3 py-1.5"
                                    >
                                      {nestedSubcategory.icon && (
                                        <span className="mr-1">{renderCategoryIcon(nestedSubcategory.icon)}</span>
                                      )}
                                      {nestedSubcategory.name}
                                    </Badge>
                                    
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#5567E5] hover:text-[#4451c7] hover:bg-[#5567E5]/10 h-6 px-2 text-xs"
                                        onClick={() => {
                                          setSelectedParentCategory(nestedSubcategory);
                                          setCreateSubcategoryDialogOpen(true);
                                        }}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add subcategory
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreVertical className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleEditCategory(nestedSubcategory)}>
                                            <Edit className="h-3 w-3 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="text-red-600"
                                            onClick={() => handleDeleteCategory(nestedSubcategory)}
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'templates' && (
        <div className="mx-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[16px] text-[#1f2937] font-semibold">Product Lists</span>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add product</DialogTitle>
                </DialogHeader>
                {renderProductTemplateForm(createForm, (data) => createMutation.mutate(data))}
              </DialogContent>
            </Dialog>
          </div>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={selectedCategoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryFilter("all")}
            className="h-8 px-3"
          >
            All ({(productTemplates as any[]).length})
          </Button>
          {mainCategories.map((category: any) => {
            const categoryProductCount = category.products.length;
            
            return (
              <Button
                key={category.id}
                variant={selectedCategoryFilter === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryFilter(category.name)}
                className="h-8 px-3 gap-2"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name} ({categoryProductCount})
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-[#E6E7F1]">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mainCategories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              No products found. Add your first product to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {mainCategories
            .filter((category: any) => {
              if (selectedCategoryFilter === "all") return true;
              return category.name === selectedCategoryFilter;
            })
            .map((category: any) => (
            <Card key={category.id} className="border-[#E6E7F1]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name} ({category.productCount})
                      </h3>
                      <p className="text-sm text-gray-500">
                        Total value: €{category.products.reduce((sum: number, p: any) => sum + (p.premium_value || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.products.map((product: any) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-medium">{product.customers || 0}</span>
                              <span className="text-gray-500">Customers</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium">€{(product.premium_value || 0).toLocaleString()}</span>
                              <span className="text-gray-500">Total Premium</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600 font-medium">€{Math.round((product.premium_value || 0) / Math.max(product.customers || 1, 1)).toLocaleString()}</span>
                              <span className="text-gray-500">Avg Premium</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {product.contract_end_date && (
                            <>
                              <div>{new Date(product.contract_end_date).toLocaleDateString()}</div>
                              <div className="text-xs">
                                {Math.ceil((new Date(product.contract_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365))} years left
                              </div>
                              <div className="text-xs">Latest Expiry</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product Catalogue</DialogTitle>
          </DialogHeader>
          {renderProductTemplateForm(editForm, (data) => {
            if (selectedTemplate) {
              updateMutation.mutate({ id: selectedTemplate.id, data });
            }
          })}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Catalogue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTemplate && deleteMutation.mutate(selectedTemplate.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      )}
      {/* Create Subcategory Dialog */}
      <Dialog open={createSubcategoryDialogOpen} onOpenChange={setCreateSubcategoryDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">
              Create Subcategory for "{selectedParentCategory?.name}"
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            createCategoryMutation.mutate({
              name: formData.get('name') as string,
              color: newSubcategoryColor,
              icon: newSubcategoryIcon || undefined,
              description: formData.get('description') as string || undefined,
              parentId: selectedParentCategory?.id,
            });
          }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Subcategory Name</label>
                <Input name="name" placeholder="Enter subcategory name" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Color</label>
                <div className="mt-1">
                  <ColorPicker 
                    value={newSubcategoryColor} 
                    onChange={setNewSubcategoryColor}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Icon (Optional)</label>
                <div className="mt-1">
                  <IconPicker 
                    value={newSubcategoryIcon}
                    onChange={setNewSubcategoryIcon}
                    placeholder="Select icon..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Choose a visual icon to represent this subcategory</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Description</label>
                <Textarea name="description" placeholder="Enter description (optional)" className="mt-1" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                setCreateSubcategoryDialogOpen(false);
                setSelectedParentCategory(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5567E5] hover:bg-[#4451c7]" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? "Creating..." : "Create subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            if (selectedCategory) {
              updateCategoryMutation.mutate({
                id: selectedCategory.id,
                data: {
                  name: formData.get('name') as string,
                  color: editCategoryColor,
                  icon: editCategoryIcon || undefined,
                  description: formData.get('description') as string || undefined,
                  parentId: selectedCategory.parent_id,
                  level: selectedCategory.level || 1,
                  sortOrder: selectedCategory.sort_order || 0,
                  isActive: selectedCategory.is_active !== false
                }
              });
            }
          }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Category Name</label>
                <Input 
                  name="name" 
                  placeholder="Enter category name" 
                  defaultValue={selectedCategory?.name || ""} 
                  required 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Color</label>
                <div className="mt-1">
                  <ColorPicker 
                    value={editCategoryColor} 
                    onChange={setEditCategoryColor}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Icon (Optional)</label>
                <div className="mt-1">
                  <IconPicker 
                    value={editCategoryIcon}
                    onChange={setEditCategoryIcon}
                    placeholder="Select icon..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Choose a visual icon to represent this category</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Description</label>
                <Textarea 
                  name="description" 
                  placeholder="Enter description (optional)" 
                  defaultValue={selectedCategory?.description || ""} 
                  className="mt-1" 
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                setEditCategoryDialogOpen(false);
                setSelectedCategory(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5567E5] hover:bg-[#4451c7]" disabled={updateCategoryMutation.isPending}>
                {updateCategoryMutation.isPending ? "Updating..." : "Update category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Category Dialog */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#282A3F]">Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone and will also delete all subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteCategoryDialogOpen(false);
              setSelectedCategory(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedCategory) {
                  deleteCategoryMutation.mutate(selectedCategory.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customer Popup Dialog */}
      <Dialog open={customerPopupOpen} onOpenChange={setCustomerPopupOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Product Customers
              {selectedProductForCustomers && (
                <span className="text-sm font-normal text-gray-500">
                  - {productTemplates.find(p => p.id === selectedProductForCustomers)?.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {customersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading customers...</div>
              </div>
            ) : productCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No customers found for this product</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productCustomers.map((customer: ProductCustomer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#282A3F]">{customer.name}</h4>
                        {customer.description && (
                          <p className="text-sm text-gray-600 mt-1">{customer.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(customer.contract_start_date).toLocaleDateString()} - {new Date(customer.contract_end_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            €{customer.premium_value.toLocaleString()}
                          </div>
                          <div className="text-xs">
                            {customer.premium_percentage}% premium
                          </div>
                          {customer.discount_percentage > 0 && (
                            <div className="text-green-600 text-xs">
                              {customer.discount_percentage}% discount
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={customer.status === 'active' ? 'green' : customer.status === 'inactive' ? 'gray' : 'amber'}
                          className="text-xs"
                        >
                          {customer.status}
                        </Badge>
                        <Badge 
                          variant={
                            new Date(customer.contract_end_date) < new Date() ? 'red' :
                            new Date(customer.contract_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'amber' :
                            'green'
                          }
                          className="text-xs"
                        >
                          {new Date(customer.contract_end_date) < new Date() ? 'Expired' :
                           new Date(customer.contract_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' :
                           'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCustomerPopupOpen(false);
                setSelectedProductForCustomers(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}