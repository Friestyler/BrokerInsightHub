import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Edit, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading, Share, DollarSign, Home, Car, Umbrella, Building, UserCheck, TrendingDown, Plane, Search, User, AlertCircle, Upload } from "lucide-react";
import { useLocation, useRoute, useParams } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedFlowBuilder from './ImprovedEmailBuilder';
import RecipientSelector from '@/components/campaigns/RecipientSelector';
import CampaignSettingsWizard from '@/components/campaigns/CampaignSettingsWizard';

interface CampaignFromTemplateProps {
  params?: { templateId?: string; campaignId?: string };
}

interface AssignPartnersSectionProps {
  campaignData: any;
  onAssignComplete: () => void;
}

function AssignPartnersSection({ campaignData, onAssignComplete }: AssignPartnersSectionProps) {
  const [selectedPartnersForAssignment, setSelectedPartnersForAssignment] = useState<number[]>([]);
  const [showPartnerSelection, setShowPartnerSelection] = useState(false);
  const [itemsWithoutPartners, setItemsWithoutPartners] = useState<any[]>([]);
  const [partnersAttachedToItems, setPartnersAttachedToItems] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch all partners for selection
  const { data: allPartners = [] } = useQuery({
    queryKey: ['/api/partners'],
    enabled: showPartnerSelection
  });

  // Fetch saved partner lists
  const { data: savedPartnerLists = [] } = useQuery({
    queryKey: ['/api/saved-lists'],
    enabled: showPartnerSelection
  });

  // Analyze campaign recipients to categorize them
  useEffect(() => {
    const itemsWithPartners = [];
    const itemsWithoutPartners = [];

    campaignData.recipients.forEach((recipient: any) => {
      // Check for partner information in various fields
      const hasPartner = recipient.assigned_partner_id || 
                        recipient.partnerInfo || 
                        recipient.partnerId || 
                        recipient.partnerName ||
                        recipient.opportunityInfo?.partnerId;
      
      if (hasPartner) {
        itemsWithPartners.push(recipient);
      } else {
        itemsWithoutPartners.push(recipient);
      }
    });

    // Extract unique partners from items that have them
    const uniquePartners = new Map();
    itemsWithPartners.forEach(item => {
      // Get partner ID from various possible fields
      const partnerId = item.assigned_partner_id || 
                       item.partnerInfo?.id || 
                       item.partnerId || 
                       item.opportunityInfo?.partnerId;
      
      // Get partner name from various possible fields
      const partnerName = item.partnerInfo?.name || 
                         item.assigned_partner_name || 
                         item.partnerName || 
                         item.opportunityInfo?.partnerName ||
                         `Partner ${partnerId}`;
      
      if (partnerId && !uniquePartners.has(partnerId)) {
        uniquePartners.set(partnerId, {
          id: partnerId,
          name: partnerName,
          itemCount: 0,
          items: []
        });
      }
      
      if (partnerId) {
        uniquePartners.get(partnerId).itemCount++;
        uniquePartners.get(partnerId).items.push(item);
      }
    });

    setPartnersAttachedToItems(Array.from(uniquePartners.values()));
    setItemsWithoutPartners(itemsWithoutPartners);
  }, [campaignData]);

  const handlePartnerToggle = (partnerId: number) => {
    setSelectedPartnersForAssignment(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleAssignToAll = () => {
    const allPartnerIds = partnersAttachedToItems.map(p => p.id);
    setSelectedPartnersForAssignment(allPartnerIds);
  };

  const handleAssignSelected = async () => {
    if (selectedPartnersForAssignment.length === 0) {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner to assign the campaign to.",
        variant: "destructive"
      });
      return;
    }

    // Check if campaign has been saved (has an ID)
    if (!campaignData.id) {
      toast({
        title: "Campaign not saved",
        description: "Please save the campaign first before assigning it to partners.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get environment ID for API calls
      const envId = localStorage.getItem('selectedEnvironment') || 'degoudse';
      
      // Create assignments for each selected partner
      await Promise.all(
        selectedPartnersForAssignment.map(partnerId =>
          apiRequest('POST', `/api/${envId}/campaigns/${campaignData.id}/assign`, {
            partner_id: partnerId,
            assigned_by: campaignData.created_by_id || 1,
            access_level: 'edit'
          })
        )
      );
      
      toast({
        title: "Campaign assigned",
        description: `Campaign assigned to ${selectedPartnersForAssignment.length} partner(s).`
      });
      
      onAssignComplete();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment failed",
        description: "Failed to assign campaign to partners. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Partners attached to opportunities/customers */}
      {partnersAttachedToItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Partners attached to your recipients</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAssignToAll}
              >
                Select All
              </Button>
              <Button 
                size="sm"
                onClick={handleAssignSelected}
                disabled={selectedPartnersForAssignment.length === 0}
              >
                Assign to Selected ({selectedPartnersForAssignment.length})
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {partnersAttachedToItems.map((partner: any) => (
              <div key={partner.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPartnersForAssignment.includes(partner.id)}
                      onCheckedChange={() => handlePartnerToggle(partner.id)}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{partner.name}</h4>
                      <p className="text-sm text-gray-500">{partner.itemCount} recipient(s)</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Attached
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  Connected to: {partner.items.map((item: any) => 
                    item.customerInfo?.name || item.name || 'Unknown'
                  ).slice(0, 3).join(', ')}
                  {partner.items.length > 3 && ` and ${partner.items.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items without partners */}
      {itemsWithoutPartners.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recipients without partners</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPartnerSelection(!showPartnerSelection)}
            >
              {showPartnerSelection ? 'Hide' : 'Show'} Partner Selection
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">No partners assigned</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {itemsWithoutPartners.length} recipient(s) don't have assigned partners. 
                  You can assign them to partners individually or in bulk.
                </p>
              </div>
            </div>
          </div>

          {showPartnerSelection && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Select Partners</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allPartners.map((partner: any) => (
                    <div key={partner.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={selectedPartnersForAssignment.includes(partner.id)}
                        onCheckedChange={() => handlePartnerToggle(partner.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{partner.name}</p>
                        {partner.email && (
                          <p className="text-xs text-gray-500">{partner.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {savedPartnerLists.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Saved Partner Lists</h4>
                  <div className="space-y-2">
                    {savedPartnerLists.filter((list: any) => list.entity_type === 'partners').map((list: any) => (
                      <div key={list.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // TODO: Load partners from this list and add to selection
                            toast({
                              title: "Feature coming soon",
                              description: "Loading partners from saved lists will be available soon."
                            });
                          }}
                        >
                          Use List
                        </Button>
                        <div>
                          <p className="font-medium text-sm">{list.name}</p>
                          <p className="text-xs text-gray-500">{list.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Assignment action */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleAssignSelected}
          disabled={selectedPartnersForAssignment.length === 0}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Assign Campaign ({selectedPartnersForAssignment.length})
        </Button>
      </div>
    </div>
  );
}

export default function CampaignFromTemplate({ params }: CampaignFromTemplateProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract route parameters from URL path directly using window.location
  const currentPath = window.location.pathname;
  const campaignId = currentPath.includes('/campaigns/edit/') 
    ? currentPath.split('/campaigns/edit/')[1].split('/')[0] // Handle any trailing slashes
    : currentPath.includes('/broker-view/campaigns/edit/')
    ? currentPath.split('/broker-view/campaigns/edit/')[1].split('/')[0] // Handle broker-view routes
    : params?.campaignId;
  const templateId = currentPath.includes('/campaigns/create-from-template/') 
    ? currentPath.split('/campaigns/create-from-template/')[1].split('/')[0] // Handle any trailing slashes
    : params?.templateId;
  
  // Parse URL query parameters for step and tab control
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = urlParams.get('step');
  const tabParam = urlParams.get('tab');
  
  // Map step names to step numbers
  const getStepNumber = (stepName: string | null) => {
    switch (stepName) {
      case 'recipients': return 4;
      case 'emails': return 3;
      case 'settings': return 5;
      default: return 1;
    }
  };
  

  
  const [currentStep, setCurrentStep] = useState(getStepNumber(stepParam));
  const [recipientSelectorTab, setRecipientSelectorTab] = useState<string | null>(null);
  const [showSettingsWizard, setShowSettingsWizard] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactData, setNewContactData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    customer_id: null
  });

  // Track if this is initial load to prevent URL conflicts with manual navigation
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [sharePartnersDialogOpen, setSharePartnersDialogOpen] = useState(false);
  const [selectedPartnersForSharing, setSelectedPartnersForSharing] = useState<number[]>([]);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  
  // Determine the mode: editing existing campaign, new campaign, or template-based campaign
  const isEditingCampaign = !!campaignId;
  const isNewCampaign = !templateId && !campaignId;
  const isFromTemplate = !!templateId && !campaignId;
  
  const [campaignData, setCampaignData] = useState({
    name: '',
    entity: '',
    description: '',
    objective: '',
    icon: 'target',
    attachments: [],
    emails: [{
      id: '1',
      subject: '',
      blocks: [],
      followUpDays: 0,
      leftLogo: null,
      rightLogo: null
    }],
    recipients: [],
    settings: {
      sendTime: '',
      timezone: 'UTC',
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      replyTo: ''
    }
  });

  // Create a per-customer suggestions state
  const [customerSuggestionsCollapsed, setCustomerSuggestionsCollapsed] = useState<Record<string, boolean>>({});
  
  // Contact filter state
  const [contactFilter, setContactFilter] = useState<'all' | 'with_contacts' | 'without_contacts'>('all');

  // Initialize suggestions state for each customer based on whether they have existing contacts
  useEffect(() => {
    const newState: Record<string, boolean> = {};
    
    // Group recipients by customer to determine if they have existing contacts
    const customerContactMap = new Map();
    
    campaignData.recipients.forEach((recipient: any) => {
      const customerName = recipient.customerInfo?.name || recipient.name || recipient.title;
      if (customerName) {
        const existingContacts = campaignData.recipients.filter((r: any) => 
          r.type === 'contact' && 
          (r.customerInfo?.name === customerName || r.customerInfo?.title === customerName) &&
          (r.email || r.contactInfo?.email)
        );
        
        // For customers who already have contacts, collapse suggestions by default
        // For customers who don't have contacts, expand suggestions by default
        const hasExistingContacts = existingContacts.length > 0;
        newState[customerName] = hasExistingContacts; // collapsed if they have contacts
      }
    });
    
    setCustomerSuggestionsCollapsed(newState);
  }, [campaignData.recipients]);

  // Reset selected company when filter changes
  useEffect(() => {
    setSelectedCompany(null);
  }, [contactFilter]);
  
  // Add effect to ensure URL parameters are respected only on initial load
  useEffect(() => {
    if (isInitialLoad && stepParam) {
      const targetStep = getStepNumber(stepParam);
      if (targetStep !== currentStep) {
        console.log('Adjusting step based on URL parameter (initial load):', { stepParam, targetStep, currentStep });
        setCurrentStep(targetStep);
      }
    }
    setIsInitialLoad(false);
  }, [stepParam, isInitialLoad, currentStep]);

  // Load template data to duplicate (only for template-based campaigns)
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/campaign-templates/${templateId}`],
    enabled: !!templateId && isFromTemplate
  });

  // Load existing campaign data for editing
  const { data: campaignDataFromAPI, isLoading: campaignLoading } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: isEditingCampaign
  });

  // Fetch all partners to show in share dialog
  const { data: allPartners = [] } = useQuery({
    queryKey: ['/api/partners'],
    enabled: sharePartnersDialogOpen
  });

  // Fetch all contacts for updating campaign recipients
  const { data: allContacts = [] } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: currentStep === 5 // Only fetch when in draft/review step
  });

  // Mutation for creating new contacts
  const createContactMutation = useMutation({
    mutationFn: (contactData: any) => apiRequest('POST', '/api/contacts', contactData),
    onSuccess: (newContact) => {
      // Invalidate contacts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      
      // Also invalidate any campaign-related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      // Add new contact to campaign recipients with proper customer linking
      const newContactRecipient = {
        id: newContact.id,
        type: 'contact',
        name: `${newContact.first_name} ${newContact.last_name}`,
        email: newContact.email,
        phone: newContact.phone,
        job_title: newContact.job_title,
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        customer_id: newContact.linked_entity_id,
        customerInfo: {
          id: newContact.linked_entity_id,
          name: newContact.company,
          title: newContact.company
        },
        contactInfo: {
          firstName: newContact.first_name,
          lastName: newContact.last_name,
          email: newContact.email,
          phone: newContact.phone,
          jobTitle: newContact.job_title
        }
      };

      // Also add the customer entity if it doesn't exist
      const existingCustomerEntity = campaignData.recipients.find(r => 
        r.customerInfo?.id === newContact.linked_entity_id || 
        r.id === newContact.linked_entity_id
      );
      
      const updatedRecipients = [...campaignData.recipients];
      
      if (!existingCustomerEntity) {
        // Add customer entity first
        updatedRecipients.push({
          id: newContact.linked_entity_id,
          type: 'customer',
          name: newContact.company,
          title: newContact.company,
          customerInfo: {
            id: newContact.linked_entity_id,
            name: newContact.company,
            title: newContact.company
          }
        });
      }
      
      // Add the contact
      updatedRecipients.push(newContactRecipient);
      
      setCampaignData(prev => ({
        ...prev,
        recipients: updatedRecipients
      }));
      
      // Close modal and reset form
      setShowAddContactModal(false);
      setNewContactData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        customer_id: null
      });
      
      toast({
        title: "Contact created successfully",
        description: `${newContact.first_name} ${newContact.last_name} has been added to your campaign.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating contact",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to handle adding contact manually
  const handleAddContact = () => {
    // Find the customer ID for the selected company
    const selectedCompanyData = campaignData.recipients.find((r: any) => 
      r.customerInfo?.name === selectedCompany || 
      r.customerInfo?.title === selectedCompany || 
      r.name === selectedCompany || 
      r.title === selectedCompany
    );
    
    let customerId = null;
    if (selectedCompanyData?.customerInfo?.id) {
      customerId = selectedCompanyData.customerInfo.id;
    } else if (selectedCompanyData?.customer_id) {
      customerId = selectedCompanyData.customer_id;
    }
    
    setNewContactData(prev => ({
      ...prev,
      customer_id: customerId
    }));
    
    setShowAddContactModal(true);
  };

  // Function to handle saving new contact
  const handleSaveContact = () => {
    if (!newContactData.first_name || !newContactData.last_name || !newContactData.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in first name, last name, and email address.",
        variant: "destructive",
      });
      return;
    }

    // Include company name in the contact data
    const contactDataWithCompany = {
      ...newContactData,
      company: selectedCompany,
      linked_entity_type: 'customer',
      linked_entity_id: newContactData.customer_id
    };

    createContactMutation.mutate(contactDataWithCompany);
  };

  // Function to handle adding suggested contacts instantly
  const handleAddSuggestedContact = (suggestedContact: any) => {
    // Find the customer ID for the selected company
    const selectedCompanyData = campaignData.recipients.find((r: any) => 
      r.customerInfo?.name === selectedCompany || 
      r.customerInfo?.title === selectedCompany || 
      r.name === selectedCompany || 
      r.title === selectedCompany
    );
    
    let customerId = null;
    if (selectedCompanyData?.customerInfo?.id) {
      customerId = selectedCompanyData.customerInfo.id;
    } else if (selectedCompanyData?.customer_id) {
      customerId = selectedCompanyData.customer_id;
    }
    
    const [firstName, lastName] = suggestedContact.name.split(' ');
    
    const contactData = {
      first_name: firstName,
      last_name: lastName || '',
      email: suggestedContact.email,
      job_title: suggestedContact.title,
      company: selectedCompany,
      customer_id: customerId,
      linked_entity_type: 'customer',
      linked_entity_id: customerId
    };

    createContactMutation.mutate(contactData);
  };

  // Handler for sending a single email
  const handleSendSingleEmail = async (contact: any, email: any) => {
    try {
      const response = await apiRequest('POST', '/api/campaigns/send-email', {
        campaignId: campaignId,
        contactId: contact.id,
        emailId: email.id,
        emailSubject: email.subject,
        emailContent: email.blocks
      });
      
      toast({
        title: "Email sent!",
        description: `Email "${email.subject}" sent to ${contact.first_name} ${contact.last_name}`,
      });
      
      // Refresh campaign data
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Handler for bulk sending all ready emails for a specific company
  const handleBulkSend = async (companyName: string) => {
    try {
      const companyRecipients = campaignData.recipients.filter((recipient: any) => 
        recipient.customerInfo?.name === companyName || 
        recipient.customerInfo?.title === companyName || 
        recipient.name === companyName || 
        recipient.title === companyName
      );
      
      const readyContacts = companyRecipients.filter((recipient: any) => 
        recipient.email || recipient.contactInfo?.email
      );
      
      const response = await apiRequest('POST', '/api/campaigns/send-bulk', {
        campaignId: campaignId,
        recipients: readyContacts.map(contact => ({
          contactId: contact.id,
          email: contact.email || contact.contactInfo?.email
        }))
      });
      
      toast({
        title: "Bulk send completed!",
        description: `${readyContacts.length} email${readyContacts.length !== 1 ? 's' : ''} sent successfully`,
      });
      
      // Refresh campaign data
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      toast({
        title: "Failed to send emails",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Handler for bulk sending ALL ready emails across all customers
  const handleBulkSendAll = async () => {
    try {
      const allReadyContacts = campaignData.recipients.filter((recipient: any) => 
        recipient.email || recipient.contactInfo?.email
      );
      
      const response = await apiRequest('POST', '/api/campaigns/send-bulk', {
        campaignId: campaignId,
        recipients: allReadyContacts.map(contact => ({
          contactId: contact.id,
          email: contact.email || contact.contactInfo?.email
        }))
      });
      
      toast({
        title: "Campaign sent successfully!",
        description: `${allReadyContacts.length} email${allReadyContacts.length !== 1 ? 's' : ''} sent across all customers`,
      });
      
      // Refresh campaign data
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
    } catch (error) {
      console.error('Error sending all emails:', error);
      toast({
        title: "Failed to send campaign",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Set default data for new campaigns
  useEffect(() => {
    if (isNewCampaign) {
      setCampaignData(prev => ({
        ...prev,
        name: '',
        entity: 'partners',
        description: '',
        objective: '',
        icon: 'target',
        attachments: [],
        emails: [{
          id: '1',
          subject: '',
          blocks: [],
          followUpDays: 0,
          leftLogo: null,
          rightLogo: null
        }]
      }));
    }
  }, [isNewCampaign]);

  // Load existing campaign data for editing
  useEffect(() => {
    if (campaignDataFromAPI && isEditingCampaign) {
      console.log('Loading existing campaign data for editing:', campaignDataFromAPI);
      
      // Parse email_body from database which contains the blocks
      let emails = [];
      if (campaignDataFromAPI.email_body) {
        try {
          // Try to parse as JSON first
          const blocks = JSON.parse(campaignDataFromAPI.email_body);
          emails = [{
            id: '1',
            subject: campaignDataFromAPI.subject || '',
            blocks: blocks,
            followUpDays: 0,
            leftLogo: null,
            rightLogo: null
          }];
        } catch (e) {
          console.warn('Failed to parse email_body as JSON, treating as plain text:', e);
          // Convert plain text to text block format
          const textBlock = {
            id: '1',
            type: 'text',
            content: campaignDataFromAPI.email_body
          };
          emails = [{
            id: '1',
            subject: campaignDataFromAPI.subject || '',
            blocks: [textBlock],
            followUpDays: 0,
            leftLogo: null,
            rightLogo: null
          }];
        }
      } else {
        emails = [{
          id: '1',
          subject: campaignDataFromAPI.subject || '',
          blocks: [],
          followUpDays: 0,
          leftLogo: null,
          rightLogo: null
        }];
      }

      // Convert saved recipients to proper format for RecipientSelector
      const convertedRecipients = (campaignDataFromAPI.recipients || []).map((recipient: any) => {
        // If recipient already has type field, return as is
        if (recipient.type) {
          return recipient;
        }
        
        // Determine type based on recipient structure
        if (recipient.email && (recipient.first_name || recipient.last_name)) {
          // This is a contact
          return {
            ...recipient,
            type: 'contact',
            recipientKey: `contact-${recipient.id}`
          };
        } else if (recipient.name || recipient.title) {
          // This is an entity (opportunity, customer, partner)
          return {
            ...recipient,
            type: 'entity',
            recipientKey: `entity-${recipient.id}`
          };
        } else {
          // Default to entity type
          return {
            ...recipient,
            type: 'entity',
            recipientKey: `entity-${recipient.id}`
          };
        }
      });

      console.log('Loading existing campaign recipients:', {
        originalRecipients: campaignDataFromAPI.recipients,
        convertedRecipients,
        targetEntityType: campaignDataFromAPI.target_entity_type
      });

      console.log('Setting campaign entity from API:', {
        target_entity_type: campaignDataFromAPI.target_entity_type,
        entity_mapped_to: campaignDataFromAPI.target_entity_type || ''
      });

      setCampaignData({
        name: campaignDataFromAPI.name || '',
        entity: campaignDataFromAPI.target_entity_type || '',
        description: campaignDataFromAPI.description || '',
        objective: campaignDataFromAPI.objective || '',
        icon: campaignDataFromAPI.icon || 'target',
        attachments: campaignDataFromAPI.attachments || [],
        emails: emails,
        recipients: convertedRecipients,
        settings: campaignDataFromAPI.settings || {
          sendTime: '',
          timezone: 'UTC',
          trackOpens: true,
          trackClicks: true,
          unsubscribeLink: true,
          replyTo: ''
        }
      });
    }
  }, [campaignDataFromAPI, isEditingCampaign]);

  // Load template data into campaign when available
  useEffect(() => {
    if (templateData && isFromTemplate) {
      console.log('Loading template data for campaign creation:', templateData);
      
      // Parse email content from template data
      let emails = [];
      
      // Handle main email from email_body
      if (templateData.email_body) {
        try {
          const blocks = JSON.parse(templateData.email_body);
          emails.push({
            id: '1',
            subject: templateData.subject || '',
            blocks: blocks,
            followUpDays: 0,
            leftLogo: null,
            rightLogo: null
          });
        } catch (e) {
          console.warn('Failed to parse email_body:', e);
          emails.push({
            id: '1',
            subject: templateData.subject || '',
            blocks: [],
            followUpDays: 0,
            leftLogo: null,
            rightLogo: null
          });
        }
      }
      
      // Handle follow-up emails from follow_up_emails
      if (templateData.follow_up_emails && Array.isArray(templateData.follow_up_emails)) {
        templateData.follow_up_emails.forEach((followUpEmail: any, index: number) => {
          let blocks = [];
          try {
            if (followUpEmail.body) {
              blocks = JSON.parse(followUpEmail.body);
            }
          } catch (e) {
            console.warn('Failed to parse follow-up email body:', e);
            blocks = [];
          }
          
          emails.push({
            id: `${index + 2}`,
            subject: followUpEmail.subject || '',
            blocks: blocks,
            followUpDays: followUpEmail.send_after_days || 0,
            leftLogo: null,
            rightLogo: null
          });
        });
      }
      
      // If no emails were parsed, create a default one
      if (emails.length === 0) {
        emails = [{
          id: '1',
          subject: '',
          blocks: [],
          followUpDays: 0,
          leftLogo: null,
          rightLogo: null
        }];
      }

      console.log('Campaign data initialized from template:', {
        templateName: templateData.name,
        emailCount: emails.length,
        firstEmailBlocks: emails[0]?.blocks?.length || 0,
        firstEmailSubject: emails[0]?.subject || '',
        emailStructure: emails.map(e => ({
          id: e.id,
          subject: e.subject,
          blockCount: e.blocks?.length || 0,
          blocks: e.blocks
        }))
      });

      setCampaignData(prev => ({
        ...prev,
        name: `Campaign from ${templateData.name}`,
        entity: templateData.entity || '',
        description: templateData.description || '',
        objective: templateData.objective || '',
        icon: templateData.icon || '',
        attachments: templateData.attachments || [],
        emails: emails
      }));
      
      console.log('Campaign data initialized from template:', { 
        entity: templateData.entity,
        templateName: templateData.name,
        emailCount: emails.length,
        firstEmailBlocks: emails[0]?.blocks?.length,
        firstEmailSubject: emails[0]?.subject,
        emailStructure: emails.map(e => ({ id: e.id, subject: e.subject, blockCount: e.blocks?.length, blocks: e.blocks }))
      });
    }
  }, [templateData]);

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/degoudse/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set the campaign ID after successful save
      setCampaignData(prev => ({
        ...prev,
        id: data.id
      }));
      
      toast({
        title: "Campaign created successfully!",
        description: "Your campaign has been created and is ready to launch."
      });
      
      // Only redirect if not in step 6 (draft step)
      if (currentStep !== 6) {
        setLocation('/campaigns');
      }
    },
    onError: (error: any) => {
      console.error('Campaign creation error:', error);
      toast({
        title: "Failed to create campaign",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/degoudse/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign updated successfully!",
        description: "Your campaign changes have been saved."
      });
      setLocation('/campaigns');
    },
    onError: (error: any) => {
      console.error('Campaign update error:', error);
      toast({
        title: "Failed to update campaign",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleBack = () => {
    // Check if campaign was opened from partner details page or broker view
    const urlParams = new URLSearchParams(window.location.search);
    const fromPartner = urlParams.get('from_partner');
    const fromBrokerView = urlParams.get('from_broker_view');
    const backUrl = urlParams.get('back_url');
    
    if (fromBrokerView && backUrl) {
      // Use the specific back URL provided (e.g., broker view campaigns table)
      window.location.href = decodeURIComponent(backUrl);
    } else if (fromBrokerView) {
      // Fallback to general broker view campaigns
      setLocation('/broker-view/campaigns');
    } else if (fromPartner) {
      // Redirect back to partner details page with campaigns tab active
      setLocation(`/lists/partners/${fromPartner}?tab=campaigns`);
    } else if (isEditingCampaign || isNewCampaign) {
      setLocation('/campaigns');
    } else if (isFromTemplate) {
      setLocation('/campaigns/templates');
    }
  };

  const handleSave = () => {
    const campaignPayload = {
      name: campaignData.name,
      type: 'email',
      description: campaignData.description,
      template_id: isFromTemplate ? parseInt(templateId!) : null,
      target_entity_type: campaignData.entity,
      target_entity_id: null,
      status: 'draft',
      created_by: 1,
      emails: campaignData.emails.map(email => ({
        subject: email.subject,
        content: JSON.stringify(email.blocks),
        followUpDays: email.followUpDays
      })),
      recipients: campaignData.recipients,
      settings: campaignData.settings || {},
      icon: 'mail',
      objective: campaignData.objective,
      is_ai_generated: false,
      attachments: campaignData.attachments || []
    };
    
    console.log('Campaign payload to be saved:', campaignPayload);
    
    if (isEditingCampaign) {
      // For editing, use the update mutation
      console.log('Updating existing campaign with ID:', campaignId);
      updateCampaignMutation.mutate(campaignPayload);
    } else {
      // For new campaigns and template-based campaigns
      createCampaignMutation.mutate(campaignPayload);
    }
  };

  // Handler for sharing campaign with selected partners
  const handleShareWithPartners = async () => {
    if (!campaignId && !isEditingCampaign) {
      toast({
        title: "Save Required",
        description: "Please save the campaign first before sharing with partners.",
        variant: "destructive"
      });
      return;
    }

    try {
      const sharePromises = selectedPartnersForSharing.map(partnerId => 
        apiRequest('POST', '/api/campaign-shares', {
          campaign_id: parseInt(campaignId!),
          shared_with_type: 'partner',
          shared_with_id: partnerId,
          access_level: 'view',
          shared_by_id: 1,
          is_active: true
        })
      );

      await Promise.all(sharePromises);
      
      toast({
        title: "Campaign Shared",
        description: `Campaign shared with ${selectedPartnersForSharing.length} partner(s).`
      });
      
      setSharePartnersDialogOpen(false);
      setSelectedPartnersForSharing([]);
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share campaign with partners. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get partners related to selected recipients
  const getRelatedPartners = () => {
    if (!campaignData.recipients || !allPartners) return [];
    
    const relatedPartnerNames = new Set<string>();
    const relatedPartnerIds = new Set<number>();
    
    // Extract partner information from recipients
    campaignData.recipients.forEach((recipient: any) => {
      // Check for partner IDs (numeric)
      if (recipient.assigned_partner_id) {
        relatedPartnerIds.add(recipient.assigned_partner_id);
      }
      if (recipient.partner_id) {
        relatedPartnerIds.add(recipient.partner_id);
      }
      if (recipient.partnerId) {
        relatedPartnerIds.add(recipient.partnerId);
      }
      if (recipient.opportunityInfo?.partnerId) {
        relatedPartnerIds.add(recipient.opportunityInfo.partnerId);
      }
      
      // Check for partner names (string)
      if (recipient.partnerNames) {
        // partnerNames can be a comma-separated string
        const names = recipient.partnerNames.split(',').map((name: string) => name.trim());
        names.forEach((name: string) => relatedPartnerNames.add(name));
      }
      if (recipient.partnerName) {
        relatedPartnerNames.add(recipient.partnerName);
      }
      if (recipient.opportunityInfo?.partnerName) {
        relatedPartnerNames.add(recipient.opportunityInfo.partnerName);
      }
    });
    
    // Filter partners by both ID and name
    const filteredPartners = allPartners.filter((partner: any) => {
      return relatedPartnerIds.has(partner.id) || relatedPartnerNames.has(partner.name);
    });
    
    return filteredPartners;
  };

  const togglePartnerSelection = (partnerId: number) => {
    setSelectedPartnersForSharing(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const getStepDescription = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        if (campaignData.name && campaignData.description && campaignData.objective) {
          return `Campaign: ${campaignData.name.substring(0, 30)}${campaignData.name.length > 30 ? '...' : ''}`;
        }
        return 'Configure campaign name and details';
      case 2:
        if (campaignData.entity) {
          const entityNames: Record<string, string> = {
            'partners': 'Partners',
            'customers': 'Customers', 
            'opportunities': 'Opportunities',
            'internal': 'Internal Team'
          };
          return `Selected: ${entityNames[campaignData.entity] || campaignData.entity}`;
        }
        return 'Choose target group (from template)';
      case 3:
        if (campaignData.emails[0].subject) {
          return `Subject: ${campaignData.emails[0].subject.substring(0, 30)}${campaignData.emails[0].subject.length > 30 ? '...' : ''}`;
        }
        return 'Review and edit email content';
      case 4:
        return 'Select campaign recipients';
      case 5:
        return 'Configure campaign settings';
      case 6:
        return 'Save and manage drafts';
      case 7:
        return 'Assign your campaign';
      default:
        return '';
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Campaign Details',
      description: getStepDescription(1),
      component: 'details'
    },
    {
      number: 2,
      title: 'Choose Target Group',
      description: getStepDescription(2),
      component: 'entity'
    },
    {
      number: 3,
      title: 'Flow Builder',
      description: getStepDescription(3),
      component: 'builder'
    },
    {
      number: 4,
      title: 'Select Recipients',
      description: getStepDescription(4),
      component: 'recipients'
    },
    {
      number: 5,
      title: 'Settings',
      description: getStepDescription(5),
      component: 'settings'
    },
    {
      number: 6,
      title: 'Drafts & Send',
      description: getStepDescription(6),
      component: 'drafts'
    },
    {
      number: 7,
      title: 'Assign',
      description: getStepDescription(7),
      component: 'share'
    }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const isStepCompleted = (stepNum: number): boolean => {
    const step1Complete = Boolean(campaignData.name && campaignData.icon);
    const step2Complete = Boolean(campaignData.entity);
    const step3Complete = Boolean(campaignData.emails[0]?.subject?.trim());
    const step4Complete = isEditingCampaign ? true : campaignData.recipients.length > 0;
    const step5Complete = Boolean(campaignData.settings && Object.keys(campaignData.settings).length > 0);
    // Step 6 is complete when we have recipients with email addresses OR when campaign is saved
    const step6Complete = Boolean(campaignData.id || 
      (campaignData.recipients.length > 0 && 
       campaignData.recipients.some((r: any) => r.email || r.contactInfo?.email)));
    
    if (stepNum === 1) return step1Complete;
    if (stepNum === 2) return step2Complete;
    if (stepNum === 3) return step3Complete;
    if (stepNum === 4) return step4Complete;
    if (stepNum === 5) return step5Complete;
    if (stepNum === 6) return step6Complete;
    if (stepNum === 7) return false; // Share or Send step - never auto-completed
    return false; // Don't auto-complete steps based on current step
  };

  const isStepAccessible = (stepNum: number): boolean => {
    // In edit mode or when using a template, make all steps accessible up to the current + 1
    if (isEditingCampaign || isFromTemplate) {
      // For editing campaigns and templates, allow navigation to all steps that are completed or within reasonable bounds
      if (stepNum === 1) return true;
      if (stepNum === 2) return isStepCompleted(1);
      if (stepNum === 3) return isStepCompleted(2);
      if (stepNum === 4) return isStepCompleted(3);
      if (stepNum === 5) return isStepCompleted(4);
      if (stepNum === 6) return isStepCompleted(5);
      if (stepNum === 7) return isStepCompleted(6);
      return false;
    }
    
    // For new campaigns, follow strict progression
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStepCompleted(1);
    if (stepNum === 3) return isStepCompleted(2); // Flow Builder after target group
    if (stepNum === 4) return isStepCompleted(3); // Recipients after Flow Builder
    if (stepNum === 5) return isStepCompleted(4); // Settings after Recipients
    if (stepNum === 6) return isStepCompleted(5); // Drafts after Settings
    if (stepNum === 7) return isStepCompleted(6); // Share or Send after Drafts
    return false;
  };

  const canSave = (): boolean => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4) && isStepCompleted(5);
  };

  const updateUrlStep = (step: number) => {
    const stepNames = ['', 'details', 'entity', 'emails', 'recipients', 'settings', 'share'];
    const stepName = stepNames[step] || '';
    
    const url = new URL(window.location.href);
    if (stepName && step > 1) {
      url.searchParams.set('step', stepName);
    } else {
      url.searchParams.delete('step');
    }
    
    // Update URL without reloading the page
    window.history.replaceState({}, '', url.toString());
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepAccessible(currentStep + 1)) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateUrlStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateUrlStep(prevStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Campaign Details</h2>
              <p className="text-gray-600">Configure your campaign name and details</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <Input
                  placeholder="Enter a unique name for your campaign..."
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isNewCampaign 
                    ? "This will help you identify this campaign in your campaign list"
                    : `This will help you identify this campaign from the template "${templateData?.name}"`
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  placeholder="Describe what this campaign is for and when to use it..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
                <Textarea
                  placeholder="What is the main goal of this campaign? What outcome do you want to achieve?"
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose an Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { id: 'shield', icon: <Shield className="h-5 w-5" />, color: 'bg-[#007AFF]' },
                    { id: 'home', icon: <Home className="h-5 w-5" />, color: 'bg-[#34C759]' },
                    { id: 'car', icon: <Car className="h-5 w-5" />, color: 'bg-[#FF3B30]' },
                    { id: 'umbrella', icon: <Umbrella className="h-5 w-5" />, color: 'bg-[#AF52DE]' },
                    { id: 'building', icon: <Building className="h-5 w-5" />, color: 'bg-[#8E8E93]' },
                    { id: 'dollar-sign', icon: <DollarSign className="h-5 w-5" />, color: 'bg-[#30D158]' },
                    { id: 'plane', icon: <Plane className="h-5 w-5" />, color: 'bg-[#64D2FF]' },
                    { id: 'user-check', icon: <UserCheck className="h-5 w-5" />, color: 'bg-[#5856D6]' },
                    { id: 'target', icon: <Target className="h-5 w-5" />, color: 'bg-[#FF9500]' },
                    { id: 'award', icon: <Award className="h-5 w-5" />, color: 'bg-[#FFCC02]' },
                    { id: 'heart', icon: <Heart className="h-5 w-5" />, color: 'bg-[#FF2D92]' },
                    { id: 'mail', icon: <Mail className="h-5 w-5" />, color: 'bg-[#32D74B]' }
                  ].map((iconOption) => (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => setCampaignData({ ...campaignData, icon: iconOption.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        campaignData.icon === iconOption.id
                          ? 'border-[#007AFF] bg-[#007AFF]/5'
                          : 'border-[#E6E7F1] hover:border-gray-300 hover:bg-[#E6E7F1]'
                      }`}
                    >
                      <div className={`${iconOption.color} text-white p-1.5 rounded-md shadow-sm`}>
                        {iconOption.icon}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Choose Target Group</h2>
              <p className="text-gray-600">Select the type of audience for this campaign</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'opportunities',
                    title: 'Opportunities',
                    subtitle: 'Sales Campaign',
                    description: 'Target specific sales opportunities with personalized outreach to close deals faster',
                    icon: <Target className="h-6 w-6" />,
                    color: 'from-green-500 to-emerald-600',
                    hoverColor: 'green',
                    category: 'campaign'
                  },
                  {
                    id: 'customers',
                    title: 'Customers',
                    subtitle: 'Customer Campaign',
                    description: 'Engage existing customers with upsell, cross-sell, or retention campaigns',
                    icon: <Users className="h-6 w-6" />,
                    color: 'from-blue-500 to-indigo-600',
                    hoverColor: 'blue',
                    category: 'campaign'
                  },
                  {
                    id: 'partners',
                    title: 'Partners',
                    subtitle: 'Partner Updates',
                    description: 'Send business updates, announcements, and collaboration invites to partners',
                    icon: <Send className="h-6 w-6" />,
                    color: 'from-purple-500 to-violet-600',
                    hoverColor: 'purple',
                    category: 'update'
                  },
                  {
                    id: 'internal',
                    title: 'Internal Team',
                    subtitle: 'Internal Updates',
                    description: 'Share company news, policy updates, and internal communications',
                    icon: <Mail className="h-6 w-6" />,
                    color: 'from-orange-500 to-red-600',
                    hoverColor: 'orange',
                    category: 'update'
                  }
                ].map((option) => (
                  <div
                    key={option.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer border-2 border-[#E6E7F1] flex flex-col relative group rounded-lg p-6 ${
                      campaignData.entity === option.id
                        ? `border-${option.hoverColor}-200 bg-${option.hoverColor}-50 shadow-sm`
                        : ''
                    }`}
                    onClick={() => setCampaignData({ ...campaignData, entity: option.id })}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} text-white shadow-sm`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          {option.subtitle}
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    {campaignData.entity === option.id && (
                      <div className="absolute top-4 right-4">
                        <div className={`p-1 rounded-full bg-${option.hoverColor}-500 text-white`}>
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>


            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Flow Builder</h2>
              <p className="text-gray-600">Design your email sequence</p>
            </div>

            {isFromTemplate && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
                <p className="text-sm text-green-700">
                  <strong>Email content has been duplicated from the template.</strong> You can review and modify it below.
                </p>
              </div>
            )}
            
            {!isFromTemplate && !isEditingCampaign && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Build your email sequence.</strong> Start by creating your first email with subject line and content.
                </p>
              </div>
            )}
            
            <ImprovedFlowBuilder
              emails={campaignData.emails}
              activeEmailIndex={activeEmailIndex}
              entityType={campaignData.entity}
              onEmailsChange={(emails) => setCampaignData({ ...campaignData, emails })}
              onActiveEmailChange={setActiveEmailIndex}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {/* Summary Overview Blocks */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {(() => {
                  const totalRecipients = campaignData.recipients.length;
                  const contactsWithEmail = campaignData.recipients.filter((r: any) => r.email && r.email !== '' && !r.isMissingContact).length;
                  const missingContacts = campaignData.recipients.filter((r: any) => r.isMissingContact === true || !r.email || r.email === '' || r.email.includes('missing-')).length;
                  
                  // Determine contact status
                  const contactStatus = totalRecipients === 0 ? 'empty' : 
                    missingContacts > 0 ? 'missing' : 'complete';
                  
                  const uniqueOpportunities = new Set();
                  const uniqueCustomers = new Set();
                  
                  campaignData.recipients.forEach((recipient: any) => {
                    if (recipient.type === 'opportunity') {
                      uniqueOpportunities.add(recipient.id);
                      if (recipient.customerInfo?.id) {
                        uniqueCustomers.add(recipient.customerInfo.id);
                      }
                    } else if (recipient.type === 'customer') {
                      uniqueCustomers.add(recipient.id);
                    }
                  });
                  
                  return (
                    <>
                      {/* Left Block - Selected Opportunities/Customers Summary */}
                      <div className={`rounded-lg p-4 border-2 transition-all ${
                        totalRecipients === 0 
                          ? 'bg-gray-50 border-gray-200 text-gray-500' 
                          : 'bg-white border-green-200 text-gray-900'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            totalRecipients === 0 
                              ? 'bg-gray-200' 
                              : 'bg-green-100'
                          }`}>
                            <Target className={`h-4 w-4 ${
                              totalRecipients === 0 
                                ? 'text-gray-400' 
                                : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`font-medium text-sm ${
                              totalRecipients === 0 
                                ? 'text-gray-500' 
                                : 'text-gray-900'
                            }`}>Selected Targets</h3>
                            <p className={`text-xs ${
                              totalRecipients === 0 
                                ? 'text-gray-400' 
                                : 'text-gray-600'
                            }`}>
                              {totalRecipients === 0 ? 'No selections made' : 'Overview of your selections'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs">Opportunities</span>
                            <span className="font-medium text-sm">{uniqueOpportunities.size}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs">Customers</span>
                            <span className="font-medium text-sm">{uniqueCustomers.size}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-t pt-2">
                            <span className="text-xs font-medium">Total Recipients</span>
                            <span className="font-bold text-base">{totalRecipients}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block - Contacts Status */}
                      <div 
                        className={`rounded-lg p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                          contactStatus === 'empty' 
                            ? 'bg-gray-50 border-gray-200 text-gray-500' 
                            : contactStatus === 'missing'
                            ? 'bg-orange-50 border-orange-200 text-orange-900'
                            : 'bg-green-50 border-green-200 text-green-900'
                        }`}
                        onClick={() => {
                          if (totalRecipients > 0) {
                            setRecipientSelectorTab('selected');
                            // Reset after a short delay to avoid state conflicts
                            setTimeout(() => setRecipientSelectorTab(null), 100);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            contactStatus === 'empty' 
                              ? 'bg-gray-200' 
                              : contactStatus === 'missing'
                              ? 'bg-orange-100'
                              : 'bg-green-100'
                          }`}>
                            <Mail className={`h-4 w-4 ${
                              contactStatus === 'empty' 
                                ? 'text-gray-400' 
                                : contactStatus === 'missing'
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Contact Status</h3>
                            <p className="text-xs">
                              {contactStatus === 'empty' 
                                ? 'Select recipients first'
                                : contactStatus === 'missing'
                                ? 'Some contacts missing'
                                : 'All contacts ready'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs">With Email</span>
                            <span className={`font-medium text-sm ${
                              contactStatus === 'complete' ? 'text-green-600' : ''
                            }`}>{contactsWithEmail}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs">Missing Contacts</span>
                            <span className={`font-medium text-sm ${
                              missingContacts > 0 ? 'text-red-600' : ''
                            }`}>{missingContacts}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-t pt-2">
                            <span className="text-xs font-medium">Total Recipients</span>
                            <span className="font-bold text-base">{totalRecipients}</span>
                          </div>
                          {contactStatus === 'missing' && (
                            <div 
                              className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-center cursor-pointer hover:bg-orange-200 transition-colors"
                              onClick={() => setCurrentStep(6)}
                            >
                              <p className="text-xs text-orange-700">
                                Go to Drafts & Send to add or upload contacts
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="max-w-6xl mx-auto">
              <RecipientSelector
                entityType={campaignData.entity}
                selectedRecipients={campaignData.recipients}
                onRecipientsChange={(recipients) => 
                  setCampaignData({ ...campaignData, recipients })
                }
                initialTab={tabParam}
                externalTabOverride={recipientSelectorTab}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Campaign Settings</h2>
              <p className="text-gray-600">Configure when and how to send</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="text-sm text-gray-600 mb-2">
                  Configure advanced campaign settings including scheduling, permissions, sender information, and automation rules.
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Schedule Type</div>
                      <div className="text-xs text-gray-600">
                        {campaignData.settings.scheduleType === 'scheduled' ? 'Scheduled delivery' : 'Send immediately'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campaignData.settings.scheduleType === 'scheduled' ? 'Scheduled' : 'Immediate'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Partner Permissions</div>
                      <div className="text-xs text-gray-600">
                        Control what partners can customize
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Object.values(campaignData.settings).filter(Boolean).length} permissions
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Sender Configuration</div>
                      <div className="text-xs text-gray-600">
                        {campaignData.settings.senderName || 'Default sender settings'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campaignData.settings.emailSendingType === 'qollabi_default' ? 'Qollabi Default' : 'Custom'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Automation Rules</div>
                      <div className="text-xs text-gray-600">
                        {campaignData.settings.automationType === 'send_automatically' ? 'Automatic sending' : 'Manual review'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campaignData.settings.excludePreviouslySent ? 'Duplicate protection' : 'Standard'}
                    </Badge>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowSettingsWizard(true)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="h-full bg-white">
            <div className="flex h-[calc(100vh-200px)]">
              {/* Left Sidebar - Customer Companies */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs h-7 px-3 border-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          // TODO: Implement contact upload functionality
                          toast({
                            title: "Upload Contacts",
                            description: "Contact upload functionality will be implemented soon."
                          });
                        }}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload Contacts
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs h-7 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Customer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant={contactFilter === 'all' ? 'default' : 'outline'}
                      className={`text-xs h-7 px-2 rounded-md ${
                        contactFilter === 'all' 
                          ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setContactFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      size="sm" 
                      variant={contactFilter === 'with_contacts' ? 'default' : 'outline'}
                      className={`text-xs h-7 px-2 rounded-md ${
                        contactFilter === 'with_contacts' 
                          ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setContactFilter('with_contacts')}
                    >
                      With Contacts
                    </Button>
                    <Button 
                      size="sm" 
                      variant={contactFilter === 'without_contacts' ? 'default' : 'outline'}
                      className={`text-xs h-7 px-2 rounded-md ${
                        contactFilter === 'without_contacts' 
                          ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setContactFilter('without_contacts')}
                    >
                      Without Contacts
                    </Button>
                  </div>
                </div>
                
                {/* Company List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {/* Actual Companies from Selected Recipients */}
                    {(() => {
                      // Extract unique companies from selected recipients
                      const companiesMap = new Map();
                      
                      campaignData.recipients.forEach((recipient: any) => {
                        let companyName = '';
                        let companyType = '';
                        let opportunityTitle = '';
                        
                        // Extract company information based on recipient structure
                        // Priority: customer info first, then fallback to recipient direct properties
                        if (recipient.customerInfo?.name) {
                          companyName = recipient.customerInfo.name;
                          companyType = recipient.customerInfo.type || 'Business';
                        } else if (recipient.customerInfo?.title) {
                          companyName = recipient.customerInfo.title;
                          companyType = 'Business';
                        } else if (recipient.type === 'customer' && recipient.name) {
                          // If this is a customer recipient, use customer name
                          companyName = recipient.name;
                          companyType = 'Business';
                        } else if (recipient.type === 'customer' && recipient.title) {
                          companyName = recipient.title;
                          companyType = 'Business';
                        } else if (recipient.type === 'opportunity' && recipient.title) {
                          // For opportunities without customer info, use opportunity title but mark as opportunity
                          companyName = recipient.title;
                          companyType = 'Opportunity';
                          opportunityTitle = recipient.title;
                        } else if (recipient.name) {
                          companyName = recipient.name;
                          companyType = 'Business';
                        } else if (recipient.title) {
                          companyName = recipient.title;
                          companyType = 'Business';
                        }
                        
                        if (companyName) {
                          if (!companiesMap.has(companyName)) {
                            companiesMap.set(companyName, {
                              name: companyName,
                              type: companyType,
                              recipients: [],
                              contactsCount: 0,
                              opportunityTitle: opportunityTitle
                            });
                          }
                          
                          const company = companiesMap.get(companyName);
                          company.recipients.push(recipient);
                          
                          // Count contacts (recipients with email addresses)
                          if (recipient.email || recipient.contactInfo?.email) {
                            company.contactsCount++;
                          }
                        }
                      });
                      
                      let companies = Array.from(companiesMap.values());
                      
                      // Apply contact filter
                      if (contactFilter === 'with_contacts') {
                        companies = companies.filter(company => company.contactsCount > 0);
                      } else if (contactFilter === 'without_contacts') {
                        companies = companies.filter(company => company.contactsCount === 0);
                      }
                      // 'all' filter shows all companies, no filtering needed
                      
                      // Auto-select first company if none selected
                      if (!selectedCompany && companies.length > 0) {
                        setTimeout(() => setSelectedCompany(companies[0].name), 0);
                      }
                      
                      if (companies.length === 0) {
                        return (
                          <div className="p-4 text-center text-gray-500">
                            <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No recipients selected yet</p>
                            <p className="text-xs text-gray-400">Go back to step 4 to select recipients</p>
                          </div>
                        );
                      }
                      
                      return companies.map((company, index) => {
                        const missingContacts = company.recipients.length - company.contactsCount;
                        
                        return (
                          <div
                            key={company.name}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 ${
                              selectedCompany === company.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => setSelectedCompany(company.name)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-sm text-gray-900">{company.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{company.type}</div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                {company.contactsCount} contact{company.contactsCount !== 1 ? 's' : ''}
                              </span>
                              <div className="flex items-center gap-1">
                                {company.contactsCount > 0 ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-600" />
                                    <span className="text-green-600">Ready</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 text-orange-600" />
                                    <span className="text-orange-600">Missing contact</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Content - Selected Company Details */}
              <div className="flex-1 bg-white flex flex-col">
                {selectedCompany ? (
                  <>
                    {/* Company Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedCompany}</h3>
                            {(() => {
                              const selectedCompanyData = campaignData.recipients.find((r: any) => 
                                r.customerInfo?.name === selectedCompany || 
                                r.customerInfo?.title === selectedCompany || 
                                r.name === selectedCompany || 
                                r.title === selectedCompany
                              );
                              const companyType = selectedCompanyData?.customerInfo?.type || 'Business';
                              const contactsCount = campaignData.recipients.filter((r: any) => 
                                (r.customerInfo?.name === selectedCompany || 
                                 r.customerInfo?.title === selectedCompany || 
                                 r.name === selectedCompany || 
                                 r.title === selectedCompany) && 
                                (r.email || r.contactInfo?.email)
                              ).length;
                              
                              return (
                                <>
                                  <p className="text-sm text-gray-500">{companyType}</p>
                                  <p className="text-xs text-gray-500">{contactsCount} contact{contactsCount !== 1 ? 's' : ''}</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="text-xs h-7 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                          onClick={handleAddContact}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </Button>
                      </div>
                    </div>

                    {/* Contacts and Email Sequences */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-4">

                        
                        {/* Actual Recipients for Selected Company */}
                        {(() => {
                          const companyRecipients = campaignData.recipients.filter((recipient: any) => 
                            recipient.customerInfo?.name === selectedCompany || 
                            recipient.customerInfo?.title === selectedCompany || 
                            recipient.name === selectedCompany || 
                            recipient.title === selectedCompany ||
                            (recipient.type === 'contact' && recipient.customerInfo?.name === selectedCompany)
                          );
                          
                          // Debug logging
                          console.log('Selected company:', selectedCompany);
                          console.log('All recipients:', campaignData.recipients);
                          console.log('Filtered company recipients:', companyRecipients);
                          
                          if (companyRecipients.length === 0) {
                            return (
                              <div className="text-center text-gray-500 py-8">
                                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No contacts found for this company</p>
                                <p className="text-xs text-gray-400">Add contacts to start the email sequence</p>
                              </div>
                            );
                          }
                          
                          // Group recipients by customer ID to ensure one contact per customer
                          const customerContactMap = new Map();
                          
                          companyRecipients.forEach((recipient: any) => {
                            const customerId = recipient.customerInfo?.id || recipient.id;
                            const customerName = recipient.customerInfo?.name || recipient.name || selectedCompany;
                            
                            if (!customerContactMap.has(customerId)) {
                              // Find the best contact for this customer
                              const contactRecipients = companyRecipients.filter(r => 
                                (r.customerInfo?.id || r.id) === customerId && r.type === 'contact'
                              );
                              
                              let bestContact = null;
                              
                              if (contactRecipients.length > 0) {
                                // Use the first contact with an email, or just the first contact
                                bestContact = contactRecipients.find(c => c.email) || contactRecipients[0];
                              } else {
                                // No contacts found, create a placeholder
                                bestContact = {
                                  id: `missing-${customerId}`,
                                  type: 'missing_contact',
                                  customerInfo: recipient.customerInfo,
                                  email: '',
                                  first_name: '',
                                  last_name: ''
                                };
                              }
                              
                              customerContactMap.set(customerId, {
                                customerId,
                                customerName,
                                contact: bestContact
                              });
                            }
                          });
                          
                          const customerContacts = Array.from(customerContactMap.values());
                          
                          return customerContacts.map((customerContact: any, index: number) => {
                            const { contact, customerName } = customerContact;
                            const isMissingContact = contact.type === 'missing_contact';
                            
                            const contactName = contact.first_name && contact.last_name 
                              ? `${contact.first_name} ${contact.last_name}`
                              : contact.email || 'Unknown Contact';
                            
                            const contactEmail = contact.email || '';
                            const hasEmail = Boolean(contactEmail);
                            
                            if (isMissingContact) {
                              return (
                                <div key={index} className="border-b border-gray-100 pb-4">
                                  <div className="text-center py-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                      <User className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">No contacts yet</h3>
                                    <p className="text-xs text-gray-500 mb-4">Add the first contact for {customerName} to start email sequences.</p>
                                    <Button 
                                      size="sm" 
                                      className="text-xs h-7 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md mb-4"
                                      onClick={handleAddContact}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Contact Manually
                                    </Button>
                                    
                                    {/* Additional Suggested Contacts */}
                                    <div className="border-t pt-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <Search className="h-4 w-4 text-blue-500" />
                                          <span className="text-sm font-medium text-gray-900">Additional Suggested Contacts</span>
                                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            2 found
                                          </Badge>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
                                          onClick={() => setSuggestionsCollapsed(!suggestionsCollapsed)}
                                        >
                                          {suggestionsCollapsed ? 'Show' : 'Hide'}
                                        </Button>
                                      </div>
                                      
                                      {!suggestionsCollapsed && (
                                        <>
                                          <p className="text-xs text-gray-500 mb-4">We found these additional potential contacts for {customerName}. Click to add them instantly.</p>
                                          
                                          {/* Mock suggested contacts - these should come from API */}
                                          {[
                                            {
                                              name: 'Sarah Kim',
                                              email: 'sarah.kim@fintechsolutions.com',
                                              title: 'Chief Technology Officer',
                                              match: '97% match',
                                              source: 'From LinkedIn'
                                            },
                                            {
                                              name: 'Alex Thompson',
                                              email: 'athompson@fintechsolutions.com',
                                              title: 'Product Manager',
                                              match: '85% match',
                                              source: 'From Company Website'
                                            }
                                          ].map((suggested, suggestedIndex) => (
                                        <div key={suggestedIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-sm text-gray-900">{suggested.name}</span>
                                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                {suggested.match}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500">{suggested.email}</div>
                                            <div className="text-xs text-gray-500">{suggested.title}</div>
                                            <div className="text-xs text-gray-400">{suggested.source}</div>
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-xs h-6 px-2 ml-2"
                                            onClick={() => handleAddSuggestedContact(suggested)}
                                            disabled={createContactMutation.isPending}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </Button>
                                        </div>
                                          ))}
                                          
                                          <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                            <div className="flex items-start gap-2">
                                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                                <span className="text-xs text-white font-bold">!</span>
                                              </div>
                                              <div className="text-xs text-blue-800">
                                                <span className="font-medium">Pro tip:</span> Added contacts will automatically get a default email sequence. You can customize it for each contact after adding them.
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div key={index} className="border-b border-gray-100 pb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      hasEmail ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                      <User className={`h-4 w-4 ${hasEmail ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-gray-900">{contactName}</span>
                                        <Badge variant="secondary" className={`text-xs px-2 py-0.5 rounded ${
                                          hasEmail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                          {hasEmail ? 'ready' : 'missing email'}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-500">{contactEmail || 'No email'}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">{campaignData.emails.length} email{campaignData.emails.length !== 1 ? 's' : ''}</div>
                                </div>

                                {/* Email Sequence from Flow Builder */}
                                <div className="space-y-3 mb-3">
                                  {campaignData.emails.map((email: any, emailIndex: number) => {
                                    const emailContent = email.blocks.find((block: any) => block.type === 'text')?.content || email.subject;
                                    const truncatedContent = emailContent.length > 80 ? emailContent.substring(0, 80) + '...' : emailContent;
                                    
                                    return (
                                      <div key={emailIndex} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{emailIndex + 1}</span>
                                            <span className="text-sm font-medium text-gray-900">{email.subject || 'Untitled Email'}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                              {emailIndex === 0 ? 'ready' : 'scheduled'}
                                            </Badge>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            {hasEmail && emailIndex === 0 && (
                                              <Button 
                                                size="sm" 
                                                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleSendSingleEmail(contact, email)}
                                              >
                                                <Send className="h-3 w-3 mr-1" />
                                                Send
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                          {emailIndex === 0 ? 'Immediate' : `+${email.followUpDays || (emailIndex * 3)} days`}
                                        </div>
                                        <div className="text-xs text-gray-600">{truncatedContent}</div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-gray-300 hover:bg-gray-50 rounded-md">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Email to Sequence
                                </Button>
                                
                                {/* Additional Suggested Contacts - Always show for ALL contacts */}
                                <div className="mt-4 border-t pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Search className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-medium text-gray-900">Additional Suggested Contacts</span>
                                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        2 found
                                      </Badge>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
                                      onClick={() => {
                                        const currentState = customerSuggestionsCollapsed[customerName] ?? false;
                                        setCustomerSuggestionsCollapsed(prev => ({
                                          ...prev,
                                          [customerName]: !currentState
                                        }));
                                      }}
                                    >
                                      {(customerSuggestionsCollapsed[customerName] ?? false) ? 'Show' : 'Hide'}
                                    </Button>
                                  </div>
                                  
                                  {!(customerSuggestionsCollapsed[customerName] ?? false) && (
                                    <>
                                      <p className="text-xs text-gray-500 mb-4">We found these additional potential contacts for {customerName}. Click to add them instantly.</p>
                                      
                                      {/* Mock suggested contacts - these should come from API */}
                                      {[
                                        {
                                          name: 'Sarah Kim',
                                          email: 'sarah.kim@fintechsolutions.com',
                                          title: 'Chief Technology Officer',
                                          match: '97% match',
                                          source: 'From LinkedIn'
                                        },
                                        {
                                          name: 'Alex Thompson',
                                          email: 'athompson@fintechsolutions.com',
                                          title: 'Product Manager',
                                          match: '85% match',
                                          source: 'From Company Website'
                                        }
                                      ].map((suggested, suggestedIndex) => (
                                        <div key={suggestedIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-sm text-gray-900">{suggested.name}</span>
                                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                {suggested.match}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500">{suggested.email}</div>
                                            <div className="text-xs text-gray-500">{suggested.title}</div>
                                            <div className="text-xs text-gray-400">{suggested.source}</div>
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-xs h-6 px-2 ml-2"
                                            onClick={() => handleAddSuggestedContact(suggested)}
                                            disabled={createContactMutation.isPending}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </Button>
                                        </div>
                                      ))}
                                      
                                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                        <div className="flex items-start gap-2">
                                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                            <span className="text-xs text-white font-bold">!</span>
                                          </div>
                                          <div className="text-xs text-blue-800">
                                            <span className="font-medium">Pro tip:</span> Added contacts will automatically get a default email sequence. You can customize it for each contact after adding them.
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a company to view contacts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Assign Campaign</h2>
              <p className="text-gray-600">Assign this campaign to partners for collaboration</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {!campaignData.id && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Campaign must be saved first</p>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    Please save your campaign before assigning it to partners. Click "Create Campaign" to continue.
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Dialog open={sharePartnersDialogOpen} onOpenChange={setSharePartnersDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gap-2"
                      disabled={!campaignData.id}
                    >
                      <Users className="h-4 w-4" />
                      Assign to Partner(s)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Assign Campaign to Partners</DialogTitle>
                    </DialogHeader>
                    <AssignPartnersSection 
                      campaignData={campaignData}
                      onAssignComplete={() => setSharePartnersDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (templateLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {templateLoading ? "Loading template..." : "Loading campaign..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 h-8">
                <ArrowLeft className="h-4 w-4" />
                {isEditingCampaign || isNewCampaign ? "Back to Campaigns" : "Back to Templates"}
              </Button>
              <div>
                <h1 className="text-base font-medium text-gray-900">
                  {isEditingCampaign ? "Edit Campaign" : isNewCampaign ? "Create New Campaign" : "Create Campaign from Template"}
                </h1>
                {isFromTemplate && (
                  <p className="text-xs text-gray-600">
                    Based on: {templateData?.name}
                  </p>
                )}
                {isEditingCampaign && (
                  <p className="text-xs text-gray-600">
                    Campaign: {campaignDataFromAPI?.name}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">Step {currentStep} of {totalSteps}</p>
              <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-2">
          <div className="flex justify-between items-start relative">
            {/* Connecting Line Background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ marginLeft: '4rem', marginRight: '4rem' }} />
            
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
                {/* Step Circle */}
                <div 
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all cursor-pointer relative ${
                    isStepCompleted(step.number) 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : currentStep === step.number 
                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-50' 
                        : isStepAccessible(step.number)
                          ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => {
                    if (isStepAccessible(step.number)) {
                      setCurrentStep(step.number);
                      updateUrlStep(step.number);
                    }
                  }}
                >
                  {isStepCompleted(step.number) ? <Check className="h-3 w-3" /> : step.number}
                </div>
                
                {/* Step Text */}
                <div className="mt-1 text-center">
                  <p className={`text-xs font-medium ${
                    currentStep === step.number ? 'text-blue-600' : 'text-gray-900'
                  }`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0">{step.description}</p>
                </div>
              </div>
            ))}
            
            {/* Progress Line */}
            <div 
              className="absolute top-4 left-0 h-0.5 bg-blue-600 z-5 transition-all duration-300"
              style={{ 
                marginLeft: '4rem',
                width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 8rem + ${((currentStep - 1) / (steps.length - 1)) * 8}rem)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 py-2">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {/* Send All Button - Show on Drafts step */}
          {currentStep === 6 && (() => {
            // Count all ready contacts across ALL customers in the campaign
            const allReadyContacts = campaignData.recipients.filter((recipient: any) => 
              recipient.email || recipient.contactInfo?.email
            ).length;
            
            const canSaveNow = isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4) && isStepCompleted(5);
            
            return (
              <div className="flex gap-3 items-center">
                {/* Save Campaign Button */}
                {!campaignData.id && canSaveNow && (
                  <Button
                    onClick={handleSave}
                    disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                    className="gap-2"
                  >
                    {createCampaignMutation.isPending ? 'Saving...' : 'Save Campaign'}
                  </Button>
                )}
                
                {/* Send All Button */}
                {allReadyContacts > 0 && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm"
                    onClick={() => handleBulkSendAll()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send All ({allReadyContacts})
                  </Button>
                )}
              </div>
            );
          })()}
          
          <div className="flex gap-3 items-center">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepAccessible(currentStep + 1)}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!canSave() || createCampaignMutation.isPending || updateCampaignMutation.isPending}
                className="gap-2"
              >
                {isEditingCampaign 
                  ? (updateCampaignMutation.isPending ? 'Updating...' : 'Update Campaign')
                  : (createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign')
                }
              </Button>
            )}
          </div>
        </div>

        {renderStepContent()}
      </div>
      
      {/* Campaign Settings Wizard */}
      <CampaignSettingsWizard
        isOpen={showSettingsWizard}
        onClose={() => setShowSettingsWizard(false)}
        onSave={(settings) => {
          setCampaignData(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              ...settings
            }
          }));
          setShowSettingsWizard(false);
          toast({
            title: "Settings saved",
            description: "Your campaign settings have been updated."
          });
        }}
      />

      {/* Add Contact Modal */}
      <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  id="first_name"
                  value={newContactData.first_name}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  id="last_name"
                  value={newContactData.last_name}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Smith"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={newContactData.email}
                onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john.smith@company.com"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={newContactData.phone}
                onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+32 123 456 789"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Input
                id="job_title"
                value={newContactData.job_title}
                onChange={(e) => setNewContactData(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="CEO"
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-500">
              Company: {selectedCompany}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddContactModal(false)}
              disabled={createContactMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveContact}
              disabled={createContactMutation.isPending || !newContactData.first_name || !newContactData.last_name || !newContactData.email}
              className="gap-2"
            >
              {createContactMutation.isPending ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}