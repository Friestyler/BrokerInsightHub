import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading } from "lucide-react";
import { useLocation, useRoute } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedFlowBuilder from './ImprovedEmailBuilder';

interface CampaignFromTemplateProps {
  params: { templateId: string };
}

export default function CampaignFromTemplate({ params }: CampaignFromTemplateProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { templateId } = params;
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  
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

  // Load template data to duplicate
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/campaign-templates/${templateId}`],
    enabled: !!templateId
  });

  // Load template data into campaign when available
  useEffect(() => {
    if (templateData) {
      console.log('Loading template data for campaign creation:', templateData);
      
      const emails = templateData.emails?.map((email: any, index: number) => {
        let blocks = [];
        try {
          // Template emails store content as JSON string, parse it to get blocks
          if (typeof email.content === 'string') {
            blocks = JSON.parse(email.content);
          } else if (email.blocks) {
            blocks = email.blocks;
          }
        } catch (e) {
          console.warn('Failed to parse email content:', e);
          blocks = [];
        }
        
        return {
          id: email.id || (index + 1).toString(),
          subject: email.subject || '',
          blocks: blocks,
          followUpDays: email.followUpDays || 0,
          leftLogo: email.leftLogo || null,
          rightLogo: email.rightLogo || null,
          condition: email.condition || (index > 0 ? { type: 'always' } : undefined)
        };
      }) || [{
        id: '1',
        subject: '',
        blocks: [],
        followUpDays: 0,
        leftLogo: null,
        rightLogo: null
      }];

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
        firstEmailBlocks: emails[0]?.blocks?.length
      });
    }
  }, [templateData]);

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/degoudse/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return response;
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
    setLocation('/campaigns/templates');
  };

  const handleSave = () => {
    const campaignPayload = {
      name: campaignData.name,
      templateId: templateId,
      entity: campaignData.entity,
      description: campaignData.description,
      objective: campaignData.objective,
      emails: campaignData.emails.map(email => ({
        subject: email.subject,
        content: JSON.stringify(email.blocks),
        followUpDays: email.followUpDays
      })),
      recipients: campaignData.recipients,
      settings: campaignData.settings,
      status: 'draft'
    };
    
    console.log('Campaign payload to be saved:', campaignPayload);
    createCampaignMutation.mutate(campaignPayload);
  };

  const getStepDescription = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        if (campaignData.name) {
          return `Campaign: ${campaignData.name.substring(0, 30)}${campaignData.name.length > 30 ? '...' : ''}`;
        }
        return 'Give your campaign a name';
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
        if (campaignData.name && campaignData.description && campaignData.objective) {
          return `Template: ${campaignData.name.substring(0, 30)}${campaignData.name.length > 30 ? '...' : ''}`;
        }
        return 'Configure template settings';
      case 4:
        return 'Select campaign recipients';
      case 5:
        if (campaignData.emails[0].subject) {
          return `Subject: ${campaignData.emails[0].subject.substring(0, 30)}${campaignData.emails[0].subject.length > 30 ? '...' : ''}`;
        }
        return 'Review and edit email content';
      case 6:
        return 'Configure campaign settings';
      default:
        return '';
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Give a Name',
      description: getStepDescription(1),
      component: 'name'
    },
    {
      number: 2,
      title: 'Choose Target Group',
      description: getStepDescription(2),
      component: 'entity'
    },
    {
      number: 3,
      title: 'Template Details',
      description: getStepDescription(3),
      component: 'details'
    },
    {
      number: 4,
      title: 'Select Recipients',
      description: getStepDescription(4),
      component: 'recipients'
    },
    {
      number: 5,
      title: 'Flow Builder',
      description: getStepDescription(5),
      component: 'builder'
    },
    {
      number: 6,
      title: 'Settings',
      description: getStepDescription(6),
      component: 'settings'
    }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const isStepCompleted = (stepNum: number): boolean => {
    if (stepNum === 1) return Boolean(campaignData.name);
    if (stepNum === 2) return Boolean(campaignData.entity);
    if (stepNum === 3) return Boolean(campaignData.name && campaignData.description && campaignData.objective && campaignData.icon);
    if (stepNum === 4) return campaignData.recipients.length > 0;
    if (stepNum === 5) {
      const firstEmail = campaignData.emails[0];
      return Boolean(firstEmail && firstEmail.subject && firstEmail.subject.trim());
    }
    if (stepNum === 6) return Boolean(campaignData.settings.sendTime);
    return stepNum < currentStep;
  };

  const isStepAccessible = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStepCompleted(1);
    if (stepNum === 3) return isStepCompleted(2);
    if (stepNum === 4) return isStepCompleted(3);
    if (stepNum === 5) return isStepCompleted(4);
    if (stepNum === 6) return isStepCompleted(5);
    return false;
  };

  const canSave = (): boolean => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4) && isStepCompleted(5) && isStepCompleted(6);
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepAccessible(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Give your campaign a name</h2>
              <p className="text-gray-600">Choose a descriptive name to help identify this campaign</p>
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
                  This will help you identify this campaign from the template "{templateData?.name}"
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Choose Target Group</h2>
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
                    className={`relative group cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                      campaignData.entity === option.id
                        ? `border-${option.hoverColor}-200 bg-${option.hoverColor}-50 shadow-sm`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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

              {campaignData.entity && (
                <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    {['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'opportunities' ? 'Opportunities' :
                     ['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'customers' ? 'Customers' :
                     ['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'partners' ? 'Partners' : 'Internal Team'} selected
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Template Details</h2>
              <p className="text-gray-600">Configure your template settings</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <Input
                  placeholder="Enter a descriptive name for your template..."
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  placeholder="Describe what this template is for and when to use it..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
                <Textarea
                  placeholder="What is the main goal of this template? What outcome do you want to achieve?"
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose an Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { id: 'target', icon: <Target className="h-5 w-5" />, color: 'bg-blue-500' },
                    { id: 'trending-up', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-green-500' },
                    { id: 'zap', icon: <Zap className="h-5 w-5" />, color: 'bg-yellow-500' },
                    { id: 'star', icon: <Star className="h-5 w-5" />, color: 'bg-purple-500' },
                    { id: 'heart', icon: <Heart className="h-5 w-5" />, color: 'bg-pink-500' },
                    { id: 'gift', icon: <Gift className="h-5 w-5" />, color: 'bg-red-500' },
                    { id: 'mail', icon: <Mail className="h-5 w-5" />, color: 'bg-gray-500' },
                    { id: 'sparkles', icon: <Sparkles className="h-5 w-5" />, color: 'bg-indigo-500' },
                    { id: 'rocket', icon: <Rocket className="h-5 w-5" />, color: 'bg-orange-500' },
                    { id: 'shield', icon: <Shield className="h-5 w-5" />, color: 'bg-teal-500' },
                    { id: 'diamond', icon: <Diamond className="h-5 w-5" />, color: 'bg-cyan-500' },
                    { id: 'award', icon: <Award className="h-5 w-5" />, color: 'bg-emerald-500' }
                  ].map((iconOption) => (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => setCampaignData({ ...campaignData, icon: iconOption.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        campaignData.icon === iconOption.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`${iconOption.color} text-white p-1 rounded`}>
                        {iconOption.icon}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Select Recipients</h2>
              <p className="text-gray-600">Choose who will receive this campaign</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Select Recipients
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  This step will allow you to choose specific contacts from your {campaignData.entity} list to receive this campaign.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCampaignData({
                      ...campaignData,
                      recipients: [
                        { id: 1, name: 'Sample Contact 1', email: 'contact1@example.com', type: campaignData.entity },
                        { id: 2, name: 'Sample Contact 2', email: 'contact2@example.com', type: campaignData.entity }
                      ]
                    });
                  }}
                >
                  Add Sample Recipients (Placeholder)
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Flow Builder</h2>
              <p className="text-gray-600">Design your email sequence</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
              <p className="text-sm text-green-700">
                <strong>Email content has been duplicated from the template.</strong> You can review and modify it below.
              </p>
            </div>
            
            <ImprovedFlowBuilder
              emails={campaignData.emails}
              activeEmailIndex={activeEmailIndex}
              entityType={campaignData.entity}
              onEmailsChange={(emails) => setCampaignData({ ...campaignData, emails })}
              onActiveEmailChange={setActiveEmailIndex}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Campaign Settings</h2>
              <p className="text-gray-600">Configure when and how to send</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Campaign Settings
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  Configure when to send, tracking options, and other campaign settings.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCampaignData({
                      ...campaignData,
                      settings: {
                        ...campaignData.settings,
                        sendTime: 'immediate',
                        timezone: 'UTC',
                        replyTo: 'noreply@company.com'
                      }
                    });
                  }}
                >
                  Apply Default Settings (Placeholder)
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (templateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  Create Campaign from Template
                </h1>
                <p className="text-sm text-gray-600">
                  Based on: {templateData?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</p>
              <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start relative">
            {/* Connecting Line Background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ marginLeft: '4rem', marginRight: '4rem' }} />
            
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
                {/* Step Circle */}
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all cursor-pointer relative ${
                    isStepCompleted(step.number) 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : currentStep === step.number 
                        ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' 
                        : isStepAccessible(step.number)
                          ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => isStepAccessible(step.number) ? setCurrentStep(step.number) : undefined}
                >
                  {isStepCompleted(step.number) ? <Check className="h-4 w-4" /> : step.number}
                </div>
                
                {/* Step Text */}
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep === step.number ? 'text-blue-600' : 'text-gray-900'
                  }`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-3">
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
                disabled={!canSave() || createCampaignMutation.isPending}
                className="gap-2"
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}