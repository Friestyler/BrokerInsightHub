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
  Target,
  BookOpen,
  Building2,
  Mail,
  Phone,
  Briefcase,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  title?: string;
  customerId?: number;
  customer_id?: number;
  description?: string;
}

interface SavedList {
  id: number;
  name: string;
  description: string;
  entityType: string;
  members: number[];
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
  const [showMissingContactsOnly, setShowMissingContactsOnly] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  
  // Map URL tab parameters to tab values and set initial tab
  const getInitialTab = (tabParam: string | null) => {
    switch (tabParam) {
      case 'selected': return 'selected';
      case 'lists': return 'lists';
      case 'segments': return 'segments';
      default: return 'lists';
    }
  };
  
  const initialTabValue = getInitialTab(initialTab ?? null);
  const [selectedTab, setSelectedTab] = useState<'lists' | 'selected' | 'segments'>(initialTabValue);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
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

  // Contact creation mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      return apiRequest('POST', '/api/contacts', contactData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/degoudse/contacts`] });
      setShowInlineContactForm(null);
      setInlineContactData({
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        phone: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create contact',
        variant: 'destructive',
      });
    },
  });

  // Fetch main entities based on type
  const { data: entitiesResponse = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/degoudse/${entityType}`],
    enabled: !!entityType
  });
  
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

  const toggleCustomerExpansion = (customerId: string) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  // Helper function to get contacts for a specific customer
  const getContactsForCustomer = (customerId: number) => {
    return allContacts.filter(contact => 
      contact.linked_entity_id === customerId && contact.linked_entity_type === 'customer'
    );
  };

  // Helper function to get customer for an opportunity
  const getCustomerForOpportunity = (opportunityId: number) => {
    const opportunity = entities.find(e => e.id === opportunityId);
    if (!opportunity) return null;
    
    const customerId = opportunity.customerId || opportunity.customer_id || opportunity.clientId || opportunity.client_id;
    return customers.find(c => c.id === customerId);
  };

  const handleSelectRecipient = (item: any, type: string) => {
    const recipientKey = `${type}-${item.id}`;
    const isSelected = selectedRecipients.some(r => r.recipientKey === recipientKey);
    
    if (isSelected) {
      // Remove from selection
      const newRecipients = selectedRecipients.filter(r => r.recipientKey !== recipientKey);
      onRecipientsChange(newRecipients);
    } else {
      // Add to selection
      const newRecipient = {
        ...item,
        type,
        recipientKey
      };
      onRecipientsChange([...selectedRecipients, newRecipient]);
    }
  };

  // Helper function to check if item is selected
  const isItemSelected = (item: any, type: string) => {
    const recipientKey = `${type}-${item.id}`;
    return selectedRecipients.some(r => r.recipientKey === recipientKey);
  };

  // Handle bulk selection of entire lists/segments
  const handleSelectListOrSegment = (listOrSegment: any, sourceType: 'list' | 'segment') => {
    if (entityType !== 'opportunities') return;

    const opportunityIds = listOrSegment.members || [];
    const relevantOpportunities = entities.filter(opp => opportunityIds.includes(opp.id));
    
    const allSelected = relevantOpportunities.every(opp => isItemSelected(opp, 'opportunity'));
    
    if (allSelected) {
      // Remove all opportunities from this list/segment
      const keysToRemove = relevantOpportunities.map(opp => `opportunity-${opp.id}`);
      const newRecipients = selectedRecipients.filter(r => !keysToRemove.includes(r.recipientKey));
      onRecipientsChange(newRecipients);
    } else {
      // Add all opportunities from this list/segment
      const newRecipients = [...selectedRecipients];
      relevantOpportunities.forEach(opp => {
        const recipientKey = `opportunity-${opp.id}`;
        if (!newRecipients.some(r => r.recipientKey === recipientKey)) {
          newRecipients.push({
            ...opp,
            type: 'opportunity',
            recipientKey
          });
        }
      });
      onRecipientsChange(newRecipients);
    }
  };

  // Check if all items in list/segment are selected
  const isListOrSegmentFullySelected = (listOrSegment: any, sourceType: 'list' | 'segment') => {
    if (entityType !== 'opportunities') return false;
    
    const opportunityIds = listOrSegment.members || [];
    const relevantOpportunities = entities.filter(opp => opportunityIds.includes(opp.id));
    
    return relevantOpportunities.length > 0 && relevantOpportunities.every(opp => isItemSelected(opp, 'opportunity'));
  };

  // Check if some items in list/segment are selected (for indeterminate state)
  const isListOrSegmentPartiallySelected = (listOrSegment: any, sourceType: 'list' | 'segment') => {
    if (entityType !== 'opportunities') return false;
    
    const opportunityIds = listOrSegment.members || [];
    const relevantOpportunities = entities.filter(opp => opportunityIds.includes(opp.id));
    
    if (relevantOpportunities.length === 0) return false;
    
    const selectedCount = relevantOpportunities.filter(opp => isItemSelected(opp, 'opportunity')).length;
    return selectedCount > 0 && selectedCount < relevantOpportunities.length;
  };



  const handleCreateInlineContact = (entityId: number, entityType: string) => {
    const contactData = {
      ...inlineContactData,
      linked_entity_id: entityId,
      linked_entity_type: entityType === 'opportunities' ? 'customer' : entityType.slice(0, -1)
    };
    createContactMutation.mutate(contactData);
  };

  // Cascading drill-down renderer
  const renderCascadingDrillDown = (listOrSegment: any, sourceType: 'list' | 'segment') => {
    if (entityType !== 'opportunities') {
      return <div className="text-sm text-gray-500">Drill-down available for opportunities only</div>;
    }

    const opportunityIds = listOrSegment.members || [];
    const relevantOpportunities = entities.filter(opp => opportunityIds.includes(opp.id));

    if (relevantOpportunities.length === 0) {
      return <div className="text-sm text-gray-500">No opportunities found in this {sourceType}</div>;
    }

    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Target className="h-4 w-4" />
            <span className="font-medium">Opportunities</span>
            <span className="text-sm">({relevantOpportunities.length} selected)</span>
          </div>
        </div>

        <div className="space-y-2">
          {relevantOpportunities.map((opportunity) => {
            const customer = getCustomerForOpportunity(opportunity.id);
            const customerContacts = customer ? getContactsForCustomer(customer.id) : [];
            const isOpportunityExpanded = expandedItems.has(`opp-${opportunity.id}`);
            const isCustomerExpanded = expandedCustomers.has(`cust-${customer?.id}`);

            return (
              <div key={opportunity.id} className="border rounded-lg bg-white">
                {/* Opportunity Level */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isItemSelected(opportunity, 'opportunity')}
                        onCheckedChange={() => handleSelectRecipient(opportunity, 'opportunity')}
                        className="h-4 w-4"
                      />
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{opportunity.title || opportunity.name}</div>
                        <div className="text-sm text-gray-500">Opportunity</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemExpansion(`opp-${opportunity.id}`)}
                    >
                      {isOpportunityExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Customer Level */}
                {isOpportunityExpanded && customer && (
                  <div className="p-3 bg-blue-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isItemSelected(customer, 'customer')}
                          onCheckedChange={() => handleSelectRecipient(customer, 'customer')}
                          className="h-4 w-4"
                        />
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            Customer Organization
                            {customerContacts.length === 0 && (
                              <span className="ml-2 text-yellow-600 font-medium">• No contacts</span>
                            )}
                            {customerContacts.length > 0 && (
                              <span className="ml-2 text-blue-600 font-medium">• {customerContacts.length} contact{customerContacts.length > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCustomerExpansion(`cust-${customer.id}`)}
                      >
                        {isCustomerExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Contacts Level */}
                {isOpportunityExpanded && customer && isCustomerExpanded && (
                  <div className="p-3">
                    <div className="text-sm text-gray-500 mb-3 uppercase tracking-wide">
                      CONTACT PERSONS
                    </div>
                    <div className="space-y-2">
                      {customerContacts.length > 0 ? (
                        customerContacts.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isItemSelected(contact, 'contact')}
                                onCheckedChange={() => handleSelectRecipient(contact, 'contact')}
                                className="h-4 w-4"
                              />
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {getContactDisplayName(contact).split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{getContactDisplayName(contact)}</div>
                                <div className="text-sm text-gray-500">{contact.email}</div>
                                <div className="text-sm text-gray-500">{getContactJobTitle(contact)}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm text-yellow-800 font-medium">No contacts found</div>
                          <div className="text-xs text-yellow-600">Add a contact to start sending campaigns</div>
                        </div>
                      )}
                      
                      {/* Add Contact Button */}
                      <div className="pt-2">
                        {renderAddContactForm(`customer-${customer.id}`, customer.id, 'customer')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAddContactForm = (formKey: string, entityId: number, entityType: string) => (
    <div className="w-full">
      {showInlineContactForm === formKey ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={inlineContactData.first_name}
                  onChange={(e) => setInlineContactData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={inlineContactData.last_name}
                  onChange={(e) => setInlineContactData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={inlineContactData.email}
                onChange={(e) => setInlineContactData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="job_title" className="text-sm font-medium">
                Job Title
              </Label>
              <Input
                id="job_title"
                value={inlineContactData.job_title}
                onChange={(e) => setInlineContactData(prev => ({ ...prev, job_title: e.target.value }))}
                className="mt-1"
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

  // Function to render recipients organized by email address
  const renderRecipientsByEmail = () => {
    const recipientsByEmail = new Map<string, any[]>();
    
    // Process each recipient individually to maintain proper relationships
    selectedRecipients.forEach(recipient => {
      let email = '';
      let contactInfo = null;
      let customerInfo = null;
      
      if (recipient.type === 'contact') {
        email = recipient.email;
        contactInfo = recipient;
      } else if (recipient.type === 'opportunity') {
        // Each opportunity should have its own customer and contact
        const customer = getCustomerForOpportunity(recipient.id);
        if (customer) {
          customerInfo = customer;
          const customerContacts = getContactsForCustomer(customer.id);
          if (customerContacts.length > 0) {
            // Use primary contact or first contact for this specific opportunity
            const primaryContact = customerContacts.find(c => c.is_primary) || customerContacts[0];
            email = primaryContact.email;
            contactInfo = primaryContact;
          } else {
            // No contacts - create unique missing contact entry for this opportunity
            email = `missing-opportunity-${recipient.id}@example.com`;
            contactInfo = null;
          }
        } else {
          // No customer found for this opportunity
          email = `missing-customer-${recipient.id}@example.com`;
          contactInfo = null;
        }
      } else if (recipient.type === 'customer') {
        // Each customer should have its own contact
        customerInfo = recipient;
        const customerContacts = getContactsForCustomer(recipient.id);
        if (customerContacts.length > 0) {
          const primaryContact = customerContacts.find(c => c.is_primary) || customerContacts[0];
          email = primaryContact.email;
          contactInfo = primaryContact;
        } else {
          // No contacts - create unique missing contact entry for this customer
          email = `missing-customer-${recipient.id}@example.com`;
          contactInfo = null;
        }
      }
      
      // Use unique key to prevent grouping different recipients under same email
      const uniqueKey = contactInfo ? email : `${email}-${recipient.id}`;
      
      if (!recipientsByEmail.has(uniqueKey)) {
        recipientsByEmail.set(uniqueKey, []);
      }
      
      recipientsByEmail.get(uniqueKey)!.push({
        ...recipient,
        contactInfo,
        customerInfo,
        email,
        isMissingContact: !contactInfo,
        uniqueKey
      });
    });
    
    // Convert to array and filter
    let emailGroups = Array.from(recipientsByEmail.entries());
    
    // Filter by missing contacts if selected
    if (showMissingContactsOnly) {
      emailGroups = emailGroups.filter(([email, recipients]) => 
        recipients.some(r => r.isMissingContact)
      );
    }
    
    // Filter by search query
    if (recipientSearchQuery) {
      emailGroups = emailGroups.filter(([email, recipients]) =>
        email.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
        recipients.some(r => 
          (r.name || r.title || '').toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
          (r.contactInfo?.full_name || '').toLowerCase().includes(recipientSearchQuery.toLowerCase())
        )
      );
    }
    
    if (emailGroups.length === 0) {
      return (
        <div className="text-center py-8">
          <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {showMissingContactsOnly ? 'No recipients with missing contacts' : 'No recipients found'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {emailGroups.map(([uniqueKey, recipients]) => {
          const recipient = recipients[0]; // Each group should only have one recipient now
          const displayEmail = recipient.isMissingContact ? 'No email address' : recipient.email;
          
          return (
            <div key={uniqueKey} className="border rounded-lg bg-white">
              <div className="p-4">
                {/* Email Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      recipient.isMissingContact ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {recipient.isMissingContact ? (
                        <UserPlus className="h-4 w-4 text-red-600" />
                      ) : (
                        <Mail className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {recipient.isMissingContact ? 'Missing Contact' : recipient.contactInfo?.full_name || recipient.contactInfo?.fullName || 'Unknown Contact'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                  
                  {recipient.isMissingContact && (
                    <Button
                      size="sm"
                      onClick={() => setShowInlineContactForm(uniqueKey)}
                      className="h-8"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  )}
                </div>
                
                {/* Connected Context - Show the relationship chain */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        recipient.type === 'opportunity' ? 'bg-green-100' : 
                        recipient.type === 'customer' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {recipient.type === 'opportunity' ? (
                          <Target className="h-3 w-3 text-green-600" />
                        ) : recipient.type === 'customer' ? (
                          <Users className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Mail className="h-3 w-3 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {recipient.name || recipient.title || recipient.fullName || getContactDisplayName(recipient)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {recipient.type === 'opportunity' ? 'Opportunity' : 
                           recipient.type === 'customer' ? 'Customer' : 'Contact'}
                          {recipient.type === 'opportunity' && recipient.customerInfo && (
                            <span className="ml-2">
                              → {recipient.customerInfo.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectRecipient(recipient, recipient.type)}
                      className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Inline Contact Form */}
                {showInlineContactForm === uniqueKey && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Add Contact</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="First name"
                        value={inlineContactData.first_name}
                        onChange={(e) => setInlineContactData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="h-8"
                      />
                      <Input
                        placeholder="Last name"
                        value={inlineContactData.last_name}
                        onChange={(e) => setInlineContactData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="h-8"
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={inlineContactData.email}
                        onChange={(e) => setInlineContactData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-8"
                      />
                      <Input
                        placeholder="Job title"
                        value={inlineContactData.job_title}
                        onChange={(e) => setInlineContactData(prev => ({ ...prev, job_title: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInlineContactForm(null)}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Get customer ID based on recipient type
                          let customerId = null;
                          if (recipient.type === 'customer') {
                            customerId = recipient.id;
                          } else if (recipient.type === 'opportunity' && recipient.customerInfo) {
                            customerId = recipient.customerInfo.id;
                          }
                          
                          if (customerId) {
                            createContactMutation.mutate({
                              ...inlineContactData,
                              full_name: `${inlineContactData.first_name} ${inlineContactData.last_name}`.trim(),
                              linked_entity_type: 'customer',
                              linked_entity_id: customerId,
                              is_primary: true
                            });
                          }
                        }}
                        disabled={createContactMutation.isPending || !inlineContactData.email}
                        className="h-8"
                      >
                        {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'lists':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Saved Lists</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Select recipients from your saved lists with cascading drill-down navigation.
              </p>
            </div>
            
            {listsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading saved lists...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedLists.map((list: any) => (
                  <div key={list.id} className="border rounded-lg">
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isListOrSegmentFullySelected(list, 'list')}
                            indeterminate={isListOrSegmentPartiallySelected(list, 'list')}
                            onCheckedChange={() => handleSelectListOrSegment(list, 'list')}
                            className="h-4 w-4"
                          />
                          <button
                            onClick={() => toggleItemExpansion(`list-${list.id}`)}
                            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            {expandedItems.has(`list-${list.id}`) ? (
                              <ChevronDown className="h-4 w-4 text-white" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-white" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium">{list.name === 'Shared opportunities list' ? 'All Opportunities' : list.name}</p>
                            <p className="text-sm text-gray-600">{list.description}</p>
                            <p className="text-xs text-gray-500">
                              {list.item_count || list.itemCount || 0} items
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedItems.has(`list-${list.id}`) && (
                      <div className="border-t bg-gray-50 p-3">
                        {renderCascadingDrillDown(list, 'list')}
                      </div>
                    )}
                  </div>
                ))}
                {savedLists.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No saved lists available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'segments':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-800">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Saved Segments</span>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Select recipients from your saved segments with cascading drill-down navigation.
              </p>
            </div>
            
            {viewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading saved segments...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedViews.map((view: any) => (
                  <div key={view.id} className="border rounded-lg">
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isListOrSegmentFullySelected(view, 'segment')}
                            indeterminate={isListOrSegmentPartiallySelected(view, 'segment')}
                            onCheckedChange={() => handleSelectListOrSegment(view, 'segment')}
                            className="h-4 w-4"
                          />
                          <button
                            onClick={() => toggleItemExpansion(`segment-${view.id}`)}
                            className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                          >
                            {expandedItems.has(`segment-${view.id}`) ? (
                              <ChevronDown className="h-4 w-4 text-white" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-white" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium">{view.name}</p>
                            <p className="text-sm text-gray-600">{view.description}</p>
                            <p className="text-xs text-gray-500">
                              {view.item_count || view.itemCount || 0} items
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedItems.has(`segment-${view.id}`) && (
                      <div className="border-t bg-gray-50 p-3">
                        {renderCascadingDrillDown(view, 'segment')}
                      </div>
                    )}
                  </div>
                ))}
                {savedViews.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No saved segments available</p>
                  </div>
                )}
              </div>
            )}
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
                Review recipients organized by email address with their connected context.
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showMissingContacts"
                  checked={showMissingContactsOnly}
                  onCheckedChange={(checked) => setShowMissingContactsOnly(checked as boolean)}
                />
                <Label htmlFor="showMissingContacts" className="text-sm font-medium">
                  Show only missing contacts
                </Label>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Search recipients..."
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            
            {renderRecipientsByEmail()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setSelectedTab('lists')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'lists'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lists
          </button>
          <button
            onClick={() => setSelectedTab('segments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'segments'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Segments
          </button>
          <button
            onClick={() => setSelectedTab('selected')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'selected'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Selected ({selectedRecipients.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}