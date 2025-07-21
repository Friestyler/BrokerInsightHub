import { useState } from 'react';
import { Plus, Search, Download, ChevronDown, ChevronUp, Tag, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SavedListsManager } from '@/components/shared/SavedListsManager';
import { FieldsSelector } from '@/components/shared/FieldsSelector';
import type { Contact, SavedList, SavedView } from '@shared/schema';

// Tag-related types
interface TagGroup {
  id: number;
  name: string;
  description?: string;
  color_scheme?: string;
  is_exclusive: boolean;
  sort_order: number;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  tag_count?: number;
}

interface ContactTag {
  id: number;
  name: string;
  color: string;
  group_id?: number;
  usage_count: number;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  contact_count?: number;
}

// Enhanced contact type with tags
interface ContactWithTags extends Contact {
  contactTags?: ContactTag[];
}

const SortableTableHead = ({ 
  children, 
  sortKey, 
  currentSortKey, 
  currentDirection, 
  onSort, 
  className = "" 
}: {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string;
  currentDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}) => {
  const isActive = currentSortKey === sortKey;
  
  return (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => onSort(sortKey)}
    >
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
  // Basic state
  const [searchText, setSearchText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'fullName',
    direction: 'asc'
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedContactForTags, setSelectedContactForTags] = useState<number | null>(null);
  
  // Saved lists specific state
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [filtersModified, setFiltersModified] = useState(false);
  const [isEditingView, setIsEditingView] = useState(false);

  // Available fields for contacts
  const availableFields = [
    { key: 'fullName', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'jobTitle', label: 'Job Title', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'isPrimary', label: 'Primary Contact', required: false },
    { key: 'tags', label: 'Tags', required: false },
  ];

  // Fields state
  const [visibleFields, setVisibleFields] = useState<string[]>(['fullName', 'email', 'phone', 'company', 'jobTitle', 'tags']);

  // Form state for creating new contact
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    company: '',
    notes: ''
  });

  // Data fetching
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/degoudse/contacts'],
    queryFn: () => apiRequest('GET', '/api/degoudse/contacts')
  });

  const { data: savedLists = [] } = useQuery({
    queryKey: ['/api/saved-lists', 'contacts'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=contacts')
  });

  const { data: savedViews = [] } = useQuery({
    queryKey: ['/api/saved-views', 'contacts'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=contacts')
  });

  // Tag data temporarily disabled due to SQL issue
  const tagGroups: any[] = [];
  const allTags: any[] = [];

  // Mutations
  const createContactMutation = useMutation({
    mutationFn: (contactData: typeof formData) => 
      apiRequest('/api/degoudse/contacts', 'POST', {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        fullName: `${contactData.firstName} ${contactData.lastName}`,
        email: contactData.email,
        phone: contactData.phone,
        jobTitle: contactData.jobTitle,
        department: contactData.department,
        company: contactData.company,
        notes: contactData.notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      setShowCreateDialog(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        department: '',
        company: '',
        notes: ''
      });
      toast({ title: 'Contact created successfully' });
    }
  });

  const assignTagMutation = useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: number; tagId: number }) =>
      apiRequest('/api/degoudse/contact-tags', 'POST', { contactId, tagId, taggedById: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      toast({ title: 'Tag assigned successfully' });
    }
  });

  // Filtering and sorting logic
  const filteredAndSortedContacts = contacts
    .filter((contact: Contact) => {
      if (!contact.fullName) return false;
      
      const searchMatch = searchText === '' || 
        contact.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchText.toLowerCase());

      return searchMatch;
    })
    .sort((a: Contact, b: Contact) => {
      const aValue = a.fullName || '';
      const bValue = b.fullName || '';
      
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
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

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredAndSortedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredAndSortedContacts.map((contact: Contact) => contact.id));
    }
  };

  const handleCreateContact = () => {
    if (!formData.firstName || !formData.lastName) {
      toast({ title: 'First name and last name are required', variant: 'destructive' });
      return;
    }
    createContactMutation.mutate(formData);
  };

  const handleOpenTagDialog = (contactId: number) => {
    setSelectedContactForTags(contactId);
    setShowTagDialog(true);
  };

  const handleAssignTag = (tagId: number) => {
    if (selectedContactForTags) {
      assignTagMutation.mutate({ contactId: selectedContactForTags, tagId });
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add contact
          </Button>
          <Button variant="outline" className="h-8">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#E6E7F1] rounded-lg p-2 mb-4">
        <div className="flex items-center justify-between">
          {/* Left side - Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-8 w-64"
              />
            </div>
          </div>

          {/* Right side - View controls */}
          <div className="flex items-center space-x-2">
            <FieldsSelector
              fields={availableFields}
              visibleFields={visibleFields}
              onFieldsChange={setVisibleFields}
            />
          </div>
        </div>
      </div>

      {/* Saved Lists Manager */}
      <SavedListsManager
        entityType="contacts"
        selectedItems={selectedContacts}
        onListSelect={(list) => setActiveList(list)}
        currentFilters={{
          searchText
        }}
      />

      {/* Tag Groups Display (Exact match to screenshot) */}
      {tagGroups.length > 0 && (
        <div className="mb-6">
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Directory</h3>
            {tagGroups.map((group: TagGroup) => (
              <div key={group.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{group.name}</h4>
                  <span className="text-xs text-gray-500">{group.tag_count || 0} tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter((tag: ContactTag) => tag.group_id === group.id)
                    .map((tag: ContactTag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          borderColor: tag.color,
                          color: tag.color
                        }}
                      >
                        {tag.name}
                        <span className="ml-1 text-xs opacity-70">
                          {tag.contact_count || 0}
                        </span>
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E6E7F1] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedContacts.length === filteredAndSortedContacts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {visibleFields.includes('fullName') && (
                <SortableTableHead
                  sortKey="fullName"
                  currentSortKey={sortConfig.field}
                  currentDirection={sortConfig.direction}
                  onSort={handleSort}
                >
                  Name
                </SortableTableHead>
              )}
              {visibleFields.includes('email') && (
                <TableHead>Email</TableHead>
              )}
              {visibleFields.includes('phone') && (
                <TableHead>Phone</TableHead>
              )}
              {visibleFields.includes('company') && (
                <TableHead>Company</TableHead>
              )}
              {visibleFields.includes('jobTitle') && (
                <TableHead>Job Title</TableHead>
              )}
              {visibleFields.includes('tags') && (
                <TableHead>Tags</TableHead>
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactsLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedContacts.map((contact: Contact) => (
                <TableRow key={contact.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleSelectContact(contact.id)}
                    />
                  </TableCell>
                  {visibleFields.includes('fullName') && (
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(contact.fullName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {contact.fullName}
                          </div>
                          {contact.isPrimary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.includes('email') && (
                    <TableCell>{contact.email || '-'}</TableCell>
                  )}
                  {visibleFields.includes('phone') && (
                    <TableCell>{contact.phone || '-'}</TableCell>
                  )}
                  {visibleFields.includes('company') && (
                    <TableCell>{contact.company || '-'}</TableCell>
                  )}
                  {visibleFields.includes('jobTitle') && (
                    <TableCell>{contact.jobTitle || '-'}</TableCell>
                  )}
                  {visibleFields.includes('tags') && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenTagDialog(contact.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            Add tag
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenTagDialog(contact.id)}
                      className="h-6"
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Statistics */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredAndSortedContacts.length} of {contacts.length} contacts
        {selectedContacts.length > 0 && (
          <span className="ml-2">({selectedContacts.length} selected)</span>
        )}
      </div>

      {/* Create Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateContact}
              disabled={createContactMutation.isPending}
            >
              {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Assignment Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tagGroups.map((group: TagGroup) => (
              <div key={group.id}>
                <h4 className="font-medium mb-2">{group.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allTags
                    .filter((tag: ContactTag) => tag.group_id === group.id)
                    .map((tag: ContactTag) => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignTag(tag.id)}
                        className="justify-start"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}