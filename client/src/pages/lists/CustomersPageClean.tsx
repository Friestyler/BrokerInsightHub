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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Create new customer
          </Button>
        </div>

        {/* Lists and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Lists</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    📋 All Customers
                    <span className="ml-2">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Customers</DropdownMenuItem>
                  <DropdownMenuItem>Active Customers</DropdownMenuItem>
                  <DropdownMenuItem>Recent Customers</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            📤 Export
          </Button>
        </div>

        {/* Search and Filter Row */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by name, industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                📌 Select a view
                <span className="ml-2">▼</span>
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
              <Button variant="outline" size="sm">
                🔽 Status
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
              <Button variant="outline" size="sm">
                🔽 Industry
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Insurance</DropdownMenuItem>
              <DropdownMenuItem>Technology</DropdownMenuItem>
              <DropdownMenuItem>Healthcare</DropdownMenuItem>
              <DropdownMenuItem>Finance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                🔽 Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Customer</DropdownMenuItem>
              <DropdownMenuItem>Prospect</DropdownMenuItem>
              <DropdownMenuItem>Lead</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold">{filteredCustomers.length}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Active Customers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold">NaN</div>
              <div className="text-sm text-muted-foreground">Total Partners</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold">NaN</div>
              <div className="text-sm text-muted-foreground">Total Opportunities</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">
                      <Checkbox
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-600">Customer ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Industry ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Type ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Size ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Partners ↕</th>
                    <th className="text-left p-4 font-medium text-gray-600">Opportunities</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: any) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => handleCustomerSelect(customer.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                              {customer.initials || customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{customer.industry || 'Insurance'}</td>
                      <td className="p-4 text-gray-600">{customer.type || 'Customer'}</td>
                      <td className="p-4 text-gray-600">{customer.size || 'Medium'}</td>
                      <td className="p-4 text-gray-600">{customer.status || 'Active'}</td>
                      <td className="p-4 text-gray-600">-</td>
                      <td className="p-4 text-gray-600">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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