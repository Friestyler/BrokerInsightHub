import { useState, useRef, DragEvent } from 'react';
import { useParams, Link } from 'wouter';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Bookmark } from "lucide-react";

// Mock data for a partner
const mockPartnerData = {
  id: 1,
  name: "Computacenter",
  description: "Joint action & business plan to drive growth with business",
  segment: "broker",
  address: "123 Main St, New York, NY",
  customers: 42,
  opportunities: 12,
  initials: "CC",
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
        title: "Marketing Budget for Round Tables",
        realized: "0",
        target: "22.500",
        progress: 0,
        type: "financial",
        dueDate: new Date(),
        owner: { id: 3, name: "Bob Smith", initials: "BS", avatar: "" },
      },
      {
        id: 6,
        title: "Joint Marketing Materials",
        realized: "Complete",
        target: "Complete",
        progress: 100,
        type: "task",
        dueDate: new Date("2025-04-20"),
        owner: { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
      },
      {
        id: 7,
        title: "Co-branded Digital Campaigns",
        realized: "9.000",
        target: "15.000",
        progress: 60,
        type: "financial",
        dueDate: new Date(),
        owner: { id: 3, name: "Bob Smith", initials: "BS", avatar: "" },
      },
    ]
  }
];

// Mock customers data
const mockCustomers = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Manufacturing",
    size: "enterprise",
    products: 3,
    opportunities: 2,
    status: "active",
    initials: "AC",
  },
  {
    id: 2,
    name: "Globex Industries",
    industry: "Technology",
    size: "large",
    products: 5,
    opportunities: 1,
    status: "active",
    initials: "GI",
  },
  {
    id: 3,
    name: "Stark Enterprises",
    industry: "Energy",
    size: "enterprise",
    products: 2,
    opportunities: 3,
    status: "active",
    initials: "SE",
  },
];

// Mock opportunities data
const mockOpportunities = [
  {
    id: 1,
    title: "IT Infrastructure Upgrade",
    customerName: "Acme Corporation",
    customerId: 1,
    estimatedValue: 250000,
    probability: 75,
    status: "qualified",
    closingDate: new Date("2025-07-15"),
    owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
  },
  {
    id: 2,
    title: "Cloud Migration Project",
    customerName: "Globex Industries",
    customerId: 2,
    estimatedValue: 185000,
    probability: 60,
    status: "proposal",
    closingDate: new Date("2025-08-30"),
    owner: { id: 2, name: "Alice Cooper", initials: "AC", avatar: "" },
  },
  {
    id: 3,
    title: "Cybersecurity Assessment",
    customerName: "Stark Enterprises",
    customerId: 3,
    estimatedValue: 75000,
    probability: 90,
    status: "closed_won",
    closingDate: new Date("2025-05-10"),
    owner: { id: 1, name: "John Doe", initials: "JD", avatar: "" },
  },
];

