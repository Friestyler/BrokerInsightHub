import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Plus, Edit, Trash2, UserCheck, Building2, Phone, Mail } from "lucide-react";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  linked_entity_type: string;
  linked_entity_id: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ENTITY_TYPES = [
  'partner',
  'customer', 
  'opportunity',
  'vendor',
  'product'
];

export default function ContactsPage() {
  const { environment } = useEnvironment();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    linked_entity_type: '',
    linked_entity_id: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, [environment]);

  const loadContacts = async () => {
    try {
      // Import environment URL transformation function
      const { getEnvironmentUrl } = await import('@/lib/queryClient');
      const url = getEnvironmentUrl('/api/contacts');
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Import environment URL transformation function
      const { getEnvironmentUrl } = await import('@/lib/queryClient');
      const baseUrl = editingContact 
        ? `/api/contacts/${editingContact.id}` 
        : `/api/contacts`;
      const url = getEnvironmentUrl(baseUrl);
      
      const method = editingContact ? 'PUT' : 'POST';
      
      // Map form data to backend schema
      const contactData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        linkedEntityType: formData.linked_entity_type || null,
        linkedEntityId: formData.linked_entity_id ? parseInt(formData.linked_entity_id) : null,
        notes: formData.notes,
        isActive: true
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingContact ? "Contact updated successfully" : "Contact created successfully",
        });
        
        loadContacts();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error('Failed to save contact');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      linked_entity_type: contact.linked_entity_type,
      linked_entity_id: contact.linked_entity_id?.toString() || '',
      notes: contact.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      // Import environment URL transformation function
      const { getEnvironmentUrl } = await import('@/lib/queryClient');
      const url = getEnvironmentUrl(`/api/contacts/${contactId}`);
      
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
        loadContacts();
      } else {
        throw new Error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      linked_entity_type: '',
      linked_entity_id: '',
      notes: ''
    });
    setEditingContact(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getFullName = (contact: Contact) => {
    return `${contact.first_name} ${contact.last_name}`.trim();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Contact Management
              </CardTitle>
              <CardDescription>
                Manage contacts and their relationships with entities
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContact ? 'Update contact information' : 'Create a new contact record'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className={!formData.first_name ? "border-red-300" : ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className={!formData.last_name ? "border-red-300" : ""}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company (optional)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position (optional)</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linked_entity_type">Entity Type (optional)</Label>
                      <Select
                        value={formData.linked_entity_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, linked_entity_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENTITY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="linked_entity_id">Entity ID (optional)</Label>
                      <Input
                        id="linked_entity_id"
                        type="number"
                        value={formData.linked_entity_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, linked_entity_id: e.target.value }))}
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingContact ? 'Update Contact' : 'Create Contact'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contacts created yet</p>
              <p className="text-sm">Add your first contact to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{getFullName(contact)}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contact.company}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {contact.position && (
                          <Badge variant="secondary">{contact.position}</Badge>
                        )}
                        {contact.linked_entity_type && (
                          <Badge variant="outline">
                            {contact.linked_entity_type}:{contact.linked_entity_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}