import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, Users, Building2, Mail, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: number;
  name: string;
  description: string;
  entity_type: string;
  objective: string;
  emails: any[];
  status: 'draft' | 'published';
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface TemplateEditorParams {
  templateId: string;
}

export default function TemplateEditor() {
  const { templateId } = useParams<TemplateEditorParams>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine if we're in creation or editing mode
  const isCreating = !templateId || templateId === 'create';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    objective: '',
    entity_type: '',
    emails: [{ subject: '', content: '', delay_days: 0 }],
    status: 'draft' as 'draft' | 'published',
    category: '',
    tags: [] as string[]
  });

  // Fetch existing template data only when editing
  const { data: template, isLoading } = useQuery<EmailTemplate>({
    queryKey: ['/api/campaign-templates', templateId],
    queryFn: () => fetch(`/api/campaign-templates/${templateId}`).then(res => res.json()),
    enabled: !!templateId && !isCreating
  });

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setTemplateData({
        name: template.name,
        description: template.description,
        objective: template.objective,
        entity_type: template.entity_type,
        emails: template.emails.length > 0 ? template.emails : [{ subject: '', content: '', delay_days: 0 }],
        status: template.status,
        category: template.category,
        tags: template.tags
      });
      setSelectedEntityType(template.entity_type);
    }
  }, [template]);

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/campaign-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
      toast({ title: "Template created successfully" });
      setLocation('/campaigns');
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: any) => 
      fetch(`/api/campaign-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
      toast({ title: "Template updated successfully" });
      setLocation('/campaigns');
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    }
  });

  const handleBack = () => {
    setLocation('/campaigns');
  };

  const handleEntitySelect = (entityType: string) => {
    setSelectedEntityType(entityType);
    setTemplateData(prev => ({ ...prev, entity_type: entityType }));
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddEmail = () => {
    const newEmails = [...templateData.emails, { 
      subject: '', 
      content: '', 
      delay_days: templateData.emails.length === 0 ? 0 : 3 
    }];
    setTemplateData(prev => ({ ...prev, emails: newEmails }));
  };

  const handleRemoveEmail = (index: number) => {
    if (templateData.emails.length > 1) {
      const newEmails = templateData.emails.filter((_, i) => i !== index);
      setTemplateData(prev => ({ ...prev, emails: newEmails }));
    }
  };

  const handleSave = (status: 'draft' | 'published') => {
    const dataToSave = {
      ...templateData,
      status,
      category: templateData.category || 'campaign'
    };
    
    if (isCreating) {
      createTemplateMutation.mutate(dataToSave);
    } else {
      updateTemplateMutation.mutate(dataToSave);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading template...</div>
      </div>
    );
  }

  const entityTypes = [
    {
      value: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      description: 'Sales Campaign',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      value: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Customer Campaign',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      value: 'partners',
      label: 'Partners',
      icon: Building2,
      description: 'Partner Updates',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200'
    },
    {
      value: 'internal',
      label: 'Internal Team',
      icon: Mail,
      description: 'Internal Updates',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Choose Target Group</h2>
              <p className="text-gray-600">Select the type of audience you want to create a template for</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
              {entityTypes.map((entity) => {
                const IconComponent = entity.icon;
                const isSelected = selectedEntityType === entity.value;
                
                return (
                  <Card
                    key={entity.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? `${entity.border} border-2 ${entity.bg}` 
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEntitySelect(entity.value)}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <div className={`w-16 h-16 mx-auto rounded-full ${entity.bg} flex items-center justify-center`}>
                        <IconComponent className={`h-8 w-8 ${entity.color}`} />
                      </div>
                      <h3 className="font-medium text-lg">{entity.label}</h3>
                      <p className="text-sm text-gray-600">{entity.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Template Details</h2>
              <p className="text-gray-600">Configure template settings</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={templateData.description}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this template"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Objective</label>
                <Textarea
                  value={templateData.objective}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="What is the main goal of this campaign?"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Email Builder</h2>
              <p className="text-gray-600">Create email content</p>
            </div>
            
            <div className="space-y-6">
              {templateData.emails.map((email, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Email {index + 1}</h3>
                      {templateData.emails.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject Line</label>
                      <Input
                        value={email.subject}
                        onChange={(e) => {
                          const newEmails = [...templateData.emails];
                          newEmails[index].subject = e.target.value;
                          setTemplateData(prev => ({ ...prev, emails: newEmails }));
                        }}
                        placeholder="Enter subject line"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Content</label>
                      <Textarea
                        value={email.content}
                        onChange={(e) => {
                          const newEmails = [...templateData.emails];
                          newEmails[index].content = e.target.value;
                          setTemplateData(prev => ({ ...prev, emails: newEmails }));
                        }}
                        placeholder="Enter email content"
                        rows={8}
                      />
                    </div>
                    
                    {index > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Delay (days)</label>
                        <Input
                          type="number"
                          value={email.delay_days}
                          onChange={(e) => {
                            const newEmails = [...templateData.emails];
                            newEmails[index].delay_days = parseInt(e.target.value) || 0;
                            setTemplateData(prev => ({ ...prev, emails: newEmails }));
                          }}
                          placeholder="Days after previous email"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              <Button
                variant="outline"
                onClick={handleAddEmail}
                className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 py-8"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another Email
              </Button>
              
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSave('draft')}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSave('published')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Publish Template
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Choose Target Group', description: 'Select your target audience' },
    { number: 2, title: 'Template Details', description: 'Configure template settings' },
    { number: 3, title: 'Email Builder', description: 'Create email content' }
  ];

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {isCreating ? 'Create Template' : 'Edit Template'} - Step {currentStep} of 3
                </h1>
                <p className="text-sm text-gray-600">{Math.round(progress)}% Complete</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'mr-8' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px w-16 mx-4 ${
                  currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          {currentStep < 3 && (
            <Button
              onClick={handleContinue}
              disabled={currentStep === 1 && !selectedEntityType}
            >
              Continue to Template Details →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}