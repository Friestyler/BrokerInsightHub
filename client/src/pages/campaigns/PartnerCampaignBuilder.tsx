import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Settings, Mail, Send, Building, User, Check, AlertCircle, Plus, Search, Upload, Edit } from "lucide-react";
import { useLocation, useParams } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedEmailBuilder from './ImprovedEmailBuilder';
import SenderSettingsPanel from '@/components/campaigns/SenderSettingsPanel';
import ContactUploadModal from '@/components/campaigns/ContactUploadModal';

interface PartnerCampaignBuilderProps {
  params?: { campaignId?: string };
  campaignId?: string;
  partnerId?: number | string;
  onComplete?: () => void;
  onBack?: () => void;
}

export default function PartnerCampaignBuilder({ params, campaignId: propCampaignId, partnerId, onComplete, onBack }: PartnerCampaignBuilderProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract campaign ID from props or URL
  const currentPath = window.location.pathname;
  const campaignId = propCampaignId || 
    (currentPath.includes('/broker-view/campaigns/edit/') 
      ? currentPath.split('/broker-view/campaigns/edit/')[1].split('/')[0]
      : params?.campaignId);
  
  // Parse URL query parameters for step control
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = urlParams.get('step');
  const backUrl = urlParams.get('back_url');
  const envId = urlParams.get('env') || 'degoudse';
  
  // Map step names to step numbers for 3-step workflow
  const getStepNumber = (stepName: string | null) => {
    switch (stepName) {
      case 'settings': return 2;
      case 'drafts': return 3;
      default: return 1; // flow builder
    }
  };
  
  const [currentStep, setCurrentStep] = useState(getStepNumber(stepParam));
  const [campaignData, setCampaignData] = useState<any>(null);
  const [emailBlocks, setEmailBlocks] = useState<any[]>([]);
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [emailSendingType, setEmailSendingType] = useState('qollabi_default');
  
  // State for drafts & send functionality
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState('all');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactData, setNewContactData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: ''
  });
  
  // State for suggest contacts functionality
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  const [customerSuggestionsCollapsed, setCustomerSuggestionsCollapsed] = useState<{[key: string]: boolean}>({});
  const [showContactUploadModal, setShowContactUploadModal] = useState(false);
  
  // State for edit individual email functionality
  const [editingEmail, setEditingEmail] = useState<{
    contact: any;
    emailIndex: number;
    emailData: any;
  } | null>(null);
  const [editEmailSubject, setEditEmailSubject] = useState('');
  const [editEmailBlocks, setEditEmailBlocks] = useState<any[]>([]);
  
  // Function to populate dynamic fields with contact data
  const populateDynamicFields = (content: string, contact: any) => {
    if (!content || !contact) return content;
    

    
    let populatedContent = content;
    
    // Get the actual contact name from the contact data structure
    const contactName = contact.full_name || 
                      (contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : '') ||
                      contact.first_name || 
                      contact.name || 
                      'Contact';
    const companyName = contact.customerInfo?.name || contact.company || 'Your Company';
    
    // Replace common dynamic fields
    populatedContent = populatedContent.replace(/\{\{name\}\}/g, contactName);
    populatedContent = populatedContent.replace(/\{\{naam\}\}/g, contactName);
    populatedContent = populatedContent.replace(/\{\{contact_name\}\}/g, contactName);
    populatedContent = populatedContent.replace(/\{\{first_name\}\}/g, contact.first_name || contactName);
    populatedContent = populatedContent.replace(/\{\{last_name\}\}/g, contact.last_name || '');
    populatedContent = populatedContent.replace(/\{\{full_name\}\}/g, 
      contact.first_name && contact.last_name 
        ? `${contact.first_name} ${contact.last_name}` 
        : contactName
    );
    populatedContent = populatedContent.replace(/\{\{email\}\}/g, contact.email || '');
    populatedContent = populatedContent.replace(/\{\{company\}\}/g, companyName);
    populatedContent = populatedContent.replace(/\{\{company_name\}\}/g, companyName);
    populatedContent = populatedContent.replace(/\{\{job_title\}\}/g, contact.job_title || '');
    populatedContent = populatedContent.replace(/\{\{phone\}\}/g, contact.phone || '');
    
    // Replace with customer/opportunity data if available
    if (contact.customerInfo) {
      populatedContent = populatedContent.replace(/\{\{customer_name\}\}/g, contact.customerInfo.name || '');
    }
    if (contact.opportunityInfo || contact.title) {
      populatedContent = populatedContent.replace(/\{\{opportunity_title\}\}/g, contact.title || contact.opportunityInfo?.title || '');
      populatedContent = populatedContent.replace(/\{\{opportunity_value\}\}/g, contact.estimated_value || contact.opportunityInfo?.estimated_value || '');
    }
    

    
    return populatedContent;
  };
  
  // Function to handle edit email
  const handleEditEmail = (contact: any, emailIndex: number, emailData: any) => {
    console.log('handleEditEmail called with:', { contact, emailData, emailIndex });
    
    let currentSubject = emailData.subject || subject || 'Untitled Email';
    let currentBlocks = emailData.blocks || emailBlocks || [];
    
    // If emailData doesn't have blocks, try to parse from campaign data
    if (!currentBlocks || currentBlocks.length === 0) {
      if (campaignData && campaignData.email_body) {
        try {
          const parsedBlocks = JSON.parse(campaignData.email_body);
          currentBlocks = parsedBlocks || [];
        } catch (e) {
          console.error('Failed to parse email_body:', e);
          currentBlocks = [{
            id: 'default',
            type: 'text',
            content: campaignData.email_body || 'No content available'
          }];
        }
      }
    }
    
    // If still no blocks, create a default one
    if (!currentBlocks || currentBlocks.length === 0) {
      currentBlocks = [{
        id: 'default',
        type: 'text',
        content: 'No content available'
      }];
    }
    
    console.log('Processing blocks:', currentBlocks);
    
    // Populate dynamic fields in subject and blocks
    const populatedSubject = populateDynamicFields(currentSubject, contact);
    const populatedBlocks = currentBlocks.map((block: any) => ({
      ...block,
      content: populateDynamicFields(block.content || '', contact)
    }));
    
    console.log('Populated subject:', populatedSubject);
    console.log('Populated blocks:', populatedBlocks);
    
    setEditingEmail({
      contact,
      emailIndex,
      emailData
    });
    setEditEmailSubject(populatedSubject);
    setEditEmailBlocks(populatedBlocks);
  };
  
  // Function to save edited email
  const saveEditedEmailMutation = useMutation({
    mutationFn: async (editedData: any) => {
      return apiRequest(`/api/${envId}/campaigns/${campaignId}/emails/${editedData.emailIndex}`, {
        method: 'PUT',
        body: JSON.stringify({
          contactId: editedData.contact.id,
          subject: editedData.subject,
          blocks: editedData.blocks
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/campaigns`, campaignId] });
      setEditingEmail(null);
      toast({
        title: "Email updated",
        description: "The email has been successfully customized."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating email",
        description: "Failed to save the customized email. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveEditedEmail = () => {
    if (!editingEmail) return;
    
    saveEditedEmailMutation.mutate({
      contact: editingEmail.contact,
      emailIndex: editingEmail.emailIndex,
      subject: editEmailSubject,
      blocks: editEmailBlocks
    });
  };
  
  // Fetch campaign data
  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/${envId}/campaigns`, campaignId],
    queryFn: () => apiRequest('GET', `/api/${envId}/campaigns/${campaignId}`),
    enabled: !!campaignId
  });
  
  // Load campaign data when fetched
  useEffect(() => {
    if (campaign) {
      console.log('Loading partner campaign data:', campaign);
      setCampaignData(campaign);
      setSubject(campaign.subject || '');
      setFromName(campaign.from_name || '');
      setFromEmail(campaign.from_email || '');
      setEmailSendingType(campaign.email_sending_type || 'qollabi_default');
      
      // Parse email body
      try {
        const parsedBlocks = campaign.email_body ? JSON.parse(campaign.email_body) : [];
        setEmailBlocks(parsedBlocks);
      } catch (error) {
        console.error('Error parsing email body:', error);
        setEmailBlocks([]);
      }
    }
  }, [campaign]);
  
  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const stepNames = ['', 'flow', 'settings', 'drafts'];
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('step', stepNames[step]);
    window.history.replaceState({}, '', newUrl.toString());
  };
  
  // Handle step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      goToStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onComplete) {
      onComplete();
    } else if (backUrl) {
      window.location.href = decodeURIComponent(backUrl);
    } else {
      setLocation('/broker-view/partners');
    }
  };
  
  // Save campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/${envId}/campaigns/${campaignId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/campaigns`] });
      toast({
        title: "Campaign updated",
        description: "Your changes have been saved successfully."
      });
    },
    onError: (error) => {
      console.error('Error saving campaign:', error);
      toast({
        title: "Save failed",
        description: "Failed to save campaign changes. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Send single email mutation
  const sendEmailMutation = useMutation({
    mutationFn: ({ recipientId, emailData }: { recipientId: string; emailData: any }) => 
      apiRequest('POST', `/api/${envId}/campaigns/${campaignId}/send-email`, { recipientId, emailData }),
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "Email has been sent successfully."
      });
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      toast({
        title: "Send failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Send all emails mutation
  const sendAllEmailsMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/${envId}/campaigns/${campaignId}/send-all`),
    onSuccess: () => {
      toast({
        title: "All emails sent",
        description: "All ready emails have been sent successfully."
      });
    },
    onError: (error) => {
      console.error('Error sending all emails:', error);
      toast({
        title: "Send all failed",
        description: "Failed to send all emails. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: (contactData: any) => apiRequest('POST', `/api/${envId}/contacts`, contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/campaigns`, campaignId] });
      toast({
        title: "Contact added",
        description: "New contact has been added successfully."
      });
      setShowAddContactModal(false);
      setNewContactData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: ''
      });
    },
    onError: (error) => {
      console.error('Error creating contact:', error);
      toast({
        title: "Failed to add contact",
        description: "Could not add the new contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle saving campaign data
  const handleSave = async () => {
    if (!campaignData) return;
    
    const updateData = {
      subject,
      email_body: JSON.stringify(emailBlocks),
      from_name: fromName,
      from_email: fromEmail,
      email_sending_type: emailSendingType,
      status: 'draft'
    };
    
    saveCampaignMutation.mutate(updateData);
  };

  // Handle sending single email
  const handleSendSingleEmail = (contact: any, email: any) => {
    const emailData = {
      subject: email.subject,
      body: email.blocks,
      from_name: fromName,
      from_email: fromEmail
    };
    
    sendEmailMutation.mutate({ recipientId: contact.id, emailData });
  };

  // Handle sending all emails
  const handleBulkSendAll = () => {
    sendAllEmailsMutation.mutate();
  };

  // Handle adding contact
  const handleAddContact = () => {
    setShowAddContactModal(true);
  };

  // Handle adding suggested contact
  const handleAddSuggestedContact = (suggestedContact: any) => {
    const contactData = {
      first_name: suggestedContact.name.split(' ')[0],
      last_name: suggestedContact.name.split(' ')[1] || '',
      email: suggestedContact.email,
      job_title: suggestedContact.title,
      phone: '',
      customer_id: selectedCompany // Link to the current company
    };
    
    createContactMutation.mutate(contactData);
  };

  // Handle saving new contact
  const handleSaveContact = () => {
    if (!newContactData.first_name || !newContactData.last_name || !newContactData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const contactData = {
      ...newContactData,
      customer_id: selectedCompany // Link to selected company
    };

    createContactMutation.mutate(contactData);
  };
  
  // Step titles for 3-step workflow
  const stepTitles = [
    '',
    'Email Content',
    'Sender Settings', 
    'Drafts & Send'
  ];
  
  const stepIcons = [
    null,
    <Mail className="h-5 w-5" />,
    <Settings className="h-5 w-5" />,
    <Send className="h-5 w-5" />
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {campaign.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Assigned campaign - Partner workflow
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={saveCampaignMutation.isPending}
              >
                {saveCampaignMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => goToStep(step)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : currentStep > step
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {stepIcons[step]}
                </button>
                
                <div className="ml-3 mr-8">
                  <p className={`text-sm font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Step {step}
                  </p>
                  <p className={`text-xs ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepTitles[step]}
                  </p>
                </div>
                
                {step < 3 && (
                  <div className={`w-16 h-0.5 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
          {currentStep === 3 ? (() => {
            // Count all ready contacts across partner's recipients
            const partnerRecipients = (campaign.recipients || []).filter((recipient: any) => 
              recipient.assigned_partner_id === partnerId || 
              recipient.partnerInfo?.id === partnerId
            );
            
            const allReadyContacts = partnerRecipients.filter((recipient: any) => 
              recipient.email || recipient.contactInfo?.email
            ).length;
            
            if (allReadyContacts > 0) {
              return (
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm"
                  onClick={handleBulkSendAll}
                  disabled={sendAllEmailsMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send All ({allReadyContacts})
                </Button>
              );
            }
            return (
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            );
          })() : (
            <div className="text-sm text-gray-500">
              Step {currentStep} of 3
            </div>
          )}
          
          {currentStep === 3 ? (
            <Button
              onClick={handleBulkSendAll}
              disabled={sendAllEmailsMutation.isPending}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4" />
              {sendAllEmailsMutation.isPending ? 'Sending...' : 'Send emails'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 3}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Customize Email Content
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Modify the email content to match your brand and messaging
              </p>
            </div>
            
            <div className="p-6">
              <ImprovedEmailBuilder
                emails={[{
                  id: '1',
                  subject: subject,
                  blocks: emailBlocks,
                  followUpDays: 0,
                  leftLogo: null,
                  rightLogo: null
                }]}
                activeEmailIndex={0}
                entityType="partners"
                onEmailsChange={(emails) => {
                  if (emails.length > 0) {
                    setEmailBlocks(emails[0].blocks);
                    setSubject(emails[0].subject);
                  }
                }}
                onActiveEmailChange={() => {}}
              />
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Sender Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure who the email will be sent from
              </p>
            </div>
            
            <div className="p-6">
              <SenderSettingsPanel
                fromName={fromName}
                fromEmail={fromEmail}
                emailSendingType={emailSendingType}
                onFromNameChange={setFromName}
                onFromEmailChange={setFromEmail}
                onEmailSendingTypeChange={setEmailSendingType}
                isPartnerMode={true}
              />
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="h-full bg-white">
            <div className="flex h-[calc(100vh-200px)]">
              {/* Left Sidebar - Customer Companies */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  {(() => {
                    // Calculate if there are missing contacts for Upload Contacts button styling
                    const partnerRecipients = campaign.recipients || [];
                    const companiesMap = new Map();
                    
                    partnerRecipients.forEach((recipient: any) => {
                      let companyName = '';
                      
                      if (recipient.customerInfo?.name) {
                        companyName = recipient.customerInfo.name;
                      } else if (recipient.customerName) {
                        companyName = recipient.customerName;
                      } else if (recipient.clientName) {
                        companyName = recipient.clientName;
                      } else if (recipient.type === 'customer' && recipient.name) {
                        companyName = recipient.name;
                      } else if (recipient.type === 'opportunity' && recipient.title) {
                        companyName = recipient.title;
                      } else if (recipient.name) {
                        companyName = recipient.name;
                      } else if (recipient.title) {
                        companyName = recipient.title;
                      } else if (recipient.company) {
                        companyName = recipient.company;
                      }
                      
                      if (companyName) {
                        if (!companiesMap.has(companyName)) {
                          companiesMap.set(companyName, {
                            name: companyName,
                            recipients: [],
                            contactsCount: 0
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
                    
                    const companies = Array.from(companiesMap.values());
                    const companiesWithoutContacts = companies.filter(company => company.contactsCount === 0);
                    const hasMissingContacts = companiesWithoutContacts.length > 0;
                    
                    return (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className={`text-xs h-7 px-3 ${
                              hasMissingContacts 
                                ? 'border-orange-500 text-orange-600 hover:bg-orange-50' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setShowContactUploadModal(true)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload Contacts
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs h-7 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                            onClick={handleAddContact}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Customer
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {(() => {
                    // Calculate if there are missing contacts
                    const partnerRecipients = campaign.recipients || [];
                    const companiesMap = new Map();
                    
                    partnerRecipients.forEach((recipient: any) => {
                      let companyName = '';
                      
                      if (recipient.customerInfo?.name) {
                        companyName = recipient.customerInfo.name;
                      } else if (recipient.customerName) {
                        companyName = recipient.customerName;
                      } else if (recipient.clientName) {
                        companyName = recipient.clientName;
                      } else if (recipient.type === 'customer' && recipient.name) {
                        companyName = recipient.name;
                      } else if (recipient.type === 'opportunity' && recipient.title) {
                        companyName = recipient.title;
                      } else if (recipient.name) {
                        companyName = recipient.name;
                      } else if (recipient.title) {
                        companyName = recipient.title;
                      } else if (recipient.company) {
                        companyName = recipient.company;
                      }
                      
                      if (companyName) {
                        if (!companiesMap.has(companyName)) {
                          companiesMap.set(companyName, {
                            name: companyName,
                            recipients: [],
                            contactsCount: 0
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
                    
                    const companies = Array.from(companiesMap.values());
                    const companiesWithoutContacts = companies.filter(company => company.contactsCount === 0);
                    const hasMissingContacts = companiesWithoutContacts.length > 0;
                    
                    return (
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
                              ? (hasMissingContacts ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white')
                              : (hasMissingContacts ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : 'border-gray-300 hover:bg-gray-50')
                          }`}
                          onClick={() => setContactFilter('without_contacts')}
                        >
                          Without Contacts
                        </Button>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Company List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {/* Partner-specific Recipients */}
                    {(() => {
                      // Show all recipients for partner campaign workflow
                      // When a campaign is assigned to a partner, they should see all recipients
                      const partnerRecipients = campaign.recipients || [];

                      // Extract unique companies from partner recipients
                      const companiesMap = new Map();
                      
                      partnerRecipients.forEach((recipient: any) => {
                        let companyName = '';
                        let companyType = '';
                        
                        // Extract company name from various fields
                        if (recipient.customerInfo?.name) {
                          companyName = recipient.customerInfo.name;
                          companyType = 'Customer';
                        } else if (recipient.customerName) {
                          companyName = recipient.customerName;
                          companyType = 'Customer';
                        } else if (recipient.clientName) {
                          companyName = recipient.clientName;
                          companyType = 'Customer';
                        } else if (recipient.type === 'customer' && recipient.name) {
                          companyName = recipient.name;
                          companyType = 'Customer';
                        } else if (recipient.type === 'opportunity' && recipient.title) {
                          companyName = recipient.title;
                          companyType = 'Opportunity';
                        } else if (recipient.name) {
                          companyName = recipient.name;
                          companyType = 'Contact';
                        } else if (recipient.title) {
                          companyName = recipient.title;
                          companyType = 'Business';
                        } else if (recipient.company) {
                          companyName = recipient.company;
                          companyType = 'Business';
                        }
                        
                        if (companyName) {
                          if (!companiesMap.has(companyName)) {
                            companiesMap.set(companyName, {
                              name: companyName,
                              type: companyType,
                              recipients: [],
                              contactsCount: 0
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
                      
                      // Auto-select first company if none selected
                      if (!selectedCompany && companies.length > 0) {
                        setTimeout(() => setSelectedCompany(companies[0].name), 0);
                      }
                      
                      if (companies.length === 0) {
                        return (
                          <div className="p-4 text-center text-gray-500">
                            <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No recipients assigned to this partner</p>
                            <p className="text-xs text-gray-400">Recipients must be assigned to this partner to appear here</p>
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
                              // Use all recipients for partner campaign workflow
                              const partnerRecipients = campaign.recipients || [];
                              
                              const selectedCompanyData = partnerRecipients.find((r: any) => 
                                r.customerInfo?.name === selectedCompany || 
                                r.customerName === selectedCompany ||
                                r.clientName === selectedCompany ||
                                r.name === selectedCompany || 
                                r.title === selectedCompany
                              );
                              
                              const companyType = selectedCompanyData?.customerInfo?.type || 'Business';
                              const contactsCount = partnerRecipients.filter((r: any) => 
                                (r.customerInfo?.name === selectedCompany || 
                                 r.customerName === selectedCompany ||
                                 r.clientName === selectedCompany ||
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
                        {/* Partner-specific Recipients for Selected Company */}
                        {(() => {
                          // Use all recipients for partner campaign workflow
                          const partnerRecipients = campaign.recipients || [];
                          
                          console.log('Selected company:', selectedCompany);
                          console.log('All recipients:', partnerRecipients);
                          
                          const companyRecipients = partnerRecipients.filter((recipient: any) => 
                            recipient.customerInfo?.name === selectedCompany || 
                            recipient.customerName === selectedCompany ||
                            recipient.clientName === selectedCompany ||
                            recipient.name === selectedCompany || 
                            recipient.title === selectedCompany ||
                            (recipient.type === 'contact' && (
                              recipient.customerInfo?.name === selectedCompany ||
                              recipient.customerName === selectedCompany ||
                              recipient.clientName === selectedCompany
                            ))
                          );
                          
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
                          
                          // Group recipients by customer ID
                          const customerContactMap = new Map();
                          
                          companyRecipients.forEach((recipient: any) => {
                            const customerId = recipient.customerInfo?.id || recipient.id;
                            const customerName = recipient.customerInfo?.name || recipient.name || selectedCompany;
                            
                            if (!customerContactMap.has(customerId)) {
                              const contactRecipients = companyRecipients.filter(r => 
                                (r.customerInfo?.id || r.id) === customerId && r.type === 'contact'
                              );
                              
                              let bestContact = null;
                              
                              if (contactRecipients.length > 0) {
                                bestContact = contactRecipients.find(c => c.email) || contactRecipients[0];
                              } else {
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
                                            const currentState = customerSuggestionsCollapsed[customerName] ?? false; // Default to open for customers with no contacts
                                            setCustomerSuggestionsCollapsed(prev => ({
                                              ...prev,
                                              [customerName]: !currentState
                                            }));
                                          }}
                                        >
                                          {(customerSuggestionsCollapsed[customerName] ?? false) ? 'Hide' : 'Show'}
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
                                              <div>
                                                <p className="text-xs text-blue-800 font-medium">Smart Contact Discovery</p>
                                                <p className="text-xs text-blue-600">These contacts were found using AI-powered analysis of company websites, LinkedIn profiles, and business directories.</p>
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
                                  <div className="text-xs text-gray-500">{campaign.emails?.length || 1} email{(campaign.emails?.length || 1) !== 1 ? 's' : ''}</div>
                                </div>

                                {/* Email Sequence */}
                                <div className="space-y-3 mb-3">
                                  {campaign.emails && campaign.emails.length > 0 ? (
                                    campaign.emails.map((email: any, emailIndex: number) => {
                                      const emailContent = email.blocks?.find((block: any) => block.type === 'text')?.content || email.subject || subject;
                                      const populatedContent = populateDynamicFields(emailContent, contact);
                                      const truncatedContent = populatedContent.length > 80 ? populatedContent.substring(0, 80) + '...' : populatedContent;
                                      const populatedSubject = populateDynamicFields(email.subject || subject || 'Untitled Email', contact);
                                      
                                      return (
                                        <div key={emailIndex} className="bg-gray-50 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-900">{emailIndex + 1}</span>
                                              <span className="text-sm font-medium text-gray-900">{populatedSubject}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {emailIndex === 0 ? 'ready' : 'scheduled'}
                                              </Badge>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-6 w-6 p-0"
                                                onClick={() => handleEditEmail(contact, emailIndex, email)}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              {hasEmail && emailIndex === 0 && (
                                                <Button 
                                                  size="sm" 
                                                  className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                  onClick={() => handleSendSingleEmail(contact, email)}
                                                  disabled={sendEmailMutation.isPending}
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
                                    })
                                  ) : (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-900">1</span>
                                          <span className="text-sm font-medium text-gray-900">{populateDynamicFields(subject || 'Untitled Email', contact)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            ready
                                          </Badge>
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleEditEmail(contact, 0, { subject, blocks: emailBlocks })}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          {hasEmail && (
                                            <Button 
                                              size="sm" 
                                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                              onClick={() => handleSendSingleEmail(contact, { subject, blocks: emailBlocks })}
                                              disabled={sendEmailMutation.isPending}
                                            >
                                              <Send className="h-3 w-3 mr-1" />
                                              Send
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 mb-2">Immediate</div>
                                      <div className="text-xs text-gray-600">
                                        {(() => {
                                          const textBlock = emailBlocks.find((block: any) => block.type === 'text');
                                          const content = textBlock?.content || 'Email content...';
                                          const populatedContent = populateDynamicFields(content, contact);
                                          return populatedContent.substring(0, 80) + (populatedContent.length > 80 ? '...' : '');
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Additional Suggested Contacts - Show for ALL contacts */}
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
                                        const key = `${customerName}`;
                                        setCustomerSuggestionsCollapsed(prev => ({
                                          ...prev,
                                          [key]: !prev[key]
                                        }));
                                      }}
                                    >
                                      {(customerSuggestionsCollapsed[customerName] ?? true) ? 'Show' : 'Hide'}
                                    </Button>
                                  </div>
                                  
                                  {!(customerSuggestionsCollapsed[customerName] ?? true) && (
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
                                          <div>
                                            <p className="text-xs text-blue-800 font-medium">Smart Contact Discovery</p>
                                            <p className="text-xs text-blue-600">These contacts were found using AI-powered analysis of company websites, LinkedIn profiles, and business directories.</p>
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
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Select a company</p>
                      <p className="text-sm">Choose a company from the list to view and manage email sequences</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Contact Modal */}
      <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  value={newContactData.first_name}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  value={newContactData.last_name}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={newContactData.email}
                onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={newContactData.phone}
                onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Input
                value={newContactData.job_title}
                onChange={(e) => setNewContactData(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="Enter job title"
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddContactModal(false)}
                disabled={createContactMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContact}
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? 'Adding...' : 'Add Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Email Dialog */}
      <Dialog open={!!editingEmail} onOpenChange={() => setEditingEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Email {editingEmail ? editingEmail.emailIndex + 1 : ''} - {editingEmail?.contact?.first_name || editingEmail?.contact?.name || 'Contact'}
            </DialogTitle>
          </DialogHeader>
          
          {editingEmail && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Recipient</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {editingEmail.contact.first_name || editingEmail.contact.name || 'Contact'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {editingEmail.contact.email || 'No email'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input
                  value={editEmailSubject}
                  onChange={(e) => setEditEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full"
                />
              </div>
              
              {/* Email Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                <textarea
                  value={editEmailBlocks.map(block => block.content).join('\n\n')}
                  onChange={(e) => {
                    const content = e.target.value;
                    setEditEmailBlocks([{
                      id: 'text-block',
                      type: 'text',
                      content: content
                    }]);
                  }}
                  rows={12}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter email content..."
                />
              </div>
              

              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingEmail(null)}
                  disabled={saveEditedEmailMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEditedEmail}
                  disabled={saveEditedEmailMutation.isPending}
                >
                  {saveEditedEmailMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <ContactUploadModal 
        isOpen={showContactUploadModal}
        onClose={() => setShowContactUploadModal(false)}
        onUploadComplete={(uploadedContacts) => {
          // TODO: Handle uploaded contacts and add them to campaign recipients
          console.log('Uploaded contacts:', uploadedContacts);
          setShowContactUploadModal(false);
        }}
      />
    </div>
  );
}