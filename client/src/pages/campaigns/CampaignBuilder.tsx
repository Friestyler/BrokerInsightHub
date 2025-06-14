import React, { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { ChevronLeft, Users, Mail, Settings, Send, Calendar, User, Building2, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Template, Customer, Contact, CommFlow, InsertCommFlow } from '@shared/schema';
import CleanEmailBuilder from './CleanEmailBuilder';

interface CampaignStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface Email {
  id: string;
  subject: string;
  blocks: any[];
  followUpDays: number;
  leftLogo: string | null;
  rightLogo: string | null;
  condition: any;
}

interface CampaignData {
  name: string;
  description: string;
  type: string;
  targetEntityType: 'partners' | 'customers' | 'opportunities';
  targetEntityId: number | null;
  templateId: number | null;
  senderType: 'qollabi' | 'custom';
  senderEmail: string;
  senderName: string;
  scheduledAt: Date | null;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'recurring';
  selectedContacts: number[];
  emails: Email[];
}

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    type: 'campaign',
    targetEntityType: 'partners',
    targetEntityId: null,
    templateId: null,
    senderType: 'qollabi',
    senderEmail: 'noreply@qollabi.com',
    senderName: 'Qollabi Team',
    scheduledAt: null,
    frequency: 'one_time',
    selectedContacts: [],
    emails: [{
      id: '1',
      subject: 'New Campaign Email',
      blocks: [],
      followUpDays: 7,
      leftLogo: null,
      rightLogo: null,
      condition: { type: 'always' }
    }]
  });

  const steps: CampaignStep[] = [
    { id: 'basic', title: 'Campaign Details', icon: Mail, completed: false },
    { id: 'entity', title: 'Select Entity', icon: Building2, completed: false },
    { id: 'contacts', title: 'Choose Contacts', icon: Users, completed: false },
    { id: 'email', title: 'Create Email', icon: Mail, completed: false },
    { id: 'settings', title: 'Settings & Send', icon: Settings, completed: false },
  ];

  // Fetch templates for initial selection
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  // Fetch entities based on selected type
  const { data: entities = [] } = useQuery<Customer[]>({
    queryKey: [`/api/${campaignData.targetEntityType}`],
    enabled: !!campaignData.targetEntityType,
  });

  // Fetch contacts for selected entity
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts', { entityType: campaignData.targetEntityType, entityId: campaignData.targetEntityId }],
    enabled: !!campaignData.targetEntityId,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: InsertCommFlow) => {
      return apiRequest('/api/comm-flows', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({ title: 'Campaign created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/comm-flows'] });
      navigate('/campaigns');
    },
    onError: (error) => {
      toast({ title: 'Failed to create campaign', description: error.message, variant: 'destructive' });
    },
  });

  const updateStepCompletion = () => {
    const updatedSteps = [...steps];
    
    // Basic step
    updatedSteps[0].completed = !!campaignData.name && !!campaignData.type;
    
    // Entity step
    updatedSteps[1].completed = !!campaignData.targetEntityId;
    
    // Contacts step
    updatedSteps[2].completed = campaignData.selectedContacts.length > 0;
    
    // Email step
    updatedSteps[3].completed = campaignData.emails.some(email => 
      email.subject && email.blocks.length > 0
    );
    
    // Settings step
    updatedSteps[4].completed = !!campaignData.senderEmail && !!campaignData.senderName;
    
    return updatedSteps;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateCampaign = () => {
    if (!campaignData.targetEntityId || campaignData.selectedContacts.length === 0) {
      toast({ title: 'Please select entity and contacts', variant: 'destructive' });
      return;
    }

    const commFlowData: InsertCommFlow = {
      type: campaignData.type,
      name: campaignData.name,
      description: campaignData.description,
      targetEntityType: campaignData.targetEntityType,
      targetEntityId: campaignData.targetEntityId,
      templateId: campaignData.templateId,
      status: 'draft',
      senderType: campaignData.senderType,
      senderEmail: campaignData.senderEmail,
      senderName: campaignData.senderName,
      scheduledAt: campaignData.scheduledAt,
      frequency: campaignData.frequency,
      isShared: false,
      createdBy: 1, // TODO: Get from auth context
    };

    createCampaignMutation.mutate(commFlowData);
  };

  const renderStepIndicator = () => {
    const completedSteps = updateStepCompletion();
    
    return (
      <div className="flex items-center justify-between mb-8">
        {completedSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index === currentStep 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : step.completed
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              {step.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <step.icon size={20} />
              )}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                index === currentStep ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
            </div>
            {index < completedSteps.length - 1 && (
              <ArrowRight className="mx-4 text-gray-300" size={16} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBasicStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail size={20} />
          Campaign Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={campaignData.name}
              onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter campaign name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Campaign Type</Label>
            <Select
              value={campaignData.type}
              onValueChange={(value) => setCampaignData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign">Marketing Campaign</SelectItem>
                <SelectItem value="update">Business Update</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={campaignData.description}
            onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the purpose of this campaign"
            rows={3}
          />
        </div>

        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Start from Template (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    campaignData.templateId === template.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCampaignData(prev => ({ 
                    ...prev, 
                    templateId: template.id,
                    targetEntityType: template.entityType as any
                  }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {template.icon && <span className="text-lg">{template.icon}</span>}
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-600">{template.description}</p>
                    )}
                    <Badge variant="outline" className="mt-2 text-xs">
                      {template.entityType}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEntityStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 size={20} />
          Select Target Entity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Entity Type</Label>
          <RadioGroup
            value={campaignData.targetEntityType}
            onValueChange={(value: any) => setCampaignData(prev => ({ 
              ...prev, 
              targetEntityType: value,
              targetEntityId: null,
              selectedContacts: []
            }))}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partners" id="partners" />
              <Label htmlFor="partners">Partners</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="customers" id="customers" />
              <Label htmlFor="customers">Customers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="opportunities" id="opportunities" />
              <Label htmlFor="opportunities">Opportunities</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Select {campaignData.targetEntityType.slice(0, -1).charAt(0).toUpperCase() + campaignData.targetEntityType.slice(1, -1)} *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {entities.map((entity) => (
              <Card
                key={entity.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  campaignData.targetEntityId === entity.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setCampaignData(prev => ({ 
                  ...prev, 
                  targetEntityId: entity.id,
                  selectedContacts: []
                }))}
              >
                <CardContent className="p-4">
                  <div className="font-medium text-sm mb-1">{entity.name}</div>
                  {(entity as any).industry && (
                    <div className="text-xs text-gray-600">{(entity as any).industry}</div>
                  )}
                  {(entity as any).location && (
                    <div className="text-xs text-gray-500">{(entity as any).location}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Choose Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!campaignData.targetEntityId ? (
          <div className="text-center py-8 text-gray-500">
            Please select an entity first to see available contacts.
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500">
              This entity doesn't have any contacts yet. You may need to add contacts first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Available Contacts ({contacts.length})</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignData(prev => ({ 
                    ...prev, 
                    selectedContacts: contacts.map(c => c.id)
                  }))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignData(prev => ({ 
                    ...prev, 
                    selectedContacts: []
                  }))}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {contacts.map((contact) => (
                <Card
                  key={contact.id}
                  className={`cursor-pointer transition-all ${
                    campaignData.selectedContacts.includes(contact.id)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    const isSelected = campaignData.selectedContacts.includes(contact.id);
                    setCampaignData(prev => ({
                      ...prev,
                      selectedContacts: isSelected
                        ? prev.selectedContacts.filter(id => id !== contact.id)
                        : [...prev.selectedContacts, contact.id]
                    }));
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={campaignData.selectedContacts.includes(contact.id)} 
                        readOnly 
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{contact.fullName}</div>
                        {contact.email && (
                          <div className="text-xs text-gray-600">{contact.email}</div>
                        )}
                        {contact.jobTitle && (
                          <div className="text-xs text-gray-500">{contact.jobTitle}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {campaignData.selectedContacts.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  {campaignData.selectedContacts.length} contact{campaignData.selectedContacts.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmailStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail size={20} />
          Create Email Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CleanEmailBuilder
          emails={campaignData.emails}
          onEmailsChange={(emails) => setCampaignData(prev => ({ ...prev, emails }))}
          entityType={campaignData.targetEntityType}
        />
      </CardContent>
    </Card>
  );

  const renderSettingsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings size={20} />
          Campaign Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sender Settings</Label>
            <RadioGroup
              value={campaignData.senderType}
              onValueChange={(value: 'qollabi' | 'custom') => setCampaignData(prev => ({ 
                ...prev, 
                senderType: value,
                senderEmail: value === 'qollabi' ? 'noreply@qollabi.com' : '',
                senderName: value === 'qollabi' ? 'Qollabi Team' : ''
              }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qollabi" id="qollabi" />
                <Label htmlFor="qollabi">Send from Qollabi (noreply@qollabi.com)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Connect your own email</Label>
              </div>
            </RadioGroup>
          </div>

          {campaignData.senderType === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email *</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={campaignData.senderEmail}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder="your-email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name *</Label>
                <Input
                  id="senderName"
                  value={campaignData.senderName}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Schedule & Frequency</Label>
            <Select
              value={campaignData.frequency}
              onValueChange={(value: any) => setCampaignData(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">Send Once</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="recurring">Custom Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule Send Time (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={campaignData.scheduledAt ? campaignData.scheduledAt.toISOString().slice(0, 16) : ''}
              onChange={(e) => setCampaignData(prev => ({ 
                ...prev, 
                scheduledAt: e.target.value ? new Date(e.target.value) : null 
              }))}
            />
          </div>
        </div>

        <Separator />

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Campaign Summary</h4>
          <div className="text-sm space-y-1">
            <div><strong>Name:</strong> {campaignData.name || 'Untitled'}</div>
            <div><strong>Type:</strong> {campaignData.type}</div>
            <div><strong>Recipients:</strong> {campaignData.selectedContacts.length} contacts</div>
            <div><strong>Sender:</strong> {campaignData.senderName} ({campaignData.senderEmail})</div>
            <div><strong>Frequency:</strong> {campaignData.frequency.replace('_', ' ')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicStep();
      case 1: return renderEntityStep();
      case 2: return renderContactsStep();
      case 3: return renderEmailStep();
      case 4: return renderSettingsStep();
      default: return renderBasicStep();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
          <ChevronLeft size={16} />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
      </div>

      {renderStepIndicator()}
      
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCampaignMutation.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}