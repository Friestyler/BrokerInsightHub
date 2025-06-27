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
import { Plus, MoreVertical, Edit, Trash2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CategoryManagerForProducts from "@/components/CategoryManagerForProducts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductTemplate, InsertProductTemplate } from "@shared/schema";

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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to render categories hierarchically
  const renderCategoriesHierarchy = (categories: any[], level = 0): React.ReactElement[] => {
    const result: React.ReactElement[] = [];
    
    const rootCategories = categories.filter((cat: any) => !cat.parent_id);
    const getSubcategories = (parentId: number) => 
      categories.filter((cat: any) => cat.parent_id === parentId);
    
    const renderCategory = (category: any, currentLevel: number) => {
      result.push(
        <SelectItem key={category.id} value={category.name} level={currentLevel}>
          <div className="flex items-center">
            {category.name}
          </div>
        </SelectItem>
      );
      
      // Recursively render subcategories
      const subcategories = getSubcategories(category.id);
      subcategories.forEach(subcat => renderCategory(subcat, currentLevel + 1));
    };
    
    rootCategories.forEach(category => renderCategory(category, level));
    
    return result;
  };

  // Fetch product catalogue
  const { data: productTemplates = [], isLoading } = useQuery({
    queryKey: ['/api/product-catalogue'],
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });

  // Create product catalogue mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductTemplateFormData) => {
      return apiRequest('POST', '/api/product-catalogue', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-catalogue'] });
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
      return apiRequest('PUT', `/api/product-catalogue/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-catalogue'] });
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
      return apiRequest('DELETE', `/api/product-catalogue/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-catalogue'] });
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
      return apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setCreateCategoryDialogOpen(false);
      setCreateSubcategoryDialogOpen(false);
      setSelectedParentCategory(null);
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
      return apiRequest('PUT', `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditCategoryDialogOpen(false);
      setSelectedCategory(null);
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
      return apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
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
    
    // Category filter
    const matchesCategory = selectedCategoryFilter === "all" || 
      template.category === selectedCategoryFilter;
    
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

  // Helper functions for categories
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
    return categories.filter((cat: any) => cat.parent_id === parentId);
  };

  const getRootCategories = () => {
    return categories.filter((cat: any) => !cat.parent_id);
  };

  const getSubcategoryCount = (parentId: number) => {
    return categories.filter((cat: any) => cat.parent_id === parentId).length;
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
                    {renderCategoriesHierarchy(categories as any[])}
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
              Product template
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
        <div className="mx-4 py-6">
          <div className="flex items-center justify-between mb-6">
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

          {/* Badge-based Category Tree */}
          <div className="space-y-4">
            {getRootCategories().map((category: any) => (
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
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                      className="text-white border-0 text-sm font-medium px-3 py-1.5 cursor-pointer hover:opacity-90"
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
                        <span className="mr-2">{category.icon}</span>
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
                            <div className="flex items-center space-x-3 group">
                              {getSubcategoryCount(subcategory.id) > 0 ? (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                                    <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${
                                      expandedCategories.has(subcategory.id) ? 'rotate-90' : ''
                                    }`} />
                                  </Button>
                                </CollapsibleTrigger>
                              ) : (
                                <div className="w-3 h-3" />
                              )}
                              
                              <Badge 
                                style={{ backgroundColor: subcategory.color || category.color || '#3B82F6' }}
                                className="text-white border-0 text-sm px-3 py-1 cursor-pointer hover:opacity-90"
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
                                  <span className="mr-2">{subcategory.icon}</span>
                                )}
                                {subcategory.name}
                              </Badge>
                              
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                      style={{ backgroundColor: nestedSubcategory.color || subcategory.color || category.color || '#3B82F6' }}
                                      className="text-white border-0 text-xs px-2 py-1"
                                    >
                                      {nestedSubcategory.icon && (
                                        <span className="mr-1">{nestedSubcategory.icon}</span>
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
        <div className="mx-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Catalogue</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Product Catalogue</DialogTitle>
            </DialogHeader>
            {renderProductTemplateForm(createForm, (data) => createMutation.mutate(data))}
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="min-w-[200px]">
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {renderCategoriesHierarchy(categories as any[])}
              </SelectContent>
            </Select>
          </div>
          {selectedCategoryFilter !== "all" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCategoryFilter("all")}
            >
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? "No templates found matching your search." : "No product templates found. Create your first template to get started."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <div className={`transition-opacity ${
                      selectedTemplates.length > 0 ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <Checkbox 
                        checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTemplates(filteredTemplates.map((template: ProductTemplate) => template.id));
                          } else {
                            setSelectedTemplates([]);
                          }
                        }}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px] text-[#696C8C]">Product ID</TableHead>
                  <TableHead className="min-w-[200px] text-[#696C8C]">Name</TableHead>
                  <TableHead className="min-w-[250px] text-[#696C8C]">Description</TableHead>
                  <TableHead className="min-w-[150px] text-[#696C8C]">Category</TableHead>
                  <TableHead className="min-w-[120px] text-[#696C8C]">Provider</TableHead>
                  <TableHead className="min-w-[100px] text-[#696C8C]">Average Price</TableHead>
                  <TableHead className="min-w-[100px] text-[#696C8C]">Premium %</TableHead>
                  <TableHead className="min-w-[100px] text-[#696C8C]">Discount %</TableHead>
                  <TableHead className="w-12 text-[#696C8C]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template: ProductTemplate) => (
                  <TableRow 
                    key={template.id} 
                    className={`hover:bg-gray-50 ${
                      selectedTemplates.includes(template.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div className={`transition-opacity ${
                        selectedTemplates.includes(template.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Checkbox 
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTemplates([...selectedTemplates, template.id]);
                            } else {
                              setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 font-mono">
                        {template.productId || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {template.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-[250px] truncate">
                        {template.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.category ? (
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {template.providerName || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {template.averagePrice ? formatCurrency(template.averagePrice) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {template.premiumPercentage ? formatPercentage(template.premiumPercentage) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {template.discountPercentage ? formatPercentage(template.discountPercentage) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(template)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
    </div>
  );
}