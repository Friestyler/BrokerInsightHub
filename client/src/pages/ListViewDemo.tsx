import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// A view represents a saved configuration of filters for a list
interface View {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    type?: string;
    size?: string;
  };
  isDefault?: boolean;
  createdBy: string;
  createdAt: Date;
}

// A list contains actual records (partners, opportunities, etc.)
interface List {
  id: string;
  name: string;
  description?: string;
  members: number[]; // The actual records (IDs) contained in this list
  views: View[];     // Different ways to view/filter this list
  activeViewId?: string; // Currently active view
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
}

// Helper function for creating a new view
function createView(name: string, filters = {}, isDefault = false): View {
  return {
    id: Date.now().toString(),
    name,
    filters,
    isDefault,
    createdBy: 'Current User',
    createdAt: new Date()
  };
}

// Helper function for creating a new list with default view
function createList(name: string, description = '', members: number[] = []): List {
  const defaultView = createView('Default View', {}, true);
  
  return {
    id: Date.now().toString(),
    name,
    description,
    members,
    views: [defaultView],
    activeViewId: defaultView.id,
    isShared: false,
    createdBy: 'Current User',
    createdAt: new Date()
  };
}

// Sample partner data
const samplePartners = [
  {
    id: 1,
    name: "XYZ Insurance Group",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise"
  },
  {
    id: 2,
    name: "Global Consulting Partners",
    industry: "Consulting",
    type: "Agency",
    status: "active",
    size: "large"
  },
  {
    id: 3,
    name: "Allied Financial Services",
    industry: "Finance",
    type: "Broker",
    status: "active", 
    size: "medium"
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    industry: "Insurance",
    type: "Agency",
    status: "inactive",
    size: "medium"
  },
  {
    id: 5,
    name: "Secure Financial Services",
    industry: "Finance",
    type: "Broker",
    status: "active",
    size: "large"
  },
  {
    id: 6,
    name: "Pinnacle Risk Solutions",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise"
  }
];

