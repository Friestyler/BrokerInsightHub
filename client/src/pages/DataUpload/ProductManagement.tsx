import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Package, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  colorCode: string;
  aiContext: string;
  createdAt: string;
}

const COLOR_OPTIONS = [
  { value: "#3B82F6", name: "Blue", class: "bg-blue-500" },
  { value: "#10B981", name: "Green", class: "bg-green-500" },
  { value: "#F59E0B", name: "Orange", class: "bg-orange-500" },
  { value: "#EF4444", name: "Red", class: "bg-red-500" },
  { value: "#8B5CF6", name: "Purple", class: "bg-purple-500" },
  { value: "#F97316", name: "Amber", class: "bg-amber-500" },
  { value: "#06B6D4", name: "Cyan", class: "bg-cyan-500" },
  { value: "#84CC16", name: "Lime", class: "bg-lime-500" },
  { value: "#EC4899", name: "Pink", class: "bg-pink-500" },
  { value: "#6B7280", name: "Gray", class: "bg-gray-500" }
];

const PRODUCT_CATEGORIES = [
  "Levensverzekering",
  "Schadeverzekering", 
  "Zorgverzekering",
  "Pensioenverzekering",
  "Bedrijfsverzekering",
  "Autoverzekering",
  "Woningverzekering",
  "Reisverzekering",
  "Andere"
];

interface ProductManagementProps {
  onProductsChange?: (products: Product[]) => void;
}

export default function ProductManagement({ onProductsChange }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    colorCode: "#3B82F6",
    aiContext: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/degoudse/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        onProductsChange?.(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editingProduct 
        ? `/api/degoudse/products/${editingProduct.id}` 
        : '/api/degoudse/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: editingProduct ? "Product Updated" : "Product Created",
          description: `${formData.name} has been ${editingProduct ? 'updated' : 'created'} successfully.`
        });
        
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          description: "",
          category: "",
          colorCode: "#3B82F6",
          aiContext: ""
        });
        
        loadProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      colorCode: product.colorCode,
      aiContext: product.aiContext
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/degoudse/products/${product.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Product Deleted",
          description: `${product.name} has been deleted successfully.`
        });
        loadProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      colorCode: "#3B82F6",
      aiContext: ""
    });
    setEditingProduct(null);
  };

  const getColorOption = (colorCode: string) => {
    return COLOR_OPTIONS.find(option => option.value === colorCode) || COLOR_OPTIONS[0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Product Management
              </CardTitle>
              <CardDescription>
                Manage your product catalog with color coding and AI context for intelligent mapping
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure product details and AI context for intelligent opportunity mapping
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Levensverzekering Premium"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="colorCode">Color Code</Label>
                    <Select 
                      value={formData.colorCode} 
                      onValueChange={(value) => setFormData({ ...formData, colorCode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-4 h-4 rounded ${getColorOption(formData.colorCode).class}`}
                            />
                            {getColorOption(formData.colorCode).name}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${color.class}`} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief product description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="aiContext">AI Context</Label>
                    <Textarea
                      id="aiContext"
                      value={formData.aiContext}
                      onChange={(e) => setFormData({ ...formData, aiContext: e.target.value })}
                      placeholder="Context information for AI to understand this product better..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingProduct ? 'Update' : 'Create'} Product
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No products defined yet.</p>
              <p className="text-sm">Add your first product to start mapping opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: product.colorCode }}
                        />
                        <h3 className="font-medium text-sm">{product.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs mb-2">
                      {product.category}
                    </Badge>
                    
                    {product.description && (
                      <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                    )}
                    
                    {product.aiContext && (
                      <div className="text-xs text-gray-500">
                        <Palette className="h-3 w-3 inline mr-1" />
                        AI Context available
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}