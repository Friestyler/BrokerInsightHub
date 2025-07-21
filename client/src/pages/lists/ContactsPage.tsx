import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/ShareModal";
import { FieldsSelector } from "@/components/shared/FieldsSelector";
import { 
  Search, 
  Plus, 
  X, 
  Bookmark, 
  BarChart3, 
  ChevronDown, 
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  Target,
  Columns3,
  Mail,
  Phone,
  Building2,
  User
} from 'lucide-react';

import { SortableTableHead } from "@/components/ui/sortable-table-head";

// Type definitions
interface SavedList {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  members?: any[];
}

interface SavedView {
  id: number;
  name: string;
  entity_type: string;
  filters?: any;
  fields?: any;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  company?: string;
  linked_entity_type?: string;
  linked_entity_id?: number;
  is_primary?: boolean;
  notes?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Fetch contacts from database
const useContactsData = () => {
  return useQuery({
    queryKey: ['/api/degoudse/contacts'],
    queryFn: () => apiRequest('GET', '/api/degoudse/contacts'),
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

// Hooks for saved lists and views
const useSavedLists = () => {
  return useQuery({
    queryKey: ['/api/saved-lists', 'contacts'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=contacts'),
    staleTime: 0,
    gcTime: 0,
  });
};

const useCreateSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('POST', '/api/saved-lists', newList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'contacts'] });
    }
  });
};

const useSavedSegmentViews = () => {
  return useQuery({
    queryKey: ['/api/saved-views', 'contacts'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=contacts'),
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateSavedSegmentView = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newView: any) => {
      return apiRequest('POST', '/api/saved-views', newView);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
    }
  });
};

const useCreateSharedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shareData: any) => {
      return apiRequest('POST', '/api/shared-lists', shareData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-lists'] });
    }
  });
};

const useDeleteSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listId: number) => {
      return apiRequest('DELETE', `/api/saved-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists', 'contacts'] });
    }
  });
};

// Calculate contact statistics
function calculateContactStats(contacts: any[]) {
  const totalContacts = contacts.length;
  const withEmail = contacts.filter(c => c.email && c.email.trim()).length;
  const withPhone = contacts.filter(c => c.phone && c.phone.trim()).length;
  const primaryContacts = contacts.filter(c => c.is_primary).length;
  
  return {
    totalContacts,
    withEmail,
    withPhone,
    primaryContacts
  };
}

export default function ContactsPage() {
  const { environment } = useEnvironment();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState<{field: string, direction: 'asc' | 'desc'}>({field: 'full_name', direction: 'asc'});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedExistingList, setSelectedExistingList] = useState<number | null>(null);

  // Form state for creating new contact
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department: '',
    company: '',
    notes: ''
  });

  // Data fetching
  const { data: contacts = [], isLoading: contactsLoading } = useContactsData();
  const { data: savedLists = [] } = useSavedLists();
  const { data: savedViews = [] } = useSavedSegmentViews();

  // Mutations
  const createListMutation = useCreateSavedList();
  const createViewMutation = useCreateSavedSegmentView();
  const createSharedListMutation = useCreateSharedList();
  const deleteListMutation = useDeleteSavedList();

  // Filter and sort contacts
  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch = !searchText || 
      contact.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'with-email' && contact.email) ||
      (activeFilter === 'with-phone' && contact.phone) ||
      (activeFilter === 'primary' && contact.is_primary);
    
    return matchesSearch && matchesFilter;
  }).sort((a: Contact, b: Contact) => {
    const aVal = a[sortConfig.field as keyof Contact] || '';
    const bVal = b[sortConfig.field as keyof Contact] || '';
    if (sortConfig.direction === 'asc') {
      return String(aVal).localeCompare(String(bVal));
    }
    return String(bVal).localeCompare(String(aVal));
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  // Statistics
  const stats = calculateContactStats(filteredContacts);

  // Handle form submission
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Validation Error",
        description: "Please enter first and last name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const contactData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        jobTitle: formData.job_title,
        department: formData.department,
        company: formData.company,
        notes: formData.notes,
        isActive: true
      };
      
      await apiRequest('POST', '/api/contacts', contactData);
      
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      setShowCreateDialog(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        department: '',
        company: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
    }
  };

  // Handle save to list
  const handleSaveToList = async () => {
    if (selectedContacts.length === 0) return;

    try {
      if (saveListMode === 'new') {
        if (!newListName.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter a list name.",
            variant: "destructive"
          });
          return;
        }

        await createListMutation.mutateAsync({
          name: newListName,
          description: newListDescription,
          entityType: 'contacts',
          members: selectedContacts
        });
      } else {
        if (!selectedExistingList) {
          toast({
            title: "Validation Error", 
            description: "Please select a list.",
            variant: "destructive"
          });
          return;
        }

        await apiRequest('POST', `/api/saved-lists/${selectedExistingList}/members`, {
          members: selectedContacts
        });
      }

      toast({
        title: "Success",
        description: `${selectedContacts.length} contact(s) saved to list successfully`,
      });

      setShowSaveListModal(false);
      setNewListName('');
      setNewListDescription('');
      setSelectedExistingList(null);
      setSelectedContacts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contacts to list",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 mx-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center gap-2">
          <FieldsSelector 
            entityType="contacts"
            onFieldsChange={() => {}}
          />
          <Button onClick={() => setShowCreateDialog(true)} className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            Create new contact
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-8 w-64"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'with-email', 'with-phone', 'primary'].map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All contacts' :
                 filter === 'with-email' ? 'With email' :
                 filter === 'with-phone' ? 'With phone' :
                 'Primary contacts'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalContacts}</div>
                <div className="text-sm text-gray-500">Total Contacts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.withEmail}</div>
                <div className="text-sm text-gray-500">With Email</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.withPhone}</div>
                <div className="text-sm text-gray-500">With Phone</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.primaryContacts}</div>
                <div className="text-sm text-gray-500">Primary Contacts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedContacts.length} contact(s) selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSaveListModal(true)}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Save to list
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedContacts([])}
            >
              <X className="w-4 h-4 mr-1" />
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts(filteredContacts.map(c => c.id));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                    />
                  </th>
                  <SortableTableHead
                    sortKey="full_name"
                    currentSortKey={sortConfig.field}
                    currentDirection={sortConfig.direction}
                    onSort={(key) => setSortConfig({field: key, direction: sortConfig.field === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                    className="text-left"
                  >
                    Name
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="email"
                    currentSortKey={sortConfig.field}
                    currentDirection={sortConfig.direction}
                    onSort={(key) => setSortConfig({field: key, direction: sortConfig.field === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                    className="text-left"
                  >
                    Email
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="phone"
                    currentSortKey={sortConfig.field}
                    currentDirection={sortConfig.direction}
                    onSort={(key) => setSortConfig({field: key, direction: sortConfig.field === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                    className="text-left"
                  >
                    Phone
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="company"
                    currentSortKey={sortConfig.field}
                    currentDirection={sortConfig.direction}
                    onSort={(key) => setSortConfig({field: key, direction: sortConfig.field === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                    className="text-left"
                  >
                    Company
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="job_title"
                    currentSortKey={sortConfig.field}
                    currentDirection={sortConfig.direction}
                    onSort={(key) => setSortConfig({field: key, direction: sortConfig.field === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                    className="text-left"
                  >
                    Job Title
                  </SortableTableHead>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contactsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Loading contacts...
                    </td>
                  </tr>
                ) : paginatedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  paginatedContacts.map((contact: Contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            } else {
                              setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {contact.first_name?.[0]}{contact.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{contact.full_name}</div>
                            {contact.department && (
                              <div className="text-sm text-gray-500">{contact.department}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{contact.email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{contact.phone || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{contact.company || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{contact.job_title || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {contact.is_primary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                          {contact.linked_entity_type && (
                            <Badge variant="outline" className="text-xs">
                              {contact.linked_entity_type}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>Add a new contact to your database</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Save to List Dialog */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to List</DialogTitle>
            <DialogDescription>
              Save {selectedContacts.length} contact(s) to a list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-list"
                  name="saveMode"
                  value="new"
                  checked={saveListMode === 'new'}
                  onChange={() => setSaveListMode('new')}
                  className="h-4 w-4"
                />
                <label htmlFor="new-list" className="text-sm font-medium">
                  Create new list
                </label>
              </div>
              {saveListMode === 'new' && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">List name</label>
                    <Input
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter list name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description (optional)</label>
                    <Textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="Enter description"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing-list"
                  name="saveMode"
                  value="existing"
                  checked={saveListMode === 'existing'}
                  onChange={() => setSaveListMode('existing')}
                  className="h-4 w-4"
                />
                <label htmlFor="existing-list" className="text-sm font-medium">
                  Add to existing list
                </label>
              </div>
              {saveListMode === 'existing' && (
                <div className="ml-6">
                  <Select 
                    value={selectedExistingList ? selectedExistingList.toString() : ''} 
                    onValueChange={(value) => setSelectedExistingList(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a list" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedLists?.map((list: any) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveListModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveToList}
              disabled={createListMutation.isPending}
            >
              {createListMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
