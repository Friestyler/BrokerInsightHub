import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Info, Target, Mail, Wand2, Save, Eye } from "lucide-react";
import { useLocation } from 'wouter';

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  title: string;
  description: string;
}

const StepIndicator = ({ isActive, isCompleted, stepNumber, title, description }: StepProps) => (
  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 transition-all duration-200">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
      isCompleted 
        ? 'bg-green-100 text-green-700 border-green-200' 
        : isActive 
          ? 'bg-blue-100 text-blue-700 border-blue-200' 
          : 'bg-muted text-muted-foreground'
    }`}>
      {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
        {title}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {description}
      </div>
    </div>
  </div>
);

export default function TemplateCreator() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    objective: '',
    emails: [{ subject: '', content: '' }]
  });

  const steps = [
    {
      number: 1,
      title: 'Template Info',
      description: 'Name, description and campaign objective',
      component: 'info'
    },
    {
      number: 2,
      title: 'Email Editor',
      description: 'Create email sequence with drag-and-drop blocks',
      component: 'editor'
    },
    {
      number: 3,
      title: 'AI Enhancement',
      description: 'Generate content and optimize with AI',
      component: 'ai'
    },
    {
      number: 4,
      title: 'Review & Save',
      description: 'Preview template and save as draft or publish',
      component: 'save'
    }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBack = () => {
    setLocation('/campaigns');
  };

  const isStepCompleted = (stepNum: number): boolean => {
    if (stepNum === 1) return Boolean(templateData.name && templateData.description && templateData.objective);
    if (stepNum === 2) return Boolean(templateData.emails[0].subject && templateData.emails[0].content);
    return stepNum < currentStep;
  };

  const canProceed = (): boolean => {
    return Boolean(isStepCompleted(currentStep));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  placeholder="e.g., Cross-sell Car + Legal Insurance"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description of this email template..."
                  value={templateData.description}
                  onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Objective</label>
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Textarea
                    placeholder="e.g., Increase legal insurance adoption by 25% among existing car insurance customers"
                    value={templateData.objective}
                    onChange={(e) => setTemplateData({ ...templateData, objective: e.target.value })}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Email Sequence Builder</h3>
              <Badge variant="secondary" className="gap-1">
                <Mail className="h-3 w-3" />
                {templateData.emails.length} email{templateData.emails.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <Card className="border-dashed border-2">
              <CardHeader className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Drag & Drop Email Builder</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Visual email editor with blocks for text, images, buttons, and dynamic placeholders
                </p>
              </CardHeader>
            </Card>
            
            {/* Temporary simple editor */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Subject</label>
                <Input
                  placeholder="Enter email subject line..."
                  value={templateData.emails[0].subject}
                  onChange={(e) => {
                    const newEmails = [...templateData.emails];
                    newEmails[0].subject = e.target.value;
                    setTemplateData({ ...templateData, emails: newEmails });
                  }}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Content</label>
                <Textarea
                  placeholder="Enter email content with placeholders like {{first_name}}, {{product_name}}..."
                  value={templateData.emails[0].content}
                  onChange={(e) => {
                    const newEmails = [...templateData.emails];
                    newEmails[0].content = e.target.value;
                    setTemplateData({ ...templateData, emails: newEmails });
                  }}
                  className="min-h-[200px] resize-none font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Use placeholders like {'{{first_name}}'}, {'{{company_name}}'}, {'{{product_name}}'} for dynamic content
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium">AI Enhancement</h3>
            </div>
            
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wand2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">AI Content Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered content generation and optimization coming soon
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Generate compelling subject lines</p>
                    <p>• Optimize email content for engagement</p>
                    <p>• Suggest personalization improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review & Save Template</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{templateData.name}</span>
                  <Badge variant="secondary">Draft</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{templateData.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Objective</div>
                  <p className="text-sm text-muted-foreground">{templateData.objective}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email Preview</div>
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="text-sm font-medium mb-2">Subject: {templateData.emails[0].subject}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {templateData.emails[0].content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                Publish Template
              </Button>
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create Email Template</h1>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Sidebar */}
          <div className="space-y-2">
            {steps.map((step) => (
              <StepIndicator
                key={step.number}
                stepNumber={step.number}
                title={step.title}
                description={step.description}
                isActive={currentStep === step.number}
                isCompleted={isStepCompleted(step.number)}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
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
                onClick={handleNext}
                disabled={currentStep === totalSteps || !canProceed()}
                className="gap-2"
              >
                {currentStep === totalSteps ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}