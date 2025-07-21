import { useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';
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

// Mock data hook
const useContactsData = () => {
  return useQuery({
    queryKey: ['/api/degoudse/contacts'],
    queryFn: () => {
      // Generate 172 mock contacts
      const contacts = [];
      for (let i = 1; i <= 172; i++) {
        contacts.push({
          id: i,
          first_name: `Contact${i}`,
          last_name: `Last${i}`,
          full_name: `Contact${i} Last${i}`,
          email: `contact${i}@example.com`,
          phone: `+32 ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)}`,
          job_title: ['Manager', 'Director', 'Executive', 'Analyst', 'Coordinator'][Math.floor(Math.random() * 5)],
          department: ['Sales', 'Marketing', 'Operations', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
          company: `Company ${Math.ceil(i / 3)}`,
          notes: '',
          is_primary: Math.random() > 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      return contacts;
    }
  });
};

const SortableTableHead = ({ children, sortKey, currentSortKey, currentDirection, onSort, className = "" }) => {
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
    field: 'full_name',
    direction: 'asc'
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListMode, setSaveListMode] = useState<'new' | 'existing'>('new');
  
  // Saved lists specific state
  const [activeList, setActiveList] = useState<SavedList | null>(null);
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [filtersModified, setFiltersModified] = useState(false);
  const [isEditingView, setIsEditingView] = useState(false);
  const [showViewNameInput, setShowViewNameInput] = useState(false);
  const [pendingViewName, setPendingViewName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedExistingList, setSelectedExistingList] = useState<number | null>(null);

  // Available fields for contacts
  const availableFields = [
    { key: 'full_name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'job_title', label: 'Job Title', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'is_primary', label: 'Primary Contact', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ];

  // Fields state
  const [visibleFields, setVisibleFields] = useState<string[]>(['full_name', 'email', 'phone', 'company', 'job_title']);

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
  const { data: savedLists = [] } = useQuery({
    queryKey: ['/api/saved-lists', { entity_type: 'contacts' }],
    queryFn: () => apiRequest('/api/saved-lists?entity_type=contacts')
  });
  const { data: savedViews = [] } = useQuery({
    queryKey: ['/api/saved-views', { entity_type: 'contacts' }],
    queryFn: () => apiRequest('/api/saved-views?entity_type=contacts')
  });

  // Mutations
  const createListMutation = useMutation({
    mutationFn: (data: { name: string; description: string; entity_type: string; entity_ids: number[] }) =>
      apiRequest('/api/saved-lists', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      toast({ title: "Success", description: "List created successfully" });
    }
  });
  
  const createViewMutation = useMutation({
    mutationFn: (data: { name: string; entity_type: string; filters: any }) =>
      apiRequest('/api/saved-views', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      toast({ title: "Success", description: "View saved successfully" });
    }
  });
  
  const updateViewMutation = useMutation({
    mutationFn: ({ viewId, data }: { viewId: number; data: any }) =>
      apiRequest(`/api/saved-views/${viewId}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      toast({ title: "Success", description: "View updated successfully" });
    }
  });
  
  const deleteViewMutation = useMutation({
    mutationFn: (viewId: number) =>
      apiRequest(`/api/saved-views/${viewId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-views'] });
      toast({ title: "Success", description: "View deleted successfully" });
    }
  });
  
  const createSharedListMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/shared-lists', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Success", description: "List shared successfully" });
    }
  });

  // Handler functions for saved lists and views
  const handleListSelect = (listId: number | null) => {
    const list = savedLists.find((l: any) => l.id === listId);
    setActiveList(list || null);
  };

  const handleViewSelect = (view: SavedView) => {
    setActiveView(view);
  };

  const handleRevertChanges = () => {
    setFiltersModified(false);
    // Reset any filters to the saved view state
  };

  const handleSaveAsNew = () => {
    setShowViewNameInput(true);
    setIsEditingView(false);
    setPendingViewName('');
  };

  const handleSaveView = () => {
    if (!pendingViewName.trim()) return;
    
    const viewData = {
      name: pendingViewName,
      entity_type: 'contacts',
      filters: { /* current filter state */ }
    };

    if (isEditingView && activeView) {
      updateViewMutation.mutate({ viewId: activeView.id, data: viewData });
    } else {
      createViewMutation.mutate(viewData);
    }

    setShowViewNameInput(false);
    setPendingViewName('');
    setIsEditingView(false);
  };

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
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aValue = a[sortConfig.field as keyof Contact] || '';
    const bValue = b[sortConfig.field as keyof Contact] || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateContact = async () => {
    try {
      const contactData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`.trim()
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

  const handleSaveToList = async () => {
    if (selectedContacts.length === 0) return;

    try {
      if (saveListMode === 'new') {
        if (!newListName.trim()) {
          toast({
            title: "Error",
            description: "Please enter a list name",
            variant: "destructive"
          });
          return;
        }

        await createListMutation.mutateAsync({
          name: newListName,
          description: newListDescription,
          entity_type: 'contacts',
          entity_ids: selectedContacts
        });
      } else {
        if (!selectedExistingList) {
          toast({
            title: "Error",
            description: "Please select a list",
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
          <Button onClick={() => setShowCreateDialog(true)} className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            Create new contact
          </Button>
        </div>
      </div>

      {/* Saved Lists Section */}
      <SavedListsManager
        savedLists={savedLists}
        savedViews={savedViews}
        activeList={activeList}
        activeView={activeView}
        isEditingView={isEditingView}
        filtersModified={filtersModified}
        showViewNameInput={showViewNameInput}
        pendingViewName={pendingViewName}
        handleListSelect={handleListSelect}
        handleViewSelect={handleViewSelect}
        handleRevertChanges={handleRevertChanges}
        handleSaveAsNew={handleSaveAsNew}
        handleSaveView={handleSaveView}
        onPendingViewNameChange={setPendingViewName}
        onShowViewNameInput={setShowViewNameInput}
        onEditingView={setIsEditingView}
        currentCount={filteredContacts.length}
        entityName="contacts"
      />

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
        <div className="flex items-center gap-2">
          <FieldsSelector
            availableFields={availableFields}
            visibleFields={visibleFields}
            onFieldsChange={setVisibleFields}
          />
          <Button variant="outline" size="sm" className="h-8">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedContacts.length} contact(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedContacts([])}
              className="h-8"
            >
              Clear selection
            </Button>
            <Button
              size="sm"
              onClick={() => setShowSaveListModal(true)}
              className="h-8"
            >
              Add to list
            </Button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={selectedContacts.length === paginatedContacts.length && paginatedContacts.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedContacts(paginatedContacts.map(c => c.id));
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactsLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : paginatedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              paginatedContacts.map((contact: Contact) => (
                <TableRow key={contact.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3">
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
                  </TableCell>
                  <TableCell className="px-4 py-3">
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
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-gray-900">{contact.email || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-gray-900">{contact.phone || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-gray-900">{contact.company || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-gray-900">{contact.job_title || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-1">
                      {contact.is_primary && (
                        <Badge variant="outline" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedContacts.length)} of {sortedContacts.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8"
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContact}>
              Create Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save to List Dialog */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save {selectedContacts.length} Contact(s) to List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="new"
                  checked={saveListMode === 'new'}
                  onChange={() => setSaveListMode('new')}
                />
                <span>Create new list</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="existing"
                  checked={saveListMode === 'existing'}
                  onChange={() => setSaveListMode('existing')}
                />
                <span>Add to existing list</span>
              </label>
            </div>

            {saveListMode === 'new' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">List Name</label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Select List</label>
                <Select
                  value={selectedExistingList?.toString()}
                  onValueChange={(value) => setSelectedExistingList(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedLists.map((list: any) => (
                      <SelectItem key={list.id} value={list.id.toString()}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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