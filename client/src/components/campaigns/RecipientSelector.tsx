import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Users, 
  Building2, 
  Target, 
  Mail, 
  Phone, 
  Plus, 
  Check, 
  X, 
  Filter,
  List,
  User,
  ChevronRight,
  ChevronDown,
  UserPlus,
  CheckCircle2,
  Circle,
  MinusCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  linkedEntityType?: string;
  linkedEntityId?: number;
  isPrimary: boolean;
  isActive: boolean;
}

interface Entity {
  id: number;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  description?: string;
  contacts?: Contact[];
  contactCount?: number;
}

interface SavedList {
  id: number;
  name: string;
  description: string;
  entityType: string;
  entityIds: number[];
  contactIds: number[];
  itemCount: number;
}

interface RecipientSelectorProps {
  entityType: string;
  selectedRecipients: any[];
  onRecipientsChange: (recipients: any[]) => void;
}

export default function RecipientSelector({ 
  entityType, 
  selectedRecipients = [], 
  onRecipientsChange 
}: RecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'entities' | 'contacts' | 'lists'>('entities');
  const [expandedEntities, setExpandedEntities] = useState<Set<number>>(new Set());
  const [showAddContact, setShowAddContact] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    linkedEntityId: null as number | null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch entities based on type
  const { data: entities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/degoudse/${entityType}`],
    enabled: !!entityType
  });

  // Fetch contacts for the entity type
  const { data: allContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts`],
    select: (data: Contact[]) => data.filter(contact => 
      contact.linkedEntityType === entityType.slice(0, -1) || // Remove 's' from plural
      (!contact.linkedEntityType && entityType === 'internal')
    )
  });

  // Fetch saved lists
  const { data: savedLists = [], isLoading: listsLoading } = useQuery({
    queryKey: [`/api/degoudse/saved-lists?entity_type=${entityType}`]
  });

  // Fetch contacts for specific entities
  const { data: entityContacts = [], isLoading: entityContactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts?entity_type=${entityType}`],
    select: (data: Contact[]) => {
      const contactsByEntity: Record<number, Contact[]> = {};
      data.forEach(contact => {
        if (contact.linkedEntityId) {
          if (!contactsByEntity[contact.linkedEntityId]) {
            contactsByEntity[contact.linkedEntityId] = [];
          }
          contactsByEntity[contact.linkedEntityId].push(contact);
        }
      });
      return contactsByEntity;
    }
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      return await apiRequest('/api/degoudse/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactData,
          fullName: `${contactData.firstName} ${contactData.lastName}`,
          linkedEntityType: entityType.slice(0, -1), // Remove 's' from plural
          isActive: true
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      setShowAddContact(false);
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', linkedEntityId: null });
      toast({ title: "Contact added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add contact", variant: "destructive" });
    }
  });

  const filteredEntities = entities.filter((entity: Entity) => 
    entity.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = allContacts.filter((contact: Contact) => 
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLists = savedLists.filter((list: SavedList) => 
    list.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Enhanced selection logic with bulk operations
  const isRecipientSelected = (type: 'entity' | 'contact' | 'list', id: number): boolean => {
    return selectedRecipients.some(recipient => recipient.type === type && recipient.id === id);
  };

  const getEntitySelectionState = (entityId: number): 'none' | 'partial' | 'all' => {
    const entityContactsList = entityContacts[entityId] || [];
    const isEntitySelected = isRecipientSelected('entity', entityId);
    const selectedContacts = entityContactsList.filter(contact => 
      isRecipientSelected('contact', contact.id)
    );

    if (isEntitySelected) return 'all';
    if (selectedContacts.length === 0) return 'none';
    if (selectedContacts.length === entityContactsList.length) return 'all';
    return 'partial';
  };

  const toggleRecipient = (type: 'entity' | 'contact' | 'list', item: any) => {
    const isSelected = isRecipientSelected(type, item.id);
    let newRecipients = [...selectedRecipients];

    if (type === 'entity') {
      const entityContactsList = entityContacts[item.id] || [];
      
      if (isSelected) {
        // Remove entity and all its contacts
        newRecipients = newRecipients.filter(r => 
          !(r.type === 'entity' && r.id === item.id) &&
          !(r.type === 'contact' && entityContactsList.some(c => c.id === r.id))
        );
      } else {
        // Add entity only (not contacts automatically)
        const newRecipient = {
          type: 'entity',
          id: item.id,
          name: item.name,
          email: item.email,
          entityType,
          ...item
        };
        newRecipients.push(newRecipient);
      }
    } else {
      // Handle individual contact or list selection
      if (isSelected) {
        newRecipients = newRecipients.filter(r => !(r.type === type && r.id === item.id));
      } else {
        const newRecipient = {
          type,
          id: item.id,
          name: item.name || item.fullName,
          email: item.email,
          entityType: type === 'contact' ? item.linkedEntityType || entityType : entityType,
          ...item
        };
        newRecipients.push(newRecipient);
      }
    }

    onRecipientsChange(newRecipients);
  };

  const selectAllEntityContacts = (entityId: number, entityContacts: Contact[]) => {
    let newRecipients = [...selectedRecipients];
    
    // Remove any existing contacts for this entity
    const existingContactIds = entityContacts.map(c => c.id);
    newRecipients = newRecipients.filter(r => 
      !(r.type === 'contact' && existingContactIds.includes(r.id))
    );
    
    // Add all contacts
    const newContactRecipients = entityContacts.map(contact => ({
      type: 'contact' as const,
      id: contact.id,
      name: contact.fullName,
      email: contact.email,
      entityType: contact.linkedEntityType || entityType,
      ...contact
    }));
    
    newRecipients.push(...newContactRecipients);
    onRecipientsChange(newRecipients);
  };

  const deselectAllEntityContacts = (entityId: number, entityContacts: Contact[]) => {
    const contactIds = entityContacts.map(c => c.id);
    const newRecipients = selectedRecipients.filter(r => 
      !(r.type === 'contact' && contactIds.includes(r.id))
    );
    onRecipientsChange(newRecipients);
  };

  const toggleEntityExpansion = (entityId: number) => {
    const newExpanded = new Set(expandedEntities);
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId);
    } else {
      newExpanded.add(entityId);
    }
    setExpandedEntities(newExpanded);
  };

  const toggleBulkSelection = (itemKey: string) => {
    const newSelected = new Set(selectedForBulk);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedForBulk(newSelected);
  };

  const handleBulkAction = (action: 'select' | 'deselect') => {
    if (action === 'select') {
      const bulkRecipients: any[] = [];
      selectedForBulk.forEach(key => {
        const [type, id] = key.split('-');
        if (type === 'entity') {
          const entity = filteredEntities.find((e: Entity) => e.id === parseInt(id));
          if (entity && !isRecipientSelected('entity', entity.id)) {
            bulkRecipients.push({
              type: 'entity',
              id: entity.id,
              name: entity.name,
              email: entity.email,
              entityType,
              ...entity
            });
          }
        }
      });
      onRecipientsChange([...selectedRecipients, ...bulkRecipients]);
    } else {
      let newRecipients = [...selectedRecipients];
      selectedForBulk.forEach(key => {
        const [type, id] = key.split('-');
        newRecipients = newRecipients.filter(r => !(r.type === type && r.id === parseInt(id)));
      });
      onRecipientsChange(newRecipients);
    }
    setSelectedForBulk(new Set());
    setBulkMode(false);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'partners': return <Building2 className="h-4 w-4" />;
      case 'customers': return <Users className="h-4 w-4" />;
      case 'opportunities': return <Target className="h-4 w-4" />;
      case 'internal': return <User className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'partners': return 'from-purple-500 to-violet-600';
      case 'customers': return 'from-blue-500 to-indigo-600';
      case 'opportunities': return 'from-green-500 to-emerald-600';
      case 'internal': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleAddContact = () => {
    addContactMutation.mutate(newContact);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and tabs */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          {selectedTab === 'entities' && (
            <div className="flex gap-2">
              <Button
                variant={bulkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setBulkMode(!bulkMode)}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Bulk Select
              </Button>
              
              {bulkMode && selectedForBulk.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('select')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Selected ({selectedForBulk.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('deselect')}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove Selected
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'entities', label: 'Entities', icon: getEntityIcon(entityType) },
            { id: 'contacts', label: 'Contacts', icon: <User className="h-4 w-4" /> },
            { id: 'lists', label: 'Lists', icon: <List className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected recipients summary */}
      {selectedRecipients.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Selected Recipients ({selectedRecipients.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRecipients.map((recipient, index) => (
              <Badge
                key={`${recipient.type}-${recipient.id}`}
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {recipient.name}
                <button
                  onClick={() => toggleRecipient(recipient.type, recipient)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Content based on selected tab */}
      <div className="space-y-4">
        {selectedTab === 'entities' && (
          <div className="space-y-3">
            {entitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading entities...</p>
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No entities found</p>
              </div>
            ) : (
              filteredEntities.map((entity: Entity) => {
                const entityContactsList = entityContacts[entity.id] || [];
                const isExpanded = expandedEntities.has(entity.id);
                const isEntitySelected = isRecipientSelected('entity', entity.id);
                const selectionState = getEntitySelectionState(entity.id);
                const selectedContacts = entityContactsList.filter(contact => 
                  isRecipientSelected('contact', contact.id)
                );
                const itemKey = `entity-${entity.id}`;

                return (
                  <Card key={entity.id} className={`transition-all hover:shadow-md ${
                    isEntitySelected ? 'ring-2 ring-blue-500 bg-blue-50' : 
                    selectionState === 'partial' ? 'ring-2 ring-orange-400 bg-orange-50' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {bulkMode && (
                            <Checkbox
                              checked={selectedForBulk.has(itemKey)}
                              onCheckedChange={() => toggleBulkSelection(itemKey)}
                            />
                          )}
                          
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getEntityColor(entityType)} text-white`}>
                            {getEntityIcon(entityType)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{entity.name}</h3>
                              {selectionState === 'all' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {selectionState === 'partial' && <MinusCircle className="h-4 w-4 text-orange-500" />}
                              {selectionState === 'none' && <Circle className="h-4 w-4 text-gray-400" />}
                            </div>
                            <p className="text-sm text-gray-600">
                              {entity.email || 'No email'} • {entityContactsList.length} contacts
                              {selectedContacts.length > 0 && ` • ${selectedContacts.length} selected`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!bulkMode && (
                            <>
                              <Button
                                variant={isEntitySelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleRecipient('entity', entity)}
                              >
                                {isEntitySelected ? (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Entity Selected
                                  </>
                                ) : (
                                  'Select Entity'
                                )}
                              </Button>
                              
                              {entityContactsList.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEntityExpansion(entity.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Entity contacts waterfall */}
                      {isExpanded && entityContactsList.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">
                              Contacts ({selectedContacts.length}/{entityContactsList.length} selected)
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => selectAllEntityContacts(entity.id, entityContactsList)}
                                disabled={selectedContacts.length === entityContactsList.length}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deselectAllEntityContacts(entity.id, entityContactsList)}
                                disabled={selectedContacts.length === 0}
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>
                          
                          {entityContactsList.map((contact: Contact) => {
                            const isContactSelected = isRecipientSelected('contact', contact.id);
                            return (
                              <div
                                key={contact.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  isContactSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={isContactSelected}
                                    onCheckedChange={() => toggleRecipient('contact', contact)}
                                  />
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                    {contact.firstName?.[0]}{contact.lastName?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{contact.fullName}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      {contact.email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          {contact.email}
                                        </div>
                                      )}
                                      {contact.jobTitle && (
                                        <span>• {contact.jobTitle}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {isContactSelected && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {selectedTab === 'contacts' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">All Contacts</h3>
              <div className="flex gap-2">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkMode(!bulkMode)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Bulk Select
                </Button>
                <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={newContact.firstName}
                            onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newContact.lastName}
                            onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={newContact.jobTitle}
                          onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                          placeholder="Marketing Manager"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddContact(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddContact}
                          disabled={!newContact.firstName || !newContact.lastName || !newContact.email || addContactMutation.isPending}
                        >
                          {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {contactsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contacts found</p>
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => setShowAddContact(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Add First Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {bulkMode && selectedForBulk.size > 0 && (
                  <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('select')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Selected ({selectedForBulk.size})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('deselect')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Selected
                    </Button>
                  </div>
                )}
                
                {filteredContacts.map((contact: Contact) => {
                  const isSelected = isRecipientSelected('contact', contact.id);
                  const itemKey = `contact-${contact.id}`;
                  
                  return (
                    <Card key={contact.id} className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {bulkMode && (
                              <Checkbox
                                checked={selectedForBulk.has(itemKey)}
                                onCheckedChange={() => toggleBulkSelection(itemKey)}
                              />
                            )}
                            
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                              {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{contact.fullName}</h3>
                                {isSelected && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {contact.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{contact.email}</span>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}
                                {contact.jobTitle && (
                                  <span>• {contact.jobTitle}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {!bulkMode && (
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleRecipient('contact', contact)}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'lists' && (
          <div className="space-y-3">
            {listsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading lists...</p>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="text-center py-8">
                <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No saved lists found</p>
              </div>
            ) : (
              filteredLists.map((list: SavedList) => {
                const isSelected = isRecipientSelected('list', list.id);
                return (
                  <Card key={list.id} className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getEntityColor(entityType)} text-white`}>
                            <List className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{list.name}</h3>
                            <p className="text-sm text-gray-600">
                              {list.description || 'No description'} • {list.itemCount || 0} items
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleRecipient('list', list)}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}