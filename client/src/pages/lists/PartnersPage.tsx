import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FieldsSelector } from '@/components/shared/FieldsSelector';

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

// Hook to use list editing context
function useListEditing() {
  return useContext(ListEditingContext);
}

// Main partner list component
function PartnersPage() {
  // Import navigate function for routing
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Fetch partners from database
  const { data: partners = [], isLoading, error } = usePartnersData();
  
  // Calculate display partners (for now, show all partners)
  const displayedPartners = partners;

  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading partners...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalPartners: displayedPartners.length,
    totalOpportunities: displayedPartners.reduce((sum, partner) => sum + (partner.opportunityCount || 0), 0),
    totalCustomers: displayedPartners.reduce((sum, partner) => sum + (partner.customerCount || 0), 0),
    totalValue: displayedPartners.reduce((sum, partner) => sum + (partner.totalValue || 0), 0),
    weightedValue: displayedPartners.reduce((sum, partner) => sum + (partner.totalValue || 0), 0)
  };

  return (
    <div className="space-y-1">
      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mx-4 py-6">
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalPartners}</div>
            <div className="text-gray-500 font-medium text-[13px]">Total Partners</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalOpportunities}</div>
            <div className="text-sm text-gray-500">Total Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-500">Total Value Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E6E7F1] bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-sm hover:border-[#D6D7E4] transition-all duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-[#282A3F]">{formatCurrency(Math.round(stats.weightedValue))}</div>
            <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
          </CardContent>
        </Card>
      </div>

      {/* Partners table - without toolbar functionalities */}
      <div className="mx-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E7F1] text-left">
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Partner</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Industry</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Size</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Region</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Status</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Customers</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Opportunities</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Contacts</th>
                <th className="py-3 px-4 font-medium text-[#282A3F] text-sm">Template</th>
              </tr>
            </thead>
            <tbody>
              {displayedPartners.map((partner) => (
                <tr 
                  key={partner.id} 
                  className="border-b border-[#E6E7F1] hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/lists/partners/${partner.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partner.logo} alt={partner.name} />
                        <AvatarFallback className="text-xs">
                          {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[#282A3F] text-sm">{partner.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.industry || 'Insurance'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.size || 'Medium'}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.region || 'Europe'}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                      {partner.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.customerCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">{partner.opportunityCount || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">172</td>
                  <td className="py-3 px-4 text-sm text-[#696C8C]">No templates</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PartnersPage;
