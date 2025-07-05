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
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
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
      setShowBulkActions(updated.length > 0 || selectedCustomers.length > 0);
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (!assignedProducts) return;
    const allProductIds = assignedProducts.map((product: any) => product.id?.toString());
    setSelectedProducts(allProductIds);
    setShowBulkActions(allProductIds.length > 0 || selectedCustomers.length > 0);
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
    setSelectedCustomers([]);
    setShowBulkActions(false);
  };

  const handleSaveToList = async () => {
    // Implementation for saving to list - handles both products and customers
    console.log('Save to list:', { 
      products: selectedProducts, 
      customers: selectedCustomers,
      listName: listNameInput,
      listDescription: listDescriptionInput
    });
    setShowSaveToListModal(false);
    handleClearSelection();
  };

  // Customer selection handlers - EXACT MIRROR from PartnerDetail
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      const updated = prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId];
      setShowBulkActions(updated.length > 0 || selectedProducts.length > 0);
      return updated;
    });
  };

  const handleSelectAllCustomers = () => {
    if (!relatedCustomers || !Array.isArray(relatedCustomers)) return;
    
    const allIds = relatedCustomers.map((customer: any) => customer.id.toString());
    const allSelected = allIds.every((id: string) => selectedCustomers.includes(id));
    
    if (allSelected) {
      setSelectedCustomers([]);
      setShowBulkActions(selectedProducts.length > 0);
    } else {
      setSelectedCustomers(allIds);
      setShowBulkActions(true);
    }
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

  // Fetch related customers for this partner - EXACT same as main app
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
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

        {/* Customers tab - EXACT MIRROR from PartnerDetail */}
        {activeTab === "customers" && (
          <div className="iframe-container space-y-4" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', overflow: 'visible' }}>
            {/* Enhanced unified toolbar - Customers version - EXACT MIRROR from PartnerDetail */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="space-y-4">
                {/* Action buttons and quick filters row */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap items-center gap-3 flex-grow">
                    {/* Search field */}
                    <div className="relative w-60">
                      <Input
                        type="text"
                        placeholder="Search customers..."
                        value={""}
                        onChange={(e) => {}}
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
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Select a view</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="relative">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Status
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Industry Filter */}
                    <div className="relative">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Industry
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export
                    </Button>
                    <Button className="bg-[#5567E5] hover:bg-[#4556D4]" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      New
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk actions bar - Appears when customers are selected */}
            {selectedCustomers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600"
                      onClick={handleClearSelection}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      Clear selection
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-indigo-600"
                      onClick={() => setShowSaveToListModal(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Add to list
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Overview - EXACT MIRROR from PartnerDetail */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                // Get filtered customers based on current filters
                const filteredCustomers = (relatedCustomers as any[] || []);
                
                // Calculate statistics
                const totalCustomers = filteredCustomers.length;
                const totalOpportunities = 0; // Will be calculated from opportunities data
                const totalValue = 0; // Will be calculated from opportunities data
                const weightedValue = 0; // Will be calculated from opportunities data

                return (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
                      <div className="text-sm text-gray-500">Total Customers</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">{totalOpportunities}</div>
                      <div className="text-sm text-gray-500">Total Opportunities</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">€{weightedValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Weighted Value</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Customer Table - EXACT same structure as main app */}
            <div className="bg-white rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" style={{ color: '#696C8C' }}>
                      <Checkbox
                        checked={relatedCustomers && Array.isArray(relatedCustomers) && 
                                 relatedCustomers.length > 0 && 
                                 relatedCustomers.every((customer: any) => 
                                   selectedCustomers.includes(customer.id.toString())
                                 )}
                        onCheckedChange={handleSelectAllCustomers}
                      />
                    </TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Industry</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Status</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Opportunities</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Total Value</TableHead>
                    <TableHead className="w-12" style={{ color: '#696C8C' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading customers...
                      </TableCell>
                    </TableRow>
                  ) : !relatedCustomers || !Array.isArray(relatedCustomers) || relatedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    relatedCustomers.map((customer: any) => (
                      <TableRow key={customer.id} className="group hover:bg-gray-50">
                        <TableCell>
                          <div className={`transition-opacity ${
                            selectedCustomers.includes(customer.id.toString()) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <Checkbox 
                              checked={selectedCustomers.includes(customer.id.toString())}
                              onCheckedChange={() => handleSelectCustomer(customer.id.toString())}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                            {customer.name || 'Unnamed Customer'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {customer.industry || 'Not specified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            customer.status === 'Prospect' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.status || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                            {customer.opportunities_count || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          €{customer.total_value ? Number(customer.total_value).toLocaleString() : '0'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {/* Opportunities tab - EXACT MIRROR from PartnerDetail */}
        {activeTab === "opportunities" && (
          <div className="iframe-container space-y-4" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', overflow: 'visible' }}>
            {/* Enhanced unified toolbar - Opportunities version - EXACT MIRROR from PartnerDetail */}
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
                        onClick={() => {}}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                          <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                        </svg>
                        <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                          All opportunities
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
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Right side - View selector and action buttons */}
                  <div className="flex items-center gap-3">
                    {/* Saved Views dropdown */}
                    <div className="relative">
                      <button 
                        className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Select a view</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Action buttons */}
                    <Button variant="outline" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export
                    </Button>
                    <Button className="bg-[#5567E5] hover:bg-[#4556D4]" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      New
                    </Button>
                  </div>
                </div>
                
                {/* Action buttons and quick filters row */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap items-center gap-3 flex-grow">
                    {/* Search field */}
                    <div className="relative w-60">
                      <Input
                        type="text"
                        placeholder="Search opportunities..."
                        value={""}
                        onChange={(e) => {}}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Stage Filter */}
                    <div className="relative">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Stage
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Customer Filter */}
                    <div className="relative">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Customer
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Account Manager Filter */}
                    <div className="relative">
                      <button 
                        className="flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Account Manager
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Overview - EXACT MIRROR from PartnerDetail */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                // Get filtered opportunities based on current filters
                const filteredOpportunities = [];
                
                // Calculate statistics
                const totalOpportunities = filteredOpportunities.length;
                const totalValue = 0;
                const weightedValue = 0;
                const conversionRate = 0;

                return (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">{totalOpportunities}</div>
                      <div className="text-sm text-gray-500">Total Opportunities</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">€{weightedValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Weighted Value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6E7F1]">
                      <div className="text-2xl font-bold text-gray-900">{conversionRate}%</div>
                      <div className="text-sm text-gray-500">Conversion Rate</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Opportunities Table - EXACT same structure as main app */}
            <div className="bg-white rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" style={{ color: '#696C8C' }}>
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                    </TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Opportunity</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Customer</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Stage</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Value</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Probability</TableHead>
                    <TableHead style={{ color: '#696C8C' }}>Close Date</TableHead>
                    <TableHead className="w-12" style={{ color: '#696C8C' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No opportunities found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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