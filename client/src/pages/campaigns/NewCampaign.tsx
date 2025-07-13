import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Mail, Users, Target, Settings, Send, Check, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImprovedEmailBuilder from './ImprovedEmailBuilder';
import RecipientSelector from '@/components/campaigns/RecipientSelector';
import CampaignSettingsWizard from '@/components/campaigns/CampaignSettingsWizard';

interface Email {
  id: string;
  subject: string;
  blocks: any[];
  followUpDays: number;
  leftLogo: string | null;
  rightLogo: string | null;
}

interface CampaignData {
  name: string;
  entity: string;
  description: string;
  objective: string;
  icon: string;
  attachments: any[];
  emails: Email[];
  recipients: any[];
  settings: any;
}

export default function NewCampaign() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [recipientSelectorTab, setRecipientSelectorTab] = useState<string | null>(null);
  const [showSettingsWizard, setShowSettingsWizard] = useState(false);
  
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    entity: 'partners',
    description: '',
    objective: '',
    icon: 'mail',
    attachments: [],
    emails: [
      {
        id: '1',
        subject: '',
        blocks: [],
        followUpDays: 0,
        leftLogo: null,
        rightLogo: null
      },
      {
        id: '2',
        subject: '',
        blocks: [],
        followUpDays: 7,
        leftLogo: null,
        rightLogo: null
      }
    ],
    recipients: [],
    settings: {}
  });

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
    onSuccess: () => {
      toast({
        title: "Campaign created successfully!",
        description: "Your campaign has been created and is ready to launch."
      });
      setLocation('/campaigns');
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

  const handleBack = () => {
    setLocation('/campaigns');
  };

  const handleSave = () => {
    const campaignPayload = {
      name: campaignData.name,
      type: 'email',
      description: campaignData.description,
      template_id: null,
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
    
    console.log('New campaign payload to be saved:', campaignPayload);
    createCampaignMutation.mutate(campaignPayload);
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
        return 'Choose target group';
      case 3:
        if (campaignData.emails[0].subject) {
          return `Subject: ${campaignData.emails[0].subject.substring(0, 30)}${campaignData.emails[0].subject.length > 30 ? '...' : ''}`;
        }
        return 'Design email content';
      case 4:
        return 'Select campaign recipients';
      case 5:
        return 'Configure campaign settings';
      case 6:
        return 'Review and launch campaign';
      default:
        return 'Campaign step';
    }
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(campaignData.name && campaignData.description && campaignData.objective);
      case 2:
        return !!campaignData.entity;
      case 3:
        return !!(campaignData.emails[0].subject && campaignData.emails[0].blocks.length > 0);
      case 4:
        return campaignData.recipients.length > 0;
      case 5:
        return true;
      case 6:
        return true; // Drafts step - always allow progression
      case 7:
        return true;
      default:
        return false;
    }
  };

  const canSave = (): boolean => {
    return !!(
      campaignData.name &&
      campaignData.description &&
      campaignData.objective &&
      campaignData.entity &&
      campaignData.emails[0].subject &&
      campaignData.emails[0].blocks.length > 0 &&
      campaignData.recipients.length > 0
    );
  };

  const steps = [
    { number: 1, title: 'Details', icon: Mail },
    { number: 2, title: 'Target', icon: Target },
    { number: 3, title: 'Content', icon: Mail },
    { number: 4, title: 'Recipients', icon: Users },
    { number: 5, title: 'Settings', icon: Settings },
    { number: 6, title: 'Drafts', icon: Edit },
    { number: 7, title: 'Review', icon: Check }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name *</label>
                <Input
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  value={campaignData.description}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign's purpose and content"
                  className="w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Objective *</label>
                <Input
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="What do you want to achieve? (e.g., increase sales by 25%)"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Choose Target Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'partners', label: 'Partners', color: 'purple' },
                  { value: 'customers', label: 'Customers', color: 'blue' },
                  { value: 'opportunities', label: 'Opportunities', color: 'green' },
                  { value: 'internal', label: 'Internal Team', color: 'orange' }
                ].map((entity) => (
                  <Button
                    key={entity.value}
                    variant={campaignData.entity === entity.value ? "default" : "outline"}
                    className={`h-20 flex flex-col gap-2 ${
                      campaignData.entity === entity.value 
                        ? `bg-${entity.color}-600 hover:bg-${entity.color}-700` 
                        : `hover:bg-${entity.color}-50 hover:border-${entity.color}-300`
                    }`}
                    onClick={() => setCampaignData(prev => ({ ...prev, entity: entity.value }))}
                  >
                    <Target className="h-5 w-5" />
                    <span className="font-medium">{entity.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="w-full">
            <ImprovedEmailBuilder
              emails={campaignData.emails}
              onChange={(emails) => setCampaignData(prev => ({ ...prev, emails }))}
            />
          </div>
        );

      case 4:
        return (
          <div className="w-full space-y-4">
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
                      <div className={`rounded-lg p-4 border-2 transition-all cursor-pointer ${
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
                      }}>
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
                            <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-center">
                              <p className="text-xs text-orange-700">
                                Click to view and fix missing contacts
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

            <RecipientSelector
              entityType={campaignData.entity}
              selectedRecipients={campaignData.recipients}
              onRecipientsChange={(recipients) => setCampaignData(prev => ({ ...prev, recipients }))}
              externalTabOverride={recipientSelectorTab}
            />
          </div>
        );

      case 5:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Configure advanced campaign settings including scheduling, permissions, sender information, and automation rules.
              </div>
              
              <div className="space-y-3">
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
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Draft functionality will be implemented here. This step allows you to save and manage campaign drafts.
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Save as Draft</div>
                    <div className="text-xs text-gray-600">
                      Save your campaign progress without sending
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Draft
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Auto-save</div>
                    <div className="text-xs text-gray-600">
                      Automatically save changes as you work
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Share or Send
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Campaign Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {campaignData.name}</div>
                    <div><strong>Target:</strong> {campaignData.entity}</div>
                    <div><strong>Recipients:</strong> {campaignData.recipients.length}</div>
                    <div><strong>Emails:</strong> {campaignData.emails.filter(e => e.subject).length}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Your campaign is ready to be created. You can launch it immediately or save it as a draft.
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Campaign Details', icon: Mail },
    { number: 2, title: 'Choose Target Group', icon: Target },
    { number: 3, title: 'Flow Builder', icon: Mail },
    { number: 4, title: 'Select Recipients', icon: Users },
    { number: 5, title: 'Settings', icon: Settings },
    { number: 6, title: 'Share or Send', icon: Send }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create New Campaign</h1>
                <p className="text-sm text-gray-600">Build your campaign from scratch</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const canAccess = index === 0 || canProceed(step.number - 1);

              return (
                <div key={step.number} className="flex flex-col items-center relative">
                  {index < steps.length - 1 && (
                    <div className={`absolute top-4 left-8 w-16 h-0.5 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                  
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 relative z-10
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-blue-600 text-white' : 
                      canAccess ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer' : 
                      'bg-gray-100 text-gray-400'}
                  `} onClick={() => canAccess && setCurrentStep(step.number)}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 max-w-24 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {getStepDescription(step.number)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < 7 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed(currentStep)}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!canSave() || createCampaignMutation.isPending}
                className="gap-2"
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
    </div>
  );
}