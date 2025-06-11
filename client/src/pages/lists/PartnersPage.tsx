import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import EntityAvatar from "@/components/EntityAvatar";
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

// Fetch partners from database
const usePartnersData = () => {
  return useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await fetch('/api/partners');
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      return response.json();
    }
  });
};

// Fetch saved lists for partners
const useSavedListsData = () => {
  return useQuery({
    queryKey: ['/api/saved-lists'],
    queryFn: async () => {
      const response = await fetch('/api/saved-lists');
      if (!response.ok) {
        throw new Error('Failed to fetch saved lists');
      }
      return response.json();
    }
  });
};

function PartnersTable() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isEditingList } = useContext(ListEditingContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [showListsDropdown, setShowListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: partnersData, isLoading: partnersLoading } = usePartnersData();
  const { data: savedListsData = [], isLoading: savedListsLoading } = useSavedListsData();

  const partners = partnersData || [];
  
  // Filter saved lists for partners only
  const partnerSavedListsData = savedListsData.filter((list: any) => list.type === 'partners');

  // Get filtered partners based on active list and search
  const getFilteredPartners = () => {
    let filtered = partners;
    
    // Apply list filter
    if (activeList && activeList.members) {
      const memberIds = activeList.members.map((m: any) => m.id);
      filtered = filtered.filter((partner: any) => memberIds.includes(partner.id));
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((partner: any) => 
        partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.primaryContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredPartners = getFilteredPartners();

  const handleSelectAll = () => {
    if (selectedPartners.length === filteredPartners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(filteredPartners.map((partner: any) => partner.id));
    }
  };

  const handleSelectPartner = (partnerId: number) => {
    setSelectedPartners(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const isAllSelected = filteredPartners.length > 0 && selectedPartners.length === filteredPartners.length;
  const isIndeterminate = selectedPartners.length > 0 && selectedPartners.length < filteredPartners.length;

  if (partnersLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading partners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title, saved lists, and actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          {/* Top row with title and main actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Saved lists dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 text-left hover:bg-gray-50 rounded-md px-2 py-1"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    {activeList ? activeList.name : "All Partners"}
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
                    className={`transition-transform ${showListsDropdown ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {/* Saved Lists dropdown menu */}
                {showListsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-2">
                      {/* Default "All Partners" option */}
                      <button
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-[#F5F6FA] flex items-center justify-between ${!activeList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : ''}`}
                        onClick={() => {
                          setActiveList(null);
                          setShowListsDropdown(false);
                        }}
                      >
                        <span>All Partners</span>
                        <span className="text-gray-500">({partners.length})</span>
                      </button>
                      
                      {/* Saved lists from database (filtered for partners only) */}
                      {partnerSavedListsData.map((list: any) => (
                        <button
                          key={list.id}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-[#F5F6FA] flex items-center justify-between ${activeList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : ''}`}
                          onClick={() => {
                            setActiveList(list);
                            setShowListsDropdown(false);
                          }}
                        >
                          <span>{list.name}</span>
                          <span className="text-gray-500">({list.members?.length || 0})</span>
                        </button>
                      ))}
                      
                      {partnerSavedListsData.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">
                          No saved lists yet. Select partners and create your first list.
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  placeholder="Search partners..."
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
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedPartners.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between min-h-[32px]">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedPartners.length} partner{selectedPartners.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPartners([])}>
                Clear Selection
              </Button>
              <Button variant="outline" size="sm">
                Add to List
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no partners selected */}
      {selectedPartners.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-center min-h-[32px]">
            <span className="text-sm text-gray-600">
              Select at least one partner from the list to perform bulk actions
            </span>
          </div>
        </div>
      )}

      {/* Partners table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isIndeterminate ? "data-[state=checked]:bg-blue-600" : ""}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPartners.map((partner: any) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedPartners.includes(partner.id)}
                      onCheckedChange={() => handleSelectPartner(partner.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <EntityAvatar 
                        name={partner.name} 
                        type="partner" 
                        id={partner.id}
                        className="h-8 w-8 mr-3"
                      />
                      <div>
                        <Link href={`/partners/${partner.id}`}>
                          <span className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                            {partner.name}
                          </span>
                        </Link>
                        {partner.description && (
                          <p className="text-sm text-gray-500 mt-1">{partner.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary" className="capitalize">
                      {partner.partnerType || 'Partner'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {partner.location || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {partner.primaryContact || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <Badge 
                      variant={partner.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {partner.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/partners/${partner.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Partner
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No partners match your search criteria.' : 'Get started by adding your first partner.'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Add Partner
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartnersPageContent() {
  const [isEditingList, setIsEditingList] = useState(false);

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="p-6">
        <PartnersTable />
      </div>
    </ListEditingContext.Provider>
  );
}

export default function PartnersPage() {
  return <PartnersPageContent />;
}