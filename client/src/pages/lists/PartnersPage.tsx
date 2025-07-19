import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';


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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableTableHead } from "@/components/ui/sortable-table-head";


// Fetch partners from database
const usePartnersData = () => {
  return useQuery({
    queryKey: ['/api/partners'],
    staleTime: 0, // Force fresh data to show updated relationship counts
  });
};

// Hooks for saved lists and segment views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'partners'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=partners'),
    staleTime: 0, // Always fetch fresh data for lists to see immediate updates
    gcTime: 0, // No cache to ensure immediate updates
  });
};

const useSavedViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'partners'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=partners'),
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedList = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-lists', data);
    },
    onSuccess: () => {
      // Clear cache for immediate updates
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'partners'] });
    }
  });
};

const useUpdateSavedList = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest('PUT', `/api/saved-lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
    }
  });
};

const useDeleteSavedList = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/saved-lists/${id}`);
    },
    onSuccess: () => {
      // Clear cache for immediate updates
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'partners'] });
    }
  });
};

const useCreateSavedView = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/saved-views', data);
    },
    onSuccess: () => {
      // Invalidate both the general and specific cache keys to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'partners'] });
    }
  });
};

const useUpdateSavedView = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return apiRequest('PUT', `/api/saved-views/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views', 'partners'] });
    }
  });
};

// Format currency in European format
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate partner statistics
function calculatePartnerStats(partners: any[], opportunities: any[] = []) {
  // Total Partners now shows count of partners currently displayed in the active list/view
  const totalPartners = partners.length;
  // Total Customers counts all customer records linked to the displayed partners
  const totalCustomers = partners.reduce((sum, partner) => {
    const customerCount = parseInt(partner.customers) || 0;
    return sum + customerCount;
  }, 0);
  // Total Opportunities counts all opportunity records attached to the displayed partners
  const totalOpportunities = partners.reduce((sum, partner) => {
    const opportunityCount = parseInt(partner.opportunities) || 0;
    return sum + opportunityCount;
  }, 0);
  
  // Get partner IDs from displayed partners
  const partnerIds = partners.map(p => p.id);
  
  // Filter opportunities that belong to displayed partners
  const relevantOpportunities = opportunities.filter(opp => 
    opp.partnerId && partnerIds.includes(opp.partnerId)
  );
  
  // Total Value sums unique opportunity amounts (no double counting)
  const totalValue = relevantOpportunities.reduce((sum, opp) => {
    const value = parseFloat(opp.estimated_value) || 0;
    return sum + value;
  }, 0);
  
  // Weighted Value calculates probability-adjusted sum of opportunity values
  const weightedValue = relevantOpportunities.reduce((sum, opp) => {
    const value = parseFloat(opp.estimated_value) || 0;
    const probability = opp.stage === 'Closed (Won)' ? 1.0 : 
                      opp.stage === 'Negotiation' ? 0.7 :
                      opp.stage === 'Proposal Sent to Client' ? 0.6 :
                      opp.stage === 'Proposal Sent' ? 0.6 :
                      opp.stage === 'proposal' ? 0.6 :
                      opp.stage === 'Qualified Lead' ? 0.4 :
                      opp.stage === 'qualification' ? 0.4 :
                      opp.stage === 'Validated' ? 0.3 :
                      opp.stage === 'discovery' ? 0.2 :
                      opp.stage === 'Lost' ? 0 :
                      opp.stage === 'Rejected' ? 0 :
                      !opp.stage || opp.stage === '' ? 0.1 : 0.1;
    return sum + (value * probability);
  }, 0);
  const activePartners = partners.filter(p => p.status === 'active').length;
  
  return {
    totalPartners,
    totalCustomers,
    totalOpportunities,
    totalValue,
    weightedValue,
    activePartners
  };
}

// Template badges component for partners  
function TemplateBadges({ partnerId, templateAssignments, okrTags }: { partnerId: number, templateAssignments: any[], okrTags: any[] }) {
  const partnerAssignments = templateAssignments.filter((assignment: any) => assignment.entity_id === partnerId);
  
  if (partnerAssignments.length === 0) {
    return (
      <span className="text-gray-400 text-xs">No templates</span>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {partnerAssignments.slice(0, 2).map((assignment: any) => {
        // Get the first tag name and find its color from the tags list
        let tagColor = '#6b7280'; // default gray
        if (assignment.tags && assignment.tags.length > 0) {
          const firstTagName = assignment.tags[0];
          const tagData = okrTags.find((tag: any) => tag.name === firstTagName);
          if (tagData && tagData.color) {
            tagColor = tagData.color;
          }
        }
        
        // Create initials from template name
        const initials = assignment.template_name ? 
          assignment.template_name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase() : 
          'T';
        
        return (
          <div 
            key={assignment.id} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: `${tagColor}20`,
              color: tagColor,
              border: `1px solid ${tagColor}40`
            }}
            title={assignment.template_name}
          >
            {initials}
          </div>
        );
      })}
      {partnerAssignments.length > 2 && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          +{partnerAssignments.length - 2}
        </div>
      )}
    </div>
  );
}

// Define interface for saved lists
interface SavedList {
  id: string;
  name: string;
  description?: string;
  type?: 'filter' | 'selection'; // 'filter' for Saved Filters, 'selection' for Custom Lists
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    size?: string;
  };
  members?: number[]; // Array of partner IDs for Custom Lists
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean; // Flag for system-generated default lists that can't be edited/deleted
}

// Define interface for saved segment views (filter combinations)
interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchText?: string;
    status?: string;
    industry?: string;
    size?: string;
  };
  createdBy: string;
  createdAt: Date;
}

// Main partner list component
// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

// This function has been removed and integrated into the main PartnersPage function
// to fix the duplicate function issue and implement proper Fields functionality
  
export default function PartnersPage() {
  const [isEditingList, setIsEditingList] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form data for creating new partner with all available fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactEmail: '',
    primaryContact: '',
    partnerType: 'partner',
    region: '',
    status: 'active',
    industry: 'Insurance',
    size: 'medium'
  });

  const handleCreatePartner = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create partner');
      }

      const newPartner = await response.json();
      
      // Invalidate and refetch partners data
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      
      toast({
        title: "Partner Created",
        description: `"${formData.name}" has been created successfully.`
      });

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        location: '',
        contactEmail: '',
        primaryContact: '',
        partnerType: 'partner',
        region: '',
        status: 'active',
        industry: 'Insurance',
        size: 'medium'
      });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create partner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Fetch partners data
  const { data: partners = [], isLoading, error } = usePartnersData();
  
  // Fields functionality state - exactly matching PartnerDetail.tsx pattern
  const [showPartnerFieldsDropdown, setShowPartnerFieldsDropdown] = useState(false);
  const [partnerVisibleFields, setPartnerVisibleFields] = useState({
    name: true,
    industry: true,
    size: true,
    region: true,
    status: true,
    customers: true,
    opportunities: true,
    contacts: true,
    template: true
  });
  
  // Ref for Fields dropdown
  const partnerFieldsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close Fields dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partnerFieldsDropdownRef.current && !partnerFieldsDropdownRef.current.contains(event.target as Node)) {
        setShowPartnerFieldsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check if field selections have changed from default
  const hasFieldChanges = () => {
    const defaultFields = {
      name: true,
      industry: true,
      size: true,
      region: true,
      status: true,
      customers: true,
      opportunities: true,
      contacts: true,
      template: true
    };
    return JSON.stringify(partnerVisibleFields) !== JSON.stringify(defaultFields);
  };
  
  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <div className="container mx-auto pb-6">
        
        {/* Toolbar with Fields functionality */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            
            {/* Fields button - exact pattern from PartnerDetail.tsx */}
            <div className="relative" ref={partnerFieldsDropdownRef}>
              <button
                onClick={() => setShowPartnerFieldsDropdown(!showPartnerFieldsDropdown)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                  hasFieldChanges() 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 3v18"/>
                  <path d="M15 3v18"/>
                </svg>
                Fields
                <span className="text-xs text-gray-500">
                  ({Object.values(partnerVisibleFields).filter(Boolean).length}/{Object.keys(partnerVisibleFields).length})
                </span>
              </button>
              
              {/* Fields dropdown - exact pattern from PartnerDetail.tsx */}
              {showPartnerFieldsDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Column Visibility</h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const allSelected = Object.values(partnerVisibleFields).every(Boolean);
                            if (allSelected) {
                              // Keep name always visible, uncheck others
                              setPartnerVisibleFields({
                                name: true,
                                industry: false,
                                size: false,
                                region: false,
                                status: false,
                                customers: false,
                                opportunities: false,
                                contacts: false,
                                template: false
                              });
                            } else {
                              // Select all
                              setPartnerVisibleFields({
                                name: true,
                                industry: true,
                                size: true,
                                region: true,
                                status: true,
                                customers: true,
                                opportunities: true,
                                contacts: true,
                                template: true
                              });
                            }
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                          {Object.values(partnerVisibleFields).every(Boolean) ? 'Clear' : 'Select All'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Field List */}
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {[
                      { key: 'name', label: 'Partner', required: true },
                      { key: 'industry', label: 'Industry' },
                      { key: 'size', label: 'Size' },
                      { key: 'region', label: 'Region' },
                      { key: 'status', label: 'Status' },
                      { key: 'customers', label: 'Customers' },
                      { key: 'opportunities', label: 'Opportunities' },
                      { key: 'contacts', label: 'Contacts' },
                      { key: 'template', label: 'Template' }
                    ].map((field) => (
                      <label key={field.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className={`text-sm ${field.required ? 'text-gray-500' : 'text-gray-700'}`}>
                          {field.label}
                          {field.required && <span className="text-xs ml-1">(Required)</span>}
                        </span>
                        <input
                          type="checkbox"
                          checked={partnerVisibleFields[field.key]}
                          disabled={field.required}
                          onChange={(e) => {
                            setPartnerVisibleFields(prev => ({
                              ...prev,
                              [field.key]: e.target.checked
                            }));
                          }}
                          className={`h-4 w-4 rounded border-gray-300 ${field.required ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 focus:ring-indigo-500'}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 px-4 h-8 text-white rounded-md transition-colors font-medium text-[14px] bg-[#5567E5] hover:bg-[#4556D4]"
              onClick={() => setShowCreateModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create new partner
            </button>
          </div>
        </div>
        
        {/* Simple Partners Table */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Loading partners...</div>
          ) : (
            <div className="text-center py-8">
              <p>Partners table implementation</p>
              <p>Found {partners.length} partners</p>
              <p>Fields: {Object.entries(partnerVisibleFields).filter(([_, visible]) => visible).map(([key, _]) => key).join(', ')}</p>
            </div>
          )}
        </div>

        {/* Create Partner Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Partner</DialogTitle>
              <DialogDescription>
                Add a new partner to your network. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter partner name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input
                    id="primaryContact"
                    value={formData.primaryContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the partner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerType">Partner Type</Label>
                  <Select value={formData.partnerType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnerType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Banking">Banking</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePartner} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Partner'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ListEditingContext.Provider>
  );
}