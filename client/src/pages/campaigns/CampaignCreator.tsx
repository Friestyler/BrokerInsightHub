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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Choose Entity Type</h2>
              <p className="text-gray-600">Select the type of data you want to create a template for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {entityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCampaignData({ ...campaignData, entity: option.id })}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-md ${
                    campaignData.entity === option.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg ${option.color} flex items-center justify-center`}>
                    {option.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.subtitle}</p>
                  
                  {campaignData.entity === option.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
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
            
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex gap-4">
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
                    className="h-12 mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">&nbsp;</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-12 gap-2 mt-2"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
                {/* Email Builder */}
                <div className="lg:col-span-2 flex flex-col">
                  <div className="flex-1 flex flex-col space-y-6">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Left Logo</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">Right Logo</span>
                        <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email Content Builder */}
                    <div className="flex-1 border rounded-lg bg-white min-h-[500px] flex flex-col">
                      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Email Content</h4>
                          <div className="text-sm text-gray-500">Press '/' for menu, select text to format</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {campaignData.emails[0].blocks && campaignData.emails[0].blocks.length > 0 ? (
                          campaignData.emails[0].blocks.map((block, index) => (
                            <div key={index} className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
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
                          <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">Add content blocks to build your email</p>
                              <p className="text-sm text-gray-400 mt-2">Use the blocks panel on the right to get started</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blocks Panel */}
                <div className="lg:col-span-1 flex flex-col">
                  <div className="flex-1 space-y-6">
                    {/* Content Blocks */}
                    <Card className="flex-1 flex flex-col">
                      <CardHeader className="pb-4">
                        <CardTitle className="font-medium">Content Blocks</CardTitle>
                        <p className="text-xs text-gray-500">Drag and drop to build your email</p>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        {[
                          { id: 'text' as const, icon: Type, label: 'Text', desc: 'Add paragraphs and content' },
                          { id: 'heading' as const, icon: AlignLeft, label: 'Heading', desc: 'Section titles' },
                          { id: 'quote' as const, icon: Quote, label: 'Quote', desc: 'Highlight important text' },
                          { id: 'divider' as const, icon: Minus, label: 'Divider', desc: 'Separate content sections' }
                        ].map(block => (
                          <button
                            key={block.id}
                            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                            onClick={() => addBlock(block.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <block.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">{block.label}</div>
                                <div className="text-xs text-gray-500">{block.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Entity Variables */}
                    <Card className="flex-1 flex flex-col">
                      <CardHeader className="pb-4">
                        <CardTitle className="font-medium">Entity Variables</CardTitle>
                        <p className="text-xs text-gray-500">Click to insert into content</p>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4 overflow-y-auto">
                        {[
                          { category: 'Contact', items: ['{{name}}', '{{email}}', '{{company}}', '{{phone}}'] },
                          { category: 'Products', items: ['{{product_names}}', '{{product_categories}}', '{{latest_product}}'] },
                          { category: 'OKR Metrics', items: ['{{metric_value}}', '{{metric_target}}', '{{metric_progress}}'] },
                          { category: 'Tasks', items: ['{{open_tasks}}', '{{completed_tasks}}', '{{due_tasks}}'] }
                        ].map(group => (
                          <div key={group.category} className="space-y-3">
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">{group.category}</div>
                            <div className="space-y-2">
                              {group.items.map(item => (
                                <button
                                  key={item}
                                  className="w-full text-left text-xs px-3 py-2 bg-gray-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors border border-gray-200 hover:border-blue-300"
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