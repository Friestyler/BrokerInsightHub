import { useState, useRef, DragEvent } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";


// Mock data for a partner
const mockPartnerData = {
  id: 1,
  name: "ABC Insurance Brokers",
  description: "Joint action & business plan to drive growth with insurance business",
  segment: "broker",
  address: "123 Main St, New York, NY",
  customers: 3,
  opportunities: 3,
  initials: "AB",
  owner: {
    id: 1,
    name: "John Doe",
    initials: "JD",
    avatar: "",
  },
  team: [
    { id: 1, name: "John Doe", initials: "JD", avatar: "" },
    { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock OKRs data
const mockOKRs = [
  {
    id: "pp",
    title: "Focus Partner Plan 2025",
    objectives: [
      {
        id: 1,
        title: "Revenue Goal",
        realized: "560.000",
        target: "1.000.000",
        progress: 56,
        type: "financial",
        dueDate: new Date(),
        owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
      },
      {
        id: 2,
        title: "Pipeline New Business",
        realized: "1.095.000",
        target: "2.000.000",
        progress: 54,
        type: "financial",
        dueDate: new Date(),
        owner: { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
      },
      {
        id: 3,
        title: "Training & Certification",
        realized: "Complete",
        target: "Complete",
        progress: 100,
        type: "task",
        dueDate: new Date("2025-04-20"),
        owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
      },
      {
        id: 4,
        title: "Marketing Development Funds",
        realized: "60.000",
        target: "100.000",
        progress: 60,
        type: "financial",
        dueDate: new Date(),
        owner: { id: 3, name: "Bob Smith", initials: "BS", avatar: "" },
      },
    ]
  },
  {
    id: "mp",
    title: "Marketing Plan",
    objectives: [
      {
        id: 5,
        title: "Co-branded Campaigns",
        realized: "3",
        target: "4",
        progress: 75,
        type: "task",
        dueDate: new Date(),
        owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
      },
      {
        id: 6,
        title: "New Website Launch",
        realized: "90%",
        target: "100%",
        progress: 90,
        type: "task",
        dueDate: new Date(),
        owner: { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
      }
    ]
  }
];

// Mock customers data - only customers related to ABC Insurance Brokers
const mockCustomers = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Manufacturing",
    size: "enterprise",
    products: 5,
    opportunities: 2,
    status: "active",
    initials: "AC",
    partner: "ABC Insurance Brokers"
  },
  {
    id: 4,
    name: "Umbrella Corporation",
    industry: "Pharmaceuticals",
    size: "large",
    products: 2,
    opportunities: 0,
    status: "inactive",
    initials: "UC",
    partner: "ABC Insurance Brokers"
  },
  {
    id: 7,
    name: "Wayne Enterprises",
    industry: "Manufacturing",
    size: "enterprise",
    products: 6,
    opportunities: 2,
    status: "active",
    initials: "WE",
    partner: "ABC Insurance Brokers"
  }
];

// Mock opportunities data - only opportunities related to ABC Insurance Brokers
const mockOpportunities = [
  {
    id: 1,
    title: "Property Insurance Renewal",
    customerName: "Acme Corporation",
    customerId: 1,
    estimatedValue: 125000,
    probability: 75,
    status: "in_progress",
    closingDate: new Date("2025-06-15"),
    owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
    type: "renewal",
    partner: "ABC Insurance Brokers"
  },
  {
    id: 2,
    title: "Cyber Security Coverage",
    customerName: "Acme Corporation",
    customerId: 1,
    estimatedValue: 75000,
    probability: 60,
    status: "qualification",
    closingDate: new Date("2025-07-30"),
    owner: { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
    type: "new_business",
    partner: "ABC Insurance Brokers"
  },
  {
    id: 5,
    title: "Workers Compensation",
    customerName: "Umbrella Corporation",
    customerId: 4,
    estimatedValue: 80000,
    probability: 0,
    status: "closed_lost",
    closingDate: new Date("2025-05-15"),
    owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
    type: "cross-sell",
    partner: "ABC Insurance Brokers"
  }
];

// Owner avatar component
function OwnerAvatar({ owner }: { owner: { initials: string, avatar?: string } }) {
  return (
    <Avatar className="h-6 w-6">
      {owner.avatar ? (
        <AvatarImage src={owner.avatar} alt={owner.initials} />
      ) : (
        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
          {owner.initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { color: string, label: string }> = {
    in_progress: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
    qualification: { color: "bg-purple-100 text-purple-800", label: "Qualification" },
    proposal: { color: "bg-amber-100 text-amber-800", label: "Proposal" },
    negotiation: { color: "bg-orange-100 text-orange-800", label: "Negotiation" },
    closed_won: { color: "bg-green-100 text-green-800", label: "Closed Won" },
    closed_lost: { color: "bg-red-100 text-red-800", label: "Closed Lost" },
    active: { color: "bg-green-100 text-green-800", label: "Active" },
    inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
  };
  
  const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
      {label}
    </span>
  );
}

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Progress bar component
function ProgressBar({ progress, type = "default" }: { progress: number, type?: "default" | "success" | "warning" | "danger" }) {
  const colorMap = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
  };
  
  const color = colorMap[type];
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  
  // State for partner description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(mockPartnerData.description);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState("okr");
  const [tabOrder, setTabOrder] = useState<string[]>(["okr", "opportunities", "customers"]);
  const [tabNames, setTabNames] = useState<Record<string, string>>({
    okr: "OKR plans",
    opportunities: "Opportunities",
    customers: "Customers"
  });
  const [isEditingTabName, setIsEditingTabName] = useState("");
  const [editedTabName, setEditedTabName] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  
  const dragTab = useRef<string | null>(null);
  const dragOverTab = useRef<string | null>(null);
  
  // Get partner data (using mock data for now)
  const partner = mockPartnerData;
  
  // Handle description edit
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  
  const handleDescriptionSave = () => {
    // Here would be an API call to save the description
    setIsEditingDescription(false);
  };
  
  // Handle tab drag and drop
  const handleDragStart = (event: DragEvent<HTMLDivElement>, tab: string) => {
    dragTab.current = tab;
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (event: DragEvent<HTMLDivElement>, tab: string) => {
    event.preventDefault();
    if (dragTab.current !== tab) {
      dragOverTab.current = tab;
    }
  };
  
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dragTab.current && dragOverTab.current) {
      const newTabOrder = [...tabOrder];
      const dragIndex = newTabOrder.indexOf(dragTab.current);
      const dropIndex = newTabOrder.indexOf(dragOverTab.current);
      
      if (dragIndex !== -1 && dropIndex !== -1) {
        // Remove the dragged tab
        newTabOrder.splice(dragIndex, 1);
        // Insert it at the new position
        newTabOrder.splice(dropIndex, 0, dragTab.current);
        setTabOrder(newTabOrder);
      }
      
      // Reset references
      dragTab.current = null;
      dragOverTab.current = null;
    }
  };
  
  // Handle tab name editing
  const startEditingTabName = (tab: string) => {
    setIsEditingTabName(tab);
    setEditedTabName(tabNames[tab] || "");
  };
  
  const saveTabName = () => {
    if (isEditingTabName && editedTabName.trim()) {
      setTabNames({
        ...tabNames,
        [isEditingTabName]: editedTabName.trim()
      });
      setIsEditingTabName("");
    }
  };
  
  // Handle item selection
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = (items: any[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };
  
  const clearSelection = () => {
    setSelectedItems([]);
  };
  
  // Handle saving a list
  const handleSaveList = () => {
    console.log("Saving list with items:", selectedItems);
  };
  
  const handleAddToCampaign = () => {
    // This would handle adding selected items to a campaign
    console.log("Adding to campaign:", selectedItems);
  };
  
  const handleCreateOpportunity = () => {
    // This would handle creating an opportunity from selected items
    console.log("Creating opportunity from:", selectedItems);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Partner header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 mt-1">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                {partner.initials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight text-black">
                  {partner.name}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {partner.segment}
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Owner:</span>
                  <OwnerAvatar owner={partner.owner} />
                </div>
              </div>
              
              <div className="mt-2">
                {isEditingDescription ? (
                  <div className="flex items-center">
                    <Input
                      value={description}
                      onChange={handleDescriptionChange}
                      className="w-full"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2"
                      onClick={handleDescriptionSave}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with search and tabs */}
      <div>

        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex items-center border-b space-x-1 overflow-x-auto">
            {tabOrder.map((tab) => (
              <div 
                key={tab}
                draggable
                onDragStart={(e) => handleDragStart(e, tab)}
                onDragOver={(e) => handleDragOver(e, tab)}
                onDrop={handleDrop}
                className="relative"
              >
                <div 
                  className={`px-4 py-2 cursor-pointer flex items-center ${
                    activeTab === tab 
                      ? 'bg-indigo-100 text-indigo-700 rounded-t-md border-b-2 border-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {isEditingTabName === tab ? (
                    <Input
                      value={editedTabName}
                      onChange={(e) => setEditedTabName(e.target.value)}
                      onBlur={saveTabName}
                      onKeyDown={(e) => e.key === 'Enter' && saveTabName()}
                      className="w-40 h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div 
                      onDoubleClick={() => startEditingTabName(tab)}
                      className="cursor-text"
                    >
                      {tabNames[tab] || tab}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
            
          {/* Tab Contents */}
          <TabsContent value="okr" className="mt-4">
            <div className="space-y-6">
              {mockOKRs.map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-indigo-50 p-4 border-b">
                      <h2 className="font-semibold text-lg">{plan.title}</h2>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-6">
                        {plan.objectives.map((objective) => (
                          <div key={objective.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between mb-2">
                              <div>
                                <h3 className="font-medium">{objective.title}</h3>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <span className="mr-1">Owner:</span>
                                  <OwnerAvatar owner={objective.owner} />
                                  <span className="ml-2 mr-4">{objective.owner.name}</span>
                                  
                                  <span className="mr-1">Due:</span>
                                  <span>{format(objective.dueDate, 'MMM dd, yyyy')}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="mb-1">
                                  <Badge variant={objective.type === 'financial' ? "default" : "outline"} className="capitalize">
                                    {objective.type}
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">{objective.realized}</span>
                                  <span className="text-gray-500"> / {objective.target}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <ProgressBar 
                                progress={objective.progress} 
                                type={
                                  objective.progress >= 80 ? "success" : 
                                  objective.progress >= 50 ? "default" : 
                                  objective.progress >= 25 ? "warning" : "danger"
                                } 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
            
          <TabsContent value="opportunities" className="mt-4">
            <div>

              
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Saved Lists</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      <polyline points="17 8 21 12 17 16"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Export
                  </Button>
                  
                  <Button size="sm" className="text-sm bg-indigo-600 hover:bg-indigo-700">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search opportunities..." 
                      className="w-[230px] border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Status</span>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <rect x="9" y="9" width="6" height="6"></rect>
                      <line x1="9" y1="1" x2="9" y2="4"></line>
                      <line x1="15" y1="1" x2="15" y2="4"></line>
                      <line x1="9" y1="20" x2="9" y2="23"></line>
                      <line x1="15" y1="20" x2="15" y2="23"></line>
                      <line x1="20" y1="9" x2="23" y2="9"></line>
                      <line x1="20" y1="14" x2="23" y2="14"></line>
                      <line x1="1" y1="9" x2="4" y2="9"></line>
                      <line x1="1" y1="14" x2="4" y2="14"></line>
                    </svg>
                    <span>Type</span>
                  </Button>
                </div>
              </div>
            
              {/* Selected items actions */}
              {selectedItems.length > 0 && (
                <div className="bg-indigo-50 rounded p-3 mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-indigo-700 font-medium mr-2">{selectedItems.length} opportunities selected</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-gray-700 p-1 h-auto"
                      onClick={clearSelection}
                    >
                      Clear selection
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-indigo-700" onClick={() => handleSaveList()}>
                      Create List
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-indigo-700" onClick={() => handleAddToCampaign()}>
                      Add to Campaign
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    3
                  </div>
                  <div className="text-gray-500 text-sm">Total Opportunities</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    1
                  </div>
                  <div className="text-gray-500 text-sm">Closed Won</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    €280,000
                  </div>
                  <div className="text-gray-500 text-sm">Total Value</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    €150,000
                  </div>
                  <div className="text-gray-500 text-sm">Weighted Value</div>
                </div>
              </div>
              
              {/* Opportunities table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Template</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link href={`/lists/opportunities/1?from=partner/${id}`} className="inline-block">
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          Property Insurance Renewal
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      Acme Corporation
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      Renewal
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </TableCell>
                    <TableCell>
                      €125,000
                    </TableCell>
                    <TableCell>
                      15/06/2025
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
                          RN
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link href={`/lists/opportunities/2?from=partner/${id}`} className="inline-block">
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          Cyber Security Coverage
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      Acme Corporation
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      New Business
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Qualification
                      </span>
                    </TableCell>
                    <TableCell>
                      €75,000
                    </TableCell>
                    <TableCell>
                      30/07/2025
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center">
                          NB
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link href={`/lists/opportunities/5?from=partner/${id}`} className="inline-block">
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          Workers Compensation
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      Umbrella Corporation
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      Cross-sell
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        Closed Lost
                      </span>
                    </TableCell>
                    <TableCell>
                      €80,000
                    </TableCell>
                    <TableCell>
                      15/05/2025
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center">
                          CS
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <div>

              
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Saved Lists</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      <polyline points="17 8 21 12 17 16"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Export
                  </Button>
                  
                  <Button size="sm" className="text-sm bg-indigo-600 hover:bg-indigo-700">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search by name, industry..." 
                      className="w-[230px] border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Status</span>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>Industry</span>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3l8-8"></path>
                      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10"></path>
                    </svg>
                    <span>Size</span>
                  </Button>
                </div>
              </div>
            
              {/* Selected items actions */}
              {selectedItems.length > 0 && (
                <div className="bg-indigo-50 rounded p-3 mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-indigo-700 font-medium mr-2">{selectedItems.length} customers selected</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-gray-700 p-1 h-auto"
                      onClick={clearSelection}
                    >
                      Clear selection
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-indigo-700" onClick={() => handleSaveList()}>
                      Create List
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-indigo-700" onClick={() => handleCreateOpportunity()}>
                      Create Opportunity
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    3
                  </div>
                  <div className="text-gray-500 text-sm">Total Customers</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    2
                  </div>
                  <div className="text-gray-500 text-sm">Active Customers</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    13
                  </div>
                  <div className="text-gray-500 text-sm">Total Products</div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="text-2xl font-semibold">
                    4
                  </div>
                  <div className="text-gray-500 text-sm">Total Opportunities</div>
                </div>
              </div>
              
              {/* Customers table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Opportunities</TableHead>
                    <TableHead>Template</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                          AC
                        </div>
                        <span className="font-medium">
                          Acme Corporation
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      Manufacturing
                    </TableCell>
                    <TableCell>
                      Enterprise
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      5
                    </TableCell>
                    <TableCell>
                      2
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
                          RP
                        </div>
                        <div className="h-6 w-6 rounded-full bg-fuchsia-100 text-fuchsia-700 text-xs flex items-center justify-center">
                          CO
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                          UC
                        </div>
                        <span className="font-medium">
                          Umbrella Corporation
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      Pharmaceuticals
                    </TableCell>
                    <TableCell>
                      Large
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    </TableCell>
                    <TableCell>
                      2
                    </TableCell>
                    <TableCell>
                      0
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">
                          CO
                        </div>
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center">
                          RP
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                          WE
                        </div>
                        <span className="font-medium">
                          Wayne Enterprises
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-indigo-600">
                      ABC Insurance Brokers
                    </TableCell>
                    <TableCell>
                      Manufacturing
                    </TableCell>
                    <TableCell>
                      Enterprise
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      6
                    </TableCell>
                    <TableCell>
                      2
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center">
                          RP
                        </div>
                        <div className="h-6 w-6 rounded-full bg-fuchsia-100 text-fuchsia-700 text-xs flex items-center justify-center">
                          CO
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}