// Owner avatar component
function OwnerAvatar({ owner }: { owner: { initials: string, avatar?: string } }) {
  return (
    <Avatar className="h-8 w-8">
      {owner.avatar ? (
        <AvatarImage src={owner.avatar} alt={owner.initials} />
      ) : (
        <AvatarFallback className="bg-indigo-100 text-indigo-600">
          {owner.initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let color = "";
  let label = "";

  switch (status) {
    case "qualified":
      color = "bg-blue-100 text-blue-800";
      label = "Qualified";
      break;
    case "proposal":
      color = "bg-yellow-100 text-yellow-800";
      label = "Proposal";
      break;
    case "negotiation":
      color = "bg-purple-100 text-purple-800";
      label = "Negotiation";
      break;
    case "closed_won":
      color = "bg-green-100 text-green-800";
      label = "Closed Won";
      break;
    case "closed_lost":
      color = "bg-red-100 text-red-800";
      label = "Closed Lost";
      break;
    default:
      color = "bg-gray-100 text-gray-800";
      label = status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Progress bar component
function ProgressBar({ progress, type = "default" }: { progress: number, type?: "default" | "success" | "warning" | "danger" }) {
  let colorClass = "bg-indigo-500";
  
  if (type === "success") colorClass = "bg-green-500";
  if (type === "warning") colorClass = "bg-yellow-500";
  if (type === "danger") colorClass = "bg-red-500";
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${colorClass}`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(mockPartnerData.description);
  const [activeTab, setActiveTab] = useState("okr");
  const [activeView, setActiveView] = useState("default");
  const [tabOrder, setTabOrder] = useState<string[]>(["okr", "opportunities", "customers"]);
  const [tabNames, setTabNames] = useState<Record<string, string>>({
    okr: "OKR plans",
    opportunities: "Opportunities",
    customers: "Customers"
  });
  const [isEditingTabName, setIsEditingTabName] = useState("");
  const [editedTabName, setEditedTabName] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListName, setSaveListName] = useState("");
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
  
  // Handle save list
  const handleSaveList = () => {
    // Save logic would go here
    setShowSaveListModal(false);
    setSaveListName("");
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
                <Link href={`/lists/partners/${id}/details`}>
                  <Button variant="outline" size="sm" className="ml-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Details
                  </Button>
                </Link>
              </div>
              
              <div className="mt-2">
                {isEditingDescription ? (
                  <div className="flex items-center">
                    <Input 
                      value={description} 
                      onChange={handleDescriptionChange} 
                      className="mr-2 w-96"
                    />
                    <Button size="sm" onClick={handleDescriptionSave}>
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

      {/* Tabs and content */}
      <div>
        <div className="flex justify-between items-center mb-6">
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
            
            <div className="flex justify-between mt-4">
              <div className="flex gap-3 items-center">
                {/* View selector and filters */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1" />
                      <span>Saved Lists</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFilterOpen(!filterOpen)}
                      className={filterOpen ? "bg-gray-100" : ""}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      Filters
                    </Button>
                    
                    {searchTerm && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative w-64">
                    <Input
                      className="pl-8"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Selection actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSaveListModal(true)}
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save {selectedItems.length > 1 ? 'items' : 'item'} to list
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                    Add to Campaign
                  </Button>
                </div>
              )}
              
              {/* Team display when nothing selected */}
              {selectedItems.length === 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 mr-2">Team</div>
                  <div className="flex -space-x-2">
                    {partner.team.map((member, idx) => (
                      <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white text-xs">
                      +2
                    </div>
                  </div>
                  
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </Button>
                </div>
              )}
            </div>
            
            {/* Save List Modal */}
            <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Save to List</DialogTitle>
                  <DialogDescription>
                    Create a new list or add to an existing list.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="List name"
                    value={saveListName}
                    onChange={(e) => setSaveListName(e.target.value)}
                    className="mb-4"
                  />
                  <div className="text-sm font-medium mb-2">Or add to existing list:</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {["My active customers", "High value customers", "Q2 targets"].map((list, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <Bookmark className="h-4 w-4" />
                        <span>{list}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter className="sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveListModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    onClick={handleSaveList}
                    disabled={!saveListName && true}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <TabsContent value="okr" className="mt-4">
              {/* OKR content */}
              <div className="space-y-8">
                {mockOKRs.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-medium">
                          {plan.id.toUpperCase()}
                        </div>
                        <h3 className="font-medium">{plan.title}</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                      <div className="flex items-center w-3/4">
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium text-gray-600">Realized</span>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium text-gray-600">Target</span>
                        </div>
                        <div className="w-24 text-center">
                          <span className="text-sm font-medium text-gray-600">Progress</span>
                        </div>
                        <div className="w-10 flex justify-center">
                          <span className="text-sm font-medium text-gray-600">TL</span>
                        </div>
                        <div className="w-28 flex justify-center">
                          <span className="text-sm font-medium text-gray-600">Due date</span>
                        </div>
                        <div className="w-16 flex justify-center">
                          <span className="text-sm font-medium text-gray-600">Resp.</span>
                        </div>
                        <div className="w-32 flex justify-end">
                          <span className="text-sm font-medium text-gray-600">Comments</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {plan.objectives.map((objective) => (
                        <div key={objective.id} className="px-4 py-3 border-b hover:bg-gray-50 flex justify-between items-center">
                          <div className="w-1/4">
                            <p className="text-sm font-medium text-gray-900">
                              {objective.title}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 w-3/4">
                            <div className="w-16 text-right text-sm">
                              {objective.type === 'financial' ? (
                                <span className="text-gray-700">€ {objective.realized}</span>
                              ) : (
                                <span className="flex justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div className="w-16 text-right text-sm">
                              {objective.type === 'financial' ? (
                                <span className="text-gray-700">€ {objective.target}</span>
                              ) : (
                                <span className="text-gray-700">Complete</span>
                              )}
                            </div>
                            <div className="w-24 flex items-center">
                              {objective.type === 'financial' ? (
                                <>
                                  <span className="text-xs text-gray-700 w-8">{objective.progress}%</span>
                                  <div className="flex-grow ml-1">
                                    <ProgressBar 
                                      progress={objective.progress} 
                                      type={objective.progress >= 70 ? "success" : objective.progress >= 40 ? "warning" : "danger"}
                                    />
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm text-gray-700">Complete</span>
                              )}
                            </div>
                            <div className="w-10 flex justify-center">
                              <span className="flex justify-center">
                                {objective.progress >= 70 ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                ) : objective.progress >= 40 ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                  </svg>
                                )}
                              </span>
                            </div>
                            <div className="w-28 flex justify-center">
                              <span className="text-xs text-gray-700">
                                {format(objective.dueDate, 'dd.MM.yyyy')}
                              </span>
                            </div>
                            <div className="w-16 flex justify-center">
                              <OwnerAvatar owner={objective.owner} />
                            </div>
                            <div className="w-32 flex justify-end">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="opportunities" className="mt-4">
              {/* Opportunities content */}
              <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Probability
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Closing Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {mockOpportunities.map((opportunity) => (
                      <tr key={opportunity.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium text-gray-900">
                          <Link href={`/lists/opportunities/${opportunity.id}`} className="hover:text-indigo-600">
                            {opportunity.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          <Link 
                            href={`/lists/customers/${opportunity.customerId}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {opportunity.customerName}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          {formatCurrency(opportunity.estimatedValue)}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          {opportunity.probability}%
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          <StatusBadge status={opportunity.status} />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          {format(opportunity.closingDate, 'dd.MM.yyyy')}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          <OwnerAvatar owner={opportunity.owner} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="mt-4">
              {/* Customers content */}
              <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Industry
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Size
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Products
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Opportunities
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {mockCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600">
                              <AvatarFallback>{customer.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Link href={`/lists/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                                {customer.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          {customer.industry}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          <span className="capitalize">{customer.size}</span>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                          <Badge variant={customer.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                            {customer.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-center">
                          {customer.products}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-center">
                          {customer.opportunities}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}