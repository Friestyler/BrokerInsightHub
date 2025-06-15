import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading } from "lucide-react";
import { useLocation, useRoute } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedFlowBuilder from './ImprovedEmailBuilder';

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  stepNumber: number;
  title: string;
  description: string;
  onClick?: () => void;
}

const StepIndicator = ({ isActive, isCompleted, isAccessible, stepNumber, title, description, onClick }: StepProps) => (
  <div 
    className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
      !isAccessible 
        ? 'bg-muted/30 border-muted cursor-not-allowed opacity-60' 
        : isActive 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : isCompleted 
            ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer' 
            : 'bg-card border-border hover:border-border/80 cursor-pointer'
    }`}
    onClick={isAccessible && onClick ? onClick : undefined}
  >
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
      isCompleted 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : !isAccessible
            ? 'bg-muted text-muted-foreground border border-muted'
            : 'bg-muted text-muted-foreground border border-border'
    }`}>
      {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`font-medium text-sm ${
        isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : !isAccessible ? 'text-muted-foreground' : 'text-foreground'
      }`}>
        {title}
      </div>
      <div className={`text-xs ${
        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : !isAccessible ? 'text-muted-foreground' : 'text-muted-foreground'
      }`}>
        {description}
      </div>
    </div>
  </div>
);

interface CampaignFromTemplateProps {
  params: { templateId: string };
}

export default function CampaignFromTemplate({ params }: CampaignFromTemplateProps) {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { templateId } = params;
  
  // Campaign-specific state (starts with template data)
  const [campaignData, setCampaignData] = useState({
    name: '', // New campaign name (different from template)
    templateId: parseInt(templateId),
    entity: '',
    description: '',
    objective: '',
    icon: '',
    attachments: [] as Array<{id: string, name: string, type: string, size: number}>,
    emails: [{ 
      id: '1',
      subject: '', 
      blocks: [] as any[],
      followUpDays: 0,
      leftLogo: null,
      rightLogo: null
    }],
    recipients: [] as Array<{id: number, name: string, email: string, type: string}>,
    settings: {
      sendTime: '',
      timezone: '',
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      replyTo: ''
    }
  });
  
  const [showPreview, setShowPreview] = useState(false);

  // Load template data to duplicate
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/campaign-templates/${templateId}`],
    enabled: !!templateId
  });

  // Load template data into campaign when available
  useEffect(() => {
    if (templateData) {
      console.log('Loading template data for campaign creation:', templateData);
      
      const emails = templateData.emails?.map((email: any, index: number) => ({
        id: email.id || (index + 1).toString(),
        subject: email.subject || '',
        blocks: email.blocks || [],
        followUpDays: email.followUpDays || 0,
        leftLogo: email.leftLogo || null,
        rightLogo: email.rightLogo || null,
        condition: email.condition || (index > 0 ? { type: 'always' } : undefined)
      })) || [{
        id: '1',
        subject: '',
        blocks: [],
        followUpDays: 0,
        leftLogo: null,
        rightLogo: null
      }];

      setCampaignData(prev => ({
        ...prev,
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
      const response = await fetch('/api/degoudse/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          templateId: parseInt(templateId),
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
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    },
  });

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

  const handleStepClick = (stepNum: number) => {
    if (isStepAccessible(stepNum)) {
      setCurrentStep(stepNum);
    }
  };

  const handleBack = () => {
    setLocation('/campaigns/templates');
  };

  const handleCreateCampaign = () => {
    console.log('handleCreateCampaign called');
    console.log('Campaign data:', campaignData);
    
    const campaignPayload = {
      name: campaignData.name,
      description: campaignData.description,
      templateId: campaignData.templateId,
      entity: campaignData.entity,
      targetGroup: campaignData.entity, // Same as entity for now
      recipients: campaignData.recipients,
      status: 'draft',
      settings: campaignData.settings,
      emails: campaignData.emails.map(email => ({
        subject: email.subject,
        content: JSON.stringify(email.blocks),
        followUpDays: email.followUpDays || 0
      }))
    };

    console.log('Campaign payload to be saved:', campaignPayload);
    createCampaignMutation.mutate(campaignPayload);
  };

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

  if (templateLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create Campaign from Template</h1>
                <p className="text-sm text-muted-foreground">
                  {templateData?.name ? `Based on: ${templateData.name}` : 'Loading template...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">Step {currentStep} of {totalSteps}</div>
                <div className="text-xs text-muted-foreground">{Math.round(progress)}% complete</div>
              </div>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Steps */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-medium text-sm text-muted-foreground mb-4">Campaign Steps</h2>
            {steps.map((step) => (
              <StepIndicator
                key={step.number}
                stepNumber={step.number}
                title={step.title}
                description={step.description}
                isActive={currentStep === step.number}
                isCompleted={isStepCompleted(step.number)}
                isAccessible={isStepAccessible(step.number)}
                onClick={() => handleStepClick(step.number)}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === 1 && <Type className="h-5 w-5" />}
                  {currentStep === 2 && <Target className="h-5 w-5" />}
                  {currentStep === 3 && <Users className="h-5 w-5" />}
                  {currentStep === 4 && <Mail className="h-5 w-5" />}
                  {currentStep === 5 && <Settings className="h-5 w-5" />}
                  {steps.find(s => s.number === currentStep)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Step 1: Give a Name */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Campaign Name</label>
                        <Input
                          placeholder="Enter a unique name for your campaign..."
                          value={campaignData.name}
                          onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will help you identify this campaign from the template "{templateData?.name}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Choose Target Group - EXACT COPY FROM TEMPLATE */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <p className="text-base text-muted-foreground mb-6">
                        Select the type of audience you want to create a template for
                      </p>
                    </div>

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
                              : 'border-muted hover:border-border/80 hover:shadow-sm'
                          }`}
                          onClick={() => setCampaignData({ ...campaignData, entity: option.id })}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} text-white shadow-sm`}>
                              {option.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground text-base mb-1">
                                {option.title}
                              </h3>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                {option.subtitle}
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
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
                      <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          {['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'opportunities' ? 'Opportunities' :
                           ['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'customers' ? 'Customers' :
                           ['opportunities', 'customers', 'partners', 'internal'].find(id => id === campaignData.entity) === 'partners' ? 'Partners' : 'Internal Team'} selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Template Details - EXACT COPY FROM TEMPLATE */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Template Name</label>
                        <Input
                          placeholder="Enter a descriptive name for your template..."
                          value={campaignData.name}
                          onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Description</label>
                        <Textarea
                          placeholder="Describe what this template is for and when to use it..."
                          value={campaignData.description}
                          onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Objective</label>
                        <Textarea
                          placeholder="What is the main goal of this template? What outcome do you want to achieve?"
                          value={campaignData.objective}
                          onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Choose an Icon</label>
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
                                  : 'border-muted hover:border-border hover:bg-muted'
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
                )}

                {/* Step 4: Select Recipients - Placeholder */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Select Recipients
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This step will allow you to choose specific contacts from your {campaignData.entity} list to receive this campaign.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
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
                )}

                {/* Step 5: Flow Builder - EXACT COPY FROM TEMPLATE */}
                {currentStep === 5 && (
                  <div className="space-y-6">
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
                )}

                {/* Step 6: Settings - Placeholder */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Campaign Settings
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Configure when to send, tracking options, and other campaign settings.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
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
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
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
                        onClick={handleCreateCampaign}
                        disabled={!canSave() || createCampaignMutation.isPending}
                        className="gap-2"
                      >
                        {createCampaignMutation.isPending ? (
                          <>Creating...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Create Campaign
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}