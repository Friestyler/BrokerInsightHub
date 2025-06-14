import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading } from "lucide-react";
import { useLocation } from 'wouter';
import EnhancedEmailBuilder from './EnhancedEmailBuilder';

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  stepNumber: number;
  title: string;
  description: string;
}

const StepIndicator = ({ isActive, isCompleted, isAccessible, stepNumber, title, description }: StepProps) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
    !isAccessible 
      ? 'bg-muted/30 border-muted cursor-not-allowed opacity-60' 
      : isActive 
        ? 'bg-blue-50 border-blue-200 shadow-sm' 
        : isCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-card border-border hover:border-border/80'
  }`}>
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
  type: 'text' | 'heading' | 'quote' | 'divider' | 'image' | 'button' | 'spacer';
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
  };
}

export default function CampaignCreator() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  
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
      preheader: '',
      blocks: [] as EmailBlock[],
      followUpDays: 0,
      leftLogo: '',
      rightLogo: ''
    }]
  });
  
  const [showPreview, setShowPreview] = useState(false);

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
      preheader: '',
      blocks: [],
      followUpDays: 7,
      leftLogo: '',
      rightLogo: ''
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

  const isStepCompleted = (stepNum: number): boolean => {
    if (stepNum === 1) return Boolean(campaignData.entity);
    if (stepNum === 2) return Boolean(campaignData.name && campaignData.description && campaignData.objective && campaignData.icon);
    if (stepNum === 3) return Boolean(campaignData.emails[0].subject && campaignData.emails[0].blocks && campaignData.emails[0].blocks.length > 0);
    return stepNum < currentStep;
  };

  const isStepAccessible = (stepNum: number): boolean => {
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
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Choose Target Group</h2>
              <p className="text-gray-600">Select the type of audience you want to create a template for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {entityOptions.map((option) => {
                const isSelected = campaignData.entity === option.id;
                
                // Define specific color classes for each entity type
                const getEntityStyles = (entityId: string, selected: boolean) => {
                  switch (entityId) {
                    case 'opportunities':
                      return {
                        border: selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300',
                        bg: selected ? 'bg-green-50' : 'hover:bg-green-25',
                        text: selected ? 'text-green-900' : 'text-gray-900 hover:text-green-800',
                        subtitle: selected ? 'text-green-600' : 'text-gray-500 hover:text-green-600',
                        checkBg: 'bg-green-500'
                      };
                    case 'customers':
                      return {
                        border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
                        bg: selected ? 'bg-blue-50' : 'hover:bg-blue-25',
                        text: selected ? 'text-blue-900' : 'text-gray-900 hover:text-blue-800',
                        subtitle: selected ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600',
                        checkBg: 'bg-blue-500'
                      };
                    case 'partners':
                      return {
                        border: selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300',
                        bg: selected ? 'bg-purple-50' : 'hover:bg-purple-25',
                        text: selected ? 'text-purple-900' : 'text-gray-900 hover:text-purple-800',
                        subtitle: selected ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600',
                        checkBg: 'bg-purple-500'
                      };
                    case 'internal':
                      return {
                        border: selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300',
                        bg: selected ? 'bg-orange-50' : 'hover:bg-orange-25',
                        text: selected ? 'text-orange-900' : 'text-gray-900 hover:text-orange-800',
                        subtitle: selected ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600',
                        checkBg: 'bg-orange-500'
                      };
                    default:
                      return {
                        border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
                        bg: selected ? 'bg-blue-50' : 'hover:bg-blue-25',
                        text: selected ? 'text-blue-900' : 'text-gray-900 hover:text-blue-800',
                        subtitle: selected ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600',
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
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center transition-all duration-300 ${
                      isSelected ? 'shadow-md' : 'group-hover:shadow-sm'
                    }`}>
                      <div className="text-white">
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Email Builder</h2>
              <p className="text-gray-600">Create your email template with dynamic content</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Email Builder */}
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <Input
                    placeholder="Enter email subject..."
                    value={campaignData.emails[0].subject}
                    onChange={(e) => updateEmailSubject(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                  <div className="border rounded-lg bg-white min-h-[400px] p-6">
                    {campaignData.emails[0].blocks.map((block, index) => (
                      <div key={index} className="group relative mb-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmailBlock(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        
                        {block.type === 'text' && (
                          <Textarea
                            value={block.content}
                            onChange={(e) => updateEmailBlock(index, 'content', e.target.value)}
                            placeholder="Enter paragraph text..."
                            className="border-none p-0 resize-none min-h-[80px] focus:ring-0"
                          />
                        )}
                        {block.type === 'heading' && (
                          <Input
                            value={block.content}
                            onChange={(e) => updateEmailBlock(index, 'content', e.target.value)}
                            placeholder="Enter heading..."
                            className="border-none p-0 text-lg font-semibold focus:ring-0"
                          />
                        )}
                        {block.type === 'quote' && (
                          <div className="border-l-4 border-blue-500 pl-4">
                            <Textarea
                              value={block.content}
                              onChange={(e) => updateEmailBlock(index, 'content', e.target.value)}
                              placeholder="Enter quote..."
                              className="border-none p-0 resize-none min-h-[80px] italic focus:ring-0"
                            />
                          </div>
                        )}
                        {block.type === 'divider' && (
                          <div className="w-full h-px bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                    
                    {campaignData.emails[0].blocks.length === 0 && (
                      <div className="text-center py-16 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Add content blocks to build your email</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Tools */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Content</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'text', icon: Type, label: 'Text' },
                      { type: 'heading', icon: Heading, label: 'Heading' },
                      { type: 'quote', icon: Quote, label: 'Quote' },
                      { type: 'divider', icon: Minus, label: 'Divider' }
                    ].map((blockType) => {
                      const IconComponent = blockType.icon;
                      return (
                        <Button
                          key={blockType.type}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => addEmailBlock(blockType.type as EmailBlock['type'])}
                        >
                          <IconComponent className="h-4 w-4" />
                          {blockType.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Dynamic Fields</h3>
                  <div className="space-y-1 text-xs">
                    {['name', 'email', 'company', 'phone', 'product_names', 'total_value'].map((field) => (
                      <div
                        key={field}
                        className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => copyToClipboard(`{{${field}}}`)}
                      >
                        <code>{'{{' + field + '}}'}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Helper functions
  const updateEmailSubject = (subject: string) => {
    const newEmails = [...campaignData.emails];
    newEmails[0].subject = subject;
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const updateEmailBlock = (index: number, field: string, value: string) => {
    const newEmails = [...campaignData.emails];
    const newBlocks = [...newEmails[0].blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    newEmails[0].blocks = newBlocks;
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const addEmailBlock = (type: EmailBlock['type']) => {
    const newEmails = [...campaignData.emails];
    const newBlock: EmailBlock = { 
      id: generateBlockId(),
      type, 
      content: '',
      properties: {}
    };
    newEmails[0].blocks = [...newEmails[0].blocks, newBlock];
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const removeEmailBlock = (index: number) => {
    const newEmails = [...campaignData.emails];
    newEmails[0].blocks = newEmails[0].blocks.filter((_, i) => i !== index);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
                <h1 className="text-lg font-medium text-gray-900">Step {currentStep} of {totalSteps}</h1>
                <p className="text-sm text-gray-600">{Math.round(progress)}% Complete</p>
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
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    isStepCompleted(step.number) 
                      ? 'bg-blue-600 text-white' 
                      : currentStep === step.number 
                        ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {renderStepContent()}
        </div>

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
          
          <Button
            onClick={currentStep === totalSteps ? handleBack : handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === totalSteps ? 'Save Template' : 'Continue to ' + steps.find(s => s.number === currentStep + 1)?.title}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
