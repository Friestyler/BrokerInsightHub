import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  
  // Dropdown states - EXACT MIRROR from PartnerDetail
  const [showProductListsDropdown, setShowProductListsDropdown] = useState(false);
  const [showProductViewsDropdown, setShowProductViewsDropdown] = useState(false);

  // Bulk actions state - EXACT MIRROR from PartnerDetail
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSaveToListModal, setShowSaveToListModal] = useState(false);
  const [listNameInput, setListNameInput] = useState("");
  const [listDescriptionInput, setListDescriptionInput] = useState("");

  // Bulk action handlers - EXACT MIRROR from PartnerDetail
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      setShowBulkActions(updated.length > 0);
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (!assignedProducts) return;
    const allProductIds = assignedProducts.map((product: any) => product.id?.toString());
    setSelectedProducts(allProductIds);
    setShowBulkActions(allProductIds.length > 0);
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  const handleSaveToList = async () => {
    // Implementation for saving to list
    console.log('Save to list:', selectedProducts);
    setShowSaveToListModal(false);
    handleClearSelection();
  };

  // Fetch all partners to find this specific partner - EXACT same as main app
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch assigned products for this partner - EXACT same as main app
  const { data: assignedProducts, isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/degoudse/partners/${id}/product-assignments`],
    enabled: !!id
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
        {/* Enhanced unified toolbar - Products version - EXACT MIRROR from PartnerDetail */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row with saved lists and views */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Left side - Saved Lists with actions */}
              <div className="flex items-center gap-3">
                {/* Lists heading */}
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
                </div>
                {/* Saved Lists dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                    onClick={() => setShowProductListsDropdown(!showProductListsDropdown)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                      <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                    </svg>
                    <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      All products
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`transition-transform ${showProductListsDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu */}
                  {showProductListsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="p-2">
                        {/* Default "All products" option */}
                        <button
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] bg-[#E1E4FB] text-[#3E4DC4]"
                          onClick={() => {
                            setShowProductListsDropdown(false);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <span>All products</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bottom row with search, views, and filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-grow">
                {/* Search field */}
                <div className="relative w-60">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchText}
                    onChange={(e) => setProductSearchText(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Saved Views Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowProductViewsDropdown(!showProductViewsDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-gray-700">Select a view</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`transition-transform ${showProductViewsDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                
                {/* Filters */}
                <div className="relative">
                  <button className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span className="text-gray-700">Category</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
                
                <div className="relative">
                  <button className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span className="text-gray-700">Price Range</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar - EXACT MIRROR from PartnerDetail */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Clear selection
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setShowSaveToListModal(true)}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Add to list
              </Button>
            </div>
          </div>
        )}

        {/* Products Content - EXACT MIRROR */}
        {assignmentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : assignedProducts && Array.isArray(assignedProducts) && assignedProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 group">
                    <div className="transition-opacity opacity-0 group-hover:opacity-100">
                      <Checkbox 
                        checked={assignedProducts && selectedProducts.length === assignedProducts.length && assignedProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead className="text-right">Premium Value</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedProducts
                  .filter((product: any) => {
                    const matchesSearch = !productSearchText || 
                      product.productName?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                      product.productDescription?.toLowerCase().includes(productSearchText.toLowerCase()) ||
                      product.productId?.toString().toLowerCase().includes(productSearchText.toLowerCase());
                    
                    return matchesSearch;
                  })
                  .map((product: any) => (
                    <TableRow key={product.id} className="group hover:bg-gray-50">
                      <TableCell>
                        <div className="transition-opacity opacity-0 group-hover:opacity-100">
                          <Checkbox 
                            checked={selectedProducts.includes(product.id?.toString())}
                            onCheckedChange={() => handleSelectProduct(product.id?.toString())}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-gray-900">{product.productName}</div>
                          {product.productDescription && (
                            <div className="text-sm text-gray-500 mt-1">{product.productDescription}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.categoryName && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.categoryName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {product.productId || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.premiumValue ? `€${parseFloat(product.premiumValue).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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

      {/* Save to List Modal - EXACT MIRROR from PartnerDetail */}
      <Dialog open={showSaveToListModal} onOpenChange={setShowSaveToListModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="list-name" className="text-right">
                Name
              </label>
              <Input
                id="list-name"
                value={listNameInput}
                onChange={(e) => setListNameInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter list name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="list-description" className="text-right">
                Description
              </label>
              <Textarea
                id="list-description"
                value={listDescriptionInput}
                onChange={(e) => setListDescriptionInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter list description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveToListModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToList}>Save List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}