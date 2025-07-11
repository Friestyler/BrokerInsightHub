import { useState, useMemo } from "react";
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
  Euro,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BellRing,
  Code,
  Brain,
  Eye,
  EyeOff,
  Palette,
  Database,
  Cpu,
  Timer
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Toggle } from "@/components/ui/toggle";
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
  const [activeTab, setActiveTab] = useState<'templates' | 'categories' | 'alerts' | 'smartcrosssell'>('templates');
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
  
  // Alert settings states
  const [activeAlertTab, setActiveAlertTab] = useState<'partners' | 'customers' | 'portfolio'>('partners');
  
  // Smart Cross Sell settings states
  const [activeSmartCrossSellTab, setActiveSmartCrossSellTab] = useState<'partners' | 'customers' | 'portfolio'>('partners');
  const [createSmartCrossSellDialogOpen, setCreateSmartCrossSellDialogOpen] = useState(false);
  const [configureSmartCrossSellDialogOpen, setConfigureSmartCrossSellDialogOpen] = useState(false);
  const [selectedSmartCrossSellTemplate, setSelectedSmartCrossSellTemplate] = useState<any>(null);
  const [smartCrossSellTemplateType, setSmartCrossSellTemplateType] = useState<'crosssell' | 'trending' | 'custom'>('crosssell');
  const [createAlertDialogOpen, setCreateAlertDialogOpen] = useState(false);
  const [editAlertDialogOpen, setEditAlertDialogOpen] = useState(false);
  const [deleteAlertDialogOpen, setDeleteAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedAlertCategory, setSelectedAlertCategory] = useState<string | null>(null);
  const [expandedAlertCategories, setExpandedAlertCategories] = useState<Set<string>>(new Set(['Schade Zakelijk']));
  const [alertPreviewOpen, setAlertPreviewOpen] = useState(false);
  const [currentAlertData, setCurrentAlertData] = useState<any>(null);
  const [editAlertStep, setEditAlertStep] = useState(0);

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

  // Render hierarchical categories for form dropdown
  const renderCategoriesHierarchy = (categories: any[]) => {
    const items: JSX.Element[] = [];
    
    const renderCategory = (category: any, level: number = 0) => {
      const paddingLeft = level * 16; // 16px per level
      
      items.push(
        <SelectItem key={category.id} value={category.id.toString()}>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </div>
        </SelectItem>
      );
      
      // Render subcategories if they exist
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory: any) => {
          renderCategory(subcategory, level + 1);
        });
      }
    };
    
    categories.forEach((category: any) => {
      renderCategory(category, 0);
    });
    
    return items;
  };

  // Fetch product catalogue
  const { data: productTemplates = [], isLoading } = useQuery<ProductTemplateWithCategory[]>({
    queryKey: ['/api/product-templates'],
  });

  // Fetch product categories using the working pattern
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Create main categories structure for product templates
  const mainCategoriesData = useMemo(() => {
    if (!productTemplates || !categories) return [];

    const mainCategories = new Map();

    // Get all main categories (no parent_id)
    const rootCategories = categories.filter((cat: any) => !cat.parent_id);
    
    rootCategories.forEach((category: any) => {
      // Find product templates that belong to this main category
      const categoryProducts = productTemplates.filter((template: any) => 
        template.categoryName === category.name
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
  
  // Build hierarchical structure from flat categories
  const categoriesWithHierarchy = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    const categoryMap = new Map();
    const rootCategories: any[] = [];
    
    // First, create a map of all categories
    categories.forEach((category: any) => {
      categoryMap.set(category.id, {
        ...category,
        subcategories: []
      });
    });
    
    // Then, build the hierarchy
    categories.forEach((category: any) => {
      if (category.parent_id) {
        // This is a subcategory
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.subcategories.push(categoryMap.get(category.id));
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap.get(category.id));
      }
    });
    
    return rootCategories;
  }, [categories]);
  
  // Get only root categories (level 1) for the categories tab
  const rootCategories = categoriesWithHierarchy;

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
    // Find the parent category in rootCategories and return its subcategories
    const parentCategory = rootCategories.find((cat: any) => cat.id === parentId);
    return parentCategory?.subcategories || [];
  };

  const getSubcategoryCount = (parentId: number) => {
    // Find the parent category in rootCategories and return its subcategories count
    const parentCategory = rootCategories.find((cat: any) => cat.id === parentId);
    return parentCategory?.subcategories?.length || 0;
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
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesWithHierarchy && renderCategoriesHierarchy(categoriesWithHierarchy as any[])}
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

        <FormField
          control={form.control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Insurance Company, Broker" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contractStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
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
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'alerts' 
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
              }`}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell className="h-4 w-4" />
              Alert Settings
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'smartcrosssell' 
                  ? 'bg-[#E1E4FB] text-[#3E4DC4]' 
                  : 'text-gray-600 hover:bg-[#F5F6FE] hover:text-[#5567E5]'
              }`}
              onClick={() => setActiveTab('smartcrosssell')}
            >
              <Brain className="h-4 w-4" />
              Smart Cross Sell
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
            {rootCategories.map((category: any) => (
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
        <div className="space-y-4">
          {mainCategories
            .filter((category: any) => {
              if (selectedCategoryFilter === "all") return true;
              return category.name === selectedCategoryFilter;
            })
            .map((category: any) => {
              const isExpanded = expandedCategories.has(category.id);
              const totalCustomers = category.products.reduce((sum: number, p: any) => sum + (p.customerCount || 0), 0);
              const totalPotential = category.products.reduce((sum: number, p: any) => sum + (p.customerCount || 0) * 0.8, 0);
              const totalValue = category.products.reduce((sum: number, p: any) => sum + (p.premium_value || 0), 0);
              const penetration = Math.round((totalCustomers / Math.max(totalCustomers + totalPotential, 1)) * 100);
              
              return (
                <Card key={category.id} className="border-[#E6E7F1]">
                  <Collapsible open={isExpanded} onOpenChange={(open) => {
                    const newExpanded = new Set(expandedCategories);
                    if (open) {
                      newExpanded.add(category.id);
                    } else {
                      newExpanded.delete(category.id);
                    }
                    setExpandedCategories(newExpanded);
                  }}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="text-left">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {category.name} <span className="text-sm font-normal text-gray-500">{penetration}% penetration</span>
                              </h3>
                            </div>
                          </div>
                          <div className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 bg-white">
                            Details
                          </div>
                        </div>
                        <div className="flex items-center gap-8 mt-2 text-sm">
                          <div>
                            <span className="font-medium">{totalCustomers}</span> customers
                          </div>
                          <div>
                            <span className="font-medium">{Math.round(totalPotential)}</span> potential
                          </div>
                          <div>
                            <span className="font-medium text-green-600">€{totalValue > 0 ? (totalValue / 1000).toFixed(1) + 'M' : '0.1M'}</span> value
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${penetration}%` }}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 mb-3">Onderliggende producten:</h4>
                          {category.products.map((product: any) => (
                            <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                    <span className="text-gray-500 text-sm">({product.customerCount || 0})</span>
                                  </div>
                                  {product.description && (
                                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Provider: {product.providerName || 'N/A'}</span>
                                    <span>Avg: €{(product.averagePrice || 0).toLocaleString()}</span>
                                    <span>Premium: {(Number(product.premiumPercentage) || 0).toFixed(1)}%</span>
                                    {product.contractStartDate && (
                                      <span>Start: {new Date(product.contractStartDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right text-sm">
                                  <div className="font-medium">€{((product.premium_value || 0) > 0 ? (product.premium_value || 0).toLocaleString() : '0k')}</div>
                                  <div className="text-xs text-gray-500">Total Value</div>
                                </div>
                                <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                                  {product.customerCount || 0} klanten
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(product)}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
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

      {/* Alert Settings Tab */}
      {activeTab === 'alerts' && (
        <div className="mx-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900">Alert Settings</h1>
              <Button 
                variant="outline" 
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setAlertPreviewOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Changes
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure alert types, AI prompting, custom scripts, and visual styling for each insurance category to ensure timely notifications and actionable insights.
            </p>
          </div>

          {/* Alert Sub-tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveAlertTab('partners')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeAlertTab === 'partners'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Partners
              </button>
              <button
                onClick={() => setActiveAlertTab('customers')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeAlertTab === 'customers'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveAlertTab('portfolio')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeAlertTab === 'portfolio'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Portfolio Insights
              </button>
            </div>
          </div>

          {/* Alert Categories - Partners Tab */}
          {activeAlertTab === 'partners' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Partner Alert Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure alerts for partner-specific activities, performance metrics, and opportunities.
                </p>
              </div>
            {/* Overige - Collapsed */}
            <div className="border border-[#E6E7F1] rounded-lg bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => {
                        const newExpanded = new Set(expandedAlertCategories);
                        if (expandedAlertCategories.has('Overige')) {
                          newExpanded.delete('Overige');
                        } else {
                          newExpanded.add('Overige');
                        }
                        setExpandedAlertCategories(newExpanded);
                      }}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedAlertCategories.has('Overige') ? 'rotate-90' : ''
                      }`} />
                    </Button>
                    <Badge variant="orange" className="text-sm px-3 py-1">
                      Overige
                    </Badge>
                    <span className="text-sm text-gray-600">1 alert configured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schade Zakelijk - Expanded */}
            <div className="border border-[#E6E7F1] rounded-lg bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => {
                        const newExpanded = new Set(expandedAlertCategories);
                        if (expandedAlertCategories.has('Schade Zakelijk')) {
                          newExpanded.delete('Schade Zakelijk');
                        } else {
                          newExpanded.add('Schade Zakelijk');
                        }
                        setExpandedAlertCategories(newExpanded);
                      }}
                    >
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedAlertCategories.has('Schade Zakelijk') ? 'rotate-90' : ''
                      }`} />
                    </Button>
                    <Badge variant="red" className="text-sm px-3 py-1">
                      Schade Zakelijk
                    </Badge>
                    <span className="text-sm text-gray-600">2 alerts configured</span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedAlertCategories.has('Schade Zakelijk') && (
                <div className="px-4 pb-4">
                  <div className="ml-7 space-y-3">
                    {/* Expired Policies Alert */}
                    <div className="border border-[#E6E7F1] rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Expired Policies Alert</h3>
                            <p className="text-sm text-gray-600">(count) policies expired</p>
                          </div>
                          <Badge variant="green" className="text-xs px-2 py-1">
                            Custom Script
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Database className="h-3 w-3" />
                            <span>Policy Database</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Timer className="h-3 w-3" />
                            <span>Real-time</span>
                          </div>
                          <Toggle size="sm" defaultPressed />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAlert({
                                id: 1,
                                name: "Expired Policies Alert",
                                title: "Expired Policies Alert",
                                message: "(count) policies expired",
                                description: "(count) {category} policies have expired (latest expiry: {date}). Immediate renewal needed to avoid uninsured liabilities.",
                                category: "Schade Zakelijk",
                                type: "custom_script",
                                severity: "critical",
                                icon: "Clock",
                                backgroundColor: "Red Light",
                                borderColor: "Red Border",
                                enabled: true,
                                frequency: "real-time",
                                dataSource: "Policy Database",
                                customScript: "SELECT * FROM policies WHERE category = 'Schade Zakelijk' AND expiry_date < CURRENT_DATE AND status != 'renewed'",
                                triggerConditions: "expiry_date < today() AND status = 'active'"
                              });
                              setEditAlertDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Renewal Reminder Alert */}
                    <div className="border border-[#E6E7F1] rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Bell className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Renewal Reminder Alert</h3>
                            <p className="text-sm text-gray-600">(count) renewals due soon</p>
                          </div>
                          <Badge variant="green" className="text-xs px-2 py-1">
                            Custom Script
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Database className="h-3 w-3" />
                            <span>Policy Database</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Timer className="h-3 w-3" />
                            <span>Daily</span>
                          </div>
                          <Toggle size="sm" />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAlert({
                                id: 2,
                                name: "Renewal Reminder Alert",
                                title: "Renewal Reminder Alert",
                                message: "(count) renewals due soon",
                                description: "(count) {category} policies expire within 30 days. Total renewal value: €{amount}. Schedule renewal meetings immediately.",
                                category: "Schade Zakelijk",
                                type: "custom_script",
                                severity: "medium",
                                icon: "Bell",
                                backgroundColor: "Yellow Light",
                                borderColor: "Yellow Border",
                                enabled: false,
                                frequency: "daily",
                                dataSource: "Policy Database",
                                customScript: "SELECT * FROM policies WHERE category = 'Schade Zakelijk' AND expiry_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)",
                                triggerConditions: "expiry_date BETWEEN today() AND today() + 30"
                              });
                              setEditAlertDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Add New Alert Button */}
                    <div className="flex justify-center py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#5567E5] hover:text-[#4451c7] hover:bg-[#5567E5]/10"
                        onClick={() => {
                          setSelectedAlertCategory('Schade Zakelijk');
                          setCreateAlertDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Alert for Schade Zakelijk
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inkomen Collectief - Collapsed */}
            <div className="border border-[#E6E7F1] rounded-lg bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => {
                        const newExpanded = new Set(expandedAlertCategories);
                        if (expandedAlertCategories.has('Inkomen Collectief')) {
                          newExpanded.delete('Inkomen Collectief');
                        } else {
                          newExpanded.add('Inkomen Collectief');
                        }
                        setExpandedAlertCategories(newExpanded);
                      }}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedAlertCategories.has('Inkomen Collectief') ? 'rotate-90' : ''
                      }`} />
                    </Button>
                    <Badge variant="blue" className="text-sm px-3 py-1">
                      Inkomen Collectief
                    </Badge>
                    <span className="text-sm text-gray-600">1 alert configured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pensioen - Collapsed */}
            <div className="border border-[#E6E7F1] rounded-lg bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => {
                        const newExpanded = new Set(expandedAlertCategories);
                        if (expandedAlertCategories.has('Pensioen')) {
                          newExpanded.delete('Pensioen');
                        } else {
                          newExpanded.add('Pensioen');
                        }
                        setExpandedAlertCategories(newExpanded);
                      }}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedAlertCategories.has('Pensioen') ? 'rotate-90' : ''
                      }`} />
                    </Button>
                    <Badge variant="purple" className="text-sm px-3 py-1">
                      Pensioen
                    </Badge>
                    <span className="text-sm text-gray-600">1 alert configured</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Alert Categories - Customers Tab */}
          {activeAlertTab === 'customers' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Alert Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure alerts for customer-specific activities, lifecycle events, and opportunities.
                </p>
              </div>
              
              {/* Customer-specific alert categories */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="blue" className="text-sm px-3 py-1">
                        Customer Lifecycle
                      </Badge>
                      <span className="text-sm text-gray-600">3 alerts configured</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="green" className="text-sm px-3 py-1">
                        Customer Engagement
                      </Badge>
                      <span className="text-sm text-gray-600">2 alerts configured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Categories - Portfolio Tab */}
          {activeAlertTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Insights Alert Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure alerts for portfolio-level insights, performance metrics, and strategic opportunities.
                </p>
              </div>
              
              {/* Portfolio-specific alert categories */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="purple" className="text-sm px-3 py-1">
                        Portfolio Performance
                      </Badge>
                      <span className="text-sm text-gray-600">4 alerts configured</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="orange" className="text-sm px-3 py-1">
                        Market Intelligence
                      </Badge>
                      <span className="text-sm text-gray-600">2 alerts configured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Smart Cross Sell Settings Tab */}
      {activeTab === 'smartcrosssell' && (
        <div className="mx-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900">Smart Cross Sell Settings</h1>
              <Button 
                variant="outline" 
                className="text-gray-600 hover:text-gray-800"
                onClick={() => {}}
              >
                <Code className="h-4 w-4 mr-2" />
                Export Templates
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure predefined analysis templates for AI-powered cross-sell recommendations across different entity types and seasonal trends.
            </p>
          </div>

          {/* Smart Cross Sell Sub-tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveSmartCrossSellTab('partners')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeSmartCrossSellTab === 'partners'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Partners
              </button>
              <button
                onClick={() => setActiveSmartCrossSellTab('customers')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeSmartCrossSellTab === 'customers'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveSmartCrossSellTab('portfolio')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeSmartCrossSellTab === 'portfolio'
                    ? 'border-b-2 border-[#5567E5] text-[#5567E5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Portfolio Insights
              </button>
            </div>
          </div>

          {/* Smart Cross Sell Analysis Templates - Partners Tab */}
          {activeSmartCrossSellTab === 'partners' && (
            <div className="space-y-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Partner Analysis Templates</h3>
                  <p className="text-sm text-gray-600">
                    Configure predefined analysis templates for partner-specific cross-sell opportunities and seasonal trends.
                  </p>
                </div>
                <Button 
                  className="bg-[#5567E5] hover:bg-[#4451c7]"
                  onClick={() => {
                    setSmartCrossSellTemplateType('crosssell');
                    setCreateSmartCrossSellDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
              
              {/* Customer Cross-Sell Opportunities Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Partner Cross-Sell Opportunities</h4>
                        <p className="text-sm text-gray-600">Identify upsell potential in partner customer base</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 1,
                          name: 'Partner Cross-Sell Opportunities',
                          type: 'crosssell',
                          entityType: 'partners',
                          analysisFocus: 'Partner portfolio analysis',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'Partner relationships, customer data',
                          updateFrequency: 'Weekly'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Partner portfolio analysis</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">Partner relationships, customer data</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Weekly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summer Trending Products Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Summer Trending Products</h4>
                        <p className="text-sm text-gray-600">Top 3 seasonal insurance products for summer 2025</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 2,
                          name: 'Summer Trending Products',
                          type: 'trending',
                          entityType: 'partners',
                          analysisFocus: 'Seasonal market trends',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'Market intelligence, seasonal patterns',
                          updateFrequency: 'Monthly'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Seasonal market trends</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">Market intelligence, seasonal patterns</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Monthly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Analysis Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Custom Analysis</h4>
                        <p className="text-sm text-gray-600">Tailored cross-sell insights with custom prompting</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 3,
                          name: 'Custom Analysis',
                          type: 'custom',
                          entityType: 'partners',
                          analysisFocus: 'Custom prompting system',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'All available data sources',
                          updateFrequency: 'On-demand'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Custom prompting system</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">All available data sources</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">On-demand</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Cross Sell Analysis Templates - Customers Tab */}
          {activeSmartCrossSellTab === 'customers' && (
            <div className="space-y-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Analysis Templates</h3>
                  <p className="text-sm text-gray-600">
                    Configure predefined analysis templates for customer-specific cross-sell opportunities and lifecycle events.
                  </p>
                </div>
                <Button 
                  className="bg-[#5567E5] hover:bg-[#4451c7]"
                  onClick={() => {
                    setSmartCrossSellTemplateType('crosssell');
                    setCreateSmartCrossSellDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
              
              {/* Customer Cross-Sell Opportunities Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Cross-Sell Opportunities</h4>
                        <p className="text-sm text-gray-600">Identify upsell potential in existing customer base</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 4,
                          name: 'Customer Cross-Sell Opportunities',
                          type: 'crosssell',
                          entityType: 'customers',
                          analysisFocus: 'Customer lifecycle analysis',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'Customer history, product portfolio',
                          updateFrequency: 'Daily'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Customer lifecycle analysis</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">Customer history, product portfolio</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Daily</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summer Trending Products Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Seasonal Trends</h4>
                        <p className="text-sm text-gray-600">Seasonal product recommendations for individual customers</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 5,
                          name: 'Customer Seasonal Trends',
                          type: 'trending',
                          entityType: 'customers',
                          analysisFocus: 'Customer seasonal behavior',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'Customer preferences, seasonal data',
                          updateFrequency: 'Seasonal'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Customer seasonal behavior</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">Customer preferences, seasonal data</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Seasonal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Analysis Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Custom Customer Analysis</h4>
                        <p className="text-sm text-gray-600">Personalized insights with custom prompting</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 6,
                          name: 'Custom Customer Analysis',
                          type: 'custom',
                          entityType: 'customers',
                          analysisFocus: 'Custom customer insights',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'All customer data sources',
                          updateFrequency: 'On-demand'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Custom customer insights</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">All customer data sources</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">On-demand</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Cross Sell Analysis Templates - Portfolio Tab */}
          {activeSmartCrossSellTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Analysis Templates</h3>
                <p className="text-sm text-gray-600">
                  Configure predefined analysis templates for portfolio-level cross-sell opportunities and market intelligence.
                </p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <div></div>
                <Button 
                  className="bg-[#5567E5] hover:bg-[#4451c7]"
                  onClick={() => {
                    setSmartCrossSellTemplateType('crosssell');
                    setCreateSmartCrossSellDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
              
              {/* Portfolio Cross-Sell Opportunities Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Portfolio Cross-Sell Opportunities</h4>
                        <p className="text-sm text-gray-600">Identify upsell potential across entire portfolio</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 7,
                          name: 'Portfolio Cross-Sell Opportunities',
                          type: 'crosssell',
                          entityType: 'portfolio',
                          analysisFocus: 'Portfolio-wide analysis',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'All portfolio data, market trends',
                          updateFrequency: 'Weekly'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Portfolio-wide analysis</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">All portfolio data, market trends</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Weekly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summer Trending Products Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Market Trending Products</h4>
                        <p className="text-sm text-gray-600">Top seasonal insurance products for portfolio optimization</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 8,
                          name: 'Market Trending Products',
                          type: 'trending',
                          entityType: 'portfolio',
                          analysisFocus: 'Market trend analysis',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'Market intelligence, portfolio data',
                          updateFrequency: 'Monthly'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Market trend analysis</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">Market intelligence, portfolio data</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">Monthly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Analysis Template */}
              <div className="border border-[#E6E7F1] rounded-lg bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Custom Portfolio Analysis</h4>
                        <p className="text-sm text-gray-600">Strategic insights with custom prompting</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSmartCrossSellTemplate({
                          id: 9,
                          name: 'Custom Portfolio Analysis',
                          type: 'custom',
                          entityType: 'portfolio',
                          analysisFocus: 'Custom portfolio insights',
                          aiModel: 'GPT-4o Enhanced',
                          dataSources: 'All portfolio data sources',
                          updateFrequency: 'On-demand'
                        });
                        setConfigureSmartCrossSellDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Analysis Focus:</span>
                      <span className="ml-2 text-gray-900">Custom portfolio insights</span>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <span className="ml-2 text-gray-900">GPT-4o Enhanced</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Sources:</span>
                      <span className="ml-2 text-gray-900">All portfolio data sources</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="ml-2 text-gray-900">On-demand</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Edit Alert Wizard Dialog */}
      <Dialog open={editAlertDialogOpen} onOpenChange={setEditAlertDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Alert
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Configure the alert settings, automation, messaging, and visual appearance.
            </p>
          </DialogHeader>
          
          {/* Step Navigation */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200 pb-4">
            {['Basic Settings', 'AI & Automation', 'Visual Settings', 'Preview'].map((step, index) => (
              <Button
                key={step}
                variant={editAlertStep === index ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditAlertStep(index)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  editAlertStep === index
                    ? 'bg-[#5567E5] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {step}
              </Button>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {editAlertStep === 0 && (
              <div className="space-y-6">
                <div className="text-lg font-semibold text-[#282A3F]">Basic Settings</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Alert Name</label>
                    <Input 
                      value={selectedAlert?.name || ''}
                      onChange={(e) => setSelectedAlert(prev => ({...prev, name: e.target.value}))}
                      placeholder="Expired Policies Alert"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Alert Title</label>
                    <Input 
                      value={selectedAlert?.title || ''}
                      onChange={(e) => setSelectedAlert(prev => ({...prev, title: e.target.value}))}
                      placeholder="Expired Policies Alert"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message Template</label>
                  <Input 
                    value={selectedAlert?.message || ''}
                    onChange={(e) => setSelectedAlert(prev => ({...prev, message: e.target.value}))}
                    placeholder="(count) policies expired"
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    Available variables: {'{count}, {amount}, {category}, {coverage}, {date}, {timeframe}'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description Template</label>
                  <Textarea 
                    value={selectedAlert?.description || ''}
                    onChange={(e) => setSelectedAlert(prev => ({...prev, description: e.target.value}))}
                    placeholder="(count) {category} policies have expired (latest expiry: {date}). Immediate renewal needed to avoid uninsured liabilities."
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {editAlertStep === 1 && (
              <div className="space-y-6">
                <div className="text-lg font-semibold text-[#282A3F]">AI & Automation Settings</div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Automation Type</label>
                    <Select value={selectedAlert?.type || 'custom_script'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, type: value}))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_generated">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            AI-Generated
                          </div>
                        </SelectItem>
                        <SelectItem value="custom_script">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Custom Script
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Use custom queries or scripts
                    </p>
                  </div>

                  {selectedAlert?.type === 'custom_script' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Custom Query/Script</label>
                      <Textarea 
                        value={selectedAlert?.customScript || ''}
                        onChange={(e) => setSelectedAlert(prev => ({...prev, customScript: e.target.value}))}
                        placeholder="SELECT * FROM policies WHERE category = 'Schade Zakelijk' AND expiry_date < CURRENT_DATE AND status != 'renewed'"
                        rows={4}
                        className="bg-white font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Use SQL for database queries, or specify API endpoints and custom logic.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Data Source</label>
                      <Select value={selectedAlert?.dataSource || 'Policy Database'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, dataSource: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Policy Database">Policy Database</SelectItem>
                          <SelectItem value="Customer Database">Customer Database</SelectItem>
                          <SelectItem value="Portfolio Database">Portfolio Database</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Check Frequency</label>
                      <Select value={selectedAlert?.frequency || 'real-time'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, frequency: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Trigger Conditions</label>
                    <Input 
                      value={selectedAlert?.triggerConditions || ''}
                      onChange={(e) => setSelectedAlert(prev => ({...prev, triggerConditions: e.target.value}))}
                      placeholder="expiry_date < today() AND status = 'active'"
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500">
                      Define the specific conditions that should trigger this alert.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {editAlertStep === 2 && (
              <div className="space-y-6">
                <div className="text-lg font-semibold text-[#282A3F]">Visual Settings</div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Icon</label>
                      <Select value={selectedAlert?.icon || 'Clock'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, icon: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clock">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Clock
                            </div>
                          </SelectItem>
                          <SelectItem value="Bell">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              Bell
                            </div>
                          </SelectItem>
                          <SelectItem value="AlertTriangle">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Alert Triangle
                            </div>
                          </SelectItem>
                          <SelectItem value="TrendingUp">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Trending Up
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Severity</label>
                      <Select value={selectedAlert?.severity || 'critical'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, severity: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-400 rounded-full" />
                              Low
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                              Medium
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-400 rounded-full" />
                              High
                            </div>
                          </SelectItem>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-400 rounded-full" />
                              Critical
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Background Color</label>
                      <Select value={selectedAlert?.backgroundColor || 'Red Light'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, backgroundColor: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Red Light">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
                              Red Light
                            </div>
                          </SelectItem>
                          <SelectItem value="Yellow Light">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded" />
                              Yellow Light
                            </div>
                          </SelectItem>
                          <SelectItem value="Green Light">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
                              Green Light
                            </div>
                          </SelectItem>
                          <SelectItem value="Blue Light">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded" />
                              Blue Light
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Border Color</label>
                      <Select value={selectedAlert?.borderColor || 'Red Border'} onValueChange={(value) => setSelectedAlert(prev => ({...prev, borderColor: value}))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Red Border">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border-2 border-red-200 rounded" />
                              Red Border
                            </div>
                          </SelectItem>
                          <SelectItem value="Yellow Border">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border-2 border-yellow-200 rounded" />
                              Yellow Border
                            </div>
                          </SelectItem>
                          <SelectItem value="Green Border">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border-2 border-green-200 rounded" />
                              Green Border
                            </div>
                          </SelectItem>
                          <SelectItem value="Blue Border">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border-2 border-blue-200 rounded" />
                              Blue Border
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Enabled</span>
                    <p className="text-xs text-gray-500">Toggle alert activation</p>
                  </div>
                  <Toggle 
                    pressed={selectedAlert?.enabled || false}
                    onPressedChange={(pressed) => setSelectedAlert(prev => ({...prev, enabled: pressed}))}
                  />
                </div>
              </div>
            )}

            {editAlertStep === 3 && (
              <div className="space-y-6">
                <div className="text-lg font-semibold text-[#282A3F]">Preview</div>
                
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">Alert Card Preview</div>
                  
                  {/* Alert Preview */}
                  <div className={`border border-[#E6E7F1] rounded-lg p-4 ${
                    selectedAlert?.backgroundColor === 'Red Light' ? 'bg-red-50' :
                    selectedAlert?.backgroundColor === 'Yellow Light' ? 'bg-yellow-50' :
                    selectedAlert?.backgroundColor === 'Green Light' ? 'bg-green-50' :
                    'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedAlert?.backgroundColor === 'Red Light' ? 'bg-red-100' :
                          selectedAlert?.backgroundColor === 'Yellow Light' ? 'bg-yellow-100' :
                          selectedAlert?.backgroundColor === 'Green Light' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          {selectedAlert?.icon === 'Clock' && <Clock className={`h-4 w-4 ${
                            selectedAlert?.backgroundColor === 'Red Light' ? 'text-red-600' :
                            selectedAlert?.backgroundColor === 'Yellow Light' ? 'text-yellow-600' :
                            selectedAlert?.backgroundColor === 'Green Light' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />}
                          {selectedAlert?.icon === 'Bell' && <Bell className={`h-4 w-4 ${
                            selectedAlert?.backgroundColor === 'Red Light' ? 'text-red-600' :
                            selectedAlert?.backgroundColor === 'Yellow Light' ? 'text-yellow-600' :
                            selectedAlert?.backgroundColor === 'Green Light' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />}
                          {selectedAlert?.icon === 'AlertTriangle' && <AlertTriangle className={`h-4 w-4 ${
                            selectedAlert?.backgroundColor === 'Red Light' ? 'text-red-600' :
                            selectedAlert?.backgroundColor === 'Yellow Light' ? 'text-yellow-600' :
                            selectedAlert?.backgroundColor === 'Green Light' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />}
                          {selectedAlert?.icon === 'TrendingUp' && <TrendingUp className={`h-4 w-4 ${
                            selectedAlert?.backgroundColor === 'Red Light' ? 'text-red-600' :
                            selectedAlert?.backgroundColor === 'Yellow Light' ? 'text-yellow-600' :
                            selectedAlert?.backgroundColor === 'Green Light' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedAlert?.title || 'Alert Title'}</h3>
                          <p className="text-sm text-gray-600">{selectedAlert?.message || 'Alert message'}</p>
                        </div>
                        <Badge variant="green" className="text-xs px-2 py-1">
                          {selectedAlert?.type === 'custom_script' ? 'Custom Script' : 'AI-Generated'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedAlert?.type === 'custom_script' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Custom Query Preview</div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Custom Query/Script</span>
                        </div>
                        <pre className="text-xs text-green-700 whitespace-pre-wrap">
                          {selectedAlert?.customScript || 'No custom script defined'}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Configuration Summary:</div>
                      <div className="text-gray-600">• Automation: {selectedAlert?.type === 'custom_script' ? 'Custom Script' : 'AI-Generated'}</div>
                      <div className="text-gray-600">• Frequency: {selectedAlert?.frequency || 'Real-time'}</div>
                      <div className="text-gray-600">• Data Source: {selectedAlert?.dataSource || 'Policy Database'}</div>
                      <div className="text-gray-600">• Severity: {selectedAlert?.severity || 'Critical'} priority</div>
                      <div className="text-gray-600">• Status: {selectedAlert?.enabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Visual Style:</div>
                      <div className="text-gray-600">• Icon: {selectedAlert?.icon || 'Clock'}</div>
                      <div className="text-gray-600">• Background: {selectedAlert?.backgroundColor || 'Red Light'}</div>
                      <div className="text-gray-600">• Border: {selectedAlert?.borderColor || 'Red Border'}</div>
                      <div className="text-gray-600">• Category: {selectedAlert?.category || 'Schade Zakelijk'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditAlertDialogOpen(false);
                setSelectedAlert(null);
                setEditAlertStep(0);
              }}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {editAlertStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setEditAlertStep(editAlertStep - 1)}
                >
                  Previous
                </Button>
              )}
              {editAlertStep < 3 ? (
                <Button 
                  onClick={() => setEditAlertStep(editAlertStep + 1)}
                  className="bg-[#5567E5] hover:bg-[#4451c7]"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    // Save alert logic here
                    toast({
                      title: "Alert Updated",
                      description: "Alert configuration has been saved successfully.",
                    });
                    setEditAlertDialogOpen(false);
                    setSelectedAlert(null);
                    setEditAlertStep(0);
                  }}
                  className="bg-[#5567E5] hover:bg-[#4451c7]"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Smart Cross Sell Template Dialog */}
      <Dialog open={createSmartCrossSellDialogOpen} onOpenChange={setCreateSmartCrossSellDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">Create New Smart Cross Sell Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            setCreateSmartCrossSellDialogOpen(false);
          }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Template Name</label>
                <Input 
                  name="name" 
                  placeholder="Enter template name" 
                  className="mt-1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Template Type</label>
                <Select defaultValue={smartCrossSellTemplateType} onValueChange={setSmartCrossSellTemplateType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crosssell">Cross-Sell Opportunities</SelectItem>
                    <SelectItem value="trending">Summer Trending Products</SelectItem>
                    <SelectItem value="custom">Custom Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Entity Type</label>
                <Select defaultValue={activeSmartCrossSellTab}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partners">Partners</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="portfolio">Portfolio Insights</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Analysis Focus</label>
                <Input 
                  name="analysisFocus" 
                  placeholder="e.g., Customer lifecycle analysis" 
                  className="mt-1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">AI Model</label>
                <Select defaultValue="gpt-4o-enhanced">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-enhanced">GPT-4o Enhanced</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Data Sources</label>
                <Input 
                  name="dataSources" 
                  placeholder="e.g., Customer history, product portfolio" 
                  className="mt-1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Update Frequency</label>
                <Select defaultValue="weekly">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select update frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="on-demand">On-demand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#282A3F]">Description</label>
                <Textarea 
                  name="description" 
                  placeholder="Enter template description" 
                  className="mt-1" 
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateSmartCrossSellDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5567E5] hover:bg-[#4451c7]">
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configure Smart Cross Sell Template Dialog */}
      <Dialog open={configureSmartCrossSellDialogOpen} onOpenChange={setConfigureSmartCrossSellDialogOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">
              Configure {selectedSmartCrossSellTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedSmartCrossSellTemplate && (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedSmartCrossSellTemplate.type === 'crosssell' ? 'bg-blue-100' :
                    selectedSmartCrossSellTemplate.type === 'trending' ? 'bg-orange-100' : 'bg-purple-100'
                  }`}>
                    {selectedSmartCrossSellTemplate.type === 'crosssell' && <Target className="h-5 w-5 text-blue-600" />}
                    {selectedSmartCrossSellTemplate.type === 'trending' && <TrendingUp className="h-5 w-5 text-orange-600" />}
                    {selectedSmartCrossSellTemplate.type === 'custom' && <Brain className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedSmartCrossSellTemplate.name}</h4>
                    <p className="text-sm text-gray-600">{selectedSmartCrossSellTemplate.entityType.charAt(0).toUpperCase() + selectedSmartCrossSellTemplate.entityType.slice(1)} Analysis Template</p>
                  </div>
                </div>
              </div>

              {/* Configuration Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button className="border-b-2 border-[#5567E5] text-[#5567E5] py-2 px-1 text-sm font-medium">
                    Basic Settings
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                    AI Configuration
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                    Data Sources
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                    Advanced Options
                  </button>
                </nav>
              </div>

              {/* Basic Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#282A3F]">Template Name</label>
                    <Input 
                      defaultValue={selectedSmartCrossSellTemplate.name}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#282A3F]">Analysis Focus</label>
                    <Input 
                      defaultValue={selectedSmartCrossSellTemplate.analysisFocus}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#282A3F]">AI Model</label>
                    <Select defaultValue="gpt-4o-enhanced">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-enhanced">GPT-4o Enhanced</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#282A3F]">Update Frequency</label>
                    <Select defaultValue={selectedSmartCrossSellTemplate.updateFrequency.toLowerCase()}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="on-demand">On-demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#282A3F]">Data Sources</label>
                  <Input 
                    defaultValue={selectedSmartCrossSellTemplate.dataSources}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#282A3F]">Custom Prompt (Optional)</label>
                  <Textarea 
                    placeholder="Enter custom AI prompt for enhanced analysis..."
                    className="mt-1" 
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setConfigureSmartCrossSellDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#5567E5] hover:bg-[#4451c7]">
                  Save Configuration
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}