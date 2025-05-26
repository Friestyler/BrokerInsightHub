import { useState, useEffect, createContext, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Create a context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});

// Hook to use the list editing context
const useListEditing = () => useContext(ListEditingContext);

// Sample data for partners
const mockPartners = [
  {
    id: 1,
    name: "Jeroen Hypotheek Advies", 
    initials: "JH",
    industry: "Finance",
    type: "Advisor",
    status: "active",
    size: "medium",
    customers: 3,
    opportunities: 4,
  },
  {
    id: 2,
    name: "ABC Insurance Brokers",
    initials: "AB",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 5,
    opportunities: 4,
  },
  {
    id: 3,
    name: "Global Insurance Partners",
    initials: "GI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 15,
    opportunities: 12,
  },
  {
    id: 4,
    name: "Pinnacle Risk Solutions",
    initials: "PR",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 18,
    opportunities: 9,
  }
];

// Template badges component
function TemplateBadges({ industry, type }: { industry: string; type: string }) {
  const getTemplateType = (industry: string, type: string) => {
    if (industry === "Insurance" && type === "Broker") return "IB";
    if (industry === "Insurance" && type === "Agent") return "PR";
    if (industry === "Finance" && type === "Advisor") return "FS";
    return "GN";
  };

  const getTemplateColor = (templateType: string) => {
    switch (templateType) {
      case "IB": return "bg-blue-100 text-blue-800";
      case "PR": return "bg-purple-100 text-purple-800";
      case "FS": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const templateType = getTemplateType(industry, type);
  
  return (
    <div className="flex space-x-1">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTemplateColor(templateType)}`}>
        {templateType}
      </span>
    </div>
  );
}

// Saved lists functionality
interface SavedList {
  id: number;
  name: string;
  isDefault?: boolean;
  filters?: {
    searchText?: string;
    status?: string;
    industry?: string;
    type?: string;
  };
}

// Mock saved lists
const mockSavedLists: SavedList[] = [
  { id: 1, name: "All Partners", isDefault: true },
  { id: 2, name: "Active Insurance Brokers", filters: { status: "active", industry: "Insurance", type: "Broker" } },
  { id: 3, name: "High-Value Partners", filters: { searchText: "enterprise" } },
];

// Views functionality
interface SavedView {
  id: number;
  name: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    type?: string;
  };
}

const mockSavedViews: SavedView[] = [
  { 
    id: 1, 
    name: "Active Brokers", 
    filters: { status: "active", type: "Broker" } 
  },
  { 
    id: 2, 
    name: "Insurance Partners", 
    filters: { industry: "Insurance" } 
  },
];

// Main Partners Table Component
function PartnersTable() {
  const [filterText, setFilterText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // List editing state
  const { isEditingList, setIsEditingList } = useListEditing();
  const [editedListMembers, setEditedListMembers] = useState<number[]>([]);
  
  // Views state
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [originalViewFilters, setOriginalViewFilters] = useState<any>(null);
  const [hasUnsavedViewChanges, setHasUnsavedViewChanges] = useState(false);
  const [showSaveViewDialog, setShowSaveViewDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  
  // Lists state
  const [activeList, setActiveList] = useState<SavedList | null>(mockSavedLists[0]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const { toast } = useToast();

  // Filter partners based on current filters
  const filteredPartners = mockPartners.filter(partner => {
    const matchesText = filterText === '' || 
      partner.name.toLowerCase().includes(filterText.toLowerCase()) ||
      partner.industry.toLowerCase().includes(filterText.toLowerCase()) ||
      partner.type.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || partner.status === selectedStatus;
    const matchesIndustry = selectedIndustry === '' || partner.industry === selectedIndustry;
    const matchesType = selectedType === '' || partner.type === selectedType;
    
    return matchesText && matchesStatus && matchesIndustry && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const displayedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection functions
  const toggleSelectPartner = (partnerId: number) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPartners.length === displayedPartners.length && displayedPartners.length > 0) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(displayedPartners.map(p => p.id));
    }
  };

  // Views functionality
  const getCurrentFilters = () => ({
    searchText: filterText,
    status: selectedStatus,
    industry: selectedIndustry,
    type: selectedType,
  });

  const checkForUnsavedViewChanges = () => {
    if (!activeView || !originalViewFilters) return false;
    
    const currentFilters = getCurrentFilters();
    return JSON.stringify(currentFilters) !== JSON.stringify(originalViewFilters);
  };

  useEffect(() => {
    setHasUnsavedViewChanges(checkForUnsavedViewChanges());
  }, [filterText, selectedStatus, selectedIndustry, selectedType, activeView, originalViewFilters]);

  const applyView = (view: SavedView) => {
    const filters = view.filters;
    setFilterText(filters.searchText || '');
    setSelectedStatus(filters.status || '');
    setSelectedIndustry(filters.industry || '');
    setSelectedType(filters.type || '');
    setActiveView(view);
    setOriginalViewFilters({ ...filters });
    setHasUnsavedViewChanges(false);
  };

  const revertViewChanges = () => {
    if (activeView && originalViewFilters) {
      const filters = originalViewFilters;
      setFilterText(filters.searchText || '');
      setSelectedStatus(filters.status || '');
      setSelectedIndustry(filters.industry || '');
      setSelectedType(filters.type || '');
      setHasUnsavedViewChanges(false);
    }
  };

  const saveViewChanges = () => {
    if (activeView) {
      const currentFilters = getCurrentFilters();
      // In a real app, this would update the view in the backend
      activeView.filters = { ...currentFilters };
      setOriginalViewFilters({ ...currentFilters });
      setHasUnsavedViewChanges(false);
      
      toast({
        title: "View Updated",
        description: `"${activeView.name}" has been updated with your current filters.`
      });
    }
  };

  const saveNewView = () => {
    if (newViewName.trim()) {
      const currentFilters = getCurrentFilters();
      // In a real app, this would save the view to the backend
      toast({
        title: "View Saved",
        description: `"${newViewName}" has been saved with your current filters.`
      });
      setShowSaveViewDialog(false);
      setNewViewName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Views and Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Views</h2>
            
            {/* Views Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {activeView ? activeView.name : "Select View"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  setActiveView(null);
                  setOriginalViewFilters(null);
                  setHasUnsavedViewChanges(false);
                }}>
                  Clear View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {mockSavedViews.map(view => (
                  <DropdownMenuItem key={view.id} onClick={() => applyView(view)}>
                    {view.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Action Buttons */}
            {hasUnsavedViewChanges && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={revertViewChanges}
                >
                  Revert changes
                </Button>
                <Button
                  size="sm"
                  onClick={saveViewChanges}
                >
                  Save
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveViewDialog(true)}
            >
              Save as new view
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search partners..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              <option value="Insurance">Insurance</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Broker">Broker</option>
              <option value="Advisor">Advisor</option>
              <option value="Agency">Agency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lists</h2>
          <div className="flex items-center space-x-2">
            {selectedPartners.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
              >
                Share ({selectedPartners.length})
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {activeList ? activeList.name : "Select List"}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {mockSavedLists.map(list => (
                <DropdownMenuItem key={list.id} onClick={() => setActiveList(list)}>
                  {list.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {displayedPartners.length} of {filteredPartners.length} partners
        </div>
        <div className="text-sm text-gray-600">
          {selectedPartners.length} selected
        </div>
      </div>

      {/* Partners Table */}
      <div className="overflow-hidden bg-white sm:rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={selectedPartners.length === displayedPartners.length && displayedPartners.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
                Partner
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Industry
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Size
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Customers
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Opportunities
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Template
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayedPartners.map((partner) => (
              <tr 
                key={partner.id} 
                className={`hover:bg-gray-50 group ${selectedPartners.includes(partner.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedPartners.includes(partner.id)}
                    onChange={() => toggleSelectPartner(partner.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm w-[250px]">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="text-xs font-medium">
                        {partner.initials}
                      </AvatarFallback>
                    </Avatar>
                    <Link href={`/partners/${partner.id}`}>
                      <span className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                        {partner.name}
                      </span>
                    </Link>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{partner.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {partner.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.customers}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.opportunities}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <TemplateBadges industry={partner.industry} type={partner.type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Save View Dialog */}
      <Dialog open={showSaveViewDialog} onOpenChange={setShowSaveViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="viewName">View Name</Label>
              <Input
                id="viewName"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveNewView}>Save View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Partners</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selected Partners ({selectedPartners.length})</Label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                {selectedPartners.map(id => {
                  const partner = mockPartners.find(p => p.id === id);
                  return partner ? (
                    <div key={id} className="text-sm py-1">{partner.name}</div>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="shareMessage">Message (Optional)</Label>
              <Textarea 
                id="shareMessage" 
                placeholder="Include a note to the recipients"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => {
              toast({
                title: "Partners Shared",
                description: `${selectedPartners.length} partners have been shared successfully.`
              });
              setShowShareDialog(false);
              setSelectedPartners([]);
            }}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnersPage() {
  const [isEditingList, setIsEditingList] = useState(false);
  
  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] pl-[12px] pr-[12px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
            onClick={() => {
              if (!isEditingList) {
                alert("Create new partner functionality coming soon!");
              }
            }}
            disabled={isEditingList}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create new partner
          </button>
        </div>
        <PartnersTable />
      </div>
    </ListEditingContext.Provider>
  );
}