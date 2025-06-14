import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye } from "lucide-react";
import { useLocation } from 'wouter';

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
  category: 'campaign' | 'update';
}

interface EmailBlock {
  type: 'text' | 'heading' | 'quote' | 'divider';
  content: string;
}

export default function CampaignCreator() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    entity: '',
    name: '',
    description: '',
    objective: '',
    icon: '',
    emails: [{ 
      subject: '', 
      content: '',
      blocks: [] as EmailBlock[],
      leftLogo: '',
      rightLogo: ''
    }]
  });
  
  const [showPreview, setShowPreview] = useState(false);

  const updateBlockContent = (blockIndex: number, content: string) => {
    const newEmails = [...campaignData.emails];
    if (newEmails[0].blocks[blockIndex]) {
      newEmails[0].blocks[blockIndex].content = content;
      setCampaignData({ ...campaignData, emails: newEmails });
    }
  };

  const addBlock = (type: EmailBlock['type']) => {
    const newEmails = [...campaignData.emails];
    newEmails[0].blocks.push({ type, content: '' });
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const removeBlock = (blockIndex: number) => {
    const newEmails = [...campaignData.emails];
    newEmails[0].blocks.splice(blockIndex, 1);
    setCampaignData({ ...campaignData, emails: newEmails });
  };

  const entityOptions: EntityOption[] = [
    {
      id: 'opportunities',
      title: 'Opportunities',
      subtitle: 'Sales Campaign',
      description: 'Target specific sales opportunities with personalized outreach to close deals faster',
      icon: <Target className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-600',
      category: 'campaign'
    },
    {
      id: 'customers',
      title: 'Customers',
      subtitle: 'Customer Campaign',
      description: 'Engage existing customers with upsell, cross-sell, or retention campaigns',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-600',
      category: 'campaign'
    },
    {
      id: 'partners',
      title: 'Partners',
      subtitle: 'Partner Updates',
      description: 'Send business updates, announcements, and collaboration invites to partners',
      icon: <Send className="h-6 w-6" />,
      color: 'from-purple-500 to-violet-600',
      category: 'update'
    },
    {
      id: 'internal',
      title: 'Internal Team',
      subtitle: 'Internal Updates',
      description: 'Share company news, policy updates, and internal communications',
      icon: <Mail className="h-6 w-6" />,
      color: 'from-orange-500 to-red-600',
      category: 'update'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Choose Target',
      description: 'Select your audience and communication type',
      component: 'entity'
    },
    {
      number: 2,
      title: 'Template Details',
      description: 'Name, description and objectives',
      component: 'details'
    },
    {
      number: 3,
      title: 'Email Builder',
      description: 'Create your email template',
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Choose Your Communication Type</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Different audiences require different approaches. Select your target to get the right tools and templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entityOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                    campaignData.entity === option.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' 
                      : 'hover:border-border/60'
                  }`}
                  onClick={() => handleEntitySelect(option.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} text-white shadow-sm`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{option.title}</CardTitle>
                        <Badge 
                          variant={option.category === 'campaign' ? 'default' : 'secondary'}
                          className="mt-1 text-xs"
                        >
                          {option.subtitle}
                        </Badge>
                      </div>
                      {campaignData.entity === option.id && (
                        <div className="text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
                <Settings className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Template Configuration</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  placeholder={`e.g., ${entityOptions.find(opt => opt.id === campaignData.entity)?.title} Engagement Template`}
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description of this template's purpose..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Template Objective</label>
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Textarea
                    placeholder="What outcome should this template achieve? (e.g., 25% increase in engagement, introduce new services)"
                    value={campaignData.objective}
                    onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Template Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { id: 'target', icon: Target, color: 'from-blue-500 to-blue-600' },
                    { id: 'trending-up', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
                    { id: 'zap', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                    { id: 'star', icon: Star, color: 'from-purple-500 to-violet-600' },
                    { id: 'heart', icon: Heart, color: 'from-pink-500 to-rose-600' },
                    { id: 'gift', icon: Gift, color: 'from-red-500 to-pink-600' },
                    { id: 'megaphone', icon: Megaphone, color: 'from-indigo-500 to-blue-600' },
                    { id: 'coffee', icon: Coffee, color: 'from-amber-600 to-yellow-600' },
                    { id: 'briefcase', icon: Briefcase, color: 'from-gray-600 to-slate-700' },
                    { id: 'globe', icon: Globe, color: 'from-cyan-500 to-blue-500' },
                    { id: 'award', icon: Award, color: 'from-yellow-500 to-amber-600' },
                    { id: 'rocket', icon: Rocket, color: 'from-violet-500 to-purple-600' },
                    { id: 'shield', icon: Shield, color: 'from-emerald-500 to-green-600' },
                    { id: 'diamond', icon: Diamond, color: 'from-blue-400 to-cyan-500' },
                    { id: 'mail', icon: Mail, color: 'from-slate-500 to-gray-600' },
                    { id: 'sparkles', icon: Sparkles, color: 'from-pink-400 to-purple-500' }
                  ].map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setCampaignData({ ...campaignData, icon: iconOption.id })}
                        className={`relative p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                          campaignData.icon === iconOption.id 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : 'hover:shadow-md'
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${iconOption.color} rounded-lg flex items-center justify-center shadow-sm`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        {campaignData.icon === iconOption.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {campaignData.icon && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Icon selected for template tile</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
                <Mail className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Email Template Builder</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Subject Line</label>
                  <Input
                    placeholder="Enter subject with variables like {{name}} or {{company}}"
                    value={campaignData.emails[0].subject}
                    onChange={(e) => {
                      const newEmails = [...campaignData.emails];
                      newEmails[0].subject = e.target.value;
                      setCampaignData({ ...campaignData, emails: newEmails });
                    }}
                    className="h-11 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">&nbsp;</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-11 gap-2 mt-1"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Email Builder */}
                <div className="lg:col-span-8">
                  <div className="space-y-4">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                          <Image className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-600">Left Logo</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Right Logo</span>
                        <div className="w-12 h-12 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                          <Image className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email Content Builder */}
                    <div className="border rounded-lg bg-white min-h-[400px]">
                      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Email Content</h4>
                          <div className="text-sm text-gray-500">Press '/' for menu, select text to format</div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {campaignData.emails[0].blocks && campaignData.emails[0].blocks.length > 0 ? (
                          campaignData.emails[0].blocks.map((block, index) => (
                            <div key={index} className="group relative border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                              <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 w-6 p-0 bg-white border-red-200 hover:bg-red-50"
                                  onClick={() => removeBlock(index)}
                                >
                                  <Minus className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                              {block.type === 'text' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Type className="h-4 w-4" />
                                    Text Block
                                  </div>
                                  <Textarea
                                    placeholder="Enter your text content..."
                                    value={block.content || ''}
                                    onChange={(e) => updateBlockContent(index, e.target.value)}
                                    className="min-h-[80px] resize-none"
                                  />
                                </div>
                              )}
                              {block.type === 'heading' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <AlignLeft className="h-4 w-4" />
                                    Heading Block
                                  </div>
                                  <Input
                                    placeholder="Enter heading text..."
                                    value={block.content || ''}
                                    onChange={(e) => updateBlockContent(index, e.target.value)}
                                    className="font-semibold"
                                  />
                                </div>
                              )}
                              {block.type === 'quote' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Quote className="h-4 w-4" />
                                    Quote Block
                                  </div>
                                  <Textarea
                                    placeholder="Enter quote text..."
                                    value={block.content || ''}
                                    onChange={(e) => updateBlockContent(index, e.target.value)}
                                    className="min-h-[60px] resize-none italic"
                                  />
                                </div>
                              )}
                              {block.type === 'divider' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Minus className="h-4 w-4" />
                                    Divider Block
                                  </div>
                                  <hr className="border-gray-300" />
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">Add content blocks to build your email</p>
                            <p className="text-xs text-gray-400 mt-1">Use the blocks panel on the right to get started</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blocks Panel */}
                <div className="lg:col-span-4">
                  <div className="space-y-4">
                    {/* Content Blocks */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Content Blocks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { id: 'text' as const, icon: Type, label: 'Text', desc: 'Add paragraphs and content' },
                          { id: 'heading' as const, icon: AlignLeft, label: 'Heading', desc: 'Section titles' },
                          { id: 'quote' as const, icon: Quote, label: 'Quote', desc: 'Highlight important text' },
                          { id: 'divider' as const, icon: Minus, label: 'Divider', desc: 'Separate content sections' }
                        ].map(block => (
                          <button
                            key={block.id}
                            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                            onClick={() => addBlock(block.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <block.icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">{block.label}</div>
                                <div className="text-xs text-gray-500">{block.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Entity Variables */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Entity Variables</CardTitle>
                        <p className="text-xs text-gray-500">Click to insert into content</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { category: 'Contact', items: ['{{name}}', '{{email}}', '{{company}}', '{{phone}}'] },
                          { category: 'Products', items: ['{{product_names}}', '{{product_categories}}', '{{latest_product}}'] },
                          { category: 'OKR Metrics', items: ['{{metric_value}}', '{{metric_target}}', '{{metric_progress}}'] },
                          { category: 'Tasks', items: ['{{open_tasks}}', '{{completed_tasks}}', '{{due_tasks}}'] }
                        ].map(group => (
                          <div key={group.category} className="space-y-2">
                            <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">{group.category}</div>
                            <div className="grid grid-cols-1 gap-1">
                              {group.items.map(item => (
                                <button
                                  key={item}
                                  className="text-left text-xs px-2 py-1 bg-gray-100 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                  onClick={() => {
                                    // Logic to insert variable at cursor position
                                    console.log('Insert variable:', item);
                                  }}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-blue-800">Email Preview</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">
                          Subject: {campaignData.emails[0].subject || 'Your subject line will appear here...'}
                        </div>
                        <hr />
                        <div className="space-y-3">
                          {campaignData.emails[0].blocks && campaignData.emails[0].blocks.length > 0 ? (
                            campaignData.emails[0].blocks.map((block, index) => (
                              <div key={index}>
                                {block.type === 'text' && (
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {block.content || 'Text content will appear here...'}
                                  </p>
                                )}
                                {block.type === 'heading' && (
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {block.content || 'Heading will appear here...'}
                                  </h3>
                                )}
                                {block.type === 'quote' && (
                                  <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600">
                                    {block.content || 'Quote will appear here...'}
                                  </blockquote>
                                )}
                                {block.type === 'divider' && <hr className="my-4" />}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">Add content blocks to see preview</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleBack}>
                  <Settings className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button className="flex-1 gap-2" onClick={handleBack}>
                  <Check className="h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create Template</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{Math.round(progress)}% Complete</div>
              <Progress value={progress} className="w-32 h-2 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="space-y-2">
            {steps.map((step) => (
              <div 
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                className={isStepAccessible(step.number) ? 'cursor-pointer' : 'cursor-not-allowed'}
              >
                <StepIndicator
                  stepNumber={step.number}
                  title={step.title}
                  description={step.description}
                  isActive={currentStep === step.number}
                  isCompleted={isStepCompleted(step.number)}
                  isAccessible={isStepAccessible(step.number)}
                />
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={currentStep === totalSteps ? handleBack : handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                {currentStep === totalSteps ? 'Save Template' : 'Next'}
                {currentStep === totalSteps ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}