// View Dialog Component for creating and editing views
function ViewDialog({ 
  isOpen, 
  onClose, 
  parentList, 
  existingView = null,
  onSave
}: { 
  isOpen: boolean;
  onClose: () => void;
  parentList: List;
  existingView?: View | null;
  onSave: (parentList: List, view: View) => void;
}) {
  const [viewName, setViewName] = useState(existingView?.name || '');
  const [viewDescription, setViewDescription] = useState(existingView?.description || '');
  
  // Initial filter states based on existing view or empty values
  const [searchText, setSearchText] = useState(existingView?.filters?.searchText || '');
  const [selectedStatus, setSelectedStatus] = useState(existingView?.filters?.status || '');
  const [selectedIndustry, setSelectedIndustry] = useState(existingView?.filters?.industry || '');
  const [selectedType, setSelectedType] = useState(existingView?.filters?.type || '');
  const [selectedSize, setSelectedSize] = useState(existingView?.filters?.size || '');

  // Reset states when dialog opens/closes or a different view is edited
  useEffect(() => {
    if (isOpen) {
      setViewName(existingView?.name || '');
      setViewDescription(existingView?.description || '');
      setSearchText(existingView?.filters?.searchText || '');
      setSelectedStatus(existingView?.filters?.status || '');
      setSelectedIndustry(existingView?.filters?.industry || '');
      setSelectedType(existingView?.filters?.type || '');
      setSelectedSize(existingView?.filters?.size || '');
    }
  }, [isOpen, existingView]);

  const handleSave = () => {
    const filters = {
      searchText: searchText || undefined,
      status: selectedStatus || undefined,
      industry: selectedIndustry || undefined, 
      type: selectedType || undefined,
      size: selectedSize || undefined
    };
    
    let view: View;
    if (existingView) {
      // Update existing view
      view = {
        ...existingView,
        name: viewName,
        description: viewDescription || undefined,
        filters
      };
    } else {
      // Create new view
      view = {
        id: Date.now().toString(),
        name: viewName,
        description: viewDescription || undefined,
        filters,
        isDefault: false,
        createdBy: 'Current User',
        createdAt: new Date()
      };
    }
    
    onSave(parentList, view);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#282A3F] font-medium">
            {existingView ? 'Edit View' : 'Create New View'}
          </DialogTitle>
          <DialogDescription>
            {existingView 
              ? `Edit filter settings for "${existingView.name}"`
              : `Create a new way to view partners in "${parentList.name}"`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="view-name">View Name</Label>
            <Input 
              id="view-name" 
              placeholder="Enter a name for this view" 
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="view-description">Description (optional)</Label>
            <Textarea 
              id="view-description" 
              placeholder="What makes this view unique?" 
              value={viewDescription}
              onChange={(e) => setViewDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <Label>Filter Settings</Label>
            <div className="text-sm text-gray-500 mb-2">
              Define which partners will be shown when using this view
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="search-text">Search Text</Label>
                <Input
                  id="search-text"
                  placeholder="Search text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-industry">Industry</Label>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={setSelectedIndustry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Industry</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-type">Type</Label>
                <Select 
                  value={selectedType} 
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Type</SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                    <SelectItem value="Carrier">Carrier</SelectItem>
                    <SelectItem value="MGA">MGA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-size">Size</Label>
                <Select 
                  value={selectedSize} 
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Size</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={!viewName.trim()}
            className="bg-[#5567E5] hover:bg-[#4557D5]"
          >
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View Selector Component to switch between views
function ViewSelector({ 
  list, 
  activeViewId, 
  onSelectView,
  onCreateView,
  onEditView
}: { 
  list: List, 
  activeViewId: string | undefined, 
  onSelectView: (viewId: string) => void,
  onCreateView: (list: List) => void,
  onEditView: (list: List, view: View) => void
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Find the active view
  const activeView = list.views.find(v => v.id === activeViewId) || list.views[0];
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>{activeView?.name || "Default View"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-60 rounded-md border border-slate-200 bg-white shadow-md">
          <div className="py-1 max-h-60 overflow-y-auto">
            {list.views.map(view => (
              <div key={view.id} className="relative group">
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${view.id === activeViewId ? 'bg-indigo-50 text-indigo-700' : ''}`}
                  onClick={() => {
                    onSelectView(view.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>{view.name}</span>
                  </div>
                  
                  {!view.isDefault && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditView(list, view);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-100 p-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 rounded-sm"
              onClick={() => {
                onCreateView(list);
                setIsDropdownOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              <span>Create New View</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Button component for creating a new view 
function CreateViewButton({ list, onCreateView }: { list: List, onCreateView: (list: List) => void }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-1.5 text-[#5567E5] hover:text-[#4557D5] hover:bg-indigo-50"
      onClick={() => onCreateView(list)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
      <span>Create New View</span>
    </Button>
  );
}

// Partner card component for the demo
function PartnerCard({ partner }: { partner: any }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{partner.name}</CardTitle>
          <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
            {partner.status}
          </Badge>
        </div>
        <CardDescription>{partner.industry} / {partner.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <Badge variant="outline" className="mr-2">{partner.size}</Badge>
          <span className="text-xs text-gray-500">ID: {partner.id}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main demo page 
export default function ListViewDemo() {
  const { toast } = useToast();
  
  // Sample list with multiple views
  const [demoList, setDemoList] = useState<List>(
    createList(
      "Key Insurance Partners", 
      "Our most important insurance industry partners",
      [1, 3, 6] // Sample partner IDs
    )
  );
  
  // Add some sample views
  useEffect(() => {
    // Only run once on initial render
    setDemoList(prevList => {
      if (prevList.views.length === 1) {
        // Add sample views if we only have the default view
        const activeView = prevList.views[0];
        
        const brokersView = createView("Brokers Only", { type: "Broker" });
        const activePartnersView = createView("Active Partners", { status: "active" });
        const enterpriseView = createView("Enterprise Partners", { size: "enterprise" });
        
        return {
          ...prevList,
          views: [activeView, brokersView, activePartnersView, enterpriseView]
        };
      }
      return prevList;
    });
  }, []);
  
  // State for view dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewToEdit, setViewToEdit] = useState<View | null>(null);
  
  // Handle creating a new view
  const handleCreateView = () => {
    setViewToEdit(null);
    setViewDialogOpen(true);
  };
  
  // Handle editing an existing view
  const handleEditView = (view: View) => {
    setViewToEdit(view);
    setViewDialogOpen(true);
  };
  
  // Handle saving a view (new or edited)
  const handleSaveView = (parentList: List, view: View) => {
    setDemoList(prevList => {
      if (viewToEdit) {
        // Update existing view
        return {
          ...prevList,
          views: prevList.views.map(v => v.id === view.id ? view : v)
        };
      } else {
        // Add new view
        return {
          ...prevList,
          views: [...prevList.views, view]
        };
      }
    });
    
    toast({
      title: viewToEdit ? "View updated" : "New view created",
      description: `"${view.name}" ${viewToEdit ? "has been updated" : "has been added to your list"}.`,
    });
  };
  
  // Handle selecting a view
  const handleSelectView = (viewId: string) => {
    setDemoList(prevList => ({
      ...prevList,
      activeViewId: viewId
    }));
    
    const selectedView = demoList.views.find(v => v.id === viewId);
    if (selectedView) {
      toast({
        title: "View applied",
        description: `Now showing partners using the "${selectedView.name}" view.`,
      });
    }
  };
  
  // Get active view
  const activeView = demoList.views.find(v => v.id === demoList.activeViewId) || demoList.views[0];
  
  // Filter partners based on active view
  const filteredPartners = samplePartners.filter(partner => {
    // First check if the partner is in the list
    const isInList = demoList.members.length === 0 || demoList.members.includes(partner.id);
    
    if (!isInList) {
      return false;
    }
    
    // Then apply filters from the active view
    const filters = activeView.filters;
    
    // Search text filter (searches name, industry, type)
    const matchesText = !filters.searchText || 
      partner.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      partner.industry.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      partner.type.toLowerCase().includes(filters.searchText.toLowerCase());
      
    // Status filter
    const matchesStatus = !filters.status || partner.status === filters.status;
    
    // Industry filter
    const matchesIndustry = !filters.industry || partner.industry === filters.industry;
    
    // Type filter
    const matchesType = !filters.type || partner.type === filters.type;
    
    // Size filter
    const matchesSize = !filters.size || partner.size === filters.size;
    
    return matchesText && matchesStatus && matchesIndustry && matchesType && matchesSize;
  });
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Lists and Views Concept</h1>
          <p className="text-slate-600 mb-6">
            This demo showcases how lists (collections of records) can be separated from views (saved filter configurations).
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{demoList.name}</CardTitle>
                <CardDescription>{demoList.description}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {/* View selector dropdown */}
                <ViewSelector 
                  list={demoList} 
                  activeViewId={demoList.activeViewId} 
                  onSelectView={handleSelectView}
                  onCreateView={() => handleCreateView()}
                  onEditView={(_, view) => handleEditView(view)}
                />
                
                {/* Standalone button to create a new view */}
                <CreateViewButton list={demoList} onCreateView={() => handleCreateView()} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Current View: <span className="text-indigo-600">{activeView.name}</span></h3>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(activeView.filters).map(([key, value]) => value && (
                  <div key={key} className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-700 border border-slate-200">
                    {key === 'searchText' ? 'Search' : key}: {value}
                  </div>
                ))}
                {!Object.values(activeView.filters).some(v => v) && (
                  <div className="text-xs text-slate-500 italic">No filters applied</div>
                )}
              </div>
              
              <div className="text-xs text-slate-500">
                Showing {filteredPartners.length} partners from list of {demoList.members.length || "all"} partners
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartners.length > 0 ? (
                filteredPartners.map(partner => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-slate-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                      <path d="M17.5 17.5 6.5 6.5"></path>
                      <path d="m17.5 6.5-11 11"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">No partners match the current view</h3>
                  <p className="text-slate-500 max-w-md mx-auto mt-1">
                    Try changing the view or adjusting the filter criteria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-slate-500">
              {demoList.views.length} views available
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Reset to default view
                const defaultView = demoList.views.find(v => v.isDefault) || demoList.views[0];
                handleSelectView(defaultView.id);
              }}
            >
              Reset to Default View
            </Button>
          </CardFooter>
        </Card>
        
        {/* View creation/editing dialog */}
        <ViewDialog
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          parentList={demoList}
          existingView={viewToEdit}
          onSave={handleSaveView}
        />
      </div>
    </div>
  );
}