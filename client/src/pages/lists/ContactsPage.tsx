import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Mail, Phone, BarChart3, MoreHorizontal, User, Star, Tag as TagIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagCategoryManager from "@/components/contacts/TagCategoryManager";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FieldsSelector } from "@/components/shared/FieldsSelector";

interface Contact {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
  reportsTo?: number;
  supervisorName?: string;
  notes?: string;
  linkedEntityType?: string;
  linkedEntityId?: number;
  tags?: Array<{
    id: number;
    name: string;
    color: string;
    category?: {
      id: number;
      name: string;
      color: string;
    };
  }>;
}

// Calculate enrichment percentage for contact
const calculateEnrichmentPercentage = (contact: Contact): number => {
  const totalFields = 8; // Total meaningful fields for enrichment
  let completedFields = 0;
  
  // Core contact fields
  if (contact.fullName?.trim()) completedFields++;
  if (contact.email?.trim()) completedFields++;
  if (contact.phone?.trim()) completedFields++;
  if (contact.company?.trim()) completedFields++;
  if (contact.jobTitle?.trim()) completedFields++;
  if (contact.department?.trim()) completedFields++;
  if (contact.reportsTo) completedFields++;
  if (contact.notes?.trim()) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

// Get enrichment status color
const getEnrichmentColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600 bg-green-50';
  if (percentage >= 60) return 'text-blue-600 bg-blue-50';
  if (percentage >= 40) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

interface CompanyGroup {
  name: string;
  contacts: Contact[];
  count: number;
}

// Sort header component for tables
const SortableHeader = ({ 
  children, 
  field, 
  currentField, 
  currentDirection, 
  onSort 
}: { 
  children: React.ReactNode;
  field: string;
  currentField: string;
  currentDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}) => {
  const isActive = currentField === field;
  
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" 
        onClick={() => onSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {isActive && (
          <span className="text-blue-600">
            {currentDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
};

export default function ContactsPage() {
  // UI State
  const [searchText, setSearchText] = useState('');
  const [groupBy, setGroupBy] = useState('Role'); // Default to Role tag category
  const [sortConfig, setSortConfig] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'fullName',
    direction: 'asc'
  });
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[]>(['fullName', 'title', 'attributes', 'entities', 'network', 'enrichment', 'actions']);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  
  // Available fields for contacts  
  const availableFields = [
    { key: 'contact', label: 'Contact', required: true },
    { key: 'title', label: 'Title', required: false },
    { key: 'attributes', label: 'Attributes', required: false },
    { key: 'entities', label: 'Entities', required: false },
    { key: 'network', label: 'Network', required: false },
    { key: 'enrichment', label: 'Enrichment', required: false },
    { key: 'actions', label: 'Actions', required: false },
  ];

  // Form state for creating new contact
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    company: '',
    reportsTo: null as number | null,
    notes: ''
  });

  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { toast } = useToast();

  // Data fetching
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/degoudse/contacts'],
    queryFn: () => apiRequest('GET', '/api/degoudse/contacts')
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['/api/degoudse/tags'],
    queryFn: () => apiRequest('GET', '/api/degoudse/tags')
  });

  // Mutations
  const createContactMutation = useMutation({
    mutationFn: (contactData: typeof formData) => 
      apiRequest('/api/degoudse/contacts', 'POST', {
        ...contactData,
        fullName: `${contactData.firstName} ${contactData.lastName}`.trim()
      }),
    onSuccess: () => {
      setShowCreateDialog(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        department: '',
        company: '',
        reportsTo: null,
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      toast({ title: 'Contact created successfully' });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: (contactData: { id: number } & typeof formData) => 
      apiRequest(`/api/degoudse/contacts/${contactData.id}`, 'PUT', {
        ...contactData,
        fullName: `${contactData.firstName} ${contactData.lastName}`.trim()
      }),
    onSuccess: () => {
      setShowEditDialog(false);
      setEditingContact(null);
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      toast({ title: 'Contact updated successfully' });
    }
  });

  // Group contacts by selected tag category (Leadership, Department, etc.)
  const groupedContacts = contacts.reduce((groups: CompanyGroup[], contact: Contact) => {
    // If contact has no tags, put in "No Tags" group
    if (!contact.tags || contact.tags.length === 0) {
      let group = groups.find(g => g.name === 'No Tags');
      if (!group) {
        group = {
          name: 'No Tags',
          contacts: [],
          count: 0
        };
        groups.push(group);
      }
      group.contacts.push(contact);
      group.count = group.contacts.length;
      return groups;
    }

    // Find tags that belong to the selected category
    const tagsInSelectedCategory = contact.tags.filter((tag: any) => {
      const categoryName = tag.category?.name || tag.category || 'Uncategorized';
      return categoryName === groupBy;
    });

    // If no tags in selected category, put in "Other" group
    if (tagsInSelectedCategory.length === 0) {
      let group = groups.find(g => g.name === 'Other');
      if (!group) {
        group = {
          name: 'Other',
          contacts: [],
          count: 0
        };
        groups.push(group);
      }
      
      if (!group.contacts.find(c => c.id === contact.id)) {
        group.contacts.push(contact);
        group.count = group.contacts.length;
      }
      return groups;
    }

    // Group by individual tags within the selected category
    tagsInSelectedCategory.forEach((tag: any) => {
      let group = groups.find(g => g.name === tag.name);
      if (!group) {
        group = {
          name: tag.name,
          contacts: [],
          count: 0
        };
        groups.push(group);
      }
      
      // Only add contact if not already in this group (avoid duplicates)
      if (!group.contacts.find(c => c.id === contact.id)) {
        group.contacts.push(contact);
        group.count = group.contacts.length;
      }
    });

    return groups;
  }, []);

  // Sort tag groups by priority based on selected category
  const sortedGroupedContacts = groupedContacts.sort((a, b) => {
    if (groupBy === 'Role') {
      const rolePriority = ['Executive', 'VP', 'Director', 'Manager', 'Other'];
      const aIndex = rolePriority.indexOf(a.name);
      const bIndex = rolePriority.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    } else if (groupBy === 'Department') {
      const departmentPriority = ['Marketing', 'Sales', 'HR', 'Operations', 'IT', 'General'];
      const aIndex = departmentPriority.indexOf(a.name);
      const bIndex = departmentPriority.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }
    
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  // Filter and search
  const filteredGroups = sortedGroupedContacts.filter(group => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return group.name.toLowerCase().includes(searchLower) ||
           group.contacts.some(contact => 
             contact.fullName.toLowerCase().includes(searchLower) ||
             contact.email?.toLowerCase().includes(searchLower) ||
             contact.jobTitle?.toLowerCase().includes(searchLower)
           );
  });

  // Event handlers
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateContact = () => {
    if (!formData.firstName || !formData.lastName) {
      toast({ title: 'First name and last name are required', variant: 'destructive' });
      return;
    }
    createContactMutation.mutate(formData);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      department: contact.department || '',
      company: contact.company || '',
      reportsTo: contact.reportsTo || null,
      notes: contact.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;
    if (!formData.firstName || !formData.lastName) {
      toast({ title: 'First name and last name are required', variant: 'destructive' });
      return;
    }
    updateContactMutation.mutate({ id: editingContact.id, ...formData });
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return '??';
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContactRow = (contact: Contact) => (
    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Checkbox
            checked={selectedContacts.includes(contact.id)}
            onCheckedChange={() => handleSelectContact(contact.id)}
            className="mr-3"
          />
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-medium text-sm">
                {getInitials(contact.fullName)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{contact.fullName}</div>
              <div className="text-sm text-gray-500">{contact.company}</div>
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900">{contact.jobTitle}</div>
          <div className="text-sm text-gray-500">{contact.department}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          {(contact as any).supervisor_name ? (
            <div className="font-medium text-gray-900">{(contact as any).supervisor_name}</div>
          ) : contact.reportsTo ? (
            <div className="font-medium text-gray-900">Contact #{contact.reportsTo}</div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 ? (
            contact.tags
              .filter((tag: any) => {
                // Hide tags that belong to the currently selected groupBy category
                const categoryName = tag.category?.name || tag.category || 'Uncategorized';
                return categoryName !== groupBy;
              })
              .map((tag: any, index: number) => (
                <Badge 
                  key={`${contact.id}-tag-${index}`}
                  style={{ backgroundColor: tag.color, color: 'white' }}
                  className="text-xs"
                  title={tag.category?.name ? `${tag.category.name}: ${tag.name}` : tag.name}
                >
                  {tag.name}
                </Badge>
              ))
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
          {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 && 
           contact.tags.filter((tag: any) => {
             const categoryName = tag.category?.name || tag.category || 'Uncategorized';
             return categoryName !== groupBy;
           }).length === 0 && (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-blue-600">
          <div>2</div>
          <div className="text-xs text-gray-500">entities</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {(() => {
          const percentage = calculateEnrichmentPercentage(contact);
          const colorClass = getEnrichmentColor(percentage);
          return (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {percentage}%
            </div>
          );
        })()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditContact(contact)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="mx-4 space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Directory</h1>
        </div>
      </div>

      {/* Contact Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Group by:</span>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Role">Role</SelectItem>
              <SelectItem value="Department">Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <TagIcon className="h-4 w-4 mr-1" />
              Manage tags
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Tag Management</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[80vh]">
              <TagCategoryManager envId="degoudse" />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between space-x-4 py-2">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Fields selector temporarily removed - will re-add after core functionality works */}
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Add contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reportsTo">Reports To</Label>
                  <Select value={formData.reportsTo?.toString() || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, reportsTo: value === "none" ? null : parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No supervisor</SelectItem>
                      {contacts.filter((c: Contact) => c.id !== editingContact?.id).map((contact: Contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateContact} disabled={createContactMutation.isPending}>
                    {createContactMutation.isPending ? 'Creating...' : 'Create contact'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Contact Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editCompany">Company</Label>
                  <Input
                    id="editCompany"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editJobTitle">Job Title</Label>
                  <Input
                    id="editJobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editReportsTo">Reports To</Label>
                  <Select value={formData.reportsTo?.toString() || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, reportsTo: value === "none" ? null : parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No supervisor</SelectItem>
                      {contacts.filter((c: Contact) => c.id !== editingContact?.id).map((contact: Contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editNotes">Notes</Label>
                  <Textarea
                    id="editNotes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateContact} disabled={updateContactMutation.isPending}>
                    {updateContactMutation.isPending ? 'Updating...' : 'Update contact'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contact Groups */}
      <div className="space-y-6">
        {contactsLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading contacts...</div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first contact.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add contact
            </Button>
          </div>
        ) : (
          filteredGroups.map(group => (
            <Card key={group.name} className="border border-[#E6E7F1] rounded-lg overflow-hidden">
              {/* Company Header */}
              <div className="bg-blue-50 px-4 py-3 border-b border-[#E6E7F1]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 mr-3">
                      {group.name}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    ({group.count} contact{group.count !== 1 ? 's' : ''})
                  </div>
                </div>
              </div>
              
              {/* Contacts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader field="fullName" currentField={sortConfig.field} currentDirection={sortConfig.direction} onSort={handleSort}>
                        Contact
                      </SortableHeader>
                      <SortableHeader field="jobTitle" currentField={sortConfig.field} currentDirection={sortConfig.direction} onSort={handleSort}>
                        Title
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attributes
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entities
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrichment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.contacts.map(contact => renderContactRow(contact))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}