import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ListChecks, 
  FormInput, 
  MessageSquare, 
  Settings, 
  Clock, 
  Calendar,
  Save, 
  Upload,
  Plus,
  Users,
  Link,
  Trash2
} from "lucide-react";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form validation schemas for template creation (no recipients needed)
const selectListSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Campaign type is required"),
  category: z.string().optional(),
  listIds: z.array(z.string()).optional(),
});

const composeEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  heading: z.string().optional(),
  emailBody: z.string().min(1, "Email content is required"),
  emailLogo: z.string().optional(),
  aiPrompt: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  buttonColor: z.string().optional(),
});

const followUpSchema = z.object({
  enableFollowUp: z.boolean().default(false),
  followUpEmails: z.array(z.object({
    subject: z.string().min(1, "Follow-up subject is required"),
    emailBody: z.string().min(1, "Follow-up content is required"),
    delay: z.number().min(1, "Delay must be at least 1 day"),
  })).optional(),
});

const templateSettingsSchema = z.object({
  frequency: z.string().default("one_time"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Valid email is required"),
});

// Combined template schema
const templateFormSchema = selectListSchema
  .merge(composeEmailSchema)
  .merge(followUpSchema)
  .merge(templateSettingsSchema);

type TemplateFormValues = z.infer<typeof templateFormSchema>;

// Step interface
interface BuilderStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CampaignTemplateBuilderProps {}

export default function CampaignTemplateBuilder({}: CampaignTemplateBuilderProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState("select-list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get template ID from URL if editing existing template
  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("template");

  const { data: entities } = useQuery({
    queryKey: ['/api/entities'],
    enabled: currentStep === "select-list"
  });

  const { data: allSavedLists } = useQuery({
    queryKey: ['/api/saved-lists'],
    enabled: currentStep === "select-list" || currentStep === "target-list"
  });

  // Form definition
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "cross_sell",
      listIds: [],
      emailBody: "",
      subject: "",
      heading: "",
      emailLogo: "",
      aiPrompt: "",
      buttonText: "Click Here",
      buttonLink: "",
      buttonColor: "#3CA2E0",
      enableFollowUp: false,
      followUpEmails: [],
      frequency: "one_time",
      fromName: "",
      fromEmail: "",
    },
  });

  // Template steps (no recipients step)
  const steps: BuilderStep[] = [
    {
      id: "select-list",
      title: "Campaign Details",
      description: "Define campaign name and targeting criteria",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      id: "target-list",
      title: "Target List",
      description: "Select saved lists or entities to target",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "compose",
      title: "Build the email content for this campaign",
      description: "Fill in each section below to define the email content. They'll be able to personalize it before sending.",
      icon: <FormInput className="h-5 w-5" />,
    },
    {
      id: "follow-up",
      title: "Follow-Up Messages",
      description: "Configure optional follow-up emails",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure template options",
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  // Navigate between steps
  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].id);
    }
  };

  // AI prompt handler
  const handleGenerateFromPrompt = () => {
    const prompt = form.getValues("aiPrompt");
    if (!prompt) {
      toast({
        title: "Missing prompt",
        description: "Please enter a prompt for the AI to generate content",
        variant: "destructive"
      });
      return;
    }

    // Simulate AI generation
    setTimeout(() => {
      const generatedText = `Dear valued customer,\n\nBased on your current insurance portfolio, I wanted to reach out about an opportunity that might interest you.\n\n${prompt}\n\nI'd be happy to discuss this in more detail at your convenience.\n\nBest regards,\n[Your Name]`;
      form.setValue("emailBody", generatedText);
      toast({
        title: "Email content generated",
        description: "AI has created content based on your prompt",
      });
    }, 1000);
  };

  // Template creation mutation
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: any) => {
      return apiRequest('POST', '/api/campaign-templates', templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
      toast({
        title: "Template saved",
        description: "Your campaign template has been saved successfully",
      });
      setIsSubmitting(false);
      setLocation('/campaigns');
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast({
        title: "Template save failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  // Template loading query for editing
  const templateQuery = useQuery({
    queryKey: ['/api/campaign-templates', templateId],
    queryFn: () => {
      if (!templateId || isNaN(parseInt(templateId))) return null;
      return apiRequest('GET', `/api/campaign-templates/${templateId}`);
    },
    enabled: !!templateId && !isNaN(parseInt(templateId))
  });

  // Load template data if editing
  useEffect(() => {
    if (templateQuery.data) {
      const template = templateQuery.data;
      
      form.setValue("name", template.name);
      form.setValue("description", template.description || "");
      form.setValue("type", template.type || "cross_sell");
      form.setValue("category", template.category || "");
      form.setValue("emailBody", template.emailBody || "");
      form.setValue("subject", template.subject || "");
      form.setValue("frequency", template.frequency || "one_time");
      form.setValue("fromName", template.fromName || "");
      form.setValue("fromEmail", template.fromEmail || "");
      form.setValue("enableFollowUp", template.enableFollowUp || false);
      form.setValue("followUpEmails", template.followUpEmails || []);
    }
  }, [templateQuery.data, form]);

  // Form submission
  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true);
    
    const templateData = {
      name: data.name,
      description: data.description || "",
      type: data.type,
      category: data.category || "",
      emailBody: data.emailBody,
      emailLogo: data.emailLogo || "",
      subject: data.subject,
      frequency: data.frequency,
      fromName: data.fromName,
      fromEmail: data.fromEmail,
      followUpEmails: data.enableFollowUp ? data.followUpEmails : [],
      enableFollowUp: data.enableFollowUp,
    };
    
    createTemplateMutation.mutate(templateData);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "select-list":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name" className="text-[#282A3F]">Campaign Name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Health Coverage for Self-Employed - June"
                {...form.register("name")}
              />
              <p className="text-xs text-gray-500">
                This template name will help you find and reuse this template later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description" className="text-[#282A3F]">Description (Optional)</Label>
              <Textarea
                id="template-description"
                placeholder="Add a short note about the campaign's purpose, timing, or target audience. This helps your team stay aligned on context and intent."
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#282A3F]">Campaign Type</Label>
              <RadioGroup 
                value={form.watch("type")} 
                onValueChange={(value) => form.setValue("type", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cross_sell" id="cross_sell" />
                  <Label htmlFor="cross_sell" className="text-[#282A3F]">Cross-sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upsell" id="upsell" />
                  <Label htmlFor="upsell" className="text-[#282A3F]">Upsell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retention" id="retention" />
                  <Label htmlFor="retention" className="text-[#282A3F]">Retention</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acquisition" id="acquisition" />
                  <Label htmlFor="acquisition" className="text-[#282A3F]">New Customer Acquisition</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#282A3F]">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Property Insurance, Life Insurance"
                {...form.register("category")}
              />
            </div>
          </div>
        );

      case "target-list":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#282A3F]">Target Lists</Label>
              <p className="text-sm text-gray-600">
                Select saved lists to target with this campaign template. When using this template, 
                these lists will be pre-selected but can be modified.
              </p>
              
              {allSavedLists && Array.isArray(allSavedLists) && allSavedLists.length > 0 ? (
                <div className="space-y-3">
                  {['partners', 'customers', 'opportunities'].map(entityType => {
                    const listsForType = allSavedLists.filter((list: any) => 
                      list.entity_type === entityType || 
                      (entityType === 'partners' && !list.entity_type)
                    );
                    
                    if (listsForType.length === 0) return null;
                    
                    return (
                      <div key={entityType} className="space-y-2">
                        <Label className="text-[#282A3F] capitalize">{entityType} Lists</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {listsForType.map((list: any) => (
                            <div key={list.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`list-${list.id}`}
                                checked={form.watch("listIds")?.includes(list.id.toString()) || false}
                                onCheckedChange={(checked) => {
                                  const currentIds = form.getValues("listIds") || [];
                                  const listId = list.id.toString();
                                  if (checked) {
                                    form.setValue("listIds", [...currentIds, listId]);
                                  } else {
                                    form.setValue("listIds", currentIds.filter(id => id !== listId));
                                  }
                                }}
                              />
                              <Label htmlFor={`list-${list.id}`} className="text-[#282A3F] cursor-pointer">
                                {list.name}
                                {list.description && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    - {list.description}
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved lists available.</p>
                  <p className="text-sm">Create saved lists from the main dashboard to use them in templates.</p>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Label className="text-[#282A3F] font-medium">Template Targeting</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Selected lists will be pre-configured in this template. Users can still modify 
                  the target lists when creating campaigns from this template.
                </p>
              </div>
            </div>
          </div>
        );

      case "compose":
        return (
          <TooltipProvider>
            <div className="space-y-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex space-x-2 items-center">
                <Checkbox
                  id="use-ai"
                  checked={showAiPrompt}
                  onCheckedChange={(checked) => setShowAiPrompt(!!checked)}
                />
                <Label htmlFor="use-ai" className="text-sm font-normal text-[#282A3F]">Use AI to help write content</Label>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                className="flex items-center text-xs"
              >
                <Upload className="h-3 w-3 mr-1" /> Add Logo
              </Button>
            </div>
            
            {showAiPrompt && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-md border">
                <Label htmlFor="ai-prompt" className="text-[#282A3F]">AI Prompt</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ai-prompt"
                    placeholder="Describe what you want the email to say..."
                    {...form.register("aiPrompt")}
                  />
                  <Button 
                    type="button" 
                    onClick={handleGenerateFromPrompt}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Example: "Write an email promoting car insurance to customers who already have home insurance"
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="subject" className="text-[#282A3F] cursor-help">Email Subject</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is the email subject clients will see in their inbox.</p>
                </TooltipContent>
              </Tooltip>
              <Input
                id="subject"
                placeholder='e.g. "Health Coverage for the Self-Employed – Now Available"'
                {...form.register("subject")}
              />
            </div>

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="heading" className="text-[#282A3F] cursor-help">Heading</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>A strong, clear headline helps draw attention.</p>
                </TooltipContent>
              </Tooltip>
              <Input
                id="heading"
                placeholder='e.g. "Protect Your Business with Flexible Health Insurance"'
                {...form.register("heading")}
              />
            </div>

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="email-body" className="text-[#282A3F] cursor-help">Email Content</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keep it clear and benefit-driven. Use {"{{customer_name}}"} or other placeholders if needed.</p>
                </TooltipContent>
              </Tooltip>
              <Textarea
                id="email-body"
                placeholder="Write your email content here..."
                className="min-h-[200px]"
                {...form.register("emailBody")}
              />
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <Label className="text-[#282A3F]">Call-to-Action Button</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="button-link" className="text-[#282A3F]">Link</Label>
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-gray-400" />
                    <Input
                      id="button-link"
                      placeholder="https://example.com"
                      {...form.register("buttonLink")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button-text" className="text-[#282A3F]">Button text</Label>
                    <Input
                      id="button-text"
                      placeholder="Click Here"
                      {...form.register("buttonText")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="button-color" className="text-[#282A3F]">Button color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded border border-gray-300"></div>
                      <Input
                        id="button-color"
                        placeholder="#3CA2E0"
                        defaultValue="#3CA2E0"
                        {...form.register("buttonColor")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </TooltipProvider>
        );

      case "follow-up":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-followup"
                checked={form.watch("enableFollowUp")}
                onCheckedChange={(checked) => form.setValue("enableFollowUp", !!checked)}
              />
              <Label htmlFor="enable-followup" className="text-[#282A3F]">Enable follow-up emails</Label>
            </div>

            {form.watch("enableFollowUp") && (
              <div className="space-y-4 p-4 border rounded-lg">
                <p className="text-sm text-gray-600">
                  Follow-up emails will be sent automatically after the initial campaign.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentFollowUps = form.getValues("followUpEmails") || [];
                    form.setValue("followUpEmails", [
                      ...currentFollowUps,
                      { subject: "", emailBody: "", delay: 7 }
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Follow-up Email
                </Button>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#282A3F]">Frequency</Label>
              <RadioGroup 
                value={form.watch("frequency")} 
                onValueChange={(value) => form.setValue("frequency", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one_time" id="one_time" />
                  <Label htmlFor="one_time" className="text-[#282A3F]">One-time campaign</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="text-[#282A3F]">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="text-[#282A3F]">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly" className="text-[#282A3F]">Quarterly</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-name" className="text-[#282A3F]">From Name</Label>
                <Input
                  id="from-name"
                  placeholder="Your Name"
                  {...form.register("fromName")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from-email" className="text-[#282A3F]">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="your.email@company.com"
                  {...form.register("fromEmail")}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/campaigns')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-[#282A3F]">Create Campaign Template</h1>
        <p className="text-gray-600">Create a reusable template that can be used for future campaigns by your team or it can be shared with brokers.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Step navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#282A3F]">Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <nav>
                <ul className="space-y-2">
                  {steps.map((step, index) => {
                    const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                    const isCurrent = step.id === currentStep;
                    
                    return (
                      <li key={step.id}>
                        <button
                          onClick={() => goToStep(step.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                            isCurrent
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : isCompleted
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isCurrent ? "text-purple-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                            {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                          </span>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{step.title}</div>
                            <div className="text-xs hidden md:block">{step.description}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Step content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#282A3F]">
                {steps.find(step => step.id === currentStep)?.title}
              </CardTitle>
              <CardDescription>
                {steps.find(step => step.id === currentStep)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {renderStepContent()}
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button"
                variant="outline" 
                onClick={goToPreviousStep}
                disabled={currentStep === steps[0].id}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              
              {currentStep === steps[steps.length - 1].id ? (
                <Button
                  type="button"
                  onClick={() => {
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Template"} <Save className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={goToNextStep}
                >
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}