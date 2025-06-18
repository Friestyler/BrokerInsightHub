import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading, Sun, Car, Calendar, Building2 } from "lucide-react";
import { useLocation } from 'wouter';
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
        isActive ? 'text-foreground' : !isAccessible ? 'text-muted-foreground/60' : 'text-muted-foreground'
      }`}>
        {title}
      </div>
      <div className={`text-xs mt-1 ${
        !isAccessible ? 'text-muted-foreground/40' : 'text-muted-foreground'
      }`}>
        {description}
      </div>
      {!isAccessible && !isCompleted && (
        <div className="text-xs text-orange-600 mt-1 font-medium">
          Complete previous steps first
        </div>
      )}
    </div>
  </div>
);

interface EntityOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  category: 'campaign' | 'update';
}

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'quote' | 'divider' | 'image' | 'button' | 'spacer' | 'ai';
  content: string;
  properties?: {
    alignment?: 'left' | 'center' | 'right';
    fontSize?: 'small' | 'medium' | 'large';
    color?: string;
    backgroundColor?: string;
    url?: string;
    buttonText?: string;
    imageUrl?: string;
    imageAlt?: string;
    spacerHeight?: number;
    aiType?: string;
  };
}

export default function CampaignTemplateCreator() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Extract URL parameters for editing
  const urlParams = new URLSearchParams(window.location.search);
  const editTemplateId = urlParams.get('edit');
  const isEditMode = !!editTemplateId;
  
  console.log('CampaignCreator URL Debug:', {
    location,
    windowSearch: window.location.search,
    editTemplateId,
    isEditMode
  });
  
  const [campaignData, setCampaignData] = useState({
    entity: '',
    name: '',
    description: '',
    objective: '',
    icon: 'mail',
    attachments: [] as Array<{id: string, name: string, type: string, size: number}>,
    emails: [{ 
      id: '1',
      subject: '', 
      blocks: [] as EmailBlock[],
      followUpDays: 0,
      leftLogo: null,
      rightLogo: null
    }]
  });
  
  const [showPreview, setShowPreview] = useState(false);

  // Load existing template data for editing
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/campaign-templates/${editTemplateId}`],
    enabled: isEditMode && !!editTemplateId
  });

  // Load template data into form when available
  useEffect(() => {
    if (templateData && isEditMode) {
      console.log('Loading template data for editing:', templateData);
      
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

      setCampaignData({
        entity: templateData.entity || '',
        name: templateData.name || '',
        description: templateData.description || '',
        objective: templateData.objective || '',
        icon: templateData.icon || '',
        attachments: templateData.attachments || [],
        emails: emails
      });
      
      console.log('Campaign data set for editing:', { 
        entity: templateData.entity,
        name: templateData.name,
        emailCount: emails.length,
        firstEmailBlocks: emails[0]?.blocks?.length
      });
    }
  }, [templateData, isEditMode]);

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (templateData: any) => {
      console.log('Template save mutation called with data:', templateData);
      
      // Validate required fields
      if (!templateData.name || !templateData.entity || !templateData.emails || !Array.isArray(templateData.emails)) {
        throw new Error('Missing required fields: name, entity, and emails array');
      }
      
      // Validate emails have content
      if (templateData.emails.length === 0) {
        throw new Error('At least one email is required');
      }
      
      // Get current environment
      const envId = window.localStorage.getItem('environment') || 'degoudse';
      
      if (isEditMode && editTemplateId) {
        // Update existing template
        const url = `/api/${envId}/campaign-templates/${editTemplateId}`;
        console.log('Making API request to update template:', url, templateData);
        return apiRequest('PUT', url, templateData);
      } else {
        // Create new template
        const url = `/api/${envId}/campaign-templates`;
        console.log('Making API request to create template:', url, templateData);
        return apiRequest('POST', url, templateData);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Template updated successfully" : "Template saved successfully",
        description: isEditMode 
          ? "Your changes have been saved and the template has been updated."
          : "Your campaign template has been saved and is now available in the templates library.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/campaign-templates/${editTemplateId}`] });
      }
      setLocation('/campaigns/templates');
    },
    onError: (error: any) => {
      console.error('Template save error:', error);
      toast({
        title: "Error saving template",
        description: error.message || "Failed to save template. Please check your data and try again.",
        variant: "destructive",
      });
    }
  });

  // AI content generation function
  const generateAIContent = (entityType: string, blockType: string): string => {
    const entityMap = {
      'opportunities': 'sales opportunities',
      'customers': 'existing customers', 
      'partners': 'business partners',
      'internal': 'internal team'
    };
    
    const entityName = entityMap[entityType as keyof typeof entityMap] || 'contacts';
    
    const contentTemplates = {
      'highlights': `Great news to share with our ${entityName}! We've achieved significant milestones this quarter that demonstrate our continued growth and success.`,
      'lowlights': `We want to be transparent about some challenges we've faced recently. While these areas need improvement, we're committed to addressing them.`,
      'product-launches': `We're excited to announce new product developments that will benefit our ${entityName}. These innovations represent our commitment to excellence.`,
      'kpis': `Here's a summary of our key performance indicators for this period. These metrics show our progress toward our shared goals.`,
      'fundraising': `We have important updates regarding our funding and investment activities that will strengthen our partnership.`,
      'team': `We're growing our team with talented individuals who share our vision and commitment to serving our ${entityName}.`,
      'asks': `We'd like to request your support in several areas where your expertise and partnership can make a meaningful difference.`
    };
    
    return contentTemplates[blockType as keyof typeof contentTemplates] || `Content for ${entityName} regarding ${blockType}.`;
  };

  // Email management functions
  const generateBlockId = () => Math.random().toString(36).substr(2, 9);

  const updateBlockContent = (blockIndex: number, content: string) => {
    const newEmails = [...campaignData.emails];
    if (newEmails[activeEmailIndex].blocks[blockIndex]) {
      newEmails[activeEmailIndex].blocks[blockIndex].content = content;
      setCampaignData({ ...campaignData, emails: newEmails });
    }
  };

  const updateBlockProperties = (blockIndex: number, properties: EmailBlock['properties']) => {
    const newEmails = [...campaignData.emails];
    if (newEmails[activeEmailIndex].blocks[blockIndex]) {
      newEmails[activeEmailIndex].blocks[blockIndex].properties = {
        ...newEmails[activeEmailIndex].blocks[blockIndex].properties,
        ...properties
      };
      setCampaignData({ ...campaignData, emails: newEmails });
    }
  };

  const addBlock = (type: EmailBlock['type']) => {
    const newEmails = [...campaignData.emails];
    const newBlock: EmailBlock = {
      id: generateBlockId(),
      type,
      content: '',
      properties: {}
    };
    newEmails[activeEmailIndex].blocks.push(newBlock);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const removeBlock = (blockIndex: number) => {
    const newEmails = [...campaignData.emails];
    newEmails[activeEmailIndex].blocks.splice(blockIndex, 1);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newEmails = [...campaignData.emails];
    const blocks = newEmails[activeEmailIndex].blocks;
    const [removed] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, removed);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const addNewEmail = () => {
    const newEmails = [...campaignData.emails];
    newEmails.push({
      id: (newEmails.length + 1).toString(),
      subject: '',
      blocks: [],
      followUpDays: 7,
      leftLogo: null,
      rightLogo: null
    });
    setCampaignData({ ...campaignData, emails: newEmails });
    setActiveEmailIndex(newEmails.length - 1);
  };

  const duplicateEmail = (emailIndex: number) => {
    const newEmails = [...campaignData.emails];
    const emailToDuplicate = { ...newEmails[emailIndex] };
    emailToDuplicate.id = (newEmails.length + 1).toString();
    emailToDuplicate.subject = `${emailToDuplicate.subject} (Copy)`;
    newEmails.push(emailToDuplicate);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const deleteEmail = (emailIndex: number) => {
    if (campaignData.emails.length > 1) {
      const newEmails = [...campaignData.emails];
      newEmails.splice(emailIndex, 1);
      setCampaignData({ ...campaignData, emails: newEmails });
      if (activeEmailIndex >= newEmails.length) {
        setActiveEmailIndex(newEmails.length - 1);
      }
    }
  };

  const entityOptions: EntityOption[] = [
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
  ];

  // Dynamic step descriptions based on user selections
  const getStepDescription = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        if (campaignData.entity) {
          const selectedEntity = entityOptions.find(opt => opt.id === campaignData.entity);
          return `Selected: ${selectedEntity?.title}`;
        }
        return 'Select your target audience';
      case 2:
        if (campaignData.name) {
          return `Template: ${campaignData.name}`;
        }
        return 'Configure template settings';
      case 3:
        if (campaignData.emails[0].subject) {
          return `Subject: ${campaignData.emails[0].subject.substring(0, 30)}${campaignData.emails[0].subject.length > 30 ? '...' : ''}`;
        }
        return 'Create email content';
      default:
        return '';
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Choose Target Group',
      description: getStepDescription(1),
      component: 'entity'
    },
    {
      number: 2,
      title: 'Template Details',
      description: getStepDescription(2),
      component: 'details'
    },
    {
      number: 3,
      title: 'Flow Builder',
      description: getStepDescription(3),
      component: 'builder'
    }
  ];

  const totalSteps = steps.length;
  
  // Calculate progress based on step completion and target group selection
  const calculateProgress = () => {
    if (currentStep === 1) {
      // Step 1: Show 0% if no target group selected, 33% if selected
      return campaignData.entity ? 33 : 0;
    } else {
      // For other steps, use normal step-based calculation
      return (currentStep / totalSteps) * 100;
    }
  };
  
  const progress = calculateProgress();

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
    setLocation('/campaigns');
  };

  const handleSaveTemplate = () => {
    console.log('handleSaveTemplate called');
    console.log('Campaign data:', campaignData);
    
    const templateData = {
      name: campaignData.name,
      description: campaignData.description,
      objective: campaignData.objective,
      entity: campaignData.entity,
      status: 'published',
      emails: campaignData.emails.map(email => ({
        subject: email.subject,
        content: JSON.stringify(email.blocks),
        followUpDays: email.followUpDays || 0
      })),
      attachments: campaignData.attachments,
      icon: campaignData.icon
    };

    console.log('Template data to be saved:', templateData);
    saveTemplateMutation.mutate(templateData);
  };

  const isStepCompleted = (stepNum: number): boolean => {
    if (stepNum === 1) return Boolean(campaignData.entity);
    if (stepNum === 2) return Boolean(campaignData.name && campaignData.icon);
    if (stepNum === 3) {
      // Check if we have a subject for the first email - blocks are optional for basic validation
      const firstEmail = campaignData.emails[0];
      return Boolean(firstEmail && firstEmail.subject && firstEmail.subject.trim());
    }
    return stepNum < currentStep;
  };

  const isStepAccessible = (stepNum: number): boolean => {
    // In edit mode, all steps are accessible for navigation
    if (isEditMode) return true;
    
    // In create mode, follow the original validation flow
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStepCompleted(1);
    if (stepNum === 3) return isStepCompleted(2);
    return false;
  };

  const canProceed = (): boolean => {
    return Boolean(isStepCompleted(currentStep));
  };

  const handleEntitySelect = (entityId: string) => {
    setCampaignData({ ...campaignData, entity: entityId });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mt-8">
              <p className="text-gray-600 text-left text-[14px] font-normal">Select the type of audience you want to create a template for</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {entityOptions.map((option) => {
                const isSelected = campaignData.entity === option.id;
                
                // Define modern color schemes for each entity type
                const getEntityStyles = (entityId: string, selected: boolean) => {
                  const baseStyles = {
                    card: selected 
                      ? 'border-2 shadow-lg transform scale-105' 
                      : 'border border-gray-200 hover:border-gray-300 hover:shadow-md',
                    transition: 'transition-all duration-200 ease-in-out'
                  };

                  switch (entityId) {
                    case 'opportunities':
                      return {
                        ...baseStyles,
                        card: selected 
                          ? 'border-2 border-green-400 shadow-green-100 shadow-lg transform scale-105 bg-white' 
                          : 'border border-gray-200 hover:border-green-200 hover:shadow-md hover:shadow-green-50 bg-white',
                        iconBg: selected ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-100',
                        iconColor: selected ? 'text-white' : 'text-gray-400',
                        title: selected ? 'text-green-900' : 'text-gray-800',
                        subtitle: selected ? 'text-green-600' : 'text-gray-500',
                        checkmark: 'bg-green-500'
                      };
                    case 'customers':
                      return {
                        ...baseStyles,
                        card: selected 
                          ? 'border-2 border-blue-400 shadow-blue-100 shadow-lg transform scale-105 bg-white' 
                          : 'border border-gray-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 bg-white',
                        iconBg: selected ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-100',
                        iconColor: selected ? 'text-white' : 'text-gray-400',
                        title: selected ? 'text-blue-900' : 'text-gray-800',
                        subtitle: selected ? 'text-blue-600' : 'text-gray-500',
                        checkmark: 'bg-blue-500'
                      };
                    case 'partners':
                      return {
                        ...baseStyles,
                        card: selected 
                          ? 'border-2 border-purple-400 shadow-purple-100 shadow-lg transform scale-105 bg-white' 
                          : 'border border-gray-200 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50 bg-white',
                        iconBg: selected ? 'bg-gradient-to-br from-purple-500 to-violet-600' : 'bg-gray-100',
                        iconColor: selected ? 'text-white' : 'text-gray-400',
                        title: selected ? 'text-purple-900' : 'text-gray-800',
                        subtitle: selected ? 'text-purple-600' : 'text-gray-500',
                        checkmark: 'bg-purple-500'
                      };
                    case 'internal':
                      return {
                        ...baseStyles,
                        card: selected 
                          ? 'border-2 border-orange-400 shadow-orange-100 shadow-lg transform scale-105 bg-white' 
                          : 'border border-gray-200 hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 bg-white',
                        iconBg: selected ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gray-100',
                        iconColor: selected ? 'text-white' : 'text-gray-400',
                        title: selected ? 'text-orange-900' : 'text-gray-800',
                        subtitle: selected ? 'text-orange-600' : 'text-gray-500',
                        checkmark: 'bg-orange-500'
                      };
                    default:
                      return {
                        ...baseStyles,
                        card: selected 
                          ? 'border-2 border-gray-400 shadow-gray-100 shadow-lg transform scale-105 bg-white' 
                          : 'border border-gray-200 hover:border-gray-300 hover:shadow-md bg-white',
                        iconBg: selected ? 'bg-gradient-to-br from-gray-500 to-gray-600' : 'bg-gray-100',
                        iconColor: selected ? 'text-white' : 'text-gray-400',
                        title: selected ? 'text-gray-900' : 'text-gray-800',
                        subtitle: selected ? 'text-gray-600' : 'text-gray-500',
                        checkmark: 'bg-gray-500'
                      };
                  }
                };

                const styles = getEntityStyles(option.id, isSelected);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleEntitySelect(option.id)}
                    className={`relative p-6 rounded-2xl text-center cursor-pointer group ${styles.card} ${styles.transition}`}
                  >
                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${styles.checkmark}`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${styles.iconBg} group-hover:scale-110`}>
                      <div className={`transition-colors duration-300 ${styles.iconColor}`}>
                        {option.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className={`font-semibold text-lg transition-colors duration-300 ${styles.title}`}>
                        {option.title}
                      </h3>
                      <p className={`text-sm font-medium transition-colors duration-300 ${styles.subtitle}`}>
                        {option.subtitle}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed px-2">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mt-8">
              <p className="text-gray-600 text-left text-[14px]">Configure your template settings</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <Label className="block mb-2">Template Name</Label>
                <Input
                  placeholder={`${entityOptions.find(opt => opt.id === campaignData.entity)?.title} Template`}
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Description</Label>
                <Textarea
                  placeholder="Brief description of this template's purpose..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label className="block mb-2">Template Objective</Label>
                <Textarea
                  placeholder="What outcome should this template achieve?"
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label className="block mb-3">Choose Icon</Label>
                <div className="grid grid-cols-8 gap-3">
                  {[
                    { id: 'heart', icon: Heart, color: 'bg-pink-500' },
                    { id: 'building2', icon: Building2, color: 'bg-purple-500' },
                    { id: 'sun', icon: Sun, color: 'bg-orange-500' },
                    { id: 'car', icon: Car, color: 'bg-blue-500' },
                    { id: 'calendar', icon: Calendar, color: 'bg-green-500' },
                    { id: 'shield', icon: Shield, color: 'bg-indigo-500' },
                    { id: 'star', icon: Star, color: 'bg-purple-500' },
                    { id: 'mail', icon: Mail, color: 'bg-gray-500' }
                  ].map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setCampaignData({ ...campaignData, icon: iconOption.id })}
                        className={`relative p-3 rounded-lg transition-all duration-200 ${
                          campaignData.icon === iconOption.id 
                            ? 'ring-2 ring-[#5567E5]' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 ${iconOption.color} rounded flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        {campaignData.icon === iconOption.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5567E5] rounded-full flex items-center justify-center">
                            <Check className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mt-8">
              <p className="text-gray-600 text-left text-[14px]">Design your email sequence</p>
            </div>
            <ImprovedFlowBuilder
              emails={campaignData.emails}
              activeEmailIndex={activeEmailIndex}
              entityType={campaignData.entity}
              onEmailsChange={(newEmails: any[]) => setCampaignData({ ...campaignData, emails: newEmails })}
              onActiveEmailChange={setActiveEmailIndex}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Helper functions

  // Show loading state when fetching template data
  if (isEditMode && templateLoading) {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E6E7F1' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  Create Campaign Template
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditMode ? 'Make changes and save when ready' : `${Math.round(progress)}% Complete`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Steps Progress */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E6E7F1' }}>
        <div className="max-w-6xl mx-auto px-6 py-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex justify-between items-start relative">
            {/* Connecting Line Background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ marginLeft: '4rem', marginRight: '4rem' }} />
            
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
                {/* Step Circle */}
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all cursor-pointer relative ${
                    isStepCompleted(step.number) 
                      ? 'bg-[#5567E5] text-white hover:bg-[#4956D4]' 
                      : currentStep === step.number 
                        ? 'bg-[#F5F6FE] text-[#5567E5] ring-4 ring-[#E8EAFD]' 
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
                    currentStep === step.number ? 'text-[#5567E5]' : 'text-gray-900'
                  }`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
            
            {/* Progress Line */}
            <div 
              className="absolute top-4 left-0 h-0.5 bg-[#5567E5] z-5 transition-all duration-300"
              style={{ 
                marginLeft: '4rem',
                width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 8rem + ${((currentStep - 1) / (steps.length - 1)) * 8}rem)`
              }}
            />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-4">
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
            Back
          </Button>
          
          <div className="flex gap-3">
            {isEditMode && (
              <Button
                onClick={handleSaveTemplate}
                disabled={saveTemplateMutation.isPending}
                variant="outline"
                className="gap-2 border-[#5567E5] text-[#5567E5] hover:bg-[#F5F6FE]"
              >
                {saveTemplateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            
            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 bg-[#5567E5] hover:bg-[#4956D4]"
              >
                Continue to {steps.find(s => s.number === currentStep + 1)?.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {currentStep === totalSteps && !isEditMode && (
              <Button
                onClick={handleSaveTemplate}
                disabled={!canProceed() || saveTemplateMutation.isPending}
                className="gap-2 bg-[#5567E5] hover:bg-[#4956D4]"
              >
                {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
