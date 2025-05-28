import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Create a context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
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

// Fetch customers from database
const useCustomersData = () => {
  return useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const response = await fetch('/api/customers');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const text = await response.text();
      console.log('Response text preview:', text.substring(0, 200));
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON response');
      }
    },
  });
};

export default function CustomersPageClean() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  
  // State management
  const [isEditingList, setIsEditingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    industry: [] as string[],
    size: [] as string[],
    status: [] as string[]
  });
  
  // Dialog states
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  
  // Data fetching
  const { data: customers = [], isLoading, error } = useCustomersData();

  // Filter and search logic
  const filteredCustomers = customers.filter((customer: any) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = activeFilters.industry.length === 0 || activeFilters.industry.includes(customer.industry);
    const matchesSize = activeFilters.size.length === 0 || activeFilters.size.includes(customer.size);
    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(customer.status || 'active');
    
    return matchesSearch && matchesIndustry && matchesSize && matchesStatus;
  });

  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c: any) => c.id));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Error loading customers: {error.message}</div>
      </div>
    );
  }

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="p-6 space-y-6">
        {/* Header - exact match to Opportunities */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-black">Customers</h1>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] pl-[12px] pr-[12px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
            onClick={() => {
              if (!isEditingList) {
                alert("Create new customer functionality coming soon!");
              }
            }}
            disabled={isEditingList}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create new customer
          </button>
        </div>

        {/* Unified toolbar - exact copy from Opportunities */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row with saved lists and action buttons */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Left side - Saved Lists with actions */}
              <div className="flex items-center gap-3">
                {/* Lists heading */}
                <div className="flex flex-col mr-2">
                  <span className="text-base font-semibold text-gray-800 mb-2">Lists</span>
                </div>
                {/* Saved Lists dropdown - exact match to Opportunities */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                      <path d="M5.25 1.5V4.25H12.6875V2C12.6875 1.725 12.4906 1.5 12.25 1.5H5.25ZM3.9375 1.5H1.75C1.50937 1.5 1.3125 1.725 1.3125 2V4.25H3.9375V1.5ZM1.3125 5.75V8.25H3.9375V5.75H1.3125ZM1.3125 9.75V12C1.3125 12.275 1.50937 12.5 1.75 12.5H3.9375V9.75H1.3125ZM5.25 12.5H12.25C12.4906 12.5 12.6875 12.275 12.6875 12V9.75H5.25V12.5ZM12.6875 8.25V5.75H5.25V8.25H12.6875ZM0 2C0 0.896875 0.784766 0 1.75 0H12.25C13.2152 0 14 0.896875 14 2V12C14 13.1031 13.2152 14 12.25 14H1.75C0.784766 14 0 13.1031 0 12V2Z" fill="#3E4DC4"/>
                    </svg>
                    <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      All Customers
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
                      className="transition-transform"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Right-side action buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export
                </Button>
              </div>
            </div>
            
            {/* Bottom row with search, views, and filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-grow">
                {/* Search field */}
                <div className="relative w-60">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      className="transition-transform"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                
                {/* Filter buttons next to the views dropdown */}
                <div className="flex items-center gap-2 ml-3">
                  <button 
                    className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Status</span>
                  </button>
                  
                  <button 
                    className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Type</span>
                  </button>
                  
                  <button 
                    className="flex items-center px-3 py-2 border rounded-md text-sm font-medium border-gray-300 text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Industry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remove old search section */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 text-sm border-gray-300 text-gray-500 placeholder-gray-400"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50">
                <span className="text-blue-600 mr-2">📌</span>
                Select a view
                <span className="ml-2 text-gray-400">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Standard View</DropdownMenuItem>
              <DropdownMenuItem>Compact View</DropdownMenuItem>
              <DropdownMenuItem>Detailed View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50">
                <span className="text-blue-600 mr-2">🔽</span>
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Inactive</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50">
                <span className="text-blue-600 mr-2">🔽</span>
                Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Customer</DropdownMenuItem>
              <DropdownMenuItem>Prospect</DropdownMenuItem>
              <DropdownMenuItem>Lead</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50">
                <span className="text-blue-600 mr-2">🔽</span>
                Industry
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Insurance</DropdownMenuItem>
              <DropdownMenuItem>Technology</DropdownMenuItem>
              <DropdownMenuItem>Healthcare</DropdownMenuItem>
              <DropdownMenuItem>Finance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistics Cards - exact match to Opportunities layout */}
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-black">{filteredCustomers.length}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black">0</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black">€10K</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black">€5K</div>
            <div className="text-sm text-gray-500">Weighted Value</div>
          </div>
        </div>

        {/* Table - exact match to Opportunities */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 w-12">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Customer <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Partner <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Industry <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Type <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Value <span className="text-gray-400">↕</span></th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Template</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleCustomerSelect(customer.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                            {customer.initials || customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">Van Damme BVBA</td>
                    <td className="p-4 text-sm text-gray-900">No Partner</td>
                    <td className="p-4 text-sm text-gray-900">Customer</td>
                    <td className="p-4 text-sm text-gray-900">Discovery</td>
                    <td className="p-4 text-sm text-gray-900">Open</td>
                    <td className="p-4 text-sm text-gray-900">€10,000</td>
                    <td className="p-4">
                      <div className="flex space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs font-medium">
                            NB
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
                            PR
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New List Dialog */}
        <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as List</DialogTitle>
              <DialogDescription>
                Create a new saved list with the selected customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name..."
                />
              </div>
              <div>
                <Label htmlFor="list-description">Description (optional)</Label>
                <Textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Enter list description..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={() => {
                if (newListName.trim()) {
                  toast({
                    title: "List Created",
                    description: `"${newListName}" has been saved with ${selectedCustomers.length} customers.`,
                  });
                  setNewListName('');
                  setNewListDescription('');
                  setIsNewListDialogOpen(false);
                  setSelectedCustomers([]);
                }
              }}>
                Create List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingContext.Provider>
  );
}