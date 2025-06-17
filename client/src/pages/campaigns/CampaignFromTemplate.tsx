import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading, Share, DollarSign, Home, Car, Umbrella, Building, UserCheck, TrendingDown, Plane } from "lucide-react";
import { useLocation, useRoute, useParams } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedFlowBuilder from './ImprovedEmailBuilder';
import RecipientSelector from '@/components/campaigns/RecipientSelector';

interface CampaignFromTemplateProps {
  params?: { templateId?: string; campaignId?: string };
}

export default function CampaignFromTemplate({ params }: CampaignFromTemplateProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract route parameters from URL path directly using window.location
  const currentPath = window.location.pathname;
  const campaignId = currentPath.includes('/campaigns/edit/') 
    ? currentPath.split('/campaigns/edit/')[1].split('/')[0] // Handle any trailing slashes
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

  // Track if this is initial load to prevent URL conflicts with manual navigation
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [sharePartnersDialogOpen, setSharePartnersDialogOpen] = useState(false);
  const [selectedPartnersForSharing, setSelectedPartnersForSharing] = useState<number[]>([]);
  
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
          console.warn('Failed to parse email_body:', e);
          emails = [{
            id: '1',
            subject: campaignDataFromAPI.subject || '',
            blocks: [],
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
    
    if (fromBrokerView) {
      // Redirect back to broker view campaigns
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
      
      // Check for partner names (string) - this is what we're actually getting
      if (recipient.partnerNames) {
        // partnerNames can be a comma-separated string
        const names = recipient.partnerNames.split(',').map((name: string) => name.trim());
        names.forEach((name: string) => relatedPartnerNames.add(name));
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
        return 'Share or send your campaign';
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
      title: 'Share or Send',
      description: getStepDescription(6),
      component: 'share'
    }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const isStepCompleted = (stepNum: number): boolean => {
    if (stepNum === 1) return Boolean(campaignData.name && campaignData.icon);
    if (stepNum === 2) return Boolean(campaignData.entity);
    if (stepNum === 3) {
      const firstEmail = campaignData.emails[0];
      return Boolean(firstEmail && firstEmail.subject && firstEmail.subject.trim());
    }
    if (stepNum === 4) return campaignData.recipients.length > 0;
    if (stepNum === 5) return true; // Settings step - allow progression as it has default settings
    if (stepNum === 6) return false; // Share or Send step - never auto-completed
    return stepNum < currentStep;
  };

  const isStepAccessible = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStepCompleted(1);
    if (stepNum === 3) return isStepCompleted(2); // Flow Builder after target group
    if (stepNum === 4) return isStepCompleted(3); // Recipients after Flow Builder
    if (stepNum === 5) return isStepCompleted(4); // Settings after Recipients
    if (stepNum === 6) return isStepCompleted(5); // Share or Send after Settings
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Campaign Details</h2>
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
                    { id: 'shield', icon: <Shield className="h-5 w-5" />, color: 'bg-blue-500' },
                    { id: 'home', icon: <Home className="h-5 w-5" />, color: 'bg-green-500' },
                    { id: 'car', icon: <Car className="h-5 w-5" />, color: 'bg-red-500' },
                    { id: 'umbrella', icon: <Umbrella className="h-5 w-5" />, color: 'bg-purple-500' },
                    { id: 'building', icon: <Building className="h-5 w-5" />, color: 'bg-gray-600' },
                    { id: 'dollar-sign', icon: <DollarSign className="h-5 w-5" />, color: 'bg-emerald-500' },
                    { id: 'plane', icon: <Plane className="h-5 w-5" />, color: 'bg-teal-500' },
                    { id: 'user-check', icon: <UserCheck className="h-5 w-5" />, color: 'bg-indigo-500' },
                    { id: 'target', icon: <Target className="h-5 w-5" />, color: 'bg-orange-500' },
                    { id: 'award', icon: <Award className="h-5 w-5" />, color: 'bg-yellow-500' },
                    { id: 'heart', icon: <Heart className="h-5 w-5" />, color: 'bg-pink-500' },
                    { id: 'mail', icon: <Mail className="h-5 w-5" />, color: 'bg-cyan-500' }
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Flow Builder</h2>
              <p className="text-gray-600">Design your email sequence</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
              <p className="text-sm text-green-700">
                <strong>Email content has been duplicated from the template.</strong> You can review and modify it below.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Debug: {campaignData.emails.length} emails loaded, First email has {campaignData.emails[0]?.blocks?.length || 0} blocks
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

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Select Recipients</h2>
              <p className="text-gray-600">Choose who will receive this campaign</p>
            </div>

            <div className="max-w-6xl mx-auto">
              <RecipientSelector
                entityType={campaignData.entity}
                selectedRecipients={campaignData.recipients}
                onRecipientsChange={(recipients) => 
                  setCampaignData({ ...campaignData, recipients })
                }
                initialTab={tabParam}
              />
            </div>
          </div>
        );

      case 5:
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

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Share or Send</h2>
              <p className="text-gray-600">Choose how to distribute your campaign</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="text-center">
                    <div className="p-3 rounded-lg bg-blue-500 text-white w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Send className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Send Now</h3>
                    <p className="text-sm text-gray-600">Send the campaign immediately to all selected recipients</p>
                  </div>
                </div>

                <div className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="text-center">
                    <div className="p-3 rounded-lg bg-green-500 text-white w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Share Link</h3>
                    <p className="text-sm text-gray-600">Generate a shareable link for others to view or collaborate</p>
                  </div>
                </div>

                <Dialog open={sharePartnersDialogOpen} onOpenChange={setSharePartnersDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className="text-center">
                        <div className="p-3 rounded-lg bg-purple-500 text-white w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                          <Share className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Share with Partner(s)</h3>
                        <p className="text-sm text-gray-600">Share campaign with related partners for collaboration</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share with Partner(s)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Select partners to share this campaign with based on your recipient relationships.
                      </p>
                      
                      {getRelatedPartners().length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-sm">
                            No related partners found for the selected recipients.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {getRelatedPartners().map((partner: any) => (
                            <div key={partner.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <Checkbox
                                checked={selectedPartnersForSharing.includes(partner.id)}
                                onCheckedChange={() => togglePartnerSelection(partner.id)}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{partner.name}</p>
                                {partner.email && (
                                  <p className="text-xs text-gray-500">{partner.email}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {getRelatedPartners().length > 0 && (
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setSharePartnersDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleShareWithPartners}
                            disabled={selectedPartnersForSharing.length === 0}
                          >
                            Share Campaign
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  Campaign ready with {campaignData.recipients.length} recipients selected
                </p>
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {isEditingCampaign || isNewCampaign ? "Back to Campaigns" : "Back to Templates"}
              </Button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  {isEditingCampaign ? "Edit Campaign" : isNewCampaign ? "Create New Campaign" : "Create Campaign from Template"}
                </h1>
                {isFromTemplate && (
                  <p className="text-sm text-gray-600">
                    Based on: {templateData?.name}
                  </p>
                )}
                {isEditingCampaign && (
                  <p className="text-sm text-gray-600">
                    Campaign: {campaignDataFromAPI?.name}
                  </p>
                )}
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
        {/* Navigation */}
        <div className="flex justify-between mb-8">
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
    </div>
  );
}