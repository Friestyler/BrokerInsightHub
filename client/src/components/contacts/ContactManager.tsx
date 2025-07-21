// Reusable Contact Management Component - Senior Engineering Standard
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  reports_to?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactManagerProps {
  /** Environment ID for API calls */
  envId?: string;
  /** Custom API endpoint override */
  apiEndpoint?: string;
  /** Whether to show company column */
  showCompany?: boolean;
  /** Whether to show department column */
  showDepartment?: boolean;
  /** Whether to show reports to column */
  showReportsTo?: boolean;
  /** Custom table columns configuration */
  columns?: string[];
  /** Additional filters */
  filters?: Record<string, any>;
  /** Custom contact renderer */
  renderContact?: (contact: Contact) => React.ReactNode;
  /** Event handlers */
  onContactCreated?: (contact: Contact) => void;
  onContactUpdated?: (contact: Contact) => void;
  onContactDeleted?: (contactId: number) => void;
}

export function ContactManager({
  envId = 'degoudse',
  apiEndpoint,
  showCompany = true,
  showDepartment = true,
  showReportsTo = true,
  columns,
  filters = {},
  renderContact,
  onContactCreated,
  onContactUpdated,
  onContactDeleted,
}: ContactManagerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
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

  const baseApiUrl = apiEndpoint || `/api/${envId}/contacts`;

  // Fetch contacts with caching
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: [baseApiUrl, filters],
    queryFn: () => apiRequest(baseApiUrl),
    staleTime: 5 * 60 * 1000
  });

  // Fetch all contacts for supervisor dropdown
  const { data: allContacts = [] } = useQuery({
    queryKey: [`${baseApiUrl}-all`],
    queryFn: () => apiRequest(baseApiUrl),
    staleTime: 5 * 60 * 1000
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: (contactData: typeof formData) => 
      apiRequest(baseApiUrl, 'POST', {
        ...contactData,
        fullName: `${contactData.firstName} ${contactData.lastName}`.trim()
      }),
    onSuccess: (newContact) => {
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [baseApiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${baseApiUrl}-all`] });
      toast({ title: 'Contact created successfully' });
      onContactCreated?.(newContact);
    }
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: (contactData: { id: number } & typeof formData) => 
      apiRequest(`${baseApiUrl}/${contactData.id}`, 'PUT', {
        ...contactData,
        fullName: `${contactData.firstName} ${contactData.lastName}`.trim()
      }),
    onSuccess: (updatedContact) => {
      setShowEditDialog(false);
      setEditingContact(null);
      queryClient.invalidateQueries({ queryKey: [baseApiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${baseApiUrl}-all`] });
      toast({ title: 'Contact updated successfully' });
      onContactUpdated?.(updatedContact);
    }
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) => 
      apiRequest(`${baseApiUrl}/${contactId}`, 'DELETE'),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: [baseApiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${baseApiUrl}-all`] });
      toast({ title: 'Contact deleted successfully' });
      onContactDeleted?.(contactId);
    }
  });

  const resetForm = () => {
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
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.job_title || '',
      department: contact.department || '',
      company: contact.company || '',
      reportsTo: contact.reports_to || null,
      notes: contact.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteContact = (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const filteredContacts = contacts.filter((contact: Contact) =>
    `${contact.first_name} ${contact.last_name} ${contact.email || ''} ${contact.company || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getSupervisorName = (reportsTo: number | null) => {
    if (!reportsTo) return '-';
    const supervisor = allContacts.find((c: Contact) => c.id === reportsTo);
    return supervisor ? supervisor.full_name : `Contact ${reportsTo}`;
  };

  if (isLoading) {
    return <div className="p-4">Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="h-8">
          <Plus className="h-4 w-4 mr-2" />
          Add contact
        </Button>
      </div>

      {/* Contacts Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium text-sm text-gray-600">CONTACT</th>
                <th className="text-left p-3 font-medium text-sm text-gray-600">TITLE</th>
                {showReportsTo && (
                  <th className="text-left p-3 font-medium text-sm text-gray-600">REPORTS TO</th>
                )}
                {showDepartment && (
                  <th className="text-left p-3 font-medium text-sm text-gray-600">DEPARTMENT</th>
                )}
                {showCompany && (
                  <th className="text-left p-3 font-medium text-sm text-gray-600">COMPANY</th>
                )}
                <th className="text-left p-3 font-medium text-sm text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact: Contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  {renderContact ? (
                    renderContact(contact)
                  ) : (
                    <>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{contact.full_name}</div>
                          {contact.email && (
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{contact.job_title || '-'}</td>
                      {showReportsTo && (
                        <td className="p-3 text-sm">{getSupervisorName(contact.reports_to)}</td>
                      )}
                      {showDepartment && (
                        <td className="p-3 text-sm">{contact.department || '-'}</td>
                      )}
                      {showCompany && (
                        <td className="p-3 text-sm">{contact.company || '-'}</td>
                      )}
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                              Edit contact
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600"
                            >
                              Delete contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Contact Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
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
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
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
                  {allContacts.map((contact: Contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.full_name}
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createContactMutation.mutate(formData)} disabled={createContactMutation.isPending}>
                {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
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
              <Label htmlFor="editCompany">Company</Label>
              <Input
                id="editCompany"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
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
                  {allContacts.filter((contact: Contact) => contact.id !== (editingContact?.id || 0)).map((contact: Contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.full_name}
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingContact && updateContactMutation.mutate({ ...formData, id: editingContact.id })} 
                disabled={updateContactMutation.isPending}
              >
                {updateContactMutation.isPending ? 'Updating...' : 'Update Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContactManager;