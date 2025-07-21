import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Mail, Phone, BarChart3, MoreHorizontal, User, Star, List, Download, Filter, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FieldsSelector } from "@/components/shared/FieldsSelector";


interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  department: string;
  reportsTo: number | null;
  supervisorName?: string;
  notes: string;
  linkedEntityType: string;
  linkedEntityId: number;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface Tag {
  id: number;
  name: string;
  color: string;
  category: string;
}

const ContactsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("company");
  const [selectedFields, setSelectedFields] = useState([
    'fullName', 'company', 'jobTitle', 'department', 'email', 'phone', 'reportsTo', 'enrichment'
  ]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState("");
  
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

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ['/api/degoudse/contacts'],
  });

  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/degoudse/tags'],
  });

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

  const handleCreateContact = () => {
    createContactMutation.mutate(formData);
  };

  const handleUpdateContact = () => {
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, ...formData });
    }
  };

  // Group contacts
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {};
    
    contacts.forEach(contact => {
      let groupKey = '';
      
      if (groupBy === 'company') {
        groupKey = contact.company || 'No Company';
      } else if (groupBy === 'department') {
        groupKey = contact.department || 'No Department';
      } else if (groupBy === 'role') {
        const roleTag = contact.tags?.find(tagName => {
          const tag = tags.find(t => t.name === tagName && t.category === 'Role');
          return tag;
        });
        groupKey = roleTag ? roleTag : 'Other';
      } else if (groupBy === 'dept_tag') {
        const deptTag = contact.tags?.find(tagName => {
          const tag = tags.find(t => t.name === tagName && t.category === 'Department');
          return tag;
        });
        groupKey = deptTag ? deptTag : 'General';
      } else {
        groupKey = 'All Contacts';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(contact);
    });
    
    return Object.entries(groups).map(([name, contacts]) => ({
      name,
      contacts: contacts.sort((a: any, b: any) => 
        (a.fullName || `${a.firstName} ${a.lastName}`).localeCompare(
          b.fullName || `${b.firstName} ${b.lastName}`
        )
      )
    }));
  }, [contacts, groupBy, tags]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedContacts;
    
    return groupedContacts.map(group => ({
      ...group,
      contacts: group.contacts.filter((contact: Contact) =>
        contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.contacts.length > 0);
  }, [groupedContacts, searchTerm]);

  const handleFieldsChange = (fields: string[]) => {
    setSelectedFields(fields);
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(contacts.map(c => c.id));
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  const toggleBulkActions = () => {
    if (showBulkActions) {
      setSelectedContacts([]);
    }
    setShowBulkActions(!showBulkActions);
  };

  const getAttributeCount = (contact: Contact) => {
    let count = 0;
    if (contact.email) count++;
    if (contact.phone) count++;
    if (contact.jobTitle) count++;
    if (contact.department) count++;
    if (contact.company) count++;
    if (contact.reportsTo) count++;
    if (contact.notes) count++;
    if (contact.tags && contact.tags.length > 0) count++;
    return count;
  };

  const getSupervisorName = (contact: Contact) => {
    if (!contact.reportsTo) return null;
    const supervisor = contacts.find(c => c.id === contact.reportsTo);
    return supervisor?.fullName || null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Contact Lists Section */}
      <div className="bg-gray-50 border border-[#E6E7F1] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Contact Lists</h3>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create list
          </Button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Manage saved contact lists and segments
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
              </span>
              <Button variant="outline" size="sm" onClick={handleClearSelection}>
                Clear selection
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                Add to list
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTagDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Add tags
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={toggleBulkActions}>
            <Filter className="h-4 w-4 mr-2" />
            {showBulkActions ? 'Cancel' : 'Bulk actions'}
          </Button>
          <FieldsSelector
            fields={[
              { key: 'fullName', label: 'Full Name' },
              { key: 'company', label: 'Company' },
              { key: 'jobTitle', label: 'Job Title' },
              { key: 'department', label: 'Department' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'reportsTo', label: 'Reports To' },
              { key: 'enrichment', label: 'Enrichment' }
            ]}
            visibleFields={selectedFields}
            onFieldsChange={handleFieldsChange}
          />
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
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
                      {contacts.map((contact: Contact) => (
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
                      {contacts.filter((contact: Contact) => contact.id !== editingContact?.id).map((contact: Contact) => (
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

      {/* Search and Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="dept_tag">Department Tag</SelectItem>
            </SelectContent>
          </Select>
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
                      {group.contacts.length}
                    </Badge>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  </div>
                </div>
              </div>

              {/* Contact List */}
              <div className="divide-y divide-gray-100">
                {group.contacts.map((contact: Contact) => (
                  <div key={contact.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {showBulkActions && (
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => handleSelectContact(contact.id)}
                          />
                        )}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {((contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')).toUpperCase() || 'UC'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 grid grid-cols-8 gap-4 items-center">
                          {selectedFields.includes('fullName') && (
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed'}
                              </p>
                            </div>
                          )}
                          
                          {selectedFields.includes('company') && (
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500 truncate">
                                {contact.company || '-'}
                              </p>
                            </div>
                          )}
                          
                          {selectedFields.includes('jobTitle') && (
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500 truncate">
                                {contact.jobTitle || '-'}
                              </p>
                            </div>
                          )}
                          
                          {selectedFields.includes('department') && (
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500 truncate">
                                {contact.department || '-'}
                              </p>
                            </div>
                          )}
                          
                          {selectedFields.includes('email') && (
                            <div className="min-w-0 flex items-center">
                              {contact.email ? (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 truncate">{contact.email}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          )}
                          
                          {selectedFields.includes('phone') && (
                            <div className="min-w-0 flex items-center">
                              {contact.phone ? (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 truncate">{contact.phone}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          )}
                          
                          {selectedFields.includes('reportsTo') && (
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500 truncate">
                                {getSupervisorName(contact) || '-'}
                              </p>
                            </div>
                          )}
                          
                          {selectedFields.includes('enrichment') && (
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {getAttributeCount(contact)} attributes
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Tags Display */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(contact.tags) && contact.tags.length > 0 && (
                            contact.tags.map((tagItem, index) => {
                              // Handle both string tags and object tags
                              const tagName = typeof tagItem === 'string' ? tagItem : tagItem?.name || '';
                              const tag = tags.find(t => t.name === tagName);
                              return (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  style={{ 
                                    backgroundColor: tag?.color + '20', 
                                    color: tag?.color,
                                    borderColor: tag?.color 
                                  }}
                                  className="text-xs"
                                >
                                  {tagName}
                                </Badge>
                              );
                            })
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              setEditingContact(contact);
                              setShowTagDialog(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Manage tags
                          </Button>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Tag Management Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="selectTag">Select Tag</Label>
              <Select value={selectedTagToAdd} onValueChange={setSelectedTagToAdd}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.name}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span>{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle tag assignment
                setShowTagDialog(false);
                setSelectedTagToAdd("");
                toast({ title: 'Tags updated successfully' });
              }}>
                Add tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsPage;