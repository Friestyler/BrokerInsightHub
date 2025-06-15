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
  MapPin,
  Eye,
  X,
  Target,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Contact {
  id: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  fullName?: string;
  full_name?: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  job_title?: string;
  department?: string;
  company?: string;
  linkedEntityType?: string;
  linked_entity_type?: string;
  linkedEntityId?: number;
  linked_entity_id?: number;
  isPrimary?: boolean;
  is_primary?: boolean;
  isActive?: boolean;
  is_active?: boolean;
}

interface Entity {
  id: number;
  name?: string;
  title?: string; // For opportunities
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
  members: number[];
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
  const [selectedTab, setSelectedTab] = useState<'lists' | 'contacts' | 'selected'>('lists');
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

  // Build entity-contact relationships for drill-down (include all entity types for hierarchical relationships)
  const { data: entityContacts = {}, isLoading: entityContactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts`],
    select: (data: Contact[]) => {
      const contactsByEntity: Record<number, Contact[]> = {};
      data.forEach(contact => {
        const entityId = contact.linkedEntityId || contact.linked_entity_id;
        const entityTypeFromDb = contact.linkedEntityType || contact.linked_entity_type;
        
        if (entityId && entityTypeFromDb) {
          // Include contacts for all entity types to support drill-down relationships
          if (!contactsByEntity[entityId]) {
            contactsByEntity[entityId] = [];
          }
          contactsByEntity[entityId].push(contact);
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
    const opportunity = (entities as any[] || []).find((e: any) => e.id === opportunityId);
    if (opportunity?.clientId) {
      return (customers as any[] || []).find((c: Customer) => c.id === opportunity.clientId);
    }
    return null;
  };

  const filteredEntities = (entities as any[] || []).filter((entity: Entity) => {
    const entityName = entity.name || entity.title || '';
    return entityName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredContacts = (allContacts as any[] || []).filter((contact: Contact) => {
    const fullName = contact.fullName || `${contact.firstName || (contact as any).first_name || ''} ${contact.lastName || (contact as any).last_name || ''}`.trim();
    const email = contact.email || '';
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredLists = (savedLists as any[] || []).filter((list: SavedList) => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = () => {
    addContactMutation.mutate(newContact);
  };

  // Helper function to get contact display name
  const getContactDisplayName = (contact: Contact) => {
    return contact.fullName || contact.full_name || 
           `${contact.firstName || contact.first_name || ''} ${contact.lastName || contact.last_name || ''}`.trim() || 
           'Unknown Contact';
  };

  // Helper function to get contact job title
  const getContactJobTitle = (contact: Contact) => {
    return contact.jobTitle || contact.job_title;
  };

  // Helper function to get entity display name
  const getEntityDisplayName = (entity: Entity) => {
    return entity.name || entity.title || 'Unknown Entity';
  };

  // Calculate selection counts
  const selectionCounts = {
    total: selectedRecipients.length,
    contacts: selectedRecipients.filter(r => r.type === 'contact').length,
    entities: selectedRecipients.filter(r => r.type === 'entity' || r.type === 'customer').length
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
          <Button
            variant={selectedTab === 'selected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('selected')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Selected ({selectedRecipients.length})
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
                                <p className="font-medium text-gray-900">{getEntityDisplayName(entity)}</p>
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
                              {/* For opportunities, show customer hierarchy */}
                              {entityType === 'opportunities' && (() => {
                                const customer = getCustomerForOpportunity(entity.id);
                                if (!customer) return null;

                                const customerContacts = entityContacts[customer.id] || [];
                                const hasContacts = customerContacts.length > 0;

                                return (
                                  <div className="space-y-2">
                                    {/* Customer Organization */}
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 shadow-sm">
                                      <div className="flex items-center gap-4">
                                        <input
                                          type="checkbox"
                                          className="rounded border-gray-300 w-4 h-4"
                                          onChange={() => handleSelectRecipient(customer, 'customer')}
                                          checked={selectedRecipients.some(r => 
                                            r.type === 'customer' && r.id === customer.id
                                          )}
                                        />
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                          <Users className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-blue-900 text-lg">{customer.name}</p>
                                          <p className="text-sm text-blue-700 font-medium">🏢 CUSTOMER ORGANIZATION</p>
                                        </div>
                                      </div>
                                      {hasContacts && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-blue-600 font-medium">
                                            {customerContacts.length} contacts
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleItemExpansion(`customer-${customer.id}`)}
                                            className="bg-blue-200 hover:bg-blue-300"
                                          >
                                            {expandedItems.has(`customer-${customer.id}`) ? (
                                              <ChevronDown className="h-4 w-4 text-blue-800" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-blue-800" />
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Customer contacts */}
                                    {hasContacts && expandedItems.has(`customer-${customer.id}`) && (
                                      <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                                          👤 Contact Persons
                                        </div>
                                        {customerContacts.map((contact: Contact) => (
                                          <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                            <input
                                              type="checkbox"
                                              className="rounded border-gray-300 w-4 h-4"
                                              onChange={() => handleSelectRecipient(contact, 'contact')}
                                              checked={selectedRecipients.some(r => 
                                                r.type === 'contact' && r.id === contact.id
                                              )}
                                            />
                                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                              <Users className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-semibold text-gray-800">
                                                {getContactDisplayName(contact)}
                                              </p>
                                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                {contact.email && (
                                                  <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-blue-700">
                                                    <Mail className="h-3 w-3" />
                                                    {contact.email}
                                                  </span>
                                                )}
                                                {getContactJobTitle(contact) && (
                                                  <span className="flex items-center gap-1 text-gray-500">
                                                    <Briefcase className="h-3 w-3" />
                                                    {getContactJobTitle(contact)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Direct entity contacts (only for partners, customers, and internal - NOT opportunities) */}
                              {entityType !== 'opportunities' && entityContacts[entity.id] && (
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
                                          {getContactDisplayName(contact)}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                          {contact.email && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              {contact.email}
                                            </span>
                                          )}
                                          {getContactJobTitle(contact) && (
                                            <span className="flex items-center gap-1">
                                              <Briefcase className="h-3 w-3" />
                                              {getContactJobTitle(contact)}
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
                        {(list.members || []).map((entityId: number) => {
                          const entity = (entities as any[] || []).find((e: any) => e.id === entityId);
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
                                    <p className="font-medium text-gray-900">{getEntityDisplayName(entity)}</p>
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
                                  {entityContacts[entity.id].map((contact: any) => (
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
                                        <p className="font-medium text-gray-900">{getContactDisplayName(contact)}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                          {contact.email && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              {contact.email}
                                            </span>
                                          )}
                                          {getContactJobTitle(contact) && (
                                            <span className="flex items-center gap-1">
                                              <Briefcase className="h-3 w-3" />
                                              {getContactJobTitle(contact)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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
                        {getContactDisplayName(contact)}
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
                        {getContactJobTitle(contact) && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {getContactJobTitle(contact)}
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

        {/* Selected Tab - Contact-first hierarchy showing underlying entities */}
        {selectedTab === 'selected' && (
          <div className="space-y-4">
            {selectedRecipients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">No recipients selected</p>
                <p className="text-sm">Select contacts or entities from the Lists or Contacts tabs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Selected Recipients</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{selectionCounts.contacts} contacts</span>
                    <span>{selectionCounts.entities} entities</span>
                    <span className="font-medium">{selectionCounts.total} total</span>
                  </div>
                </div>

                {/* Contact-first hierarchy */}
                <div className="space-y-3">
                  {(() => {
                    // Get all selected contacts (both direct and from entities)
                    const directContacts = selectedRecipients.filter(r => r.type === 'contact');
                    const selectedEntities = selectedRecipients.filter(r => r.type === 'entity' || r.type === 'customer');
                    
                    // Get contacts from selected entities
                    const entityRelatedContacts = selectedEntities.reduce((acc: any[], entity) => {
                      const contacts = entityContacts[entity.id] || [];
                      return [...acc, ...contacts.map((contact: any) => ({ ...contact, parentEntity: entity }))];
                    }, []);
                    
                    // Combine all contacts
                    const allContacts = [...directContacts, ...entityRelatedContacts];
                    
                    // Group contacts by their source (direct or entity)
                    const contactsBySource = allContacts.reduce((acc: any, contact) => {
                      const key = contact.parentEntity ? `entity-${contact.parentEntity.id}` : 'direct';
                      if (!acc[key]) {
                        acc[key] = {
                          type: contact.parentEntity ? 'entity' : 'direct',
                          entity: contact.parentEntity,
                          contacts: []
                        };
                      }
                      acc[key].contacts.push(contact);
                      return acc;
                    }, {});

                    return Object.values(contactsBySource).map((group: any) => (
                      <div key={group.type === 'direct' ? 'direct-contacts' : `entity-${group.entity.id}`} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {group.type === 'direct' ? (
                                <>
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">Direct Contacts</h4>
                                    <p className="text-sm text-gray-600">
                                      {group.contacts.length} individual contacts
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    group.entity.type === 'customer' ? 'bg-blue-600' : 
                                    group.entity.type === 'partner' ? 'bg-purple-600' : 
                                    group.entity.type === 'opportunity' ? 'bg-green-600' : 'bg-orange-600'
                                  }`}>
                                    {(() => {
                                      const Icon = group.entity.type === 'customer' ? Users :
                                                  group.entity.type === 'partner' ? Handshake :
                                                  group.entity.type === 'opportunity' ? Target : Building2;
                                      return <Icon className="h-4 w-4 text-white" />;
                                    })()}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{getEntityDisplayName(group.entity)}</h4>
                                    <p className="text-sm text-gray-600">
                                      {group.contacts.length} contacts from {group.entity.type}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemExpansion(group.type === 'direct' ? 'direct-contacts' : `entity-${group.entity.id}`)}
                              >
                                {expandedItems.has(group.type === 'direct' ? 'direct-contacts' : `entity-${group.entity.id}`) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              {group.type !== 'direct' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updatedRecipients = selectedRecipients.filter(r => 
                                      !(r.type === group.entity.type && r.id === group.entity.id)
                                    );
                                    onRecipientsChange(updatedRecipients);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {expandedItems.has(group.type === 'direct' ? 'direct-contacts' : `entity-${group.entity.id}`) && (
                          <div className="p-4 space-y-3">
                            {group.contacts.map((contact: any) => (
                              <div key={`contact-${contact.id}`} className="space-y-3">
                                {/* Contact Information */}
                                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 text-lg">{getContactDisplayName(contact)}</p>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        {contact.email && (
                                          <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-blue-700">
                                            <Mail className="h-3 w-3" />
                                            {contact.email}
                                          </span>
                                        )}
                                        {getContactJobTitle(contact) && (
                                          <span className="flex items-center gap-1 text-gray-500">
                                            <Briefcase className="h-3 w-3" />
                                            {getContactJobTitle(contact)}
                                          </span>
                                        )}
                                        {contact.phone && (
                                          <span className="flex items-center gap-1 text-gray-500">
                                            <Phone className="h-3 w-3" />
                                            {contact.phone}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleItemExpansion(`contact-hierarchy-${contact.id}`)}
                                    >
                                      {expandedItems.has(`contact-hierarchy-${contact.id}`) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const updatedRecipients = selectedRecipients.filter(r => 
                                          !(r.type === 'contact' && r.id === contact.id)
                                        );
                                        onRecipientsChange(updatedRecipients);
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Underlying Entity Hierarchy */}
                                {expandedItems.has(`contact-hierarchy-${contact.id}`) && (
                                  <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                                      🏢 Underlying Organizations
                                    </div>
                                    
                                    {/* Direct entity relationship */}
                                    {contact.parentEntity && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            contact.parentEntity.type === 'customer' ? 'bg-blue-600' : 
                                            contact.parentEntity.type === 'partner' ? 'bg-purple-600' : 
                                            contact.parentEntity.type === 'opportunity' ? 'bg-green-600' : 'bg-orange-600'
                                          }`}>
                                            {(() => {
                                              const Icon = contact.parentEntity.type === 'customer' ? Users :
                                                          contact.parentEntity.type === 'partner' ? Handshake :
                                                          contact.parentEntity.type === 'opportunity' ? Target : Building2;
                                              return <Icon className="h-4 w-4 text-white" />;
                                            })()}
                                          </div>
                                          <div>
                                            <p className="font-bold text-blue-900">{getEntityDisplayName(contact.parentEntity)}</p>
                                            <p className="text-sm text-blue-700 font-medium uppercase">
                                              {contact.parentEntity.type === 'customer' ? '🏢 Customer Organization' :
                                               contact.parentEntity.type === 'partner' ? '🤝 Partner Organization' :
                                               contact.parentEntity.type === 'opportunity' ? '🎯 Opportunity' : '🏢 Organization'}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        {/* For opportunities, show the customer hierarchy */}
                                        {contact.parentEntity.type === 'opportunity' && (() => {
                                          const customer = getCustomerForOpportunity(contact.parentEntity.id);
                                          if (customer) {
                                            return (
                                              <div className="ml-4 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                  <ArrowRight className="h-3 w-3" />
                                                  <span>RELATED CUSTOMER</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                                                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-white" />
                                                  </div>
                                                  <div>
                                                    <p className="font-bold text-purple-900">{customer.name}</p>
                                                    <p className="text-sm text-purple-700 font-medium">🏢 CUSTOMER ORGANIZATION</p>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    )}
                                    
                                    {/* For direct contacts, show all their potential relationships */}
                                    {!contact.parentEntity && (
                                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-600 italic">
                                          Direct contact - no organizational hierarchy
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}