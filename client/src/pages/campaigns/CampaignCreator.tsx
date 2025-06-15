import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading } from "lucide-react";
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

export default function CampaignCreator() {
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
    icon: '',
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
      // Get current environment
      const envId = window.localStorage.getItem('environment') || 'degoudse';
      
      if (isEditMode && editTemplateId) {
        // Update existing template
        const url = `/api/${envId}/campaign-templates/${editTemplateId}`;
        console.log('Making API request to update template:', url);
        return apiRequest('PUT', url, templateData);
      } else {
        // Create new template
        const url = `/api/${envId}/campaign-templates`;
        console.log('Making API request to create template:', url);
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
      toast({
        title: "Error saving template",
        description: error.message || "Failed to save template. Please try again.",
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
      title: 'Email Builder',
      description: getStepDescription(3),
      component: 'builder'
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
    if (stepNum === 2) return Boolean(campaignData.name && campaignData.description && campaignData.objective && campaignData.icon);
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
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-900 mb-3">Choose Target Group</h2>
              <p className="text-gray-600 text-lg">Select the type of audience you want to create a template for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {entityOptions.map((option) => {
                const isSelected = campaignData.entity === option.id;
                
                // Define specific color classes for each entity type - grey by default, colors on hover/select
                const getEntityStyles = (entityId: string, selected: boolean) => {
                  switch (entityId) {
                    case 'opportunities':
                      return {
                        border: selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300',
                        bg: selected ? 'bg-green-50' : 'bg-gray-50 hover:bg-green-50',
                        text: selected ? 'text-green-900' : 'text-gray-600 hover:text-green-800',
                        subtitle: selected ? 'text-green-600' : 'text-gray-500 hover:text-green-600',
                        icon: selected ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600',
                        iconText: selected ? 'text-white' : 'text-gray-400 hover:text-white',
                        checkBg: 'bg-green-500'
                      };
                    case 'customers':
                      return {
                        border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
                        bg: selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-blue-50',
                        text: selected ? 'text-blue-900' : 'text-gray-600 hover:text-blue-800',
                        subtitle: selected ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600',
                        icon: selected ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600',
                        iconText: selected ? 'text-white' : 'text-gray-400 hover:text-white',
                        checkBg: 'bg-blue-500'
                      };
                    case 'partners':
                      return {
                        border: selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300',
                        bg: selected ? 'bg-purple-50' : 'bg-gray-50 hover:bg-purple-50',
                        text: selected ? 'text-purple-900' : 'text-gray-600 hover:text-purple-800',
                        subtitle: selected ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600',
                        icon: selected ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-gray-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-600',
                        iconText: selected ? 'text-white' : 'text-gray-400 hover:text-white',
                        checkBg: 'bg-purple-500'
                      };
                    case 'internal':
                      return {
                        border: selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300',
                        bg: selected ? 'bg-orange-50' : 'bg-gray-50 hover:bg-orange-50',
                        text: selected ? 'text-orange-900' : 'text-gray-600 hover:text-orange-800',
                        subtitle: selected ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600',
                        icon: selected ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-200 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600',
                        iconText: selected ? 'text-white' : 'text-gray-400 hover:text-white',
                        checkBg: 'bg-orange-500'
                      };
                    default:
                      return {
                        border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
                        bg: selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-blue-50',
                        text: selected ? 'text-blue-900' : 'text-gray-600 hover:text-blue-800',
                        subtitle: selected ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600',
                        icon: selected ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600',
                        iconText: selected ? 'text-white' : 'text-gray-400 hover:text-white',
                        checkBg: 'bg-blue-500'
                      };
                  }
                };

                const styles = getEntityStyles(option.id, isSelected);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setCampaignData({ ...campaignData, entity: option.id })}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-center transform ${
                      styles.border
                    } ${styles.bg} ${
                      isSelected ? 'shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      styles.icon
                    } ${
                      isSelected ? 'shadow-md' : 'group-hover:shadow-sm'
                    }`}>
                      <div className={`transition-colors duration-300 ${styles.iconText}`}>
                        {option.icon}
                      </div>
                    </div>
                    <h3 className={`font-medium mb-1 transition-colors duration-200 ${styles.text}`}>
                      {option.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-200 ${styles.subtitle}`}>
                      {option.subtitle}
                    </p>
                    
                    {isSelected && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 ${styles.checkBg} rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200`}>
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {campaignData.entity && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {entityOptions.find(opt => opt.id === campaignData.entity)?.title} selected
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 2:
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
                  placeholder={`${entityOptions.find(opt => opt.id === campaignData.entity)?.title} Template`}
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  placeholder="Brief description of this template's purpose..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Objective</label>
                <Textarea
                  placeholder="What outcome should this template achieve?"
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Icon</label>
                <div className="grid grid-cols-8 gap-3">
                  {[
                    { id: 'target', icon: Target, color: 'bg-blue-500' },
                    { id: 'trending-up', icon: TrendingUp, color: 'bg-green-500' },
                    { id: 'zap', icon: Zap, color: 'bg-yellow-500' },
                    { id: 'star', icon: Star, color: 'bg-purple-500' },
                    { id: 'heart', icon: Heart, color: 'bg-pink-500' },
                    { id: 'gift', icon: Gift, color: 'bg-red-500' },
                    { id: 'mail', icon: Mail, color: 'bg-gray-500' },
                    { id: 'rocket', icon: Rocket, color: 'bg-indigo-500' }
                  ].map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setCampaignData({ ...campaignData, icon: iconOption.id })}
                        className={`relative p-3 rounded-lg transition-all duration-200 ${
                          campaignData.icon === iconOption.id 
                            ? 'ring-2 ring-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 ${iconOption.color} rounded flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        {campaignData.icon === iconOption.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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
          <ImprovedFlowBuilder
            emails={campaignData.emails}
            activeEmailIndex={activeEmailIndex}
            entityType={campaignData.entity}
            onEmailsChange={(newEmails: any[]) => setCampaignData({ ...campaignData, emails: newEmails })}
            onActiveEmailChange={setActiveEmailIndex}
          />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  {isEditMode ? `Edit Template: ${campaignData.name || 'Untitled'}` : `Step ${currentStep} of ${totalSteps}`}
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
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all cursor-pointer ${
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
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isStepCompleted(step.number) ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep === step.number ? 'text-blue-600' : 'text-gray-900'
                  }`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
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
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {saveTemplateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            
            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Continue to {steps.find(s => s.number === currentStep + 1)?.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {currentStep === totalSteps && !isEditMode && (
              <Button
                onClick={handleSaveTemplate}
                disabled={!canProceed() || saveTemplateMutation.isPending}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
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
