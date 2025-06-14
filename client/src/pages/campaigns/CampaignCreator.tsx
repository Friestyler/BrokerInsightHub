import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Sparkles } from "lucide-react";
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

export default function CampaignCreator() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    entity: '',
    name: '',
    description: '',
    objective: '',
    emails: [{ subject: '', content: '' }]
  });

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
    if (stepNum === 2) return Boolean(campaignData.name && campaignData.description && campaignData.objective);
    if (stepNum === 3) return Boolean(campaignData.emails[0].subject && campaignData.emails[0].content);
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
            
            <Card className="border-dashed border-2">
              <CardHeader className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Visual Email Builder</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag-and-drop editor coming soon. Use the simple editor below for now.
                </p>
              </CardHeader>
            </Card>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Subject Template</label>
                <Input
                  placeholder="Enter a compelling subject line with placeholders..."
                  value={campaignData.emails[0].subject}
                  onChange={(e) => {
                    const newEmails = [...campaignData.emails];
                    newEmails[0].subject = e.target.value;
                    setCampaignData({ ...campaignData, emails: newEmails });
                  }}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Content Template</label>
                <Textarea
                  placeholder="Write your email template content here..."
                  value={campaignData.emails[0].content}
                  onChange={(e) => {
                    const newEmails = [...campaignData.emails];
                    newEmails[0].content = e.target.value;
                    setCampaignData({ ...campaignData, emails: newEmails });
                  }}
                  className="min-h-[200px] resize-none"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Template Preview</h4>
                <div className="bg-white border rounded p-3 space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Subject: {campaignData.emails[0].subject || 'Your subject line will appear here...'}
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {campaignData.emails[0].content || 'Your email content will appear here...'}
                  </div>
                </div>
              </div>
              
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