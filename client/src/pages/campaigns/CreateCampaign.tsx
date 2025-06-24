import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Check, Clock, Mail, Settings, Users, Target, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CampaignTemplate, Customer, CustomerTeamMember } from '@shared/schema';

interface CreateCampaignProps {
  params: { templateId: string };
}

interface CampaignFormData {
  name: string;
  description: string;
  templateId: number;
  entity: string;
  targetGroup: string;
  recipients: Array<{id: number, name: string, email: string, type: string}>;
  settings: {
    sendTime: string;
    timezone: string;
    trackOpens: boolean;
    trackClicks: boolean;
    unsubscribeLink: boolean;
    replyTo: string;
  };
  status: string;
}

const steps = [
  { id: 1, title: 'Campaign Name', icon: Sparkles, description: 'Name your campaign' },
  { id: 2, title: 'Target Group', icon: Target, description: 'Select target group' },
  { id: 3, title: 'Recipients', icon: Users, description: 'Choose recipients' },
  { id: 4, title: 'Settings', icon: Settings, description: 'Configure settings' },
];

export function CreateCampaign({ params }: CreateCampaignProps) {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<Array<{id: number, name: string, email: string, type: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    templateId: parseInt(params.templateId),
    entity: '',
    targetGroup: '',
    recipients: [],
    settings: {
      sendTime: '09:00',
      timezone: 'UTC',
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      replyTo: '',
    },
    status: 'draft',
  });

  // Fetch template data
  const { data: template, isLoading: templateLoading } = useQuery<CampaignTemplate>({
    queryKey: ['/api/campaign-templates', params.templateId],
  });

  // Fetch potential recipients based on entity type
  const { data: customersResponse } = useQuery({
    queryKey: ['/api/customers'],
    enabled: formData.entity === 'customers',
  });
  const customers = customersResponse?.data || [];

  const { data: contacts } = useQuery<CustomerTeamMember[]>({
    queryKey: ['/api/contacts'],
    enabled: formData.entity === 'partners' || formData.entity === 'customers',
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: formData.entity === 'opportunities',
  });

  // Set initial form data when template loads
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        entity: template.entity,
        name: `${template.name} Campaign`,
        description: template.description || '',
      }));
    }
  }, [template]);

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await fetch('/api/degoudse/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recipients: selectedRecipients,
          createdBy: 1, // TODO: Get from auth context
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      
      return response.json();
    },
    onSuccess: (newCampaign) => {
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setLocation('/campaigns');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createCampaignMutation.mutate(formData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.targetGroup.trim().length > 0;
      case 3:
        return selectedRecipients.length > 0;
      case 4:
        return formData.settings.replyTo.trim().length > 0;
      default:
        return false;
    }
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'opportunities': return 'text-green-600 bg-green-50 border-green-200';
      case 'customers': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'partners': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getPotentialRecipients = () => {
    switch (formData.entity) {
      case 'customers':
        return customers?.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.description || `customer-${customer.id}@company.com`, // Use description field as fallback
          type: 'customer'
        })) || [];
      case 'partners':
        return contacts?.map(contact => ({
          id: contact.id,
          name: `Contact ${contact.id}`, // CustomerTeamMember doesn't have name field
          email: `contact-${contact.id}@company.com`, // Generate email based on ID
          type: 'partner'
        })) || [];
      case 'opportunities':
        return (opportunities as any[])?.map((opp: any) => ({
          id: opp.id,
          name: opp.title || `Opportunity ${opp.id}`,
          email: opp.contactEmail || `opportunity-${opp.id}@company.com`,
          type: 'opportunity'
        })) || [];
      default:
        return [];
    }
  };

  const toggleRecipient = (recipient: {id: number, name: string, email: string, type: string}) => {
    const isSelected = selectedRecipients.some(r => r.id === recipient.id && r.type === recipient.type);
    if (isSelected) {
      setSelectedRecipients(prev => prev.filter(r => !(r.id === recipient.id && r.type === recipient.type)));
    } else {
      setSelectedRecipients(prev => [...prev, recipient]);
    }
  };

  if (templateLoading) {
    return (
      <div className="min-h-screen bg-[#E6E7F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E7F1]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/campaigns/templates')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Campaign</h1>
              <p className="text-sm text-gray-600">From template: {template?.name}</p>
            </div>
          </div>
          {template && (
            <Badge className={`px-3 py-1 ${getEntityColor(template.entity)}`}>
              {template.entity}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-12 w-24 h-0.5 ${
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-300'
                    }`} />
                  )}
                  
                  {/* Step circle */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 relative z-10 ${
                    isCompleted 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : isActive 
                        ? 'bg-white border-indigo-600 text-indigo-600' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  
                  {/* Step info */}
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Campaign Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Target Group */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entity">Entity Type</Label>
                  <div className="mt-2">
                    <Badge className={`px-3 py-2 ${getEntityColor(formData.entity)}`}>
                      {formData.entity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="targetGroup">Target Group Criteria *</Label>
                  <Textarea
                    id="targetGroup"
                    value={formData.targetGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetGroup: e.target.value }))}
                    placeholder="Describe your target group criteria (e.g., customers in Netherlands with revenue > €100k)"
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Recipients */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Select Recipients</h3>
                    <Badge variant="outline">
                      {selectedRecipients.length} selected
                    </Badge>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    {getPotentialRecipients().map((recipient) => (
                      <div
                        key={`${recipient.type}-${recipient.id}`}
                        className="flex items-center space-x-3 p-3 border-b border-gray-100 hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedRecipients.some(r => r.id === recipient.id && r.type === recipient.type)}
                          onCheckedChange={() => toggleRecipient(recipient)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{recipient.name}</div>
                          <div className="text-sm text-gray-500">{recipient.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recipient.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sendTime">Send Time</Label>
                    <Select
                      value={formData.settings.sendTime}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, sendTime: value }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.settings.timezone}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, timezone: value }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/Amsterdam">Europe/Amsterdam</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="replyTo">Reply-To Email *</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={formData.settings.replyTo}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, replyTo: e.target.value }
                    }))}
                    placeholder="noreply@company.com"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Tracking Options</Label>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Track Opens</div>
                      <div className="text-sm text-gray-500">Track when recipients open emails</div>
                    </div>
                    <Switch
                      checked={formData.settings.trackOpens}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackOpens: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Track Clicks</div>
                      <div className="text-sm text-gray-500">Track when recipients click links</div>
                    </div>
                    <Switch
                      checked={formData.settings.trackClicks}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackClicks: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Unsubscribe Link</div>
                      <div className="text-sm text-gray-500">Include unsubscribe link in emails</div>
                    </div>
                    <Switch
                      checked={formData.settings.unsubscribeLink}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, unsubscribeLink: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create campaign'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}