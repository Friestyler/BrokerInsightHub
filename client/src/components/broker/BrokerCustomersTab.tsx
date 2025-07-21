import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, Bot, Copy, Users, Trash2, MoreHorizontal, MoreVertical, MessageSquare, MessageCircle, 
  CheckCircle, XCircle, Eye, Edit, Filter, Package, Target, Crown, ChevronDown, ChevronRight, 
  Share2, X, Bookmark, Columns3, Send, AlertTriangle, Plus, Mail, Calendar, Clock, Play, Pause, AlertCircle 
} from "lucide-react";
import { FieldsSelector } from "@/components/shared/FieldsSelector";
import EntityAvatar from "@/components/EntityAvatar";

interface BrokerCustomersTabProps {
  partnerId: string;
  environment: string;
}

export default function BrokerCustomersTab({ partnerId, environment }: BrokerCustomersTabProps) {
  const { toast } = useToast();
  
  // Core state management
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: 'All',
    industry: 'All',
    region: 'All',
    size: 'All'
  });
  
  // Saved lists and views state
  const [showSavedListsDropdown, setShowSavedListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [activeView, setActiveView] = useState<any>(null);
  const [isEditingList, setIsEditingList] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  
  // Fields visibility
  const [visibleFields, setVisibleFields] = useState({
    name: true,
    industry: true,
    region: true,
    contactPerson: true,
    phone: true,
    email: true,
    opportunities: true,
    totalValue: true,
    lastActivity: true,
    actions: true
  });
  
  // Change detection for views
  const [originalFilters, setOriginalFilters] = useState<any>(null);
  const [originalVisibleFields, setOriginalVisibleFields] = useState<any>(null);

  // Fields configuration for FieldsSelector
  const customerFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'industry', label: 'Industry' },
    { key: 'region', label: 'Region' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'totalValue', label: 'Total Value' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'actions', label: 'Actions', required: true }
  ];
  
  // Data fetching
  const { data: allCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers', environment, partnerId],
    staleTime: 5 * 60 * 1000
  });
  
  const { data: savedLists } = useQuery({
    queryKey: ['/api/saved-lists', environment],
    staleTime: 5 * 60 * 1000
  });
  
  const { data: savedViews } = useQuery({
    queryKey: ['/api/saved-views', environment],
    staleTime: 5 * 60 * 1000
  });
  
  // Helper functions
  const hasChanges = () => {
    if (!originalFilters || !originalVisibleFields) return false;
    return JSON.stringify(filters) !== JSON.stringify(originalFilters) ||
           JSON.stringify(visibleFields) !== JSON.stringify(originalVisibleFields);
  };
  
  const filteredCustomers = allCustomers?.data?.filter((customer: any) => {
    const matchesSearch = !searchText || 
      customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.contact_person?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = filters.status === 'All' || customer.status === filters.status;
    const matchesIndustry = filters.industry === 'All' || customer.industry === filters.industry;
    const matchesRegion = filters.region === 'All' || customer.region === filters.region;
    const matchesSize = filters.size === 'All' || customer.company_size === filters.size;
    
    return matchesSearch && matchesStatus && matchesIndustry && matchesRegion && matchesSize;
  });
  
  return (
    <div className="space-y-4">
      {/* Enhanced saved lists section */}
      <div className="bg-white rounded-lg">
        <div className="space-y-0">
          {/* Save/Update/Clear View Buttons - Show when any changes detected */}
          {hasChanges() && (
            <div className="flex justify-end items-center gap-2 px-4 py-1">
              <button
                onClick={() => {
                  if (originalFilters) setFilters(originalFilters);
                  if (originalVisibleFields) setVisibleFields(originalVisibleFields);
                  setOriginalFilters(null);
                  setOriginalVisibleFields(null);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
              <button
                onClick={() => setShowSaveViewModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                <Bookmark className="w-3 h-3" />
                Save as segment view
              </button>
            </div>
          )}

          {/* Statistics overview cards */}
          <div className="grid grid-cols-4 gap-6 p-6 pb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{filteredCustomers?.length || 0}</div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {filteredCustomers?.filter((customer: any) => customer.opportunities_count > 0).length || 0}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                €{filteredCustomers?.reduce((sum: number, customer: any) => sum + (parseFloat(customer.total_value) || 0), 0).toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                €{filteredCustomers?.reduce((sum: number, customer: any) => sum + (parseFloat(customer.weighted_value) || 0), 0).toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Weighted Value</div>
            </div>
          </div>

          {/* Enhanced unified toolbar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Top row with saved lists and views */}
              <div className="flex flex-wrap items-center justify-between">
                {/* Saved Lists Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowSavedListsDropdown(!showSavedListsDropdown)}
                  >
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-700">{activeList ? activeList.name : "Customer Lists"}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Right-side action buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    disabled={!activeList}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <FieldsSelector
                    fields={customerFields}
                    visibleFields={Object.keys(visibleFields).filter(key => visibleFields[key as keyof typeof visibleFields])}
                    onFieldsChange={(fieldKeys) => {
                      const newVisibleFields = { ...visibleFields };
                      Object.keys(visibleFields).forEach(key => {
                        newVisibleFields[key as keyof typeof visibleFields] = fieldKeys.includes(key);
                      });
                      setVisibleFields(newVisibleFields);
                    }}
                  />
                </div>
              </div>
              
              {/* Bottom row with search, views, and filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-grow">
                  {/* Search field */}
                  <div className="relative w-60">
                    <Input
                      type="text"
                      placeholder="Search customers..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  {/* Saved Views Dropdown */}
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                      onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                    >
                      <Bookmark className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-700">{activeView ? activeView.name : "Select a view"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Filter dropdowns */}
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.industry} onValueChange={(value) => setFilters({...filters, industry: value})}>
                    <SelectTrigger className="w-32">
                      <Target className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedCustomers.length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-indigo-700 font-medium mr-2">
                  {selectedCustomers.length} {selectedCustomers.length === 1 ? 'customer' : 'customers'} selected
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600"
                  onClick={() => setSelectedCustomers([])}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-indigo-600"
                  onClick={() => setShowBulkActionsModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to list
                </Button>
                <Button variant="outline" size="sm" className="text-indigo-600">
                  <Share2 className="w-4 h-4 mr-1" />
                  Export Selected
                </Button>
              </div>
            </div>
          )}

          {/* Customers Table */}
          {customersLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading customers...</div>
            </div>
          ) : (
            <div className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCustomers.length === filteredCustomers?.length && filteredCustomers?.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCustomers(filteredCustomers?.map((customer: any) => customer.id) || []);
                          } else {
                            setSelectedCustomers([]);
                          }
                        }}
                      />
                    </TableHead>
                    {visibleFields.name && <TableHead className="font-semibold text-gray-900">Customer</TableHead>}
                    {visibleFields.industry && <TableHead className="font-semibold text-gray-900">Industry</TableHead>}
                    {visibleFields.region && <TableHead className="font-semibold text-gray-900">Type</TableHead>}
                    {visibleFields.contactPerson && <TableHead className="font-semibold text-gray-900">Status</TableHead>}
                    {visibleFields.opportunities && <TableHead className="font-semibold text-gray-900">Related contacts</TableHead>}
                    {visibleFields.actions && <TableHead className="font-semibold text-gray-900">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers?.map((customer: any) => (
                    <TableRow key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCustomers([...selectedCustomers, customer.id]);
                            } else {
                              setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                            }
                          }}
                        />
                      </TableCell>
                      {visibleFields.name && (
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <EntityAvatar name={customer.name} type="customer" />
                            <div>
                              <div className="text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.contact_person}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {visibleFields.industry && (
                        <TableCell>
                          <div className="text-gray-900">{customer.industry}</div>
                        </TableCell>
                      )}
                      {visibleFields.region && (
                        <TableCell>
                          <div className="text-gray-900">{customer.type || 'Corporate'}</div>
                        </TableCell>
                      )}
                      {visibleFields.contactPerson && (
                        <TableCell>
                          <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                            {customer.status || 'Active'}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleFields.opportunities && (
                        <TableCell>
                          <div className="text-gray-900">
                            {customer.contact_count || '1'} contact{(customer.contact_count || 1) > 1 ? 's' : ''}
                          </div>
                        </TableCell>
                      )}
                      {visibleFields.actions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Modal */}
      <Dialog open={showBulkActionsModal} onOpenChange={setShowBulkActionsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
            <DialogDescription>
              Add {selectedCustomers.length} selected customers to a list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create new list
            </Button>
            <div className="space-y-2">
              <Label>Or add to existing list:</Label>
              {savedLists?.map((list: any) => (
                <Button
                  key={list.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // Handle adding to existing list
                    setShowBulkActionsModal(false);
                    toast({ title: `Added ${selectedCustomers.length} customers to ${list.name}` });
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {list.name}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionsModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}