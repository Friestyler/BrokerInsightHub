import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Edit, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading, Share, DollarSign, Home, Car, Umbrella, Building, UserCheck, TrendingDown, Plane, Search, User } from "lucide-react";
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
        return 'Save and manage drafts';
      case 7:
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
      title: 'Drafts',
      description: getStepDescription(6),
      component: 'drafts'
    },
    {
      number: 7,
      title: 'Share or Send',
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
    const step5Complete = true; // Settings step - allow progression as it has default settings
    const step6Complete = true; // Drafts step - allow progression as it has default behavior
    
    if (stepNum === 1) return step1Complete;
    if (stepNum === 2) return step2Complete;
    if (stepNum === 3) return step3Complete;
    if (stepNum === 4) return step4Complete;
    if (stepNum === 5) return step5Complete;
    if (stepNum === 6) return step6Complete;
    if (stepNum === 7) return false; // Share or Send step - never auto-completed
    return stepNum < currentStep;
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
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4) && isStepCompleted(5) && isStepCompleted(6);
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
          <div className="space-y-2">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Email Sequence Management</h2>
              <p className="text-sm text-gray-600">Manage contacts and customize email sequences for each recipient</p>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="flex gap-3 h-[600px]">
                {/* Left Sidebar - Customer Companies */}
                <div className="w-1/3 bg-white border border-gray-200 rounded-lg p-3 overflow-hidden flex flex-col">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Customer Companies</h3>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Customer
                      </Button>
                    </div>
                    
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="Search companies..."
                        className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                    </div>
                    
                    <div className="flex gap-1 mb-2">
                      <Button size="sm" variant="default" className="text-xs h-6 px-2">All Companies</Button>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2">With Contacts</Button>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2">Without Contacts</Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {/* Group recipients by customer/company */}
                    {(() => {
                      const groupedRecipients = campaignData.recipients.reduce((groups, recipient) => {
                        const companyName = recipient.customer_name || recipient.partner_name || recipient.opportunity_title || 'Unknown Company';
                        if (!groups[companyName]) {
                          groups[companyName] = [];
                        }
                        groups[companyName].push(recipient);
                        return groups;
                      }, {} as Record<string, typeof campaignData.recipients>);

                      // Auto-select first company if none is selected
                      const companyNames = Object.keys(groupedRecipients);
                      if (!selectedCompany && companyNames.length > 0) {
                        setTimeout(() => setSelectedCompany(companyNames[0]), 0);
                      }

                      // Show sample companies if no recipients exist
                      if (companyNames.length === 0) {
                        const sampleCompanies = [
                          { name: "TechCorp Inc.", type: "Technology", contacts: 2 },
                          { name: "Global Manufacturing Co.", type: "Manufacturing", contacts: 0 },
                          { name: "Startup.io", type: "Software", contacts: 1 },
                          { name: "Design Studio", type: "Creative", contacts: 1 },
                          { name: "FinTech Solutions", type: "Finance", contacts: 0 }
                        ];
                        
                        // Auto-select first sample company
                        if (!selectedCompany) {
                          setTimeout(() => setSelectedCompany(sampleCompanies[0].name), 0);
                        }
                        
                        return sampleCompanies.map((company, index) => (
                          <div
                            key={company.name}
                            className={`p-2 border border-gray-200 rounded cursor-pointer hover:border-blue-300 ${
                              selectedCompany === company.name ? 'border-blue-500 bg-blue-50' : 'bg-white'
                            }`}
                            onClick={() => setSelectedCompany(company.name)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="h-3 w-3 text-gray-400" />
                              <span className="font-medium text-xs text-gray-900">{company.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{company.type}</div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {company.contacts} contact{company.contacts !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-blue-600">
                                +{Math.floor(Math.random() * 3) + 1} suggested
                              </span>
                            </div>
                          </div>
                        ));
                      }

                      return Object.entries(groupedRecipients).map(([companyName, recipients]) => (
                        <div
                          key={companyName}
                          className={`p-2 border border-gray-200 rounded cursor-pointer hover:border-blue-300 ${
                            selectedCompany === companyName ? 'border-blue-500 bg-blue-50' : 'bg-white'
                          }`}
                          onClick={() => setSelectedCompany(companyName)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-xs text-gray-900">{companyName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            {recipients[0]?.industry || 'Technology'}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {recipients.length} contact{recipients.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs text-blue-600">
                              +3 suggested
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Right Content - Selected Company Details */}
                <div className="w-2/3 bg-white border border-gray-200 rounded-lg p-3 overflow-hidden flex flex-col">
                  {selectedCompany ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{selectedCompany}</h3>
                            <p className="text-xs text-gray-500">Technology</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-6">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3">
                        {/* Display contacts for selected company */}
                        {(() => {
                          const companyRecipients = campaignData.recipients.filter(r => 
                            (r.customer_name || r.partner_name || r.opportunity_title || 'Unknown Company') === selectedCompany
                          );

                          // Show sample contacts if no recipients exist
                          if (companyRecipients.length === 0 && selectedCompany) {
                            const sampleContacts = [
                              { name: "Sarah Johnson", email: "sarah.johnson@techcorp.com", title: "CEO", company: "TechCorp Inc." },
                              { name: "Michael Chen", email: "michael.chen@techcorp.com", title: "CTO", company: "TechCorp Inc." },
                              { name: "Jennifer Smith", email: "jennifer.smith@globalmanufacturing.com", title: "VP Operations", company: "Global Manufacturing Co." },
                              { name: "David Rodriguez", email: "david.rodriguez@startup.io", title: "Founder", company: "Startup.io" },
                              { name: "Emma Wilson", email: "emma.wilson@designstudio.com", title: "Creative Director", company: "Design Studio" },
                              { name: "Alex Thompson", email: "alex.thompson@fintech.com", title: "VP Product", company: "FinTech Solutions" }
                            ];

                            const relevantContacts = sampleContacts.filter(contact => 
                              contact.company === selectedCompany
                            );
                            
                            return relevantContacts.map((contact, index) => (
                              <div key={index} className="border-l-2 border-gray-200 pl-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-xs text-gray-900">{contact.name}</span>
                                      <Badge variant="secondary" className="text-xs h-4">active</Badge>
                                    </div>
                                    <div className="text-xs text-gray-500">{contact.email}</div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {campaignData.emails.length} email{campaignData.emails.length !== 1 ? 's' : ''}
                                  </div>
                                </div>

                                {/* Email sequence for this contact */}
                                <div className="space-y-2 mb-2">
                                  {campaignData.emails.map((email, emailIndex) => (
                                    <div key={emailIndex} className="bg-gray-50 rounded p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-medium text-gray-900">
                                            {emailIndex + 1}
                                          </span>
                                          <span className="text-xs font-medium text-gray-900">
                                            {email.subject || `Email ${emailIndex + 1} - Follow up`}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-xs h-4">
                                            {emailIndex === 0 ? 'sent' : 'draft'}
                                          </Badge>
                                          <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        {emailIndex === 0 ? 'Today' : `In ${emailIndex * 2} days`} • 10:00 AM
                                      </div>
                                      <div className="text-xs text-gray-700 line-clamp-2">
                                        {typeof email.blocks === 'string' ? 
                                          JSON.parse(email.blocks)[0]?.content || 'Email content preview...' :
                                          email.blocks?.[0]?.content || 'Email content preview...'
                                        }
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <Button size="sm" variant="outline" className="text-xs h-6 mb-3">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Email to Sequence
                                </Button>
                              </div>
                            ));
                          }

                          return companyRecipients.map((recipient, index) => (
                            <div key={recipient.id || index} className="border-l-2 border-gray-200 pl-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs text-gray-900">
                                      {recipient.contact_name || recipient.name || 'Contact'}
                                    </span>
                                    <Badge variant="secondary" className="text-xs h-4">active</Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {recipient.contact_email || recipient.email || 'email@example.com'}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  2 emails
                                </div>
                              </div>

                              {/* Email sequence for this contact */}
                              <div className="space-y-2 mb-2">
                                {campaignData.emails.map((email, emailIndex) => (
                                  <div key={emailIndex} className="bg-gray-50 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-900">
                                          {emailIndex + 1}
                                        </span>
                                        <span className="text-xs font-medium text-gray-900">
                                          {email.subject || 'Email Subject'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs h-4">
                                          {emailIndex === 0 ? 'sent' : 'draft'}
                                        </Badge>
                                        <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-1">
                                      {emailIndex === 0 ? '16/01/2024' : '18/01/2024'} • 10:00
                                    </div>
                                    <div className="text-xs text-gray-700 line-clamp-2">
                                      {typeof email.blocks === 'string' ? 
                                        JSON.parse(email.blocks)[0]?.content || 'Email content...' :
                                        email.blocks?.[0]?.content || 'Email content...'
                                      }
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Button size="sm" variant="outline" className="text-xs h-6 mb-3">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Email to Sequence
                              </Button>
                            </div>
                          ));
                        })()}

                        {/* Suggested Contacts Section */}
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Search className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-900">Additional Suggested Contacts</span>
                              <Badge variant="secondary" className="text-xs h-4">3 found</Badge>
                            </div>
                            <Button size="sm" variant="ghost" className="text-xs h-6">
                              Hide
                            </Button>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2">
                            We found these additional potential contacts for {selectedCompany}. Click to add them instantly.
                          </p>

                          <div className="space-y-1">
                            {[
                              {
                                name: "Robert Chen",
                                email: "robert.chen@globalmanufacturing.com",
                                title: "VP of Operations",
                                confidence: 95,
                                source: "LinkedIn"
                              },
                              {
                                name: "Maria Rodriguez",
                                email: "m.rodriguez@globalmanufacturing.com",
                                title: "Head of Procurement",
                                confidence: 88,
                                source: "Company Website"
                              },
                              {
                                name: "James Wilson",
                                email: "jwilson@globalmanufacturing.com",
                                title: "Director of Sales",
                                confidence: 92,
                                source: "Email Signature"
                              }
                            ].map((contact, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:border-blue-300 transition-colors">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs text-gray-900">{contact.name}</span>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs h-4 ${
                                        contact.confidence >= 90 ? 'bg-green-100 text-green-700' :
                                        contact.confidence >= 80 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {contact.confidence}% match
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500 mb-1">{contact.email}</div>
                                  <div className="text-xs text-gray-500">{contact.title}</div>
                                  <div className="text-xs text-gray-400">From {contact.source}</div>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs h-6">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a company</h3>
                        <p className="text-gray-500">Choose a company from the list to manage their contacts and email sequences.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
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
        <div className="max-w-6xl mx-auto px-6 py-2">
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
        <div className="max-w-6xl mx-auto px-6 py-2">
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
      <div className="max-w-6xl mx-auto px-6 py-2">
        {/* Navigation */}
        <div className="flex justify-between mb-2">
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