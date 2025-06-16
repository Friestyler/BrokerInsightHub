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
  ArrowRight,
  BookOpen,
  Check
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
  const [selectedTab, setSelectedTab] = useState<'lists' | 'contacts' | 'selected' | 'missing'>('lists');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAddContact, setShowAddContact] = useState(false);
  const [showOnlyMissingContacts, setShowOnlyMissingContacts] = useState(false);

  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    linkedEntityId: null as number | null
  });
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
  const { data: entities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/degoudse/${entityType}`],
    enabled: !!entityType
  });

  // Fetch customers for opportunity drill-down
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/degoudse/customers'],
    enabled: entityType === 'opportunities'
  });

  // Fetch partners for contact relationship mapping
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/degoudse/partners']
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

  // Inline contact creation mutation
  const createInlineContactMutation = useMutation({
    mutationFn: async ({ contactData, entityId }: { contactData: any, entityId: number }) => {
      const payload = {
        firstName: contactData.first_name,
        lastName: contactData.last_name,
        email: contactData.email,
        position: contactData.job_title,
        phone: contactData.phone,
        linkedEntityType: entityType.slice(0, -1), // Remove 's' from plural (e.g., 'opportunities' -> 'opportunity')
        linkedEntityId: entityId,
        isActive: true
      };
      return await apiRequest('/api/degoudse/contacts', 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/degoudse/contacts'] });
      setShowInlineContactForm(null);
      setInlineContactData({
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        phone: ''
      });
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating inline contact:', error);
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
      // When deselecting, remove the entity and all its related contacts
      const relatedKeys = [`${type}-${recipient.id}`];
      
      // Add related contacts to removal list
      const relatedContacts = entityContacts[recipient.id] || [];
      relatedContacts.forEach(contact => {
        relatedKeys.push(`contact-${contact.id}`);
      });
      
      // For opportunities, also remove customer contacts
      if (type === 'entity' && entityType === 'opportunities') {
        const customer = getCustomerForOpportunity(recipient.id);
        if (customer) {
          relatedKeys.push(`customer-${customer.id}`);
          const customerContacts = entityContacts[customer.id] || [];
          customerContacts.forEach(contact => {
            relatedKeys.push(`contact-${contact.id}`);
          });
        }
      }
      
      onRecipientsChange(selectedRecipients.filter(r => 
        !relatedKeys.includes(`${r.type}-${r.id}`)
      ));
    } else {
      // When selecting, add the entity and all its related contacts
      const newRecipients = [
        ...selectedRecipients,
        { ...recipient, type, recipientKey }
      ];
      
      // Add related contacts
      const relatedContacts = entityContacts[recipient.id] || [];
      relatedContacts.forEach(contact => {
        const contactKey = `contact-${contact.id}`;
        if (!selectedRecipients.some(r => `${r.type}-${r.id}` === contactKey)) {
          newRecipients.push({
            ...contact,
            type: 'contact',
            recipientKey: contactKey
          });
        }
      });
      
      // For opportunities, also select customer and customer contacts
      if (type === 'entity' && entityType === 'opportunities') {
        const customer = getCustomerForOpportunity(recipient.id);
        if (customer) {
          const customerKey = `customer-${customer.id}`;
          if (!selectedRecipients.some(r => `${r.type}-${r.id}` === customerKey)) {
            newRecipients.push({
              ...customer,
              type: 'customer',
              recipientKey: customerKey
            });
          }
          
          // Add customer contacts
          const customerContacts = entityContacts[customer.id] || [];
          customerContacts.forEach(contact => {
            const contactKey = `contact-${contact.id}`;
            if (!selectedRecipients.some(r => `${r.type}-${r.id}` === contactKey)) {
              newRecipients.push({
                ...contact,
                type: 'contact',
                recipientKey: contactKey
              });
            }
          });
        }
      }
      
      onRecipientsChange(newRecipients);
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
    const matchesSearch = entityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If showing only missing contacts, filter to entities without contacts
    if (showOnlyMissingContacts) {
      const entityContactsList = entityContacts[entity.id] || [];
      const hasContacts = entityContactsList.length > 0;
      const hasSelectedContacts = selectedRecipients.some(r => 
        r.type === 'contact' && (r.linkedEntityId === entity.id || r.linked_entity_id === entity.id)
      );
      return matchesSearch && !hasContacts && !hasSelectedContacts;
    }
    
    return matchesSearch;
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

  // Calculate summary statistics
  const summaryStats = (() => {
    // Count selected entities (opportunities, customers, partners, etc.)
    const selectedEntities = selectedRecipients.filter(r => r.type === 'entity' || r.type === 'customer');
    const selectedContacts = selectedRecipients.filter(r => r.type === 'contact');
    
    // Find entities that have no contacts assigned
    const entitiesWithoutContacts = selectedEntities.filter(entity => {
      // Special handling for opportunities - check their customer's contacts
      if (entityType === 'opportunities' && entity.type === 'entity') {
        const customer = getCustomerForOpportunity(entity.id);
        if (!customer) return true; // No customer found, so no contacts
        
        const customerContacts = entityContacts[customer.id] || [];
        const hasDirectContacts = customerContacts.length > 0;
        
        // Check if any individually selected contacts belong to this customer
        const hasIndirectContacts = selectedContacts.some(contact => {
          const contactEntityId = contact.linkedEntityId || contact.linked_entity_id;
          return contactEntityId === customer.id;
        });
        
        return !hasDirectContacts && !hasIndirectContacts;
      }
      
      // For non-opportunity entities, check their direct contacts
      const entityContactsList = entityContacts[entity.id] || [];
      
      // Check if this entity has any contacts assigned to it
      const hasDirectContacts = entityContactsList.length > 0;
      
      // Also check if any individually selected contacts belong to this entity
      const hasIndirectContacts = selectedContacts.some(contact => {
        const contactEntityId = contact.linkedEntityId || contact.linked_entity_id;
        return contactEntityId === entity.id;
      });
      
      return !hasDirectContacts && !hasIndirectContacts;
    });

    return {
      totalSelectedEntities: selectedEntities.length,
      totalSelectedContacts: selectedContacts.length,
      entitiesWithoutContacts: entitiesWithoutContacts.length,
      entitiesWithoutContactsList: entitiesWithoutContacts, // For detailed display
      totalRecipients: selectedEntities.length + selectedContacts.length
    };
  })();

  return (
    <div className="space-y-6">
      {/* Summary Cards - Always Present with Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Selection Summary */}
        <div 
          className={`rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
            selectedRecipients.length > 0 
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-150' 
              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => {
            if (selectedRecipients.length > 0) {
              setSelectedTab('selected');
              setShowOnlyMissingContacts(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selectedRecipients.length > 0 ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                selectedRecipients.length > 0 ? 'text-blue-900' : 'text-gray-600'
              }`}>
                {selectedRecipients.length > 0 ? 'Total Recipients Selected' : 'No Recipients Selected'}
              </h3>
              <div className={`flex items-center gap-4 text-sm mt-1 ${
                selectedRecipients.length > 0 ? 'text-blue-700' : 'text-gray-500'
              }`}>
                {selectedRecipients.length > 0 ? (
                  <>
                    <span className="font-medium">{summaryStats.totalRecipients} total</span>
                    <span>{summaryStats.totalSelectedEntities} organizations</span>
                    <span>{summaryStats.totalSelectedContacts} individual contacts</span>
                  </>
                ) : (
                  <span>Select entities or contacts to begin campaign targeting</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Card - Changes based on selection state */}
        <div 
          className={`rounded-lg p-4 transition-all duration-200 ${
            summaryStats.entitiesWithoutContacts > 0 ? 'cursor-pointer hover:shadow-md' : ''
          } ${
            selectedRecipients.length === 0 
              ? 'bg-gray-50 border border-gray-200'
              : summaryStats.entitiesWithoutContacts > 0 
                ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 hover:from-orange-100 hover:to-orange-150'
                : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
          }`}
          onClick={() => {
            if (summaryStats.entitiesWithoutContacts > 0) {
              setSelectedTab('missing');
              setShowOnlyMissingContacts(true);
              // Auto-expand the entity selection to show drill-down
              setExpandedItems(new Set(['all-entities']));
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              selectedRecipients.length === 0 
                ? 'bg-gray-400'
                : summaryStats.entitiesWithoutContacts > 0 
                  ? 'bg-orange-600'
                  : 'bg-green-600'
            }`}>
              {selectedRecipients.length === 0 ? (
                <Users className="h-5 w-5 text-white" />
              ) : summaryStats.entitiesWithoutContacts > 0 ? (
                <UserPlus className="h-5 w-5 text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              {selectedRecipients.length === 0 ? (
                <>
                  <h3 className="font-semibold text-gray-600">Campaign Status</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Ready to configure recipients
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Start by selecting entities or individual contacts</p>
                </>
              ) : summaryStats.entitiesWithoutContacts > 0 ? (
                <>
                  <h3 className="font-semibold text-orange-900">Missing Contacts</h3>
                  <div className="text-sm text-orange-700 mt-1">
                    <span className="font-medium">{summaryStats.entitiesWithoutContacts} {entityType.slice(0, -1)}{summaryStats.entitiesWithoutContacts !== 1 ? 's' : ''}</span> without contact information
                  </div>
                  <div className="text-xs text-orange-600 mt-2 space-y-1">
                    <p className="font-medium">Missing contacts for:</p>
                    {summaryStats.entitiesWithoutContactsList.slice(0, 3).map((entity: any) => (
                      <div key={entity.id} className="flex items-center gap-1">
                        <span>•</span>
                        <span>{getEntityDisplayName(entity)}</span>
                      </div>
                    ))}
                    {summaryStats.entitiesWithoutContactsList.length > 3 && (
                      <div className="text-orange-500">
                        ... and {summaryStats.entitiesWithoutContactsList.length - 3} more
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-orange-600 mt-2 font-medium">Check the "Selected" tab to add missing contacts</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-green-900">Ready for Delivery</h3>
                  <div className="text-sm text-green-700 mt-1">
                    All selected organizations have contact information
                  </div>
                  <p className="text-xs text-green-600 mt-1">Campaign can be sent successfully</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
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
            onClick={() => {
              setSelectedTab('lists');
              setShowOnlyMissingContacts(false);
            }}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Lists
          </Button>

          <Button
            variant={selectedTab === 'selected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedTab('selected');
              setShowOnlyMissingContacts(false);
            }}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Selected ({selectedRecipients.length})
          </Button>

          <Button
            variant={selectedTab === 'missing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedTab('missing');
              setShowOnlyMissingContacts(true);
              setExpandedItems(new Set(['all-entities']));
            }}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Missing Contacts
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

                              {/* Direct entity contacts for all entity types */}
                              <div className="space-y-2">
                                  {/* Existing contacts */}
                                  {entityContacts[entity.id] && entityContacts[entity.id].map((contact: Contact) => (
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
                                  
                                  {/* Add Contact Button */}
                                  {showInlineContactForm !== `${entity.id}-${entityType}` ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowInlineContactForm(`${entity.id}-${entityType}`)}
                                      className="w-full mt-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Add Contact for {entity.name}
                                    </Button>
                                  ) : (
                                    /* Inline Contact Creation Form */
                                    <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">Add New Contact</h4>
                                        <Button
                                          variant="ghost"
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
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                          <Label htmlFor="first_name" className="text-xs font-medium text-gray-700">First Name</Label>
                                          <Input
                                            id="first_name"
                                            placeholder="John"
                                            value={inlineContactData.first_name}
                                            onChange={(e) => setInlineContactData({
                                              ...inlineContactData,
                                              first_name: e.target.value
                                            })}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="last_name" className="text-xs font-medium text-gray-700">Last Name</Label>
                                          <Input
                                            id="last_name"
                                            placeholder="Doe"
                                            value={inlineContactData.last_name}
                                            onChange={(e) => setInlineContactData({
                                              ...inlineContactData,
                                              last_name: e.target.value
                                            })}
                                            className="mt-1"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email *</Label>
                                        <Input
                                          id="email"
                                          type="email"
                                          placeholder="john.doe@company.com"
                                          value={inlineContactData.email}
                                          onChange={(e) => setInlineContactData({
                                            ...inlineContactData,
                                            email: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                          <Label htmlFor="job_title" className="text-xs font-medium text-gray-700">Job Title</Label>
                                          <Input
                                            id="job_title"
                                            placeholder="Account Manager"
                                            value={inlineContactData.job_title}
                                            onChange={(e) => setInlineContactData({
                                              ...inlineContactData,
                                              job_title: e.target.value
                                            })}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="phone" className="text-xs font-medium text-gray-700">Phone</Label>
                                          <Input
                                            id="phone"
                                            placeholder="+31 6 12345678"
                                            value={inlineContactData.phone}
                                            onChange={(e) => setInlineContactData({
                                              ...inlineContactData,
                                              phone: e.target.value
                                            })}
                                            className="mt-1"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
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
                                          onClick={() => {
                                            if (!inlineContactData.email.trim()) {
                                              toast({
                                                title: "Error",
                                                description: "Email is required",
                                                variant: "destructive",
                                              });
                                              return;
                                            }
                                            createInlineContactMutation.mutate({
                                              contactData: inlineContactData,
                                              entityId: entity.id
                                            });
                                          }}
                                          disabled={createInlineContactMutation.isPending || !inlineContactData.email.trim()}
                                        >
                                          {createInlineContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
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

        {/* Selected Tab - Entity-first hierarchy (opportunities → customers → contacts) */}
        {selectedTab === 'selected' && selectedRecipients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium mb-2">No recipients selected</p>
            <p className="text-sm">Select entities from the Lists tab to begin targeting.</p>
          </div>
        )}

        {selectedTab === 'selected' && selectedRecipients.length > 0 && entityType === 'opportunities' && (
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

            {/* Opportunities Section */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Opportunities</h4>
                      <p className="text-sm text-green-700">
                        {selectedRecipients.filter(r => r.type === 'entity' && entityType === 'opportunities').length} opportunities selected
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemExpansion('selected-opportunities')}
                    className="bg-green-200 hover:bg-green-300"
                  >
                    {expandedItems.has('selected-opportunities') ? (
                      <ChevronDown className="h-4 w-4 text-green-800" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-green-800" />
                    )}
                  </Button>
                </div>
              </div>
              
              {expandedItems.has('selected-opportunities') && (
                <div className="p-4 space-y-4">
                  {selectedRecipients
                    .filter(r => r.type === 'entity' && entityType === 'opportunities')
                    .filter(opportunity => {
                      if (!showOnlyMissingContacts) return true;
                      
                      // Check if this opportunity's customer has contacts
                      const customer = getCustomerForOpportunity(opportunity.id);
                      if (!customer) return true; // Show if no customer found
                      
                      const customerContacts = entityContacts[customer.id] || [];
                      const hasDirectContacts = customerContacts.length > 0;
                      
                      // Check if any individually selected contacts belong to this customer
                      const hasSelectedContacts = selectedRecipients.some(r => 
                        r.type === 'contact' && (r.linkedEntityId === customer.id || r.linked_entity_id === customer.id)
                      );
                      
                      return !hasDirectContacts && !hasSelectedContacts;
                    })
                    .map((opportunity) => {
                      const customer = getCustomerForOpportunity(opportunity.id);
                      const customerContacts = customer ? entityContacts[customer.id] || [] : [];
                      
                      return (
                        <div key={`opportunity-${opportunity.id}`} className="space-y-3 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Target className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{getEntityDisplayName(opportunity)}</p>
                                <p className="text-sm text-gray-600">Opportunity</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedRecipients = selectedRecipients.filter(r => 
                                  !(r.type === 'entity' && r.id === opportunity.id)
                                );
                                onRecipientsChange(updatedRecipients);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Customer level for this opportunity */}
                          {customer && (
                            <div className="ml-6 space-y-3 border-l-2 border-blue-200 pl-4">
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-blue-900">{customer.name}</p>
                                    <p className="text-sm text-blue-700">Customer Organization</p>
                                  </div>
                                </div>
                                {customerContacts.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleItemExpansion(`selected-customer-${customer.id}`)}
                                    className="bg-blue-200 hover:bg-blue-300"
                                  >
                                    {expandedItems.has(`selected-customer-${customer.id}`) ? (
                                      <ChevronDown className="h-4 w-4 text-blue-800" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-blue-800" />
                                    )}
                                  </Button>
                                )}
                              </div>

                              {/* Contacts for this customer */}
                              {customerContacts.length > 0 && expandedItems.has(`selected-customer-${customer.id}`) && (
                                <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                                    Contact Persons
                                  </div>
                                  {customerContacts.map((contact: Contact) => (
                                    <div key={`customer-${customer.id}-contact-${contact.id}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                          <Mail className="h-3 w-3 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">{getContactDisplayName(contact)}</p>
                                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                            {contact.email && (
                                              <span className="flex items-center gap-1">
                                                <Mail className="h-2 w-2" />
                                                {contact.email}
                                              </span>
                                            )}
                                            {getContactJobTitle(contact) && (
                                              <span className="flex items-center gap-1">
                                                <Briefcase className="h-2 w-2" />
                                                {getContactJobTitle(contact)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
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
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Tab - For non-opportunity entity types */}
        {selectedTab === 'selected' && selectedRecipients.length > 0 && entityType !== 'opportunities' && (
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

            {/* Entities Section */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {selectedRecipients.filter(r => r.type === 'entity' || r.type === 'customer').length} {entityType} selected
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemExpansion('selected-entities')}
                    className="bg-blue-200 hover:bg-blue-300"
                  >
                    {expandedItems.has('selected-entities') ? (
                      <ChevronDown className="h-4 w-4 text-blue-800" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-blue-800" />
                    )}
                  </Button>
                </div>
              </div>
              
              {expandedItems.has('selected-entities') && (
                <div className="p-4 space-y-4">
                  {selectedRecipients
                    .filter(r => r.type === 'entity' || r.type === 'customer')
                    .filter(entity => {
                      if (!showOnlyMissingContacts) return true;
                      
                      // Check if this entity has contacts
                      const entityContactsList = entityContacts[entity.id] || [];
                      const hasDirectContacts = entityContactsList.length > 0;
                      
                      // Check if any individually selected contacts belong to this entity
                      const hasSelectedContacts = selectedRecipients.some(r => 
                        r.type === 'contact' && (r.linkedEntityId === entity.id || r.linked_entity_id === entity.id)
                      );
                      
                      return !hasDirectContacts && !hasSelectedContacts;
                    })
                    .map((entity) => {
                      const entityContactsList = entityContacts[entity.id] || [];
                      
                      return (
                        <div key={`entity-${entity.id}`} className="space-y-3 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{getEntityDisplayName(entity)}</p>
                                <p className="text-sm text-gray-600">{entityType.slice(0, -1)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedRecipients = selectedRecipients.filter(r => 
                                  !((r.type === 'entity' || r.type === 'customer') && r.id === entity.id)
                                );
                                onRecipientsChange(updatedRecipients);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Entity contacts */}
                          {entityContactsList.length > 0 && (
                            <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                                Contact Persons
                              </div>
                              {entityContactsList.map((contact: Contact) => (
                                <div key={`entity-${entity.id}-contact-${contact.id}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                      <Mail className="h-3 w-3 text-white" />
                                    </div>
                                    <div>
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
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lists Tab */}
        {selectedTab === 'lists' && (
          <div className="space-y-4">
            {/* Saved Lists Section */}
            {filteredLists.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Saved Lists</h4>
                        <p className="text-sm text-gray-600">Pre-configured recipient groups</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemExpansion('saved-lists')}
                    >
                      {expandedItems.has('saved-lists') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {expandedItems.has('saved-lists') && (
                  <div className="p-4 space-y-3">
                    {filteredLists.map((list: SavedList) => (
                      <div key={list.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{list.name}</p>
                            <p className="text-sm text-gray-600">{list.itemCount} recipients</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add all list members to selected recipients
                            const listMembers = list.members.map(id => ({ type: 'entity', id }));
                            const listContacts = list.contactIds.map(id => ({ type: 'contact', id }));
                            const newRecipients = [...selectedRecipients, ...listMembers, ...listContacts];
                            onRecipientsChange(newRecipients);
                          }}
                        >
                          Add List
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Entity Selection */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {entityType === 'opportunities' ? 'Opportunities' : 
                         entityType === 'customers' ? 'Customers' : 'Partners'}
                      </h4>
                      <p className="text-sm text-gray-600">Select entities to target</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemExpansion('entity-selection')}
                  >
                    {expandedItems.has('entity-selection') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {expandedItems.has('entity-selection') && (
                <div className="p-4 space-y-3">
                  {filteredEntities.map((entity: Entity) => {
                    const isSelected = selectedRecipients.some(r => r.type === 'entity' && r.id === entity.id);
                    
                    return (
                      <div
                        key={entity.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectRecipient(entity, 'entity')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-green-600' : 'bg-gray-100'
                          }`}>
                            {entityType === 'opportunities' ? (
                              <Target className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            ) : entityType === 'customers' ? (
                              <Users className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            ) : (
                              <Handshake className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getEntityDisplayName(entity)}</p>
                            <p className="text-sm text-gray-600">
                              {(entityContacts[entity.id] || []).length} contacts
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing Contacts Tab - Drill-down component filtered for entities without contacts */}
        {selectedTab === 'missing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Entities Missing Contact Information
              </h3>
              <div className="text-sm text-gray-600">
                {summaryStats.entitiesWithoutContacts} {entityType.slice(0, -1)}{summaryStats.entitiesWithoutContacts !== 1 ? 's' : ''} need contacts
              </div>
            </div>

            {summaryStats.entitiesWithoutContacts === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p className="font-medium mb-2 text-green-600">All entities have contacts</p>
                <p className="text-sm">No missing contact information found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* All Entities List - Filtered for missing contacts */}
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
                          {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Missing Contacts
                        </h4>
                        <p className="text-sm text-gray-500">
                          {summaryStats.entitiesWithoutContactsList.length} items need contact information
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

                  {/* Expanded Entity List with Drill-down - Only entities missing contacts */}
                  {expandedItems.has('all-entities') && (
                    <div className="mt-4 space-y-2 pl-6 border-l-2 border-gray-100">
                      {summaryStats.entitiesWithoutContactsList.map((entity: Entity) => (
                        <div key={entity.id} className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
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

                              {/* Direct entity contacts for all entity types */}
                              <div className="space-y-2">
                                {/* Existing contacts */}
                                {entityContacts[entity.id] && entityContacts[entity.id].map((contact: Contact) => (
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
                                
                                {/* Add Contact Button */}
                                {showInlineContactForm !== `${entity.id}-${entityType}` ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowInlineContactForm(`${entity.id}-${entityType}`)}
                                    className="w-full mt-2 border-dashed border-orange-300 text-orange-600 hover:text-orange-800 hover:border-orange-400 bg-orange-50 hover:bg-orange-100"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Contact for {entity.name}
                                  </Button>
                                ) : (
                                  /* Inline Contact Creation Form */
                                  <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium text-gray-900">Add New Contact</h4>
                                      <Button
                                        variant="ghost"
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
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <Label htmlFor="first_name" className="text-xs font-medium text-gray-700">First Name</Label>
                                        <Input
                                          id="first_name"
                                          placeholder="John"
                                          value={inlineContactData.first_name}
                                          onChange={(e) => setInlineContactData({
                                            ...inlineContactData,
                                            first_name: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="last_name" className="text-xs font-medium text-gray-700">Last Name</Label>
                                        <Input
                                          id="last_name"
                                          placeholder="Doe"
                                          value={inlineContactData.last_name}
                                          onChange={(e) => setInlineContactData({
                                            ...inlineContactData,
                                            last_name: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                      <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email *</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@company.com"
                                        value={inlineContactData.email}
                                        onChange={(e) => setInlineContactData({
                                          ...inlineContactData,
                                          email: e.target.value
                                        })}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                      <div>
                                        <Label htmlFor="job_title" className="text-xs font-medium text-gray-700">Job Title</Label>
                                        <Input
                                          id="job_title"
                                          placeholder="Account Manager"
                                          value={inlineContactData.job_title}
                                          onChange={(e) => setInlineContactData({
                                            ...inlineContactData,
                                            job_title: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="phone" className="text-xs font-medium text-gray-700">Phone</Label>
                                        <Input
                                          id="phone"
                                          placeholder="+31 6 12345678"
                                          value={inlineContactData.phone}
                                          onChange={(e) => setInlineContactData({
                                            ...inlineContactData,
                                            phone: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
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
                                        onClick={() => {
                                          if (!inlineContactData.email.trim()) {
                                            toast({
                                              title: "Error",
                                              description: "Email is required",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          createInlineContactMutation.mutate({
                                            contactData: inlineContactData,
                                            entityId: entity.id
                                          });
                                        }}
                                        disabled={createInlineContactMutation.isPending || !inlineContactData.email.trim()}
                                      >
                                        {createInlineContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}