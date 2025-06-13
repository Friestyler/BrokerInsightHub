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
  Plus
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
  emailBody: z.string().min(1, "Email content is required"),
  emailLogo: z.string().optional(),
  aiPrompt: z.string().optional(),
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
    enabled: currentStep === "select-list"
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
      emailLogo: "",
      aiPrompt: "",
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
      id: "compose",
      title: "Compose",
      description: "Create your email content",
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
              <Label htmlFor="template-name">Campaign Name</Label>
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
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is for..."
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <RadioGroup 
                value={form.watch("type")} 
                onValueChange={(value) => form.setValue("type", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cross_sell" id="cross_sell" />
                  <Label htmlFor="cross_sell">Cross-sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upsell" id="upsell" />
                  <Label htmlFor="upsell">Upsell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retention" id="retention" />
                  <Label htmlFor="retention">Retention</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acquisition" id="acquisition" />
                  <Label htmlFor="acquisition">New Customer Acquisition</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Property Insurance, Life Insurance"
                {...form.register("category")}
              />
            </div>
          </div>
        );

      case "compose":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                {...form.register("subject")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Email Content</Label>
              <Textarea
                id="email-body"
                placeholder="Enter your email content here..."
                className="min-h-[200px]"
                {...form.register("emailBody")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-prompt">AI Prompt (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="ai-prompt"
                  placeholder="Describe what you want the email to convey..."
                  {...form.register("aiPrompt")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateFromPrompt}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                AI can help generate email content based on your prompt.
              </p>
            </div>
          </div>
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
              <Label htmlFor="enable-followup">Enable follow-up emails</Label>
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
              <Label>Frequency</Label>
              <RadioGroup 
                value={form.watch("frequency")} 
                onValueChange={(value) => form.setValue("frequency", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one_time" id="one_time" />
                  <Label htmlFor="one_time">One-time campaign</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  placeholder="Your Name"
                  {...form.register("fromName")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
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
        <h1 className="text-2xl font-bold">Create Campaign Template</h1>
        <p className="text-gray-600">
          Create a reusable template that can be used for future campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Step navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
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
              <div className="flex items-center">
                {steps.find(step => step.id === currentStep)?.icon}
                <CardTitle className="ml-2">
                  {steps.find(step => step.id === currentStep)?.title}
                </CardTitle>
              </div>
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
                  className="bg-purple-600 hover:bg-purple-700"
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
                  className="bg-purple-600 hover:bg-purple-700"
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