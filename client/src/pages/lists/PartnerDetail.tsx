import { useState, useRef, DragEvent, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";


// Partner data interface
interface PartnerData {
  id: number;
  name: string;
  description: string;
  segment: string;
  address: string;
  customers: number;
  opportunities: number;
  initials: string;
  owner: {
    id: number;
    name: string;
    initials: string;
    avatar: string;
  };
  team: Array<{
    id: number;
    name: string;
    initials: string;
    avatar: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Partner data map - ensures consistent naming throughout the application
const partnerDataMap: Record<string, PartnerData> = {
  "1": {
    id: 1,
    name: "Jeroen Hypotheek Advies",
    description: "Specialized mortgage advisor with focus on sustainable home financing",
    segment: "advisor",
    address: "Keizersgracht 123, Amsterdam, NL",
    customers: 3,
    opportunities: 4,
    initials: "JH",
    owner: {
      id: 1,
      name: "Maarten de Vries",
      initials: "MV",
      avatar: "",
    },
    team: [
      { id: 1, name: "Maarten de Vries", initials: "MV", avatar: "" },
      { id: 2, name: "Sophie Jansen", initials: "SJ", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "2": {
    id: 2,
    name: "ABC Insurance Brokers",
    description: "Joint action & business plan to drive growth with insurance business",
    segment: "broker",
    address: "456 Broadway, New York, NY",
    customers: 5,
    opportunities: 4,
    initials: "AB",
    owner: {
      id: 2,
      name: "Sarah Johnson",
      initials: "SJ",
      avatar: "",
    },
    team: [
      { id: 2, name: "Sarah Johnson", initials: "SJ", avatar: "" },
      { id: 3, name: "Michael Brown", initials: "MB", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "3": {
    id: 3,
    name: "Global Insurance Partners",
    description: "Strategic partnership focusing on enterprise clients",
    segment: "broker",
    address: "789 Fifth Avenue, New York, NY",
    customers: 8,
    opportunities: 6,
    initials: "GI",
    owner: {
      id: 3,
      name: "David Wilson",
      initials: "DW",
      avatar: "",
    },
    team: [
      { id: 3, name: "David Wilson", initials: "DW", avatar: "" },
      { id: 4, name: "Emily Clark", initials: "EC", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "4": {
    id: 4,
    name: "Premier Insurance Agency",
    description: "Regional insurance agency specializing in personal and small business coverage",
    segment: "agency",
    address: "789 Washington St, Boston, MA",
    customers: 6,
    opportunities: 3,
    initials: "PI",
    owner: {
      id: 4,
      name: "John Davis",
      initials: "JD",
      avatar: "",
    },
    team: [
      { id: 4, name: "John Davis", initials: "JD", avatar: "" },
      { id: 5, name: "Karen Miller", initials: "KM", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "5": {
    id: 5,
    name: "Secure Financial Services",
    description: "Leading financial services provider with focus on insurance products",
    segment: "broker",
    address: "101 Market St, San Francisco, CA",
    customers: 22,
    opportunities: 15,
    initials: "SF",
    owner: {
      id: 5,
      name: "Jessica Brown",
      initials: "JB",
      avatar: "",
    },
    team: [
      { id: 5, name: "Jessica Brown", initials: "JB", avatar: "" },
      { id: 6, name: "Thomas Lee", initials: "TL", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "6": {
    id: 6,
    name: "Pinnacle Risk Solutions",
    description: "Specialized risk management and insurance brokerage firm",
    segment: "broker",
    address: "555 Brickell Ave, Miami, FL",
    customers: 18,
    opportunities: 9,
    initials: "PR",
    owner: {
      id: 6,
      name: "Robert Smith",
      initials: "RS",
      avatar: "",
    },
    team: [
      { id: 6, name: "Robert Smith", initials: "RS", avatar: "" },
      { id: 7, name: "Laura Jones", initials: "LJ", avatar: "" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
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

// Mock opportunities data - for Jeroen Hypotheek Advies
const mockOpportunities = [
  {
    id: 1,
    title: "Koppelen van hypotheek aan verduurzamingslening",
    customerName: "Van Dijk Familie",
    customerId: 1,
    estimatedValue: 250000,
    probability: 80,
    status: "in_progress",
    closingDate: new Date("2025-07-15"),
    owner: { id: 1, name: "Maarten de Vries", initials: "MV", avatar: "" },
    type: "new_business",
    partner: "Jeroen Hypotheek Advies"
  },
  {
    id: 2,
    title: "Verduurzamingslening",
    customerName: "Jansen Gezin",
    customerId: 2,
    estimatedValue: 35000,
    probability: 60,
    status: "qualification",
    closingDate: new Date("2025-06-30"),
    owner: { id: 2, name: "Sophie Jansen", initials: "SJ", avatar: "" },
    type: "new_business",
    partner: "Jeroen Hypotheek Advies"
  },
  {
    id: 3,
    title: "Verkoop van aanvullende producten",
    customerName: "De Groot BV",
    customerId: 3,
    estimatedValue: 42000,
    probability: 75,
    status: "proposal_sent",
    closingDate: new Date("2025-08-10"),
    owner: { id: 1, name: "Maarten de Vries", initials: "MV", avatar: "" },
    type: "upsell",
    partner: "Jeroen Hypotheek Advies"
  },
  {
    id: 4,
    title: "Proactief contact bij levensgebeurtenissen",
    customerName: "Visser Familie",
    customerId: 4,
    estimatedValue: 28000,
    probability: 100,
    status: "closed_won",
    closingDate: new Date("2025-05-05"),
    owner: { id: 2, name: "Sophie Jansen", initials: "SJ", avatar: "" },
    type: "renewal",
    partner: "Jeroen Hypotheek Advies"
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

// Fetch specific partner data from database
const usePartnerData = (id: string) => {
  return useQuery({
    queryKey: ['/api/customers', id],
    queryFn: async () => {
      console.log('Fetching partner detail for ID:', id);
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      const customers = await response.json();
      console.log('All customers:', customers.length);
      
      // Find the specific customer by ID
      const customer = customers.find((c: any) => c.id.toString() === id);
      if (!customer) {
        throw new Error('Partner not found');
      }
      
      console.log('Found customer:', customer.name);
      
      // Transform customer to partner format
      return {
        id: customer.id,
        name: customer.name,
        description: customer.description || 'No description available',
        segment: customer.description?.includes('broker') ? 'broker' : 'partner',
        address: 'Address not available', // Add when customer schema includes address
        customers: Math.floor(Math.random() * 50) + 10,
        opportunities: Math.floor(Math.random() * 20) + 5,
        initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        owner: {
          id: customer.ownerId || 1,
          name: 'Owner not assigned',
          initials: 'NA',
          avatar: '',
        },
        team: [],
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
      };
    }
  });
};

export default function PartnerDetail() {
  const { id } = useParams();
  
  // Fetch the partner data based on ID from URL
  const { data: partner, isLoading, error } = usePartnerData(id || '1');
  
  // All useState hooks must be called before any conditional returns
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(partner?.description || '');
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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading partner details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !partner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">Partner not found</p>
          <Link href="/partners">
            <Button variant="outline" className="mt-4">
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Get partner data (using mock data for now)
  // Partner data already defined above using partnerDataMap[id]
  
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
          <div className="flex items-start">
            <div>
              <div className="flex items-center space-x-3">
                <Link href="/partners" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-[20px] font-bold tracking-tight text-black">
                  {partner.name}
                </h1>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 py-0 rounded-md flex items-center justify-center border-gray-200 text-xs text-indigo-600"
                >
                  Details
                </Button>
                <Badge variant="outline" className="capitalize">
                  {partner.segment}
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Owner:</span>
                  <OwnerAvatar owner={partner.owner} />
                </div>
              </div>
              
              <div className="mt-[10px]">
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
                    className="text-gray-600 text-[14px] cursor-pointer hover:text-gray-900"
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
            <OKRPlansSection partnerId={id || ""} />
          </TabsContent>
            
          <TabsContent value="opportunities" className="mt-4">
            <PartnerOpportunitiesSection partnerId={id} />
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

// TagBadge component - exact from Coming Soon tab
const TagBadge = ({ tag }: { tag: string }) => {
  const tagColors: Record<string, string> = {
    "Financial": "#3B82F6",
    "Revenue": "#10B981", 
    "Partner": "#F59E0B",
    "Pipeline": "#8B5CF6",
    "Sales": "#EF4444",
    "Training": "#06B6D4",
    "Certification": "#84CC16",
    "People": "#F97316",
    "Marketing": "#EC4899",
    "Budget": "#6366F1",
    "Digital": "#14B8A6",
    "Customer": "#8B5CF6",
    "Support": "#F59E0B",
    "Service": "#10B981",
    "Quality": "#3B82F6",
    "Campaign": "#EC4899",
    "Brand": "#F97316",
    "Website": "#06B6D4",
    "Product": "#84CC16",
    "Innovation": "#EF4444",
    "Market Expansion": "#6366F1"
  };

  const bgColor = tagColors[tag] || "#6B7280";
  
  return (
    <div 
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: bgColor }}
    >
      {tag}
    </div>
  );
};

// Partner Opportunities Section Component with full list and views functionality
function PartnerOpportunitiesSection({ partnerId }: { partnerId: string | undefined }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  // List and Views functionality - exactly like main pages
  const [savedLists, setSavedLists] = useState<any[]>([
    {
      id: 'all-opportunities',
      name: 'All Opportunities',
      type: 'filter',
      filters: { },
      isShared: false,
      createdBy: 'System',
      createdAt: new Date('2025-01-01'),
      isDefault: true
    }
  ]);
  const [activeList, setActiveList] = useState<any>(null);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [selectedExistingList, setSelectedExistingList] = useState<string | null>(null);

  // Views functionality
  const [savedViews, setSavedViews] = useState<any[]>([
    {
      id: 'view-1',
      name: 'Active Opportunities',
      filters: {
        status: 'open'
      },
      createdBy: 'John Smith',
      createdAt: new Date('2025-05-01')
    }
  ]);
  const [activeView, setActiveView] = useState<any>(null);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [viewNameInput, setViewNameInput] = useState('');

  // Fetch opportunities for this specific partner
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities', partnerId],
    queryFn: async () => {
      const response = await fetch('/api/opportunities');
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      const allOpportunities = await response.json();
      // Filter opportunities for this partner
      return allOpportunities.filter((opp: any) => opp.partnerId === parseInt(partnerId || '0'));
    },
    enabled: !!partnerId
  });

  // Apply filters from active list or view
  const getActiveFilters = () => {
    if (activeList && activeList.type === 'filter') {
      return activeList.filters;
    }
    if (activeView) {
      return activeView.filters;
    }
    return {
      searchText: searchTerm,
      status: statusFilter,
      type: typeFilter,
      stage: stageFilter
    };
  };

  // Filter opportunities based on search, filters, and active list/view
  const filteredOpportunities = opportunities.filter((opp: any) => {
    const filters = getActiveFilters();
    
    const matchesSearch = !filters.searchText || 
      opp.title?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      opp.description?.toLowerCase().includes(filters.searchText.toLowerCase());
    
    const matchesStatus = !filters.status || filters.status === 'all' || opp.status === filters.status;
    const matchesType = !filters.type || filters.type === 'all' || opp.type === filters.type;
    const matchesStage = !filters.stage || filters.stage === 'all' || opp.stage === filters.stage;
    
    return matchesSearch && matchesStatus && matchesType && matchesStage;
  });

  // If active list is a selection type, show only selected opportunities
  const displayedOpportunities = activeList?.type === 'selection' 
    ? opportunities.filter((opp: any) => activeList.members?.includes(opp.id))
    : filteredOpportunities;

  // Calculate statistics
  const stats = {
    totalOpportunities: displayedOpportunities.length,
    closedWon: displayedOpportunities.filter((opp: any) => opp.status === 'closed' && opp.stage === 'closed').length,
    totalValue: displayedOpportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0),
    weightedValue: displayedOpportunities.reduce((sum: number, opp: any) => {
      const value = opp.value || 0;
      const probability = opp.probability || 0;
      return sum + (value * (probability / 100));
    }, 0)
  };

  const toggleSelectOpportunity = (id: number) => {
    if (selectedOpportunities.includes(id)) {
      setSelectedOpportunities(selectedOpportunities.filter(oppId => oppId !== id));
    } else {
      setSelectedOpportunities([...selectedOpportunities, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOpportunities.length === displayedOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(displayedOpportunities.map((opp: any) => opp.id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string, stage: string) => {
    if (status === 'closed' && stage === 'closed') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Closed Won</span>;
    }
    switch (stage) {
      case 'discovery':
        return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Discovery</span>;
      case 'proposal':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Proposal</span>;
      case 'negotiation':
        return <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">Negotiation</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{stage}</span>;
    }
  };

  const handleSaveList = () => {
    if (selectedOpportunities.length === 0) return;
    
    setShowSaveListModal(true);
  };

  const handleSaveView = () => {
    setShowSaveViewModal(true);
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      type: 'selection',
      filters: {},
      members: selectedOpportunities,
      isShared: false,
      createdBy: 'Current User',
      createdAt: new Date()
    };
    
    setSavedLists(prev => [...prev, newList]);
    setSelectedOpportunities([]);
    setNewListName("");
    setShowSaveListModal(false);
  };

  const createNewView = () => {
    if (!viewNameInput.trim()) return;
    
    const newView = {
      id: Date.now().toString(),
      name: viewNameInput,
      filters: {
        searchText: searchTerm,
        status: statusFilter,
        type: typeFilter,
        stage: stageFilter
      },
      createdBy: 'Current User',
      createdAt: new Date()
    };
    
    setSavedViews(prev => [...prev, newView]);
    setViewNameInput("");
    setShowSaveViewModal(false);
  };

  return (
    <div>
      {/* Header with Saved Lists and Views */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {/* Saved Lists Dropdown */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowListsDropdown(!showListsDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{activeList ? activeList.name : 'Saved Lists'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
            
            {showListsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">SAVED LISTS</div>
                  {savedLists.map((list) => (
                    <div 
                      key={list.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setActiveList(list);
                        setActiveView(null);
                        setShowListsDropdown(false);
                      }}
                    >
                      <span className="text-sm">{list.name}</span>
                      {activeList?.id === list.id && (
                        <svg className="w-4 h-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Views Dropdown */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowViewsDropdown(!showViewsDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>{activeView ? activeView.name : 'Views'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
            
            {showViewsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">SAVED VIEWS</div>
                  {savedViews.map((view) => (
                    <div 
                      key={view.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setActiveView(view);
                        setActiveList(null);
                        setShowViewsDropdown(false);
                      }}
                    >
                      <span className="text-sm">{view.name}</span>
                      {activeView?.id === view.id && (
                        <svg className="w-4 h-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-left justify-start text-indigo-600"
                      onClick={() => {
                        setShowViewsDropdown(false);
                        handleSaveView();
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Save Current View
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
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
      
      {/* Search and filters */}
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
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="new_business">New Business</SelectItem>
              <SelectItem value="cross_sell">Cross Sell</SelectItem>
              <SelectItem value="upsell">Upsell</SelectItem>
              <SelectItem value="renewal">Renewal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    
      {/* Selected items actions */}
      {selectedOpportunities.length > 0 && (
        <div className="bg-indigo-50 rounded p-3 mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-indigo-700 font-medium mr-2">{selectedOpportunities.length} opportunities selected</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 p-1 h-auto"
              onClick={() => setSelectedOpportunities([])}
            >
              Clear selection
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-indigo-700" onClick={handleSaveList}>
              Create List
            </Button>
            
            <Button variant="ghost" size="sm" className="text-indigo-700">
              Add to Campaign
            </Button>
          </div>
        </div>
      )}
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-semibold text-[#282A3F]">
            {stats.totalOpportunities}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-[#696C8C] mt-1">Total Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-semibold text-[#282A3F]">
            {stats.closedWon}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-[#696C8C] mt-1">Closed Won</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-semibold text-[#282A3F]">
            {formatCurrency(stats.totalValue)}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-[#696C8C] mt-1">Total Value</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-semibold text-[#282A3F]">
            {formatCurrency(stats.weightedValue)}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-sm text-[#696C8C] mt-1">Weighted Value</div>
        </div>
      </div>
      
      {/* Opportunities table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedOpportunities.length === displayedOpportunities.length && displayedOpportunities.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOpportunities.map((opportunity: any) => (
              <TableRow key={opportunity.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedOpportunities.includes(opportunity.id)}
                    onCheckedChange={() => toggleSelectOpportunity(opportunity.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link href={`/lists/opportunities/${opportunity.id}?from=partner/${partnerId}`} className="inline-block">
                    <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                      {opportunity.title}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/lists/customers/${opportunity.clientId}`} className="inline-block">
                    <span className="text-indigo-600 hover:underline cursor-pointer">
                      Customer {opportunity.clientId}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  {opportunity.type}
                </TableCell>
                <TableCell>
                  {getStatusBadge(opportunity.status, opportunity.stage)}
                </TableCell>
                <TableCell>
                  {formatCurrency(opportunity.value || 0)}
                </TableCell>
                <TableCell>
                  {opportunity.probability}%
                </TableCell>
                <TableCell>
                  {opportunity.expectedCloseDate ? format(new Date(opportunity.expectedCloseDate), 'dd/MM/yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Opportunities List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="listName">List Name</Label>
              <Input
                id="listName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveListModal(false)}>
                Cancel
              </Button>
              <Button onClick={createNewList}>
                Save List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save View Modal */}
      <Dialog open={showSaveViewModal} onOpenChange={setShowSaveViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="viewName">View Name</Label>
              <Input
                id="viewName"
                value={viewNameInput}
                onChange={(e) => setViewNameInput(e.target.value)}
                placeholder="Enter view name..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveViewModal(false)}>
                Cancel
              </Button>
              <Button onClick={createNewView}>
                Save View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// OKR Plans Section Component
function OKRPlansSection({ partnerId }: { partnerId: string }) {
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState("");
  const [assignedOKRs, setAssignedOKRs] = useState<any[]>([]);
  const [advancedTimeframe, setAdvancedTimeframe] = useState("");
  const [quickActionInput, setQuickActionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulated AI generation function
  const generateOKR = async () => {
    if (!quickActionInput.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate structured OKRs with activities based on input
    const generatedOKRs = generateStructuredOKRs(quickActionInput);
    
    // Add to assigned OKRs
    setAssignedOKRs(prev => [...prev, ...generatedOKRs]);
    
    // Clear input
    setQuickActionInput('');
    setIsGenerating(false);
  };

  const generateStructuredOKRs = (input: string): any[] => {
    const results = [];
    const baseId = Date.now();
    const tag = inferTagFromInput(input);
    const unit = inferUnitFromInput(input);
    const targetValue = generateTargetValue(input);
    
    // Create main objective
    const objective = {
      id: baseId,
      title: extractObjectiveFromInput(input),
      description: `Generated from: "${input}"`,
      tag,
      unit,
      targetValue,
      realizedValue: null,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      milestoneFrequency: "Monthly",
      nestedCount: 0
    };
    
    results.push(objective);
    
    // Generate activities if requested
    const activityCount = extractActivityCount(input);
    if (activityCount > 0) {
      const activities = generateActivities(input, activityCount, baseId, tag);
      results.push(...activities);
      
      // Update nested count for objective
      objective.nestedCount = activityCount;
    }
    
    return results;
  };

  const extractActivityCount = (input: string): number => {
    const matches = input.match(/(\d+)\s+activit/i);
    return matches ? parseInt(matches[1]) : 0;
  };

  const generateActivities = (input: string, count: number, parentId: number, tag: string): any[] => {
    const activities = [];
    const lowerInput = input.toLowerCase();
    
    // Activity suggestions based on context
    const activitySuggestions = getActivitySuggestions(lowerInput, tag);
    
    for (let i = 0; i < count && i < activitySuggestions.length; i++) {
      activities.push({
        id: parentId + i + 1,
        title: activitySuggestions[i].title,
        description: activitySuggestions[i].description,
        tag,
        unit: activitySuggestions[i].unit,
        targetValue: activitySuggestions[i].target,
        realizedValue: null,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        milestoneFrequency: "Monthly",
        nestedCount: 0
      });
    }
    
    return activities;
  };

  const getActivitySuggestions = (input: string, tag: string) => {
    if (tag === 'Marketing' || input.includes('marketing')) {
      return [
        {
          title: "Launch Digital Marketing Campaign",
          description: "Create and execute targeted digital marketing campaigns across social media and search platforms",
          unit: "number",
          target: 5
        },
        {
          title: "Content Marketing Strategy",
          description: "Develop and publish engaging content to attract and retain customers",
          unit: "number",
          target: 20
        },
        {
          title: "Email Marketing Campaigns",
          description: "Design and send targeted email campaigns to nurture leads",
          unit: "percentage",
          target: 15
        }
      ];
    }
    
    if (tag === 'Sales' || input.includes('sales')) {
      return [
        {
          title: "Lead Generation Activities",
          description: "Implement strategies to generate qualified sales leads",
          unit: "number",
          target: 50
        },
        {
          title: "Client Outreach Program",
          description: "Systematic outreach to potential and existing clients",
          unit: "number",
          target: 100
        }
      ];
    }
    
    if (tag === 'Training' || input.includes('training')) {
      return [
        {
          title: "Product Training Sessions",
          description: "Conduct comprehensive product training for team members",
          unit: "number",
          target: 8
        },
        {
          title: "Skills Development Program",
          description: "Implement ongoing skills development and certification programs",
          unit: "number",
          target: 12
        }
      ];
    }
    
    // Default activities
    return [
      {
        title: "Strategic Planning Sessions",
        description: "Regular planning and review sessions to track progress",
        unit: "number",
        target: 10
      },
      {
        title: "Performance Monitoring",
        description: "Continuous monitoring and optimization of key performance indicators",
        unit: "percentage",
        target: 20
      }
    ];
  };

  const extractObjectiveFromInput = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('increase') || lowerInput.includes('grow')) {
      return input.split(/with|through|by|via/)[0].trim();
    }
    if (lowerInput.includes('improve') || lowerInput.includes('enhance')) {
      return input.split(/with|through|by|via/)[0].trim();
    }
    return input.split('.')[0].trim() || "New Objective";
  };

  const inferTagFromInput = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('sales') || lowerInput.includes('revenue')) return 'Sales';
    if (lowerInput.includes('marketing') || lowerInput.includes('campaign')) return 'Marketing';
    if (lowerInput.includes('training') || lowerInput.includes('education')) return 'Training';
    if (lowerInput.includes('digital') || lowerInput.includes('online')) return 'Digital';
    if (lowerInput.includes('customer') || lowerInput.includes('client')) return 'Customer';
    if (lowerInput.includes('partner')) return 'Partner';
    return 'Financial';
  };

  const inferUnitFromInput = (input: string): string => {
    if (input.includes('%') || input.includes('percent')) return 'percentage';
    if (input.includes('$') || input.includes('€') || input.includes('revenue') || input.includes('sales')) return 'currency';
    return 'number';
  };

  const generateTargetValue = (input: string): number => {
    const numbers = input.match(/(\d+)/g);
    if (numbers) {
      const firstNumber = parseInt(numbers[0]);
      if (input.includes('%')) return firstNumber;
      if (input.includes('million') || input.includes('M')) return firstNumber * 1000000;
      if (input.includes('thousand') || input.includes('K')) return firstNumber * 1000;
      return firstNumber;
    }
    return 100; // Default target
  };

  // TagBadge component - exact from Coming Soon tab
  const TagBadgeLocal = ({ tag }: { tag: string }) => {
    const tagColors: Record<string, string> = {
      "Financial": "#3B82F6",
      "Revenue": "#10B981", 
      "Partner": "#F59E0B",
      "Pipeline": "#8B5CF6",
      "Sales": "#EF4444",
      "Training": "#06B6D4",
      "Certification": "#84CC16",
      "People": "#F97316",
      "Marketing": "#EC4899",
      "Budget": "#6366F1",
      "Digital": "#14B8A6",
      "Customer": "#8B5CF6",
      "Support": "#F59E0B",
      "Service": "#10B981",
      "Quality": "#3B82F6",
      "Campaign": "#EC4899",
      "Brand": "#F97316",
      "Website": "#06B6D4",
      "Product": "#84CC16",
      "Innovation": "#EF4444",
      "Market Expansion": "#6366F1"
    };

    const bgColor = tagColors[tag] || "#6B7280";
    
    return (
      <div 
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: bgColor }}
      >
        {tag}
      </div>
    );
  };

  // Load assigned OKR templates for this partner from localStorage
  useEffect(() => {
    const loadAssignedOKRs = () => {
      const storedAssignments = localStorage.getItem('partnerOKRAssignments');
      if (storedAssignments) {
        try {
          const assignments = JSON.parse(storedAssignments);
          const partnerAssignments = assignments[partnerId] || [];
          
          // Get the full template data
          const storedTemplates = localStorage.getItem('okrTemplates');
          if (storedTemplates) {
            const templates = JSON.parse(storedTemplates);
            const assignedTemplates = templates.filter((template: any) => 
              partnerAssignments.includes(template.id)
            );
            setAssignedOKRs(assignedTemplates);
          }
        } catch (error) {
          console.error('Error loading assigned OKRs:', error);
          setAssignedOKRs([]);
        }
      } else {
        setAssignedOKRs([]);
      }
    };

    loadAssignedOKRs();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'partnerOKRAssignments' || e.key === 'okrTemplates') {
        loadAssignedOKRs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [partnerId]);

  // Filter OKRs based on search and filters
  const filteredOKRs = assignedOKRs.filter(okr => {
    const matchesSearch = searchTerm === "" || 
      okr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.includes(okr.tag);
    
    const matchesMeasureUnit = selectedMeasureUnit === "" || 
      okr.unit === selectedMeasureUnit.toLowerCase();

    return matchesSearch && matchesTags && matchesMeasureUnit;
  });

  // Get available tags from assigned OKRs
  const availableTags = [...new Set(assignedOKRs.map(okr => okr.tag).filter(Boolean))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedMeasureUnit("");
    setAdvancedTimeframe("");
  };

  // Group OKRs by tag, same as Coming Soon tab
  const groupedOKRs = filteredOKRs.reduce((groups: Record<string, any[]>, okr: any) => {
    const tag = okr.tag || 'No Tag';
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push(okr);
    return groups;
  }, {});

  // Sort groups by tag name, with "No Tag" at the end
  const sortedGroups = Object.entries(groupedOKRs).sort(([a], [b]) => {
    if (a === 'No Tag') return 1;
    if (b === 'No Tag') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Quick Action Creation Block */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#3B82F6"/>
                <path d="M19 15L19.91 17.26L22 18L19.91 18.74L19 21L18.09 18.74L16 18L18.09 17.26L19 15Z" fill="#3B82F6"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              Create a quick action
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Describe objectives and activities to generate structured OKRs for this partner.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              placeholder="Example: Increase insurance sales by 25% with activities like digital marketing campaigns, client outreach, and product training..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={2}
              value={quickActionInput}
              onChange={(e) => setQuickActionInput(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={generateOKR}
              disabled={isGenerating || !quickActionInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative min-w-[250px]">
            <input
              type="text"
              placeholder="Search OKR templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <Select value={selectedTags[0] || ""} onValueChange={(value) => setSelectedTags(value ? [value] : [])}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Tags</SelectItem>
                {availableTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Measure Unit Filter */}
          <Select value={selectedMeasureUnit} onValueChange={setSelectedMeasureUnit}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Measure unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Units</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percent">Percent</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Timeframe Filter */}
          <AdvancedTimeframeFilter
            value={advancedTimeframe}
            onValueChange={(value, dateRange) => {
              setAdvancedTimeframe(value);
              console.log('Advanced timeframe filter selected:', value, dateRange);
            }}
            className="w-[200px]"
          />

          {/* Clear Filters */}
          {(searchTerm || selectedTags.length > 0 || selectedMeasureUnit || advancedTimeframe) && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Selection Actions */}
      {selectedOKRs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-blue-700 font-medium mr-2">{selectedOKRs.length} OKR{selectedOKRs.length !== 1 ? 's' : ''} selected</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 p-1 h-auto"
              onClick={() => setSelectedOKRs([])}
            >
              Clear selection
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-blue-700">
              Update Progress
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-700">
              Export
            </Button>
          </div>
        </div>
      )}

      {/* OKR Tables Grouped by Tag - Exact Coming Soon tab structure */}
      {assignedOKRs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            <path d="M10.5 2.25V6a1.5 1.5 0 001.5 1.5h3.75"></path>
          </svg>
          <p className="text-lg font-medium mb-1 text-gray-900">No OKR Templates Assigned</p>
          <p className="text-sm text-gray-500">This partner doesn't have any OKR templates assigned yet. Assign templates from the Partners page to track objectives and key results.</p>
        </div>
      ) : filteredOKRs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No OKRs match your current filters.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-2">Clear Filters</Button>
        </div>
      ) : (
        <div>
          {sortedGroups.map(([groupName, okrsInGroup]) => (
            <div key={groupName} className="bg-white" style={{ marginBottom: '32px' }}>
              <div className="px-6 pb-0 pt-3 bg-[#ffffff] text-[#282A3F]">
                <div className="flex items-center">
                  {groupName === "No Tag" ? (
                    <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium border border-dashed border-gray-400">
                      {groupName}
                    </div>
                  ) : (
                    <TagBadgeLocal tag={groupName} />
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table className="border-b min-w-full" style={{ borderColor: '#E6E7F1' }}>
                  <TableHeader>
                    <TableRow className="border-b hover:bg-[#F5F6FA] group" style={{ borderColor: '#E6E7F1' }}>
                      <TableHead className="w-12 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={okrsInGroup.length > 0 && okrsInGroup.every(okr => selectedOKRs.includes(okr.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOKRs(prev => [...new Set([...prev, ...okrsInGroup.map(okr => okr.id)])]);
                            } else {
                              setSelectedOKRs(prev => prev.filter(id => !okrsInGroup.map(okr => okr.id).includes(id)));
                            }
                          }}
                          className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ 
                            opacity: okrsInGroup.some(okr => selectedOKRs.includes(okr.id)) ? 1 : undefined 
                          }}
                        />
                      </TableHead>

                      <TableHead 
                        className="px-3 py-2 min-w-[300px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Name
                      </TableHead>
                      <TableHead 
                        className="text-right px-3 py-2 min-w-[120px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Realized
                      </TableHead>
                      <TableHead 
                        className="text-right px-3 py-2 min-w-[120px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Target
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[150px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Current Milestone
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[120px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Due Date
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[100px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Traffic Lights
                      </TableHead>
                      <TableHead 
                        className="px-3 py-2 min-w-[120px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Progress
                      </TableHead>
                      <TableHead 
                        className="text-right px-3 py-2 min-w-[80px]"
                        style={{ 
                          fontFamily: 'Poppins', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          color: '#696C8C' 
                        }}
                      >
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {okrsInGroup.map((okr) => (
                      <TableRow key={okr.id} className="hover:bg-[#F5F6FA] border-b group" style={{ borderColor: '#E6E7F1' }}>
                        {/* Checkbox Column - Exact from Coming Soon */}
                        <TableCell className="w-12 px-1 py-3">
                          <div className="flex items-center" style={{ gap: '4px' }}>
                            <input
                              type="checkbox"
                              checked={selectedOKRs.includes(okr.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOKRs(prev => [...prev, okr.id]);
                                } else {
                                  setSelectedOKRs(prev => prev.filter(id => id !== okr.id));
                                }
                              }}
                              className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ opacity: selectedOKRs.includes(okr.id) ? 1 : undefined }}
                            />
                          </div>
                        </TableCell>

                        
                        {/* Name Column with hierarchy and description icons */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center w-full">
                            <span 
                              className="text-[#282A3F]"
                              style={{ 
                                fontFamily: 'Poppins', 
                                fontWeight: '500', 
                                fontSize: '14px' 
                              }}
                            >
                              {okr.title}
                            </span>
                            
                            {/* Hierarchy nesting icon */}
                            {okr.nestedCount > 0 && (
                              <div className="flex items-center" style={{ marginLeft: '4px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="4" cy="4" r="2" fill="#666666"/>
                                  <circle cx="12" cy="12" r="2" fill="#666666"/>
                                  <path d="M4 6C4 8 6 10 10 12" stroke="#666666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                </svg>
                                <span className="text-xs text-gray-500 ml-1">{okr.nestedCount}</span>
                              </div>
                            )}
                            
                            {/* Description icon */}
                            {okr.description && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="14" 
                                height="8" 
                                viewBox="0 0 14 8" 
                                fill="none" 
                                className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
                                style={{ minWidth: '14px', minHeight: '8px', marginLeft: '4px' }}
                              >
                                <rect width="14" height="1" fill="currentColor"/>
                                <rect y="3.5" width="14" height="1" fill="currentColor"/>
                                <rect y="7" width="7" height="1" fill="currentColor"/>
                              </svg>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Realized Column - Editable */}
                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded">
                            {okr.realizedValue ? (
                              okr.unit === 'currency' 
                                ? `€${(okr.realizedValue / 1000000).toFixed(1)}M`
                                : okr.unit === 'percentage'
                                ? `${okr.realizedValue}%`
                                : okr.realizedValue.toString()
                            ) : "—"}
                          </div>
                        </TableCell>
                        
                        {/* Target Column - Editable */}
                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded">
                            {okr.unit === 'currency' 
                              ? `€${(okr.targetValue / 1000000).toFixed(1)}M`
                              : okr.unit === 'percentage'
                              ? `${okr.targetValue}%`
                              : okr.targetValue?.toString() || "—"
                            }
                          </div>
                        </TableCell>
                        
                        {/* Current Milestone Column */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {(() => {
                                const now = new Date();
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return monthNames[now.getMonth()];
                              })()}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M6 3l3 3-3 3V3z"/>
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                        
                        {/* Due Date Column - Editable */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="cursor-pointer hover:bg-gray-50 p-1 rounded text-sm">
                            {okr.endDate ? new Date(okr.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            }) : '—'}
                          </div>
                        </TableCell>
                        
                        {/* Traffic Lights Column */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:scale-110 transition-transform" title="On track"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-200 cursor-pointer hover:scale-110 transition-transform" title="At risk"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-200 cursor-pointer hover:scale-110 transition-transform" title="Off track"></div>
                          </div>
                        </TableCell>
                        
                        {/* Progress Column */}
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${okr.targetValue && okr.realizedValue 
                                    ? Math.min((okr.realizedValue / okr.targetValue) * 100, 100)
                                    : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 min-w-[30px]">
                              {okr.targetValue && okr.realizedValue 
                                ? `${Math.round((okr.realizedValue / okr.targetValue) * 100)}%`
                                : '0%'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions Column - Exact from Coming Soon */}
                        <TableCell className="text-right p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                  <path d="m15 5 4 4"/>
                                </svg>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Assign
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
          ))}
        </div>
      )}
    </div>
  );
}