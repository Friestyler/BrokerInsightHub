import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  Handshake, 
  Building2,
  Mail,
  Phone,
  Briefcase,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  customerId?: number; // For opportunities
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
  const [selectedTab, setSelectedTab] = useState<'lists' | 'contacts'>('lists');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

  // Fetch main entities based on type
  const { data: entities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/degoudse/${entityType}`],
    enabled: !!entityType
  });

  // Fetch customers for opportunity drill-down
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/degoudse/customers'],
    enabled: entityType === 'opportunities'
  });

  // Fetch all contacts related to the entity type
  const { data: allContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts`],
    select: (data: Contact[]) => data.filter(contact => 
      contact.linkedEntityType === entityType.slice(0, -1) || // Remove 's' from plural
      (!contact.linkedEntityType && entityType === 'internal')
    )
  });

  // Fetch saved lists for the entity type
  const { data: savedLists = [], isLoading: listsLoading } = useQuery({
    queryKey: [`/api/degoudse/saved-lists?entity_type=${entityType}`]
  });

  // Build entity-contact relationships for drill-down
  const { data: entityContacts = {}, isLoading: entityContactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts`],
    select: (data: Contact[]) => {
      const contactsByEntity: Record<number, Contact[]> = {};
      data.forEach(contact => {
        const entityId = contact.linkedEntityId || contact.linked_entity_id;
        const entityTypeFromDb = contact.linkedEntityType || contact.linked_entity_type;
        
        if (entityId && entityTypeFromDb) {
          // Filter by entity type (remove 's' from plural)
          const entityTypeSingular = entityType.slice(0, -1);
          if (entityTypeFromDb === entityTypeSingular) {
            if (!contactsByEntity[entityId]) {
              contactsByEntity[entityId] = [];
            }
            contactsByEntity[entityId].push(contact);
          }
        }
      });
      return contactsByEntity;
    }
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      return await apiRequest('/api/degoudse/contacts', 'POST', contactData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      setShowAddContact(false);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        linkedEntityId: null
      });
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getEntityColor = (entityType: string) => {
    const colors = {
      opportunities: 'text-green-600 bg-green-50 border-green-200',
      customers: 'text-blue-600 bg-blue-50 border-blue-200',
      partners: 'text-purple-600 bg-purple-50 border-purple-200',
      internal: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[entityType as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getEntityIcon = (entityType: string) => {
    const icons = {
      opportunities: TrendingUp,
      customers: Users,
      partners: Handshake,
      internal: Building2
    };
    return icons[entityType as keyof typeof icons] || Building2;
  };

  const toggleItemExpansion = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  const handleSelectRecipient = (recipient: any, type: 'entity' | 'contact' | 'customer') => {
    const recipientKey = `${type}-${recipient.id}`;
    const isSelected = selectedRecipients.some(r => 
      `${r.type}-${r.id}` === recipientKey
    );

    if (isSelected) {
      onRecipientsChange(selectedRecipients.filter(r => 
        `${r.type}-${r.id}` !== recipientKey
      ));
    } else {
      onRecipientsChange([
        ...selectedRecipients,
        { ...recipient, type, recipientKey }
      ]);
    }
  };

  const getCustomerForOpportunity = (opportunityId: number) => {
    const opportunity = entities.find((e: any) => e.id === opportunityId);
    if (opportunity?.customerId) {
      return customers.find((c: Customer) => c.id === opportunity.customerId);
    }
    return null;
  };

  const filteredEntities = entities.filter((entity: Entity) => 
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = allContacts.filter((contact: Contact) => {
    const fullName = contact.fullName || `${contact.firstName} ${contact.lastName}`.trim();
    const email = contact.email || '';
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredLists = savedLists.filter((list: SavedList) => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={selectedTab === 'lists' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('lists')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Lists
          </Button>
          <Button
            variant={selectedTab === 'contacts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('contacts')}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Contacts
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Lists Tab - Entity-specific saved lists with drill-down */}
        {selectedTab === 'lists' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Lists
              </h3>
              {bulkMode && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Select All ({filteredLists.length})
                  </Button>
                  <Button size="sm" variant="outline">
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>

            {listsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading lists...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* All Entities List */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getEntityColor(entityType)}`}>
                        {(() => {
                          const Icon = getEntityIcon(entityType);
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          All {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {filteredEntities.length} items
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemExpansion('all-entities')}
                    >
                      {expandedItems.has('all-entities') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Entity List with Drill-down */}
                  {expandedItems.has('all-entities') && (
                    <div className="mt-4 space-y-2 pl-6 border-l-2 border-gray-100">
                      {filteredEntities.map((entity: Entity) => (
                        <div key={entity.id} className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                onChange={() => handleSelectRecipient(entity, 'entity')}
                                checked={selectedRecipients.some(r => 
                                  r.type === 'entity' && r.id === entity.id
                                )}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{entity.name}</p>
                                {entity.email && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {entity.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Drill-down button for hierarchical relationships */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleItemExpansion(`entity-${entity.id}`)}
                            >
                              {expandedItems.has(`entity-${entity.id}`) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Drill-down content */}
                          {expandedItems.has(`entity-${entity.id}`) && (
                            <div className="ml-6 space-y-2">
                              {/* For opportunities, show related customer */}
                              {entityType === 'opportunities' && (() => {
                                const customer = getCustomerForOpportunity(entity.id);
                                return customer ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          className="rounded border-gray-300"
                                          onChange={() => handleSelectRecipient(customer, 'customer')}
                                          checked={selectedRecipients.some(r => 
                                            r.type === 'customer' && r.id === customer.id
                                          )}
                                        />
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <div>
                                          <p className="font-medium text-gray-900">{customer.name}</p>
                                          <p className="text-sm text-gray-500">Related Customer</p>
                                        </div>
                                      </div>
                                      {entityContacts[customer.id] && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleItemExpansion(`customer-${customer.id}`)}
                                        >
                                          {expandedItems.has(`customer-${customer.id}`) ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                    
                                    {/* Customer contacts */}
                                    {expandedItems.has(`customer-${customer.id}`) && entityContacts[customer.id] && (
                                      <div className="ml-6 space-y-2">
                                        {entityContacts[customer.id].map((contact: Contact) => (
                                          <div key={contact.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                            <input
                                              type="checkbox"
                                              className="rounded border-gray-300"
                                              onChange={() => handleSelectRecipient(contact, 'contact')}
                                              checked={selectedRecipients.some(r => 
                                                r.type === 'contact' && r.id === contact.id
                                              )}
                                            />
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                              <Users className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-900">{contact.fullName}</p>
                                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                {contact.email && (
                                                  <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {contact.email}
                                                  </span>
                                                )}
                                                {contact.jobTitle && (
                                                  <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    {contact.jobTitle}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : null;
                              })()}

                              {/* Direct entity contacts (for partners, customers, internal) */}
                              {entityContacts[entity.id] && entityType !== 'opportunities' && (
                                <div className="space-y-2">
                                  {entityContacts[entity.id].map((contact: Contact) => (
                                    <div key={contact.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                      <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        onChange={() => handleSelectRecipient(contact, 'contact')}
                                        checked={selectedRecipients.some(r => 
                                          r.type === 'contact' && r.id === contact.id
                                        )}
                                      />
                                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-gray-600" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                          {contact.fullName || `${contact.first_name || contact.firstName || ''} ${contact.last_name || contact.lastName || ''}`.trim()}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                          {contact.email && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              {contact.email}
                                            </span>
                                          )}
                                          {(contact.jobTitle || contact.job_title) && (
                                            <span className="flex items-center gap-1">
                                              <Briefcase className="h-3 w-3" />
                                              {contact.jobTitle || contact.job_title}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Lists */}
                {filteredLists.map((list: SavedList) => (
                  <div key={list.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onChange={() => handleSelectRecipient(list, 'entity')}
                          checked={selectedRecipients.some(r => 
                            r.type === 'entity' && r.id === list.id
                          )}
                        />
                        <div className={`p-2 rounded-lg ${getEntityColor(entityType)}`}>
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{list.name}</h4>
                          <p className="text-sm text-gray-500">
                            {list.itemCount} items • {list.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemExpansion(`list-${list.id}`)}
                      >
                        {expandedItems.has(`list-${list.id}`) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded List Items with Drill-down */}
                    {expandedItems.has(`list-${list.id}`) && (
                      <div className="mt-4 space-y-2 pl-6 border-l-2 border-gray-100">
                        {list.entityIds.map(entityId => {
                          const entity = entities.find((e: any) => e.id === entityId);
                          if (!entity) return null;
                          
                          return (
                            <div key={entity.id} className="space-y-2">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={() => handleSelectRecipient(entity, 'entity')}
                                    checked={selectedRecipients.some(r => 
                                      r.type === 'entity' && r.id === entity.id
                                    )}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900">{entity.name}</p>
                                    {entity.email && (
                                      <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {entity.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleItemExpansion(`list-entity-${entity.id}`)}
                                >
                                  {expandedItems.has(`list-entity-${entity.id}`) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              {/* Entity contacts within list */}
                              {expandedItems.has(`list-entity-${entity.id}`) && entityContacts[entity.id] && (
                                <div className="ml-6 space-y-2">
                                  {entityContacts[entity.id].map((contact: any) => {
                                    const displayName = contact.fullName || `${contact.first_name || contact.firstName || ''} ${contact.last_name || contact.lastName || ''}`.trim();
                                    return (
                                      <div key={contact.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                        <input
                                          type="checkbox"
                                          className="rounded border-gray-300"
                                          onChange={() => handleSelectRecipient(contact, 'contact')}
                                          checked={selectedRecipients.some(r => 
                                            r.type === 'contact' && r.id === contact.id
                                          )}
                                        />
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                          <Users className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{displayName}</p>
                                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            {contact.email && (
                                              <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {contact.email}
                                              </span>
                                            )}
                                            {(contact.jobTitle || contact.job_title) && (
                                              <span className="flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {contact.jobTitle || contact.job_title}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab - All related contacts with filters */}
        {selectedTab === 'contacts' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">All Contacts</h3>
            </div>

            {contactsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading contacts...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact: Contact) => (
                  <div key={contact.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:border-blue-200 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => handleSelectRecipient(contact, 'contact')}
                      checked={selectedRecipients.some(r => 
                        r.type === 'contact' && r.id === contact.id
                      )}
                    />
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {contact.fullName || `${contact.first_name || contact.firstName || ''} ${contact.last_name || contact.lastName || ''}`.trim()}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                        {(contact.jobTitle || contact.job_title) && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {contact.jobTitle || contact.job_title}
                          </span>
                        )}
                      </div>
                      {contact.company && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {contact.company}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredContacts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium mb-2">No contacts found</p>
                    <p className="text-sm">Try adjusting your search or add new contacts.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}