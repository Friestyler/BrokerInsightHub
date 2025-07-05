import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, Search } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { IframeHeader } from "@/components/iframe/IframeHeader";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("list");

  // Product search and filtering state - EXACT MIRROR
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // Fetch all partners to find this specific partner - EXACT same as main app
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch related products for this partner - EXACT same as main app
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/partners/${id}/products`],
    enabled: !!id,
  });

  // Fetch users for collaborators - EXACT same as main app
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  if (!id) {
    return <div className="p-6">Partner ID not found</div>;
  }

  if (partnersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Find the current partner - EXACT same logic as main app
  const partner = (partners as any[] || []).find((p: any) => p.id === parseInt(id || '1'));

  if (!partner) {
    return <div className="p-6">Partner not found</div>;
  }

  const handleCreateOpportunity = () => {
    // Handle create opportunity
  };

  const renderProductListTab = () => {
    return (
      <div className="iframe-container" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', overflow: 'visible' }}>
        <div className="space-y-4">
          {/* List Toolbar - EXACT MIRROR of screenshot */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Lists</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={productSearchText}
                  onChange={(e) => setProductSearchText(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              
              {/* Filters */}
              <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Life">Life</SelectItem>
                  <SelectItem value="Non-Life">Non-Life</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  <SelectItem value="€0 - €50K">€0 - €50K</SelectItem>
                  <SelectItem value="€50K - €100K">€50K - €100K</SelectItem>
                  <SelectItem value="€100K+">€100K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products List Content - EXACT MIRROR */}
          <div className="space-y-6">
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Products ({
                    relatedProducts.filter((product: any) => {
                      const matchesSearch = !productSearchText || 
                        product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                        product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                        product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                      
                      const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                      
                      const matchesPrice = !selectedPriceRange || (() => {
                        const price = parseFloat(product.price || '0');
                        switch(selectedPriceRange) {
                          case '€0 - €50K': return price >= 0 && price <= 50000;
                          case '€50K - €100K': return price > 50000 && price <= 100000;
                          case '€100K+': return price > 100000;
                          default: return true;
                        }
                      })();
                      
                      return matchesSearch && matchesCategory && matchesPrice;
                    }).length
                  })</h3>
                  <p className="text-sm text-gray-600 mt-1">Products associated with this partner</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 group">
                          <div className="transition-opacity opacity-0 group-hover:opacity-100">
                            <Checkbox />
                          </div>
                        </TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedProducts
                        .filter((product: any) => {
                          const matchesSearch = !productSearchText || 
                            product.name?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                            product.description?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                            product.sku?.toLowerCase().includes(productSearchText.toLowerCase());
                          
                          const matchesCategory = !selectedProductCategory || product.category === selectedProductCategory;
                          
                          const matchesPrice = !selectedPriceRange || (() => {
                            const price = parseFloat(product.price || '0');
                            switch(selectedPriceRange) {
                              case '€0 - €50K': return price >= 0 && price <= 50000;
                              case '€50K - €100K': return price > 50000 && price <= 100000;
                              case '€100K+': return price > 100000;
                              default: return true;
                            }
                          })();
                          
                          return matchesSearch && matchesCategory && matchesPrice;
                        })
                        .map((product: any) => (
                          <TableRow key={product.id} className="group hover:bg-gray-50">
                            <TableCell>
                              <div className="transition-opacity opacity-0 group-hover:opacity-100">
                                <Checkbox />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold text-gray-900">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {product.category}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {product.sku || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {product.price ? `€${parseFloat(product.price).toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">No products are currently associated with this partner.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="iframe-container" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', overflow: 'visible' }}>
      <div className="p-6">
        {/* Header with entity info and collaborators */}
        <IframeHeader
          entityType="partner" 
          entityId={id}
          entityName={partner.name}
          entityDescription={partner.description}
          onCreateOpportunity={handleCreateOpportunity}
          users={users}
        />

        {/* Activity Hub */}
        <div className="py-4">
          <PartnerActivityHub
            partnerId={parseInt(id)}
            partnerName={partner.name}
          />
        </div>

        {/* Main Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab("products")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products (0)
            </button>
            <button 
              onClick={() => setActiveTab("customers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customers" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Customers (1)
            </button>
            <button 
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Opportunities (0)
            </button>
            <button 
              onClick={() => setActiveTab("okr")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "okr" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              OKR plans
            </button>
          </nav>
        </div>

        {/* Products Tab Content */}
        {activeTab === "products" && (
          <div className="py-4">
            {/* Product Sub-tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button 
                  onClick={() => setActiveProductTab("overview")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeProductTab === "overview" 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveProductTab("matrix")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeProductTab === "matrix" 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Matrix
                </button>
                <button 
                  onClick={() => setActiveProductTab("list")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeProductTab === "list" 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  List
                </button>
              </nav>
            </div>

            {/* Sub-tab Content */}
            {activeProductTab === "overview" && (
              <PortfolioOverviewTab 
                partnerId={parseInt(id)} 
                partnerName={partner.name}
              />
            )}
            
            {activeProductTab === "matrix" && (
              <div className="text-center py-12">
                <p className="text-gray-500">Matrix view coming soon</p>
              </div>
            )}
            
            {activeProductTab === "list" && renderProductListTab()}
          </div>
        )}

        {/* Other tab contents as placeholders */}
        {activeTab === "customers" && (
          <div className="text-center py-12">
            <p className="text-gray-500">Customers view</p>
          </div>
        )}
        
        {activeTab === "opportunities" && (
          <div className="text-center py-12">
            <p className="text-gray-500">Opportunities view</p>
          </div>
        )}
        
        {activeTab === "okr" && (
          <div className="text-center py-12">
            <p className="text-gray-500">OKR plans view</p>
          </div>
        )}
      </div>
    </div>
  );
}