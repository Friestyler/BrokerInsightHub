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
  Target,
  BookOpen,
  Check,
  Bookmark
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
  linkedEntityType?: string;
  linked_entity_type?: string;
  linkedEntityId?: number;
  linked_entity_id?: number;
}

interface Entity {
  id: number;
  name?: string;
  title?: string; // For opportunities
  type: string;
  email?: string;
  phone?: string;
  description?: string;
  customerId?: number; // For opportunities
  contactCount?: number;
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
  initialTab?: string | null;
}

export default function RecipientSelector({ 
  entityType, 
  selectedRecipients = [], 
  onRecipientsChange,
  initialTab 
}: RecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map URL tab parameters to tab values and set initial tab
  const getInitialTab = (tabParam: string | null) => {
    switch (tabParam) {
      case 'missing-contacts': return 'missing';
      case 'selected': return 'selected';
      case 'lists': return 'lists';
      case 'contacts': return 'contacts';
      case 'segments': return 'segments';
      default: return 'lists';
    }
  };
  
  const initialTabValue = getInitialTab(initialTab ?? null);
  const [selectedTab, setSelectedTab] = useState<'lists' | 'contacts' | 'selected' | 'missing' | 'segments'>(initialTabValue);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showInlineContactForm, setShowInlineContactForm] = useState<string | null>(null);
  const [inlineContactData, setInlineContactData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    phone: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch main entities based on type
  const { data: entitiesResponse = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/degoudse/${entityType}`],
    enabled: !!entityType
  });
  
  // Extract entities from response (handle both array and object with data property)
  const entities = Array.isArray(entitiesResponse) ? entitiesResponse : (entitiesResponse.data || []);

  // Fetch customers for opportunity drill-down
  const { data: customersResponse, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/degoudse/customers'],
    enabled: entityType === 'opportunities'
  });
  const customers = customersResponse?.data || [];

  // Fetch all contacts
  const { data: allContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/degoudse/contacts`]
  });

  // Fetch saved lists for the entity type
  const { data: savedLists = [], isLoading: listsLoading } = useQuery({
    queryKey: [`/api/degoudse/saved-lists?entity_type=${entityType}`]
  });

  // Fetch saved views (segments) for the entity type
  const { data: savedViews = [], isLoading: viewsLoading } = useQuery({
    queryKey: [`/api/degoudse/saved-views?entity_type=${entityType}`]
  });

  // Helper functions
  const getContactDisplayName = (contact: Contact) => {
    if (contact.fullName || contact.full_name) {
      return contact.fullName || contact.full_name;
    }
    const firstName = contact.firstName || contact.first_name || '';
    const lastName = contact.lastName || contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Contact';
  };

  const getContactJobTitle = (contact: Contact) => {
    return contact.jobTitle || contact.job_title || '';
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectRecipient = (item: any, type: string) => {
    const recipientKey = `${type}-${item.id}`;
    const isSelected = selectedRecipients.some(r => r.recipientKey === recipientKey);
    
    if (isSelected) {
      onRecipientsChange(selectedRecipients.filter(r => r.recipientKey !== recipientKey));
    } else {
      const newRecipient = {
        ...item,
        type,
        recipientKey
      };
      onRecipientsChange([...selectedRecipients, newRecipient]);
    }
  };

  const handleCreateInlineContact = (entityId: number, entityType: string) => {
    const contactData = {
      ...inlineContactData,
      linkedEntityId: entityId,
      linkedEntityType: entityType
    };
    
    // Add to selected recipients
    const newContact = {
      ...contactData,
      id: Date.now(), // Temporary ID
      type: 'contact',
      recipientKey: `contact-${Date.now()}`,
      fullName: `${inlineContactData.first_name} ${inlineContactData.last_name}`.trim()
    };
    
    onRecipientsChange([...selectedRecipients, newContact]);
    
    // Reset form
    setShowInlineContactForm(null);
    setInlineContactData({
      first_name: '',
      last_name: '',
      email: '',
      job_title: '',
      phone: ''
    });
    
    toast({
      title: "Contact added",
      description: `${newContact.fullName} has been added to your campaign recipients.`,
    });
  };

  // Get entity contacts for drill-down
  const getEntityContacts = (entityId: number, entityType: string) => {
    return allContacts.filter(contact => {
      const contactEntityId = contact.linkedEntityId || contact.linked_entity_id;
      const contactEntityType = contact.linkedEntityType || contact.linked_entity_type;
      return contactEntityId === entityId && contactEntityType === entityType;
    });
  };

  // Filter entities based on search
  const filteredEntities = entities.filter((entity: Entity) => {
    const searchTerm = searchQuery.toLowerCase();
    const entityName = entity.name || entity.title || '';
    return entityName.toLowerCase().includes(searchTerm);
  });

  // Filter contacts based on search
  const filteredContacts = allContacts.filter((contact: Contact) => {
    const searchTerm = searchQuery.toLowerCase();
    const contactName = getContactDisplayName(contact);
    const contactEmail = contact.email || '';
    return contactName.toLowerCase().includes(searchTerm) || 
           contactEmail.toLowerCase().includes(searchTerm);
  });

  // Tab buttons
  const tabButtons = [
    { id: 'lists', label: 'All Lists', icon: BookOpen },
    { id: 'segments', label: 'Segments', icon: Target },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'missing', label: 'Missing Contacts', icon: UserPlus },
    { id: 'selected', label: 'Selected', icon: Check, count: selectedRecipients.length }
  ];

  const renderInlineContactForm = (entityId: number, entityType: string, formKey: string) => (
    <div className="mt-3">
      {showInlineContactForm === formKey ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="First name"
                  value={inlineContactData.first_name}
                  onChange={(e) => setInlineContactData({
                    ...inlineContactData,
                    first_name: e.target.value
                  })}
                />
              </div>
              <div>
                <Input
                  placeholder="Last name"
                  value={inlineContactData.last_name}
                  onChange={(e) => setInlineContactData({
                    ...inlineContactData,
                    last_name: e.target.value
                  })}
                />
              </div>
            </div>
            <div>
              <Input
                placeholder="Email address"
                value={inlineContactData.email}
                onChange={(e) => setInlineContactData({
                  ...inlineContactData,
                  email: e.target.value
                })}
              />
            </div>
            <div>
              <Input
                placeholder="Job title"
                value={inlineContactData.job_title}
                onChange={(e) => setInlineContactData({
                  ...inlineContactData,
                  job_title: e.target.value
                })}
              />
            </div>
            <div>
              <Input
                placeholder="Phone number"
                value={inlineContactData.phone}
                onChange={(e) => setInlineContactData({
                  ...inlineContactData,
                  phone: e.target.value
                })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowInlineContactForm(null);
                  setInlineContactData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    job_title: '',
                    phone: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleCreateInlineContact(entityId, entityType)}
                disabled={!inlineContactData.first_name || !inlineContactData.email}
              >
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInlineContactForm(formKey)}
          className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'lists':
        return (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Entities */}
            <div className="space-y-3">
              {filteredEntities.map((entity: Entity) => {
                const entityContacts = getEntityContacts(entity.id, entityType.slice(0, -1));
                const hasContacts = entityContacts.length > 0;
                
                return (
                  <div key={entity.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onChange={() => handleSelectRecipient(entity, entityType.slice(0, -1))}
                          checked={selectedRecipients.some(r => 
                            r.type === entityType.slice(0, -1) && r.id === entity.id
                          )}
                        />
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{entity.name || entity.title}</p>
                          <p className="text-sm text-gray-500">{entity.description}</p>
                        </div>
                      </div>
                      {hasContacts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemExpansion(`entity-${entity.id}`)}
                          className="bg-blue-200 hover:bg-blue-300"
                        >
                          {expandedItems.has(`entity-${entity.id}`) ? (
                            <ChevronDown className="h-4 w-4 text-blue-800" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-blue-800" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Entity contacts */}
                    {expandedItems.has(`entity-${entity.id}`) && (
                      <div className="ml-8 mt-3 space-y-2 border-l-2 border-gray-200 pl-4">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                          👤 Contact Persons
                        </div>
                        {entityContacts.map((contact: Contact) => (
                          <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
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
                        
                        {/* Add Contact Button for entities */}
                        {renderInlineContactForm(entity.id, entityType.slice(0, -1), `entity-${entity.id}`)}
                      </div>
                    )}

                    {/* Opportunities drill-down for customers */}
                    {entityType === 'opportunities' && entity.customerId && (
                      <div className="ml-8 mt-3 border-l-2 border-gray-200 pl-4">
                        {(() => {
                          const customer = customers.find((c: any) => c.id === entity.customerId);
                          if (!customer) return null;
                          
                          const customerContacts = getEntityContacts(customer.id, 'customer');
                          const hasContacts = customerContacts.length > 0;
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={() => handleSelectRecipient(customer, 'customer')}
                                    checked={selectedRecipients.some(r => 
                                      r.type === 'customer' && r.id === customer.id
                                    )}
                                  />
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{customer.name}</p>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      👤 {customerContacts.length} contacts
                                    </span>
                                  </div>
                                </div>
                                {hasContacts && (
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
                                )}
                              </div>
                              
                              {/* Customer contacts */}
                              {expandedItems.has(`customer-${customer.id}`) && (
                                <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                                    👤 Contact Persons
                                  </div>
                                  {customerContacts.map((contact: Contact) => (
                                    <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
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
                                  
                                  {/* Add Contact Button for customers */}
                                  {renderInlineContactForm(customer.id, 'customer', `customer-${customer.id}`)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Saved Lists */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Saved Lists</h3>
              {savedLists.map((list: SavedList) => (
                <div key={list.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => handleSelectRecipient(list, 'list')}
                      checked={selectedRecipients.some(r => 
                        r.type === 'list' && r.id === list.id
                      )}
                    />
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{list.name}</p>
                      <p className="text-sm text-gray-500">{list.description}</p>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {list.itemCount} items
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'segments':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search segments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-3">
              {savedViews.map((view: any) => (
                <div key={view.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => handleSelectRecipient(view, 'segment')}
                      checked={selectedRecipients.some(r => 
                        r.type === 'segment' && r.id === view.id
                      )}
                    />
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{view.name}</p>
                      <p className="text-sm text-gray-500">{view.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-3">
              {filteredContacts.map((contact: Contact) => (
                <div key={contact.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => handleSelectRecipient(contact, 'contact')}
                      checked={selectedRecipients.some(r => 
                        r.type === 'contact' && r.id === contact.id
                      )}
                    />
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{getContactDisplayName(contact)}</p>
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
                </div>
              ))}
            </div>
          </div>
        );

      case 'missing':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Missing Contacts</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Entities without contact information. Add contacts to improve targeting.
              </p>
            </div>
            
            <div className="space-y-3">
              {filteredEntities.filter((entity: Entity) => {
                const entityContacts = getEntityContacts(entity.id, entityType.slice(0, -1));
                return entityContacts.length === 0;
              }).map((entity: Entity) => (
                <div key={entity.id} className="border rounded-lg p-3 bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => handleSelectRecipient(entity, entityType.slice(0, -1))}
                      checked={selectedRecipients.some(r => 
                        r.type === entityType.slice(0, -1) && r.id === entity.id
                      )}
                    />
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entity.name || entity.title}</p>
                      <p className="text-sm text-gray-500">{entity.description}</p>
                      <span className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
                        No contacts
                      </span>
                    </div>
                  </div>
                  
                  {/* Add Contact Button */}
                  {renderInlineContactForm(entity.id, entityType.slice(0, -1), `missing-${entity.id}`)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'selected':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Selected Recipients ({selectedRecipients.length})</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Review and manage your selected campaign recipients.
              </p>
            </div>
            
            <div className="space-y-3">
              {selectedRecipients.map((recipient: any) => (
                <div key={recipient.recipientKey} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {recipient.name || recipient.title || recipient.fullName || getContactDisplayName(recipient)}
                        </p>
                        <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded">
                          {recipient.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRecipientsChange(
                        selectedRecipients.filter(r => r.recipientKey !== recipient.recipientKey)
                      )}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabButtons.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}